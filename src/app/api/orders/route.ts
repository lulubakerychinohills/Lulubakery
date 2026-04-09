import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

function toStr(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toBool(value: unknown) {
  return value === true;
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
      acceptedPolicy: toBool(body.acceptedPolicy),
    };

    if (!payload.name) {
      return NextResponse.json({ message: "请填写姓名。" }, { status: 400 });
    }

    const hasProductSelection = Boolean(payload.productCategory && payload.productName);
    const hasReferenceImage = Boolean(payload.referenceImageUrl);

    if (!hasProductSelection && !hasReferenceImage) {
      return NextResponse.json({ message: "请先选择蛋糕，或上传参考图片。" }, { status: 400 });
    }

    if ((payload.productCategory && !payload.productName) || (!payload.productCategory && payload.productName)) {
      return NextResponse.json({ message: "蛋糕分类和款式需要同时填写。" }, { status: 400 });
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

    if (!payload.acceptedPolicy) {
      return NextResponse.json({ message: "请先同意隐私政策。" }, { status: 400 });
    }

    await sendOrderEmail(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "提交失败，请稍后重试。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
