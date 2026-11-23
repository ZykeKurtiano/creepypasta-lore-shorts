import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES } from "../data/episodeConfig";

/**
 * SceneTransitions — 5 transiciones continuas de BEN Drowned (globales),
 * estilo Kurzgesagt oscuro. PROHIBIDO: apagones en negro seco o
 * destellos de flash fotográfico.
 *
 *  - scene2.start ( 590): Zoom-Through CRT — anillos de fósforo
 *    verde/cian + breve destello de tubo catódico (Escena 1 → 2).
 *  - scene3.start (1248): Inmersión Z-Dive + Divisor — velo de
 *    espuma/burbujas abisales despejado por el divisor deslizante
 *    (Escena 2 → 3).
 *  - scene4.start (1892): Spotlight → Divisor Arquitectónico — cierre
 *    de cono de luz oscuro + borde de pared barriendo (Escena 3 → 4).
 *  - scene5.start (2188): Zoom-Through Puerta del Baño — viñeta de
 *    marco de puerta abriéndose hacia la luz fría (Escena 4 → 5).
 *  - scene6.start (2521): Barrido Dividido Diagonal — línea diagonal
 *    luminosa verde/cian + ráfaga breve de estática y agua (Escena 5 → 6).
 */

const T2 = SCENES.scene2.start; // 590
const T3 = SCENES.scene3.start; // 1248
const T4 = SCENES.scene4.start; // 1892
const T5 = SCENES.scene5.start; // 2188
const T6 = SCENES.scene6.start; // 2521

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- T2: Zoom-Through CRT (anillos de fósforo + destello de tubo) ----
  const t2Active = frame >= T2 && frame <= T2 + 26;
  const ringEnv = t2Active
    ? interpolate(frame, [T2, T2 + 6, T2 + 22], [0, 0.85, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const tubeFlash = t2Active
    ? interpolate(frame, [T2, T2 + 4, T2 + 14], [0, 0.5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const t2Scan = t2Active
    ? interpolate(frame, [T2, T2 + 16], [0.32, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ---- T3: Z-Dive + Divisor (velo abisal despejado por el divisor) ----
  const t3Active = frame >= T3 && frame <= T3 + 26;
  const veilOp = t3Active
    ? interpolate(frame, [T3, T3 + 8, T3 + 22], [0.9, 0.5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const edgeX = interpolate(frame, [T3, T3 + 26], [-140, 1220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const edgeOp = t3Active
    ? interpolate(frame, [T3, T3 + 4, T3 + 18, T3 + 26], [0, 0.95, 0.5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ---- T4: Spotlight → Divisor (cierre de cono oscuro + borde de pared) ----
  const t4Active = frame >= T4 && frame <= T4 + 26;
  const darkClose = t4Active
    ? interpolate(frame, [T4, T4 + 14], [0, 0.78], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const wallX = interpolate(frame, [T4 + 2, T4 + 26], [1180, -180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wallOp = t4Active
    ? interpolate(frame, [T4 + 2, T4 + 8, T4 + 24], [0, 0.9, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ---- T5: Zoom-Through Puerta del Baño (marco abriéndose a la luz fría) ----
  const t5Active = frame >= T5 && frame <= T5 + 26;
  const frameThick = t5Active
    ? interpolate(frame, [T5, T5 + 20], [560, 60], {
        easing: (n: number) => 1 - Math.pow(1 - n, 3),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const coldLight = t5Active
    ? interpolate(frame, [T5, T5 + 8, T5 + 24], [0, 0.5, 0.12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ---- T6: Barrido Dividido Diagonal (línea luminosa + estática/agua) ----
  const t6Active = frame >= T6 && frame <= T6 + 22;
  const diagX = interpolate(frame, [T6, T6 + 22], [-1560, 1560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const diagOp = t6Active
    ? interpolate(frame, [T6, T6 + 4, T6 + 14, T6 + 22], [0, 1, 0.55, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const staticOp = t6Active
    ? interpolate(frame, [T6, T6 + 8, T6 + 18], [0, 0.45, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const waterBurst = t6Active
    ? interpolate(frame, [T6, T6 + 10], [0, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* ============ T2 (590): anillos de fósforo CRT + destello de tubo ============ */}
      {t2Active && (
        <AbsoluteFill>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            {[0, 1, 2].map((i) => {
              const r = interpolate(frame, [T2 + i * 4, T2 + 22 + i * 4], [50, 1500], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <circle
                  key={i}
                  cx="780"
                  cy="990"
                  r={r}
                  fill="none"
                  stroke={i % 2 === 0 ? "#22C55E" : "#22D3EE"}
                  strokeWidth={10 - i * 3}
                  opacity={ringEnv * (0.9 - i * 0.25)}
                />
              );
            })}
          </svg>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 780px 990px, rgba(34,197,94,0.9) 0%, rgba(34,211,238,0.4) 34%, rgba(4,5,7,0.9) 100%)",
              opacity: tubeFlash,
              mixBlendMode: "screen",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)",
              opacity: t2Scan,
            }}
          />
        </AbsoluteFill>
      )}

      {/* ============ T3 (1248): velo abisal + divisor deslizante ============ */}
      {t3Active && (
        <AbsoluteFill>
          <AbsoluteFill
            style={{
              background: "linear-gradient(180deg, #04121F 0%, #072B40 60%, #0A2434 100%)",
              opacity: veilOp,
            }}
          />
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" opacity={veilOp}>
            {Array.from({ length: 8 }, (_, i) => {
              const t = ((frame * 1.7 + i * 61) % 300) / 300;
              return (
                <circle
                  key={i}
                  cx={160 + i * 110 + Math.sin(frame * 0.05 + i) * 20}
                  cy={1900 - t * 2000}
                  r={2.5 + (i % 3) * 2}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.4"
                  opacity={0.3 + 0.3 * Math.sin(t * Math.PI)}
                />
              );
            })}
          </svg>
          {/* Borde del divisor con línea verde fósforo */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: edgeX,
              width: 5,
              background:
                "linear-gradient(180deg, transparent, rgba(34,197,94,0.95) 20%, rgba(34,197,94,0.95) 80%, transparent)",
              boxShadow: "0 0 26px rgba(34,197,94,0.85)",
              opacity: edgeOp,
            }}
          />
        </AbsoluteFill>
      )}

      {/* ============ T4 (1892): cierre de cono oscuro + borde de pared ============ */}
      {t4Active && (
        <AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: "#040507", opacity: darkClose }} />
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            <defs>
              <linearGradient id="st-wall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#13161A" />
                <stop offset="70%" stopColor="#0B0D10" />
                <stop offset="100%" stopColor="#06080A" />
              </linearGradient>
            </defs>
            <g opacity={wallOp}>
              <polygon
                points={`${wallX},0 ${wallX + 26},-20 ${wallX - 12},420 ${wallX + 20},900 ${wallX - 10},1400 ${wallX + 18},1750 ${wallX - 8},1920 1080,1920 1080,0`}
                fill="url(#st-wall)"
              />
              <path
                d={`M ${wallX} 0 L ${wallX + 26} -20 L ${wallX - 12} 420 L ${wallX + 20} 900 L ${wallX - 10} 1400 L ${wallX + 18} 1750 L ${wallX - 8} 1920`}
                stroke="#23282F"
                strokeWidth="3"
                fill="none"
                opacity="0.9"
              />
            </g>
          </svg>
        </AbsoluteFill>
      )}

      {/* ============ T5 (2188): marco de puerta abriéndose a la luz fría ============ */}
      {t5Active && (
        <AbsoluteFill>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 540px 850px, rgba(191,217,236,0.85) 0%, rgba(127,168,200,0.4) 34%, rgba(4,7,10,0.95) 100%)",
              opacity: coldLight,
            }}
          />
          <svg viewBox="0 0 1080 1920" width="100%" height="100%">
            <g>
              <rect x="0" y="0" width="1080" height={frameThick} fill="#040507" />
              <rect x="0" y={1920 - frameThick} width="1080" height={frameThick} fill="#040507" />
              <rect x="0" y="0" width={frameThick} height="1920" fill="#040507" />
              <rect x={1080 - frameThick} y="0" width={frameThick} height="1920" fill="#040507" />
              {/* Borde interior del marco */}
              <rect x={frameThick - 14} y={frameThick - 14} width={1080 - 2 * frameThick + 28} height={1920 - 2 * frameThick + 28} fill="none" stroke="#8FB2CC" strokeWidth="3" opacity="0.7" />
            </g>
          </svg>
        </AbsoluteFill>
      )}

      {/* ============ T6 (2521): barrido dividido diagonal + estática/agua ============ */}
      {t6Active && (
        <AbsoluteFill>
          {/* Línea diagonal luminosa verde/cian */}
          <div
            style={{
              position: "absolute",
              top: -400,
              left: diagX,
              width: 10,
              height: 2720,
              transform: "rotate(24deg)",
              background:
                "linear-gradient(180deg, transparent, #22C55E 22%, #E8F7EE 50%, #22D3EE 78%, transparent)",
              boxShadow: "0 0 40px rgba(34,197,94,0.9)",
              opacity: diagOp,
            }}
          />
          {/* Ráfaga breve de estática */}
          <AbsoluteFill
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(34,197,94,0.5) 0px, rgba(34,197,94,0.5) 1px, transparent 1px, transparent 4px)",
              opacity: staticOp * 0.6,
            }}
          />
          {/* Ráfaga de agua abisal */}
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 50% 78%, rgba(34,211,238,0.55) 0%, rgba(7,43,64,0.5) 34%, transparent 70%)",
              opacity: waterBurst,
              mixBlendMode: "screen",
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
