/** 单张图片最大体积：小于或等于该字节数均可上传（与接口校验一致）。 */
export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"]);

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
