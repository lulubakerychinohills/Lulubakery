import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

type PathEntry = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const entries: PathEntry[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/order", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/cakeformen", changeFrequency: "weekly", priority: 0.85 },
  { path: "/cakeforwomen", changeFrequency: "weekly", priority: 0.85 },
  { path: "/cakeforkids", changeFrequency: "weekly", priority: 0.85 },
  { path: "/cakeforother", changeFrequency: "weekly", priority: 0.8 },
  { path: "/sweet", changeFrequency: "weekly", priority: 0.85 },
  { path: "/sweet/photos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin.replace(/\/$/, "");
  const lastModified = new Date();

  return entries.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${base}${path}` : base,
    lastModified,
    changeFrequency,
    priority,
  }));
}
