import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * SlenderCharacter — Silueta vectorial oscura articulada de Slenderman en 2.5D.
 *
 * Figura alta y esbelta: traje negro que desciende hasta el borde inferior del
 * lienzo, hombros amplios y angulosos, mangas largas con brazos esbeltos cayendo
 * por los costados, solapas elegantes afiladas y corbata carmesí muy oscuro.
 * Cabeza pálida lisa sin rostro, ligeramente alargada y sombreada con volumen
 * craneal realista. 8 tentáculos gruesos en el nacimiento (tras la espalda y los
 * hombros) que se afinan hacia las puntas en curvas Bézier amplias y sinuosas,
 * en negro carbón con un borde *rim light* fino en un solo lado.
 *
 * Construcción 100% SVG/TSX con curvas Bézier orgánicas y grupos `<g>`
 * independientes animados de forma determinista (solo `useCurrentFrame()` y
 * `Math.sin()`, cero `Math.random()`):
 *   1. 4 tentáculos traseros oscuros (capa 2.5D trasera, ondulación desfasada).
 *   2. Brazos y torso alargado con respiración lenta y porte imponente.
 *   3. Cabeza pálida lisa con inclinación inquietante lenta.
 *   4. 4 tentáculos frontales nítidos con rim light lateral en un solo lado.
 */

// ---- Formas fijas (siluetas frontales, centro en x = 230) ----

// Traje completo: hombros amplios y angulosos, cuerpo que desciende hasta y=560.
const JACKET = [
  "M 230 146",
  "C 196 148, 156 156, 140 176",
  "C 138 240, 142 330, 150 410",
  "C 156 470, 170 522, 190 548",
  "C 202 559, 216 560, 230 560",
  "C 244 560, 258 559, 270 548",
  "C 290 522, 304 470, 310 410",
  "C 318 330, 322 240, 320 176",
  "C 304 156, 264 148, 230 146",
  "Z",
].join(" ");

// Mangas largas y brazos esbeltos cayendo por los costados.
const SLEEVE_L = [
  "M 152 170",
  "C 138 230, 130 320, 128 410",
  "C 126 490, 132 530, 142 542",
  "C 148 548, 156 550, 162 547",
  "C 172 542, 178 532, 180 520",
  "C 186 440, 190 350, 192 260",
  "C 194 210, 195 182, 193 168",
  "Z",
].join(" ");

const SLEEVE_R = [
  "M 308 170",
  "C 322 230, 330 320, 332 410",
  "C 334 490, 328 530, 318 542",
  "C 312 548, 304 550, 298 547",
  "C 288 542, 282 532, 280 520",
  "C 274 440, 270 350, 268 260",
  "C 266 210, 265 182, 267 168",
  "Z",
].join(" ");

// Manos pálidas esbeltas asomando de las mangas.
const HAND_L = [
  "M 142 542",
  "C 140 552, 144 561, 152 562",
  "C 160 563, 167 559, 168 551",
  "C 169 545, 162 539, 152 539",
  "C 148 539, 144 540, 142 542",
  "Z",
].join(" ");

const HAND_R = [
  "M 318 542",
  "C 320 552, 316 561, 308 562",
  "C 300 563, 293 559, 292 551",
  "C 291 545, 298 539, 308 539",
  "C 312 539, 316 540, 318 542",
  "Z",
].join(" ");

const SHIRT = [
  "M 230 150",
  "C 219 192, 208 256, 202 322",
  "C 224 332, 236 332, 258 322",
  "C 252 256, 241 192, 230 150",
  "Z",
].join(" ");

const TIE = [
  "M 222 188",
  "C 221 248, 220 320, 219 396",
  "L 230 424",
  "L 241 396",
  "C 240 320, 239 248, 238 188",
  "C 234 181, 226 181, 222 188",
  "Z",
].join(" ");

const TIE_KNOT = [
  "M 215 172",
  "C 215 184, 217 190, 222 191",
  "L 238 191",
  "C 243 190, 245 184, 245 172",
  "C 241 163, 219 163, 215 172",
  "Z",
].join(" ");

