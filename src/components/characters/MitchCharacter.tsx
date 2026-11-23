import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import {
  computeAnticipation,
  computeWalkBiomechanics,
  FloorShadow,
  Point2D,
  solveTwoBoneIK,
} from "./ikMath";

/**
 * MitchCharacter — Mitch, el joven protagonista de la historia original.
 *
 * Joven adulto con cabello castaño oscuro en 3 capas (hairBack / hairCrown /
 * hairFront) de cobertura completa, rostro expresivo (cejas articuladas,
 * párpados con parpadeo determinista, iris+pupila+brillo, nariz sombreada,
 * boca entreabierta), cicatriz carmesí en la mejilla izquierda, sudadera de
 * dormir gris azulado con pliegues/costuras y vendaje médico con filtración.
 *
 * Esqueleto jerárquico completo, 2-Bone IK en el brazo frontal (sujeta la
 * cámara o el costado herido) y FloorShadow anclada en floorY.
 */

export type MitchPose = "bed_startle" | "camera_flash" | "walk_injured";

export interface MitchCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  facing?: 1 | -1;
  pose: MitchPose;
  localFrame: number;
  startleFrame?: number;
  flashFrame?: number;
  showCheekScar?: boolean;
  showSideBandage?: boolean;
  reachTarget?: Point2D;
  renderPropBetweenArms?: React.ReactNode;
  walkPhase?: number;
  /** Oculta las piernas inferiores bajo las sábanas (sentado en la cama, Escena 1). */
  seatedInBed?: boolean;
}

// ---- Paleta de Mitch -----------------------------------------------------
const SKIN = "#E6BE97";
const SKIN_SHADE = "#C99A6B";
const SKIN_DARK = "#9C7448";
const HAIR = "#33261D";
const HAIR_MID = "#4A3828";
const HAIR_LIGHT = "#6B5138";
const HAIR_RIM = "#7C93A8";
const SWEATER = "#2B3946";
const SWEATER_SHADE = "#1E2833";
const SWEATER_LIGHT = "#41505E";
const PANTS = "#1A222B";
const PANTS_SHADE = "#131A22";
const SOCK = "#C9CFD4";
const BANDAGE = "#E4E0D4";
const BANDAGE_SHADE = "#C6C1B2";
const BLOOD = "#DC2626";
const BLOOD_DARK = "#7F1D1D";

const SHOULDER_L: Point2D = { x: 108, y: 312 };
const SHOULDER_R: Point2D = { x: 212, y: 312 };
const ARM_L1 = 62;
const ARM_L2 = 58;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * SleeveArm — brazo de dos segmentos (sudadera + antebrazo + mano) dibujado
 * como jerarquía de <g> rotados. upperDeg/lowerDeg en grados SVG.
 */
