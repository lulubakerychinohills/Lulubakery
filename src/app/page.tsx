import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

/** 与 readProducts 缓存及后台 revalidateTag 配合，降低首屏等待 Supabase 的时间 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Custom Cakes & Desserts",
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: getSiteUrl().origin },
  openGraph: {
    title: `${SITE_NAME} | Custom Cakes & Desserts`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    type: "website",
  },
};

export default async function Home() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} />;
}
