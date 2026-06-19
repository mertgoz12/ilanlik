import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "İlanlık";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// İlanlık logosu (public/logo.png): "ilanlık" kelime markası, ".com" sarı.
export default function Image() {
  const logoBase64 = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${logoBase64}`} width={760} height={190} alt="İlanlık" />
      </div>
    ),
    size,
  );
}
