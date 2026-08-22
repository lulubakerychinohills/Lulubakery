import { NextResponse } from "next/server";
import {
  getOrderCurrency,
  parseOrderBody,
  validateDepositAmount,
  validateOrderPayload,
} from "@/lib/order-payload";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ message: "PayPal 尚未配置。" }, { status: 503 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseOrderBody(body, request);
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const depositError = validateDepositAmount(payload.depositAmount);
    if (depositError) {
      return NextResponse.json({ message: depositError }, { status: 400 });
    }

    const amount = payload.depositAmount;
    const currency = getOrderCurrency();
    const description = payload.productId
      ? `Lulu Bakery deposit (${payload.productId.slice(0, 8)})`
      : "Lulu Bakery custom cake deposit";

    const orderId = await createPayPalOrder(amount, currency, description);
    return NextResponse.json({ ok: true, orderId, amount, currency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建支付失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