const COLLAR_L = [
  "M 230 150",
  "C 223 154, 215 163, 211 176",
  "C 221 179, 227 174, 230 167",
  "Z",
].join(" ");

const COLLAR_R = [
  "M 230 150",
  "C 237 154, 245 163, 249 176",
  "C 239 179, 233 174, 230 167",
  "Z",
].join(" ");

const LAPEL_L = [
  "M 150 174",
  "C 154 216, 162 262, 178 300",
  "C 192 332, 206 346, 220 352",
  "L 230 346",
  "C 224 308, 218 262, 212 214",
  "C 208 190, 202 176, 192 168",
  "C 176 159, 158 161, 150 174",
  "Z",
].join(" ");

const LAPEL_R = [
  "M 310 174",
  "C 306 216, 298 262, 282 300",
  "C 268 332, 254 346, 240 352",
  "L 230 346",
  "C 236 308, 242 262, 248 214",
  "C 252 190, 258 176, 268 168",
  "C 284 159, 302 161, 310 174",
  "Z",
].join(" ");

const HEAD = [
  "M 230 14",
  "C 207 15, 194 38, 193 66",
  "C 192 94, 204 112, 230 112",
  "C 256 112, 268 94, 267 66",
  "C 266 38, 253 15, 230 14",
  "Z",
].join(" ");

const NECK = [
  "M 219 104",
  "C 218 118, 216 132, 215 148",
  "C 224 152, 236 152, 245 148",
  "C 244 132, 242 118, 241 104",
  "Z",
].join(" ");

// ---- Helpers ----

/**
 * tentaclePoints — calcula los puntos de un tentáculo cónico orgánico a partir
 * de dos curvas Bézier (borde externo e interno) que convergen en una punta.
 * Los puntos de control ondulan con `Math.sin(frame ...)` desfasado (phase).
 */
interface TentacleOpts {
  bx: number;
  by: number;
  dir: number; // -1 (izquierda) | 1 (derecha)
  reach: number; // alcance horizontal
  lift: number; // elevación vertical (negativo = hacia abajo)
  phase: number;
  amp: number;
  thick: number;
  frame: number;
}

interface TentaclePts {
  tipX: number;
  tipY: number;
  b1x: number;
  b1y: number;
  b2x: number;
  b2y: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  c3x: number;
  c3y: number;
  c4x: number;
  c4y: number;
}

const tentaclePoints = (o: TentacleOpts): TentaclePts => {
  const { bx, by, dir, reach, lift, phase, amp, thick, frame } = o;

  const s1 = Math.sin(frame * 0.055 + phase) * amp;
  const s2 = Math.sin(frame * 0.085 + phase * 1.35) * amp * 0.7;
  const s3 = Math.sin(frame * 0.038 + phase * 0.55) * amp * 0.5;

  const tipX = bx + dir * reach + s1 * 1.7;
  const tipY = by - lift + s2 * 1.3;

  const b1x = bx - thick * 0.5 + s3 * 0.3;
  const b1y = by + 3 + s3;
  const b2x = bx + thick * 0.5 + s3 * 0.3;
  const b2y = by - 2 + s3;

  const c1x = bx + dir * reach * 0.34 + s1;
  const c1y = by - lift * 0.22 + s2 * 0.8;
  const c2x = bx + dir * reach * 0.72 + s1 * 1.3;
  const c2y = by - lift * 0.6 + s2 * 1.1;

  const c3x = bx + dir * reach * 0.68 + s1 * 1.1;
  const c3y = by - lift * 0.66 + s2 * 0.9;
  const c4x = bx + dir * reach * 0.28 + s1 * 0.6;
  const c4y = by - lift * 0.16 + s2 * 0.6;

  return { tipX, tipY, b1x, b1y, b2x, b2y, c1x, c1y, c2x, c2y, c3x, c3y, c4x, c4y };
};

