import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";
import {
  getOrderCurrency,
  parseOrderBody,
  validateOrderPayload,
} from "@/lib/order-payload";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ message: "PayPal is not configured." }, { status: 503 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const paypalOrderId = typeof body.paypalOrderId === "string" ? body.paypalOrderId.trim() : "";
    if (!paypalOrderId) {
      return NextResponse.json({ message: "Missing PayPal order id." }, { status: 400 });
    }

    const payload = parseOrderBody(body, request);
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const capture = await capturePayPalOrder(paypalOrderId);
    const amount = capture.amount || payload.depositAmount;
    const currency = capture.currency || getOrderCurrency();

    let emailSent = true;
    let emailError = "";
    try {
      await sendOrderEmail({
        ...payload,
        paymentProvider: "paypal",
        paypalOrderId,
        paypalCaptureId: capture.captureId,
        amount,
        currency,
      });
    } catch (error) {
      emailSent = false;
      emailError = error instanceof Error ? error.message : "Order email failed to send.";
      console.error("[paypal/capture-order] email failed:", emailError);
    }

    return NextResponse.json({
      ok: true,
      captureId: capture.captureId,
      amount,
      currency,
      emailSent,
      emailError: emailSent ? undefined : emailError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment confirmation failed.";
    console.error("[paypal/capture-order]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
