import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * SlenderCharacter.tsx — Rig v3 de Slenderman (Estándar v3).
 *
 * Entidad alta, esbelta, elegante y fría: traje negro entallado con hombros
 * amplios y angulosos, solapas afiladas, camisa blanca en V con sombreado
 * frío, corbata carmesí-negra delgada y faldón del traje descendiendo limpio
 * hasta la base del viewBox (sin piernitas flacas flotando). Cabeza pálida
 * lisa con UN único contorno craneal ovalado-alargado suave y sombreado de
 * volumen + rim light azul-cian nítido en el borde. Brazos largos y elegantes
 * con pivotes anatómicos exactos (nunca cruzados en X ni barras rectas fuera
 * de pantalla) y manos largas pálidas. 8 tentáculos Bézier gruesos en la base
 * y afilados en las puntas (4 traseros oscuros, 4 frontales con rim cian).
 *
 * Animación 100% determinista: useCurrentFrame + useVideoConfig + spring +
 * interpolate + Math.sin.
 */

export interface SlenderCharacterProps {
  mode?: "battle" | "finale";
  controlIntensity?: number;
  localFrame?: number;
  idPrefix?: string;
}

// Tentáculo frío cónico (relleno + borde de luz cian)
const makeColdTendril = (
  sx: number,
  sy: number,
  baseA: number,
  len: number,
  sway: number,
  phase: number,
  frame: number,
  spread: number
): { fill: string; rim: string } => {
  const t = frame * 0.05;
  const amp = 0.5 + 0.5 * spread;
  const a0 = baseA;
  const a1 = a0 + Math.sin(t * 0.9 + phase) * sway * amp;
  const a2 = a0 + Math.cos(t * 0.75 + phase * 1.3) * sway * 1.3 * amp;
  const a3 = a0 + Math.sin(t * 0.6 + phase * 2.1) * sway * 1.7 * amp;
  const l3 = len * (1 + 0.07 * Math.sin(t + phase));

  const ax = sx + Math.cos(a1) * 0.16 * len;
  const ay = sy + Math.sin(a1) * 0.16 * len;
  const bx = sx + Math.cos(a2) * 0.66 * len;
  const by = sy + Math.sin(a2) * 0.66 * len;
  const ex = sx + Math.cos(a3) * l3;
  const ey = sy + Math.sin(a3) * l3;

  const perp1 = { x: -Math.sin(a1), y: Math.cos(a1) };
  const perp3 = { x: -Math.sin(a3), y: Math.cos(a3) };
  const wb = 9 + ((phase * 13) % 6);

  const p0l = { x: sx + perp1.x * wb, y: sy + perp1.y * wb };
  const p0r = { x: sx - perp1.x * wb, y: sy - perp1.y * wb };
  const al = { x: ax + perp1.x * wb * 0.55, y: ay + perp1.y * wb * 0.55 };
  const ar = { x: ax - perp1.x * wb * 0.55, y: ay - perp1.y * wb * 0.55 };
  const bl = { x: bx + perp3.x * 1.4, y: by + perp3.y * 1.4 };
  const br = { x: bx - perp3.x * 1.4, y: by - perp3.y * 1.4 };
  const tip = { x: ex, y: ey };

  const f = (p: { x: number; y: number }) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  const fill = `M ${f(p0l)} C ${f(al)} ${f(bl)} ${f(tip)} C ${f(br)} ${f(ar)} ${f(p0r)} Z`;
  const rim = `M ${f({ x: ax, y: ay })} C ${f({ x: bx, y: by })} ${f(tip)}`;
  return { fill, rim };
};

/** Mano larga pálida esbelta (dedos largos orgánicos). */
const LongHand: React.FC<{ pid: string; flip?: boolean }> = ({ pid, flip = false }) => {
  return (
    <g transform={flip ? "scale(-1,1)" : undefined}>
      <path
        d="M -11 0 C -15 10, -14 20, -8 28 L 15 28 C 12 20, 12 10, 10 0 Z"
        fill="#DCD9D0"
      />
      <path d="M -9 26 C -11 40, -12 52, -11 66 C -10 68, -8 68, -7 64 C -6 50, -5 38, -4 26 Z" fill="#DCD9D0" />
      <path d="M -2 28 C -3 44, -4 58, -3 74 C -2 76, 0 76, 1 72 C 2 56, 3 42, 4 28 Z" fill="#DCD9D0" />
      <path d="M 6 28 C 6 44, 6 58, 8 72 C 9 76, 11 76, 12 72 C 13 56, 13 42, 14 28 Z" fill="#DCD9D0" />
      <path d="M 14 26 C 16 38, 18 48, 20 58 C 21 60, 23 60, 23 56 C 22 44, 21 34, 20 26 Z" fill="#DCD9D0" />
      <path d="M -9 28 C -12 40, -13 52, -12 64" stroke="#C9C5B8" strokeWidth="1" fill="none" opacity="0.5" />
    </g>
  );
};

