import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * PlayerCharacter — Rig vectorial 2.5D hiperdetallado (50+ <path> orgánicos)
 * del estudiante universitario / Matt.
 *
 *  - Rostro completo y expresivo: cejas articuladas, párpados animados
 *    (parpadeo determinista), ojos con esclerótica/iris/pupila/brillo
 *    especular que miran hacia lookX/lookY, nariz sombreada, boca
 *    expresiva y cabello en múltiples capas con luz de borde.
 *  - Vestimenta detallada: "hoodie" (sudadera con capucha, cordones con
 *    puntas metálicas y balanceo físico, bolsillo canguro, jeans,
 *    tenis), "link_tunic" (túnica verde, gorro puntiagudo flexible,
 *    cinturón de cuero con hebilla dorada, guanteletes, botas y
 *    espada/escudo a la espalda), "coat_retake" (abrigo desgastado
 *    sobre sudadera gris, cuello levantado, pliegues húmedos).
 *  - Esqueleto articulado por jerarquía <g> anidados con transformOrigin
 *    anatómico (pelvis → torso → cuello/cabeza, hombro → brazo →
 *    antebrazo → mano, cadera → muslo → rodilla → espinilla → pie).
 *  - Locomoción real (walk/run/walk_heavy con zancada y braceo en
 *    contra-fase), acciones narrativas (sit_play con control N64,
 *    desk_edit con teclado/mouse, recoil, kneel_grief) y sombra
 *    elíptica dinámica acoplada al suelo.
 *  - 100% determinista: useCurrentFrame + sin + interpolate.
 */

export type PlayerOutfit = "hoodie" | "link_tunic" | "coat_retake";
export type PlayerExpression =
  | "neutral"
  | "curious"
  | "terrified"
  | "focused"
  | "grief";
export type PlayerAction =
  | "idle"
  | "walk"
  | "run"
  | "walk_heavy"
  | "sit_play"
  | "desk_edit"
  | "recoil"
  | "kneel_grief";

export interface PlayerCharacterProps {
  width?: number;
  outfit?: PlayerOutfit;
  expression?: PlayerExpression;
  action?: PlayerAction;
  rimColor?: string;
  lookX?: number;
  lookY?: number;
  showGroundShadow?: boolean;
  uid?: string;
  opacity?: number;
  flipX?: boolean;
  style?: React.CSSProperties;
}

const VIEW_W = 480;
const VIEW_H = 760;
const PELVIS_X = 240;
const GROUND_Y = 700;

const SHOULDER_DX = 86;
const SHOULDER_DY = -160;
const HIP_DX = 20;
const NECK_BASE_DY = -196;
const HEAD_DY = -267;
const UPPER_ARM_LEN = 92;
const FOREARM_LEN = 78;
const THIGH_LEN = 110;
const SHIN_LEN = 116;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Ruta orgánica de miembro (proximal en 0,0, extendiéndose +y). */
const limbPath = (topW: number, botW: number, len: number): string =>
  [
    `M ${-topW / 2} 6`,
    `C ${-topW / 2 - 3} ${len * 0.42}, ${-topW / 2 - 4} ${len * 0.6}, ${-botW / 2} ${len - 5}`,
    `C ${-botW / 2 + 2} ${len - 1}, ${botW / 2 - 2} ${len - 1}, ${botW / 2} ${len - 5}`,
    `C ${topW / 2 + 4} ${len * 0.6}, ${topW / 2 + 3} ${len * 0.42}, ${topW / 2} 6`,
    `C ${topW / 2 - 4} -3, ${-topW / 2 + 4} -3, ${-topW / 2} 6`,
    "Z",
  ].join(" ");

/** Dedo cónico con curva Bézier (origen del dedo en x, borde de palma y=26). */
const fingerPath = (
  x: number,
  len: number,
  bend: number,
  w: number,
  curl: number
): string => {
  const jx = x + bend * curl;
  const tip = 26 + len;
  return [
    `M ${x - w / 2} 26`,
    `C ${x - w / 2 - 1} ${24 + len * 0.5}, ${x - w * 0.3 + bend * 0.3} ${24 + len * 0.72}, ${jx - w * 0.34} ${tip - 2}`,
    `C ${jx} ${tip + 1.5}, ${jx + w * 0.34} ${tip - 1}, ${jx + w * 0.34} ${tip - 2}`,
    `C ${x + w * 0.3 + bend * 0.3} ${24 + len * 0.72}, ${x + w / 2 + 1} ${24 + len * 0.5}, ${x + w / 2} 26`,
    "Z",
  ].join(" ");
};

interface Pose {
  pelvisY: number;
  torsoLean: number;
  headTilt: number;
  headNod: number;
  headDown: number;
  breathe: number;
  lShoulder: number;
  rShoulder: number;
  lElbow: number;
  rElbow: number;
  lWrist: number;
  rWrist: number;
  lHip: number;
  rHip: number;
  lKnee: number;
  rKnee: number;
  lAnkle: number;
  rAnkle: number;
  handCurl: number;
  shadowRx: number;
  shadowRy: number;
  shadowCy: number;
  shadowOpacity: number;
}

