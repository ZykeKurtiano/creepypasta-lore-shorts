import React from "react";
import { FloorShadow, Point2D, solveTwoBoneIK } from "./ikMath";

/**
 * CultistCharacter — Cultista del ritual de Chernobog.
 *
 * Túnica ritual negra con ribetes carmesí oscuro, capucha puntiaguda profunda
 * con sombras internas, cinturón de cuerda anudada y símbolos ocultistas
 * bordados. Brazos con 2-Bone IK sosteniendo el cáliz de hierro (frontArm
 * delante del cáliz) o la antorcha de madera con llama volumétrica animada.
 * En "pour_tar" vierte un chorro volumétrico de alquitrán hirviendo con ondas
 * de vapor cálido.
 */

export type CultistPose = "pour_tar" | "hold_torch" | "chant_circle";

export interface CultistCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  facing?: 1 | -1;
  pose: CultistPose;
  localFrame: number;
  pourProgress?: number;
  reachTarget?: Point2D;
  showFloorShadow?: boolean;
}

// ---- Paleta -------------------------------------------------------------
const ROBE = "#0E0B12";
const ROBE_LIGHT = "#1A1520";
const ROBE_DARK = "#07050A";
const TRIM = "#5C1318";
const TRIM_LIGHT = "#8A1F26";
const ROPE = "#6E5A3A";
const ROPE_SHADE = "#4E3F28";
const FACE_VOID = "#030204";
const EYE_GLOW = "#B4411E";
const CHALICE = "#2A2E36";
const CHALICE_LIGHT = "#4A505C";
const CHALICE_DARK = "#15181E";
const TAR = "#04050A";
const TAR_LIGHT = "#141A24";
const TAR_JET = "#05070B";
const TAR_CORE = "#020307";
const SPECULAR_BLUE = "#60A5FA";
const SPECULAR_SOFT = "#93C5FD";
const AMBER_REFLECT = "#F59E0B";
const VAPOR = "#CBD5E1";
const TORCH = "#5A4226";
const FLAME_OUTER = "#B4411E";
const FLAME = "#E8871E";
const FLAME_CORE = "#FFD36A";
const SKIN = "#C9A06A";
const SKIN_SHADE = "#A9824F";

const SHOULDER_L: Point2D = { x: 108, y: 300 };
const SHOULDER_R: Point2D = { x: 212, y: 300 };
const ARM_L1 = 68;
const ARM_L2 = 62;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * RobeArm — brazo con manga de túnica y mano de piel.
 */
const RobeArm: React.FC<{
  shoulder: Point2D;
  upperDeg: number;
  lowerDeg: number;
}> = ({ shoulder, upperDeg, lowerDeg }) => {
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
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upperDeg})`}>
        <path d="M 0 -11 C 18 -12, 42 -10, 60 -7 L 60 7 C 42 10, 18 12, 0 11 Z" fill={ROBE} />
        <path d="M 4 -7 C 20 -8, 40 -7, 56 -5 L 56 -1.5 C 38 -2, 18 -1.5, 4 -1.5 Z" fill={ROBE_LIGHT} opacity={0.5} />
        <path d="M 6 5 C 22 6, 40 5.5, 56 4.5 L 56 7.5 C 40 8.5, 20 8.5, 6 7.5 Z" fill={ROBE_DARK} opacity={0.7} />
        <path d="M 44 -7 C 48 -3, 50 2, 50 7 C 46 4, 44 0, 44 -7 Z" fill={ROBE_DARK} />
      </g>
      <g transform={`translate(${elbow.x} ${elbow.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -9 C 16 -9.5, 38 -8.5, 56 -6 L 56 6 C 38 8.5, 16 9.5, 0 9 Z" fill={ROBE} />
        <path d="M 4 -6 C 18 -6.5, 36 -6, 52 -4 L 52 -1 C 34 -1.5, 16 -1.5, 4 -1.5 Z" fill={ROBE_LIGHT} opacity={0.5} />
        <path d="M 5 4.5 C 18 5.5, 36 5, 52 4 L 52 6.5 C 36 7.5, 18 7.5, 5 6.5 Z" fill={ROBE_DARK} opacity={0.7} />
        <path d="M 46 -6 L 56 -4.5 L 56 4.5 L 46 6 C 46 2, 46 -2, 46 -6 Z" fill={ROBE_DARK} />
      </g>
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -5.5 C 6 -6, 14 -5.5, 18 -4 L 18 4.5 C 13 6.5, 6 6.5, 0 5.5 Z" fill={SKIN} />
        <path d="M 7 -4.5 C 9 -1, 11 2, 13 5" stroke={SKIN_SHADE} strokeWidth={1} fill="none" />
        <path d="M 12 -4 C 13 -1, 14 2, 15 4" stroke={SKIN_SHADE} strokeWidth={1} fill="none" />
      </g>
    </g>
  );
};

