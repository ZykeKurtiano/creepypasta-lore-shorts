import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { LightChildCharacter } from "../components/characters/LightChildCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";

/**
 * ZalgoScene1Mystery (frames 0–380, 0.00–12.67s) — El Misterio de Slenderman.
 *
 * Bosque nocturno abisal en azul-negro. Slenderman se aleja suavemente hacia
 * un portal dimensional azul-dorado llevando de la mano a un Niño de Luz
 * (aura cálida dorada). Un intruso humano detallado y articulado intenta
 * acercarse al bosque por la izquierda-frente; uno de los tentáculos oscuros
 * de Slenderman lo detiene y envuelve en las sombras mientras retrocede
 * horrorizado. Al final un destello carmesí rasga el fondo y emerge el contorno
 * de un monitor CRT de escritorio hacia cuya pantalla la cámara hace zoom
 * espacial (dive) en los últimos 28 frames.
 *
 * Cámara: única intención — dolly-in lento envolvente (1.0 → 1.09) que culmina
 * en el dive espacial hacia el CRT. Cero `frame % N` shake/zoom periódico.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Esporas de luz lejanas (background, deterministas, sin Math.random). */
const SPORES = Array.from({ length: 26 }, (_, i) => ({
  x: random(i * 3.1 + 1) * 1080,
  y0: random(i * 7.3 + 2) * 1500,
  r: 1.4 + random(i * 5.1 + 3) * 2.4,
  speed: 0.14 + random(i * 9.7 + 4) * 0.24,
  phase: random(i * 13.7 + 5) * Math.PI * 2,
  op: 0.08 + random(i * 17.3 + 6) * 0.22,
}));

/** Esporas frontales más grandes y rápidas (foreground, parallax 1.3x). */
const FG_SPORES = Array.from({ length: 14 }, (_, i) => ({
  x: random(i * 11.9 + 2) * 1080,
  y0: random(i * 5.3 + 7) * 1700,
  r: 2.2 + random(i * 7.7 + 9) * 3.4,
  speed: 0.5 + random(i * 13.1 + 4) * 0.8,
  phase: random(i * 17.9 + 11) * Math.PI * 2,
  op: 0.12 + random(i * 19.7 + 3) * 0.2,
}));

/** Portal dimensional azul-dorado (se abre progresivamente con `open` 0..1). */
const Portal: React.FC<{ open: number; frame: number }> = ({ open, frame }) => {
  const swirl = frame * 0.02;
  const ringRot = frame * 0.35;
  const r = 34 + open * 200;
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
      role="img"
      aria-label="Portal dimensional luminoso azul-dorado"
    >
      <defs>
        <radialGradient id="s1-portal-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.95" />
          <stop offset="34%" stopColor="#7FB2F0" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#16324A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#040507" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s1-portal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#16324A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#040507" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo difuso */}
      <circle cx="886" cy="640" r={140 + open * 220} fill="url(#s1-portal-glow)" opacity={0.3 + open * 0.7} />
      {/* Núcleo brillante */}
      <circle cx="886" cy="640" r={r} fill="url(#s1-portal-core)" opacity={open} />
      {/* Anillos de acreción dorado-cian giratorios */}
      <g transform={`translate(886 640) rotate(${ringRot})`} fill="none" opacity={open}>
        <ellipse rx={r * 1.35} ry={r * 0.42} stroke="#FDE047" strokeWidth="3" opacity="0.8" />
        <ellipse rx={r * 1.12} ry={r * 0.34} stroke="#22D3EE" strokeWidth="2.4" opacity="0.6" />
        <ellipse rx={r * 0.9} ry={r * 0.26} stroke="#7FB2F0" strokeWidth="1.8" opacity="0.45" />
      </g>
      {/* Remolino interno */}
      <g transform={`translate(886 640) rotate(${swirl * 20})`} fill="none" opacity={open * 0.8}>
        {[0, 1, 2].map((k) => (
          <path
            key={k}
            d={`M 0 0 C ${18 + k * 10} ${-30 - k * 14}, ${30 + k * 16} ${-18 - k * 10}, ${
              26 + k * 8
            } ${8 + k * 6} C ${20 + k * 6} ${26 + k * 8}, ${-8 - k * 4} ${26 + k * 8}, ${
              -22 - k * 8
            } ${10 + k * 4}`}
            stroke={k % 2 === 0 ? "#FDE047" : "#7FB2F0"}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={0.6 - k * 0.14}
          />
        ))}
      </g>
    </svg>
  );
};

