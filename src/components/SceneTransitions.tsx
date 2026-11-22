import React, { useEffect, useRef } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";

/**
 * SceneTransitions — Transiciones motivadas entre las 4 escenas de Jeff the Killer:
 *  - Escena 1 → 2 (frame 436): corte con interferencia / desgarro de estática VHS.
 *  - Escena 2 → 3 (frame 896): barrido rápido (whip-pan) con estela de movimiento.
 *  - Escena 3 → 4 (frame 1296): corte directo con un único golpe subgrave (deep_boom.mp3)
 *    y breve destello carmesí de 8 frames.
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
    const tearY = 46 + Math.round((frame * 17) % 92);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const g = random(frame * 79 + y * w + x);
        const v = g > 0.5 ? 236 : 16;
        const shift =
          y > tearY ? Math.round((random(frame * 5 + y * 7) - 0.5) * 18) : 0;
        const sx = (x + shift + w) % w;
        const idx = (y * w + sx) * 4;
        img.data[idx] = v;
        img.data[idx + 1] = v;
        img.data[idx + 2] = v;
        img.data[idx + 3] = g > 0.5 ? 215 : 90;
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
  const bars = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {bars.map((k) => {
        const x = interpolate(
          frame,
          [from, from + len],
          [-220 + k * 105, 1100 + k * 48],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              top: -60,
              left: x,
              width: 68 + k * 24,
              height: 2040,
              background:
                "linear-gradient(90deg, transparent, rgba(205,232,250,0.16), transparent)",
              filter: "blur(6px)",
              opacity,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(2,3,5,0.48), transparent 34%, transparent 66%, rgba(2,3,5,0.48))",
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  const cut12 = SCENES.scene2.start;
  const cut23 = SCENES.scene3.start;
  const cut34 = SCENES.scene4.start;

  // 1 → 2: Desgarro VHS (12 frames)
  const tear12 =
    frame >= cut12 - 2 && frame <= cut12 + 10
      ? interpolate(frame, [cut12 - 2, cut12, cut12 + 5, cut12 + 10], [0, 1, 0.85, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // 2 → 3: Barrido rápido whip-pan (10 frames)
  const whip23 =
    frame >= cut23 && frame <= cut23 + 10
      ? interpolate(frame, [cut23, cut23 + 4, cut23 + 8, cut23 + 10], [0, 0.9, 0.45, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // 3 → 4: Corte directo con impacto subgrave único (deep_boom.mp3)
  const cutBlack =
    frame >= cut34 - 1 && frame <= cut34 + 3
      ? interpolate(frame, [cut34 - 1, cut34, cut34 + 3], [0.95, 0.65, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const cutCrimson =
    frame >= cut34 && frame <= cut34 + 9
      ? interpolate(frame, [cut34, cut34 + 2, cut34 + 9], [0.55, 0.35, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ zIndex: 25, pointerEvents: "none" }}>
      {tear12 > 0.005 ? (
        <>
          <TearStatic opacity={tear12} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: interpolate(frame, [cut12 - 2, cut12 + 10], [880, 690], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              height: 3,
              background: "rgba(225,245,255,0.85)",
              boxShadow: "0 0 18px rgba(34,211,238,0.8)",
              opacity: tear12,
            }}
          />
        </>
      ) : null}

      {whip23 > 0.005 ? (
        <WhipStreak from={cut23} len={10} opacity={whip23} />
      ) : null}

      {cutBlack > 0.005 ? (
        <AbsoluteFill style={{ background: "#000000", opacity: cutBlack }} />
      ) : null}
      {cutCrimson > 0.005 ? (
        <AbsoluteFill style={{ background: "#7F1D1D", opacity: cutCrimson }} />
      ) : null}
    </AbsoluteFill>
  );
};
