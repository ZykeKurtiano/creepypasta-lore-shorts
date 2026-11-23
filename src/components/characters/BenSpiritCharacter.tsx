import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * BenSpiritCharacter — Rig vectorial 2.5D de altísima sensibilidad
 * cinematográfica (48+ <path> orgánicos) del espíritu / recuerdo del
 * niño Ben ahogado (hermano menor en el retake y espíritu del cartucho).
 *
 *  - Anatomía infantil melancólica (~8-10 años): cejas inclinadas,
 *    párpados pesados animados, ojos oscuros húmedos con reflejo
 *    abisal cian (#22D3EE), mejillas pálidas azuladas y boca
 *    entreabierta.
 *  - Cabello húmedo en capas con mechones pegados a frente y sienes
 *    goteando agua.
 *  - Túnica/camiseta empapada con pliegues pesados, cuello caído,
 *    dobladillo rasgado ondeando como bajo el agua (sin en fase
 *    determinista), mangas mojadas y piernas/pies descalzos sumergidos.
 *  - Esqueleto articulado <g> con flotación/suspensión suave y postura
 *    en el reflejo del agua alzando lentamente una mano hacia Matt.
 *  - Física volumétrica de agua: gotas cerradas con brillo especular
 *    blanco-cian, ondas concéntricas y halo acuático en la base,
 *    burbujas ascendentes deterministas, emergence (0..1) para emerger
 *    progresivamente desde el reflejo con ondas distorsionadoras y
 *    glitchOverlay (0..1) para la transición del reflejo glitcheado de
 *    Majora's Mask al rostro real de Ben.
 *  - 100% determinista: useCurrentFrame + sin.
 */

export interface BenSpiritProps {
  width?: number;
  emergence?: number;
  glitchOverlay?: number;
  showWaterRipples?: boolean;
  raiseHand?: boolean;
  floatAmplitude?: number;
  uid?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

const VIEW_W = 440;
const VIEW_H = 760;
const PELVIS_X = 220;
const WATERLINE_Y = 560;

const SHOULDER_DX = 54;
const SHOULDER_DY = -96;
const HIP_DX = 16;
const NECK_BASE_DY = -122;
const HEAD_DY = -218;
const UPPER_ARM_LEN = 64;
const FOREARM_LEN = 54;
const THIGH_LEN = 64;
const SHIN_LEN = 60;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const limbPath = (topW: number, botW: number, len: number): string =>
  [
    `M ${-topW / 2} 5`,
    `C ${-topW / 2 - 3} ${len * 0.42}, ${-topW / 2 - 3.5} ${len * 0.6}, ${-botW / 2} ${len - 4}`,
    `C ${-botW / 2 + 2} ${len - 1}, ${botW / 2 - 2} ${len - 1}, ${botW / 2} ${len - 4}`,
    `C ${topW / 2 + 3.5} ${len * 0.6}, ${topW / 2 + 3} ${len * 0.42}, ${topW / 2} 5`,
    `C ${topW / 2 - 4} -3, ${-topW / 2 + 4} -3, ${-topW / 2} 5`,
    "Z",
  ].join(" ");

interface SpiritCtx {
  frame: number;
  uid: string;
  raise: number;
  glitch: number;
  /** Desplazamiento Y de la máscara para alinearla al rostro real de Ben. */
  maskDY: number;
}

/** ---- Rostro infantil melancólico (grupo local de la cabeza) ---- */
const SpiritFace: React.FC<{ ctx: SpiritCtx }> = ({ ctx }) => {
  const { uid, frame } = ctx;
  const lidOpen = 0.72 + Math.sin(frame * 0.021) * 0.05;
  const lidLow = -8 + (1 - lidOpen) * 9;
  const sob = Math.sin(frame * 0.16) * 0.5;
  return (
    <g>
      {/* Cabello húmedo trasero */}
      <path
        d={`M -56 -58 C -68 -30, -70 0, -64 26 C -58 42, -46 52, -32 58 L 32 58 C 46 52, 58 42, 64 26 C 70 0, 68 -30, 56 -58 C 46 -76, 30 -86, 10 -90 C -12 -94, -30 -88, -42 -78 C -50 -72, -54 -66, -56 -58 Z`}
        fill={`url(#${uid}-hair)`}
      />
      {/* Contorno del rostro infantil */}
      <path
        d={`M -50 -40 C -53 -12, -53 14, -46 40 C -38 58, -24 69, -8 73 C 6 75.5, 16 73.5, 26 66 C 38 53, 46 30, 47 2 C 48 -28, 42 -50, 32 -62 C 20 -73, 6 -77, -8 -76 C -28 -74, -44 -60, -50 -40 Z`}
        fill={`url(#${uid}-skin)`}
      />
      {/* Orejas pequeñas */}
      <path
        d={`M -50 -8 C -56 0, -56 10, -50 16 C -47 18, -44 16, -44 13 C -48 8, -48 0, -44 -6 C -44 -9, -47 -11, -50 -8 Z`}
        fill={`url(#${uid}-skin-dark)`}
      />
      <path
        d={`M 50 -8 C 56 0, 56 10, 50 16 C 47 18, 44 16, 44 13 C 48 8, 48 0, 44 -6 C 44 -9, 47 -11, 50 -8 Z`}
        fill={`url(#${uid}-skin-dark)`}
      />
      {/* Mejillas pálidas azuladas */}
      <ellipse cx="-28" cy="14" rx="11" ry="7" fill="#6C8EA6" opacity="0.28" />
      <ellipse cx="28" cy="14" rx="11" ry="7" fill="#6C8EA6" opacity="0.28" />
      <path d={`M -36 8 C -34 14, -30 19, -24 20`} stroke="#8FB2CC" strokeWidth="1.2" fill="none" opacity="0.35" />
      <path d={`M 36 8 C 34 14, 30 19, 24 20`} stroke="#8FB2CC" strokeWidth="1.2" fill="none" opacity="0.35" />
      {/* Cuencas + ojeras */}
      <path
        d={`M -33 -16 C -26 -24, -14 -24, -7 -16 C -14 -9, -26 -9, -33 -16 Z`}
        fill="#0A1420"
        opacity="0.5"
      />
      <path
        d={`M 33 -16 C 26 -24, 14 -24, 7 -16 C 14 -9, 26 -9, 33 -16 Z`}
        fill="#0A1420"
        opacity="0.5"
      />
      {/* Ojos oscuros húmedos con reflejo abisal cian */}
      <ellipse cx="-20" cy="-8" rx="14" ry="12.5" fill="#E3DCD0" />
      <ellipse cx="20" cy="-8" rx="14" ry="12.5" fill="#E3DCD0" />
      <circle cx="-20" cy="-8" r="8" fill={`url(#${uid}-iris)`} />
      <circle cx="20" cy="-8" r="8" fill={`url(#${uid}-iris)`} />
      <circle cx="-20" cy="-8" r="3.4" fill="#05090C" />
      <circle cx="20" cy="-8" r="3.4" fill="#05090C" />
      {/* Reflejo abisal cian */}
      <path
        d={`M -24.5 -13 C -23 -15, -21 -15.5, -19.5 -14.5 C -21.5 -12, -24 -12, -24.5 -13 Z`}
        fill="#22D3EE"
        opacity="0.95"
      />
      <path
        d={`M 15.5 -13 C 17 -15, 19 -15.5, 20.5 -14.5 C 18.5 -12, 16 -12, 15.5 -13 Z`}
        fill="#22D3EE"
        opacity="0.95"
      />
      <circle cx="-17" cy="-11.6" r="1.4" fill="#FFFFFF" opacity="0.85" />
      <circle cx="23" cy="-11.6" r="1.4" fill="#FFFFFF" opacity="0.85" />
      {/* Párpados pesados animados */}
      <path
        d={`M -34 -13 C -26 -20, -14 -20, -6 -13 L -5 ${lidLow} C -12 ${lidLow - 6}, -28 ${lidLow - 6}, -34 ${lidLow} Z`}
        fill={`url(#${uid}-skin)`}
      />
      <path
        d={`M 34 -13 C 26 -20, 14 -20, 6 -13 L 5 ${lidLow} C 12 ${lidLow - 6}, 28 ${lidLow - 6}, 34 ${lidLow} Z`}
        fill={`url(#${uid}-skin)`}
      />
      <path
        d={`M -33 -17 C -26 -22, -14 -22, -7 -17`}
        stroke="#5A4A38"
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
      />
      <path
        d={`M 33 -17 C 26 -22, 14 -22, 7 -17`}
        stroke="#5A4A38"
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
      />
      {/* Sombra húmeda del párpado inferior */}
      <path
        d={`M -31 -1 C -26 3, -14 3, -9 -1`}
        stroke="#0A1420"
        strokeWidth="1.6"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M 31 -1 C 26 3, 14 3, 9 -1`}
        stroke="#0A1420"
        strokeWidth="1.6"
        fill="none"
        opacity="0.5"
      />
      {/* Cejas inclinadas melancólicas */}
      <path d={`M -31 -30 L -12 -36`} stroke="#14100C" strokeWidth="3" strokeLinecap="round" />
      <path d={`M 31 -30 L 12 -36`} stroke="#14100C" strokeWidth="3" strokeLinecap="round" />
      {/* Nariz infantil */}
      <path d={`M 0 -22 C -1 -12, -2 -2, 0 7`} stroke={`url(#${uid}-skin-dark)`} strokeWidth="2" fill="none" opacity="0.9" />
      <path d={`M -4 7 C -3 12, 3 12, 5 7 C 4 11, -3 11, -4 7 Z`} fill={`url(#${uid}-skin-dark)`} />
      <circle cx="-2.5" cy="10" r="1" fill="#3A2C1F" opacity="0.4" />
      <circle cx="3.5" cy="10.2" r="1" fill="#3A2C1F" opacity="0.4" />
      {/* Boca entreabierta */}
      <path
        d={`M -7 ${30 + sob * 0.4} C -8 ${34 + sob}, -5 ${37 + sob}, 0 ${37.5 + sob} C 5 ${37 + sob}, 8 ${34 + sob}, 7 ${30 + sob * 0.4} C 5 ${28 + sob * 0.4}, -5 ${28 + sob * 0.4}, -7 ${30 + sob * 0.4} Z`}
        fill="#16080C"
      />
      <path
        d={`M -9 ${33 + sob} C -4 ${37 + sob}, 4 ${37 + sob}, 9 ${33 + sob}`}
        stroke="#5A4A38"
        strokeWidth="1.4"
        fill="none"
        opacity="0.6"
      />
      <ellipse cx="0" cy={43 + sob} rx="6" ry="2.6" fill="#3A2C1F" opacity="0.3" />
      {/* Mechones húmedos pegados a la frente */}
      {[
        { x: -34, tip: -30, bend: 6 },
        { x: -17, tip: -34, bend: 3 },
        { x: 0, tip: -31, bend: -1 },
        { x: 18, tip: -34, bend: -3 },
        { x: 35, tip: -30, bend: -6 },
      ].map((s, i) => (
        <g key={i}>
          <path
            d={`M ${s.x - 4} -54 C ${s.x - 6} -46, ${s.x - 6 + s.bend} -40, ${s.x - 3 + s.bend} ${s.tip} C ${s.x - 1 + s.bend} ${s.tip + 3}, ${s.x + 1.5 + s.bend} ${s.tip + 3}, ${s.x + 3 + s.bend} ${s.tip} C ${s.x + 5} -42, ${s.x + 4} -48, ${s.x + 3} -54 Z`}
            fill={`url(#${uid}-hair)`}
          />
          <path
            d={`M ${s.x - 2 + s.bend} ${s.tip + 1} C ${s.x - 2} -42, ${s.x - 1} -48, ${s.x} -54`}
            stroke="#22D3EE"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />
        </g>
      ))}
      {/* Mechones pegados a las sienes */}
      <path
        d={`M -48 -34 C -56 -18, -58 -2, -54 14 C -51 22, -47 26, -44 22 C -47 8, -47 -10, -44 -28 Z`}
        fill={`url(#${uid}-hair)`}
      />
      <path
        d={`M 48 -34 C 56 -18, 58 -2, 54 14 C 51 22, 47 26, 44 22 C 47 8, 47 -10, 44 -28 Z`}
        fill={`url(#${uid}-hair)`}
      />
      <path
        d={`M -52 -26 C -56 -14, -57 -2, -53 12`}
        stroke="#22D3EE"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
      />
      <path
        d={`M 52 -26 C 56 -14, 57 -2, 53 12`}
        stroke="#22D3EE"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
      />
    </g>
  );
};

/** ---- Túnica empapada con dobladillo rasgado ondulante ---- */
const SpiritTorso: React.FC<{ ctx: SpiritCtx }> = ({ ctx }) => {
  const { uid, frame } = ctx;
  const hemY = (i: number): number => {
    const base = 8 + (i % 2) * -5;
    return base + Math.sin(frame * 0.06 + i * 0.9) * 2.6;
  };
  return (
    <g>
      <path
        d={`M -26 -122 C -40 -108, -52 -92, -56 -74 C -60 -54, -61 -30, -58 -6 L -52 6 L -44 0 L -36 ${hemY(1)} L -28 ${hemY(2)} L -20 ${hemY(3)} L -12 ${hemY(4)} L -4 ${hemY(5)} L 4 ${hemY(6)} L 12 ${hemY(7)} L 20 ${hemY(8)} L 28 ${hemY(9)} L 36 ${hemY(10)} L 44 ${hemY(11)} L 52 ${hemY(12)} L 58 -6 C 61 -30, 60 -54, 56 -74 C 52 -92, 40 -108, 26 -122 Z`}
        fill={`url(#${uid}-wet-shirt)`}
      />
      {/* Cuello caído */}
      <path
        d={`M -20 -118 C -12 -106, -4 -98, 0 -90 C 4 -98, 12 -106, 20 -118 C 12 -112, -12 -112, -20 -118 Z`}
        fill={`url(#${uid}-wet-dark)`}
      />
      <path
        d={`M -24 -118 C -16 -106, -8 -98, 0 -92`}
        stroke="#0C1520"
        strokeWidth="1.6"
        fill="none"
        opacity="0.7"
      />
      {/* Pliegues pesados por el agua */}
      <path d={`M -40 -96 C -38 -66, -34 -38, -30 -14`} stroke="#0C1520" strokeWidth="2.4" fill="none" opacity="0.6" />
      <path d={`M 40 -96 C 38 -66, 34 -38, 30 -14`} stroke="#0C1520" strokeWidth="2.4" fill="none" opacity="0.6" />
      <path d={`M 0 -100 C 2 -70, 3 -40, 3 -10`} stroke="#0C1520" strokeWidth="1.8" fill="none" opacity="0.45" />
      <path d={`M -22 -104 C -20 -76, -18 -50, -16 -26`} stroke="#0C1520" strokeWidth="1.6" fill="none" opacity="0.4" />
      <path d={`M 22 -104 C 20 -76, 18 -50, 16 -26`} stroke="#0C1520" strokeWidth="1.6" fill="none" opacity="0.4" />
      {/* Reflejos húmedos */}
      <path d={`M -44 -92 C -42 -64, -38 -38, -34 -16`} stroke="#4C6B8A" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d={`M 44 -92 C 42 -64, 38 -38, 34 -16`} stroke="#4C6B8A" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d={`M -54 -70 C -55 -50, -56 -30, -55 -10`} stroke="#8FB2CC" strokeWidth="1.2" fill="none" opacity="0.4" />
      {/* Goteo desde el dobladillo */}
      <path d={`M -30 ${hemY(2)} L -29 ${hemY(2) + 14}`} stroke="#4C6B8A" strokeWidth="1.4" opacity="0.5" />
      <path d={`M 26 ${hemY(9)} L 25 ${hemY(9) + 16}`} stroke="#4C6B8A" strokeWidth="1.4" opacity="0.5" />
      {/* Oclusión ambiental */}
      <path d={`M -52 -80 C -48 -72, -44 -66, -40 -62`} stroke="#040507" strokeWidth="4.5" fill="none" opacity="0.5" filter={`url(#${uid}-ao)`} />
      <path d={`M 52 -80 C 48 -72, 44 -66, 40 -62`} stroke="#040507" strokeWidth="4.5" fill="none" opacity="0.5" filter={`url(#${uid}-ao)`} />
    </g>
  );
};

/** ---- Brazo infantil delgado ---- */
const SpiritArm: React.FC<{ ctx: SpiritCtx; side: "l" | "r" }> = ({ ctx, side }) => {
  const { uid, frame } = ctx;
  const m = side === "l" ? 1 : -1;
  // Brazo derecho (m=-1): alza lentamente la mano hacia Matt.
  const shoulder =
    side === "r"
      ? -8 - 58 * ctx.raise + Math.sin(frame * 0.03) * 1.5
      : 4 + Math.sin(frame * 0.04) * 2;
  const elbow = side === "r" ? -18 + 26 * ctx.raise : -7;
  const wrist = side === "r" ? -10 - 14 * ctx.raise : -4;
  const sway = Math.sin(frame * 0.045 + (side === "l" ? 0 : 2)) * 2;
  return (
    <g transform={`translate(${m * SHOULDER_DX} ${SHOULDER_DY}) rotate(${shoulder})`}>
      {/* Manga mojada */}
      <path d={limbPath(24, 19, UPPER_ARM_LEN)} fill={`url(#${uid}-wet-shirt)`} />
      <path d={`M -9 22 C -8 38, -7 50, -6 60`} stroke="#0C1520" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d={`M -11 20 C -10 34, -9 46, -8 56`} stroke="#4C6B8A" strokeWidth="1.1" fill="none" opacity="0.5" />
      <g transform={`translate(0 ${UPPER_ARM_LEN}) rotate(${elbow})`}>
        {/* Antebrazo desnudo */}
        <path d={limbPath(18, 14, FOREARM_LEN)} fill={`url(#${uid}-skin)`} />
        <path d={`M -7 20 C -6 34, -5 44, -4 50`} stroke="#5A4A38" strokeWidth="1.2" fill="none" opacity="0.5" />
        <g transform={`translate(0 ${FOREARM_LEN}) rotate(${wrist + sway})`}>
          <path
            d={`M -8 -2 C -9 7, -8 14, -7 20 L 7 20 C 8 14, 9 7, 8 -2 C 6 -4, -6 -4, -8 -2 Z`}
            fill={`url(#${uid}-skin)`}
          />
          <path d={`M -7 20 L -7 26 L -4 26 L -4 20 Z`} fill={`url(#${uid}-skin)`} />
          <path d={`M -2 20 L -2 28 L 1 28 L 1 20 Z`} fill={`url(#${uid}-skin)`} />
          <path d={`M 4 20 L 4 26 L 7 26 L 7 20 Z`} fill={`url(#${uid}-skin)`} />
          <path
            d={`M -8 2 C -13 5, -16 9, -17 14 L -14 14 C -13 10, -10 7, -7 6 Z`}
            fill={`url(#${uid}-skin-dark)`}
          />
        </g>
      </g>
    </g>
  );
};

/** ---- Piernas delgadas sumergidas ---- */
const SpiritLeg: React.FC<{ ctx: SpiritCtx; side: "l" | "r" }> = ({ ctx, side }) => {
  const { uid, frame } = ctx;
  const m = side === "l" ? 1 : -1;
  const drift = Math.sin(frame * 0.04 + (side === "l" ? 0 : 2.4)) * 3;
  return (
    <g transform={`translate(${m * HIP_DX} ${drift})`}>
      <path d={limbPath(24, 19, THIGH_LEN)} fill={`url(#${uid}-wet-pants)`} />
      <path d={`M -9 20 C -8 36, -7 48, -6 58`} stroke="#0C1520" strokeWidth="1.3" fill="none" opacity="0.5" />
      <g transform={`translate(0 ${THIGH_LEN}) rotate(${m * 4})`}>
        <path d={limbPath(19, 14, SHIN_LEN)} fill={`url(#${uid}-skin)`} />
        <g transform={`translate(0 ${SHIN_LEN}) rotate(${m * -6})`}>
          <path
            d={`M -8 0 C -9 7, -9 12, -7 16 L 10 16 C 11 11, 11 5, 10 0 C 6 -3, -5 -3, -8 0 Z`}
            fill={`url(#${uid}-skin)`}
          />
          <path d={`M 6 14 C 7 16, 8 18, 9 20 L 11 20 C 10 17, 9 15, 8 14 Z`} fill={`url(#${uid}-skin-dark)`} />
        </g>
      </g>
    </g>
  );
};

/** ---- Agua: gotas volumétricas, ondas, burbujas y halo ---- */
const WaterFx: React.FC<{ ctx: SpiritCtx; showRipples: boolean }> = ({ ctx, showRipples }) => {
  const { uid, frame } = ctx;
  const drops = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
    const fromHair = i < 4;
    const startX = fromHair ? 168 + i * 36 : 158 + i * 26;
    const startY = fromHair ? 168 + (i % 2) * 22 : 520 + (i % 3) * 14;
    const y = startY + ((frame * 2 + i * 41) % 260);
    const x = startX + Math.sin(frame * 0.06 + i * 1.7) * 8;
    const r = fromHair ? 3 + (i % 2) : 4 + (i % 2);
    return { x, y, r, o: fromHair ? 0.85 : 0.7 };
  });
  const bubbles = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 196 + Math.sin(frame * 0.05 + i * 1.9) * 26 + i * 8,
    y: 700 - ((frame * 1.7 + i * 47) % 240),
    r: 2 + (i % 3) * 1.4,
    o: 0.35 + 0.25 * Math.sin(frame * 0.5 + i),
  }));
  return (
    <g>
      {showRipples && (
        <g>
          {/* Halo acuático */}
          <ellipse
            cx={PELVIS_X}
            cy={WATERLINE_Y}
            rx={150}
            ry={36}
            fill={`url(#${uid}-water-halo)`}
            opacity="0.55"
            filter={`url(#${uid}-blur10)`}
          />
          {/* Sombra de reflejo en el agua */}
          <ellipse cx={PELVIS_X} cy={WATERLINE_Y + 14} rx={86} ry={16} fill="#04121A" opacity="0.45" filter={`url(#${uid}-blur10)`} />
          {/* Ondas concéntricas */}
          {[0, 1, 2].map((i) => {
            const rr = (frame * 1.1 + i * 44) % 132;
            return (
              <ellipse
                key={i}
                cx={PELVIS_X}
                cy={WATERLINE_Y}
                rx={rr}
                ry={rr * 0.24}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="1.6"
                opacity={Math.max(0, 0.5 - rr / 132) * 0.8}
              />
            );
          })}
        </g>
      )}
      {/* Burbujas ascendentes */}
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#22D3EE" strokeWidth="1.2" opacity={b.o} />
          <circle cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.3} r={b.r * 0.25} fill="#FFFFFF" opacity={b.o * 0.8} />
        </g>
      ))}
      {/* Gotas volumétricas cerradas */}
      {drops.map((d, i) => (
        <g key={i} opacity={d.o}>
          <path
            d={`M ${d.x} ${d.y - d.r * 2.4} C ${d.x - d.r} ${d.y - d.r * 0.6}, ${d.x - d.r} ${d.y}, ${d.x} ${d.y} C ${d.x + d.r} ${d.y}, ${d.x + d.r} ${d.y - d.r * 0.6}, ${d.x} ${d.y - d.r * 2.4} Z`}
            fill={`url(#${uid}-drop)`}
          />
          <circle cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.7} r={d.r * 0.3} fill="#FFFFFF" opacity="0.9" />
        </g>
      ))}
    </g>
  );
};

