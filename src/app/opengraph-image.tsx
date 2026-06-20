import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "İlanlio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoBase64 = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#fafaf9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logoBase64}`} width={620} height={155} alt="İlanlio" />
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#1B2A4A" }}>
          Yapay Zeka Destekli Güvenli İlan Platformu
        </div>
      </div>
    ),
    size,
  );
}
