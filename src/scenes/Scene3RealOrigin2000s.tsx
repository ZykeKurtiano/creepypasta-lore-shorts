import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { TailsDollCharacter } from "../components/characters/TailsDollCharacter";
import { FONT_MONO } from "../components/SafeZone";
import { CamKey, cameraAt, cameraTransform } from "./camera";

/**
 * Scene3RealOrigin2000s (frames locales 0–362 · 12.07s).
 *
 * El origen real: un simple diseño 3D experimental cuya estética de peluche
 * sin expresión disparó la paranoia de los foros a inicios de los 2000.
 *
 *  - Fase A (0–135): mundo 3D low-poly de Sonic R en perspectiva fugada,
 *    Tails Doll (mode lowpoly1997) flotando sobre un pedestal de malla 3D.
 *  - Fase B (135–245): Macro-Zoom 2.45x al rostro poligonal inexpresivo.
 *  - Fase C (245–344): Zoom-Out que revela la constelación de monitores CRT
 *    de escritorio de los 2000 con foros retro animados.
 *  - Transición (344–362): Whip-Zoom exponencial a la bandeja óptica de una
 *    PlayStation 2 (silueta azul/negra) para abrir la Escena 4.
 */

// --- Cámara -----------------------------------------------------------------

const CAM_KEYS: CamKey[] = [
  { f: 0, s: 0.85, x: 540, y: 700 },
  { f: 135, s: 1.1, x: 540, y: 680 },
  { f: 245, s: 2.45, x: 540, y: 630 },
  { f: 344, s: 0.95, x: 540, y: 900 },
  { f: 362, s: 9.5, x: 540, y: 1560, e: Easing.exp },
];

// --- Elementos deterministas -------------------------------------------------

const TERRAIN = Array.from({ length: 22 }, (_, i) => ({
  x: 100 + random(i * 7 + 1) * 880,
  size: 26 + random(i * 5 + 3) * 60,
  speed: 2 + random(i * 9 + 4) * 6,
  phase: random(i * 13 + 5) * 800,
}));

const RINGS = Array.from({ length: 6 }, (_, i) => ({
  x: 160 + random(i * 11 + 2) * 760,
  y: 320 + random(i * 17 + 6) * 420,
  r: 16 + random(i * 3 + 1) * 18,
  phase: random(i * 7 + 3) * 6.28,
}));

/** Monitores CRT de escritorio de los 2000 (constelación). */
const MONITORS = [
  { x: 80, y: 300, w: 250, label: "TAILS DOLL", accent: "#DC2626" },
  { x: 750, y: 330, w: 250, label: "2001", accent: "#D97706" },
  { x: 150, y: 800, w: 210, label: "TAILS DOLL", accent: "#22D3EE" },
  { x: 720, y: 840, w: 210, label: "2001", accent: "#DC2626" },
  { x: 60, y: 1440, w: 290, label: "TAILS DOLL", accent: "#D97706" },
  { x: 730, y: 1460, w: 290, label: "2001", accent: "#22D3EE" },
  { x: 390, y: 170, w: 220, label: "TAILS DOLL", accent: "#DC2626" },
];

// --- Subcomponentes ---------------------------------------------------------