const computePose = (
  action: PlayerAction,
  frame: number,
  expression: PlayerExpression
): Pose => {
  const sob = Math.sin(frame * 0.33) * 0.9;
  const breatheBase =
    expression === "terrified"
      ? 1 + Math.sin(frame * 0.16) * 0.012
      : 1 + Math.sin(frame * 0.055) * 0.008;

  switch (action) {
    case "walk": {
      const ph = frame * 0.2;
      return {
        pelvisY: 452 + Math.sin(2 * ph) * 2.6,
        torsoLean: 3.5 + Math.sin(ph) * 1.2,
        headTilt: Math.sin(ph) * 0.8,
        headNod: 0,
        headDown: 0,
        breathe: breatheBase,
        lShoulder: 5 - Math.sin(ph) * 26,
        rShoulder: -(5 - Math.sin(ph) * 26),
        lElbow: -16 - Math.max(0, Math.sin(ph + Math.PI)) * 10,
        rElbow: 16 + Math.max(0, Math.sin(ph + Math.PI)) * 10,
        lWrist: -6,
        rWrist: 6,
        lHip: Math.sin(ph) * 17,
        rHip: -Math.sin(ph) * 17,
        lKnee: -8 - Math.max(0, Math.sin(ph + 0.9)) * 44,
        rKnee: -8 - Math.max(0, Math.sin(ph + 0.9 + Math.PI)) * 44,
        lAnkle: Math.max(0, Math.sin(ph + 2.7)) * 20,
        rAnkle: Math.max(0, Math.sin(ph + 2.7 + Math.PI)) * 20,
        handCurl: 0.15,
        shadowRx: 82 + Math.sin(2 * ph) * 6,
        shadowRy: 13,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.42 - Math.abs(Math.sin(2 * ph)) * 0.05,
      };
    }
    case "run": {
      const ph = frame * 0.36;
      return {
        pelvisY: 452 + Math.sin(2 * ph) * 3.4,
        torsoLean: 15 + Math.sin(ph) * 2.2,
        headTilt: 2 + Math.sin(ph) * 1.2,
        headNod: 0,
        headDown: 0,
        breathe: breatheBase,
        lShoulder: 8 - Math.sin(ph) * 48,
        rShoulder: -(8 - Math.sin(ph) * 48),
        lElbow: -88 - Math.max(0, Math.sin(ph + Math.PI)) * 12,
        rElbow: 88 + Math.max(0, Math.sin(ph + Math.PI)) * 12,
        lWrist: -18,
        rWrist: 18,
        lHip: Math.sin(ph) * 36,
        rHip: -Math.sin(ph) * 36,
        lKnee: -12 - Math.max(0, Math.sin(ph + 1.15)) * 62,
        rKnee: -12 - Math.max(0, Math.sin(ph + 1.15 + Math.PI)) * 62,
        lAnkle: Math.max(0, Math.sin(ph + 2.8)) * 26,
        rAnkle: Math.max(0, Math.sin(ph + 2.8 + Math.PI)) * 26,
        handCurl: 0.25,
        shadowRx: 86 + Math.sin(2 * ph) * 8,
        shadowRy: 12,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.4,
      };
    }
    case "walk_heavy": {
      const ph = frame * 0.15;
      return {
        pelvisY: 456 + Math.sin(2 * ph) * 2.2,
        torsoLean: 8,
        headTilt: 2.2,
        headNod: 1.5,
        headDown: 4,
        breathe: breatheBase,
        lShoulder: 9 - Math.sin(ph) * 15,
        rShoulder: -(9 - Math.sin(ph) * 15),
        lElbow: -12,
        rElbow: 12,
        lWrist: -8,
        rWrist: 8,
        lHip: Math.sin(ph) * 13,
        rHip: -Math.sin(ph) * 13,
        lKnee: -7 - Math.max(0, Math.sin(ph + 0.9)) * 28,
        rKnee: -7 - Math.max(0, Math.sin(ph + 0.9 + Math.PI)) * 28,
        lAnkle: Math.max(0, Math.sin(ph + 2.5)) * 12,
        rAnkle: Math.max(0, Math.sin(ph + 2.5 + Math.PI)) * 12,
        handCurl: 0.1,
        shadowRx: 84,
        shadowRy: 14,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.45,
      };
    }
    case "sit_play": {
      return {
        pelvisY: 590,
        torsoLean: 16,
        headTilt: 1,
        headNod: -2,
        headDown: 3,
        breathe: 1 + Math.sin(frame * 0.045) * 0.006,
        lShoulder: 62,
        rShoulder: -62,
        lElbow: -62,
        rElbow: 62,
        lWrist: 8 + Math.sin(frame * 0.07) * 1.5,
        rWrist: -8 - Math.sin(frame * 0.07) * 1.5,
        lHip: 78,
        rHip: -78,
        lKnee: -150,
        rKnee: 150,
        lAnkle: 10 + Math.sin(frame * 0.09) * 4,
        rAnkle: -10 - Math.sin(frame * 0.09) * 4,
        handCurl: 0.75,
        shadowRx: 108,
        shadowRy: 12,
        shadowCy: GROUND_Y,
        shadowOpacity: 0.38,
      };
    }
    case "desk_edit": {
      return {
        pelvisY: 500,
        torsoLean: 10,
        headTilt: 2,
        headNod: 2,
        headDown: 6,
        breathe: 1 + Math.sin(frame * 0.04) * 0.006,
        lShoulder: 20,
        rShoulder: -34,
        lElbow: -34,
        rElbow: 44,
        lWrist: -8 + Math.sin(frame * 0.4) * 2,
        rWrist: -5,
        lHip: 40,
        rHip: -40,
        lKnee: -40,
        rKnee: -40,
        lAnkle: -3,
        rAnkle: -3,
        handCurl: 0.4,
        shadowRx: 92,
        shadowRy: 11,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.4,
      };
    }
    case "recoil": {
      const t = interpolate(frame, [0, 14], [1, 0.35], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return {
        pelvisY: 454,
        torsoLean: -13 * t,
        headTilt: -7 * t,
        headNod: -3 * t,
        headDown: 2 * t,
        breathe: 1 + Math.sin(frame * 0.14) * 0.011,
        lShoulder: 5 - 104 * t,
        rShoulder: -5 + 104 * t,
        lElbow: -8 - 152 * t,
        rElbow: 8 + 152 * t,
        lWrist: -6,
        rWrist: 6,
        lHip: -6 * t,
        rHip: 6 * t,
        lKnee: -10 * t,
        rKnee: -10 * t,
        lAnkle: 4 * t,
        rAnkle: 4 * t,
        handCurl: 0.6,
        shadowRx: 80,
        shadowRy: 13,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.42,
      };
    }
    case "kneel_grief": {
      return {
        pelvisY: 600 + sob * 0.4,
        torsoLean: 26 + sob,
        headTilt: 6 + sob * 1.4,
        headNod: 4,
        headDown: 9,
        breathe: 1 + Math.sin(frame * 0.4) * 0.012,
        lShoulder: -120 + Math.sin(frame * 0.5) * 1.6,
        rShoulder: 120 - Math.sin(frame * 0.5) * 1.6,
        lElbow: 240,
        rElbow: -240,
        lWrist: -18 + sob * 2,
        rWrist: 18 - sob * 2,
        lHip: 20,
        rHip: -20,
        lKnee: 140,
        rKnee: -140,
        lAnkle: 30,
        rAnkle: -30,
        handCurl: 0.85,
        shadowRx: 102,
        shadowRy: 12,
        shadowCy: GROUND_Y + 3,
        shadowOpacity: 0.45,
      };
    }
    case "idle":
    default: {
      const sw = Math.sin(frame * 0.023);
      return {
        pelvisY: 452 + Math.sin(frame * 0.02) * 1.6,
        torsoLean: Math.sin(frame * 0.013) * 1.2,
        headTilt: Math.sin(frame * 0.021 + 1) * 1.6,
        headNod: Math.sin(frame * 0.017) * 1,
        headDown: 0,
        breathe: breatheBase,
        lShoulder: 5 + sw * 1.4,
        rShoulder: -5 - sw * 1.4,
        lElbow: -8,
        rElbow: 8,
        lWrist: -4,
        rWrist: 4,
        lHip: 0,
        rHip: 0,
        lKnee: 0,
        rKnee: 0,
        lAnkle: 2,
        rAnkle: 2,
        handCurl: 0.12,
        shadowRx: 82,
        shadowRy: 13,
        shadowCy: GROUND_Y + 2,
        shadowOpacity: 0.42,
      };
    }
  }
};

interface ArtCtx {
  frame: number;
  uid: string;
  outfit: PlayerOutfit;
  expression: PlayerExpression;
  rim: string;
  lookX: number;
  lookY: number;
}

/** ---- Rostro expresivo (grupo local de la cabeza, centro en 0,0) ---- */

interface FaceProps {
  ctx: ArtCtx;
  lidOpen: number;
  browRaise: number;
  browTilt: number;
  pupilScale: number;
  mouthKind: number;
  tremble: number;
}

const Face: React.FC<FaceProps> = ({
  ctx,
  lidOpen,
  browRaise,
  browTilt,
  pupilScale,
  mouthKind,
  tremble,
}) => {
  const { uid, lookX, lookY } = ctx;
  const mouthY = 40 + tremble;

  const renderEye = (cx: number, flip: number) => {
    const lidBottomY = -16 - 5 + (1 - lidOpen) * 16 + browRaise * 0.4;
    return (
      <g key={cx}>
        {/* Cuenca sombreada */}
        <path
          d={`M ${cx - 16} ${-16 - 8} C ${cx - 10} ${-16 - 16}, ${cx + 10} ${-16 - 16}, ${cx + 16} ${-16 - 8} C ${cx + 10} ${-16 + 2}, ${cx - 10} ${-16 + 2}, ${cx - 16} ${-16 - 8} Z`}
          fill="#0A0B0E"
          opacity="0.35"
        />
        {/* Esclerótica */}
        <ellipse cx={cx} cy={-16} rx="13" ry="10.5" fill="#E9E2D8" />
        {/* Iris + pupila + brillo (miran hacia lookX/lookY) */}
        <g transform={`translate(${lookX * 3} ${lookY * 2})`}>
          <circle cx={cx} cy={-16} r="7" fill={`url(#${uid}-iris)`} />
          <circle cx={cx} cy={-16} r={3.4 * pupilScale} fill="#0A0C10" />
          <circle cx={cx - 2.6} cy={-18.4} r="1.7" fill="#FFFFFF" opacity="0.92" />
        </g>
        {/* Párpado superior animado */}
        <path
          d={`M ${cx - 15} ${-16 - 11} C ${cx - 8} ${-16 - 16}, ${cx + 8} ${-16 - 16}, ${cx + 15} ${-16 - 11} L ${cx + 14} ${lidBottomY} C ${cx + 8} ${lidBottomY + 4}, ${cx - 8} ${lidBottomY + 4}, ${cx - 14} ${lidBottomY} Z`}
          fill={`url(#${uid}-skin)`}
        />
        {/* Párpado inferior */}
        <path
          d={`M ${cx - 12} ${-16 + 8} C ${cx - 6} ${-16 + 12}, ${cx + 6} ${-16 + 12}, ${cx + 12} ${-16 + 8}`}
          stroke={`url(#${uid}-skin-shadow)`}
          strokeWidth="2.4"
          fill="none"
          opacity="0.85"
        />
        {/* Sombra de pestañas */}
        <path
          d={`M ${cx - 13} ${-16 - 8.5} C ${cx - 7} ${-16 - 12.5}, ${cx + 7} ${-16 - 12.5}, ${cx + 13} ${-16 - 8.5}`}
          stroke="#0A0B0E"
          strokeWidth="1.8"
          fill="none"
          opacity="0.4"
        />
        {/* Ceja articulada */}
        <path
          d={`M ${cx - 15} ${-34 - browRaise} C ${cx - 9} ${-40 - browRaise}, ${cx + 9} ${-40 - browRaise}, ${cx + 15} ${-34 - browRaise} L ${cx + 14} ${-30 - browRaise} C ${cx + 5} ${-35 - browRaise}, ${cx - 5} ${-35 - browRaise}, ${cx - 14} ${-30 - browRaise} Z`}
          fill="#17130E"
          transform={`rotate(${browTilt * flip} ${cx} ${-35 - browRaise})`}
        />
      </g>
    );
  };

  return (
    <g>
      {/* Cabello trasero antes del rostro */}
      <path
        d={`M -62 -52 C -74 -34, -76 -8, -68 10 C -60 24, -46 30, -30 32 L 30 32 C 46 30, 60 24, 68 10 C 76 -8, 74 -34, 62 -52 C 52 -68, 36 -76, 16 -80 C -4 -83, -22 -78, -34 -70 C -46 -62, -56 -58, -62 -52 Z`}
        fill={`url(#${uid}-hair-back)`}
      />
      {/* Contorno del rostro */}
      <path
        d={`M -46 -52 C -48 -22, -50 10, -42 38 C -36 54, -24 66, -8 71 C 4 74.5, 16 73, 26 66 C 38 54, 46 36, 48 10 C 49 -18, 44 -44, 36 -58 C 26 -70, 12 -75, 0 -76 C -14 -75, -36 -66, -46 -52 Z`}
        fill={`url(#${uid}-skin)`}
      />
      {/* Orejas con pliegue interno */}
      <path
        d={`M -56 -16 C -65 -6, -65 8, -57 16 C -53 20, -49 18, -49 14 C -55 8, -55 -2, -49 -8 C -49 -12, -52 -19, -56 -16 Z`}
        fill={`url(#${uid}-skin-shadow)`}
      />
      <path
        d={`M -55 -12 C -59 -4, -59 6, -54 11`}
        stroke="#6B5B49"
        strokeWidth="1.6"
        fill="none"
        opacity="0.7"
      />
      <path
        d={`M 56 -16 C 65 -6, 65 8, 57 16 C 53 20, 49 18, 49 14 C 55 8, 55 -2, 49 -8 C 49 -12, 52 -19, 56 -16 Z`}
        fill={`url(#${uid}-skin-shadow)`}
      />
      <path
        d={`M 55 -12 C 59 -4, 59 6, 54 11`}
        stroke="#6B5B49"
        strokeWidth="1.6"
        fill="none"
        opacity="0.7"
      />
      {/* Mejillas sombreadas */}
      <path
        d={`M -40 -2 C -34 8, -22 12, -12 10 C -22 2, -32 -4, -40 -2 Z`}
        fill="#7A6852"
        opacity="0.35"
      />
      <path
        d={`M 40 -2 C 34 8, 22 12, 12 10 C 22 2, 32 -4, 40 -2 Z`}
        fill="#7A6852"
        opacity="0.35"
      />
      {/* Ojos */}
      {renderEye(-23, -1)}
      {renderEye(23, 1)}
      {/* Nariz sombreada */}
      <path
        d={`M -2 -28 C -4 -14, -6 0, -4 10`}
        stroke={`url(#${uid}-skin-shadow)`}
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
      />
      <path
        d={`M -6 12 C -5 18, 4 18, 7 12 C 6 16, -5 16, -6 12 Z`}
        fill={`url(#${uid}-skin-shadow)`}
      />
      <path
        d={`M -8 6 C -8 12, -6 15, -4 17`}
        stroke="#4A3B2C"
        strokeWidth="1.8"
        fill="none"
        opacity="0.45"
      />
      <circle cx="-1" cy="14" r="1.1" fill="#3A2C1F" opacity="0.4" />
      <circle cx="5" cy="14.5" r="1.1" fill="#3A2C1F" opacity="0.4" />
      {/* Boca expresiva */}
      {mouthKind === 0 && (
        <g>
          <path
            d={`M -14 ${mouthY} C -6 ${mouthY + 4}, 6 ${mouthY + 4}, 14 ${mouthY}`}
            stroke="#4A3B2C"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d={`M -8 ${mouthY + 5} C -4 ${mouthY + 8}, 4 ${mouthY + 8}, 8 ${mouthY + 5} C 4 ${mouthY + 6.5}, -4 ${mouthY + 6.5}, -8 ${mouthY + 5} Z`}
            fill="#8A7157"
            opacity="0.5"
          />
        </g>
      )}
      {mouthKind === 1 && (
        <g>
          <path
            d={`M -8 ${mouthY - 2} C -9 ${mouthY + 3}, -6 ${mouthY + 7}, 0 ${mouthY + 8} C 6 ${mouthY + 7}, 9 ${mouthY + 3}, 8 ${mouthY - 2} C 6 ${mouthY - 4}, -6 ${mouthY - 4}, -8 ${mouthY - 2} Z`}
            fill="#2A0A0E"
          />
          <path
            d={`M -9 ${mouthY + 4} C -4 ${mouthY + 9}, 4 ${mouthY + 9}, 9 ${mouthY + 4}`}
            stroke="#7A5A46"
            strokeWidth="1.8"
            fill="none"
            opacity="0.6"
          />
        </g>
      )}
      {mouthKind === 2 && (
        <g>
          <path
            d={`M -20 ${mouthY - 4} C -12 ${mouthY - 8}, 12 ${mouthY - 8}, 20 ${mouthY - 4} C 14 ${mouthY + 18}, -14 ${mouthY + 18}, -20 ${mouthY - 4} Z`}
            fill="#22080C"
          />
          <path
            d={`M -17 ${mouthY - 3} C -9 ${mouthY - 7}, 9 ${mouthY - 7}, 17 ${mouthY - 3} L 15 ${mouthY + 3} L -15 ${mouthY + 3} Z`}
            fill="#C9C2B2"
          />
          <path
            d={`M -7 ${mouthY + 10} C -3 ${mouthY + 14}, 3 ${mouthY + 14}, 7 ${mouthY + 10} C 5 ${mouthY + 15}, -5 ${mouthY + 15}, -7 ${mouthY + 10} Z`}
            fill="#7F1D1D"
            opacity="0.9"
          />
        </g>
      )}
      {mouthKind === 3 && (
        <g>
          <path
            d={`M -12 ${mouthY + 2} C -5 ${mouthY}, 5 ${mouthY}, 12 ${mouthY + 2}`}
            stroke="#3A2C1F"
            strokeWidth="2.4"
            fill="none"
          />
          <path
            d={`M -14 ${mouthY + 2} L -12 ${mouthY}`}
            stroke="#3A2C1F"
            strokeWidth="1.6"
            opacity="0.6"
          />
          <path
            d={`M 14 ${mouthY + 2} L 12 ${mouthY}`}
            stroke="#3A2C1F"
            strokeWidth="1.6"
            opacity="0.6"
          />
        </g>
      )}
      {mouthKind === 4 && (
        <g>
          <path
            d={`M -13 ${mouthY - 3} C -7 ${mouthY + 3}, 7 ${mouthY + 3}, 13 ${mouthY - 3} C 6 ${mouthY + 7}, -6 ${mouthY + 7}, -13 ${mouthY - 3} Z`}
            fill="#2A0A0E"
          />
          <path
            d={`M -13 ${mouthY - 3} C -7 ${mouthY + 3}, 7 ${mouthY + 3}, 13 ${mouthY - 3}`}
            stroke="#4A3B2C"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
      )}
      {/* Sombra bajo labio y barbilla */}
      <ellipse cx="0" cy={mouthY + 12} rx="9" ry="3.6" fill="#3A2C1F" opacity="0.28" />
      <path
        d={`M -16 62 C -10 68, 10 68, 16 62`}
        stroke="#5A4734"
        strokeWidth="1.4"
        fill="none"
        opacity="0.3"
      />
    </g>
  );
};

/** ---- Cabello frontal en capas (hoodie / coat) ---- */
const FrontHair: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, frame, rim } = ctx;
  const strands = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <g>
      {strands.map((i) => {
        const x = -34 + i * 9.7;
        const tipY = -26 - (i % 3) * 6;
        const sway = Math.sin(frame * 0.06 + i * 1.1) * 2;
        return (
          <g key={i}>
            <path
              d={`M ${x - 4} -60 C ${x - 5} -48, ${x - 6} -38, ${x - 4 + sway} ${tipY - 2} C ${x - 1 + sway} ${tipY + 2}, ${x + 1 + sway} ${tipY + 2}, ${x + 3 + sway} ${tipY - 2} C ${x + 5} -40, ${x + 4} -50, ${x + 3} -60 C ${x + 1} -62, ${x - 2} -62, ${x - 4} -60 Z`}
              fill={`url(#${uid}-hair)`}
            />
            <path
              d={`M ${x - 4 + sway * 0.4} ${tipY - 1} C ${x - 3} -42, ${x - 2.5} -52, ${x - 1.5} -60`}
              stroke="#6B5B49"
              strokeWidth="1.1"
              fill="none"
              opacity="0.5"
            />
            {i % 3 === 0 && (
              <path
                d={`M ${x - 3} -58 C ${x - 4} -48, ${x - 4.5} -40, ${x - 3.5 + sway} ${tipY - 1}`}
                stroke={rim}
                strokeWidth="1.3"
                fill="none"
                opacity="0.55"
              />
            )}
          </g>
        );
      })}
      {/* Mechones laterales ante las orejas */}
      <path
        d={`M -46 -56 C -52 -40, -54 -24, -50 -10 C -48 -18, -46 -36, -46 -56 Z`}
        fill={`url(#${uid}-hair)`}
        transform={`rotate(${Math.sin(frame * 0.05 + 2) * 2} -48 -34)`}
      />
      <path
        d={`M 46 -56 C 52 -40, 54 -24, 50 -10 C 48 -18, 46 -36, 46 -56 Z`}
        fill={`url(#${uid}-hair)`}
        transform={`rotate(${Math.sin(frame * 0.05 + 4) * 2} 48 -34)`}
      />
    </g>
  );
};

