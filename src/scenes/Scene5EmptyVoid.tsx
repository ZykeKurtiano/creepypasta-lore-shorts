import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { HumanBase } from "../components/stock/HumanBase";
import { LavenderGhostRig } from "../components/stock/LavenderGhostRig";
import { FONT_MONO, SafeCentered } from "../components/SafeZone";

/**
 * Scene5EmptyVoid (frames 1919–2145, local 0–226) — El Vacío Después de Apagar
 * la Consola.
 *
 * Habitación nocturna silenciosa: niño sentado en la cama con mirada perdida
 * (hollow_stare), una Game Boy apagada sobre la mesa de noche con LED que se
 * apaga, ondas tenues de piano flotando y el espectro insinuándose detrás como
 * metáfora de la melancolía silenciosa. Cierre con Macro-Zoom cinematográfico
 * (1.0x → 2.4x) hacia el rostro y la mirada perdida.
 */

const OUTLINE = "#090A12";

/** Ondas de piano translúcidas flotando por el cuarto (deterministas). */
const PIANO_WAVES = Array.from({ length: 5 }, (_, i) => ({
  y: 460 + random(i * 19 + 4) * 560,
  amp: 16 + random(i * 13 + 2) * 26,
  phase: random(i * 31 + 7) * 6,
  speed: 0.4 + random(i * 11 + 3) * 0.5,
  len: 340 + random(i * 17 + 1) * 420,
  op: 0.2 + random(i * 23 + 5) * 0.2,
}));

/** Game Boy apagada sobre la mesa de noche, LED apagándose (0–65). */
const OffGameBoy: React.FC<{ frame: number }> = ({ frame }) => {
  const led = interpolate(frame, [0, 65], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const smoke = interpolate(frame, [12, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "relative", width: 170, height: 255 }}>
      {/* Fino rastro de humo/silencio azulado */}
      {smoke > 0.01 &&
        [0, 1, 2].map((i) => {
          const rise = ((frame * (0.5 + i * 0.18) + i * 40) % 90) / 90;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 82 + Math.sin(frame * 0.04 + i * 1.7) * (8 + i * 6),
                bottom: 6 + rise * 70,
                width: 8 + i * 4,
                height: 26 + i * 10,
                background:
                  "linear-gradient(180deg, rgba(129,140,248,0.16), rgba(129,140,248,0))",
                borderRadius: "50%",
                filter: "blur(4px)",
                opacity: smoke * (1 - rise) * 0.8,
              }}
            />
          );
        })}

      <svg
        viewBox="0 0 320 480"
        width={170}
        height={255}
        style={{ overflow: "visible", opacity: 0.94 }}
      >
        {/* Carcasa oscura */}
        <rect x="10" y="10" width="300" height="460" rx="36" fill="#151A26" stroke={OUTLINE} strokeWidth="5" />
        <rect x="26" y="26" width="268" height="428" rx="28" fill="none" stroke="#2B3344" strokeWidth="2" opacity="0.6" />
        {/* LED de encendido apagándose */}
        <circle cx="58" cy="34" r="6" fill="#DC2626" opacity={led * 0.95} />
        <circle cx="58" cy="34" r="11" fill="#DC2626" opacity={led * 0.28} />
        {/* Bisel y pantalla apagada */}
        <rect x="40" y="48" width="240" height="210" rx="16" fill="#0C0F17" stroke={OUTLINE} strokeWidth="4" />
        <rect x="52" y="60" width="216" height="186" rx="6" fill="#05070B" stroke="#0A0C14" strokeWidth="3" />
        {/* Reflejo apagado sutil */}
        <rect x="52" y="60" width="216" height="186" rx="6" fill="rgba(129,140,248,0.04)" />
        {/* Cruceta */}
        <g fill="#202634" stroke="#0C0D12" strokeWidth="2">
          <rect x="78" y="318" width="24" height="84" rx="6" />
          <rect x="48" y="336" width="84" height="48" rx="6" />
        </g>
        {/* Botones A / B apagados */}
        <circle cx="216" cy="316" r="22" fill="#3A2030" stroke="#0C0D12" strokeWidth="3" />
        <circle cx="250" cy="372" r="22" fill="#3A2030" stroke="#0C0D12" strokeWidth="3" />
      </svg>
    </div>
  );
};

