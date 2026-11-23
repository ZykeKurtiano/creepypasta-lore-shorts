import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * ElegyStatueCharacter — Rig vectorial 2.5D de máximo detalle escultórico
 * (50+ <path> orgánicos) de la Estatua de Link de la Elegía al Vacío
 * (Elegy of Emptiness).
 *
 *  - Presencia escultórica grotesca: base/pies plantados con sombra densa
 *    de contacto, túnica verde oscura texturizada (#163822 → #0B1F13)
 *    con pliegues esculpidos rígidos, grietas de piedra, pátina musgosa,
 *    oclusión ambiental y luz de borde configurable.
 *  - Cinturón de cuero agrietado con hebilla metálica envejecida,
 *    bandolera cruzada y funda a la espalda.
 *  - Gorro puntiagudo caído con arrugas escultóricas y mechones rubios
 *    cenizos rígidos (#A39A62 → #4B4527) enmarcando la frente.
 *  - Rostro rígido e hipnótico: pómulos duros de muñeco, cejas tensas
 *    inmóviles, ojos vacíos muy abiertos con pupilas diminutas
 *    hipnóticas y ojeras oscuras, nariz afilada y sonrisa fija
 *    perturbadora con comisuras marcadas.
 *  - Esqueleto articulado <g> con micro-ladeos paranormales de cabeza,
 *    contracciones súbitas en apariciones (teleportGlitch: scan CRT,
 *    fantasmas cromáticos verde/magenta, destello de materialización)
 *    y llamas volumétricas cerradas con ondas propagadas en fase
 *    (flameIntensity) + brasas deterministas.
 *  - 100% determinista: useCurrentFrame + sin + interpolate.
 */

export interface ElegyStatueProps {
  width?: number;
  rimColor?: string;
  glowEyes?: boolean;
  eyeGlowColor?: string;
  teleportGlitch?: number;
  flameIntensity?: number;
  uid?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

const VIEW_W = 460;
const VIEW_H = 780;
const PELVIS_X = 230;
const GROUND_Y = 704;

const SHOULDER_DX = 92;
const SHOULDER_DY = -146;
const HIP_DX = 18;
const NECK_BASE_DY = -168;
const HEAD_DY = -252;
const UPPER_ARM_LEN = 88;
const FOREARM_LEN = 74;
const THIGH_LEN = 100;
const SHIN_LEN = 112;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Miembro tallado (proximal en 0,0, extendiéndose +y). */
const limbPath = (topW: number, botW: number, len: number): string =>
  [
    `M ${-topW / 2} 5`,
    `C ${-topW / 2 - 3} ${len * 0.42}, ${-topW / 2 - 4} ${len * 0.6}, ${-botW / 2} ${len - 5}`,
    `C ${-botW / 2 + 2} ${len - 1}, ${botW / 2 - 2} ${len - 1}, ${botW / 2} ${len - 5}`,
    `C ${topW / 2 + 4} ${len * 0.6}, ${topW / 2 + 3} ${len * 0.42}, ${topW / 2} 5`,
    `C ${topW / 2 - 4} -3, ${-topW / 2 + 4} -3, ${-topW / 2} 5`,
    "Z",
  ].join(" ");

/** Lengua de fuego volumétrica cerrada. */
const flameLobe = (x: number, baseY: number, h: number, w: number, seed: number): string => {
  const w1 = w * (0.72 + 0.28 * Math.sin(seed));
  const tipX = x + Math.sin(seed * 2.7) * 10;
  return [
    `M ${x - w1} ${baseY}`,
    `C ${x - w1 - 5} ${baseY - h * 0.45}, ${x - w1 * 0.4} ${baseY - h * 0.78}, ${tipX} ${baseY - h}`,
    `C ${x + w1 * 0.4} ${baseY - h * 0.78}, ${x + w1 + 5} ${baseY - h * 0.45}, ${x + w1} ${baseY}`,
    "Z",
  ].join(" ");
};

interface StatueCtx {
  frame: number;
  uid: string;
  rim: string;
  glow: boolean;
  glowColor: string;
  glitch: number;
  headTilt: number;
}

/** ---- Rostro escultórico hipnótico (grupo local de la cabeza) ---- */
const StatueFace: React.FC<{ ctx: StatueCtx }> = ({ ctx }) => {
  const { uid, glow, glowColor, frame } = ctx;
  const eyePulse = glow ? 0.5 + 0.22 * Math.sin(frame * 0.8) : 0;
  return (
    <g>
      {/* Gorro puntiagudo caído con arrugas esculpidas (tras el rostro) */}
      <path
        d={`M -56 -40 C -54 -62, -38 -82, -16 -96 C 0 -106, 14 -116, 8 -146 C 20 -118, 44 -108, 60 -98 C 70 -92, 74 -80, 72 -66 C 70 -54, 64 -44, 56 -40 C 38 -48, -38 -48, -56 -40 Z`}
        fill={`url(#${uid}-cap)`}
      />
      <path
        d={`M -54 -42 C -38 -50, 38 -50, 54 -42 C 38 -36, -38 -36, -54 -42 Z`}
        fill={`url(#${uid}-cap-dark)`}
      />
      <path
        d={`M -34 -58 C -26 -70, -14 -82, -2 -96`}
        stroke="#06130C"
        strokeWidth="2.2"
        fill="none"
        opacity="0.7"
      />
      <path
        d={`M 30 -56 C 24 -70, 18 -84, 12 -98`}
        stroke="#06130C"
        strokeWidth="2.2"
        fill="none"
        opacity="0.65"
      />
      <path
        d={`M 0 -48 C -2 -66, 2 -86, 7 -108`}
        stroke="#06130C"
        strokeWidth="1.8"
        fill="none"
        opacity="0.55"
      />
      <path
        d={`M -55 -42 C -52 -58, -38 -76, -18 -90`}
        stroke={ctx.rim}
        strokeWidth="1.8"
        fill="none"
        opacity="0.5"
      />
      {/* Mechones rubios cenizos rígidos + masa de cabello bajo el gorro */}
      <path
        d={`M -38 -46 C -28 -62, -12 -70, 2 -71 C 18 -70, 32 -60, 40 -44 C 34 -36, 26 -31, 18 -29 L -18 -29 C -26 -31, -34 -36, -38 -46 Z`}
        fill={`url(#${uid}-blond)`}
        opacity="0.95"
      />
      {[
        { x: -30, len: 22, tilt: 6 },
        { x: -14, len: 26, tilt: 2 },
        { x: 6, len: 24, tilt: -3 },
        { x: 24, len: 20, tilt: -7 },
        { x: 40, len: 16, tilt: -11 },
      ].map((s, i) => (
        <path
          key={i}
          d={`M ${s.x - 3} -42 L ${s.x - 5 + s.tilt} ${-42 + s.len} L ${s.x + 2 + s.tilt} ${-42 + s.len} L ${s.x + 3} -42 Z`}
          fill={`url(#${uid}-blond)`}
        />
      ))}
      {/* Contorno del rostro rígido */}
      <path
        d={`M -44 -50 C -46 -22, -48 8, -40 36 C -34 52, -22 64, -6 69 C 6 72, 16 71, 26 64 C 38 52, 46 34, 48 8 C 49 -20, 44 -42, 36 -56 C 26 -68, 12 -73, 0 -74 C -14 -73, -36 -64, -44 -50 Z`}
        fill={`url(#${uid}-skin)`}
      />
      {/* Pómulos duros de muñeco */}
      <path d={`M -42 6 L -30 -4 L -26 14 L -34 22 Z`} fill={`url(#${uid}-skin-light)`} />
      <path d={`M 42 6 L 30 -4 L 26 14 L 34 22 Z`} fill={`url(#${uid}-skin-light)`} />
      <path d={`M -42 6 L -30 -4 L -34 -2 Z`} fill="#5C6A56" opacity="0.6" />
      <path d={`M 42 6 L 30 -4 L 34 -2 Z`} fill="#5C6A56" opacity="0.6" />
      {/* Orejas esculpidas */}
      <path
        d={`M -48 -18 C -56 -8, -56 6, -49 14 C -46 17, -42 15, -42 12 C -47 6, -47 -2, -42 -8 C -42 -11, -45 -16, -48 -18 Z`}
        fill={`url(#${uid}-skin-dark)`}
      />
      <path
        d={`M 48 -18 C 56 -8, 56 6, 49 14 C 46 17, 42 15, 42 12 C 47 6, 47 -2, 42 -8 C 42 -11, 45 -16, 48 -18 Z`}
        fill={`url(#${uid}-skin-dark)`}
      />
      {/* Cuencas profundas + ojos vacíos muy abiertos */}
      <path
        d={`M -38 -26 C -30 -34, -18 -34, -10 -26 C -18 -18, -30 -18, -38 -26 Z`}
        fill="#05090A"
      />
      <path
        d={`M 38 -26 C 30 -34, 18 -34, 10 -26 C 18 -18, 30 -18, 38 -26 Z`}
        fill="#05090A"
      />
      <ellipse cx="-24" cy="-14" rx="15" ry="13" fill="#B9C2B0" />
      <ellipse cx="24" cy="-14" rx="15" ry="13" fill="#B9C2B0" />
      {/* Pupila diminuta hipnótica + anillo */}
      <circle cx="-24" cy="-14" r="2.3" fill="#05090A" />
      <circle cx="24" cy="-14" r="2.3" fill="#05090A" />
      <circle cx="-24" cy="-14" r="4.2" fill="none" stroke="#0B1F13" strokeWidth="1.2" opacity="0.8" />
      <circle cx="24" cy="-14" r="4.2" fill="none" stroke="#0B1F13" strokeWidth="1.2" opacity="0.8" />
      <circle cx="-27.4" cy="-17.6" r="1.6" fill="#FFFFFF" opacity="0.55" />
      <circle cx="20.6" cy="-17.6" r="1.6" fill="#FFFFFF" opacity="0.55" />
      {/* Ojeras oscuras */}
      <path
        d={`M -36 -2 C -26 7, -12 8, -4 3 C -14 -1, -26 -3, -36 -2 Z`}
        fill="#0A0D09"
        opacity="0.6"
      />
      <path
        d={`M 36 -2 C 26 7, 12 8, 4 3 C 14 -1, 26 -3, 36 -2 Z`}
        fill="#0A0D09"
        opacity="0.6"
      />
      {/* Brillo espectral verde/rojo */}
      {glow && (
        <g opacity={eyePulse}>
          <circle cx="-24" cy="-14" r="17" fill={glowColor} opacity="0.5" filter={`url(#${uid}-blur6)`} />
          <circle cx="24" cy="-14" r="17" fill={glowColor} opacity="0.5" filter={`url(#${uid}-blur6)`} />
          <circle cx="-24" cy="-14" r="7" fill={glowColor} opacity="0.85" />
          <circle cx="24" cy="-14" r="7" fill={glowColor} opacity="0.85" />
        </g>
      )}
      {/* Cejas tensas inmóviles */}
      <path d={`M -37 -38 L -11 -33`} stroke="#0B0F0A" strokeWidth="3" strokeLinecap="round" />
      <path d={`M 37 -38 L 11 -33`} stroke="#0B0F0A" strokeWidth="3" strokeLinecap="round" />
      {/* Nariz afilada */}
      <path d={`M -1 -28 L -3 2 L 6 14`} stroke={`url(#${uid}-skin-dark)`} strokeWidth="2.6" fill="none" />
      <path d={`M -3 2 L -7 8 L -4 15 L 2 16 Z`} fill={`url(#${uid}-skin-dark)`} />
      <path d={`M -8 -2 L -5 4 L -3 10`} stroke="#3E4A38" strokeWidth="1.8" fill="none" opacity="0.6" />
      {/* Sonrisa fija perturbadora con comisuras marcadas */}
      <path
        d={`M -20 34 C -12 42, 12 42, 20 34`}
        stroke="#0B0F0A"
        strokeWidth="2.4"
        fill="none"
      />
      <path
        d={`M -17 37 C -9 42, 9 42, 17 37 L 15 41 C 8 45, -8 45, -15 41 Z`}
        fill="#0D120B"
        opacity="0.85"
      />
      <path d={`M -23 30 L -16 36`} stroke="#0B0F0A" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M 23 30 L 16 36`} stroke="#0B0F0A" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M -25 29 C -21 33, -18 35, -16 37`} stroke="#0B0F0A" strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d={`M 25 29 C 21 33, 18 35, 16 37`} stroke="#0B0F0A" strokeWidth="1.4" fill="none" opacity="0.6" />
      {/* Grietas faciales */}
      <path d={`M -30 24 L -26 20 L -27 14`} stroke="#04090A" strokeWidth="1" fill="none" opacity="0.8" />
      <path d={`M 34 30 L 38 26 L 36 20`} stroke="#04090A" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Sombra bajo labio */}
      <ellipse cx="0" cy="46" rx="8" ry="3" fill="#0A0D09" opacity="0.4" />
    </g>
  );
};

/** ---- Torso esculpido + cinturón + bandolera ---- */
const StatueTorso: React.FC<{ ctx: StatueCtx }> = ({ ctx }) => {
  const { uid, rim } = ctx;
  return (
    <g>
      {/* Túnica tallada */}
      <path
        d={`M -30 -170 C -44 -154, -66 -140, -82 -118 C -94 -102, -96 -88, -90 -78 C -80 -60, -68 -30, -60 -6 L 60 -6 C 68 -30, 80 -60, 90 -78 C 96 -88, 94 -102, 82 -118 C 66 -140, 44 -154, 30 -170 C 20 -178, -20 -178, -30 -170 Z`}
        fill={`url(#${uid}-tunic)`}
      />
      {/* Pliegues esculpidos rígidos */}
      {[
        "M -46 -120 C -44 -86, -40 -52, -36 -20",
        "M 46 -120 C 44 -86, 40 -52, 36 -20",
        "M 0 -130 C 2 -96, 4 -62, 4 -28",
        "M -26 -150 C -24 -118, -20 -86, -16 -54",
        "M 26 -150 C 24 -118, 20 -86, 16 -54",
      ].map((d, i) => (
        <path key={i} d={d} stroke="#07130C" strokeWidth="2.4" fill="none" opacity="0.65" />
      ))}
      {/* Grietas de piedra/madera */}
      <path d={`M -58 -96 L -52 -88 L -56 -80 L -50 -72`} stroke="#04090A" strokeWidth="1.2" fill="none" opacity="0.85" />
      <path d={`M 40 -60 L 46 -52 L 42 -44 L 48 -38`} stroke="#04090A" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d={`M -18 -36 L -12 -28 L -15 -20`} stroke="#04090A" strokeWidth="1.1" fill="none" opacity="0.8" />
      <path d={`M 66 -104 L 72 -100 L 69 -94`} stroke="#04090A" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Pátina musgosa oscura */}
      <path
        d={`M -84 -74 C -78 -62, -66 -58, -60 -64 C -64 -74, -76 -80, -84 -74 Z`}
        fill="#0E2418"
        opacity="0.8"
      />
      <path
        d={`M 46 -98 C 54 -90, 62 -88, 66 -94 C 64 -104, 54 -108, 46 -98 Z`}
        fill="#0E2418"
        opacity="0.7"
      />
      <path
        d={`M 26 -20 C 34 -14, 42 -12, 46 -18 C 44 -26, 34 -30, 26 -20 Z`}
        fill="#0E2418"
        opacity="0.75"
      />
      <path d={`M -72 -70 C -70 -64, -68 -58, -66 -54`} stroke="#0E2418" strokeWidth="2" fill="none" opacity="0.7" />
      {/* Dobladillo esculpido */}
      <path
        d={`M -58 -8 C -40 -2, 40 -2, 58 -8 L 56 2 C 40 8, -40 8, -56 2 Z`}
        fill={`url(#${uid}-tunic-dark)`}
      />
      <path d={`M -58 -8 C -40 -2, 40 -2, 58 -8`} stroke="#07130C" strokeWidth="1.8" fill="none" opacity="0.7" />
      {/* Bandolera cruzada */}
      <path
        d={`M -18 -172 C -2 -150, 18 -122, 32 -94 L 44 -86 C 28 -116, 8 -146, -6 -168 Z`}
        fill={`url(#${uid}-leather-dark)`}
      />
      <path d={`M -12 -164 C 2 -142, 20 -116, 34 -92`} stroke="#0F0904" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d={`M -15 -168 C -1 -146, 17 -120, 31 -96`} stroke="#0F0904" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Funda a la espalda */}
      <path
        d={`M -94 -130 C -102 -110, -106 -86, -104 -62 L -94 -62 C -96 -86, -94 -110, -86 -126 Z`}
        fill={`url(#${uid}-leather-dark)`}
      />
      <path d={`M -104 -60 L -94 -60 L -95 -52 L -103 -52 Z`} fill="#6B7280" opacity="0.9" />
      <path d={`M -97 -118 L -101 -118 L -99 -64 L -95 -64 Z`} fill="#0F0904" opacity="0.5" />
      {/* Cinturón grueso de cuero agrietado */}
      <path
        d={`M -60 -58 C -40 -50, 40 -50, 60 -58 L 58 -40 C 40 -32, -40 -32, -58 -40 Z`}
        fill={`url(#${uid}-leather)`}
      />
      <path d={`M -48 -52 L -42 -46 L -45 -40`} stroke="#0F0904" strokeWidth="1.1" fill="none" opacity="0.85" />
      <path d={`M 30 -50 L 36 -45 L 33 -39`} stroke="#0F0904" strokeWidth="1.1" fill="none" opacity="0.8" />
      <path d={`M -56 -56 C -38 -48, 38 -48, 56 -56`} stroke="#0F0904" strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* Hebilla metálica envejecida */}
      <path d={`M -13 -56 L 13 -56 L 15 -40 L -15 -40 Z`} fill={`url(#${uid}-metal)`} />
      <path d={`M 0 -54 L 0 -42`} stroke="#2A2E33" strokeWidth="2.6" />
      <path d={`M -9 -50 L 9 -48`} stroke="#4A3826" strokeWidth="1.4" opacity="0.7" />
      <path d={`M -6 -58 L -3 -56`} stroke="#4A3826" strokeWidth="1.2" opacity="0.6" />
      {/* Faldón de la túnica cayendo de forma continua sobre los muslos */}
      <path
        d={`M -58 -6 C -66 10, -66 30, -56 46 L -46 54 L 46 54 L 56 46 C 66 30, 66 10, 58 -6 C 40 4, -40 4, -58 -6 Z`}
        fill={`url(#${uid}-tunic-dark)`}
      />
      <path d={`M -40 6 C -42 22, -40 36, -34 46`} stroke="#07130C" strokeWidth="2.2" fill="none" opacity="0.6" />
      <path d={`M 40 6 C 42 22, 40 36, 34 46`} stroke="#07130C" strokeWidth="2.2" fill="none" opacity="0.6" />
      <path d={`M 0 4 C 2 20, 3 34, 2 46`} stroke="#07130C" strokeWidth="1.8" fill="none" opacity="0.5" />
      <path d={`M -58 -4 C -62 12, -62 30, -54 44`} stroke={rim} strokeWidth="1.8" fill="none" opacity="0.4" />
      {/* Oclusión ambiental */}
      <path d={`M -78 -130 C -74 -122, -70 -116, -66 -112`} stroke="#040507" strokeWidth="5" fill="none" opacity="0.55" filter={`url(#${uid}-ao)`} />
      <path d={`M 78 -130 C 74 -122, 70 -116, 66 -112`} stroke="#040507" strokeWidth="5" fill="none" opacity="0.55" filter={`url(#${uid}-ao)`} />
      <path d={`M -50 -26 C -36 -18, 36 -18, 50 -26`} stroke="#040507" strokeWidth="4" fill="none" opacity="0.4" filter={`url(#${uid}-ao)`} />
      {/* Luz de borde direccional */}
      <path d={`M -88 -124 C -97 -108, -99 -92, -95 -78`} stroke={rim} strokeWidth="2.6" fill="none" opacity="0.55" />
      <path d={`M 88 -124 C 97 -108, 99 -92, 95 -78`} stroke={rim} strokeWidth="2" fill="none" opacity="0.35" />
    </g>
  );
};

