import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "More Custom Cake Styles",
  description:
    "Additional custom cake designs and specialty styles. Browse the gallery and place your order for Chino Hills pickup.",
  alternates: { canonical: `${getSiteUrl().origin}/cakeforother` },
  openGraph: { url: "/cakeforother", title: "More Custom Cakes | Lulu Bakery" },
};

export default async function CakeForOtherPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="other" initialTab="showcase" />;
}
