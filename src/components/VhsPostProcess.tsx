import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_MONO } from "./SafeZone";

/**
 * VhsPostProcess — Post-procesado analógico estilo cinta VHS (Estándar v9):
 *  - grano de película ULTRA-fino y sutil (SVG feTurbulence fractalNoise,
 *    animado por seed determinista, opacity 0.042 — jamás lava los negros),
 *  - líneas de escaneo estrictamente horizontales (opacity 0.055),
 *  - viñeta radial perimetral limpia sin ensuciar el trazo vectorial,
 *  - aberración cromática SOLO en picos y cortes (frames globales),
 *  - HUD diegético minimalista (● REC + timecode + CH-047 // LAVENDER)
 *    en top: 296, centrado, dentro de la zona segura.
 */

const GrainLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.042,
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id="vhs-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={frame % 97}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" />
        </filter>
      </defs>
      <rect x="0" y="0" width="1080" height="1920" filter="url(#vhs-grain)" />
    </svg>
  );
};

/** Frames que disparan picos breves de aberración cromática. */
const CHROMA_FRAMES = [230, 520, 556, 945, 1082, 1354, 1512, 1919, 2145];

const pad = (n: number): string => String(n).padStart(2, "0");

export const VhsPostProcess: React.FC = () => {
  const frame = useCurrentFrame();

  // Intensidad de aberración cromática actual (solo en picos/cortes).
  let chroma = 0;
  for (const at of CHROMA_FRAMES) {
    const d = frame - at;
    if (d >= 0 && d <= 16) {
      const s = interpolate(d, [0, 3, 8, 16], [0, 1, 0.55, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      chroma = Math.max(chroma, s);
    }
  }

  // Timecode HH:MM:SS:FF.
  const totalSec = Math.floor(frame / 30);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const ff = frame % 30;
  const timecode = `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  const recBlink = Math.floor(frame / 9) % 2 === 0 ? 1 : 0.28;

  return (
    <AbsoluteFill style={{ zIndex: 60, pointerEvents: "none" }}>
      {/* Grano de película ultra-fino (feTurbulence) */}
      <GrainLayer />

      {/* Líneas de escaneo horizontales sutiles */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 3px)",
          opacity: 0.055,
        }}
      />

      {/* Viñeta radial limpia */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 56%, rgba(2,3,5,0.42) 88%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Aberración cromática breve en picos de tensión */}
      {chroma > 0.01 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 8 + chroma * 30,
              background: `rgba(34,211,238,${0.12 + chroma * 0.3})`,
              boxShadow: `0 0 24px rgba(34,211,238,${chroma * 0.7})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 8 + chroma * 30,
              background: `rgba(244,63,94,${0.12 + chroma * 0.3})`,
              boxShadow: `0 0 24px rgba(244,63,94,${chroma * 0.7})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 3 + chroma * 5,
              background: `rgba(34,211,238,${chroma * 0.4})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 3 + chroma * 5,
              background: `rgba(244,63,94,${chroma * 0.4})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* HUD diegético mínimo: ● REC + timecode + CH-047 // LAVENDER */}
      <div
        style={{
          position: "absolute",
          top: 296,
          left: 0,
          right: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          paddingInline: 90,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 2,
            color: "rgba(242,239,233,0.92)",
            textShadow: "0 0 8px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#DC2626", opacity: recBlink }}>●</span>
          <span style={{ opacity: 0.75 }}> REC&nbsp;&nbsp;</span>
          <span>{timecode}</span>
          <span style={{ color: "#A78BFA", opacity: 0.7 }}>
            &nbsp;&nbsp;CH-047&nbsp;//&nbsp;LAVENDER
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