/**
 * Intruso humano detallado y articulado (NO silueta maniquí): chaqueta con
 * capucha, rostro expresivo, linterna en mano y brazos articulados `<g>`.
 * `horror` (0..1) lo hace retroceder y cubrirse conforme los tentáculos lo
 * envuelven en las sombras.
 */
const Intruder: React.FC<{ horror: number; localFrame: number }> = ({ horror, localFrame }) => {
  const frame = localFrame;
  const tremble = Math.sin(frame * 0.8) * (0.5 + horror * 1.6);
  const torsoLean = -horror * 16;
  const headTilt = -horror * 10 - Math.sin(frame * 0.5) * 2;
  const lShoulder = 24 + horror * 46; // brazo con linterna sube a apuntar/defenderse
  const lElbow = 10 + horror * 18;
  const rShoulder = -34 - horror * 58; // brazo defensivo alza hacia el rostro
  const rElbow = -20 - horror * 30;
  const blinkPhase = frame % 90;
  const blink = blinkPhase > 82 ? 1 - Math.sin(((blinkPhase - 82) / 8) * Math.PI) : 1;
  const eyeOpen = (1 + horror * 0.4) * blink;
  const mouthOpen = 0.18 + horror * 0.72;

  return (
    <svg
      viewBox="0 0 560 760"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Intruso humano con linterna retrocediendo horrorizado"
    >
      <defs>
        <linearGradient id="s1-i-skin" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#E2C2A4" />
          <stop offset="60%" stopColor="#C08A66" />
          <stop offset="100%" stopColor="#8A5A3C" />
        </linearGradient>
        <radialGradient id="s1-i-face" cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#EED0AE" />
          <stop offset="62%" stopColor="#C8946C" />
          <stop offset="100%" stopColor="#8A5A3C" />
        </radialGradient>
        <linearGradient id="s1-i-hair" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3A2C1E" />
          <stop offset="55%" stopColor="#201610" />
          <stop offset="100%" stopColor="#0A0705" />
        </linearGradient>
        <linearGradient id="s1-i-jacket" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#3A4A40" />
          <stop offset="50%" stopColor="#293630" />
          <stop offset="100%" stopColor="#16201B" />
        </linearGradient>
        <linearGradient id="s1-i-jacket-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E1512" />
          <stop offset="100%" stopColor="#060A08" />
        </linearGradient>
        <linearGradient id="s1-i-pants" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#242E34" />
          <stop offset="100%" stopColor="#0F151A" />
        </linearGradient>
        <linearGradient id="s1-i-mouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0A0C" />
          <stop offset="100%" stopColor="#080203" />
        </linearGradient>
        <radialGradient id="s1-i-beam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F2EFE9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(280, 512) rotate(${torsoLean})`}>
        {/* Piernas braced en postura tensa */}
        <g>
          <g transform={`translate(-24, 0) rotate(${-4 - horror * 6})`}>
            <path d="M -14 0 C -16 40, -16 78, -10 112 L 14 112 C 12 78, 12 40, 12 0 Z" fill={`url(#s1-i-pants)`} />
            <g transform={`translate(-1, 112) rotate(8)`}>
              <path d="M -12 0 C -13 36, -12 70, -8 100 L 13 100 C 11 70, 11 36, 10 0 Z" fill={`url(#s1-i-pants)`} />
              <path d="M -9 98 L 16 98 C 18 108, 16 116, 10 120 L -12 120 C -14 112, -13 104, -9 98 Z" fill="#0A0D10" />
            </g>
          </g>
          <g transform={`translate(24, 0) rotate(${4 + horror * 6})`}>
            <path d="M -14 0 C -12 40, -12 78, -14 112 L 12 112 C 12 78, 12 40, 12 0 Z" fill={`url(#s1-i-pants)`} />
            <g transform={`translate(1, 112) rotate(-8)`}>
              <path d="M -13 0 C -11 36, -11 70, -13 100 L 10 100 C 10 70, 10 36, 10 0 Z" fill={`url(#s1-i-pants)`} />
              <path d="M -16 98 L 9 98 C 7 108, 9 116, 15 120 L -7 120 C -9 112, -12 104, -16 98 Z" fill="#0A0D10" />
            </g>
          </g>
        </g>

        {/* Torso: chaqueta con capucha y pliegues */}
        <g>
          <path
            d="M -58 0 C -68 -48, -74 -104, -76 -156 C -78 -188, -74 -204, -56 -210 L 56 -210 C 74 -204, 78 -188, 76 -156 C 74 -104, 68 -48, 58 0 Z"
            fill={`url(#s1-i-jacket)`}
          />
          <path d="M -76 -156 C -74 -104, -68 -48, -58 0 L -30 0 C -38 -60, -44 -120, -46 -190 L -56 -210 Z" fill={`url(#s1-i-jacket-shadow)`} opacity="0.8" />
          <path d="M -60 -60 C -64 -110, -68 -150, -70 -195" stroke="#0E1512" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M -40 -30 C -44 -90, -48 -150, -50 -198" stroke="#0E1512" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M 40 -30 C 44 -90, 48 -150, 50 -198" stroke="#0E1512" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M 60 -60 C 64 -110, 68 -150, 70 -195" stroke="#0E1512" strokeWidth="3" fill="none" opacity="0.55" />
          {/* Cremallera central */}
          <path d="M -4 -8 C -4 -60, -4 -130, -4 -196 L 4 -196 C 4 -130, 4 -60, 4 -8 Z" fill="#16201B" />
          <path d="M 0 -10 C 0 -70, 0 -140, 0 -198" stroke="#4C5A52" strokeWidth="1.2" fill="none" opacity="0.4" />
          {/* Bolsillos */}
          <path d="M -52 -24 L -30 -30 L -24 -8 L -48 -4 Z" fill="#16201B" opacity="0.85" />
          <path d="M 52 -24 L 30 -30 L 24 -8 L 48 -4 Z" fill="#16201B" opacity="0.85" />
          {/* Capucha caída */}
          <path
            d="M -44 -196 C -50 -176, -50 -156, -46 -138 C -30 -152, -18 -158, 0 -158 C 18 -158, 30 -152, 46 -138 C 50 -156, 50 -176, 44 -196 C 34 -208, 22 -212, 0 -212 C -22 -212, -34 -208, -44 -196 Z"
            fill="#293630"
          />
          {/* Rim light frío (bosque) */}
          <path d="M 76 -156 C 78 -188, 74 -204, 56 -210 L 32 -210 L 44 -160 Z" fill="#22D3EE" opacity="0.28" />
        </g>

        {/* Cabeza (cuello → rostro expresivo) */}
        <g transform={`translate(0, -196) rotate(${headTilt})`}>
          <path d="M -14 0 C -14 -16, -12 -28, -10 -40 L 10 -40 C 12 -28, 14 -16, 14 0 Z" fill={`url(#s1-i-skin)`} />
          <g transform="translate(0, -40)">
            <path
              d="M 0 -98 C 28 -98, 46 -88, 48 -64 C 50 -44, 48 -26, 42 -12 C 36 0, 26 8, 16 11 C 8 13, -8 13, -16 11 C -26 8, -36 0, -42 -12 C -48 -26, -50 -44, -48 -64 C -46 -88, -28 -98, 0 -98 Z"
              fill={`url(#s1-i-face)`}
            />
            <path d="M -42 -12 C -36 0, -26 8, -16 11 C -8 13, 8 13, 16 11 C 26 8, 36 0, 42 -12 C 32 -4, 18 1, 0 1 C -18 1, -32 -4, -42 -12 Z" fill="#7A543C" opacity="0.5" />
            {/* Cabello despeinado */}
            <g fill={`url(#s1-i-hair)`}>
              <path d="M -48 -64 C -44 -92, -28 -102, 0 -102 C 28 -102, 44 -92, 48 -64 C 40 -80, 26 -88, 0 -88 C -26 -88, -40 -80, -48 -64 Z" />
              <path d="M -46 -60 C -38 -88, -22 -100, -4 -102 L 2 -102 C -8 -90, -18 -84, -30 -70 Z" fill="#201610" />
              <path d="M 46 -60 C 38 -88, 22 -100, 4 -102 L -2 -102 C 8 -90, 18 -84, 30 -70 Z" fill="#201610" />
              <path d="M -40 -92 C -46 -86, -50 -78, -52 -68" stroke="#201610" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${-tremble} -40 -92)`} />
              <path d="M 40 -92 C 46 -86, 50 -78, 52 -68" stroke="#201610" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${tremble} 40 -92)`} />
            </g>
            {/* Cejas alzadas por el pavor */}
            <g transform={`translate(0, ${-horror * 6})`}>
              <path d="M -6 -70 C -16 -74, -24 -72, -32 -64" stroke="#1A140E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              <path d="M 6 -70 C 16 -74, 24 -72, 32 -64" stroke="#1A140E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            </g>
            {/* Ojos abiertos de terror */}
            <g>
              <ellipse cx="-17" cy="-50" rx="11" ry={7 * eyeOpen} fill="#F4F1E8" />
              <ellipse cx="17" cy="-50" rx="11" ry={7 * eyeOpen} fill="#F4F1E8" />
              <circle cx="-17" cy="-50" r="4.4" fill="#4A2E1E" />
              <circle cx="17" cy="-50" r="4.4" fill="#4A2E1E" />
              <circle cx="-17" cy="-50" r="2" fill="#080402" />
              <circle cx="17" cy="-50" r="2" fill="#080402" />
              <circle cx="-15" cy="-52" r="1.4" fill="#FFFFFF" opacity="0.9" />
              <circle cx="19" cy="-52" r="1.4" fill="#FFFFFF" opacity="0.9" />
              <ellipse cx="-17" cy="-53" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
              <ellipse cx="17" cy="-53" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
            </g>
            {/* Nariz */}
            <path d="M 0 -42 C -3 -38, -3 -35, 0 -31 C 1 -35, 1 -38, 0 -42 Z" fill="#B4876A" />
            {/* Boca de grito */}
            <g transform="translate(0, -16)">
              <g transform={`scale(1, ${0.2 + mouthOpen})`}>
                <path d="M -13 0 C -9 5, -3 7, 0 7 C 3 7, 9 5, 13 0 C 14 9, 10 16, 0 17 C -10 16, -14 9, -13 0 Z" fill={`url(#s1-i-mouth)`} />
              </g>
              <path d="M -13 -1 C -11 -4, -8 -5, -5 -4" stroke="#6E4C3A" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 13 -1 C 11 -4, 8 -5, 5 -4" stroke="#6E4C3A" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* Brazo izquierdo: sostiene la linterna (apunta hacia el bosque) */}
        <g transform={`translate(-84, -198) rotate(${lShoulder})`}>
          <path d="M -13 2 C -15 30, -14 58, -8 84 L 16 84 C 12 58, 12 30, 12 2 Z" fill={`url(#s1-i-jacket)`} />
          <path d="M -13 2 C -15 30, -14 58, -8 84" stroke="#0E1512" strokeWidth="2" fill="none" opacity="0.5" />
          <g transform={`translate(0, 84) rotate(${lElbow})`}>
            <path d="M -10 0 C -12 26, -11 50, -7 72 L 14 72 C 10 50, 10 26, 9 0 Z" fill={`url(#s1-i-jacket)`} />
            {/* Mano + linterna */}
            <g transform="translate(0, 72)">
              <path d="M -11 0 C -14 9, -12 17, -7 22 L 15 22 C 12 16, 12 9, 10 0 Z" fill={`url(#s1-i-skin)`} />
              <path d="M -9 22 C -11 30, -11 36, -8 41 L -2 41 C -2 34, -1 30, 0 22 Z" fill={`url(#s1-i-skin)`} />
              <path d="M -1 22 C -1 31, 0 38, 3 43 L 8 43 C 8 36, 8 30, 8 22 Z" fill={`url(#s1-i-skin)`} />
              {/* Linterna */}
              <g transform="translate(6, 6) rotate(-14)">
                <rect x="-8" y="-20" width="16" height="26" rx="3" fill="#1A2026" />
                <rect x="-6" y="-16" width="12" height="12" rx="2" fill="#F2EFE9" opacity="0.9" />
                <circle cx="0" cy="-10" r="4" fill="#FDE047" />
              </g>
              {/* Haz de luz de la linterna */}
              <g transform="translate(6, 4) rotate(-12)">
                <path d="M 0 0 L -42 -34 L 90 -120 L 90 120 L -42 34 Z" fill="url(#s1-i-beam)" opacity={0.28 + 0.12 * Math.sin(frame * 0.04)} />
              </g>
            </g>
          </g>
        </g>

        {/* Brazo derecho: alza defensivo hacia el rostro */}
        <g transform={`translate(84, -198) rotate(${rShoulder})`}>
          <path d="M -12 2 C -12 30, -12 58, -16 84 L 10 84 C 10 58, 10 30, 10 2 Z" fill={`url(#s1-i-jacket)`} />
          <g transform={`translate(0, 84) rotate(${rElbow})`}>
            <path d="M -9 0 C -10 26, -10 50, -14 72 L 10 72 C 10 50, 10 26, 9 0 Z" fill={`url(#s1-i-jacket)`} />
            <g transform="translate(0, 72)">
              <path d="M -10 0 C -12 9, -10 17, -5 22 L 15 22 C 12 16, 12 9, 10 0 Z" fill={`url(#s1-i-skin)`} />
              <path d="M -8 22 C -10 30, -10 36, -7 41 L -1 41 C -1 34, 0 30, 1 22 Z" fill={`url(#s1-i-skin)`} />
              <path d="M 1 22 C 2 31, 3 38, 6 43 L 11 43 C 11 36, 11 30, 11 22 Z" fill={`url(#s1-i-skin)`} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