const tentaclePath = (o: TentacleOpts): string => {
  const p = tentaclePoints(o);
  return [
    `M ${p.b1x.toFixed(1)} ${p.b1y.toFixed(1)}`,
    `C ${p.c1x.toFixed(1)} ${p.c1y.toFixed(1)}, ${p.c2x.toFixed(1)} ${p.c2y.toFixed(1)}, ${p.tipX.toFixed(1)} ${p.tipY.toFixed(1)}`,
    `C ${p.c3x.toFixed(1)} ${p.c3y.toFixed(1)}, ${p.c4x.toFixed(1)} ${p.c4y.toFixed(1)}, ${p.b2x.toFixed(1)} ${p.b2y.toFixed(1)}`,
    "Z",
  ].join(" ");
};

// Borde exterior (lado alejado del cuerpo) del tentáculo: para el rim light
// fino en un único lado.
const tentacleOuterEdge = (o: TentacleOpts): string => {
  const p = tentaclePoints(o);
  if (o.dir <= 0) {
    return `M ${p.b1x.toFixed(1)} ${p.b1y.toFixed(1)} C ${p.c1x.toFixed(1)} ${p.c1y.toFixed(1)}, ${p.c2x.toFixed(1)} ${p.c2y.toFixed(1)}, ${p.tipX.toFixed(1)} ${p.tipY.toFixed(1)}`;
  }
  return `M ${p.b2x.toFixed(1)} ${p.b2y.toFixed(1)} C ${p.c3x.toFixed(1)} ${p.c3y.toFixed(1)}, ${p.c4x.toFixed(1)} ${p.c4y.toFixed(1)}, ${p.tipX.toFixed(1)} ${p.tipY.toFixed(1)}`;
};

const buttonPath = (cx: number, cy: number, r = 3.4): string =>
  [
    `M ${cx - r} ${cy}`,
    `C ${cx - r} ${cy - r * 0.75}, ${cx + r} ${cy - r * 0.75}, ${cx + r} ${cy}`,
    `C ${cx + r} ${cy + r * 0.75}, ${cx - r} ${cy + r * 0.75}, ${cx - r} ${cy}`,
    "Z",
  ].join(" ");

// ---- Props ----

export interface SlenderCharacterProps {
  width?: number;
  scale?: number;
  opacity?: number;
  rimColor?: string;
  tentacleIntensity?: number;
  headTiltBoost?: number;
  style?: React.CSSProperties;
}

// ---- Componente ----

