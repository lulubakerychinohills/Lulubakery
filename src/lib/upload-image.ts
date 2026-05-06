/** 单张图片最大体积：小于或等于该字节数均可上传（与接口校验一致）。 */
export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"]);

type PreparedUpload = {
  buffer: Buffer;
  ext: string;
  contentType: string;
};

export function resolveImageExtension(fileName: string, fileType: string) {
  const extFromName = fileName.includes(".") ? `.${fileName.split(".").pop()?.toLowerCase()}` : "";
  if (ALLOWED_EXTENSIONS.has(extFromName)) return extFromName;

  if (fileType === "image/jpeg") return ".jpg";
  if (fileType === "image/png") return ".png";
  if (fileType === "image/webp") return ".webp";
  if (fileType === "image/gif") return ".gif";
  if (fileType === "image/heic" || fileType === "image/heic-sequence") return ".heic";
  if (fileType === "image/heif" || fileType === "image/heif-sequence") return ".heif";
  return "";
}

export function isSupportedImageFile(fileType: string, fileName: string) {
  if (fileType.startsWith("image/")) return true;
  const ext = resolveImageExtension(fileName, fileType);
  return Boolean(ext && ALLOWED_EXTENSIONS.has(ext));
}

function getContentType(fileType: string, ext: string) {
  if (fileType && fileType.startsWith("image/")) return fileType;
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".heic") return "image/heic";
  if (ext === ".heif") return "image/heif";
  return "application/octet-stream";
}

export async function prepareImageForUpload(file: File, ext: string): Promise<PreparedUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = getContentType(file.type, ext);
  return { buffer, ext, contentType };
}
