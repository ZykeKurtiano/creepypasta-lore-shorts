import { useId } from "react";
import { useCurrentFrame } from "remotion";
import {
  anticipationFollowThrough,
  blinkFactor,
  limbPath,
  solveTwoBoneIK,
} from "./rigMath";

/**
 * MotherWitnessCharacter — Mujer protagonista de cuerpo entero 2.5D vectorial
 * (Estándar v8). 100% SVG `<path>` (cero `<Img>`), esqueleto jerárquico,
 * 2-Bone IK en brazos/piernas, 5 dedos por mano, faceRig de alta
 * expresividad con `<clipPath>` ocular, 3 capas de cabello opaco y grabadora
 * digital plateada compacta sostenida a la altura del pecho.
 *
 * Coordenadas locales: `floorY` = y=0 (pies apoyados; en `sitting_bed` /
 * `sleeping_bed`, y=0 es la superficie del colchón), cuerpo hacia arriba
 * (y negativa) hasta ~440 unidades.
 */

export type MotherPosture =
  | "sleeping_bed"
  | "sitting_bed"
  | "standing_terror"
  | "holding_recorder";

export type MotherEmotion =
  | "calm_sleep"
  | "startled"
  | "pure_terror"
  | "exhausted_focus";

export interface MotherWitnessCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
  posture: MotherPosture;
  emotion: MotherEmotion;
  /** Giro/inclinación de cabeza -1..1. */
  headTurn?: number;
  /** Dirección de pupilas normalizada -1..1. */
  lookTarget?: { x: number; y: number };
  /** Dispara anticipación + sobresalto orgánico. */
  startleTriggerFrame?: number;
  /** 0..1: muestra e ilumina la grabadora digital plateada. */
  recorderGlow?: number;
  rimColor?: string;
}

// Pijama azul oscuro-petróleo.
const PJ_LIGHT = "#3E5A6B";
const PJ_MID = "#2C4657";
const PJ_DARK = "#1C303E";
const PJ_SHADOW = "#12232D";
// Piel cálida a la luz de la luna.
const SKIN_LIGHT = "#D6B4A2";
const SKIN_MID = "#C19A85";
const SKIN_DARK = "#9E7A6C";
const SKIN_SHADOW = "#6E5140";
// Cabello oscuro opaco (3 capas).
const HAIR_BACK = "#0D121D";
const HAIR_MID = "#161E2E";
const HAIR_HI = "#232F45";
const SCLERA = "#F2EFE9";
const IRIS = "#4A3226";
const LIP = "#C06A5E";
const MOUTH_DARK = "#3A1216";
const RECORDER_SILVER = "#C7CDD1";
const RECORDER_DARK = "#3A434B";

