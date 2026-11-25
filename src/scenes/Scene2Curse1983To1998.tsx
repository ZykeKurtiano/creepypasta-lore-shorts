import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { GamerCharacter } from "../components/characters/GamerCharacter";
import { TailsDollCharacter } from "../components/characters/TailsDollCharacter";
import { FONT_MONO } from "../components/SafeZone";
import { CamKey, cameraAt, cameraTransform } from "./camera";

/**
 * Scene2Curse1983To1998 (frames locales 0–783 · 26.10s).
 *
 * La leyenda: la marca "TD" en escenas del crimen (1983) y la tragedia de
 * 1998 frente al televisor (Sonic R al 100%).
 *
 *  - Fase A (0–255): paneles dinámicos divididos (1983), callejón lluvioso,
 *    cinta policial, destellos de patrulla y la marca sangrienta "TD"
 *    trazada con goteo volumétrico.
 *  - Fase B (255–615): sala oscura de 1998, CRT con menú congelado "100%"
 *    en glitch, reflejo de Tails Doll sobre el cristal, jugador paralizado
 *    (slumped_crt) y notas/ondas sonoras de "Can You Feel the Sunshine".
 *  - Fase C (615–765): Macro-Zoom 2.8x al rostro en pánico.
 *  - Transición (765–783): Pupil-Dive Zoom exponencial a la pupila negra.
 */

// --- Cámara -----------------------------------------------------------------

const CAM_KEYS: CamKey[] = [
  { f: 0, s: 1.12, x: 540, y: 920 },
  { f: 120, s: 1.22, x: 470, y: 990 },
  { f: 250, s: 1.5, x: 500, y: 900, e: Easing.in(Easing.cubic) },
  { f: 285, s: 1.3, x: 540, y: 880 },
  { f: 615, s: 1.5, x: 540, y: 800 },
  { f: 765, s: 2.85, x: 540, y: 528 },
  { f: 783, s: 13.0, x: 520, y: 529, e: Easing.exp },
];

// --- Partículas / elementos deterministas -----------------------------------

const RAIN = Array.from({ length: 34 }, (_, i) => ({
  x: 60 + random(i * 5 + 1) * 960,
  y0: random(i * 9 + 2) * 1900,
  len: 26 + random(i * 3 + 3) * 40,
  speed: 8 + random(i * 7 + 4) * 12,
  wobble: random(i * 11 + 5) * 6.28,
}));

const DROPS = Array.from({ length: 10 }, (_, i) => ({
  x: 380 + random(i * 13 + 2) * 320,
  y: 1380 + random(i * 17 + 6) * 220,
  len: 20 + random(i * 5 + 3) * 34,
  phase: random(i * 7 + 1) * 6.28,
}));

const NOTES = Array.from({ length: 9 }, (_, i) => ({
  dx: (i - 4) * 96,
  delay: i * 9,
  big: i % 3 === 0,
}));

// --- Subcomponentes ---------------------------------------------------------

/** Nota musical vectorial (corchea). */
const MusicNote: React.FC<{
  color: string;
  opacity: number;
  scale: number;
  x: number;
  y: number;
}> = ({ color, opacity, scale, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity }}>
    <svg viewBox="0 0 40 64" width={40 * scale} height={64 * scale} style={{ overflow: "visible" }}>
      <ellipse cx="12" cy="52" rx="10" ry="7" fill={color} transform="rotate(-18 12 52)" />
      <rect x="19" y="6" width="5" height="46" fill={color} />
      <path d="M 24 6 C 36 8, 40 14, 40 24 C 40 16, 36 10, 24 8 Z" fill={color} />
    </svg>
  </div>
);