export const SlenderCharacter: React.FC<SlenderCharacterProps> = ({
  mode = "finale",
  controlIntensity = 0,
  localFrame,
  idPrefix = "slender",
}) => {
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = localFrame ?? currentFrame;

  const intensity = Math.max(0, Math.min(1, controlIntensity));
  const pid = idPrefix;
  const gid = (n: string) => `${pid}-${n}`;

  // Extensión con settle orgánico (spring, determinista).
  const ext = spring({
    frame: intensity * 40,
    fps,
    config: { damping: 16, stiffness: 55, mass: 0.7 },
  });

  // Respiración fría + balanceo contenido
  const breathe = 1 + Math.sin(frame * 0.06) * 0.008;
  const sway = Math.sin(frame * 0.02) * 1.2;
  const headTilt =
    Math.sin(frame * 0.021) * 3 + (mode === "battle" ? intensity * 6 : 0);

  // Pose de brazos por modo (rotación SVG: positivo = izquierda).
  const lShoulder =
    mode === "battle" ? interpolate(ext, [0, 1], [12, 88]) : 12;
  const lElbow = mode === "battle" ? interpolate(ext, [0, 1], [6, 2]) : 6;
  const rShoulder = mode === "battle" ? interpolate(ext, [0, 1], [-14, -18]) : -14;
  const rElbow = mode === "battle" ? interpolate(ext, [0, 1], [-6, -10]) : -6;

  // Tentáculos: 4 traseros (absolutos) + 4 frontales (locales al torso).
  const spread = 0.35 + intensity * 0.5;
  const backTendrils = [0, 1, 2, 3].map((i) =>
    makeColdTendril(
      320 + (i - 1.5) * 48,
      380,
      -Math.PI / 2 + (i - 1.5) * 0.3,
      330 + i * 46,
      0.32 + 0.05 * i,
      i * 1.7,
      frame,
      spread
    )
  );
  const frontTendrils = [0, 1, 2, 3].map((i) =>
    makeColdTendril(
      (i - 1.5) * 40,
      -350,
      -Math.PI / 2 + (i - 1.5) * 0.38,
      260 + i * 42,
      0.4 + 0.05 * i,
      i * 1.9 + 0.6,
      frame,
      spread
    )
  );

  return (
    <svg
      viewBox="0 0 640 920"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Slenderman, entidad alta y esbelta"
    >
      <defs>
        <radialGradient id={gid("head")} cx="42%" cy="36%" r="82%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="48%" stopColor="#CBD5E1" />
          <stop offset="80%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
        <linearGradient id={gid("suit")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#07090D" />
          <stop offset="45%" stopColor="#121620" />
          <stop offset="100%" stopColor="#04050A" />
        </linearGradient>
        <linearGradient id={gid("shirt")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCD8CC" />
          <stop offset="100%" stopColor="#A9A497" />
        </linearGradient>
        <linearGradient id={gid("tie")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#3A0D12" />
          <stop offset="100%" stopColor="#12060A" />
        </linearGradient>
        <clipPath id={gid("head-clip")}>
          <path d="M 0 -148 C 40 -148, 62 -126, 66 -96 C 70 -64, 68 -30, 58 -4 C 48 22, 30 40, 8 48 C -8 40, -48 22, -58 -4 C -68 -30, -70 -64, -66 -96 C -62 -126, -40 -148, 0 -148 Z" />
        </clipPath>
        <filter id={gid("blur")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Aura fría */}
      <ellipse cx="320" cy="420" rx="220" ry="360" fill="#162129" opacity="0.14" filter={`url(#${gid("blur")})`} />

      {/* Tentáculos traseros */}
      <g fill="#030408">
        {backTendrils.map((t, i) => (
          <path key={`bt-${i}`} d={t.fill} />
        ))}
      </g>

      {/* ===== torsoGroup ===== */}
      <g transform={`translate(320, 730) rotate(${sway}) scale(${breathe}, ${breathe})`}>
        {/* Tentáculos frontales */}
        <g fill="#05070C">
          {frontTendrils.map((t, i) => (
            <path key={`ft-${i}`} d={t.fill} />
          ))}
        </g>
        {/* Rim light cian en un borde de los tentáculos frontales */}
        <g fill="none" strokeLinecap="round">
          {frontTendrils.map((t, i) => (
            <path
              key={`fr-${i}`}
              d={t.rim}
              stroke="#22D3EE"
              strokeWidth="2.5"
              opacity={0.3 + intensity * 0.3}
            />
          ))}
        </g>

        {/* --- Piernas (traje completo, sin palitos) --- */}
        <g>
          {/* Pantalón izquierdo */}
          <path
            d="M -34 -120 C -36 -40, -34 60, -28 160 L 6 160 C 6 60, 6 -40, 4 -120 Z"
            fill={`url(#${gid("suit")})`}
          />
          {/* Pantalón derecho */}
          <path
            d="M -4 -120 C -6 -40, -6 60, 0 160 L 28 160 C 28 60, 28 -40, 26 -120 Z"
            fill={`url(#${gid("suit")})`}
          />
          {/* Sombras de pliegue entre las piernas */}
          <path d="M -14 -120 C -14 -40, -14 60, -12 160" stroke="#04050A" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M 14 -120 C 14 -40, 14 60, 12 160" stroke="#04050A" strokeWidth="3" fill="none" opacity="0.7" />
          {/* Zapatos de vestir */}
          <path d="M -34 160 L 4 160 C 4 176, 6 186, 12 190 L -30 190 C -30 180, -32 170, -34 160 Z" fill="#03050A" />
          <path d="M -6 160 L 30 160 C 30 176, 32 186, 38 190 L -4 190 C -4 180, -2 170, -6 160 Z" fill="#03050A" />
        </g>

        {/* --- Faldón inferior del saco (desciende limpio) --- */}
        <path
          d="M -34 -120 L -58 -90 L 58 -90 L 34 -120 Z"
          fill="#05070C"
        />

        {/* --- Torso: saco negro de hombros amplios y cintura estrecha --- */}
        <g>
          <path
            d="M 0 -440 L -62 -434 C -78 -422, -92 -404, -98 -380 C -106 -290, -110 -180, -106 -84 C -104 -18, -98 6, -86 26 L -64 36 L -60 -70 L 60 -70 L 64 36 L 86 26 C 98 6, 104 -18, 106 -84 C 110 -180, 106 -290, 98 -380 C 92 -404, 78 -422, 62 -434 Z"
            fill={`url(#${gid("suit")})`}
          />
          {/* Solapas afiladas sombreadas */}
          <path d="M -62 -434 C -46 -400, -28 -370, -6 -326 L -16 -296 L -52 -372 L -70 -410 Z" fill="#1A202B" />
          <path d="M 62 -434 C 46 -400, 28 -370, 6 -326 L 16 -296 L 52 -372 L 70 -410 Z" fill="#1A202B" />
          {/* Camisa blanca en V con sombreado frío */}
          <path d="M -28 -352 L 0 -264 L 28 -352 L 0 -320 Z" fill={`url(#${gid("shirt")})`} />
          {/* Corbata carmesí-negra delgada */}
          <path
            d="M 0 -330 L 8 -322 L 7 -196 L 0 -176 L -7 -196 L -8 -322 Z"
            fill={`url(#${gid("tie")})`}
          />
          <path d="M -8 -330 L 8 -330 L 12 -312 L -12 -312 Z" fill="#1C0810" />
          {/* Botones */}
          <circle cx="0" cy="-238" r="2" fill="#A9A497" opacity="0.5" />
          <circle cx="0" cy="-206" r="2" fill="#A9A497" opacity="0.5" />
          {/* Pliegues del traje */}
          <path d="M -92 -380 C -94 -310, -96 -230, -94 -150" stroke="#04050A" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M 92 -380 C 94 -310, 96 -230, 94 -150" stroke="#04050A" strokeWidth="2.5" fill="none" opacity="0.5" />
          {/* Rim light abisal frío */}
          <path d="M 98 -380 C 106 -290, 110 -180, 106 -84 C 104 -18, 98 6, 86 26" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.32" />
        </g>

        {/* --- Cabeza (cuello → cráneo liso único) --- */}
        <g transform="translate(0, -440)">
          {/* Cuello */}
          <path d="M -16 0 C -16 -16, -14 -30, -12 -44 L 12 -44 C 14 -30, 16 -16, 16 0 Z" fill="#0A0D12" />
          {/* Sombra del cuello */}
          <path d="M 0 0 C -2 -16, -2 -30, 0 -44" stroke="#04050A" strokeWidth="2" fill="none" opacity="0.6" />

          <g transform={`translate(0, -44) rotate(${headTilt})`}>
            {/* Cráneo pálido liso: UN único contorno ovalado-alargado */}
            <path
              d="M 0 -148 C 40 -148, 62 -126, 66 -96 C 70 -64, 68 -30, 58 -4 C 48 22, 30 40, 8 48 C -8 40, -48 22, -58 -4 C -68 -30, -70 -64, -66 -96 C -62 -126, -40 -148, 0 -148 Z"
              fill={`url(#${gid("head")})`}
            />
            <g clipPath={`url(#${gid("head-clip")})`}>
              {/* Luz de borde fría arriba-izquierda */}
              <ellipse cx="-20" cy="-80" rx="52" ry="68" fill="rgba(127,178,208,0.18)" />
              {/* Sombra ahumada abajo-derecha */}
              <ellipse cx="28" cy="-20" rx="54" ry="78" fill="rgba(7,9,12,0.30)" />
              {/* Volumen de la mandíbula / pómulos */}
              <ellipse cx="-14" cy="-18" rx="32" ry="40" fill="rgba(255,255,255,0.04)" />
              <ellipse cx="16" cy="-14" rx="34" ry="44" fill="rgba(10,12,16,0.20)" />
            </g>
            {/* Rim light azul-cian nítido en el borde */}
            <path d="M -66 -96 C -62 -126, -40 -148, 0 -148 C 40 -148, 62 -126, 66 -96" stroke="#22D3EE" strokeWidth="2.5" fill="none" opacity="0.45" />
            <path d="M -58 -4 C -68 -30, -70 -64, -66 -96" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.35" />
          </g>
        </g>

        {/* --- Brazo izquierdo (en battle se extiende hacia la izquierda) --- */}
        <g transform={`translate(-62, -408) rotate(${lShoulder})`}>
          {/* Hombro / brazo superior del saco */}
          <path
            d="M -22 2 C -26 52, -24 104, -16 152 L 18 152 C 14 104, 14 52, 16 2 Z"
            fill={`url(#${gid("suit")})`}
          />
          <path d="M -16 152 C -22 104, -22 52, -22 2" stroke="#04050A" strokeWidth="2" fill="none" opacity="0.5" />
          <g transform={`translate(0, 152) rotate(${lElbow})`}>
            <path
              d="M -16 0 C -18 60, -17 124, -11 176 L 17 176 C 13 124, 13 60, 13 0 Z"
              fill={`url(#${gid("suit")})`}
            />
            {/* Puño blanco de la camisa */}
            <path d="M -12 164 L 18 164 L 17 178 L -11 178 Z" fill="#C9C5B8" />
            {/* Mano larga pálida */}
            <g transform="translate(0, 178)">
              <LongHand pid={pid} />
              {/* Tentáculos fríos proyectados (battle) */}
              {mode === "battle" ? (
                <g opacity={0.5 + intensity * 0.5} fill="none" strokeLinecap="round">
                  <path d="M -4 20 C -30 8, -52 -8, -70 -28" stroke="#9DB8D0" strokeWidth="3" />
                  <path d="M 4 22 C -18 14, -38 2, -56 -14" stroke="#9DB8D0" strokeWidth="2.2" />
                  <path d="M 12 24 C -6 18, -24 8, -40 -6" stroke="#0A141C" strokeWidth="3" />
                </g>
              ) : null}
            </g>
          </g>
        </g>

        {/* --- Brazo derecho (sereno al costado) --- */}
        <g transform={`translate(62, -408) rotate(${rShoulder})`}>
          <path
            d="M -16 2 C -14 52, -14 104, -18 152 L 16 152 C 14 104, 14 52, 14 2 Z"
            fill={`url(#${gid("suit")})`}
          />
          <path d="M 14 2 C 14 52, 14 104, 16 152" stroke="#04050A" strokeWidth="2" fill="none" opacity="0.5" />
          <g transform={`translate(0, 152) rotate(${rElbow})`}>
            <path
              d="M -12 0 C -12 60, -12 124, -16 176 L 12 176 C 12 124, 12 60, 10 0 Z"
              fill={`url(#${gid("suit")})`}
            />
            <path d="M -11 164 L 17 164 L 16 178 L -10 178 Z" fill="#C9C5B8" />
            <g transform="translate(0, 178)">
              <LongHand pid={pid} flip />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
