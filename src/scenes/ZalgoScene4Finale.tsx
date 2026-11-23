import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";
import { ZalgoEntity } from "../components/characters/ZalgoEntity";
import { FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * ZalgoScene4Finale (frames 1427–1654, 47.57–55.13s) — Cierre y Debate.
 *
 * Alto contraste cinematográfico: carmesí profundo a la izquierda (Zalgo)
 * chocando contra azul abisal helado a la derecha (Slenderman) sobre vacío,
 * con grieta vertical de energía tenue en el centro. Impacto puntual único
 * (deep_boom.mp3) en localFrame 0–10, seguido de un push-in lento y tenso
 * (1.0 → 1.055) hasta el cierre. La pregunta cinética de altísimo contraste
 * corona el cara a cara.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Bruma + partículas carmesí/cian (deterministas). */
const MOTES = Array.from({ length: 28 }, (_, i) => ({
  side: random(i * 3.3 + 1) < 0.5 ? "l" : "r",
  y0: random(i * 7.7 + 3) * 1920,
  r: 1.4 + random(i * 5.1 + 9) * 2.6,
  speed: 0.4 + random(i * 9.3 + 5) * 0.9,
  phase: random(i * 13.7 + 7) * Math.PI * 2,
  op: 0.08 + random(i * 17.9 + 11) * 0.3,
}));

export const ZalgoScene4Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Impacto puntual único (deep_boom.mp3, 0–10).
  const impact = clamp01(
    interpolate(frame, [0, 4, 10], [1, 0.6, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shakeX = Math.sin(frame * 1.7) * 11 * impact;
  const shakeY = Math.cos(frame * 1.3) * 9 * impact;

  // Push-in lento y tenso (1.0 → 1.055).
  const push = interpolate(frame, [0, 227], [1.0, 1.055], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = push * (1 + impact * 0.03);

  // Entrada spring de la pregunta cinética.
  const enter = clamp01(
    spring({ frame, fps, config: { damping: 15, stiffness: 70, mass: 0.9 } })
  );

  // Pulso tenue de la grieta central.
  const crackPulse = 0.5 + 0.5 * Math.sin(frame * 0.03);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: impacto único + push-in lento */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ============ BACKGROUND (carmesí vs azul abisal) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(90deg, #140506 0%, #7F1D1D 34%, #040507 50%, #0A1929 66%, #04101C 100%)",
            }}
          />
          {/* Resplandores enfrentados */}
          <div
            style={{
              position: "absolute",
              left: -120,
              top: 400,
              width: 640,
              height: 900,
              background:
                "radial-gradient(ellipse at 60% 50%, rgba(220,38,38,0.30), transparent 65%)",
              filter: "blur(20px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -120,
              top: 400,
              width: 640,
              height: 900,
              background:
                "radial-gradient(ellipse at 40% 50%, rgba(34,211,238,0.22), transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          {/* Grieta vertical de energía tenue en el centro */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="z4-crack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0" />
                <stop offset="30%" stopColor="#F43F5E" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#7F1D1D" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 540 0 C 534 240, 548 440, 538 660 C 530 860, 550 1040, 540 1240 C 532 1440, 548 1660, 540 1920"
              stroke="url(#z4-crack)"
              strokeWidth="3"
              fill="none"
              opacity={0.6 + crackPulse * 0.4}
            />
            <path
              d="M 540 0 C 534 240, 548 440, 538 660"
              stroke="#F43F5E"
              strokeWidth="10"
              fill="none"
              opacity={0.18 + crackPulse * 0.1}
              filter="blur(6px)"
            />
          </svg>
        </div>

        {/* ============ MIDGROUND (entidades + pregunta) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Zalgo (flanco izquierdo, modo finale, ~1.45x más grande e imponente) */}
          <div style={{ position: "absolute", left: -110, top: 780, width: 696, height: 815 }}>
            <ZalgoEntity
              mode="finale"
              mouthsOpen={1.0}
              starPower={0.4}
              localFrame={frame}
              idPrefix="z4-zalgo"
            />
          </div>

          {/* Slenderman (flanco derecho, modo finale, ~1.45x más grande) */}
          <div style={{ position: "absolute", left: 595, top: 760, width: 667, height: 958 }}>
            <SlenderCharacter
              mode="finale"
              controlIntensity={1.0}
              localFrame={frame}
              idPrefix="z4-slender"
            />
          </div>

          {/* Pregunta cinética de altísimo contraste */}
          <SafeCentered top={380} zIndex={10} maxWidth={740}>
            <div
              style={{
                opacity: enter,
                transform: `scale(${0.92 + enter * 0.08})`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: 6,
                  color: "#FDE047",
                  textShadow: "0 3px 18px rgba(0,0,0,0.95)",
                }}
              >
                CAOS ABSOLUTO&nbsp;&nbsp;VS&nbsp;&nbsp;CONTROL FRÍO
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: FONT_SANS,
                  fontSize: 66,
                  fontWeight: 900,
                  lineHeight: 1.08,
                }}
              >
                <div
                  style={{
                    color: "#F2EFE9",
                    textShadow: "0 4px 26px rgba(0,0,0,0.95)",
                  }}
                >
                  ¿PODRÍA SLENDERMAN
                </div>
                <div
                  style={{
                    color: "#DC2626",
                    textShadow:
                      "0 0 30px rgba(220,38,38,0.65), 0 5px 20px rgba(0,0,0,0.98)",
                  }}
                >
                  DETENERLO?
                </div>
              </div>
            </div>
          </SafeCentered>
        </div>

        {/* ============ FOREGROUND (bruma + partículas) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Bruma oscura inferior y lateral */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 560,
              background:
                "linear-gradient(180deg, transparent 0%, rgba(4,5,7,0.55) 55%, rgba(2,3,5,0.9) 100%)",
            }}
          />
          {/* Partículas carmesí/cian flotando */}
          {MOTES.map((p, i) => {
            const y = ((p.y0 - frame * p.speed) % 2100 + 2100) % 2100 - 90;
            const x =
              p.side === "l"
                ? 60 + Math.sin(frame * 0.02 + p.phase) * 60
                : 1020 - Math.sin(frame * 0.02 + p.phase) * 60;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: p.r * 2,
                  height: p.r * 2,
                  borderRadius: p.r,
                  background: p.side === "l" ? "#DC2626" : "#22D3EE",
                  opacity: p.op,
                  boxShadow: p.side === "l" ? "0 0 6px rgba(220,38,38,0.6)" : "0 0 6px rgba(34,211,238,0.6)",
                }}
              />
            );
          })}
          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.88 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.88 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
