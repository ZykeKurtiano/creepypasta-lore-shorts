import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

/**
 * AnimatorCharacter.tsx — Dave Kelly, ilustrador/animador nocturno (2004).
 *
 * Rig articulado por jerarquía (Estándar v3): un humano estilizado completo
 * sentado frente a su escritorio de madrugada, dibujando una viñeta. Cero
 * siluetas/maniquís: anatomía completa con rostro expresivo (cejas, ojos con
 * parpadeo y dilatación, boca animada), gafas con reflejo de monitor, cabello
 * despeinado en capas, franela con pliegues reales y doble rim light
 * (cian de monitor → carmesí de corrupción).
 *
 * Esqueleto jerárquico (pivotes reales, transformación translate/rotate):
 *   torsoGroup
 *     ├─ neckHeadGroup → headGroup → faceExpressions
 *     ├─ leftShoulderGroup → leftUpperArm → leftForearm → leftHand
 *     └─ rightShoulderGroup → rightUpperArm → rightForearm → rightHandWithStylus
 *
 * Animación 100% determinista: useCurrentFrame + interpolate + Math.sin.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export interface AnimatorCharacterProps {
  /** 0 = dibujando tranquilo, 1 = horror total retrocediendo. */
  corruption?: number;
  /** Frame local; si se omite usa useCurrentFrame(). */
  localFrame?: number;
  /** Prefijo único para IDs de <defs> (evita colisiones entre instancias). */
  idPrefix?: string;
}

/** Silueta del torso (reutilizada como clip de pliegues/rim light). */
const TORSO_PATH =
  "M -44 0 " +
  "C -52 -48, -58 -110, -66 -168 " +
  "C -70 -196, -72 -214, -70 -228 " +
  "C -58 -236, -30 -240, 0 -240 " +
  "C 30 -240, 58 -236, 70 -228 " +
  "C 72 -214, 70 -196, 66 -168 " +
  "C 58 -110, 52 -48, 44 0 Z";

