import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
} from "remotion";
import { AnimatorCharacter } from "../components/characters/AnimatorCharacter";

/**
 * ZalgoScene2Origin (frames 380–908, 12.67–30.27s) — Origen 27 de julio de 2004.
 *
 * Estudio nocturno de 2004: Dave Kelly dibuja una viñeta inocente en su tableta
 * mientras la tinta negra invade su escritorio (corrupción 0 → 1). En el plano
 * central, una tira cómica de periódico se corrompe en 2 fases animadas: primero
 * dos personajes clásicos estilo Archie/Nancy cuya tinta se deforma en vivo;
 * después un gato anaranjado (estilo Garfield) cuyos ojos se vacían en cuencas
 * negras llorando sangre y tinta, con glifos Zalgo invadiendo el papel. Cierra
 * con un camera dive dentro del charco de tinta que brota de los ojos vacíos.
 *
 * Cámara: única intención — emerge del zoom del monitor CRT, dolly-in suave
 * (1.0 → 1.07) y camera dive espacial en los últimos 34 frames.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Polvo iluminado determinista (sin Math.random). */
const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: random(i * 3.1 + 1) * 1080,
  y0: random(i * 7.3 + 2) * 1350,
  r: 1.5 + random(i * 5.1 + 3) * 2.2,
  speed: 0.12 + random(i * 9.7 + 4) * 0.2,
  phase: random(i * 13.7 + 5) * 300,
  op: 0.06 + random(i * 17.3 + 6) * 0.16,
}));

/** Libros de la estantería de tintas (colores apagados deterministas). */
const BOOKS = Array.from({ length: 16 }, (_, i) => ({
  x: 30 + (i % 5) * 34 + random(i * 11.3 + 2) * 8,
  w: 22 + random(i * 5.7 + 9) * 12,
  h: 84 + random(i * 3.3 + 7) * 42,
  row: Math.floor(i / 5),
  hue: ["#1A2A34", "#2A1F22", "#3A3224", "#1F2A24", "#2E2633", "#20222E"][
    Math.floor(random(i * 17.9 + 1) * 6)
  ],
}));