/** ---- Máscara de Majora glitcheada (transición al rostro real) ---- */
const MaskOverlay: React.FC<{ ctx: SpiritCtx }> = ({ ctx }) => {
  const { uid, frame, glitch } = ctx;
  if (glitch <= 0.01) {
    return null;
  }
  const maskOpacity = glitch * 0.9;
  const pulse = 1 + glitch * 0.07 * (0.5 + 0.5 * Math.sin(frame * 1.7));
  const jitter = glitch * Math.sin(frame * 2.1) * 5;
  return (
    <g transform={`translate(${jitter} ${ctx.maskDY})`}>
      {/* Púas alrededor */}
      {[
        "M 196 132 L 182 106 L 208 126 Z",
        "M 244 132 L 258 106 L 232 126 Z",
        "M 220 122 L 220 94 L 233 120 Z",
        "M 142 172 L 116 158 L 146 186 Z",
        "M 298 172 L 324 158 L 294 186 Z",
        "M 152 252 L 130 268 L 162 262 Z",
        "M 288 252 L 310 268 L 278 262 Z",
        "M 200 318 L 196 344 L 216 306 Z",
        "M 240 318 L 244 344 L 224 306 Z",
      ].map((d, i) => (
        <path key={i} d={d} fill={`url(#${uid}-mask)`} opacity={maskOpacity * 0.95} />
      ))}
      {/* Cuerpo de la máscara (corazón con cuernos) */}
      <g transform={`translate(${PELVIS_X} 205) scale(${pulse}) translate(${-PELVIS_X} -205)`}>
        <path
          d={`M 220 128 C 196 104, 152 118, 146 152 C 139 192, 168 214, 184 240 C 198 264, 204 292, 220 322 C 236 292, 242 264, 256 240 C 272 214, 301 192, 294 152 C 288 118, 244 104, 220 128 Z`}
          fill={`url(#${uid}-mask)`}
          opacity={maskOpacity}
        />
        {/* Ojos grandes redondos pintados */}
        <circle cx="183" cy="200" r="26" fill="#E8D8A0" opacity={maskOpacity} />
        <circle cx="257" cy="200" r="26" fill="#E8D8A0" opacity={maskOpacity} />
        <circle cx="183" cy="200" r="10" fill="#1A0B12" opacity={maskOpacity} />
        <circle cx="257" cy="200" r="10" fill="#1A0B12" opacity={maskOpacity} />
        <circle cx="183" cy="200" r="26" fill="none" stroke="#6B4A2A" strokeWidth="3" opacity={maskOpacity * 0.9} />
        <circle cx="257" cy="200" r="26" fill="none" stroke="#6B4A2A" strokeWidth="3" opacity={maskOpacity * 0.9} />
        {/* Cejas angulosas pintadas */}
        <path d={`M 168 174 L 196 168 L 178 186 Z`} fill="#6B4A2A" opacity={maskOpacity * 0.9} />
        <path d={`M 272 174 L 244 168 L 262 186 Z`} fill="#6B4A2A" opacity={maskOpacity * 0.9} />
        {/* Líneas de máscara */}
        <path d={`M 220 128 C 214 160, 210 200, 220 322`} stroke="#2A0B14" strokeWidth="2.4" fill="none" opacity={maskOpacity * 0.8} />
        <path d={`M 176 214 C 186 232, 254 232, 264 214`} stroke="#2A0B14" strokeWidth="2" fill="none" opacity={maskOpacity * 0.7} />
      </g>
      {/* Fantasmas cromáticos de la máscara durante la transición */}
      {glitch > 0.01 && (
        <g>
          <g
            filter={`url(#${uid}-ghost-cyan)`}
            opacity={glitch * 0.4}
            transform={`translate(${-glitch * 9} 0)`}
          >
            <path
              d={`M 220 128 C 196 104, 152 118, 146 152 C 139 192, 168 214, 184 240 C 198 264, 204 292, 220 322 C 236 292, 242 264, 256 240 C 272 214, 301 192, 294 152 C 288 118, 244 104, 220 128 Z`}
            />
          </g>
          <g
            filter={`url(#${uid}-ghost-magenta)`}
            opacity={glitch * 0.4}
            transform={`translate(${glitch * 9} 0)`}
          >
            <path
              d={`M 220 128 C 196 104, 152 118, 146 152 C 139 192, 168 214, 184 240 C 198 264, 204 292, 220 322 C 236 292, 242 264, 256 240 C 272 214, 301 192, 294 152 C 288 118, 244 104, 220 128 Z`}
            />
          </g>
        </g>
      )}
      {/* Tiras de glitch sobre el rostro */}
      {glitch > 0.01 && (
        <g>
          <rect x={130} y={(frame * 17) % 130 + 130} width={180} height={7} fill="#22D3EE" opacity={glitch * 0.35} />
          <rect x={130} y={(frame * 23 + 60) % 130 + 130} width={180} height={4} fill="#F43F5E" opacity={glitch * 0.35} />
        </g>
      )}
    </g>
  );
};

