import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { LightChildCharacter } from "../components/characters/LightChildCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";

/**
 * ZalgoScene5HuntRescue (frames 2106–2589, 70.20–86.30s) — Cacería y Rescate.
 *
 *  - background (parallax lento): callejón/borde de bosque urbano nocturno en
 *    penumbra profunda, niebla densa deslizándose y un portal dimensional
 *    azul-cian que se abre lentamente desde localFrame 170.
 *  - midground:
 *      · 0–190: 2 seguidores sombríos de Zalgo (encapuchados corrompidos, ojos
 *        sangrantes, capas rasgadas, garras carmesí) acechan a un Niño de Luz
 *        (pose="scared").
 *      · 165–340: SlenderCharacter (mode="battle") emerge imponente, sus
 *        tentáculos con rim cian repelen a los seguidores y guía al niño al
 *        portal (pose="sheltered", su luz vuelve a brillar).
 *      · 330–465: un testigo humano detallado y articulado (aterrado, linterna
 *        temblorosa) es envuelto por la sombra de Slenderman.
 *  - foreground (parallax 1.3x): siluetas de verjas/ramas + corte diagonal
 *    carmesí vs. azul abisal cerrándose en tijera (465–483) hacia la Escena 6.
 *
 * Cámara: única intención — avance progresivo suave en eje Z (1.0 → 1.07).
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Niebla / motas atmosféricas (deterministas). */
const MIST = Array.from({ length: 22 }, (_, i) => ({
  x: random(i * 4.1 + 1) * 1080,
  y0: random(i * 6.9 + 3) * 1700,
  r: 40 + random(i * 5.3 + 5) * 90,
  speed: 0.12 + random(i * 9.7 + 2) * 0.22,
  phase: random(i * 13.7 + 5) * Math.PI * 2,
  op: 0.06 + random(i * 17.3 + 6) * 0.14,
}));

/** Portal dimensional azul-cian (se abre con `open` 0..1). */
const Portal: React.FC<{ open: number; frame: number }> = ({ open, frame }) => {
  const ringRot = frame * 0.3;
  const r = 30 + open * 190;
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
      role="img"
      aria-label="Portal dimensional azul-cian brillante"
    >
      <defs>
        <radialGradient id="s5-portal-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0FBFF" stopOpacity="0.95" />
          <stop offset="32%" stopColor="#22D3EE" stopOpacity="0.85" />
          <stop offset="68%" stopColor="#164E63" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#040507" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="880" cy="720" r={140 + open * 200} fill="url(#s5-portal-core)" opacity={0.2 + open * 0.6} />
      <circle cx="880" cy="720" r={r} fill="url(#s5-portal-core)" opacity={open} />
      <g transform={`translate(880 720) rotate(${ringRot})`} fill="none" opacity={open}>
        <ellipse rx={r * 1.4} ry={r * 0.44} stroke="#22D3EE" strokeWidth="3" opacity="0.8" />
        <ellipse rx={r * 1.12} ry={r * 0.34} stroke="#E0FBFF" strokeWidth="2.2" opacity="0.6" />
        <ellipse rx={r * 0.86} ry={r * 0.26} stroke="#7FB2F0" strokeWidth="1.6" opacity="0.45" />
      </g>
    </svg>
  );
};

/**
 * Seguidor sombrío de Zalgo (NO maniquí): figura encapuchada corrompida con
 * rostro oscuro, ojos sangrantes, capa rasgada y brazos articulados que
 * extienden garras carmesí. `advance` (0..1) lo hace avanzar, `repel` (0..1)
 * lo empuja hacia atrás.
 */