/** Pareja clásica de tira cómica estilo Archie/Nancy (expresiones alegres). */
const ClassicPair: React.FC<{ deform: number; frame: number }> = ({ deform, frame }) => {
  const wave = Math.sin(frame * 0.07) * 2.4 * deform;
  const inkDrop = Math.sin(frame * 0.05 + 1.3) * 2 * deform;
  return (
    <g transform={`translate(205 250)`}>
      {/* Chico clásico (pelo pompadour rojizo) */}
      <g transform={`translate(-72 0) rotate(${wave * 0.5})`}>
        {/* Cuerpo con jersey universitario */}
        <path d="M -34 10 C -38 -30, -34 -60, -22 -78 L 22 -78 C 34 -60, 38 -30, 34 10 C 26 22, -26 22, -34 10 Z" fill="#2A5A8C" />
        <path d="M -8 -78 C -8 -30, -8 0, -8 22 L 8 22 C 8 0, 8 -30, 8 -78 Z" fill="#F2EFE9" opacity="0.85" />
        {/* Cuello */}
        <rect x="-14" y="-82" width="28" height="12" rx="5" fill="#E2C2A4" />
        {/* Cabeza */}
        <g transform="translate(0 -96)">
          <path d="M 0 -46 C 20 -46, 34 -38, 35 -22 C 36 -8, 34 4, 28 12 C 20 20, -20 20, -28 12 C -34 4, -36 -8, -35 -22 C -34 -38, -20 -46, 0 -46 Z" fill="#EEC39A" />
          {/* Pompadour rojizo */}
          <g fill="#C25E2A">
            <path d="M -35 -22 C -36 -44, -20 -56, 0 -56 C 22 -56, 34 -46, 34 -30 C 26 -42, 12 -48, 0 -46 C -12 -48, -26 -42, -35 -22 Z" />
            <path d="M -32 -26 C -30 -44, -18 -52, -2 -52 C 10 -52, 22 -46, 28 -34 C 18 -40, 6 -42, -6 -40 C -18 -38, -28 -34, -32 -26 Z" fill="#A84C1F" />
          </g>
          {/* Ojos grandes alegres */}
          <ellipse cx="-12" cy="-18" rx="6" ry="7" fill="#FFF7E8" />
          <ellipse cx="12" cy="-18" rx="6" ry="7" fill="#FFF7E8" />
          <circle cx="-11" cy="-17" r="2.6" fill="#241A10" />
          <circle cx="13" cy="-17" r="2.6" fill="#241A10" />
          <circle cx="-10" cy="-20" r="1" fill="#FFFFFF" />
          <circle cx="14" cy="-20" r="1" fill="#FFFFFF" />
          {/* Cejas */}
          <path d="M -18 -28 C -14 -32, -8 -33, -4 -31" stroke="#A84C1F" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 18 -28 C 14 -32, 8 -33, 4 -31" stroke="#A84C1F" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Pequitas */}
          <circle cx="-16" cy="-10" r="0.9" fill="#C98A5A" />
          <circle cx="-11" cy="-7" r="0.9" fill="#C98A5A" />
          <circle cx="12" cy="-10" r="0.9" fill="#C98A5A" />
          <circle cx="17" cy="-7" r="0.9" fill="#C98A5A" />
          {/* Nariz */}
          <path d="M 0 -12 C -2 -9, 2 -9, 0 -12 Z" fill="#D9A17E" />
          {/* Sonrisa alegre */}
          <path d="M -12 -2 C -6 5, 6 5, 12 -2 C 8 8, -8 8, -12 -2 Z" fill="#5A2620" />
        </g>
      </g>

      {/* Chica clásica (melena bob negra) */}
      <g transform={`translate(72 0) rotate(${-wave * 0.5})`}>
        <path d="M -32 10 C -36 -26, -32 -56, -20 -74 L 20 -74 C 32 -56, 36 -26, 32 10 C 24 20, -24 20, -32 10 Z" fill="#7A4A7C" />
        <path d="M -20 -74 L -14 -40 L -6 -74 Z" fill="#F2EFE9" opacity="0.7" />
        <path d="M 20 -74 L 14 -40 L 6 -74 Z" fill="#F2EFE9" opacity="0.7" />
        <rect x="-13" y="-78" width="26" height="12" rx="5" fill="#EEC39A" />
        <g transform="translate(0 -92)">
          <path d="M 0 -46 C 20 -46, 34 -38, 35 -22 C 36 -8, 34 4, 28 12 C 20 20, -20 20, -28 12 C -34 4, -36 -8, -35 -22 C -34 -38, -20 -46, 0 -46 Z" fill="#EEC39A" />
          {/* Melena bob negra */}
          <g fill="#1A1210">
            <path d="M -35 -22 C -36 -46, -18 -58, 0 -58 C 20 -58, 34 -48, 34 -30 C 36 -10, 32 4, 26 12 C 30 -6, 24 -26, 10 -30 C 0 -32, -12 -30, -22 -20 C -30 -12, -34 -4, -35 -22 Z" />
            <path d="M -34 -24 C -32 -44, -18 -54, -2 -54 C 14 -54, 30 -44, 32 -28 C 24 -36, 12 -40, 0 -40 C -14 -40, -26 -36, -34 -24 Z" fill="#2A1C18" />
          </g>
          {/* Ojos grandes con pestañas */}
          <ellipse cx="-12" cy="-18" rx="6.5" ry="7.5" fill="#FFF7E8" />
          <ellipse cx="12" cy="-18" rx="6.5" ry="7.5" fill="#FFF7E8" />
          <circle cx="-11" cy="-17" r="2.8" fill="#241A10" />
          <circle cx="13" cy="-17" r="2.8" fill="#241A10" />
          <circle cx="-10" cy="-20" r="1" fill="#FFFFFF" />
          <circle cx="14" cy="-20" r="1" fill="#FFFFFF" />
          <path d="M -19 -26 L -20 -20" stroke="#1A1210" strokeWidth="1.6" />
          <path d="M 19 -26 L 20 -20" stroke="#1A1210" strokeWidth="1.6" />
          {/* Cejas */}
          <path d="M -18 -29 C -14 -32, -8 -33, -4 -31" stroke="#1A1210" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 18 -29 C 14 -32, 8 -33, 4 -31" stroke="#1A1210" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Nariz */}
          <path d="M 0 -12 C -2 -9, 2 -9, 0 -12 Z" fill="#D9A17E" />
          {/* Sonrisa */}
          <path d="M -11 -2 C -6 5, 6 5, 11 -2 C 7 8, -7 8, -11 -2 Z" fill="#5A2620" />
        </g>
      </g>

      {/* Deformación de tinta en vivo: goterones + contornos ondulados */}
      <g fill="none" stroke="#050102" strokeLinecap="round" opacity={deform}>
        <path d={`M -120 40 C -116 ${20 + inkDrop}, -112 6, -108 -6`} strokeWidth="2.5" />
        <path d="M 96 46 C 104 26, 108 10, 112 -8" strokeWidth="2.5" />
        <path d="M -40 -130 C -36 -142, -30 -148, -22 -150" strokeWidth="2" />
        <path d="M 40 -134 C 44 -146, 52 -150, 60 -148" strokeWidth="2" />
      </g>
      <g fill="#050102" opacity={deform * 0.9}>
        <path d="M -104 14 C -102 22, -100 30, -98 40 C -97 41, -95 41, -94 40 C -96 30, -98 22, -100 14 Z" />
        <path d="M 112 10 C 114 20, 116 30, 118 40 C 119 41, 121 41, 121 40 C 120 30, 119 20, 117 10 Z" />
      </g>
    </g>
  );
};

