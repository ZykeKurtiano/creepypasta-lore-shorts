import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * ProxyHumanCharacter.tsx — Víctima / Proxy humano (Estándar v3).
 *
 * Anatomía completa expresiva en AGONÍA/HORROR (no sonrisa): cejas fuertemente
 * fruncidas hacia arriba en el centro, ojo izquierdo inyectado en sangre
 * llorando tinta/carmesí, ojo derecho dilatado con estética pálida fría, y
 * boca abierta gritando/jadeando (dientes superiores e interior oscuro, comisuras
 * hacia abajo). Sudadera urbana oscura con capucha caída detrás del cuello,
 * cremallera, bolsillos y pliegues reales, doble rim light (carmés izquierda,
 * cian derecha). Brazos articulados ESTIRADOS hacia afuera siendo jalados:
 * izquierdo tironeado por zarcillos carmesí (Zalgo), derecho por tentáculos
 * negros con brillo cian (Slenderman), mientras el torso se arquea y resiste
 * y las piernas orgánicas bracan en diagonal.
 *
 * Animación 100% determinista: useCurrentFrame + interpolate + Math.sin.
 */

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export interface ProxyHumanCharacterProps {
  /** -1 (Zalgo gana a la izquierda) .. +1 (Slenderman gana a la derecha). */
  tugBalance?: number;
  /** 0..1 intensidad de venas carmesí / estética Zalgo. */
  corruptionLevel?: number;
  localFrame?: number;
  idPrefix?: string;
}