/** ---- Gorro puntiagudo flexible (link_tunic) ---- */
const PointyCap: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, frame, rim } = ctx;
  const tipX = 4 + Math.sin(frame * 0.045) * 9;
  const tipY = -152 + Math.sin(frame * 0.045 + 1) * 4;
  return (
    <g>
      <path
        d={`M -58 -42 C -56 -64, -40 -84, -18 -98 C -2 -108, 10 -118, ${tipX - 6} ${tipY + 6} C ${tipX - 2} ${tipY - 2}, ${tipX + 3} ${tipY - 1}, ${tipX + 6} ${tipY + 7} C ${tipX + 14} -118, 30 -110, 46 -100 C 56 -94, 62 -80, 62 -66 C 63 -58, 62 -48, 58 -42 C 40 -50, -40 -50, -58 -42 Z`}
        fill={`url(#${uid}-cap)`}
      />
      <path
        d={`M -58 -42 C -40 -50, 40 -50, 58 -42 C 40 -36, -40 -36, -58 -42 Z`}
        fill={`url(#${uid}-cap-dark)`}
      />
      <path
        d={`M -40 -56 C -30 -66, -18 -76, -10 -88`}
        stroke="#0B1F13"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M 30 -58 C 22 -68, 14 -78, 8 -90`}
        stroke="#0B1F13"
        strokeWidth="2"
        fill="none"
        opacity="0.45"
      />
      <path
        d={`M 0 -46 C -6 -62, -2 -80, ${tipX * 0.4} -100`}
        stroke="#0B1F13"
        strokeWidth="1.6"
        fill="none"
        opacity="0.35"
      />
      <path
        d={`M -57 -44 C -55 -62, -42 -80, -22 -94`}
        stroke={rim}
        strokeWidth="1.8"
        fill="none"
        opacity="0.5"
      />
      {/* Mechones rubios enmarcando la frente */}
      {[0, 1, 2, 3].map((i) => {
        const x = i < 2 ? -34 + i * 18 : 18 + (i - 2) * 18;
        return (
          <path
            key={i}
            d={`M ${x - 3.5} -46 C ${x - 4.5} -40, ${x - 5} -34, ${x - 3.5 + Math.sin(frame * 0.05 + i) * 1.5} -29 C ${x - 1} -31.5, ${x + 1} -31.5, ${x + 2.5} -29 C ${x + 4} -34, ${x + 3.5} -40, ${x + 2.5} -46 Z`}
            fill={`url(#${uid}-blond)`}
          />
        );
      })}
    </g>
  );
};

