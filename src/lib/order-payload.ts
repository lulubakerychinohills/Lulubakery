import { normalizeSupabaseStoragePublicUrl } from "@/lib/supabase-storage-url";
import { ORDER_FIELD_MAX, isValidEmailFormat } from "@/lib/order-field-limits";

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
  if (!payload.name) return "Please provide your name.";
  if (payload.name.length > ORDER_FIELD_MAX.name) {
    return `Name must be ${ORDER_FIELD_MAX.name} characters or fewer.`;
  }

  const hasProductSelection = Boolean(payload.productId);
  const hasReferenceImage = Boolean(payload.referenceImageUrl);
  if (!hasProductSelection && !hasReferenceImage) {
    return "Please select a cake or upload a reference photo.";
  }
  if (payload.productId && !payload.productCategory) {
    return "Cake category is required.";
  }
  if (!payload.email) return "Please provide your email.";
  if (payload.email.length > ORDER_FIELD_MAX.email) {
    return `Email must be ${ORDER_FIELD_MAX.email} characters or fewer.`;
  }
  if (!isValidEmailFormat(payload.email)) {
    return "Please enter a valid email address.";
  }
  if (payload.phone.length > ORDER_FIELD_MAX.phone) {
    return `Phone must be ${ORDER_FIELD_MAX.phone} characters or fewer.`;
  }
  if (!payload.filling) return "Please provide a filling.";
  if (payload.size.length > ORDER_FIELD_MAX.customSize) {
    return `Size must be ${ORDER_FIELD_MAX.customSize} characters or fewer.`;
  }
  if (payload.filling.length > ORDER_FIELD_MAX.customFilling) {
    return `Filling must be ${ORDER_FIELD_MAX.customFilling} characters or fewer.`;
  }
  if (payload.notes.length > ORDER_FIELD_MAX.notes) {
    return `Notes must be ${ORDER_FIELD_MAX.notes} characters or fewer.`;
  }
  if (!payload.pickupDate || !payload.pickupTime) {
    return "Please provide pickup date and time.";
  }
  if (!payload.acceptedPolicy) return "Please agree to the Privacy Policy.";
  return null;
}

export function validateDepositAmount(depositAmount: string): string | null {
  if (!normalizeDepositAmount(depositAmount)) {
    return `Please enter a valid deposit (${MIN_DEPOSIT_USD}–${MAX_DEPOSIT_USD} USD).`;
  }
  return null;
}
