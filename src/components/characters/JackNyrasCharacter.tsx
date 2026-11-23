import React from "react";
import { FloorShadow, Point2D, solveTwoBoneIK } from "./ikMath";

/**
 * JackNyrasCharacter — Jack Nyras, el joven que se convertiría en Eyeless Jack.
 *
 * Cabello castaño despeinado de cobertura completa en 3 capas (hairBack /
 * hairCrown / hairFront) que cubre el 35-40% del cráneo de sien a sien. Tres
 * variantes ricas en <path>: chaqueta universitaria, abrigo militar de la SGM
 * (con casco M1 y mechones asomando) y sudadera juvenil con sombra médica.
 *
 * Soporta la formación progresiva de la máscara azul (Escena 3), la caída de
 * alquitrán negro en sus cuencas y un modo reflejo traslúcido (Escena 5).
 */

export type JackNyrasVariant = "university_victim" | "ww2_soldier" | "surgeon_brother";

export type JackNyrasPose =
  | "standing_agony"
  | "altar_bound"
  | "gas_stagger"
  | "reflection_reach"
  | "split_portrait";

export interface JackNyrasCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  facing?: 1 | -1;
  variant: JackNyrasVariant;
  pose?: JackNyrasPose;
  localFrame: number;
  maskFormationProgress?: number;
  tarCoverProgress?: number;
  reflectionMode?: boolean;
  /** Objetivo opcional del brazo en pose "reflection_reach" (Escena 5). */
  reflectionReach?: Point2D;
  showFloorShadow?: boolean;
}

// ---- Paleta -------------------------------------------------------------
const SKIN = "#E2B98F";
const SKIN_SHADE = "#C69966";
const SKIN_DARK = "#9C7448";
const HAIR = "#3A2A1D";
const HAIR_MID = "#4E3826";
const HAIR_LIGHT = "#6E5136";
const HAIR_RIM = "#7C93A8";

const MASK = "#1D4ED8";
const MASK_DARK = "#1E3A8A";
const MASK_DEEP = "#172554";
const MASK_RIM = "#60A5FA";
const CRACK = "#060A14";
const TAR = "#04050A";
const TAR_LIGHT = "#141A24";

const SHOULDER_L: Point2D = { x: 106, y: 310 };
const SHOULDER_R: Point2D = { x: 214, y: 310 };
const ARM_L1 = 62;
const ARM_L2 = 58;

const rad = (deg: number): number => (deg * Math.PI) / 180;

const VARIANT_COLORS = {
  university_victim: { sleeve: "#2F3E5C", shade: "#1E2A40", light: "#41506F", shirt: "#C9CDD2" },
  ww2_soldier: { sleeve: "#5A6640", shade: "#40492C", light: "#6E7B4C", shirt: "#8E9676" },
  surgeon_brother: { sleeve: "#33414E", shade: "#232E38", light: "#46545F", shirt: "#B8C2C8" },
} as const;

type VariantColors = (typeof VARIANT_COLORS)[JackNyrasVariant];

/**
 * NyrasArm — brazo de dos segmentos con manga según variante y mano de piel.
 */
const NyrasArm: React.FC<{
  shoulder: Point2D;
  upperDeg: number;
  lowerDeg: number;
  c: VariantColors;
}> = ({ shoulder, upperDeg, lowerDeg, c }) => {
  const u = rad(upperDeg);
  const elbow = {
    x: shoulder.x + Math.cos(u) * ARM_L1,
    y: shoulder.y + Math.sin(u) * ARM_L1,
  };
  const f = rad(upperDeg + lowerDeg);
  const wrist = {
    x: elbow.x + Math.cos(f) * ARM_L2,
    y: elbow.y + Math.sin(f) * ARM_L2,
  };

  return (
    <g>
      {/* Hombro redondeado (volumen anatómico) */}
      <circle cx={shoulder.x} cy={shoulder.y} r={11} fill={c.sleeve} />
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upperDeg})`}>
        <path d="M 0 -11 C 18 -12, 44 -10.5, 62 -8 L 62 8 C 44 10.5, 18 12, 0 11 Z" fill={c.sleeve} />
        <path d="M 4 -7 C 22 -8, 46 -7, 59 -5.5 L 59 -1.5 C 42 -2, 20 -1.5, 4 -1.5 Z" fill={c.light} opacity={0.5} />
        <path d="M 6 5.5 C 24 6.5, 46 6, 59 5 L 59 8 C 44 9, 20 9, 6 8 Z" fill={c.shade} opacity={0.6} />
        <path d="M 46 -7 C 50 -3, 52 2, 52 7 C 48 4, 46 0, 46 -7 Z" fill={c.shade} />
      </g>
      <g transform={`translate(${elbow.x} ${elbow.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -9 C 16 -9.5, 38 -8.5, 58 -6 L 58 6 C 38 8.5, 16 9.5, 0 9 Z" fill={c.sleeve} />
        <path d="M 3 -6 C 16 -6.5, 38 -6, 55 -4.5 L 55 -1 C 38 -1.5, 16 -1.5, 3 -1.5 Z" fill={c.light} opacity={0.5} />
        <path d="M 4 4.5 C 18 5.5, 38 5, 55 4 L 55 6.5 C 38 7.5, 18 7.5, 4 7 Z" fill={c.shade} opacity={0.6} />
        <path d="M 50 -6 L 58 -5 L 58 5 L 50 6 C 50 2, 50 -2, 50 -6 Z" fill={c.shade} />
      </g>
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -6 C 7 -7, 15 -6.5, 19 -4.5 L 19 5 C 14 7.5, 7 7.5, 0 6 Z" fill={SKIN} />
        <path d="M 7 -5.5 C 10 -1, 12 2, 14 5.5" stroke={SKIN_SHADE} strokeWidth={1} fill="none" />
        <path d="M 13 -5 C 15 -1, 16 2, 17 4.5" stroke={SKIN_SHADE} strokeWidth={1} fill="none" />
      </g>
    </g>
  );
};

