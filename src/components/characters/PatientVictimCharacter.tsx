import { useId } from "react";
import { useCurrentFrame } from "remotion";
import {
  blinkFactor,
  lerpHex,
  limbPath,
  solveTwoBoneIK,
} from "./rigMath";

/**
 * PatientVictimCharacter — Paciente de cuarentena de cuerpo entero 2.5D
 * vectorial (Estándar v8). 100% SVG `<path>` (cero `<Img>`). Muta en vivo
 * mediante `mutationProgress` (0 = humano asustado → 1 = depredador casi
 * idéntico a The Rake): piel → necrosis gris con red de venas, dedos que se
 * alargan (1.0x → 1.95x) en garras oscuras, escleróticas a negro absoluto.
 *
 * Coordenadas locales: `floorY` = y=0 (pies plantados EXACTAMENTE en el
 * suelo), cuerpo hacia arriba (y negativa) hasta ~440 unidades.
 */

export interface PatientVictimCharacterProps {
  x: number;
  floorY: number;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
  mutationProgress: number;
  spasmIntensity?: number;
  lookTarget?: { x: number; y: number };
  rimColor?: string;
}

// Bata hospitalaria gris-verdosa.
const GOWN_LIGHT = "#5A6B5C";
const GOWN_MID = "#42503F";
const GOWN_DARK = "#2C372B";
const GOWN_SHADOW = "#1D2720";
// Cabello oscuro opaco.
const HAIR_BACK = "#17131B";
const HAIR_MID = "#2A2130";
const HAIR_HI = "#443650";
const VEIN = "#3B2A4A";

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

/** Pie descalzo plantado en y=0 (muta con la piel). */
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
          stroke={c.skinShadow}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

