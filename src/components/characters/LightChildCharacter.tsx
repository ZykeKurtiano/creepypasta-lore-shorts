import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * LightChildCharacter.tsx — Niño de Luz humano estilizado (Estándar v3).
 *
 * Personaje humano infantil completo (PROHIBIDO silueta/maniquí genérico):
 *   - Cabeza y rostro infantil muy expresivo y cálido: cabello despeinado
 *     castaño oscuro con mechones orgánicos y reflejos dorados, ojos grandes
 *     y expresivos (parpadeo sutil + brillo dorado), cejas suaves y una
 *     sonrisa sincera radiante (que pasa a miedo/asombro cuando el niño se
 *     asusta o se resguarda ante la sombra de Zalgo).
 *   - Ropa infantil detallada con pliegues y sombras: suéter terracota cálido
 *     con cuello y puños crema, pantalón azul-denim y zapatos, con rim light
 *     dorado procedente de su propia aura.
 *
 * Esqueleto articulado por jerarquía (`<g>` anidados con pivotes reales):
 *   torsoGroup → neckHeadGroup → faceExpressions
 *   leftShoulder → leftUpperArm → leftForearm → leftHand
 *   rightShoulder → rightUpperArm → rightForearm → rightHand
 *   legsGroup (piernas articuladas con walkCycle / pose)
 *
 * Aura cálida dorada (lightIntensity 0..1): resplandor radial multicapa
 * (#FEF08A, #FDE047, #F59E0B), motas doradas flotantes y rayos cálidos que
 * iluminan el entorno cuando lightIntensity > 0 (y se atenúan/apagan
 * dramáticamente cuando baja hacia 0 por la sombra de Zalgo).
 *
 * Animación 100% determinista: useCurrentFrame + interpolate + Math.sin.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export interface LightChildCharacterProps {
  pose?: "walkingHand" | "radiating" | "scared" | "sheltered";
  /** 0..1 brillo del aura dorada. */
  lightIntensity?: number;
  localFrame?: number;
  idPrefix?: string;
}

/** Motas doradas flotantes (deterministas, sin Math.random). */
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  x: 60 + ((i * 73) % 340),
  y0: 70 + ((i * 131) % 430),
  r: 1.5 + ((i * 7) % 5),
  phase: i * 1.9,
  speed: 0.4 + ((i * 11) % 5) * 0.18,
}));

/** Rayos cálidos suaves (deterministas). */
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(a), len: 150 + ((i * 29) % 60), phase: i * 1.3 };
});

