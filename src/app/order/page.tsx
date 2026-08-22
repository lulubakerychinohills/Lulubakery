import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import { SITE_NAME, getSiteUrl } from "@/lib/site";
import { readProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Place Order",
  description:
    "Order a custom cake online from Lulu Bakery in Chino Hills. Choose size, filling, and pickup time.",
  alternates: { canonical: `${getSiteUrl().origin}/order` },
  openGraph: {
    title: `Place Order | ${SITE_NAME}`,
    description:
      "Order a custom cake online from Lulu Bakery in Chino Hills. Choose size, filling, and pickup time.",
    url: "/order",
    type: "website",
  },
};

export default async function OrderPage() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} initialTab="order" />;
}
