"use client";

import dynamic from "next/dynamic";
import type { CakeItem } from "@/components/home-client";

const HomeClientNoSSR = dynamic(() => import("@/components/home-client"), {
  ssr: false,
  loading: () => <main className="min-h-screen bg-rose-50" />,
});

type Props = {
  initialProducts: CakeItem[];
};

export default function HomeClientShell({ initialProducts }: Props) {
  return <HomeClientNoSSR initialProducts={initialProducts} />;
}
