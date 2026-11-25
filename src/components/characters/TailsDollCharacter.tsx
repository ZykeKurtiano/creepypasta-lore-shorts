import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * TailsDollCharacter — Rig SVG/TSX hiperdetallado de Tails Doll
 * (Sonic R / Sega Saturn 1997) según el Estándar v6.
 *
 *  - Modo "plush": peluche cosido de felpa ámbar/naranja con 75+ <path>
 *    orgánicos (dos colas, tenis rojos/blancos, torso con costuras, brazos
 *    articulados, cabeza de zorro con orejas/mejillas/hocico/ojos vacíos,
 *    antena metálica + gema roja multifacetada con halo y rayos).
 *  - Modo "lowpoly1997": estética poligonal facetada estilo Sega Saturn 1997
 *    (triángulos planos + aristas wireframe cian/ámbar) para Escenas 3 y 6.
 *  - 100% determinista con useCurrentFrame() (CERO Math.random()).
 */

export interface TailsDollProps {
  x?: number;
  y?: number;
  scale?: number;
  flipX?: boolean;
  /** 0 = apagado/tenue, 1 = brillo intenso pulsante, 1.5 = sobrecarga en clímax */
  gemIntensity?: number;
  /** Modo estético: 'plush' o 'lowpoly1997' */
  mode?: "plush" | "lowpoly1997";
  /** Intensidad de levitación orgánica (0..1) */
  hoverAmp?: number;
  /** Inclinación siniestra de cabeza en grados */
  headTiltDeg?: number;
  /** Dirección de luz de borde (rim light 360°) */
  rimColor?: string;
  /** Desfase de animación en frames */
  phaseOffset?: number;
}

const VB_W = 520;
const VB_H = 860;

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

// Paleta Estándar v6 (felpa ámbar/naranja, crema sucio, gema roja).
const PLUSH_AMBER = "#D97706";
const PLUSH_AMBER_DARK = "#B45309";
const PLUSH_AMBER_SHADOW = "#78350F";
const CREAM_DIRTY = "#E6DCC4";
const CREAM_SHADOW = "#C7B28A";
const TAIL_CREAM = "#EFE6CF";
const EAR_INNER = "#EADFC4";
const NOSE = "#0B0704";
const EYE_VOID = "#040507";
const GEM_DARK = "#7F1D1D";
const GEM_BLOOD = "#DC2626";
const GEM_BRIGHT = "#EF4444";
const GEM_CORE = "#FECACA";
const SHOE_RED = "#C81E1E";
const SHOE_RED_DARK = "#8F1515";
const SHOE_WHITE = "#F2EFE9";
const SOLE = "#6B7280";
const METAL = "#3A4147";
const METAL_HI = "#9CA3AF";

/** Puntada en cruz (X) — 1 <path> con dos trazos. */
const StitchX: React.FC<{
  cx: number;
  cy: number;
  s: number;
  color?: string;
  opacity?: number;
  sw?: number;
  rotate?: number;
}> = ({ cx, cy, s, color = "#5C2E0B", opacity = 0.8, sw = 2.4, rotate = 0 }) => (
  <path
    d={`M ${cx - s} ${cy - s} L ${cx + s} ${cy + s} M ${cx + s} ${cy - s} L ${cx - s} ${cy + s}`}
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    fill="none"
    opacity={opacity}
    transform={`rotate(${rotate} ${cx} ${cy})`}
  />
);

/** Mechón de felpa puntiagudo (1 <path>). */
const FurTuft: React.FC<{
  cx: number;
  cy: number;
  len: number;
  angle: number;
  color: string;
}> = ({ cx, cy, len, angle, color }) => {
  const a = (angle * Math.PI) / 180;
  const bx = cx + Math.cos(a) * len;
  const by = cy + Math.sin(a) * len;
  const px = cx + Math.cos(a + Math.PI / 2) * len * 0.34;
  const py = cy + Math.sin(a + Math.PI / 2) * len * 0.34;
  const qx = cx + Math.cos(a - Math.PI / 2) * len * 0.34;
  const qy = cy + Math.sin(a - Math.PI / 2) * len * 0.34;
  return (
    <path d={`M ${cx} ${cy} L ${px.toFixed(1)} ${py.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)} L ${qx.toFixed(1)} ${qy.toFixed(1)} Z`} fill={color} />
  );
};

/**
 * Render principal en modo peluche (plush): anatomía hiperdetallada.
 */
