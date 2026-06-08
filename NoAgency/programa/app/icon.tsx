import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 44 44"
        >
          {/* Center */}
          <circle cx="22" cy="22" r="7.5" fill="#FFFFFF" />
          {/* Top */}
          <circle cx="22" cy="9" r="4.8" fill="#FFFFFF" opacity="0.85" />
          {/* Bottom — accent red */}
          <circle cx="22" cy="35" r="4.8" fill="#D64045" />
          {/* Top-right */}
          <circle cx="33" cy="15.5" r="4.8" fill="#FFFFFF" opacity="0.6" />
          {/* Top-left */}
          <circle cx="11" cy="15.5" r="4.8" fill="#FFFFFF" opacity="0.6" />
          {/* Bottom-right */}
          <circle cx="33" cy="28.5" r="4.8" fill="#FFFFFF" opacity="0.6" />
          {/* Bottom-left */}
          <circle cx="11" cy="28.5" r="4.8" fill="#FFFFFF" opacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