/** ---- Brazo tallado (ligeramente separado del torso) ---- */
const StatueArm: React.FC<{ ctx: StatueCtx; side: "l" | "r" }> = ({ ctx, side }) => {
  const { uid } = ctx;
  const m = side === "l" ? 1 : -1;
  const shoulder = side === "l" ? 8 + Math.sin(ctx.frame * 0.011) * 0.6 : -(8 + Math.sin(ctx.frame * 0.011) * 0.6);
  return (
    <g transform={`translate(${m * SHOULDER_DX} ${SHOULDER_DY}) rotate(${shoulder})`}>
      {/* Hombrera tallada que solapa hombro y torso sin huecos */}
      <path
        d={`M -17 -10 C -19 -2, -17 6, -12 12 C -6 16, 6 16, 12 12 C 17 6, 19 -2, 17 -10 C 14 -16, -14 -16, -17 -10 Z`}
        fill={`url(#${uid}-tunic)`}
      />
      <path d={`M -17 -10 C -19 -2, -17 5, -13 11`} stroke={ctx.rim} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d={`M -13 -8 C -15 0, -14 6, -11 10`} stroke="#07130C" strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d={limbPath(30, 24, UPPER_ARM_LEN)} fill={`url(#${uid}-tunic)`} />
      <path d={`M -12 30 C -11 52, -10 68, -9 ${UPPER_ARM_LEN - 6}`} stroke="#07130C" strokeWidth="1.8" fill="none" opacity="0.6" />
      <path d={`M ${m * 14} 16 C ${m * 15} 44, ${m * 13} 66, ${m * 11} ${UPPER_ARM_LEN - 6}`} stroke={ctx.rim} strokeWidth="1.6" fill="none" opacity="0.4" />
      <g transform={`translate(0 ${UPPER_ARM_LEN}) rotate(${m * 5})`}>
        <path d={limbPath(24, 18, FOREARM_LEN)} fill={`url(#${uid}-skin)`} />
        <path d={`M -9 26 C -8 44, -7 58, -6 68`} stroke="#4A5644" strokeWidth="1.6" fill="none" opacity="0.6" />
        <path d={`M 9 26 C 8 44, 7 58, 6 68`} stroke="#4A5644" strokeWidth="1.2" fill="none" opacity="0.5" />
        {/* Mano tallada */}
        <g transform={`translate(0 ${FOREARM_LEN})`}>
          <path
            d={`M -11 0 C -12 8, -11 14, -10 20 L 10 20 C 11 14, 12 8, 11 0 C 9 -3, -9 -3, -11 0 Z`}
            fill={`url(#${uid}-skin)`}
          />
          <path d={`M -6 20 L -6 28 L -3 28 L -3 20 Z`} fill={`url(#${uid}-skin)`} />
          <path d={`M -1 20 L -1 30 L 2 30 L 2 20 Z`} fill={`url(#${uid}-skin)`} />
          <path d={`M 4 20 L 4 28 L 7 28 L 7 20 Z`} fill={`url(#${uid}-skin)`} />
          <path d={`M -10 4 C -16 8, -20 13, -21 19 L -17 19 C -16 14, -13 9, -9 8 Z`} fill={`url(#${uid}-skin-dark)`} />
          <path d={`M -8 22 C -7 25, -6 27, -4 28`} stroke="#04090A" strokeWidth="1" fill="none" opacity="0.7" />
          <path d={`M 2 23 C 3 26, 4 29, 5 30`} stroke="#04090A" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      </g>
    </g>
  );
};

