import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  DustSporesLayer,
  ForegroundVignette,
  MistLayer,
} from "../components/Atmosphere25D";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";
import { SCENES } from "../data/episodeConfig";

/**
 * JeffScene3Retakes (frames 896–1296, duración 400 frames, 29.87–43.20s)
 * Retakes modernos — Realismo y drama médico.
 *
 * Capas 2.5D reales:
 *  1. Fondo: public/art/bg_dark_bedroom.png (avance lento en eje Z)
 *  2. Neblina lunar fría avanzando a velocidad intermedia
 *  3. Personaje recortado: public/art/char_jeff_shadow.png acechando en la
 *     penumbra del dormitorio (avance más pronunciado en eje Z para paralaje real)
 *  4. Partículas de polvo en la luz de luna
 *  5. Ficha clínica / expediente translúcido dentro de zona segura:
 *     "Retakes Modernos · Realismo & Origen Clínico"
 *  6. Viñeta frontal
 *
 * Movimiento de cámara único: avance progresivo lento en eje Z (cero shake/zoom periódicos).
 */

const SCENE_LEN = SCENES.scene3.end - SCENES.scene3.start;

export const JeffScene3Retakes: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Avance progresivo lento en eje Z en capas diferenciadas (profundidad 2.5D)
  const bgScale = interpolate(progress, [0, 1], [1.0, 1.08], {
    easing: Easing.out(Easing.quad),
  });
  const mistScale = interpolate(progress, [0, 1], [1.0, 1.14]);
  const charScale = interpolate(progress, [0, 1], [0.88, 1.11], {
    easing: Easing.inOut(Easing.sin),
  });

  // Silueta acechando en penumbra: emerge desde la oscuridad del dormitorio
  const charOpacity = interpolate(frame, [0, 40, 160], [0.4, 0.84, 0.98], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charBreathY = Math.sin(frame * 0.028) * 4.5;
  const charDriftX = interpolate(progress, [0, 1], [-18, 12]);

  // Transición interna del expediente: realismo (acosadores) → drama médico (~local frame 245 = 38.0s)
  const medicalProg = interpolate(frame, [235, 265], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardIn = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* 1. Fondo 9:16 dormitorio nocturno en penumbra (avance Z suave) */}
      <AbsoluteFill
        style={{
          transform: `scale(${bgScale})`,
          transformOrigin: "50% 44%",
        }}
      >
        <Img
          src={staticFile("art/bg_dark_bedroom.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.86) contrast(1.1) saturate(0.85)",
          }}
        />
      </AbsoluteFill>

      {/* Haz de luz de luna fría atravesando las cortinas */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 190,
          width: 700,
          height: 1120,
          background:
            "radial-gradient(ellipse at 48% 26%, rgba(186, 214, 236, 0.18) 0%, rgba(110, 148, 178, 0.06) 46%, transparent 72%)",
          transform: `scale(${mistScale})`,
          pointerEvents: "none",
        }}
      />

      {/* 2. Neblina lunar intermedia */}
      <AbsoluteFill style={{ transform: `scale(${mistScale})`, pointerEvents: "none" }}>
        <MistLayer
          tint="rgba(162, 194, 218, 0.13)"
          opacity={0.9}
          speed={0.35}
          yOffset={100}
          seed={33}
        />
      </AbsoluteFill>

      {/* 3. Silueta acechando en la penumbra del dormitorio (mayor avance en Z) */}
      <div
        style={{
          position: "absolute",
          top: 550,
          left: 205,
          width: 670,
          height: 860,
          opacity: charOpacity,
          transform: `translate(${charDriftX}px, ${charBreathY}px) scale(${charScale})`,
          transformOrigin: "50% 45%",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
        }}
      >
        <Img
          src={staticFile("art/char_jeff_shadow.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter:
              "brightness(0.72) contrast(1.24) saturate(0.62) drop-shadow(0 28px 50px rgba(0,0,0,0.96)) drop-shadow(0 -6px 24px rgba(180, 212, 235, 0.22))",
          }}
        />
      </div>

      {/* 4. Polvo flotando en el haz de luna */}
      <DustSporesLayer
        count={26}
        color="#DCEAF5"
        seed={41}
        opacity={0.72}
        minY={260}
        maxY={1460}
      />

      {/* 5. Viñeta frontal profunda */}
      <ForegroundVignette
        edgeStrength={0.82}
        topDarkness={0.62}
        bottomDarkness={0.9}
      />

      {/* 6. Ficha clínica / expediente translúcido dentro de zona segura (top 356) */}
      <SafeCentered top={356} zIndex={10}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 710,
            padding: "18px 26px",
            borderRadius: 14,
            background: "rgba(9, 14, 20, 0.74)",
            border: "1px solid rgba(186, 214, 235, 0.24)",
            boxShadow:
              "0 18px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)",
            opacity: cardIn,
          }}
        >
          {/* Cabecera clínica */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: FONT_MONO,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 2.4,
              color: "#F87171",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(220, 38, 38, 0.18)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
              }}
            >
              ✚ EXPEDIENTE
            </span>
            <span style={{ color: "rgba(186, 214, 235, 0.75)" }}>
              CASE-FILE // REVISIÓN MODERNA
            </span>
          </div>

          {/* Título principal solicitado */}
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_SANS,
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#F2EFE9",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            Retakes Modernos · Realismo &amp; Origen Clínico
          </div>

          {/* Indicador de sub-enfoque sincronizado con el guion */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(186, 214, 235, 0.15)",
              display: "flex",
              justifyContent: "center",
              gap: 16,
              fontFamily: FONT_MONO,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background:
                  medicalProg < 0.5
                    ? "rgba(220, 38, 38, 0.22)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  medicalProg < 0.5
                    ? "1px solid rgba(220, 38, 38, 0.55)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                color: medicalProg < 0.5 ? "#F2EFE9" : "rgba(186, 214, 235, 0.55)",
              }}
            >
              01 · ACOSO REAL
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background:
                  medicalProg >= 0.5
                    ? "rgba(253, 224, 71, 0.16)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  medicalProg >= 0.5
                    ? "1px solid rgba(253, 224, 71, 0.55)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                color: medicalProg >= 0.5 ? "#FDE047" : "rgba(186, 214, 235, 0.55)",
              }}
            >
              02 · PATOLOGÍA GENÉTICA
            </span>
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
