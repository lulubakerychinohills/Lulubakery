import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

function toStr(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toAbsoluteUrl(rawUrl: string, request: Request) {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = {
      name: toStr(body.name),
      email: toStr(body.email),
      phone: toStr(body.phone),
      pickupDate: toStr(body.pickupDate),
      pickupTime: toStr(body.pickupTime),
      referenceImageUrl: toAbsoluteUrl(toStr(body.referenceImageUrl), request),
      productCategory: toStr(body.productCategory),
      productName: toStr(body.productName),
      productImageUrl: toAbsoluteUrl(toStr(body.productImageUrl), request),
      size: toStr(body.size),
      filling: toStr(body.filling),
      notes: toStr(body.notes),
    };

    if (!payload.name || !payload.productCategory || !payload.productName) {
      return NextResponse.json({ message: "姓名、分类和蛋糕款式为必填项。" }, { status: 400 });
    }

    if (!payload.email) {
      return NextResponse.json({ message: "请提供邮箱。" }, { status: 400 });
    }

    if (!payload.filling) {
      return NextResponse.json({ message: "请提供夹馅口味。" }, { status: 400 });
    }

    if (!payload.pickupDate || !payload.pickupTime) {
      return NextResponse.json({ message: "请提供取货日期和时间。" }, { status: 400 });
    }

    await sendOrderEmail(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "提交失败，请稍后重试。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
