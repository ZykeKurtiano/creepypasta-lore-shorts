import { useId } from "react";
import { useCurrentFrame } from "remotion";
import { limbPath, solveTwoBoneIK } from "./rigMath";

/**
 * RakeCharacter — Criatura cuadrúpeda/encorvada de cuerpo entero 2.5D
 * vectorial (Estándar v8). 100% SVG `<path>` (cero `<Img>`), esqueleto
 * jerárquico, 2-Bone IK en patas y brazos, 5 dedos articulados con garras,
 * faceRig con cuencas negras profundas + pupilas diminutas que rastrean
 * `lookTarget`.
 *
 * Coordenadas locales: `floorY` = y=0 (pies plantados en el suelo), el cuerpo
 * crece hacia arriba (y negativa) hasta ~400 unidades.
 */

export type RakeMode = "crouch_watch" | "crawl_fast" | "lunge_attack";

export interface RakeCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
  mode: RakeMode;
  /** Dirección de mirada en coordenadas normalizadas -1..1. */
  lookTarget?: { x: number; y: number };
  /** Apertura de mandíbula 0..1. */
  mouthOpen?: number;
  /** Flexión individual escalonada de los 5 dedos con garras 0..1. */
  clawFlex?: number;
  rimColor?: string;
  eyeGlowColor?: string;
  shadowOpacity?: number;
}

// Paleta coherente gris-pálida (cel-shaded de 3 tonos). NUNCA un brazo
// negro sólido y otro blanco puro: ambos usan la misma familia sombreada.
const SKIN_LIGHT = "#9CA6AE";
const SKIN_MID = "#838D95";
const SKIN_DARK = "#6F7A84";
const SKIN_SHADOW = "#4A545C";
const SKIN_DEEP = "#2E363D";
const BONE = "#DCE1E4";
const SOCKET = "#050709";
const GUM = "#5A3036";
const TONGUE = "#7A3B41";
const CLAW = "#C7CDD1";

