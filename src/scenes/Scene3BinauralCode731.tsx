import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LavenderGhostRig } from "../components/stock/LavenderGhostRig";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene3BinauralCode731 (frames 1082–1512, local 0–430) — Tonos binaurales y Código 731.
 *
 * Micro-beats:
 *   - 0–225   : Espectrograma SVG animado con dos bandas (AUDIBLE / ALTA FRECUENCIA),
 *               picos binaurales L 16.4 kHz / R 16.8 kHz y lupa circular escaneando.
 *   - 225–345 : Interferencia 8-bit verde + LavenderGhostRig (glitch_731/reaching)
 *               y sello cinético "CÓDIGO 731".
 *   - 345–430 : Parche de Game Freak reescribiendo la onda agresiva "JP 1996" (verde)
 *               a la suavizada "OCCIDENTE · PARCHEADA" (violeta) con barra de escaneo.
 */

/** Muestreo determinista de una onda → path SVG. */
function samplePath(fn: (x: number) => number, step = 8, xMax = 800): string {
  let d = `M 0 ${fn(0).toFixed(1)}`;
  for (let x = step; x <= xMax; x += step) {
    d += ` L ${x} ${fn(x).toFixed(1)}`;
  }
  return d;
}

/** Bloques de interferencia 8-bit verde (deterministas). */
const GLITCH = Array.from({ length: 14 }, (_, i) => ({
  x: 40 + random(i * 31 + 7) * 760,
  y: 340 + random(i * 17 + 3) * 520,
  w: 20 + random(i * 11 + 5) * 70,
  h: 6 + random(i * 13 + 9) * 26,
}));

const Spectrogram: React.FC<{ frame: number }> = ({ frame }) => {
  const audible = (x: number) =>
    430 +
    Math.sin(x * 0.035 + frame * 0.08) * 16 +
    Math.sin(x * 0.012 - frame * 0.05) * 8;

  const high = (x: number) =>
    150 +
    Math.sin(x * 0.09 + frame * 0.1) * 9 +
    Math.sin(x * 0.21 + frame * 0.05) * 5;

  const audibleD = samplePath(audible);
  const highD = samplePath(high);

  // Picos binaurales marcados y pulsantes.
  const lPeak = 250;
  const rPeak = 550;
  const peakH = 42 + Math.sin(frame * 0.13) * 10;

  // Lupa circular analítica escaneando el pico.
  const scanX = 400 + 320 * Math.sin(frame * 0.04);

  const gridY = [90, 150, 210, 300, 390, 430, 470];

  return (
    <svg viewBox="0 0 800 540" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="s3-spec-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0C0A1E" />
          <stop offset="100%" stopColor="#060510" />
        </linearGradient>
        <linearGradient id="s3-aud-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="540" rx="16" fill="url(#s3-spec-bg)" stroke="#1B1536" strokeWidth="2" />

      {/* Rejilla de frecuencias */}
      {gridY.map((y) => (
        <line key={y} x1="20" y1={y} x2="780" y2={y} stroke="#241B3A" strokeWidth="1" strokeDasharray="4 6" />
      ))}

      {/* Etiquetas de frecuencia */}
      <text x="28" y="98" fontFamily={FONT_MONO} fontSize="13" fill="rgba(167,139,250,0.7)">16 kHz</text>
      <text x="28" y="480" fontFamily={FONT_MONO} fontSize="13" fill="rgba(148,163,184,0.7)">20 Hz</text>

      {/* Banda AUDIBLE (ADULTOS) */}
      <text x="40" y="360" fontFamily={FONT_SANS} fontSize="17" fontWeight={700} letterSpacing="2" fill="#67E8F9">
        AUDIBLE (ADULTOS)
      </text>
      <path d={`${audibleD} L 800 540 L 0 540 Z`} fill="url(#s3-aud-fill)" />
      <path d={audibleD} fill="none" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={audibleD} fill="none" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" transform="translate(0,6)" />

      {/* Banda ALTA FRECUENCIA (7–12 AÑOS) */}
      <text x="40" y="44" fontFamily={FONT_SANS} fontSize="17" fontWeight={700} letterSpacing="2" fill="#A78BFA">
        ALTA FRECUENCIA (7–12 AÑOS)
      </text>
      <path d={highD} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.6))" }} />

      {/* Picos binaurales L / R */}
      {[
        { x: lPeak, label: "L 16.4 kHz" },
        { x: rPeak, label: "R 16.8 kHz" },
      ].map((p) => (
        <g key={p.label}>
          <line x1={p.x} y1={150} x2={p.x} y2={150 - peakH} stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.9))" }} />
          <circle cx={p.x} cy={150 - peakH - 3} r="4" fill="#EDE9FE" />
          <text x={p.x} y={150 - peakH - 16} textAnchor="middle" fontFamily={FONT_MONO} fontSize="13" fill="#C4B5FD">
            {p.label}
          </text>
        </g>
      ))}

      {/* Lupa circular analítica */}
      <g transform={`translate(${scanX}, 150)`}>
        <circle cx="0" cy="0" r="56" fill="rgba(167,139,250,0.06)" stroke="#A78BFA" strokeWidth="3" />
        <circle cx="0" cy="0" r="46" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="1" strokeDasharray="3 5" />
        {/* Pico ampliado dentro de la lupa */}
        <path
          d="M -40 18 L -24 18 L -18 -6 L -12 30 L -6 -14 L 0 34 L 6 -10 L 12 26 L 18 -2 L 24 18 L 40 18"
          fill="none"
          stroke="#EDE9FE"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="-56" y1="0" x2="-40" y2="0" stroke="#A78BFA" strokeWidth="1.5" />
        <line x1="40" y1="0" x2="56" y2="0" stroke="#A78BFA" strokeWidth="1.5" />
        <line x1="0" y1="-56" x2="0" y2="-40" stroke="#A78BFA" strokeWidth="1.5" />
        <line x1="0" y1="40" x2="0" y2="56" stroke="#A78BFA" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