/** Gato anaranjado de tira cómica (estilo Garfield). `corrupt` lo corrompe. */
const ComicCat: React.FC<{ corrupt: number }> = ({ corrupt }) => {
  return (
    <g transform="translate(630 250) scale(1.25)">
      {/* Cola */}
      <path d="M 34 40 C 78 36, 104 16, 112 -10 C 116 -22, 108 -28, 102 -20 C 96 -8, 84 8, 60 20 Z" fill="#C77A26" />
      {/* Cuerpo sentado */}
      <path d="M -46 60 C -54 30, -50 4, -38 -14 C -26 -30, -10 -36, 0 -36 C 10 -36, 26 -30, 38 -14 C 50 4, 54 30, 46 60 C 34 76, -34 76, -46 60 Z" fill="#E8A33D" />
      <path d="M -30 66 C -32 38, -26 16, -14 2 C -6 -8, 6 -8, 14 2 C 26 16, 32 38, 30 66 C 22 74, -22 74, -30 66 Z" fill="#F2C078" />
      <g stroke="#B26A1E" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M -8 -34 C -10 -28, -10 -20, -8 -12" />
        <path d="M 2 -36 C 0 -28, 0 -20, 2 -12" />
        <path d="M 12 -34 C 10 -28, 10 -20, 12 -12" />
      </g>
      <path d="M -26 20 C -32 34, -34 50, -32 66 L -14 66 C -14 50, -14 34, -12 22 Z" fill="#E8A33D" />
      <path d="M 12 20 C 14 34, 14 50, 12 66 L 30 66 C 30 50, 30 34, 28 22 Z" fill="#E8A33D" />

      <g transform="translate(0, -58)">
        {/* Orejas */}
        <path d="M -38 -30 C -44 -56, -36 -74, -24 -80 C -16 -74, -14 -56, -18 -34 Z" fill="#E8A33D" />
        <path d="M 38 -30 C 44 -56, 36 -74, 24 -80 C 16 -74, 14 -56, 18 -34 Z" fill="#E8A33D" />
        <path d="M -34 -36 C -36 -54, -32 -66, -25 -73 C -22 -64, -21 -52, -23 -38 Z" fill="#B26A1E" />
        <path d="M 34 -36 C 36 -54, 32 -66, 25 -73 C 22 -64, 21 -52, 23 -38 Z" fill="#B26A1E" />
        {/* Cráneo */}
        <path d="M 0 -70 C 28 -70, 48 -60, 50 -36 C 52 -18, 48 -4, 40 6 C 32 16, 22 20, 12 21 C 4 22, -4 22, -12 21 C -22 20, -32 16, -40 6 C -48 -4, -52 -18, -50 -36 C -48 -60, -28 -70, 0 -70 Z" fill="#E8A33D" />
        <g stroke="#B26A1E" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 0 -66 C -2 -58, -2 -50, 0 -42" />
          <path d="M -14 -62 C -13 -56, -12 -50, -10 -44" />
          <path d="M 14 -62 C 13 -56, 12 -50, 10 -44" />
        </g>

        {/* Ojos inocentes → cuencas negras llorando sangre/tinta */}
        <g opacity={1 - corrupt}>
          <ellipse cx="-17" cy="-32" rx="12" ry="13" fill="#FFF7E8" />
          <ellipse cx="17" cy="-32" rx="12" ry="13" fill="#FFF7E8" />
          <circle cx="-15" cy="-31" r="5" fill="#241A10" />
          <circle cx="19" cy="-31" r="5" fill="#241A10" />
          <circle cx="-13" cy="-34" r="1.8" fill="#FFFFFF" />
          <circle cx="21" cy="-34" r="1.8" fill="#FFFFFF" />
        </g>
        <g opacity={corrupt}>
          <ellipse cx="-17" cy="-31" rx="13" ry="15" fill="#040507" />
          <ellipse cx="17" cy="-31" rx="13" ry="15" fill="#040507" />
          {/* Lágrimas de tinta negra espesa */}
          <path d="M -21 -20 C -22 -8, -23 2, -24 12 C -23 14, -21 14, -20 12 C -19 2, -18 -8, -17 -20 Z" fill="#050102" opacity="0.95" />
          <path d="M 21 -20 C 22 -8, 23 2, 24 12 C 23 14, 21 14, 20 12 C 19 2, 18 -8, 17 -20 Z" fill="#050102" opacity="0.95" />
          {/* Hilos de sangre carmesí */}
          <path d="M -12 -18 C -12 -4, -12 8, -11 18" stroke="#DC2626" strokeWidth="2.4" fill="none" opacity="0.9" />
          <path d="M 12 -18 C 12 -4, 12 8, 11 18" stroke="#DC2626" strokeWidth="2.4" fill="none" opacity="0.9" />
        </g>

        {/* Nariz */}
        <path d="M -4 -16 C -4 -20, 4 -20, 4 -16 C 4 -12, -4 -12, -4 -16 Z" fill="#C25E2A" />

        {/* Boca: sonrisa → mueca desgarrada */}
        <g opacity={1 - corrupt}>
          <path d="M -14 -6 C -8 -1, 8 -1, 14 -6" stroke="#5A2C12" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M -4 -4 C -2 -1, 2 -1, 4 -4 C 2 1, -2 1, -4 -4 Z" fill="#D4553A" />
        </g>
        <g opacity={corrupt}>
          <path d="M -18 -2 C -12 -10, -6 -12, 0 -12 C 6 -12, 12 -10, 18 -2 C 14 6, 8 10, 0 10 C -8 10, -14 6, -18 -2 Z" fill="#1A0204" />
          <path d="M -18 -2 C -12 -10, -6 -12, 0 -12" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 0 -12 C 6 -12, 12 -10, 18 -2" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M -13 -2 L -9 -8 L -6 -2 Z" fill="#D8CFBE" />
          <path d="M -3 -3 L 0 -10 L 3 -3 Z" fill="#D8CFBE" />
          <path d="M 6 -2 L 9 -8 L 13 -2 Z" fill="#D8CFBE" />
          <path d="M -12 6 C -13 14, -14 22, -15 30" stroke="#050102" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 0 9 C 0 18, 0 26, 1 34" stroke="#050102" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M 12 6 C 13 14, 14 22, 15 30" stroke="#050102" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/** Tira cómica de periódico en 2 fases animadas (viewBox 0 0 840 470). */
const ComicStrip: React.FC<{ frame: number }> = ({ frame }) => {
  // Fase 1: deformación de la pareja clásica (80–250).
  const deform = clamp01(interpolate(frame, [80, 250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  // Fase 2: corrupción del gato anaranjado (250–430).
  const catCorrupt = clamp01(interpolate(frame, [250, 430], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  // Onda de glitch/tinta que salta del panel izquierdo al derecho (250–340).
  const glitchJump = clamp01(interpolate(frame, [250, 300, 340], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  // Glifos Zalgo invadiendo el papel (350–480).
  const glyphOn = clamp01(interpolate(frame, [350, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const glyphX = Math.sin(frame * 0.08) * 5 * glyphOn;
  const glyphY = Math.cos(frame * 0.06) * 3 * glyphOn;

  return (
    <svg
      viewBox="0 0 840 470"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Tira cómica de periódico corrompiéndose"
    >
      <defs>
        <linearGradient id="s2-paper" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#EAE1C6" />
          <stop offset="60%" stopColor="#D6C9A4" />
          <stop offset="100%" stopColor="#B7A87E" />
        </linearGradient>
        <radialGradient id="s2-rot" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#2A0506" stopOpacity="0" />
          <stop offset="70%" stopColor="#2A0506" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0A0102" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="s2-ink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020102" />
          <stop offset="70%" stopColor="#050102" />
          <stop offset="100%" stopColor="#020102" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Papel crema envejecido */}
      <rect x="4" y="4" width="832" height="462" rx="12" fill="url(#s2-paper)" />
      <rect x="8" y="8" width="824" height="454" rx="8" fill="none" stroke="#4A443A" strokeWidth="3" />

      {/* Panel izquierdo: pareja clásica estilo Archie/Nancy */}
      <rect x="22" y="22" width="380" height="426" rx="8" fill="none" stroke="#4A443A" strokeWidth="2.4" />
      <ClassicPair deform={deform} frame={frame} />

      {/* Panel derecho: gato anaranjado */}
      <rect x="432" y="22" width="386" height="426" rx="8" fill="none" stroke="#4A443A" strokeWidth="2.4" />
      <ComicCat corrupt={catCorrupt} />

      {/* Bocadillo de texto arriba (SIN tapar los ojos del gato) */}
      <g transform="translate(0, -18)">
        <ellipse cx="646" cy="88" rx="108" ry="42" fill="#F7F1DD" stroke="#4A443A" strokeWidth="2.4" />
        <path d="M 596 120 C 586 140, 582 154, 578 164 C 592 160, 602 152, 610 142 Z" fill="#F7F1DD" stroke="#4A443A" strokeWidth="2" />
        <text
          x="646"
          y="84"
          textAnchor="middle"
          fontFamily="Consolas, 'Courier New', monospace"
          fontSize="28"
          fontWeight="700"
          fill="#3A2E1A"
          opacity={1 - catCorrupt}
        >
          HOLA.
        </text>
        <g opacity={catCorrupt} transform={`translate(${glyphX} ${glyphY})`}>
          <text x="646" y="84" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="28" fontWeight="700" fill="#7F1D1D" dx="-2" dy="-1">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
          <text x="646" y="84" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="28" fontWeight="700" fill="#DC2626" dx="2" dy="1">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
          <text x="646" y="84" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="28" fontWeight="700" fill="#050102">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
        </g>
      </g>

      {/* Onda de glitch/tinta saltando del panel 1 al panel 2 */}
      <g fill="none" stroke="#050102" strokeLinecap="round" opacity={glitchJump}>
        <path d="M 400 120 C 420 110, 430 140, 448 124 C 462 112, 470 132, 486 120" strokeWidth="3" />
        <path d="M 398 180 C 424 168, 438 196, 458 178 C 474 166, 486 184, 500 170" strokeWidth="2.4" />
        <path d="M 404 240 C 422 232, 434 252, 452 238 C 466 228, 478 244, 494 232" strokeWidth="2" />
        <path d="M 402 300 C 420 292, 430 310, 448 298 C 462 288, 474 302, 490 292" strokeWidth="2.2" />
      </g>

      {/* Grietas negras invadiendo el papel */}
      <g fill="none" stroke="#050102" strokeLinecap="round" opacity={catCorrupt}>
        <path d="M 24 40 C 70 70, 80 130, 60 190 C 50 220, 56 250, 70 280 C 80 300, 78 330, 70 360" strokeWidth="2.5" />
        <path d="M 420 60 C 380 90, 390 150, 410 200 C 420 230, 416 260, 410 300" strokeWidth="2.5" />
        <path d="M 200 40 C 240 60, 260 90, 250 130" strokeWidth="2" />
      </g>

      {/* Desaturación cálida → rojo/negro */}
      <rect x="4" y="4" width="832" height="462" rx="12" fill="url(#s2-rot)" opacity={catCorrupt * 0.9} />

      {/* Glifos Zalgo invadiendo el papel */}
      <g opacity={glyphOn} transform={`translate(${glyphX * 1.4} ${glyphY * 1.4})`}>
        <text x="80" y="360" fontFamily="Consolas, monospace" fontSize="22" fontWeight="700" fill="#7F1D1D" opacity="0.8">H̷E̶ C̷O̶M̷E̶S̷</text>
        <text x="470" y="400" fontFamily="Consolas, monospace" fontSize="24" fontWeight="700" fill="#DC2626" opacity="0.75">Z̷A̶L̷G̶O̷</text>
        <text x="250" y="80" fontFamily="Consolas, monospace" fontSize="18" fontWeight="700" fill="#050102" opacity="0.7">T̷H̶E̷ E̶N̷D̶</text>
      </g>
    </svg>
  );
};

export const ZalgoScene2Origin: React.FC = () => {
  const frame = useCurrentFrame();

  // Corrupción del animador (percibe la anomalía y retrocede).
  const corruption = clamp01(
    interpolate(frame, [140, 320, 480], [0, 0.55, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Dolly-in lento (1.0 → 1.07).
  const dolly = interpolate(frame, [0, 528], [1, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Emerger del zoom del monitor CRT (0–14).
  const emerge = 1 - clamp01(
    interpolate(frame, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Camera dive dentro del charco de tinta (494–528).
  const dive = clamp01(
    interpolate(frame, [494, 528], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const scale = dolly * (1 + dive * 1.7);

  // Virus expandiéndose hacia 4chan: resplandor del CRT azul-verde → rojo abisal.
  const virus = clamp01(interpolate(frame, [200, 490], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const crtGlow = interpolateColors(frame, [200, 490], ["#22D3EE", "#DC2626"]);

  // Parallax por capa.
  const bgDrift = Math.sin(frame * 0.006) * 6;
  const fgDrift = Math.sin(frame * 0.011 + 1.2) * 16;
  const lampSway = Math.sin(frame * 0.05) * 1.4;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: emerge + dolly-in + dive final */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50% 52%",
        }}
      >
        {/* ============ BACKGROUND (parallax lento) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #06080C 0%, #0A1014 52%, #040507 100%)",
            }}
          />
          {/* Ventana nocturna */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${bgDrift}px)` }}
          >
            <defs>
              <linearGradient id="s2-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B151C" />
                <stop offset="100%" stopColor="#16212B" />
              </linearGradient>
            </defs>
            <rect x="96" y="300" width="360" height="500" rx="8" fill="url(#s2-sky)" stroke="#1A232B" strokeWidth="12" />
            <rect x="128" y="332" width="296" height="436" fill="none" stroke="#0D1218" strokeWidth="6" />
            <circle cx="240" cy="430" r="110" fill="rgba(242,239,233,0.14)" filter="blur(4px)" />
            <g fill="#0A0E14">
              <rect x="140" y="640" width="52" height="128" />
              <rect x="200" y="600" width="40" height="168" />
              <rect x="250" y="660" width="56" height="108" />
              <rect x="318" y="620" width="46" height="148" />
              <rect x="368" y="664" width="40" height="104" />
            </g>
            <g fill="#F2B14A" opacity="0.7">
              <rect x="150" y="656" width="8" height="10" />
              <rect x="212" y="672" width="8" height="10" />
              <rect x="262" y="678" width="8" height="10" />
              <rect x="328" y="636" width="8" height="10" />
            </g>
          </svg>

          {/* Estantería de tintas */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${bgDrift * 0.5}px)` }}
          >
            <rect x="816" y="330" width="230" height="600" rx="6" fill="#0D1218" />
            {[0, 1, 2].map((row) => (
              <rect key={row} x="824" y={430 + row * 160} width="214" height="10" fill="#1A232B" />
            ))}
            {BOOKS.map((b, i) => (
              <rect
                key={i}
                x={816 + b.x}
                y={440 + b.row * 160 - b.h}
                width={b.w}
                height={b.h}
                rx="3"
                fill={b.hue}
                opacity="0.9"
              />
            ))}
            <rect x="880" y="880" width="46" height="40" rx="6" fill="#141C24" />
            <rect x="896" y="872" width="14" height="10" rx="2" fill="#040507" />
            <rect x="950" y="890" width="40" height="34" rx="6" fill="#141C24" />
            <rect x="964" y="882" width="12" height="10" rx="2" fill="#040507" />
          </svg>

          {/* Resplandor CRT retro que muta de azul-verde a rojo abisal */}
          <div
            style={{
              position: "absolute",
              top: 560,
              left: 120 + bgDrift,
              width: 460,
              height: 360,
              background: `radial-gradient(ellipse at 50% 50%, ${crtGlow}, transparent 72%)`,
              filter: "blur(8px)",
              opacity: 0.16 + 0.08 * Math.sin(frame * 0.03) + virus * 0.1,
            }}
          />
        </div>

        {/* ============ MIDGROUND (animador + tira cómica) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Dave Kelly dibujando (parte superior, debajo del HUD) */}
          <div
            style={{
              position: "absolute",
              top: 300,
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 480,
            }}
          >
            <AnimatorCharacter corruption={corruption} localFrame={frame} idPrefix="s2-anim" />
          </div>

          {/* Tira cómica de periódico en 2 fases (central, SIEMPRE por encima de y=1200) */}
          <div
            style={{
              position: "absolute",
              top: 700,
              left: 70,
              width: 840,
              height: 470,
            }}
          >
            <ComicStrip frame={frame} />
          </div>
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Lámpara de escritorio articulada (arriba-izquierda, halo cálido) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift}px)` }}
          >
            <defs>
              <radialGradient id="s2-lamp-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(242,177,74,0.34)" />
                <stop offset="58%" stopColor="rgba(242,177,74,0.10)" />
                <stop offset="100%" stopColor="rgba(242,177,74,0)" />
              </radialGradient>
              <linearGradient id="s2-lamp-cone" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="rgba(226,214,178,0.5)" />
                <stop offset="100%" stopColor="rgba(140,180,210,0)" />
              </linearGradient>
            </defs>
            <ellipse cx="272" cy="254" rx="122" ry="112" fill="url(#s2-lamp-halo)" />
            <path d="M -40 60 C 120 40, 220 120, 260 240" stroke="#020304" strokeWidth="34" fill="none" strokeLinecap="round" />
            <g filter="blur(1.5px)">
              <path d="M 210 210 C 250 190, 310 190, 330 240 C 320 290, 250 300, 210 270 Z" fill="#0A0C11" />
              <path d="M 210 270 C 250 300, 320 290, 330 240" stroke="#F2B14A" strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round" />
              <ellipse cx="270" cy="270" rx="11" ry="8" fill="#F2B14A" opacity="0.8" />
            </g>
            <g opacity={0.16 + 0.04 * Math.sin(frame * 0.04)}>
              <path
                d={`M ${260 + lampSway} 270 C 180 320, 120 430, 96 600 L 420 640 C 380 440, 330 340, ${300 + lampSway} 300 Z`}
                fill="url(#s2-lamp-cone)"
              />
            </g>
          </svg>

          {/* Taza de café humeante + lápices (abajo-derecha) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift * 0.7}px)` }}
          >
            <g filter="blur(1.5px)">
              <path d="M 880 1460 C 860 1450, 850 1470, 852 1490 L 888 1490 L 940 1472 L 936 1454 Z" fill="#0A0C11" />
              <path d="M 940 1460 C 950 1464, 950 1478, 940 1482" stroke="#0A0C11" strokeWidth="8" fill="none" />
              <path d="M 888 1490 L 940 1472 L 936 1454" stroke="#F2B14A" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round" />
              <path d="M 890 1448 C 884 1432, 896 1420, 890 1406" stroke="#2B3A42" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M 906 1448 C 900 1430, 912 1418, 906 1402" stroke="#2B3A42" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.45" />
            </g>
            <g filter="blur(1.5px)">
              <rect x="960" y="1490" width="56" height="70" rx="8" fill="#0A0C11" />
              <rect x="968" y="1466" width="8" height="30" fill="#141C24" />
              <rect x="982" y="1462" width="8" height="34" fill="#2A1F22" />
              <rect x="996" y="1468" width="8" height="28" fill="#1F2A24" />
              <rect x="960" y="1490" width="56" height="70" rx="8" fill="none" stroke="#F2B14A" strokeWidth="1.5" opacity="0.35" />
            </g>
          </svg>

          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
        </div>

        {/* Polvo iluminado */}
        <div data-layer="background" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {DUST.map((d, i) => {
            const y = d.y0 - ((frame * d.speed + d.phase) % 1400);
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
                  opacity: d.op * (0.6 + 0.4 * Math.sin(frame * 0.04 + i)),
                  boxShadow: "0 0 6px rgba(190,220,245,0.5)",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Emerger de la oscuridad del monitor CRT */}
      <AbsoluteFill style={{ background: "#020304", opacity: emerge }} />

      {/* Oscuridad líquida del camera dive (charco de tinta → lienzo negro) */}
      {dive > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 52%, rgba(2,1,2,0.98) 0%, rgba(2,1,2,0.9) 55%, transparent 78%)",
            opacity: dive,
          }}
        />
      ) : null}

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.3) 0%, transparent 22%, transparent 62%, rgba(4,5,7,0.82) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
