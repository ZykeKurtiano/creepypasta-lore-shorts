import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * SmileDogCreature — Silueta vectorial animada de Smile Dog (smile.jpg).
 *
 * Lobo/husky anguloso y demacrado, depredador:
 *  - cabeza afilada con penachos de pelaje dentados, frente estrecha,
 *    orejas altas y puntiagudas de lobo,
 *  - cuencas oculares profundas y sombreadas con iris pálido
 *    ámbar/blanco-frío y pupilas puntiformes diminutas (halo carmesí),
 *  - cavidad bucal ancha carmesí-negra con dientes humanos individuales,
 *    desiguales, de hueso apagado (filas superior e inferior).
 *
 * Variantes: "flash" (chiaroscuro rojizo) y "forest" (cuerpo jorobado
 * malformado con pelaje erizado — retake biológico).
 * Animación 100% determinista.
 */

const HEAD_PATH = [
  "M 84 30",
  "L 128 114",
  "L 156 122",
  "L 186 108",
  "L 210 98",
  "L 234 108",
  "L 264 122",
  "L 292 114",
  "L 336 30",
  "L 312 132",
  "L 332 158",
  "L 298 178",
  "L 324 206",
  "L 294 228",
  "L 302 258",
  "L 278 284",
  "L 268 308",
  "L 252 332",
  "L 232 346",
  "L 210 352",
  "L 188 346",
  "L 168 332",
  "L 152 308",
  "L 142 284",
  "L 118 258",
  "L 126 228",
  "L 96 206",
  "L 122 178",
  "L 88 158",
  "L 108 132",
  "Z",
].join(" ");

const MOUTH_CX = 210;
const MOUTH_CY = 350;

// Dientes superiores: individuales, ligeramente desiguales.
const UPPER_TEETH = [
  { x: 156, w: 8.5, h: 13, tilt: -7, d: 0.7 },
  { x: 169, w: 9.5, h: 15.5, tilt: -4, d: 0.88 },
  { x: 182, w: 9, h: 16.5, tilt: -1, d: 1 },
  { x: 195, w: 10, h: 17, tilt: 1, d: 1 },
  { x: 209, w: 9.5, h: 16.5, tilt: 0, d: 1 },
  { x: 222, w: 9.5, h: 16, tilt: -1, d: 1 },
  { x: 235, w: 9, h: 15, tilt: 2, d: 0.95 },
  { x: 247, w: 9.5, h: 14, tilt: 4, d: 0.85 },
  { x: 259, w: 8.5, h: 12.5, tilt: 7, d: 0.68 },
];

// Dientes inferiores: más pequeños, escalonados, más apagados.
const LOWER_TEETH = [
  { x: 163, w: 8, h: 10, tilt: 8, d: 0.58 },
  { x: 177, w: 8.5, h: 11, tilt: 5, d: 0.66 },
  { x: 191, w: 8.5, h: 11.5, tilt: 2, d: 0.72 },
  { x: 205, w: 9, h: 11.5, tilt: 0, d: 0.75 },
  { x: 219, w: 9, h: 11, tilt: -2, d: 0.72 },
  { x: 233, w: 8.5, h: 10.5, tilt: -5, d: 0.66 },
  { x: 247, w: 8.5, h: 10, tilt: -8, d: 0.58 },
];

const lipTopY = (cx: number): number => {
  const p = (cx - 210) / 110;
  return 337 + (1 - p * p) * 9;
};

const lowerLipY = (cx: number): number => {
  const p = (cx - 210) / 110;
  return 388 - (1 - p * p) * 9;
};

interface SmileDogProps {
  width?: number;
  opacity?: number;
  jawOpen?: number; // 0..1 — cuánto se ensancha la mandíbula
  eyeGlow?: number; // multiplicador de brillo ocular
  reveal?: number; // 0..1 — aparición progresiva
  variant?: "flash" | "forest";
  style?: React.CSSProperties;
}

