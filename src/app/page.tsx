import HomeClientShell from "@/components/home-client-shell";
import { readProducts } from "@/lib/products";

export default async function Home() {
  const result = await readProducts();
  return <HomeClientShell initialProducts={result.products} />;
}
