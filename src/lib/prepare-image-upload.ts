import sharp from "sharp";

/** 甜品作品：较长边上限（接近「原图」展示）。 */
const MAX_UPLOAD_EDGE_SWEET_PX = 2048;

/** 非甜品分类：列表/订购页足够清晰且明显减小体积。 */
const MAX_UPLOAD_EDGE_CATALOG_PX = 1280;

/** 未传分类时（如顾客参考图上传）：与甜品同级，避免误压细节。 */
const MAX_UPLOAD_EDGE_DEFAULT_PX = MAX_UPLOAD_EDGE_SWEET_PX;

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

export type PrepareImageUploadOptions = {
  /** 最长边像素上限；不传则按默认（订购参考图等）。 */
  maxEdgePx?: number;
};

/** 按产品分类得到上传时的最长边（sweet 更大，其余更省流量）。 */
export function maxUploadEdgeForProductCategory(category: string): number {
  return category === "sweet" ? MAX_UPLOAD_EDGE_SWEET_PX : MAX_UPLOAD_EDGE_CATALOG_PX;
}

/** 服务端专用：GIF 保留动图；其余经 sharp 旋转、限边长、转 WebP（含原 WebP 再压一遍以统一尺寸）。 */
export async function prepareImageForUpload(
  file: File,
  ext: string,
  options?: PrepareImageUploadOptions,
): Promise<PreparedImageUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const e = ext.toLowerCase();
  const maxEdge = options?.maxEdgePx ?? MAX_UPLOAD_EDGE_DEFAULT_PX;

  if (e === ".gif") {
    return { buffer, ext: e, contentType: mimeForExtension(e, file.type) };
  }

  try {
    const out = await sharp(buffer)
      .rotate()
      .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
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
