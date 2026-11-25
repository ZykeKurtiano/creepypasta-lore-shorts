import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
} from "remotion";
import { GamerCharacter } from "../components/characters/GamerCharacter";
import { TailsDollCharacter } from "../components/characters/TailsDollCharacter";
import { FONT_MONO } from "../components/SafeZone";
import { CamKey, cameraAt, cameraTransform } from "./camera";

/**
 * Scene1SonicR1997 (frames locales 0–622 · 20.73s).
 *
 * El desbloqueo de Tails Doll en Sonic R (Sega Saturn, 1997).
 *
 * 2.5D en 3 capas (background / midground / foreground) + partículas:
 *  - Fondo: habitación nocturna de 1997, pósters retro difuminados,
 *    estantería con cajas de Sega Saturn, ventana con persianas y cielo
 *    nocturno azul profundo, polvo iluminado por el cono de luz del CRT.
 *  - Plano medio: alfombra retro (floorY=1140), mueble de madera con CRT
 *    grueso de los 90, consola Sega Saturn con cables volumétricos y LED
 *    verde, y GamerCharacter sentado sujetando el control con 2-Bone IK y
 *    capas Z (backArm → control → frontArm).
 *  - Primer plano: siluetas desenfocadas de cables, borde de lámpara y motas.
 *
 * Coreografía Multi-Plano (4 planos + Gem-Dive): Plano General (1.0–1.08x)
 * → Plano Medio (1.45x) → Macro-Zoom (2.6x al CRT) → micro-acercamiento a
 * la gema (3.1x) → Gem-Dive Zoom exponencial (3.1x → 11x) dentro de la gema.
 */

const W = 1080;
const H = 1920;

// --- Cámara -----------------------------------------------------------------

const CAM_KEYS: CamKey[] = [
  { f: 0, s: 1.0, x: 540, y: 920 },
  { f: 210, s: 1.08, x: 515, y: 880 },
  { f: 430, s: 1.45, x: 430, y: 620 },
  { f: 530, s: 2.6, x: 430, y: 620 },
  { f: 596, s: 3.1, x: 488, y: 552 },
  { f: 622, s: 11.0, x: 488, y: 552, e: Easing.exp },
];

// --- Partículas deterministas ----------------------------------------------

const DUST = Array.from({ length: 30 }, (_, i) => ({
  x: 120 + random(i * 3 + 1) * 840,
  y0: 400 + random(i * 7 + 2) * 900,
  r: 1.6 + random(i * 5 + 3) * 2.6,
  speed: 0.12 + random(i * 9 + 4) * 0.2,
  phase: random(i * 13 + 5) * 400,
}));

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  x: 290 + random(i * 11 + 2) * 300,
  y: 500 + random(i * 17 + 6) * 250,
  r: 1.5 + random(i * 5 + 1) * 2,
  phase: random(i * 7 + 3) * 6.28,
}));

/** Anillos dorados de la pista de Sonic R (pantalla CRT, plano 1). */
const RINGS = Array.from({ length: 7 }, (_, i) => ({
  x: 40 + i * 44,
  y: 90 + (i % 3) * 26,
  r: 14,
  phase: i * 0.9,
}));

// --- Subcomponentes ---------------------------------------------------------

