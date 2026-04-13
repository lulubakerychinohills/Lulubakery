const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);

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

  if (!HEIC_EXTENSIONS.has(ext)) {
    return { buffer, ext, contentType };
  }

  // heic-convert returns a Node Buffer when output format is JPEG.
  const heicConvert = (await import("heic-convert")).default as unknown as (args: {
    buffer: Buffer;
    format: "JPEG";
    quality: number;
  }) => Promise<Buffer>;

  const jpgBuffer = await heicConvert({
    buffer,
    format: "JPEG",
    quality: 0.9,
  });

  return {
    buffer: jpgBuffer,
    ext: ".jpg",
    contentType: "image/jpeg",
  };
}
