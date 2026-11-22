import React, { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { flashEnvelope } from "./Camera25D";

/**
 * SceneTransitions — Transiciones dinámicas entre escenas (frames globales):
 *  - frame 138 y 260: estallido de flash de cámara vintage + postimagen fría
 *    con división cromática.
 *  - frame 489: desgarro de tracking VHS + ráfaga de estática (12 frames).
 *  - frame 846: barrido horizontal whip-pan (streak de motion blur, 10 frames;
 *    el deslizamiento translateX real lo aplica MainComposition).
 *  - frame 1113: whip-pan + interferencia VHS (12 frames).
 *  - frame 1347: apagón duro / destello carmesí hacia el close-up final.
 */

const TearStatic: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const w = 96;
    const h = 160;
    const img = ctx.createImageData(w, h);
    const tearY = 50 + Math.round((frame * 13) % 90);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const g = random(frame * 77 + y * w + x);
        const v = g > 0.5 ? 235 : 18;
        const shift =
          y > tearY ? Math.round((random(frame * 3 + y * 5) - 0.5) * 16) : 0;
        const sx = (x + shift + w) % w;
        const idx = (y * w + sx) * 4;
        img.data[idx] = v;
        img.data[idx + 1] = v;
        img.data[idx + 2] = v;
        img.data[idx + 3] = g > 0.5 ? 210 : 95;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);

  return (
    <canvas
      ref={ref}
      width={96}
      height={160}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
        opacity,
        mixBlendMode: "screen",
      }}
    />
  );
};

const WhipStreak: React.FC<{ from: number; len: number; opacity: number }> = ({
  from,
  len,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {bars.map((k) => {
        const x = interpolate(
          frame,
          [from, from + len],
          [-240 + k * 96, 1080 + k * 46],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              top: -60,
              left: x,
              width: 66 + k * 26,
              height: 2040,
              background:
                "linear-gradient(90deg, transparent, rgba(214,238,255,0.16), transparent)",
              filter: "blur(6px)",
              opacity,
            }}
          />
        );
      })}
      {/* Borde luminoso del barrido */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: interpolate(frame, [from, from + len], [-60, 1120], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          width: 5,
          height: 1920,
          background:
            "linear-gradient(180deg, transparent, rgba(240,248,255,0.9), transparent)",
          filter: "blur(1px)",
          opacity: opacity * 0.9,
        }}
      />
      {/* Oscurecimiento direccional */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(2,3,5,0.5), transparent 35%, transparent 65%, rgba(2,3,5,0.5))",
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Destellos de cámara dentro de la escena 1 ---
  const flash1 = flashEnvelope(frame, 138, 24, 1);
  const flash1After =
    frame >= 144 && frame <= 185
      ? interpolate(frame, [144, 185], [0.26, 0])
      : 0;
  const flash2 = flashEnvelope(frame, 260, 17, 0.6);
  const flash2After =
    frame >= 266 && frame <= 296
      ? interpolate(frame, [266, 296], [0.16, 0])
      : 0;
  const coldAfter = Math.max(flash1After, flash2After);

  // --- Desgarro VHS (Scene 1 → 2) ---
  const tear489 = interpolate(frame, [487, 489, 495, 497], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Whip-pan (Scene 2 → 3) ---
  const whip846 = interpolate(frame, [846, 850, 854, 856], [0, 0.95, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Whip-pan + glitch (Scene 3 → 4) ---
  const whip1113 = interpolate(
    frame,
    [1113, 1117, 1121, 1125],
    [0, 0.9, 0.55, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const tear1113 = interpolate(frame, [1111, 1113, 1119, 1121], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Apagón duro / destello carmesí (Scene 4 → 5) ---
  // (Guardas de rango explícitas: extrapolateLeft clamp filtraría estos
  // valores sobre TODOS los frames anteriores.)
  const black =
    frame >= 1346 && frame <= 1352
      ? interpolate(frame, [1346, 1348, 1352], [1, 0.7, 0])
      : 0;
  const whiteSnap =
    frame >= 1347 && frame <= 1349
      ? interpolate(frame, [1347, 1348, 1349], [0.75, 1, 0])
      : 0;
  const crimson =
    frame >= 1348 && frame <= 1355
      ? interpolate(frame, [1348, 1351, 1355], [0.85, 0.4, 0])
      : 0;

  const flashTotal = Math.max(flash1, flash2) + flash1After * 0.5;

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* Flash cámara 1 (smile.jpg) */}
      {flash1 > 0.004 ? (
        <AbsoluteFill style={{ background: "#F7FAFD", opacity: flash1 }} />
      ) : null}
      {/* Flash cámara 2 (flash) */}
      {flash2 > 0.004 ? (
        <AbsoluteFill style={{ background: "#EDF2F8", opacity: flash2 }} />
      ) : null}
      {/* Postimagen fría + división cromática */}
      {coldAfter > 0.004 ? (
        <AbsoluteFill>
          <AbsoluteFill
            style={{ background: "#B9D4EC", opacity: coldAfter }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 44,
              background: "rgba(34,211,238,0.5)",
              opacity: coldAfter,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 44,
              background: "rgba(244,63,94,0.5)",
              opacity: coldAfter,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Desgarro VHS 489 */}
      {tear489 > 0.004 ? <TearStatic opacity={tear489} /> : null}
      {tear489 > 0.004 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: interpolate(frame, [489, 501], [820, 700], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 3,
            background: "rgba(230,244,255,0.8)",
            boxShadow: "0 0 18px rgba(34,211,238,0.8)",
            opacity: tear489,
          }}
        />
      ) : null}

      {/* Whip-pan 846 */}
      {whip846 > 0.004 ? (
        <WhipStreak from={846} len={10} opacity={whip846} />
      ) : null}

      {/* Whip-pan + glitch 1113 */}
      {whip1113 > 0.004 ? (
        <WhipStreak from={1113} len={12} opacity={whip1113} />
      ) : null}
      {tear1113 > 0.004 ? <TearStatic opacity={tear1113 * 0.9} /> : null}

      {/* Apagón duro + destello carmesí 1347 */}
      {black > 0.004 ? (
        <AbsoluteFill style={{ background: "#000000", opacity: black }} />
      ) : null}
      {whiteSnap > 0.004 ? (
        <AbsoluteFill
          style={{ background: "#FFFFFF", opacity: whiteSnap }}
        />
      ) : null}
      {crimson > 0.004 ? (
        <AbsoluteFill style={{ background: "#7F1D1D", opacity: crimson }} />
      ) : null}

      {/* División cromática global en picos de tensión (flash 1) */}
      {flashTotal > 0.02 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: interpolate(flashTotal, [0, 1], [0, 34], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              background: "rgba(34,211,238,0.35)",
              opacity: Math.min(1, flashTotal),
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: interpolate(flashTotal, [0, 1], [0, 34], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              background: "rgba(244,63,94,0.35)",
              opacity: Math.min(1, flashTotal),
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