/** Ondas de piano translúcidas (SVG). */
const PianoWavesLayer: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, opacity: 0.32, pointerEvents: "none" }}
    >
      {PIANO_WAVES.map((w, i) => {
        let path = `M 0 ${w.y}`;
        const steps = 26;
        for (let s = 1; s <= steps; s++) {
          const x = (s / steps) * 1080;
          const yy =
            w.y +
            Math.sin((s / steps) * w.len * 0.02 + frame * 0.02 + w.phase) * w.amp *
              (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + i)));
          path += ` L ${x.toFixed(1)} ${yy.toFixed(1)}`;
        }
        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={i % 2 === 0 ? "#A78BFA" : "#818CF8"}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={w.op}
          />
        );
      })}
    </svg>
  );
};

export const Scene5EmptyVoid: React.FC = () => {
  const frame = useCurrentFrame();

  // Macro-Zoom cinematográfico (75–226) hacia el rostro y mirada perdida.
  const macro = interpolate(frame, [75, 226], [1, 2.4], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // El espectro se insinúa suavemente detrás (opacity 0.15 → 0.45).
  const ghostOpacity = interpolate(frame, [20, 90], [0.15, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Oscurecimiento progresivo mientras la pantalla queda apagada.
  const dim = interpolate(frame, [0, 60], [0.1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgDriftX = Math.sin(frame * 0.005) * 7;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Contenedor con Macro-Zoom dirigido al rostro (y ≈ 520–850) */}
      <AbsoluteFill
        style={{
          transform: `scale(${macro})`,
          transformOrigin: "540px 720px",
        }}
      >
        {/* Fondo vectorial + parallax */}
        <AbsoluteFill style={{ transform: `translate(${bgDriftX}px, 0px) scale(1.06)` }}>
          <Img
            src={staticFile("backgrounds/bg_s5.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>

        {/* Oscurecimiento nocturno */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 42%, rgba(4,5,7,${dim * 0.4}) 0%, rgba(4,5,7,${dim}) 100%)`,
          }}
        />

        {/* Espectro insinuándose detrás (melancolía silenciosa) */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 420,
            width: 480,
            height: 696,
            opacity: ghostOpacity,
            pointerEvents: "none",
          }}
        >
          <LavenderGhostRig
            mode="spectral"
            pose="whispering"
            intensity={0.45}
            idPrefix="s5-ghost"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Ondas tenues de piano flotando */}
        <PianoWavesLayer frame={frame} />

        {/* Niño sentado en la cama con mirada perdida */}
        <div style={{ position: "absolute", left: 270, top: 520, width: 540, height: 960 }}>
          <HumanBase
            variant="kid_96"
            pose="sitting_bed"
            emotion="hollow_stare"
            headphones
            facing="right"
            rimColor="#818CF8"
            rimIntensity={0.6}
            showShadow={false}
            eyeLookY={-1.5}
            idPrefix="s5-kid"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Game Boy apagada sobre la mesa de noche */}
        <div style={{ position: "absolute", left: 780, top: 880, width: 170, height: 255 }}>
          <OffGameBoy frame={frame} />
        </div>

        {/* Viñeta */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse at center, transparent 52%, rgba(2,3,5,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* Etiqueta diegética fija fuera del Macro-Zoom (zona segura, top: 360) */}
      <SafeCentered top={360} zIndex={7}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 18,
            letterSpacing: 5,
            color: "rgba(242,239,233,0.45)",
            opacity: interpolate(frame, [0, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          — CONSOLA APAGADA —
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
