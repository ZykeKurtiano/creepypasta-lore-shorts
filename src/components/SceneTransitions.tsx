import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";

/**
 * SceneTransitions — Transiciones espaciales globales entre las 4 escenas
 * de Zalgo (frames globales). Sutiles y limpias, sin tapar las transiciones
 * espaciales propias de cada escena:
 *  - SCENES.scene2.start (621): leve transición oscura líquida del camera
 *    dive (fade limpio de tinta negra, 618..628).
 *  - SCENES.scene3.start (1080): sutil acento carmesí acompañando el
 *    foreground wipe de la garra (1074..1088).
 *  - SCENES.scene4.start (1427): destello de colisión carmesí/cian de 8
 *    frames (1426..1435) sincronizado con deep_boom.mp3.
 */

const S2 = SCENES.scene2.start; // 621
const S3 = SCENES.scene3.start; // 1080
const S4 = SCENES.scene4.start; // 1427

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Escena 1 → 2: fade de tinta negra (618..628) ---
  const inkFade = interpolate(frame, [S2 - 3, S2 + 1, S2 + 5, S2 + 7], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Escena 2 → 3: acento carmesí sutil (1074..1088) ---
  const crimsonAccent = interpolate(
    frame,
    [S3 - 6, S3 - 2, S3 + 4, S3 + 8],
    [0, 0.5, 0.35, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // --- Escena 3 → 4: destello de colisión carmesí/cian (1426..1435) ---
  const collision = interpolate(
    frame,
    [S4 - 1, S4 + 1, S4 + 4, S4 + 8],
    [0, 1, 0.55, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* Fade líquido de tinta negra (camera dive) */}
      {inkFade > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, #000000 40%, #020304 78%, #020304 100%)",
            opacity: inkFade,
          }}
        />
      ) : null}

      {/* Acento carmesí (foreground wipe de la garra) */}
      {crimsonAccent > 0.004 ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 220,
              background:
                "linear-gradient(180deg, rgba(220,38,38,0.35), transparent)",
              opacity: crimsonAccent,
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
                "linear-gradient(0deg, rgba(127,29,29,0.3), transparent)",
              opacity: crimsonAccent,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Destello de colisión carmesí/cian (deep_boom) */}
      {collision > 0.004 ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "50%",
              background: "rgba(220,38,38,0.4)",
              opacity: collision,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "50%",
              background: "rgba(34,211,238,0.35)",
              opacity: collision,
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
                "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.2), transparent 55%)",
              opacity: collision,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
