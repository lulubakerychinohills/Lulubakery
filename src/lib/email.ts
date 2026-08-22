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
    throw new Error("缺少邮件配置，请先设置 SMTP 与接收邮箱环境变量。");
  }

  return { host, port, user, pass, from, notificationEmail };
}

const categoryMap: Record<string, string> = {
  men: "男士",
  women: "女士",
  kids: "儿童",
  sweet: "甜品",
  other: "其他",
};

const sizeMap: Record<string, string> = {
  "4": "4寸",
  "6": "6寸",
  "8": "8寸",
  "10": "10寸",
  double: "双层（6+8）",
};

const fillingMap: Record<string, string> = {
  strawberry: "草莓",
  mango: "芒果",
  durian: "榴莲",
  oreo: "奥利奥奶油",
  other: "其他",
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

/** 将 `type="time"` 的 24 小时值（如 14:30）格式化为 2:30 PM */
function formatPickupTimeAmPm(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/\b(am|pm)\b/i.test(trimmed)) {
    return trimmed;
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
    return `<p><strong>${label}：</strong></p>
      <img src="cid:${cid}" alt="${escapeHtml(label)}" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
      ${url ? `<p style="font-size:12px;color:#666;"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ""}`;
  }
  if (url) {
    return `<p><strong>${label}：</strong></p>
      <img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
      <p style="font-size:12px;color:#666;"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`;
  }
  return `<p><strong>${label}：</strong>未提供</p>`;
}

export async function sendOrderEmail(order: MailOrder) {
  const { host, port, user, pass, from, notificationEmail } = getEmailConfig();
  const categoryText = order.productCategory
    ? categoryMap[order.productCategory] || order.productCategory
    : "未选择（参考图定制）";
  const productIdText = order.productId ? `ID: ${order.productId.slice(0, 8)}` : "未选择（参考图定制）";
  const paid = isPaidOrder(order);
  const pickupTimeText = formatPickupTimeAmPm(order.pickupTime);
  const paymentText = paid
    ? `PayPal 已付订金：${order.amount} ${order.currency}\nPayPal Order：${order.paypalOrderId}`
    : "支付：未通过 PayPal（仅提交意向）";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const contact = [order.phone ? `手机号：${order.phone}` : "", order.email ? `邮箱：${order.email}` : ""]
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
新订单

姓名：${order.name}
取货日期：${order.pickupDate}
取货时间：${pickupTimeText}
${contact}

分类：${categoryText}
${productIdText}
尺寸：${sizeMap[order.size] || order.size}
夹馅：${fillingMap[order.filling] || order.filling}
${paymentText}
备注：${order.notes || "无"}
客户参考图：${referenceImageUrl || "未提供"}
蛋糕图片：${productImageUrl || "未提供"}
`.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2>新订单</h2>
      <p><strong>姓名：</strong>${escapeHtml(order.name)}</p>
      <p><strong>取货日期：</strong>${escapeHtml(order.pickupDate)}</p>
      <p><strong>取货时间：</strong>${escapeHtml(pickupTimeText)}</p>
      <p><strong>邮箱：</strong>${escapeHtml(order.email)}</p>
      <p><strong>手机号：</strong>${escapeHtml(order.phone || "未提供")}</p>
      <p><strong>分类：</strong>${escapeHtml(categoryText)}</p>
      <p><strong>产品：</strong>${escapeHtml(productIdText)}</p>
      <p><strong>尺寸：</strong>${escapeHtml(sizeMap[order.size] || order.size)}</p>
      <p><strong>夹馅：</strong>${escapeHtml(fillingMap[order.filling] || order.filling)}</p>
      ${
        paid
          ? `<p><strong>PayPal 订金：</strong>${escapeHtml(`${order.amount} ${order.currency}`)}</p>
             <p><strong>PayPal Order：</strong>${escapeHtml(order.paypalOrderId)}</p>`
          : `<p><strong>支付：</strong>未通过 PayPal</p>`
      }
      <p><strong>备注：</strong>${escapeHtml(order.notes || "无")}</p>
      ${imageHtmlSection("客户参考图", referenceAttachment?.cid ? "order-reference-image" : null, referenceImageUrl)}
      ${imageHtmlSection("蛋糕图片", productAttachment?.cid ? "order-product-image" : null, productImageUrl)}
    </div>
  `;

  await transporter.sendMail({
    from,
    to: notificationEmail,
    subject: "新订单",
    text,
    html,
    attachments,
  });
}