const PlushBody: React.FC<{
  t: number;
  gem: number;
  headTilt: number;
  rimColor: string;
}> = ({ t, gem, headTilt, rimColor }) => {
  // Animaciones de colas (desfase de fase independiente).
  const tail1 = Math.sin(t * 2.1) * 0.35;
  const tail2 = Math.sin(t * 2.1 - 0.8) * 0.32;

  // Antena elástica con retraso de fase.
  const antennaSway = Math.sin(t * 2.4 + 0.5) * 4;

  // Pulso de gema + halo.
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
  const rayScale = 0.5 + gem * (0.7 + 0.3 * pulse);

  return (
    <g>
      {/* ============================ COLAS TRASERAS ============================ */}
      <g transform={`translate(0 ${Math.sin(t * 1.8) * 6})`}>
        {/* Cola izquierda (trasera) */}
        <g transform={`rotate(${(tail1 * 22).toFixed(2)} 205 520)`}>
          <path
            d="M 196 470 C 130 470, 92 400, 78 300 C 70 232, 84 160, 118 128 C 148 102, 176 108, 188 142 C 198 170, 186 192, 168 200 C 150 208, 138 204, 140 182 C 142 150, 168 128, 196 132 L 206 160 C 194 164, 188 176, 192 190 C 196 204, 210 200, 216 184 L 226 214 C 240 244, 236 286, 218 324 C 200 362, 206 424, 218 470 Z"
            fill={PLUSH_AMBER_DARK}
          />
          <path
            d="M 118 128 C 148 102, 176 108, 188 142 C 198 170, 186 192, 168 200 C 150 208, 138 204, 140 182 C 142 150, 168 128, 196 132 L 196 152 C 174 152, 162 162, 162 178 C 162 190, 174 194, 180 188 C 184 182, 178 172, 166 170 L 148 150 Z"
            fill={TAIL_CREAM}
          />
          <path
            d="M 196 470 C 130 470, 92 400, 78 300 C 70 232, 84 160, 118 128"
            fill="none"
            stroke={rimColor}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d="M 200 460 C 160 440, 132 396, 118 340"
            fill="none"
            stroke={PLUSH_AMBER_SHADOW}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.35}
          />
          <StitchX cx={160} cy={300} s={7} />
          <StitchX cx={146} cy={360} s={6} />
          <StitchX cx={168} cy={230} s={6} rotate={15} />
          <FurTuft cx={196} cy={470} len={26} angle={-70} color={PLUSH_AMBER_DARK} />
          <FurTuft cx={214} cy={450} len={20} angle={-50} color={PLUSH_AMBER} />
          <FurTuft cx={184} cy={450} len={18} angle={-92} color={PLUSH_AMBER_DARK} />
        </g>

        {/* Cola derecha (trasera) */}
        <g transform={`rotate(${(tail2 * 24).toFixed(2)} 315 520)`}>
          <path
            d="M 324 470 C 390 470, 428 400, 442 300 C 450 232, 436 160, 402 128 C 372 102, 344 108, 332 142 C 322 170, 334 192, 352 200 C 370 208, 382 204, 380 182 C 378 150, 352 128, 324 132 L 314 160 C 326 164, 332 176, 328 190 C 324 204, 310 200, 304 184 L 294 214 C 280 244, 284 286, 302 324 C 320 362, 314 424, 302 470 Z"
            fill={PLUSH_AMBER_DARK}
          />
          <path
            d="M 402 128 C 372 102, 344 108, 332 142 C 322 170, 334 192, 352 200 C 370 208, 382 204, 380 182 C 378 150, 352 128, 324 132 L 324 152 C 346 152, 358 162, 358 178 C 358 190, 346 194, 340 188 C 336 182, 342 172, 354 170 L 372 150 Z"
            fill={TAIL_CREAM}
          />
          <path
            d="M 324 470 C 390 470, 428 400, 442 300 C 450 232, 436 160, 402 128"
            fill="none"
            stroke={rimColor}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d="M 320 460 C 360 440, 388 396, 402 340"
            fill="none"
            stroke={PLUSH_AMBER_SHADOW}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.35}
          />
          <StitchX cx={360} cy={300} s={7} />
          <StitchX cx={374} cy={360} s={6} />
          <StitchX cx={352} cy={230} s={6} rotate={-15} />
          <FurTuft cx={324} cy={470} len={26} angle={-110} color={PLUSH_AMBER_DARK} />
          <FurTuft cx={306} cy={450} len={20} angle={-130} color={PLUSH_AMBER} />
          <FurTuft cx={336} cy={450} len={18} angle={-88} color={PLUSH_AMBER_DARK} />
        </g>
      </g>

      {/* ============================ PIERNAS + TENIS ============================ */}
      <g>
        {/* Pierna izquierda */}
        <path
          d="M 212 540 C 204 590, 200 650, 200 700 L 232 700 C 234 650, 238 590, 240 540 Z"
          fill={PLUSH_AMBER_DARK}
        />
        <path
          d="M 212 540 C 204 590, 200 650, 200 700 L 202 700 C 206 650, 210 590, 218 540 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.5}
        />
        <StitchX cx={216} cy={640} s={6} />
        {/* Tenis izquierdo */}
        <path
          d="M 196 700 C 194 724, 196 748, 208 766 C 220 784, 248 784, 260 768 C 270 754, 270 736, 268 700 Z"
          fill={SHOE_RED}
        />
        <path
          d="M 196 700 C 194 724, 196 748, 208 766 C 220 784, 248 784, 260 768 C 270 754, 270 736, 268 700 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.8}
          opacity={0.6}
        />
        <path
          d="M 234 712 C 244 724, 250 742, 252 760 C 254 772, 252 780, 244 780 C 232 780, 226 760, 226 736 L 226 712 Z"
          fill={SHOE_WHITE}
        />
        <path
          d="M 232 716 C 238 728, 242 744, 243 760 C 244 772, 242 778, 236 778 C 228 778, 224 760, 224 738 Z"
          fill={SHOE_WHITE}
          opacity={0.6}
        />
        <path
          d="M 196 776 C 206 786, 232 790, 252 786 C 258 784, 262 782, 266 778 L 268 772 C 268 780, 266 786, 258 788 C 236 794, 204 790, 194 782 C 192 779, 193 777, 196 776 Z"
          fill={SOLE}
        />
        <path d="M 206 722 L 224 722 M 206 730 L 224 730" stroke={SHOE_WHITE} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
        <StitchX cx={226} cy={738} s={5} color="#5C1111" opacity={0.7} />

        {/* Pierna derecha (simétrica a la izquierda) */}
        <path
          d="M 308 540 C 316 590, 320 650, 320 700 L 288 700 C 286 650, 282 590, 280 540 Z"
          fill={PLUSH_AMBER_DARK}
        />
        <path
          d="M 308 540 C 316 590, 320 650, 320 700 L 288 700 C 286 650, 282 590, 280 540 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.5}
        />
        <StitchX cx={304} cy={640} s={6} />
        {/* Tenis derecho */}
        <path
          d="M 252 700 C 250 724, 252 748, 264 766 C 276 784, 304 784, 316 768 C 326 754, 326 736, 324 700 Z"
          fill={SHOE_RED}
        />
        <path
          d="M 252 700 C 250 724, 252 748, 264 766 C 276 784, 304 784, 316 768 C 326 754, 326 736, 324 700 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.8}
          opacity={0.6}
        />
        <path
          d="M 290 712 C 300 724, 306 742, 308 760 C 310 772, 308 780, 300 780 C 288 780, 282 760, 282 736 L 282 712 Z"
          fill={SHOE_WHITE}
        />
        <path
          d="M 288 716 C 294 728, 298 744, 299 760 C 300 772, 298 778, 292 778 C 284 778, 280 760, 280 738 Z"
          fill={SHOE_WHITE}
          opacity={0.6}
        />
        <path
          d="M 252 776 C 262 786, 288 790, 308 786 C 314 784, 318 782, 322 778 L 324 772 C 324 780, 322 786, 314 788 C 292 794, 260 790, 250 782 C 248 779, 249 777, 252 776 Z"
          fill={SOLE}
        />
        <path d="M 262 722 L 280 722 M 262 730 L 280 730" stroke={SHOE_WHITE} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
        <StitchX cx={282} cy={738} s={5} color="#5C1111" opacity={0.7} />
      </g>

      {/* ============================ TORSO ============================ */}
      <g>
        <path
          d="M 188 318 C 176 356, 170 410, 172 470 C 174 530, 180 556, 190 572 L 330 572 C 340 556, 346 530, 348 470 C 350 410, 344 356, 332 318 C 308 302, 212 302, 188 318 Z"
          fill={PLUSH_AMBER}
        />
        <path
          d="M 188 318 C 176 356, 170 410, 172 470 C 174 530, 180 556, 190 572 L 330 572 C 340 556, 346 530, 348 470 C 350 410, 344 356, 332 318 C 308 302, 212 302, 188 318 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.6}
          opacity={0.5}
        />
        {/* Pecho crema CENTRADO en x=260 con costura vertical central */}
        <path
          d="M 257 324 C 269 352, 277 392, 279 430 C 281 470, 277 500, 269 528 C 267 534, 263 538, 259 538 L 253 534 C 243 492, 239 452, 241 412 C 243 372, 249 344, 257 324 Z"
          fill={CREAM_DIRTY}
        />
        <path
          d="M 257 324 C 269 352, 277 392, 279 430 C 281 470, 277 500, 269 528 C 267 534, 263 538, 259 538 L 253 534 C 243 492, 239 452, 241 412 C 243 372, 249 344, 257 324 Z"
          fill="none"
          stroke={CREAM_SHADOW}
          strokeWidth={1.6}
          opacity={0.6}
        />
        {/* Costura central vertical */}
        <path d="M 260 328 L 260 532" stroke="#8A5A24" strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
        {/* Puntadas en X finas y oscuras sobre la costura central */}
        <StitchX cx={260} cy={360} s={5} color="#5C2E0B" />
        <StitchX cx={260} cy={410} s={5} color="#5C2E0B" />
        <StitchX cx={260} cy={460} s={5} color="#5C2E0B" />
        <StitchX cx={260} cy={506} s={5} color="#5C2E0B" />
        {/* Puntadas en cruz laterales del torso */}
        <StitchX cx={196} cy={380} s={6} />
        <StitchX cx={326} cy={384} s={6} />
        <StitchX cx={190} cy={440} s={6} />
        <StitchX cx={330} cy={444} s={6} />
        {/* Costuras laterales de relleno */}
        <path d="M 186 340 L 184 380 L 184 420 L 186 460" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2} fill="none" opacity={0.5} />
        <path d="M 334 340 L 336 380 L 336 420 L 334 460" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2} fill="none" opacity={0.5} />
        {/* Oclusión ambiental en axilas */}
        <path d="M 190 318 C 196 332, 196 348, 192 362 C 202 356, 208 344, 210 330 Z" fill={PLUSH_AMBER_SHADOW} opacity={0.55} />
        <path d="M 330 318 C 324 332, 324 348, 328 362 C 318 356, 312 344, 310 330 Z" fill={PLUSH_AMBER_SHADOW} opacity={0.55} />
        {/* Sombra de cuello */}
        <path d="M 224 308 C 244 320, 276 320, 296 308 C 284 296, 236 296, 224 308 Z" fill={PLUSH_AMBER_SHADOW} opacity={0.6} />
        {/* Pliegues de tela comprimida */}
        <path d="M 246 470 C 252 496, 252 522, 246 548" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2.4} fill="none" opacity={0.4} />
        <path d="M 274 470 C 268 496, 268 522, 274 548" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2.4} fill="none" opacity={0.4} />
      </g>

      {/* ============================ BRAZOS + GUANTES ============================ */}
      <g transform={`rotate(${Math.sin(t * 1.4) * 3} 190 330)`}>
        <path
          d="M 190 330 C 178 380, 172 440, 174 496 C 175 520, 178 536, 182 548 L 200 548 C 204 534, 206 518, 206 496 C 206 440, 202 380, 198 330 Z"
          fill={PLUSH_AMBER_DARK}
        />
        <path
          d="M 190 330 C 178 380, 172 440, 174 496 C 175 520, 178 536, 182 548 L 200 548 C 204 534, 206 518, 206 496 C 206 440, 202 380, 198 330 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.4}
          opacity={0.5}
        />
        <StitchX cx={186} cy={430} s={5} />
        {/* Guante izquierdo (blanco sucio) */}
        <path
          d="M 174 548 C 172 566, 174 584, 182 598 C 190 610, 200 606, 202 596 C 204 584, 204 566, 202 548 Z"
          fill={CREAM_DIRTY}
        />
        <path
          d="M 174 548 C 172 566, 174 584, 182 598 C 190 610, 200 606, 202 596 C 204 584, 204 566, 202 548 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.4}
          opacity={0.55}
        />
        <path d="M 176 556 L 200 556" stroke={CREAM_SHADOW} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        {/* Dedos de tela */}
        <path d="M 178 596 C 178 608, 180 616, 184 620 L 188 620 C 192 616, 192 608, 190 596 Z" fill={CREAM_DIRTY} />
        <path d="M 184 598 C 184 610, 186 618, 190 622 L 194 622 C 198 618, 198 610, 196 598 Z" fill={CREAM_DIRTY} />
        <path d="M 190 600 C 190 610, 192 616, 196 620 L 199 620 C 202 616, 202 610, 200 600 Z" fill={CREAM_DIRTY} />
      </g>

      <g transform={`rotate(${Math.sin(t * 1.4 + 1.2) * 3} 330 330)`}>
        <path
          d="M 330 330 C 342 380, 348 440, 346 496 C 345 520, 342 536, 338 548 L 320 548 C 316 534, 314 518, 314 496 C 314 440, 318 380, 322 330 Z"
          fill={PLUSH_AMBER_DARK}
        />
        <path
          d="M 330 330 C 342 380, 348 440, 346 496 C 345 520, 342 536, 338 548 L 320 548 C 316 534, 314 518, 314 496 C 314 440, 318 380, 322 330 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.4}
          opacity={0.5}
        />
        <StitchX cx={334} cy={430} s={5} />
        {/* Guante derecho (blanco sucio) */}
        <path
          d="M 346 548 C 348 566, 346 584, 338 598 C 330 610, 320 606, 318 596 C 316 584, 316 566, 318 548 Z"
          fill={CREAM_DIRTY}
        />
        <path
          d="M 346 548 C 348 566, 346 584, 338 598 C 330 610, 320 606, 318 596 C 316 584, 316 566, 318 548 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.4}
          opacity={0.55}
        />
        <path d="M 320 556 L 344 556" stroke={CREAM_SHADOW} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        {/* Dedos de tela */}
        <path d="M 342 596 C 342 608, 340 616, 336 620 L 332 620 C 328 616, 328 608, 330 596 Z" fill={CREAM_DIRTY} />
        <path d="M 336 598 C 336 610, 334 618, 330 622 L 326 622 C 322 618, 322 610, 324 598 Z" fill={CREAM_DIRTY} />
        <path d="M 330 600 C 330 610, 328 616, 324 620 L 321 620 C 318 616, 318 610, 320 600 Z" fill={CREAM_DIRTY} />
      </g>

      {/* ============================ CABEZA ============================ */}
      <g transform={`rotate(${headTilt} 260 210)`}>
        {/* Oreja izquierda */}
        <g>
          <path d="M 196 158 C 168 138, 146 108, 136 70 C 132 54, 140 40, 156 40 C 172 40, 180 54, 184 74 C 186 90, 182 106, 176 120 C 186 112, 198 106, 206 108 L 206 140 C 202 150, 200 158, 196 158 Z" fill={PLUSH_AMBER} />
          <path d="M 196 158 C 168 138, 146 108, 136 70 C 132 54, 140 40, 156 40 C 172 40, 180 54, 184 74 C 186 90, 182 106, 176 120 C 186 112, 198 106, 206 108 L 206 140 C 202 150, 200 158, 196 158 Z" fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.5} />
          <path d="M 156 62 C 166 70, 174 88, 178 108 C 180 120, 178 132, 174 142 C 168 128, 162 108, 160 84 Z" fill={EAR_INNER} />
          <path d="M 146 78 L 168 96" stroke={PLUSH_AMBER_SHADOW} strokeWidth={1.8} opacity={0.6} />
          <StitchX cx={176} cy={112} s={5} rotate={-30} />
        </g>
        {/* Oreja derecha */}
        <g>
          <path d="M 324 158 C 352 138, 374 108, 384 70 C 388 54, 380 40, 364 40 C 348 40, 340 54, 336 74 C 334 90, 338 106, 344 120 C 334 112, 322 106, 314 108 L 314 140 C 318 150, 320 158, 324 158 Z" fill={PLUSH_AMBER} />
          <path d="M 324 158 C 352 138, 374 108, 384 70 C 388 54, 380 40, 364 40 C 348 40, 340 54, 336 74 C 334 90, 338 106, 344 120 C 334 112, 322 106, 314 108 L 314 140 C 318 150, 320 158, 324 158 Z" fill="none" stroke={rimColor} strokeWidth={2.4} opacity={0.5} />
          <path d="M 364 62 C 354 70, 346 88, 342 108 C 340 120, 342 132, 346 142 C 352 128, 358 108, 360 84 Z" fill={EAR_INNER} />
          <path d="M 374 78 L 352 96" stroke={PLUSH_AMBER_SHADOW} strokeWidth={1.8} opacity={0.6} />
          <StitchX cx={344} cy={112} s={5} rotate={30} />
        </g>

        {/* Cráneo principal */}
        <path
          d="M 260 128 C 232 128, 196 138, 178 164 C 158 194, 154 236, 160 272 C 166 304, 178 328, 196 344 C 214 360, 236 366, 260 366 C 284 366, 306 360, 324 344 C 342 328, 354 304, 360 272 C 366 236, 362 194, 342 164 C 324 138, 288 128, 260 128 Z"
          fill={PLUSH_AMBER}
        />
        <path
          d="M 260 128 C 232 128, 196 138, 178 164 C 158 194, 154 236, 160 272 C 166 304, 178 328, 196 344 C 214 360, 236 366, 260 366 C 284 366, 306 360, 324 344 C 342 328, 354 304, 360 272 C 366 236, 362 194, 342 164 C 324 138, 288 128, 260 128 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth={2.6}
          opacity={0.5}
        />
        {/* Sombreado de cráneo */}
        <path d="M 196 344 C 214 360, 236 366, 260 366 C 284 366, 306 360, 324 344 C 316 356, 300 362, 284 362 C 250 362, 220 354, 196 344 Z" fill={PLUSH_AMBER_SHADOW} opacity={0.35} />

        {/* Mejillas con mechones puntiagudos (3 a cada lado) */}
        <FurTuft cx={172} cy={262} len={34} angle={16} color={PLUSH_AMBER} />
        <FurTuft cx={170} cy={284} len={30} angle={6} color={PLUSH_AMBER_DARK} />
        <FurTuft cx={174} cy={306} len={28} angle={-6} color={PLUSH_AMBER} />
        <FurTuft cx={348} cy={262} len={34} angle={164} color={PLUSH_AMBER} />
        <FurTuft cx={350} cy={284} len={30} angle={174} color={PLUSH_AMBER_DARK} />
        <FurTuft cx={346} cy={306} len={28} angle={186} color={PLUSH_AMBER} />

        {/* Mejillas crema desgastadas del hocico de zorro (2 laterales) */}
        <path d="M 226 298 C 234 314, 246 326, 258 330 C 252 336, 238 336, 226 328 C 220 318, 221 306, 226 298 Z" fill={CREAM_DIRTY} />
        <path d="M 294 298 C 286 314, 274 326, 262 330 C 268 336, 282 336, 294 328 C 300 318, 299 306, 294 298 Z" fill={CREAM_DIRTY} />
        <path d="M 228 302 C 238 316, 248 326, 258 330" fill="none" stroke={CREAM_SHADOW} strokeWidth={1.6} opacity={0.6} />
        <path d="M 292 302 C 282 316, 272 326, 262 330" fill="none" stroke={CREAM_SHADOW} strokeWidth={1.6} opacity={0.6} />
        {/* Puente central del hocico */}
        <path d="M 252 304 C 256 314, 264 314, 268 304 C 268 318, 263 330, 260 332 C 257 330, 252 318, 252 304 Z" fill={CREAM_DIRTY} />
        {/* Nariz negra cosida en punta */}
        <path d="M 254 312 C 254 307, 258 304, 260 304 C 262 304, 266 307, 266 312 C 266 317, 263 320, 260 320 C 257 320, 254 317, 254 312 Z" fill={NOSE} />
        <path d="M 260 320 L 260 328 L 257 324 M 260 320 L 260 328 L 263 324" stroke="#5C2E0B" strokeWidth={1.7} fill="none" opacity={0.7} />
        {/* Costura recta e inexpresiva (CERO sonrisa alegre) */}
        <path d="M 252 342 L 268 342" stroke="#5C2E0B" strokeWidth={2} strokeLinecap="round" opacity={0.85} />
        <path d="M 256 342 L 257 345 M 261 345 L 262 342" stroke="#5C2E0B" strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />

        {/* Ojos negros hundidos con sombra de cuenca profunda */}
        <path d="M 210 244 C 222 234, 240 234, 248 244 C 253 250, 252 262, 244 270 C 234 278, 218 276, 209 264 C 205 256, 206 249, 210 244 Z" fill="#020203" opacity={0.85} />
        <path d="M 214 248 C 222 238, 238 236, 244 244 C 250 252, 248 264, 240 270 C 232 276, 218 272, 212 264 C 207 257, 208 252, 214 248 Z" fill={EYE_VOID} />
        <path d="M 214 248 C 222 238, 238 236, 244 244 C 250 252, 248 264, 240 270 C 232 276, 218 272, 212 264 C 207 257, 208 252, 214 248 Z" fill="none" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2.4} opacity={0.8} />
        <circle cx="227" cy="252" r="1.6" fill={GEM_BRIGHT} opacity={0.3 + gem * 0.6} />
        <path d="M 310 244 C 298 234, 280 234, 272 244 C 267 250, 268 262, 276 270 C 286 278, 302 276, 311 264 C 315 256, 314 249, 310 244 Z" fill="#020203" opacity={0.85} />
        <path d="M 306 248 C 298 238, 282 236, 276 244 C 270 252, 272 264, 280 270 C 288 276, 302 272, 308 264 C 313 257, 312 252, 306 248 Z" fill={EYE_VOID} />
        <path d="M 306 248 C 298 238, 282 236, 276 244 C 270 252, 272 264, 280 270 C 288 276, 302 272, 308 264 C 313 257, 312 252, 306 248 Z" fill="none" stroke={PLUSH_AMBER_SHADOW} strokeWidth={2.4} opacity={0.8} />
        <circle cx="293" cy="252" r="1.6" fill={GEM_BRIGHT} opacity={0.3 + gem * 0.6} />

        {/* Costura central frente + coronilla */}
        <path d="M 260 130 L 260 150 L 258 168 L 261 186 L 258 204 L 260 222" fill="none" stroke="#8A5A24" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <path d="M 260 130 L 252 132 M 260 130 L 268 132" stroke="#8A5A24" strokeWidth={1.6} opacity={0.6} />
        {/* Puntadas alrededor de orejas y mejillas */}
        <StitchX cx={190} cy={150} s={4.5} rotate={-20} />
        <StitchX cx={330} cy={150} s={4.5} rotate={20} />
        <StitchX cx={186} cy={280} s={4.5} rotate={-10} />
        <StitchX cx={334} cy={280} s={4.5} rotate={10} />
        <StitchX cx={222} cy={146} s={4} />
        <StitchX cx={298} cy={146} s={4} />
      </g>

      {/* ============================ ANTENA + GEMA ============================ */}
      <g transform={`rotate(${antennaSway} 260 128)`}>
        <path d="M 258 130 C 256 108, 258 88, 262 70 C 264 60, 264 52, 260 44 L 254 44 C 250 52, 250 62, 254 74 C 254 90, 254 108, 254 128 Z" fill={METAL} />
        <path d="M 257 128 C 255 108, 256 90, 258 76 C 259 66, 259 56, 257 48" fill="none" stroke={METAL_HI} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
        {/* Base de la gema */}
        <path d="M 250 44 L 264 44 L 262 34 L 252 34 Z" fill={GEM_DARK} />

        {/* Halo radial suave (gradiente volumétrico, no óvalo plano) */}
        <circle cx={257} cy={26} r={36 + gem * 20} fill="url(#td-glow)" opacity={0.5 + gem * 0.4} />

        {/* Gema roja vertical multifacetada (rubí/diamante) */}
        <g>
          <path d="M 257 -2 L 243 22 L 247 40 L 257 47 L 267 40 L 271 22 Z" fill={GEM_DARK} />
          <path d="M 257 -2 L 243 22 L 257 30 Z" fill={GEM_BLOOD} />
          <path d="M 257 -2 L 271 22 L 257 30 Z" fill={GEM_BRIGHT} />
          <path d="M 243 22 L 247 40 L 257 30 Z" fill={GEM_BLOOD} opacity={0.9} />
          <path d="M 271 22 L 267 40 L 257 30 Z" fill={GEM_BRIGHT} opacity={0.9} />
          <path d="M 247 40 L 257 47 L 267 40 L 257 30 Z" fill={GEM_CORE} />
          <path d="M 257 4 L 249 20 L 257 26 L 265 20 Z" fill="#FECACA" opacity={0.95} />
          <path d="M 253 8 L 249 18 L 253 22 Z" fill="#FFFFFF" opacity={0.95} />
          <path d="M 253 12 L 256 16 L 253 20 Z" fill="#FECACA" opacity={0.7} />
        </g>

        {/* Rayos de luz cerrados (volumétricos) */}
        {[ -80, -50, -20, 20, 50, 80 ].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const inner = 34 * rayScale;
          const outer = (58 + (i % 2) * 12) * rayScale;
          const x1 = 257 + Math.cos(a) * inner;
          const y1 = 26 + Math.sin(a) * inner;
          const x2 = 257 + Math.cos(a) * outer;
          const y2 = 26 + Math.sin(a) * outer;
          const px = Math.cos(a + Math.PI / 2) * 5;
          const py = Math.sin(a + Math.PI / 2) * 5;
          return (
            <path
              key={deg}
              d={`M ${x1 - px} ${y1 - py} L ${x2} ${y2} L ${x1 + px} ${y1 + py} Z`}
              fill={i % 2 === 0 ? GEM_BRIGHT : GEM_BLOOD}
              opacity={0.2 + gem * 0.45}
            />
          );
        })}
      </g>
    </g>
  );
};

