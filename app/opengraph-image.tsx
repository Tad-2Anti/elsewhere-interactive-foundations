import { ImageResponse } from "next/og";
import { siteConfig } from "./site-config";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", color: "#eee9df", background: "#070707", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 8 }}>
        <span>ELSEWHERE</span>
        <span style={{ color: "#9a968e", letterSpacing: 3 }}>SIX WORLDS · ONE CAREFUL EDIT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ width: 110, height: 6, background: "#b8ff45" }} />
        <div style={{ maxWidth: 940, fontSize: 82, lineHeight: 0.95, letterSpacing: -5 }}>Independent products, personally sourced.</div>
        <div style={{ color: "#aaa69e", fontSize: 27, letterSpacing: 1 }}>Arcade · Scent · Carry · Arena · Adorn · Little</div>
      </div>
    </div>,
    size,
  );
}