/** Mano con 5 dedos que se alargan en vivo y uñas → garras oscuras. */
function renderHandClaw(
  wx: number,
  wy: number,
  dirDeg: number,
  fingerScale: number,
  curl: number,
  clawLen: number,
  c: SkinColors,
  nailColor: string
) {
  const baseAngles = [-42, -21, 0, 21, 42];
  const len1 = [13, 16, 17, 16, 13];
  const len2 = [11, 14, 15, 14, 11];
  return (
    <g>
      <ellipse
        cx={wx}
        cy={wy}
        rx={8.5}
        ry={10}
        fill={c.skin}
        transform={`rotate(${dirDeg} ${wx} ${wy})`}
      />
      {baseAngles.map((ang, i) => {
        const a = ((dirDeg + ang) * Math.PI) / 180;
        const l1 = len1[i] * fingerScale;
        const l2 = len2[i] * fingerScale;
        const p1x = wx + Math.cos(a) * l1;
        const p1y = wy + Math.sin(a) * l1;
        const a2 = a + (curl * Math.PI) / 180;
        const p2x = p1x + Math.cos(a2) * l2;
        const p2y = p1y + Math.sin(a2) * l2;
        const clawTipX = p2x + Math.cos(a2 + 0.45) * clawLen;
        const clawTipY = p2y + Math.sin(a2 + 0.45) * clawLen;
        const ctrlX = p2x + Math.cos(a2 + 0.12) * clawLen * 0.85;
        const ctrlY = p2y + Math.sin(a2 + 0.12) * clawLen * 0.85;
        return (
          <g key={i}>
            <path
              d={`M ${wx.toFixed(1)} ${wy.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`}
              stroke={c.skin}
              strokeWidth={3.2 - i * 0.1}
              strokeLinecap="round"
            />
            <path
              d={`M ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)}`}
              stroke={c.skinMid}
              strokeWidth={2.8}
              strokeLinecap="round"
            />
            <path
              d={`M ${p2x.toFixed(1)} ${p2y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${clawTipX.toFixed(1)} ${clawTipY.toFixed(1)}`}
              fill="none"
              stroke={nailColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/** Brazo (manga shoulder→elbow + antebrazo desnudo elbow→wrist) con IK + mano mutante. */
function renderArmPatient(
  shX: number,
  shY: number,
  hX: number,
  hY: number,
  bendDir: 1 | -1,
  upLen: number,
  foLen: number,
  fingerScale: number,
  curl: number,
  clawLen: number,
  c: SkinColors,
  nailColor: string
) {
  const ik = solveTwoBoneIK(shX, shY, hX, hY, upLen, foLen, bendDir);
  const elbow = { x: ik.elbowX, y: ik.elbowY };
  const wrist = { x: ik.wristX, y: ik.wristY };
  const dirDeg =
    (Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * 180) / Math.PI;
  // La manga termina limpiamente a media longitud del brazo superior
  // (upperLen * 0.65), sin sobresalir ni colgar por debajo del codo.
  const sleeveEnd = {
    x: shX + (elbow.x - shX) * 0.65,
    y: shY + (elbow.y - shY) * 0.65,
  };
  return (
    <g>
      {/* Hombro (bata) */}
      <circle cx={shX} cy={shY} r={12} fill={GOWN_MID} />
      {/* Manga corta (shoulder → 65% del brazo superior) */}
      <path d={limbPath(shX, shY, sleeveEnd.x, sleeveEnd.y, 20, 15)} fill={GOWN_MID} />
      {/* Brazo superior desnudo (desde el final de la manga → codo) */}
      <path d={limbPath(sleeveEnd.x, sleeveEnd.y, elbow.x, elbow.y, 15, 15)} fill={c.skinMid} />
      {/* Codo (articulación redondeada) */}
      <circle cx={elbow.x} cy={elbow.y} r={8} fill={c.skinMid} />
      {/* Antebrazo demacrado (elbow → wrist) */}
      <path d={limbPath(elbow.x, elbow.y, wrist.x, wrist.y, 15, 9)} fill={c.skinMid} />
      {/* Reflejo en manga */}
      <path
        d={`M ${shX} ${shY} L ${sleeveEnd.x.toFixed(1)} ${sleeveEnd.y.toFixed(1)}`}
        stroke={GOWN_LIGHT}
        strokeWidth={2}
        opacity={0.4}
        strokeLinecap="round"
      />
      {renderHandClaw(wrist.x, wrist.y, dirDeg, fingerScale, curl, clawLen, c, nailColor)}
    </g>
  );
}

/** Pierna desnuda con pantorrillas anatómicas (22–28px) + pie en y=0. */
function renderLegPatient(
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
      {/* Muslo (mayormente oculto bajo la bata) */}
      <path d={limbPath(hipX, hipY, knee.x, knee.y, 26, 24)} fill={c.skinMid} />
      {/* Pantorrilla anatómica (24→20px) */}
      <path d={limbPath(knee.x, knee.y, ankle.x, ankle.y, 24, 20)} fill={c.skinDark} />
      {/* Rótula sutil */}
      <ellipse cx={knee.x} cy={knee.y} rx={9} ry={11} fill={c.skinMid} opacity={0.7} />
      {/* Sombra interna de la pantorrilla */}
      <path
        d={`M ${knee.x.toFixed(1)} ${knee.y.toFixed(1)} L ${ankle.x.toFixed(1)} ${ankle.y.toFixed(1)}`}
        stroke={c.skinShadow}
        strokeWidth={2}
        opacity={0.3}
        strokeLinecap="round"
      />
      {renderFoot(ankle.x, ankle.y, toeDir, c)}
    </g>
  );
}

export const PatientVictimCharacter: React.FC<PatientVictimCharacterProps> = ({
  x,
  floorY,
  scale = 1,
  flipX = false,
  opacity = 1,
  mutationProgress,
  spasmIntensity = 0,
  lookTarget = { x: 0, y: 0 },
  rimColor = "#22D3EE",
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const sx = flipX ? -1 : 1;
  const m = clamp(mutationProgress, 0, 1);
  const spasm = clamp(spasmIntensity, 0, 1);
  const lookX = clamp(lookTarget.x, -1, 1);
  const lookY = clamp(lookTarget.y, -1, 1);

  // Piel: humana cálida → palidez clínica → gris necrítico.
  const c: SkinColors = {
    skin: lerpHex("#E8C9B0", "#9AA2A8", m),
    skinMid: lerpHex("#D2A98F", "#6E7780", m),
    skinDark: lerpHex("#A97F66", "#4A525A", m),
    skinShadow: lerpHex("#6E5140", "#2E353B", m),
  };
  const sclera = lerpHex("#F2EFE9", "#05070A", m);
  const iris = lerpHex("#4A3226", "#05070A", m);
  const nailColor = lerpHex("#C9B59B", "#14161B", m);

  // Progresión de postura: el torso se encorva con la mutación.
  const pelvisY = -190 + Math.sin(frame * 0.09) * 2;
  const pitch = m * 24 + Math.sin(frame * 0.05) * 1.2;
  const headAngle = m * 14 + lookX * 4 + spasm * 2.5 * Math.sin(frame * 0.9);

  const pelvis = { x: 0, y: pelvisY };
  const shoulderL = rotatePoint(pelvis.x, pelvis.y, -50, -150, pitch);
  const shoulderR = rotatePoint(pelvis.x, pelvis.y, 50, -150, pitch);

  // Espasmo: temblor ansioso creciente.
  const tremorX =
    Math.sin(frame * (1.2 + spasm * 1.1)) * spasm * 2.6 +
    Math.sin(frame * 2.3 + 1.3) * spasm * 1.2;
  const tremorY = Math.cos(frame * 1.4 + 0.6) * spasm * 2.1;

  // Dedos que se alargan (1.0x → 1.95x) y garras que crecen.
  const fingerScale = 1 + m * 0.95;
  const clawLen = 2 + m * 9;
  const curl = 6 + spasm * 34 + m * 10;

  // Respiración laboriosa.
  const chest = 1 + Math.sin(frame * (0.3 + spasm * 0.3)) * (0.03 + spasm * 0.03);

  // Manos alzadas frente al pecho mostrando las garras.
  const handL = { x: -42 - m * 8 + tremorX, y: -256 - m * 10 + tremorY };
  const handR = { x: 42 + m * 8 + tremorX, y: -256 - m * 10 + tremorY };

  const blink = blinkFactor(frame, 7, 150); // parpadeo raro de agonía
  const eyeOpen = Math.max(0, Math.min(1, 1 - blink));

  const hipL = { x: -14, y: pelvisY + 6 };
  const hipR = { x: 14, y: pelvisY + 6 };
  const ankleL = { x: -16, y: -14 };
  const ankleR = { x: 16, y: -14 };

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
        <linearGradient id={`${uid}-gown`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOWN_LIGHT} />
          <stop offset="55%" stopColor={GOWN_MID} />
          <stop offset="100%" stopColor={GOWN_DARK} />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.skin} />
          <stop offset="60%" stopColor={c.skinMid} />
          <stop offset="100%" stopColor={c.skinDark} />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HAIR_HI} />
          <stop offset="50%" stopColor={HAIR_MID} />
          <stop offset="100%" stopColor={HAIR_BACK} />
        </linearGradient>
        <clipPath id={`${uid}-eyeL`}>
          <ellipse cx={-16} cy={-44} rx={9} ry={10.5} />
        </clipPath>
        <clipPath id={`${uid}-eyeR`}>
          <ellipse cx={16} cy={-44} rx={9} ry={10.5} />
        </clipPath>
      </defs>

      <g transform={`translate(${x}, ${floorY}) scale(${sx}, ${scale})`}>
        {/* Sombra de contacto centrada en y=0 (cero brecha flotante) */}
        <ellipse
          cx={0}
          cy={0}
          rx={80 + m * 26}
          ry={11 + m * 3}
          fill="#000000"
          opacity={0.5 * (0.8 + 0.2 * Math.sin(frame * 0.08))}
        />

        {/* Pierna izquierda (detrás) */}
        {renderLegPatient(hipL.x, hipL.y, ankleL.x, ankleL.y, -1, 80, 80, c)}
        {/* Brazo izquierdo (detrás) */}
        {renderArmPatient(
          shoulderL.x,
          shoulderL.y,
          handL.x,
          handL.y,
          -1,
          60,
          52,
          fingerScale,
          curl,
          clawLen,
          c,
          nailColor
        )}

        {/* Pelvis + torso encorvado */}
        <g transform={`translate(${pelvis.x}, ${pelvis.y}) rotate(${pitch})`}>
          {/* Caderas */}
          <path
            d="M -26 0 C -26 16 -14 22 0 22 C 14 22 26 16 26 0 Z"
            fill={GOWN_DARK}
          />

          {/* Bata hospitalaria (cae hasta las rodillas y ≈ -140) */}
          <g transform={`scale(${chest}, ${chest})`}>
            <path
              d="M -26 0 C -36 -32 -42 -66 -44 -102 C -46 -130 -44 -150 -18 -156 C -8 -160 8 -160 18 -156 C 44 -150 46 -130 44 -102 C 42 -66 36 -32 26 0 L 42 34 C 42 48 22 52 0 52 C -22 52 -42 48 -42 34 Z"
              fill={`url(#${uid}-gown)`}
            />
            {/* Cuello en V */}
            <path
              d="M -9 -138 L 0 -122 L 9 -138"
              stroke={c.skinMid}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            {/* Pliegues del torso */}
            <path d="M -20 -30 C -12 -34 -2 -32 6 -30" stroke={GOWN_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -18 -60 C -10 -64 0 -62 8 -60" stroke={GOWN_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d="M -17 -90 C -9 -94 1 -92 9 -90" stroke={GOWN_SHADOW} strokeWidth={2.5} fill="none" opacity={0.5} />
            {/* Costillas marcadas bajo la tela (más visibles con la mutación) */}
            {[0, 1, 2, 3].map((i) => {
              const ry = -40 - i * 15;
              return (
                <g key={i}>
                  <path
                    d={`M ${-28 + i * 1.5} ${ry} C ${-20} ${ry - 6} ${-8} ${ry - 4} 0 ${ry}`}
                    stroke={GOWN_SHADOW}
                    strokeWidth={3}
                    fill="none"
                    opacity={0.35 + m * 0.5}
                  />
                  <path
                    d={`M ${28 - i * 1.5} ${ry} C ${20} ${ry - 6} ${8} ${ry - 4} 0 ${ry}`}
                    stroke={GOWN_SHADOW}
                    strokeWidth={3}
                    fill="none"
                    opacity={0.35 + m * 0.5}
                  />
                </g>
              );
            })}
            {/* Dobladillo desgarrado (crece con la mutación) */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M ${-42 + i * 21} 40 L ${-36 + i * 21} ${33 - i * 3} L ${-30 + i * 21} 40`}
                fill={GOWN_DARK}
                opacity={0.3 + m * 0.7}
              />
            ))}
            {/* Rim light clínico */}
            <path
              d="M -26 0 C -36 -32 -42 -66 -44 -102 C -46 -130 -44 -150 -18 -156"
              stroke={rimColor}
              strokeWidth={2.5}
              fill="none"
              opacity={0.55}
              strokeLinecap="round"
            />
          </g>

          {/* Red de venas en el cuello (progresiva) */}
          <g opacity={m}>
            <path d="M -3 -136 C -4 -126 -5 -118 -6 -108" stroke={VEIN} strokeWidth={1.6} fill="none" />
            <path d="M 3 -136 C 2 -128 4 -120 5 -112" stroke={VEIN} strokeWidth={1.6} fill="none" />
            <path d="M -6 -116 C -9 -112 -10 -106 -9 -100" stroke={VEIN} strokeWidth={1.2} fill="none" opacity={0.7} />
            <path d="M 6 -118 C 9 -114 10 -108 9 -102" stroke={VEIN} strokeWidth={1.2} fill="none" opacity={0.7} />
          </g>

          {/* Cuello + cabeza */}
          <g transform={`translate(0, -140) rotate(${headAngle})`}>
            {/* Cuello (conecta escote → mentón) */}
            <path d="M -7 4 C -7 -4 -6 -8 -5 -14" stroke={c.skinMid} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M 6 4 C 6 -4 5 -8 4 -14" stroke={c.skinDark} strokeWidth={6} fill="none" strokeLinecap="round" />

            {/* Cabello trasero (hairBack) — se ralea con la mutación */}
            <path
              d="M -34 -18 C -50 -34 -52 -66 -40 -88 C -34 -96 -26 -100 0 -100 C 26 -100 34 -96 40 -88 C 52 -66 50 -34 34 -18 C 34 -40 28 -54 18 -62 C 8 -68 0 -70 -8 -68 C -20 -64 -28 -52 -34 -18 Z"
              fill={HAIR_BACK}
              opacity={1 - m * 0.4}
            />

            {/* Cráneo / rostro ovalado */}
            <path
              d="M -32 -34 C -34 -58 -24 -72 -8 -74 C 0 -74 0 -74 8 -74 C 24 -72 34 -58 32 -34 C 30 -18 24 -12 0 -12 C -24 -12 -30 -18 -32 -34 Z"
              fill={`url(#${uid}-skin)`}
            />

            {/* Cabello corona (hairCrown) — adelgaza con la mutación */}
            <g opacity={1 - m * 0.5}>
              <path
                d="M -32 -30 C -38 -54 -34 -76 -18 -88 C -8 -96 8 -96 18 -88 C 34 -76 38 -54 32 -30 C 27 -50 20 -62 10 -68 C 4 -72 -4 -72 -10 -68 C -20 -62 -27 -50 -32 -30 Z"
                fill={`url(#${uid}-hair)`}
              />
            </g>

            {/* Cabello frontal (hairFront) */}
            <path
              d="M -32 -30 C -28 -22 -26 -16 -22 -12 C -18 -8 -14 -6 -9 -8 C -12 -14 -13 -24 -13 -34 C -15 -42 -21 -40 -32 -30 Z"
              fill={HAIR_MID}
              opacity={1 - m * 0.4}
            />
            <path
              d="M 32 -30 C 28 -22 26 -16 22 -12 C 18 -8 14 -6 9 -8 C 12 -14 13 -24 13 -34 C 15 -42 21 -40 32 -30 Z"
              fill={HAIR_MID}
              opacity={1 - m * 0.4}
            />

            {/* FaceRig en agonía */}
            <g>
              {[-16, 16].map((ex, i) => {
                const clipId = i === 0 ? `${uid}-eyeL` : `${uid}-eyeR`;
                const px = ex + lookX * 3.2;
                const py = -44 + lookY * 2.4;
                return (
                  <g key={i}>
                    {/* Esclerótica (blanco → negro absoluto) */}
                    <ellipse cx={ex} cy={-44} rx={9} ry={10.5} fill={sclera} />
                    <g clipPath={`url(#${clipId})`}>
                      <circle cx={px} cy={py} r={6.4} fill={iris} />
                      <circle cx={px} cy={py} r={2.2} fill="#05070A" />
                    </g>
                    {/* Reflejo frío puntual (crece con la mutación) */}
                    <circle
                      cx={px - 2}
                      cy={py - 2.5}
                      r={1.3}
                      fill={rimColor}
                      opacity={0.25 + m * 0.7}
                      style={{ mixBlendMode: "screen" }}
                    />
                    {/* Párpados */}
                    <path
                      d={`M ${ex - 10} ${-44} Q ${ex} ${-44 - 22 * eyeOpen} ${ex + 10} ${-44}`}
                      fill={c.skinMid}
                    />
                    <path
                      d={`M ${ex - 9} ${-44} Q ${ex} ${-44 + 14 * (1 - eyeOpen)} ${ex + 9} ${-44}`}
                      fill={c.skinMid}
                      opacity={1 - eyeOpen * 0.7}
                    />
                    {/* Ojeras / mejillas demacradas */}
                    <path
                      d={`M ${ex - 9} ${-44 + 9} Q ${ex} ${-44 + 15 + m * 4} ${ex + 9} ${-44 + 9}`}
                      stroke={c.skinShadow}
                      strokeWidth={4}
                      fill="none"
                      opacity={0.5 + m * 0.4}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Cejas crispadas de dolor */}
              {[-16, 16].map((bx, i) => {
                const ang = i === 0 ? -1 : 1;
                return (
                  <path
                    key={i}
                    d={`M ${bx - 9} ${-60} Q ${bx} ${-68 - spasm * 2} ${bx + 9} ${-64 + ang * 3}`}
                    stroke={HAIR_BACK}
                    strokeWidth={3.5}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Mejillas hundidas (sombras crecientes) */}
              <path
                d="M -28 -32 C -24 -24 -16 -20 -8 -22"
                stroke={c.skinShadow}
                strokeWidth={3}
                fill="none"
                opacity={0.3 + m * 0.5}
                strokeLinecap="round"
              />
              <path
                d="M 28 -32 C 24 -24 16 -20 8 -22"
                stroke={c.skinShadow}
                strokeWidth={3}
                fill="none"
                opacity={0.3 + m * 0.5}
                strokeLinecap="round"
              />

              {/* Venas faciales */}
              <g opacity={m * 0.85}>
                <path d="M -28 -42 C -26 -38 -24 -34 -22 -30" stroke={VEIN} strokeWidth={1.3} fill="none" />
                <path d="M 28 -42 C 26 -38 24 -34 22 -30" stroke={VEIN} strokeWidth={1.3} fill="none" />
                <path d="M -20 -60 C -18 -56 -16 -52 -15 -48" stroke={VEIN} strokeWidth={1.1} fill="none" opacity={0.7} />
                <path d="M 20 -60 C 18 -56 16 -52 15 -48" stroke={VEIN} strokeWidth={1.1} fill="none" opacity={0.7} />
              </g>

              {/* Nariz */}
              <path d="M 0 -44 C -1 -38 -1 -34 0 -30" stroke={c.skinDark} strokeWidth={2.5} fill="none" strokeLinecap="round" />

              {/* Boca en grito mudo de agonía */}
              <g transform="translate(0, -20)">
                <path
                  d={`M -12 0 C -9 ${-13 - spasm * 5} 9 ${-13 - spasm * 5} 12 0 Z`}
                  fill="#0A0508"
                />
                <path d="M -8 -2 C -3 -6 3 -6 8 -2" fill="#7A3B41" />
                {[0, 1, 2, 3, 4].map((t) => (
                  <path
                    key={t}
                    d={`M ${-9 + t * 3.6} ${-3} L ${-8.2 + t * 3.6} ${-8 - spasm * 2} L ${-7.4 + t * 3.6} ${-3} Z`}
                    fill="#E9E4DA"
                  />
                ))}
                {[0, 1, 2, 3].map((t) => (
                  <path
                    key={t}
                    d={`M ${-7 + t * 3.6} -3 L ${-6.2 + t * 3.6} 2 L ${-5.4 + t * 3.6} -3 Z`}
                    fill="#E9E4DA"
                  />
                ))}
              </g>

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

        {/* Pierna derecha (al frente) */}
        {renderLegPatient(hipR.x, hipR.y, ankleR.x, ankleR.y, 1, 80, 80, c)}

        {/* Brazo derecho (al frente) */}
        {renderArmPatient(
          shoulderR.x,
          shoulderR.y,
          handR.x,
          handR.y,
          1,
          60,
          52,
          fingerScale,
          curl,
          clawLen,
          c,
          nailColor
        )}
      </g>
    </svg>
  );
};