export const SlenderCharacter: React.FC<SlenderCharacterProps> = ({
  width = 520,
  scale = 1,
  opacity = 1,
  rimColor = "#38BDF8",
  tentacleIntensity = 1,
  headTiltBoost = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const rawId = React.useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const intensity = Math.max(0, tentacleIntensity);
  const backTentacleOpacity = Math.min(1, 0.9 * intensity);
  const frontTentacleOpacity = Math.min(1, 0.95 * intensity);

  const breathe = 1 + Math.sin(frame * 0.055) * 0.007;
  const headTilt = Math.sin(frame * 0.045 + 0.6) * 2.4 + headTiltBoost;
  const headSway = Math.sin(frame * 0.032 + 1.2) * 1.6;

  return (
    <div
      style={{
        position: "absolute",
        width,
        height: (width * 560) / 460,
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 460 560"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`${uid}-suit`} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#0D1118" />
            <stop offset="45%" stopColor="#07090F" />
            <stop offset="100%" stopColor="#03040A" />
          </linearGradient>
          <linearGradient id={`${uid}-suit-rim`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={rimColor} stopOpacity="0" />
            <stop offset="70%" stopColor={rimColor} stopOpacity="0" />
            <stop offset="100%" stopColor={rimColor} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${uid}-shirt`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDF1F5" />
            <stop offset="60%" stopColor="#C9D2DC" />
            <stop offset="100%" stopColor="#9FAAB6" />
          </linearGradient>
          <linearGradient id={`${uid}-tie`} x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#5C121C" />
            <stop offset="55%" stopColor="#3A0A12" />
            <stop offset="100%" stopColor="#1C040A" />
          </linearGradient>
          <radialGradient id={`${uid}-head`} cx="42%" cy="36%" r="78%">
            <stop offset="0%" stopColor="#E9E4D8" />
            <stop offset="55%" stopColor="#D3CCBC" />
            <stop offset="100%" stopColor="#B4AD9D" />
          </radialGradient>
          <radialGradient id={`${uid}-head-shadow`} cx="30%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#6F6A60" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6F6A60" stopOpacity="0" />
          </radialGradient>
          {/* Tentáculos en negro carbón */}
          <linearGradient id={`${uid}-tent-back`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#080A0E" />
            <stop offset="100%" stopColor="#02040A" />
          </linearGradient>
          <linearGradient id={`${uid}-tent-front`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0A0C11" />
            <stop offset="55%" stopColor="#05070B" />
            <stop offset="100%" stopColor="#03040A" />
          </linearGradient>
          <filter id={`${uid}-back-blur`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id={`${uid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        {/* 1) Tentáculos traseros oscuros (capa 2.5D trasera) */}
        <g opacity={backTentacleOpacity} filter={`url(#${uid}-back-blur)`}>
          <path
            d={tentaclePath({
              bx: 130,
              by: 172,
              dir: -1,
              reach: 152,
              lift: 122,
              phase: 0.0,
              amp: 14 * intensity,
              thick: 26,
              frame,
            })}
            fill={`url(#${uid}-tent-back)`}
          />
          <path
            d={tentaclePath({
              bx: 142,
              by: 214,
              dir: -1,
              reach: 172,
              lift: 92,
              phase: 1.7,
              amp: 17 * intensity,
              thick: 28,
              frame,
            })}
            fill={`url(#${uid}-tent-back)`}
          />
          <path
            d={tentaclePath({
              bx: 330,
              by: 172,
              dir: 1,
              reach: 152,
              lift: 122,
              phase: 0.9,
              amp: 14 * intensity,
              thick: 26,
              frame,
            })}
            fill={`url(#${uid}-tent-back)`}
          />
          <path
            d={tentaclePath({
              bx: 318,
              by: 214,
              dir: 1,
              reach: 172,
              lift: 92,
              phase: 2.6,
              amp: 17 * intensity,
              thick: 28,
              frame,
            })}
            fill={`url(#${uid}-tent-back)`}
          />
        </g>

        {/* 2) Brazos esbeltos + torso alargado (respiración lenta, porte imponente) */}
        <g style={{ transformOrigin: "230px 340px", transform: `scale(${breathe})` }}>
          <path d={SLEEVE_L} fill={`url(#${uid}-suit)`} stroke="#02040A" strokeWidth="1" />
          <path d={SLEEVE_R} fill={`url(#${uid}-suit)`} stroke="#02040A" strokeWidth="1" />

          {/* Manos pálidas asomando */}
          <path d={HAND_L} fill={`url(#${uid}-head)`} stroke="#8E887B" strokeWidth="0.7" />
          <path d={HAND_R} fill={`url(#${uid}-head)`} stroke="#8E887B" strokeWidth="0.7" />

          {/* Sombra profunda del núcleo (lado izquierdo) */}
          <path
            d="M 158 180 C 152 260, 152 360, 160 440 C 165 500, 175 540, 190 552 C 180 540, 170 500, 162 430 C 154 350, 153 260, 158 180 Z"
            fill="#010204"
            opacity="0.45"
            filter={`url(#${uid}-soft)`}
          />

          {/* Silueta principal del traje */}
          <path d={JACKET} fill={`url(#${uid}-suit)`} stroke="#02040A" strokeWidth="1.2" />

          {/* Rim light lateral del traje */}
          <path d={JACKET} fill={`url(#${uid}-suit-rim)`} style={{ mixBlendMode: "screen" }} />

          {/* Pliegues de tela (textura) */}
          <path
            d="M 200 210 C 194 300, 192 400, 196 500"
            stroke="#000000"
            strokeWidth="1.2"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M 260 210 C 266 300, 268 400, 264 500"
            stroke="#000000"
            strokeWidth="1.2"
            fill="none"
            opacity="0.35"
          />

          {/* Camisa blanca fría (abertura central en V) */}
          <path d={SHIRT} fill={`url(#${uid}-shirt)`} />
          <path
            d="M 212 200 C 214 244, 217 288, 223 320"
            stroke="#8A94A2"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />

          {/* Cuello de la camisa */}
          <path d={COLLAR_L} fill={`url(#${uid}-shirt)`} stroke="#8A94A2" strokeWidth="0.8" />
          <path d={COLLAR_R} fill={`url(#${uid}-shirt)`} stroke="#8A94A2" strokeWidth="0.8" />

          {/* Corbata carmesí muy oscuro */}
          <path d={TIE} fill={`url(#${uid}-tie)`} stroke="#1A040A" strokeWidth="0.8" />
          <path d={TIE_KNOT} fill={`url(#${uid}-tie)`} stroke="#1A040A" strokeWidth="0.8" />
          <path
            d="M 226 196 C 226 264, 225 336, 224 400"
            stroke="#7A1B28"
            strokeWidth="1.4"
            fill="none"
            opacity="0.5"
          />

          {/* Solapas elegantes afiladas */}
          <path d={LAPEL_L} fill={`url(#${uid}-suit)`} stroke="#02040A" strokeWidth="0.9" />
          <path d={LAPEL_R} fill={`url(#${uid}-suit)`} stroke="#02040A" strokeWidth="0.9" />

          {/* Muescas de solapa */}
          <path
            d="M 206 182 C 212 186, 216 192, 218 200 C 210 198, 204 192, 206 182 Z"
            fill="#02040A"
            opacity="0.5"
          />
          <path
            d="M 254 182 C 248 186, 244 192, 242 200 C 250 198, 256 192, 254 182 Z"
            fill="#02040A"
            opacity="0.5"
          />

          {/* Pliegues de manga */}
          <path
            d="M 136 360 C 140 420, 142 480, 146 520"
            stroke="#010204"
            strokeWidth="1.4"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 324 360 C 320 420, 318 480, 314 520"
            stroke="#010204"
            strokeWidth="1.4"
            fill="none"
            opacity="0.5"
          />

          {/* Botones */}
          <path d={buttonPath(230, 358)} fill="#10141B" stroke="#000000" strokeWidth="0.6" opacity="0.9" />
          <path d={buttonPath(230, 388)} fill="#10141B" stroke="#000000" strokeWidth="0.6" opacity="0.9" />
          <path d={buttonPath(230, 418)} fill="#10141B" stroke="#000000" strokeWidth="0.6" opacity="0.9" />
        </g>

        {/* 3) Cabeza pálida lisa sin rostro (inclinación inquietante lenta) */}
        <g
          style={{
            transformOrigin: "230px 146px",
            transform: `rotate(${headTilt}deg) translate(${headSway}px, 0px)`,
          }}
        >
          <path d={NECK} fill={`url(#${uid}-head)`} />
          <path
            d="M 216 120 C 214 130, 214 140, 216 148 C 222 149, 228 149, 234 148 C 232 138, 231 128, 230 120 Z"
            fill="#8E887B"
            opacity="0.4"
            filter={`url(#${uid}-soft)`}
          />

          <path d={HEAD} fill={`url(#${uid}-head)`} stroke="#8E887B" strokeWidth="0.8" />

          {/* Volumen anatómico sombreado (lado izquierdo) */}
          <path
            d="M 198 32 C 206 24, 216 22, 224 24 C 210 46, 205 68, 208 92 C 210 102, 213 106, 217 108 C 205 98, 196 66, 198 32 Z"
            fill={`url(#${uid}-head-shadow)`}
            filter={`url(#${uid}-soft)`}
          />

          {/* Brillo de la frente */}
          <path
            d="M 218 32 C 222 28, 228 28, 232 32 C 228 38, 222 38, 218 32 Z"
            fill="#F4F0E6"
            opacity="0.5"
            filter={`url(#${uid}-soft)`}
          />

          {/* Cuencas apenas sugeridas (sin ojos) */}
          <path
            d="M 203 54 C 214 45, 227 47, 233 58 C 224 66, 211 64, 203 54 Z"
            fill="#6B655C"
            opacity="0.35"
            filter={`url(#${uid}-soft)`}
          />
          <path
            d="M 257 54 C 246 45, 233 47, 227 58 C 236 66, 249 64, 257 54 Z"
            fill="#6B655C"
            opacity="0.35"
            filter={`url(#${uid}-soft)`}
          />

          {/* Pómulos apenas sugeridos */}
          <path
            d="M 204 72 C 211 82, 221 84, 226 77 C 221 71, 211 69, 204 72 Z"
            fill="#6B655C"
            opacity="0.22"
            filter={`url(#${uid}-soft)`}
          />
          <path
            d="M 256 72 C 249 82, 239 84, 234 77 C 239 71, 249 69, 256 72 Z"
            fill="#6B655C"
            opacity="0.22"
            filter={`url(#${uid}-soft)`}
          />

          {/* Rim light de la cabeza */}
          <path
            d="M 250 22 C 264 42, 267 80, 256 106"
            stroke={rimColor}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 210 22 C 196 42, 194 80, 205 106"
            stroke={rimColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>

        {/* 4) Tentáculos frontales nítidos (rim light en un solo lado) */}
        <g opacity={frontTentacleOpacity}>
          <path
            d={tentaclePath({
              bx: 150,
              by: 210,
              dir: -1,
              reach: 118,
              lift: 78,
              phase: 2.0,
              amp: 12 * intensity,
              thick: 38,
              frame,
            })}
            fill={`url(#${uid}-tent-front)`}
          />
          <path
            d={tentaclePath({
              bx: 310,
              by: 210,
              dir: 1,
              reach: 118,
              lift: 78,
              phase: 3.1,
              amp: 12 * intensity,
              thick: 38,
              frame,
            })}
            fill={`url(#${uid}-tent-front)`}
          />
          <path
            d={tentaclePath({
              bx: 144,
              by: 292,
              dir: -1,
              reach: 142,
              lift: -36,
              phase: 4.2,
              amp: 11 * intensity,
              thick: 44,
              frame,
            })}
            fill={`url(#${uid}-tent-front)`}
          />
          <path
            d={tentaclePath({
              bx: 316,
              by: 292,
              dir: 1,
              reach: 142,
              lift: -36,
              phase: 5.0,
              amp: 11 * intensity,
              thick: 44,
              frame,
            })}
            fill={`url(#${uid}-tent-front)`}
          />

          {/* Rim light fino en el borde exterior de cada tentáculo frontal */}
          <path
            d={tentacleOuterEdge({
              bx: 150,
              by: 210,
              dir: -1,
              reach: 118,
              lift: 78,
              phase: 2.0,
              amp: 12 * intensity,
              thick: 38,
              frame,
            })}
            fill="none"
            stroke={rimColor}
            strokeWidth="1.3"
            opacity="0.4"
          />
          <path
            d={tentacleOuterEdge({
              bx: 310,
              by: 210,
              dir: 1,
              reach: 118,
              lift: 78,
              phase: 3.1,
              amp: 12 * intensity,
              thick: 38,
              frame,
            })}
            fill="none"
            stroke={rimColor}
            strokeWidth="1.3"
            opacity="0.4"
          />
          <path
            d={tentacleOuterEdge({
              bx: 144,
              by: 292,
              dir: -1,
              reach: 142,
              lift: -36,
              phase: 4.2,
              amp: 11 * intensity,
              thick: 44,
              frame,
            })}
            fill="none"
            stroke={rimColor}
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d={tentacleOuterEdge({
              bx: 316,
              by: 292,
              dir: 1,
              reach: 142,
              lift: -36,
              phase: 5.0,
              amp: 11 * intensity,
              thick: 44,
              frame,
            })}
            fill="none"
            stroke={rimColor}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
};