interface SkinColors {
  skin: string;
  skinMid: string;
  skinDark: string;
  skinShadow: string;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

function rotatePoint(
  cx: number,
  cy: number,
  px: number,
  py: number,
  deg: number
): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

/** Mano humana con 5 dedos individuales (sin garras). */
function renderHandHuman(
  wx: number,
  wy: number,
  dirDeg: number,
  curl: number,
  c: SkinColors
) {
  const baseAngles = [-40, -20, 0, 20, 40];
  const len = [12, 15, 16, 15, 12];
  return (
    <g>
      <ellipse
        cx={wx}
        cy={wy}
        rx={8}
        ry={9.5}
        fill={c.skin}
        transform={`rotate(${dirDeg} ${wx} ${wy})`}
      />
      {baseAngles.map((ang, i) => {
        const a = ((dirDeg + ang) * Math.PI) / 180;
        const l1 = len[i];
        const p1x = wx + Math.cos(a) * l1;
        const p1y = wy + Math.sin(a) * l1;
        const a2 = a + (curl * Math.PI) / 180;
        const l2 = len[i] * 0.72;
        const p2x = p1x + Math.cos(a2) * l2;
        const p2y = p1y + Math.sin(a2) * l2;
        const nx = p2x + Math.cos(a2) * 2.6;
        const ny = p2y + Math.sin(a2) * 2.6;
        return (
          <g key={i}>
            <path
              d={`M ${wx.toFixed(1)} ${wy.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`}
              stroke={c.skin}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              d={`M ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)}`}
              stroke={c.skinMid}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
            <path
              d={`M ${p2x.toFixed(1)} ${p2y.toFixed(1)} L ${nx.toFixed(1)} ${ny.toFixed(1)}`}
              stroke="#EDDCCB"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.8}
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Brazo humano con 2-Bone IK 100% conectado: manga (shoulder→elbow) y
 * antebrazo desnudo (elbow→wrist), con articulaciones redondeadas sin hueco.
 */
function renderArmHuman(
  shX: number,
  shY: number,
  hX: number,
  hY: number,
  bendDir: 1 | -1,
  upLen: number,
  foLen: number,
  curl: number,
  c: SkinColors
) {
  const ik = solveTwoBoneIK(shX, shY, hX, hY, upLen, foLen, bendDir);
  const elbow = { x: ik.elbowX, y: ik.elbowY };
  const wrist = { x: ik.wristX, y: ik.wristY };
  const dirDeg =
    (Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * 180) / Math.PI;
  return (
    <g>
      {/* Deltoides / hombro */}
      <circle cx={shX} cy={shY} r={12} fill={PJ_MID} />
      {/* Manga (shoulder → elbow) */}
      <path d={limbPath(shX, shY, elbow.x, elbow.y, 20, 15)} fill={PJ_MID} />
      {/* Codo (articulación redondeada) */}
      <circle cx={elbow.x} cy={elbow.y} r={8} fill={c.skinMid} />
      {/* Antebrazo desnudo (elbow → wrist) */}
      <path d={limbPath(elbow.x, elbow.y, wrist.x, wrist.y, 15, 9)} fill={c.skinMid} />
      {/* Reflejo en la manga */}
      <path
        d={`M ${shX} ${shY} L ${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)}`}
        stroke={PJ_LIGHT}
        strokeWidth={2}
        opacity={0.4}
        strokeLinecap="round"
      />
      {renderHandHuman(wrist.x, wrist.y, dirDeg, curl, c)}
    </g>
  );
}

/** Pie descalzo plantado en y=0. */
function renderFoot(
  ankleX: number,
  ankleY: number,
  toeDir: number,
  c: SkinColors
) {
  const heelX = ankleX - toeDir * 6;
  const toeX = ankleX + toeDir * 17;
  return (
    <g>
      <path
        d={`M ${heelX.toFixed(1)} 0 L ${toeX.toFixed(1)} 0 Q ${(toeX + toeDir * 3).toFixed(1)} ${-3} ${(toeX - toeDir * 3).toFixed(1)} ${-9} L ${ankleX.toFixed(1)} ${ankleY.toFixed(1)} L ${(heelX + toeDir * 2).toFixed(1)} ${-5} Z`}
        fill={c.skinMid}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M ${(toeX - i * 2.4).toFixed(1)} ${-1} L ${(toeX - i * 2.4 + toeDir * 1.2).toFixed(1)} ${-5}`}
          stroke={c.skinDark}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

/** Pierna humana con pantalón de pijama voluminoso + pie descalzo en y=0. */
function renderLegHuman(
  hipX: number,
  hipY: number,
  ankleX: number,
  ankleY: number,
  bendDir: 1 | -1,
  thighLen: number,
  shinLen: number,
  c: SkinColors
) {
  const ik = solveTwoBoneIK(hipX, hipY, ankleX, ankleY, thighLen, shinLen, bendDir);
  const knee = { x: ik.elbowX, y: ik.elbowY };
  const ankle = { x: ik.wristX, y: ik.wristY };
  const toeDir = ankleX >= hipX ? 1 : -1;
  return (
    <g>
      {/* Muslo (38–46px de volumen) */}
      <path d={limbPath(hipX, hipY, knee.x, knee.y, 42, 34)} fill={PJ_MID} />
      {/* Rodilla */}
      <circle cx={knee.x} cy={knee.y} r={15} fill={PJ_DARK} />
      {/* Pantorrilla (34→27px) */}
      <path d={limbPath(knee.x, knee.y, ankle.x, ankle.y, 34, 27)} fill={PJ_DARK} />
      {/* Pliegue de pantalón en rodilla */}
      <path
        d={`M ${(knee.x - 6).toFixed(1)} ${(knee.y - 4).toFixed(1)} L ${(knee.x + 6).toFixed(1)} ${(knee.y + 4).toFixed(1)}`}
        stroke={PJ_SHADOW}
        strokeWidth={2.5}
        opacity={0.6}
      />
      {/* Rim light en pantorrilla */}
      <path
        d={`M ${knee.x.toFixed(1)} ${knee.y.toFixed(1)} L ${ankle.x.toFixed(1)} ${ankle.y.toFixed(1)}`}
        stroke={PJ_LIGHT}
        strokeWidth={2}
        opacity={0.3}
        strokeLinecap="round"
      />
      {renderFoot(ankle.x, ankle.y, toeDir, c)}
    </g>
  );
}

interface EmotionParams {
  breathFreq: number;
  breathAmp: number;
  eyeOpen: number;
  browRaise: number;
  mouthOpen: number;
  pupilR: number;
  sweat: number;
  underEye: number;
}

function emotionParams(emotion: MotherEmotion): EmotionParams {
  switch (emotion) {
    case "startled":
      return {
        breathFreq: 0.35,
        breathAmp: 0.03,
        eyeOpen: 1,
        browRaise: 1,
        mouthOpen: 0.45,
        pupilR: 5.5,
        sweat: 0,
        underEye: 0.2,
      };
    case "pure_terror":
      return {
        breathFreq: 0.5,
        breathAmp: 0.05,
        eyeOpen: 1,
        browRaise: 1,
        mouthOpen: 0.9,
        pupilR: 2.4,
        sweat: 1,
        underEye: 0.55,
      };
    case "exhausted_focus":
      return {
        breathFreq: 0.25,
        breathAmp: 0.025,
        eyeOpen: 0.55,
        browRaise: -1,
        mouthOpen: 0.05,
        pupilR: 4,
        sweat: 0,
        underEye: 1,
      };
    case "calm_sleep":
    default:
      return {
        breathFreq: 0.12,
        breathAmp: 0.015,
        eyeOpen: 0,
        browRaise: 0,
        mouthOpen: 0,
        pupilR: 3.5,
        sweat: 0,
        underEye: 0,
      };
  }
}

export const MotherWitnessCharacter: React.FC<MotherWitnessCharacterProps> = ({
  x,
  floorY,
  scale = 1,
  flipX = false,
  opacity = 1,
  posture,
  emotion,
  headTurn = 0,
  lookTarget = { x: 0, y: 0 },
  startleTriggerFrame,
  recorderGlow = 0,
  rimColor = "#60A5FA",
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const sx = flipX ? -1 : 1;
  const lookX = clamp(lookTarget.x, -1, 1);
  const lookY = clamp(lookTarget.y, -1, 1);
  const turn = clamp(headTurn, -1, 1);
  const rec = clamp(recorderGlow, 0, 1);

  const emo = emotionParams(emotion);

  // --- Postura: altura de cadera, inclinación y objetivos de manos (absolutos).
  const pos = (() => {
    switch (posture) {
      case "sitting_bed":
        return {
          pelvisY: -30,
          pitch: 0,
          handL: { x: -40, y: -58 },
          handR: { x: 40, y: -58 },
        };
      case "sleeping_bed":
        return {
          pelvisY: -24,
          pitch: -50,
          handL: { x: -34, y: -58 },
          handR: { x: 34, y: -58 },
        };
      case "holding_recorder":
        return {
          pelvisY: -190,
          pitch: 0,
          handL: { x: -12, y: -258 },
          handR: { x: 18, y: -266 },
        };
      case "standing_terror":
      default:
        return {
          pelvisY: -190,
          pitch: 0,
          handL: { x: -46, y: -244 },
          handR: { x: 46, y: -244 },
        };
    }
  })();

  const bob =
    posture === "standing_terror" || posture === "holding_recorder"
      ? Math.sin(frame * 0.08) * 2
      : 0;
  const pelvis = { x: 0, y: pos.pelvisY + bob };

  // Sobresalto orgánico con anticipación de 4 frames + follow-through.
  const startle = anticipationFollowThrough(
    frame,
    startleTriggerFrame ?? -100000,
    16,
    0,
    1,
    0.3
  );

  const chest = 1 + Math.sin(frame * emo.breathFreq) * emo.breathAmp;
  const shoulderShrug = startle * 8;
  const pitch = pos.pitch + startle * 6;
  const headAngle =
    turn * 18 +
    lookX * 4 +
    Math.sin(frame * 0.05) * 1.5 -
    startle * 9;

  // Hombros globales (±50 → 110px de ancho humano), siguiendo la inclinación.
  const shoulderL = rotatePoint(pelvis.x, pelvis.y, -50, -150, pitch);
  const shoulderR = rotatePoint(pelvis.x, pelvis.y, 50, -150, pitch);

  const c: SkinColors = {
    skin: SKIN_LIGHT,
    skinMid: SKIN_MID,
    skinDark: SKIN_DARK,
    skinShadow: SKIN_SHADOW,
  };

  // Parpadeo natural (solo en estados de vigilia).
  const blink = emo.eyeOpen > 0 ? blinkFactor(frame, 3, 84) : 0;
  const eyeOpen = Math.max(0, Math.min(1, emo.eyeOpen * (1 - blink)));

  // --- Piernas según postura ---
  const isSitting = posture === "sitting_bed";
  const isSleeping = posture === "sleeping_bed";
  const sitLegs = isSitting
    ? {
        hipL: { x: -14, y: -26 },
        hipR: { x: 14, y: -26 },
        kneeL: { x: -38, y: -8 },
        kneeR: { x: 38, y: -8 },
        ankleL: { x: -14, y: -14 },
        ankleR: { x: 14, y: -14 },
      }
    : null;
  const sleepLegs = isSleeping
    ? {
        hipL: { x: -13, y: -18 },
        hipR: { x: 13, y: -18 },
        ankleL: { x: -150, y: -6 },
        ankleR: { x: 150, y: -6 },
      }
    : null;
  const standLegs = !isSitting && !isSleeping
    ? {
        hipL: { x: -14, y: pelvis.y + 6 },
        hipR: { x: 14, y: pelvis.y + 6 },
        ankleL: { x: -16, y: -14 },
        ankleR: { x: 16, y: -14 },
      }
    : null;

  // Grabadora: local (0, -265) = pecho, nunca tapando boca/rostro.
  const REC_X = 0;
  const REC_Y = -265;

  return (
    <svg
      viewBox="0 0 1080 1920"
      width="1080"
      height="1920"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        opacity,
      }}
    >
      <defs>
        <linearGradient id={`${uid}-shirt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PJ_LIGHT} />
          <stop offset="55%" stopColor={PJ_MID} />
          <stop offset="100%" stopColor={PJ_DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={SKIN_LIGHT} />
          <stop offset="60%" stopColor={SKIN_MID} />
          <stop offset="100%" stopColor={SKIN_DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HAIR_HI} />
          <stop offset="45%" stopColor={HAIR_MID} />
          <stop offset="100%" stopColor={HAIR_BACK} />
        </linearGradient>
        <linearGradient id={`${uid}-blanket`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27404E" />
          <stop offset="100%" stopColor="#1B2E39" />
        </linearGradient>
        <clipPath id={`${uid}-eyeL`}>
          <ellipse cx={-16} cy={-44} rx={9} ry={10.5} />
        </clipPath>
        <clipPath id={`${uid}-eyeR`}>
          <ellipse cx={16} cy={-44} rx={9} ry={10.5} />
        </clipPath>
        <radialGradient id={`${uid}-rec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(${x}, ${floorY}) scale(${sx}, ${scale})`}>
        {/* Sombra de contacto */}
        <ellipse
          cx={0}
          cy={isSleeping ? -10 : 0}
          rx={isSleeping ? 150 : 80}
          ry={isSleeping ? 20 : 12}
          fill="#000000"
          opacity={0.5 * (0.8 + 0.2 * Math.sin(frame * 0.08))}
        />

        {/* --- Piernas (detrás) --- */}
        {sitLegs ? (
          <g>
            {/* Muslos doblados */}
            <path d={limbPath(sitLegs.hipL.x, sitLegs.hipL.y, sitLegs.kneeL.x, sitLegs.kneeL.y, 40, 32)} fill={PJ_MID} />
            <path d={limbPath(sitLegs.hipR.x, sitLegs.hipR.y, sitLegs.kneeR.x, sitLegs.kneeR.y, 40, 32)} fill={PJ_MID} />
            {/* Pantorrillas */}
            <path d={limbPath(sitLegs.kneeL.x, sitLegs.kneeL.y, sitLegs.ankleL.x, sitLegs.ankleL.y, 32, 27)} fill={PJ_DARK} />
            <path d={limbPath(sitLegs.kneeR.x, sitLegs.kneeR.y, sitLegs.ankleR.x, sitLegs.ankleR.y, 32, 27)} fill={PJ_DARK} />
            <circle cx={sitLegs.kneeL.x} cy={sitLegs.kneeL.y} r={15} fill={PJ_DARK} />
            <circle cx={sitLegs.kneeR.x} cy={sitLegs.kneeR.y} r={15} fill={PJ_DARK} />
            {renderFoot(sitLegs.ankleL.x, sitLegs.ankleL.y, -1, c)}
            {renderFoot(sitLegs.ankleR.x, sitLegs.ankleR.y, 1, c)}
          </g>
        ) : sleepLegs ? (
          <g>
            {renderLegHuman(sleepLegs.hipL.x, sleepLegs.hipL.y, sleepLegs.ankleL.x, sleepLegs.ankleL.y, -1, 70, 70, c)}
            {renderLegHuman(sleepLegs.hipR.x, sleepLegs.hipR.y, sleepLegs.ankleR.x, sleepLegs.ankleR.y, 1, 70, 70, c)}
          </g>
        ) : standLegs ? (
          <g>
            {renderLegHuman(standLegs.hipL.x, standLegs.hipL.y, standLegs.ankleL.x, standLegs.ankleL.y, -1, 78, 78, c)}
            {renderLegHuman(standLegs.hipR.x, standLegs.hipR.y, standLegs.ankleR.x, standLegs.ankleR.y, 1, 78, 78, c)}
          </g>
        ) : null}

        {/* --- Brazo izquierdo (detrás) ---
            En holding_recorder se pliega hacia arriba (bendDir +1) para que
            el antebrazo ascienda del codo a la mano sin que el codo cuelgue
            por debajo de la manga. */}
        {renderArmHuman(
          shoulderL.x,
          shoulderL.y,
          pos.handL.x,
          pos.handL.y,
          posture === "holding_recorder" ? 1 : -1,
          60,
          52,
          posture === "holding_recorder" ? 14 : 6,
          c
        )}

        {/* --- Pelvis + torso inclinado --- */}
        <g transform={`translate(${pelvis.x}, ${pelvis.y}) rotate(${pitch})`}>
          {/* Caderas / pantalón */}
          <path
            d="M -26 0 C -26 16 -14 22 0 22 C 14 22 26 16 26 0 Z"
            fill={PJ_DARK}
          />
          <path d="M -20 3 L 20 3" stroke={PJ_SHADOW} strokeWidth={2.5} opacity={0.5} />

          {/* Torso (camiseta/pijama) */}
          <g transform={`scale(${chest}, ${chest})`}>
            <path
              d="M -26 0 C -34 -30 -38 -62 -38 -94 C -38 -122 -32 -142 -16 -150 C -6 -154 6 -154 16 -150 C 32 -142 38 -122 38 -94 C 38 -62 34 -30 26 0 Z"
              fill={`url(#${uid}-shirt)`}
            />
            {/* Pliegues textiles cel-shaded */}
            <path d="M -20 -30 C -12 -34 -2 -32 6 -30" stroke={PJ_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -19 -50 C -11 -54 -1 -52 7 -50" stroke={PJ_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -18 -70 C -10 -74 0 -72 8 -70" stroke={PJ_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -17 -90 C -9 -94 1 -92 9 -90" stroke={PJ_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -16 -110 C -8 -114 2 -112 10 -110" stroke={PJ_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            {/* Escote en V */}
            <path
              d="M -9 -138 L 0 -122 L 9 -138"
              stroke={SKIN_MID}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            {/* Clavícula */}
            <path d="M -8 -136 C -20 -130 -30 -134 -38 -140" stroke={SKIN_DARK} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
            <path d="M 8 -136 C 20 -130 30 -134 38 -140" stroke={SKIN_DARK} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
            {/* Rim light direccional */}
            <path
              d="M -26 0 C -34 -30 -38 -62 -38 -94 C -38 -122 -32 -142 -16 -150"
              stroke={rimColor}
              strokeWidth={2.5}
              fill="none"
              opacity={0.55}
              strokeLinecap="round"
            />
          </g>

          {/* --- Cuello + cabeza (con anticipación/follow-through) --- */}
          <g transform={`translate(0, ${(-140 + shoulderShrug * 0.4).toFixed(1)}) rotate(${headAngle})`}>
            {/* Cuello (conecta escote → mentón) */}
            <path d="M -7 4 C -7 -4 -6 -8 -5 -14" stroke={SKIN_MID} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M 6 4 C 6 -4 5 -8 4 -14" stroke={SKIN_DARK} strokeWidth={6} fill="none" strokeLinecap="round" />

            {/* Cabello trasero (hairBack) — opaco y voluminoso */}
            <path
              d="M -34 -18 C -50 -34 -52 -66 -40 -88 C -34 -96 -26 -100 0 -100 C 26 -100 34 -96 40 -88 C 52 -66 50 -34 34 -18 C 34 -40 28 -54 18 -62 C 8 -68 0 -70 -8 -68 C -20 -64 -28 -52 -34 -18 Z"
              fill={HAIR_BACK}
            />

            {/* Cráneo / rostro ovalado */}
            <path
              d="M -32 -34 C -34 -58 -24 -72 -8 -74 C 0 -74 0 -74 8 -74 C 24 -72 34 -58 32 -34 C 30 -18 24 -12 0 -12 C -24 -12 -30 -18 -32 -34 Z"
              fill={`url(#${uid}-skin)`}
            />

            {/* Cabello corona (hairCrown) — opaco */}
            <path
              d="M -32 -30 C -38 -54 -34 -76 -18 -88 C -8 -96 8 -96 18 -88 C 34 -76 38 -54 32 -30 C 27 -50 20 -62 10 -68 C 4 -72 -4 -72 -10 -68 C -20 -62 -27 -50 -32 -30 Z"
              fill={`url(#${uid}-hair)`}
            />
            {/* Mechón con balanceo secundario */}
            <g transform={`rotate(${Math.sin(frame * 0.06) * 1.6} 0 -60)`}>
              <path d="M -9 -62 C -11 -52 -9 -44 -7 -36" stroke={HAIR_MID} strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d="M 8 -64 C 9 -54 7 -46 5 -38" stroke={HAIR_MID} strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>

            {/* Cabello frontal (hairFront): mechones laterales estrechos que
                abrazan el contorno exterior del rostro (sien → pómulo →
                mandíbula), sin bloques oscuros anchos sobre mejillas. */}
            <path
              d="M -33 -33 C -34 -24 -33 -18 -30 -13 C -27 -8 -23 -6 -19 -9 C -21 -14 -21 -24 -20 -34 C -22 -40 -28 -40 -33 -33 Z"
              fill={HAIR_MID}
            />
            <path
              d="M 33 -33 C 34 -24 33 -18 30 -13 C 27 -8 23 -6 19 -9 C 21 -14 21 -24 20 -34 C 22 -40 28 -40 33 -33 Z"
              fill={HAIR_MID}
            />

            {/* FaceRig */}
            <g>
              {/* Ojos con clipPath anatómico */}
              {[-16, 16].map((ex, i) => {
                const clipId = i === 0 ? `${uid}-eyeL` : `${uid}-eyeR`;
                const px = ex + lookX * 3.5;
                const py = -44 + lookY * 2.6;
                const open = eyeOpen;
                return (
                  <g key={i}>
                    <ellipse cx={ex} cy={-44} rx={9} ry={10.5} fill={SCLERA} />
                    <g clipPath={`url(#${clipId})`}>
                      <circle cx={px} cy={py} r={6.4} fill={IRIS} />
                      <circle cx={px} cy={py} r={emo.pupilR} fill="#0A0A0E" />
                      <circle cx={px - 1.6} cy={py - 1.8} r={1.4} fill="#FFFFFF" opacity={0.9} />
                    </g>
                    {/* Párpado superior */}
                    <path
                      d={`M ${ex - 10} ${-44} Q ${ex} ${-44 - 22 * open} ${ex + 10} ${-44}`}
                      fill={SKIN_MID}
                    />
                    {/* Párpado inferior */}
                    <path
                      d={`M ${ex - 9} ${-44} Q ${ex} ${-44 + 14 * (1 - open)} ${ex + 9} ${-44}`}
                      fill={SKIN_MID}
                      opacity={1 - open * 0.7}
                    />
                    {/* Pestaña superior */}
                    <path
                      d={`M ${ex - 7} ${-44 - 20 * open} Q ${ex} ${-44 - 24 * open} ${ex + 7} ${-44 - 20 * open}`}
                      stroke={HAIR_BACK}
                      strokeWidth={2}
                      fill="none"
                      opacity={open}
                      strokeLinecap="round"
                    />
                    {/* Ojeras oscuras (exhausted_focus) */}
                    <path
                      d={`M ${ex - 9} ${-44 + 9} Q ${ex} ${-44 + 14} ${ex + 9} ${-44 + 9}`}
                      stroke={SKIN_SHADOW}
                      strokeWidth={4}
                      fill="none"
                      opacity={emo.underEye * 0.7}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Cejas dinámicas arqueadas */}
              {[-16, 16].map((bx, i) => {
                const raise = emo.browRaise;
                const arch = 6 + raise * 6;
                const by = -60 - raise * 7;
                const furrow = raise < 0 ? 3 : 0;
                return (
                  <path
                    key={i}
                    d={`M ${bx - 9} ${by + (i === 0 ? -furrow : furrow)} Q ${bx} ${by - arch} ${bx + 9} ${by + (i === 0 ? furrow : -furrow)}`}
                    stroke={HAIR_BACK}
                    strokeWidth={3.5}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Nariz */}
              <path d="M 0 -44 C -1 -38 -1 -34 0 -30" stroke={SKIN_DARK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
              <path d="M -3 -30 C -1 -28 1 -28 3 -30" stroke={SKIN_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />

              {/* Boca articulada */}
              <g transform="translate(0, -20)">
                {emo.mouthOpen > 0.08 ? (
                  <>
                    <path
                      d={`M -11 0 C -8 ${-14 * emo.mouthOpen} 8 ${-14 * emo.mouthOpen} 11 0 Z`}
                      fill={MOUTH_DARK}
                    />
                    <path
                      d={`M -8 ${-2 * emo.mouthOpen} C -3 ${-4 * emo.mouthOpen} 3 ${-4 * emo.mouthOpen} 8 ${-2 * emo.mouthOpen}`}
                      fill="#C9808A"
                    />
                    {[0, 1, 2, 3].map((t) => (
                      <path
                        key={t}
                        d={`M ${-8 + t * 4} ${-2 * emo.mouthOpen} L ${-7 + t * 4} ${-7 * emo.mouthOpen} L ${-6 + t * 4} ${-2 * emo.mouthOpen} Z`}
                        fill="#F2EFE9"
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <path
                      d="M -8 0 C -3 3 3 3 8 0"
                      stroke={LIP}
                      strokeWidth={3}
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path d="M -5 -1 L 5 -1" stroke={SKIN_SHADOW} strokeWidth={1.5} fill="none" opacity={0.5} />
                  </>
                )}
              </g>

              {/* Gotas de sudor frío (pure_terror) */}
              {emo.sweat > 0.2 && (
                <g>
                  {[-26, -14, 22, 30].map((sx0, i) => {
                    const drop = (frame * 0.7 + i * 13) % 46;
                    const sy = -58 + drop * 0.55;
                    const o = drop < 6 ? 0 : Math.max(0, 1 - drop / 46);
                    return (
                      <path
                        key={i}
                        d={`M ${sx0} ${sy} C ${sx0 - 2} ${sy + 4} ${sx0 - 1} ${sy + 7} ${sx0} ${sy + 8} C ${sx0 + 1} ${sy + 7} ${sx0 + 2} ${sy + 4} ${sx0} ${sy} Z`}
                        fill="#BFE3F5"
                        opacity={o * emo.sweat}
                      />
                    );
                  })}
                </g>
              )}

              {/* Rim light facial */}
              <path
                d="M -30 -40 C -32 -56 -26 -70 -12 -78"
                stroke={rimColor}
                strokeWidth={2}
                fill="none"
                opacity={0.45}
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {/* --- Manta limpia (sitting_bed) cubriendo rodillas/regazo --- */}
        {isSitting && (
          <g>
            <path
              d="M -56 -4 C -56 -44 -40 -58 0 -58 C 40 -58 56 -44 56 -4 Z"
              fill={`url(#${uid}-blanket)`}
            />
            <path d="M -40 -30 C -24 -38 -4 -40 16 -36" stroke="#0B141A" strokeWidth={3.5} fill="none" opacity={0.6} />
            <path d="M -34 -14 C -18 -22 2 -24 22 -20" stroke="#0B141A" strokeWidth={3.5} fill="none" opacity={0.55} />
            <path d="M -56 -4 C -40 -10 -10 -14 20 -12 C 38 -11 50 -8 56 -4" stroke="#8FA6C8" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
          </g>
        )}

        {/* --- Grabadora digital plateada compacta (holding_recorder) --- */}
        {posture === "holding_recorder" && (
          <g transform={`translate(${REC_X}, ${REC_Y})`}>
            <rect x={-18} y={-29} width={36} height={58} rx={7} fill={RECORDER_SILVER} />
            <rect x={-18} y={-29} width={36} height={58} rx={7} fill="none" stroke={RECORDER_DARK} strokeWidth={2} />
            {/* Micrófono superior */}
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-10 + k * 5} y={-24} width={2} height={6} rx={1} fill={RECORDER_DARK} opacity={0.6} />
            ))}
            {/* Pantalla con brillo */}
            <rect x={-12} y={-16} width={24} height={16} rx={2} fill="#0A1518" />
            <rect
              x={-12}
              y={-16}
              width={24}
              height={16}
              rx={2}
              fill={`url(#${uid}-rec)`}
              opacity={rec * (0.5 + 0.5 * Math.sin(frame * 0.2))}
              style={{ mixBlendMode: "screen" }}
            />
            {/* LED REC */}
            <circle
              cx={-10}
              cy={2}
              r={3}
              fill="#EF4444"
              opacity={rec * (0.35 + 0.65 * Math.abs(Math.sin(frame * 0.3)))}
              style={{ mixBlendMode: "screen" }}
            />
            <text x={-6} y={4} fontSize={5} fill="#EF4444" fontFamily="monospace" opacity={rec}>
              REC
            </text>
            {/* Botón PLAY/REC */}
            <rect x={6} y={-2} width={8} height={7} rx={1.5} fill={RECORDER_DARK} />
            <rect x={6} y={8} width={8} height={7} rx={1.5} fill={RECORDER_DARK} />
            {/* Rejilla de altavoz */}
            {[0, 1, 2].map((s) => (
              <rect key={s} x={-10 + s * 6} y={18} width={2} height={6} rx={1} fill={RECORDER_DARK} opacity={0.6} />
            ))}
          </g>
        )}

        {/* --- Brazo derecho (al frente) --- */}
        {renderArmHuman(
          shoulderR.x,
          shoulderR.y,
          pos.handR.x,
          pos.handR.y,
          1,
          60,
          52,
          posture === "holding_recorder" ? 16 : 8,
          c
        )}
      </g>
    </svg>
  );
};
