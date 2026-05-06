/**
 * 修正数据库里偶发的错误图片地址（例如主机被写成 `_public`，导致变成 https://_public/product-images/...）。
 * 依赖部署环境里的 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_STORAGE_BUCKET。
 */
export function normalizeSupabaseStoragePublicUrl(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

  if (/^https:\/\/([a-z0-9-]+\.)?supabase\.co\/storage\/v1\/object\/public\//i.test(trimmed)) {
    return trimmed;
  }

  const withBucket = new RegExp(`^https?:\\/\\/_public\\/(${bucket}\\/.+)$`, "i");
  const m1 = trimmed.match(withBucket);
  if (m1 && base) {
    return `${base}/storage/v1/object/public/${m1[1]}`;
  }

  const fullPath = trimmed.match(/^https?:\/\/_public(\/storage\/v1\/object\/public\/.+)$/i);
  if (fullPath && base) {
    return `${base}${fullPath[1]}`;
  }

  return trimmed;
}