export const Scene2Curse1983To1998: React.FC = () => {
  const frame = useCurrentFrame();

  const cam = cameraAt(frame, CAM_KEYS);
  const swayX = Math.sin(frame * 0.008) * 3 + Math.sin(frame * 0.0037 + 1.3) * 2;
  const swayY = Math.cos(frame * 0.006) * 2.4 + Math.sin(frame * 0.0041 + 0.8) * 1.6;

  // Rubí de entrada (proviene del Gem-Dive de la Escena 1).
  const rubyIn = interpolate(frame, [0, 18], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Crossfade 1983 → 1998 (zoom-through al CRT).
  const phase1983 = interpolate(frame, [250, 285], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phase1998 = interpolate(frame, [250, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Trazado progresivo de la marca "TD".
  const tdProgress = interpolate(frame, [140, 245], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Destellos de patrulla rojo/azul (suaves, alternados).
  const redPulse = Math.max(0, Math.sin(frame * 0.35));
  const bluePulse = Math.max(0, Math.sin(frame * 0.35 + Math.PI));

  // Notas musicales de "Can You Feel the Sunshine" (490–615).
  const musicOpacity = interpolate(frame, [490, 520, 590, 615], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch del "100%" en el menú congelado.
  const glitchX = (random(Math.floor(frame / 3) + 7) - 0.5) * 12;
  const glitchY = (random(Math.floor(frame / 3) + 23) - 0.5) * 10;

  // Pupil-Dive: túnel de rejilla cian/negro.
  const dive = interpolate(frame, [765, 783], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: cameraTransform(cam, swayX, swayY),
          transformOrigin: "0 0",
        }}
      >
        {/* ===================== FASE A · 1983 (paneles) ===================== */}
        <div style={{ position: "absolute", inset: 0, opacity: phase1983 }}>
          {/* Fondo del callejón */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, #04060A 0%, #0A1014 45%, #10171E 78%, #05070A 100%)",
            }}
          />
          {/* Callejón (panel superior/izquierdo) */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1020 }}>
            {/* Perspectiva de callejón */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(6,8,12,0.0) 0%, rgba(12,18,26,0.85) 100%)",
              }}
            />
            {/* Paredes en fuga */}
            <div
              style={{
                position: "absolute",
                top: 240,
                left: -40,
                width: 420,
                height: 780,
                background: "linear-gradient(160deg, #0B1116, #06080C)",
                transform: "skewY(-8deg)",
                borderRight: "1px solid rgba(140,170,200,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 240,
                right: -40,
                width: 420,
                height: 780,
                background: "linear-gradient(200deg, #0B1116, #06080C)",
                transform: "skewY(8deg)",
                borderLeft: "1px solid rgba(140,170,200,0.06)",
              }}
            />
            {/* Farola lejana */}
            <div
              style={{
                position: "absolute",
                top: 420,
                left: 500,
                width: 90,
                height: 90,
                borderRadius: 45,
                background: "radial-gradient(circle, rgba(240,190,110,0.5), transparent 70%)",
              }}
            />
            {/* Silueta espectral difusa */}
            <div
              style={{
                position: "absolute",
                top: 470,
                left: 430,
                width: 130,
                height: 260,
                filter: "blur(7px)",
                opacity: 0.4 + 0.1 * Math.sin(frame * 0.3),
              }}
            >
              <svg viewBox="0 0 130 260" width="100%" height="100%">
                <ellipse cx="65" cy="46" rx="30" ry="34" fill="#0A0E14" />
                <path d="M 40 80 C 30 130, 30 190, 40 250 L 90 250 C 100 190, 100 130, 90 80 Z" fill="#0A0E14" />
              </svg>
            </div>
            {/* Cinta policial amarilla ondeando */}
            <svg viewBox="0 0 1080 220" width="100%" height="220" style={{ position: "absolute", top: 700 }}>
              <defs>
                <pattern id="tape" width="64" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
                  <rect width="64" height="28" fill="#D9A514" />
                  <path d="M 6 28 L 34 0 M 26 28 L 54 0 M 46 28 L 74 0" stroke="#1A1406" strokeWidth="7" />
                </pattern>
              </defs>
              <rect
                x="0"
                y={90 + Math.sin(frame * 0.1) * 6}
                width="1080"
                height="30"
                fill="url(#tape)"
                opacity="0.85"
              />
            </svg>
          </div>

          {/* Muro de concreto húmedo (panel inferior/derecho) */}
          <div style={{ position: "absolute", top: 1020, left: 0, width: 1080, height: 900 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #10161D 0%, #0B1015 40%, #05070A 100%)",
              }}
            />
            {/* Textura húmeda */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(178deg, rgba(60,80,100,0.08) 0px, rgba(60,80,100,0.08) 2px, transparent 2px, transparent 60px)",
                opacity: 0.6,
              }}
            />
            {/* Haz de linterna policial */}
            <div
              style={{
                position: "absolute",
                top: -40,
                left: 320,
                width: 480,
                height: 640,
                background:
                  "conic-gradient(from 180deg at 50% 0%, rgba(220,235,250,0.20), rgba(220,235,250,0.04) 40%, transparent 70%)",
                transform: `rotate(${Math.sin(frame * 0.08) * 5}deg)`,
                transformOrigin: "50% 0%",
              }}
            />
            {/* Marca sangrienta TD trazada progresivamente */}
            <svg viewBox="0 0 1080 900" width="100%" height="900" style={{ position: "absolute", inset: 0 }}>
              {/* T */}
              <path
                d="M 470 340 L 470 560"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - tdProgress}
                stroke="#7F1D1D"
                strokeWidth="34"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 408 340 L 532 340"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - tdProgress}
                stroke="#7F1D1D"
                strokeWidth="34"
                strokeLinecap="round"
                fill="none"
              />
              {/* D */}
              <path
                d="M 600 340 L 600 560"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - tdProgress}
                stroke="#7F1D1D"
                strokeWidth="34"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 600 340 C 690 340, 726 410, 726 450 C 726 490, 690 560, 600 560"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - tdProgress}
                stroke="#7F1D1D"
                strokeWidth="34"
                strokeLinecap="round"
                fill="none"
              />
              {/* Resplandor carmesí de la marca */}
              <ellipse cx="560" cy="450" rx="220" ry="150" fill="#DC2626" opacity={tdProgress * 0.12} />
              {/* Goteo volumétrico */}
              {DROPS.map((d, i) => {
                const grow = tdProgress > 0.5 ? (tdProgress - 0.5) * 2 : 0;
                const drip = grow * d.len * (0.6 + 0.4 * Math.sin(frame * 0.4 + d.phase));
                return (
                  <path
                    key={i}
                    d={`M ${d.x} ${d.y} L ${d.x} ${d.y + drip}`}
                    stroke="#7F1D1D"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity={grow * 0.8}
                  />
                );
              })}
              {/* 1983 tallado sutilmente (evidencia) */}
              <text
                x="118"
                y="820"
                fontFamily={FONT_MONO}
                fontSize="30"
                letterSpacing="8"
                fill="#3A4147"
                opacity="0.55"
              >
                1983
              </text>
            </svg>
            {/* Divisor diagonal entre paneles */}
            <div
              style={{
                position: "absolute",
                top: -60,
                left: 0,
                width: 1080,
                height: 70,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.35) 50%, transparent 100%)",
                transform: "skewY(-1.5deg)",
              }}
            />
          </div>

          {/* Lluvia nocturna (sobre ambos paneles) */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {RAIN.map((r, i) => {
              const y = (r.y0 + frame * r.speed) % 1920;
              const x = r.x + Math.sin(frame * 0.05 + r.wobble) * 4;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={x - 3}
                  y2={y + r.len}
                  stroke="#9FB4C8"
                  strokeWidth="1.6"
                  opacity="0.25"
                />
              );
            })}
          </svg>

          {/* Destellos de patrulla rojo/azul */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 420,
              height: 1020,
              background: "radial-gradient(circle at 20% 40%, rgba(220,38,38,0.30), transparent 60%)",
              opacity: redPulse,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 420,
              height: 1020,
              background: "radial-gradient(circle at 80% 40%, rgba(34,211,238,0.28), transparent 60%)",
              opacity: bluePulse,
            }}
          />
        </div>

        {/* ===================== FASE B + C · 1998 (sala oscura) ===================== */}
        <div style={{ position: "absolute", inset: 0, opacity: phase1998 }}>
          {/* Fondo: sala sombría */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, #05070A 0%, #0A1014 40%, #0C1218 72%, #040507 100%)",
            }}
          />
          {/* Cortinas ondeando */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <g>
              <path
                d={`M 60 -20 C ${110 + Math.sin(frame * 0.06) * 8} 300, ${40 + Math.sin(frame * 0.05 + 1) * 8} 700, 80 1300 C 130 1500, 140 1680, 130 1940 L -20 1940 L -20 -20 Z`}
                fill="#0A0F14"
                opacity="0.9"
              />
              <path
                d={`M 1020 -20 C ${970 + Math.sin(frame * 0.06 + 2) * 8} 300, ${1040 + Math.sin(frame * 0.05) * 8} 700, 1000 1300 C 950 1500, 940 1680, 950 1940 L 1100 1940 L 1100 -20 Z`}
                fill="#0A0F14"
                opacity="0.9"
              />
            </g>
          </svg>
          {/* Reloj de pared detenido */}
          <div
            style={{
              position: "absolute",
              top: 220,
              left: 150,
              width: 130,
              height: 130,
              borderRadius: 65,
              background: "#0D1218",
              border: "3px solid rgba(150,180,210,0.14)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                right: 10,
                bottom: 10,
                borderRadius: 55,
                background: "#0A0E13",
              }}
            />
            {/* Manecillas detenidas a las 12:00 */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 63,
                width: 5,
                height: 44,
                background: "#B9C4CE",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 62,
                width: 7,
                height: 30,
                background: "#8FA3B0",
                borderRadius: 2,
                transformOrigin: "3.5px 24px",
                transform: "rotate(8deg)",
              }}
            />
          </div>
          {/* Luz fría parpadeante del CRT sobre la sala */}
          <div
            style={{
              position: "absolute",
              top: 320,
              left: 140,
              width: 800,
              height: 900,
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(34,211,238,0.16), transparent 65%)",
              opacity: 0.6 + 0.25 * Math.sin(frame * 0.4),
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 320,
              left: 140,
              width: 800,
              height: 900,
              background:
                "radial-gradient(ellipse at 50% 20%, rgba(220,38,38,0.12), transparent 60%)",
              opacity: Math.max(0, Math.sin(frame * 0.13 + 1.5)) * 0.8,
            }}
          />

          {/* ===== CRT TV 1998 ===== */}
          <div style={{ position: "absolute", top: 300, left: 280, width: 520, height: 400 }}>
            {/* Carcasa */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #14181F 0%, #0D1016 55%, #0A0C11 100%)",
                borderRadius: 26,
                border: "1px solid rgba(160,190,220,0.10)",
                boxShadow: "0 30px 70px rgba(0,0,0,0.7)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 22,
                left: 22,
                right: 22,
                bottom: 46,
                background: "#08090D",
                borderRadius: 16,
                border: "2px solid #05060A",
              }}
            />
            {/* Pantalla con menú congelado */}
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 36,
                right: 36,
                bottom: 62,
                borderRadius: 12,
                overflow: "hidden",
                background: "#0B0E13",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.85)",
              }}
            >
              {/* Menú congelado */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translate(${glitchX}px, ${glitchY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 12,
                  paddingTop: 83,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 20,
                    letterSpacing: 4,
                    color: "#7FA9D0",
                    opacity: 0.85,
                  }}
                >
                  SONIC R
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 60,
                    fontWeight: 800,
                    color: "#22D3EE",
                    textShadow: "0 0 18px rgba(34,211,238,0.9)",
                    transform: `translateX(${glitchX * 1.6}px)`,
                  }}
                >
                  100%
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    letterSpacing: 3,
                    color: random(Math.floor(frame / 4) + 3) > 0.5 ? "#DC2626" : "#8FA3B0",
                    opacity: 0.7,
                  }}
                >
                  COMPLETE
                </div>
              </div>
              {/* Scanlines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)",
                  opacity: 0.7,
                }}
              />
            </div>
            {/* Reflejo de Tails Doll sobre el cristal curvo */}
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 36,
                right: 36,
                bottom: 62,
                borderRadius: 12,
                overflow: "hidden",
                opacity: 0.3 + 0.08 * Math.sin(frame * 0.3),
              }}
            >
              <TailsDollCharacter
                x={270}
                y={235}
                scale={0.42}
                mode="plush"
                gemIntensity={0.7}
                hoverAmp={0.2}
                headTiltDeg={4}
                rimColor="#22D3EE"
                flipX
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, rgba(180,220,245,0.18) 0%, transparent 30%, transparent 70%, rgba(180,220,245,0.10) 100%)",
                }}
              />
            </div>
            {/* Rejillas de altavoz */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 60,
                width: 200,
                height: 20,
                display: "flex",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ width: 5, height: 16, background: "#11151B", borderRadius: 2 }} />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 16,
                right: 60,
                width: 200,
                height: 20,
                display: "flex",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ width: 5, height: 16, background: "#11151B", borderRadius: 2 }} />
              ))}
            </div>
          </div>

          {/* Notas musicales + ondas sonoras (Can You Feel the Sunshine) */}
          {musicOpacity > 0.004 ? (
            <div style={{ position: "absolute", inset: 0, opacity: musicOpacity }}>
              {NOTES.map((n, i) => {
                const rise = ((frame - 490 - n.delay) / 30) % 5;
                const y = 700 - rise * 150;
                const x = 540 + n.dx + Math.sin(frame * 0.06 + i) * 30;
                const noteOpacity = Math.max(0, Math.min(1, (5 - rise) / 3));
                const color = i % 3 === 0 ? "#DC2626" : "#FDE047";
                return (
                  <MusicNote
                    key={i}
                    color={color}
                    opacity={noteOpacity * 0.85}
                    scale={n.big ? 1.15 : 0.8}
                    x={x}
                    y={y}
                  />
                );
              })}
              {/* Ondas sonoras espectrales concéntricas */}
              <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                {[0, 1, 2, 3].map((k) => {
                  const rad = 60 + ((frame * 4 + k * 50) % 420);
                  return (
                    <circle
                      key={k}
                      cx="540"
                      cy="640"
                      r={rad}
                      fill="none"
                      stroke={k % 2 ? "#FDE047" : "#DC2626"}
                      strokeWidth="2"
                      opacity={Math.max(0, 1 - rad / 420) * 0.5}
                    />
                  );
                })}
              </svg>
            </div>
          ) : null}

          {/* Jugador paralizado (slumped_crt) */}
          <GamerCharacter
            x={540}
            floorY={1160}
            scale={0.85}
            pose="slumped_crt"
            expression={{
              emotion: "panic",
              intensity: 1,
              gazeX: -0.3,
              gazeY: 0,
              bluishLips: true,
            }}
            rimColor="#22D3EE"
            rimStrength={1.2}
            outfit="retro1997"
            showFloorShadow
          />

          {/* Control caído a un lado */}
          <div style={{ position: "absolute", top: 1280, left: 200, transform: "rotate(-24deg)" }}>
            <svg viewBox="0 0 200 92" width="150" height="69">
              <rect x="6" y="10" width="188" height="72" rx="26" fill="#1B222B" />
              <rect x="6" y="10" width="188" height="72" rx="26" fill="none" stroke="#3A4147" strokeWidth="1.4" />
              <circle cx="49" cy="46" r="16" fill="none" stroke="#2A3038" strokeWidth="4" />
              <circle cx="100" cy="46" r="6" fill="#151A21" />
              {[134, 150, 166].map((cx, i) => (
                <circle key={i} cx={cx} cy="34" r="5" fill="#151A21" />
              ))}
              {[134, 150, 166].map((cx, i) => (
                <circle key={i} cx={cx} cy="58" r="5" fill="#151A21" />
              ))}
            </svg>
          </div>

          {/* El efecto de túnel rojo/negro queda reservado exclusivamente al Pupil-Dive
              (local >= 755): durante el macro-zoom los ojos aterrados de ExpressionRig
              (esclerótica blanca, iris oscuro, pupila contraída + destello rojo puntual)
              se muestran limpios, sin ningún círculo rojo pintado encima. */}
        </div>
      </div>

      {/* Rubí de entrada (empalme con Escena 1) */}
      {rubyIn > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(252,165,165,0.95) 0%, rgba(220,38,38,0.9) 30%, rgba(127,29,29,0.95) 62%, #040507 100%)",
            opacity: rubyIn,
          }}
        />
      ) : null}

      {/* Pupil-Dive: túnel de rejilla cian/negro */}
      {dive > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            {/* Anillos concéntricos contrayéndose hacia la pupila */}
            {Array.from({ length: 12 }, (_, k) => {
              const rad = 1200 - k * 80 - dive * (600 + k * 40);
              return (
                <circle
                  key={k}
                  cx="520"
                  cy="529"
                  r={Math.max(0, rad)}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={2 + (k % 3)}
                  opacity={dive * (0.12 + (k % 4) * 0.05)}
                />
              );
            })}
            {/* Líneas radiales */}
            {Array.from({ length: 16 }, (_, k) => {
              const a = (k * Math.PI) / 8;
              const r1 = 30;
              const r2 = 1400 - dive * 900;
              return (
                <line
                  key={k}
                  x1={520 + Math.cos(a) * r1}
                  y1={529 + Math.sin(a) * r1}
                  x2={520 + Math.cos(a) * r2}
                  y2={529 + Math.sin(a) * r2}
                  stroke="#22D3EE"
                  strokeWidth="1.5"
                  opacity={dive * 0.4}
                />
              );
            })}
          </svg>
          {/* Oscurecimiento final hacia la pupila */}
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #000000 0%, rgba(4,5,7,0.9) 40%, transparent 75%)",
              opacity: dive,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
