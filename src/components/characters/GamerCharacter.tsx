import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * GamerCharacter — Rig humano SVG/TSX completo (Estándar v6) para el
 * jugador/investigador del episodio Tails Doll.
 *
 *  - Cabello esculpido en 3 capas (hairBack / hairCrown / hairFront) sin
 *    efecto "pelón".
 *  - Actuación facial dinámica (ExpressionRig): eyebrowAngle, eyelidOpen,
 *    pupilScale, mouthState, sweatDrops y darkCircles según la emoción,
 *    con ojos anatómicos, boca con interior y soporte bluishLips.
 *  - Silueta completa con rim light 360° en piernas, calzado, torso y brazos.
 *  - 2-Bone IK real (solveTwoBoneIK) con clamp estricto a 0.95*(L1+L2) y
 *    renderLayer para capas Z (backArm -> prop -> frontArm).
 *  - Locomoción biomecánica y anclaje exacto a floorY con sombra elíptica.
 */

export type FacialEmotion = "joy" | "unease" | "panic" | "paranoia";

export interface ExpressionParams {
  emotion: FacialEmotion;
  /** Intensidad 0..1 */
  intensity?: number;
  /** Dirección de mirada X (-1 izq a +1 der) y Y (-1 arriba a +1 abajo) */
  gazeX?: number;
  gazeY?: number;
  /** Si true, añade tono azulado/pálido en labios (tragedia 1998) */
  bluishLips?: boolean;
}

export interface GamerCharacterProps {
  x?: number;
  /** Coordenada Y del suelo exacto donde apoyan los pies/calzado */
  floorY?: number;
  scale?: number;
  flipX?: boolean;
  /** Pose narrativa */
  pose?: "seated_gaming" | "standing_inspect" | "backing_up" | "pushing_door" | "slumped_crt";
  /** Ciclo de pasos/retroceso continuo (0..1+) */
  walkPhase?: number;
  /** Expresión facial dinámica obligatoria */
  expression: ExpressionParams;
  /** Objetivo LOCAL (viewBox 0..400 × 0..1000) de la mano izquierda; el ancla de
   *  pies está en local (200, 930) ≡ (x, floorY) del mundo. */
  leftHandTarget?: { x: number; y: number };
  /** Objetivo LOCAL (viewBox 0..400 × 0..1000) de la mano derecha. */
  rightHandTarget?: { x: number; y: number };
  /** Permite renderizar solo partes traseras o solo el brazo frontal para capas Z */
  renderLayer?: "all" | "body_and_back_arm" | "front_arm_only";
  /** Color del rim light direccional 360° */
  rimColor?: string;
  /** Intensidad del rim light (default 1.0) */
  rimStrength?: number;
  /** Vestimenta: 'retro1997' o 'investigator' */
  outfit?: "retro1997" | "investigator";
  /** Mostrar sombra de contacto elíptica en floorY */
  showFloorShadow?: boolean;
}

/* ------------------------------------------------------------------ */
/* 2-Bone IK solver (ley de cosenos + clamp estricto)                  */
/* ------------------------------------------------------------------ */

export interface Vec2 {
  x: number;
  y: number;
}

export interface IKResult {
  elbow: Vec2;
  /** Ángulo (radianes) del segmento superior hombro→codo. */
  upperAngle: number;
  /** Ángulo (radianes) del segmento inferior codo→mano. */
  foreAngle: number;
}

/**
 * Cinemática inversa de 2 segmentos.
 * clamp estricto a 0.95 * (L1 + L2) y a |L1 - L2| para evitar singularidades.
 * `bendDir > 0` pliega el codo hacia abajo/afuera (natural al sostener un
 * control o empujar una puerta); `bendDir < 0` lo espeja. El antebrazo siempre
 * apunta del codo al objetivo, de modo que la mano aterriza en el target.
 */
export function solveTwoBoneIK(
  shoulder: Vec2,
  target: Vec2,
  L1: number,
  L2: number,
  bendDir: number = 1
): IKResult {
  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const dist = Math.hypot(dx, dy);
  const maxReach = 0.95 * (L1 + L2);
  const minReach = Math.abs(L1 - L2);

  let d = dist;
  if (d > maxReach) d = maxReach;
  if (d < minReach) d = minReach;

  const base = Math.atan2(dy, dx);
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const upperAngle = base + bendDir * a;

  const elbowX = shoulder.x + Math.cos(upperAngle) * L1;
  const elbowY = shoulder.y + Math.sin(upperAngle) * L1;

  // El antebrazo apunta SIEMPRE del codo hacia el objetivo: la mano aterriza
  // exactamente en el target (con clamp). Corrige el bug de "brazos en V".
  const foreAngle = Math.atan2(target.y - elbowY, target.x - elbowX);

  return {
    elbow: { x: elbowX, y: elbowY },
    upperAngle,
    foreAngle,
  };
}

/* ------------------------------------------------------------------ */
/* Geometría / paleta                                                  */
/* ------------------------------------------------------------------ */

const VB_W = 400;
const VB_H = 1000;
const FEET_Y = 930;
const HEAD_CY = 246;

// Piel
const SKIN = "#E7C9A6";
const SKIN_DARK = "#C9A67F";
const SKIN_SHADOW = "#A9835C";
// Cabello
const HAIR_DARK = "#1A1410";
const HAIR_MID = "#2B1E15";
const HAIR_LIGHT = "#3E2B1B";
// Ropa
const HOODIE = "#26323D";
const HOODIE_DARK = "#162129";
const HOODIE_LIGHT = "#3B4A58";
const JACKET = "#1B222B";
const JACKET_DARK = "#10161D";
const JACKET_LIGHT = "#2A3540";
const PANTS = "#2A3340";
const PANTS_DARK = "#1D252E";
const SHOE = "#F2EFE9";
const SHOE_DARK = "#B9B4A8";
const SHOE_SOLE = "#3A4147";
const GLOVE = "#E8DFD0";
const GLOVE_DARK = "#C9BDA6";

const rad2deg = (r: number): number => (r * 180) / Math.PI;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Segmento de extremidad (cápsula) dibujado a lo largo de +x. */
const limbPath = (len: number, w: number): string =>
  `M 0 ${-w} C ${len * 0.25} ${-w - 2}, ${len * 0.75} ${-w - 2}, ${len} ${-w * 0.55} L ${len} ${w * 0.55} C ${len * 0.75} ${w + 2}, ${len * 0.25} ${w + 2}, 0 ${w} Z`;

/** Parámetros continuos del ExpressionRig. */
interface Rig {
  browL: number;
  browR: number;
  lidOpen: number;
  pupil: number;
  mouthOpen: number;
  mouthWidth: number;
  smile: number;
  sweat: number;
  circles: number;
  gazeX: number;
  gazeY: number;
  /** Destello carmesí puntual en la pupila (terror/paranoia). */
  redGleam: number;
}

const computeRig = (e: ExpressionParams, blink: number): Rig => {
  const i = clamp01(e.intensity ?? 1);
  const gx = e.gazeX ?? 0;
  const gy = e.gazeY ?? 0;

  const neutral: Rig = {
    browL: 0,
    browR: 0,
    lidOpen: 1,
    pupil: 1,
    mouthOpen: 0.05,
    mouthWidth: 1,
    smile: 0,
    sweat: 0,
    circles: 0.15,
    gazeX: gx,
    gazeY: gy,
    redGleam: 0,
  };

  let target: Rig;
  switch (e.emotion) {
    case "joy":
      target = {
        browL: 8, browR: 8, lidOpen: 0.98, pupil: 1.02,
        mouthOpen: 0.55, mouthWidth: 1.2, smile: 1,
        sweat: 0, circles: 0.04, gazeX: gx, gazeY: gy, redGleam: 0,
      };
      break;
    case "unease":
      target = {
        browL: -6, browR: 6, lidOpen: 0.72, pupil: 1.08,
        mouthOpen: 0.12, mouthWidth: 0.86, smile: -0.4,
        sweat: 0.32, circles: 0.4, gazeX: gx, gazeY: gy, redGleam: 0,
      };
      break;
    case "panic":
      target = {
        browL: -16, browR: 16, lidOpen: 1.25, pupil: 0.42,
        mouthOpen: 0.95, mouthWidth: 1.4, smile: -0.12,
        sweat: 1, circles: 0.72, gazeX: gx, gazeY: gy, redGleam: 1,
      };
      break;
    case "paranoia":
      target = {
        browL: -9, browR: 9, lidOpen: 0.78, pupil: 0.6,
        mouthOpen: 0.25, mouthWidth: 0.8, smile: -0.6,
        sweat: 0.7, circles: 0.9, gazeX: gx, gazeY: gy, redGleam: 0.7,
      };
      break;
  }

  const mix = (n: number, b: number): number => n + (b - n) * i;
  return {
    browL: mix(neutral.browL, target.browL),
    browR: mix(neutral.browR, target.browR),
    lidOpen: mix(neutral.lidOpen, target.lidOpen) * blink,
    pupil: mix(neutral.pupil, target.pupil),
    mouthOpen: mix(neutral.mouthOpen, target.mouthOpen),
    mouthWidth: mix(neutral.mouthWidth, target.mouthWidth),
    smile: mix(neutral.smile, target.smile),
    sweat: mix(neutral.sweat, target.sweat),
    circles: mix(neutral.circles, target.circles),
    gazeX: gx,
    gazeY: gy,
    redGleam: mix(neutral.redGleam, target.redGleam),
  };
};

