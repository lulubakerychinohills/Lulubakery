/**
 * canonical / Open Graph 等 SEO 用站点根地址。请在 Vercel 设置 NEXT_PUBLIC_SITE_URL（含 https，无末尾斜杠）。
 */
export const SITE_NAME = "Lulu Bakery";

export const DEFAULT_DESCRIPTION =
  "Order custom cakes and handmade desserts in Chino Hills, California. Pick a style, choose size and filling, and submit online for pickup.";

export function getSiteUrl(): URL {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) {
    try {
      const normalized = env.replace(/\/+$/, "");
      return new URL(normalized);
    } catch {
      // fallback below
    }
  }
  return new URL("https://cakebylulu.com");
}
