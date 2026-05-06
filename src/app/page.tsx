import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

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