/**
 * Render en modo lowpoly1997: poligonos planos facetados estilo Sega Saturn.
 */
const LowPolyBody: React.FC<{
  t: number;
  gem: number;
  headTilt: number;
  rimColor: string;
}> = ({ t, gem, headTilt }) => {
  const sway = Math.sin(t * 1.6) * 2;
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
  const edge = `rgba(34,211,238,${0.35 + gem * 0.3})`;

  return (
    <g>
      {/* ============================ DOS COLAS POLIGONALES ============================ */}
      <g transform={`rotate(${sway} 260 520)`}>
        <path d="M 232 470 L 190 380 L 210 350 L 244 470 Z" fill={PLUSH_AMBER_SHADOW} stroke={edge} strokeWidth={1.3} />
        <path d="M 288 470 L 330 380 L 310 350 L 276 470 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.3} />
        <path d="M 232 470 L 200 470 L 210 350 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1} />
        <path d="M 288 470 L 320 470 L 310 350 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1} />
      </g>

      {/* ============================ PIERNAS + BOTAS ROJAS ============================ */}
      <g>
        <path d="M 226 560 L 210 700 L 246 700 L 254 560 Z" fill={PLUSH_AMBER_SHADOW} stroke={edge} strokeWidth={1.3} />
        <path d="M 254 560 L 246 700 L 282 700 L 274 560 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.3} />
        <path d="M 294 560 L 278 700 L 314 700 L 322 560 Z" fill={PLUSH_AMBER_SHADOW} stroke={edge} strokeWidth={1.3} />
        <path d="M 226 560 L 254 560 L 250 700 L 210 700 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.2} />
        <path d="M 322 560 L 294 560 L 278 700 L 314 700 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.2} />
        {/* Botas rojas facetadas */}
        <path d="M 210 700 L 204 766 L 240 766 L 246 700 Z" fill={SHOE_RED} stroke={edge} strokeWidth={1.3} />
        <path d="M 246 700 L 240 766 L 276 766 L 282 700 Z" fill={SHOE_RED_DARK} stroke={edge} strokeWidth={1.3} />
        <path d="M 278 700 L 276 766 L 310 766 L 314 700 Z" fill={SHOE_RED} stroke={edge} strokeWidth={1.3} />
        <path d="M 204 760 L 240 760 L 242 770 L 206 770 Z" fill={SOLE} stroke={edge} strokeWidth={1} />
        <path d="M 276 760 L 310 760 L 308 770 L 278 770 Z" fill={SOLE} stroke={edge} strokeWidth={1} />
      </g>

      {/* ============================ TORSO FACETADO + BRAZOS ============================ */}
      <g transform={`rotate(${sway} 260 400)`}>
        {/* Brazos poligonales */}
        <path d="M 196 360 L 176 460 L 200 470 L 214 360 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.2} />
        <path d="M 324 360 L 344 460 L 320 470 L 306 360 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.2} />
        {/* Manos crema */}
        <path d="M 176 460 L 174 500 L 202 496 L 200 470 Z" fill={CREAM_DIRTY} stroke={edge} strokeWidth={1} />
        <path d="M 344 460 L 346 500 L 318 496 L 320 470 Z" fill={CREAM_DIRTY} stroke={edge} strokeWidth={1} />
        {/* Torso */}
        <path d="M 260 320 L 200 360 L 220 560 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.4} />
        <path d="M 260 320 L 320 360 L 300 560 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.4} />
        <path d="M 200 360 L 260 380 L 220 560 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.4} />
        <path d="M 320 360 L 260 380 L 300 560 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.4} />
        {/* Pecho crema triangular */}
        <path d="M 238 372 L 282 372 L 260 520 L 252 520 Z" fill={CREAM_DIRTY} stroke={edge} strokeWidth={1.2} />
        <path d="M 238 372 L 260 380 L 252 520 Z" fill={CREAM_SHADOW} stroke={edge} strokeWidth={1} />
      </g>

      {/* ============================ CABEZA DE ZORRO POLIGONAL ============================ */}
      <g transform={`rotate(${headTilt} 260 210)`}>
        {/* Orejas triangulares grandes */}
        <path d="M 208 150 L 168 70 L 222 116 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.4} />
        <path d="M 312 150 L 352 70 L 298 116 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.4} />
        <path d="M 188 118 L 212 92 L 220 118 Z" fill={EAR_INNER} stroke={edge} strokeWidth={1} />
        <path d="M 332 118 L 308 92 L 300 118 Z" fill={EAR_INNER} stroke={edge} strokeWidth={1} />
        {/* Cabeza facetada */}
        <path d="M 260 120 L 196 172 L 214 300 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.4} />
        <path d="M 260 120 L 324 172 L 306 300 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.4} />
        <path d="M 196 172 L 260 190 L 214 300 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.3} />
        <path d="M 324 172 L 260 190 L 306 300 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.3} />
        {/* Mejillas angulares */}
        <path d="M 196 172 L 180 210 L 214 300 L 200 240 Z" fill={PLUSH_AMBER_DARK} stroke={edge} strokeWidth={1.2} />
        <path d="M 324 172 L 340 210 L 306 300 L 320 240 Z" fill={PLUSH_AMBER} stroke={edge} strokeWidth={1.2} />
        {/* Hocico crema */}
        <path d="M 226 252 L 260 300 L 294 252 L 260 262 Z" fill={CREAM_DIRTY} stroke={edge} strokeWidth={1.2} />
        {/* Ojos vacíos */}
        <path d="M 214 224 L 244 224 L 236 254 L 220 254 Z" fill={EYE_VOID} />
        <path d="M 306 224 L 276 224 L 284 254 L 300 254 Z" fill={EYE_VOID} />
        {/* Nariz */}
        <path d="M 254 270 L 266 270 L 260 282 Z" fill={NOSE} />
      </g>

      {/* ============================ GEMA LOWPOLY ============================ */}
      <g transform={`translate(0 ${Math.sin(t * 2.4) * 3})`}>
        <path d="M 257 18 L 245 42 L 260 52 L 275 42 Z" fill={GEM_BLOOD} stroke={edge} strokeWidth={1.2} />
        <path d="M 257 18 L 260 52 L 245 42 Z" fill={GEM_DARK} />
        <path d="M 257 18 L 275 42 L 260 52 Z" fill={GEM_BRIGHT} />
        <path d="M 245 42 L 260 52 L 260 34 Z" fill={GEM_CORE} opacity={0.8 + gem * 0.2} />
        <circle cx={257} cy={18} r={26 + gem * 14} fill="url(#td-glow)" opacity={0.3 + gem * 0.3 * pulse} />
      </g>
    </g>
  );
};

