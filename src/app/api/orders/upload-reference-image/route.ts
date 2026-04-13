import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { isSupportedImageFile, prepareImageForUpload, resolveImageExtension } from "@/lib/upload-image";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const ipRequestStore = new Map<string, number[]>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const existing = ipRequestStore.get(ip) || [];
  const recent = existing.filter((time) => time > windowStart);
  recent.push(now);
  ipRequestStore.set(ip, recent);

  if (recent.length > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Best-effort cleanup to avoid unbounded growth.
  if (ipRequestStore.size > 5000) {
    for (const [key, timestamps] of ipRequestStore.entries()) {
      const valid = timestamps.filter((time) => time > windowStart);
      if (valid.length === 0) {
        ipRequestStore.delete(key);
      } else {
        ipRequestStore.set(key, valid);
      }
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: "上传太频繁，请稍后再试。" }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "未选择图片文件。" }, { status: 400 });
    }
    if (!isSupportedImageFile(file.type, file.name)) {
      return NextResponse.json({ message: "只支持图片文件。" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "图片大小不能超过 5MB。" }, { status: 400 });
    }

    const ext = resolveImageExtension(file.name, file.type);
    if (!ext) {
      return NextResponse.json({ message: "仅支持 jpg / png / webp / gif / heic / heif。" }, { status: 400 });
    }

    const prepared = await prepareImageForUpload(file, ext);
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${prepared.ext}`;
    const storagePath = `order-references/${fileName}`;

    const supabase = getSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, prepared.buffer, {
      contentType: prepared.contentType,
      upsert: false,
      cacheControl: "3600",
    });
    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片上传失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
