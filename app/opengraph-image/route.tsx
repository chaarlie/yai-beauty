import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#fbf3ee", color: "#1a1614", padding: 90, borderBottom: "24px solid #b98a80" }}>
      <div style={{ fontSize: 24, letterSpacing: 8, color: "#8a6a5c" }}>SOSÚA · REPÚBLICA DOMINICANA</div>
      <div style={{ fontSize: 100, marginTop: 40 }}>YAI BEAUTY</div>
      <div style={{ fontSize: 36, letterSpacing: 12, marginTop: 12 }}>ESTHETIC</div>
      <div style={{ fontSize: 24, marginTop: 50 }}>Cuidado facial y corporal · Face & body care</div>
    </div>, size,
  );
}
