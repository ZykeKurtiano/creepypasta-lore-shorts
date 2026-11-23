import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LightChildCharacter } from "../components/characters/LightChildCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";
import { ZalgoEntity } from "../components/characters/ZalgoEntity";
import { FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * ZalgoScene6Finale (frames 2589–2845, 86.30–94.83s) — Caos vs. Protección.
 *
 *  - background (parallax lento): choque cinematográfico de alto contraste —
 *    tormenta de rojo abisal y relámpagos negros a la izquierda (Zalgo) contra
 *    azul nocturno profundo y niebla fría a la derecha (Slenderman), con un
 *    destello cálido dorado de los Niños de Luz brillando protegido detrás de
 *    Slenderman.
 *  - midground: ZalgoEntity (mode="finale") a la izquierda y SlenderCharacter
 *    (mode="finale") a la derecha interponiéndose delante del destello dorado,
 *    con un pequeño Niño de Luz radiante resguardado detrás de su silueta.
 *  - Título cinético en Zona Segura (top 380) con entrada spring:
 *    "UN DIOS DEL CAOS  VS  EL GUARDIÁN EN LAS SOMBRAS" y "¿CAOS O PROTECCIÓN?".
 *  - foreground (parallax 1.2x): bruma oscura y partículas carmesí/doradas.
 *
 * Cámara: único micro-impacto breve (0–10, deep_boom.mp3) + push-in lento
 * monumental (1.0 → 1.06). Cero shake/zoom periódico.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Relámpago negro quebrado (arco fractal) con borde carmesí. */
const makeBolt = (seed: number, len: number): string => {
  const segs = 5 + (seed % 3);
  let d = "M 0 0";
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const y = (-len * t).toFixed(1);
    const jx = ((seed * 7 + i * 13) % 9) - 4;
    const x = (i % 2 === 0 ? jx * 0.5 : jx) * (t * 2.2);
    d += ` L ${x.toFixed(1)} ${y}`;
  }
  return d;
};

/** Relámpagos negros del flanco izquierdo (Zalgo). */
const BOLTS = Array.from({ length: 7 }, (_, i) => ({
  x: 60 + random(i * 5.3 + 2) * 420,
  y: 180 + random(i * 7.1 + 4) * 380,
  len: 200 + random(i * 3.7 + 6) * 260,
  d: makeBolt(i * 13 + 5, 200 + random(i * 3.7 + 6) * 260),
  phase: i * 1.7,
}));

/** Partículas carmesí/doradas flotando en los bordes inferiores (deterministas). */
const EMBERS = Array.from({ length: 30 }, (_, i) => ({
  x: random(i * 3.9 + 1) * 1080,
  y0: 1500 + random(i * 6.1 + 5) * 420,
  r: 1.6 + random(i * 5.7 + 3) * 3,
  speed: 0.2 + random(i * 9.3 + 4) * 0.4,
  phase: random(i * 13.1 + 5) * Math.PI * 2,
  gold: random(i * 17.7 + 2) > 0.5,
}));