export const SmileDogCreature: React.FC<SmileDogProps> = ({
  width = 420,
  opacity = 1,
  jawOpen = 0,
  eyeGlow = 1,
  reveal = 1,
  variant = "flash",
  style,
}) => {
  const frame = useCurrentFrame();

  const breathe = 1 + Math.sin(frame * 0.085) * 0.012;
  const flicker =
    (0.85 + 0.15 * Math.max(0, Math.sin(frame * 0.71 + 1.3))) * eyeGlow;
  const earTwist = Math.sin(frame * 0.13 + 0.6) * (variant === "forest" ? 1.6 : 0.9);

  const jawSx = 1 + jawOpen * 0.3;
  const jawSy = 1 + jawOpen * 0.5;

  const finalOpacity = Math.max(0, Math.min(1, opacity * reveal));

  return (
    <div
      style={{
        position: "absolute",
        width,
        height: (width * 440) / 420,
        opacity: finalOpacity,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 420 440"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="sd-iris" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#F7FBFF" />
            <stop offset="55%" stopColor="#F5D9A0" />
            <stop offset="100%" stopColor="#D98F36" />
          </radialGradient>
          <radialGradient id="sd-eye-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5C77C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5C77C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sd-rim" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#7F1D1D" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#7F1D1D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sd-fur" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#0A0D12" />
            <stop offset="100%" stopColor="#04060A" />
          </linearGradient>
          <linearGradient id="sd-mouth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A0506" />
            <stop offset="100%" stopColor="#050102" />
          </linearGradient>
          <filter id="sd-blur6" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="sd-blur14" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Cuerpo malformado (solo variante bosque) */}
        {variant === "forest" ? (
          <g>
            <path
              d="M 96 330
                 L 58 380 L 70 398 L 44 430 L 66 462
                 L 130 476 L 200 486 L 270 476 L 336 462
                 L 360 428 L 342 396 L 358 368 L 340 330
                 L 320 396 L 298 336 Z"
              fill="url(#sd-fur)"
              opacity="0.96"
            />
            {/* Espinas de pelaje erizado */}
            <g stroke="#0C1016" strokeWidth="4" strokeLinecap="round" opacity="0.9">
              <path d="M 66 462 L 102 446" />
              <path d="M 102 446 L 96 470" />
              <path d="M 130 476 L 136 452" />
              <path d="M 136 452 L 154 472" />
              <path d="M 200 486 L 204 458" />
              <path d="M 204 458 L 222 480" />
              <path d="M 270 476 L 272 452" />
              <path d="M 272 452 L 290 472" />
              <path d="M 336 462 L 324 438" />
              <path d="M 324 438 L 346 450" />
            </g>
          </g>
        ) : null}

        {/* Aura tenue detrás de la cabeza */}
        <ellipse
          cx="210"
          cy="215"
          rx="170"
          ry="185"
          fill="#1A2027"
          opacity="0.2"
          filter="url(#sd-blur14)"
        />

        {/* Cabeza angulosa de lobo */}
        <g style={{ transformOrigin: "210px 250px", transform: `scale(${breathe})` }}>
          <path d={HEAD_PATH} fill="url(#sd-fur)" stroke="#0B0F15" strokeWidth="2" />

          {/* Interiores de oreja */}
          <g style={{ transformOrigin: "124px 110px", transform: `rotate(${earTwist}deg)` }}>
            <path d="M 100 48 L 126 112 L 148 118 L 116 54 Z" fill="#03050A" opacity="0.92" />
          </g>
          <g style={{ transformOrigin: "296px 110px", transform: `rotate(${-earTwist}deg)` }}>
            <path d="M 320 48 L 294 112 L 272 118 L 304 54 Z" fill="#03050A" opacity="0.92" />
          </g>

          {/* Frente sombreada */}
          <path
            d="M 150 130 C 170 116, 250 116, 270 130 C 262 146, 158 146, 150 130 Z"
            fill="#03050A"
            opacity="0.8"
          />

          {/* Cuencas oculares profundas (almendradas, inclinadas) */}
          <path
            d="M 124 178 C 138 164, 168 166, 182 192 C 168 212, 138 210, 124 178 Z"
            fill="#020304"
          />
          <path
            d="M 296 178 C 282 164, 252 166, 238 192 C 252 212, 282 210, 296 178 Z"
            fill="#020304"
          />

          {/* Iris pálido ámbar/blanco-frío */}
          <g opacity={flicker}>
            <ellipse cx="152" cy="188" rx="22" ry="16" fill="url(#sd-eye-glow)" />
            <ellipse cx="268" cy="188" rx="22" ry="16" fill="url(#sd-eye-glow)" />
            <ellipse cx="152" cy="188" rx="13.5" ry="7.5" fill="url(#sd-iris)" />
            <ellipse cx="268" cy="188" rx="13.5" ry="7.5" fill="url(#sd-iris)" />
            {/* Pupilas puntiformes diminutas */}
            <circle cx="152" cy="188" r="2.4" fill="#0A0504" />
            <circle cx="268" cy="188" r="2.4" fill="#0A0504" />
            {/* Halo carmesí interior */}
            <circle cx="152" cy="188" r="5" fill="none" stroke="#DC2626" strokeWidth="1.6" opacity="0.55" />
            <circle cx="268" cy="188" r="5" fill="none" stroke="#DC2626" strokeWidth="1.6" opacity="0.55" />
            {/* Destello frío diminuto */}
            <circle cx="148" cy="184.5" r="1.7" fill="#FFFFFF" opacity="0.9" />
            <circle cx="264" cy="184.5" r="1.7" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Sombra del párpado superior (profundidad de la cuenca) */}
          <ellipse cx="152" cy="178" rx="27" ry="9" fill="rgba(0,0,0,0.42)" />
          <ellipse cx="268" cy="178" rx="27" ry="9" fill="rgba(0,0,0,0.42)" />

          {/* Hocico alargado y sombreado */}
          <path
            d="M 160 262
               C 168 292, 178 310, 190 328
               C 200 342, 220 342, 230 328
               C 242 310, 252 292, 260 262
               C 236 284, 184 284, 160 262 Z"
            fill="#0D121A"
            opacity="0.92"
          />
          {/* Sombra del puente del hocico */}
          <path d="M 176 200 C 184 240, 196 280, 202 320" stroke="#05080C" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 244 200 C 236 240, 224 280, 218 320" stroke="#05080C" strokeWidth="3" fill="none" opacity="0.6" />

          {/* Nariz de lobo */}
          <path d="M 196 324 L 224 324 L 216 336 L 210 342 L 204 336 Z" fill="#020304" />
        </g>

        {/* Boca: cavidad estirada carmesí-negra con dientes humanos */}
        <g
          style={{
            transformOrigin: `${MOUTH_CX}px ${MOUTH_CY}px`,
            transform: `scale(${jawSx} ${jawSy})`,
          }}
        >
          {/* Cavidad */}
          <path
            d="M 152 336
               C 164 360, 188 371, 210 371
               C 232 371, 256 360, 268 336
               C 258 390, 232 400, 210 400
               C 188 400, 162 390, 152 336 Z"
            fill="url(#sd-mouth)"
          />

          {/* Dientes superiores individuales */}
          {UPPER_TEETH.map((t, i) => {
            const yt = lipTopY(t.x + t.w / 2);
            const shade = 0.55 + 0.45 * t.d;
            return (
              <path
                key={`u${i}`}
                d={`M ${t.x} ${yt}
                    C ${t.x + t.w * 0.25} ${yt - 1.5}, ${t.x + t.w * 0.75} ${yt - 1.5}, ${t.x + t.w} ${yt}
                    L ${t.x + t.w * 0.78} ${yt + t.h - 3}
                    C ${t.x + t.w * 0.6} ${yt + t.h + 1}, ${t.x + t.w * 0.4} ${yt + t.h + 1}, ${t.x + t.w * 0.22} ${yt + t.h - 3}
                    Z`}
                fill={`rgb(${Math.round(206 * shade)}, ${Math.round(200 * shade)}, ${Math.round(184 * shade)})`}
                transform={`rotate(${t.tilt} ${t.x + t.w / 2} ${yt})`}
              />
            );
          })}

          {/* Dientes inferiores escalonados */}
          {LOWER_TEETH.map((t, i) => {
            const yb = lowerLipY(t.x + t.w / 2);
            const shade = 0.42 + 0.42 * t.d;
            return (
              <path
                key={`l${i}`}
                d={`M ${t.x} ${yb}
                    C ${t.x + t.w * 0.25} ${yb + 1.5}, ${t.x + t.w * 0.75} ${yb + 1.5}, ${t.x + t.w} ${yb}
                    L ${t.x + t.w * 0.78} ${yb - t.h + 3}
                    C ${t.x + t.w * 0.6} ${yb - t.h - 1}, ${t.x + t.w * 0.4} ${yb - t.h - 1}, ${t.x + t.w * 0.22} ${yb - t.h + 3}
                    Z`}
                fill={`rgb(${Math.round(196 * shade)}, ${Math.round(190 * shade)}, ${Math.round(175 * shade)})`}
                transform={`rotate(${t.tilt} ${t.x + t.w / 2} ${yb})`}
              />
            );
          })}

          {/* Sheen tenue en los dientes superiores */}
          <path
            d="M 158 337 C 176 349, 244 349, 262 337"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            opacity="0.14"
          />
        </g>

        {/* Chiaroscuro rojizo del flash (variante flash) */}
        {variant === "flash" ? (
          <path
            d={HEAD_PATH}
            fill="url(#sd-rim)"
            style={{ mixBlendMode: "screen" }}
          />
        ) : null}
      </svg>
    </div>
  );
};

