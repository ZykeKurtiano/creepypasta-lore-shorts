import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FONT_MONO } from "./SafeZone";

/**
 * VhsPostProcess — Post-procesado analógico estilo cinta VHS:
 *  - grano de película ULTRA-fino y sutil (SVG feTurbulence fractalNoise,
 *    animado por seed determinista, opacity 0.055 — jamás lava los negros),
 *  - líneas de escaneo estrictamente horizontales (opacity 0.075,
 *    sin moiré vertical),
 *  - viñeta radial limpia en bordes,
 *  - aberración cromática SOLO en picos de tensión (cortes y flashes),
 *  - HUD diegético mínimo (● REC + timecode) dentro de la zona segura.
 */

const GrainLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, opacity: 0.055, pointerEvents: "none" }}
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

/** Eventos que disparan picos de aberración cromática. */
const CHROMA_EVENTS: Array<{ at: number; strength: number }> = [
  { at: 138, strength: 1 },
  { at: 260, strength: 0.6 },
  { at: 489, strength: 0.85 },
  { at: 846, strength: 0.8 },
  { at: 1113, strength: 0.85 },
  { at: 1347, strength: 1 },
];

const pad = (n: number): string => String(n).padStart(2, "0");

export const VhsPostProcess: React.FC = () => {
  const frame = useCurrentFrame();

  // Intensidad de aberración cromática actual (solo en picos).
  let chroma = 0;
  for (const ev of CHROMA_EVENTS) {
    const d = frame - ev.at;
    if (d >= 0 && d <= 18) {
      const s =
        ev.strength *
        interpolate(d, [0, 3, 9, 18], [0, 1, 0.55, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      chroma = Math.max(chroma, s);
    }
  }

  // Timecode HH:MM:SS:FF.
  const totalSec = Math.floor(frame / 30);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  const ff = frame % 30;
  const timecode = `00:00:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  const recBlink = Math.floor(frame / 9) % 2 === 0 ? 1 : 0.28;

  // Línea de tracking que rueda muy lentamente (sutil).
  const rollY = (frame * 0.55) % 1920;

  return (
    <AbsoluteFill style={{ zIndex: 60, pointerEvents: "none" }}>
      {/* Grano de película ultra-fino (feTurbulence) */}
      <GrainLayer />

      {/* Líneas de escaneo horizontales sutiles */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 3px)",
          opacity: 0.075,
        }}
      />

      {/* Banda de interferencia rodante (muy tenue) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: rollY - 120,
          height: 120,
          background:
            "linear-gradient(to bottom, transparent, rgba(190,220,240,0.035), transparent)",
        }}
      />

      {/* Viñeta radial limpia */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(2,3,5,0.5) 86%, rgba(0,0,0,0.92) 100%)",
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

      {/* HUD diegético mínimo: ● REC + timecode (zona segura, top 296) */}
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
          <span style={{ opacity: 0.55 }}>&nbsp;&nbsp;SP&nbsp;//&nbsp;SMILE.JPG</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
