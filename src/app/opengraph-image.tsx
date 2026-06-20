import { ImageResponse } from "next/og";

export const alt = "İlanlio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// İlanlio kelime markası: "ilanlio" lacivert, ".com" sarı - artık statik bir
// görsel (eski public/logo.png) yerine doğrudan JSX ile çiziliyor, böylece
// marka adı değiştiğinde tekrar bir görsel üretmeye gerek kalmaz.
export default function Image() {
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
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800 }}>
          <span style={{ color: "#1B2A4A" }}>ilanlio</span>
          <span style={{ color: "#F5A623" }}>.com</span>
        </div>
      </div>
    ),
    size,
  );
}
