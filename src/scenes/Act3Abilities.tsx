import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CharacterSilhouette } from "../components/CharacterSilhouette";
import { Flicker, IMPACT, MONO, Panel } from "../components/ui";

/**
 * Act3Abilities.tsx (frames 855-1386, local 0-531) — Slenderman centrado
 * debajo del panel superior con los 8 tentáculos abanicándose en la niebla.
 *
 * Local:  0.0– 5.1s  Silueta cercana + tentáculos en oleada
 *         5.1– 8.7s  HUD de distorsión de cámara (SEÑAL CORRUPTA)
 *         8.7–17.7s  Panel superior SLENDER SICKNESS: cuadrícula 2×2 de
 *                    síntomas que se iluminan al ser mencionados.
 */

const HUD_FROM = 153; // 5.1s
const HUD_TO = 261; // 8.7s
const PANEL_FROM = 261;

type Symptom = {
  label: string;
  start: number; // frame local en que se menciona
  end: number;
  color: string;
};

const SYMPTOMS: Symptom[] = [
  { label: "01. PARANOIA EXTREMA", start: 312, end: 356, color: "#DC2626" },
  { label: "02. PÉRDIDA DE MEMORIA", start: 356, end: 400, color: "#FDE047" },
  { label: "03. MAREOS", start: 400, end: 421, color: "#FDE047" },
  { label: "04. HEMORRAGIAS", start: 421, end: 445, color: "#DC2626" },
];

export const Act3Abilities: React.FC = () => {
  const frame = useCurrentFrame();

  const spread = interpolate(frame, [0, 150], [0.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charGlitch =
    0.05 +
    interpolate(frame, [HUD_FROM, HUD_FROM + 17, HUD_TO - 11, HUD_TO], [0, 0.35, 0.35, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const hudOpacity =
    interpolate(frame, [HUD_FROM, HUD_FROM + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    (1 -
      interpolate(frame, [HUD_TO - 12, HUD_TO], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }));

  const panelOpacity = interpolate(frame, [PANEL_FROM, PANEL_FROM + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Barras de estática (saltan cada 3 frames)
  const barSeed = Math.floor(frame / 3);
  const bars = Array.from({ length: 26 }, (_, i) => {
    const h = 10 + random(barSeed * 131 + i * 17) * 52;
    return { h, i };
  });

  return (
    <AbsoluteFill>
      <CharacterSilhouette
        scale={1.12}
        xOffset={0}
        yOffset={0}
        opacity={1}
        tentacleSpread={spread}
        glitchIntensity={charGlitch}
        rimColor="#2B3A42"
      />

      {/* ---- HUD de distorsión de cámara (5.1–8.7s) ---- */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 68,
          width: 830,
          opacity: hudOpacity,
        }}
      >
        <Panel
          style={{
            borderColor: "rgba(220,38,38,0.5)",
            background: "rgba(6,8,12,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "20px 26px",
          }}
        >
          <Flicker
            frame={frame}
            seed={5}
            style={{
              fontFamily: IMPACT,
              fontSize: 38,
              letterSpacing: "0.14em",
              color: "#DC2626",
              textShadow: "0 0 18px rgba(220,38,38,0.55), 0 2px 0 rgba(4,5,7,0.9)",
            }}
          >
            SEÑAL CORRUPTA
          </Flicker>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              letterSpacing: "0.26em",
              color: "rgba(242,239,233,0.8)",
            }}
          >
            // INTERFERENCIA ELECTROMAGNÉTICA
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 5,
              height: 60,
              width: 700,
            }}
          >
            {bars.map((b) => (
              <div
                key={b.i}
                style={{
                  flex: 1,
                  height: b.h,
                  background:
                    b.i % 3 === 0
                      ? "rgba(220,38,38,0.6)"
                      : b.i % 2
                        ? "rgba(34,211,238,0.55)"
                        : "rgba(242,239,233,0.35)",
                }}
              />
            ))}
          </div>
        </Panel>
      </div>

      {/* ---- Panel superior SLENDER SICKNESS: cuadrícula 2×2 ---- */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 68,
          width: 830,
          opacity: panelOpacity,
        }}
      >
        <Panel
          style={{
            background: "rgba(6,8,12,0.96)",
            borderColor: "rgba(220,38,38,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "18px 26px 16px",
          }}
        >
          <div
            style={{
              fontFamily: IMPACT,
              fontSize: 26,
              letterSpacing: "0.08em",
              color: "#DC2626",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 0 14px rgba(220,38,38,0.5), 0 2px 0 rgba(4,5,7,0.9)",
            }}
          >
            SÍNDROME: SLENDER SICKNESS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {SYMPTOMS.map((s, i) => {
              const active = frame >= s.start && frame < s.end;
              const pulse = Math.sin(frame * 0.16 + i * 1.4) * 0.5 + 0.5;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: `1px solid ${
                      active ? "rgba(220,38,38,0.7)" : "rgba(43,58,66,0.7)"
                    }`,
                    background: active
                      ? "rgba(26,12,14,0.9)"
                      : "rgba(10,14,19,0.9)",
                    boxShadow: active
                      ? `0 0 ${10 + pulse * 12}px rgba(220,38,38,${0.25 + pulse * 0.3})`
                      : "none",
                    opacity: active ? 1 : 0.35,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: active ? s.color : "rgba(127,29,29,0.8)",
                      boxShadow: active
                        ? `0 0 ${8 + pulse * 8}px ${s.color}`
                        : "none",
                      transform: `scale(${active ? 1 + pulse * 0.35 : 1})`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 22,
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                      color: active ? s.color : "rgba(242,239,233,0.9)",
                      textShadow: active
                        ? "0 0 12px rgba(220,38,38,0.5)"
                        : "0 1px 2px rgba(4,5,7,0.9)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 14,
              letterSpacing: "0.22em",
              color: "rgba(242,239,233,0.5)",
              textAlign: "center",
            }}
          >
            VÍCTIMAS DESAPARECEN SIN RASTRO
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
