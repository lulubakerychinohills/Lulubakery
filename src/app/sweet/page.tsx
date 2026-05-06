import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Desserts & Sweet Treats",
  description:
    "Handmade desserts and sweet treats from Lulu Bakery in Chino Hills. View the menu and order online for pickup.",
  alternates: { canonical: `${getSiteUrl().origin}/sweet` },
  openGraph: { url: "/sweet", title: "Desserts & Sweet Treats | Lulu Bakery" },
};

export default async function SweetPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="sweet" initialTab="showcase" />;
}
