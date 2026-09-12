import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kids' Birthday Cakes",
  description:
    "Fun custom birthday cakes for kids. Choose style, size, and filling—order online for pickup in Chino Hills, CA.",
  alternates: { canonical: `${getSiteUrl().origin}/cakeforkids` },
  openGraph: { url: "/cakeforkids", title: "Kids' Birthday Cakes | Lulu Bakery" },
};

export default async function CakeForKidsPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="kids" />;
}