export const AnimatorCharacter: React.FC<AnimatorCharacterProps> = ({
  corruption = 0,
  localFrame,
  idPrefix = "animator",
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame ?? currentFrame;

  const c = clamp01(corruption);
  const pid = `${idPrefix}-ac`;
  const g = (n: string) => `${pid}-${n}`;

  // ---- Poses narrativas (interpolate, clamp) ----
  const drawingAmp = clamp01(interpolate(c, [0.26, 0.4], [1, 0]));

  const torsoLean = interpolate(c, [0, 0.35, 1], [7, 4, -9]);
  const neckTilt = interpolate(c, [0, 0.35, 1], [12, 6, -14]);
  const headTilt = interpolate(c, [0, 0.35, 1], [3, 1, -7]);

  // Brazo izquierdo: apoyado → se levanta a cubrir/retroceder.
  const lShoulder = interpolate(c, [0, 0.4, 1], [-16, -8, -34]);
  const lElbow = interpolate(c, [0, 0.4, 1], [12, 18, 42]);

  // Brazo derecho (dibuja): se detiene y se retira bruscamente.
  const rShoulder = interpolate(c, [0, 0.4, 1], [30, 24, 8]);
  const rElbow = interpolate(c, [0, 0.4, 1], [-24, -32, -58]);

  // ---- Expresión facial ----
  const browArch = interpolate(c, [0, 0.45, 1], [0, 7, 16]);
  const eyeOpen = interpolate(c, [0, 0.4, 1], [1, 1.35, 1.9]);
  const pupilSize = interpolate(c, [0, 0.4, 1], [1, 0.7, 0.32]);
  const mouthOpen = interpolate(c, [0, 0.35, 1], [0, 0.12, 1]);

  // Parpadeo natural (acción de personaje, no sacudida de cámara).
  const blinkPhase = frame % 120;
  const blink =
    blinkPhase > 108 ? Math.sin(((blinkPhase - 108) / 12) * Math.PI) : 1;

  // ---- Micro-movimiento orgánico determinista ----
  const breathe = 1 + Math.sin(frame * 0.09) * 0.012;
  const hairSway = Math.sin(frame * 0.11 + 0.6) * 1.4;
  const handTremble = Math.sin(frame * 0.5) * 0.8 * drawingAmp;

  // Trazo de dibujo: pequeñas elipses sobre la viñeta (solo dibujando).
  const strokeX = Math.sin(frame * 0.3) * 4 * drawingAmp;
  const strokeY = (Math.cos(frame * 0.23) - 1) * 2.5 * drawingAmp;

  const eyeRy = 5 * eyeOpen * blink;
  const irisR = 5.2 * (0.6 + 0.4 * pupilSize);
  const pupilR = 2.6 * pupilSize;

  return (
    <svg
      viewBox="0 0 600 720"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Ilustrador nocturno Dave Kelly dibujando en su escritorio"
    >
      <defs>
        <linearGradient id={g("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#E8D2B8" />
          <stop offset="55%" stopColor="#C9A384" />
          <stop offset="100%" stopColor="#8E6B52" />
        </linearGradient>
        <radialGradient id={g("skin-face")} cx="40%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#EFDBC2" />
          <stop offset="60%" stopColor="#D0A98A" />
          <stop offset="100%" stopColor="#8A684E" />
        </radialGradient>
        <linearGradient id={g("hair")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#1A212B" />
          <stop offset="55%" stopColor="#0D1218" />
          <stop offset="100%" stopColor="#05070A" />
        </linearGradient>
        <linearGradient id={g("flannel")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#1C2A34" />
          <stop offset="50%" stopColor="#14202A" />
          <stop offset="100%" stopColor="#0A1218" />
        </linearGradient>
        <linearGradient id={g("flannel-shadow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B131A" />
          <stop offset="100%" stopColor="#05080C" />
        </linearGradient>
        <linearGradient id={g("mouth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0A0C" />
          <stop offset="100%" stopColor="#0A0203" />
        </linearGradient>
        <linearGradient id={g("desk")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A232B" />
          <stop offset="100%" stopColor="#0A0F14" />
        </linearGradient>
        <linearGradient id={g("paper")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#D8D2C2" />
          <stop offset="100%" stopColor="#9C9484" />
        </linearGradient>
        <linearGradient id={g("rim-cyan")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("rim-crimson")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </linearGradient>
        <clipPath id={g("torso-clip")}>
          <path d={TORSO_PATH} />
        </clipPath>
        <filter id={g("glow")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* ===== Escritorio + viñeta (primer plano, detrás del personaje) ===== */}
      <g>
        <path
          d="M 0 566 L 600 566 L 600 720 L 0 720 Z"
          fill={`url(#${g("desk")})`}
        />
        <path
          d="M 0 566 L 600 566"
          stroke="#2B3A42"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
        {/* Tableta / viñeta inclinada */}
        <g transform="translate(340, 600) rotate(-6)">
          <path
            d="M 0 0 L 210 0 L 196 132 L -14 132 Z"
            fill={`url(#${g("paper")})`}
            stroke="#6B6456"
            strokeWidth="2"
          />
          {/* Marco interior de la viñeta */}
          <path
            d="M 16 16 L 194 16 L 182 116 L 2 116 Z"
            fill="none"
            stroke="#4A443A"
            strokeWidth="1.5"
            opacity="0.7"
          />
          {/* Boceto tenue de la criatura */}
          <path
            d="M 70 88 C 78 66, 96 60, 108 68 C 120 76, 122 92, 116 102"
            stroke="#6B6456"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 96 70 C 104 74, 110 80, 112 88"
            stroke="#6B6456"
            strokeWidth="1.6"
            fill="none"
            opacity="0.5"
          />
          {/* Tinta negra emergente (crece con la corrupción) */}
          <g opacity={c}>
            <path
              d="M 58 60 C 70 48, 96 44, 116 54 C 136 64, 134 88, 120 104 C 104 122, 74 120, 62 104 C 50 88, 46 72, 58 60 Z"
              fill="#050102"
            />
            <path
              d="M 120 104 C 130 100, 138 92, 140 80"
              stroke="#050102"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 62 104 C 54 100, 46 92, 44 80"
              stroke="#050102"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>

      {/* ===== Rig del personaje ===== */}
      <g transform={`translate(300, 552) rotate(${torsoLean})`}>
        {/* --- Torso: franela con pliegues --- */}
        <g>
          <path d={TORSO_PATH} fill={`url(#${g("flannel")})`} />
          {/* Sombra lateral profunda */}
          <g clipPath={`url(#${g("torso-clip")})`}>
            <path
              d="M -70 -228 C -72 -180, -66 -120, -60 -60 L -44 0 L -26 0 C -34 -60, -40 -120, -40 -228 Z"
              fill={`url(#${g("flannel-shadow")})`}
              opacity="0.85"
            />
            {/* Pliegues orgánicos (sombras + luces) */}
            <path
              d="M -52 -60 C -56 -110, -60 -160, -64 -210"
              stroke="#04070A"
              strokeWidth="3"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M -34 -40 C -38 -100, -42 -160, -44 -215"
              stroke="#04070A"
              strokeWidth="2.5"
              fill="none"
              opacity="0.45"
            />
            <path
              d="M 34 -40 C 38 -100, 42 -160, 44 -215"
              stroke="#04070A"
              strokeWidth="2.5"
              fill="none"
              opacity="0.45"
            />
            <path
              d="M 52 -60 C 56 -110, 60 -160, 64 -210"
              stroke="#04070A"
              strokeWidth="3"
              fill="none"
              opacity="0.5"
            />
            {/* Franja plaid horizontal */}
            <path
              d="M -70 -120 C -30 -132, 30 -132, 70 -120"
              stroke="#2B3A42"
              strokeWidth="2"
              fill="none"
              opacity="0.35"
            />
            <path
              d="M -70 -180 C -30 -192, 30 -192, 70 -180"
              stroke="#2B3A42"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            {/* Rim light cian (monitor) que decae con la corrupción */}
            <path
              d="M 66 -168 C 70 -196, 72 -214, 70 -228 L 58 -240 L 30 -240 L 40 -168 Z"
              fill={`url(#${g("rim-cyan")})`}
              opacity={1 - c}
            />
            {/* Rim light carmesí que crece con la corrupción */}
            <path
              d="M 66 -168 C 70 -196, 72 -214, 70 -228 L 58 -240 L 30 -240 L 40 -168 Z"
              fill={`url(#${g("rim-crimson")})`}
              opacity={c}
            />
          </g>
          {/* Botonadura central */}
          <path
            d="M -8 -30 C -8 -90, -8 -150, -8 -200 L 8 -200 C 8 -150, 8 -90, 8 -30 Z"
            fill="#0A1218"
          />
          <path
            d="M -5 -60 C -5 -120, -5 -170, -5 -200"
            stroke="#2B3A42"
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
          {/* Cuello de la franela */}
          <path
            d="M -22 -232 C -10 -222, -4 -214, 0 -210 C 4 -214, 10 -222, 22 -232 L 14 -238 C 6 -232, 2 -228, 0 -226 C -2 -228, -6 -232, -14 -238 Z"
            fill="#0A1218"
          />
        </g>

        {/* --- Cabeza (jerarquía: cuello → cabeza → expresión) --- */}
        <g transform={`translate(0, -228) rotate(${neckTilt})`}>
          {/* Cuello */}
          <path
            d="M -15 0 C -15 -16, -13 -28, -11 -40 L 11 -40 C 13 -28, 15 -16, 15 0 Z"
            fill={`url(#${g("skin")})`}
          />
          <path
            d="M 0 0 C -2 -14, -2 -28, 0 -40"
            stroke="#8A684E"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />

          <g transform={`translate(0, -40) rotate(${headTilt}) scale(${breathe})`}>
            {/* Orejas */}
            <path
              d="M -50 -56 C -58 -60, -60 -52, -58 -46 C -56 -40, -50 -38, -47 -42 Z"
              fill={`url(#${g("skin")})`}
            />
            <path
              d="M 50 -56 C 58 -60, 60 -52, 58 -46 C 56 -40, 50 -38, 47 -42 Z"
              fill={`url(#${g("skin")})`}
            />

            {/* Cráneo / rostro */}
            <path
              d="M 0 -106 C 30 -106, 50 -96, 52 -70 C 54 -50, 52 -30, 46 -16 C 40 -2, 30 8, 18 12 C 10 15, -10 15, -18 12 C -30 8, -40 -2, -46 -16 C -52 -30, -54 -50, -52 -70 C -50 -96, -30 -106, 0 -106 Z"
              fill={`url(#${g("skin-face")})`}
            />
            {/* Sombra de mandíbula / mejillas */}
            <path
              d="M -46 -16 C -40 -2, -30 8, -18 12 C -10 15, 10 15, 18 12 C 30 8, 40 -2, 46 -16 C 36 -6, 20 2, 0 2 C -20 2, -36 -6, -46 -16 Z"
              fill="#7A5A42"
              opacity="0.55"
            />
            {/* Sombra de cuenca ocular */}
            <ellipse cx="-18" cy="-56" rx="15" ry="9" fill="#7A5A42" opacity="0.4" />
            <ellipse cx="18" cy="-56" rx="15" ry="9" fill="#7A5A42" opacity="0.4" />

            {/* Cabello despeinado en capas orgánicas */}
            <g fill={`url(#${g("hair")})`}>
              <path d="M -52 -70 C -48 -100, -30 -112, 0 -112 C 30 -112, 48 -100, 52 -70 C 44 -86, 30 -94, 0 -94 C -30 -94, -44 -86, -52 -70 Z" />
              <path
                d="M -50 -66 C -40 -96, -22 -108, -2 -110 L 2 -110 C -8 -98, -20 -90, -34 -76 Z"
                fill="#0D1218"
              />
              <path
                d="M 50 -66 C 40 -96, 22 -108, 2 -110 L -2 -110 C 8 -98, 20 -90, 34 -76 Z"
                fill="#0D1218"
              />
              {/* Mechones laterales sobre sienes */}
              <path
                d="M -50 -62 C -52 -52, -52 -44, -48 -36 C -46 -44, -46 -54, -50 -62 Z"
                fill="#05070A"
              />
              <path
                d="M 50 -62 C 52 -52, 52 -44, 48 -36 C 46 -44, 46 -54, 50 -62 Z"
                fill="#05070A"
              />
              {/* Mechón frontal caído */}
              <path
                d="M -4 -108 C -8 -96, -10 -86, -8 -76 C -2 -86, 4 -88, 8 -84 C 6 -94, 2 -104, -4 -108 Z"
                fill="#05070A"
                transform={`rotate(${hairSway} 0 -92)`}
              />
            </g>

            {/* --- Expresión facial --- */}
            <g id={`${pid}-face`}>
              {/* Cejas (se arquean hacia arriba en shock con la corrupción) */}
              <g transform={`translate(0, ${-browArch})`}>
                <path
                  d="M -32 -68 C -24 -80, -14 -84, -6 -80"
                  stroke="#0D1218"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 32 -68 C 24 -80, 14 -84, 6 -80"
                  stroke="#0D1218"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Ojos: blancos, iris, pupila dilatada, brillo */}
              <g>
                {/* Esclerótica */}
                <ellipse cx="-18" cy="-58" rx="11" ry={eyeRy} fill="#F4F1E8" />
                <ellipse cx="18" cy="-58" rx="11" ry={eyeRy} fill="#F4F1E8" />
                {/* Iris */}
                <circle cx="-18" cy="-58" r={irisR} fill="#3A2A1A" />
                <circle cx="18" cy="-58" r={irisR} fill="#3A2A1A" />
                {/* Pupila (se encoge por horror) */}
                <circle cx="-18" cy="-58" r={pupilR} fill="#060404" />
                <circle cx="18" cy="-58" r={pupilR} fill="#060404" />
                {/* Brillo del monitor */}
                <circle cx="-20" cy="-60" r="1.6" fill="#FFFFFF" opacity="0.9" />
                <circle cx="16" cy="-60" r="1.6" fill="#FFFFFF" opacity="0.9" />
              </g>

              {/* Párpados superiores (profundidad) */}
              <ellipse cx="-18" cy="-60" rx="12" ry="3.4" fill="rgba(0,0,0,0.28)" />
              <ellipse cx="18" cy="-60" rx="12" ry="3.4" fill="rgba(0,0,0,0.28)" />

              {/* Nariz */}
              <path
                d="M 0 -50 C -3 -46, -3 -43, 0 -39 C 1 -43, 1 -46, 0 -50 Z"
                fill="#B98A6B"
              />
              <path
                d="M 0 -44 C -2 -41, -2 -39, 0 -38"
                stroke="#7A5A42"
                strokeWidth="1.2"
                fill="none"
                opacity="0.6"
              />

              {/* Boca: de concentración tranquila → grito de terror (nunca sonríe) */}
              <g transform={`translate(0, -28)`}>
                {/* Cavidad (se abre con mouthOpen) */}
                <g transform={`scale(1, ${0.2 + mouthOpen})`}>
                  <path
                    d="M -12 0 C -8 6, 8 6, 12 0 C 8 12, -8 12, -12 0 Z"
                    fill={`url(#${g("mouth")})`}
                  />
                </g>
                {/* Dientes superiores (visibles al abrir) */}
                <g opacity={mouthOpen}>
                  <path d="M -9 1 L -6 6 L -4 1 Z" fill="#D8CFBE" />
                  <path d="M -2 1 L 0 6 L 2 1 Z" fill="#D8CFBE" />
                  <path d="M 4 1 L 6 6 L 9 1 Z" fill="#D8CFBE" />
                </g>
                {/* Labios: neutros → comisuras hacia abajo (grito), NUNCA sonrisa */}
                <path
                  d="M -13 -1 C -6 1, 6 1, 13 -1"
                  stroke="#6B4630"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M -9 4 C -3 7, 3 7, 9 4"
                  stroke="#6B4630"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </g>
            </g>

            {/* Gafas con reflejo cian de monitor */}
            <g>
              <ellipse cx="-18" cy="-58" rx="17" ry="14" fill="none" stroke="#1A212B" strokeWidth="3" />
              <ellipse cx="18" cy="-58" rx="17" ry="14" fill="none" stroke="#1A212B" strokeWidth="3" />
              <path d="M -1 -58 C 1 -58, 3 -58, 5 -58" stroke="#1A212B" strokeWidth="2.5" fill="none" />
              <path d="M -35 -58 L -48 -56" stroke="#1A212B" strokeWidth="2" fill="none" />
              <path d="M 35 -58 L 48 -56" stroke="#1A212B" strokeWidth="2" fill="none" />
              {/* Reflejo sutil del monitor */}
              <path
                d="M -26 -64 L -16 -54"
                stroke="#22D3EE"
                strokeWidth="2"
                fill="none"
                opacity={0.5}
              />
              <path
                d="M 12 -64 L 22 -54"
                stroke="#22D3EE"
                strokeWidth="2"
                fill="none"
                opacity={0.5}
              />
            </g>
          </g>
        </g>

        {/* --- Brazo izquierdo (apoyado → se levanta a cubrir) --- */}
        <g transform={`translate(-70, -228) rotate(${lShoulder})`}>
          {/* Hombro / parte superior del brazo */}
          <path
            d="M -14 2 C -16 34, -14 64, -6 92 L 20 92 C 14 64, 14 34, 14 2 Z"
            fill={`url(#${g("flannel")})`}
          />
          {/* Puño arremangado */}
          <path d="M -8 78 L 22 78 L 20 92 L -6 92 Z" fill="#0A1218" />
          <path
            d="M -14 2 C -16 34, -14 64, -6 92"
            stroke="#04070A"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
          {/* Antebrazo */}
          <g transform={`translate(2, 92) rotate(${lElbow})`}>
            <path
              d="M -11 0 C -13 30, -11 56, -4 80 L 17 80 C 12 56, 12 30, 11 0 Z"
              fill={`url(#${g("flannel")})`}
            />
            <path
              d="M -11 0 C -13 30, -11 56, -4 80"
              stroke="#04070A"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
            {/* Mano apoyada en la tableta */}
            <g transform="translate(3, 80) rotate(0)">
              <path
                d="M -12 0 C -15 10, -13 18, -7 24 L 19 24 C 14 18, 14 10, 12 0 Z"
                fill={`url(#${g("skin")})`}
              />
              <path
                d="M -10 22 C -11 30, -10 36, -6 40 L 2 40 C 1 34, 0 30, 0 22 Z"
                fill={`url(#${g("skin")})`}
              />
              <path
                d="M 2 22 C 3 32, 6 38, 10 41 L 17 41 C 15 34, 13 30, 12 22 Z"
                fill={`url(#${g("skin")})`}
              />
            </g>
          </g>
        </g>

        {/* --- Brazo derecho (dibuja con stylus) --- */}
        <g transform={`translate(70, -228) rotate(${rShoulder})`}>
          <path
            d="M -14 2 C -16 34, -14 64, -6 92 L 20 92 C 14 64, 14 34, 14 2 Z"
            fill={`url(#${g("flannel")})`}
          />
          <path d="M -8 78 L 22 78 L 20 92 L -6 92 Z" fill="#0A1218" />
          {/* Rim light del monitor sobre el brazo */}
          <path
            d="M 14 2 C 14 34, 14 64, 20 92"
            stroke="#22D3EE"
            strokeWidth="2.5"
            fill="none"
            opacity={(1 - c) * 0.5}
            strokeLinecap="round"
          />
          <g transform={`translate(2, 92) rotate(${rElbow})`}>
            <path
              d="M -11 0 C -13 30, -11 56, -4 80 L 17 80 C 12 56, 12 30, 11 0 Z"
              fill={`url(#${g("flannel")})`}
            />
            <path
              d="M -11 0 C -13 30, -11 56, -4 80"
              stroke="#04070A"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
            {/* Mano + stylus (traza sobre la viñeta) */}
            <g
              transform={`translate(3, 80) rotate(-8) translate(${strokeX + handTremble}, ${strokeY})`}
            >
              <path
                d="M -12 0 C -15 10, -13 18, -7 24 L 19 24 C 14 18, 14 10, 12 0 Z"
                fill={`url(#${g("skin")})`}
              />
              {/* Dedos sosteniendo el lápiz */}
              <path
                d="M -10 22 C -12 30, -10 36, -6 40 L 1 40 C 0 34, 0 30, 0 22 Z"
                fill={`url(#${g("skin")})`}
              />
              <path
                d="M 2 22 C 3 32, 6 38, 10 41 L 17 41 C 15 34, 13 30, 12 22 Z"
                fill={`url(#${g("skin")})`}
              />
              {/* Stylus */}
              <g transform={`rotate(-24 10 34)`}>
                <path
                  d="M 7 26 L 13 46 C 13.5 49, 12.5 51, 10 51 C 7.5 51, 6.5 49, 7 46 L 1 26 Z"
                  fill="#0D1218"
                />
                <path d="M 10 51 L 10 55" stroke="#0D1218" strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* Resplandor de corrupción creciente alrededor del personaje */}
      <ellipse
        cx="300"
        cy="330"
        rx="190"
        ry="230"
        fill="#7F1D1D"
        opacity={c * 0.16}
        filter={`url(#${g("glow")})`}
      />
    </svg>
  );
};
