import { ImageResponse } from "next/og";
import { getWorld } from "../../world-data";

export const alt = "ELSEWHERE product world";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function WorldOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = getWorld(slug);
  const name = world?.name ?? "ELSEWHERE";
  const kicker = world?.kicker ?? "Independent products, personally sourced";
  const accent = world?.accent ?? "#b8ff45";
  const background = world?.gallery.background ?? "#070707";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", color: "#eee9df", background, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 8 }}>
        <span>ELSEWHERE</span>
        <span style={{ color: accent, letterSpacing: 4 }}>WORLD {world?.number ?? "—"} / 06</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ color: accent, fontSize: 25, letterSpacing: 5, textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ fontSize: 150, lineHeight: 0.82, letterSpacing: -10 }}>{name}</div>
        <div style={{ width: 170, height: 7, marginTop: 18, background: accent }} />
      </div>
    </div>,
    size,
  );
}
