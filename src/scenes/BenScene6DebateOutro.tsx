import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HEIGHT, WIDTH } from "../data/episodeConfig";
import { SafeCentered, FONT_SANS } from "../components/SafeZone";
import { BenSpiritCharacter } from "../components/characters/BenSpiritCharacter";
import { ElegyStatueCharacter } from "../components/characters/ElegyStatueCharacter";

/**
 * BenScene6DebateOutro — Escena 6: Cierre y Debate (global 2521–2754).
 *
 * Pantalla dividida diagonal de alto contraste:
 *  - Mitad izquierda: Entidad Digital (verde corrupto #22C55E sobre
 *    #040A06) con scanlines CRT, lluvia de código y ElegyStatueCharacter
 *    con glowEyes, flameIntensity 0.35 y leve levitación/glitcheo.
 *  - Mitad derecha: Espejo del Trauma (cian abisal #22D3EE sobre
 *    #04080F) con agua profunda, caustics, burbujas y BenSpiritCharacter
 *    (emergence 1, glitchOverlay 0) con gotas en suspensión.
 *  - Costura diagonal animada con energía eléctrica/agua.
 *  - Pregunta cinética centrada con SafeCentered (top 380): "¿FANTASMA
 *    O TRAUMA?" con entrada spring; abajo "COMENTA TU VERSIÓN" (top 540).
 *  - Cámara: push-in lento y solemne 1.0 → 1.06.
 *  - Últimos 18 frames (215–233): fundido suave a negro #040507.
 */

const CODE_CHARS = "01▓░#@&%$!?=+<>";

const hash01 = (n: number): number => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