const SleeveArm: React.FC<{
  shoulder: Point2D;
  upperDeg: number;
  lowerDeg: number;
  skinTint: string;
}> = ({ shoulder, upperDeg, lowerDeg, skinTint }) => {
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
      <circle cx={shoulder.x} cy={shoulder.y} r={11} fill={SWEATER} />
      {/* Brazo superior */}
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upperDeg})`}>
        <path
          d="M 0 -11 C 18 -12, 44 -10.5, 62 -8 L 62 8 C 44 10.5, 18 12, 0 11 Z"
          fill={SWEATER}
        />
        <path
          d="M 4 -7 C 22 -8, 46 -7, 59 -5.5 L 59 -1.5 C 42 -2, 20 -1.5, 4 -1.5 Z"
          fill={SWEATER_LIGHT}
          opacity={0.5}
        />
        <path
          d="M 6 5.5 C 24 6.5, 46 6, 59 5 L 59 8 C 44 9, 20 9, 6 8 Z"
          fill={SWEATER_SHADE}
          opacity={0.6}
        />
        {/* Pliegue del codo */}
        <path
          d="M 46 -7 C 50 -3, 52 2, 52 7 C 48 4, 46 0, 46 -7 Z"
          fill={SWEATER_SHADE}
        />
        <path
          d="M 55 -7 C 57 -3, 58 2, 58 7 C 56 3, 55 0, 55 -7 Z"
          fill={SWEATER_SHADE}
        />
      </g>

      {/* Antebrazo */}
      <g transform={`translate(${elbow.x} ${elbow.y}) rotate(${upperDeg + lowerDeg})`}>
        <path
          d="M 0 -9 C 16 -9.5, 38 -8.5, 58 -6 L 58 6 C 38 8.5, 16 9.5, 0 9 Z"
          fill={SWEATER}
        />
        <path
          d="M 3 -6 C 16 -6.5, 38 -6, 55 -4.5 L 55 -1 C 38 -1.5, 16 -1.5, 3 -1.5 Z"
          fill={SWEATER_LIGHT}
          opacity={0.5}
        />
        <path
          d="M 4 4.5 C 18 5.5, 38 5, 55 4 L 55 6.5 C 38 7.5, 18 7.5, 4 7 Z"
          fill={SWEATER_SHADE}
          opacity={0.6}
        />
        {/* Puño */}
        <path
          d="M 50 -6 L 58 -5 L 58 5 L 50 6 C 50 2, 50 -2, 50 -6 Z"
          fill={SWEATER_SHADE}
        />
      </g>

      {/* Mano */}
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${upperDeg + lowerDeg})`}>
        <path
          d="M 0 -6 C 7 -7, 15 -6.5, 19 -4.5 L 19 5 C 14 7.5, 7 7.5, 0 6 Z"
          fill={skinTint}
        />
        <path
          d="M 7 -5.5 C 10 -1, 12 2, 14 5.5"
          stroke={SKIN_SHADE}
          strokeWidth={1}
          fill="none"
        />
        <path
          d="M 13 -5 C 15 -1, 16 2, 17 4.5"
          stroke={SKIN_SHADE}
          strokeWidth={1}
          fill="none"
        />
      </g>
    </g>
  );
};

/**
 * Leg — pierna de dos segmentos (muslo + pantorrilla + pie/calcetín) desde la
 * cadera, con apoyo en el suelo. hipDeg/kneeDeg en grados; lift eleva el pie.
 */
const Leg: React.FC<{
  hip: Point2D;
  hipDeg: number;
  kneeDeg: number;
  lift: number;
}> = ({ hip, hipDeg, kneeDeg, lift }) => {
  const thighRad = rad(90 + hipDeg);
  const knee = {
    x: hip.x + Math.cos(thighRad) * 72,
    y: hip.y + Math.sin(thighRad) * 72,
  };
  const calfRad = rad(90 + hipDeg - kneeDeg);
  const ankle = {
    x: knee.x + Math.cos(calfRad) * 72,
    y: knee.y + Math.sin(calfRad) * 72,
  };

  return (
    <g>
      {/* Muslo */}
      <g transform={`translate(${hip.x} ${hip.y}) rotate(${90 + hipDeg})`}>
        <path
          d="M -10 0 C -11 24, -11 48, -9 72 L 9 72 C 11 48, 11 24, 10 0 Z"
          fill={PANTS}
        />
        <path
          d="M -10 0 C -9 20, -9 40, -8 60 L -3 60 C -4 40, -4 20, -5 0 Z"
          fill={PANTS_SHADE}
          opacity={0.5}
        />
        <path
          d="M 5 26 C 7 34, 7 42, 5 50"
          stroke={PANTS_SHADE}
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
      </g>

      {/* Rodilla */}
      <circle cx={knee.x} cy={knee.y} r={8.5} fill={PANTS} />
      <path
        d={`M ${knee.x - 6} ${knee.y - 4} C ${knee.x} ${knee.y - 2}, ${knee.x + 4} ${knee.y + 2}, ${knee.x + 6} ${knee.y + 5}`}
        stroke={PANTS_SHADE}
        strokeWidth={1.5}
        fill="none"
        opacity={0.6}
      />

      {/* Pantorrilla */}
      <g transform={`translate(${knee.x} ${knee.y}) rotate(${90 + hipDeg - kneeDeg})`}>
        <path
          d="M -8 0 C -9 24, -9 48, -7 72 L 7 72 C 9 48, 9 24, 8 0 Z"
          fill={PANTS}
        />
        <path
          d="M -8 0 C -7 20, -7 40, -6 60 L -2 60 C -3 40, -3 20, -4 0 Z"
          fill={PANTS_SHADE}
          opacity={0.5}
        />
      </g>

      {/* Tobillo / calcetín + pie */}
      <g transform={`translate(${ankle.x} ${ankle.y - 8}) translate(0 ${-lift})`}>
        <path
          d="M -8 2 C -8 14, -7 24, -5 32 L 7 32 C 9 24, 9 14, 8 2 Z"
          fill={SOCK}
        />
        {/* Pie */}
        <path
          d="M -6 28 C -8 38, -7 46, -5 52 L 38 52 C 42 46, 42 38, 38 30 C 28 26, 2 26, -6 28 Z"
          fill={SOCK}
        />
        <path
          d="M -5 48 L 40 48 C 42 44, 42 40, 40 38 C 30 36, 2 36, -5 40 Z"
          fill="#A7AEB5"
          opacity={0.7}
        />
      </g>
    </g>
  );
};

