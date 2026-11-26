import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * LavenderGhostRig.tsx — Entidad Espectral 2.5D de Pueblo Lavanda (Estándar v9).
 *
 * PROHIBIDO MODIFICAR POR OPENCODE: Este rig base es propiedad exclusiva del
 * director visual (Gemini) y se instancia vía props desde las escenas.
 *
 * Inspirado directamente en el espectro de la Torre Pokémon de Pueblo Lavanda y
 * la leyenda de la "Mano Blanca", traducido a geometría vectorial 2.5D estilo
 * Kurzgesagt oscuro (~36 formas limpias, silueta unificada siniestra, ojos
 * hundidos luminiscentes y brazos/manos articulados con anclajes rígidos).
 */

export const GHOST_ANCHORS = {
  VIEWBOX_W: 400,
  VIEWBOX_H: 580,
  CX: 200,
  HEAD_Y: 162,
  SHOULDER_Y: 242,
  SHOULDER_X: 62,
  CORE_Y: 312,
  TAIL_Y: 505,
} as const;

export type GhostMode = "spectral" | "glitch_731" | "tower_shadow";
export type GhostPose = "looming" | "reaching" | "whispering" | "split_reveal";

export interface LavenderGhostRigProps {
  mode?: GhostMode;
  pose?: GhostPose;
  /** 0..1 intensidad del brillo espectral y ondas. */
  intensity?: number;
  /** Frame local opcional (por defecto useCurrentFrame()). */
  localFrame?: number;
  /** Prefijo único para evitar colisiones de IDs SVG. */
  idPrefix?: string;
  style?: React.CSSProperties;
}

const OUTLINE = "#06040D";