/** Control de Sega Saturn (vista superior) sostenido por el jugador. */
const SaturnController: React.FC<{ width: number; tilt?: number }> = ({
  width,
  tilt = 0,
}) => (
  <svg
    viewBox="0 0 200 92"
    width={width}
    height={width * 0.46}
    style={{ overflow: "visible", transform: `rotate(${tilt}deg)` }}
  >
    <defs>
      <linearGradient id="sat-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4A525B" />
        <stop offset="55%" stopColor="#2A3038" />
        <stop offset="100%" stopColor="#181C22" />
      </linearGradient>
    </defs>
    {/* Carcasa */}
    <rect x="6" y="10" width="188" height="72" rx="26" fill="url(#sat-body)" />
    <rect
      x="6"
      y="10"
      width="188"
      height="72"
      rx="26"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.4"
      opacity="0.5"
    />
    <rect x="10" y="14" width="180" height="64" rx="22" fill="#1B222B" opacity="0.55" />
    {/* Cruz direccional */}
    <g>
      <path
        d="M28 46 L42 46 L42 32 L56 32 L56 46 L70 46 L70 60 L56 60 L56 74 L42 74 L42 60 L28 60 Z"
        fill="#151A21"
        stroke="#6B7280"
        strokeWidth="1"
      />
      <path d="M42 32 L56 32 L56 46 L42 46 Z" fill="#232B34" />
      <path d="M42 46 L56 46 L56 60 L42 60 Z" fill="#1E252E" />
      <circle cx="49" cy="46" r="3.6" fill="#0B0E13" />
    </g>
    {/* Botón Start central */}
    <circle cx="100" cy="46" r="7" fill="#151A21" stroke="#6B7280" strokeWidth="1.2" />
    <circle cx="100" cy="46" r="2.4" fill="#8FD0E0" />
    {/* 6 botones de cara */}
    <g>
      <circle cx="134" cy="34" r="5.5" fill="#C9B94A" />
      <circle cx="150" cy="34" r="5.5" fill="#7FA9D0" />
      <circle cx="166" cy="34" r="5.5" fill="#C9B94A" />
      <circle cx="134" cy="58" r="5.5" fill="#7FA9D0" />
      <circle cx="150" cy="58" r="5.5" fill="#C9B94A" />
      <circle cx="166" cy="58" r="5.5" fill="#7FA9D0" />
    </g>
    {/* Gatillos superiores */}
    <rect x="14" y="2" width="34" height="9" rx="4" fill="#2A3038" />
    <rect x="152" y="2" width="34" height="9" rx="4" fill="#2A3038" />
    <rect x="14" y="81" width="34" height="8" rx="4" fill="#1B222B" />
    <rect x="152" y="81" width="34" height="8" rx="4" fill="#1B222B" />
    {/* Brillos de la carcasa */}
    <path d="M30 16 C70 14, 130 14, 168 16" stroke="#9CA3AF" strokeWidth="1.6" opacity="0.25" fill="none" />
  </svg>
);

/** Pista colorida retro de Sonic R (dentro del cristal del CRT). */
const SonicTrack: React.FC<{ t: number }> = ({ t }) => (
  <svg viewBox="0 0 340 280" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="s1-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E6CC0" />
        <stop offset="55%" stopColor="#7FC7E8" />
        <stop offset="100%" stopColor="#B8E4A0" />
      </linearGradient>
    </defs>
    <rect width="340" height="280" fill="url(#s1-sky)" />
    {/* Nubes retro */}
    <ellipse cx="80" cy="50" rx="34" ry="16" fill="#EAF6FC" opacity="0.9" />
    <ellipse cx="110" cy="42" rx="24" ry="12" fill="#F4FBFF" />
    <ellipse cx="260" cy="70" rx="30" ry="14" fill="#EAF6FC" opacity="0.85" />
    {/* Sol retro */}
    <circle cx="290" cy="46" r="18" fill="#FDE047" />
    {/* Suelo a cuadros */}
    <path d="M0 220 L340 190 L340 280 L0 280 Z" fill="#3E8E4E" />
    <path d="M0 240 L340 214 L340 280 L0 280 Z" fill="#2F6F3C" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
      <rect
        key={c}
        x={c * 40}
        y={214 + (c % 2) * 0}
        width="20"
        height="20"
        fill="#EAF6FC"
        opacity="0.75"
        transform={`skewX(-6) translate(0 ${220 + c * 2})`}
      />
    ))}
    {/* Pista */}
    <path d="M-10 250 C 90 200, 200 250, 350 200" stroke="#E9E2C8" strokeWidth="26" fill="none" strokeLinecap="round" />
    <path d="M-10 250 C 90 200, 200 250, 350 200" stroke="#B9B09A" strokeWidth="3" fill="none" strokeDasharray="10 12" />
    {/* Anillos dorados en movimiento */}
    {RINGS.map((r, i) => (
      <g key={i}>
        <circle
          cx={(r.x + ((t * 14 + r.phase * 30) % 340))}
          cy={r.y}
          r={r.r}
          fill="none"
          stroke="#F6C343"
          strokeWidth="5"
          opacity={0.95}
        />
        <circle
          cx={(r.x + ((t * 14 + r.phase * 30) % 340))}
          cy={r.y}
          r={r.r}
          fill="none"
          stroke="#FFF4C2"
          strokeWidth="2"
          opacity="0.9"
        />
      </g>
    ))}
    {/* Destellos alegres */}
    {SPARKS.map((s, i) => {
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + s.phase);
      return (
        <path
          key={i}
          d={`M ${s.x} ${s.y - 6} L ${s.x + 2} ${s.y} L ${s.x} ${s.y + 6} L ${s.x - 2} ${s.y} Z`}
          fill="#FFFFFF"
          opacity={0.3 + 0.6 * tw}
        />
      );
    })}
  </svg>
);