export const MitchCharacter: React.FC<MitchCharacterProps> = (props) => {
  const {
    x,
    floorY,
    scale = 1,
    facing = 1,
    pose,
    localFrame,
    startleFrame = 0,
    flashFrame = 0,
    showCheekScar = true,
    showSideBandage = true,
    reachTarget,
    renderPropBetweenArms,
    walkPhase = 0,
    seatedInBed = false,
  } = props;

  const { fps } = useVideoConfig();
  const t = localFrame;

  // ---- Animación determinista base --------------------------------------
  const breathe = 1 + Math.sin(t * 0.08) * 0.015;
  const blink = Math.pow(Math.max(0, Math.sin(t * 0.11 + 1.3)), 10);

  // ---- Estado por pose ---------------------------------------------------
  let bodyBob = 0;
  let torsoLean = 0;
  let headTilt = 0;
  let leftArmU = 96;
  let leftArmL = 16;
  let rightArmU = 96;
  let rightArmL = 16;
  let eyesWide = 0;
  let mouthOpen = 0;
  let browRaise = 0;
  let trembleAmp = 0;
  let leftHipD = 0;
  let leftKneeD = 2;
  let rightHipD = 0;
  let rightKneeD = 2;
  let footLiftL = 0;
  let footLiftR = 0;
  // Posición y rotación del prop interactivo (nivelado, sin girar con el antebrazo).
  let propPosition: Point2D | null = null;
  let propRotation = 0;

  if (pose === "walk_injured") {
    const walk = computeWalkBiomechanics(walkPhase, true);
    bodyBob = -walk.pelvisBobY;
    torsoLean = walk.torsoLeanDeg;
    headTilt = walk.headFollowDeg;
    leftHipD = walk.leftHipDeg;
    leftKneeD = walk.leftKneeDeg;
    rightHipD = walk.rightHipDeg;
    rightKneeD = walk.rightKneeDeg;
    footLiftL = walk.footLift * (Math.sin(walkPhase) > 0 ? 1 : 0);
    footLiftR = walk.footLift * (Math.sin(walkPhase + Math.PI) > 0 ? 1 : 0);
    // Brazo frontal (derecho) sujeta el costado herido vía IK.
    const wound = reachTarget ?? { x: 96, y: 366 };
    const front = solveTwoBoneIK(SHOULDER_R, wound, ARM_L1, ARM_L2, 1);
    rightArmU = front.upperAngleDeg;
    rightArmL = front.lowerAngleDeg;
    leftArmU = 96 + walk.leftShoulderDeg;
    leftArmL = walk.leftElbowDeg;
    eyesWide = 0.4;
  } else if (pose === "camera_flash") {
    torsoLean = -4;
    headTilt = -3;
    // Cámara digital nivelada, centrada entre ambas manos delante del pecho,
    // apuntando hacia Eyeless Jack (a la derecha). El brazo frontal (derecho)
    // sujeta el lado frontal/derecho y el trasero (izquierdo) el lado izquierdo.
    const cam = reachTarget ?? { x: 220, y: 274 };
    const front = solveTwoBoneIK(
      SHOULDER_R,
      { x: cam.x + 2, y: cam.y + 4 },
      ARM_L1,
      ARM_L2,
      1
    );
    rightArmU = front.upperAngleDeg;
    rightArmL = front.lowerAngleDeg;
    const back = solveTwoBoneIK(
      SHOULDER_L,
      { x: cam.x - 22, y: cam.y + 4 },
      ARM_L1,
      ARM_L2,
      1
    );
    leftArmU = back.upperAngleDeg;
    leftArmL = back.lowerAngleDeg;
    // Prop nivelado entre ambas manos (no gira con el ángulo del antebrazo).
    propPosition = { x: cam.x - 8, y: cam.y };
    propRotation = 0;
    // Reacción al flash: parpadeo forzado.
    if (flashFrame > 0) {
      const flash = interpolate(
        t,
        [flashFrame, flashFrame + 5, flashFrame + 16],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      eyesWide = Math.min(1, flash);
    }
  } else {
    // bed_startle
    const anticipation = computeAnticipation(t, startleFrame > 0 ? startleFrame : 30, 5);
    const startlePulse =
      startleFrame > 0
        ? spring({ frame: t - startleFrame, fps, config: { damping: 200, mass: 0.5, stiffness: 90 } })
        : 0;
    eyesWide = 1;
    mouthOpen = 0.6 + startlePulse * 0.4;
    browRaise = 1;
    torsoLean = -6 - anticipation * 4;
    headTilt = -6 + Math.sin(t * 0.4) * 1.4;
    trembleAmp = 0.7 + startlePulse * 1.4;
    rightArmU = -68 - startlePulse * 8;
    rightArmL = 58;
    leftArmU = -112;
    leftArmL = 46;
  }

  const trembleX = Math.sin(t * 1.4) * trembleAmp;
  const trembleY = Math.cos(t * 1.7) * trembleAmp * 0.6;

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
          <linearGradient id="mitch-skin" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor={SKIN} />
            <stop offset="80%" stopColor={SKIN_SHADE} />
            <stop offset="100%" stopColor={SKIN_DARK} />
          </linearGradient>
          <linearGradient id="mitch-hair" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor={HAIR_LIGHT} />
            <stop offset="45%" stopColor={HAIR_MID} />
            <stop offset="100%" stopColor={HAIR} />
          </linearGradient>
          <linearGradient id="mitch-sweater" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={SWEATER_LIGHT} />
            <stop offset="55%" stopColor={SWEATER} />
            <stop offset="100%" stopColor={SWEATER_SHADE} />
          </linearGradient>
          <linearGradient id="mitch-pants" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor={PANTS} />
            <stop offset="100%" stopColor={PANTS_SHADE} />
          </linearGradient>
          <clipPath id="mitch-skull">
            <ellipse cx={160} cy={190} rx={46} ry={58} />
          </clipPath>
        </defs>

        {/* Sombra de contacto */}
        <FloorShadow cx={160} floorY={640} rx={70} opacity={0.5} />

        {/* ---- Piernas (no participan del bob, pies anclados) ---- */}
        {pose !== "bed_startle" && !seatedInBed ? (
          <g>
            <Leg hip={{ x: 140, y: 448 }} hipDeg={leftHipD} kneeDeg={leftKneeD} lift={footLiftL} />
            <Leg hip={{ x: 180, y: 448 }} hipDeg={rightHipD} kneeDeg={rightKneeD} lift={footLiftR} />
          </g>
        ) : null}

        {/* ---- Cuerpo (bob + temblor) ---- */}
        <g transform={`translate(${trembleX} ${trembleY + bodyBob})`}>
          {/* Brazo trasero (izquierdo, detrás del torso) */}
          <SleeveArm shoulder={SHOULDER_L} upperDeg={leftArmU} lowerDeg={leftArmL} skinTint={SKIN} />

          {/* ---- Manta de cama (bed_startle o sentado en la cama) ---- */}
          {pose === "bed_startle" || seatedInBed ? (
            <g>
              <path
                d="M 96 430 C 92 470, 94 540, 100 640 L 220 640 C 226 540, 228 470, 224 430 C 210 444, 110 444, 96 430 Z"
                fill="#22303C"
              />
              <path
                d="M 100 640 C 104 560, 106 500, 112 470 C 118 500, 120 560, 122 640 Z"
                fill="#1A2631"
                opacity={0.7}
              />
              <path
                d="M 198 640 C 200 560, 202 500, 206 474 C 210 500, 214 560, 216 640 Z"
                fill="#1A2631"
                opacity={0.7}
              />
              {/* Rodillas bajo la manta */}
              <path d="M 122 520 C 136 500, 152 502, 158 524 C 144 540, 128 538, 122 520 Z" fill="#2C3E4C" />
              <path d="M 162 524 C 172 506, 186 508, 192 526 C 182 542, 168 540, 162 524 Z" fill="#2C3E4C" />
              {/* Pliegues de la manta */}
              <path d="M 104 470 C 116 486, 130 492, 146 490" stroke="#16202A" strokeWidth={2} fill="none" />
              <path d="M 176 490 C 192 490, 204 484, 214 470" stroke="#16202A" strokeWidth={2} fill="none" />
              <path d="M 98 600 C 120 596, 200 596, 222 600" stroke="#16202A" strokeWidth={2} fill="none" opacity={0.6} />
            </g>
          ) : null}

          {/* ---- Torso (sudadera de dormir) ---- */}
          <g>
            <g transform={`rotate(${torsoLean} 160 360)`}>
              {/* Sudadera principal */}
              <path
                d="M 116 296 C 100 300, 94 312, 94 328 C 92 362, 100 400, 116 430 L 204 430 C 220 400, 228 362, 226 328 C 226 312, 220 300, 204 296 C 182 290, 138 290, 116 296 Z"
                fill="url(#mitch-sweater)"
              />
              {/* Sombra lateral derecha */}
              <path d="M 204 296 C 218 302, 224 316, 224 336 C 224 380, 214 416, 204 430 C 212 410, 216 360, 212 320 C 210 310, 208 302, 204 296 Z" fill={SWEATER_SHADE} opacity={0.55} />
              {/* Luz lateral izquierda */}
              <path d="M 116 296 C 104 302, 98 314, 98 332 C 98 372, 108 410, 116 430 C 110 406, 106 362, 108 326 C 109 314, 112 302, 116 296 Z" fill={SWEATER_LIGHT} opacity={0.5} />
              {/* Cuello */}
              <path d="M 138 292 C 142 284, 178 284, 182 292 C 184 300, 182 308, 178 312 L 142 312 C 138 308, 136 300, 138 292 Z" fill={SWEATER_SHADE} />
              <path d="M 138 292 C 142 286, 178 286, 182 292 C 180 298, 176 300, 160 300 C 146 300, 140 298, 138 292 Z" fill="#10161E" />
              {/* Pliegues del pecho */}
              <path d="M 132 330 C 136 352, 140 372, 144 390" stroke={SWEATER_SHADE} strokeWidth={1.5} fill="none" opacity={0.6} />
              <path d="M 188 330 C 184 352, 180 372, 176 390" stroke={SWEATER_SHADE} strokeWidth={1.5} fill="none" opacity={0.6} />
              <path d="M 160 324 C 160 348, 160 370, 160 392" stroke={SWEATER_SHADE} strokeWidth={1.2} fill="none" opacity={0.45} />
              {/* Costuras de hombro */}
              <path d="M 116 296 C 122 304, 126 310, 130 318" stroke={SWEATER_SHADE} strokeWidth={1.5} fill="none" />
              <path d="M 204 296 C 198 304, 194 310, 190 318" stroke={SWEATER_SHADE} strokeWidth={1.5} fill="none" />
              {/* Dobladillo */}
              <path d="M 116 430 L 204 430 L 202 438 L 118 438 Z" fill={SWEATER_SHADE} opacity={0.8} />
            </g>
          </g>

          {/* ---- Vendaje médico (costado izquierdo) ---- */}
          {showSideBandage ? (
            <g>
              <path
                d="M 96 352 C 94 372, 94 392, 98 410 L 126 410 C 130 390, 130 370, 126 352 C 116 348, 104 348, 96 352 Z"
                fill={BANDAGE}
              />
              <path d="M 100 358 C 104 378, 104 396, 102 408" stroke={BANDAGE_SHADE} strokeWidth={1.4} fill="none" />
              <path d="M 112 352 C 112 372, 112 392, 112 410" stroke={BANDAGE_SHADE} strokeWidth={1.2} fill="none" opacity={0.7} />
              {/* Filtración carmesí */}
              <path
                d="M 104 382 C 106 390, 106 398, 104 404 C 108 402, 110 394, 110 386 C 108 382, 106 380, 104 382 Z"
                fill={BLOOD}
                opacity={0.85}
              />
              <path d="M 108 388 C 110 394, 110 400, 108 406 C 112 404, 113 396, 112 390 Z" fill={BLOOD_DARK} opacity={0.7} />
            </g>
          ) : null}

          {/* ---- Cabeza y rostro ---- */}
          <g transform={`translate(160 250) scale(${breathe}) translate(-160 -250) rotate(${headTilt} 160 250)`}>
            {/* hairBack: masa capilar trasera corta, acotada a la nuca y detrás de las orejas */}
            <path
              d="M 112 146 C 106 198, 110 234, 122 252 L 198 252 C 210 234, 214 198, 208 146 C 206 118, 114 118, 112 146 Z"
              fill="url(#mitch-hair)"
            />
            {/* Nuca (corte limpio, sin envolver cuello ni mentón) */}
            <path d="M 130 250 C 142 258, 178 258, 190 250 C 182 256, 174 259, 160 259 C 146 259, 138 256, 130 250 Z" fill={HAIR} />
            {/* Patillas laterales (delante de las orejas, sin bajar del mentón) */}
            <path d="M 116 184 C 112 202, 112 218, 118 232 C 114 218, 114 200, 118 184 Z" fill={HAIR} />
            <path d="M 204 184 C 208 202, 208 218, 202 232 C 206 218, 206 200, 202 184 Z" fill={HAIR} />

            {/* Cuello */}
            <path d="M 140 248 C 142 262, 142 276, 140 292 L 180 292 C 178 276, 178 262, 180 248 C 170 252, 150 252, 140 248 Z" fill="url(#mitch-skin)" />
            <path d="M 146 268 C 150 276, 152 284, 152 292" stroke={SKIN_SHADE} strokeWidth={1.4} fill="none" opacity={0.6} />

            {/* Orejas */}
            <path d="M 116 190 C 110 188, 106 192, 106 200 C 106 210, 112 214, 118 212 C 120 204, 120 196, 116 190 Z" fill="url(#mitch-skin)" />
            <path d="M 204 190 C 210 188, 214 192, 214 200 C 214 210, 208 214, 202 212 C 200 204, 200 196, 204 190 Z" fill="url(#mitch-skin)" />

            {/* Cráneo + cara */}
            <ellipse cx={160} cy={190} rx={46} ry={58} fill="url(#mitch-skin)" />
            {/* Frente (zona alta, quedará cubierta por cabello) */}
            <path d="M 120 168 C 128 152, 192 152, 200 168 C 196 178, 124 178, 120 168 Z" fill={SKIN} opacity={0.7} />

            {/* Cejas articuladas (se elevan en pánico) */}
            <g transform={`translate(0 ${-browRaise * 7})`}>
              <path d="M 126 172 C 134 166, 146 166, 152 172 C 146 168, 134 168, 126 172 Z" fill={HAIR} />
              <path d="M 168 172 C 174 166, 186 166, 194 172 C 186 168, 174 168, 168 172 Z" fill={HAIR} />
            </g>

            {/* Cuencas / esclerótica */}
            <ellipse cx={138} cy={190} rx={15} ry={eyesWide > 0.5 ? 11 : 8} fill="#FFFFFF" />
            <ellipse cx={182} cy={190} rx={15} ry={eyesWide > 0.5 ? 11 : 8} fill="#FFFFFF" />

            {/* Iris + pupila (dilatada en sobresalto) */}
            <g opacity={blink > 0.5 ? 0 : 1}>
              <circle cx={138} cy={190} r={eyesWide > 0.3 ? 8 : 7} fill="#4E6E4E" />
              <circle cx={182} cy={190} r={eyesWide > 0.3 ? 8 : 7} fill="#4E6E4E" />
              <circle cx={138} cy={190} r={eyesWide > 0.5 ? 5.4 : 3.4} fill="#080807" />
              <circle cx={182} cy={190} r={eyesWide > 0.5 ? 5.4 : 3.4} fill="#080807" />
              <circle cx={134.5} cy={186.5} r={2.2} fill="#FFFFFF" opacity={0.95} />
              <circle cx={178.5} cy={186.5} r={2.2} fill="#FFFFFF" opacity={0.95} />
            </g>

            {/* Párpados (parpadeo determinista) */}
            <g opacity={blink}>
              <path d="M 124 190 C 130 182, 146 182, 152 190 C 146 188, 130 188, 124 190 Z" fill={SKIN_SHADE} />
              <path d="M 168 190 C 174 182, 190 182, 196 190 C 190 188, 174 188, 168 190 Z" fill={SKIN_SHADE} />
            </g>
            {/* Párpado superior (sombra) */}
            <path d="M 123 184 C 132 177, 144 177, 153 184" stroke={SKIN_DARK} strokeWidth={1.4} fill="none" opacity={0.55} />
            <path d="M 167 184 C 176 177, 188 177, 197 184" stroke={SKIN_DARK} strokeWidth={1.4} fill="none" opacity={0.55} />

            {/* Nariz sombreada */}
            <path d="M 160 192 C 158 206, 157 216, 158 224 C 160 226, 162 226, 163 224 C 164 216, 163 206, 161 194 Z" fill={SKIN_SHADE} />
            <path d="M 156 226 C 158 230, 162 230, 164 226" stroke={SKIN_DARK} strokeWidth={1.2} fill="none" opacity={0.6} />

            {/* Boca (entreabierta en sobresalto) */}
            <g transform={`translate(0 ${mouthOpen * 1.5})`}>
              {mouthOpen > 0.25 ? (
                <path d="M 150 240 C 154 234, 166 234, 170 240 C 166 250, 154 250, 150 240 Z" fill="#3A1214" />
              ) : (
                <path d="M 150 240 C 156 238, 164 238, 170 240 C 164 243, 156 243, 150 240 Z" fill="#5A2A28" />
              )}
            </g>
            <path d="M 150 240 C 156 237, 164 237, 170 240" stroke="#7A4038" strokeWidth={1.4} fill="none" />
            <path d="M 152 242 C 158 244, 164 244, 169 242" stroke={SKIN_DARK} strokeWidth={1} fill="none" opacity={0.5} />

            {/* Rubor en mejillas */}
            <ellipse cx={128} cy={212} rx={9} ry={5} fill="#D98B78" opacity={0.35} />
            <ellipse cx={192} cy={212} rx={9} ry={5} fill="#D98B78" opacity={0.35} />

            {/* Cicatriz carmesí en la mejilla izquierda */}
            {showCheekScar ? (
              <g>
                <path
                  d="M 118 206 C 122 214, 122 222, 118 230 C 124 224, 126 216, 124 208 Z"
                  fill={BLOOD_DARK}
                  opacity={0.85}
                />
                <path d="M 120 208 C 123 216, 123 224, 120 230" stroke={BLOOD} strokeWidth={1.2} fill="none" />
                <path d="M 123 212 C 125 218, 125 224, 123 228" stroke={BLOOD} strokeWidth={0.8} fill="none" opacity={0.7} />
              </g>
            ) : null}

            {/* Luz de borde fría sobre el cráneo */}
            <g clipPath="url(#mitch-skull)">
              <ellipse cx={140} cy={164} rx={44} ry={44} fill="rgba(124,147,168,0.18)" />
            </g>

            {/* hairCrown: volumen superior cubriendo el 35-40% superior del cráneo, terminando JUSTO ENCIMA de las cejas */}
            <path
              d="M 116 156 C 118 122, 202 122, 204 156 C 206 162, 200 166, 160 168 C 120 166, 114 162, 116 156 Z"
              fill="url(#mitch-hair)"
            />
            <path d="M 122 148 C 130 128, 190 128, 198 148 C 194 136, 186 128, 160 128 C 136 128, 126 136, 122 148 Z" fill={HAIR_LIGHT} opacity={0.55} />
            <path d="M 128 156 C 132 140, 152 132, 160 132 C 176 132, 190 140, 194 154 C 184 142, 136 142, 128 156 Z" fill={HAIR_MID} opacity={0.6} />

            {/* hairFront: mechones cortos/medios despeinados de hombre sobre la frente */}
            <path d="M 118 158 C 120 146, 130 140, 142 138 C 134 146, 131 154, 132 162 C 128 162, 122 162, 118 158 Z" fill={HAIR} />
            <path d="M 132 138 C 140 130, 152 128, 162 130 C 152 138, 144 146, 141 156 C 134 150, 132 144, 132 138 Z" fill={HAIR_MID} />
            <path d="M 158 130 C 166 128, 178 130, 186 136 C 176 142, 168 148, 163 156 C 157 148, 157 138, 158 130 Z" fill={HAIR} />
            <path d="M 184 138 C 192 144, 198 154, 198 160 C 192 156, 186 152, 182 147 C 180 143, 180 140, 184 138 Z" fill={HAIR_MID} />
            {/* Mechones finos hacia las sienes (sin tapar las cejas) */}
            <path d="M 128 150 C 124 158, 123 166, 124 172 C 121 164, 121 156, 128 150 Z" fill={HAIR} />
            <path d="M 192 152 C 196 160, 197 166, 196 172 C 199 164, 199 158, 192 152 Z" fill={HAIR} />
            {/* Volumen en patillas/sienes */}
            <path d="M 120 168 C 116 180, 115 192, 118 202 C 115 190, 116 178, 120 168 Z" fill={HAIR_MID} />
            <path d="M 200 168 C 204 180, 205 192, 202 202 C 205 190, 204 178, 200 168 Z" fill={HAIR_MID} />
            {/* Luz de borde en el cabello */}
            <path d="M 122 150 C 126 130, 148 122, 170 122" stroke={HAIR_RIM} strokeWidth={2} fill="none" opacity={0.5} />
          </g>
        </g>

        {/* ---- Prop interactivo (entre el brazo trasero y el frontal, nivelado) ---- */}
        {renderPropBetweenArms && propPosition ? (
          <g transform={`translate(${trembleX} ${trembleY + bodyBob})`}>
            <g transform={`translate(${propPosition.x} ${propPosition.y}) rotate(${propRotation})`}>
              {renderPropBetweenArms}
            </g>
          </g>
        ) : null}

        {/* ---- Brazo frontal (derecho, delante del prop) ---- */}
        <g transform={`translate(${trembleX} ${trembleY + bodyBob})`}>
          <SleeveArm shoulder={SHOULDER_R} upperDeg={rightArmU} lowerDeg={rightArmL} skinTint={SKIN} />
        </g>
      </svg>
    </div>
  );
};
