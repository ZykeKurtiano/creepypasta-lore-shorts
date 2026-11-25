import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";

/**
 * SceneTransitions — Overlays ligeros y cinematográficos que potencian las
 * 5 transiciones con zoom continuo del episodio Tails Doll (Estándar v6).
 *
 * Cada overlay usa guardas explícitas de rango (`frame >= a && frame <= b`)
 * para que NINGÚN efecto filtre opacidad fuera de su ventana. Los tiempos
 * exactos salen de `SCENES` (frames globales @ 30 fps):
 *
 *  - SCENES.scene1.end (622)  → Gem-Dive Zoom: halo radial carmesí + destello
 *    rubí de 14 frames centrado en el punto de inmersión (612–630).
 *  - SCENES.scene2.end (1405) → Pupil-Dive Zoom: anillos concéntricos de
 *    túnel cian/negro + destello de entrada al mundo 3D (1395–1415).
 *  - SCENES.scene3.end (1767) → Whip-Zoom PS2: líneas radiales de velocidad +
 *    destello azul/cian de lector óptico PS2 (1757–1776).
 *  - SCENES.scene4.end (2194) → Doorway Zoom-Through: viñeta de túnel oscuro
 *    atravesando el umbral + destello frío (2184–2203).
 *  - SCENES.scene5.end (2336) → Flash de Gema Roja Diagonal: destello diagonal
 *    carmesí/blanco que abre la pantalla dividida (2328–2346).
 */

const CENTER_X = 540;
const CENTER_Y = 960;

