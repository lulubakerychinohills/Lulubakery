import HomeClient from "@/components/home-client";
import { readProducts } from "@/lib/products";

export default async function Home() {
  const result = await readProducts();
  return <HomeClient initialProducts={result.products} />;
}