export const TailsDollCharacter: React.FC<TailsDollProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  flipX = false,
  gemIntensity = 0,
  mode = "plush",
  hoverAmp = 0,
  headTiltDeg = 0,
  rimColor = "#22D3EE",
  phaseOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const t = (frame + phaseOffset) / 30;
  const gem = clamp(gemIntensity, 0, 1.5);

  // Levitación orgánica suave (sinusoidal en 8).
  const hoverY = Math.sin(t * 1.6) * 12 * hoverAmp;
  const hoverX = Math.sin(t * 1.6 * 0.5) * 6 * hoverAmp;

  // Inclinación siniestra de cabeza + micro-sway.
  const headTilt = headTiltDeg + Math.sin(t * 0.9) * 2.2;

  return (
    <div
      style={{
        position: "absolute",
        left: x - (VB_W * scale) / 2,
        top: y - (VB_H * scale) / 2,
        width: VB_W * scale,
        height: VB_H * scale,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scaleX(${flipX ? -1 : 1})`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="td-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={GEM_CORE} stopOpacity="0.9" />
              <stop offset="60%" stopColor={GEM_BLOOD} stopOpacity="0.35" />
              <stop offset="100%" stopColor={GEM_BLOOD} stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${hoverX} ${hoverY})`}>
            {mode === "lowpoly1997" ? (
              <LowPolyBody t={t} gem={gem} headTilt={headTilt} rimColor={rimColor} />
            ) : (
              <PlushBody t={t} gem={gem} headTilt={headTilt} rimColor={rimColor} />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
