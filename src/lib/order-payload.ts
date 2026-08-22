import { normalizeSupabaseStoragePublicUrl } from "@/lib/supabase-storage-url";

export type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  referenceImageUrl: string;
  productCategory: string;
  productId: string;
  productImageUrl: string;
  size: string;
  filling: string;
  notes: string;
  acceptedPolicy: boolean;
  /** 用户填写的订金（USD），PayPal 创建订单时使用 */
  depositAmount: string;
};

export type PaidOrderPayload = OrderPayload & {
  paymentProvider: "paypal";
  paypalOrderId: string;
  paypalCaptureId: string;
  amount: string;
  currency: string;
};

function toStr(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: unknown) {
  return value === true;
}

export function toAbsoluteUrl(rawUrl: string, request: Request) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (!rawUrl.startsWith("/")) return rawUrl;

  const forwardProto = request.headers.get("x-forwarded-proto");
  const forwardHost = request.headers.get("x-forwarded-host");
  const baseUrl = new URL(request.url);
  const protocol = forwardProto || baseUrl.protocol.replace(":", "");
  const host = forwardHost || baseUrl.host;
  return `${protocol}://${host}${rawUrl}`;
}

/** 环境变量建议订金，仅作表单默认值 */
export function getDefaultDepositAmount(): string {
  const raw = (process.env.NEXT_PUBLIC_ORDER_DEPOSIT_USD || "50.00").trim();
  const amount = Number.parseFloat(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "50.00";
  }
  return amount.toFixed(2);
}

/** @deprecated 使用 getDefaultDepositAmount；保留别名避免旧引用报错 */
export function getOrderDepositAmount(): string {
  return getDefaultDepositAmount();
}

export function getOrderCurrency(): string {
  return (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD").trim().toUpperCase() || "USD";
}

const MIN_DEPOSIT_USD = 1;
const MAX_DEPOSIT_USD = 50_000;

/** 解析并规范化订金；无效返回 null */
export function normalizeDepositAmount(raw: unknown): string | null {
  const text = typeof raw === "string" || typeof raw === "number" ? String(raw).trim() : "";
  if (!text) return null;
  const cleaned = text.replace(/[$,\s]/g, "");
  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_USD || amount > MAX_DEPOSIT_USD) {
    return null;
  }
  return amount.toFixed(2);
}

export function parseOrderBody(body: Record<string, unknown>, request: Request): OrderPayload {
  const deposit =
    normalizeDepositAmount(body.depositAmount) ||
    normalizeDepositAmount(body.amount) ||
    "";

  return {
    name: toStr(body.name),
    email: toStr(body.email),
    phone: toStr(body.phone),
    pickupDate: toStr(body.pickupDate),
    pickupTime: toStr(body.pickupTime),
    referenceImageUrl: normalizeSupabaseStoragePublicUrl(toAbsoluteUrl(toStr(body.referenceImageUrl), request)),
    productCategory: toStr(body.productCategory),
    productId: toStr(body.productId),
    productImageUrl: normalizeSupabaseStoragePublicUrl(toAbsoluteUrl(toStr(body.productImageUrl), request)),
    size: toStr(body.size),
    filling: toStr(body.filling),
    notes: toStr(body.notes),
    acceptedPolicy: toBool(body.acceptedPolicy),
    depositAmount: deposit,
  };
}

export function validateOrderPayload(payload: OrderPayload): string | null {
  if (!payload.name) return "请填写姓名。";

  const hasProductSelection = Boolean(payload.productId);
  const hasReferenceImage = Boolean(payload.referenceImageUrl);
  if (!hasProductSelection && !hasReferenceImage) {
    return "请先选择蛋糕，或上传参考图片。";
  }
  if (payload.productId && !payload.productCategory) {
    return "蛋糕分类不能为空。";
  }
  if (!payload.email) return "请提供邮箱。";
  if (!payload.filling) return "请提供夹馅口味。";
  if (!payload.pickupDate || !payload.pickupTime) return "请提供取货日期和时间。";
  if (!payload.acceptedPolicy) return "请先同意隐私政策。";
  return null;
}

export function validateDepositAmount(depositAmount: string): string | null {
  if (!normalizeDepositAmount(depositAmount)) {
    return `请填写有效订金金额（${MIN_DEPOSIT_USD}–${MAX_DEPOSIT_USD} USD）。`;
  }
  return null;
}
