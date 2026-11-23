import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";

/**
 * SceneTransitions — Transiciones espaciales globales entre las 6 escenas de
 * Zalgo (frames globales). Sutiles y limpias, sin tapar las transiciones
 * espaciales propias de cada escena:
 *  - SCENES.scene2.start (380): fade de tinta negra del zoom del monitor
 *    (Scene 1 → 2).
 *  - SCENES.scene3.start (908): acento de tinta abisal del camera dive
 *    (Scene 2 → 3).
 *  - SCENES.scene4.start (1649): acento carmesí del foreground wipe de
 *    cristales (Scene 3 → 4).
 *  - SCENES.scene5.start (2106): barrido carmesí sutil de la sombra
 *    envolvente (Scene 4 → 5).
 *  - SCENES.scene6.start (2589): destello de colisión carmesí/cian del
 *    corte diagonal en tijera (Scene 5 → 6), sincronizado con deep_boom.mp3.
 */

const S2 = SCENES.scene2.start; // 380 — zoom monitor
const S3 = SCENES.scene3.start; // 908 — ink dive
const S4 = SCENES.scene4.start; // 1649 — crystal wipe
const S5 = SCENES.scene5.start; // 2106 — crimson sweep
const S6 = SCENES.scene6.start; // 2589 — diagonal clash

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Escena 1 → 2: fade de tinta negra (zoom del monitor) ---
  const monitorFade = interpolate(frame, [S2 - 4, S2, S2 + 4, S2 + 8], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Escena 2 → 3: acento de tinta abisal (ink dive) ---
  const inkDive = interpolate(frame, [S3 - 5, S3 - 1, S3 + 4, S3 + 9], [0, 0.55, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Escena 3 → 4: acento carmesí del foreground wipe de cristales ---
  const crystalWipe = interpolate(frame, [S4 - 6, S4 - 2, S4 + 4, S4 + 9], [0, 0.6, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Escena 4 → 5: barrido carmesí sutil (crimson sweep) ---
  const crimsonSweep = interpolate(frame, [S5 - 5, S5 - 1, S5 + 4, S5 + 9], [0, 0.5, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepX = interpolate(frame, [S5 - 5, S5 + 9], [-400, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Escena 5 → 6: destello de colisión carmesí/cian (diagonal clash) ---
  const diagonalClash = interpolate(frame, [S6 - 1, S6 + 1, S6 + 4, S6 + 9], [0, 1, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* Fade líquido de tinta negra (zoom del monitor) */}
      {monitorFade > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, #000000 40%, #020304 78%, #020304 100%)",
            opacity: monitorFade,
          }}
        />
      ) : null}

      {/* Acento de tinta abisal (ink dive) */}
      {inkDive > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 52%, rgba(2,1,2,0.95) 0%, rgba(2,1,2,0.6) 55%, transparent 80%)",
            opacity: inkDive,
          }}
        />
      ) : null}

      {/* Acento carmesí del foreground wipe de cristales */}
      {crystalWipe > 0.004 ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 220,
              background:
                "linear-gradient(180deg, rgba(220,38,38,0.32), transparent)",
              opacity: crystalWipe,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 220,
              background:
                "linear-gradient(0deg, rgba(127,29,29,0.28), transparent)",
              opacity: crystalWipe,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Barrido carmesí sutil (crimson sweep) */}
      {crimsonSweep > 0.004 ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 500,
              left: sweepX,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.35) 45%, rgba(5,3,8,0.5) 100%)",
              opacity: crimsonSweep,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Destello de colisión carmesí/cian (diagonal clash + deep_boom) */}
      {diagonalClash > 0.004 ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "50%",
              background: "rgba(220,38,38,0.4)",
              opacity: diagonalClash,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "50%",
              background: "rgba(34,211,238,0.32)",
              opacity: diagonalClash,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.18), transparent 55%)",
              opacity: diagonalClash,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