const ZalgoFollower: React.FC<{
  advance: number;
  repel: number;
  frame: number;
  idPrefix: string;
}> = ({ advance, repel, frame, idPrefix }) => {
  const pid = idPrefix;
  const g = (n: string) => `${pid}-${n}`;
  const lunge = Math.sin(frame * 0.1) * 3;
  const reach = advance * (1 - repel);
  const lShoulder = 30 + reach * 34 - repel * 16;
  const lElbow = 16 + reach * 12;
  const rShoulder = -26 - reach * 30 + repel * 14;
  const rElbow = -14 - reach * 10;
  const torsoLean = 8 + reach * 10 - repel * 12 + lunge * 0.5;
  const headTilt = 6 + reach * 6 + lunge;
  const bloodDrops = [0, 1, 2].map((i) => {
    const cycle = 50 + i * 16;
    const p = (frame * 1.4 + i * 20) % cycle;
    return { x: -4 + i * 6, y: 30 + p * 1.6, op: Math.max(0, 1 - p / cycle) };
  });

  return (
    <svg
      viewBox="0 0 480 760"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Seguidor sombrío de Zalgo con garras carmesí"
    >
      <defs>
        <linearGradient id={g("robe")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#160A10" />
          <stop offset="50%" stopColor="#0B050A" />
          <stop offset="100%" stopColor="#040306" />
        </linearGradient>
        <linearGradient id={g("robe-shadow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08040A" />
          <stop offset="100%" stopColor="#020103" />
        </linearGradient>
        <radialGradient id={g("hood-dark")} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#050203" />
          <stop offset="100%" stopColor="#010001" />
        </radialGradient>
      </defs>

      {/* ===== torsoGroup ===== */}
      <g transform={`translate(240, 540) rotate(${torsoLean})`}>
        {/* Piernas ocultas bajo la túnica rasgada */}
        <path
          d="M -70 0 C -86 -40, -96 -90, -98 -140 C -100 -180, -96 -208, -78 -222 L 78 -222 C 96 -208, 100 -180, 98 -140 C 96 -90, 86 -40, 70 0 C 40 40, -40 40, -70 0 Z"
          fill={`url(#${g("robe")})`}
        />
        {/* Capa rasgada inferior */}
        <path d="M -70 0 C -60 60, -40 120, -10 170 L 16 120 L 30 180 L 56 110 C 70 60, 70 30, 70 0 Z" fill={`url(#${g("robe-shadow")})`} />
        <path d="M -10 170 C -18 200, -22 230, -20 260" stroke="#0B050A" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 30 180 C 40 210, 46 240, 44 270" stroke="#0B050A" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* Pliegues de la túnica */}
        <path d="M -80 -180 C -76 -120, -72 -60, -66 0" stroke="#020103" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M -48 -200 C -44 -130, -40 -60, -36 0" stroke="#160A10" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M 48 -200 C 44 -130, 40 -60, 36 0" stroke="#160A10" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M 80 -180 C 76 -120, 72 -60, 66 0" stroke="#020103" strokeWidth="4" fill="none" opacity="0.6" />
        {/* Rim light carmesí */}
        <path d="M 98 -140 C 100 -180, 96 -208, 78 -222 L 50 -222 L 64 -140 Z" fill="#DC2626" opacity="0.4" />

        {/* ===== neckHeadGroup ===== */}
        <g transform={`translate(0, -214) rotate(${headTilt})`}>
          {/* Capucha */}
          <path
            d="M -66 -6 C -74 -34, -72 -62, -60 -84 C -46 -108, -24 -120, 0 -120 C 24 -120, 46 -108, 60 -84 C 72 -62, 74 -34, 66 -6 C 44 -22, 22 -28, 0 -28 C -22 -28, -44 -22, -66 -6 Z"
            fill={`url(#${g("robe")})`}
          />
          {/* Rostro oscuro en el interior de la capucha */}
          <g transform="translate(0, -34)">
            <ellipse cx="0" cy="0" rx="42" ry="52" fill={`url(#${g("hood-dark")})`} />
            {/* Ojos sangrantes (carmesí brillante) */}
            <ellipse cx="-16" cy="-6" rx="8" ry="5" fill="#0A0202" />
            <ellipse cx="16" cy="-6" rx="8" ry="5" fill="#0A0202" />
            <circle cx="-16" cy="-6" r="3.4" fill="#DC2626" />
            <circle cx="16" cy="-6" r="3.4" fill="#DC2626" />
            <circle cx="-16" cy="-6" r="1.4" fill="#F43F5E" />
            <circle cx="16" cy="-6" r="1.4" fill="#F43F5E" />
            {/* Sangre cayendo de los ojos */}
            <path d="M -16 -1 C -16 8, -15 16, -14 26 C -13 28, -19 28, -18 26 C -19 16, -20 8, -20 -1 Z" fill="#DC2626" opacity="0.85" />
            <path d="M 16 -1 C 16 8, 15 16, 14 26 C 13 28, 19 28, 18 26 C 19 16, 20 8, 20 -1 Z" fill="#DC2626" opacity="0.85" />
            {/* Boca: grieta oscura desgarrada */}
            <path d="M -16 20 C -10 28, 10 28, 16 20 C 10 36, -10 36, -16 20 Z" fill="#020102" />
            <path d="M -16 20 C -10 28, 10 28, 16 20" stroke="#7F1D1D" strokeWidth="1.5" fill="none" opacity="0.7" />
          </g>
        </g>

        {/* Brazo izquierdo: garra carmesí extendida */}
        <g transform={`translate(-70, -200) rotate(${lShoulder})`}>
          <path d="M -12 2 C -14 32, -12 60, -6 88 L 17 88 C 12 60, 12 32, 12 2 Z" fill={`url(#${g("robe")})`} />
          <g transform={`translate(0, 88) rotate(${lElbow})`}>
            <path d="M -10 0 C -12 26, -10 48, -5 70 L 14 70 C 10 48, 10 26, 9 0 Z" fill={`url(#${g("robe")})`} />
            {/* Garras carmesí */}
            <g transform="translate(0, 70)">
              <path d="M -11 0 C -14 9, -12 17, -6 22 L 18 22 C 13 16, 13 9, 11 0 Z" fill="#0A0408" />
              {[0, 1, 2, 3].map((i) => {
                const x = -8 + i * 8;
                return (
                  <path
                    key={`claw-${i}`}
                    d={`M ${x} 20 C ${x - 2} 34, ${x - 5} 46, ${x - 8} 58 C ${x - 5} 60, ${x - 1} 60, ${x + 1} 56 C ${x + 4} 44, ${x + 4} 32, ${x + 4} 20 Z`}
                    fill="#7F1D1D"
                  />
                );
              })}
              <g fill="none" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
                <path d="M -10 22 C -16 30, -22 36, -30 40" />
                <path d="M 16 22 C 22 30, 30 36, 40 40" />
              </g>
            </g>
          </g>
        </g>

        {/* Brazo derecho: garra carmesí extendida */}
        <g transform={`translate(70, -200) rotate(${rShoulder})`}>
          <path d="M -12 2 C -12 32, -12 60, -16 88 L 11 88 C 11 60, 11 32, 11 2 Z" fill={`url(#${g("robe")})`} />
          <g transform={`translate(0, 88) rotate(${rElbow})`}>
            <path d="M -9 0 C -10 26, -10 48, -14 70 L 9 70 C 9 48, 9 26, 8 0 Z" fill={`url(#${g("robe")})`} />
            <g transform="translate(0, 70)">
              <path d="M -11 0 C -13 9, -11 17, -6 22 L 16 22 C 12 16, 12 9, 10 0 Z" fill="#0A0408" />
              {[0, 1, 2, 3].map((i) => {
                const x = -6 + i * 7;
                return (
                  <path
                    key={`claw-${i}`}
                    d={`M ${x} 20 C ${x - 2} 34, ${x - 5} 46, ${x - 8} 58 C ${x - 5} 60, ${x - 1} 60, ${x + 1} 56 C ${x + 4} 44, ${x + 4} 32, ${x + 4} 20 Z`}
                    fill="#7F1D1D"
                  />
                );
              })}
            </g>
          </g>
        </g>

        {/* Sangre goteando de las garras (determinista) */}
        <g fill="#DC2626">
          {bloodDrops.map((d, i) => (
            <ellipse key={`drop-${i}`} cx={d.x} cy={d.y} rx={2.4} ry={3.4} opacity={d.op} />
          ))}
        </g>
      </g>
    </svg>
  );
};

/**
 * Testigo humano detallado y articulado (NO maniquí): rostro aterrado,
 * linterna/teléfono temblando en la mano. `terror` (0..1) lo hace temblar,
 * `shadow` (0..1) es la sombra de Slenderman cerrándose sobre él.
 */
const WitnessCharacter: React.FC<{
  terror: number;
  shadow: number;
  frame: number;
  idPrefix: string;
}> = ({ terror, shadow, frame, idPrefix }) => {
  const pid = idPrefix;
  const g = (n: string) => `${pid}-${n}`;
  const tremble = Math.sin(frame * 0.9) * (0.5 + terror * 2);
  const headTilt = -terror * 10 - Math.sin(frame * 0.5) * 2;
  const lShoulder = 30 + terror * 30; // brazo con linterna tiembla y sube
  const lElbow = 14 + terror * 16;
  const rShoulder = -22 - terror * 20;
  const rElbow = -12 - terror * 12;
  const torsoLean = -terror * 12;
  const blinkPhase = frame % 80;
  const blink = blinkPhase > 72 ? 1 - Math.sin(((blinkPhase - 72) / 8) * Math.PI) : 1;
  const eyeOpen = (1 + terror * 0.5) * blink;
  const mouthOpen = 0.2 + terror * 0.7;

  return (
    <svg
      viewBox="0 0 560 760"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Testigo humano aterrado con linterna temblorosa"
    >
      <defs>
        <linearGradient id={g("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#E2C2A4" />
          <stop offset="60%" stopColor="#C08A66" />
          <stop offset="100%" stopColor="#8A5A3C" />
        </linearGradient>
        <radialGradient id={g("face")} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#EED0AE" />
          <stop offset="62%" stopColor="#C8946C" />
          <stop offset="100%" stopColor="#8A5A3C" />
        </radialGradient>
        <linearGradient id={g("hair")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3A2C1E" />
          <stop offset="55%" stopColor="#201610" />
          <stop offset="100%" stopColor="#0A0705" />
        </linearGradient>
        <linearGradient id={g("jacket")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#3A444E" />
          <stop offset="50%" stopColor="#293138" />
          <stop offset="100%" stopColor="#151B21" />
        </linearGradient>
        <linearGradient id={g("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#242E34" />
          <stop offset="100%" stopColor="#0F151A" />
        </linearGradient>
        <linearGradient id={g("mouth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0A0C" />
          <stop offset="100%" stopColor="#080203" />
        </linearGradient>
        <radialGradient id={g("beam")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F2EFE9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(280, 512) rotate(${torsoLean})`}>
        {/* Piernas */}
        <g>
          <g transform={`translate(-24, 0) rotate(${-4 - terror * 4})`}>
            <path d="M -14 0 C -16 40, -16 78, -10 112 L 14 112 C 12 78, 12 40, 12 0 Z" fill={`url(#${g("pants")})`} />
            <g transform={`translate(-1, 112) rotate(8)`}>
              <path d="M -12 0 C -13 36, -12 70, -8 100 L 13 100 C 11 70, 11 36, 10 0 Z" fill={`url(#${g("pants")})`} />
              <path d="M -9 98 L 16 98 C 18 108, 16 116, 10 120 L -12 120 C -14 112, -13 104, -9 98 Z" fill="#0A0D10" />
            </g>
          </g>
          <g transform={`translate(24, 0) rotate(${4 + terror * 4})`}>
            <path d="M -14 0 C -12 40, -12 78, -14 112 L 12 112 C 12 78, 12 40, 12 0 Z" fill={`url(#${g("pants")})`} />
            <g transform={`translate(1, 112) rotate(-8)`}>
              <path d="M -13 0 C -11 36, -11 70, -13 100 L 10 100 C 10 70, 10 36, 10 0 Z" fill={`url(#${g("pants")})`} />
              <path d="M -16 98 L 9 98 C 7 108, 9 116, 15 120 L -7 120 C -9 112, -12 104, -16 98 Z" fill="#0A0D10" />
            </g>
          </g>
        </g>

        {/* Torso: chaqueta con pliegues */}
        <g>
          <path
            d="M -58 0 C -68 -48, -74 -104, -76 -156 C -78 -188, -74 -204, -56 -210 L 56 -210 C 74 -204, 78 -188, 76 -156 C 74 -104, 68 -48, 58 0 Z"
            fill={`url(#${g("jacket")})`}
          />
          <path d="M -76 -156 C -74 -104, -68 -48, -58 0 L -30 0 C -38 -60, -44 -120, -46 -190 L -56 -210 Z" fill="#151B21" opacity="0.8" />
          <path d="M -60 -60 C -64 -110, -68 -150, -70 -195" stroke="#151B21" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M 60 -60 C 64 -110, 68 -150, 70 -195" stroke="#151B21" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M -4 -8 C -4 -60, -4 -130, -4 -196 L 4 -196 C 4 -130, 4 -60, 4 -8 Z" fill="#151B21" />
        </g>

        {/* Cabeza */}
        <g transform={`translate(0, -196) rotate(${headTilt})`}>
          <path d="M -14 0 C -14 -16, -12 -28, -10 -40 L 10 -40 C 12 -28, 14 -16, 14 0 Z" fill={`url(#${g("skin")})`} />
          <g transform="translate(0, -40)">
            <path
              d="M 0 -98 C 28 -98, 46 -88, 48 -64 C 50 -44, 48 -26, 42 -12 C 36 0, 26 8, 16 11 C 8 13, -8 13, -16 11 C -26 8, -36 0, -42 -12 C -48 -26, -50 -44, -48 -64 C -46 -88, -28 -98, 0 -98 Z"
              fill={`url(#${g("face")})`}
            />
            <path d="M -42 -12 C -36 0, -26 8, -16 11 C -8 13, 8 13, 16 11 C 26 8, 36 0, 42 -12 C 32 -4, 18 1, 0 1 C -18 1, -32 -4, -42 -12 Z" fill="#7A543C" opacity="0.5" />
            <g fill={`url(#${g("hair")})`}>
              <path d="M -48 -64 C -44 -92, -28 -102, 0 -102 C 28 -102, 44 -92, 48 -64 C 40 -80, 26 -88, 0 -88 C -26 -88, -40 -80, -48 -64 Z" />
              <path d="M -46 -60 C -38 -88, -22 -100, -4 -102 L 2 -102 C -8 -90, -18 -84, -30 -70 Z" fill="#201610" />
              <path d="M 46 -60 C 38 -88, 22 -100, 4 -102 L -2 -102 C 8 -90, 18 -84, 30 -70 Z" fill="#201610" />
              <path d="M -40 -92 C -46 -86, -50 -78, -52 -68" stroke="#201610" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${-tremble} -40 -92)`} />
              <path d="M 40 -92 C 46 -86, 50 -78, 52 -68" stroke="#201610" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${tremble} 40 -92)`} />
            </g>
            {/* Cejas alzadas por pavor */}
            <g transform={`translate(0, ${-terror * 6})`}>
              <path d="M -6 -70 C -16 -74, -24 -72, -32 -64" stroke="#1A140E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M 6 -70 C 16 -74, 24 -72, 32 -64" stroke="#1A140E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </g>
            {/* Ojos abiertos de terror */}
            <ellipse cx="-17" cy="-50" rx="11" ry={7 * eyeOpen} fill="#F4F1E8" />
            <ellipse cx="17" cy="-50" rx="11" ry={7 * eyeOpen} fill="#F4F1E8" />
            <circle cx="-17" cy="-50" r="4.4" fill="#4A2E1E" />
            <circle cx="17" cy="-50" r="4.4" fill="#4A2E1E" />
            <circle cx="-17" cy="-50" r="2" fill="#080402" />
            <circle cx="17" cy="-50" r="2" fill="#080402" />
            <circle cx="-15" cy="-52" r="1.4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="19" cy="-52" r="1.4" fill="#FFFFFF" opacity="0.9" />
            {/* Nariz */}
            <path d="M 0 -42 C -3 -38, -3 -35, 0 -31 C 1 -35, 1 -38, 0 -42 Z" fill="#B4876A" />
            {/* Boca de grito */}
            <g transform="translate(0, -16)">
              <g transform={`scale(1, ${0.2 + mouthOpen})`}>
                <path d="M -13 0 C -9 5, -3 7, 0 7 C 3 7, 9 5, 13 0 C 14 9, 10 16, 0 17 C -10 16, -14 9, -13 0 Z" fill={`url(#${g("mouth")})`} />
              </g>
            </g>
          </g>
        </g>

        {/* Brazo izquierdo: linterna/teléfono temblando */}
        <g transform={`translate(-84, -198) rotate(${lShoulder})`}>
          <path d="M -13 2 C -15 30, -14 58, -8 84 L 16 84 C 12 58, 12 30, 12 2 Z" fill={`url(#${g("jacket")})`} />
          <g transform={`translate(0, 84) rotate(${lElbow})`}>
            <path d="M -10 0 C -12 26, -11 50, -7 72 L 14 72 C 10 50, 10 26, 9 0 Z" fill={`url(#${g("jacket")})`} />
            <g transform={`translate(0, 72) translate(${tremble * 0.4}, ${tremble * 0.3})`}>
              <path d="M -11 0 C -14 9, -12 17, -7 22 L 15 22 C 12 16, 12 9, 10 0 Z" fill={`url(#${g("skin")})`} />
              {/* Linterna */}
              <g transform="translate(6, 6) rotate(-14)">
                <rect x="-8" y="-20" width="16" height="26" rx="3" fill="#1A2026" />
                <rect x="-6" y="-16" width="12" height="12" rx="2" fill="#F2EFE9" opacity="0.9" />
              </g>
              {/* Haz de luz tembloroso */}
              <g transform="translate(6, 4) rotate(-12)">
                <path d="M 0 0 L -40 -30 L 86 -110 L 86 110 L -40 30 Z" fill="url(#s5-beam)" opacity={0.2 + 0.1 * Math.sin(frame * 0.3)} />
              </g>
            </g>
          </g>
        </g>

        {/* Brazo derecho */}
        <g transform={`translate(84, -198) rotate(${rShoulder})`}>
          <path d="M -12 2 C -12 30, -12 58, -16 84 L 10 84 C 10 58, 10 30, 10 2 Z" fill={`url(#${g("jacket")})`} />
          <g transform={`translate(0, 84) rotate(${rElbow})`}>
            <path d="M -9 0 C -10 26, -10 50, -14 72 L 10 72 C 10 50, 10 26, 9 0 Z" fill={`url(#${g("jacket")})`} />
            <g transform="translate(0, 72)">
              <path d="M -10 0 C -12 9, -10 17, -5 22 L 15 22 C 12 16, 12 9, 10 0 Z" fill={`url(#${g("skin")})`} />
            </g>
          </g>
        </g>
      </g>

      {/* Sombra de Slenderman cerrándose sobre el testigo */}
      {shadow > 0.004 ? (
        <g opacity={shadow}>
          <ellipse cx="280" cy="420" rx="210" ry="330" fill="#04050A" opacity="0.85" />
          <path d="M 90 300 C 180 320, 300 340, 420 360 C 460 368, 470 400, 460 430 C 300 470, 150 460, 70 420 Z" fill="#04050A" />
        </g>
      ) : null}
    </svg>
  );
};

export const ZalgoScene5HuntRescue: React.FC = () => {
  const frame = useCurrentFrame();

  // Cámara: avance progresivo suave en eje Z (1.0 → 1.07).
  const zoom = interpolate(frame, [0, 483], [1, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Seguidores acechando (0–190), repelidos por Slenderman (165–340).
  const followerAdvance = clamp01(
    interpolate(frame, [0, 165, 340], [0, 1, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const followerRepel = clamp01(
    interpolate(frame, [210, 300], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const followerX = interpolate(frame, [0, 165, 340], [-120, 90, -140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slenderman emerge (165–210).
  const slenderEmerge = clamp01(
    interpolate(frame, [165, 210], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Niño: scared → sheltered (210).
  const childSheltered = clamp01(
    interpolate(frame, [210, 260], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const childLight = childSheltered > 0.5 ? 1 : 0.55 + 0.2 * Math.sin(frame * 0.2);
  const childX = interpolate(frame, [0, 340], [400, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Portal abriéndose (170–340).
  const portalOpen = clamp01(
    interpolate(frame, [170, 340], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Testigo (330–465).
  const witnessAppear = clamp01(
    interpolate(frame, [330, 360], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const witnessTerror = clamp01(
    interpolate(frame, [360, 420], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const witnessShadow = clamp01(
    interpolate(frame, [410, 465], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Corte diagonal de salida (465–483).
  const clash = clamp01(
    interpolate(frame, [465, 483], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const clashA = interpolate(frame, [465, 483], [1200, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const clashB = interpolate(frame, [465, 483], [-120, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parallax.
  const fgDrift = Math.sin(frame * 0.011 + 1.1) * 20;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: avance en eje Z */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "50% 55%",
        }}
      >
        {/* ============ BACKGROUND (callejón/bosque urbano nocturno) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #020304 0%, #060A0E 40%, #0B1216 70%, #040507 100%)",
            }}
          />
          {/* Edificios / árboles lejanos en penumbra */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            <g fill="#070B0F">
              <rect x="40" y="820" width="150" height="1100" />
              <rect x="220" y="700" width="120" height="1220" />
              <rect x="360" y="920" width="110" height="1000" />
              <rect x="700" y="760" width="130" height="1160" />
              <rect x="860" y="880" width="120" height="1040" />
            </g>
            <g fill="#04070A">
              {Array.from({ length: 8 }, (_, i) => {
                const x = 60 + i * 130 + ((i * 37) % 40);
                const h = 500 + ((i * 53) % 320);
                return <rect key={i} x={x} y={1920 - h} width={16 + (i % 3) * 5} height={h} />;
              })}
            </g>
            {/* Ventanas tenues */}
            <g fill="#16324A" opacity="0.5">
              <rect x="60" y="900" width="18" height="24" />
              <rect x="110" y="1040" width="18" height="24" />
              <rect x="250" y="860" width="18" height="24" />
              <rect x="740" y="940" width="18" height="24" />
              <rect x="900" y="1080" width="18" height="24" />
            </g>
          </svg>

          {/* Portal dimensional azul-cian (fondo-derecha) */}
          <Portal open={portalOpen} frame={frame} />

          {/* Niebla densa deslizándose */}
          {MIST.map((m, i) => {
            const y = ((m.y0 - frame * m.speed) % 1800 + 1800) % 1800 - 120;
            const x = m.x + Math.sin(frame * 0.012 + m.phase) * 60;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - m.r,
                  top: y - m.r * 0.4,
                  width: m.r * 2,
                  height: m.r * 0.8,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(22,33,41,0.55), transparent 72%)",
                  opacity: m.op,
                  filter: "blur(10px)",
                }}
              />
            );
          })}
        </div>

        {/* ============ MIDGROUND (seguidores, Slenderman, niño, testigo) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Niño de Luz (scared → sheltered) */}
          <div
            style={{
              position: "absolute",
              left: childX,
              top: 520,
              width: 250,
              height: 360,
            }}
          >
            <LightChildCharacter
              pose={childSheltered > 0.5 ? "sheltered" : "scared"}
              lightIntensity={childLight}
              localFrame={frame}
              idPrefix="s5-child"
            />
          </div>

          {/* Seguidores sombríos de Zalgo */}
          <div
            style={{
              position: "absolute",
              left: followerX,
              top: 560,
              width: 300,
              height: 470,
              opacity: 1,
            }}
          >
            <ZalgoFollower advance={followerAdvance} repel={followerRepel} frame={frame} idPrefix="s5-fol1" />
          </div>
          <div
            style={{
              position: "absolute",
              left: followerX - 150,
              top: 640,
              width: 260,
              height: 410,
              opacity: 0.9,
            }}
          >
            <ZalgoFollower advance={followerAdvance * 0.85} repel={followerRepel} frame={frame} idPrefix="s5-fol2" />
          </div>

          {/* Slenderman imponente entre seguidores y niño */}
          <div
            style={{
              position: "absolute",
              left: 330,
              top: 340,
              width: 420,
              height: 610,
              opacity: slenderEmerge,
            }}
          >
            <SlenderCharacter mode="battle" controlIntensity={slenderEmerge} localFrame={frame} idPrefix="s5-slender" />
          </div>

          {/* Tentáculos oscuros de Slenderman con rim cian repeliendo a los seguidores */}
          {slenderEmerge > 0.004 ? (
            <svg
              viewBox="0 0 1080 1920"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
            >
              <g opacity={slenderEmerge} fill="none" strokeLinecap="round">
                <g stroke="#05070C" strokeWidth="24">
                  <path d="M 540 565 C 470 605, 400 650, 330 780 C 290 850, 250 900, 210 940" />
                  <path d="M 545 605 C 485 660, 435 740, 380 860 C 350 940, 310 990, 270 1020" />
                  <path d="M 520 645 C 460 700, 415 800, 380 920" />
                </g>
                <g stroke="#22D3EE" strokeWidth="3" opacity="0.55">
                  <path d="M 540 565 C 470 605, 400 650, 330 780 C 290 850, 250 900, 210 940" />
                  <path d="M 545 605 C 485 660, 435 740, 380 860 C 350 940, 310 990, 270 1020" />
                </g>
              </g>
            </svg>
          ) : null}

          {/* Testigo humano aterrado (borde izquierdo) */}
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 720,
              width: 320,
              height: 440,
              opacity: witnessAppear,
            }}
          >
            <WitnessCharacter terror={witnessTerror} shadow={witnessShadow} frame={frame} idPrefix="s5-witness" />
          </div>

          {/* Zarcillos de estética oscura fluyendo del miedo del testigo hacia Slenderman */}
          {witnessTerror > 0.004 ? (
            <svg
              viewBox="0 0 1080 1920"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
            >
              <g opacity={witnessTerror * (1 - witnessShadow)} fill="none" strokeLinecap="round">
                <path d="M 300 900 C 380 880, 440 820, 500 760" stroke="#05070C" strokeWidth="10" />
                <path d="M 300 900 C 380 880, 440 820, 500 760" stroke="#22D3EE" strokeWidth="1.6" opacity="0.5" />
                <path d="M 300 940 C 390 930, 460 880, 520 820" stroke="#05070C" strokeWidth="8" />
                <path d="M 300 980 C 400 980, 470 940, 530 890" stroke="#05070C" strokeWidth="7" />
              </g>
            </svg>
          ) : null}
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Siluetas de verjas/ramas urbanas en los bordes */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift}px)`, filter: "blur(4px)" }}
          >
            {/* Verja izquierda */}
            <g stroke="#020305" strokeWidth="14">
              <path d="M -20 300 L 120 320 L 116 340 L -20 320 Z" fill="#020305" stroke="none" />
              <path d="M -20 340 L 96 360 L 92 380 L -20 360 Z" fill="#020305" stroke="none" />
              <path d="M -20 380 L 72 400 L 68 420 L -20 400 Z" fill="#020305" stroke="none" />
              <path d="M 0 260 C 60 290, 120 330, 170 390" fill="none" />
              <path d="M 0 200 C 40 240, 80 300, 110 360" fill="none" />
            </g>
            {/* Rama derecha */}
            <g stroke="#020305" strokeWidth="16">
              <path d="M 1120 240 C 1040 280, 960 340, 900 420" fill="none" />
              <path d="M 1000 300 C 960 320, 920 360, 890 420" fill="none" strokeWidth="9" />
              <path d="M 1080 360 C 1030 400, 990 450, 970 520" fill="none" strokeWidth="8" />
            </g>
          </svg>

          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
        </div>
      </AbsoluteFill>

      {/* Transición espacial de salida: corte diagonal carmesí vs. azul abisal */}
      {clash > 0.004 ? (
        <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {/* Banda carmesí */}
            <polygon
              points={`0,0 ${clashA},0 ${clashA},1920 0,1920`}
              fill="#7F1D1D"
              opacity={clash}
            />
            {/* Banda azul abisal */}
            <polygon
              points={`${clashB},0 1080,0 1080,1920 ${clashB},1920`}
              fill="#0A2030"
              opacity={clash}
            />
            {/* Línea de corte brillante */}
            <line x1={clashA} y1="0" x2={clashB} y2="1920" stroke="#F43F5E" strokeWidth="6" opacity={clash} />
            <line x1={clashA + 8} y1="0" x2={clashB + 8} y2="1920" stroke="#22D3EE" strokeWidth="3" opacity={clash * 0.7} />
          </svg>
        </AbsoluteFill>
      ) : null}

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.3) 0%, transparent 22%, transparent 60%, rgba(4,5,7,0.82) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
