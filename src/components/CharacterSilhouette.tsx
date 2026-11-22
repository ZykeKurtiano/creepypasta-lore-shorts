import React from "react";
import { random, useCurrentFrame } from "remotion";

/**
 * CharacterSilhouette.tsx — Silueta vectorial SVG de Slenderman:
 * hombros anchos angulares, traje negro con solapas sombreadas, camisa V
 * blanca tenue, corbata carmesí oscura y fina, cintura estrecha, brazos
 * larguísimos con manos y dedos pálidos; cabeza oval pálida (#DDDAD2) sin
 * rasgos con claroscuro radial y luz de borde fría; 8 tentáculos negros
 * cónicos orgánicos (paths Bézier RELLENOS, anchos en la base ~18-24px y
 * afilados en puntas de ~1-2px) animados con Math.sin/cos multifrecuencia.
 */

export type CharacterSilhouetteProps = {
  scale?: number;
  yOffset?: number; // px hacia abajo
  xOffset?: number; // px desde el centro del lienzo
  opacity?: number;
  tentacleSpread?: number; // 0..1
  glitchIntensity?: number; // 0..1
  rimColor?: string;
};

const TENTACLE_COUNT = 8;

type Vec = { x: number; y: number };

const Tentacles: React.FC<{
  frame: number;
  spread: number;
  rimColor: string;
}> = ({ frame, spread, rimColor }) => {
  const t = frame * 0.05;
  const spreadAmp = 0.3 + 0.7 * spread;

  const items = Array.from({ length: TENTACLE_COUNT }, (_, i) => {
    const sx = 200 + (i - 3.5) * 13;
    const sy = 332;
    const a0 = -Math.PI / 2 + (i - 3.5) * 0.3;
    const L = 330 + random(i * 13 + 5) * 170;
    const freq = 0.5 + i * 0.12;
    const ph = i * 1.9;

    // Tres ángulos evolucionando con frecuencias/desfases distintos (ondas S)
    const a1 = a0 + Math.sin(t * freq + ph) * 0.14 * spreadAmp;
    const a2 = a0 + Math.cos(t * freq * 0.8 + ph * 1.35) * 0.22 * spreadAmp;
    const a3 = a0 + Math.sin(t * freq * 0.6 + ph * 2.1) * 0.3 * spreadAmp;
    const l3 = L * (1 + 0.06 * Math.sin(t * 0.8 + i));

    const ax = sx + Math.cos(a1) * 0.16 * L;
    const ay = sy + Math.sin(a1) * 0.16 * L;
    const bx = sx + Math.cos(a2) * 0.66 * L;
    const by = sy + Math.sin(a2) * 0.66 * L;
    const ex = sx + Math.cos(a3) * l3;
    const ey = sy + Math.sin(a3) * l3;

    const perp1: Vec = { x: -Math.sin(a1), y: Math.cos(a1) };
    const perp3: Vec = { x: -Math.sin(a3), y: Math.cos(a3) };
    const wb = 9 + random(i * 31 + 11) * 4; // media anchura de base

    const p0l: Vec = { x: sx + perp1.x * wb, y: sy + perp1.y * wb };
    const p0r: Vec = { x: sx - perp1.x * wb, y: sy - perp1.y * wb };
    const al: Vec = { x: ax + perp1.x * wb * 0.55, y: ay + perp1.y * wb * 0.55 };
    const ar: Vec = { x: ax - perp1.x * wb * 0.55, y: ay - perp1.y * wb * 0.55 };
    const bl: Vec = { x: bx + perp3.x * 1.4, y: by + perp3.y * 1.4 };
    const br: Vec = { x: bx - perp3.x * 1.4, y: by - perp3.y * 1.4 };
    const tip: Vec = { x: ex, y: ey };

    const f = (p: Vec) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const d = `M ${f(p0l)} C ${f(al)} ${f(bl)} ${f(tip)} C ${f(br)} ${f(ar)} ${f(p0r)} Z`;
    const center = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${f({ x: ax, y: ay })} ${f({ x: bx, y: by })} ${f(tip)}`;
    return { d, center, wb };
  });

  return (
    <g fill="none">
      {/* Luz de borde fría bajo los tentáculos */}
      {items.map((it, i) => (
        <path
          key={`rim-${i}`}
          d={it.center}
          stroke={rimColor}
          strokeWidth={it.wb * 1.7}
          strokeLinecap="round"
          opacity={0.14}
        />
      ))}
      {/* Tentáculos cónicos rellenos */}
      {items.map((it, i) => (
        <path key={`t-${i}`} d={it.d} fill="#04050A" />
      ))}
    </g>
  );
};

export const CharacterSilhouette: React.FC<CharacterSilhouetteProps> = ({
  scale = 1,
  yOffset = 0,
  xOffset = 0,
  opacity = 1,
  tentacleSpread = 0.5,
  glitchIntensity = 0,
  rimColor = "#2B3A42",
}) => {
  const frame = useCurrentFrame();

  // Respiración lenta + balanceo casi imperceptible (determinista)
  const breathe = 1 + Math.sin(frame * 0.13) * 0.006;
  const sway = Math.sin(frame * 0.021) * 1.1;

  // Micro-teleporto cuantizado (glitch)
  const jx = Math.round(Math.sin(frame * 1.7) * 2.2) * 4 * glitchIntensity;
  const jy = Math.round(Math.sin(frame * 2.3 + 1.3) * 1.6) * 3 * glitchIntensity;

  // Aberración cromática: franjas roja/cian desplazadas en picos de tensión
  const ghostOffset = Math.round(glitchIntensity * 8);
  const caFilter =
    ghostOffset > 0
      ? `drop-shadow(${-ghostOffset}px 0 0 rgba(220,38,38,0.5)) drop-shadow(${ghostOffset}px 0 0 rgba(34,211,238,0.45))`
      : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 120,
        width: 380,
        height: 1045,
        opacity,
        transform: `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset}px) scale(${scale})`,
        filter: caFilter,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: "50% 100%",
          transform: `translateX(${jx}px) translateY(${jy}px) scaleY(${breathe.toFixed(4)}) rotate(${sway.toFixed(2)}deg)`,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 1100">
          <defs>
            <radialGradient id="headGrad" cx="42%" cy="36%" r="82%">
              <stop offset="0%" stopColor="#ECE9E1" />
              <stop offset="50%" stopColor="#DDDAD2" />
              <stop offset="85%" stopColor="#B5B0A4" />
              <stop offset="100%" stopColor="#8F8A7E" />
            </radialGradient>
            <linearGradient id="suitGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06080C" />
              <stop offset="45%" stopColor="#11151D" />
              <stop offset="100%" stopColor="#04050A" />
            </linearGradient>
            <clipPath id="headClip">
              <ellipse cx={200} cy={132} rx={54} ry={82} />
            </clipPath>
          </defs>

          {/* Tentáculos traseros */}
          <Tentacles frame={frame} spread={tentacleSpread} rimColor={rimColor} />

          {/* Brazos larguísimos con manos y dedos pálidos */}
          <path
            d="M 96 370 C 86 480, 80 640, 84 800 L 78 990 C 76 1010, 78 1030, 84 1048 L 108 1048 C 113 1024, 112 1004, 106 990 L 106 800 C 110 640, 114 480, 118 380 Z"
            fill="#0A0D12"
          />
          <path
            d="M 304 370 C 314 480, 320 640, 316 800 L 322 990 C 324 1010, 322 1030, 316 1048 L 292 1048 C 287 1024, 288 1004, 294 990 L 294 800 C 290 640, 286 480, 282 380 Z"
            fill="#0A0D12"
          />
          {/* Manos alargadas */}
          <path
            d="M 82 1046 C 80 1062, 82 1076, 88 1088 L 110 1088 C 116 1074, 116 1060, 110 1046 Z"
            fill="#DDDAD2"
            opacity={0.92}
          />
          <path
            d="M 318 1046 C 320 1062, 318 1076, 312 1088 L 290 1088 C 284 1074, 284 1060, 290 1046 Z"
            fill="#DDDAD2"
            opacity={0.92}
          />
          {/* Dedos esbeltos */}
          <path d="M 84 1054 L 87 1054 L 86 1090 L 82 1090 Z" fill="#DDDAD2" />
          <path d="M 93 1054 L 96 1054 L 96 1094 L 92 1094 Z" fill="#DDDAD2" />
          <path d="M 102 1054 L 105 1054 L 105 1088 L 101 1088 Z" fill="#DDDAD2" />
          <path d="M 316 1054 L 313 1054 L 314 1090 L 318 1090 Z" fill="#DDDAD2" />
          <path d="M 307 1054 L 304 1054 L 304 1094 L 308 1094 Z" fill="#DDDAD2" />
          <path d="M 298 1054 L 295 1054 L 295 1088 L 299 1088 Z" fill="#DDDAD2" />

          {/* Traje negro de hombros anchos y cintura estrecha */}
          <path
            d="M 200 296 L 148 300 C 126 312, 106 334, 92 368 C 84 540, 78 720, 82 900 L 90 1060 L 100 1080 L 300 1080 L 310 1060 L 318 900 C 322 720, 316 540, 308 368 C 294 334, 274 312, 252 300 Z"
            fill="url(#suitGrad)"
          />
          {/* Solapas sombreadas */}
          <path
            d="M 148 300 C 162 332, 180 364, 198 430 L 184 464 L 154 380 L 134 322 Z"
            fill="#171C26"
          />
          <path
            d="M 252 300 C 238 332, 220 364, 202 430 L 216 464 L 246 380 L 266 322 Z"
            fill="#171C26"
          />
          {/* Camisa V blanca tenue */}
          <path d="M 168 376 L 200 470 L 232 376 L 200 418 Z" fill="#E8E4DA" opacity={0.85} />
          {/* Corbata carmesí fina */}
          <path
            d="M 200 402 L 211 414 L 209 566 L 200 588 L 191 566 L 189 414 Z"
            fill="#5F1717"
          />
          <path d="M 189 400 L 211 400 L 217 424 L 183 424 Z" fill="#7F1D1D" />
          <path
            d="M 200 404 L 204 414 L 203 560 L 200 574 L 197 560 L 196 414 Z"
            fill="#8A2323"
            opacity={0.6}
          />

          {/* Cuello */}
          <path d="M 183 200 L 217 200 L 219 302 L 181 302 Z" fill="#0A0D12" />

          {/* Cabeza oval pálida SIN rasgos, claroscuro radial */}
          <ellipse cx={200} cy={132} rx={54} ry={82} fill="url(#headGrad)" />
          <g clipPath="url(#headClip)">
            {/* Luz de borde fría arriba-izquierda */}
            <ellipse
              cx={176}
              cy={104}
              rx={58}
              ry={70}
              fill="rgba(242,239,233,0.16)"
            />
            {/* Sombra ahumada abajo-derecha */}
            <ellipse
              cx={234}
              cy={180}
              rx={62}
              ry={92}
              fill="rgba(7,9,12,0.3)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
