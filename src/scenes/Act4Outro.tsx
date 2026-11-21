import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CharacterSilhouette } from "../components/CharacterSilhouette";
import { IMPACT, MONO, Panel } from "../components/ui";

/**
 * Act4Outro.tsx (frames 1386-1643, local 0-257) —
 * 46.2–49.8s: Glitch intenso de pantalla — Slenderman en primer plano
 *             de alto contraste con fuerte aberración cromática RGB.
 * 49.8–54.77s: Slenderman se desvanece en la niebla mientras sube la
 *             tarjeta CTA dentro de la zona segura (y: 480-1060, x: 72-896)
 *             y se mantiene durante los 45 frames de cierre atmosférico.
 */

const FADE_FROM = 108; // 3.6s
const CTA_FROM = 108;
const CTA_TO = 146;

export const Act4Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Fase 1: glitch de primer plano
  const closeGlitch =
    0.6 + 0.25 * Math.abs(Math.sin(frame * 0.8)) * (frame < FADE_FROM ? 1 : 0);

  // Fase 2: retroceso hacia la niebla (opacidad 0.25 antes de frame 1545)
  const retreat = interpolate(frame, [FADE_FROM, 146], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charScale = 1.55 - retreat * 0.27;
  const charOpacity = 1 - retreat * 0.75;
  const charY = retreat * 60;

  // Tarjeta CTA
  const ctaOpacity = interpolate(frame, [CTA_FROM, CTA_FROM + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = (1 - interpolate(frame, [CTA_FROM, CTA_TO], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })) * 90;
  const ctaBreathe = 1 + Math.sin(frame * 0.06) * 0.006;

  return (
    <AbsoluteFill>
      {/* Destello rojo inicial del glitch */}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 10, 40], [0.35, 0.12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background:
            "radial-gradient(ellipse 100% 70% at 50% 45%, transparent 35%, rgba(127,29,29,0.85) 100%)",
        }}
      />

      <CharacterSilhouette
        scale={charScale}
        xOffset={0}
        yOffset={charY}
        opacity={charOpacity}
        tentacleSpread={0.95}
        glitchIntensity={closeGlitch}
        rimColor="#F2EFE9"
      />

      {/* ---- Tarjeta CTA de cierre ---- */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 480,
          width: 824,
          height: 580,
          display: "flex",
          justifyContent: "center",
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px) scale(${ctaBreathe.toFixed(4)})`,
        }}
      >
        <Panel
          style={{
            alignSelf: "center",
            background: "rgba(5,7,10,0.88)",
            border: "1px solid rgba(220,38,38,0.4)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.7), 0 0 44px rgba(220,38,38,0.22), inset 0 0 40px rgba(22,33,41,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 34,
            padding: "40px 48px",
          }}
        >
          <div
            style={{
              fontFamily: IMPACT,
              fontSize: 54,
              lineHeight: 1.12,
              letterSpacing: "0.05em",
              color: "#F2EFE9",
              textAlign: "center",
              textShadow: "0 3px 0 rgba(4,5,7,0.95), 0 0 22px rgba(4,5,7,0.9)",
            }}
          >
            ¿QUÉ CREEPYPASTA
          </div>
          <div
            style={{
              fontFamily: IMPACT,
              fontSize: 54,
              lineHeight: 1.12,
              letterSpacing: "0.05em",
              color: "#FDE047",
              textAlign: "center",
              marginTop: -18,
              textShadow:
                "0 3px 0 rgba(4,5,7,0.95), 0 0 24px rgba(253,224,71,0.35)",
            }}
          >
            INVESTIGAMOS DESPUÉS?
          </div>

          <div
            style={{
              width: 140,
              height: 5,
              background: "#DC2626",
              boxShadow: "0 0 18px rgba(220,38,38,0.8)",
            }}
          />

          <div
            style={{
              fontFamily: MONO,
              fontSize: 24,
              letterSpacing: "0.14em",
              color: "#F2EFE9",
              background: "rgba(127,29,29,0.55)",
              border: "2px solid rgba(220,38,38,0.9)",
              borderRadius: 999,
              padding: "18px 46px",
              textShadow: "0 1px 3px rgba(4,5,7,0.9)",
              boxShadow: "0 0 26px rgba(220,38,38,0.35)",
            }}
          >
            DEJA TU COMENTARIO ABAJO
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
