import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lulu Bakery is a licensed private home bakery in Chino Hills specializing in custom cakes and desserts for birthdays, weddings, and celebrations.",
  alternates: { canonical: `${getSiteUrl().origin}/about` },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    url: "/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