/** Monitor CRT de escritorio retro que emerge en la penumbra (dive final). */
const CrtMonitor: React.FC<{ appear: number; frame: number }> = ({ appear, frame }) => {
  const flicker = 0.7 + 0.3 * Math.sin(frame * 0.12) * Math.abs(Math.sin(frame * 0.043));
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
      role="img"
      aria-label="Monitor CRT de escritorio encendido en la penumbra"
    >
      <defs>
        <radialGradient id="s1-crt-screen" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#AEE7EE" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#3E8FA0" stopOpacity="0.6" />
          <stop offset="72%" stopColor="#0B2329" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#04090B" />
        </radialGradient>
        <linearGradient id="s1-crt-bezel" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#2A3136" />
          <stop offset="50%" stopColor="#14181B" />
          <stop offset="100%" stopColor="#07090B" />
        </linearGradient>
      </defs>
      <g opacity={appear}>
        {/* Cuerpo del monitor */}
        <rect x="270" y="780" width="540" height="440" rx="34" fill="url(#s1-crt-bezel)" />
        <rect x="300" y="812" width="480" height="360" rx="18" fill="url(#s1-crt-screen)" />
        {/* Líneas de escaneo del CRT */}
        <g opacity={0.35 * flicker} stroke="#0B2329" strokeWidth="2">
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1="300" y1={828 + i * 26} x2="780" y2={828 + i * 26} opacity={0.4 + (i % 3) * 0.2} />
          ))}
        </g>
        {/* Glifo distorsionado tenue en la pantalla (anticipa a Zalgo) */}
        <text x="540" y="1020" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="46" fontWeight="700" fill="#7F1D1D" opacity={0.5 * appear}>
          Z̷A̶L̷G̶O̷
        </text>
        {/* Base */}
        <rect x="470" y="1220" width="140" height="28" rx="8" fill="#0D1113" />
        <rect x="500" y="1248" width="80" height="18" rx="6" fill="#080B0D" />
        {/* Halo del monitor */}
        <ellipse cx="540" cy="990" rx="330" ry="280" fill="#22D3EE" opacity={0.1 * appear} filter="blur(30px)" />
      </g>
    </svg>
  );
};