/** ---- Capucha caída con pliegues (hoodie) ---- */
const HoodBehind: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, frame, rim } = ctx;
  return (
    <g>
      <path
        d={`M -66 -30 C -70 -52, -64 -74, -48 -88 C -30 -103, -10 -108, 10 -107 C 34 -106, 54 -98, 66 -84 C 76 -72, 78 -54, 74 -34 C 72 -20, 66 -8, 58 2 L -58 2 C -66 -8, -70 -16, -66 -30 Z`}
        fill={`url(#${uid}-hoodie-dark)`}
      />
      <path
        d={`M -56 -58 C -44 -74, -26 -84, -8 -86`}
        stroke="#0C0F13"
        strokeWidth="2.4"
        fill="none"
        opacity="0.6"
      />
      <path
        d={`M 40 -60 C 30 -74, 16 -82, 2 -84`}
        stroke="#0C0F13"
        strokeWidth="2.4"
        fill="none"
        opacity="0.55"
      />
      <path
        d={`M 0 -88 C -4 -74, 2 -58, 14 -46`}
        stroke="#0C0F13"
        strokeWidth="2"
        fill="none"
        opacity="0.45"
      />
      <path
        d={`M -66 -30 C -69 -46, -66 -64, -54 -76`}
        stroke={rim}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      {/* Cordones con puntas metálicas (balanceo físico) */}
      <g transform={`rotate(${Math.sin(frame * 0.06) * 6} 0 -40)`}>
        <path
          d={`M -6 -34 C -7 -18, -8 -6, -9 6`}
          stroke="#C9C2B2"
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d={`M -10.6 6 L -7.4 6 L -7.4 14 L -10.6 14 Z`}
          fill="#8B919A"
        />
        <path d={`M -10.6 14 L -7.4 14 L -9 18 Z`} fill="#5C646D" />
      </g>
      <g transform={`rotate(${Math.sin(frame * 0.06 + 2.4) * 6} 0 -40)`}>
        <path
          d={`M 6 -34 C 7 -18, 8 -6, 9 6`}
          stroke="#C9C2B2"
          strokeWidth="2.2"
          fill="none"
        />
        <path d={`M 7.4 6 L 10.6 6 L 10.6 14 L 7.4 14 Z`} fill="#8B919A" />
        <path d={`M 7.4 14 L 10.6 14 L 9 18 Z`} fill="#5C646D" />
      </g>
    </g>
  );
};

/** ---- Cuello levantado del abrigo (coat_retake) ---- */
const RaisedCollar: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, rim } = ctx;
  return (
    <g>
      <path
        d={`M -30 -196 C -52 -188, -66 -170, -72 -148 C -64 -138, -50 -134, -36 -138 C -30 -154, -28 -176, -30 -196 Z`}
        fill={`url(#${uid}-coat)`}
      />
      <path
        d={`M 30 -196 C 52 -188, 66 -170, 72 -148 C 64 -138, 50 -134, 36 -138 C 30 -154, 28 -176, 30 -196 Z`}
        fill={`url(#${uid}-coat)`}
      />
      <path
        d={`M -40 -188 C -50 -172, -56 -158, -58 -144`}
        stroke="#07090C"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d={`M 40 -188 C 50 -172, 56 -158, 58 -144`}
        stroke="#07090C"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d={`M -46 -184 C -56 -166, -60 -150, -60 -136`}
        stroke="#4C6B79"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M 46 -184 C 56 -166, 60 -150, 60 -136`}
        stroke="#4C6B79"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M -32 -192 C -50 -184, -62 -166, -68 -146`}
        stroke={rim}
        strokeWidth="1.6"
        fill="none"
        opacity="0.4"
      />
    </g>
  );
};