/**
 * TorchFlame — llama volumétrica animada (determinista, sin Math.random).
 */
const TorchFlame: React.FC<{ cx: number; baseY: number; frame: number }> = ({
  cx,
  baseY,
  frame,
}) => {
  const s1 = Math.sin(frame * 0.42 + 0.4);
  const s2 = Math.sin(frame * 0.27 + 2.1);
  return (
    <g>
      {/* Llama exterior */}
      <path
        d={`M ${cx - 16} ${baseY} C ${cx - 22} ${baseY - 16}, ${cx - 14} ${baseY - 34}, ${cx + s1 * 4} ${baseY - 48} C ${cx + 16} ${baseY - 32}, ${cx + 20} ${baseY - 14}, ${cx + 16} ${baseY} Z`}
        fill={FLAME_OUTER}
      />
      {/* Llama media */}
      <path
        d={`M ${cx - 11} ${baseY} C ${cx - 15} ${baseY - 13}, ${cx - 9} ${baseY - 26}, ${cx + s2 * 3} ${baseY - 36} C ${cx + 11} ${baseY - 25}, ${cx + 14} ${baseY - 12}, ${cx + 11} ${baseY} Z`}
        fill={FLAME}
      />
      {/* Núcleo */}
      <path
        d={`M ${cx - 6} ${baseY} C ${cx - 8} ${baseY - 9}, ${cx - 5} ${baseY - 17}, ${cx + s1 * 2} ${baseY - 23} C ${cx + 6} ${baseY - 16}, ${cx + 7} ${baseY - 8}, ${cx + 6} ${baseY} Z`}
        fill={FLAME_CORE}
      />
      {/* Resplandor */}
      <ellipse cx={cx} cy={baseY - 2} rx={26} ry={12} fill={FLAME} opacity={0.14} />
    </g>
  );
};

