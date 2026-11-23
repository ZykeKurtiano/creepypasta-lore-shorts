import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ProxyHumanCharacter } from "../components/characters/ProxyHumanCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";
import { ZalgoEntity } from "../components/characters/ZalgoEntity";

/**
 * ZalgoScene3War (frames 1080–1427, 36.00–47.57s) — Zalgo vs. Slenderman.
 *
 * Escenario dividido dinámicamente (split-screen diagonal viviente): mitad
 * izquierda en tormenta cósmica carmesí/ceniza (caos de Zalgo), mitad derecha
 * en bosque abisal frío azul-acero (control de Slenderman), separados por una
 * fractura energética diagonal que oscila según el forcejeo (tugBalance).
 * El proxy humano atrapado en medio lucha entre ambas fuerzas, con zarcillos
 * carmesí y tentáculos fríos conectados a sus muñecas/hombros. Cámara pan
 * lateral suave (cero shake periódico) y colapso diagonal de salida.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Cenizas carmesí de la tormenta de Zalgo (deterministas). */
const CINDERS = Array.from({ length: 26 }, (_, i) => ({
  x: random(i * 5.3 + 1) * 520,
  y0: random(i * 7.9 + 3) * 1920,
  r: 1.6 + random(i * 3.7 + 9) * 2.6,
  speed: 0.5 + random(i * 9.1 + 4) * 1.1,
  drift: 20 + random(i * 11.7 + 6) * 60,
  phase: random(i * 13.3 + 5) * Math.PI * 2,
  op: 0.1 + random(i * 17.1 + 8) * 0.34,
}));

/** Destellos cian del bosque de Slenderman. */
const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  x: 620 + random(i * 3.3 + 2) * 460,
  y0: random(i * 5.7 + 7) * 1920,
  r: 1.2 + random(i * 7.1 + 11) * 1.8,
  speed: 0.35 + random(i * 9.7 + 13) * 0.8,
  phase: random(i * 13.9 + 17) * Math.PI * 2,
  op: 0.08 + random(i * 15.1 + 19) * 0.26,
}));

