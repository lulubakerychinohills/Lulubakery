import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import type { OrderPayload, PaidOrderPayload } from "@/lib/order-payload";
import { getSupabaseClient } from "@/lib/supabase";
import { normalizeSupabaseStoragePublicUrl } from "@/lib/supabase-storage-url";

type MailOrder = OrderPayload | PaidOrderPayload;

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  if (!host || !user || !pass || !from || !notificationEmail) {
    throw new Error("Missing email configuration. Set SMTP and ORDER_NOTIFICATION_EMAIL.");
  }

  return { host, port, user, pass, from, notificationEmail };
}

const categoryMap: Record<string, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  sweet: "Desserts",
  other: "Other",
};

const sizeMap: Record<string, string> = {
  "4": '4"',
  "6": '6"',
  "8": '8"',
  "10": '10"',
  double: "Double layer (6+8)",
};

const fillingMap: Record<string, string> = {
  strawberry: "Strawberry",
  mango: "Mango",
  durian: "Durian",
  oreo: "Oreo cream",
  other: "Other",
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isPaidOrder(order: MailOrder): order is PaidOrderPayload {
  return "paymentProvider" in order && order.paymentProvider === "paypal";
}

/** Format `type="time"` values (e.g. 14:30) as 2:30 PM */
function formatPickupTimeAmPm(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/\b(am|pm)\b/i.test(trimmed) && !/^\d{1,2}:\d{2}/.test(trimmed)) {
    return trimmed;
  }

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (amPmMatch) {
    let hour = Number.parseInt(amPmMatch[1], 10);
    const minute = amPmMatch[2];
    const isPm = amPmMatch[4].toLowerCase() === "pm";
    if (!Number.isFinite(hour) || hour < 1 || hour > 12) {
      return trimmed;
    }
    return `${hour}:${minute} ${isPm ? "PM" : "AM"}`;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return trimmed;
  }

  let hour = Number.parseInt(match[1], 10);
  const minute = match[2];
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    return trimmed;
  }

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function isHttpUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

async function resolveProductImageUrl(order: MailOrder): Promise<string> {
  const fromPayload = normalizeSupabaseStoragePublicUrl(order.productImageUrl);
  if (fromPayload && isHttpUrl(fromPayload)) {
    return fromPayload;
  }
  if (!order.productId) {
    return "";
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", order.productId)
      .maybeSingle();
    if (error || !data?.image_url) {
      return "";
    }
    return normalizeSupabaseStoragePublicUrl(data.image_url);
  } catch {
    return "";
  }
}

async function fetchInlineImage(url: string, cid: string, filename: string): Promise<Attachment | null> {
  if (!url || !isHttpUrl(url)) {
    return null;
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(20_000),
      headers: { Accept: "image/*,*/*" },
    });
    if (!response.ok) {
      return null;
    }

    const contentTypeHeader = (response.headers.get("content-type") || "image/jpeg").split(";")[0]?.trim() || "image/jpeg";
    if (!contentTypeHeader.startsWith("image/")) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 8_000_000) {
      return null;
    }

    return {
      filename,
      cid,
      content: buffer,
      contentType: contentTypeHeader,
      contentDisposition: "inline",
    };
  } catch (error) {
    console.error("[sendOrderEmail] inline image fetch failed:", url, error);
    return null;
  }
}

function imageHtmlSection(label: string, cid: string | null, url: string) {
  if (cid) {
    return `<p><strong>${label}:</strong></p>
      <img src="cid:${cid}" alt="${escapeHtml(label)}" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
      ${url ? `<p style="font-size:12px;color:#666;"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ""}`;
  }
  if (url) {
    return `<p><strong>${label}:</strong></p>
      <img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
      <p style="font-size:12px;color:#666;"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`;
  }
  return `<p><strong>${label}:</strong> Not provided</p>`;
}

export async function sendOrderEmail(order: MailOrder) {
  const { host, port, user, pass, from, notificationEmail } = getEmailConfig();
  const categoryText = order.productCategory
    ? categoryMap[order.productCategory] || order.productCategory
    : "Not selected (custom reference)";
  const productIdText = order.productId ? order.productId.slice(0, 8) : "Not selected (custom reference)";
  const paid = isPaidOrder(order);
  const pickupTimeText = formatPickupTimeAmPm(order.pickupTime);
  const paymentText = paid
    ? `PayPal deposit paid: ${order.amount} ${order.currency}\nPayPal order ID: ${order.paypalOrderId}`
    : "Payment: not via PayPal (inquiry only)";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const contact = [order.phone ? `Phone: ${order.phone}` : "", order.email ? `Email: ${order.email}` : ""]
    .filter(Boolean)
    .join("\n");

  const referenceImageUrl = normalizeSupabaseStoragePublicUrl(order.referenceImageUrl);
  const productImageUrl = await resolveProductImageUrl(order);

  const [referenceAttachment, productAttachment] = await Promise.all([
    fetchInlineImage(referenceImageUrl, "order-reference-image", "customer-reference.jpg"),
    fetchInlineImage(productImageUrl, "order-product-image", "selected-cake.jpg"),
  ]);

  const attachments = [referenceAttachment, productAttachment].filter(Boolean) as Attachment[];

  const text = `
New order

Name: ${order.name}
Pickup date: ${order.pickupDate}
Pickup time: ${pickupTimeText}
${contact}

Category: ${categoryText}
Product ID: ${productIdText}
Size: ${sizeMap[order.size] || order.size}
Filling: ${fillingMap[order.filling] || order.filling}
${paymentText}
Notes: ${order.notes || "None"}
Customer reference image: ${referenceImageUrl || "Not provided"}
Cake image: ${productImageUrl || "Not provided"}
`.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2>New order</h2>
      <p><strong>Name:</strong> ${escapeHtml(order.name)}</p>
      <p><strong>Pickup date:</strong> ${escapeHtml(order.pickupDate)}</p>
      <p><strong>Pickup time:</strong> ${escapeHtml(pickupTimeText)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.phone || "Not provided")}</p>
      <p><strong>Category:</strong> ${escapeHtml(categoryText)}</p>
      <p><strong>Product ID:</strong> ${escapeHtml(productIdText)}</p>
      <p><strong>Size:</strong> ${escapeHtml(sizeMap[order.size] || order.size)}</p>
      <p><strong>Filling:</strong> ${escapeHtml(fillingMap[order.filling] || order.filling)}</p>
      ${
        paid
          ? `<p><strong>PayPal deposit:</strong> ${escapeHtml(`${order.amount} ${order.currency}`)}</p>
             <p><strong>PayPal order ID:</strong> ${escapeHtml(order.paypalOrderId)}</p>`
          : `<p><strong>Payment:</strong> Not via PayPal (inquiry only)</p>`
      }
      <p><strong>Notes:</strong> ${escapeHtml(order.notes || "None")}</p>
      ${imageHtmlSection("Customer reference image", referenceAttachment?.cid ? "order-reference-image" : null, referenceImageUrl)}
      ${imageHtmlSection("Cake image", productAttachment?.cid ? "order-product-image" : null, productImageUrl)}
    </div>
  `;

  await transporter.sendMail({
    from,
    to: notificationEmail,
    subject: "New order",
    text,
    html,
    attachments,
  });
}