interface LimbColors {
  skinLight: string;
  skinMid: string;
  skinDark: string;
  skinShadow: string;
  skinDeep: string;
  claw: string;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Mano grande con palma ósea y 5 dedos largos curvados con garras afiladas. */
function renderHand(
  wx: number,
  wy: number,
  dirDeg: number,
  clawFlex: number,
  frame: number,
  near: boolean,
  c: LimbColors
) {
  const baseAngles = [-52, -26, 0, 26, 52];
  const len1 = [16, 21, 24, 21, 16];
  const len2 = [14, 18, 21, 18, 14];
  const palm = near ? c.skinLight : c.skinMid;
  return (
    <g>
      {/* Palma ósea */}
      <ellipse
        cx={wx}
        cy={wy}
        rx={11}
        ry={13}
        fill={palm}
        transform={`rotate(${dirDeg} ${wx} ${wy})`}
      />
      {baseAngles.map((ang, i) => {
        const a = ((dirDeg + ang) * Math.PI) / 180;
        const curl = clawFlex * 34 + Math.sin(frame * 0.15 + i * 1.7) * 8;
        const l1 = len1[i];
        const l2 = len2[i];
        const p1x = wx + Math.cos(a) * l1;
        const p1y = wy + Math.sin(a) * l1;
        const a2 = a + (curl * Math.PI) / 180;
        const p2x = p1x + Math.cos(a2) * l2;
        const p2y = p1y + Math.sin(a2) * l2;
        const clawLen = 10 + clawFlex * 8;
        const clawTipX = p2x + Math.cos(a2 + 0.5) * clawLen;
        const clawTipY = p2y + Math.sin(a2 + 0.5) * clawLen;
        const ctrlX = p2x + Math.cos(a2 + 0.12) * clawLen * 0.82;
        const ctrlY = p2y + Math.sin(a2 + 0.12) * clawLen * 0.82;
        return (
          <g key={i}>
            <path
              d={`M ${wx.toFixed(1)} ${wy.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`}
              stroke={palm}
              strokeWidth={4 - i * 0.12}
              strokeLinecap="round"
            />
            <path
              d={`M ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)}`}
              stroke={palm}
              strokeWidth={3.4}
              strokeLinecap="round"
            />
            <path
              d={`M ${p2x.toFixed(1)} ${p2y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${clawTipX.toFixed(1)} ${clawTipY.toFixed(1)}`}
              fill="none"
              stroke={c.claw}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Brazo largo y orgánico con 2-Bone IK (deltoides → bíceps → codo huesudo →
 * antebrazo) + mano. Dibuja el segmento superior SIEMPRE de hombro a codo y el
 * antebrazo SIEMPRE de codo a muñeca (articulaciones redondeadas sin hueco).
 */
function renderArm(
  shX: number,
  shY: number,
  hX: number,
  hY: number,
  bendDir: 1 | -1,
  upLen: number,
  foLen: number,
  clawFlex: number,
  frame: number,
  near: boolean,
  c: LimbColors
) {
  const ik = solveTwoBoneIK(shX, shY, hX, hY, upLen, foLen, bendDir);
  const elbow = { x: ik.elbowX, y: ik.elbowY };
  const wrist = { x: ik.wristX, y: ik.wristY };
  const upper = near ? c.skinLight : c.skinMid;
  const fore = near ? c.skinMid : c.skinDark;
  const dirDeg =
    (Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * 180) / Math.PI;

  return (
    <g>
      {/* Deltoides (hombro redondeado) */}
      <circle cx={shX} cy={shY} r={11} fill={upper} />
      {/* Brazo superior (bíceps) */}
      <path d={limbPath(shX, shY, elbow.x, elbow.y, 20, 15)} fill={upper} />
      {/* Codo huesudo */}
      <circle cx={elbow.x} cy={elbow.y} r={8} fill={fore} />
      {/* Antebrazo */}
      <path d={limbPath(elbow.x, elbow.y, wrist.x, wrist.y, 15, 10)} fill={fore} />
      {/* Reflejo de borde en el brazo superior */}
      <path
        d={`M ${shX} ${shY} L ${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)}`}
        stroke={near ? BONE : c.skinLight}
        strokeWidth={2}
        opacity={0.3}
        strokeLinecap="round"
      />
      {renderHand(wrist.x, wrist.y, dirDeg, clawFlex, frame, near, c)}
    </g>
  );
}

/** Pata trasera con muslo + rodilla saliente + tibia + pie plantado con garras. */
function renderLeg(
  hipX: number,
  hipY: number,
  footX: number,
  footY: number,
  bendDir: 1 | -1,
  thighLen: number,
  shinLen: number,
  near: boolean,
  c: LimbColors
) {
  const ik = solveTwoBoneIK(hipX, hipY, footX, footY, thighLen, shinLen, bendDir);
  const knee = { x: ik.elbowX, y: ik.elbowY };
  const ankle = { x: ik.wristX, y: ik.wristY };
  const toeDir = footX >= hipX ? 1 : -1;
  const thigh = near ? c.skinLight : c.skinMid;
  const shin = near ? c.skinMid : c.skinDark;
  const heelX = ankle.x - toeDir * 6;
  const toeX = ankle.x + toeDir * 24;
  const soleY = ankle.y;

  return (
    <g>
      {/* Muslo orgánico ahusado */}
      <path d={limbPath(hipX, hipY, knee.x, knee.y, 28, 20)} fill={thigh} />
      {/* Rodilla adelantada */}
      <circle cx={knee.x} cy={knee.y} r={10} fill={shin} />
      {/* Tibia ahusada */}
      <path d={limbPath(knee.x, knee.y, ankle.x, ankle.y, 20, 11)} fill={shin} />
      {/* Pie plantado en y=0 (soleY) */}
      <path
        d={`M ${heelX.toFixed(1)} ${(soleY + 3).toFixed(1)} L ${toeX.toFixed(1)} ${(soleY - 1).toFixed(1)} L ${toeX.toFixed(1)} ${(soleY + 3).toFixed(1)} Z`}
        fill={shin}
      />
      {/* Garras de los dedos del pie */}
      {[0, 1, 2, 3].map((i) => {
        const tx = toeX - i * 4;
        return (
          <path
            key={i}
            d={`M ${tx.toFixed(1)} ${(soleY - 1).toFixed(1)} q ${(toeDir * 5).toFixed(1)} ${2} ${(toeDir * 9).toFixed(1)} ${-1}`}
            fill="none"
            stroke={c.claw}
            strokeWidth={2.6}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
      {/* Sombra de la garra final bajo el pie (acento de contacto) */}
      <path
        d={`M ${(ankle.x - toeDir * 8).toFixed(1)} ${(soleY + 1).toFixed(1)} L ${(toeX + 6).toFixed(1)} ${(soleY + 1).toFixed(1)}`}
        stroke={c.skinShadow}
        strokeWidth={3}
        opacity={0.4}
        strokeLinecap="round"
      />
    </g>
  );
}

export const RakeCharacter: React.FC<RakeCharacterProps> = ({
  x,
  floorY,
  scale = 1,
  flipX = false,
  opacity = 1,
  mode,
  lookTarget = { x: 0, y: 0 },
  mouthOpen = 0,
  clawFlex = 0,
  rimColor = "#38BDF8",
  eyeGlowColor = "#F8FAFC",
  shadowOpacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const sx = flipX ? -1 : 1;
  const lookX = clamp(lookTarget.x, -1, 1);
  const lookY = clamp(lookTarget.y, -1, 1);
  const mouth = clamp(mouthOpen, 0, 1);
  const claw = clamp(clawFlex, 0, 1);

  // --- Pose por modo ---
  const pose = (() => {
    switch (mode) {
      case "crawl_fast":
        return {
          pelvisY: -104,
          bob: 3.5,
          hunch: 0.9,
          hipSpread: 20,
          footSpread: 62,
          shoulderY: -234,
          shoulderSpread: 46,
          gaitAmp: 7,
          gaitFreq: 0.55,
          handFar: { x: -88, y: -12 },
          handNear: { x: 90, y: -12 },
        };
      case "lunge_attack":
        return {
          pelvisY: -120,
          bob: 1.5,
          hunch: 0.6,
          hipSpread: 20,
          footSpread: 66,
          shoulderY: -252,
          shoulderSpread: 44,
          gaitAmp: 0,
          gaitFreq: 0,
          handFar: { x: -34, y: -128 },
          handNear: { x: 152, y: -146 },
        };
      case "crouch_watch":
      default:
        return {
          pelvisY: -118,
          bob: 2.5,
          hunch: 0.5,
          hipSpread: 18,
          footSpread: 50,
          shoulderY: -262,
          shoulderSpread: 42,
          gaitAmp: 0,
          gaitFreq: 0,
          handFar: { x: -68, y: -76 },
          handNear: { x: 72, y: -70 },
        };
    }
  })();

  const bob = Math.sin(frame * 0.1) * pose.bob;
  const breathe = 1 + 0.02 * Math.sin(frame * 0.09);
  const pelvis = { x: 0, y: pose.pelvisY + bob };

  // Torso fuertemente encorvado (joroba dorsal) y cabeza baja.
  const hump = pose.hunch; // 0..1
  const shoulderY = pose.shoulderY + bob;
  // Cabeza anclada al torso (offset constante desde la pelvis → sigue el bob).
  const headOffset = -148;
  const headTilt = hump * 12 + lookX * 4 + Math.sin(frame * 0.04) * 1.2;

  // Gait de las patas (locomoción cuadrúpeda).
  const gaitL = Math.max(0, Math.sin(frame * pose.gaitFreq)) * pose.gaitAmp;
  const gaitR =
    Math.max(0, Math.sin(frame * pose.gaitFreq + Math.PI)) * pose.gaitAmp;

  const hipFar = { x: -pose.hipSpread, y: pelvis.y + 8 };
  const hipNear = { x: pose.hipSpread, y: pelvis.y + 8 };
  const footFar = { x: -pose.footSpread, y: -gaitL };
  const footNear = { x: pose.footSpread, y: -gaitR };

  const shoulderFar = { x: -pose.shoulderSpread, y: shoulderY };
  const shoulderNear = { x: pose.shoulderSpread, y: shoulderY };

  const armBendFar: 1 | -1 = -1;
  const armBendNear: 1 | -1 = 1;

  const cFar: LimbColors = {
    skinLight: SKIN_LIGHT,
    skinMid: SKIN_MID,
    skinDark: SKIN_DARK,
    skinShadow: SKIN_SHADOW,
    skinDeep: SKIN_DEEP,
    claw: CLAW,
  };
  const cNear: LimbColors = {
    skinLight: SKIN_LIGHT,
    skinMid: SKIN_MID,
    skinDark: SKIN_DARK,
    skinShadow: SKIN_SHADOW,
    skinDeep: SKIN_DEEP,
    claw: BONE,
  };

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
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8BEC2" />
          <stop offset="50%" stopColor={SKIN_LIGHT} />
          <stop offset="100%" stopColor={SKIN_DARK} />
        </linearGradient>
        <radialGradient id={`${uid}-socket`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SOCKET} />
          <stop offset="70%" stopColor="#0A0E12" />
          <stop offset="100%" stopColor="#0E1418" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={eyeGlowColor} stopOpacity="0.55" />
          <stop offset="60%" stopColor={eyeGlowColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={eyeGlowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(${x}, ${floorY}) scale(${sx}, ${scale})`}>
        {/* Sombra de contacto elíptica (pegada a y=0) */}
        <ellipse
          cx={0}
          cy={0}
          rx={mode === "lunge_attack" ? 118 : 100}
          ry={mode === "lunge_attack" ? 15 : 13}
          fill="#000000"
          opacity={shadowOpacity * (0.75 + 0.25 * Math.sin(frame * 0.1))}
        />

        {/* Pata trasera (izquierda, detrás) */}
        {renderLeg(
          hipFar.x,
          hipFar.y,
          footFar.x,
          footFar.y,
          -1,
          62,
          66,
          false,
          cFar
        )}

        {/* Brazo trasero (detrás del torso) */}
        {renderArm(
          shoulderFar.x,
          shoulderFar.y,
          pose.handFar.x,
          pose.handFar.y,
          armBendFar,
          88,
          104,
          claw,
          frame,
          false,
          cFar
        )}

        {/* Pelvis (raíz) */}
        <g transform={`translate(${pelvis.x}, ${pelvis.y})`}>
          <ellipse cx={0} cy={6} rx={26} ry={14} fill={SKIN_DARK} />
          <path
            d="M -26 6 C -26 18 -14 24 0 24 C 14 24 26 18 26 6 L 20 -4 C 12 4 6 6 0 6 C -6 6 -12 4 -20 -4 Z"
            fill={SKIN_SHADOW}
          />
        </g>

        {/* Torso encorvado + cuello + cabeza (núcleo) */}
        <g transform={`translate(${pelvis.x}, ${pelvis.y}) scale(${breathe}, ${breathe})`}>
          {/* Columna dorsal (vértebras individuales, encorvada en joroba) */}
          {Array.from({ length: 10 }).map((_, i) => {
            const t = i / 9;
            const vy = -14 - t * (128 + hump * 18);
            const vx = Math.sin(t * Math.PI) * hump * 22;
            const r = 7 - t * 3.5;
            return (
              <g key={i}>
                <ellipse
                  cx={vx}
                  cy={vy}
                  rx={r}
                  ry={r * 0.8}
                  fill={i % 2 === 0 ? SKIN_LIGHT : SKIN_MID}
                />
                <path
                  d={`M ${vx.toFixed(1)} ${(vy - r * 0.8).toFixed(1)} L ${vx.toFixed(1)} ${(vy + r * 0.8).toFixed(1)}`}
                  stroke={SKIN_SHADOW}
                  strokeWidth={1.2}
                  opacity={0.5}
                />
              </g>
            );
          })}

          {/* Torso: espalda encorvada con joroba dorsal */}
          <path
            d="M -26 0 C -34 -20 -38 -46 -38 -74 C -38 -104 -30 -126 -18 -138 C -6 -148 6 -148 18 -138 C 30 -126 38 -104 38 -74 C 38 -46 34 -20 26 0 Z"
            fill={`url(#${uid}-body)`}
          />
          {/* Joroba dorsal redondeada */}
          <path
            d="M -18 -138 C -24 -150 -16 -160 -2 -162 C 12 -160 24 -150 18 -138 C 6 -144 -6 -144 -18 -138 Z"
            fill={SKIN_MID}
          />
          {/* Caja torácica: costillas sombreadas en 3 tonos cel-shaded */}
          {Array.from({ length: 6 }).map((_, i) => {
            const ty = -48 - i * 15;
            const span = 30 + Math.sin(((i + 1) / 6) * Math.PI) * 9;
            return (
              <g key={i}>
                <path
                  d={`M ${(-span).toFixed(1)} ${ty.toFixed(1)} C ${(-span * 0.55).toFixed(1)} ${(ty - 5).toFixed(1)} ${(-6).toFixed(1)} ${(ty - 3).toFixed(1)} 0 ${ty.toFixed(1)}`}
                  stroke={SKIN_SHADOW}
                  strokeWidth={3.2}
                  fill="none"
                  opacity={0.6}
                />
                <path
                  d={`M ${span.toFixed(1)} ${ty.toFixed(1)} C ${(span * 0.55).toFixed(1)} ${(ty - 5).toFixed(1)} ${(6).toFixed(1)} ${(ty - 3).toFixed(1)} 0 ${ty.toFixed(1)}`}
                  stroke={SKIN_SHADOW}
                  strokeWidth={3.2}
                  fill="none"
                  opacity={0.6}
                />
                <path
                  d={`M ${(-span * 0.4).toFixed(1)} ${(ty + 2).toFixed(1)} C ${(-span * 0.2).toFixed(1)} ${(ty - 1).toFixed(1)} ${(-3).toFixed(1)} ${(ty + 0.5).toFixed(1)} 0 ${(ty + 1).toFixed(1)}`}
                  stroke={SKIN_LIGHT}
                  strokeWidth={1.4}
                  fill="none"
                  opacity={0.45}
                />
              </g>
            );
          })}
          {/* Esternón / sombra central */}
          <path
            d={`M 0 -8 L 0 ${(-120 - hump * 14).toFixed(0)}`}
            stroke={SKIN_DARK}
            strokeWidth={5}
            opacity={0.35}
            strokeLinecap="round"
          />
          {/* Clavículas altas y anchas */}
          <path
            d="M -4 -120 C -18 -128 -30 -130 -40 -134"
            stroke={BONE}
            strokeWidth={4}
            fill="none"
            opacity={0.7}
            strokeLinecap="round"
          />
          <path
            d="M 4 -120 C 18 -128 30 -130 40 -134"
            stroke={BONE}
            strokeWidth={4}
            fill="none"
            opacity={0.7}
            strokeLinecap="round"
          />
          {/* Omóplatos */}
          <path
            d="M -34 -112 C -44 -104 -46 -92 -38 -82 C -30 -90 -28 -104 -34 -112 Z"
            fill={SKIN_DARK}
            opacity={0.7}
          />
          <path
            d="M 34 -112 C 44 -104 46 -92 38 -82 C 30 -90 28 -104 34 -112 Z"
            fill={SKIN_DARK}
            opacity={0.7}
          />
          {/* Rim light direccional */}
          <path
            d="M -26 0 C -34 -20 -38 -46 -38 -74 C -38 -104 -30 -126 -18 -138"
            stroke={rimColor}
            strokeWidth={2.5}
            fill="none"
            opacity={0.5}
            strokeLinecap="round"
          />

          {/* Cuello + cabeza (baja, inclinada) */}
          <g transform={`translate(0, ${headOffset}) rotate(${headTilt})`}>
            {/* Cuello tendinoso (emerge de la joroba hacia el cráneo) */}
            <path
              d="M -9 0 C -9 -8 -7 -12 -6 -16"
              stroke={SKIN_MID}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
            <path d="M -2 0 L -2 -16" stroke={SKIN_LIGHT} strokeWidth={6} strokeLinecap="round" />
            <path
              d="M 7 0 C 8 -7 9 -11 10 -15"
              stroke={SKIN_DARK}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />

            {/* Cráneo calvo humanoide demacrado (bóveda ancha redondeada) */}
            <path
              d="M -34 -14 C -38 -42 -34 -68 -18 -80 C -6 -88 6 -88 18 -80 C 34 -68 38 -42 34 -14 C 26 -8 18 -6 0 -6 C -18 -6 -26 -8 -34 -14 Z"
              fill={`url(#${uid}-body)`}
            />
            {/* Reflejo superior del cráneo */}
            <path
              d="M -24 -50 C -22 -68 -15 -80 -4 -86 C -2 -72 -2 -52 -6 -34 Z"
              fill={SKIN_LIGHT}
              opacity={0.5}
            />
            {/* Arcos superciliares */}
            <path
              d="M -24 -62 C -21 -69 -14 -72 -8 -70"
              stroke={SKIN_DARK}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 24 -62 C 21 -69 14 -72 8 -70"
              stroke={SKIN_DARK}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            {/* Pómulos salientes */}
            <path
              d="M -33 -38 C -28 -32 -20 -29 -12 -31"
              stroke={SKIN_LIGHT}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 33 -38 C 28 -32 20 -29 12 -31"
              stroke={SKIN_LIGHT}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            {/* Mejillas hundidas (se estrechan hacia la mandíbula) */}
            <path
              d="M -31 -26 C -24 -18 -16 -14 -8 -13"
              stroke={SKIN_SHADOW}
              strokeWidth={3.4}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 31 -26 C 24 -18 16 -14 8 -13"
              stroke={SKIN_SHADOW}
              strokeWidth={3.4}
              fill="none"
              strokeLinecap="round"
            />
            {/* Nariz aplanada */}
            <path
              d="M -3 -44 L 0 -38 L 3 -44"
              stroke={SKIN_DARK}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />

            {/* FaceRig: cuencas orbitales negras profundas + pupilas diminutas */}
            <g>
              {[-14, 14].map((ex, i) => {
                const px = ex + lookX * 3.2;
                const py = -50 + lookY * 2.4;
                const flicker = 0.82 + 0.18 * Math.sin(frame * 0.2 + i * 2.1);
                return (
                  <g key={i}>
                    <ellipse
                      cx={ex}
                      cy={-50}
                      rx={8.5}
                      ry={11.5}
                      fill={`url(#${uid}-socket)`}
                    />
                    <ellipse
                      cx={ex}
                      cy={-50}
                      rx={8.5}
                      ry={11.5}
                      fill="none"
                      stroke={SKIN_DARK}
                      strokeWidth={2}
                    />
                    <circle
                      cx={ex}
                      cy={-50}
                      r={14}
                      fill={`url(#${uid}-glow)`}
                      opacity={flicker * 0.35}
                      style={{ mixBlendMode: "screen" }}
                    />
                    <circle
                      cx={px}
                      cy={py}
                      r={2.2}
                      fill={eyeGlowColor}
                      opacity={flicker}
                    />
                  </g>
                );
              })}
            </g>

            {/* Mandíbula inferior articulada */}
            <g transform={`rotate(${mouth * 22} 0 -6)`}>
              <path
                d="M -14 -8 C -16 -2 -12 4 0 4 C 12 4 16 -2 14 -8 Z"
                fill={SKIN_DARK}
              />
              {/* Cavidad bucal (se revela con la apertura) */}
              <path
                d="M -12 -8 C -8 -4 8 -4 12 -8 C 8 0 -8 0 -12 -8 Z"
                fill="#0A0508"
                opacity={mouth}
              />
              {/* Lengua delgada */}
              <path
                d="M -2 -7 C -2 -3 0 -1 2 0"
                stroke={TONGUE}
                strokeWidth={3}
                fill="none"
                opacity={mouth}
                strokeLinecap="round"
              />
              {/* Dientes afilados superiores finos */}
              {Array.from({ length: 9 }).map((_, i) => {
                const dx = -12 + i * 3;
                return (
                  <path
                    key={i}
                    d={`M ${dx.toFixed(1)} -8 L ${(dx + 1.2).toFixed(1)} -14 L ${(dx + 2.4).toFixed(1)} -8 Z`}
                    fill={BONE}
                  />
                );
              })}
              {/* Dientes afilados inferiores */}
              {mouth > 0.15 &&
                Array.from({ length: 7 }).map((_, i) => {
                  const dx = -9 + i * 3;
                  return (
                    <path
                      key={i}
                      d={`M ${dx.toFixed(1)} -8 L ${(dx + 1.2).toFixed(1)} -3 L ${(dx + 2.4).toFixed(1)} -8 Z`}
                      fill={BONE}
                    />
                  );
                })}
            </g>
            {/* Encía superior */}
            <path d="M -14 -8 L 14 -8" stroke={GUM} strokeWidth={3} strokeLinecap="round" />

            {/* Rim light en el cráneo */}
            <path
              d="M -32 -16 C -36 -40 -32 -64 -18 -76"
              stroke={rimColor}
              strokeWidth={2}
              fill="none"
              opacity={0.5}
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Pata delantera (derecha, al frente) */}
        {renderLeg(
          hipNear.x,
          hipNear.y,
          footNear.x,
          footNear.y,
          1,
          62,
          66,
          true,
          cNear
        )}

        {/* Brazo delantero (al frente) */}
        {renderArm(
          shoulderNear.x,
          shoulderNear.y,
          pose.handNear.x,
          pose.handNear.y,
          armBendNear,
          88,
          104,
          claw,
          frame,
          true,
          cNear
        )}
      </g>
    </svg>
  );
};
