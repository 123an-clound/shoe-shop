import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/queries/settings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const settings = await getSettings();

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
          backgroundColor: "#07060d",
          backgroundImage: `radial-gradient(circle at 30% 30%, ${settings.color_primary}55, transparent 55%), radial-gradient(circle at 75% 70%, ${settings.color_accent}44, transparent 55%)`,
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, color: "#f4f2ff", letterSpacing: -2 }}>
          {settings.store_name}
        </div>
        <div style={{ fontSize: 32, color: "#a5a0c0", marginTop: 16 }}>{settings.slogan}</div>
      </div>
    ),
    { ...size },
  );
}
