import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * HumanBase.tsx — Stock Vectorial Humano 2.5D Reutilizable (Estándar v9).
 *
 * PROHIBIDO MODIFICAR POR OPENCODE: Este rig base es propiedad exclusiva del
 * director visual (Gemini) y se instancia vía props desde las escenas.
 *
 * Principios de construcción:
 *  - Estilo Kurzgesagt oscuro / Zalgo Short (~40 formas vectoriales limpias,
 *    contorno oscuro uniforme, sombreado cel-shaded suave y rim light).
 *  - Anclajes matemáticos compartidos (`HUMAN_ANCHORS`): cuello, hombros,
 *    caderas, rodillas, tobillos y `FLOOR_Y` exactamente acoplados mediante
 *    grupos `<g transform="translate(...) rotate(...)">` con juntas orgánicas
 *    sin costuras visibles, imposibilitando desprendimientos o flotaciones.
 *  - 100% determinista vía `useCurrentFrame()`.
 */

export const HUMAN_ANCHORS = {
  VIEWBOX_W: 360,
  VIEWBOX_H: 640,
  CX: 180,
  HEAD_CY: 132,
  NECK_Y: 206,
  SHOULDER_Y: 238,
  SHOULDER_X: 52,
  UPPER_ARM_LEN: 72,
  FOREARM_LEN: 66,
  WAIST_Y: 360,
  HIP_Y: 378,
  HIP_X: 25,
  THIGH_LEN: 100,
  SHIN_LEN: 96,
  FOOT_HEIGHT: 26,
  /** 378 + 100 + 96 + 26 = 600 — suelas apoyadas exactamente en FLOOR_Y. */
  FLOOR_Y: 600,
} as const;

export type HumanVariant = "kid_96" | "investigator" | "mother";

export type HumanHairStyle =
  | "messy_bob"
  | "short_neat"
  | "shoulder_wave"
  | "spiky_retro";

export type HumanEmotion =
  | "neutral"
  | "curious"
  | "melancholy"
  | "uneasy"
  | "headache"
  | "terrified"
  | "hollow_stare";

export type HumanPose =
  | "standing"
  | "holding_gameboy"
  | "hands_on_ears"
  | "sitting_bed"
  | "walking"
  | "reaching"
  | "slumped"
  | "looking_up";

export interface HumanBaseProps {
  variant?: HumanVariant;
  hairStyle?: HumanHairStyle;
  hairColor?: string;
  skinTone?: string;
  shirtColor?: string;
  shirtAccent?: string;
  pantsColor?: string;
  shoeColor?: string;
  rimColor?: string;
  rimIntensity?: number;
  emotion?: HumanEmotion;
  pose?: HumanPose;
  facing?: "right" | "left";
  headphones?: boolean;
  glasses?: boolean;
  /** 0..1 intensidad de sangrado nasal (Escena 2). */
  nosebleed?: number;
  /** Dirección de la mirada en px locales (-6..6). */
  eyeLookX?: number;
  eyeLookY?: number;
  /** Offset opcional de inclinación de cabeza (grados). */
  headTilt?: number;
  /** Mostrar sombra elíptica de contacto en FLOOR_Y. */
  showShadow?: boolean;
  /** Frame local opcional (por defecto usa useCurrentFrame()). */
  localFrame?: number;
  /** Prefijo único para evitar colisiones de IDs en <defs>. */
  idPrefix?: string;
  style?: React.CSSProperties;
}

interface VariantDefaults {
  hairStyle: HumanHairStyle;
  hairColor: string;
  hairHighlight: string;
  skinTone: string;
  shirtColor: string;
  shirtAccent: string;
  pantsColor: string;
  shoeColor: string;
  bodyScaleY: number;
  headScale: number;
  shoulderWidth: number;
}

const VARIANT_PRESETS: Record<HumanVariant, VariantDefaults> = {
  kid_96: {
    hairStyle: "messy_bob",
    hairColor: "#171829",
    hairHighlight: "#3B3E63",
    skinTone: "#E8C9B5",
    shirtColor: "#3D356B",
    shirtAccent: "#9D8BE0",
    pantsColor: "#1E223A",
    shoeColor: "#D6D3E3",
    bodyScaleY: 0.94,
    headScale: 1.06,
    shoulderWidth: 48,
  },
  investigator: {
    hairStyle: "short_neat",
    hairColor: "#1E2233",
    hairHighlight: "#47506E",
    skinTone: "#E0C0A9",
    shirtColor: "#263347",
    shirtAccent: "#748CAB",
    pantsColor: "#141A29",
    shoeColor: "#2C3140",
    bodyScaleY: 1.03,
    headScale: 1.0,
    shoulderWidth: 54,
  },
  mother: {
    hairStyle: "shoulder_wave",
    hairColor: "#22182E",
    hairHighlight: "#513B69",
    skinTone: "#E7C7B2",
    shirtColor: "#4D3354",
    shirtAccent: "#B388B8",
    pantsColor: "#251C33",
    shoeColor: "#352B42",
    bodyScaleY: 1.0,
    headScale: 1.0,
    shoulderWidth: 48,
  },
};

