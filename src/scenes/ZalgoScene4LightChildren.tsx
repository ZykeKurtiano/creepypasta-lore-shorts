import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { LightChildCharacter } from "../components/characters/LightChildCharacter";

/**
 * ZalgoScene4LightChildren (frames 1649–2106, 54.97–70.20s) — Los Niños de Luz.
 *
 * Escena dinámica dividida visualmente (SIN texto ni tarjetas estáticas):
 *  - background (parallax lento): atmósfera cálida dorada-ámbar en el centro
 *    irradiando hacia dos mundos ilustrados: a la izquierda un taller con
 *    caballete donde un ARTISTA humano detallado y articulado pinta trazos
 *    luminosos; a la derecha una trinchera lluviosa donde un SOLDADO humano
 *    detallado y articulado alza la mirada recobrando esperanza.
 *  - midground: un LightChildCharacter (pose="radiating") sonriendo en el
 *    centro mientras ondas de energía dorada conectan su sonrisa con el
 *    artista y el soldado.
 *  - Clímax de desaturación (localFrame 320–435): la sombra colosal de Zalgo
 *    y tentáculos carmesí intentan apagar al niño (lightIntensity 1.0 → 0.12)
 *    y TODO el color cálido del artista/soldado se drena a gris frío
 *    (filter saturate) mientras ambos bajan sus brazos articulados.
 *  - foreground (parallax 1.3x): partículas de luz dorada que se vuelven
 *    cenizas oscuras + transición espacial de salida (433–457) de sombra
 *    carmesí-negra barriendo de izquierda a derecha hacia la Escena 5.
 *
 * Cámara: única intención — entra tras el foreground wipe de cristales
 * (0–14) con un pan lateral/elevación orgánico calmo (cero shake periódico).
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Partículas de luz dorada (foreground, deterministas, sin Math.random). */
const GLOW_DUST = Array.from({ length: 26 }, (_, i) => ({
  x: random(i * 3.7 + 1) * 1080,
  y0: random(i * 7.9 + 2) * 1900,
  r: 1.6 + random(i * 5.3 + 3) * 2.6,
  speed: 0.22 + random(i * 9.1 + 4) * 0.42,
  phase: random(i * 13.3 + 5) * Math.PI * 2,
  op: 0.14 + random(i * 17.1 + 6) * 0.28,
}));

/** Motas lejanas en el fondo (parallax lento). */
const BG_DUST = Array.from({ length: 18 }, (_, i) => ({
  x: random(i * 5.1 + 3) * 1080,
  y0: random(i * 6.3 + 9) * 1500,
  r: 1.2 + random(i * 4.7 + 7) * 1.8,
  speed: 0.1 + random(i * 8.3 + 2) * 0.2,
  phase: random(i * 11.7 + 8) * Math.PI * 2,
  op: 0.08 + random(i * 15.9 + 4) * 0.18,
}));

/**
 * Artista humano detallado y articulado (NO maniquí): boina, delantal con
 * pliegues, rostro expresivo (cejas, ojos, boca) y esqueleto jerárquico
 * torso → cuello/cabeza, hombro → codo → mano con pincel. `slump` (0..1)
 * baja los brazos articulados en desaliento.
 */