/** ---- Torso: camisa base + vestimenta según outfit ---- */
const Torso: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, outfit, rim } = ctx;
  return (
    <g>
      {/* Camisa / capa base */}
      <path
        d={`M -28 -224 C -44 -206, -66 -192, -80 -168 C -90 -150, -92 -134, -86 -122 C -76 -102, -66 -66, -58 -34 C -54 -18, -46 -8, -34 -4 L 34 -4 C 46 -8, 54 -18, 58 -34 C 66 -66, 76 -102, 86 -122 C 92 -134, 90 -150, 80 -168 C 66 -192, 44 -206, 28 -224 Z`}
        fill={
          outfit === "link_tunic"
            ? `url(#${uid}-tunic)`
            : outfit === "coat_retake"
              ? `url(#${uid}-hoodie-gray)`
              : `url(#${uid}-hoodie)`
        }
      />

      {outfit === "hoodie" && (
        <g>
          {/* Costuras de hombros y mangas */}
          <path
            d={`M -80 -168 C -70 -158, -62 -150, -56 -142`}
            stroke="#10141A"
            strokeWidth="1.8"
            fill="none"
            opacity="0.7"
          />
          <path
            d={`M 80 -168 C 70 -158, 62 -150, 56 -142`}
            stroke="#10141A"
            strokeWidth="1.8"
            fill="none"
            opacity="0.7"
          />
          <path
            d={`M -58 -34 C -40 -22, 40 -22, 58 -34`}
            stroke="#10141A"
            strokeWidth="1.6"
            fill="none"
            opacity="0.6"
          />
          {/* Dobladillo acanalado */}
          <path
            d={`M -58 -30 C -40 -20, 40 -20, 58 -30 L 56 -14 C 40 -6, -40 -6, -56 -14 Z`}
            fill={`url(#${uid}-hoodie-dark)`}
          />
          {[-40, -20, 0, 20, 40].map((x) => (
            <path
              key={x}
              d={`M ${x} -27 C ${x - 1} -23, ${x - 1} -19, ${x} -15`}
              stroke="#0C0F13"
              strokeWidth="1.4"
              fill="none"
              opacity="0.6"
            />
          ))}
          {/* Bolsillo canguro frontal con oclusión ambiental */}
          <path
            d={`M -38 -84 C -36 -64, -30 -50, -20 -44 C -10 -38, 10 -38, 20 -44 C 30 -50, 36 -64, 38 -84 C 20 -94, -20 -94, -38 -84 Z`}
            fill={`url(#${uid}-hoodie-dark)`}
          />
          <path
            d={`M -38 -84 C -20 -92, 20 -92, 38 -84`}
            stroke="#10141A"
            strokeWidth="1.8"
            fill="none"
            opacity="0.8"
          />
          <path
            d={`M -30 -82 C -20 -88, 20 -88, 30 -82 C 20 -86, -20 -86, -30 -82 Z`}
            fill="#040507"
            opacity="0.5"
            filter={`url(#${uid}-ao)`}
          />
        </g>
      )}

      {outfit === "link_tunic" && (
        <g>
          {/* Escote en V con pecho */}
          <path
            d={`M -12 -222 C -8 -206, -4 -192, 0 -178 C 4 -192, 8 -206, 12 -222 C 8 -216, -8 -216, -12 -222 Z`}
            fill={`url(#${uid}-skin)`}
          />
          {/* Pliegues de la túnica */}
          <path
            d={`M -40 -150 C -38 -110, -34 -76, -30 -48`}
            stroke="#0B1F13"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M 40 -150 C 38 -110, 34 -76, 30 -48`}
            stroke="#0B1F13"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M 0 -170 C 2 -130, 3 -90, 2 -52`}
            stroke="#0B1F13"
            strokeWidth="1.6"
            fill="none"
            opacity="0.4"
          />
          {/* Cinturón de cuero con hebilla dorada */}
          <path
            d={`M -58 -66 C -40 -56, 40 -56, 58 -66 L 56 -46 C 40 -38, -40 -38, -56 -46 Z`}
            fill={`url(#${uid}-leather)`}
          />
          <path
            d={`M -12 -62 L 12 -62 L 14 -48 L -14 -48 Z`}
            fill={`url(#${uid}-gold)`}
          />
          <path d={`M 0 -60 L 0 -50`} stroke="#6B4E1A" strokeWidth="2.4" />
          <path
            d={`M -56 -64 C -40 -56, 40 -56, 56 -64`}
            stroke="#1A120A"
            strokeWidth="1.4"
            fill="none"
            opacity="0.7"
          />
          {/* Espada y escudo a la espalda */}
          <g transform="rotate(14 -20 -190)">
            <path
              d={`M -34 -150 L -10 -230 L -8 -230 L -14 -150 Z`}
              fill={`url(#${uid}-leather)`}
            />
            <path
              d={`M -28 -138 L -16 -138 L -18 -124 L -26 -124 Z`}
              fill={`url(#${uid}-gold)`}
            />
            <path
              d={`M -22 -152 L -22 -136`}
              stroke="#8B919A"
              strokeWidth="1.4"
              fill="none"
              opacity="0.6"
            />
          </g>
          <g transform="rotate(-8 42 -150)">
            <path
              d={`M 24 -128 C 40 -138, 54 -150, 58 -164 C 44 -172, 30 -166, 24 -150 C 22 -142, 22 -134, 24 -128 Z`}
              fill={`url(#${uid}-leather)`}
            />
            <path
              d={`M 26 -166 C 32 -160, 38 -154, 42 -146`}
              stroke="#1A120A"
              strokeWidth="1.6"
              fill="none"
              opacity="0.7"
            />
          </g>
        </g>
      )}

      {outfit === "coat_retake" && (
        <g>
          <path
            d={`M -32 -222 C -50 -208, -74 -192, -88 -166 C -100 -148, -102 -130, -94 -116 C -84 -96, -72 -60, -64 -30 C -60 -14, -52 -4, -40 0 L -34 2 L 34 2 L 40 0 C 52 -4, 60 -14, 64 -30 C 72 -60, 84 -96, 94 -116 C 102 -130, 100 -148, 88 -166 C 74 -192, 50 -208, 32 -222 Z`}
            fill={`url(#${uid}-coat)`}
          />
          {/* Solapas */}
          <path
            d={`M -14 -222 C -24 -204, -30 -188, -32 -172 L -16 -168 C -14 -188, -10 -206, -8 -222 Z`}
            fill={`url(#${uid}-coat-dark)`}
          />
          <path
            d={`M 14 -222 C 24 -204, 30 -188, 32 -172 L 16 -168 C 14 -188, 10 -206, 8 -222 Z`}
            fill={`url(#${uid}-coat-dark)`}
          />
          {/* Botones */}
          {[-170, -140, -110].map((y) => (
            <circle key={y} cx="0" cy={y} r="2.6" fill="#0A0C0F" />
          ))}
          {/* Pliegues húmedos */}
          <path
            d={`M -52 -160 C -50 -120, -46 -84, -42 -52`}
            stroke="#07090C"
            strokeWidth="2.2"
            fill="none"
            opacity="0.65"
          />
          <path
            d={`M 52 -160 C 50 -120, 46 -84, 42 -52`}
            stroke="#07090C"
            strokeWidth="2.2"
            fill="none"
            opacity="0.65"
          />
          <path
            d={`M 0 -172 C 2 -130, 4 -90, 4 -52`}
            stroke="#07090C"
            strokeWidth="1.6"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M -56 -156 C -54 -116, -50 -80, -46 -48`}
            stroke="#3F5C68"
            strokeWidth="1.3"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M 56 -156 C 54 -116, 50 -80, 46 -48`}
            stroke="#3F5C68"
            strokeWidth="1.3"
            fill="none"
            opacity="0.5"
          />
          {/* Sudadera gris visible */}
          <path
            d={`M -12 -222 C -8 -206, -4 -194, 0 -182 C 4 -194, 8 -206, 12 -222 Z`}
            fill={`url(#${uid}-hoodie-gray)`}
          />
        </g>
      )}

      {/* Oclusión ambiental en axilas y cintura */}
      <path
        d={`M -74 -146 C -70 -138, -66 -132, -62 -128`}
        stroke="#040507"
        strokeWidth="5"
        fill="none"
        opacity="0.5"
        filter={`url(#${uid}-ao)`}
      />
      <path
        d={`M 74 -146 C 70 -138, 66 -132, 62 -128`}
        stroke="#040507"
        strokeWidth="5"
        fill="none"
        opacity="0.5"
        filter={`url(#${uid}-ao)`}
      />
      <path
        d={`M -52 -30 C -36 -20, 36 -20, 52 -30`}
        stroke="#040507"
        strokeWidth="4"
        fill="none"
        opacity="0.35"
        filter={`url(#${uid}-ao)`}
      />
      {/* Luz de borde direccional */}
      <path
        d={`M -88 -170 C -97 -152, -99 -134, -95 -116`}
        stroke={rim}
        strokeWidth="2.4"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M 88 -170 C 97 -152, 99 -134, 95 -116`}
        stroke={rim}
        strokeWidth="2"
        fill="none"
        opacity="0.35"
      />
    </g>
  );
};

/** ---- Brazo completo (hombro → mano) ---- */
interface ArmProps {
  ctx: ArtCtx;
  shoulder: number;
  elbow: number;
  wrist: number;
  side: "l" | "r";
  handCurl: number;
  frame: number;
}

const Arm: React.FC<ArmProps> = ({ ctx, shoulder, elbow, wrist, side, handCurl, frame }) => {
  const { uid, outfit, rim } = ctx;
  const m = side === "l" ? 1 : -1;
  const sleeveFill =
    outfit === "link_tunic" ? `url(#${uid}-skin)` : outfit === "coat_retake" ? `url(#${uid}-coat)` : `url(#${uid}-hoodie)`;

  const handShade = Math.sin(frame * 0.05 + (side === "l" ? 0 : 2)) * 0.8;

  return (
    <g transform={`translate(${m * SHOULDER_DX} ${SHOULDER_DY}) rotate(${shoulder})`}>
      {/* Hombro / brazo superior */}
      <path d={limbPath(34, 26, UPPER_ARM_LEN)} fill={sleeveFill} />
      {outfit === "hoodie" && (
        <g>
          <path
            d={`M ${-14} ${UPPER_ARM_LEN - 8} L 14 ${UPPER_ARM_LEN - 8} L 13 ${UPPER_ARM_LEN} L ${-13} ${UPPER_ARM_LEN} Z`}
            fill={`url(#${uid}-hoodie-dark)`}
          />
          <path
            d={`M -12 ${UPPER_ARM_LEN - 7} L 12 ${UPPER_ARM_LEN - 7} L 12 ${UPPER_ARM_LEN - 2} L -12 ${UPPER_ARM_LEN - 2}`}
            stroke="#0C0F13"
            strokeWidth="1.2"
            fill="none"
            opacity="0.6"
          />
          <path
            d={`M -15 62 C -12 68, 6 72, 12 70`}
            stroke="#10141A"
            strokeWidth="1.6"
            fill="none"
            opacity="0.55"
          />
          <path
            d={`M -13 74 C -10 80, 6 83, 12 81`}
            stroke="#10141A"
            strokeWidth="1.4"
            fill="none"
            opacity="0.45"
          />
        </g>
      )}
      {outfit === "coat_retake" && (
        <g>
          <path
            d={`M -15 64 C -12 70, 6 74, 12 72`}
            stroke="#07090C"
            strokeWidth="1.8"
            fill="none"
            opacity="0.6"
          />
          <path
            d={`M -16 60 C -14 66, 4 70, 10 68`}
            stroke="#3F5C68"
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
        </g>
      )}
      <path
        d={`M ${m * 15} 18 C ${m * 16} 50, ${m * 14} 70, ${m * 12} ${UPPER_ARM_LEN - 6}`}
        stroke={rim}
        strokeWidth="1.8"
        fill="none"
        opacity="0.4"
      />

      {/* Codo → antebrazo */}
      <g transform={`translate(0 ${UPPER_ARM_LEN}) rotate(${elbow})`}>
        <path d={limbPath(26, 20, FOREARM_LEN)} fill={sleeveFill} />
        {outfit === "link_tunic" ? (
          <g>
            {/* Guantelete de cuero */}
            <path
              d={`M -13 34 C -14 48, -12 60, -11 74 L 11 74 C 12 60, 13 48, 12 34 C 8 30, -9 30, -13 34 Z`}
              fill={`url(#${uid}-leather)`}
            />
            <path d={`M -11 40 L 11 40`} stroke="#1A120A" strokeWidth="1.6" opacity="0.7" />
            <path d={`M -11.5 52 L 11.5 52`} stroke="#1A120A" strokeWidth="1.6" opacity="0.7" />
            <path
              d={`M -12 34 C -13 40, -13 48, -12 54`}
              stroke={rim}
              strokeWidth="1.2"
              fill="none"
              opacity="0.35"
            />
          </g>
        ) : (
          <g>
            <path
              d={`M -11 ${FOREARM_LEN - 9} L 11 ${FOREARM_LEN - 9} L 10 ${FOREARM_LEN} L -10 ${FOREARM_LEN} Z`}
              fill={
                outfit === "coat_retake" ? `url(#${uid}-coat-dark)` : `url(#${uid}-hoodie-dark)`
              }
            />
            {[-6, 0, 6].map((x) => (
              <path
                key={x}
                d={`M ${x} ${FOREARM_LEN - 9} L ${x} ${FOREARM_LEN}`}
                stroke="#0C0F13"
                strokeWidth="1.1"
                fill="none"
                opacity="0.5"
              />
            ))}
          </g>
        )}

        {/* Muñeca → mano */}
        <g transform={`translate(0 ${FOREARM_LEN}) rotate(${wrist})`}>
          <g transform={`rotate(${handShade * 3})`}>
            <path
              d={`M -10 -2 C -11 10, -10 18, -9 26 L 9 26 C 10 18, 11 10, 10 -2 C 8 -5, -8 -5, -10 -2 Z`}
              fill={`url(#${uid}-skin)`}
            />
            <path
              d={fingerPath(-12, 34, -4, 7, handCurl)}
              fill={`url(#${uid}-skin)`}
            />
            <path
              d={fingerPath(-4, 38, -2, 7, handCurl)}
              fill={`url(#${uid}-skin)`}
            />
            <path
              d={fingerPath(4, 36, 1, 7, handCurl)}
              fill={`url(#${uid}-skin)`}
            />
            <path
              d={fingerPath(12, 30, 3, 7, handCurl)}
              fill={`url(#${uid}-skin)`}
            />
            <path
              d={`M -10 4 C -18 8, -24 14, -26 22 C -27 26, -24 28, -21 27 C -16 24, -11 18, -9 12 Z`}
              fill={`url(#${uid}-skin-shadow)`}
            />
            <path
              d={`M -8 8 C -9 14, -8 20, -7 24`}
              stroke="#8A7157"
              strokeWidth="1.2"
              fill="none"
              opacity="0.55"
            />
          </g>
        </g>
      </g>
    </g>
  );
};

