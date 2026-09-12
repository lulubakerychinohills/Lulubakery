import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Men's Custom Cakes",
  description:
    "Browse custom cake designs for men—birthdays, milestones, and celebrations. Order online for pickup in Chino Hills, California.",
  alternates: { canonical: `${getSiteUrl().origin}/cakeformen` },
  openGraph: { url: "/cakeformen", title: "Men's Custom Cakes | Lulu Bakery" },
};

export default async function CakeForMenPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialCategory="men" />;
}