const OUTLINE = "#090A12";
const STROKE_W = 2.8;

interface PoseRig {
  pelvisY: number;
  torsoTilt: number;
  headRot: number;
  lShoulder: number;
  lElbow: number;
  rShoulder: number;
  rElbow: number;
  lHip: number;
  lKnee: number;
  rHip: number;
  rKnee: number;
  /** When true, BOTH arms render in front of torso (e.g. holding a Game Boy or hands on ears). */
  bothArmsFront?: boolean;
}

function computePose(pose: HumanPose, f: number): PoseRig {
  const breathe = Math.sin(f * 0.08);
  const micro = Math.sin(f * 0.045 + 1.1);
  const walk = Math.sin(f * 0.16);
  const shiver = Math.sin(f * 0.55) * 1.4;

  switch (pose) {
    case "holding_gameboy":
      // Positive angle rotates (0,+y) left; negative angle rotates (0,+y) right.
      // Left arm angles slightly outward (+24), forearm folds inward (-88) -> hand meets chest center!
      // Right arm angles slightly outward (-24), forearm folds inward (+88) -> hand meets chest center!
      return {
        pelvisY: breathe * 1.5,
        torsoTilt: 4 + breathe * 0.6,
        headRot: 11 + micro * 1.5,
        lShoulder: 22 + breathe * 1.1,
        lElbow: -84 - breathe * 1.1,
        rShoulder: -22 - breathe * 1.1,
        rElbow: 84 + breathe * 1.1,
        lHip: -4,
        lKnee: 5,
        rHip: 4,
        rKnee: -3,
        bothArmsFront: true,
      };
    case "hands_on_ears":
      // Left arm lifts outward-up (+126) and folds sharply inward (+116) onto left ear/headphone.
      // Right arm mirrors (-126, -116) onto right ear/headphone.
      return {
        pelvisY: 4 + breathe * 1.8,
        torsoTilt: 6 + shiver * 0.5,
        headRot: 6 + shiver * 1.2,
        lShoulder: 126 + shiver * 1.4,
        lElbow: 114 - shiver,
        rShoulder: -126 - shiver * 1.4,
        rElbow: -114 + shiver,
        lHip: -7,
        lKnee: 10,
        rHip: 7,
        rKnee: -7,
        bothArmsFront: true,
      };
    case "sitting_bed":
      return {
        pelvisY: 42 + breathe * 1.4,
        torsoTilt: 3 + breathe * 0.7,
        headRot: 8 + micro * 1.6,
        lShoulder: 18 + breathe,
        lElbow: -62,
        rShoulder: -18 - breathe,
        rElbow: 62,
        lHip: -60,
        lKnee: 70,
        rHip: -52,
        rKnee: 62,
        bothArmsFront: true,
      };
    case "walking":
      return {
        pelvisY: Math.abs(walk) * -3.5,
        torsoTilt: 3 + walk * 1.4,
        headRot: -2 + micro * 1.4,
        lShoulder: walk * 24,
        lElbow: -14 - Math.max(0, walk) * 14,
        rShoulder: -walk * 24,
        rElbow: 14 + Math.max(0, -walk) * 14,
        lHip: -walk * 20,
        lKnee: Math.max(0, walk * 24),
        rHip: walk * 20,
        rKnee: Math.max(0, -walk * 24),
      };
    case "reaching":
      return {
        pelvisY: breathe * 1.5,
        torsoTilt: -4 + breathe * 0.6,
        headRot: -4 + micro * 1.4,
        lShoulder: 14 + breathe,
        lElbow: 10,
        rShoulder: -72 + breathe * 2,
        rElbow: -22,
        lHip: -4,
        lKnee: 4,
        rHip: 6,
        rKnee: -2,
      };
    case "slumped":
      return {
        pelvisY: 10 + breathe * 1.2,
        torsoTilt: 10 + breathe * 0.6,
        headRot: 16 + micro * 1.2,
        lShoulder: 10 + breathe,
        lElbow: -8,
        rShoulder: -10 - breathe,
        rElbow: 8,
        lHip: -5,
        lKnee: 8,
        rHip: 5,
        rKnee: -5,
      };
    case "looking_up":
      return {
        pelvisY: breathe * 1.5,
        torsoTilt: -3 + breathe * 0.6,
        headRot: -12 + micro * 1.2,
        lShoulder: 10 + breathe,
        lElbow: -8,
        rShoulder: -10 - breathe,
        rElbow: 8,
        lHip: -3,
        lKnee: 2,
        rHip: 3,
        rKnee: -2,
      };
    case "standing":
    default:
      return {
        pelvisY: breathe * 1.5,
        torsoTilt: breathe * 0.5,
        headRot: micro * 1.8,
        lShoulder: 11 + breathe * 1.4,
        lElbow: -8,
        rShoulder: -11 - breathe * 1.4,
        rElbow: 8,
        lHip: -3,
        lKnee: 2,
        rHip: 3,
        rKnee: -2,
      };
  }
}