/**
 * fingerPath — dedo esbelto, cónico, con curvas Bézier suaves.
 */
const fingerPath = (x: number, len: number, bend: number, w = 7): string => {
  const tipY = 118 - len;
  const midY = 118 - len * 0.55;
  return [
    `M ${x - w} 120`,
    `C ${x - w - 2} ${midY + 6}, ${x - w * 0.5 + bend * 0.4} ${tipY + len * 0.35}, ${x + bend} ${tipY + 3}`,
    `C ${x + bend + 2} ${tipY - 1}, ${x + bend + 4} ${tipY - 2}, ${x + bend + 5} ${tipY + 1}`,
    `C ${x + w * 0.6 + bend * 0.5} ${tipY + len * 0.32}, ${x + w + bend * 0.3} ${midY + 6}, ${x + w} 120`,
    "Z",
  ].join(" ");
};

const FINGERS = [
  { x: 80, len: 92, bend: 3, curl: 16 },
  { x: 104, len: 100, bend: 1, curl: 13 },
  { x: 128, len: 88, bend: -1, curl: 8 },
  { x: 152, len: 72, bend: -3, curl: 4 },
];

/**
 * BeckoningHand — Mano pálida, esquelética y esbelta, de dedos cónicos
 * curvos (Bézier), que llama desde la oscuridad con un halo frío.
 */