/**
 * Brazo 2-bone IK completo: hombro → codo → muñeca (+ guante).
 * Renderiza el brazo a lo largo de +x desde el hombro.
 */
const IKArm: React.FC<{
  shoulder: Vec2;
  target: Vec2;
  L1: number;
  L2: number;
  bendDir: number;
  sleeve: string;
  sleeveDark: string;
  rimColor: string;
  rimStrength: number;
  glove: string;
  gloveDark: string;
}> = ({ shoulder, target, L1, L2, bendDir, sleeve, sleeveDark, rimColor, rimStrength, glove, gloveDark }) => {
  const { upperAngle, foreAngle } = solveTwoBoneIK(shoulder, target, L1, L2, bendDir);
  const ua = rad2deg(upperAngle);
  const fa = rad2deg(foreAngle - upperAngle);
  const w1 = 16;
  const w2 = 13;

  return (
    <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${ua})`}>
      {/* Antebrazo */}
      <path d={limbPath(L1, w1)} fill={sleeve} />
      <path d={limbPath(L1, w1)} fill="none" stroke={rimColor} strokeWidth={2.6} opacity={0.4 * rimStrength} />
      <path d={`M 4 ${-w1 * 0.4} C ${L1 * 0.4} ${-w1 * 0.7}, ${L1 * 0.6} ${-w1 * 0.7}, ${L1 - 6} ${-w1 * 0.35}`} fill="none" stroke={sleeveDark} strokeWidth={3} opacity={0.5} />
      <g transform={`translate(${L1} 0) rotate(${fa})`}>
        <path d={limbPath(L2, w2)} fill={sleeveDark} />
        <path d={limbPath(L2, w2)} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.42 * rimStrength} />
        {/* Guante + muñeca */}
        <g transform={`translate(${L2} 0)`}>
          <path d="M 0 -13 C 10 -14, 18 -12, 22 -8 C 26 -4, 26 2, 22 6 C 18 10, 10 12, 0 12 Z" fill={glove} />
          <path d="M 0 -13 C 10 -14, 18 -12, 22 -8 C 26 -4, 26 2, 22 6 C 18 10, 10 12, 0 12 Z" fill="none" stroke={rimColor} strokeWidth={2} opacity={0.5 * rimStrength} />
          <path d="M 0 -6 L 6 -6" stroke={gloveDark} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          {/* Dedos ligeramente flexionados */}
          <path d="M 22 -6 C 27 -7, 30 -4, 31 0 C 31 3, 29 5, 26 5 C 23 5, 22 2, 22 -1 Z" fill={glove} />
          <path d="M 22 -2 C 27 -2, 30 0, 31 3 C 31 5, 29 6, 27 6 C 24 6, 22 4, 22 1 Z" fill={gloveDark} opacity={0.9} />
          <path d="M 20 2 C 25 3, 28 5, 29 8 C 29 10, 27 11, 25 10 C 22 10, 20 8, 20 5 Z" fill={glove} />
          <path d="M 18 4 C 22 6, 25 8, 26 11 C 26 12, 24 13, 22 12 C 20 12, 18 10, 18 7 Z" fill={gloveDark} opacity={0.9} />
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export const GamerCharacter: React.FC<GamerCharacterProps> = ({
  x = 0,
  floorY = 0,
  scale = 1,
  flipX = false,
  pose = "standing_inspect",
  walkPhase = 0,
  expression,
  leftHandTarget,
  rightHandTarget,
  renderLayer = "all",
  rimColor = "#22D3EE",
  rimStrength = 1,
  outfit = "retro1997",
  showFloorShadow = true,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // Respiración torácica + micro-movimientos (~cada 2s).
  const breathe = 1 + Math.sin(t * Math.PI) * 0.012;
  const headAdjust = Math.sin(t * 0.9) * 0.8;

  // Parpadeo natural determinista (cada ~160 frames, 2 frames de cierre).
  const blinkCycle = frame % 160;
  const blink = blinkCycle > 157 ? Math.max(0, 1 - (blinkCycle - 157) / 1.6) : 1;

  const rig = computeRig(expression, blink);

  const isSeated = pose === "seated_gaming" || pose === "slumped_crt";
  const isBacking = pose === "backing_up";

  // Locomoción: ascenso/descenso de pelvis + zancada en backing_up.
  const walkSin = Math.sin(walkPhase * Math.PI * 2);
  const pelvisBob = isBacking ? -Math.abs(walkSin) * 5 : 0;
  const pelvisY = (isSeated ? 640 : 620) + pelvisBob;

  // Brazos: hombros.
  const shoulderL: Vec2 = { x: 148, y: 344 };
  const shoulderR: Vec2 = { x: 252, y: 344 };
  const L1 = 112;
  const L2 = 104;

  // Objetivos de mano por defecto según pose.
  const defaultTargets: Record<GamerCharacterProps["pose"] & string, { l: Vec2; r: Vec2 }> = {
    seated_gaming: { l: { x: 150, y: 600 }, r: { x: 250, y: 600 } },
    standing_inspect: { l: { x: 150, y: 470 }, r: { x: 250, y: 470 } },
    backing_up: { l: { x: 160, y: 400 }, r: { x: 240, y: 400 } },
    pushing_door: { l: { x: 70, y: 440 }, r: { x: 40, y: 470 } },
    slumped_crt: { l: { x: 140, y: 610 }, r: { x: 258, y: 620 } },
  };
  const dflt = defaultTargets[pose];
  const targetL = leftHandTarget ?? dflt.l;
  const targetR = rightHandTarget ?? dflt.r;

  const sleeve = outfit === "retro1997" ? HOODIE : JACKET;
  const sleeveDark = outfit === "retro1997" ? HOODIE_DARK : JACKET_DARK;

  const showBody = renderLayer === "all" || renderLayer === "body_and_back_arm";
  const showFrontArm = renderLayer === "all" || renderLayer === "front_arm_only";
  const showBackArm = renderLayer === "all" || renderLayer === "body_and_back_arm";

  // Colores de labios (bluishLips para la tragedia de 1998).
  const lipUpper = expression.bluishLips ? "#9FB3C8" : "#C08A63";
  const lipLower = expression.bluishLips ? "#8CA3BC" : "#B97B57";

  // Tinte de ropa (investigator vs retro1997).
  const torsoFill = outfit === "retro1997" ? HOODIE : JACKET;
  const torsoDark = outfit === "retro1997" ? HOODIE_DARK : JACKET_DARK;
  const torsoLight = outfit === "retro1997" ? HOODIE_LIGHT : JACKET_LIGHT;

  return (
    <div
      style={{
        position: "absolute",
        left: x - (VB_W * scale) / 2,
        top: floorY - FEET_Y * scale,
        width: VB_W * scale,
        height: VB_H * scale,
      }}
    >
      <div style={{ width: "100%", height: "100%", transform: `scaleX(${flipX ? -1 : 1})` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ overflow: "visible" }}>
          {/* Sombra de contacto elíptica en floorY */}
          {showFloorShadow && showBody ? (
            <ellipse
              cx={200}
              cy={FEET_Y}
              rx={isSeated ? 128 : 72}
              ry={16}
              fill="#000000"
              opacity={isSeated ? 0.55 : 0.42}
            />
          ) : null}

          {showBody ? (
            <g>
              {/* ============================ PIERNAS + CALZADO ============================ */}
              {!isSeated ? (
                <g>
                  {/* Pierna izquierda (standing) */}
                  <path d={`M 168 ${pelvisY - 8} C 160 ${pelvisY + 60}, 156 ${pelvisY + 150}, 156 ${FEET_Y - 46} L 196 ${FEET_Y - 46} C 196 ${pelvisY + 150}, 196 ${pelvisY + 60}, 196 ${pelvisY - 8} Z`} fill={PANTS} />
                  <path d={`M 168 ${pelvisY - 8} C 160 ${pelvisY + 60}, 156 ${pelvisY + 150}, 156 ${FEET_Y - 46}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.45 * rimStrength} />
                  <path d={`M 160 ${pelvisY + 120} C 168 ${pelvisY + 132}, 176 ${pelvisY + 132}, 184 ${pelvisY + 120}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.6} opacity={0.6} />
                  <path d={`M 166 ${pelvisY} L 172 ${pelvisY + 90} L 168 ${pelvisY + 140}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.2} opacity={0.4} />
                  {/* Tenis izquierdo */}
                  <path d={`M 148 ${FEET_Y - 46} C 146 ${FEET_Y - 22}, 148 ${FEET_Y - 2}, 158 ${FEET_Y} C 168 ${FEET_Y + 2}, 186 ${FEET_Y + 2}, 196 ${FEET_Y} C 206 ${FEET_Y - 2}, 206 ${FEET_Y - 22}, 204 ${FEET_Y - 46} Z`} fill={SHOE} />
                  <path d={`M 148 ${FEET_Y - 46} C 146 ${FEET_Y - 22}, 148 ${FEET_Y - 2}, 158 ${FEET_Y} C 168 ${FEET_Y + 2}, 186 ${FEET_Y + 2}, 196 ${FEET_Y} C 206 ${FEET_Y - 2}, 206 ${FEET_Y - 22}, 204 ${FEET_Y - 46} Z`} fill="none" stroke={rimColor} strokeWidth={2.6} opacity={0.5 * rimStrength} />
                  <path d={`M 176 ${FEET_Y - 40} C 182 ${FEET_Y - 26}, 186 ${FEET_Y - 12}, 190 ${FEET_Y - 2} C 193 ${FEET_Y + 1}, 195 ${FEET_Y + 1}, 197 ${FEET_Y - 1} C 198 ${FEET_Y - 14}, 198 ${FEET_Y - 28}, 197 ${FEET_Y - 40} Z`} fill={SHOE_DARK} opacity={0.5} />
                  <path d={`M 150 ${FEET_Y - 2} C 160 ${FEET_Y + 6}, 190 ${FEET_Y + 6}, 200 ${FEET_Y - 2} L 202 ${FEET_Y - 8} C 190 ${FEET_Y + 1}, 160 ${FEET_Y + 1}, 150 ${FEET_Y - 8} Z`} fill={SHOE_SOLE} />
                  <path d={`M 176 ${FEET_Y - 44} L 180 ${FEET_Y - 44} M 176 ${FEET_Y - 36} L 180 ${FEET_Y - 36} M 176 ${FEET_Y - 28} L 180 ${FEET_Y - 28}`} stroke={SHOE_SOLE} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
                  {/* Pierna derecha (standing) */}
                  <path d={`M 204 ${pelvisY - 8} C 204 ${pelvisY + 60}, 204 ${pelvisY + 150}, 204 ${FEET_Y - 46} L 244 ${FEET_Y - 46} C 244 ${pelvisY + 150}, 240 ${pelvisY + 60}, 232 ${pelvisY - 8} Z`} fill={PANTS} />
                  <path d={`M 232 ${pelvisY - 8} C 240 ${pelvisY + 60}, 244 ${pelvisY + 150}, 244 ${FEET_Y - 46}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.45 * rimStrength} />
                  <path d={`M 216 ${pelvisY + 120} C 224 ${pelvisY + 132}, 232 ${pelvisY + 132}, 240 ${pelvisY + 120}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.6} opacity={0.6} />
                  <path d={`M 234 ${pelvisY} L 228 ${pelvisY + 90} L 232 ${pelvisY + 140}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.2} opacity={0.4} />
                  {/* Tenis derecho */}
                  <path d={`M 196 ${FEET_Y - 46} C 194 ${FEET_Y - 22}, 196 ${FEET_Y - 2}, 206 ${FEET_Y} C 216 ${FEET_Y + 2}, 234 ${FEET_Y + 2}, 244 ${FEET_Y} C 254 ${FEET_Y - 2}, 254 ${FEET_Y - 22}, 252 ${FEET_Y - 46} Z`} fill={SHOE} />
                  <path d={`M 196 ${FEET_Y - 46} C 194 ${FEET_Y - 22}, 196 ${FEET_Y - 2}, 206 ${FEET_Y} C 216 ${FEET_Y + 2}, 234 ${FEET_Y + 2}, 244 ${FEET_Y} C 254 ${FEET_Y - 2}, 254 ${FEET_Y - 22}, 252 ${FEET_Y - 46} Z`} fill="none" stroke={rimColor} strokeWidth={2.6} opacity={0.5 * rimStrength} />
                  <path d={`M 224 ${FEET_Y - 40} C 230 ${FEET_Y - 26}, 234 ${FEET_Y - 12}, 238 ${FEET_Y - 2} C 241 ${FEET_Y + 1}, 243 ${FEET_Y + 1}, 245 ${FEET_Y - 1} C 246 ${FEET_Y - 14}, 246 ${FEET_Y - 28}, 245 ${FEET_Y - 40} Z`} fill={SHOE_DARK} opacity={0.5} />
                  <path d={`M 198 ${FEET_Y - 2} C 208 ${FEET_Y + 6}, 238 ${FEET_Y + 6}, 248 ${FEET_Y - 2} L 250 ${FEET_Y - 8} C 238 ${FEET_Y + 1}, 208 ${FEET_Y + 1}, 198 ${FEET_Y - 8} Z`} fill={SHOE_SOLE} />
                  <path d={`M 224 ${FEET_Y - 44} L 228 ${FEET_Y - 44} M 224 ${FEET_Y - 36} L 228 ${FEET_Y - 36} M 224 ${FEET_Y - 28} L 228 ${FEET_Y - 28}`} stroke={SHOE_SOLE} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
                </g>
              ) : (
                <g>
                  {/* Piernas dobladas (seated / slumped) */}
                  <path d={`M 168 ${pelvisY - 6} C 150 ${pelvisY + 40}, 136 ${pelvisY + 120}, 132 ${pelvisY + 190} C 130 ${pelvisY + 220}, 134 ${pelvisY + 232}, 148 ${pelvisY + 232} C 156 ${pelvisY + 232}, 162 ${pelvisY + 224}, 164 ${pelvisY + 210} C 168 ${pelvisY + 180}, 170 ${pelvisY + 120}, 172 ${pelvisY + 40} Z`} fill={PANTS} />
                  <path d={`M 168 ${pelvisY - 6} C 150 ${pelvisY + 40}, 136 ${pelvisY + 120}, 132 ${pelvisY + 190}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.45 * rimStrength} />
                  <path d={`M 142 ${pelvisY + 190} C 146 ${pelvisY + 206}, 152 ${pelvisY + 218}, 158 ${pelvisY + 226}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.4} opacity={0.6} />
                  {/* Tenis izquierdo (apoyado) */}
                  <path d={`M 130 ${pelvisY + 228} C 128 ${pelvisY + 246}, 130 ${pelvisY + 260}, 140 ${pelvisY + 262} C 150 ${pelvisY + 264}, 168 ${pelvisY + 264}, 178 ${pelvisY + 262} C 188 ${pelvisY + 260}, 188 ${pelvisY + 246}, 186 ${pelvisY + 228} Z`} fill={SHOE} />
                  <path d={`M 130 ${pelvisY + 228} C 128 ${pelvisY + 246}, 130 ${pelvisY + 260}, 140 ${pelvisY + 262} C 150 ${pelvisY + 264}, 168 ${pelvisY + 264}, 178 ${pelvisY + 262} C 188 ${pelvisY + 260}, 188 ${pelvisY + 246}, 186 ${pelvisY + 228} Z`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.5 * rimStrength} />
                  <path d={`M 158 ${pelvisY + 236} C 164 ${pelvisY + 248}, 168 ${pelvisY + 254}, 172 ${pelvisY + 260} C 175 ${pelvisY + 262}, 178 ${pelvisY + 262}, 180 ${pelvisY + 261} C 181 ${pelvisY + 252}, 180 ${pelvisY + 244}, 179 ${pelvisY + 236} Z`} fill={SHOE_DARK} opacity={0.5} />
                  <path d={`M 132 ${pelvisY + 260} C 142 ${pelvisY + 266}, 172 ${pelvisY + 266}, 182 ${pelvisY + 260} L 184 ${pelvisY + 256} C 172 ${pelvisY + 262}, 142 ${pelvisY + 262}, 132 ${pelvisY + 256} Z`} fill={SHOE_SOLE} />

                  <path d={`M 232 ${pelvisY - 6} C 250 ${pelvisY + 40}, 264 ${pelvisY + 120}, 268 ${pelvisY + 190} C 270 ${pelvisY + 220}, 266 ${pelvisY + 232}, 252 ${pelvisY + 232} C 244 ${pelvisY + 232}, 238 ${pelvisY + 224}, 236 ${pelvisY + 210} C 232 ${pelvisY + 180}, 230 ${pelvisY + 120}, 228 ${pelvisY + 40} Z`} fill={PANTS} />
                  <path d={`M 232 ${pelvisY - 6} C 250 ${pelvisY + 40}, 264 ${pelvisY + 120}, 268 ${pelvisY + 190}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.45 * rimStrength} />
                  <path d={`M 258 ${pelvisY + 190} C 254 ${pelvisY + 206}, 248 ${pelvisY + 218}, 242 ${pelvisY + 226}`} fill="none" stroke={PANTS_DARK} strokeWidth={2.4} opacity={0.6} />
                  {/* Tenis derecho (apoyado) */}
                  <path d={`M 214 ${pelvisY + 228} C 212 ${pelvisY + 246}, 214 ${pelvisY + 260}, 224 ${pelvisY + 262} C 234 ${pelvisY + 264}, 252 ${pelvisY + 264}, 262 ${pelvisY + 262} C 272 ${pelvisY + 260}, 272 ${pelvisY + 246}, 270 ${pelvisY + 228} Z`} fill={SHOE} />
                  <path d={`M 214 ${pelvisY + 228} C 212 ${pelvisY + 246}, 214 ${pelvisY + 260}, 224 ${pelvisY + 262} C 234 ${pelvisY + 264}, 252 ${pelvisY + 264}, 262 ${pelvisY + 262} C 272 ${pelvisY + 260}, 272 ${pelvisY + 246}, 270 ${pelvisY + 228} Z`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.5 * rimStrength} />
                  <path d={`M 242 ${pelvisY + 236} C 248 ${pelvisY + 248}, 252 ${pelvisY + 254}, 256 ${pelvisY + 260} C 259 ${pelvisY + 262}, 262 ${pelvisY + 262}, 264 ${pelvisY + 261} C 265 ${pelvisY + 252}, 264 ${pelvisY + 244}, 263 ${pelvisY + 236} Z`} fill={SHOE_DARK} opacity={0.5} />
                  <path d={`M 216 ${pelvisY + 260} C 226 ${pelvisY + 266}, 256 ${pelvisY + 266}, 266 ${pelvisY + 260} L 268 ${pelvisY + 256} C 256 ${pelvisY + 262}, 226 ${pelvisY + 262}, 216 ${pelvisY + 256} Z`} fill={SHOE_SOLE} />
                </g>
              )}

              {/* ============================ TORSO + VESTIMENTA ============================ */}
              <g transform={`translate(0 ${Math.sin(t * Math.PI) * 1.2})`}>
                {/* Brazos traseros: brazo izquierdo (back arm) */}
                {showBackArm ? (
                  <IKArm
                    shoulder={shoulderL}
                    target={targetL}
                    L1={L1}
                    L2={L2}
                    bendDir={1}
                    sleeve={sleeve}
                    sleeveDark={sleeveDark}
                    rimColor={rimColor}
                    rimStrength={rimStrength}
                    glove={GLOVE}
                    gloveDark={GLOVE_DARK}
                  />
                ) : null}

                {/* Torso */}
                <path
                  d={`M 200 ${pelvisY - 282} C 168 ${pelvisY - 282}, 146 ${pelvisY - 268}, 138 ${pelvisY - 246} C 130 ${pelvisY - 210}, 128 ${pelvisY - 150}, 132 ${pelvisY - 90} C 136 ${pelvisY - 30}, 142 ${pelvisY + 4}, 150 ${pelvisY} L 250 ${pelvisY} C 258 ${pelvisY + 4}, 264 ${pelvisY - 30}, 268 ${pelvisY - 90} C 272 ${pelvisY - 150}, 270 ${pelvisY - 210}, 262 ${pelvisY - 246} C 254 ${pelvisY - 268}, 232 ${pelvisY - 282}, 200 ${pelvisY - 282} Z`}
                  fill={torsoFill}
                  transform={`scale(${breathe} ${breathe})`}
                  style={{ transformOrigin: `${200}px ${pelvisY}px` }}
                />
                <path
                  d={`M 200 ${pelvisY - 282} C 168 ${pelvisY - 282}, 146 ${pelvisY - 268}, 138 ${pelvisY - 246} C 130 ${pelvisY - 210}, 128 ${pelvisY - 150}, 132 ${pelvisY - 90} C 136 ${pelvisY - 30}, 142 ${pelvisY + 4}, 150 ${pelvisY} L 250 ${pelvisY} C 258 ${pelvisY + 4}, 264 ${pelvisY - 30}, 268 ${pelvisY - 90} C 272 ${pelvisY - 150}, 270 ${pelvisY - 210}, 262 ${pelvisY - 246} C 254 ${pelvisY - 268}, 232 ${pelvisY - 282}, 200 ${pelvisY - 282} Z`}
                  fill="none"
                  stroke={rimColor}
                  strokeWidth={2.6}
                  opacity={0.45 * rimStrength}
                />

                {/* Caps de hombro redondeados (ocultan la junta del brazo) */}
                <path d={`M 132 356 C 124 344, 126 324, 136 314 C 148 306, 162 310, 170 324 C 162 336, 150 346, 144 356 C 140 359, 135 358, 132 356 Z`} fill={torsoLight} />
                <path d={`M 268 356 C 276 344, 274 324, 264 314 C 252 306, 238 310, 230 324 C 238 336, 250 346, 256 356 C 260 359, 265 358, 268 356 Z`} fill={torsoLight} />
                {/* Cintura sutil (sombras laterales de entallado) */}
                <path d={`M 129 ${pelvisY - 128} C 131 ${pelvisY - 96}, 133 ${pelvisY - 66}, 137 ${pelvisY - 46} C 140 ${pelvisY - 62}, 138 ${pelvisY - 92}, 135 ${pelvisY - 124} Z`} fill={torsoDark} opacity={0.4} />
                <path d={`M 271 ${pelvisY - 128} C 269 ${pelvisY - 96}, 267 ${pelvisY - 66}, 263 ${pelvisY - 46} C 260 ${pelvisY - 62}, 262 ${pelvisY - 92}, 265 ${pelvisY - 124} Z`} fill={torsoDark} opacity={0.4} />

                {outfit === "retro1997" ? (
                  <g>
                    {/* Capucha caída atrás */}
                    <path d={`M 200 ${pelvisY - 282} C 182 ${pelvisY - 296}, 164 ${pelvisY - 288}, 158 ${pelvisY - 268} C 168 ${pelvisY - 274}, 178 ${pelvisY - 276}, 188 ${pelvisY - 274} L 200 ${pelvisY - 280} L 212 ${pelvisY - 274} C 222 ${pelvisY - 276}, 232 ${pelvisY - 274}, 242 ${pelvisY - 268} C 236 ${pelvisY - 288}, 218 ${pelvisY - 296}, 200 ${pelvisY - 282} Z`} fill={torsoDark} />
                    {/* Cuello / gola */}
                    <path d={`M 178 ${pelvisY - 264} C 184 ${pelvisY - 250}, 200 ${pelvisY - 246}, 222 ${pelvisY - 264} C 216 ${pelvisY - 240}, 202 ${pelvisY - 236}, 184 ${pelvisY - 240} Z`} fill={torsoLight} />
                    {/* Bolsillo canguro */}
                    <path d={`M 158 ${pelvisY - 120} C 158 ${pelvisY - 96}, 176 ${pelvisY - 80}, 200 ${pelvisY - 80} C 224 ${pelvisY - 80}, 242 ${pelvisY - 96}, 242 ${pelvisY - 120} L 242 ${pelvisY - 84} C 224 ${pelvisY - 60}, 176 ${pelvisY - 60}, 158 ${pelvisY - 84} Z`} fill={torsoDark} />
                    {/* Franja lateral */}
                    <path d={`M 138 ${pelvisY - 200} C 134 ${pelvisY - 140}, 133 ${pelvisY - 90}, 136 ${pelvisY - 40}`} fill="none" stroke={torsoLight} strokeWidth={4} opacity={0.6} />
                    <path d={`M 262 ${pelvisY - 200} C 266 ${pelvisY - 140}, 267 ${pelvisY - 90}, 264 ${pelvisY - 40}`} fill="none" stroke={torsoLight} strokeWidth={4} opacity={0.6} />
                    {/* Pliegues */}
                    <path d={`M 162 ${pelvisY - 150} C 176 ${pelvisY - 140}, 190 ${pelvisY - 138}, 200 ${pelvisY - 140}`} fill="none" stroke={torsoDark} strokeWidth={2} opacity={0.5} />
                    <path d={`M 238 ${pelvisY - 150} C 224 ${pelvisY - 140}, 210 ${pelvisY - 138}, 200 ${pelvisY - 140}`} fill="none" stroke={torsoDark} strokeWidth={2} opacity={0.5} />
                    <path d={`M 200 ${pelvisY - 260} L 200 ${pelvisY - 210}`} fill="none" stroke={torsoDark} strokeWidth={2} opacity={0.5} />
                    {/* Oclusión en axilas */}
                    <path d={`M 140 ${pelvisY - 240} C 148 ${pelvisY - 236}, 154 ${pelvisY - 228}, 158 ${pelvisY - 218} C 150 ${pelvisY - 214}, 142 ${pelvisY - 216}, 138 ${pelvisY - 224} Z`} fill={torsoDark} opacity={0.6} />
                    <path d={`M 260 ${pelvisY - 240} C 252 ${pelvisY - 236}, 246 ${pelvisY - 228}, 242 ${pelvisY - 218} C 250 ${pelvisY - 214}, 258 ${pelvisY - 216}, 262 ${pelvisY - 224} Z`} fill={torsoDark} opacity={0.6} />
                  </g>
                ) : (
                  <g>
                    {/* Chamarra de investigador: solapas + cremallera + cuello alto */}
                    <path d={`M 200 ${pelvisY - 268} C 180 ${pelvisY - 286}, 158 ${pelvisY - 280}, 150 ${pelvisY - 262} L 200 ${pelvisY - 246} L 250 ${pelvisY - 262} C 242 ${pelvisY - 280}, 220 ${pelvisY - 286}, 200 ${pelvisY - 268} Z`} fill={torsoLight} />
                    <path d={`M 178 ${pelvisY - 250} L 200 ${pelvisY - 236} L 200 ${pelvisY - 90} L 180 ${pelvisY - 100} Z`} fill={torsoLight} />
                    <path d={`M 222 ${pelvisY - 250} L 200 ${pelvisY - 236} L 200 ${pelvisY - 90} L 220 ${pelvisY - 100} Z`} fill={torsoDark} opacity={0.7} />
                    {/* Cremallera central */}
                    <path d={`M 200 ${pelvisY - 236} L 200 ${pelvisY - 90}`} stroke="#8FA3B0" strokeWidth={2.6} strokeDasharray="4 3" opacity={0.85} />
                    {/* Solapas */}
                    <path d={`M 178 ${pelvisY - 250} L 200 ${pelvisY - 236} L 184 ${pelvisY - 208} L 174 ${pelvisY - 222} Z`} fill={JACKET_LIGHT} />
                    <path d={`M 222 ${pelvisY - 250} L 200 ${pelvisY - 236} L 216 ${pelvisY - 208} L 226 ${pelvisY - 222} Z`} fill={JACKET_LIGHT} />
                    {/* Pliegues y costuras */}
                    <path d={`M 156 ${pelvisY - 170} C 172 ${pelvisY - 156}, 186 ${pelvisY - 152}, 200 ${pelvisY - 154}`} fill="none" stroke={JACKET_DARK} strokeWidth={2} opacity={0.5} />
                    <path d={`M 244 ${pelvisY - 170} C 228 ${pelvisY - 156}, 214 ${pelvisY - 152}, 200 ${pelvisY - 154}`} fill="none" stroke={JACKET_DARK} strokeWidth={2} opacity={0.5} />
                    <path d={`M 146 ${pelvisY - 230} L 152 ${pelvisY - 60}`} stroke={JACKET_LIGHT} strokeWidth={2} opacity={0.5} />
                    <path d={`M 254 ${pelvisY - 230} L 248 ${pelvisY - 60}`} stroke={JACKET_LIGHT} strokeWidth={2} opacity={0.5} />
                    <path d={`M 142 ${pelvisY - 240} C 150 ${pelvisY - 236}, 156 ${pelvisY - 228}, 160 ${pelvisY - 218} C 152 ${pelvisY - 214}, 144 ${pelvisY - 216}, 140 ${pelvisY - 224} Z`} fill={JACKET_DARK} opacity={0.6} />
                    <path d={`M 258 ${pelvisY - 240} C 250 ${pelvisY - 236}, 244 ${pelvisY - 228}, 240 ${pelvisY - 218} C 248 ${pelvisY - 214}, 256 ${pelvisY - 216}, 260 ${pelvisY - 224} Z`} fill={JACKET_DARK} opacity={0.6} />
                  </g>
                )}

                {/* Cuello corto y ancho: nace bajo la mandíbula y baja continuo al cuello de la ropa */}
                <path d={`M 184 ${HEAD_CY + 46} C 190 ${HEAD_CY + 60}, 194 ${HEAD_CY + 70}, 200 ${HEAD_CY + 74} C 206 ${HEAD_CY + 70}, 210 ${HEAD_CY + 60}, 216 ${HEAD_CY + 46} L 222 ${pelvisY - 272} C 214 ${pelvisY - 256}, 186 ${pelvisY - 256}, 178 ${pelvisY - 272} Z`} fill={SKIN} />
                <path d={`M 184 ${HEAD_CY + 46} C 190 ${HEAD_CY + 60}, 194 ${HEAD_CY + 70}, 200 ${HEAD_CY + 74} C 206 ${HEAD_CY + 70}, 210 ${HEAD_CY + 60}, 216 ${HEAD_CY + 46}`} fill="none" stroke={SKIN_DARK} strokeWidth={1.4} opacity={0.5} />
                <path d={`M 196 ${HEAD_CY + 58} C 199 ${HEAD_CY + 70}, 201 ${HEAD_CY + 70}, 204 ${HEAD_CY + 58}`} fill="none" stroke={SKIN_SHADOW} strokeWidth={1.6} opacity={0.4} />
                {/* Sombra de oclusión bajo la mandíbula */}
                <path d={`M 168 ${HEAD_CY + 66} C 182 ${HEAD_CY + 82}, 218 ${HEAD_CY + 82}, 232 ${HEAD_CY + 66} C 220 ${HEAD_CY + 78}, 180 ${HEAD_CY + 78}, 168 ${HEAD_CY + 66} Z`} fill="#8A5A3A" opacity={0.4} />

                {/* ============================ CABEZA + EXPRESSION RIG ============================ */}
                <g transform={`rotate(${headAdjust} 200 ${HEAD_CY})`}>
                  {/* hairBack: solo detrás de cráneo/sienes/nuca (NO barba/casco) */}
                  <path d={`M 200 ${HEAD_CY - 96} C 156 ${HEAD_CY - 96}, 122 ${HEAD_CY - 80}, 114 ${HEAD_CY - 44} C 108 ${HEAD_CY - 16}, 112 ${HEAD_CY + 14}, 124 ${HEAD_CY + 34} C 154 ${HEAD_CY + 50}, 246 ${HEAD_CY + 50}, 276 ${HEAD_CY + 34} C 288 ${HEAD_CY + 14}, 292 ${HEAD_CY - 16}, 286 ${HEAD_CY - 44} C 278 ${HEAD_CY - 80}, 244 ${HEAD_CY - 96}, 200 ${HEAD_CY - 96} Z`} fill={HAIR_DARK} />
                  <path d={`M 114 ${HEAD_CY - 44} C 108 ${HEAD_CY - 16}, 112 ${HEAD_CY + 14}, 124 ${HEAD_CY + 34}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.4 * rimStrength} />
                  <path d={`M 286 ${HEAD_CY - 44} C 292 ${HEAD_CY - 16}, 288 ${HEAD_CY + 14}, 276 ${HEAD_CY + 34}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.4 * rimStrength} />

                  {/* Cráneo / piel */}
                  <ellipse cx={200} cy={HEAD_CY} rx={60} ry={78} fill={SKIN} />
                  {/* Orejas */}
                  <path d={`M 140 ${HEAD_CY + 8} C 132 ${HEAD_CY + 2}, 130 ${HEAD_CY - 8}, 134 ${HEAD_CY - 16} C 142 ${HEAD_CY - 20}, 148 ${HEAD_CY - 12}, 146 ${HEAD_CY} Z`} fill={SKIN_DARK} />
                  <path d={`M 260 ${HEAD_CY + 8} C 268 ${HEAD_CY + 2}, 270 ${HEAD_CY - 8}, 266 ${HEAD_CY - 16} C 258 ${HEAD_CY - 20}, 252 ${HEAD_CY - 12}, 254 ${HEAD_CY} Z`} fill={SKIN_DARK} />

                  {/* hairCrown: casquete SÓLIDO Y CONTINUO de sien a sien (cubre toda la parte
                      superior del cráneo y la frente, sin arco calvo abierto en el centro) */}
                  <path d={`M 200 ${HEAD_CY - 98} C 156 ${HEAD_CY - 96}, 122 ${HEAD_CY - 84}, 114 ${HEAD_CY - 52} C 108 ${HEAD_CY - 28}, 112 ${HEAD_CY - 14}, 128 ${HEAD_CY - 10} C 138 ${HEAD_CY - 24}, 140 ${HEAD_CY - 40}, 152 ${HEAD_CY - 34} C 164 ${HEAD_CY - 28}, 166 ${HEAD_CY - 40}, 176 ${HEAD_CY - 44} C 190 ${HEAD_CY - 48}, 194 ${HEAD_CY - 46}, 200 ${HEAD_CY - 44} C 206 ${HEAD_CY - 46}, 210 ${HEAD_CY - 48}, 224 ${HEAD_CY - 44} C 234 ${HEAD_CY - 40}, 236 ${HEAD_CY - 28}, 248 ${HEAD_CY - 34} C 260 ${HEAD_CY - 40}, 262 ${HEAD_CY - 24}, 272 ${HEAD_CY - 10} C 288 ${HEAD_CY - 14}, 292 ${HEAD_CY - 28}, 286 ${HEAD_CY - 52} C 278 ${HEAD_CY - 84}, 244 ${HEAD_CY - 96}, 200 ${HEAD_CY - 98} Z`} fill={HAIR_MID} />
                  <path d={`M 200 ${HEAD_CY - 98} C 156 ${HEAD_CY - 96}, 122 ${HEAD_CY - 84}, 114 ${HEAD_CY - 52}`} fill="none" stroke={rimColor} strokeWidth={2.2} opacity={0.5 * rimStrength} />
                  <path d={`M 286 ${HEAD_CY - 52} C 292 ${HEAD_CY - 28}, 288 ${HEAD_CY - 14}, 272 ${HEAD_CY - 10}`} fill="none" stroke={rimColor} strokeWidth={2.2} opacity={0.4 * rimStrength} />
                  {/* Volumen y mechones de coronilla (cerrados) */}
                  <path d={`M 176 ${HEAD_CY - 60} C 168 ${HEAD_CY - 76}, 166 ${HEAD_CY - 86}, 170 ${HEAD_CY - 94} C 180 ${HEAD_CY - 88}, 182 ${HEAD_CY - 74}, 181 ${HEAD_CY - 62} Z`} fill={HAIR_LIGHT} />
                  <path d={`M 224 ${HEAD_CY - 60} C 232 ${HEAD_CY - 76}, 234 ${HEAD_CY - 86}, 230 ${HEAD_CY - 94} C 220 ${HEAD_CY - 88}, 218 ${HEAD_CY - 74}, 219 ${HEAD_CY - 62} Z`} fill={HAIR_LIGHT} />
                  <path d={`M 200 ${HEAD_CY - 68} C 194 ${HEAD_CY - 82}, 193 ${HEAD_CY - 92}, 199 ${HEAD_CY - 99} C 206 ${HEAD_CY - 92}, 207 ${HEAD_CY - 80}, 205 ${HEAD_CY - 68} Z`} fill={HAIR_MID} />
                  <path d={`M 158 ${HEAD_CY - 52} C 156 ${HEAD_CY - 62}, 158 ${HEAD_CY - 70}, 164 ${HEAD_CY - 74} C 170 ${HEAD_CY - 70}, 171 ${HEAD_CY - 60}, 168 ${HEAD_CY - 52} Z`} fill={HAIR_LIGHT} />
                  <path d={`M 242 ${HEAD_CY - 52} C 244 ${HEAD_CY - 62}, 242 ${HEAD_CY - 70}, 236 ${HEAD_CY - 74} C 230 ${HEAD_CY - 70}, 229 ${HEAD_CY - 60}, 232 ${HEAD_CY - 52} Z`} fill={HAIR_LIGHT} />

                  {/* hairFront: flequillo continuo cerrado + patillas (cero barras flotantes) */}
                  <path d={`M 132 ${HEAD_CY - 48} C 138 ${HEAD_CY - 34}, 148 ${HEAD_CY - 24}, 162 ${HEAD_CY - 20} C 166 ${HEAD_CY - 32}, 164 ${HEAD_CY - 44}, 158 ${HEAD_CY - 54} C 150 ${HEAD_CY - 58}, 138 ${HEAD_CY - 56}, 132 ${HEAD_CY - 48} Z`} fill={HAIR_MID} />
                  <path d={`M 268 ${HEAD_CY - 48} C 262 ${HEAD_CY - 34}, 252 ${HEAD_CY - 24}, 238 ${HEAD_CY - 20} C 234 ${HEAD_CY - 32}, 236 ${HEAD_CY - 44}, 242 ${HEAD_CY - 54} C 250 ${HEAD_CY - 58}, 262 ${HEAD_CY - 56}, 268 ${HEAD_CY - 48} Z`} fill={HAIR_MID} />
                  <path d={`M 158 ${HEAD_CY - 34} C 156 ${HEAD_CY - 22}, 160 ${HEAD_CY - 12}, 168 ${HEAD_CY - 6} C 172 ${HEAD_CY - 16}, 173 ${HEAD_CY - 26}, 170 ${HEAD_CY - 36} C 165 ${HEAD_CY - 38}, 161 ${HEAD_CY - 37}, 158 ${HEAD_CY - 34} Z`} fill={HAIR_LIGHT} />
                  <path d={`M 242 ${HEAD_CY - 34} C 244 ${HEAD_CY - 22}, 240 ${HEAD_CY - 12}, 232 ${HEAD_CY - 6} C 228 ${HEAD_CY - 16}, 227 ${HEAD_CY - 26}, 230 ${HEAD_CY - 36} C 235 ${HEAD_CY - 38}, 239 ${HEAD_CY - 37}, 242 ${HEAD_CY - 34} Z`} fill={HAIR_LIGHT} />
                  {/* Flequillo orgánico en capas: nace conectado desde hairCrown y cae
                      barrido hacia un lado (CERO óvalos/manchas flotando en la frente) */}
                  <path d={`M 178 ${HEAD_CY - 44} C 174 ${HEAD_CY - 56}, 178 ${HEAD_CY - 64}, 190 ${HEAD_CY - 66} C 198 ${HEAD_CY - 66}, 202 ${HEAD_CY - 62}, 205 ${HEAD_CY - 56} C 208 ${HEAD_CY - 46}, 204 ${HEAD_CY - 34}, 195 ${HEAD_CY - 28} C 186 ${HEAD_CY - 24}, 172 ${HEAD_CY - 28}, 164 ${HEAD_CY - 22} C 162 ${HEAD_CY - 16}, 166 ${HEAD_CY - 10}, 176 ${HEAD_CY - 8} C 184 ${HEAD_CY - 12}, 190 ${HEAD_CY - 18}, 192 ${HEAD_CY - 26} C 194 ${HEAD_CY - 38}, 190 ${HEAD_CY - 46}, 183 ${HEAD_CY - 47} Z`} fill={HAIR_MID} />
                  <path d={`M 188 ${HEAD_CY - 60} C 182 ${HEAD_CY - 64}, 176 ${HEAD_CY - 60}, 172 ${HEAD_CY - 50} C 168 ${HEAD_CY - 42}, 170 ${HEAD_CY - 32}, 178 ${HEAD_CY - 26} C 182 ${HEAD_CY - 28}, 184 ${HEAD_CY - 34}, 183 ${HEAD_CY - 40} C 182 ${HEAD_CY - 48}, 181 ${HEAD_CY - 54}, 185 ${HEAD_CY - 58} Z`} fill={HAIR_LIGHT} />
                  <path d={`M 196 ${HEAD_CY - 62} C 192 ${HEAD_CY - 68}, 190 ${HEAD_CY - 62}, 192 ${HEAD_CY - 54} C 194 ${HEAD_CY - 46}, 200 ${HEAD_CY - 40}, 210 ${HEAD_CY - 36} C 216 ${HEAD_CY - 34}, 218 ${HEAD_CY - 30}, 214 ${HEAD_CY - 26} C 208 ${HEAD_CY - 24}, 198 ${HEAD_CY - 28}, 194 ${HEAD_CY - 36} C 192 ${HEAD_CY - 44}, 194 ${HEAD_CY - 52}, 198 ${HEAD_CY - 58} Z`} fill={HAIR_MID} />
                  {/* Patillas laterales caídas */}
                  <path d={`M 138 ${HEAD_CY - 30} C 134 ${HEAD_CY - 8}, 136 ${HEAD_CY + 10}, 142 ${HEAD_CY + 24} C 148 ${HEAD_CY + 12}, 149 ${HEAD_CY - 6}, 146 ${HEAD_CY - 24} C 143 ${HEAD_CY - 27}, 140 ${HEAD_CY - 28}, 138 ${HEAD_CY - 30} Z`} fill={HAIR_MID} />
                  <path d={`M 262 ${HEAD_CY - 30} C 266 ${HEAD_CY - 8}, 264 ${HEAD_CY + 10}, 258 ${HEAD_CY + 24} C 252 ${HEAD_CY + 12}, 251 ${HEAD_CY - 6}, 254 ${HEAD_CY - 24} C 257 ${HEAD_CY - 27}, 260 ${HEAD_CY - 28}, 262 ${HEAD_CY - 30} Z`} fill={HAIR_MID} />

                  {/* Ojeras (darkCircles) */}
                  <path d={`M 164 ${HEAD_CY + 6} C 170 ${HEAD_CY + 14}, 182 ${HEAD_CY + 18}, 190 ${HEAD_CY + 16} C 188 ${HEAD_CY + 10}, 180 ${HEAD_CY + 4}, 168 ${HEAD_CY + 2} Z`} fill="#4A2E3A" opacity={rig.circles * 0.7} />
                  <path d={`M 236 ${HEAD_CY + 6} C 230 ${HEAD_CY + 14}, 218 ${HEAD_CY + 18}, 210 ${HEAD_CY + 16} C 212 ${HEAD_CY + 10}, 220 ${HEAD_CY + 4}, 232 ${HEAD_CY + 2} Z`} fill="#4A2E3A" opacity={rig.circles * 0.7} />

                  {/* Cejas */}
                  <g transform={`rotate(${-rig.browL} 178 ${HEAD_CY - 12})`}>
                    <path d={`M 162 ${HEAD_CY - 12} C 168 ${HEAD_CY - 18}, 184 ${HEAD_CY - 20}, 194 ${HEAD_CY - 14}`} fill="none" stroke={HAIR_DARK} strokeWidth={6} strokeLinecap="round" />
                  </g>
                  <g transform={`rotate(${rig.browR} 222 ${HEAD_CY - 12})`}>
                    <path d={`M 238 ${HEAD_CY - 12} C 232 ${HEAD_CY - 18}, 216 ${HEAD_CY - 20}, 206 ${HEAD_CY - 14}`} fill="none" stroke={HAIR_DARK} strokeWidth={6} strokeLinecap="round" />
                  </g>

                  {/* Ojo izquierdo */}
                  <g>
                    {/* Esclerótica limpia con sombra superior sutil */}
                    <path d={`M 162 ${HEAD_CY + 2} C 166 ${HEAD_CY - 6}, 180 ${HEAD_CY - 8}, 190 ${HEAD_CY - 2} C 190 ${HEAD_CY + 8}, 178 ${HEAD_CY + 12}, 166 ${HEAD_CY + 8} C 160 ${HEAD_CY + 6}, 160 ${HEAD_CY + 5}, 162 ${HEAD_CY + 2} Z`} fill="#F7F2E9" />
                    <path d={`M 164 ${HEAD_CY - 1} C 168 ${HEAD_CY - 6}, 178 ${HEAD_CY - 7}, 187 ${HEAD_CY - 3} C 179 ${HEAD_CY - 4}, 169 ${HEAD_CY - 3}, 164 ${HEAD_CY - 1} Z`} fill="#D9C7B3" opacity={0.55} />
                    <path d={`M 162 ${HEAD_CY + 2} C 166 ${HEAD_CY - 6}, 180 ${HEAD_CY - 8}, 190 ${HEAD_CY - 2} C 190 ${HEAD_CY + 8}, 178 ${HEAD_CY + 12}, 166 ${HEAD_CY + 8} C 160 ${HEAD_CY + 6}, 160 ${HEAD_CY + 5}, 162 ${HEAD_CY + 2} Z`} fill="none" stroke={SKIN_DARK} strokeWidth={1.2} opacity={0.6} />
                    {/* Iris oscuro bien definido + pupila contraída */}
                    <circle cx={176 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={9.5} fill="#5A3A22" />
                    <circle cx={176 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={9.5} fill="none" stroke="#2A160B" strokeWidth={2.2} />
                    <circle cx={176 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={6.4} fill="none" stroke="#3B2717" strokeWidth={1.2} opacity={0.8} />
                    <circle cx={176 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={5.4 * rig.pupil} fill="#050302" />
                    <circle cx={176 + rig.gazeX * 4 + 2.4} cy={HEAD_CY - 1 + rig.gazeY * 3} r={1.9} fill="#FFFFFF" opacity={0.95} />
                    {rig.redGleam > 0.05 ? (
                      <circle cx={176 + rig.gazeX * 4 - 2} cy={HEAD_CY + 4 + rig.gazeY * 3} r={1.5} fill="#DC2626" opacity={0.9 * rig.redGleam} />
                    ) : null}
                    {/* Párpado superior (articulado) */}
                    <path d={`M 160 ${HEAD_CY + 2} C 162 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 12}, 168 ${HEAD_CY - 4 + (1 - rig.lidOpen) * 14}, 176 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 14} C 184 ${HEAD_CY - 4 + (1 - rig.lidOpen) * 14}, 190 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 12}, 191 ${HEAD_CY + 2} C 182 ${HEAD_CY - 1}, 170 ${HEAD_CY - 1}, 160 ${HEAD_CY + 2} Z`} fill={SKIN} opacity={rig.lidOpen < 0.9 ? 1 : 0} />
                    {/* Párpado inferior */}
                    <path d={`M 163 ${HEAD_CY + 9} C 170 ${HEAD_CY + 11}, 182 ${HEAD_CY + 11}, 189 ${HEAD_CY + 9}`} fill="none" stroke={SKIN_SHADOW} strokeWidth={2.2} opacity={0.7} />
                  </g>

                  {/* Ojo derecho */}
                  <g>
                    <path d={`M 238 ${HEAD_CY + 2} C 234 ${HEAD_CY - 6}, 220 ${HEAD_CY - 8}, 210 ${HEAD_CY - 2} C 210 ${HEAD_CY + 8}, 222 ${HEAD_CY + 12}, 234 ${HEAD_CY + 8} C 240 ${HEAD_CY + 6}, 240 ${HEAD_CY + 5}, 238 ${HEAD_CY + 2} Z`} fill="#F7F2E9" />
                    <path d={`M 236 ${HEAD_CY - 1} C 232 ${HEAD_CY - 6}, 222 ${HEAD_CY - 7}, 213 ${HEAD_CY - 3} C 221 ${HEAD_CY - 4}, 231 ${HEAD_CY - 3}, 236 ${HEAD_CY - 1} Z`} fill="#D9C7B3" opacity={0.55} />
                    <path d={`M 238 ${HEAD_CY + 2} C 234 ${HEAD_CY - 6}, 220 ${HEAD_CY - 8}, 210 ${HEAD_CY - 2} C 210 ${HEAD_CY + 8}, 222 ${HEAD_CY + 12}, 234 ${HEAD_CY + 8} C 240 ${HEAD_CY + 6}, 240 ${HEAD_CY + 5}, 238 ${HEAD_CY + 2} Z`} fill="none" stroke={SKIN_DARK} strokeWidth={1.2} opacity={0.6} />
                    <circle cx={224 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={9.5} fill="#5A3A22" />
                    <circle cx={224 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={9.5} fill="none" stroke="#2A160B" strokeWidth={2.2} />
                    <circle cx={224 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={6.4} fill="none" stroke="#3B2717" strokeWidth={1.2} opacity={0.8} />
                    <circle cx={224 + rig.gazeX * 4} cy={HEAD_CY + 2 + rig.gazeY * 3} r={5.4 * rig.pupil} fill="#050302" />
                    <circle cx={224 + rig.gazeX * 4 + 2.4} cy={HEAD_CY - 1 + rig.gazeY * 3} r={1.9} fill="#FFFFFF" opacity={0.95} />
                    {rig.redGleam > 0.05 ? (
                      <circle cx={224 + rig.gazeX * 4 - 2} cy={HEAD_CY + 4 + rig.gazeY * 3} r={1.5} fill="#DC2626" opacity={0.9 * rig.redGleam} />
                    ) : null}
                    <path d={`M 209 ${HEAD_CY + 2} C 211 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 12}, 217 ${HEAD_CY - 4 + (1 - rig.lidOpen) * 14}, 225 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 14} C 233 ${HEAD_CY - 4 + (1 - rig.lidOpen) * 14}, 239 ${HEAD_CY - 2 + (1 - rig.lidOpen) * 12}, 240 ${HEAD_CY + 2} C 231 ${HEAD_CY - 1}, 219 ${HEAD_CY - 1}, 209 ${HEAD_CY + 2} Z`} fill={SKIN} opacity={rig.lidOpen < 0.9 ? 1 : 0} />
                    <path d={`M 211 ${HEAD_CY + 9} C 218 ${HEAD_CY + 11}, 230 ${HEAD_CY + 11}, 237 ${HEAD_CY + 9}`} fill="none" stroke={SKIN_SHADOW} strokeWidth={2.2} opacity={0.7} />
                  </g>

                  {/* Nariz */}
                  <path d={`M 200 ${HEAD_CY + 14} C 197 ${HEAD_CY + 22}, 197 ${HEAD_CY + 30}, 201 ${HEAD_CY + 36} C 203 ${HEAD_CY + 33}, 204 ${HEAD_CY + 26}, 202 ${HEAD_CY + 20} Z`} fill={SKIN_DARK} />
                  <path d={`M 195 ${HEAD_CY + 36} C 196 ${HEAD_CY + 40}, 198 ${HEAD_CY + 42}, 200 ${HEAD_CY + 42}`} fill="none" stroke={SKIN_SHADOW} strokeWidth={1.6} opacity={0.7} />
                  <path d={`M 205 ${HEAD_CY + 36} C 204 ${HEAD_CY + 40}, 202 ${HEAD_CY + 42}, 200 ${HEAD_CY + 42}`} fill="none" stroke={SKIN_SHADOW} strokeWidth={1.6} opacity={0.7} />

                  {/* Boca con interior anatómico */}
                  <g transform={`translate(200 ${HEAD_CY + 54})`}>
                    {(() => {
                      const mw = 26 * rig.mouthWidth;
                      const mo = 16 * rig.mouthOpen;
                      const curve = rig.smile * 6;
                      return (
                        <g>
                          {/* Interior oscuro */}
                          <path d={`M ${-mw} 0 C ${-mw * 0.6} ${mo}, ${mw * 0.6} ${mo}, ${mw} 0 C ${mw * 0.6} ${mo * 0.4}, ${-mw * 0.6} ${mo * 0.4}, ${-mw} 0 Z`} fill="#3A0B0B" opacity={rig.mouthOpen > 0.2 ? 1 : 0.6} />
                          {/* Dientes superiores */}
                          <path d={`M ${-mw * 0.7} ${Math.max(1, mo * 0.35)} L ${mw * 0.7} ${Math.max(1, mo * 0.35)} L ${mw * 0.55} ${Math.max(3, mo * 0.5)} L ${-mw * 0.55} ${Math.max(3, mo * 0.5)} Z`} fill="#F5F1E8" opacity={rig.mouthOpen > 0.25 ? 1 : 0} />
                          {/* Dientes inferiores */}
                          <path d={`M ${-mw * 0.6} ${Math.max(4, mo * 0.6)} L ${mw * 0.6} ${Math.max(4, mo * 0.6)} L ${mw * 0.5} ${Math.max(7, mo * 0.75)} L ${-mw * 0.5} ${Math.max(7, mo * 0.75)} Z`} fill="#EDE7DA" opacity={rig.mouthOpen > 0.4 ? 1 : 0} />
                          {/* Lengua */}
                          <path d={`M ${-mw * 0.4} ${mo * 0.7} C ${-mw * 0.3} ${mo * 1.1}, ${mw * 0.3} ${mo * 1.1}, ${mw * 0.4} ${mo * 0.7} C 0 ${mo * 0.95}, 0 ${mo * 0.9}, ${-mw * 0.4} ${mo * 0.7} Z`} fill="#C25A5A" opacity={rig.mouthOpen > 0.35 ? 0.95 : 0} />
                          {/* Labio superior */}
                          <path d={`M ${-mw} 0 C ${-mw * 0.55} ${-2 - curve}, ${mw * 0.55} ${-2 - curve}, ${mw} 0 C ${mw * 0.5} ${2 - curve}, ${-mw * 0.5} ${2 - curve}, ${-mw} 0 Z`} fill={lipUpper} />
                          {/* Labio inferior */}
                          <path d={`M ${-mw * 0.9} 0 C ${-mw * 0.55} ${3 + curve + mo * 0.5}, ${mw * 0.55} ${3 + curve + mo * 0.5}, ${mw * 0.9} 0 C ${mw * 0.5} ${1 + curve}, ${-mw * 0.5} ${1 + curve}, ${-mw * 0.9} 0 Z`} fill={lipLower} />
                        </g>
                      );
                    })()}
                  </g>

                  {/* Gotas de sudor frío (sweatDrops) */}
                  {rig.sweat > 0.15 ? (
                    <g opacity={rig.sweat}>
                      <path d={`M 152 ${HEAD_CY - 16} C 151 ${HEAD_CY - 10}, 153 ${HEAD_CY - 4}, 157 ${HEAD_CY - 3} C 159 ${HEAD_CY - 4}, 160 ${HEAD_CY - 7}, 159 ${HEAD_CY - 10} C 157 ${HEAD_CY - 14}, 154 ${HEAD_CY - 16}, 152 ${HEAD_CY - 16} Z`} fill="#BFE3F2" />
                      <path d={`M 246 ${HEAD_CY - 12} C 244 ${HEAD_CY - 4}, 247 ${HEAD_CY + 2}, 251 ${HEAD_CY + 3} C 253 ${HEAD_CY + 1}, 254 ${HEAD_CY - 3}, 252 ${HEAD_CY - 7} C 249 ${HEAD_CY - 11}, 247 ${HEAD_CY - 13}, 246 ${HEAD_CY - 12} Z`} fill="#BFE3F2" />
                      <path d={`M 160 ${HEAD_CY + 26} C 159 ${HEAD_CY + 32}, 161 ${HEAD_CY + 38}, 165 ${HEAD_CY + 39} C 167 ${HEAD_CY + 38}, 168 ${HEAD_CY + 35}, 167 ${HEAD_CY + 32} C 165 ${HEAD_CY + 28}, 162 ${HEAD_CY + 26}, 160 ${HEAD_CY + 26} Z`} fill="#BFE3F2" />
                    </g>
                  ) : null}

                  {/* Reflejo de contorno en cabello (rim) */}
                  <path d={`M 150 ${HEAD_CY - 60} C 146 ${HEAD_CY - 34}, 148 ${HEAD_CY - 8}, 158 ${HEAD_CY + 10}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.4 * rimStrength} />
                  <path d={`M 250 ${HEAD_CY - 60} C 254 ${HEAD_CY - 34}, 252 ${HEAD_CY - 8}, 242 ${HEAD_CY + 10}`} fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.4 * rimStrength} />
                </g>
              </g>

              {/* Brazo frontal: brazo derecho (front arm) */}
              {showFrontArm ? (
                <IKArm
                  shoulder={shoulderR}
                  target={targetR}
                  L1={L1}
                  L2={L2}
                  bendDir={-1}
                  sleeve={sleeve}
                  sleeveDark={sleeveDark}
                  rimColor={rimColor}
                  rimStrength={rimStrength}
                  glove={GLOVE}
                  gloveDark={GLOVE_DARK}
                />
              ) : null}
            </g>
          ) : null}

          {/* Solo el brazo frontal (renderLayer = front_arm_only) */}
          {!showBody && showFrontArm ? (
            <IKArm
              shoulder={shoulderR}
              target={targetR}
              L1={L1}
              L2={L2}
              bendDir={-1}
              sleeve={sleeve}
              sleeveDark={sleeveDark}
              rimColor={rimColor}
              rimStrength={rimStrength}
              glove={GLOVE}
              gloveDark={GLOVE_DARK}
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
};
