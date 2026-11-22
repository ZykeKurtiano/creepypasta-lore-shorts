import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";
import { FONT_MONO } from "./SafeZone";

/**
 * VhsPostProcess — Post-procesado analógico estilo cinta VHS:
 *  - grano de película ultra-fino (SVG feTurbulence fractalNoise, opacity 0.05),
 *  - líneas de escaneo estrictamente horizontales (opacity 0.07),
 *  - viñeta radial limpia en bordes,
 *  - aberración cromática SOLO en cortes de escena (sin bucles periódicos),
 *  - HUD diegético mínimo (● REC + timecode) dentro de la zona segura.
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
        opacity: 0.05,
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

/** Eventos puntuales que disparan aberración cromática (solo cortes de escena). */
const CHROMA_EVENTS: Array<{ at: number; strength: number }> = [
  { at: SCENES.scene2.start, strength: 0.9 },
  { at: SCENES.scene3.start, strength: 0.7 },
  { at: SCENES.scene4.start, strength: 1.0 },
];

const pad = (n: number): string => String(n).padStart(2, "0");

export const VhsPostProcess: React.FC = () => {
  const frame = useCurrentFrame();

  let chroma = 0;
  for (const ev of CHROMA_EVENTS) {
    const d = frame - ev.at;
    if (d >= 0 && d <= 16) {
      const s =
        ev.strength *
        interpolate(d, [0, 2, 8, 16], [0, 1, 0.5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      chroma = Math.max(chroma, s);
    }
  }

  const totalSec = Math.floor(frame / 30);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  const ff = frame % 30;
  const timecode = `00:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  const recBlink = Math.floor(frame / 12) % 2 === 0 ? 1 : 0.3;

  const rollY = (frame * 0.5) % 1920;

  return (
    <AbsoluteFill style={{ zIndex: 60, pointerEvents: "none" }}>
      <GrainLayer />

      {/* Líneas de escaneo horizontales sutiles */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 3px)",
          opacity: 0.068,
        }}
      />

      {/* Banda de tracking tenue */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: rollY - 120,
          height: 120,
          background:
            "linear-gradient(to bottom, transparent, rgba(190,220,240,0.03), transparent)",
        }}
      />

      {/* Viñeta radial perimetral */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 54%, rgba(2,3,5,0.46) 86%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Aberración cromática breve exclusivamente en cortes */}
      {chroma > 0.01 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 8 + chroma * 28,
              background: `rgba(34,211,238,${0.12 + chroma * 0.28})`,
              boxShadow: `0 0 22px rgba(34,211,238,${chroma * 0.65})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 8 + chroma * 28,
              background: `rgba(244,63,94,${0.12 + chroma * 0.28})`,
              boxShadow: `0 0 22px rgba(244,63,94,${chroma * 0.65})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* HUD diegético mínimo centrado dentro de la zona segura (top 296) */}
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
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: 2.2,
            color: "rgba(242,239,233,0.88)",
            textShadow: "0 1px 10px rgba(0,0,0,0.95)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#DC2626", opacity: recBlink }}>●</span>
          <span style={{ opacity: 0.72 }}> REC&nbsp;&nbsp;</span>
          <span>{timecode}</span>
          <span style={{ opacity: 0.55 }}>&nbsp;&nbsp;SP&nbsp;//&nbsp;JEFF_2008.DAT</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
