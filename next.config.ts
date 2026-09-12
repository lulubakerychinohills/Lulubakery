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
    // Vercel 图片优化对当前套餐返回 402 时须关闭；非甜品靠上传时缩小尺寸（见 prepare-image-upload）。
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/**" }] : []),
    ],
  },
};

export default nextConfig;
