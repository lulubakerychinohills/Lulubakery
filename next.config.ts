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
    // 默认走图片优化；甜品作品图在组件上单独设 unoptimized 保留原图。
    // 若 Supabase 外链触发 402，可改回 unoptimized: true 并改为上传缩略图字段。
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/**" }] : []),
    ],
  },
};

export default nextConfig;
