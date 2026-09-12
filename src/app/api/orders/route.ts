import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";
import { parseOrderBody, validateOrderPayload } from "@/lib/order-payload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseOrderBody(body, request);
    const validationError = validateOrderPayload(payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    await sendOrderEmail(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed. Please try again.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