export const HumanBase: React.FC<HumanBaseProps> = ({
  variant = "kid_96",
  hairStyle,
  hairColor,
  skinTone,
  shirtColor,
  shirtAccent,
  pantsColor,
  shoeColor,
  rimColor = "#A78BFA",
  rimIntensity = 0.75,
  emotion = "neutral",
  pose = "standing",
  facing = "right",
  headphones = false,
  glasses = false,
  nosebleed = 0,
  eyeLookX = 0,
  eyeLookY = 0,
  headTilt = 0,
  showShadow = true,
  localFrame,
  idPrefix = "hb",
  style,
}) => {
  const ctxFrame = useCurrentFrame();
  const f = localFrame ?? ctxFrame;

  const preset = VARIANT_PRESETS[variant];
  const finalHairStyle = hairStyle ?? preset.hairStyle;
  const finalHair = hairColor ?? preset.hairColor;
  const finalSkin = skinTone ?? preset.skinTone;
  const finalShirt = shirtColor ?? preset.shirtColor;
  const finalAccent = shirtAccent ?? preset.shirtAccent;
  const finalPants = pantsColor ?? preset.pantsColor;
  const finalShoe = shoeColor ?? preset.shoeColor;

  const rig = computePose(pose, f);
  const sx = preset.shoulderWidth;
  const {
    CX,
    HEAD_CY,
    NECK_Y,
    SHOULDER_Y,
    HIP_Y,
    HIP_X,
    FLOOR_Y,
    UPPER_ARM_LEN,
    FOREARM_LEN,
    THIGH_LEN,
    SHIN_LEN,
  } = HUMAN_ANCHORS;

  // Deterministic natural blink
  const blinkCycle = f % 108;
  const isBlinking =
    emotion !== "terrified" &&
    emotion !== "hollow_stare" &&
    blinkCycle >= 98 &&
    blinkCycle <= 102;

  const lookX = Math.max(-5, Math.min(5, eyeLookX));
  const lookY = Math.max(-3.5, Math.min(3.5, eyeLookY));
  const bleed = Math.max(0, Math.min(1, nosebleed));

  const pupilR =
    emotion === "terrified"
      ? 3.2
      : emotion === "hollow_stare"
        ? 2.5
        : emotion === "headache"
          ? 4.0
          : 5.2;

  const showEyeBags =
    emotion === "melancholy" ||
    emotion === "headache" ||
    emotion === "terrified" ||
    emotion === "hollow_stare";

  /** Seamless articulated arm: anchored strictly at (CX ± sx, SHOULDER_Y). */
  const renderArm = (side: "left" | "right") => {
    const isLeft = side === "left";
    const anchorX = isLeft ? CX - sx : CX + sx;
    const shoulderAngle = isLeft ? rig.lShoulder : rig.rShoulder;
    const elbowAngle = isLeft ? rig.lElbow : rig.rElbow;

    return (
      <g
        key={side}
        transform={`translate(${anchorX}, ${SHOULDER_Y}) rotate(${shoulderAngle})`}
      >
        {/* Upper arm capsule */}
        <rect
          x={-13}
          y={-12}
          width={26}
          height={UPPER_ARM_LEN + 20}
          rx={13}
          fill={`url(#${idPrefix}-shirt)`}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
        />
        {/* Rim light on outer arm edge */}
        <path
          d={isLeft ? `M -9 4 L -9 ${UPPER_ARM_LEN - 8}` : `M 9 4 L 9 ${UPPER_ARM_LEN - 8}`}
          stroke={rimColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={rimIntensity * 0.55}
        />
        {/* Forearm nested at exact elbow pivot (0, UPPER_ARM_LEN) */}
        <g transform={`translate(0, ${UPPER_ARM_LEN}) rotate(${elbowAngle})`}>
          <rect
            x={-11.5}
            y={-10}
            width={23}
            height={FOREARM_LEN - 4}
            rx={11.5}
            fill={`url(#${idPrefix}-shirt)`}
            stroke={OUTLINE}
            strokeWidth={STROKE_W}
          />
          {/* Seamless elbow joint patch (hides overlapping capsule stroke line) */}
          <circle cx={0} cy={0} r={10.2} fill={`url(#${idPrefix}-shirt)`} />
          {/* Wrist cuff */}
          <rect
            x={-11.5}
            y={FOREARM_LEN - 24}
            width={23}
            height={9}
            rx={4}
            fill={finalAccent}
            stroke={OUTLINE}
            strokeWidth={2.2}
          />
          {/* Stylized clean hand anchored at wrist */}
          <g transform={`translate(0, ${FOREARM_LEN - 9})`}>
            <path
              d="M -9 0 C -11 10, -8 21, 0 22 C 8 21, 11 10, 9 0 Z"
              fill={`url(#${idPrefix}-skin)`}
              stroke={OUTLINE}
              strokeWidth={STROKE_W - 0.3}
            />
            <path
              d={
                isLeft
                  ? "M 7 4 C 13 6, 13 13, 8 15"
                  : "M -7 4 C -13 6, -13 13, -8 15"
              }
              fill={`url(#${idPrefix}-skin)`}
              stroke={OUTLINE}
              strokeWidth={2.3}
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    );
  };

  /** Seamless articulated leg: anchored strictly at (CX ± HIP_X, HIP_Y), sole touches FLOOR_Y. */
  const renderLeg = (side: "left" | "right") => {
    const isLeft = side === "left";
    const anchorX = isLeft ? CX - HIP_X : CX + HIP_X;
    const hipAngle = isLeft ? rig.lHip : rig.rHip;
    const kneeAngle = isLeft ? rig.lKnee : rig.rKnee;

    return (
      <g
        key={side}
        transform={`translate(${anchorX}, ${HIP_Y}) rotate(${hipAngle})`}
      >
        {/* Thigh */}
        <rect
          x={-16}
          y={-14}
          width={32}
          height={THIGH_LEN + 24}
          rx={15}
          fill={`url(#${idPrefix}-pants)`}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
        />
        {/* Shin nested at exact knee pivot (0, THIGH_LEN) */}
        <g transform={`translate(0, ${THIGH_LEN}) rotate(${kneeAngle})`}>
          <rect
            x={-13.5}
            y={-10}
            width={27}
            height={SHIN_LEN + 14}
            rx={13}
            fill={`url(#${idPrefix}-pants)`}
            stroke={OUTLINE}
            strokeWidth={STROKE_W}
          />
          {/* Seamless knee joint patch (removes horizontal doll-joint seam) */}
          <circle cx={0} cy={0} r={12.2} fill={`url(#${idPrefix}-pants)`} />
          {/* Sneaker/shoe anchored at ankle (0, SHIN_LEN), bottom = y+26 = FLOOR_Y */}
          <g transform={`translate(0, ${SHIN_LEN})`}>
            <path
              d="M -14 0 L 14 0 C 18 4, 24 10, 24 19 C 24 23, 21 26, 16 26 L -15 26 C -19 26, -20 22, -19 16 Z"
              fill={finalShoe}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            <path
              d="M -18 20 L 23 20 L 23 24 C 23 25.5, 20 26, 16 26 L -15 26 C -18 26, -19 24, -18 20 Z"
              fill="#0F111A"
            />
          </g>
        </g>
      </g>
    );
  };

  const renderMouth = () => {
    const mx = CX + 6;
    const my = HEAD_CY + 30;
    switch (emotion) {
      case "terrified":
        return (
          <path
            d={`M ${mx - 12} ${my + 2} C ${mx - 8} ${my - 9}, ${mx + 8} ${my - 9}, ${mx + 12} ${my + 2} C ${mx + 9} ${my + 13}, ${mx - 9} ${my + 13}, ${mx - 12} ${my + 2} Z`}
            fill="#140C18"
            stroke={OUTLINE}
            strokeWidth={2.4}
          />
        );
      case "headache":
        return (
          <path
            d={`M ${mx - 11} ${my + 5} Q ${mx} ${my - 4}, ${mx + 11} ${my + 5}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      case "melancholy":
      case "uneasy":
        return (
          <path
            d={`M ${mx - 10} ${my + 4} Q ${mx} ${my - 1}, ${mx + 10} ${my + 4}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        );
      case "hollow_stare":
        return (
          <line
            x1={mx - 8}
            y1={my + 2}
            x2={mx + 8}
            y2={my + 2}
            stroke={OUTLINE}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        );
      case "curious":
        return (
          <ellipse
            cx={mx}
            cy={my + 2}
            rx={5.2}
            ry={6.2}
            fill="#1F1626"
            stroke={OUTLINE}
            strokeWidth={2.2}
          />
        );
      case "neutral":
      default:
        return (
          <path
            d={`M ${mx - 9} ${my + 1} Q ${mx} ${my + 6}, ${mx + 9} ${my + 1}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        );
    }
  };

  /** Hair back sits BEHIND neck & head (never wraps across throat). */
  const renderHairBack = () => {
    if (finalHairStyle === "shoulder_wave") {
      return (
        <path
          d={`M ${CX - 60} ${HEAD_CY - 14}
              C ${CX - 70} ${HEAD_CY + 24}, ${CX - 72} ${NECK_Y + 18}, ${CX - 52} ${NECK_Y + 34}
              C ${CX - 34} ${NECK_Y + 26}, ${CX - 20} ${NECK_Y + 28}, ${CX} ${NECK_Y + 24}
              C ${CX + 26} ${NECK_Y + 28}, ${CX + 46} ${NECK_Y + 30}, ${CX + 56} ${NECK_Y + 18}
              C ${CX + 62} ${HEAD_CY + 30}, ${CX + 60} ${HEAD_CY - 12}, ${CX + 54} ${HEAD_CY - 22}
              C ${CX + 44} ${HEAD_CY - 68}, ${CX - 48} ${HEAD_CY - 70}, ${CX - 60} ${HEAD_CY - 14} Z`}
          fill={finalHair}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
        />
      );
    }
    if (finalHairStyle === "short_neat") {
      return (
        <path
          d={`M ${CX - 56} ${HEAD_CY + 8}
              C ${CX - 60} ${HEAD_CY - 46}, ${CX - 26} ${HEAD_CY - 68}, ${CX + 4} ${HEAD_CY - 66}
              C ${CX + 38} ${HEAD_CY - 64}, ${CX + 56} ${HEAD_CY - 40}, ${CX + 54} ${HEAD_CY - 4}
              L ${CX - 56} ${HEAD_CY + 8} Z`}
          fill={finalHair}
          stroke={OUTLINE}
          strokeWidth={STROKE_W}
        />
      );
    }
    // messy_bob / spiky_retro back silhouette
    return (
      <path
        d={`M ${CX - 60} ${HEAD_CY + 14}
            C ${CX - 66} ${HEAD_CY - 38}, ${CX - 36} ${HEAD_CY - 68}, ${CX + 2} ${HEAD_CY - 66}
            C ${CX + 40} ${HEAD_CY - 64}, ${CX + 60} ${HEAD_CY - 36}, ${CX + 56} ${HEAD_CY + 6}
            L ${CX - 60} ${HEAD_CY + 14} Z`}
        fill={finalHair}
        stroke={OUTLINE}
        strokeWidth={STROKE_W}
      />
    );
  };

  const renderHairFront = () => {
    const highlight = (
      <path
        d={`M ${CX - 26} ${HEAD_CY - 48} Q ${CX + 6} ${HEAD_CY - 58}, ${CX + 32} ${HEAD_CY - 44}`}
        fill="none"
        stroke={preset.hairHighlight}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.75}
      />
    );

    switch (finalHairStyle) {
      case "short_neat":
        return (
          <g>
            <path
              d={`M ${CX - 56} ${HEAD_CY - 4}
                  C ${CX - 58} ${HEAD_CY - 54}, ${CX - 18} ${HEAD_CY - 70}, ${CX + 12} ${HEAD_CY - 66}
                  C ${CX + 42} ${HEAD_CY - 62}, ${CX + 58} ${HEAD_CY - 36}, ${CX + 54} ${HEAD_CY - 12}
                  C ${CX + 36} ${HEAD_CY - 28}, ${CX + 14} ${HEAD_CY - 36}, ${CX - 10} ${HEAD_CY - 22}
                  C ${CX - 28} ${HEAD_CY - 12}, ${CX - 42} ${HEAD_CY - 16}, ${CX - 46} ${HEAD_CY + 6}
                  L ${CX - 56} ${HEAD_CY - 4} Z`}
              fill={finalHair}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            {highlight}
          </g>
        );
      case "spiky_retro":
        return (
          <g>
            <path
              d={`M ${CX - 58} ${HEAD_CY - 4}
                  C ${CX - 64} ${HEAD_CY - 56}, ${CX - 22} ${HEAD_CY - 78}, ${CX + 4} ${HEAD_CY - 68}
                  L ${CX + 18} ${HEAD_CY - 78} L ${CX + 26} ${HEAD_CY - 62}
                  C ${CX + 52} ${HEAD_CY - 56}, ${CX + 62} ${HEAD_CY - 28}, ${CX + 56} ${HEAD_CY - 10}
                  C ${CX + 38} ${HEAD_CY - 24}, ${CX + 18} ${HEAD_CY - 32}, ${CX + 4} ${HEAD_CY - 18}
                  L ${CX - 14} ${HEAD_CY - 30} L ${CX - 32} ${HEAD_CY - 14} Z`}
              fill={finalHair}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            {highlight}
          </g>
        );
      case "shoulder_wave":
        return (
          <g>
            {/* Side-parted swept bangs framing forehead cleanly */}
            <path
              d={`M ${CX - 58} ${HEAD_CY + 10}
                  C ${CX - 62} ${HEAD_CY - 50}, ${CX - 22} ${HEAD_CY - 70}, ${CX + 10} ${HEAD_CY - 66}
                  C ${CX + 44} ${HEAD_CY - 62}, ${CX + 60} ${HEAD_CY - 34}, ${CX + 56} ${HEAD_CY - 6}
                  C ${CX + 44} ${HEAD_CY - 26}, ${CX + 20} ${HEAD_CY - 38}, ${CX - 6} ${HEAD_CY - 26}
                  C ${CX - 30} ${HEAD_CY - 16}, ${CX - 46} ${HEAD_CY + 4}, ${CX - 52} ${HEAD_CY + 30}
                  C ${CX - 56} ${HEAD_CY + 22}, ${CX - 58} ${HEAD_CY + 16}, ${CX - 58} ${HEAD_CY + 10} Z`}
              fill={finalHair}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            {highlight}
          </g>
        );
      case "messy_bob":
      default:
        return (
          <g>
            <path
              d={`M ${CX - 58} ${HEAD_CY + 2}
                  C ${CX - 62} ${HEAD_CY - 54}, ${CX - 22} ${HEAD_CY - 70}, ${CX + 8} ${HEAD_CY - 68}
                  C ${CX + 40} ${HEAD_CY - 66}, ${CX + 58} ${HEAD_CY - 40}, ${CX + 56} ${HEAD_CY - 12}
                  C ${CX + 42} ${HEAD_CY - 26}, ${CX + 28} ${HEAD_CY - 16}, ${CX + 18} ${HEAD_CY - 28}
                  C ${CX + 6} ${HEAD_CY - 14}, ${CX - 8} ${HEAD_CY - 28}, ${CX - 22} ${HEAD_CY - 14}
                  C ${CX - 36} ${HEAD_CY - 24}, ${CX - 48} ${HEAD_CY - 4}, ${CX - 58} ${HEAD_CY + 2} Z`}
              fill={finalHair}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />
            {highlight}
          </g>
        );
    }
  };

  const renderEyes = () => {
    const leftX = CX - 13;
    const rightX = CX + 25;
    const ey = HEAD_CY + 2;

    if (isBlinking || emotion === "headache") {
      const curve = emotion === "headache" ? -5 : 4;
      return (
        <g>
          <path
            d={`M ${leftX - 10} ${ey} Q ${leftX} ${ey + curve}, ${leftX + 10} ${ey}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <path
            d={`M ${rightX - 10} ${ey} Q ${rightX} ${ey + curve}, ${rightX + 10} ${ey}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        </g>
      );
    }

    const eyeRy = emotion === "terrified" ? 13 : emotion === "hollow_stare" ? 11.5 : 10.5;
    const scleraFill = emotion === "hollow_stare" ? "#DCE0EC" : "#F6F5F2";

    return (
      <g>
        {showEyeBags && (
          <>
            <path
              d={`M ${leftX - 10} ${ey + 14} Q ${leftX} ${ey + 18}, ${leftX + 9} ${ey + 13}`}
              fill="none"
              stroke="#6B5A7A"
              strokeWidth={2.4}
              opacity={0.55}
              strokeLinecap="round"
            />
            <path
              d={`M ${rightX - 9} ${ey + 13} Q ${rightX} ${ey + 18}, ${rightX + 10} ${ey + 14}`}
              fill="none"
              stroke="#6B5A7A"
              strokeWidth={2.4}
              opacity={0.55}
              strokeLinecap="round"
            />
          </>
        )}
        {[leftX, rightX].map((ex, idx) => (
          <g key={idx}>
            <ellipse
              cx={ex}
              cy={ey}
              rx={10.5}
              ry={eyeRy}
              fill={scleraFill}
              stroke={OUTLINE}
              strokeWidth={2.5}
            />
            <circle cx={ex + lookX} cy={ey + lookY} r={pupilR} fill="#0B0C14" />
            {emotion !== "hollow_stare" && (
              <circle
                cx={ex + lookX - 2.1}
                cy={ey + lookY - 2.2}
                r={1.8}
                fill="#FFFFFF"
                opacity={0.92}
              />
            )}
            {(emotion === "melancholy" || emotion === "uneasy") && (
              <path
                d={`M ${ex - 11} ${ey - 4} Q ${ex} ${ey - 9}, ${ex + 11} ${ey - 4} L ${ex + 11} ${ey - 13} L ${ex - 11} ${ey - 13} Z`}
                fill={finalSkin}
              />
            )}
          </g>
        ))}
      </g>
    );
  };

  const renderEyebrows = () => {
    const leftX = CX - 13;
    const rightX = CX + 25;
    const by = HEAD_CY - 16;

    if (emotion === "terrified" || emotion === "curious") {
      return (
        <g stroke={OUTLINE} strokeWidth={3.2} strokeLinecap="round" fill="none">
          <path d={`M ${leftX - 11} ${by - 3} Q ${leftX} ${by - 10}, ${leftX + 10} ${by - 5}`} />
          <path d={`M ${rightX - 10} ${by - 5} Q ${rightX} ${by - 10}, ${rightX + 11} ${by - 3}`} />
        </g>
      );
    }
    if (emotion === "headache" || emotion === "uneasy") {
      return (
        <g stroke={OUTLINE} strokeWidth={3.4} strokeLinecap="round" fill="none">
          <path d={`M ${leftX - 11} ${by - 1} L ${leftX + 10} ${by + 4}`} />
          <path d={`M ${rightX - 10} ${by + 4} L ${rightX + 11} ${by - 1}`} />
        </g>
      );
    }
    if (emotion === "melancholy") {
      return (
        <g stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d={`M ${leftX - 11} ${by + 2} Q ${leftX} ${by - 3}, ${leftX + 10} ${by - 5}`} />
          <path d={`M ${rightX - 10} ${by - 5} Q ${rightX} ${by - 3}, ${rightX + 11} ${by + 2}`} />
        </g>
      );
    }
    return (
      <g stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d={`M ${leftX - 10} ${by} Q ${leftX} ${by - 3}, ${leftX + 10} ${by}`} />
        <path d={`M ${rightX - 10} ${by} Q ${rightX} ${by - 3}, ${rightX + 10} ${by}`} />
      </g>
    );
  };

  const flipTransform =
    facing === "left"
      ? `translate(${HUMAN_ANCHORS.VIEWBOX_W}, 0) scale(-1, 1)`
      : undefined;

  return (
    <svg
      viewBox={`0 0 ${HUMAN_ANCHORS.VIEWBOX_W} ${HUMAN_ANCHORS.VIEWBOX_H}`}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`${idPrefix}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={finalSkin} />
          <stop offset="76%" stopColor={finalSkin} />
          <stop offset="100%" stopColor="#B8937E" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-shirt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={finalShirt} />
          <stop offset="100%" stopColor="#141326" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-pants`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={finalPants} />
          <stop offset="100%" stopColor="#0C0D18" />
        </linearGradient>
      </defs>

      <g transform={flipTransform}>
        {/* Ground Contact Shadow anchored strictly at FLOOR_Y */}
        {showShadow && (
          <ellipse
            cx={CX}
            cy={FLOOR_Y + 3}
            rx={68}
            ry={14}
            fill="#020308"
            opacity={0.62}
          />
        )}

        {/* Pelvis / Root Group anchored vertically around FLOOR_Y */}
        <g
          transform={`translate(0, ${rig.pelvisY}) translate(${CX}, ${FLOOR_Y}) scale(1, ${preset.bodyScaleY}) translate(${-CX}, ${-FLOOR_Y})`}
        >
          {/* Back Arm rendered behind torso unless pose brings both hands forward */}
          {!rig.bothArmsFront && (
            <g transform={`rotate(${rig.torsoTilt}, ${CX}, ${HIP_Y})`}>
              {renderArm("left")}
            </g>
          )}

          {/* Legs anchored mathematically at (CX ± HIP_X, HIP_Y) */}
          {renderLeg("left")}
          {renderLeg("right")}

          {/* Torso + Neck + Head hierarchy rotating cleanly from HIP_Y */}
          <g transform={`rotate(${rig.torsoTilt}, ${CX}, ${HIP_Y})`}>
            {/* Pelvis / Belt Bridge */}
            <rect
              x={CX - 43}
              y={HIP_Y - 22}
              width={86}
              height={34}
              rx={14}
              fill={finalPants}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />

            {/* Main Torso (Clean Kurzgesagt rounded trapezoid) */}
            <path
              d={`M ${CX - sx + 2} ${SHOULDER_Y - 10}
                  Q ${CX} ${SHOULDER_Y - 22}, ${CX + sx - 2} ${SHOULDER_Y - 10}
                  L ${CX + 44} ${HIP_Y - 8}
                  Q ${CX} ${HIP_Y + 2}, ${CX - 44} ${HIP_Y - 8} Z`}
              fill={`url(#${idPrefix}-shirt)`}
              stroke={OUTLINE}
              strokeWidth={STROKE_W}
            />

            {/* Shirt Collar / Jacket Trim */}
            <path
              d={`M ${CX - 20} ${SHOULDER_Y - 15} Q ${CX} ${SHOULDER_Y + 8}, ${CX + 20} ${SHOULDER_Y - 15}`}
              fill="none"
              stroke={finalAccent}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <line
              x1={CX}
              y1={SHOULDER_Y + 2}
              x2={CX}
              y2={HIP_Y - 10}
              stroke={OUTLINE}
              strokeWidth={2}
              opacity={0.32}
            />

            {/* Rim light along right torso contour */}
            <path
              d={`M ${CX + sx - 4} ${SHOULDER_Y - 6} L ${CX + 41} ${HIP_Y - 12}`}
              stroke={rimColor}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={rimIntensity * 0.65}
            />

            {/* Neck & Head Group pivoting from (CX, NECK_Y) */}
            <g
              transform={`translate(${CX}, ${NECK_Y}) rotate(${rig.headRot + headTilt}) scale(${preset.headScale}) translate(${-CX}, ${-NECK_Y})`}
            >
              {/* Hair Back Layer renders behind neck & ears */}
              {renderHairBack()}

              {/* Neck (extended deeply into torso collar so headRot/headScale never shows a gap) */}
              <rect
                x={CX - 15}
                y={NECK_Y - 22}
                width={30}
                height={52}
                rx={11}
                fill={`url(#${idPrefix}-skin)`}
                stroke={OUTLINE}
                strokeWidth={STROKE_W}
              />
              {/* Neck chin shadow */}
              <ellipse cx={CX} cy={NECK_Y - 10} rx={13} ry={6} fill="#090A12" opacity={0.28} />

              {/* Back Ear */}
              <circle
                cx={CX - 50}
                cy={HEAD_CY + 6}
                r={10.5}
                fill={`url(#${idPrefix}-skin)`}
                stroke={OUTLINE}
                strokeWidth={STROKE_W}
              />

              {/* Head Cranium */}
              <ellipse
                cx={CX + 2}
                cy={HEAD_CY}
                rx={52}
                ry={55}
                fill={`url(#${idPrefix}-skin)`}
                stroke={OUTLINE}
                strokeWidth={STROKE_W}
              />

              {/* Directional Rim Light on Head */}
              <path
                d={`M ${CX + 38} ${HEAD_CY - 36} A 50 53 0 0 1 ${CX + 44} ${HEAD_CY + 28}`}
                fill="none"
                stroke={rimColor}
                strokeWidth={3.2}
                strokeLinecap="round"
                opacity={rimIntensity * 0.72}
              />

              {/* Face Rig */}
              {renderEyebrows()}
              {renderEyes()}

              {/* Minimal Clean Nose */}
              <path
                d={`M ${CX + 8} ${HEAD_CY + 10} L ${CX + 12} ${HEAD_CY + 18} L ${CX + 6} ${HEAD_CY + 19}`}
                fill="none"
                stroke="#9C7A68"
                strokeWidth={2.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Optional Nosebleed (Scene 2 symptoms) */}
              {bleed > 0.02 && (
                <path
                  d={`M ${CX + 9} ${HEAD_CY + 19} C ${CX + 10} ${HEAD_CY + 20 + bleed * 12}, ${CX + 8} ${HEAD_CY + 22 + bleed * 20}, ${CX + 9.5} ${HEAD_CY + 23 + bleed * 24}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                />
              )}

              {renderMouth()}

              {/* Optional Glasses */}
              {glasses && (
                <g stroke="#CBD5E1" strokeWidth={2.4} fill="rgba(34,211,238,0.14)">
                  <rect x={CX - 27} y={HEAD_CY - 10} width={28} height={22} rx={6} />
                  <rect x={CX + 11} y={HEAD_CY - 10} width={28} height={22} rx={6} />
                  <line x1={CX + 1} y1={HEAD_CY} x2={CX + 11} y2={HEAD_CY} />
                </g>
              )}

              {/* Hair Front Layer */}
              {renderHairFront()}

              {/* Optional 1996 Retro Headphones */}
              {headphones && (
                <g>
                  <path
                    d={`M ${CX - 54} ${HEAD_CY - 4} C ${CX - 58} ${HEAD_CY - 74}, ${CX + 56} ${HEAD_CY - 76}, ${CX + 52} ${HEAD_CY - 10}`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${CX - 54} ${HEAD_CY - 4} C ${CX - 58} ${HEAD_CY - 74}, ${CX + 56} ${HEAD_CY - 76}, ${CX + 52} ${HEAD_CY - 10}`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                  <rect
                    x={CX - 64}
                    y={HEAD_CY - 14}
                    width={22}
                    height={38}
                    rx={9}
                    fill="#1E293B"
                    stroke={OUTLINE}
                    strokeWidth={2.8}
                  />
                  <rect
                    x={CX - 60}
                    y={HEAD_CY - 8}
                    width={8}
                    height={26}
                    rx={4}
                    fill={rimColor}
                    opacity={0.78}
                  />
                  <path
                    d={`M ${CX - 53} ${HEAD_CY + 24} C ${CX - 52} ${NECK_Y + 8}, ${CX - 34} ${NECK_Y + 18}, ${CX - 22} ${NECK_Y + 34}`}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* Front Arms */}
            {rig.bothArmsFront && renderArm("left")}
            {renderArm("right")}
          </g>
        </g>
      </g>
    </svg>
  );
};