/** ---- Pierna tallada ---- */
const StatueLeg: React.FC<{ ctx: StatueCtx; side: "l" | "r" }> = ({ ctx, side }) => {
  const { uid } = ctx;
  const m = side === "l" ? 1 : -1;
  return (
    <g transform={`translate(${m * HIP_DX} 0)`}>
      <path d={limbPath(34, 27, THIGH_LEN)} fill={`url(#${uid}-tunic-dark)`} />
      <path d={`M -14 24 C -13 50, -12 72, -11 94`} stroke="#07130C" strokeWidth="2" fill="none" opacity="0.6" />
      <path d={`M 14 24 C 13 50, 12 72, 11 94`} stroke="#07130C" strokeWidth="1.6" fill="none" opacity="0.5" />
      <path d={`M ${m * 15} 18 C ${m * 16} 48, ${m * 14} 74, ${m * 12} 94`} stroke={ctx.rim} strokeWidth="1.6" fill="none" opacity="0.4" />
      <g transform={`translate(0 ${THIGH_LEN})`}>
        {/* Bota de cuero tallada cubriendo la espinilla */}
        <path d={limbPath(28, 22, SHIN_LEN)} fill={`url(#${uid}-leather)`} />
        <path d={`M -12 14 L 12 14`} stroke="#0F0904" strokeWidth="2.2" opacity="0.8" />
        <path d={`M -12.5 36 L 12.5 36`} stroke="#0F0904" strokeWidth="2.2" opacity="0.8" />
        <path d={`M -13 58 L 13 58`} stroke="#0F0904" strokeWidth="1.8" opacity="0.65" />
        <path d={`M -12.5 80 L 12.5 80`} stroke="#0F0904" strokeWidth="1.6" opacity="0.55" />
        <path d={`M -11 18 C -10 52, -9 82, -8 106`} stroke="#1A120A" strokeWidth="1.6" fill="none" opacity="0.55" />
        <path d={`M 11 18 C 10 52, 9 82, 8 106`} stroke="#1A120A" strokeWidth="1.2" fill="none" opacity="0.45" />
        {/* Bota tallada */}
        <g transform={`translate(0 ${SHIN_LEN})`}>
          <path
            d={`M -13 16 L 30 16 C 32 16, 33 18, 32 20 L -11 20 C -14 20, -15 18, -13 16 Z`}
            fill="#0F0904"
          />
          <path
            d={`M -14 0 C -12 8, -6 13, 4 16 C 14 18, 24 17, 30 14 C 32 10, 32 4, 30 0 C 20 -3, 2 -4, -14 0 Z`}
            fill={`url(#${uid}-leather)`}
          />
          <path d={`M -10 -4 L 14 -4`} stroke="#0F0904" strokeWidth="2" opacity="0.7" />
          <path d={`M 20 2 C 26 5, 30 10, 31 13`} stroke="#0F0904" strokeWidth="1.4" fill="none" opacity="0.8" />
          <path d={`M -14 2 C -12 8, -9 12, -4 16`} stroke={ctx.rim} strokeWidth="1.2" fill="none" opacity="0.3" />
        </g>
      </g>
    </g>
  );
};

