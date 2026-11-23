import React from "react";
import { interpolate } from "remotion";
import {
  computeWalkBiomechanics,
  FloorShadow,
  Point2D,
  solveTwoBoneIK,
} from "./ikMath";

/**
 * EyelessJackCharacter — Eyeless Jack, la entidad encapuchada.
 *
 * Silueta encorvada atlética con sudadera negra pesada y capucha profunda de
 * múltiples pliegues (oclusión abisal interior), máscara azul cobalto
 * agrietada SIN nariz ni boca, dos cuencas oculares hundidas en negro
 * absoluto, icor negro volumétrico cayendo de ambas cuencas con brillos
 * especulares y gotas independientes, manos enguantadas articuladas, brazo
 * frontal con 2-Bone IK (reachTarget / window_touch / climb_ledge) y bisturí
 * quirúrgico opcional.
 */

export type EyelessJackPose =
  | "crouch_weeping"
  | "stealth_walk"
  | "climb_ledge"
  | "window_touch"
  | "split_menace";

export interface EyelessJackCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  facing?: 1 | -1;
  pose: EyelessJackPose;
  localFrame: number;
  walkPhase?: number;
  holdScalpel?: boolean;
  reachTarget?: Point2D;
  renderPropBetweenArms?: React.ReactNode;
  ichorIntensity?: number;
  rimColor?: string;
  showFloorShadow?: boolean;
}

// ---- Paleta de Eyeless Jack ---------------------------------------------
const HOODIE = "#0B0E14";
const HOODIE_LIGHT = "#151B26";
const HOODIE_DARK = "#060810";
const MASK = "#1D4ED8";
const MASK_DARK = "#1E3A8A";
const MASK_DEEP = "#172554";
const MASK_RIM = "#60A5FA";
const CRACK = "#060A14";
const SOCKET = "#020306";
const ICHOR = "#04050A";
const ICHOR_LIGHT = "#141A24";
const SPEC = "#9FD8F0";
const GLOVE = "#080A10";
const GLOVE_LIGHT = "#161B26";
const BOOT = "#0A0D14";
const BOOT_LIGHT = "#1A222E";
const SCALPEL = "#C8D2DC";
const SCALPEL_DARK = "#7C8794";

const SHOULDER_L: Point2D = { x: 106, y: 306 };
const SHOULDER_R: Point2D = { x: 214, y: 306 };
const ARM_L1 = 66;
const ARM_L2 = 60;

const rad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * HoodieArm — brazo con manga de sudadera negra gruesa (26-34 px) y mano
 * enguantada. Opcionalmente sujeta el bisturí metálico dentro de la mano con
 * los dedos enguantados cerrándose sobre el mango.
 */