export const BenScene6DebateOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cámara: push-in lento y solemne.
  const camScale = interpolate(frame, [0, 233], [1, 1.06], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Costura diagonal animada centrada (50/50 alrededor de x=540).
  const seamTop = 54 + Math.sin(frame * 0.05) * 1.4; // ~583px arriba
  const seamBottom = 46 + Math.sin(frame * 0.043 + 1.4) * 1.4; // ~497px abajo

  // Entrada spring de la pregunta (f 30).
  const qSpring = spring({ frame: frame - 30, fps, config: { damping: 200, mass: 0.6, stiffness: 120 } });
  const questionScale = 0.86 + 0.14 * Math.min(1, qSpring);
  const questionOpacity = interpolate(frame, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaOpacity = interpolate(frame, [56, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fundido final a negro (f 215–233).
  const fadeOut = interpolate(frame, [215, 233], [0, 1], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${camScale})`,
          transformOrigin: "50% 50%",
          overflow: "hidden",
        }}
      >
        {/* ==================== MITAD IZQUIERDA: ENTIDAD DIGITAL ==================== */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(0 0, ${seamTop}% 0, ${seamBottom}% 100%, 0 100%)`,
            backgroundColor: "#040A06",
          }}
        >
          {/* Scanlines CRT */}
          <AbsoluteFill
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(34,197,94,0.14) 0px, rgba(34,197,94,0.14) 1px, transparent 1px, transparent 3px)",
            }}
          />
          {/* Lluvia de código sutil */}
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            {Array.from({ length: 9 }, (_, c) =>
              Array.from({ length: 6 }, (_, r) => {
                const y = 1920 - ((frame * 2.6 + r * 420 + c * 173) % 2100);
                const ch = CODE_CHARS[Math.floor(hash01(c * 3.3 + r * 8.7 + Math.floor(frame / 4)) * CODE_CHARS.length)];
                return (
                  <text
                    key={`${c}-${r}`}
                    x={70 + c * 52}
                    y={y}
                    fontFamily="'Courier New', monospace"
                    fontSize="15"
                    fill="#22C55E"
                    opacity={Math.min(1, Math.max(0, (1920 - y) / 300)) * 0.4}
                  >
                    {ch}
                  </text>
                );
              })
            ).flat()}
          </svg>
          {/* Estatua con levitación y glitcheo paranormal */}
          <div
            style={{
              position: "absolute",
              left: 45,
              top: 630,
              width: 420,
              height: 712,
              transform: `translateY(${Math.sin(frame * 0.04) * 7}px)`,
            }}
          >
            <ElegyStatueCharacter
              uid="s6-es"
              width={420}
              rimColor="#22C55E"
              glowEyes
              eyeGlowColor="#22C55E"
              teleportGlitch={0.1 + 0.08 * Math.abs(Math.sin(frame * 0.4))}
              flameIntensity={0.35}
              style={{ left: 0, bottom: 0 }}
            />
          </div>
        </AbsoluteFill>

        {/* ==================== MITAD DERECHA: ESPEJO DEL TRAUMA ==================== */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(${seamTop}% 0, 100% 0, 100% 100%, ${seamBottom}% 100%)`,
            backgroundColor: "#04080F",
          }}
        >
          {/* Agua profunda con caustics y ondas volumétricas */}
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s6-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#061A2A" />
                <stop offset="100%" stopColor="#04080F" />
              </linearGradient>
              <radialGradient id="s6-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#s6-water)" />
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M 380 ${1400 + i * 130 + Math.sin(frame * 0.22 + i) * 8} C 540 ${1380 + i * 130 + Math.sin(frame * 0.26 + i * 2) * 10}, 700 ${1400 + i * 130 + Math.sin(frame * 0.19 + i * 3) * 8}, 860 ${1390 + i * 130 + Math.sin(frame * 0.24 + i * 1.4) * 8} L 860 ${1420 + i * 130} L 380 ${1430 + i * 130} Z`}
                fill="#0B2A3C"
                opacity="0.6"
              />
            ))}
            {/* Caustics */}
            {[0, 1, 2].map((i) => (
              <path
                key={`c${i}`}
                d={`M ${440 + i * 130} ${560 + i * 240 + Math.sin(frame * 0.3 + i) * 14} C ${490 + i * 130} ${540 + i * 240}, ${560 + i * 130} ${552 + i * 240}, ${610 + i * 130} ${540 + i * 240} C ${600 + i * 130} ${562 + i * 240}, ${540 + i * 130} ${572 + i * 240}, ${490 + i * 130} ${560 + i * 240} Z`}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="2"
                opacity="0.14"
              />
            ))}
            {/* Burbujas ascendentes */}
            {Array.from({ length: 8 }, (_, i) => {
              const t = ((frame * 1.5 + i * 71) % 300) / 300;
              const bx = 620 + i * 36 + Math.sin(frame * 0.06 + i) * 20;
              const by = 1850 - t * 1500;
              return (
                <circle
                  key={i}
                  cx={bx}
                  cy={by}
                  r={2.5 + (i % 3) * 1.6}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.4"
                  opacity={0.3 + 0.3 * Math.sin(t * Math.PI)}
                />
              );
            })}
            <ellipse cx="760" cy="760" rx="220" ry="180" fill="url(#s6-halo)" opacity={0.7 + 0.2 * Math.sin(frame * 0.25)} />
          </svg>
          {/* Ben en suspensión con gotas */}
          <div style={{ position: "absolute", left: 605, top: 640, width: 400, height: 691 }}>
            <BenSpiritCharacter
              uid="s6-ben"
              width={400}
              emergence={1}
              glitchOverlay={0}
              showWaterRipples={false}
              raiseHand
              floatAmplitude={7}
              style={{ left: 0, top: 0 }}
            />
          </div>
        </AbsoluteFill>

        {/* ============ COSTURA DIAGONAL CON ENERGÍA ELÉCTRICA/AGUA ============ */}
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <defs>
            <linearGradient id="s6-seam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="50%" stopColor="#E8F7EE" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <filter id="s6-seam-blur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <line
            x1={(seamTop / 100) * WIDTH}
            y1="0"
            x2={(seamBottom / 100) * WIDTH}
            y2="1920"
            stroke="url(#s6-seam)"
            strokeWidth="6"
            opacity="0.85"
            filter="url(#s6-seam-blur)"
          />
          <line
            x1={(seamTop / 100) * WIDTH}
            y1="0"
            x2={(seamBottom / 100) * WIDTH}
            y2="1920"
            stroke="#E8F7EE"
            strokeWidth="1.6"
            opacity="0.9"
          />
          {/* Chispas en la costura */}
          {Array.from({ length: 7 }, (_, i) => {
            const t = ((frame * 2.2 + i * 130) % 660) / 660;
            const sx = (seamTop + (seamBottom - seamTop) * t) / 100 * WIDTH + Math.sin(frame * 0.3 + i * 2.4) * 10;
            const sy = t * HEIGHT;
            return (
              <circle
                key={i}
                cx={sx}
                cy={sy}
                r={1.8 + (i % 2) * 1.4}
                fill={i % 2 === 0 ? "#22C55E" : "#22D3EE"}
                opacity={Math.sin(t * Math.PI) * 0.7}
                filter="url(#s6-seam-blur)"
              />
            );
          })}
        </svg>

        {/* ==================== PREGUNTA CINÉTICA CENTRADA ==================== */}
        <SafeCentered top={365} zIndex={10}>
          <div
            style={{
              position: "relative",
              opacity: questionOpacity,
              transform: `scale(${questionScale})`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 74,
                fontWeight: 800,
                letterSpacing: 3,
                lineHeight: 1.1,
                textShadow: "0 4px 26px rgba(0,0,0,0.9)",
              }}
            >
              <span style={{ color: "#F2EFE9" }}>¿</span>
              <span style={{ color: "#22C55E", textShadow: "0 0 26px rgba(34,197,94,0.55), 0 4px 26px rgba(0,0,0,0.9)" }}>
                FANTASMA
              </span>{" "}
              <span style={{ color: "#F2EFE9" }}>O</span>{" "}
              <span style={{ color: "#22D3EE", textShadow: "0 0 26px rgba(34,211,238,0.5), 0 4px 26px rgba(0,0,0,0.9)" }}>
                TRAUMA
              </span>
              <span style={{ color: "#DC2626", textShadow: "0 0 26px rgba(220,38,38,0.6), 0 4px 26px rgba(0,0,0,0.9)" }}>
                ?
              </span>
            </div>
            {/* Halo oscuro radial suave (sin tarjeta rígida) */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 90,
                transform: "translate(-50%, -50%)",
                width: 640,
                height: 320,
                background:
                  "radial-gradient(ellipse at center, rgba(4,5,7,0.62) 0%, rgba(4,5,7,0.3) 55%, rgba(4,5,7,0) 75%)",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
          </div>
        </SafeCentered>
        <SafeCentered top={555} zIndex={10}>
          <div
            style={{
              opacity: ctaOpacity,
              fontFamily: FONT_SANS,
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: 10,
              color: "#F2EFE9",
              textShadow: "0 3px 18px rgba(0,0,0,0.9)",
            }}
          >
            COMENTA TU VERSIÓN
          </div>
        </SafeCentered>
      </AbsoluteFill>

      {/* Fundido suave a negro profundo (f 215–233) */}
      <AbsoluteFill style={{ backgroundColor: "#040507", opacity: fadeOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