export const ZalgoScene3War: React.FC = () => {
  const frame = useCurrentFrame();

  // Forcejeo: tugBalance oscila suavemente entre caos carmesí y control frío.
  const tugBalance = clamp01(
    Math.sin(frame * 0.055) * 0.74 + Math.sin(frame * 0.023 + 1.3) * 0.26
  ) * 2 - 1;

  const attack = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(frame * 0.04 + 0.5));
  const control = 0.35 + 0.45 * (0.5 + 0.5 * Math.cos(frame * 0.037 + 0.8));

  // Pan lateral suave (única intención de cámara).
  const panX = Math.sin(frame * 0.01) * 16;

  // Revelado de entrada (termina de salir el foreground wipe, 0–14).
  const reveal = 1 - clamp01(
    interpolate(frame, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Fractura diagonal que oscila con el forcejeo.
  const rawTopX = 540 + tugBalance * 66;
  const rawBottomX = 540 - tugBalance * 66;

  // Colapso diagonal de salida (329–347).
  const collapse = clamp01(
    interpolate(frame, [329, 347], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const topX = interpolate(collapse, [0, 1], [rawTopX, 540]);
  const bottomX = interpolate(collapse, [0, 1], [rawBottomX, 540]);

  // Destello de colisión carmesí/cian al cerrarse (centrado).
  const collisionFlash = clamp01(
    interpolate(frame, [334, 341, 347], [0, 1, 0.6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const leftPoly = `0,0 ${topX},0 ${bottomX},1920 0,1920`;
  const rightPoly = `${topX},0 1080,0 1080,1920 ${bottomX},1920`;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: pan lateral suave */}
      <AbsoluteFill
        style={{
          transform: `translateX(${panX}px)`,
        }}
      >
        {/* ============ BACKGROUND (split-screen diagonal) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <clipPath id="z3-left">
                <polygon points={leftPoly} />
              </clipPath>
              <clipPath id="z3-right">
                <polygon points={rightPoly} />
              </clipPath>
              <linearGradient id="z3-storm" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="#2A0506" />
                <stop offset="50%" stopColor="#140308" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <linearGradient id="z3-forest" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#0A1929" />
                <stop offset="55%" stopColor="#0A1014" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <linearGradient id="z3-fracture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Mitad izquierda: tormenta cósmica carmesí/ceniza (Zalgo) */}
            <g clipPath="url(#z3-left)">
              <rect x="0" y="0" width="1080" height="1920" fill="url(#z3-storm)" />
              {/* Torbellino carmesí */}
              <g fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.35">
                <path d="M 540 700 C 240 720, 80 960, 160 1240 C 240 1500, 480 1560, 640 1480" />
                <path d="M 540 700 C 700 620, 820 560, 900 460 C 960 380, 940 300, 860 260" opacity="0.5" />
                <path d="M 540 700 C 360 620, 220 580, 120 620" opacity="0.4" />
              </g>
              {/* Cenizas carmesí */}
              {CINDERS.map((p, i) => {
                const y = ((p.y0 - frame * p.speed) % 2100 + 2100) % 2100 - 100;
                const x = p.x + Math.sin(frame * 0.02 + p.phase) * p.drift;
                return (
                  <circle key={i} cx={x} cy={y} r={p.r} fill="#DC2626" opacity={p.op} />
                );
              })}
              {/* Resplandor del caos */}
              <ellipse cx="280" cy="980" rx="360" ry="520" fill="#7F1D1D" opacity="0.18" filter="blur(30px)" />
            </g>

            {/* Mitad derecha: bosque abisal frío azul-acero (Slenderman) */}
            <g clipPath="url(#z3-right)">
              <rect x="0" y="0" width="1080" height="1920" fill="url(#z3-forest)" />
              {/* Árboles esbeltos fríos */}
              <g fill="#0A141C">
                {[0, 1, 2, 3, 4].map((k) => {
                  const x = 700 + k * 92;
                  const h = 720 + (k % 2) * 160;
                  return (
                    <g key={k}>
                      <rect x={x - 7} y={1920 - h} width={14} height={h} />
                      <path
                        d={`M ${x} ${1920 - h} C ${x - 40} ${1920 - h + 90}, ${x + 40} ${1920 - h + 150}, ${x} ${1920 - h + 240}`}
                        fill="none"
                        stroke="#0E1A24"
                        strokeWidth="6"
                      />
                    </g>
                  );
                })}
              </g>
              {/* Destellos cian */}
              {SPARKS.map((p, i) => {
                const y = ((p.y0 - frame * p.speed) % 2100 + 2100) % 2100 - 100;
                const x = p.x + Math.sin(frame * 0.018 + p.phase) * 34;
                return (
                  <circle key={i} cx={x} cy={y} r={p.r} fill="#22D3EE" opacity={p.op} />
                );
              })}
              {/* Resplandor del control frío */}
              <ellipse cx="820" cy="1000" rx="340" ry="520" fill="#0A1929" opacity="0.5" filter="blur(28px)" />
            </g>

            {/* Fractura energética diagonal */}
            <line x1={topX} y1="0" x2={bottomX} y2="1920" stroke="url(#z3-fracture)" strokeWidth="5" />
            <line x1={topX} y1="0" x2={bottomX} y2="1920" stroke="#F43F5E" strokeWidth="14" opacity="0.25" filter="blur(6px)" />
          </svg>
        </div>

        {/* ============ MIDGROUND (personajes articulados) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Zalgo (izquierda, caos carmesí, grande y dominante) */}
          <div style={{ position: "absolute", left: -60, top: 470, width: 560, height: 655 }}>
            <ZalgoEntity
              mode="battle"
              mouthsOpen={0.9}
              attackIntensity={attack}
              localFrame={frame}
              idPrefix="z3-zalgo"
            />
          </div>

          {/* Slenderman (derecha, control frío, alto y elegante) */}
          <div style={{ position: "absolute", left: 640, top: 330, width: 520, height: 747 }}>
            <SlenderCharacter
              mode="battle"
              controlIntensity={control}
              localFrame={frame}
              idPrefix="z3-slender"
            />
          </div>

          {/* Proxy humano atrapado en medio */}
          <div style={{ position: "absolute", left: 260, top: 300, width: 560, height: 760 }}>
            <ProxyHumanCharacter
              tugBalance={tugBalance}
              corruptionLevel={0.6}
              localFrame={frame}
              idPrefix="z3-proxy"
            />
          </div>

          {/* Forcejeo continuo: zarcillos carmesí (Zalgo→brazo izq) + tentáculos (Slender→brazo der) */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* Zarcillos carmesí gruesos: Zalgo (derecha de su cuerpo) → brazo izquierdo del proxy */}
            <g fill="none" strokeLinecap="round">
              <path d="M 470 608 C 420 590, 360 605, 310 632" stroke="#3A0A0C" strokeWidth="18" opacity="0.9" />
              <path d="M 478 620 C 420 620, 355 628, 300 645" stroke="#3A0A0C" strokeWidth="14" opacity="0.85" />
              <path d="M 488 635 C 430 645, 360 652, 305 662" stroke="#3A0A0C" strokeWidth="12" opacity="0.8" />
              <path d="M 470 608 C 420 590, 360 605, 310 632" stroke="#DC2626" strokeWidth="7" opacity="0.9" />
              <path d="M 478 620 C 420 620, 355 628, 300 645" stroke="#DC2626" strokeWidth="5" opacity="0.8" />
              <path d="M 488 635 C 430 645, 360 652, 305 662" stroke="#F43F5E" strokeWidth="4" opacity="0.7" />
            </g>
            {/* Tentáculos negros con rim cian: Slender → brazo derecho del proxy */}
            <g fill="none" strokeLinecap="round">
              <path d="M 598 600 C 650 585, 705 600, 762 630" stroke="#04070B" strokeWidth="18" opacity="0.92" />
              <path d="M 588 618 C 645 620, 705 630, 770 645" stroke="#04070B" strokeWidth="14" opacity="0.88" />
              <path d="M 600 638 C 655 650, 710 655, 772 662" stroke="#04070B" strokeWidth="12" opacity="0.82" />
              <path d="M 598 600 C 650 585, 705 600, 762 630" stroke="#22D3EE" strokeWidth="2.6" opacity="0.6" />
              <path d="M 588 618 C 645 620, 705 630, 770 645" stroke="#22D3EE" strokeWidth="2.2" opacity="0.5" />
              <path d="M 600 638 C 655 650, 710 655, 772 662" stroke="#22D3EE" strokeWidth="1.8" opacity="0.45" />
            </g>
          </svg>
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Zarcillos carmesí desenfocados (borde izquierdo) */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <g filter="blur(7px)" fill="none" strokeLinecap="round">
              <path d="M -30 300 C 60 420, 40 640, 90 860 C 130 1020, 90 1240, 140 1460" stroke="#7F1D1D" strokeWidth="26" opacity="0.85" />
              <path d="M -30 420 C 80 560, 50 800, 120 1080" stroke="#DC2626" strokeWidth="12" opacity="0.7" />
            </g>
            {/* Tentáculos oscuros desenfocados (borde derecho) */}
            <g filter="blur(7px)" fill="none" strokeLinecap="round">
              <path d="M 1110 360 C 1000 500, 1030 720, 980 940 C 940 1120, 990 1320, 950 1540" stroke="#04070B" strokeWidth="26" opacity="0.85" />
              <path d="M 1110 520 C 980 660, 1020 880, 960 1120" stroke="#9DB8D0" strokeWidth="10" opacity="0.55" />
            </g>
            {/* Chispas carmesí vs destellos cian cruzados */}
            {[0, 1, 2, 3].map((k) => {
              const y = (frame * 7 + k * 480) % 1920;
              const x = 220 + k * 220 + Math.sin(frame * 0.05 + k) * 30;
              return (
                <circle key={`c-${k}`} cx={x} cy={y} r={3} fill="#DC2626" opacity={0.5} filter="blur(2px)" />
              );
            })}
            {[0, 1, 2].map((k) => {
              const y = (frame * 5 + k * 640 + 320) % 1920;
              const x = 840 - k * 200;
              return (
                <circle key={`s-${k}`} cx={x} cy={y} r={2.5} fill="#22D3EE" opacity={0.5} filter="blur(2px)" />
              );
            })}
          </svg>

          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -90, width: 160, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -90, width: 160, background: "#020306", filter: "blur(12px)", opacity: 0.9 }} />
        </div>
      </AbsoluteFill>

      {/* Colapso diagonal de salida: destello de colisión carmesí/cian */}
      {collisionFlash > 0.004 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 520,
              width: 40,
              background:
                "linear-gradient(90deg, rgba(220,38,38,0.85), rgba(34,211,238,0.85))",
              filter: "blur(8px)",
              opacity: collisionFlash,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.18), transparent 55%)",
              opacity: collisionFlash * 0.7,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Revelado de entrada (el foreground wipe termina de salir a la izquierda) */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, transparent 20%, rgba(2,3,5,0.92) 80%)",
          opacity: reveal,
        }}
      />
    </AbsoluteFill>
  );
};