export const BeckoningHand: React.FC<{
  width?: number;
  opacity?: number;
  curl?: number; // 0..1 — intensidad del gesto de llamada
  style?: React.CSSProperties;
}> = ({ width = 220, opacity = 0.5, curl = 0.4, style }) => {
  const frame = useCurrentFrame();

  const sway = Math.sin(frame * 0.06 + 1.1) * 3;
  const tremble = Math.sin(frame * 0.13 + 0.4) * 1.2;

  return (
    <div
      style={{
        position: "absolute",
        width,
        height: (width * 300) / 220,
        opacity,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 220 300"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <filter id="bh-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <linearGradient id="bh-fill" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#DCD8CE" />
            <stop offset="100%" stopColor="#B9B4A8" />
          </linearGradient>
        </defs>

        <g style={{ transform: `rotate(${sway}deg 110 150) translate(${tremble}px, 0)` }}>
          {/* Aura fría */}
          <ellipse cx="110" cy="160" rx="88" ry="118" fill="#9DB8D0" opacity="0.12" filter="url(#bh-blur)" />

          {/* Antebrazo esbelto */}
          <path
            d="M 78 202
               C 76 232, 74 268, 72 300
               L 152 300
               C 150 268, 150 238, 146 202 Z"
            fill="url(#bh-fill)"
            stroke="rgba(150,185,215,0.35)"
            strokeWidth="1"
          />

          {/* Palma estrecha */}
          <path
            d="M 88 122
               C 84 146, 80 172, 78 202
               C 84 212, 96 218, 110 219
               C 128 220, 140 214, 146 202
               C 148 172, 148 146, 152 122
               C 130 114, 104 112, 88 122 Z"
            fill="url(#bh-fill)"
            stroke="rgba(150,185,215,0.35)"
            strokeWidth="1"
          />

          {/* Dedos cónicos y curvos (índice → meñique) */}
          {FINGERS.map((f, i) => {
            const angle = -f.curl * curl + Math.sin(frame * 0.11 + i * 0.9) * 2.5;
            return (
              <g key={i} style={{ transform: `rotate(${angle}deg ${f.x} 118)` }}>
                <path
                  d={fingerPath(f.x, f.len, f.bend)}
                  fill="url(#bh-fill)"
                  stroke="rgba(150,185,215,0.3)"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}

          {/* Pulgar cónico */}
          <path
            d="M 86 128
               C 70 140, 56 150, 44 162
               C 40 166, 38 171, 39 176
               C 41 180, 45 182, 50 182
               C 64 180, 80 172, 92 160 Z"
            fill="url(#bh-fill)"
            stroke="rgba(150,185,215,0.3)"
            strokeWidth="0.8"
            transform={`rotate(${-10 - curl * 8} 84 150)`}
          />
        </g>
      </svg>
    </div>
  );
};

// ---- Close-up final: ojos almendrados horizontales depredadores + sonrisa humana ----

const CLOSE_LEFT_SOCKET =
  "M 165 232 C 215 178, 340 182, 404 252 C 344 304, 218 298, 165 232 Z";
const CLOSE_RIGHT_SOCKET =
  "M 735 232 C 685 178, 560 182, 496 252 C 556 304, 682 298, 735 232 Z";
const CLOSE_LEFT_EYE =
  "M 192 238 C 236 202, 330 206, 384 248 C 334 282, 240 278, 192 238 Z";
const CLOSE_RIGHT_EYE =
  "M 708 238 C 664 202, 570 206, 516 248 C 566 282, 660 278, 708 238 Z";

const CLOSE_UPPER_TEETH = [
  { x: 255, w: 22, h: 26, tilt: -6, d: 0.75 },
  { x: 290, w: 24, h: 30, tilt: -3, d: 0.9 },
  { x: 327, w: 24, h: 32, tilt: -1, d: 1 },
  { x: 365, w: 25, h: 33, tilt: 0, d: 1 },
  { x: 404, w: 24, h: 33, tilt: 0, d: 1 },
  { x: 443, w: 24, h: 32, tilt: 1, d: 1 },
  { x: 481, w: 24, h: 31, tilt: 2, d: 0.95 },
  { x: 518, w: 24, h: 29, tilt: 3, d: 0.85 },
  { x: 554, w: 23, h: 26, tilt: 6, d: 0.72 },
];

const CLOSE_LOWER_TEETH = [
  { x: 275, w: 20, h: 14, tilt: 7, d: 0.6 },
  { x: 311, w: 21, h: 16, tilt: 4, d: 0.68 },
  { x: 348, w: 21, h: 17, tilt: 1, d: 0.75 },
  { x: 386, w: 22, h: 17, tilt: 0, d: 0.78 },
  { x: 424, w: 22, h: 17, tilt: 0, d: 0.78 },
  { x: 462, w: 21, h: 16, tilt: -1, d: 0.75 },
  { x: 499, w: 21, h: 15, tilt: -4, d: 0.68 },
  { x: 535, w: 20, h: 14, tilt: -7, d: 0.6 },
];

const closeLipTopY = (cx: number): number => {
  const p = (cx - 450) / 225;
  return 470 + (1 - p * p) * 66;
};

const closeLowerLipY = (cx: number): number => {
  const p = (cx - 450) / 225;
  return 596 - (1 - p * p) * 18;
};

export const SmileDogCloseup: React.FC<{
  width?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ width = 760, opacity = 1, style }) => {
  const frame = useCurrentFrame();

  const breathe = 1 + Math.sin(frame * 0.08) * 0.012;
  // Sin parpadeo: mirada fija e incesante ("unblinking").
  const flicker = 0.9 + 0.1 * Math.max(0, Math.sin(frame * 0.53 + 2.1));

  return (
    <div
      style={{
        position: "absolute",
        width,
        height: (width * 620) / 900,
        opacity,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 900 620"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="sc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5C77C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F5C77C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sc-iris" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7FBFF" />
            <stop offset="55%" stopColor="#F5D9A0" />
            <stop offset="100%" stopColor="#D98F36" />
          </linearGradient>
          <linearGradient id="sc-mouth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C0607" />
            <stop offset="100%" stopColor="#060102" />
          </linearGradient>
          <filter id="sc-blur10" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="sc-blur26" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        <g style={{ transformOrigin: "450px 310px", transform: `scale(${breathe})` }}>
          {/* Aura ocular suave */}
          <g opacity={flicker}>
            <ellipse cx="290" cy="242" rx="155" ry="78" fill="url(#sc-glow)" filter="url(#sc-blur26)" />
            <ellipse cx="610" cy="242" rx="155" ry="78" fill="url(#sc-glow)" filter="url(#sc-blur26)" />
          </g>

          {/* Cuencas profundas sombreadas */}
          <path d={CLOSE_LEFT_SOCKET} fill="#020304" />
          <path d={CLOSE_RIGHT_SOCKET} fill="#020304" />

          {/* Ojos: almendrados horizontales depredadores, fijos, sin parpadear */}
          <g opacity={flicker}>
            <path d={CLOSE_LEFT_EYE} fill="url(#sc-iris)" />
            {/* Pupila puntiforme diminuta */}
            <circle cx="294" cy="243" r="8" fill="#080303" />
            {/* Halo carmesí interior */}
            <circle cx="294" cy="243" r="15" fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.7" />
            {/* Destello frío */}
            <circle cx="283" cy="233" r="4.5" fill="#FFFFFF" opacity="0.92" />
            {/* Sombra del párpado superior */}
            <ellipse cx="292" cy="212" rx="95" ry="20" fill="rgba(0,0,0,0.48)" />
          </g>
          <g opacity={flicker}>
            <path d={CLOSE_RIGHT_EYE} fill="url(#sc-iris)" />
            <circle cx="606" cy="243" r="8" fill="#080303" />
            <circle cx="606" cy="243" r="15" fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.7" />
            <circle cx="595" cy="233" r="4.5" fill="#FFFFFF" opacity="0.92" />
            <ellipse cx="608" cy="212" rx="95" ry="20" fill="rgba(0,0,0,0.48)" />
          </g>

          {/* Sonrisa humana imposible */}
          <g>
            {/* Resplandor pálido suave */}
            <path
              d="M 225 470 C 330 536, 570 536, 675 470"
              stroke="#F5C77C"
              strokeWidth="46"
              fill="none"
              opacity="0.22"
              filter="url(#sc-blur10)"
            />
            {/* Cavidad carmesí-negra */}
            <path
              d="M 225 474
                 C 330 546, 570 546, 675 474
                 C 660 600, 570 624, 450 624
                 C 330 624, 240 600, 225 474 Z"
              fill="url(#sc-mouth)"
            />
            {/* Dientes superiores individuales */}
            {CLOSE_UPPER_TEETH.map((t, i) => {
              const yt = closeLipTopY(t.x + t.w / 2);
              const shade = 0.55 + 0.45 * t.d;
              return (
                <path
                  key={`cu${i}`}
                  d={`M ${t.x} ${yt}
                      C ${t.x + t.w * 0.25} ${yt - 3}, ${t.x + t.w * 0.75} ${yt - 3}, ${t.x + t.w} ${yt}
                      L ${t.x + t.w * 0.78} ${yt + t.h - 6}
                      C ${t.x + t.w * 0.6} ${yt + t.h + 2}, ${t.x + t.w * 0.4} ${yt + t.h + 2}, ${t.x + t.w * 0.22} ${yt + t.h - 6}
                      Z`}
                  fill={`rgb(${Math.round(212 * shade)}, ${Math.round(205 * shade)}, ${Math.round(188 * shade)})`}
                  transform={`rotate(${t.tilt} ${t.x + t.w / 2} ${yt})`}
                />
              );
            })}
            {/* Dientes inferiores escalonados */}
            {CLOSE_LOWER_TEETH.map((t, i) => {
              const yb = closeLowerLipY(t.x + t.w / 2);
              const shade = 0.42 + 0.42 * t.d;
              return (
                <path
                  key={`cl${i}`}
                  d={`M ${t.x} ${yb}
                      C ${t.x + t.w * 0.25} ${yb + 3}, ${t.x + t.w * 0.75} ${yb + 3}, ${t.x + t.w} ${yb}
                      L ${t.x + t.w * 0.78} ${yb - t.h + 6}
                      C ${t.x + t.w * 0.6} ${yb - t.h - 2}, ${t.x + t.w * 0.4} ${yb - t.h - 2}, ${t.x + t.w * 0.22} ${yb - t.h + 6}
                      Z`}
                  fill={`rgb(${Math.round(196 * shade)}, ${Math.round(190 * shade)}, ${Math.round(175 * shade)})`}
                  transform={`rotate(${t.tilt} ${t.x + t.w / 2} ${yb})`}
                />
              );
            })}
            {/* Labio superior sombreado */}
            <path
              d="M 225 470 C 330 536, 570 536, 675 470"
              stroke="#24080A"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            {/* Labio inferior sombreado */}
            <path
              d="M 245 600 C 355 618, 545 618, 655 600"
              stroke="#1C0A0C"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Sheen tenue */}
            <path
              d="M 320 505 C 390 530, 510 530, 580 505"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              opacity="0.16"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
