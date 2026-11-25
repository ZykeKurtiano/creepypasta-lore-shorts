import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * SceneTransitions — Transiciones ancladas a objetos del Estándar v8
 * sincronizadas con SCENES (frames globales):
 *  - 177  (Scene 1→2): Barrido de Franjas Negras (Media Blackout) → 169–187.
 *  - 853  (Scene 2→3): Page-Flip Match-Cut (sombra de hoja + luna fría) → 845–863.
 *  - 1089 (Scene 3→4): Claw-Swipe Wipe (3 zarpazos con filo carmesí) → 1081–1099.
 *  - 1605 (Scene 4→5): Waveform Dive-Through (anillos + destello cian) → 1595–1617.
 *  - 2078 (Scene 5→6): División Diagonal Luminosa (blanco/carmesí/cian) → 2070–2090.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const WAVE_RINGS = Array.from({ length: 10 }, (_, k) => k);

/** Barrido de Franjas Negras (Media Blackout): 6 franjas de censura. */
const MediaBlackout: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, to], [0, 1], { ...CLAMP });
  if (t <= 0 || t >= 1) {
    return null;
  }
  // Cierra (0 → 1) y abre (1 → 0) hacia el archivo de 2003.
  const cover = interpolate(t, [0, 0.5, 1], [0, 1, 0], { ...CLAMP });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const center = i * 320 + 160;
        const h = cover * 336;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: center - h / 2,
              height: h,
              background: "#000000",
              borderTop: "2px solid rgba(220,38,38,0.75)",
              borderBottom: "2px solid rgba(220,38,38,0.75)",
              boxShadow: "0 0 22px rgba(0,0,0,0.85)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Barrido con garras (Claw-Swipe) con filo carmesí opcional. */