/** ---- Llamas volumétricas envolventes ---- */
const StatueFlames: React.FC<{ ctx: StatueCtx; f: number }> = ({ ctx, f }) => {
  const { uid, frame } = ctx;
  if (f <= 0.01) {
    return null;
  }
  const lobesBack = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const x = 128 + i * 34;
    const seed = i * 1.37;
    const h = (46 + 34 * Math.sin(frame * 0.5 + seed * 1.7)) * f;
    const w = 26 + (i % 3) * 7;
    const baseY = 668 + (i % 2) * 22;
    return { x, seed, h, w, baseY };
  });
  const lobesFront = [0, 1, 2, 3].map((i) => {
    const x = 190 + i * 26 + Math.sin(frame * 0.4 + i) * 6;
    const seed = i * 2.3 + 0.6;
    const h = (58 + 40 * Math.sin(frame * 0.55 + seed * 1.9)) * f;
    const w = 22 + (i % 2) * 8;
    const baseY = 688;
    return { x, seed, h, w, baseY };
  });
  const embers = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const x = PELVIS_X + Math.sin(frame * 0.05 + i * 2.1) * 82;
    const y = 660 - ((frame * 2.4 + i * 53) % 340);
    const r = 2 + (i % 3);
    const o = 0.45 + 0.4 * Math.sin(frame * 0.7 + i * 1.3);
    return { x, y, r, o };
  });
  return (
    <g>
      {/* Resplandor ambiental */}
      <ellipse cx={PELVIS_X} cy={640} rx={190} ry={150} fill={`url(#${uid}-fire-glow)`} opacity={f * 0.4} filter={`url(#${uid}-blur18)`} />
      {/* Lenguas traseras */}
      {lobesBack.map((l, i) => (
        <g key={`b${i}`}>
          <path d={flameLobe(l.x, l.baseY, l.h, l.w, l.seed)} fill={`url(#${uid}-fire-outer)`} opacity={0.9 * f} />
          <path d={flameLobe(l.x + 4, l.baseY, l.h * 0.62, l.w * 0.6, l.seed + 0.7)} fill={`url(#${uid}-fire-mid)`} opacity={0.85 * f} />
          <path d={flameLobe(l.x + 5, l.baseY, l.h * 0.34, l.w * 0.34, l.seed + 1.2)} fill={`url(#${uid}-fire-core)`} opacity={0.9 * f} />
        </g>
      ))}
      {/* Lenguas frontales (envuelven la estatua) */}
      {lobesFront.map((l, i) => (
        <g key={`f${i}`}>
          <path d={flameLobe(l.x, l.baseY, l.h, l.w, l.seed)} fill={`url(#${uid}-fire-mid)`} opacity={0.9 * f} />
          <path d={flameLobe(l.x + 3, l.baseY, l.h * 0.55, l.w * 0.55, l.seed + 0.5)} fill={`url(#${uid}-fire-core)`} opacity={0.95 * f} />
        </g>
      ))}
      {/* Brasas flotantes deterministas */}
      {embers.map((e, i) => (
        <g key={`e${i}`}>
          <circle cx={e.x} cy={e.y} r={e.r * 3.4} fill={`url(#${uid}-fire-core)`} opacity={e.o * 0.35 * f} filter={`url(#${uid}-blur6)`} />
          <circle cx={e.x} cy={e.y} r={e.r} fill="#FDE047" opacity={e.o * f} />
        </g>
      ))}
    </g>
  );
};