/** ---- Pierna completa (cadera → pie) ---- */
interface LegProps {
  ctx: ArtCtx;
  hip: number;
  knee: number;
  ankle: number;
  side: "l" | "r";
}

const Leg: React.FC<LegProps> = ({ ctx, hip, knee, ankle, side }) => {
  const { uid, outfit, rim } = ctx;
  const m = side === "l" ? 1 : -1;
  const pantsFill =
    outfit === "link_tunic" ? `url(#${uid}-leggings)` : outfit === "coat_retake" ? `url(#${uid}-chinos)` : `url(#${uid}-jeans)`;

  return (
    <g transform={`translate(${m * HIP_DX} 0) rotate(${hip})`}>
      {/* Muslo */}
      <path d={limbPath(36, 28, THIGH_LEN)} fill={pantsFill} />
      <path
        d={`M ${m * 15} 20 C ${m * 16} 56, ${m * 15} 84, ${m * 13} 104`}
        stroke="#10141A"
        strokeWidth="1.6"
        fill="none"
        opacity="0.5"
      />
      <path
        d={`M -12 92 C -8 99, 4 103, 11 101`}
        stroke="#0A0D11"
        strokeWidth="1.6"
        fill="none"
        opacity="0.55"
      />
      <path
        d={`M -13 100 C -10 106, 4 109, 10 107`}
        stroke="#0A0D11"
        strokeWidth="1.3"
        fill="none"
        opacity="0.45"
      />
      <path
        d={`M ${m * 16} 18 C ${m * 17} 50, ${m * 15} 80, ${m * 13} 104`}
        stroke={rim}
        strokeWidth="1.6"
        fill="none"
        opacity="0.35"
      />

      {/* Rodilla → espinilla */}
      <g transform={`translate(0 ${THIGH_LEN}) rotate(${knee})`}>
        {outfit === "link_tunic" ? (
          <g>
            <path d={limbPath(30, 26, SHIN_LEN)} fill={`url(#${uid}-leather)`} />
            <path
              d={`M -15 10 L 15 10`}
              stroke="#1A120A"
              strokeWidth="2"
              opacity="0.8"
            />
            <path
              d={`M -15.5 30 L 15.5 30`}
              stroke="#1A120A"
              strokeWidth="2"
              opacity="0.8"
            />
            <path
              d={`M -15.5 48 L 15.5 48`}
              stroke="#1A120A"
              strokeWidth="1.6"
              opacity="0.6"
            />
            <path
              d={`M -16 10 C -16.5 26, -16.5 40, -15 54`}
              stroke={rim}
              strokeWidth="1.2"
              fill="none"
              opacity="0.35"
            />
          </g>
        ) : (
          <g>
            <path d={limbPath(28, 20, SHIN_LEN)} fill={pantsFill} />
            <path
              d={`M ${m * 12} 16 C ${m * 13} 52, ${m * 12} 88, ${m * 10} 110`}
              stroke="#10141A"
              strokeWidth="1.4"
              fill="none"
              opacity="0.45"
            />
            <path
              d={`M -10 100 C -7 106, 5 109, 10 107`}
              stroke="#0A0D11"
              strokeWidth="1.3"
              fill="none"
              opacity="0.5"
            />
          </g>
        )}

        {/* Tobillo → calzado */}
        <g transform={`translate(0 ${SHIN_LEN}) rotate(${ankle})`}>
          {outfit === "link_tunic" ? (
            <g>
              <path
                d={`M -13 18 L 30 18 C 32 18, 33 20, 32 22 L -11 22 C -14 22, -15 20, -13 18 Z`}
                fill="#1A120A"
              />
              <path
                d={`M -14 0 C -12 8, -6 14, 4 17 C 14 20, 24 19, 30 16 C 32 12, 32 6, 30 2 C 20 -3, 2 -4, -14 0 Z`}
                fill={`url(#${uid}-leather)`}
              />
              <path
                d={`M 20 3 C 26 6, 30 11, 31 15`}
                stroke="#1A120A"
                strokeWidth="1.4"
                fill="none"
                opacity="0.7"
              />
              <path
                d={`M -2 2 C 2 6, 6 9, 10 11`}
                stroke="#8A5F1A"
                strokeWidth="1.6"
                fill="none"
                opacity="0.8"
              />
            </g>
          ) : (
            <g>
              <path
                d={`M -12 20 L 30 20 C 32 20, 33 22, 32 24 L -10 24 C -13 24, -14 22, -12 20 Z`}
                fill={outfit === "coat_retake" ? "#9A8F7C" : "#C9C4B8"}
              />
              <path
                d={`M -13 0 C -10 8, -4 14, 6 17 C 16 20, 26 20, 31 19 C 33 16, 33 10, 31 4 C 22 -2, 6 -4, -13 0 Z`}
                fill={
                  outfit === "coat_retake" ? `url(#${uid}-shoe-worn)` : `url(#${uid}-shoe)`
                }
              />
              <path
                d={`M 18 3 C 25 6, 30 12, 31 18 C 33 16, 33 12, 32 8 C 29 4, 24 2, 18 3 Z`}
                fill={
                  outfit === "coat_retake" ? "#20262E" : "#2E3640"
                }
              />
              <path
                d={`M 22 4 C 27 7, 30 12, 31 16`}
                stroke="#8B919A"
                strokeWidth="1.2"
                fill="none"
                opacity="0.7"
              />
              <path d={`M 4 2 L 12 10`} stroke="#6B7280" strokeWidth="2" opacity="0.85" />
              <path d={`M 12 2 L 4 10`} stroke="#6B7280" strokeWidth="2" opacity="0.85" />
              <circle cx="2" cy="1" r="0.9" fill="#040507" />
              <circle cx="14" cy="1" r="0.9" fill="#040507" />
              <circle cx="2" cy="12" r="0.9" fill="#040507" />
              <circle cx="14" cy="12" r="0.9" fill="#040507" />
              <path
                d={`M -13 0 C -14 6, -13 12, -12 18 C -10 20, -12 22, -14 20 C -15 14, -15 6, -14 0 Z`}
                fill="#12161A"
              />
              <path
                d={`M -10 -2 C -4 -6, 8 -6, 14 -2 C 14 2, -10 2, -10 -2 Z`}
                fill="#3A424C"
              />
              {outfit === "coat_retake" && (
                <g>
                  <path
                    d={`M 8 8 L 16 10`}
                    stroke="#0C0F13"
                    strokeWidth="1.4"
                    opacity="0.7"
                  />
                  <path
                    d={`M 24 14 L 29 16`}
                    stroke="#0C0F13"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                </g>
              )}
              <path
                d={`M -13 2 C -11 8, -8 14, -2 18`}
                stroke={rim}
                strokeWidth="1.2"
                fill="none"
                opacity="0.3"
              />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/** ---- Control Nintendo 64 (acción sit_play) ---- */
const N64Controller: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, frame } = ctx;
  const breathe = 1 + Math.sin(frame * 0.05) * 0.004;
  const cableWave = Math.sin(frame * 0.06) * 4;
  return (
    <g transform={`translate(240 552) scale(${breathe})`}>
      {/* Cable volumétrico */}
      <path
        d={`M -4 -48 C -18 ${-72 + cableWave}, 12 ${-88 - cableWave}, -2 -116 C -12 -132, 12 ${-142 + cableWave}, 4 -168 C 10 -162, 14 ${-150 + cableWave}, 12 -142 C 20 ${-134 - cableWave}, -2 -126, 2 -112 C 14 ${-100 + cableWave}, -6 -76, 2 -48 Z`}
        fill={`url(#${uid}-controller)`}
      />
      <path
        d={`M -3 -48 C -16 -70, 10 -86, -2 -112`}
        stroke="#5C646D"
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />
      {/* Cuerpo: alas + prong central */}
      <path
        d={`M -70 30 C -70 48, -54 52, -42 52 L -28 52 C -24 52, -22 48, -22 44 L -22 -2 C -22 -12, -18 -18, -10 -20 L -6 -20 C -2 -20, 0 -24, 0 -30 L 0 -40 C 0 -46, 4 -46, 4 -40 L 4 -24 C 4 -20, 8 -20, 12 -20 L 16 -20 C 24 -18, 28 -12, 28 -2 L 28 44 C 28 48, 30 52, 34 52 L 46 52 C 58 52, 74 46, 74 28 C 74 12, 60 2, 48 -2 C 44 -4, 44 -10, 50 -14 C 60 -20, 64 -32, 58 -42 C 52 -50, 40 -48, 36 -42 C 32 -36, 34 -30, 40 -28 L 36 -28 C 30 -28, 26 -24, 26 -18 C 26 -12, 30 -12, 34 -12 C 46 -12, 52 -2, 52 10 C 52 26, 42 32, 30 32 L 14 32 C 10 32, 8 28, 8 24 L 8 16 C 8 10, 4 10, 0 10 C -4 10, -4 14, -4 18 L -4 30 C -4 34, -8 36, -12 36 L -34 36 C -46 36, -56 30, -56 16 C -56 4, -48 -4, -38 -6 C -34 -8, -34 -12, -38 -16 C -48 -22, -54 -34, -48 -44 C -42 -50, -32 -48, -28 -42 C -24 -36, -26 -30, -32 -28 L -36 -28 C -42 -28, -46 -24, -46 -18 C -46 -12, -42 -12, -38 -12 C -26 -12, -18 -2, -18 10 C -18 26, -28 32, -40 32 L -52 32 C -62 32, -70 28, -70 30 Z`}
        fill={`url(#${uid}-controller)`}
      />
      <path
        d={`M -70 28 C -66 14, -54 4, -40 2`}
        stroke="#8B919A"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
      />
      {/* Joystick central */}
      <ellipse cx="0" cy="-6" rx="11" ry="9" fill="#1A1F26" />
      <ellipse cx="0" cy="-6" rx="7" ry="5.5" fill="#2E3640" />
      <circle cx="0" cy="-13" r="4.6" fill="#3A424C" />
      {/* Botón Start */}
      <circle cx="-4" cy="34" r="2.6" fill="#A83232" />
      {/* D-pad */}
      <path
        d={`M -52 14 L -40 14 L -40 26 L -52 26 Z M -56 18 L -52 18 L -52 26 L -56 26 Z`}
        fill="#1A1F26"
      />
      <path
        d={`M -50 16 L -42 16 L -42 24 L -50 24 Z`}
        fill="#3A424C"
      />
      {/* L / R / Z */}
      <path d={`M -70 6 C -68 0, -64 -4, -58 -6 L -56 -12 L -64 -8 C -68 -4, -70 0, -70 6 Z`} fill="#1A1F26" />
      <path d={`M 70 6 C 68 0, 64 -4, 58 -6 L 56 -12 L 64 -8 C 68 -4, 70 0, 70 6 Z`} fill="#1A1F26" />
      <path d={`M -3 -44 L 3 -44 L 2 -38 L -2 -38 Z`} fill="#1A1F26" />
      {/* Botones C (amarillos) + A (azul) + B (verde) */}
      <circle cx="36" cy="26" r="4" fill="#E8C33C" />
      <circle cx="44" cy="36" r="4" fill="#E8C33C" />
      <circle cx="36" cy="44" r="4" fill="#E8C33C" />
      <circle cx="28" cy="36" r="4" fill="#E8C33C" />
      <circle cx="46" cy="8" r="5.4" fill="#2E63C8" />
      <circle cx="58" cy="16" r="5.4" fill="#2FA84F" />
      <circle cx="46" cy="8" r="2" fill="#6FA2E8" opacity="0.8" />
      <circle cx="58" cy="16" r="2" fill="#7FD29A" opacity="0.8" />
    </g>
  );
};

/** ---- Teclado y mouse (acción desk_edit) ---- */
const DeskPeripherals: React.FC<{ ctx: ArtCtx }> = ({ ctx }) => {
  const { uid, frame } = ctx;
  const keyTap = Math.sin(frame * 0.4) > 0.6 ? -1 : 0;
  const keys: number[] = [];
  for (let i = 0; i < 12; i++) {
    keys.push(i);
  }
  return (
    <g>
      <g transform={`translate(180 508)`}>
        <path
          d={`M -70 -26 C -62 -34, 62 -34, 70 -26 L 74 22 C 74 30, 66 36, 58 36 L -58 36 C -66 36, -74 30, -74 22 Z`}
          fill={`url(#${uid}-controller)`}
        />
        <path
          d={`M -70 -24 C -62 -31, 62 -31, 70 -24 L 70 -16 L -70 -16 Z`}
          fill="#1A1F26"
        />
        {keys.map((i) => (
          <rect
            key={i}
            x={-64 + i * 11}
            y={-10 + (i % 2 === 0 ? 0 : 14) + keyTap * (i === 5 ? 1 : 0)}
            width="9.6"
            height="11"
            rx="1.6"
            fill={i === 5 ? "#2E3640" : "#3A424C"}
            opacity="0.95"
          />
        ))}
        <path
          d={`M -74 22 C -74 28, -66 34, -58 34`}
          stroke="#8B919A"
          strokeWidth="1.2"
          fill="none"
          opacity="0.4"
        />
      </g>
      <g transform={`translate(306 432)`}>
        <path
          d={`M -16 8 C -18 20, -10 32, 2 34 C 14 32, 22 20, 20 8 C 12 -4, -8 -4, -16 8 Z`}
          fill={`url(#${uid}-controller)`}
        />
        <path d={`M 2 4 L 2 22`} stroke="#8B919A" strokeWidth="2" opacity="0.7" />
        <circle cx="2" cy="12" r="1.4" fill="#040507" />
        <path
          d={`M 20 8 C 30 6, 38 12, 40 22 C 34 20, 28 14, 24 10 Z`}
          fill="#2E3640"
        />
        <path
          d={`M 36 16 C 38 12, 40 10, 42 8`}
          stroke="#5C646D"
          strokeWidth="1.4"
          fill="none"
          opacity="0.7"
        />
      </g>
    </g>
  );
};

/** ---- Sombra de contacto en el suelo ---- */
const GroundShadow: React.FC<{
  uid: string;
  pose: Pose;
  action: PlayerAction;
}> = ({ uid, pose, action }) => (
  <g>
    <ellipse
      cx={PELVIS_X}
      cy={pose.shadowCy}
      rx={pose.shadowRx}
      ry={pose.shadowRy}
      fill={`url(#${uid}-shadow)`}
      opacity={pose.shadowOpacity}
    />
    {action === "kneel_grief" && (
      <g>
        <ellipse cx={PELVIS_X - 56} cy={GROUND_Y + 2} rx="20" ry="5" fill={`url(#${uid}-shadow)`} opacity="0.4" />
        <ellipse cx={PELVIS_X + 56} cy={GROUND_Y + 2} rx="20" ry="5" fill={`url(#${uid}-shadow)`} opacity="0.4" />
      </g>
    )}
  </g>
);

/** ---- Cuerpo: esqueleto jerárquico completo ---- */
const Body: React.FC<{
  ctx: ArtCtx;
  action: PlayerAction;
}> = ({ ctx, action }) => {
  const { uid } = ctx;
  const frame = ctx.frame;
  const expression = ctx.expression;
  const pose = computePose(action, frame, expression);

  // Parámetros expresivos del rostro
  const blink =
    expression === "terrified"
      ? 0
      : Math.pow(Math.max(0, Math.sin(frame * 0.043 + 2.1)), 40);
  const lidOpen =
    expression === "terrified" ? 1.3 : expression === "grief" ? 0.92 - blink * 0.85 : 1 - blink * 0.92;
  const browRaise = expression === "curious" || expression === "terrified" ? 5 : expression === "focused" ? -3 : 0;
  const browTilt = expression === "grief" ? 16 : expression === "terrified" ? 10 : expression === "focused" ? -6 : 0;
  const pupilScale = expression === "terrified" ? 0.72 : 1;
  const mouthKind =
    expression === "neutral"
      ? 0
      : expression === "curious"
        ? 1
        : expression === "terrified"
          ? 2
          : expression === "focused"
            ? 3
            : 4;
  const tremble = expression === "grief" ? Math.sin(frame * 0.4) * 0.9 : 0;

  return (
    <g transform={`translate(${PELVIS_X} ${pose.pelvisY})`}>
      {/* Piernas (ancladas a la pelvis, no siguen la inclinación del torso) */}
      <Leg ctx={ctx} hip={pose.lHip} knee={pose.lKnee} ankle={pose.lAnkle} side="l" />
      <Leg ctx={ctx} hip={pose.rHip} knee={pose.rKnee} ankle={pose.rAnkle} side="r" />

      {/* Torso */}
      <g transform={`rotate(${pose.torsoLean}) scale(${pose.breathe})`}>
        <Torso ctx={ctx} />

        {/* Brazos */}
        <Arm ctx={ctx} shoulder={pose.lShoulder} elbow={pose.lElbow} wrist={pose.lWrist} side="l" handCurl={pose.handCurl} frame={frame} />
        <Arm ctx={ctx} shoulder={pose.rShoulder} elbow={pose.rElbow} wrist={pose.rWrist} side="r" handCurl={pose.handCurl} frame={frame} />

        {/* Cuello (tendones + sombra de barbilla) */}
        <g transform={`translate(0 ${NECK_BASE_DY}) rotate(${pose.headTilt})`}>
          <path
            d={`M -15 -8 C -14 6, -13 16, -12 28 L 12 28 C 13 16, 14 6, 15 -8 C 12 -12, -12 -12, -15 -8 Z`}
            fill={`url(#${uid}-skin-shadow)`}
          />
          <path
            d={`M -5 -6 C -4 8, -3 18, -2 26`}
            stroke="#5A4734"
            strokeWidth="1.4"
            fill="none"
            opacity="0.5"
          />
          <path
            d={`M 5 -6 C 4 8, 3 18, 2 26`}
            stroke="#5A4734"
            strokeWidth="1.4"
            fill="none"
            opacity="0.5"
          />
          <ellipse cx="0" cy="-10" rx="13" ry="5" fill="#040507" opacity="0.3" filter={`url(#${uid}-ao)`} />

          {/* Cabeza */}
          <g transform={`translate(0 ${HEAD_DY - NECK_BASE_DY + pose.headDown}) rotate(${pose.headNod})`}>
            {ctx.outfit === "hoodie" && <HoodBehind ctx={ctx} />}
            <Face
              ctx={ctx}
              lidOpen={lidOpen}
              browRaise={browRaise}
              browTilt={browTilt}
              pupilScale={pupilScale}
              mouthKind={mouthKind}
              tremble={tremble}
            />
            {ctx.outfit === "link_tunic" && <PointyCap ctx={ctx} />}
            {(ctx.outfit === "hoodie" || ctx.outfit === "coat_retake") && <FrontHair ctx={ctx} />}
          </g>
        </g>

        {/* Cuello del abrigo (tras la cabeza) */}
        {ctx.outfit === "coat_retake" && <RaisedCollar ctx={ctx} />}
      </g>
    </g>
  );
};

export const PlayerCharacter: React.FC<PlayerCharacterProps> = ({
  width = 420,
  outfit = "hoodie",
  expression = "neutral",
  action = "idle",
  rimColor = "#94A3B8",
  lookX = 0,
  lookY = 0,
  showGroundShadow = true,
  uid = "pc",
  opacity = 1,
  flipX = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const ctx: ArtCtx = {
    frame,
    uid,
    outfit,
    expression,
    rim: rimColor,
    lookX: clamp01(lookX * 0.5 + 0.5) * 2 - 1,
    lookY: clamp01(lookY * 0.5 + 0.5) * 2 - 1,
  };
  const pose = computePose(action, frame, expression);

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
            <stop offset="0%" stopColor="#CBBBA6" />
            <stop offset="100%" stopColor="#93816C" />
          </linearGradient>
          <linearGradient id={`${uid}-skin-shadow`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9C8A74" />
            <stop offset="100%" stopColor="#6E5D49" />
          </linearGradient>
          <radialGradient id={`${uid}-iris`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#6C7A70" />
            <stop offset="55%" stopColor="#3E5A6A" />
            <stop offset="100%" stopColor="#22313A" />
          </radialGradient>
          <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#3A2C1F" />
            <stop offset="100%" stopColor="#17120C" />
          </linearGradient>
          <linearGradient id={`${uid}-hair-back`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#241A12" />
            <stop offset="100%" stopColor="#0E0A06" />
          </linearGradient>
          <linearGradient id={`${uid}-blond`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A85C" />
            <stop offset="100%" stopColor="#8A6C2E" />
          </linearGradient>
          <linearGradient id={`${uid}-hoodie`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#2A3138" />
            <stop offset="100%" stopColor="#171C21" />
          </linearGradient>
          <linearGradient id={`${uid}-hoodie-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2128" />
            <stop offset="100%" stopColor="#0D1115" />
          </linearGradient>
          <linearGradient id={`${uid}-hoodie-gray`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#4A4F55" />
            <stop offset="100%" stopColor="#2B2F34" />
          </linearGradient>
          <linearGradient id={`${uid}-jeans`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#3D4650" />
            <stop offset="100%" stopColor="#232B33" />
          </linearGradient>
          <linearGradient id={`${uid}-chinos`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#2B3138" />
            <stop offset="100%" stopColor="#191D22" />
          </linearGradient>
          <linearGradient id={`${uid}-shoe`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#2E3640" />
            <stop offset="100%" stopColor="#12161A" />
          </linearGradient>
          <linearGradient id={`${uid}-shoe-worn`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#242A31" />
            <stop offset="100%" stopColor="#0E1114" />
          </linearGradient>
          <linearGradient id={`${uid}-tunic`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#2E7D4F" />
            <stop offset="100%" stopColor="#163822" />
          </linearGradient>
          <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#35854F" />
            <stop offset="100%" stopColor="#1A3F27" />
          </linearGradient>
          <linearGradient id={`${uid}-cap-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#163822" />
            <stop offset="100%" stopColor="#0B1F13" />
          </linearGradient>
          <linearGradient id={`${uid}-leggings`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#CBB98C" />
            <stop offset="100%" stopColor="#8F7D54" />
          </linearGradient>
          <linearGradient id={`${uid}-leather`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#4A3826" />
            <stop offset="100%" stopColor="#241A10" />
          </linearGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3B341" />
            <stop offset="100%" stopColor="#8A5F1A" />
          </linearGradient>
          <linearGradient id={`${uid}-coat`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#23272C" />
            <stop offset="100%" stopColor="#101317" />
          </linearGradient>
          <linearGradient id={`${uid}-coat-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15181C" />
            <stop offset="100%" stopColor="#08090B" />
          </linearGradient>
          <linearGradient id={`${uid}-controller`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#454D58" />
            <stop offset="100%" stopColor="#23282F" />
          </linearGradient>
          <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-ao`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {showGroundShadow && <GroundShadow uid={uid} pose={pose} action={action} />}

        <g transform={flipX ? `translate(${VIEW_W} 0) scale(-1 1)` : undefined}>
          <Body ctx={ctx} action={action} />
        </g>

        {action === "sit_play" && <N64Controller ctx={ctx} />}
        {action === "desk_edit" && <DeskPeripherals ctx={ctx} />}
      </svg>
    </div>
  );
};