export const ZalgoScene6Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Único micro-impacto puntual (0–10, deep_boom.mp3).
  const impact = clamp01(
    interpolate(frame, [0, 5, 10], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shakeX = Math.sin(frame * 2.2) * 11 * impact;
  const shakeY = Math.cos(frame * 1.8) * 8 * impact;

  // Push-in lento monumental (1.0 → 1.06).
  const pushIn = interpolate(frame, [0, 256], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = pushIn * (1 + impact * 0.02);

  // Entrada spring del título (tras el micro-impacto).
  const titlePop = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });
  const titleY = interpolate(titlePop, [0, 1], [26, 0]);
  const titleOpacity = clamp01(titlePop);

  // Parallax foreground.
  const fgDrift = Math.sin(frame * 0.01 + 1.1) * 18;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: micro-impacto + push-in */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ============ BACKGROUND (choque de alto contraste) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(90deg, #2A0609 0%, #14040A 34%, #040507 50%, #050A12 66%, #0A1620 100%)",
            }}
          />

          {/* Tormenta rojo abisal (izquierda, Zalgo) */}
          <div
            style={{
              position: "absolute",
              left: -200,
              top: -100,
              width: 760,
              height: 1300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(220,38,38,0.34) 0%, rgba(127,29,29,0.14) 45%, transparent 72%)",
              filter: "blur(10px)",
            }}
          />
          {/* Niebla fría (derecha, Slenderman) */}
          <div
            style={{
              position: "absolute",
              right: -220,
              top: 200,
              width: 820,
              height: 1300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(22,33,41,0.2) 45%, transparent 72%)",
              filter: "blur(12px)",
            }}
          />
          {/* Destello cálido dorado de los Niños de Luz (detrás de Slenderman) */}
          <div
            style={{
              position: "absolute",
              right: 60,
              top: 700,
              width: 520,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(253,224,71,0.5) 0%, rgba(245,158,11,0.22) 42%, transparent 70%)",
              filter: "blur(8px)",
              opacity: 0.85 + 0.15 * Math.sin(frame * 0.05),
            }}
          />

          {/* Relámpagos negros (izquierda) */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {BOLTS.map((b, i) => {
              const flicker = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.2 + b.phase));
              return (
                <g key={i} transform={`translate(${b.x} ${b.y})`} opacity={flicker}>
                  <path d={b.d} stroke="#050308" strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  <path d={b.d} stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinejoin="round" opacity="0.85" />
                </g>
              );
            })}
            {/* Nebulosa azul (derecha) */}
            <g opacity="0.5">
              <circle cx="830" cy="560" r="220" fill="none" stroke="#16324A" strokeWidth="2" opacity="0.4" />
              <circle cx="830" cy="560" r="150" fill="none" stroke="#22D3EE" strokeWidth="1.4" opacity="0.3" />
            </g>
          </svg>
        </div>

        {/* ============ MIDGROUND (Zalgo vs. Slenderman) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Zalgo monumental (flanco izquierdo) */}
          <div
            style={{
              position: "absolute",
              left: -90,
              top: 520,
              width: 640,
              height: 660,
            }}
          >
            <ZalgoEntity
              mode="finale"
              mouthsOpen={1.0}
              starPower={0.9}
              localFrame={frame}
              idPrefix="s6-zalgo"
            />
          </div>

          {/* Niño de Luz radiante resguardado detrás de Slenderman */}
          <div
            style={{
              position: "absolute",
              left: 720,
              top: 740,
              width: 220,
              height: 320,
            }}
          >
            <LightChildCharacter pose="sheltered" lightIntensity={1} localFrame={frame} idPrefix="s6-child" />
          </div>

          {/* Slenderman imponente (flanco derecho, bien enmarcado) */}
          <div
            style={{
              position: "absolute",
              left: 500,
              top: 600,
              width: 460,
              height: 660,
            }}
          >
            <SlenderCharacter mode="finale" controlIntensity={1} localFrame={frame} idPrefix="s6-slender" />
          </div>
        </div>

        {/* ============ FOREGROUND (parallax 1.2x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Bruma oscura inferior */}
          <div
            style={{
              position: "absolute",
              left: -420 + fgDrift,
              top: 1380,
              width: 1800,
              height: 560,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(10,12,16,0.75) 0%, transparent 72%)",
              filter: "blur(34px)",
              opacity: 0.6,
            }}
          />

          {/* Partículas carmesí/doradas en los bordes inferiores */}
          {EMBERS.map((e, i) => {
            const y = ((e.y0 - frame * e.speed) % 460 + 460) % 460 + 1460;
            const x = e.x + Math.sin(frame * 0.02 + e.phase) * 24;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: e.r,
                  height: e.r,
                  borderRadius: "50%",
                  background: e.gold ? "#FDE047" : "#DC2626",
                  opacity: 0.4 + 0.4 * Math.abs(Math.sin(frame * 0.04 + e.phase)),
                  boxShadow: e.gold ? "0 0 8px rgba(253,224,71,0.6)" : "0 0 8px rgba(220,38,38,0.6)",
                  filter: "blur(0.5px)",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ============ TÍTULO CINÉTICO (Zona Segura, top 380) ============ */}
      <SafeCentered top={380} zIndex={30}>
        <div
          style={{
            fontFamily: FONT_SANS,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {/* Subtítulo superior */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#FDE047",
              textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 18px rgba(253,224,71,0.35)",
              marginBottom: 18,
            }}
          >
            UN DIOS DEL CAOS&nbsp;&nbsp;VS&nbsp;&nbsp;EL GUARDIÁN EN LAS SOMBRAS
          </div>

          {/* Título principal */}
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.08 }}>
            <span
              style={{
                color: "#DC2626",
                textShadow: "0 0 30px rgba(220,38,38,0.7), 0 4px 18px rgba(0,0,0,0.9)",
              }}
            >
              ¿CAOS O{" "}
            </span>
            <span
              style={{
                color: "#F2EFE9",
                textShadow:
                  "0 0 24px rgba(253,224,71,0.35), 0 0 40px rgba(34,211,238,0.25), 0 4px 18px rgba(0,0,0,0.95)",
              }}
            >
              PROTECCIÓN?
            </span>
          </div>
        </div>
      </SafeCentered>

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.28) 0%, transparent 24%, transparent 62%, rgba(4,5,7,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