/** Monitor CRT beige/gris con ventana de foro retro animada. */
const ForumMonitor: React.FC<{
  x: number;
  y: number;
  w: number;
  frame: number;
  label: string;
  accent: string;
}> = ({ x, y, w, frame, label, accent }) => {
  const h = Math.round(w * 0.8);
  const blink = frame % 60 < 40;
  const typeShift = Math.sin(frame * 0.12) * 3;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: "linear-gradient(180deg, #C9BFAC 0%, #B4A98F 70%, #8F8670 100%)",
        borderRadius: 10,
        border: "1px solid rgba(60,50,35,0.4)",
        boxShadow: "0 24px 50px rgba(0,0,0,0.7)",
        padding: Math.round(w * 0.06),
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: Math.round(w * 0.06),
          background: "#0A0E13",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        {/* Contenido del foro (diegético) */}
        <div style={{ position: "absolute", inset: 0, padding: 10 }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.max(9, Math.round(w * 0.055)),
              letterSpacing: 1,
              color: accent,
              fontWeight: 700,
              textShadow: `0 0 8px ${accent}`,
              opacity: 0.9,
            }}
          >
            {label}
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                height: Math.max(4, Math.round(w * 0.028)),
                marginTop: 7,
                background: i === 1 ? accent : "#3A4147",
                opacity: 0.5 + (i % 2) * 0.2,
                width: `${68 - i * 9 + (i === 3 ? typeShift : 0)}%`,
              }}
            />
          ))}
          {/* Cursor parpadeante */}
          <div
            style={{
              position: "absolute",
              left: 12,
              top: Math.round(h * 0.58),
              width: Math.max(3, Math.round(w * 0.03)),
              height: Math.max(8, Math.round(w * 0.05)),
              background: accent,
              opacity: blink ? 1 : 0,
            }}
          />
          {/* Silueta de usuario tecleando en sombra */}
          <svg viewBox="0 0 60 60" width={Math.round(w * 0.2)} height={Math.round(w * 0.2)} style={{ position: "absolute", right: 6, bottom: 4, opacity: 0.5 }}>
            <circle cx="30" cy="20" r="12" fill="#05070A" />
            <path d="M 14 60 C 14 44, 24 38, 30 38 C 36 38, 46 44, 46 60 Z" fill="#05070A" />
          </svg>
        </div>
        {/* Reflejo de cristal + scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(220,235,250,0.10) 0%, transparent 24%, transparent 76%, rgba(220,235,250,0.06) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
};

export const Scene3RealOrigin2000s: React.FC = () => {
  const frame = useCurrentFrame();

  const cam = cameraAt(frame, CAM_KEYS);
  const swayX = Math.sin(frame * 0.008) * 3 + Math.sin(frame * 0.0037 + 1.3) * 2;
  const swayY = Math.cos(frame * 0.006) * 2.4 + Math.sin(frame * 0.0041 + 0.8) * 1.6;

  // Emergencia del Pupil-Dive (0–16).
  const emerge = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Revelado de la constelación de monitores (245–344).
  const monitorsOpacity = interpolate(frame, [245, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // El mundo low-poly retrocede sutilmente al revelarse los monitores.
  const gridOpacity = interpolate(frame, [245, 344], [1, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gema del modelo low-poly sube en el Macro-Zoom (135–245).
  const gemIntensity = interpolate(frame, [135, 220], [0.3, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Whip-zoom a la bandeja PS2 (344–362).
  const whip = interpolate(frame, [344, 362], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Apertura de la bandeja óptica.
  const trayOpen = interpolate(frame, [330, 352], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
        {/* ===================== FONDO · mundo low-poly ===================== */}
        <div style={{ position: "absolute", inset: 0, opacity: gridOpacity }}>
          {/* Cielo retro nocturno */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, #070B16 0%, #0A1424 40%, #123048 72%, #081018 100%)",
            }}
          />
          {/* Cuadrícula de perspectiva cian/neón */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {/* Líneas de horizonte */}
            {Array.from({ length: 14 }, (_, i) => {
              const t = i / 13;
              const y = 720 + Math.pow(t, 2) * 1150;
              return (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="1080"
                  y2={y}
                  stroke="#22D3EE"
                  strokeWidth={0.6 + t * 1.8}
                  opacity={0.12 + t * 0.4}
                />
              );
            })}
            {/* Líneas radiales hacia el punto de fuga */}
            {Array.from({ length: 11 }, (_, i) => {
              const x = 100 + i * 88;
              return (
                <line
                  key={i}
                  x1="540"
                  y1="700"
                  x2={x * 2.2 - 540}
                  y2="1920"
                  stroke="#22D3EE"
                  strokeWidth="1"
                  opacity="0.22"
                />
              );
            })}
            {/* Triángulos de terreno en movimiento continuo */}
            {TERRAIN.map((tr, i) => {
              const y = 900 + ((frame * tr.speed + tr.phase) % 1000);
              const size = tr.size * (0.4 + ((y - 900) / 1000) * 0.9);
              return (
                <path
                  key={i}
                  d={`M ${tr.x} ${y} L ${tr.x + size} ${y} L ${tr.x + size / 2} ${y + size * 0.7} Z`}
                  fill={i % 3 === 0 ? "#123048" : i % 3 === 1 ? "#0C2238" : "#0E1E30"}
                  stroke="#22D3EE"
                  strokeWidth="1"
                  opacity={0.4 + ((y - 900) / 1000) * 0.5}
                />
              );
            })}
            {/* Anillos poligonales flotantes */}
            {RINGS.map((r, i) => {
              const bob = Math.sin(frame * 0.04 + r.phase) * 12;
              return (
                <g key={i} transform={`translate(0 ${bob})`}>
                  <polygon
                    points={Array.from({ length: 8 }, (_, k) => {
                      const a = (k * Math.PI) / 4 + frame * 0.01;
                      return `${r.x + Math.cos(a) * r.r},${r.y + Math.sin(a) * r.r}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#F6C343"
                    strokeWidth="3"
                    opacity="0.7"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ===================== Tails Doll low-poly + pedestal ===================== */}
        <div style={{ position: "absolute", inset: 0, opacity: emerge }}>
          {/* Pedestal de malla 3D con ejes XYZ */}
          <div style={{ position: "absolute", top: 940, left: 540 - 130, width: 260, height: 130 }}>
            <svg viewBox="0 0 260 130" width="100%" height="100%" style={{ overflow: "visible" }}>
              {/* Base de malla */}
              <polygon points="70,120 190,120 220,90 40,90" fill="#0C2238" stroke="#22D3EE" strokeWidth="1.6" opacity="0.7" />
              <polygon points="40,90 220,90 200,40 60,40" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.4" />
              {/* Ejes XYZ */}
              <line x1="130" y1="65" x2="210" y2="20" stroke="#EF4444" strokeWidth="2.4" />
              <line x1="130" y1="65" x2="60" y2="10" stroke="#22C55E" strokeWidth="2.4" />
              <line x1="130" y1="65" x2="130" y2="-8" stroke="#3B82F6" strokeWidth="2.4" />
              {/* Vértices brillando */}
              {[130, 210, 60].map((cx, i) => {
                const cy = i === 0 ? 65 : i === 1 ? 20 : 10;
                const col = i === 0 ? "#3B82F6" : i === 1 ? "#EF4444" : "#22C55E";
                return (
                  <circle key={i} cx={cx} cy={cy} r={3.5} fill={col} opacity={0.6 + 0.4 * Math.sin(frame * 0.2 + i)} />
                );
              })}
            </svg>
          </div>

          {/* Tails Doll lowpoly1997 rotando/oscilando */}
          <div style={{ position: "absolute", top: 500, left: 540 - 150, width: 300, height: 480 }}>
            <TailsDollCharacter
              x={150}
              y={240}
              scale={0.5}
              mode="lowpoly1997"
              gemIntensity={gemIntensity}
              hoverAmp={0.7}
              headTiltDeg={Math.sin(frame * 0.05) * 6}
              rimColor="#22D3EE"
            />
          </div>

          {/* Destello de ojos negros vacíos + gema roja en el Macro-Zoom */}
          {gemIntensity > 0.5 ? (
            <div
              style={{
                position: "absolute",
                top: 615,
                left: 540 - 34,
                width: 68,
                height: 30,
                opacity: (gemIntensity - 0.5) * 1.6,
              }}
            >
              <svg viewBox="0 0 68 30" width="100%" height="100%">
                <path d="M 6 8 L 26 8 L 24 22 L 8 22 Z" fill="#040507" />
                <path d="M 42 8 L 62 8 L 60 22 L 44 22 Z" fill="#040507" />
                <circle cx="34" cy="6" r="7" fill="#DC2626" opacity={0.7 + 0.3 * Math.sin(frame * 0.4)} />
              </svg>
            </div>
          ) : null}
        </div>

        {/* ===================== Constelación de monitores CRT ===================== */}
        <div style={{ position: "absolute", inset: 0, opacity: monitorsOpacity }}>
          {MONITORS.map((m, i) => (
            <ForumMonitor
              key={i}
              x={m.x}
              y={m.y}
              w={m.w}
              frame={frame}
              label={m.label}
              accent={m.accent}
            />
          ))}
          {/* Hilos luminosos rojos/ámbar volumétricos conectando monitores */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path
              d="M 205 300 C 260 500, 340 520, 420 620"
              fill="none"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.4 + 0.2 * Math.sin(frame * 0.15)}
            />
            <path
              d="M 875 330 C 820 520, 760 540, 690 640"
              fill="none"
              stroke="#D97706"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.4 + 0.2 * Math.sin(frame * 0.15 + 1)}
            />
            <path
              d="M 255 800 C 330 880, 420 860, 480 720"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 825 840 C 750 920, 660 900, 600 760"
              fill="none"
              stroke="#DC2626"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.35"
            />
            {/* Pulsos de luz viajando por los hilos */}
            {[0, 1].map((k) => {
              const p = (frame * 3 + k * 180) % 360;
              return (
                <circle
                  key={k}
                  cx={205 + p}
                  cy={300 + p * 0.9}
                  r="6"
                  fill="#FCA5A5"
                  opacity={0.6}
                />
              );
            })}
          </svg>
        </div>

        {/* ===================== PlayStation 2 (transición) ===================== */}
        <div style={{ position: "absolute", left: 540 - 170, top: 1520, width: 340, height: 84 }}>
          {/* Cuerpo azul/negro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #1B2A3A 0%, #0E1620 60%, #060A0F 100%)",
              borderRadius: 12,
              border: "1px solid rgba(120,170,220,0.18)",
              boxShadow: "0 26px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Franja de la ranura */}
            <div
              style={{
                position: "absolute",
                top: 34,
                left: 0,
                right: 0,
                height: 8,
                background: "#04070B",
                borderTop: "1px solid rgba(120,170,220,0.12)",
                borderBottom: "1px solid rgba(120,170,220,0.12)",
              }}
            />
            {/* Bandeja óptica abriéndose */}
            <div
              style={{
                position: "absolute",
                top: 42,
                left: 0,
                right: 0,
                height: 6,
                background: "#111B26",
                transform: `translateY(${trayOpen * 12}px)`,
                opacity: trayOpen,
              }}
            />
            {/* LED azul */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 18,
                width: 7,
                height: 7,
                borderRadius: 4,
                background: "#22D3EE",
                boxShadow: "0 0 10px rgba(34,211,238,0.9)",
              }}
            />
            {/* Logo PS2 sutil */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 20,
                fontFamily: FONT_MONO,
                fontSize: 15,
                letterSpacing: 2,
                color: "#7FA9D0",
                opacity: 0.6,
              }}
            >
              PS2
            </div>
          </div>
          {/* Ranura oscura de la bandeja (objetivo del whip-zoom) */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 30,
              right: 30,
              height: 10,
              background: "#02040A",
              borderRadius: 3,
              boxShadow: "inset 0 0 14px #000000",
            }}
          />
        </div>
      </div>

      {/* Emergencia inicial desde el Pupil-Dive */}
      {emerge < 1 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #000000 0%, rgba(4,5,7,0.95) 45%, transparent 80%)",
            opacity: 1 - emerge,
          }}
        />
      ) : null}

      {/* Whip-zoom: líneas cinéticas + desenfoque */}
      {whip > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i * Math.PI * 2) / 24 + 0.4;
              const r1 = 260;
              const r2 = 900 - whip * 700;
              const ox = 540;
              const oy = 1560;
              return (
                <line
                  key={i}
                  x1={ox + Math.cos(a) * r1}
                  y1={oy + Math.sin(a) * r1}
                  x2={ox + Math.cos(a) * r2}
                  y2={oy + Math.sin(a) * r2}
                  stroke={i % 2 ? "#22D3EE" : "#8FD0E0"}
                  strokeWidth={2 + (i % 3)}
                  opacity={whip * 0.45}
                />
              );
            })}
          </svg>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 50% 81%, transparent 0%, rgba(2,4,10,0.9) 70%, #02040A 100%)",
              opacity: whip,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
