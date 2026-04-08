import nodemailer from "nodemailer";

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  referenceImageUrl?: string;
  productCategory: string;
  productName: string;
  productImageUrl?: string;
  size: string;
  filling: string;
  notes: string;
};

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

export async function sendOrderEmail(order: OrderPayload) {
  const { host, port, user, pass, from, notificationEmail } = getEmailConfig();
  const categoryText = order.productCategory
    ? categoryMap[order.productCategory] || order.productCategory
    : "未选择（参考图定制）";
  const productNameText = order.productName || "未选择（参考图定制）";
  const subjectProduct = order.productName || "参考图定制";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const contact = [order.phone ? `手机号：${order.phone}` : "", order.email ? `邮箱：${order.email}` : ""]
    .filter(Boolean)
    .join("，");

  const text = `
你收到一个新的蛋糕订单：

姓名：${order.name}
取货日期：${order.pickupDate}
取货时间：${order.pickupTime}
分类：${categoryText}
蛋糕款式：${productNameText}
尺寸：${sizeMap[order.size] || order.size}
夹馅：${fillingMap[order.filling] || order.filling}
联系方式：${contact || "未提供"}
备注：${order.notes || "无"}
客户参考图：${order.referenceImageUrl || "未提供"}
蛋糕图片：${order.productImageUrl || "未提供"}
`.trim();

  const safeReferenceImageUrl =
    order.referenceImageUrl && /^https?:\/\//i.test(order.referenceImageUrl) ? order.referenceImageUrl : "";
  const safeImageUrl = order.productImageUrl && /^https?:\/\//i.test(order.productImageUrl) ? order.productImageUrl : "";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2 style="margin:0 0 12px;">你收到一个新的蛋糕订单</h2>
      <p><strong>姓名：</strong>${escapeHtml(order.name)}</p>
      <p><strong>取货日期：</strong>${escapeHtml(order.pickupDate)}</p>
      <p><strong>取货时间：</strong>${escapeHtml(order.pickupTime)}</p>
      <p><strong>分类：</strong>${escapeHtml(categoryText)}</p>
      <p><strong>蛋糕款式：</strong>${escapeHtml(productNameText)}</p>
      <p><strong>尺寸：</strong>${escapeHtml(sizeMap[order.size] || order.size)}</p>
      <p><strong>夹馅：</strong>${escapeHtml(fillingMap[order.filling] || order.filling)}</p>
      <p><strong>联系方式：</strong>${escapeHtml(contact || "未提供")}</p>
      <p><strong>备注：</strong>${escapeHtml(order.notes || "无")}</p>
      ${
        safeReferenceImageUrl
          ? `<div style="margin-top:16px;">
               <p style="margin:0 0 8px;"><strong>客户参考图：</strong></p>
               <img src="${escapeHtml(safeReferenceImageUrl)}" alt="Customer reference image" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
               <p style="font-size:12px;color:#666;margin-top:8px;">如果图片无法显示，可复制链接打开：${escapeHtml(safeReferenceImageUrl)}</p>
             </div>`
          : ""
      }
      ${
        safeImageUrl
          ? `<div style="margin-top:16px;">
               <p style="margin:0 0 8px;"><strong>蛋糕图片：</strong></p>
               <img src="${escapeHtml(safeImageUrl)}" alt="Cake image" style="max-width:360px;width:100%;border-radius:8px;border:1px solid #eee;object-fit:cover;" />
               <p style="font-size:12px;color:#666;margin-top:8px;">如果图片无法显示，可复制链接打开：${escapeHtml(safeImageUrl)}</p>
             </div>`
          : ""
      }
    </div>
  `.trim();

  await transporter.sendMail({
    from,
    to: notificationEmail,
    subject: `新订单 - ${order.name} (${subjectProduct})`,
    text,
    html,
  });
}