/** Envolvente con guardas explícitas: 0 → peak → 0 en [a, b, c, d]. */
const guarded = (
  frame: number,
  a: number,
  b: number,
  c: number,
  d: number,
  peak: number
): number => {
  if (frame < a || frame > d) {
    return 0;
  }
  return interpolate(frame, [a, b, c, d], [0, peak, peak, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Frames de frontera exactos importados desde episodeConfig.
const S1_END = SCENES.scene1.end; // 622
const S2_END = SCENES.scene2.end; // 1405
const S3_END = SCENES.scene3.end; // 1767
const S4_END = SCENES.scene4.end; // 2194
const S5_END = SCENES.scene5.end; // 2336

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Gem-Dive Zoom (Scene 1 → 2, 612–630) ---
  const gem = guarded(frame, S1_END - 10, S1_END - 3, S1_END + 4, S1_END + 8, 1);

  // --- Pupil-Dive Zoom (Scene 2 → 3, 1395–1415) ---
  const pupil = guarded(frame, S2_END - 10, S2_END - 3, S2_END + 4, S2_END + 10, 1);
  const pupilFlash = guarded(frame, S2_END - 3, S2_END + 3, S2_END + 10, S2_END + 15, 1);

  // --- Whip-Zoom PS2 (Scene 3 → 4, 1757–1776) ---
  const whip = guarded(frame, S3_END - 10, S3_END - 3, S3_END + 3, S3_END + 9, 1);
  const whipFlash = guarded(frame, S3_END - 3, S3_END + 3, S3_END + 9, S3_END + 15, 1);

  // --- Doorway Zoom-Through (Scene 4 → 5, 2184–2203) ---
  const doorway = guarded(frame, S4_END - 10, S4_END - 3, S4_END + 3, S4_END + 9, 1);
  const doorwayFlash = guarded(frame, S4_END - 3, S4_END + 3, S4_END + 9, S4_END + 15, 1);

  // --- Flash de Gema Roja Diagonal (Scene 5 → 6, 2328–2346) ---
  const diag = guarded(frame, S5_END - 8, S5_END - 1, S5_END + 5, S5_END + 10, 1);
  const diagWhite = guarded(frame, S5_END - 3, S5_END + 1, S5_END + 5, S5_END + 8, 1);

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* ============================ GEM-DIVE ZOOM ============================ */}
      {gem > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {/* Halo radial carmesí incandescente centrado en el punto de inmersión */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(252,165,165,0.95) 0%, rgba(220,38,38,0.85) 26%, rgba(127,29,29,0.9) 55%, #040507 100%)",
              opacity: gem,
            }}
          />
          {/* Destello rubí */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FCA5A5 22%, rgba(220,38,38,0.4) 50%, transparent 72%)",
              opacity: gem * 0.8,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* ============================ PUPIL-DIVE ZOOM ============================ */}
      {pupil > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {/* Anillos concéntricos de túnel cian/negro */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            {Array.from({ length: 14 }, (_, k) => {
              const rad = 1100 - k * 74 - pupil * (500 + k * 30);
              return (
                <circle
                  key={k}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={Math.max(0, rad)}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={2 + (k % 3)}
                  opacity={pupil * (0.14 + (k % 4) * 0.04)}
                />
              );
            })}
            {Array.from({ length: 18 }, (_, k) => {
              const a = (k * Math.PI) / 9;
              const r1 = 26;
              const r2 = 1500 - pupil * 1000;
              return (
                <line
                  key={k}
                  x1={CENTER_X + Math.cos(a) * r1}
                  y1={CENTER_Y + Math.sin(a) * r1}
                  x2={CENTER_X + Math.cos(a) * r2}
                  y2={CENTER_Y + Math.sin(a) * r2}
                  stroke="#22D3EE"
                  strokeWidth="1.6"
                  opacity={pupil * 0.4}
                />
              );
            })}
          </svg>
          {/* Oscurecimiento hacia la pupila + destello de entrada */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, #000000 0%, rgba(4,5,7,0.9) 40%, transparent 75%)",
              opacity: pupil,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, #FFFFFF 0%, rgba(34,211,238,0.5) 30%, transparent 60%)",
              opacity: pupilFlash * 0.8,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* ============================ WHIP-ZOOM PS2 ============================ */}
      {whip > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {/* Líneas radiales de velocidad desde el lector óptico */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            {Array.from({ length: 26 }, (_, k) => {
              const a = (k * Math.PI * 2) / 26 + 0.4;
              const r1 = 240;
              const r2 = 900 - whip * 660;
              return (
                <line
                  key={k}
                  x1={CENTER_X + Math.cos(a) * r1}
                  y1={CENTER_Y + Math.sin(a) * r1}
                  x2={CENTER_X + Math.cos(a) * r2}
                  y2={CENTER_Y + Math.sin(a) * r2}
                  stroke={k % 2 ? "#22D3EE" : "#8FD0E0"}
                  strokeWidth={2 + (k % 3)}
                  opacity={whip * 0.5}
                />
              );
            })}
          </svg>
          {/* Destello azul/cian de lector óptico PS2 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, #EAFBFF 0%, rgba(34,211,238,0.75) 30%, rgba(2,4,10,0.9) 70%)",
              opacity: whipFlash,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* ============================ DOORWAY ZOOM-THROUGH ============================ */}
      {doorway > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {/* Viñeta de túnel oscuro atravesando el umbral */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 45%, transparent 0%, rgba(2,3,5,0.55) 38%, rgba(2,3,5,0.95) 70%, #020306 100%)",
              opacity: doorway,
            }}
          />
          {/* Destello frío del umbral */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 45%, rgba(220,235,250,0.6) 0%, rgba(34,211,238,0.25) 34%, transparent 62%)",
              opacity: doorwayFlash * 0.6,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* ============================ FLASH DE GEMA ROJA DIAGONAL ============================ */}
      {diag > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          {/* Destello diagonal carmesí/blanco que abre la pantalla dividida */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(252,165,165,0.9) 0%, rgba(220,38,38,0.75) 38%, rgba(127,29,29,0.9) 66%, #040507 100%)",
              opacity: diag,
            }}
          />
          {/* Haz diagonal luminoso */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "12%",
              width: 46,
              height: 2020,
              background:
                "linear-gradient(180deg, transparent, rgba(255,255,255,0.9), rgba(220,38,38,0.6), transparent)",
              transform: "rotate(-38deg)",
              transformOrigin: "50% 50%",
              opacity: diag,
            }}
          />
          {/* Núcleo blanco puntual */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 45%, #FFFFFF 0%, rgba(252,165,165,0.6) 26%, transparent 55%)",
              opacity: diagWhite * 0.85,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