export const ProxyHumanCharacter: React.FC<ProxyHumanCharacterProps> = ({
  tugBalance = 0,
  corruptionLevel = 0,
  localFrame,
  idPrefix = "proxy",
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame ?? currentFrame;

  const tug = clamp(tugBalance, -1, 1);
  const corrupt = clamp(corruptionLevel, 0, 1);
  const pid = idPrefix;
  const gid = (n: string) => `${pid}-${n}`;

  // ---- Poses (tirón hacia ambos lados) ----
  const torsoLean = tug * 10;
  const headFight = -tug * 16 + Math.sin(frame * 0.7) * 1.2;
  const leftStretch = clamp((-tug + 1) / 2, 0, 1);
  const rightStretch = clamp((tug + 1) / 2, 0, 1);

  // Brazos estirados hacia afuera (hombros → codos casi rectos, separados).
  // rotación SVG: positivo = hacia la izquierda, negativo = hacia la derecha.
  const lShoulder = 18 + 62 * leftStretch;
  const lElbow = 8 + 8 * leftStretch;
  const rShoulder = -18 - 62 * rightStretch;
  const rElbow = -8 - 8 * rightStretch;

  // Piernas: braceo tenso en diagonal
  const lHip = -6 + tug * 8;
  const lKnee = 12;
  const rHip = 6 - tug * 8;
  const rKnee = 12;

  // ---- Expresión ----
  const jawDrop = 0.62 + 0.28 * Math.abs(tug); // grito más abierto al ser jalado
  const tremble = Math.sin(frame * 0.9) * 0.8;
  const veinOpacity = 0.3 + corrupt * 0.7;

  return (
    <svg
      viewBox="0 0 560 760"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Víctima humana jalada por Zalgo y Slenderman"
    >
      <defs>
        <linearGradient id={gid("skin")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#D8B79A" />
          <stop offset="60%" stopColor="#B4876A" />
          <stop offset="100%" stopColor="#7A543C" />
        </linearGradient>
        <radialGradient id={gid("skin-face")} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#E2C4A6" />
          <stop offset="62%" stopColor="#BE8F6D" />
          <stop offset="100%" stopColor="#7E5640" />
        </radialGradient>
        <linearGradient id={gid("hair")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3A2E22" />
          <stop offset="55%" stopColor="#241C15" />
          <stop offset="100%" stopColor="#0C0907" />
        </linearGradient>
        <linearGradient id={gid("hoodie")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#46545E" />
          <stop offset="50%" stopColor="#34404A" />
          <stop offset="100%" stopColor="#1C252C" />
        </linearGradient>
        <linearGradient id={gid("hoodie-shadow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#131A20" />
          <stop offset="100%" stopColor="#080C10" />
        </linearGradient>
        <linearGradient id={gid("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#232D36" />
          <stop offset="100%" stopColor="#10171D" />
        </linearGradient>
        <linearGradient id={gid("mouth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0A0C" />
          <stop offset="100%" stopColor="#080203" />
        </linearGradient>
        <linearGradient id={gid("rim-crimson")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gid("rim-cold")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===== pelvisTorsoGroup ===== */}
      <g transform={`translate(280, 512) rotate(${torsoLean})`}>
        {/* --- Piernas orgánicas en postura tensa diagonal --- */}
        <g>
          <g transform={`translate(-24, 0) rotate(${lHip})`}>
            <path
              d="M -14 0 C -16 40, -16 78, -10 112 L 14 112 C 12 78, 12 40, 12 0 Z"
              fill={`url(#${gid("pants")})`}
            />
            <g transform={`translate(-1, 112) rotate(${lKnee})`}>
              <path
                d="M -12 0 C -13 36, -12 70, -8 100 L 13 100 C 11 70, 11 36, 10 0 Z"
                fill={`url(#${gid("pants")})`}
              />
              <path
                d="M -9 98 L 16 98 C 18 108, 16 116, 10 120 L -12 120 C -14 112, -13 104, -9 98 Z"
                fill="#0A0D10"
              />
            </g>
          </g>
          <g transform={`translate(24, 0) rotate(${rHip})`}>
            <path
              d="M -14 0 C -12 40, -12 78, -14 112 L 12 112 C 12 78, 12 40, 12 0 Z"
              fill={`url(#${gid("pants")})`}
            />
            <g transform={`translate(1, 112) rotate(${rKnee})`}>
              <path
                d="M -13 0 C -11 36, -11 70, -13 100 L 10 100 C 10 70, 10 36, 10 0 Z"
                fill={`url(#${gid("pants")})`}
              />
              <path
                d="M -16 98 L 9 98 C 7 108, 9 116, 15 120 L -7 120 C -9 112, -12 104, -16 98 Z"
                fill="#0A0D10"
              />
            </g>
          </g>
        </g>

        {/* --- Torso: sudadera urbana oscura (hombros reales, capucha, cremallera) --- */}
        <g>
          <path
            d="M -58 0 C -68 -48, -74 -104, -76 -156 C -78 -188, -74 -204, -56 -210 L 56 -210 C 74 -204, 78 -188, 76 -156 C 74 -104, 68 -48, 58 0 Z"
            fill={`url(#${gid("hoodie")})`}
          />
          {/* Sombra lateral profunda + pliegues */}
          <path
            d="M -76 -156 C -74 -104, -68 -48, -58 0 L -30 0 C -38 -60, -44 -120, -46 -190 L -56 -210 Z"
            fill={`url(#${gid("hoodie-shadow")})`}
            opacity="0.8"
          />
          <path d="M -60 -60 C -64 -110, -68 -150, -70 -195" stroke="#131A20" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M -40 -30 C -44 -90, -48 -150, -50 -198" stroke="#131A20" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M 40 -30 C 44 -90, 48 -150, 50 -198" stroke="#131A20" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M 60 -60 C 64 -110, 68 -150, 70 -195" stroke="#131A20" strokeWidth="3" fill="none" opacity="0.55" />
          {/* Costuras de hombro */}
          <path d="M -56 -210 C -30 -206, -6 -204, 0 -204 C 6 -204, 30 -206, 56 -210" stroke="#1C252C" strokeWidth="2" fill="none" opacity="0.7" />
          {/* Cremallera central */}
          <path d="M -4 -8 C -4 -60, -4 -130, -4 -196 L 4 -196 C 4 -130, 4 -60, 4 -8 Z" fill="#1C252C" />
          <path d="M 0 -10 C 0 -70, 0 -140, 0 -198" stroke="#4C5A66" strokeWidth="1.2" fill="none" opacity="0.4" />
          {/* Camiseta oscura debajo */}
          <path d="M -8 -196 C -12 -190, -14 -184, -14 -178 L 14 -178 C 14 -184, 12 -190, 8 -196 Z" fill="#0D1318" />
          {/* Bolsillos delanteros */}
          <path d="M -52 -24 L -30 -30 L -24 -8 L -48 -4 Z" fill="#1C252C" opacity="0.85" />
          <path d="M 52 -24 L 30 -30 L 24 -8 L 48 -4 Z" fill="#1C252C" opacity="0.85" />
          {/* Capucha caída detrás del cuello */}
          <path
            d="M -44 -196 C -50 -176, -50 -156, -46 -138 C -30 -152, -18 -158, 0 -158 C 18 -158, 30 -152, 46 -138 C 50 -156, 50 -176, 44 -196 C 34 -208, 22 -212, 0 -212 C -22 -212, -34 -208, -44 -196 Z"
            fill="#2A343C"
          />
          {/* Rim light carmesí (izquierda, Zalgo) */}
          <path d="M -76 -156 C -78 -188, -74 -204, -56 -210 L -32 -210 L -44 -160 Z" fill={`url(#${gid("rim-crimson")})`} />
          {/* Rim light frío (derecha, Slenderman) */}
          <path d="M 76 -156 C 78 -188, 74 -204, 56 -210 L 32 -210 L 44 -160 Z" fill={`url(#${gid("rim-cold")})`} />
        </g>

        {/* --- Cabeza (lucha contra el tirón) --- */}
        <g transform={`translate(0, -196) rotate(${headFight})`}>
          <path
            d="M -14 0 C -14 -16, -12 -28, -10 -40 L 10 -40 C 12 -28, 14 -16, 14 0 Z"
            fill={`url(#${gid("skin")})`}
          />
          <g opacity={veinOpacity}>
            <path d="M -4 0 C -4 -12, -3 -22, -2 -34" stroke="#7F1D1D" strokeWidth="1.6" fill="none" />
            <path d="M 4 -2 C 4 -14, 3 -24, 3 -36" stroke="#DC2626" strokeWidth="1.2" fill="none" />
          </g>

          <g transform={`translate(0, -40)`}>
            {/* Cráneo / rostro */}
            <path
              d="M 0 -98 C 28 -98, 46 -88, 48 -64 C 50 -44, 48 -26, 42 -12 C 36 0, 26 8, 16 11 C 8 13, -8 13, -16 11 C -26 8, -36 0, -42 -12 C -48 -26, -50 -44, -48 -64 C -46 -88, -28 -98, 0 -98 Z"
              fill={`url(#${gid("skin-face")})`}
            />
            <path
              d="M -42 -12 C -36 0, -26 8, -16 11 C -8 13, 8 13, 16 11 C 26 8, 36 0, 42 -12 C 32 -4, 18 1, 0 1 C -18 1, -32 -4, -42 -12 Z"
              fill="#7A543C"
              opacity="0.5"
            />

            {/* Cabello despeinado */}
            <g fill={`url(#${gid("hair")})`}>
              <path d="M -48 -64 C -44 -92, -28 -102, 0 -102 C 28 -102, 44 -92, 48 -64 C 40 -80, 26 -88, 0 -88 C -26 -88, -40 -80, -48 -64 Z" />
              <path d="M -46 -60 C -38 -88, -22 -100, -4 -102 L 2 -102 C -8 -90, -18 -84, -30 -70 Z" fill="#241C15" />
              <path d="M 46 -60 C 38 -88, 22 -100, 4 -102 L -2 -102 C 8 -90, 18 -84, 30 -70 Z" fill="#241C15" />
              <path d="M -40 -92 C -46 -86, -50 -78, -52 -68" stroke="#241C15" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${-tremble} -40 -92)`} />
              <path d="M 40 -92 C 46 -86, 50 -78, 52 -68" stroke="#241C15" strokeWidth="4" fill="none" strokeLinecap="round" transform={`rotate(${tremble} 40 -92)`} />
            </g>

            {/* Cejas fuertemente fruncidas hacia arriba en el centro (agonía) */}
            <path
              d="M -6 -70 C -14 -74, -22 -72, -30 -66"
              stroke="#1A140E"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 6 -70 C 14 -74, 22 -72, 30 -66"
              stroke="#1A140E"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />

            {/* Ojo izquierdo: inyectado en sangre llorando tinta/carmesí */}
            <g>
              <ellipse cx="-17" cy="-50" rx="11" ry="7" fill="#E8D6CE" />
              <ellipse cx="-17" cy="-50" rx="11" ry="7" fill="rgba(220,38,38,0.18)" />
              <circle cx="-17" cy="-50" r="4.2" fill="#4A1A18" />
              <circle cx="-17" cy="-50" r="1.8" fill="#0A0202" />
              <ellipse cx="-17" cy="-53" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
              {/* Venas carmesí en la esclerótica */}
              <g opacity={veinOpacity} stroke="#DC2626" fill="none" strokeWidth="1.1">
                <path d="M -28 -53 C -24 -57, -20 -57, -17 -54" />
                <path d="M -28 -48 C -24 -45, -20 -44, -16 -47" />
                <path d="M -6 -53 C -10 -57, -14 -57, -17 -54" />
                <path d="M -7 -46 C -11 -44, -15 -44, -17 -46" />
                <path d="M -24 -50 C -20 -50, -14 -50, -10 -50" />
              </g>
              {/* Lágrima de tinta/carmesí cayendo */}
              <path d="M -17 -44 C -17 -34, -16 -24, -15 -14 C -14 -12, -19 -12, -18 -14 C -19 -24, -20 -34, -20 -44 Z" fill="#7F1D1D" opacity="0.9" />
            </g>

            {/* Ojo derecho: dilatado, pálido y frío (Slenderman) */}
            <g>
              <ellipse cx="17" cy="-50" rx="11" ry="7" fill="#DCE8EE" />
              <circle cx="17" cy="-50" r="6.4" fill="#0A0C10" />
              <circle cx="17" cy="-50" r="2.6" fill="#020406" />
              <ellipse cx="17" cy="-53" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
              <circle cx="15" cy="-52" r="1.4" fill="#22D3EE" opacity="0.7" />
            </g>

            {/* Nariz */}
            <path d="M 0 -42 C -3 -38, -3 -35, 0 -31 C 1 -35, 1 -38, 0 -42 Z" fill="#B4876A" />

            {/* Boca abierta GRITANDO (comisuras hacia abajo, dientes superiores) */}
            <g transform={`translate(0, -16)`}>
              <g transform={`scale(1, ${jawDrop})`}>
                <path
                  d="M -13 0 C -9 5, -3 7, 0 7 C 3 7, 9 5, 13 0 C 14 9, 10 16, 0 17 C -10 16, -14 9, -13 0 Z"
                  fill={`url(#${gid("mouth")})`}
                />
              </g>
              {/* Dientes superiores visibles */}
              <g opacity="0.95">
                <path d="M -10 1 L -8 6 L -6 1 Z" fill="#D8CFBE" />
                <path d="M -4 1 L -3 6 L -1 1 Z" fill="#D8CFBE" />
                <path d="M 1 1 L 3 6 L 5 1 Z" fill="#D8CFBE" />
                <path d="M 7 1 L 8 6 L 10 1 Z" fill="#D8CFBE" />
              </g>
              {/* Comisuras hacia abajo (labios caídos) */}
              <path d="M -13 -1 C -11 -4, -8 -5, -5 -4" stroke="#6E4C3A" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 13 -1 C 11 -4, 8 -5, 5 -4" stroke="#6E4C3A" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M -8 12 C -3 14, 3 14, 8 12" stroke="#6E4C3A" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>
          </g>
        </g>

        {/* --- Brazo izquierdo: ESTIRADO hacia la izquierda por zarcillos carmesí --- */}
        <g transform={`translate(-84, -198) rotate(${lShoulder})`}>
          <path
            d="M -13 2 C -15 30, -14 58, -8 84 L 16 84 C 12 58, 12 30, 12 2 Z"
            fill={`url(#${gid("hoodie")})`}
          />
          <path d="M -13 2 C -15 30, -14 58, -8 84" stroke="#DC2626" strokeWidth="2.5" fill="none" opacity="0.6" />
          <g transform={`translate(0, 84) rotate(${lElbow})`}>
            <path
              d="M -10 0 C -12 26, -11 50, -7 72 L 14 72 C 10 50, 10 26, 9 0 Z"
              fill={`url(#${gid("hoodie")})`}
            />
            {/* Mano izquierda crispada + zarcillos enrollados */}
            <g transform="translate(0, 72)">
              <path
                d="M -11 0 C -14 9, -12 17, -7 22 L 15 22 C 12 16, 12 9, 10 0 Z"
                fill={`url(#${gid("skin")})`}
              />
              <path d="M -9 22 C -11 30, -11 36, -8 41 L -2 41 C -2 34, -1 30, 0 22 Z" fill={`url(#${gid("skin")})`} />
              <path d="M -1 22 C -1 31, 0 38, 3 43 L 8 43 C 8 36, 8 30, 8 22 Z" fill={`url(#${gid("skin")})`} />
              <path d="M 8 22 C 9 29, 11 34, 14 38 L 18 37 C 17 31, 16 26, 15 22 Z" fill={`url(#${gid("skin")})`} />
              {/* Zarcillos carmesí enrollados en muñeca/antebrazo */}
              <g stroke="#DC2626" fill="none" strokeWidth="3" strokeLinecap="round">
                <path d="M -13 -3 C -6 3, 4 3, 13 -2" opacity="0.9" />
                <path d="M -14 5 C -6 10, 6 10, 15 5" opacity="0.75" />
                <path d="M -12 12 C -5 17, 5 17, 12 12" opacity="0.6" />
              </g>
              {/* Zarcillo grueso que tira hacia la izquierda (Zalgo) */}
              <g stroke="#DC2626" fill="none" strokeLinecap="round" opacity="0.9">
                <path d="M -11 0 C -36 -10, -58 -26, -74 -48" strokeWidth="4" />
                <path d="M -9 11 C -32 8, -52 -2, -68 -18" strokeWidth="3" />
              </g>
            </g>
          </g>
        </g>

        {/* --- Brazo derecho: ESTIRADO hacia la derecha por tentáculos fríos --- */}
        <g transform={`translate(84, -198) rotate(${rShoulder})`}>
          <path
            d="M -12 2 C -12 30, -12 58, -16 84 L 10 84 C 10 58, 10 30, 10 2 Z"
            fill={`url(#${gid("hoodie")})`}
          />
          <path d="M 10 2 C 10 30, 10 58, 16 84" stroke="#22D3EE" strokeWidth="2.5" fill="none" opacity="0.55" />
          <g transform={`translate(0, 84) rotate(${rElbow})`}>
            <path
              d="M -9 0 C -10 26, -10 50, -14 72 L 10 72 C 10 50, 10 26, 9 0 Z"
              fill={`url(#${gid("hoodie")})`}
            />
            {/* Mano derecha intentando soltarse */}
            <g transform="translate(0, 72)">
              <path
                d="M -10 0 C -12 9, -10 17, -5 22 L 15 22 C 12 16, 12 9, 10 0 Z"
                fill={`url(#${gid("skin")})`}
              />
              <path d="M -8 22 C -10 30, -10 36, -7 41 L -1 41 C -1 34, 0 30, 1 22 Z" fill={`url(#${gid("skin")})`} />
              <path d="M 1 22 C 2 31, 3 38, 6 43 L 11 43 C 11 36, 11 30, 11 22 Z" fill={`url(#${gid("skin")})`} />
              <path d="M 12 22 C 14 28, 16 33, 19 36 L 22 34 C 20 29, 19 24, 18 22 Z" fill={`url(#${gid("skin")})`} />
              {/* Tentáculos oscuros fríos enrollados (con brillo cian) */}
              <g stroke="#9DB8D0" fill="none" strokeWidth="3" strokeLinecap="round">
                <path d="M -12 -3 C -6 3, 5 3, 13 -2" opacity="0.6" />
                <path d="M -13 5 C -6 10, 6 10, 14 5" opacity="0.5" />
              </g>
              <g stroke="#0A141C" fill="none" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
                <path d="M -7 -2 C -22 -5, -36 -12, -48 -22" />
                <path d="M -2 9 C -18 8, -32 3, -44 -6" />
              </g>
              {/* Tentáculo que tira hacia la derecha (Slenderman) */}
              <g stroke="#22D3EE" fill="none" strokeLinecap="round" opacity="0.7">
                <path d="M 11 0 C 30 -10, 46 -24, 58 -42" strokeWidth="2.5" />
                <path d="M 9 11 C 28 8, 44 0, 56 -12" strokeWidth="1.8" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
