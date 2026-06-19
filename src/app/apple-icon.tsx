import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// İlanlık amblemi: "i" harfi, noktası sarı.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#1B2A4A" />
          <rect x="10.3" y="10" width="3.4" height="10" rx="1.7" fill="#FFFFFF" />
          <circle cx="12" cy="6.2" r="2.4" fill="#F5A623" />
        </svg>
      </div>
    ),
    size,
  );
}
