import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SFX_CUES } from "../data/episodeConfig";

/**
 * Camera25D — Cámara 2.5D con una ÚNICA intención cinematográfica suave por
 * escena (prohibidos los golpes de zoom por palabra y las sacudidas
 * periódicas `frame % N`). Produce un desplazamiento/escala continuo y
 * distinto según la intención, más 2 únicos micro-impactos puntuales en todo
 * el Short sincronizados con SFX_CUES.cameraShutterFrame y
 * SFX_CUES.outroBoomFrame (spring() con decaimiento rápido de 12 frames).
 */

export type CameraIntention =
  | "dolly_in"
  | "pan_right"
  | "z_advance"
  | "subtle_push"
  | "steady_tension"
  | "dramatic_lock";

interface Camera25DProps {
  sceneStart: number;
  sceneEnd: number;
  intention?: CameraIntention;
  zoomDrift?: number;
  children: React.ReactNode;
}

/** Duración de cada micro-impacto (10–14 frames). */
const IMPACT_DURATION = 12;

/**
 * Micro-impacto puntual: spring() con subida rápida y decaimiento a cero.
 * `globalFrame` es el frame global; `cueFrame` el instante del impacto.
 */
function impactPunch(
  globalFrame: number,
  cueFrame: number,
  fps: number
): number {
  const d = globalFrame - cueFrame;
  if (d < 0 || d > IMPACT_DURATION) {
    return 0;
  }
  const s = spring({
    frame: d,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 180 },
  });
  const decay = interpolate(d, [0, 5, IMPACT_DURATION], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return s * decay;
}

export const Camera25D: React.FC<Camera25DProps> = ({
  sceneStart,
  sceneEnd,
  intention,
  zoomDrift = 0.07,
  children,
}) => {
  const frame = useCurrentFrame(); // frame local de la escena
  const { fps } = useVideoConfig();

  const global = frame + sceneStart;
  const sceneLen = Math.max(1, sceneEnd - sceneStart);
  const progress = Math.min(1, Math.max(0, (global - sceneStart) / sceneLen));

  let tx = 0;
  let ty = 0;
  let rot = 0;
  let scale = 1;

  switch (intention) {
    case "dolly_in":
      scale = interpolate(progress, [0, 1], [1.0, 1.07]);
      ty = interpolate(progress, [0, 1], [0, -14]);
      break;
    case "pan_right":
      tx = interpolate(progress, [0, 1], [16, -16]);
      scale = 1.04;
      break;
    case "z_advance":
      scale = interpolate(progress, [0, 1], [1.01, 1.09]);
      tx = Math.sin(global * 0.004) * 5;
      ty = Math.cos(global * 0.004 + 0.9) * 3.5;
      rot = Math.sin(global * 0.004 + 0.5) * 0.18;
      break;
    case "subtle_push":
      tx = interpolate(progress, [0, 1], [-12, 14]);
      scale = interpolate(progress, [0, 1], [1.02, 1.07]);
      break;
    case "steady_tension":
      scale = interpolate(progress, [0, 1], [1.0, 1.045]);
      ty = interpolate(progress, [0, 1], [6, -6]);
      break;
    case "dramatic_lock":
      scale = interpolate(progress, [0, 1], [1.05, 1.015]);
      break;
    default:
      // Compatibilidad: deriva lenta + balanceo handheld (sin intention).
      scale = 1 + progress * zoomDrift;
      tx =
        Math.sin(global * 0.011) * 6 +
        Math.sin(global * 0.0053 + 1.7) * 4.2;
      ty =
        Math.cos(global * 0.009) * 5 +
        Math.sin(global * 0.0041 + 0.9) * 3.1;
      rot =
        Math.sin(global * 0.007 + 0.5) * 0.38 +
        Math.sin(global * 0.0031 + 2.2) * 0.16;
      break;
  }

  // Únicos 2 micro-impactos permitidos en todo el Short.
  const punch = Math.max(
    impactPunch(global, SFX_CUES.cameraShutterFrame, fps),
    impactPunch(global, SFX_CUES.outroBoomFrame, fps)
  );
  scale += punch * 0.05;
  ty += -punch * 6;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#040507",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
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