const ClawSwipe: React.FC<{
  from: number;
  to: number;
  direction?: "trbl" | "tlbr";
  crimson?: boolean;
}> = ({ from, to, direction = "trbl", crimson = false }) => {
  const frame = useCurrentFrame();
  const mid = (from + to) / 2;
  const t = interpolate(frame, [from, to], [0, 1], { ...CLAMP });
  if (t <= 0 || t >= 1) {
    return null;
  }
  const burst = interpolate(frame, [from, mid, to], [0, 1, 0], { ...CLAMP });
  const ltr = direction === "tlbr";

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Ráfaga de sombra rápida */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 55%, transparent 25%, rgba(2,3,5,0.7) 100%)",
          opacity: burst * 0.55,
        }}
      />
      {/* Destello carmesí opcional */}
      {crimson ? (
        <AbsoluteFill
          style={{
            background: "#7F1D1D",
            opacity: burst * 0.6,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        {[0, 1, 2].map((k) => {
          const sweep = t * 2130;
          const x0 = ltr ? 60 + k * 120 : 1020 - k * 120;
          const y0 = -140 - k * 60 + sweep;
          const x1 = x0 + (ltr ? 620 : -620) - k * 50;
          const y1 = y0 + 760 + k * 80;
          const o = interpolate(
            t,
            [0 + k * 0.14, 0.35 + k * 0.14, 1],
            [0, 1, 1],
            { ...CLAMP }
          );
          return (
            <g key={k} opacity={o}>
              <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke="#020305"
                strokeWidth={36 - k * 7}
                strokeLinecap="round"
                style={{ filter: "blur(3px)" }}
              />
              <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke="#DC2626"
                strokeWidth={7 - k * 1.4}
                strokeLinecap="round"
                opacity={0.9}
                style={{ filter: "blur(0.6px)" }}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Page-Flip Match-Cut: sombra vertical de hoja girando + destello de luna. */
const PageFlip: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const mid = (from + to) / 2;
  const t = interpolate(frame, [from, to], [0, 1], { ...CLAMP });
  if (t <= 0 || t >= 1) {
    return null;
  }
  const sweep = interpolate(t, [0, 1], [1200, -320], { ...CLAMP });
  const flash = interpolate(frame, [from, mid, to], [0, 1, 0], { ...CLAMP });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Sombra vertical de la hoja girando */}
      <div
        style={{
          position: "absolute",
          top: -80,
          bottom: -80,
          left: sweep,
          width: 260,
          background:
            "linear-gradient(90deg, transparent, rgba(2,3,5,0.92) 40%, rgba(2,3,5,0.95) 60%, transparent)",
          filter: "blur(10px)",
        }}
      />
      {/* Destello frío de luna */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#DCEBFF",
          opacity: flash * 0.5,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/** Waveform Dive-Through: túnel radial de anillos cian-carmesí + flash frío. */
const WaveformDive: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const mid = (from + to) / 2;
  const t = interpolate(frame, [from, to], [0, 1], { ...CLAMP });
  if (t <= 0 || t >= 1) {
    return null;
  }
  const flash = interpolate(frame, [from, mid, to], [0, 1, 0], { ...CLAMP });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Flash clínico frío */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#BDEBFF",
          opacity: flash * 0.45,
          mixBlendMode: "screen",
        }}
      />
      {WAVE_RINGS.map((k) => {
        const rr = interpolate(
          t,
          [0, 1],
          [80 + k * 30, 900 + k * 140],
          { easing: Easing.in(Easing.cubic) }
        );
        const o = (1 - t) * (0.7 - k * 0.05);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: "50%",
              top: "56%",
              width: rr * 2,
              height: rr * 2,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              border: `3px solid ${
                k % 2 === 0 ? "rgba(34,211,238,0.8)" : "rgba(220,38,38,0.8)"
              }`,
              opacity: Math.max(0, o),
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
      {/* Núcleo luminoso central */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "56%",
          width: 160,
          height: 160,
          transform: `translate(-50%,-50%) scale(${(1 + t * 2).toFixed(3)})`,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,245,255,0.9), rgba(34,211,238,0.4) 55%, transparent 75%)",
          opacity: 1 - t,
        }}
      />
    </AbsoluteFill>
  );
};

/** División Diagonal Luminosa: haz blanco-carmesí-cian + destello de contraste. */
const DiagonalSplit: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const mid = (from + to) / 2;
  const t = interpolate(frame, [from, to], [0, 1], { ...CLAMP });
  if (t <= 0 || t >= 1) {
    return null;
  }
  const flash = interpolate(frame, [from, mid, to], [0, 1, 0], { ...CLAMP });
  const beamX = interpolate(t, [0, 1], [-420, 1500], { ...CLAMP });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Destello de alto contraste */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#FFFFFF",
          opacity: flash * 0.5,
          mixBlendMode: "screen",
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={beamX}
          y1={-100}
          x2={beamX - 200}
          y2={2020}
          stroke="#DC2626"
          strokeWidth="44"
          opacity={0.5}
          style={{ filter: "blur(20px)" }}
        />
        <line
          x1={beamX}
          y1={-100}
          x2={beamX - 200}
          y2={2020}
          stroke="#22D3EE"
          strokeWidth="44"
          opacity={0.5}
          style={{ filter: "blur(20px)" }}
        />
        <line
          x1={beamX}
          y1={-100}
          x2={beamX - 200}
          y2={2020}
          stroke="#FFFFFF"
          strokeWidth="10"
          opacity={0.92}
          style={{ filter: "blur(2px)" }}
        />
      </svg>
    </AbsoluteFill>
  );
};

export const SceneTransitions: React.FC = () => {
  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      <MediaBlackout from={169} to={187} />
      <PageFlip from={845} to={863} />
      <ClawSwipe from={1081} to={1099} direction="trbl" crimson />
      <WaveformDive from={1595} to={1617} />
      <DiagonalSplit from={2070} to={2090} />
    </AbsoluteFill>
  );
};
