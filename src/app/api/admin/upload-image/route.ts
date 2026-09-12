import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  isSupportedImageFile,
  MAX_IMAGE_UPLOAD_BYTES,
  resolveImageExtension,
} from "@/lib/upload-image";
import { maxUploadEdgeForProductCategory, prepareImageForUpload } from "@/lib/prepare-image-upload";

const PRODUCT_CATEGORIES = ["men", "women", "kids", "sweet", "other"] as const;

function parseProductCategory(raw: unknown): (typeof PRODUCT_CATEGORIES)[number] {
  if (typeof raw === "string" && (PRODUCT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as (typeof PRODUCT_CATEGORIES)[number];
  }
  return "men";
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json({ message: "未登录或会话失效。" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "未选择图片文件。" }, { status: 400 });
    }

    if (!isSupportedImageFile(file.type, file.name)) {
      return NextResponse.json({ message: "只支持图片文件。" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ message: "图片须小于或等于 10MB。" }, { status: 400 });
    }

    const ext = resolveImageExtension(file.name, file.type);
    if (!ext) {
      return NextResponse.json({ message: "仅支持 jpg / png / webp / gif / heic / heif。" }, { status: 400 });
    }

    const category = parseProductCategory(formData.get("category"));
    const maxEdgePx = maxUploadEdgeForProductCategory(category);
    const prepared = await prepareImageForUpload(file, ext, { maxEdgePx });
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${prepared.ext}`;
    const storagePath = `products/${fileName}`;
    const supabase = getSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, prepared.buffer, {
        contentType: prepared.contentType,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const url = data.publicUrl;
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片上传失败。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
