import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CharacterSilhouette } from "../components/CharacterSilhouette";
import { Flicker, MONO } from "../components/ui";

/**
 * Act1Hook.tsx (frames 0-156) — Push-in ominoso al bosque en niebla.
 * Slenderman emerge gradualmente del plano Z medio; título de expediente
 * en zona segura; pulso de borde rojo en "no mires atrás" (frame 76);
 * acercamiento brusco con tentáculos y glitch RGB en "Ya llegó." (frame 126).
 */

const BADGE_FROM = 24;
const EMERGE_FROM = 20;
const SNAP = 126; // 4.20s — "Ya llegó."

export const Act1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  const emergence = interpolate(frame, [EMERGE_FROM, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const snap = interpolate(frame, [SNAP, SNAP + 10, SNAP + 26], [0, 1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Pulso carmesí en "no mires atrás" (frame 76)
  const redPulse = interpolate(frame, [76, 86, 122], [0, 0.85, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Flash al snap de "Ya llegó."
  const redFlash = interpolate(frame, [SNAP, SNAP + 6, SNAP + 22], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(frame, [BADGE_FROM, BADGE_FROM + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const charScale = 0.94 + emergence * 0.08 + snap * 0.34;
  const rimColor = frame >= 76 && frame <= 122 ? "#DC2626" : "#2B3A42";

  return (
    <AbsoluteFill>
      {/* Pulso rojo de tensión sobre el entorno */}
      <AbsoluteFill
        style={{
          opacity: Math.max(redFlash, redPulse * 0.35),
          background:
            "radial-gradient(ellipse 90% 70% at 50% 55%, transparent 40%, rgba(127,29,29,0.8) 100%)",
        }}
      />

      <CharacterSilhouette
        scale={charScale}
        opacity={0.15 + emergence * 0.75}
        tentacleSpread={0.2 + emergence * 0.15 + snap * 0.55}
        glitchIntensity={snap * 0.9}
        rimColor={rimColor}
        yOffset={snap * 26}
      />

      {/* Título de expediente (zona segura, una sola línea nítida) */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 64,
          width: 840,
          display: "flex",
          justifyContent: "center",
          opacity: badgeOpacity,
        }}
      >
        <Flicker
          frame={frame}
          seed={2}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            background: "rgba(4,5,7,0.55)",
            borderRadius: 4,
            padding: "12px 30px",
            color: "#F2EFE9",
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: "0.3em",
            textShadow: "0 2px 10px rgba(4,5,7,0.9)",
          }}
        >
          EXPEDIENTE #01 // SLENDERMAN
        </Flicker>
      </div>
    </AbsoluteFill>
  );
};