/** Brazo infantil articulado (jerarquía shoulder → forearm → hand). */
const ChildArm: React.FC<{
  pid: string;
  flip: boolean;
  shoulder: number;
  elbow: number;
  reaching?: boolean;
}> = ({ pid, flip, shoulder, elbow, reaching = false }) => {
  return (
    <g transform={`rotate(${shoulder})`}>
      {/* Brazo superior (manga del suéter) */}
      <path
        d="M -12 2 C -13 26, -12 48, -7 64 L 17 64 C 13 48, 13 26, 13 2 Z"
        fill={`url(#${pid}-sweater)`}
      />
      {/* Pliegue de la manga */}
      <path
        d="M -12 2 C -13 26, -12 48, -7 64"
        stroke="#7C4220"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      {/* Antebrazo */}
      <g transform={`translate(0, 64) rotate(${elbow})`}>
        <path
          d="M -9 0 C -10 24, -9 44, -5 58 L 14 58 C 11 44, 11 24, 10 0 Z"
          fill={`url(#${pid}-sweater)`}
        />
        {/* Puño crema */}
        <path d="M -7 50 L 16 50 L 15 58 L -5 58 Z" fill={`url(#${pid}-cream)`} />
        {/* Mano */}
        <g transform="translate(0, 58)">
          <path
            d="M -9 0 C -11 7, -10 12, -6 15 L 13 15 C 11 11, 11 6, 9 0 Z"
            fill={`url(#${pid}-skin)`}
          />
          {/* Dedos */}
          {reaching ? (
            <g fill={`url(#${pid}-skin)`}>
              <path d="M -7 15 C -8 22, -6 27, -2 30 L 3 30 C 2 25, 1 21, 1 15 Z" />
              <path d="M 1 15 C 1 23, 3 28, 7 31 L 12 31 C 12 25, 12 21, 11 15 Z" />
              <path d="M 8 15 C 9 21, 12 25, 16 26 L 18 25 C 16 20, 15 16, 14 15 Z" />
              <path d="M -8 6 C -12 8, -14 12, -13 16 L -9 16 C -9 12, -9 9, -8 6 Z" />
            </g>
          ) : (
            <g fill={`url(#${pid}-skin)`}>
              <path d="M -7 15 C -8 21, -6 25, -2 27 L 3 27 C 2 23, 1 19, 1 15 Z" />
              <path d="M 2 15 C 3 22, 6 26, 10 28 L 15 28 C 14 23, 13 19, 12 15 Z" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

export const LightChildCharacter: React.FC<LightChildCharacterProps> = ({
  pose = "radiating",
  lightIntensity = 1,
  localFrame,
  idPrefix = "lightchild",
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame ?? currentFrame;

  const light = clamp01(lightIntensity);
  const pid = idPrefix;
  const gid = (n: string) => `${pid}-${n}`;

  // Expresión: radiante ↔ asustado (0 = sonrisa, 1 = miedo/asombro).
  const fear = pose === "scared" ? 1 : pose === "sheltered" ? 0.55 : 0;

  // Parpadeo sutil (acción de personaje, no sacudida de cámara).
  const blinkPhase = frame % 90;
  const blink =
    blinkPhase > 80 ? 1 - Math.sin(((blinkPhase - 80) / 10) * Math.PI) : 1;

  // Respiración + cabeceo suave.
  const breathe = 1 + Math.sin(frame * 0.08) * 0.012;
  const headTilt = Math.sin(frame * 0.05) * 2 - fear * 4;

  // ---- Pose por escena ----
  let lShoulder = 20;
  let lElbow = 12;
  let rShoulder = -20;
  let rElbow = -12;
  let reaching = false;
  let lHip = 0;
  let rHip = 0;
  let lKnee = 6;
  let rKnee = 6;

  if (pose === "walkingHand") {
    const walk = Math.sin(frame * 0.18);
    lShoulder = 18 + walk * 10;
    lElbow = 12;
    rShoulder = -132; // mano extendida hacia arriba (tomar la mano)
    rElbow = -24;
    reaching = true;
    lHip = walk * 24;
    rHip = -walk * 24;
    lKnee = 6 + Math.max(0, -walk) * 26;
    rKnee = 6 + Math.max(0, walk) * 26;
  } else if (pose === "radiating") {
    lShoulder = 100;
    lElbow = 24;
    rShoulder = -100;
    rElbow = -24;
  } else if (pose === "scared") {
    lShoulder = 94;
    lElbow = 80;
    rShoulder = -94;
    rElbow = -80;
    lHip = -6;
    rHip = 6;
    lKnee = 20;
    rKnee = 20;
  } else {
    // sheltered: brazos abrazándose, resguardado
    lShoulder = 30;
    lElbow = 54;
    rShoulder = -30;
    rElbow = -54;
    lHip = -4;
    rHip = 4;
    lKnee = 12;
    rKnee = 12;
  }

  // ---- Expresión ----
  const eyeRy = (10.5 * (0.2 + 0.8 * blink)) * (1 + fear * 0.12);
  const pupilR = 3.6 - fear * 0.7;
  const browArch = fear * 9;

  return (
    <svg
      viewBox="0 0 460 660"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Niño de Luz, humano infantil radiante"
    >
      <defs>
        <radialGradient id={gid("aura")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={gid("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F6D7B4" />
          <stop offset="60%" stopColor="#E5B98C" />
          <stop offset="100%" stopColor="#C8906A" />
        </linearGradient>
        <radialGradient id={gid("skin-face")} cx="42%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#FBE6C8" />
          <stop offset="62%" stopColor="#E9BE93" />
          <stop offset="100%" stopColor="#B98A63" />
        </radialGradient>
        <linearGradient id={gid("hair")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#4A3424" />
          <stop offset="55%" stopColor="#332414" />
          <stop offset="100%" stopColor="#1C130B" />
        </linearGradient>
        <linearGradient id={gid("sweater")} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#D98A54" />
          <stop offset="55%" stopColor="#B4683A" />
          <stop offset="100%" stopColor="#7C4220" />
        </linearGradient>
        <linearGradient id={gid("cream")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F3E3C3" />
          <stop offset="100%" stopColor="#D8C09A" />
        </linearGradient>
        <linearGradient id={gid("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#4A5A6A" />
          <stop offset="100%" stopColor="#2A3542" />
        </linearGradient>
        <linearGradient id={gid("mouth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A2620" />
          <stop offset="100%" stopColor="#2A0F0C" />
        </linearGradient>
        <filter id={gid("glow")} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      {/* ===== Aura cálida dorada (multicapa, se atenúa con lightIntensity) ===== */}
      <g opacity={light}>
        <ellipse cx="230" cy="330" rx="195" ry="235" fill={`url(#${gid("aura")})`} opacity="0.34" filter={`url(#${gid("glow")})`} />
        <ellipse cx="230" cy="330" rx="120" ry="160" fill={`url(#${gid("aura")})`} opacity="0.5" />
        <ellipse cx="230" cy="330" rx="70" ry="100" fill={`url(#${gid("aura")})`} opacity="0.65" filter={`url(#${gid("glow")})`} />
      </g>

      {/* Rayos cálidos suaves */}
      <g opacity={light * 0.55} stroke="#FDE047" strokeWidth="3" strokeLinecap="round">
        {RAYS.map((r, i) => (
          <path
            key={`ray-${i}`}
            d={`M ${230 + r.x * 64} ${330 + r.y * 80} L ${
              230 + r.x * (64 + r.len)
            } ${330 + r.y * (80 + r.len)}`}
            opacity={0.5 + 0.4 * Math.abs(Math.sin(frame * 0.04 + r.phase))}
          />
        ))}
      </g>

      {/* Motas doradas flotantes */}
      <g fill="#FDE047">
        {MOTES.map((m, i) => {
          const y = ((m.y0 - frame * m.speed) % 560 + 560) % 560 + 40;
          const x = m.x + Math.sin(frame * 0.02 + m.phase) * 18;
          return (
            <circle
              key={`mote-${i}`}
              cx={x}
              cy={y}
              r={m.r}
              opacity={(0.35 + 0.5 * Math.abs(Math.sin(frame * 0.03 + m.phase))) * light}
            />
          );
        })}
      </g>

      {/* ===== torsoGroup ===== */}
      <g transform={`translate(230, 470) scale(${breathe}, ${breathe})`}>
        {/* ===== legsGroup (piernas articuladas) ===== */}
        <g>
          {/* Pierna izquierda */}
          <g transform={`translate(-18, 0) rotate(${lHip})`}>
            <path
              d="M -10 0 C -11 30, -10 58, -6 82 L 13 82 C 11 58, 11 30, 10 0 Z"
              fill={`url(#${gid("pants")})`}
            />
            <path d="M -10 0 C -11 30, -10 58, -6 82" stroke="#1C2530" strokeWidth="2" fill="none" opacity="0.5" />
            <g transform={`translate(0, 82) rotate(${lKnee})`}>
              <path
                d="M -9 0 C -10 24, -9 46, -6 62 L 12 62 C 10 46, 10 24, 9 0 Z"
                fill={`url(#${gid("pants")})`}
              />
              <path
                d="M -7 60 L 14 60 C 16 70, 15 78, 9 82 L -10 82 C -11 74, -10 66, -7 60 Z"
                fill="#2A1C12"
              />
            </g>
          </g>
          {/* Pierna derecha */}
          <g transform={`translate(18, 0) rotate(${rHip})`}>
            <path
              d="M -13 0 C -11 30, -11 58, -13 82 L 6 82 C 6 58, 6 30, 6 0 Z"
              fill={`url(#${gid("pants")})`}
            />
            <path d="M 6 0 C 6 30, 6 58, -1 82" stroke="#1C2530" strokeWidth="2" fill="none" opacity="0.5" />
            <g transform={`translate(0, 82) rotate(${rKnee})`}>
              <path
                d="M -11 0 C -10 24, -10 46, -12 62 L 5 62 C 5 46, 5 24, 5 0 Z"
                fill={`url(#${gid("pants")})`}
              />
              <path
                d="M -12 60 L 7 60 C 7 70, 8 78, 14 82 L -4 82 C -5 74, -8 66, -12 60 Z"
                fill="#2A1C12"
              />
            </g>
          </g>
        </g>

        {/* --- Torso: suéter terracota con pliegues --- */}
        <g>
          <path
            d="M -46 0 C -54 -44, -60 -96, -62 -136 C -63 -160, -58 -172, -42 -176 L 42 -176 C 58 -172, 63 -160, 62 -136 C 60 -96, 54 -44, 46 0 Z"
            fill={`url(#${gid("sweater")})`}
          />
          {/* Sombra lateral + pliegues */}
          <path d="M -62 -136 C -60 -96, -54 -44, -46 0 L -24 0 C -30 -48, -36 -100, -40 -168 L -42 -176 Z" fill="#7C4220" opacity="0.55" />
          <path d="M -50 -40 C -54 -90, -58 -130, -60 -168" stroke="#7C4220" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M -32 -30 C -36 -80, -40 -130, -42 -170" stroke="#8C4E28" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 32 -30 C 36 -80, 40 -130, 42 -170" stroke="#8C4E28" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 50 -40 C 54 -90, 58 -130, 60 -168" stroke="#7C4220" strokeWidth="2.5" fill="none" opacity="0.5" />
          {/* Cuello crema del suéter */}
          <path d="M -30 -174 C -20 -162, -10 -156, 0 -154 C 10 -156, 20 -162, 30 -174 L 24 -180 C 14 -172, 6 -168, 0 -166 C -6 -168, -14 -172, -24 -180 Z" fill={`url(#${gid("cream")})`} />
          {/* Rim light dorado (del aura propia) */}
          <path d="M 62 -136 C 63 -160, 58 -172, 42 -176 L 24 -176 L 32 -140 Z" fill="#FDE047" opacity={0.35 * light} />
        </g>

        {/* ===== neckHeadGroup ===== */}
        <g transform={`translate(0, -170) rotate(${headTilt})`}>
          {/* Cuello */}
          <path
            d="M -13 6 C -13 -8, -11 -18, -9 -28 L 9 -28 C 11 -18, 13 -8, 13 6 Z"
            fill={`url(#${gid("skin")})`}
          />

          {/* --- Cabeza (cara → expresiones) --- */}
          <g transform="translate(0, -28)">
            {/* Orejas */}
            <path d="M -58 -30 C -66 -34, -69 -26, -66 -20 C -63 -14, -57 -12, -54 -16 Z" fill={`url(#${gid("skin")})`} />
            <path d="M 58 -30 C 66 -34, 69 -26, 66 -20 C 63 -14, 57 -12, 54 -16 Z" fill={`url(#${gid("skin")})`} />

            {/* Cráneo / rostro infantil */}
            <path
              d="M 0 -118 C 34 -118, 60 -98, 64 -64 C 68 -34, 66 -6, 56 16 C 46 36, 28 50, 8 54 C -8 50, -46 36, -56 16 C -66 -6, -68 -34, -64 -64 C -60 -98, -34 -118, 0 -118 Z"
              fill={`url(#${gid("skin-face")})`}
            />
            {/* Mejillas sonrosadas */}
            <ellipse cx="-36" cy="2" rx="13" ry="9" fill="#E59A7A" opacity="0.4" />
            <ellipse cx="36" cy="2" rx="13" ry="9" fill="#E59A7A" opacity="0.4" />
            {/* Sombra de mandíbula */}
            <path d="M -56 16 C -46 36, -28 50, -8 54 C 8 50, 46 36, 56 16 C 42 26, 22 32, 0 32 C -22 32, -42 26, -56 16 Z" fill="#B98A63" opacity="0.45" />

            {/* Cabello despeinado castaño oscuro con reflejos dorados */}
            <g fill={`url(#${gid("hair")})`}>
              <path d="M -64 -64 C -60 -100, -34 -122, 0 -122 C 34 -122, 60 -100, 64 -64 C 54 -82, 34 -92, 0 -92 C -34 -92, -54 -82, -64 -64 Z" />
              <path d="M -60 -60 C -48 -98, -28 -110, -2 -112 L 4 -112 C -8 -100, -22 -92, -40 -76 Z" fill="#332414" />
              <path d="M 60 -60 C 48 -98, 28 -110, 2 -112 L -4 -112 C 8 -100, 22 -92, 40 -76 Z" fill="#332414" />
              {/* Mechones laterales */}
              <path d="M -62 -58 C -64 -46, -62 -36, -57 -28 C -56 -38, -57 -48, -62 -58 Z" fill="#1C130B" />
              <path d="M 62 -58 C 64 -46, 62 -36, 57 -28 C 56 -38, 57 -48, 62 -58 Z" fill="#1C130B" />
              {/* Mechón frontal caído */}
              <path d="M -6 -118 C -10 -104, -12 -92, -10 -82 C -4 -92, 4 -94, 8 -88 C 7 -100, 2 -110, -6 -118 Z" fill="#1C130B" transform={`rotate(${Math.sin(frame * 0.1) * 2} 0 -100)`} />
              {/* Reflejos dorados */}
              <path d="M -40 -108 C -34 -118, -24 -120, -12 -118" stroke="#C98A3B" strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M 14 -118 C 26 -120, 36 -116, 44 -108" stroke="#C98A3B" strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M -6 -120 C 0 -122, 6 -120, 10 -114" stroke="#C98A3B" strokeWidth="1.6" fill="none" opacity="0.6" />
            </g>

            {/* ===== faceExpressions ===== */}
            <g>
              {/* Cejas suaves (se arquean con el miedo) */}
              <g transform={`translate(0, ${-browArch})`}>
                <path
                  d={fear > 0.4 ? "M -38 -52 C -30 -62, -20 -66, -12 -64" : "M -36 -56 C -28 -62, -20 -64, -12 -62"}
                  stroke="#332414"
                  strokeWidth="3.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={fear > 0.4 ? "M 38 -52 C 30 -62, 20 -66, 12 -64" : "M 36 -56 C 28 -62, 20 -64, 12 -62"}
                  stroke="#332414"
                  strokeWidth="3.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Ojos grandes y expresivos (parpadeo + brillo dorado) */}
              <g>
                {/* Esclerótica */}
                <ellipse cx="-24" cy="-38" rx="13" ry={eyeRy} fill="#FFFFFF" />
                <ellipse cx="24" cy="-38" rx="13" ry={eyeRy} fill="#FFFFFF" />
                {/* Iris avellana */}
                <circle cx="-24" cy="-38" r="8.2" fill="#5C3A1E" />
                <circle cx="24" cy="-38" r="8.2" fill="#5C3A1E" />
                <circle cx="-24" cy="-38" r="8.2" fill="none" stroke="#3A2410" strokeWidth="1.2" opacity="0.5" />
                <circle cx="24" cy="-38" r="8.2" fill="none" stroke="#3A2410" strokeWidth="1.2" opacity="0.5" />
                {/* Pupila (se encoge con el miedo) */}
                <circle cx="-24" cy="-38" r={pupilR} fill="#0A0602" />
                <circle cx="24" cy="-38" r={pupilR} fill="#0A0602" />
                {/* Brillo dorado (luz interna) */}
                <circle cx="-26" cy="-40" r="2.6" fill="#FDE047" opacity={0.7 + light * 0.3} />
                <circle cx="22" cy="-40" r="2.6" fill="#FDE047" opacity={0.7 + light * 0.3} />
                <circle cx="-21" cy="-36" r="1.2" fill="#FFFFFF" opacity="0.9" />
                <circle cx="27" cy="-36" r="1.2" fill="#FFFFFF" opacity="0.9" />
              </g>
              {/* Párpados superiores */}
              <ellipse cx="-24" cy="-40" rx="14" ry="3.2" fill="rgba(0,0,0,0.2)" />
              <ellipse cx="24" cy="-40" rx="14" ry="3.2" fill="rgba(0,0,0,0.2)" />

              {/* Nariz pequeña */}
              <path d="M 0 -22 C -3 -18, -3 -15, 0 -11 C 1 -15, 1 -18, 0 -22 Z" fill="#D9A17E" />

              {/* Boca: sonrisa radiante ↔ asombro/miedo */}
              <g transform="translate(0, 8)">
                {fear < 0.3 ? (
                  <g>
                    {/* Sonrisa abierta sincera */}
                    <path
                      d="M -15 0 C -9 9, 9 9, 15 0 C 11 15, -11 15, -15 0 Z"
                      fill={`url(#${gid("mouth")})`}
                    />
                    {/* Dientes */}
                    <path d="M -11 1 C -7 6, -3 7, 0 7 C 3 7, 7 6, 11 1 C 9 3, 0 4, -11 1 Z" fill="#F4EBD2" />
                    {/* Labio superior */}
                    <path d="M -15 0 C -9 6, 9 6, 15 0" stroke="#8C4E28" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {/* Comisuras hacia arriba */}
                    <path d="M -15 0 C -13 2, -11 3, -9 3" stroke="#8C4E28" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    <path d="M 15 0 C 13 2, 11 3, 9 3" stroke="#8C4E28" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </g>
                ) : (
                  <g>
                    {/* Boca pequeña de asombro / miedo */}
                    <ellipse cx="0" cy="2" rx={5 + fear * 2.5} ry={4 + fear * 3.5} fill={`url(#${gid("mouth")})`} />
                    <path d="M -5 2 C -3 5, 3 5, 5 2" stroke="#8C4E28" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
                  </g>
                )}
              </g>
            </g>

            {/* Rim light dorado del rostro */}
            <path d="M 64 -64 C 68 -34, 66 -6, 56 16" stroke="#FDE047" strokeWidth="2" fill="none" opacity={0.35 * light} />
          </g>
        </g>

        {/* ===== Brazo izquierdo ===== */}
        <g transform="translate(-46, -150)">
          <ChildArm pid={pid} flip={false} shoulder={lShoulder} elbow={lElbow} />
        </g>

        {/* ===== Brazo derecho ===== */}
        <g transform="translate(46, -150)">
          <ChildArm pid={pid} flip shoulder={rShoulder} elbow={rElbow} reaching={reaching} />
        </g>
      </g>
    </svg>
  );
};
