import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lulu Bakery",
    short_name: "Lulu Bakery",
    description: "Lulu Bakery custom cake ordering website.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F5",
    theme_color: "#5C4B43",
    icons: [
      {
        src: "/brand/avatar.png",
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: "/brand/avatar.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
