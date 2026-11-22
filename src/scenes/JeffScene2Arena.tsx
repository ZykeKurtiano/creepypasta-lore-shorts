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
 * JeffScene2Arena (frames 436–896, duración 460 frames, 14.53–29.87s)
 * Juegos indie, YouTube y Jeff vs Slenderman.
 *
 * Capas 2.5D reales:
 *  1. Fondo: public/art/bg_youtube_arena.png con desplazamiento lateral (pan) suave
 *  2. Neblina fría-carmesí y reflejos ambientales de los monitores
 *  3. Capas opuestas independientes:
 *       · Izquierda: public/art/char_jeff_shadow.png
 *       · Derecha:   public/art/char_slender_vs.png (emerge de las sombras hacia el duelo)
 *  4. Partículas flotando entre los planos
 *  5. Tarjeta glassmorphism limpia en zona segura: "Jumpscare Games · YouTube Trend"
 *     + píldora de rivalidad "JEFF vs SLENDERMAN" en la segunda mitad
 *  6. Viñeta frontal
 *
 * Movimiento de cámara único: desplazamiento lateral (pan) suave sin shake ni zoom repetitivo.
 */

const SCENE_LEN = SCENES.scene2.end - SCENES.scene2.start;

export const JeffScene2Arena: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Desplazamiento lateral (pan) suave con escala constante de seguridad (cero bordes negros)
  const bgPanX = interpolate(progress, [0, 1], [38, -38], {
    easing: Easing.inOut(Easing.sin),
  });

  // Aparición progresiva de la rivalidad (~local frame 285 = ~24.0s "protagonizó la rivalidad")
  const rivalryProg = interpolate(frame, [265, 340], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Capa izquierda: Jeff (paralaje independiente opuesto al pan + respiración orgánica)
  const jeffX = interpolate(progress, [0, 1], [-22, 16]) + rivalryProg * 14;
  const jeffBreath = Math.sin(frame * 0.034) * 5;
  const jeffOpacity = interpolate(frame, [0, 20], [0.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Capa derecha: Slenderman (acecha tenue al inicio y se impone al nombrar la rivalidad)
  const slenderX = interpolate(progress, [0, 1], [34, -14]) - rivalryProg * 18;
  const slenderBreath = Math.cos(frame * 0.026 + 1.1) * 4.5;
  const slenderOpacity = interpolate(frame, [0, 35, 255, 325], [0.25, 0.52, 0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slenderScale = 0.94 + rivalryProg * 0.08;

  // Entrada limpia de la tarjeta glassmorphism
  const cardIn = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardSlideY = interpolate(frame, [6, 26], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* 1. Fondo 9:16 generado en Fal.ai (pan lateral suave) */}
      <AbsoluteFill
        style={{
          transform: `translateX(${bgPanX}px) scale(1.12)`,
          transformOrigin: "50% 50%",
        }}
      >
        <Img
          src={staticFile("art/bg_youtube_arena.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.78) contrast(1.1)",
          }}
        />
      </AbsoluteFill>

      {/* Resplandor dual sutil de los monitores (cian izq / carmesí der) */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: -120 + bgPanX * 0.5,
          width: 660,
          height: 740,
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.16) 0%, transparent 66%)",
          filter: "blur(36px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 500,
          right: -140 - bgPanX * 0.5,
          width: 680,
          height: 760,
          background: `radial-gradient(circle, rgba(220, 38, 38, ${0.15 + rivalryProg * 0.14}) 0%, transparent 66%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* 2. Neblina atmosférica intermedia */}
      <MistLayer
        tint="rgba(78, 134, 162, 0.15)"
        opacity={0.85}
        speed={0.5}
        yOffset={60}
        seed={22}
      />

      {/* 3A. Capa derecha (Slenderman emergiendo desde el bosque/penumbra) */}
      <div
        style={{
          position: "absolute",
          top: 540,
          right: -75,
          width: 600,
          height: 780,
          opacity: slenderOpacity,
          transform: `translate(${slenderX}px, ${slenderBreath}px) scale(${slenderScale})`,
          transformOrigin: "55% 45%",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 90%, transparent 99%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 90%, transparent 99%)",
        }}
      >
        <Img
          src={staticFile("art/char_slender_vs.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter:
              "brightness(0.86) contrast(1.16) drop-shadow(0 24px 44px rgba(0,0,0,0.92)) drop-shadow(-8px 0 22px rgba(220,38,38,0.22))",
          }}
        />
      </div>

      {/* 3B. Capa izquierda (Jeff the Killer en plano medio-cercano) */}
      <div
        style={{
          position: "absolute",
          top: 575,
          left: -75,
          width: 600,
          height: 780,
          opacity: jeffOpacity,
          transform: `translate(${jeffX}px, ${jeffBreath}px) scale(1.01)`,
          transformOrigin: "45% 45%",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 90%, transparent 99%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 90%, transparent 99%)",
        }}
      >
        <Img
          src={staticFile("art/char_jeff_shadow.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter:
              "brightness(0.85) contrast(1.14) saturate(0.84) drop-shadow(0 24px 44px rgba(0,0,0,0.92)) drop-shadow(10px 0 22px rgba(34,211,238,0.22))",
          }}
        />
      </div>

      {/* 4. Polvo/esporas iluminadas entre los personajes */}
      <DustSporesLayer
        count={30}
        color="#A5D8EA"
        accentColor="#F43F5E"
        seed={29}
        opacity={0.82}
        minY={260}
        maxY={1480}
      />

      {/* 5. Viñeta frontal */}
      <ForegroundVignette
        edgeStrength={0.76}
        topDarkness={0.58}
        bottomDarkness={0.9}
      />

      {/* 6. Tarjetas glassmorphism limpias dentro de zona segura (top 356) */}
      <SafeCentered top={356} zIndex={10}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 700,
            padding: "18px 28px",
            borderRadius: 16,
            background: "rgba(8, 13, 20, 0.72)",
            border: "1px solid rgba(242, 239, 233, 0.18)",
            boxShadow:
              "0 16px 46px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            opacity: cardIn,
            transform: `translateY(${cardSlideY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontFamily: FONT_SANS,
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: 0.6,
              color: "#F2EFE9",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 22,
                borderRadius: 6,
                backgroundColor: "#DC2626",
                boxShadow: "0 0 14px rgba(220, 38, 38, 0.75)",
                fontSize: 12,
                color: "#FFFFFF",
              }}
            >
              ▶
            </span>
            <span>Jumpscare Games · YouTube Trend</span>
          </div>

          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_MONO,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2.2,
              color: "rgba(186, 214, 230, 0.8)",
            }}
          >
            ERA DORADA DEL TERROR DIGITAL · 2011–2014
          </div>

          {rivalryProg > 0.02 ? (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid rgba(242, 239, 233, 0.14)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                opacity: rivalryProg,
                fontFamily: FONT_SANS,
                fontWeight: 900,
                fontSize: 24,
                letterSpacing: 2.5,
              }}
            >
              <span style={{ color: "#F2EFE9" }}>JEFF</span>
              <span
                style={{
                  color: "#DC2626",
                  fontSize: 18,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: "rgba(220, 38, 38, 0.16)",
                  border: "1px solid rgba(220, 38, 38, 0.45)",
                }}
              >
                VS
              </span>
              <span style={{ color: "#FDE047" }}>SLENDERMAN</span>
            </div>
          ) : null}
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
