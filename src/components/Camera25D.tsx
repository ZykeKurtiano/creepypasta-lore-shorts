import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";

/**
 * Camera25D — Cámara 2.5D continua que envuelve cada escena:
 *  - SIN balanceo handheld repetitivo ni sacudidas continuas.
 *  - Una única deriva de cámara ultra-suave y motivada por escena
 *    (`intent`: "dolly" | "pan" | "push" | "steady"), monotónica en el
 *    progreso de la escena, para no competir con los movimientos
 *    internos de las escenas.
 *  - Único micro-impacto `spring` puntual por palabra `zoomPunch: true`
 *    del guion (solo 2 en todo el Short: "turno" en Escena 2 y
 *    "ahogado" en Escena 5), con amplitud limpia y contenida
 *    (scale <= 0.035).
 *
 * Recibe los límites globales de la escena para evaluar el transcript
 * en tiempo global aunque viva dentro de un <Sequence>.
 */

export type CameraIntent = "dolly" | "pan" | "push" | "steady";

interface Camera25DProps {
  sceneStart: number;
  sceneEnd: number;
  zoomDrift?: number;
  intent?: CameraIntent;
  children: React.ReactNode;
}

export const Camera25D: React.FC<Camera25DProps> = ({
  sceneStart,
  sceneEnd,
  zoomDrift = 0.07,
  intent = "steady",
  children,
}) => {
  const frame = useCurrentFrame(); // frame local de la escena
  const { fps } = useVideoConfig();

  const global = frame + sceneStart;
  const sceneLen = Math.max(1, sceneEnd - sceneStart);
  const progress = Math.min(1, Math.max(0, (global - sceneStart) / sceneLen));

  // Deriva ultra-suave, monotónica y motivada por intención (sin bucles).
  let scale = 1;
  let tx = 0;
  let ty = 0;
  switch (intent) {
    case "dolly":
      scale = 1 + progress * zoomDrift;
      ty = progress * 5;
      break;
    case "pan":
      tx = -progress * 24;
      scale = 1 + progress * 0.02;
      break;
    case "push":
      scale = 1 + progress * 0.055;
      ty = progress * 3;
      break;
    case "steady":
    default:
      scale = 1 + progress * 0.015;
      break;
  }

  // Único micro-impacto spring por palabra clave (amplitude <= 0.035).
  let punch = 0;
  for (const w of TRANSCRIPT_WORDS) {
    if (!w.zoomPunch) {
      continue;
    }
    const startFrame = w.start * fps;
    const d = global - startFrame;
    if (d >= 0 && d <= 20) {
      const p = spring({
        frame: d,
        fps,
        config: { damping: 190, mass: 0.55, stiffness: 130 },
      });
      punch = Math.max(punch, p);
    }
  }

  scale *= 1 + punch * 0.035;
  ty += -punch * 4;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#040507",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {children}
      </AbsoluteFill>
      {/* Viñeta de profundidad de cámara (bordes ligeramente más oscuros) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/** Utilidad: envolvente de un destello (0→1→0) con pico temprano. */
export const flashEnvelope = (
  f: number,
  at: number,
  dur: number,
  peak = 1
): number => {
  const t = f - at;
  if (t < 0 || t > dur) {
    return 0;
  }
  return (
    peak *
    interpolate(
      t,
      [0, dur * 0.16, dur * 0.4, dur],
      [0, 1, 0.3, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    )
  );
};