const PatchPanel: React.FC<{ frame: number; scanX: number }> = ({ frame, scanX }) => {
  const aggressive = (x: number) =>
    160 +
    Math.sin(x * 0.45 + frame * 0.18) * 16 +
    Math.sin(x * 0.13 - frame * 0.08) * 22;

  const smooth = (x: number) => 160 + Math.sin(x * 0.05 + frame * 0.03) * 26;

  const aggressiveD = samplePath(aggressive, 8, 800);
  const smoothD = samplePath(smooth, 8, 800);

  return (
    <svg viewBox="0 0 800 320" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="s3-patch-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0C0A1E" />
          <stop offset="100%" stopColor="#060510" />
        </linearGradient>
        <clipPath id="s3-patch-clip">
          <rect x="0" y="0" width={scanX} height="320" />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="800" height="320" rx="16" fill="url(#s3-patch-bg)" stroke="#1B1536" strokeWidth="2" />
      <line x1="20" y1="160" x2="780" y2="160" stroke="#241B3A" strokeWidth="1" strokeDasharray="4 6" />

      {/* Etiquetas */}
      <text x="40" y="42" fontFamily={FONT_SANS} fontSize="17" fontWeight={700} letterSpacing="2" fill="#A78BFA">
        OCCIDENTE · PARCHEADA
      </text>
      <text x="760" y="42" textAnchor="end" fontFamily={FONT_SANS} fontSize="17" fontWeight={700} letterSpacing="2" fill="#84CC16">
        JP 1996
      </text>

      {/* Onda agresiva verde (original, lado derecho de la barra) */}
      <path d={aggressiveD} fill="none" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(132,204,22,0.55))" }} />

      {/* Onda suavizada violeta (parcheada, revelada a la izquierda de la barra) */}
      <path
        d={smoothD}
        fill="none"
        stroke="#A78BFA"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath="url(#s3-patch-clip)"
        style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.55))" }}
      />

      {/* Barra de escaneo vertical */}
      <line x1={scanX} y1="0" x2={scanX} y2="320" stroke="#F2EFE9" strokeWidth="3" style={{ filter: "drop-shadow(0 0 10px rgba(242,239,233,0.8))" }} />
      <rect x={scanX - 2} y="0" width="5" height="320" fill="rgba(242,239,233,0.18)" />
    </svg>
  );
};

