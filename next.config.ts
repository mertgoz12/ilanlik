import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // En fazla MAX_IMAGES (10) x MAX_IMAGE_SIZE (5MB) ilan fotoğrafı + form
      // alanları aynı istekte gönderilebiliyor (bkz. ilan-ver/actions.ts).
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob'a yüklenen ilan fotoğrafları (bkz. app/ilan-ver/actions.ts).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