export const ElegyStatueCharacter: React.FC<ElegyStatueProps> = ({
  width = 400,
  rimColor = "#22C55E",
  glowEyes = false,
  eyeGlowColor = "#22C55E",
  teleportGlitch = 0,
  flameIntensity = 0,
  uid = "es",
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const glitch = clamp01(teleportGlitch);
  const f = clamp01(flameIntensity);

  // Micro-ladeos paranormales + contracciones súbitas durante el glitch.
  const headTilt =
    Math.sin(frame * 0.023 + 1) * 2.2 +
    Math.sin(frame * 0.0071) * 1.3 +
    glitch * Math.sin(frame * 1.7) * 2.4;

  // Fantasmas cromáticos + desplazamiento de escaneo CRT.
  const ghostOffset = glitch * 9;
  const jitter = glitch * Math.sin(frame * 2.7) * 8;
  const scale = 1 + glitch * 0.05 * (0.5 + 0.5 * Math.sin(frame * 1.9));
  const flash = glitch * (0.4 + 0.4 * Math.sin(frame * 1.9));

  const ctx: StatueCtx = {
    frame,
    uid,
    rim: rimColor,
    glow: glowEyes,
    glowColor: eyeGlowColor,
    glitch,
    headTilt,
  };

  const scanStrips = [0, 1, 2, 3].map((i) => ({
    y: (frame * 13 + i * 97) % 720,
    h: 6 + (i % 2) * 8,
    c: i % 2 === 0 ? "#22C55E" : "#F43F5E",
  }));

  return (
    <div
      style={{
        position: "absolute",
        width,
        height: (width * VIEW_H) / VIEW_W,
        opacity,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#A8B5A0" />
            <stop offset="100%" stopColor="#6E7A66" />
          </linearGradient>
          <linearGradient id={`${uid}-skin-light`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#B9C4B0" />
            <stop offset="100%" stopColor="#8A977E" />
          </linearGradient>
          <linearGradient id={`${uid}-skin-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C8A72" />
            <stop offset="100%" stopColor="#4A5644" />
          </linearGradient>
          <linearGradient id={`${uid}-tunic`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#163822" />
            <stop offset="100%" stopColor="#0B1F13" />
          </linearGradient>
          <linearGradient id={`${uid}-tunic-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E2418" />
            <stop offset="100%" stopColor="#06130C" />
          </linearGradient>
          <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#1F4A2E" />
            <stop offset="100%" stopColor="#0E2418" />
          </linearGradient>
          <linearGradient id={`${uid}-cap-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#122C1B" />
            <stop offset="100%" stopColor="#081810" />
          </linearGradient>
          <linearGradient id={`${uid}-blond`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#A39A62" />
            <stop offset="100%" stopColor="#4B4527" />
          </linearGradient>
          <linearGradient id={`${uid}-leggings`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#B9B49E" />
            <stop offset="100%" stopColor="#7C7660" />
          </linearGradient>
          <linearGradient id={`${uid}-leather`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#4A3826" />
            <stop offset="100%" stopColor="#241A10" />
          </linearGradient>
          <linearGradient id={`${uid}-leather-dark`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#332616" />
            <stop offset="100%" stopColor="#170F08" />
          </linearGradient>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A8088" />
            <stop offset="100%" stopColor="#3A3F45" />
          </linearGradient>
          <radialGradient id={`${uid}-fire-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-fire-outer`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id={`${uid}-fire-mid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="55%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id={`${uid}-fire-core`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="55%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-ao`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${uid}-blur6`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={`${uid}-blur18`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id={`${uid}-ghost-green`} x="-30%" y="-30%" width="160%" height="160%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.13  0 0 0 0 0.77  0 0 0 0 0.37  0 0 0 1 0"
            />
          </filter>
          <filter id={`${uid}-ghost-magenta`} x="-30%" y="-30%" width="160%" height="160%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.96  0 0 0 0 0.25  0 0 0 0 0.37  0 0 0 1 0"
            />
          </filter>
        </defs>

        {/* Sombra densa de contacto */}
        <ellipse cx={PELVIS_X} cy={GROUND_Y + 2} rx={96} ry={15} fill={`url(#${uid}-shadow)`} opacity={0.55} />
        <ellipse cx={PELVIS_X - 40} cy={GROUND_Y + 3} rx={26} ry={6} fill={`url(#${uid}-shadow)`} opacity={0.45} />
        <ellipse cx={PELVIS_X + 40} cy={GROUND_Y + 3} rx={26} ry={6} fill={`url(#${uid}-shadow)`} opacity={0.45} />

        {/* Destello de materialización */}
        {glitch > 0.01 && (
          <ellipse
            cx={PELVIS_X}
            cy={360}
            rx={200}
            ry={320}
            fill="#22C55E"
            opacity={flash * 0.4}
            filter={`url(#${uid}-blur18)`}
            style={{ mixBlendMode: "screen" }}
          />
        )}

        {/* Fantasmas cromáticos verde/magenta (teleportGlitch) */}
        {glitch > 0.01 && (
          <g>
            <g
              filter={`url(#${uid}-ghost-green)`}
              opacity={glitch * 0.4}
              transform={`translate(${-ghostOffset + jitter} 0)`}
            >
              <StatueBody ctx={ctx} />
            </g>
            <g
              filter={`url(#${uid}-ghost-magenta)`}
              opacity={glitch * 0.4}
              transform={`translate(${ghostOffset + jitter} 0)`}
            >
              <StatueBody ctx={ctx} />
            </g>
          </g>
        )}

        {/* Estatua principal */}
        <g transform={`translate(${jitter} 0)`}>
          <g
            transform={`translate(${PELVIS_X} ${GROUND_Y}) scale(${scale}) translate(${-PELVIS_X} ${-GROUND_Y})`}
          >
            <StatueBody ctx={ctx} />
          </g>
        </g>

        {/* Tiras de escaneo CRT durante el glitch */}
        {glitch > 0.01 &&
          scanStrips.map((s, i) => (
            <rect
              key={i}
              x={58}
              y={s.y}
              width={344}
              height={s.h}
              fill={s.c}
              opacity={glitch * 0.32}
            />
          ))}

        {/* Llamas volumétricas + brasas */}
        <StatueFlames ctx={ctx} f={f} />
      </svg>
    </div>
  );
};

/** ---- Cuerpo completo (esqueleto articulado) ---- */
const StatueBody: React.FC<{ ctx: StatueCtx }> = ({ ctx }) => {
  return (
    <g transform={`translate(${PELVIS_X} 470)`}>
      {/* Piernas plantadas */}
      <StatueLeg ctx={ctx} side="l" />
      <StatueLeg ctx={ctx} side="r" />

      {/* Torso */}
      <g transform={`rotate(${Math.sin(ctx.frame * 0.005) * 0.8})`}>
        <StatueTorso ctx={ctx} />
        <StatueArm ctx={ctx} side="l" />
        <StatueArm ctx={ctx} side="r" />

        {/* Cuello esculpido */}
        <g transform={`translate(0 ${NECK_BASE_DY}) rotate(${ctx.headTilt})`}>
          <path
            d={`M -13 -6 C -12 8, -11 18, -10 28 L 10 28 C 11 18, 12 8, 13 -6 C 11 -10, -11 -10, -13 -6 Z`}
            fill={`url(#${ctx.uid}-skin-dark)`}
          />
          <path d={`M -11 4 C -10 12, -9 20, -8 26`} stroke="#3E4A38" strokeWidth="1.4" fill="none" opacity="0.7" />
          <path d={`M 11 4 C 10 12, 9 20, 8 26`} stroke="#3E4A38" strokeWidth="1.4" fill="none" opacity="0.7" />
          <path d={`M -13 -2 L 13 -2`} stroke="#3E4A38" strokeWidth="1.2" fill="none" opacity="0.6" />
          <ellipse cx="0" cy="-8" rx="12" ry="4.5" fill="#040507" opacity="0.35" filter={`url(#${ctx.uid}-ao)`} />

          {/* Cabeza */}
          <g transform={`translate(0 ${HEAD_DY - NECK_BASE_DY})`}>
            <StatueFace ctx={ctx} />
          </g>
        </g>
      </g>
    </g>
  );
};
