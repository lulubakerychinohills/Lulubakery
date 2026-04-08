import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getSafeExtension(fileName: string, fileType: string) {
  const extFromName = fileName.includes(".") ? `.${fileName.split(".").pop()?.toLowerCase()}` : "";
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

  if (allowed.has(extFromName)) {
    return extFromName;
  }

  if (fileType === "image/jpeg") return ".jpg";
  if (fileType === "image/png") return ".png";
  if (fileType === "image/webp") return ".webp";
  if (fileType === "image/gif") return ".gif";
  return "";
}

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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "只支持图片文件。" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "图片大小不能超过 5MB。" }, { status: 400 });
    }

    const ext = getSafeExtension(file.name, file.type);
    if (!ext) {
      return NextResponse.json({ message: "仅支持 jpg / png / webp / gif。" }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const storagePath = `products/${fileName}`;
    const supabase = getSupabaseAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
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
