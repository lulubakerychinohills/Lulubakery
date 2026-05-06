import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.68.66", "localhost", "127.0.0.1"],
  async redirects() {
    return [{ source: "/menu", destination: "/sweet", permanent: true }];
  },
  images: {
    // 跳过 Vercel 图片优化，避免外链（Supabase Storage）在某些套餐下触发 402；由 Supabase CDN 直连。
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/**" }] : []),
    ],
  },
};

export default nextConfig;
