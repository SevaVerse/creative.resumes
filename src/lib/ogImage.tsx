import { ImageResponse } from "next/og";

// Shared 1200x630 social card so links shared on WhatsApp, LinkedIn and X preview the
// page's own title instead of one generic image.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgCard = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Accent colour for the eyebrow pill. */
  accent?: string;
};

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function renderOgCard({ eyebrow, title, subtitle, accent = "#2563eb" }: OgCard): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #faf5ff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: accent, color: "#fff", fontSize: 28, fontWeight: 700 }}>
            {clip(eyebrow, 48)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 60 ? 54 : 66, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{clip(title, 110)}</div>
          {subtitle ? <div style={{ fontSize: 32, color: "#475569", lineHeight: 1.3 }}>{clip(subtitle, 140)}</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#334155" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: "#2563eb" }}>SecureCV</div>
          <div style={{ display: "flex" }}>Free · No sign-up · No paywall</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