const ArtistCharacter: React.FC<{
  slump: number;
  frame: number;
  idPrefix: string;
}> = ({ slump, frame, idPrefix }) => {
  const pid = idPrefix;
  const g = (n: string) => `${pid}-${n}`;
  const brushAmp = 1 - slump;
  const strokeX = Math.sin(frame * 0.24) * 7 * brushAmp;
  const strokeY = (Math.cos(frame * 0.19) - 0.5) * 4 * brushAmp;
  const breathe = 1 + Math.sin(frame * 0.09) * 0.01;
  const headTilt = -4 + slump * 9 + Math.sin(frame * 0.05) * 1.5;
  const lShoulder = 22 - slump * 30; // brazo con paleta
  const lElbow = 14 - slump * 10;
  const rShoulder = 64 - slump * 48; // brazo con pincel
  const rElbow = -22 + slump * 16;
  const blinkPhase = frame % 120;
  const blink = blinkPhase > 110 ? Math.sin(((blinkPhase - 110) / 10) * Math.PI) : 1;

  return (
    <svg
      viewBox="0 0 400 600"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Artista humano pintando trazos luminosos en su caballete"
    >
      <defs>
        <linearGradient id={g("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#EECFA9" />
          <stop offset="60%" stopColor="#C99A74" />
          <stop offset="100%" stopColor="#8E6B4E" />
        </linearGradient>
        <radialGradient id={g("face")} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#F2D7B5" />
          <stop offset="62%" stopColor="#CE9E78" />
          <stop offset="100%" stopColor="#8E6B4E" />
        </radialGradient>
        <linearGradient id={g("hair")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#5A4026" />
          <stop offset="55%" stopColor="#3A2A18" />
          <stop offset="100%" stopColor="#1C130B" />
        </linearGradient>
        <linearGradient id={g("smock")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#8C4E2A" />
          <stop offset="50%" stopColor="#6E3A1E" />
          <stop offset="100%" stopColor="#4A2512" />
        </linearGradient>
        <linearGradient id={g("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#2E3A44" />
          <stop offset="100%" stopColor="#141C22" />
        </linearGradient>
        <linearGradient id={g("easel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4A2A" />
          <stop offset="100%" stopColor="#3A2814" />
        </linearGradient>
        <linearGradient id={g("canvas")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#E8DCC2" />
          <stop offset="100%" stopColor="#B9A98A" />
        </linearGradient>
      </defs>

      {/* Caballete con lienzo */}
      <g>
        <path d="M 30 520 L 40 300 L 48 300 L 60 520 Z" fill={`url(#${g("easel")})`} />
        <path d="M 130 520 L 122 300 L 114 300 L 106 520 Z" fill={`url(#${g("easel")})`} />
        <rect x="42" y="240" width="92" height="110" rx="4" fill={`url(#${g("canvas")})`} stroke="#4A3A22" strokeWidth="2.5" />
        {/* Trazos luminosos dorados/turquesa sobre el lienzo */}
        <g opacity={brushAmp}>
          <path d="M 52 310 C 66 288, 84 282, 100 292 C 114 300, 118 316, 112 330" stroke="#FDE047" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.95" />
          <path d="M 56 300 C 70 322, 92 330, 112 322" stroke="#22D3EE" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M 64 250 C 72 266, 90 272, 108 266" stroke="#FDE047" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
          <circle cx="88" cy="292" r="5" fill="#FDE047" opacity="0.9" />
        </g>
        {/* Trazo detenido cuando se desanima */}
        <g opacity={slump}>
          <path d="M 60 300 C 74 316, 94 320, 108 314" stroke="#5A5348" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
      </g>

      {/* ===== torsoGroup ===== */}
      <g transform={`translate(200, 500) rotate(${slump * 5}) scale(${breathe})`}>
        {/* Piernas */}
        <g>
          <g transform={`translate(-16, 0) rotate(${-4})`}>
            <path d="M -12 0 C -13 34, -13 66, -9 96 L 14 96 C 12 66, 12 34, 12 0 Z" fill={`url(#${g("pants")})`} />
            <path d="M -9 94 L 15 94 C 16 102, 14 108, 9 112 L -12 112 C -13 106, -12 100, -9 94 Z" fill="#1A120A" />
          </g>
          <g transform={`translate(16, 0) rotate(${4})`}>
            <path d="M -14 0 C -12 34, -12 66, -14 96 L 11 96 C 11 66, 11 34, 11 0 Z" fill={`url(#${g("pants")})`} />
            <path d="M -15 94 L 12 94 C 11 102, 13 108, 18 112 L -7 112 C -8 106, -11 100, -15 94 Z" fill="#1A120A" />
          </g>
        </g>

        {/* Torso: delantal con pliegues */}
        <g>
          <path
            d="M -40 0 C -48 -46, -54 -102, -56 -150 C -58 -180, -54 -194, -38 -198 L 38 -198 C 54 -194, 58 -180, 56 -150 C 54 -102, 48 -46, 40 0 Z"
            fill={`url(#${g("smock")})`}
          />
          <path d="M -56 -150 C -54 -102, -48 -46, -40 0 L -20 0 C -28 -50, -34 -104, -36 -188 L -38 -198 Z" fill="#4A2512" opacity="0.55" />
          <path d="M -44 -40 C -48 -90, -52 -130, -54 -180" stroke="#4A2512" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M -28 -30 C -32 -80, -36 -130, -38 -184" stroke="#8C4E2A" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 28 -30 C 32 -80, 36 -130, 38 -184" stroke="#8C4E2A" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 44 -40 C 48 -90, 52 -130, 54 -180" stroke="#4A2512" strokeWidth="2.5" fill="none" opacity="0.5" />
          {/* Manchas de pintura en el delantal */}
          <circle cx="-22" cy="-30" r="5" fill="#FDE047" opacity="0.5" />
          <circle cx="20" cy="-70" r="4" fill="#22D3EE" opacity="0.45" />
          <circle cx="-10" cy="-110" r="6" fill="#DC2626" opacity="0.35" />
          {/* Rim light dorado (de la atmósfera cálida) */}
          <path d="M 56 -150 C 58 -180, 54 -194, 38 -198 L 22 -198 L 30 -150 Z" fill="#FDE047" opacity="0.4" />
        </g>

        {/* ===== neckHeadGroup ===== */}
        <g transform={`translate(0, -190) rotate(${headTilt})`}>
          <path d="M -12 6 C -12 -8, -10 -18, -8 -28 L 8 -28 C 10 -18, 12 -8, 12 6 Z" fill={`url(#${g("skin")})`} />
          <g transform="translate(0, -28)">
            {/* Cráneo / rostro */}
            <path
              d="M 0 -92 C 26 -92, 42 -82, 44 -60 C 46 -42, 44 -24, 38 -10 C 32 2, 22 8, 12 11 C 4 13, -4 13, -12 11 C -22 8, -32 2, -38 -10 C -44 -24, -46 -42, -44 -60 C -42 -82, -26 -92, 0 -92 Z"
              fill={`url(#${g("face")})`}
            />
            {/* Cabello + boina */}
            <g fill={`url(#${g("hair")})`}>
              <path d="M -44 -60 C -42 -84, -26 -96, 0 -96 C 26 -96, 42 -84, 44 -60 C 38 -74, 24 -82, 0 -82 C -24 -82, -38 -74, -44 -60 Z" />
            </g>
            {/* Boina */}
            <path d="M -46 -74 C -46 -100, -24 -108, 0 -106 C 24 -104, 46 -100, 46 -74 C 32 -84, 12 -86, 0 -84 C -12 -86, -32 -84, -46 -74 Z" fill="#3A2410" />
            <path d="M 0 -106 C 4 -104, 5 -102, 4 -100 C 2 -102, -2 -102, -4 -100 C -5 -102, -4 -104, 0 -106 Z" fill="#3A2410" />
            {/* Cejas */}
            <g transform={`translate(0, ${slump * 4})`}>
              <path d="M -28 -52 C -22 -58, -14 -60, -8 -58" stroke="#2A1A10" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 28 -52 C 22 -58, 14 -60, 8 -58" stroke="#2A1A10" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
            {/* Ojos (brillo al pintar) */}
            <ellipse cx="-15" cy="-40" rx="8" ry={6 * blink} fill="#FFF7E8" />
            <ellipse cx="15" cy="-40" rx="8" ry={6 * blink} fill="#FFF7E8" />
            <circle cx="-15" cy="-40" r="3.6" fill="#4A3220" />
            <circle cx="15" cy="-40" r="3.6" fill="#4A3220" />
            <circle cx="-15" cy="-40" r="1.5" fill="#0A0602" />
            <circle cx="15" cy="-40" r="1.5" fill="#0A0602" />
            <circle cx="-13" cy="-42" r="1.4" fill="#FFFFFF" opacity="0.9" />
            <circle cx="17" cy="-42" r="1.4" fill="#FFFFFF" opacity="0.9" />
            {/* Nariz */}
            <path d="M 0 -26 C -3 -22, -3 -19, 0 -15 C 1 -19, 1 -22, 0 -26 Z" fill="#B98A63" />
            {/* Boca: concentración tranquila */}
            <path d="M -9 -6 C -5 -2, 5 -2, 9 -6" stroke="#6B4630" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Brazo izquierdo: paleta */}
        <g transform={`translate(-48, -184) rotate(${lShoulder})`}>
          <path d="M -11 2 C -12 28, -11 52, -6 74 L 15 74 C 11 52, 11 28, 11 2 Z" fill={`url(#${g("smock")})`} />
          <g transform={`translate(0, 74) rotate(${lElbow})`}>
            <path d="M -9 0 C -10 22, -9 40, -5 56 L 13 56 C 10 40, 10 22, 9 0 Z" fill={`url(#${g("smock")})`} />
            <g transform="translate(0, 56)">
              <path d="M -10 0 C -12 8, -10 15, -6 19 L 14 19 C 11 14, 11 8, 9 0 Z" fill={`url(#${g("skin")})`} />
              {/* Paleta */}
              <ellipse cx="18" cy="14" rx="15" ry="12" fill="#6B4A2A" transform="rotate(-12 18 14)" />
              <circle cx="13" cy="10" r="2.6" fill="#FDE047" />
              <circle cx="20" cy="8" r="2.2" fill="#22D3EE" />
              <circle cx="24" cy="14" r="2.6" fill="#DC2626" />
              <circle cx="15" cy="17" r="2.2" fill="#F2EFE9" />
            </g>
          </g>
        </g>

        {/* Brazo derecho: pincel (pinta) */}
        <g transform={`translate(48, -184) rotate(${rShoulder})`}>
          <path d="M -11 2 C -12 28, -11 52, -6 74 L 15 74 C 11 52, 11 28, 11 2 Z" fill={`url(#${g("smock")})`} />
          <g transform={`translate(0, 74) rotate(${rElbow})`}>
            <path d="M -9 0 C -10 22, -9 40, -5 56 L 13 56 C 10 40, 10 22, 9 0 Z" fill={`url(#${g("smock")})`} />
            <g transform={`translate(0, 56) translate(${strokeX}, ${strokeY})`}>
              <path d="M -10 0 C -12 8, -10 15, -6 19 L 14 19 C 11 14, 11 8, 9 0 Z" fill={`url(#${g("skin")})`} />
              {/* Pincel */}
              <g transform="rotate(28 14 16)">
                <rect x="8" y="-2" width="26" height="5" rx="2.5" fill="#8C4E2A" />
                <path d="M 34 -2 L 42 0 L 34 3 Z" fill="#0E0A06" />
                <path d="M 42 0 L 44 0" stroke="#FDE047" strokeWidth="2" opacity="0.9" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

/**
 * Soldado humano detallado y articulado (NO maniquí): casco, rostro expresivo
 * (ojos y boca), abrigo con pliegues y brazos articulados. Alza la mirada
 * recobrando esperanza y baja los brazos en desaliento con `slump` (0..1).
 */
const SoldierCharacter: React.FC<{
  slump: number;
  frame: number;
  idPrefix: string;
}> = ({ slump, frame, idPrefix }) => {
  const pid = idPrefix;
  const g = (n: string) => `${pid}-${n}`;
  const breathe = 1 + Math.sin(frame * 0.08) * 0.012;
  const headTilt = 8 - slump * 16; // alza la mirada con esperanza, cae al desanimarse
  const lShoulder = -30 - slump * 8; // brazo izquierdo
  const lElbow = -20 + slump * 8;
  const rShoulder = 34 - slump * 42; // brazo que se alzaba, cae
  const rElbow = -24 + slump * 12;
  const blinkPhase = frame % 110;
  const blink = blinkPhase > 100 ? Math.sin(((blinkPhase - 100) / 10) * Math.PI) : 1;
  const rain = (frame * 0.4) % 100;

  return (
    <svg
      viewBox="0 0 400 600"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Soldado humano recobrando esperanza en la trinchera"
    >
      <defs>
        <linearGradient id={g("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#D8B79A" />
          <stop offset="60%" stopColor="#B4876A" />
          <stop offset="100%" stopColor="#7A543C" />
        </linearGradient>
        <radialGradient id={g("face")} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#E4C6A6" />
          <stop offset="62%" stopColor="#BE8F6D" />
          <stop offset="100%" stopColor="#7E5640" />
        </radialGradient>
        <linearGradient id={g("coat")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#3E4A38" />
          <stop offset="50%" stopColor="#2C3527" />
          <stop offset="100%" stopColor="#171D15" />
        </linearGradient>
        <linearGradient id={g("helmet")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#4A5140" />
          <stop offset="100%" stopColor="#232821" />
        </linearGradient>
        <linearGradient id={g("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#2A3028" />
          <stop offset="100%" stopColor="#12160F" />
        </linearGradient>
      </defs>

      {/* ===== torsoGroup ===== */}
      <g transform={`translate(200, 505) scale(${breathe})`}>
        {/* Piernas */}
        <g>
          <g transform={`translate(-15, 0) rotate(${-5})`}>
            <path d="M -12 0 C -13 34, -13 66, -9 96 L 14 96 C 12 66, 12 34, 12 0 Z" fill={`url(#${g("pants")})`} />
            <path d="M -9 94 L 15 94 C 16 102, 14 108, 9 112 L -12 112 C -13 106, -12 100, -9 94 Z" fill="#0C0A06" />
          </g>
          <g transform={`translate(15, 0) rotate(${5})`}>
            <path d="M -14 0 C -12 34, -12 66, -14 96 L 11 96 C 11 66, 11 34, 11 0 Z" fill={`url(#${g("pants")})`} />
            <path d="M -15 94 L 12 94 C 11 102, 13 108, 18 112 L -7 112 C -8 106, -11 100, -15 94 Z" fill="#0C0A06" />
          </g>
        </g>

        {/* Torso: abrigo con pliegues */}
        <g>
          <path
            d="M -42 0 C -50 -46, -56 -102, -58 -150 C -60 -180, -56 -194, -40 -198 L 40 -198 C 56 -194, 60 -180, 58 -150 C 56 -102, 50 -46, 42 0 Z"
            fill={`url(#${g("coat")})`}
          />
          <path d="M -58 -150 C -56 -102, -50 -46, -42 0 L -22 0 C -30 -50, -36 -104, -38 -188 L -40 -198 Z" fill="#171D15" opacity="0.6" />
          <path d="M -46 -40 C -50 -90, -54 -130, -56 -180" stroke="#171D15" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M -30 -30 C -34 -80, -38 -130, -40 -184" stroke="#3E4A38" strokeWidth="2" fill="none" opacity="0.45" />
          <path d="M 30 -30 C 34 -80, 38 -130, 40 -184" stroke="#3E4A38" strokeWidth="2" fill="none" opacity="0.45" />
          <path d="M 46 -40 C 50 -90, 54 -130, 56 -180" stroke="#171D15" strokeWidth="3" fill="none" opacity="0.55" />
          {/* Solapas / botonadura */}
          <path d="M -6 -30 C -6 -80, -6 -130, -6 -178 L 6 -178 C 6 -130, 6 -80, 6 -30 Z" fill="#171D15" />
          <circle cx="0" cy="-70" r="2" fill="#5A5F4A" opacity="0.6" />
          <circle cx="0" cy="-110" r="2" fill="#5A5F4A" opacity="0.6" />
          {/* Rim light dorado (esperanza) */}
          <path d="M 58 -150 C 60 -180, 56 -194, 40 -198 L 24 -198 L 32 -150 Z" fill="#FDE047" opacity={0.45 * (1 - slump)} />
        </g>

        {/* ===== neckHeadGroup ===== */}
        <g transform={`translate(0, -190) rotate(${headTilt})`}>
          <path d="M -12 6 C -12 -8, -10 -18, -8 -28 L 8 -28 C 10 -18, 12 -8, 12 6 Z" fill={`url(#${g("skin")})`} />
          <g transform="translate(0, -28)">
            {/* Cráneo / rostro */}
            <path
              d="M 0 -92 C 26 -92, 42 -82, 44 -60 C 46 -42, 44 -24, 38 -10 C 32 2, 22 8, 12 11 C 4 13, -4 13, -12 11 C -22 8, -32 2, -38 -10 C -44 -24, -46 -42, -44 -60 C -42 -82, -26 -92, 0 -92 Z"
              fill={`url(#${g("face")})`}
            />
            {/* Sombras de barba / suciedad */}
            <path d="M -38 -10 C -32 2, -22 8, -12 11 C -4 13, 4 13, 12 11 C 22 8, 32 2, 38 -10 C 28 -2, 14 2, 0 2 C -14 2, -28 -2, -38 -10 Z" fill="#7E5640" opacity="0.55" />
            {/* Casco */}
            <path
              d="M -46 -58 C -46 -88, -26 -100, 0 -100 C 26 -100, 46 -88, 46 -58 C 40 -70, 26 -76, 0 -76 C -26 -76, -40 -70, -46 -58 Z"
              fill={`url(#${g("helmet")})`}
            />
            <path d="M -46 -58 C -34 -70, -20 -76, 0 -76 C 20 -76, 34 -70, 46 -58" stroke="#5A5F4A" strokeWidth="2" fill="none" opacity="0.5" />
            <rect x="-48" y="-62" width="8" height="14" rx="3" fill="#232821" />
            <rect x="40" y="-62" width="8" height="14" rx="3" fill="#232821" />
            {/* Cejas (esperanza al alzar la mirada) */}
            <g transform={`translate(0, ${-4 + slump * 5})`}>
              <path d="M -28 -52 C -22 -58, -14 -60, -8 -58" stroke="#2A1A10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <path d="M 28 -52 C 22 -58, 14 -60, 8 -58" stroke="#2A1A10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            </g>
            {/* Ojos expresivos */}
            <ellipse cx="-15" cy="-40" rx="8" ry={6 * blink} fill="#F4F1E8" />
            <ellipse cx="15" cy="-40" rx="8" ry={6 * blink} fill="#F4F1E8" />
            <circle cx="-15" cy="-40" r="3.6" fill="#3A4A38" />
            <circle cx="15" cy="-40" r="3.6" fill="#3A4A38" />
            <circle cx="-15" cy="-40" r="1.5" fill="#0A0602" />
            <circle cx="15" cy="-40" r="1.5" fill="#0A0602" />
            <circle cx="-13" cy="-42" r="1.5" fill="#FDE047" opacity="0.85" />
            <circle cx="17" cy="-42" r="1.5" fill="#FDE047" opacity="0.85" />
            {/* Nariz */}
            <path d="M 0 -26 C -3 -22, -3 -19, 0 -15 C 1 -19, 1 -22, 0 -26 Z" fill="#B4876A" />
            {/* Boca: leve sonrisa de esperanza → se apaga */}
            {slump < 0.5 ? (
              <path d="M -9 -6 C -6 -2, 6 -2, 9 -6 C 6 1, -6 1, -9 -6 Z" fill="#5A2620" />
            ) : (
              <path d="M -9 -5 C -5 -8, 5 -8, 9 -5" stroke="#6E4C3A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            )}
          </g>
        </g>

        {/* Brazo izquierdo */}
        <g transform={`translate(-48, -184) rotate(${lShoulder})`}>
          <path d="M -11 2 C -12 28, -11 52, -6 74 L 15 74 C 11 52, 11 28, 11 2 Z" fill={`url(#${g("coat")})`} />
          <g transform={`translate(0, 74) rotate(${lElbow})`}>
            <path d="M -9 0 C -10 22, -9 40, -5 56 L 13 56 C 10 40, 10 22, 9 0 Z" fill={`url(#${g("coat")})`} />
            <g transform="translate(0, 56)">
              <path d="M -10 0 C -12 8, -10 15, -6 19 L 14 19 C 11 14, 11 8, 9 0 Z" fill={`url(#${g("skin")})`} />
              <path d="M -8 19 C -9 26, -8 31, -5 34 L 2 34 C 1 29, 0 25, 0 19 Z" fill={`url(#${g("skin")})`} />
              <path d="M 2 19 C 3 26, 5 31, 9 34 L 14 34 C 14 28, 13 24, 12 19 Z" fill={`url(#${g("skin")})`} />
            </g>
          </g>
        </g>

        {/* Brazo derecho: se alza recobrando esperanza, cae en desaliento */}
        <g transform={`translate(48, -184) rotate(${rShoulder})`}>
          <path d="M -11 2 C -12 28, -11 52, -6 74 L 15 74 C 11 52, 11 28, 11 2 Z" fill={`url(#${g("coat")})`} />
          <g transform={`translate(0, 74) rotate(${rElbow})`}>
            <path d="M -9 0 C -10 22, -9 40, -5 56 L 13 56 C 10 40, 10 22, 9 0 Z" fill={`url(#${g("coat")})`} />
            <g transform="translate(0, 56)">
              <path d="M -10 0 C -12 8, -10 15, -6 19 L 14 19 C 11 14, 11 8, 9 0 Z" fill={`url(#${g("skin")})`} />
              <path d="M -8 19 C -9 26, -8 31, -5 34 L 2 34 C 1 29, 0 25, 0 19 Z" fill={`url(#${g("skin")})`} />
              <path d="M 2 19 C 3 26, 5 31, 9 34 L 14 34 C 14 28, 13 24, 12 19 Z" fill={`url(#${g("skin")})`} />
            </g>
          </g>
        </g>
      </g>

      {/* Lluvia sobre la trinchera (determinista) */}
      <g stroke="#3A5A78" strokeWidth="1.4" opacity="0.5">
        {Array.from({ length: 10 }, (_, i) => {
          const x = 20 + i * 38 + ((i * 13) % 16);
          const y = ((rain + i * 60) % 320) - 20;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 22} />;
        })}
      </g>
    </svg>
  );
};

/** Rayo/onda de energía dorada que conecta al niño con el artista o soldado. */
const EnergyThread: React.FC<{
  from: [number, number];
  to: [number, number];
  light: number;
  phase: number;
  frame: number;
}> = ({ from, to, light, phase, frame }) => {
  const sway = Math.sin(frame * 0.05 + phase) * 22;
  const midX = (from[0] + to[0]) / 2 + sway;
  const midY = (from[1] + to[1]) / 2 - 40 + Math.sin(frame * 0.03 + phase) * 14;
  return (
    <g opacity={light} fill="none" strokeLinecap="round">
      <path
        d={`M ${from[0]} ${from[1]} C ${midX} ${midY}, ${midX} ${midY}, ${to[0]} ${to[1]}`}
        stroke="#FDE047"
        strokeWidth="4"
        opacity="0.55"
      />
      <path
        d={`M ${from[0]} ${from[1]} C ${midX} ${midY}, ${midX} ${midY}, ${to[0]} ${to[1]}`}
        stroke="#FEF08A"
        strokeWidth="1.8"
        opacity="0.9"
      />
      <circle cx={to[0]} cy={to[1]} r={5 + light * 6} fill="#FDE047" opacity={0.5 * light} />
    </g>
  );
};

export const ZalgoScene4LightChildren: React.FC = () => {
  const frame = useCurrentFrame();

  // Cámara: pan lateral/elevación orgánico calmo (una sola intención).
  const panX = interpolate(frame, [0, 457], [0, -24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) + Math.sin(frame * 0.012) * 6;
  const panY = interpolate(frame, [0, 457], [0, -12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) + Math.sin(frame * 0.009 + 1.2) * 4;

  // Entra tras el foreground wipe de cristales (0–14).
  const emerge = 1 - clamp01(
    interpolate(frame, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Clímax de desaturación: la sombra de Zalgo apaga al niño (320–435).
  const lightIntensity = interpolate(frame, [320, 435], [1, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const desat = clamp01(
    interpolate(frame, [320, 435], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const saturate = interpolate(desat, [0, 1], [1, 0.16]);
  const slump = desat;

  // Transición espacial de salida (433–457): sombra carmesí-negra.
  const wipe = clamp01(
    interpolate(frame, [433, 457], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const wipeX = interpolate(frame, [433, 457], [-340, 1120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parallax por capa.
  const fgDrift = Math.sin(frame * 0.011 + 1.1) * 22;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia de la escena */}
      <AbsoluteFill
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
        }}
      >
        {/* ============ BACKGROUND (parallax lento, dos mundos) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 120% 80% at 50% 44%, #3A2A12 0%, #241A0C 38%, #0D0A06 64%, #040507 100%)",
            }}
          />
          {/* Halo cálido central */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 620,
              width: 900,
              height: 900,
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(253,224,71,0.28) 0%, rgba(245,158,11,0.12) 45%, transparent 72%)",
              filter: "blur(6px)",
              opacity: lightIntensity,
            }}
          />

          {/* Mitad izquierda: taller iluminado con artista */}
          <div
            style={{
              position: "absolute",
              left: 46,
              top: 500,
              width: 330,
              height: 500,
              filter: `saturate(${saturate})`,
              opacity: 0.9,
            }}
          >
            <ArtistCharacter slump={slump} frame={frame} idPrefix="s4-artist" />
          </div>

          {/* Mitad derecha: trinchera nocturna lluviosa con soldado */}
          <div
            style={{
              position: "absolute",
              left: 706,
              top: 500,
              width: 330,
              height: 500,
              filter: `saturate(${saturate})`,
              opacity: 0.9,
            }}
          >
            <SoldierCharacter slump={slump} frame={frame} idPrefix="s4-soldier" />
          </div>

          {/* Motas lejanas (parallax lento) */}
          {BG_DUST.map((p, i) => {
            const y = ((p.y0 - frame * p.speed) % 1600 + 1600) % 1600 - 80;
            const x = p.x + Math.sin(frame * 0.014 + p.phase) * 22;
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
                  background: "#FDE047",
                  opacity: p.op * (0.5 + 0.5 * Math.sin(frame * 0.04 + i)) * lightIntensity,
                  boxShadow: "0 0 6px rgba(253,224,71,0.5)",
                }}
              />
            );
          })}
        </div>

        {/* ============ MIDGROUND (Niño de Luz + ondas de energía) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Niño de Luz radiante (centro-inferior, sobre subtítulos y=1200) */}
          <div
            style={{
              position: "absolute",
              left: 310,
              top: 430,
              width: 460,
              height: 660,
            }}
          >
            <LightChildCharacter
              pose="radiating"
              lightIntensity={lightIntensity}
              localFrame={frame}
              idPrefix="s4-child"
            />
          </div>

          {/* Ondas de energía dorada desde su pecho/corazón y manos abiertas hacia artista y soldado */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
          >
            <EnergyThread from={[540, 800]} to={[320, 720]} light={lightIntensity} phase={0.4} frame={frame} />
            <EnergyThread from={[540, 800]} to={[770, 720]} light={lightIntensity} phase={2.1} frame={frame} />
            <EnergyThread from={[385, 707]} to={[250, 800]} light={lightIntensity * 0.7} phase={4.4} frame={frame} />
            <EnergyThread from={[695, 707]} to={[840, 800]} light={lightIntensity * 0.7} phase={5.7} frame={frame} />
          </svg>

          {/* Sombra colosal y tentáculos de Zalgo intentando apagar al niño */}
          {desat > 0.004 ? (
            <svg
              viewBox="0 0 1080 1920"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
            >
              <g opacity={desat}>
                {/* Sombra superior descendente */}
                <path
                  d="M -60 -80 C 220 60, 320 200, 380 360 C 460 560, 500 760, 540 900 C 580 760, 640 560, 720 360 C 800 200, 900 60, 1140 -80 Z"
                  fill="#050308"
                  opacity="0.88"
                />
                {/* Tentáculos carmesí-negros desde los bordes superiores */}
                <g fill="none" strokeLinecap="round">
                  <path d="M 120 -20 C 160 180, 220 340, 320 460 C 380 520, 420 540, 460 520" stroke="#0B0A0E" strokeWidth="34" />
                  <path d="M 120 -20 C 160 180, 220 340, 320 460 C 380 520, 420 540, 460 520" stroke="#DC2626" strokeWidth="3" opacity="0.7" />
                  <path d="M 960 -20 C 920 180, 860 340, 760 460 C 700 520, 660 540, 620 520" stroke="#0B0A0E" strokeWidth="34" />
                  <path d="M 960 -20 C 920 180, 860 340, 760 460 C 700 520, 660 540, 620 520" stroke="#DC2626" strokeWidth="3" opacity="0.7" />
                  <path d="M 540 -20 C 540 140, 540 280, 540 420" stroke="#0B0A0E" strokeWidth="30" />
                  <path d="M 540 -20 C 540 140, 540 280, 540 420" stroke="#7F1D1D" strokeWidth="2.5" opacity="0.7" />
                </g>
                {/* Dedos oscuros cerrándose sobre el niño */}
                <g fill="#050308" opacity="0.85">
                  <path d="M 380 430 C 360 480, 340 520, 320 550 C 340 556, 360 550, 374 530 Z" />
                  <path d="M 700 430 C 720 480, 740 520, 760 550 C 740 556, 720 550, 706 530 Z" />
                </g>
              </g>
            </svg>
          ) : null}
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Partículas de luz dorada que se vuelven cenizas oscuras */}
          {GLOW_DUST.map((p, i) => {
            const y = ((p.y0 - frame * p.speed) % 2000 + 2000) % 2000 - 80;
            const x = p.x + Math.sin(frame * 0.02 + p.phase) * 30;
            const ash = desat;
            const color = ash > 0.5 ? "#1A1A1E" : "#FDE047";
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
                  background: color,
                  opacity: p.op * (0.5 + 0.5 * Math.sin(frame * 0.04 + p.phase)),
                  boxShadow: ash > 0.5 ? "0 0 4px rgba(0,0,0,0.6)" : "0 0 8px rgba(253,224,71,0.6)",
                  filter: "blur(1px)",
                }}
              />
            );
          })}

          {/* Bruma inferior cálida → fría */}
          <div
            style={{
              position: "absolute",
              left: -420 + fgDrift,
              top: 1320,
              width: 1800,
              height: 620,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, ${
                desat > 0.5 ? "rgba(22,33,41,0.7)" : "rgba(253,224,71,0.18)"
              } 0%, transparent 72%)`,
              filter: "blur(36px)",
              opacity: 0.5,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Emerger de la oscuridad del wipe de cristales */}
      <AbsoluteFill style={{ background: "#020304", opacity: emerge }} />

      {/* Transición espacial de salida: barrido de sombra carmesí-negra */}
      {wipe > 0.004 ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 900,
              left: wipeX,
              background:
                "linear-gradient(90deg, transparent 0%, #0B0A0E 18%, #12060A 55%, #050308 100%)",
              boxShadow: "-40px 0 80px rgba(0,0,0,0.8)",
              opacity: wipe,
            }}
          />
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${wipeX * 0.4}px)`, opacity: wipe }}
          >
            <g fill="none" strokeLinecap="round">
              <path d="M 0 200 C 240 320, 300 560, 320 900 C 340 1240, 300 1600, 260 1900" stroke="#0B0A0E" strokeWidth="44" />
              <path d="M 0 200 C 240 320, 300 560, 320 900 C 340 1240, 300 1600, 260 1900" stroke="#DC2626" strokeWidth="4" opacity="0.75" />
              <path d="M 40 500 C 200 640, 260 820, 280 1060" stroke="#7F1D1D" strokeWidth="10" opacity="0.6" />
            </g>
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