const HoodieArm: React.FC<{
  shoulder: Point2D;
  upperDeg: number;
  lowerDeg: number;
  rimColor: string;
  holdScalpel?: boolean;
}> = ({ shoulder, upperDeg, lowerDeg, rimColor, holdScalpel = false }) => {
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
      <circle cx={shoulder.x} cy={shoulder.y} r={13} fill={HOODIE} />
      <path d={`M ${shoulder.x - 13} ${shoulder.y - 4} C ${shoulder.x - 9} ${shoulder.y - 11}, ${shoulder.x + 9} ${shoulder.y - 11}, ${shoulder.x + 13} ${shoulder.y - 4}`} stroke={rimColor} strokeWidth={1.8} fill="none" opacity={0.5} />

      {/* Brazo superior (manga gruesa) */}
      <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upperDeg})`}>
        <path d="M 0 -14 C 20 -15, 48 -13, 66 -9 L 66 9 C 48 13, 20 15, 0 14 Z" fill={HOODIE} />
        <path d="M 4 -9 C 22 -10, 48 -9, 63 -6 L 63 -2 C 44 -2.5, 20 -2, 4 -2 Z" fill={HOODIE_LIGHT} opacity={0.55} />
        <path d="M 6 6 C 26 7, 48 6.5, 63 5 L 63 9 C 48 10, 24 10, 6 9 Z" fill={HOODIE_DARK} opacity={0.7} />
        {/* Pliegues del codo */}
        <path d="M 48 -9 C 53 -4, 55 2, 55 9 C 50 5, 48 0, 48 -9 Z" fill={HOODIE_DARK} />
        <path d="M 58 -9 C 61 -4, 62 2, 62 9 C 60 4, 59 0, 58 -9 Z" fill={HOODIE_DARK} />
        {/* Rim light a lo largo de la manga */}
        <path d="M 6 -13 C 26 -14, 50 -12, 64 -8" stroke={rimColor} strokeWidth={1.8} fill="none" opacity={0.55} />
      </g>

      {/* Antebrazo */}
      <g transform={`translate(${elbow.x} ${elbow.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -12 C 18 -12.5, 40 -11, 60 -8 L 60 8 C 40 11, 18 12.5, 0 12 Z" fill={HOODIE} />
        <path d="M 4 -8 C 18 -8.5, 40 -8, 58 -6 L 58 -2 C 38 -2.5, 16 -2.5, 4 -2.5 Z" fill={HOODIE_LIGHT} opacity={0.55} />
        <path d="M 5 6 C 22 7, 42 6.5, 58 5.5 L 58 8.5 C 42 9.5, 22 9.5, 5 8.5 Z" fill={HOODIE_DARK} opacity={0.7} />
        <path d="M 52 -8 L 60 -6 L 60 6 L 52 8 C 52 3, 52 -3, 52 -8 Z" fill={HOODIE_DARK} />
        <path d="M 6 -11 C 20 -11.5, 40 -10, 56 -7" stroke={rimColor} strokeWidth={1.6} fill="none" opacity={0.5} />
      </g>

      {/* Mano enguantada */}
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${upperDeg + lowerDeg})`}>
        <path d="M 0 -8 C 8 -9, 18 -8, 25 -4 L 25 6 C 18 9, 8 9, 0 8 Z" fill={GLOVE} />
        {holdScalpel ? (
          <g>
            {/* Bisturí metálico dentro de la mano (mango bajo los dedos) */}
            <path d="M 0 -3 L 26 -3 L 28 -2 L 28 3 L 26 4 L 0 4 Z" fill="#3A3F4A" />
            <path d="M 2 -1.5 L 24 -1.5" stroke="#5A6270" strokeWidth={1} />
            <path d="M 28 -2 C 40 -1.5, 50 -0.5, 58 1 C 48 2, 38 2.5, 28 3 Z" fill={SCALPEL} />
            <path d="M 28 0 L 56 1" stroke="#FFFFFF" strokeWidth={0.9} opacity={0.85} />
            <path d="M 28 1.4 C 38 2.2, 48 2.4, 56 2" stroke={SCALPEL_DARK} strokeWidth={0.8} fill="none" opacity={0.6} />
          </g>
        ) : null}
        {/* Dedos enguantados cerrándose sobre el mango */}
        <path d="M 6 -6 C 10 -3, 13 0, 16 3" stroke={GLOVE_LIGHT} strokeWidth={1.3} fill="none" />
        <path d="M 13 -6 C 16 -3, 18 0, 20 3" stroke={GLOVE_LIGHT} strokeWidth={1.3} fill="none" />
        <path d="M 19 -5 C 23 -3, 26 0, 28 3 C 24 1, 21 -1, 19 -5 Z" fill={GLOVE} />
        <path d="M 17 0 C 21 2, 24 4, 26 7 C 23 5, 20 3, 17 0 Z" fill={GLOVE} />
      </g>
    </g>
  );
};

export const EyelessJackCharacter: React.FC<EyelessJackCharacterProps> = (
  props
) => {
  const {
    x,
    floorY,
    scale = 1,
    facing = 1,
    pose,
    localFrame,
    walkPhase = 0,
    holdScalpel = false,
    reachTarget,
    renderPropBetweenArms,
    ichorIntensity = 1,
    rimColor = "#60A5FA",
    showFloorShadow = true,
  } = props;

  const t = localFrame;

  const breathe = 1 + Math.sin(t * 0.075) * 0.012;
  const hoodInertia = Math.sin(t * 0.05 - 0.35) * 1.6; // follow-through

  // ---- Estado por pose ---------------------------------------------------
  let bodyBob = 0;
  let torsoLean = 16;
  let headTilt = 0;
  let leftArmU = 98;
  let leftArmL = 22;
  let rightArmU = 98;
  let rightArmL = 22;
  let leftHipD = 0;
  let rightHipD = 0;
  let footLiftL = 0;
  let footLiftR = 0;
  let frontReach: Point2D | null = null;

  if (pose === "stealth_walk") {
    const walk = computeWalkBiomechanics(walkPhase, true);
    bodyBob = -walk.pelvisBobY;
    torsoLean = 16 + walk.torsoLeanDeg;
    headTilt = walk.headFollowDeg;
    leftHipD = walk.leftHipDeg;
    rightHipD = walk.rightHipDeg;
    footLiftL = walk.footLift * (Math.sin(walkPhase) > 0 ? 1 : 0);
    footLiftR = walk.footLift * (Math.sin(walkPhase + Math.PI) > 0 ? 1 : 0);
    leftArmU = 98 + walk.leftShoulderDeg;
    leftArmL = walk.leftElbowDeg;
    rightArmU = 98 + walk.rightShoulderDeg;
    rightArmL = walk.rightElbowDeg;
  } else if (pose === "crouch_weeping") {
    torsoLean = 26;
    headTilt = 16 + Math.sin(t * 0.4) * 2;
    leftHipD = 34;
    rightHipD = 34;
    // Manos cerca de la máscara, sosteniéndose la cara.
    const lt = solveTwoBoneIK(SHOULDER_L, { x: 132, y: 226 }, ARM_L1, ARM_L2, -1);
    leftArmU = lt.upperAngleDeg;
    leftArmL = lt.lowerAngleDeg;
    const rt = solveTwoBoneIK(SHOULDER_R, { x: 188, y: 226 }, ARM_L1, ARM_L2, 1);
    rightArmU = rt.upperAngleDeg;
    rightArmL = rt.lowerAngleDeg;
    frontReach = { x: 188, y: 226 };
  } else if (pose === "climb_ledge") {
    torsoLean = 8;
    headTilt = -10;
    frontReach = reachTarget ?? { x: 244, y: 128 };
    const ft = solveTwoBoneIK(SHOULDER_R, frontReach, ARM_L1, ARM_L2, 1);
    rightArmU = ft.upperAngleDeg;
    rightArmL = ft.lowerAngleDeg;
    leftArmU = 108;
    leftArmL = 30;
  } else if (pose === "window_touch") {
    torsoLean = 20;
    headTilt = 4;
    frontReach = reachTarget ?? { x: 272, y: 288 };
    const ft = solveTwoBoneIK(SHOULDER_R, frontReach, ARM_L1, ARM_L2, 1);
    rightArmU = ft.upperAngleDeg;
    rightArmL = ft.lowerAngleDeg;
    leftArmU = 104;
    leftArmL = 26;
  } else {
    // split_menace
    torsoLean = 14;
    headTilt = -6 + Math.sin(t * 0.05) * 1.2;
    leftArmU = 74;
    leftArmL = 34;
    // Mano levantada sujetando el bisturí (brazo frontal elevado).
    rightArmU = -70;
    rightArmL = 46;
    leftHipD = 0;
    rightHipD = 0;
  }

  // Icor: intensidad controla opacidad y longitud del flujo.
  const ichorO = Math.max(0.2, Math.min(1, ichorIntensity));
  const ichorPulse = 1 + Math.sin(t * 0.6) * 0.06;

  // Gotas que caen (deterministas, gravedad en p²).
  const dropPhase = (seed: number, speed: number): number => {
    const p = t * speed + seed;
    return p - Math.floor(p);
  };

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
          <linearGradient id="ej-hoodie" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={HOODIE_LIGHT} />
            <stop offset="55%" stopColor={HOODIE} />
            <stop offset="100%" stopColor={HOODIE_DARK} />
          </linearGradient>
          <linearGradient id="ej-mask" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor={MASK} />
            <stop offset="50%" stopColor={MASK_DARK} />
            <stop offset="100%" stopColor={MASK_DEEP} />
          </linearGradient>
          <linearGradient id="ej-ichor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ICHOR} />
            <stop offset="70%" stopColor={ICHOR_LIGHT} />
            <stop offset="100%" stopColor={ICHOR} />
          </linearGradient>
          <radialGradient id="ej-socket" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="100%" stopColor={SOCKET} />
          </radialGradient>
        </defs>

        {/* Sombra de contacto */}
        {showFloorShadow ? <FloorShadow cx={160} floorY={640} rx={66} opacity={0.5} /> : null}

        {/* Piernas (fuera del bob) */}
        <g>
          {/* Pierna izquierda */}
          <g transform={`translate(140 448) rotate(${90 + leftHipD})`}>
            <path d="M -10 0 C -11 24, -11 48, -9 72 L 9 72 C 11 48, 11 24, 10 0 Z" fill="#0D1118" />
          </g>
          <g transform={`translate(180 448) rotate(${90 + rightHipD})`}>
            <path d="M -10 0 C -11 24, -11 48, -9 72 L 9 72 C 11 48, 11 24, 10 0 Z" fill="#0D1118" />
          </g>
          {/* Botas */}
          <g transform={`translate(0 ${-footLiftL})`}>
            <path d="M 124 596 C 120 620, 120 632, 122 640 L 162 640 C 166 632, 166 618, 162 602 C 152 594, 132 592, 124 596 Z" fill={BOOT} />
            <path d="M 122 622 L 164 622 L 163 632 L 123 632 Z" fill={BOOT_LIGHT} opacity={0.6} />
            <path d="M 128 604 C 130 614, 130 624, 128 632" stroke={BOOT_LIGHT} strokeWidth={1.4} fill="none" opacity={0.5} />
            <path d="M 124 600 C 121 616, 121 630, 123 638" stroke={rimColor} strokeWidth={1.6} fill="none" opacity={0.5} />
          </g>
          <g transform={`translate(0 ${-footLiftR})`}>
            <path d="M 158 596 C 154 620, 154 632, 156 640 L 196 640 C 200 632, 200 618, 196 602 C 186 594, 166 592, 158 596 Z" fill={BOOT} />
            <path d="M 156 622 L 198 622 L 197 632 L 157 632 Z" fill={BOOT_LIGHT} opacity={0.6} />
            <path d="M 162 604 C 164 614, 164 624, 162 632" stroke={BOOT_LIGHT} strokeWidth={1.4} fill="none" opacity={0.5} />
            <path d="M 196 600 C 199 616, 199 630, 197 638" stroke={rimColor} strokeWidth={1.6} fill="none" opacity={0.5} />
          </g>
        </g>

        {/* Cuerpo (bob) */}
        <g transform={`translate(0 ${bodyBob})`}>
          {/* Brazo trasero (izquierdo) */}
          <HoodieArm shoulder={SHOULDER_L} upperDeg={leftArmU} lowerDeg={leftArmL} rimColor={rimColor} />

          {/* Pantalones tácticos */}
          <g>
            <path d="M 122 428 C 118 470, 116 520, 120 560 L 200 560 C 204 520, 202 470, 198 428 C 176 436, 144 436, 122 428 Z" fill="#0D1118" />
            <path d="M 140 432 C 142 460, 144 500, 146 560 L 154 560 C 154 500, 152 460, 150 432 Z" fill="#080B10" opacity={0.6} />
            <path d="M 122 428 L 198 428 L 196 444 L 124 444 Z" fill="#080B10" />
            <path d="M 146 470 C 152 486, 152 502, 148 518" stroke="#080B10" strokeWidth={1.6} fill="none" opacity={0.7} />
            <path d="M 170 470 C 166 486, 166 502, 170 518" stroke="#080B10" strokeWidth={1.6} fill="none" opacity={0.7} />
          </g>

          {/* Sudadera negra pesada (torso) */}
          <g transform={`rotate(${torsoLean} 160 350)`}>
            <path d="M 108 300 C 92 304, 86 318, 86 336 C 84 372, 92 408, 108 432 L 212 432 C 228 408, 236 372, 234 336 C 234 318, 228 304, 212 300 C 180 292, 140 292, 108 300 Z" fill="url(#ej-hoodie)" />
            <path d="M 212 300 C 226 306, 232 320, 232 340 C 232 384, 222 420, 212 432 C 220 412, 224 362, 220 324 C 218 314, 216 306, 212 300 Z" fill={HOODIE_DARK} opacity={0.7} />
            <path d="M 108 300 C 96 306, 90 318, 90 338 C 90 378, 100 416, 108 432 C 102 408, 98 362, 100 326 C 101 314, 104 304, 108 300 Z" fill={HOODIE_LIGHT} opacity={0.45} />
            {/* Cremallera y costuras */}
            <path d="M 160 300 L 160 432" stroke={HOODIE_DARK} strokeWidth={2} fill="none" />
            <path d="M 128 312 C 132 336, 136 360, 140 384" stroke={HOODIE_DARK} strokeWidth={1.6} fill="none" opacity={0.6} />
            <path d="M 192 312 C 188 336, 184 360, 180 384" stroke={HOODIE_DARK} strokeWidth={1.6} fill="none" opacity={0.6} />
            <path d="M 108 300 C 114 308, 118 314, 122 322" stroke={HOODIE_DARK} strokeWidth={1.5} fill="none" />
            <path d="M 212 300 C 206 308, 202 314, 198 322" stroke={HOODIE_DARK} strokeWidth={1.5} fill="none" />
            {/* Dobladillo */}
            <path d="M 108 432 L 212 432 L 210 440 L 110 440 Z" fill={HOODIE_DARK} opacity={0.8} />
            {/* Rim light en los hombros de la sudadera */}
            <path d="M 108 300 C 118 296, 140 292, 160 292" stroke={rimColor} strokeWidth={2} fill="none" opacity={0.6} />
            <path d="M 212 300 C 202 296, 180 292, 160 292" stroke={rimColor} strokeWidth={2} fill="none" opacity={0.6} />
          </g>

          {/* ---- Capucha (detrás de la máscara) ---- */}
          <g transform={`translate(160 250) scale(${breathe}) translate(-160 -250) rotate(${headTilt + hoodInertia} 160 250)`}>
            {/* Capucha trasera ancha */}
            <path d="M 108 140 C 100 200, 104 270, 120 304 L 200 304 C 216 270, 220 200, 212 140 C 206 108, 114 108, 108 140 Z" fill="url(#ej-hoodie)" />
            {/* Pliegues internos de la capucha */}
            <path d="M 116 150 C 112 200, 116 252, 128 288 C 122 252, 120 200, 122 154 Z" fill={HOODIE_DARK} opacity={0.75} />
            <path d="M 204 150 C 208 200, 204 252, 192 288 C 198 252, 200 200, 198 154 Z" fill={HOODIE_DARK} opacity={0.75} />
            {/* Oclusión abisal interior */}
            <path d="M 126 160 C 124 210, 128 260, 138 292 L 182 292 C 192 260, 196 210, 194 160 C 172 176, 148 176, 126 160 Z" fill="#020308" />
            <path d="M 134 176 C 132 216, 136 256, 144 284 C 138 252, 136 210, 138 178 Z" fill="#010208" />

            {/* ---- Máscara azul cobalto ---- */}
            <g>
              <path d="M 128 164 C 130 136, 190 136, 192 164 C 196 194, 194 218, 188 242 C 184 256, 136 256, 132 242 C 126 218, 124 194, 128 164 Z" fill="url(#ej-mask)" />
              {/* Volumen lateral (sombra) */}
              <path d="M 190 164 C 194 190, 193 214, 188 240 C 192 216, 194 190, 192 166 Z" fill={MASK_DEEP} opacity={0.8} />
              {/* Luz de borde fría */}
              <path d="M 130 164 C 128 140, 156 132, 172 132" stroke={MASK_RIM} strokeWidth={2} fill="none" opacity={0.55} />
              <path d="M 126 218 C 124 194, 126 178, 130 164 C 126 186, 126 208, 130 234" stroke={MASK_RIM} strokeWidth={1.4} fill="none" opacity={0.35} />
              {/* Reflejo superior */}
              <path d="M 136 156 C 144 146, 176 146, 184 156 C 174 150, 146 150, 136 156 Z" fill={MASK_RIM} opacity={0.28} />

              {/* Cuencas oculares hundidas en negro absoluto */}
              <path d="M 128 192 C 134 180, 152 180, 158 196 C 152 210, 134 210, 128 192 Z" fill="url(#ej-socket)" />
              <path d="M 162 192 C 168 180, 186 180, 192 196 C 186 210, 168 210, 162 192 Z" fill="url(#ej-socket)" />
              {/* Bisel interior sombreado */}
              <path d="M 130 192 C 135 183, 150 183, 156 195 C 150 205, 136 205, 130 192 Z" fill="none" stroke={MASK_DEEP} strokeWidth={1.6} opacity={0.9} />
              <path d="M 164 192 C 169 183, 184 183, 190 195 C 184 205, 170 205, 164 192 Z" fill="none" stroke={MASK_DEEP} strokeWidth={1.6} opacity={0.9} />

              {/* Grietas finas */}
              <path d="M 132 160 C 136 174, 136 188, 130 200" stroke={CRACK} strokeWidth={1.2} fill="none" />
              <path d="M 140 244 C 142 234, 140 224, 136 214" stroke={CRACK} strokeWidth={1.1} fill="none" />
              <path d="M 188 244 C 186 232, 188 220, 194 208" stroke={CRACK} strokeWidth={1.1} fill="none" />
              <path d="M 186 168 C 180 178, 178 188, 180 198" stroke={CRACK} strokeWidth={1} fill="none" />
              <path d="M 158 152 C 160 162, 158 172, 154 180" stroke={CRACK} strokeWidth={1} fill="none" opacity={0.8} />
              <path d="M 162 252 C 160 244, 162 236, 168 230" stroke={CRACK} strokeWidth={1} fill="none" opacity={0.8} />
              <path d="M 148 166 C 146 176, 148 186, 150 194" stroke={CRACK} strokeWidth={0.9} fill="none" opacity={0.7} />
              <path d="M 172 166 C 174 176, 172 186, 170 194" stroke={CRACK} strokeWidth={0.9} fill="none" opacity={0.7} />
              {/* Desgaste superficial */}
              <path d="M 138 230 C 142 226, 148 226, 150 230" stroke={MASK_DEEP} strokeWidth={1} fill="none" opacity={0.6} />
              <path d="M 172 232 C 176 228, 182 228, 184 232" stroke={MASK_DEEP} strokeWidth={1} fill="none" opacity={0.6} />

              {/* ---- Icor negro volumétrico (cuenca izquierda) ---- */}
              <g opacity={ichorO}>
                <path d="M 132 204 C 130 218, 130 234, 136 252 C 140 266, 134 274, 130 282 C 134 276, 138 266, 138 254 C 140 240, 138 220, 136 206 Z" fill="url(#ej-ichor)" />
                <path d="M 134 208 C 133 220, 134 236, 138 250" stroke={SPEC} strokeWidth={1} fill="none" opacity={0.5} />
                <path d="M 130 250 C 132 258, 132 266, 130 276" stroke={SPEC} strokeWidth={0.8} fill="none" opacity={0.35} />
              </g>
              {/* ---- Icor (cuenca derecha) ---- */}
              <g opacity={ichorO}>
                <path d="M 188 204 C 190 218, 190 234, 184 252 C 180 266, 186 274, 190 282 C 186 276, 182 266, 182 254 C 180 240, 182 220, 184 206 Z" fill="url(#ej-ichor)" />
                <path d="M 186 208 C 187 220, 186 236, 182 250" stroke={SPEC} strokeWidth={1} fill="none" opacity={0.5} />
                <path d="M 190 250 C 188 258, 188 266, 190 276" stroke={SPEC} strokeWidth={0.8} fill="none" opacity={0.35} />
              </g>

              {/* Gotas de icor cayendo (deterministas) */}
              {[0.12, 0.48, 0.83].map((seed, i) => {
                const p = dropPhase(seed, 0.16 + i * 0.03);
                const dy = p * p * 150 * ichorPulse;
                const ox = i === 0 ? 132 : i === 1 ? 160 : 188;
                const op = interpolate(p, [0, 0.7, 1], [0, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <g key={i} opacity={op * ichorO}>
                    <path
                      d={`M ${ox} ${280 + dy} C ${ox - 3} ${276 + dy}, ${ox - 2} ${270 + dy}, ${ox} ${267 + dy} C ${ox + 2} ${270 + dy}, ${ox + 3} ${276 + dy}, ${ox} ${280 + dy} Z`}
                      fill={ICHOR}
                    />
                    <circle cx={ox - 1} cy={273 + dy} r={0.7} fill={SPEC} opacity={0.7} />
                  </g>
                );
              })}
            </g>

            {/* ---- Borde frontal de la capucha (enmarca la máscara) ---- */}
            <path d="M 122 152 C 120 200, 124 256, 134 294 L 186 294 C 196 256, 200 200, 198 152 C 172 168, 148 168, 122 152 Z" fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.4} />
            <path d="M 126 160 C 124 204, 128 252, 136 288" stroke={rimColor} strokeWidth={1.4} fill="none" opacity={0.3} />
            <path d="M 194 160 C 196 204, 192 252, 184 288" stroke={rimColor} strokeWidth={1.4} fill="none" opacity={0.3} />

            {/* Cordones dinámicos con inercia */}
            <path d="M 150 292 C 152 302, 150 312, 146 320" stroke={HOODIE_DARK} strokeWidth={2.2} fill="none" />
            <circle cx={146} cy={322} r={2.4} fill={HOODIE_DARK} />
            <path d="M 170 292 C 168 302, 170 312, 174 320" stroke={HOODIE_DARK} strokeWidth={2.2} fill="none" />
            <circle cx={174} cy={322} r={2.4} fill={HOODIE_DARK} />
          </g>
        </g>

        {/* ---- Prop interactivo (entre brazo trasero y frontal) ---- */}
        {renderPropBetweenArms}

        {/* ---- Brazo frontal (derecho, delante del prop) ---- */}
        <g transform={`translate(0 ${bodyBob})`}>
          <HoodieArm
            shoulder={SHOULDER_R}
            upperDeg={rightArmU}
            lowerDeg={rightArmL}
            rimColor={rimColor}
            holdScalpel={holdScalpel}
          />
        </g>
      </svg>
    </div>
  );
};
