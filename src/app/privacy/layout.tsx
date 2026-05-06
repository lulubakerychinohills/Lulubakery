import type { Metadata } from "next";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

const description =
  "How Lulu Bakery collects and uses personal information when you order custom cakes online. Contact us to update or delete your data.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: `${getSiteUrl().origin}/privacy` },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description,
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