export const BenSpiritCharacter: React.FC<BenSpiritProps> = ({
  width = 380,
  emergence = 1,
  glitchOverlay = 0,
  showWaterRipples = true,
  raiseHand = true,
  floatAmplitude = 6,
  uid = "bs",
  opacity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const e = clamp01(emergence);
  const g = clamp01(glitchOverlay);
  const raise = raiseHand ? clamp01(0.5 + 0.5 * Math.sin(frame * 0.016)) : 0;

  const basePelvisY = 385 + (1 - e) * 320;
  const floatY = basePelvisY + Math.sin(frame * 0.03) * floatAmplitude;
  const driftX = Math.sin(frame * 0.021) * 4 + g * Math.sin(frame * 2.1) * 5;
  const tilt = Math.sin(frame * 0.021 + 0.8) * 1.2;
  // Alinea la máscara de Majora al centro del rostro real (y ≈ 167 con e=1).
  const maskDY = floatY + HEAD_DY - 205;

  const ctx: SpiritCtx = { frame, uid, raise, glitch: g, maskDY };

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
            <stop offset="0%" stopColor="#C9BCA8" />
            <stop offset="100%" stopColor="#8E7F6A" />
          </linearGradient>
          <linearGradient id={`${uid}-skin-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9A8B74" />
            <stop offset="100%" stopColor="#665843" />
          </linearGradient>
          <radialGradient id={`${uid}-iris`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#2C3E4C" />
            <stop offset="60%" stopColor="#16232E" />
            <stop offset="100%" stopColor="#0A1218" />
          </radialGradient>
          <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#2A2016" />
            <stop offset="100%" stopColor="#0F0B07" />
          </linearGradient>
          <linearGradient id={`${uid}-wet-shirt`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#26384A" />
            <stop offset="100%" stopColor="#121E2A" />
          </linearGradient>
          <linearGradient id={`${uid}-wet-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16222E" />
            <stop offset="100%" stopColor="#0A1118" />
          </linearGradient>
          <linearGradient id={`${uid}-wet-pants`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#1E2A33" />
            <stop offset="100%" stopColor="#0F161D" />
          </linearGradient>
          <linearGradient id={`${uid}-drop`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#A5E8F7" />
            <stop offset="100%" stopColor="#155E75" />
          </linearGradient>
          <linearGradient id={`${uid}-mask`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#4A1220" />
            <stop offset="100%" stopColor="#1A0B12" />
          </linearGradient>
          <radialGradient id={`${uid}-water-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-ao`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${uid}-blur10`} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id={`${uid}-ghost-cyan`} x="-30%" y="-30%" width="160%" height="160%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.13  0 0 0 0 0.83  0 0 0 0 0.93  0 0 0 1 0"
            />
          </filter>
          <filter id={`${uid}-ghost-magenta`} x="-30%" y="-30%" width="160%" height="160%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.96  0 0 0 0 0.25  0 0 0 0 0.37  0 0 0 1 0"
            />
          </filter>
          <clipPath id={`${uid}-waterclip`}>
            <rect x="0" y="0" width={VIEW_W} height={WATERLINE_Y} />
          </clipPath>
        </defs>

        {/* Agua: ondas, halo, burbujas y gotas (tras el cuerpo) */}
        <WaterFx ctx={ctx} showRipples={showWaterRipples} />

        {/* Cuerpo emergiendo del agua (recorte en la línea de agua) */}
        <g clipPath={`url(#${uid}-waterclip)`}>
          <g transform={`translate(${PELVIS_X + driftX} ${floatY}) rotate(${tilt})`}>
            {/* Piernas sumergidas */}
            <SpiritLeg ctx={ctx} side="l" />
            <SpiritLeg ctx={ctx} side="r" />
            {/* Torso */}
            <SpiritTorso ctx={ctx} />
            <SpiritArm ctx={ctx} side="l" />
            <SpiritArm ctx={ctx} side="r" />
            {/* Cuello */}
            <g transform={`translate(0 ${NECK_BASE_DY}) rotate(${Math.sin(frame * 0.023) * 1.6})`}>
              <path
                d={`M -11 -5 C -10 7, -9 15, -8 22 L 8 22 C 9 15, 10 7, 11 -5 C 9 -8, -9 -8, -11 -5 Z`}
                fill={`url(#${uid}-skin-dark)`}
              />
              <ellipse cx="0" cy="-7" rx="10" ry="4" fill="#040507" opacity="0.3" filter={`url(#${uid}-ao)`} />
              {/* Cabeza */}
              <g transform={`translate(0 ${HEAD_DY - NECK_BASE_DY})`}>
                <SpiritFace ctx={ctx} />
              </g>
            </g>
          </g>
        </g>

        {/* Transición de la máscara glitcheada al rostro real */}
        <MaskOverlay ctx={ctx} />
      </svg>
    </div>
  );
};
