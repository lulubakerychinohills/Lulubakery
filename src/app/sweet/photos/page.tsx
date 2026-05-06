import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dessert Photos",
  description:
    "Browse handmade dessert styles from Lulu Bakery in Chino Hills. Tap a photo to order online for pickup.",
  alternates: { canonical: `${getSiteUrl().origin}/sweet/photos` },
  openGraph: {
    url: "/sweet/photos",
    title: "Dessert Photos | Lulu Bakery",
    description:
      "Browse handmade dessert styles from Lulu Bakery. Tap a photo to order online for pickup.",
  },
};

export default async function SweetPhotosPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="sweet" initialTab="showcase" />;
}