export const CultistCharacter: React.FC<CultistCharacterProps> = (props) => {
  const {
    x,
    floorY,
    scale = 1,
    facing = 1,
    pose,
    localFrame,
    pourProgress = 0,
    reachTarget,
    showFloorShadow = true,
  } = props;

  const t = localFrame;
  const breathe = 1 + Math.sin(t * 0.07) * 0.01;
  const hoodSway = Math.sin(t * 0.04 - 0.35) * 1.2;

  // ---- Estado por pose ---------------------------------------------------
  let leftArmU = 96;
  let leftArmL = 20;
  let rightArmU = 96;
  let rightArmL = 20;
  let torsoLean = 0;
  let chalice: Point2D | null = null;
  let torch: Point2D | null = null;

  if (pose === "pour_tar") {
    // Cáliz de hierro inclinado hacia Jack (en pantalla a la izquierda del
    // cultista, en coords locales hacia +x con facing=-1). Ambos brazos lo
    // sostienen con 2-Bone IK; el brazo frontal (derecho) queda delante.
    torsoLean = -10;
    chalice = reachTarget ?? { x: 226, y: 244 };
    const lt = solveTwoBoneIK(SHOULDER_L, { x: 212, y: 254 }, ARM_L1, ARM_L2, -1);
    leftArmU = lt.upperAngleDeg;
    leftArmL = lt.lowerAngleDeg;
    const rt = solveTwoBoneIK(SHOULDER_R, { x: 226, y: 244 }, ARM_L1, ARM_L2, 1);
    rightArmU = rt.upperAngleDeg;
    rightArmL = rt.lowerAngleDeg;
  } else if (pose === "hold_torch") {
    torch = reachTarget ?? { x: 226, y: 288 };
    const rt = solveTwoBoneIK(SHOULDER_R, torch, ARM_L1, ARM_L2, 1);
    rightArmU = rt.upperAngleDeg;
    rightArmL = rt.lowerAngleDeg;
    leftArmU = 100;
    leftArmL = 24;
  } else {
    // chant_circle
    leftArmU = -64;
    leftArmL = 46;
    rightArmU = -56;
    rightArmL = 42;
  }

  const pour = Math.max(0, Math.min(1, pourProgress));

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
          <linearGradient id="cult-robe" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={ROBE_LIGHT} />
            <stop offset="55%" stopColor={ROBE} />
            <stop offset="100%" stopColor={ROBE_DARK} />
          </linearGradient>
          <linearGradient id="cult-tar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TAR_LIGHT} />
            <stop offset="100%" stopColor={TAR} />
          </linearGradient>
        </defs>

        {showFloorShadow ? <FloorShadow cx={160} floorY={640} rx={78} opacity={0.55} /> : null}

        {/* Brazo trasero (izquierdo) */}
        <RobeArm shoulder={SHOULDER_L} upperDeg={leftArmU} lowerDeg={leftArmL} />

        {/* Túnica */}
        <g transform={`translate(160 420) scale(${breathe}) translate(-160 -420) rotate(${torsoLean} 160 420)`}>
          {/* Cuerpo de la túnica (hasta el suelo) */}
          <path d="M 104 288 C 88 296, 82 312, 82 336 C 80 440, 88 560, 98 640 L 222 640 C 232 560, 240 440, 238 336 C 238 312, 232 296, 216 288 C 180 280, 140 280, 104 288 Z" fill="url(#cult-robe)" />
          {/* Sombra lateral */}
          <path d="M 216 288 C 230 296, 236 312, 236 336 C 236 440, 228 560, 220 640 C 228 560, 234 440, 234 336 C 234 314, 228 298, 216 288 Z" fill={ROBE_DARK} opacity={0.7} />
          <path d="M 104 288 C 92 296, 86 312, 86 336 C 86 440, 94 560, 100 640 C 92 560, 86 440, 86 336 C 86 314, 92 298, 104 288 Z" fill={ROBE_LIGHT} opacity={0.4} />
          {/* Pliegues verticales de la túnica */}
          <path d="M 130 300 C 132 380, 132 480, 128 640" stroke={ROBE_DARK} strokeWidth={2} fill="none" opacity={0.55} />
          <path d="M 160 300 C 160 380, 160 480, 160 640" stroke={ROBE_DARK} strokeWidth={2} fill="none" opacity={0.5} />
          <path d="M 190 300 C 188 380, 188 480, 192 640" stroke={ROBE_DARK} strokeWidth={2} fill="none" opacity={0.55} />
          <path d="M 112 310 C 114 390, 114 500, 110 636" stroke={ROBE_DARK} strokeWidth={1.6} fill="none" opacity={0.4} />
          <path d="M 208 310 C 206 390, 206 500, 210 636" stroke={ROBE_DARK} strokeWidth={1.6} fill="none" opacity={0.4} />
          {/* Ribete carmesí del dobladillo */}
          <path d="M 98 632 L 222 632 L 224 640 L 96 640 Z" fill={TRIM} />
          <path d="M 98 632 L 222 632 L 220 636 L 100 636 Z" fill={TRIM_LIGHT} opacity={0.6} />

          {/* Cinturón de cuerda anudada */}
          <path d="M 96 428 C 100 420, 220 420, 224 428 C 220 436, 100 436, 96 428 Z" fill={ROPE} />
          <path d="M 100 428 C 104 420, 216 420, 220 428" stroke={ROPE_SHADE} strokeWidth={1.6} fill="none" />
          {/* Nudo */}
          <path d="M 154 428 C 150 418, 170 418, 166 428 C 170 438, 150 438, 154 428 Z" fill={ROPE_SHADE} />
          {/* Extremos de la cuerda colgando */}
          <path d="M 158 432 C 156 444, 156 454, 158 462" stroke={ROPE} strokeWidth={3} fill="none" />
          <path d="M 164 432 C 166 446, 166 458, 164 468" stroke={ROPE} strokeWidth={3} fill="none" />

          {/* Símbolos ocultistas bordados */}
          <g stroke={TRIM_LIGHT} strokeWidth={1.6} fill="none" opacity={0.7}>
            <path d="M 130 360 L 134 372 L 126 372 Z" />
            <circle cx={130} cy={382} r={4} />
            <path d="M 190 360 L 194 372 L 186 372 Z" />
            <path d="M 186 382 L 194 382" />
            <path d="M 160 392 L 160 402 M 155 397 L 165 397" />
            <path d="M 130 340 L 130 352 M 124 346 L 136 346" />
            <path d="M 190 340 L 190 352 M 184 346 L 196 346" />
            <path d="M 160 410 L 160 420 M 154 415 L 166 415" />
          </g>
        </g>

        {/* ---- Capucha puntiaguda ---- */}
        <g transform={`rotate(${hoodSway + torsoLean} 160 200)`}>
          <path d="M 116 140 C 108 200, 112 260, 128 296 L 192 296 C 208 260, 212 200, 204 140 C 200 96, 120 96, 116 140 Z" fill="url(#cult-robe)" />
          {/* Punta de la capucha */}
          <path d="M 158 96 C 156 108, 154 118, 152 126 C 158 118, 164 112, 168 104 C 164 100, 161 98, 158 96 Z" fill={ROBE_LIGHT} opacity={0.6} />
          {/* Sombra interna abisal de la capucha */}
          <path d="M 126 160 C 124 210, 128 260, 138 288 L 182 288 C 192 260, 196 210, 194 160 C 172 178, 148 178, 126 160 Z" fill={FACE_VOID} />
          <path d="M 134 176 C 132 214, 136 252, 144 280 C 138 250, 136 212, 138 180 Z" fill="#010106" />
          <path d="M 176 176 C 178 214, 174 252, 168 280 C 172 250, 174 212, 172 180 Z" fill="#010106" />
          <path d="M 148 188 C 150 220, 150 250, 152 276" stroke="#010106" strokeWidth={2} fill="none" opacity={0.6} />
          {/* Ribete carmesí del borde de la capucha */}
          <path d="M 126 160 C 124 210, 128 260, 138 288 L 182 288 C 192 260, 196 210, 194 160 C 172 178, 148 178, 126 160 Z" fill="none" stroke={TRIM} strokeWidth={3} opacity={0.85} />
          {/* Ojos con brillo tenue en el vacío */}
          <circle cx={146} cy={216} r={2.6} fill={EYE_GLOW} opacity={0.8} />
          <circle cx={174} cy={216} r={2.6} fill={EYE_GLOW} opacity={0.8} />
        </g>

        {/* ---- Cáliz / Antorcha (entre brazo trasero y frontal) ---- */}
        {chalice ? (
          <g transform={`translate(${chalice.x} ${chalice.y}) rotate(-18)`}>
            {/* Cáliz de hierro (centrado en el ancla, inclinado hacia el vertido) */}
            <path d="M -13 -8 C -13 -14, 13 -14, 13 -8 L 15 10 C 15 16, -15 16, -15 10 Z" fill={CHALICE} />
            <path d="M -15 10 L 15 10 L 13 14 L -13 14 Z" fill={CHALICE_DARK} />
            <path d="M -3 10 L 3 10 L 3 20 L -3 20 Z" fill={CHALICE_DARK} />
            <path d="M -9 20 C -9 25, 9 25, 9 20 C 9 26, -9 26, -9 20 Z" fill={CHALICE} />
            {/* Reflejo del borde */}
            <path d="M -11 -8 C -11 -12, 11 -12, 11 -8" stroke={CHALICE_LIGHT} strokeWidth={1.6} fill="none" opacity={0.7} />
            {/* Grabado */}
            <path d="M -4 -2 C -2 0, 2 0, 4 -2" stroke={CHALICE_LIGHT} strokeWidth={1.2} fill="none" opacity={0.5} />
            {/* Alquitrán hirviendo dentro del cáliz */}
            <ellipse cx={0} cy={-9} rx={11} ry={3.4} fill={TAR} />
            <ellipse cx={-1} cy={-10} rx={4} ry={1.4} fill={TAR_LIGHT} opacity={0.8} />

            {/* Chorro volumétrico de alquitrán hirviendo (pour_tar) */}
            {pour > 0 ? (
              <g opacity={Math.min(1, pour * 1.6)}>
                {/* Cuerpo viscoso del chorro: del borde del cáliz hasta el rostro de Jack (~115 px) */}
                <path
                  d="M -7 -6 C -8 20, -6 55, -2 84 C -1 94, 0 102, 2 108 C 4 112, 7 112, 9 108 C 11 100, 12 88, 12 74 C 12 42, 10 10, 9 -6 C 4 -8, -2 -8, -7 -6 Z"
                  fill={TAR_JET}
                />
                {/* Núcleo más denso del fluido */}
                <path
                  d="M -1 -4 C -1 22, 0 56, 2 86 C 3 96, 4 102, 5 106 C 6 100, 7 88, 7 72 C 7 40, 5 8, 4 -5 Z"
                  fill={TAR_CORE}
                />
                {/* Contorno/brillo especular lateral nítido (frío) */}
                <path
                  d="M -6 -5 C -7 24, -5 60, -1 88 C 0 96, 1 102, 2 107"
                  stroke={SPECULAR_BLUE}
                  strokeWidth={2.4}
                  fill="none"
                  opacity={0.65}
                  strokeLinecap="round"
                />
                <path
                  d="M -5 -4 C -6 30, -4 64, -1 90"
                  stroke={SPECULAR_SOFT}
                  strokeWidth={1.2}
                  fill="none"
                  opacity={0.65}
                  strokeLinecap="round"
                />
                {/* Reflejo ámbar de las antorchas en el lado opuesto */}
                <path
                  d="M 9 -5 C 10 18, 11 52, 10 82 C 9 92, 8 100, 7 106"
                  stroke={AMBER_REFLECT}
                  strokeWidth={1.8}
                  fill="none"
                  opacity={0.55}
                  strokeLinecap="round"
                />
                {/* Gotas gruesas desprendiéndose hacia las cuencas */}
                <ellipse cx={-3} cy={114} rx={3.4} ry={4.6} fill={TAR_JET} />
                <path
                  d="M -5.5 111 C -4.5 116, -1.5 116, -0.5 111 C -1.5 115, -4.5 115, -5.5 111 Z"
                  fill={SPECULAR_BLUE}
                  opacity={0.45}
                />
                <ellipse cx={5} cy={126} rx={2.6} ry={3.4} fill={TAR_JET} />
                <ellipse cx={8} cy={138} rx={2} ry={2.6} fill={TAR_CORE} />
                {/* 4 volutas orgánicas de vapor blanco-azulado subiendo desde el impacto */}
                <path
                  d="M -4 108 C -10 96, -14 84, -9 72 C -6 80, -4 92, -2 104"
                  stroke={VAPOR}
                  strokeWidth={2.2}
                  fill="none"
                  opacity={0.45}
                  strokeLinecap="round"
                />
                <path
                  d="M 4 108 C 10 94, 16 80, 12 66 C 8 76, 5 90, 3 104"
                  stroke={VAPOR}
                  strokeWidth={2.2}
                  fill="none"
                  opacity={0.45}
                  strokeLinecap="round"
                />
                <path
                  d="M 0 110 C -6 100, -10 88, -6 78 C -2 86, 1 96, 2 108"
                  stroke={VAPOR}
                  strokeWidth={1.6}
                  fill="none"
                  opacity={0.45}
                  strokeLinecap="round"
                />
                <path
                  d="M 6 110 C 12 98, 16 86, 12 74 C 8 84, 5 94, 4 108"
                  stroke={VAPOR}
                  strokeWidth={1.6}
                  fill="none"
                  opacity={0.45}
                  strokeLinecap="round"
                />
              </g>
            ) : null}
          </g>
        ) : null}

        {torch ? (
          <g>
            {/* Antorcha de madera */}
            <path d="M 216 268 C 218 300, 220 340, 222 372 L 234 372 C 236 340, 238 300, 240 268 C 234 264, 222 264, 216 268 Z" fill={TORCH} />
            <path d="M 218 280 C 220 310, 222 340, 224 368" stroke="#3E2E18" strokeWidth={1.6} fill="none" opacity={0.6} />
            {/* Vendas/grasa del extremo */}
            <path d="M 214 268 C 216 262, 242 262, 244 268 C 244 274, 216 274, 214 268 Z" fill={ROPE} />
            <TorchFlame cx={229} baseY={262} frame={t} />
          </g>
        ) : null}

        {/* Brazo frontal (derecho, delante del cáliz/antorcha) */}
        <RobeArm shoulder={SHOULDER_R} upperDeg={rightArmU} lowerDeg={rightArmL} />
      </svg>
    </div>
  );
};