export const JackNyrasCharacter: React.FC<JackNyrasCharacterProps> = (props) => {
  const {
    x,
    floorY,
    scale = 1,
    facing = 1,
    variant,
    pose = "standing_agony",
    localFrame,
    maskFormationProgress = 0,
    tarCoverProgress = 0,
    reflectionMode = false,
    reflectionReach,
    showFloorShadow = true,
  } = props;

  const t = localFrame;
  const c = VARIANT_COLORS[variant];

  const breathe = 1 + Math.sin(t * 0.08) * 0.014;
  const blink = Math.pow(Math.max(0, Math.sin(t * 0.1 + 0.7)), 10);

  // ---- Estado por pose ---------------------------------------------------
  let torsoLean = 0;
  let headTilt = 0;
  let leftArmU = 94;
  let leftArmL = 18;
  let rightArmU = 94;
  let rightArmL = 18;
  let leftHipD = 0;
  let rightHipD = 0;
  let mouthOpen = 0.5;
  let browAgony = 0.6;

  if (pose === "standing_agony") {
    headTilt = -10 + Math.sin(t * 0.5) * 2;
    torsoLean = -4;
    leftArmU = -76;
    leftArmL = 52;
    rightArmU = -64;
    rightArmL = 48;
    mouthOpen = 1;
    browAgony = 1;
  } else if (pose === "altar_bound") {
    torsoLean = -38;
    headTilt = -18;
    // Muñecas juntas por encima de la cabeza.
    const bound = { x: 160, y: 140 };
    const l = solveTwoBoneIK(SHOULDER_L, bound, ARM_L1, ARM_L2, -1);
    leftArmU = l.upperAngleDeg;
    leftArmL = l.lowerAngleDeg;
    const r = solveTwoBoneIK(SHOULDER_R, bound, ARM_L1, ARM_L2, 1);
    rightArmU = r.upperAngleDeg;
    rightArmL = r.lowerAngleDeg;
    mouthOpen = 1;
    browAgony = 1;
  } else if (pose === "gas_stagger") {
    torsoLean = 18;
    headTilt = 6 + Math.sin(t * 0.35) * 2;
    // Brazo derecho extendido hacia delante.
    const reach = { x: 260, y: 340 };
    const r = solveTwoBoneIK(SHOULDER_R, reach, ARM_L1, ARM_L2, 1);
    rightArmU = r.upperAngleDeg;
    rightArmL = r.lowerAngleDeg;
    leftArmU = 108;
    leftArmL = 26;
    leftHipD = 10;
    mouthOpen = 0.7;
    browAgony = 0.7;
  } else if (pose === "reflection_reach") {
    torsoLean = 6;
    headTilt = -4;
    const reach = reflectionReach ?? { x: 262, y: 252 };
    const r = solveTwoBoneIK(SHOULDER_R, reach, ARM_L1, ARM_L2, 1);
    rightArmU = r.upperAngleDeg;
    rightArmL = r.lowerAngleDeg;
    leftArmU = 102;
    leftArmL = 22;
    mouthOpen = 0.4;
    browAgony = 0.5;
  } else {
    // split_portrait
    torsoLean = 0;
    headTilt = 0;
    leftArmU = 96;
    leftArmL = 14;
    rightArmU = 96;
    rightArmL = 14;
    mouthOpen = 0.2;
    browAgony = 0.35;
  }

  const maskP = Math.max(0, Math.min(1, maskFormationProgress));
  const tarP = Math.max(0, Math.min(1, tarCoverProgress));

  // Pose "altar_bound": Jack Nyras reclinado horizontalmente de espaldas sobre
  // la losa de piedra, con cuerpo/brazos/piernas atados con cuerdas, cabeza
  // echada hacia atrás y rostro mirando hacia arriba mientras el alquitrán cae
  // sobre sus ojos y la máscara azul se forma. CERO flotación en el aire.
  if (pose === "altar_bound") {
    return (
      <div
        style={{
          position: "absolute",
          left: x - 160,
          top: floorY - 640,
          width: 320,
          height: 640,
        }}
      >
        <svg
          viewBox="0 0 320 640"
          width={320}
          height={640}
          style={{
            display: "block",
            overflow: "visible",
            transformOrigin: "160px 640px",
            transform: `scale(${scale * facing}, ${scale})`,
          }}
        >
          <defs>
            <linearGradient id="jn-skin" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor={SKIN} />
              <stop offset="80%" stopColor={SKIN_SHADE} />
              <stop offset="100%" stopColor={SKIN_DARK} />
            </linearGradient>
            <linearGradient id="jn-hair" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor={HAIR_LIGHT} />
              <stop offset="45%" stopColor={HAIR_MID} />
              <stop offset="100%" stopColor={HAIR} />
            </linearGradient>
            <linearGradient id="jn-mask" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor={MASK} />
              <stop offset="50%" stopColor={MASK_DARK} />
              <stop offset="100%" stopColor={MASK_DEEP} />
            </linearGradient>
            <linearGradient id="jn-tar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TAR_LIGHT} />
              <stop offset="100%" stopColor={TAR} />
            </linearGradient>
          </defs>
          {showFloorShadow ? (
            <FloorShadow cx={160} floorY={640} rx={140} ry={16} opacity={0.5} />
          ) : null}
          <AltarBoundFigure
            variant={variant}
            localFrame={localFrame}
            maskP={maskP}
            tarP={tarP}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x - 160,
        top: floorY - 640,
        width: 320,
        height: 640,
      }}
    >
      <svg
        viewBox="0 0 320 640"
        width={320}
        height={640}
        style={{
          display: "block",
          overflow: "visible",
          transformOrigin: "160px 640px",
          transform: `scale(${scale * facing}, ${scale})`,
        }}
      >
        <defs>
          <linearGradient id="jn-skin" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor={SKIN} />
            <stop offset="80%" stopColor={SKIN_SHADE} />
            <stop offset="100%" stopColor={SKIN_DARK} />
          </linearGradient>
          <linearGradient id="jn-hair" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor={HAIR_LIGHT} />
            <stop offset="45%" stopColor={HAIR_MID} />
            <stop offset="100%" stopColor={HAIR} />
          </linearGradient>
          <linearGradient id="jn-mask" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor={MASK} />
            <stop offset="50%" stopColor={MASK_DARK} />
            <stop offset="100%" stopColor={MASK_DEEP} />
          </linearGradient>
          <linearGradient id="jn-tar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TAR_LIGHT} />
            <stop offset="100%" stopColor={TAR} />
          </linearGradient>
        </defs>

        {showFloorShadow ? <FloorShadow cx={160} floorY={640} rx={64} opacity={0.5} /> : null}

        {/* Piernas */}
        <g>
          <g transform={`translate(140 448) rotate(${90 + leftHipD})`}>
            <path d="M -10 0 C -11 24, -11 48, -9 72 L 9 72 C 11 48, 11 24, 10 0 Z" fill={c.shade} />
            <path d="M -10 0 C -9 20, -9 40, -8 60 L -3 60 C -4 40, -4 20, -5 0 Z" fill="#161a20" opacity={0.4} />
          </g>
          <g transform={`translate(180 448) rotate(${90 + rightHipD})`}>
            <path d="M -10 0 C -11 24, -11 48, -9 72 L 9 72 C 11 48, 11 24, 10 0 Z" fill={c.shade} />
            <path d="M -10 0 C -9 20, -9 40, -8 60 L -3 60 C -4 40, -4 20, -5 0 Z" fill="#161a20" opacity={0.4} />
          </g>
          {/* Pies */}
          <path d="M 124 606 C 120 626, 120 636, 122 640 L 158 640 C 162 636, 162 624, 158 608 C 148 602, 132 602, 124 606 Z" fill="#23282F" />
          <path d="M 162 606 C 158 626, 158 636, 160 640 L 196 640 C 200 636, 200 624, 196 608 C 186 602, 170 602, 162 606 Z" fill="#23282F" />
        </g>

        {/* Cuerpo */}
        <g transform={`translate(0 ${0})`}>
          {/* Brazo trasero (izquierdo) */}
          <NyrasArm shoulder={SHOULDER_L} upperDeg={leftArmU} lowerDeg={leftArmL} c={c} />

          {/* Torso + ropa según variante */}
          <g transform={`translate(160 360) scale(${breathe}) translate(-160 -360) rotate(${torsoLean} 160 360)`}>
            {/* Camiseta arrugada base */}
            <path d="M 122 296 C 106 300, 100 312, 100 330 C 98 366, 106 402, 122 430 L 198 430 C 214 402, 222 366, 220 330 C 220 312, 214 300, 198 296 C 180 290, 140 290, 122 296 Z" fill={c.shirt} />
            {/* Arrugas de la camiseta */}
            <path d="M 128 320 C 132 344, 136 368, 140 392" stroke={c.shade} strokeWidth={1.4} fill="none" opacity={0.5} />
            <path d="M 192 320 C 188 344, 184 368, 180 392" stroke={c.shade} strokeWidth={1.4} fill="none" opacity={0.5} />
            <path d="M 160 316 C 160 340, 160 364, 160 388" stroke={c.shade} strokeWidth={1.1} fill="none" opacity={0.4} />

            {variant === "university_victim" ? (
              <g>
                {/* Chaqueta universitaria con solapas */}
                <path d="M 114 300 C 98 306, 92 320, 92 340 C 90 380, 98 414, 114 432 L 160 432 L 160 300 C 144 294, 128 294, 114 300 Z" fill={c.sleeve} />
                <path d="M 206 300 C 222 306, 228 320, 228 340 C 230 380, 222 414, 206 432 L 160 432 L 160 300 C 176 294, 192 294, 206 300 Z" fill={c.sleeve} />
                {/* Solapas */}
                <path d="M 122 304 C 128 330, 136 356, 146 382 L 160 382 L 160 304 Z" fill={c.shade} />
                <path d="M 198 304 C 192 330, 184 356, 174 382 L 160 382 L 160 304 Z" fill={c.shade} />
                {/* Botones */}
                <circle cx={160} cy={318} r={2.2} fill={c.shade} />
                <circle cx={160} cy={342} r={2.2} fill={c.shade} />
                <circle cx={160} cy={366} r={2.2} fill={c.shade} />
                {/* Costuras */}
                <path d="M 114 300 C 120 310, 124 318, 128 328" stroke={c.shade} strokeWidth={1.4} fill="none" />
                <path d="M 206 300 C 200 310, 196 318, 192 328" stroke={c.shade} strokeWidth={1.4} fill="none" />
              </g>
            ) : variant === "ww2_soldier" ? (
              <g>
                {/* Abrigo militar verde oliva */}
                <path d="M 114 300 C 96 306, 90 320, 90 342 C 88 382, 96 416, 114 434 L 206 434 C 224 416, 232 382, 230 342 C 230 320, 224 306, 206 300 C 180 292, 140 292, 114 300 Z" fill={c.sleeve} />
                <path d="M 114 300 C 118 340, 122 380, 128 434 L 140 434 C 136 380, 134 340, 132 300 Z" fill={c.shade} opacity={0.7} />
                <path d="M 206 300 C 202 340, 198 380, 192 434 L 180 434 C 184 380, 186 340, 188 300 Z" fill={c.shade} opacity={0.7} />
                {/* Cuello */}
                <path d="M 132 296 C 136 284, 184 284, 188 296 C 186 306, 182 314, 160 318 C 138 314, 134 306, 132 296 Z" fill={c.shade} />
                {/* Botones */}
                <circle cx={160} cy={316} r={2.4} fill="#2A2F1C" />
                <circle cx={160} cy={340} r={2.4} fill="#2A2F1C" />
                <circle cx={160} cy={364} r={2.4} fill="#2A2F1C" />
                <circle cx={160} cy={388} r={2.4} fill="#2A2F1C" />
                {/* Correas */}
                <path d="M 118 352 L 202 352" stroke={c.shade} strokeWidth={4} fill="none" />
                <path d="M 118 352 L 202 352" stroke="#2A2F1C" strokeWidth={1.4} fill="none" />
              </g>
            ) : (
              <g>
                {/* Sudadera juvenil con sombra médica */}
                <path d="M 114 300 C 98 306, 92 320, 92 340 C 90 380, 98 414, 114 432 L 206 432 C 222 414, 230 380, 228 340 C 228 320, 222 306, 206 300 C 180 292, 140 292, 114 300 Z" fill={c.sleeve} />
                <path d="M 206 300 C 220 306, 226 320, 226 340 C 226 384, 216 418, 206 432 C 214 412, 218 362, 214 324 C 212 314, 210 306, 206 300 Z" fill={c.shade} opacity={0.7} />
                <path d="M 114 300 C 100 306, 94 320, 94 340 C 94 384, 104 418, 114 432 C 106 412, 102 362, 106 324 C 108 314, 110 306, 114 300 Z" fill={c.light} opacity={0.4} />
                {/* Sombra médica (tinte quirúrgico) */}
                <path d="M 96 356 C 96 380, 102 402, 112 420 C 104 396, 100 374, 100 356 Z" fill="#3E5A52" opacity={0.5} />
                {/* Cuello y cordones */}
                <path d="M 140 296 C 144 288, 176 288, 180 296 C 182 304, 178 310, 160 312 C 146 310, 140 304, 140 296 Z" fill={c.shade} />
                <path d="M 150 300 L 148 312" stroke={c.shade} strokeWidth={1.6} />
                <path d="M 170 300 L 172 312" stroke={c.shade} strokeWidth={1.6} />
              </g>
            )}
          </g>

          {/* ---- Cabeza y rostro ---- */}
          <g transform={`rotate(${headTilt} 160 250)`}>
            {/* hairBack: masa capilar trasera corta, acotada a la nuca y detrás de las orejas */}
            <path d="M 112 146 C 106 198, 110 234, 122 252 L 198 252 C 210 234, 214 198, 208 146 C 206 118, 114 118, 112 146 Z" fill="url(#jn-hair)" />
            {/* Nuca (corte limpio, sin envolver cuello ni mentón) */}
            <path d="M 130 250 C 142 258, 178 258, 190 250 C 182 256, 174 259, 160 259 C 146 259, 138 256, 130 250 Z" fill={HAIR} />
            {/* Patillas laterales (delante de las orejas, sin bajar del mentón) */}
            <path d="M 116 184 C 112 202, 112 218, 118 232 C 114 218, 114 200, 118 184 Z" fill={HAIR} />
            <path d="M 204 184 C 208 202, 208 218, 202 232 C 206 218, 206 200, 202 184 Z" fill={HAIR} />

            {/* Cuello */}
            <path d="M 140 248 C 142 262, 142 276, 140 292 L 180 292 C 178 276, 178 262, 180 248 C 170 252, 150 252, 140 248 Z" fill="url(#jn-skin)" />
            <path d="M 146 268 C 150 276, 152 284, 152 292" stroke={SKIN_SHADE} strokeWidth={1.4} fill="none" opacity={0.6} />

            {/* Orejas */}
            <path d="M 116 190 C 110 188, 106 192, 106 200 C 106 210, 112 214, 118 212 C 120 204, 120 196, 116 190 Z" fill="url(#jn-skin)" />
            <path d="M 204 190 C 210 188, 214 192, 214 200 C 214 210, 208 214, 202 212 C 200 204, 200 196, 204 190 Z" fill="url(#jn-skin)" />

            {/* Cráneo */}
            <ellipse cx={160} cy={190} rx={46} ry={58} fill="url(#jn-skin)" />
            <path d="M 120 168 C 128 152, 192 152, 200 168 C 196 178, 124 178, 120 168 Z" fill={SKIN} opacity={0.7} />

            {/* Cejas en agonía (fruncidas) */}
            <g transform={`rotate(${browAgony * 10} 138 168)`}>
              <path d="M 126 170 C 134 166, 146 166, 152 171 C 146 169, 134 169, 126 170 Z" fill={HAIR} />
            </g>
            <g transform={`rotate(${-browAgony * 10} 182 168)`}>
              <path d="M 168 171 C 174 166, 186 166, 194 170 C 186 169, 174 169, 168 171 Z" fill={HAIR} />
            </g>

            {/* Ojos */}
            <ellipse cx={138} cy={190} rx={14} ry={mouthOpen > 0.6 ? 10 : 8} fill="#FFFFFF" />
            <ellipse cx={182} cy={190} rx={14} ry={mouthOpen > 0.6 ? 10 : 8} fill="#FFFFFF" />
            <g opacity={blink > 0.5 ? 0 : 1}>
              <circle cx={138} cy={190} r={7} fill="#5A6A52" />
              <circle cx={182} cy={190} r={7} fill="#5A6A52" />
              <circle cx={138} cy={190} r={3.6} fill="#080807" />
              <circle cx={182} cy={190} r={3.6} fill="#080807" />
              <circle cx={134.5} cy={186.5} r={2} fill="#FFFFFF" opacity={0.95} />
              <circle cx={178.5} cy={186.5} r={2} fill="#FFFFFF" opacity={0.95} />
            </g>
            <g opacity={blink}>
              <path d="M 124 190 C 130 182, 146 182, 152 190 C 146 188, 130 188, 124 190 Z" fill={SKIN_SHADE} />
              <path d="M 168 190 C 174 182, 190 182, 196 190 C 190 188, 174 188, 168 190 Z" fill={SKIN_SHADE} />
            </g>
            <path d="M 123 184 C 132 177, 144 177, 153 184" stroke={SKIN_DARK} strokeWidth={1.4} fill="none" opacity={0.55} />
            <path d="M 167 184 C 176 177, 188 177, 197 184" stroke={SKIN_DARK} strokeWidth={1.4} fill="none" opacity={0.55} />

            {/* Nariz */}
            <path d="M 160 192 C 158 206, 157 216, 158 224 C 160 226, 162 226, 163 224 C 164 216, 163 206, 161 194 Z" fill={SKIN_SHADE} />
            <path d="M 156 226 C 158 230, 162 230, 164 226" stroke={SKIN_DARK} strokeWidth={1.2} fill="none" opacity={0.6} />

            {/* Boca (agónica) */}
            <g transform={`translate(0 ${mouthOpen * 1.5})`}>
              {mouthOpen > 0.4 ? (
                <path d="M 150 240 C 154 233, 166 233, 170 240 C 166 251, 154 251, 150 240 Z" fill="#3A1214" />
              ) : (
                <path d="M 150 240 C 156 238, 164 238, 170 240 C 164 243, 156 243, 150 240 Z" fill="#5A2A28" />
              )}
            </g>
            <path d="M 150 240 C 156 237, 164 237, 170 240" stroke="#7A4038" strokeWidth={1.4} fill="none" />

            {/* hairCrown + hairFront (cabello masculino universitario despeinado, terminando JUSTO ENCIMA de las cejas) */}
            <path d="M 116 156 C 118 122, 202 122, 204 156 C 206 162, 200 166, 160 168 C 120 166, 114 162, 116 156 Z" fill="url(#jn-hair)" />
            <path d="M 122 148 C 130 128, 190 128, 198 148 C 194 136, 186 128, 160 128 C 136 128, 126 136, 122 148 Z" fill={HAIR_LIGHT} opacity={0.5} />
            {/* Mechones despeinados */}
            <path d="M 118 158 C 120 146, 130 140, 142 138 C 134 146, 131 154, 132 162 C 128 162, 122 162, 118 158 Z" fill={HAIR} />
            <path d="M 132 138 C 140 130, 152 128, 162 130 C 152 138, 144 146, 141 156 C 134 150, 132 144, 132 138 Z" fill={HAIR_MID} />
            <path d="M 158 130 C 166 128, 178 130, 186 136 C 176 142, 168 148, 163 156 C 157 148, 157 138, 158 130 Z" fill={HAIR} />
            <path d="M 184 138 C 192 144, 198 154, 198 160 C 192 156, 186 152, 182 147 C 180 143, 180 140, 184 138 Z" fill={HAIR_MID} />
            <path d="M 128 150 C 124 158, 123 166, 124 172 C 121 164, 121 156, 128 150 Z" fill={HAIR} />
            <path d="M 192 152 C 196 160, 197 166, 196 172 C 199 164, 199 158, 192 152 Z" fill={HAIR} />
            <path d="M 120 168 C 116 180, 115 192, 118 202 C 115 190, 116 178, 120 168 Z" fill={HAIR_MID} />
            <path d="M 200 168 C 204 180, 205 192, 202 202 C 205 190, 204 178, 200 168 Z" fill={HAIR_MID} />
            <path d="M 122 150 C 126 130, 148 122, 170 122" stroke={HAIR_RIM} strokeWidth={2} fill="none" opacity={0.45} />

            {/* Casco M1 (solo ww2_soldier) */}
            {variant === "ww2_soldier" ? (
              <g>
                <path d="M 112 168 C 112 128, 208 128, 208 168 C 210 180, 210 188, 206 192 L 114 192 C 110 188, 110 180, 112 168 Z" fill="#4A5338" />
                <path d="M 112 168 C 112 134, 208 134, 208 168 C 206 150, 196 140, 160 140 C 126 140, 114 150, 112 168 Z" fill="#333B26" />
                <path d="M 114 190 C 114 196, 116 202, 122 206 C 116 202, 112 196, 112 192 Z" fill="#333B26" />
                <path d="M 206 190 C 206 196, 204 202, 198 206 C 204 202, 208 196, 208 192 Z" fill="#333B26" />
                {/* Correa del casco */}
                <path d="M 116 196 C 122 226, 138 240, 160 240 C 182 240, 198 226, 204 196" stroke="#333B26" strokeWidth={2} fill="none" />
                {/* Mechones asomando por sienes/nuca */}
                <path d="M 114 196 C 112 206, 114 214, 120 220 C 116 212, 116 204, 118 198 Z" fill={HAIR} />
                <path d="M 206 196 C 208 206, 206 214, 200 220 C 204 212, 204 204, 202 198 Z" fill={HAIR} />
                <path d="M 150 240 C 152 248, 156 252, 160 252 C 164 252, 168 248, 170 240" fill={HAIR} opacity={0.8} />
              </g>
            ) : null}

            {/* Formación de la máscara azul (Escena 3) */}
            {maskP > 0 ? (
              <g opacity={maskP}>
                <path d="M 128 164 C 130 136, 190 136, 192 164 C 196 194, 194 218, 188 242 C 184 256, 136 256, 132 242 C 126 218, 124 194, 128 164 Z" fill="url(#jn-mask)" />
                <path d="M 190 164 C 194 190, 193 214, 188 240 C 192 216, 194 190, 192 166 Z" fill={MASK_DEEP} opacity={0.8} />
                <path d="M 130 164 C 128 140, 156 132, 172 132" stroke={MASK_RIM} strokeWidth={2} fill="none" opacity={0.55} />
                <path d="M 128 192 C 134 180, 152 180, 158 196 C 152 210, 134 210, 128 192 Z" fill="#020306" />
                <path d="M 162 192 C 168 180, 186 180, 192 196 C 186 210, 168 210, 162 192 Z" fill="#020306" />
                <path d="M 132 160 C 136 174, 136 188, 130 200" stroke={CRACK} strokeWidth={1.2} fill="none" />
                <path d="M 188 244 C 186 232, 188 220, 194 208" stroke={CRACK} strokeWidth={1.1} fill="none" />
                <path d="M 158 152 C 160 162, 158 172, 154 180" stroke={CRACK} strokeWidth={1} fill="none" opacity={0.8} />
              </g>
            ) : null}

            {/* Alquitrán negro cayendo en las cuencas */}
            {tarP > 0 ? (
              <g opacity={tarP}>
                <path d="M 130 196 C 128 210, 128 224, 134 240 C 138 250, 132 258, 128 266 C 132 260, 136 250, 136 240 C 138 226, 136 208, 134 196 Z" fill="url(#jn-tar)" />
                <path d="M 190 196 C 192 210, 192 224, 186 240 C 182 250, 188 258, 192 266 C 188 260, 184 250, 184 240 C 182 226, 184 208, 186 196 Z" fill="url(#jn-tar)" />
                <path d="M 134 202 C 133 216, 134 232, 138 246" stroke="#26303C" strokeWidth={1} fill="none" opacity={0.6} />
                <path d="M 186 202 C 187 216, 186 232, 182 246" stroke="#26303C" strokeWidth={1} fill="none" opacity={0.6} />
              </g>
            ) : null}

            {/* Luz de borde fría sobre el cráneo */}
            <ellipse cx={140} cy={164} rx={40} ry={40} fill="rgba(124,147,168,0.14)" />
          </g>
        </g>

        {/* Brazo frontal (derecho) */}
        <NyrasArm shoulder={SHOULDER_R} upperDeg={rightArmU} lowerDeg={rightArmL} c={c} />

        {/* Velado traslúcido de reflejo (Escena 5) */}
        {reflectionMode ? (
          <rect x={0} y={0} width={320} height={640} fill="#1D4ED8" opacity={0.16} />
        ) : null}
      </svg>
    </div>
  );
};

