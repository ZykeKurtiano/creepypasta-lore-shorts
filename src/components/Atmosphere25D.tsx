import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/**
 * Atmosphere25D — Capas atmosféricas deterministas reutilizables para
 * dar profundidad 2.5D entre los fondos Fal.ai y los personajes PNG recortados:
 *  - MistLayer: bancos de neblina orgánica en deriva horizontal continua,
 *  - DustSporesLayer: partículas / esporas iluminadas flotando en el eje Y/X,
 *  - ForegroundVignette: viñeta frontal + sombreado perimetral de profundidad.
 */

interface MistProps {
  tint?: string;
  opacity?: number;
  speed?: number;
  yOffset?: number;
  seed?: number;
}

export const MistLayer: React.FC<MistProps> = ({
  tint = "rgba(148, 186, 206, 0.14)",
  opacity = 1,
  speed = 0.45,
  yOffset = 0,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const driftA = Math.sin(frame * 0.012 * speed + seed) * 110;
  const driftB = Math.cos(frame * 0.009 * speed + seed * 2.3) * 130;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          top: 520 + yOffset,
          left: -280 + driftA,
          width: 1460,
          height: 620,
          background: `radial-gradient(ellipse at 50% 50%, ${tint} 0%, transparent 68%)`,
          filter: "blur(52px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1020 + yOffset,
          left: -240 - driftB,
          width: 1520,
          height: 580,
          background: `radial-gradient(ellipse at 50% 50%, ${tint} 0%, transparent 66%)`,
          filter: "blur(58px)",
        }}
      />
    </AbsoluteFill>
  );
};

interface DustProps {
  count?: number;
  color?: string;
  accentColor?: string;
  seed?: number;
  opacity?: number;
  minY?: number;
  maxY?: number;
}

export const DustSporesLayer: React.FC<DustProps> = ({
  count = 28,
  color = "#CFE4F2",
  accentColor,
  seed = 10,
  opacity = 1,
  minY = 240,
  maxY = 1640,
}) => {
  const frame = useCurrentFrame();
  const spanY = Math.max(200, maxY - minY);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const baseX = random(seed * 97 + i * 11 + 1) * 1080;
        const baseY = random(seed * 97 + i * 17 + 2) * spanY;
        const r = 1.4 + random(seed * 97 + i * 23 + 3) * 2.5;
        const speedY = 0.22 + random(seed * 97 + i * 29 + 4) * 0.42;
        const swayAmp = 8 + random(seed * 97 + i * 31 + 5) * 18;
        const swayFreq = 0.012 + random(seed * 97 + i * 37 + 6) * 0.018;
        const phase = random(seed * 97 + i * 41 + 7) * 6.28;

        const y = minY + ((baseY - frame * speedY + spanY * 10) % spanY);
        const x = baseX + Math.sin(frame * swayFreq + phase) * swayAmp;
        const alpha =
          0.08 + 0.28 * Math.abs(Math.sin(frame * 0.032 + phase + i * 0.6));
        const isAccent = Boolean(accentColor) && i % 4 === 0;
        const fill = isAccent ? accentColor! : color;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: fill,
              opacity: alpha,
              boxShadow: `0 0 ${r * 3.2}px ${fill}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

interface VignetteProps {
  edgeStrength?: number;
  bottomDarkness?: number;
  topDarkness?: number;
  accentTint?: string;
}

export const ForegroundVignette: React.FC<VignetteProps> = ({
  edgeStrength = 0.72,
  bottomDarkness = 0.86,
  topDarkness = 0.52,
  accentTint,
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Enmarcado lateral desenfocado de profundidad frontal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 48%, transparent 42%, rgba(3, 5, 8, ${edgeStrength * 0.6}) 78%, rgba(2, 3, 5, ${edgeStrength}) 100%)`,
        }}
      />
      {/* Gradiente superior e inferior para legibilidad cinematográfica */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(3, 4, 7, ${topDarkness}) 0%, transparent 24%, transparent 62%, rgba(3, 4, 7, ${bottomDarkness}) 100%)`,
        }}
      />
      {accentTint ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: accentTint,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