export const ZalgoScene1Mystery: React.FC = () => {
  const frame = useCurrentFrame();

  // Dolly-in lento y envolvente (1.0 → 1.09), única intención de cámara.
  const dolly = interpolate(frame, [0, 380], [1, 1.09], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dive espacial hacia el CRT en los últimos 28 frames (352–380).
  const dive = clamp01(
    interpolate(frame, [352, 380], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const scale = dolly * (1 + dive * 1.35);

  // Portal abriéndose progresivamente (60–300).
  const portalOpen = clamp01(
    interpolate(frame, [60, 300], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Aparición del intruso (110) y horror al ser envuelto (110–250).
  const intruderAppear = clamp01(
    interpolate(frame, [110, 130], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const intruderHorror = clamp01(
    interpolate(frame, [140, 250], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  // El intruso se acerca (110–140) y luego retrocede horrorizado (140–250).
  const intruderX = interpolate(frame, [110, 140, 250], [40, 130, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slenderman + Niño se alejan suavemente hacia el portal (deriva lenta).
  const walkDrift = interpolate(frame, [0, 380], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const walkBob = Math.sin(frame * 0.06) * 3;

  // Destello carmesí que rasga el fondo (290–310) + aparición del CRT (290–340).
  const crimsonFlash = clamp01(
    interpolate(frame, [290, 300, 314], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const crtAppear = clamp01(
    interpolate(frame, [294, 336], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Parallax por capa.
  const bgDrift = Math.sin(frame * 0.006) * 8;
  const fgDrift = Math.sin(frame * 0.011 + 1.2) * 22;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia de la escena */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50% 60%",
        }}
      >
        {/* ============ BACKGROUND (parallax lento 0.15x–0.35x) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #040507 0%, #0A1014 46%, #162129 74%, #040507 100%)",
            }}
          />
          {/* Luna fría velada */}
          <div
            style={{
              position: "absolute",
              left: 130,
              top: 260,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(226,224,215,0.4) 0%, rgba(180,200,215,0.12) 46%, transparent 72%)",
              filter: "blur(3px)",
            }}
          />
          {/* Bruma densa trasera animada */}
          <div
            style={{
              position: "absolute",
              left: -420 + bgDrift * 2,
              top: 620,
              width: 1800,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(22,33,41,0.85) 0%, rgba(22,33,41,0.4) 46%, transparent 72%)",
              filter: "blur(34px)",
              opacity: 0.5 + 0.2 * Math.sin(frame * 0.008),
            }}
          />
          {/* Troncos lejanos del bosque (siluetas) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${bgDrift}px)` }}
          >
            <g fill="#0E1820">
              {Array.from({ length: 9 }, (_, i) => {
                const x = 40 + i * 128 + ((i * 37) % 40);
                const h = 700 + ((i * 53) % 380);
                return <rect key={i} x={x} y={1920 - h} width={18 + (i % 3) * 6} height={h} />;
              })}
            </g>
            <g fill="none" stroke="#12202A" strokeWidth="6" opacity="0.6">
              {[0, 1, 2, 3, 4].map((i) => {
                const x = 140 + i * 210;
                return <path key={i} d={`M ${x} 1080 C ${x - 50} 1200, ${x + 50} 1320, ${x} 1460`} />;
              })}
            </g>
          </svg>

          {/* Portal dimensional azul-dorado (fondo-derecha) */}
          <Portal open={portalOpen} frame={frame} />
        </div>

        {/* ============ MIDGROUND (personajes articulados) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Slenderman alejándose hacia el portal (deriva + balanceo) */}
          <div
            style={{
              position: "absolute",
              left: 540 + walkDrift,
              top: 400 + walkBob,
              width: 420,
              height: 610,
              transform: "translateX(-50%)",
            }}
          >
            <SlenderCharacter mode="finale" controlIntensity={0.15} localFrame={frame} idPrefix="s1-slender" />
          </div>

          {/* Niño de Luz llevado de la mano (aura cálida dorada) */}
          <div
            style={{
              position: "absolute",
              left: 380 + walkDrift,
              top: 640 + walkBob * 0.7,
              width: 205,
              height: 300,
              transform: "translateX(-50%)",
            }}
          >
            <LightChildCharacter pose="walkingHand" lightIntensity={0.95} localFrame={frame} idPrefix="s1-child" />
          </div>

          {/* Intruso humano detallado y articulado (izquierda-frente) */}
          <div
            style={{
              position: "absolute",
              left: 40 + intruderX,
              top: 660,
              width: 400,
              height: 540,
              opacity: intruderAppear,
            }}
          >
            <Intruder horror={intruderHorror} localFrame={frame} />
          </div>

          {/* Tentáculos oscuros de Slenderman que envuelven al intruso */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
          >
            <g fill="none" strokeLinecap="round" opacity={intruderHorror}>
              <g stroke="#05070C" strokeWidth="26">
                <path d="M 760 560 C 660 600, 560 700, 470 850 C 420 940, 360 980, 300 1000" />
                <path d="M 780 620 C 700 700, 620 820, 540 960 C 490 1050, 430 1090, 370 1110" />
                <path d="M 740 690 C 680 800, 620 920, 560 1040 C 520 1120, 470 1160, 420 1170" />
              </g>
              {/* Rim cian frío en el borde de los tentáculos */}
              <g stroke="#22D3EE" strokeWidth="3" opacity="0.4">
                <path d="M 760 560 C 660 600, 560 700, 470 850 C 420 940, 360 980, 300 1000" />
                <path d="M 780 620 C 700 700, 620 820, 540 960 C 490 1050, 430 1090, 370 1110" />
              </g>
              {/* Espiral de sombra envolvente alrededor del torso del intruso */}
              <g stroke="#04060A" strokeWidth="18">
                <path d="M 300 900 C 220 920, 180 1000, 200 1080 C 220 1160, 300 1180, 360 1140" />
                <path d="M 360 1140 C 300 1200, 200 1200, 150 1120" />
              </g>
            </g>
          </svg>

          {/* Contorno del monitor CRT que emerge al final (dive) */}
          <CrtMonitor appear={crtAppear} frame={frame} />
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Troncos y ramas oscuras desenfocadas en los laterales */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift}px)`, filter: "blur(5px)" }}
          >
            {/* Tronco izquierdo retorcido */}
            <path d="M -20 0 L -10 420 L 22 440 L -6 860 L 26 880 L -14 1320 L 18 1340 L -2 1920 L 96 1920 L 76 1380 L 92 700 L 64 320 L 88 0 Z" fill="#020305" />
            <path d="M 56 620 L 210 570 L 218 620 L 66 674 Z" fill="#020305" />
            <path d="M 44 1180 L 180 1240 L 190 1290 L 56 1246 Z" fill="#020305" />
            {/* Tronco derecho retorcido */}
            <path d="M 1100 0 L 1092 420 L 1060 444 L 1092 820 L 1058 854 L 1098 1260 L 1064 1294 L 1088 1920 L 986 1920 L 1002 1340 L 972 720 L 1004 330 L 978 0 Z" fill="#020305" />
            <path d="M 1008 860 L 884 820 L 890 868 L 1004 908 Z" fill="#020305" />
            <path d="M 1030 1470 L 918 1528 L 926 1576 L 1040 1522 Z" fill="#020305" />
          </svg>

          {/* Niebla frontal */}
          <div
            style={{
              position: "absolute",
              left: -420 + fgDrift,
              top: 1280,
              width: 1800,
              height: 640,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(22,33,41,0.7) 0%, rgba(22,33,41,0.32) 46%, transparent 72%)",
              filter: "blur(40px)",
              opacity: 0.5,
            }}
          />

          {/* Esporas frontales grandes (parallax rápido) */}
          {FG_SPORES.map((p, i) => {
            const y = ((p.y0 - frame * p.speed) % 2000 + 2000) % 2000 - 80;
            const x = p.x + Math.sin(frame * 0.02 + p.phase) * 34;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: p.r,
                  height: p.r,
                  borderRadius: "50%",
                  background: "#CFE3F5",
                  opacity: p.op,
                  boxShadow: "0 0 8px rgba(190,220,245,0.6)",
                  filter: "blur(1px)",
                }}
              />
            );
          })}
        </div>

        {/* Esporas de luz lejanas (background, lentas) */}
        <div data-layer="background" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {SPORES.map((p, i) => {
            const y = ((p.y0 - frame * p.speed) % 1800 + 1800) % 1800 - 80;
            const x = p.x + Math.sin(frame * 0.014 + p.phase) * 26;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: p.r * 2,
                  height: p.r * 2,
                  borderRadius: p.r,
                  background: "#AECFE8",
                  opacity: p.op * (0.6 + 0.4 * Math.sin(frame * 0.04 + i)),
                  boxShadow: "0 0 6px rgba(174,207,232,0.5)",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Destello carmesí que rasga el fondo */}
      {crimsonFlash > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(220,38,38,0.5) 0%, rgba(127,29,29,0.24) 45%, transparent 72%)",
            mixBlendMode: "screen",
            opacity: crimsonFlash,
          }}
        />
      ) : null}

      {/* Dive espacial: borde del CRT que se cierra + resplandor de pantalla */}
      {dive > 0.004 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(174,231,238,0.3) 0%, rgba(11,35,41,0.9) 46%, #04090B 78%)",
              opacity: dive,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 1900 * (1 - dive),
              marginTop: -950 * (1 - dive) + 960,
              background: "#07090B",
              opacity: dive,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.35) 0%, transparent 22%, transparent 60%, rgba(4,5,7,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
