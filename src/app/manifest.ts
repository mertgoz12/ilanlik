import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "İlanlio",
    short_name: "İlanlio",
    description: "Her ilanın yapay zeka ile denetlendiği, güvenle alıp satabileceğiniz ikinci el ve sıfır ürün ilan platformu.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fafaf9",
    theme_color: "#1B2A4A",
    lang: "tr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
