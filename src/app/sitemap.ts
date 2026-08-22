import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;
  const lastModified = new Date();

  const paths = [
    "",
    "/about",
    "/privacy",
    "/order",
    "/cakeformen",
    "/cakeforwomen",
    "/cakeforkids",
    "/cakeforother",
    "/sweet",
    "/sweet/photos",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
