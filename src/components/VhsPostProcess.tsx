import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

/**
 * VhsPostProcess.tsx — Post-procesado analógico VHS determinista:
 * grano animado (sin Math.random), scanlines CRT, viñeta pesada,
 * barras de tracking + aberración cromática en picos de tensión
 * y HUD diegético mínimo (● REC, timecode, SP // TAPE-09) en zona segura.
 */

const SPIKE_WINDOWS: Array<[number, number]> = [
  // Transiciones de acto
  [150, 164],
  [848, 864],
  [1378, 1396],
  // Picos de tensión
  [124, 144],
  [1404, 1432],
  [1460, 1492],
];

/** Intensidad de glitch 0..1 para el frame dado (usada también por la composición) */
export const getGlitchIntensity = (frame: number): number => {
  let g = 0;
  for (const [from, to] of SPIKE_WINDOWS) {
    if (frame >= from && frame <= to) {
      const edge = Math.min(frame - from, to - frame);
      const env = interpolate(edge, [0, 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      g = Math.max(g, env);
    }
  }
  return g;
};

const pad = (n: number) => String(n).padStart(2, "0");

const GRAIN_COUNT = 200;

export const VhsPostProcess: React.FC = () => {
  const frame = useCurrentFrame();
  const g = getGlitchIntensity(frame);

  // Grano determinista: cambia cada frame pero está sembrado por el frame
  const grains = Array.from({ length: GRAIN_COUNT }, (_, i) => {
    const seed = frame * 1009 + i * 977;
    return {
      x: random(seed) * 1080,
      y: random(seed + 61) * 1920,
      s: random(seed + 131) * 1.7 + 0.6,
      dark: random(seed + 211) > 0.5,
      o: 0.05 + random(seed + 311) * 0.1,
    };
  });

  // Barras de tracking (saltan cada 3-4 frames)
  const barSeed = Math.floor(frame / 3);
  const barY = 420 + random(barSeed * 7 + 1) * 1100;
  const barH = 18 + random(barSeed * 13 + 5) * 46;
  const barX = (random(barSeed * 17 + 9) - 0.5) * 70 * g;

  const ss = Math.floor(frame / 30);
  const ff = frame % 30;
  const recOpacity = 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.11));
  const hudGlitch = g > 0.05 ? 0.65 + 0.35 * Math.sin(frame * 2.3) : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Grano de cinta */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.85 }}>
        {grains.map((gr, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: gr.x,
              top: gr.y,
              width: gr.s,
              height: gr.s,
              borderRadius: "50%",
              background: gr.dark ? "#000" : "#FFF",
              opacity: gr.o,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Scanlines CRT estrictamente horizontales */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 2px, transparent 2px, transparent 5px)",
          backgroundPositionY: `${frame % 5}px`,
        }}
      />

      {/* Banda de roll CRT que recorre el lienzo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ((frame * 1.4) % 2200) - 200,
          height: 170,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(242,239,233,0.035) 45%, rgba(242,239,233,0.07) 50%, rgba(242,239,233,0.035) 55%, transparent 100%)",
        }}
      />

      {/* Capa de glitch de transición / tensión */}
      {g > 0.02 ? (
        <AbsoluteFill>
          {/* Destello de ruido (filas horizontales, sin pinstripe vertical) */}
          <AbsoluteFill
            style={{
              opacity: 0.16 * g,
              background:
                "repeating-linear-gradient(to bottom, rgba(242,239,233,0.5) 0px, rgba(242,239,233,0.5) 2px, rgba(4,5,7,0.6) 2px, rgba(4,5,7,0.6) 4px)",
            }}
          />
          {/* Barra de tracking con bordes RGB */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: barY,
              height: barH,
              opacity: g,
              transform: `translateX(${barX.toFixed(1)}px)`,
              mixBlendMode: "screen",
              background:
                "linear-gradient(90deg, rgba(220,38,38,0.3), rgba(242,239,233,0.18), rgba(34,211,238,0.3))",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: barY - 2,
              height: 1,
              opacity: 0.7 * g,
              background: "rgba(242,239,233,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: barY + barH + 1,
              height: 1,
              opacity: 0.7 * g,
              background: "rgba(242,239,233,0.5)",
            }}
          />
          {/* Aberración cromática en bordes del lienzo */}
          <AbsoluteFill
            style={{
              boxShadow: `inset ${Math.round(10 * g)}px 0 0 rgba(220,38,38,${
                0.25 * g
              }), inset ${-Math.round(10 * g)}px 0 0 rgba(34,211,238,${
                0.25 * g
              })`,
            }}
          />
          {/* Parpadeo de tracking general */}
          <AbsoluteFill
            style={{
              background: "#000",
              opacity: 0.22 * g * Math.abs(Math.sin(frame * 0.7)),
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Viñeta pesada en bordes */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 46%, transparent 42%, rgba(4,5,7,0.5) 72%, rgba(2,3,4,0.94) 100%)",
        }}
      />

      {/* HUD diegético VHS dentro de la zona segura (top:300, left:68, derecha < 905) */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 68,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: "'Consolas', 'Courier New', monospace",
          color: "rgba(242,239,233,0.78)",
          fontSize: 21,
          letterSpacing: "0.12em",
          textShadow: "0 1px 3px rgba(4,5,7,0.9)",
          opacity: hudGlitch,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#DC2626",
              opacity: recOpacity,
              boxShadow: "0 0 9px rgba(220,38,38,0.85)",
            }}
          />
          REC
        </span>
        <span style={{ opacity: 0.85 }}>
          00:00:{pad(ss)}:{pad(ff)}
        </span>
        <span style={{ opacity: 0.6 }}>SP // TAPE-09</span>
      </div>
    </AbsoluteFill>
  );
};