export const Scene1SonicR1997: React.FC = () => {
  const frame = useCurrentFrame();

  const cam = cameraAt(frame, CAM_KEYS);
  const swayX = Math.sin(frame * 0.008) * 3 + Math.sin(frame * 0.0037 + 1.3) * 2;
  const swayY = Math.cos(frame * 0.006) * 2.4 + Math.sin(frame * 0.0041 + 0.8) * 1.6;

  // GamerCharacter: parámetros continuos.
  const gamerX = 780;
  const gamerY = 1140;
  const gamerScale = 0.8;

  // Expresión dinámica: de 'joy' a 'unease' con relajación intermedia.
  let emotion: "joy" | "unease" = "joy";
  let intensity = 1;
  if (frame < 230) {
    emotion = "joy";
    intensity = interpolate(frame, [210, 230], [1, 0.35], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    emotion = "unease";
    intensity = interpolate(frame, [230, 265], [0.35, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Rim light: cian del CRT que transita a rojo cuando aparece Tails Doll.
  const rimColor = interpolateColors(frame, [400, 465], ["#22D3EE", "#DC2626"]);

  // Aparición de Tails Doll dentro del CRT.
  const dollOpacity = interpolate(frame, [430, 475], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gemIntensity = interpolate(frame, [430, 535], [0.6, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Desvanecimiento de la pista retro al emerger Tails Doll.
  const trackOpacity = interpolate(frame, [430, 470], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Silueta con gema roja parpadeando en la esquina (frame 110+).
  const cornerFlicker =
    frame >= 110
      ? interpolate(frame, [110, 132], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) *
        (0.35 + 0.65 * Math.abs(Math.sin(frame * 0.5 + 0.6)))
      : 0;

  // Pantalla de desbloqueo "NEW CHALLENGER" (210–430).
  const unlockOpacity = interpolate(
    frame,
    [210, 238, 400, 432],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const unlockFlash = 0.5 + 0.5 * Math.sin(frame * 0.55);

  // Resplandor rubí del Gem-Dive final (596–622).
  const ruby = interpolate(frame, [596, 622], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Control Saturn en el regazo del jugador (mundo).
  const ctrlW = 176;
  const ctrlX = gamerX;
  const ctrlY = 864;

  // Parallax por capa.
  const wallDrift = Math.sin(frame * 0.01) * 2;
  const foreDrift = Math.sin(frame * 0.02 + 1) * 5;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Contenedor de cámara interno (transformOrigin 0 0) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: cameraTransform(cam, swayX, swayY),
          transformOrigin: "0 0",
        }}
      >
        {/* ============================ BACKGROUND ============================ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #0A1014 0%, #0C1218 42%, #162129 78%, #040507 100%)",
          }}
        />
        {/* Ventana con persianas y cielo nocturno */}
        <div
          style={{
            position: "absolute",
            top: 180,
            left: 96 + wallDrift,
            width: 260,
            height: 300,
            borderRadius: 8,
            background:
              "linear-gradient(180deg, #0A1014 0%, #0E1A26 60%, #13202C 100%)",
            border: "1px solid rgba(140,170,200,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 26,
              right: 22,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "rgba(190,215,240,0.35)",
              filter: "blur(2px)",
            }}
          />
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 14 + i * 26,
                width: 10,
                background:
                  "linear-gradient(180deg, rgba(10,16,20,0.9), rgba(20,30,40,0.75))",
                borderLeft: "1px solid rgba(140,170,200,0.10)",
              }}
            />
          ))}
        </div>
        {/* Pósters retro difuminados */}
        <div
          style={{
            position: "absolute",
            top: 300,
            left: 570 + wallDrift,
            width: 150,
            height: 210,
            background: "rgba(24,34,44,0.35)",
            border: "1px solid rgba(140,170,200,0.10)",
            transform: "rotate(2deg)",
            filter: "blur(1px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 14,
              background:
                "radial-gradient(circle at 50% 38%, rgba(220,38,38,0.35), transparent 60%)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 540,
            left: 540 + wallDrift,
            width: 130,
            height: 170,
            background: "rgba(20,28,38,0.30)",
            border: "1px solid rgba(140,170,200,0.09)",
            transform: "rotate(-3deg)",
            filter: "blur(1px)",
          }}
        />
        {/* Estantería con cajas de Sega Saturn */}
        <div
          style={{
            position: "absolute",
            top: 420,
            left: 840 + wallDrift,
            width: 130,
            height: 300,
            background: "linear-gradient(180deg, #10161D, #0A0F14)",
            borderRadius: 4,
            border: "1px solid rgba(140,170,200,0.08)",
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 16 + i * 70,
                left: 12,
                width: 44,
                height: 60,
                borderRadius: 2,
                background: i % 2 ? "#1A2430" : "#232E3C",
                border: "1px solid rgba(160,190,220,0.12)",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
              }}
            />
          ))}
        </div>

        {/* Cono de luz cian/ámbar del CRT sobre la habitación */}
        <div
          style={{
            position: "absolute",
            top: 760,
            left: 60,
            width: 860,
            height: 700,
            background:
              "radial-gradient(ellipse at 40% 0%, rgba(90,200,235,0.18), rgba(140,205,245,0.05) 52%, transparent 74%)",
            opacity: 0.55 + 0.15 * Math.sin(frame * 0.5),
          }}
        />

        {/* ============================ MIDGROUND ============================ */}
        {/* Alfombra retro + piso */}
        <div
          style={{
            position: "absolute",
            top: 1140,
            left: 0,
            right: 0,
            height: 780,
            background:
              "linear-gradient(180deg, #1A222B 0%, #0D1319 30%, #040507 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 1140,
            left: 0,
            right: 0,
            height: 90,
            background:
              "repeating-linear-gradient(90deg, #23303B 0px, #23303B 46px, #162129 46px, #162129 92px)",
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 1136,
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(150,180,210,0.10)",
          }}
        />

        {/* Mueble de madera (TV stand) */}
        <div
          style={{
            position: "absolute",
            top: 790,
            left: 205,
            width: 450,
            height: 350,
            background: "linear-gradient(180deg, #241A12 0%, #180F0A 100%)",
            borderRadius: 6,
            border: "1px solid rgba(120,90,60,0.25)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 120,
              left: 24,
              right: 24,
              bottom: 20,
              background: "rgba(0,0,0,0.35)",
              borderRadius: 4,
            }}
          />
          {/* Consola Sega Saturn en el mueble */}
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 130,
              width: 240,
              height: 70,
              background: "linear-gradient(180deg, #3A4147 0%, #23282E 60%, #15181D 100%)",
              borderRadius: 8,
              border: "1px solid rgba(160,190,220,0.14)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 20,
                width: 130,
                height: 10,
                background: "rgba(0,0,0,0.5)",
                borderRadius: 3,
                borderTop: "1px solid rgba(160,190,220,0.15)",
              }}
            />
            {/* LED verde encendido */}
            <div
              style={{
                position: "absolute",
                top: 18,
                right: 16,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#22C55E",
                boxShadow: "0 0 12px rgba(34,197,94,0.9)",
                opacity: 0.7 + 0.3 * Math.sin(frame * 0.5),
              }}
            />
          </div>
        </div>

        {/* Cables volumétricos curvos (consola → TV) */}
        <svg
          viewBox="0 0 1080 1920"
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <path
            d="M 390 880 C 360 740, 300 660, 360 560"
            fill="none"
            stroke="#1E252E"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 390 880 C 360 740, 300 660, 360 560"
            fill="none"
            stroke="#3B4A58"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 430 880 C 470 760, 520 700, 470 610"
            fill="none"
            stroke="#161B22"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 430 880 C 470 760, 520 700, 470 610"
            fill="none"
            stroke="#3B4A58"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>

        {/* ============================ CRT TV ============================ */}
        <div style={{ position: "absolute", top: 460, left: 240, width: 380, height: 330 }}>
          {/* Carcasa gruesa */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #1A2026 0%, #101419 55%, #0A0D11 100%)",
              borderRadius: 24,
              border: "1px solid rgba(160,190,220,0.12)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.7)",
            }}
          />
          {/* Marco del tubo */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              bottom: 40,
              background: "#08090D",
              borderRadius: 14,
              border: "2px solid #05060A",
            }}
          />
          {/* Pantalla curva */}
          <div
            style={{
              position: "absolute",
              top: 34,
              left: 34,
              right: 34,
              bottom: 56,
              borderRadius: 12,
              overflow: "hidden",
              background: "#0B0E13",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
            }}
          >
            {/* Pista retro (se desvanece al emerger Tails Doll) */}
            <div style={{ position: "absolute", inset: 0, opacity: trackOpacity }}>
              <SonicTrack t={frame / 30} />
            </div>

            {/* Silueta con gema roja parpadeando en la esquina */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                width: 46,
                height: 64,
                opacity: cornerFlicker,
              }}
            >
              <svg viewBox="0 0 46 64" width="100%" height="100%">
                <path
                  d="M 23 4 C 12 12, 8 28, 12 44 C 15 55, 24 61, 32 56 C 30 44, 32 30, 38 22 C 33 14, 28 8, 23 4 Z"
                  fill="#040507"
                />
                <path d="M 19 22 L 27 22 L 25 32 L 21 32 Z" fill="#DC2626" opacity={0.9} />
                <path d="M 16 30 L 30 30" stroke="#DC2626" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>

            {/* Pantalla de desbloqueo NEW CHALLENGER */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: unlockOpacity,
                background:
                  "radial-gradient(circle at 50% 45%, rgba(30,45,60,0.9), rgba(6,8,12,0.95))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {/* Silueta del personaje secreto */}
              <svg viewBox="0 0 80 96" width="64" height="76">
                <path
                  d="M 40 6 C 30 14, 26 28, 29 42 C 31 52, 38 58, 40 60 C 42 58, 49 52, 51 42 C 54 28, 50 14, 40 6 Z"
                  fill="#040507"
                />
                <path d="M 30 20 L 40 40 L 50 20 L 40 26 Z" fill="#040507" />
                <path d="M 40 60 L 34 88 L 46 88 Z" fill="#040507" />
                <circle cx="40" cy="10" r="4" fill="#DC2626" opacity={0.7 + 0.3 * unlockFlash} />
              </svg>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 15,
                  letterSpacing: 3,
                  fontWeight: 700,
                  color: unlockFlash > 0.55 ? "#FDE047" : "#22D3EE",
                  textShadow:
                    unlockFlash > 0.55
                      ? "0 0 12px rgba(253,224,71,0.8)"
                      : "0 0 12px rgba(34,211,238,0.8)",
                }}
              >
                NEW CHALLENGER
              </div>
            </div>

            {/* Tails Doll emergiendo dentro del cristal curvo */}
            <div style={{ position: "absolute", inset: 0, opacity: dollOpacity }}>
              <TailsDollCharacter
                x={215}
                y={220}
                scale={0.4}
                mode="plush"
                gemIntensity={gemIntensity}
                hoverAmp={0.5}
                headTiltDeg={-5}
                rimColor={rimColor}
              />
            </div>

            {/* Reflejo especular del cristal curvo */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, rgba(200,230,250,0.16) 0%, transparent 26%, transparent 72%, rgba(200,230,250,0.08) 100%)",
                borderRadius: 12,
              }}
            />
            {/* Scanlines del tubo */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.26) 0px, rgba(0,0,0,0.26) 1px, transparent 1px, transparent 3px)",
                opacity: 0.7,
              }}
            />
          </div>
          {/* Base del monitor */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 132,
              width: 116,
              height: 26,
              background: "#0B0D12",
              borderRadius: 8,
            }}
          />
        </div>

        {/* ============================ GAMER + CONTROL (capas Z) ============================ */}
        {/* Puff / asiento */}
        <div
          style={{
            position: "absolute",
            top: 1040,
            left: gamerX - 170,
            width: 340,
            height: 130,
            background: "radial-gradient(ellipse at 50% 40%, #22303B 0%, #0D1319 70%)",
            borderRadius: "50%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
          }}
        />

        {/* Cuerpo + brazo trasero */}
        <GamerCharacter
          x={gamerX}
          floorY={gamerY}
          scale={gamerScale}
          pose="seated_gaming"
          expression={{ emotion, intensity, gazeX: -0.38, gazeY: 0.05 }}
          leftHandTarget={{ x: 124, y: 585 }}
          renderLayer="body_and_back_arm"
          rimColor={rimColor}
          rimStrength={1.1}
          outfit="retro1997"
          showFloorShadow
        />

        {/* Control de Sega Saturn (entre el brazo trasero y el frontal) */}
        <div
          style={{
            position: "absolute",
            left: ctrlX - ctrlW / 2,
            top: ctrlY - ctrlW * 0.23,
          }}
        >
          <SaturnController width={ctrlW} tilt={-6} />
        </div>

        {/* Brazo frontal */}
        <GamerCharacter
          x={gamerX}
          floorY={gamerY}
          scale={gamerScale}
          pose="seated_gaming"
          expression={{ emotion, intensity, gazeX: -0.38, gazeY: 0.05 }}
          rightHandTarget={{ x: 276, y: 585 }}
          renderLayer="front_arm_only"
          rimColor={rimColor}
          rimStrength={1.1}
          outfit="retro1997"
          showFloorShadow={false}
        />

        {/* ============================ FOREGROUND ============================ */}
        {/* Siluetas desenfocadas de cables en primer plano */}
        <div
          style={{
            position: "absolute",
            top: 1280 + foreDrift,
            left: -40,
            width: 170,
            height: 620,
            background: "#020306",
            filter: "blur(9px)",
            opacity: 0.9,
            transform: "rotate(8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 1340 - foreDrift * 0.6,
            right: -50,
            width: 150,
            height: 560,
            background: "#020306",
            filter: "blur(10px)",
            opacity: 0.88,
            transform: "rotate(-6deg)",
          }}
        />
        {/* Borde de lámpara apagada */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 820 + foreDrift,
            width: 260,
            height: 340,
            background:
              "linear-gradient(180deg, rgba(4,5,7,0.9), rgba(4,5,7,0) 90%)",
            filter: "blur(6px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              left: 60,
              width: 180,
              height: 90,
              borderRadius: "0 0 90px 90px",
              background: "#0A0D12",
              filter: "blur(3px)",
            }}
          />
        </div>
      </div>

      {/* Polvo flotante iluminado por el cono de luz */}
      {DUST.map((d, i) => {
        const y = d.y0 - ((frame * d.speed + d.phase) % 520);
        const op = 0.06 + 0.18 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: d.x,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: d.r,
              background: "#CFE3F5",
              opacity: op,
              boxShadow: "0 0 6px rgba(190,220,245,0.5)",
            }}
          />
        );
      })}

      {/* Resplandor rubí del Gem-Dive final */}
      {ruby > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(252,165,165,0.95) 0%, rgba(220,38,38,0.9) 30%, rgba(127,29,29,0.95) 62%, #040507 100%)",
            opacity: ruby,
          }}
        />
      ) : null}
      {/* Rayos carmesí de aceleración durante el dive */}
      {ruby > 0.004 ? (
        <svg
          viewBox="0 0 1080 1920"
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}
        >
          {[ -70, -35, 0, 35, 70 ].map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            const len = 620 + (i % 2) * 160;
            return (
              <line
                key={deg}
                x1={540}
                y1={960}
                x2={540 + Math.cos(a) * len}
                y2={960 + Math.sin(a) * len}
                stroke={i % 2 ? "#FCA5A5" : "#DC2626"}
                strokeWidth={3 + (i % 3)}
                opacity={ruby * 0.5}
              />
            );
          })}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
