import sharp from "sharp";

/** 上传到 Supabase 的作品图最长边上限，减小体积且不改变观感。价目海报等不在此链路。 */
const MAX_UPLOAD_EDGE_PX = 2048;

const WEBP_QUALITY = 82;

export type PreparedImageUpload = {
  buffer: Buffer;
  ext: string;
  contentType: string;
};

function mimeForExtension(ext: string, fileType: string): string {
  if (fileType.startsWith("image/")) return fileType;
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".heic") return "image/heic";
  if (ext === ".heif") return "image/heif";
  return "application/octet-stream";
}

/** 服务端专用：GIF 保留动图；已是 WebP 则原样；其余尽量转为 WebP 并压制尺寸。 */
export async function prepareImageForUpload(file: File, ext: string): Promise<PreparedImageUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const e = ext.toLowerCase();

  if (e === ".gif") {
    return { buffer, ext: e, contentType: mimeForExtension(e, file.type) };
  }

  if (e === ".webp") {
    return { buffer, ext: ".webp", contentType: "image/webp" };
  }

  try {
    const out = await sharp(buffer)
      .rotate()
      .resize(MAX_UPLOAD_EDGE_PX, MAX_UPLOAD_EDGE_PX, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    return { buffer: out, ext: ".webp", contentType: "image/webp" };
  } catch {
    return {
      buffer,
      ext: e,
      contentType: mimeForExtension(e, file.type),
    };
  }
}