export const Scene3BinauralCode731: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Curvas de opacidad por micro-beat.
  const specOut = interpolate(frame, [225, 258], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitchIn = interpolate(frame, [225, 252], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitchOut = interpolate(frame, [345, 376], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const patchIn = interpolate(frame, [345, 372], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transición interna de fondo bg_s3 → bg_s4.
  const bg3 = interpolate(frame, [225, 285], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bg4 = interpolate(frame, [225, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ghostIntensity = interpolate(frame, [232, 300], [0.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stamp = spring({
    frame: frame - 245,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const stampScale = Math.min(1, stamp);
  const stampOpacity = interpolate(frame, [245, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Barra de escaneo del parche (345–430).
  const scanX = interpolate(frame, [345, 430], [0, 800], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgDriftX = Math.sin(frame * 0.006) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Fondos con transición interna */}
      <AbsoluteFill style={{ opacity: bg3 }}>
        <Img
          src={staticFile("backgrounds/bg_s3.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${bgDriftX}px, 0px) scale(1.05)` }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: bg4 }}>
        <Img
          src={staticFile("backgrounds/bg_s4.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${-bgDriftX}px, 0px) scale(1.05)` }}
        />
      </AbsoluteFill>

      {/* Espectrograma (0–225) */}
      <div style={{ position: "absolute", left: 113, top: 355, width: 854, height: 576, opacity: specOut }}>
        <Spectrogram frame={frame} />
      </div>

      {/* Interferencia 8-bit verde + entidad + sello (225–345) */}
      <AbsoluteFill style={{ opacity: glitchIn * glitchOut }}>
        {/* Vacío digital con rejilla verde */}
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(132,204,22,0.10) 0 2px, transparent 2px 26px), repeating-linear-gradient(to right, rgba(132,204,22,0.08) 0 2px, transparent 2px 26px), radial-gradient(ellipse at center, #07120A 0%, #03060A 70%)",
          }}
        />
        {/* Bloques de interferencia */}
        {GLITCH.map((g, i) => {
          const gx = g.x + (random(Math.floor(frame / 4) * 13 + i * 7) - 0.5) * 60;
          const flick = random(Math.floor(frame / 6) * 29 + i * 3);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: g.y,
                left: gx,
                width: g.w,
                height: g.h,
                background: "#84CC16",
                opacity: 0.16 + flick * 0.3,
                boxShadow: "0 0 10px rgba(132,204,22,0.5)",
              }}
            />
          );
        })}

        {/* Entidad emergiendo en el vacío digital */}
        <div style={{ position: "absolute", left: 270, top: 420, width: 540, height: 783 }}>
          <LavenderGhostRig
            mode="glitch_731"
            pose="reaching"
            intensity={ghostIntensity}
            idPrefix="s3-ghost"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Sello cinético CÓDIGO 731 */}
        <SafeCentered top={413} zIndex={8}>
          <div style={{ opacity: stampOpacity, transform: `scale(${stampScale})` }}>
            <div
              style={{
                display: "inline-block",
                fontFamily: FONT_MONO,
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: 10,
                color: "#84CC16",
                border: "3px solid #84CC16",
                padding: "14px 40px",
                background: "rgba(4,5,7,0.72)",
                boxShadow: "0 0 46px rgba(132,204,22,0.4)",
                textShadow: "0 0 18px rgba(132,204,22,0.6)",
              }}
            >
              CÓDIGO 731
            </div>
          </div>
        </SafeCentered>
      </AbsoluteFill>

      {/* Parche de Game Freak (345–430) */}
      <div style={{ position: "absolute", left: 113, top: 520, width: 854, height: 342, opacity: patchIn }}>
        <PatchPanel frame={frame} scanX={scanX} />
      </div>

      {/* Viñeta */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