/**
 * AltarBoundFigure — Jack Nyras reclinado horizontalmente de espaldas sobre la
 * losa de piedra (floorY = y 640 local, superficie superior de la losa).
 * Cuerpo, brazos y piernas atados con cuerdas; cabeza echada hacia atrás con el
 * rostro mirando hacia arriba en horror mientras el alquitrán cae sobre sus
 * cuencas y la máscara azul cobalto se forma sobre su cara. CERO flotación.
 */
const AltarBoundFigure: React.FC<{
  variant: JackNyrasVariant;
  localFrame: number;
  maskP: number;
  tarP: number;
}> = ({ variant, localFrame, maskP, tarP }) => {
  const t = localFrame;
  const c = VARIANT_COLORS[variant];
  const tremble = Math.sin(t * 1.3) * 0.5;

  return (
    <g transform={`translate(0 ${tremble})`}>
      {/* ---- Piernas atadas (muslos + pantorrillas), de cadera a tobillos ---- */}
      <path
        d="M 200 612 C 232 606, 262 606, 294 610 L 294 630 C 262 634, 232 634, 200 632 Z"
        fill={c.shade}
      />
      {/* Rodilla flexionada */}
      <path
        d="M 240 612 C 248 616, 252 622, 252 630 C 244 624, 240 618, 240 612 Z"
        fill={c.shade}
        opacity={0.85}
      />
      {/* Pantorrillas (tono más oscuro) */}
      <path
        d="M 254 610 C 276 606, 290 608, 296 612 L 296 630 C 288 632, 274 632, 254 630 Z"
        fill="#161a20"
        opacity={0.7}
      />
      {/* Cuerda atando los tobillos */}
      <path
        d="M 286 606 C 291 612, 295 620, 293 628 C 299 618, 299 610, 295 604 Z"
        fill="#6E5A3A"
      />
      <path d="M 289 608 C 292 616, 292 624, 290 630" stroke="#4E3F28" strokeWidth={1.4} fill="none" />

      {/* ---- Torso (espalda/cadera) con chaqueta universitaria ---- */}
      <path
        d="M 88 604 C 116 598, 176 598, 202 604 L 202 634 C 176 640, 116 640, 88 634 Z"
        fill={c.sleeve}
      />
      {/* Sombra/pliegues del torso */}
      <path
        d="M 96 606 C 96 618, 98 628, 102 636 C 98 626, 96 616, 96 606 Z"
        fill={c.shade}
        opacity={0.6}
      />
      <path d="M 122 604 C 124 616, 124 628, 122 638" stroke={c.shade} strokeWidth={1.4} fill="none" opacity={0.5} />
      <path d="M 152 604 C 152 616, 152 628, 152 638" stroke={c.shade} strokeWidth={1.2} fill="none" opacity={0.45} />
      <path d="M 182 604 C 180 616, 180 628, 182 638" stroke={c.shade} strokeWidth={1.4} fill="none" opacity={0.5} />
      {/* Cuello de la chaqueta */}
      <path d="M 92 604 C 98 596, 108 594, 116 596 L 112 604 Z" fill={c.shade} />
      {/* Botones */}
      <circle cx={119} cy={610} r={2} fill={c.shade} />
      <circle cx={119} cy={620} r={2} fill={c.shade} />
      <circle cx={119} cy={630} r={2} fill={c.shade} />

      {/* Cuerda atando el pecho (espalda) */}
      <path d="M 130 600 C 134 612, 134 626, 130 636" stroke="#6E5A3A" strokeWidth={3} fill="none" />
      <path d="M 166 600 C 170 612, 170 626, 166 636" stroke="#6E5A3A" strokeWidth={3} fill="none" />
      <path d="M 130 604 L 166 604 M 130 632 L 166 632" stroke="#4E3F28" strokeWidth={1.6} />

      {/* ---- Brazos atados, cruzados sobre el pecho ---- */}
      <path
        d="M 96 610 C 116 606, 140 604, 158 608 L 158 620 C 140 618, 116 618, 96 620 Z"
        fill={c.sleeve}
      />
      <path d="M 96 610 C 116 606, 140 604, 158 608" stroke={c.light} strokeWidth={1.4} fill="none" opacity={0.5} />
      {/* Muñecas atadas juntas */}
      <path
        d="M 150 606 C 158 604, 166 606, 170 610 C 166 614, 158 616, 152 614 C 148 612, 148 608, 150 606 Z"
        fill={SKIN}
      />
      <path d="M 154 608 C 158 612, 160 616, 158 620" stroke="#6E5A3A" strokeWidth={2.4} fill="none" />

      {/* ---- Cuello ---- */}
      <path d="M 88 606 C 84 602, 80 600, 74 600 L 82 618 C 86 614, 88 610, 88 606 Z" fill={SKIN} />

      {/* ---- Cabeza echada hacia atrás, rostro mirando hacia arriba ---- */}
      <ellipse cx={58} cy={614} rx={28} ry={20} fill="url(#jn-skin)" />
      {/* Cabello masculino corto (parte posterior de la cabeza contra la losa) */}
      <path d="M 32 606 C 30 620, 36 632, 52 636 C 40 630, 34 620, 34 606 Z" fill={HAIR} />
      <path d="M 34 604 C 36 618, 42 628, 54 634 C 44 626, 40 616, 40 604 Z" fill={HAIR_MID} />

      {/* Ojos abiertos en horror (mirando hacia arriba) */}
      <ellipse cx={48} cy={602} rx={7} ry={5} fill="#FFFFFF" />
      <ellipse cx={70} cy={602} rx={7} ry={5} fill="#FFFFFF" />
      <circle cx={48} cy={602} r={3} fill="#5A6A52" />
      <circle cx={70} cy={602} r={3} fill="#5A6A52" />
      <circle cx={48} cy={602} r={1.4} fill="#080807" />
      <circle cx={70} cy={602} r={1.4} fill="#080807" />
      {/* Cejas fruncidas */}
      <path d="M 42 596 C 46 593, 52 593, 55 596" stroke={HAIR} strokeWidth={1.6} fill="none" />
      <path d="M 64 596 C 68 593, 74 593, 77 596" stroke={HAIR} strokeWidth={1.6} fill="none" />
      {/* Nariz */}
      <path
        d="M 59 604 C 58 610, 57 615, 58 619 C 60 621, 61 621, 62 619 C 63 615, 62 610, 60 604 Z"
        fill={SKIN_SHADE}
      />
      {/* Boca abierta en horror */}
      <path d="M 54 624 C 58 619, 64 619, 68 624 C 64 632, 58 632, 54 624 Z" fill="#3A1214" />

      {/* Máscara azul cobalto formándose sobre el rostro */}
      {maskP > 0 ? (
        <g opacity={maskP}>
          <path
            d="M 32 604 C 34 588, 82 588, 84 604 C 86 618, 82 630, 72 636 C 44 636, 30 618, 32 604 Z"
            fill="url(#jn-mask)"
          />
          <path d="M 48 602 C 46 597, 50 597, 50 602 C 50 607, 46 607, 48 602 Z" fill="#020306" />
          <path d="M 70 602 C 68 597, 72 597, 72 602 C 72 607, 68 607, 70 602 Z" fill="#020306" />
          <path d="M 36 608 C 40 602, 52 600, 60 604" stroke={MASK_RIM} strokeWidth={1.6} fill="none" opacity={0.7} />
          <path d="M 40 596 C 46 592, 56 590, 62 592" stroke={CRACK} strokeWidth={1} fill="none" />
        </g>
      ) : null}

      {/* Alquitrán negro cayendo en las cuencas */}
      {tarP > 0 ? (
        <g opacity={tarP}>
          <path
            d="M 44 604 C 42 612, 42 620, 46 630 C 48 636, 44 640, 40 640 C 42 636, 46 630, 46 620 C 48 614, 46 608, 44 604 Z"
            fill="url(#jn-tar)"
          />
          <path
            d="M 72 604 C 74 612, 74 620, 70 630 C 68 636, 72 640, 76 640 C 74 636, 70 630, 70 620 C 68 614, 70 608, 72 604 Z"
            fill="url(#jn-tar)"
          />
          <path d="M 45 610 C 44 618, 45 626, 48 634" stroke="#26303C" strokeWidth={1} fill="none" opacity={0.6} />
          <path d="M 73 610 C 74 618, 73 626, 70 634" stroke="#26303C" strokeWidth={1} fill="none" opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};
