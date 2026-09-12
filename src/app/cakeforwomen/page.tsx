import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Women's Custom Cakes",
  description:
    "Elegant custom cakes for women—birthdays, bridal showers, and special occasions. Handmade in Chino Hills; order online.",
  alternates: { canonical: `${getSiteUrl().origin}/cakeforwomen` },
  openGraph: { url: "/cakeforwomen", title: "Women's Custom Cakes | Lulu Bakery" },
};

export default async function CakeForWomenPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="women" />;
}
