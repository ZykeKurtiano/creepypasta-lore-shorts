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
 * Camera25D — Cámara 2.5D continua tipo handheld que envuelve cada escena:
 *  - balanceo multi-frecuencia suave (translateX/translateY + rotate ±0.4°),
 *  - deriva de zoom lenta y constante (ningún plano es estático),
 *  - golpes de zoom con spring() sincronizados con palabras clave
 *    (zoomPunch: true) del guion.
 *
 * Recibe los límites globales de la escena para poder evaluar el
 * transcript en tiempo global aunque viva dentro de un <Sequence>.
 */
interface Camera25DProps {
  sceneStart: number;
  sceneEnd: number;
  zoomDrift?: number;
  children: React.ReactNode;
}

export const Camera25D: React.FC<Camera25DProps> = ({
  sceneStart,
  sceneEnd,
  zoomDrift = 0.07,
  children,
}) => {
  const frame = useCurrentFrame(); // frame local de la escena
  const { fps } = useVideoConfig();

  const global = frame + sceneStart;
  const sceneLen = Math.max(1, sceneEnd - sceneStart);
  const progress = Math.min(1, Math.max(0, (global - sceneStart) / sceneLen));

  // Balanceo handheld multi-frecuencia (determinista).
  const tx =
    Math.sin(global * 0.011) * 6 +
    Math.sin(global * 0.0053 + 1.7) * 4.2;
  const ty =
    Math.cos(global * 0.009) * 5 +
    Math.sin(global * 0.0041 + 0.9) * 3.1;
  const rot =
    Math.sin(global * 0.007 + 0.5) * 0.38 +
    Math.sin(global * 0.0031 + 2.2) * 0.16;

  // Deriva de zoom continua (zoom-in lento durante toda la escena).
  const drift = 1 + progress * zoomDrift;

  // Golpes de zoom por palabras clave (zoomPunch) del guion.
  // El transcript de este episodio no marca palabras `zoomPunch`; se tipa de
  // forma laxa el acceso para preservar la función sin tocar transcript.ts.
  let punch = 0;
  for (const w of TRANSCRIPT_WORDS as Array<{
    zoomPunch?: boolean;
    start: number;
  }>) {
    if (!w.zoomPunch) {
      continue;
    }
    const startFrame = w.start * fps;
    const d = global - startFrame;
    if (d >= 0 && d <= 18) {
      const p = spring({
        frame: d,
        fps,
        config: { damping: 190, mass: 0.55, stiffness: 130 },
      });
      punch = Math.max(punch, p);
    }
  }

  const shakeX = Math.sin(global * 1.9) * 3.2 * punch;
  const shakeY = Math.cos(global * 1.6) * 2.4 * punch;

  const scale = drift * (1 + punch * 0.07);
  const easedRot = rot + punch * Math.sin(global * 1.3) * 0.3;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#040507",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate(${tx + shakeX}px, ${ty + shakeY}px) rotate(${easedRot}deg) scale(${scale})`,
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