export const LavenderGhostRig: React.FC<LavenderGhostRigProps> = ({
  mode = "spectral",
  pose = "looming",
  intensity = 0.88,
  localFrame,
  idPrefix = "lgr",
  style,
}) => {
  const ctxFrame = useCurrentFrame();
  const f = localFrame ?? ctxFrame;

  const { CX, HEAD_Y, SHOULDER_Y, SHOULDER_X, CORE_Y } = GHOST_ANCHORS;
  const hoverY = Math.sin(f * 0.065) * 14;
  const sway = Math.sin(f * 0.042 + 0.8) * 3.2;
  const wisp1 = Math.sin(f * 0.11) * 12;
  const wisp2 = Math.cos(f * 0.095 + 1.2) * 14;
  const wisp3 = Math.sin(f * 0.13 + 2.4) * 11;
  const pulse = 0.8 + 0.2 * Math.sin(f * 0.12);

  const palette =
    mode === "glitch_731"
      ? {
          bodyTop: "#1C2E22",
          bodyMid: "#0E1C14",
          bodyDeep: "#050B08",
          glow: "#84CC16",
          eye: "#D9F99D",
          hand: "#ECFCCB",
        }
      : mode === "tower_shadow"
        ? {
            bodyTop: "#2B1B4A",
            bodyMid: "#130B26",
            bodyDeep: "#06030D",
            glow: "#C084FC",
            eye: "#FEF08A",
            hand: "#EDE9FE",
          }
        : {
            bodyTop: "#3A2566",
            bodyMid: "#170F2E",
            bodyDeep: "#070412",
            glow: "#A78BFA",
            eye: "#F5F3FF",
            hand: "#E9E4FF",
          };

  const armAngles = (() => {
    switch (pose) {
      case "reaching":
        return {
          lSh: 30 + Math.sin(f * 0.08) * 4,
          lEl: -24,
          rSh: -54 - Math.sin(f * 0.08) * 5,
          rEl: -18,
          headTilt: -5,
        };
      case "whispering":
        return {
          lSh: 44 + Math.sin(f * 0.09) * 3,
          lEl: -62,
          rSh: -44 - Math.sin(f * 0.09) * 3,
          rEl: 62,
          headTilt: 7,
        };
      case "split_reveal":
        return {
          lSh: 20 + Math.sin(f * 0.07) * 4,
          lEl: -18,
          rSh: -32 - Math.sin(f * 0.07) * 4,
          rEl: 22,
          headTilt: -3,
        };
      case "looming":
      default:
        return {
          lSh: 24 + Math.sin(f * 0.075) * 4,
          lEl: -28,
          rSh: -24 - Math.sin(f * 0.075) * 4,
          rEl: 28,
          headTilt: Math.sin(f * 0.05) * 3.5,
        };
    }
  })();

  const renderSpectralArm = (side: "left" | "right") => {
    const isLeft = side === "left";
    const ax = isLeft ? CX - SHOULDER_X : CX + SHOULDER_X;
    const sh = isLeft ? armAngles.lSh : armAngles.rSh;
    const el = isLeft ? armAngles.lEl : armAngles.rEl;
    const dir = isLeft ? -1 : 1;

    return (
      <g key={side} transform={`translate(${ax}, ${SHOULDER_Y}) rotate(${sh})`}>
        {/* Flowing draped upper shroud sleeve */}
        <path
          d="M -14 -8 C -20 20, -16 54, -9 82 L 10 82 C 15 54, 18 20, 14 -8 Z"
          fill={`url(#${idPrefix}-body)`}
          stroke={OUTLINE}
          strokeWidth={2.8}
        />
        {/* Forearm + Pale "White Hand" anchored at (0, 78) */}
        <g transform={`translate(0, 78) rotate(${el})`}>
          <path
            d="M -9 -6 C -10 22, -8 48, -6 68 L 6 68 C 8 48, 10 22, 9 -6 Z"
            fill={`url(#${idPrefix}-body)`}
            stroke={OUTLINE}
            strokeWidth={2.6}
          />
          {/* Seamless joint patch */}
          <circle cx={0} cy={0} r={8.2} fill={`url(#${idPrefix}-body)`} />

          {/* Iconic Lavender Town "White Hand" */}
          <g transform="translate(0, 64)">
            <path
              d="M -10 0 C -13 11, -12 22, -5 27 L 5 27 C 12 22, 13 11, 10 0 Z"
              fill={palette.hand}
              stroke={OUTLINE}
              strokeWidth={2.2}
            />
            <path
              d={`M ${dir * -9} 8 C ${dir * -19} 14, ${dir * -21} 25, ${dir * -14} 32`}
              fill="none"
              stroke={palette.hand}
              strokeWidth={3.8}
              strokeLinecap="round"
            />
            <path d="M -7 24 L -12 49" stroke={palette.hand} strokeWidth={3.6} strokeLinecap="round" />
            <path d="M -2 25 L -4 56" stroke={palette.hand} strokeWidth={3.8} strokeLinecap="round" />
            <path d="M 3 25 L 5 53" stroke={palette.hand} strokeWidth={3.6} strokeLinecap="round" />
            <path d="M 7.5 23 L 12 44" stroke={palette.hand} strokeWidth={3.2} strokeLinecap="round" />
          </g>
        </g>
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${GHOST_ANCHORS.VIEWBOX_W} ${GHOST_ANCHORS.VIEWBOX_H}`}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <radialGradient id={`${idPrefix}-aura`} cx="50%" cy="40%" r="54%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity={0.42 * intensity} />
          <stop offset="58%" stopColor={palette.bodyTop} stopOpacity={0.14 * intensity} />
          <stop offset="100%" stopColor={palette.bodyDeep} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${idPrefix}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.bodyTop} />
          <stop offset="52%" stopColor={palette.bodyMid} />
          <stop offset="100%" stopColor={palette.bodyDeep} stopOpacity={0.94} />
        </linearGradient>
        <radialGradient id={`${idPrefix}-void`} cx="50%" cy="42%" r="56%">
          <stop offset="0%" stopColor="#030208" />
          <stop offset="82%" stopColor="#0D071C" />
          <stop offset="100%" stopColor={palette.bodyTop} />
        </radialGradient>
      </defs>

      <g transform={`translate(0, ${hoverY}) rotate(${sway}, ${CX}, ${CORE_Y})`}>
        {/* Spectral aura behind figure */}
        <circle cx={CX} cy={HEAD_Y + 64} r={178} fill={`url(#${idPrefix}-aura)`} />

        {/* Concentric eerie binaural rings */}
        {[110, 148].map((r, i) => (
          <circle
            key={i}
            cx={CX}
            cy={HEAD_Y + 34}
            r={r + Math.sin(f * 0.09 + i * 1.8) * 6}
            fill="none"
            stroke={palette.glow}
            strokeWidth={1.6}
            strokeDasharray={mode === "glitch_731" ? "10 8" : "24 14"}
            opacity={(0.26 - i * 0.09) * intensity}
          />
        ))}

        {/* Unified Gaunt Spectral Silhouette (Cowl + Shoulders + Wispy Smoke Tail in ONE organic path) */}
        <path
          d={`M ${CX} ${HEAD_Y - 102}
              C ${CX + 56} ${HEAD_Y - 98}, ${CX + 78} ${HEAD_Y - 38}, ${CX + 72} ${HEAD_Y + 34}
              C ${CX + 86} ${SHOULDER_Y + 8}, ${CX + 98} ${CORE_Y + 42}, ${CX + 76 + wisp3} ${CORE_Y + 158}
              C ${CX + 56} ${CORE_Y + 132}, ${CX + 46 + wisp2} ${CORE_Y + 186}, ${CX + 26 + wisp2} ${CORE_Y + 216}
              C ${CX + 12} ${CORE_Y + 178}, ${CX + wisp1} ${CORE_Y + 206}, ${CX - 14 + wisp1} ${CORE_Y + 236}
              C ${CX - 34} ${CORE_Y + 188}, ${CX - 48 + wisp2} ${CORE_Y + 154}, ${CX - 70 + wisp1} ${CORE_Y + 184}
              C ${CX - 94} ${CORE_Y + 120}, ${CX - 88} ${SHOULDER_Y + 18}, ${CX - 72} ${HEAD_Y + 34}
              C ${CX - 78} ${HEAD_Y - 38}, ${CX - 56} ${HEAD_Y - 98}, ${CX} ${HEAD_Y - 102} Z`}
          fill={`url(#${idPrefix}-body)`}
          stroke={OUTLINE}
          strokeWidth={3.4}
        />

        {/* Subtle vertical spectral drapery folds */}
        <path
          d={`M ${CX - 38} ${SHOULDER_Y + 22} Q ${CX - 46} ${CORE_Y + 56}, ${CX - 34 + wisp1 * 0.4} ${CORE_Y + 126}`}
          fill="none"
          stroke={palette.glow}
          strokeWidth={2}
          opacity={0.2 * intensity}
          strokeLinecap="round"
        />
        <path
          d={`M ${CX + 38} ${SHOULDER_Y + 22} Q ${CX + 46} ${CORE_Y + 56}, ${CX + 34 + wisp3 * 0.4} ${CORE_Y + 126}`}
          fill="none"
          stroke={palette.glow}
          strokeWidth={2}
          opacity={0.24 * intensity}
          strokeLinecap="round"
        />

        {/* Crisp right-edge rim light along unified cloak */}
        <path
          d={`M ${CX + 18} ${HEAD_Y - 92} C ${CX + 62} ${HEAD_Y - 72}, ${CX + 72} ${HEAD_Y - 8}, ${CX + 70} ${HEAD_Y + 36} C ${CX + 82} ${SHOULDER_Y + 24}, ${CX + 88} ${CORE_Y + 58}, ${CX + 74 + wisp3 * 0.6} ${CORE_Y + 132}`}
          fill="none"
          stroke={palette.glow}
          strokeWidth={3.2}
          strokeLinecap="round"
          opacity={0.68 * intensity}
        />

        {/* Hollow Haunting Face Cavity */}
        <g transform={`rotate(${armAngles.headTilt}, ${CX}, ${HEAD_Y + 24})`}>
          {/* Jagged eerie face void (more ominous than a round circle) */}
          <path
            d={`M ${CX} ${HEAD_Y - 56}
                C ${CX + 38} ${HEAD_Y - 54}, ${CX + 52} ${HEAD_Y - 16}, ${CX + 46} ${HEAD_Y + 24}
                C ${CX + 38} ${HEAD_Y + 56}, ${CX + 18} ${HEAD_Y + 70}, ${CX} ${HEAD_Y + 66}
                C ${CX - 18} ${HEAD_Y + 70}, ${CX - 38} ${HEAD_Y + 56}, ${CX - 46} ${HEAD_Y + 24}
                C ${CX - 52} ${HEAD_Y - 16}, ${CX - 38} ${HEAD_Y - 54}, ${CX} ${HEAD_Y - 56} Z`}
            fill={`url(#${idPrefix}-void)`}
            stroke={OUTLINE}
            strokeWidth={3}
          />

          {/* Piercing sunken glowing eyes with faint vertical shadow streaks */}
          {[CX - 19, CX + 19].map((ex, i) => (
            <g key={i}>
              {/* Vertical dark tear-like spectral static streak */}
              <path
                d={`M ${ex} ${HEAD_Y - 2} L ${ex} ${HEAD_Y + 26}`}
                stroke={palette.glow}
                strokeWidth={2.2}
                opacity={0.22 * intensity}
                strokeLinecap="round"
              />
              {/* Eye glow */}
              <ellipse
                cx={ex}
                cy={HEAD_Y - 6}
                rx={13}
                ry={8}
                fill={palette.glow}
                opacity={0.38 * pulse * intensity}
              />
              {/* Sharp angled haunting eye */}
              <path
                d={
                  i === 0
                    ? `M ${ex - 11} ${HEAD_Y - 10} Q ${ex} ${HEAD_Y - 13}, ${ex + 10} ${HEAD_Y - 4} Q ${ex} ${HEAD_Y + 2}, ${ex - 11} ${HEAD_Y - 10} Z`
                    : `M ${ex + 11} ${HEAD_Y - 10} Q ${ex} ${HEAD_Y - 13}, ${ex - 10} ${HEAD_Y - 4} Q ${ex} ${HEAD_Y + 2}, ${ex + 11} ${HEAD_Y - 10} Z`
                }
                fill={palette.eye}
              />
              <circle cx={ex + (i === 0 ? 1 : -1)} cy={HEAD_Y - 6} r={2.2} fill="#070412" />
            </g>
          ))}

          {/* Elongated hollow wailing mouth */}
          <path
            d={`M ${CX - 13} ${HEAD_Y + 22}
                C ${CX - 8} ${HEAD_Y + 14}, ${CX + 8} ${HEAD_Y + 14}, ${CX + 13} ${HEAD_Y + 22}
                C ${CX + 11} ${HEAD_Y + 48 + Math.sin(f * 0.14) * 4}, ${CX - 11} ${HEAD_Y + 48 + Math.sin(f * 0.14) * 4}, ${CX - 13} ${HEAD_Y + 22} Z`}
            fill="#020106"
            stroke={palette.glow}
            strokeWidth={1.6}
            opacity={0.78}
          />
        </g>

        {/* Articulated Spectral Arms + White Hands */}
        {renderSpectralArm("left")}
        {renderSpectralArm("right")}

        {/* Optional 8-bit glitch fragments in glitch_731 mode */}
        {mode === "glitch_731" && (
          <g fill="#84CC16" opacity={0.78}>
            <rect x={CX - 94 + ((f * 7) % 16)} y={HEAD_Y - 26} width={24} height={6} />
            <rect x={CX + 70 - ((f * 5) % 14)} y={HEAD_Y + 18} width={30} height={5} />
            <rect x={CX - 76} y={CORE_Y + 44 + ((f * 3) % 10)} width={20} height={6} />
            <rect x={CX + 60} y={CORE_Y - 12} width={18} height={8} />
          </g>
        )}

        {/* Floating spectral wisps */}
        {[
          { x: CX - 118, y: HEAD_Y + 46 + Math.sin(f * 0.09) * 14, r: 5 },
          { x: CX + 122, y: HEAD_Y + 14 + Math.cos(f * 0.08) * 16, r: 6 },
          { x: CX - 96, y: CORE_Y + 95 + Math.cos(f * 0.11) * 12, r: 4.5 },
          { x: CX + 104, y: CORE_Y + 115 + Math.sin(f * 0.1) * 13, r: 5 },
        ].map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={palette.glow}
            opacity={0.55 * pulse * intensity}
          />
        ))}
      </g>
    </svg>
  );
};
