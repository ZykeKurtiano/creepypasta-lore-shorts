import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DustSporesLayer,
  ForegroundVignette,
  MistLayer,
} from "../components/Atmosphere25D";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";
import { JeffCharacter } from "../components/characters/JeffCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";
import { SCENES } from "../data/episodeConfig";

/**
 * JeffScene4Finale (frames 1278–1477 · 42.60–49.23s)
 * Cierre y debate — Cara a cara final: Jeff vs Slenderman.
 *
 * Capas 2.5D reales (cero <Img>):
 *  1. Vacío nocturno en alto contraste (rojo carmesí izquierda / azul frío derecha).
 *  2. Neblina y cenizas flotando entre ambos contendientes.
 *  3. JeffCharacter (izquierda, rim carmesí) y SlenderCharacter (derecha,
 *     tentáculos ondulando, rim azul) con respiración leve y rim light pulsante.
 *  4. Texto cinético centrado en SafeCentered top=356:
 *     "¿EQUIPO JEFF O EQUIPO SLENDERMAN?" + píldora CTA "COMENTA TU BANDO ABAJO".
 *  5. Viñeta frontal.
 *
 * Movimiento de cámara único:
 *  - Un único micro-impacto en frames 0–10 sincronizado con deep_boom.mp3
 *    (decay limpio, cero repeticiones), seguido de empuje sutil estable.
 */

const SCENE_LEN = SCENES.scene4.end - SCENES.scene4.start;

export const JeffScene4Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Único golpe de micro-impacto en toda la composición (frames 0–10).
  const hitDecay =
    frame <= 10
      ? interpolate(frame, [0, 2, 10], [1, 0.72, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const hitX = hitDecay * Math.sin(frame * 2.1) * 7;
  const hitY = hitDecay * Math.cos(frame * 1.9) * 5;

  // Empuje sutil estable tras el impacto.
  const cameraScale = interpolate(progress, [0, 1], [1.02, 1.06], {
    easing: Easing.out(Easing.quad),
  });

  // Acercamiento lento en capas opuestas.
  const jeffShiftX = interpolate(progress, [0, 1], [-24, 12]);
  const slenderShiftX = interpolate(progress, [0, 1], [24, -12]);
  const jeffBreath = Math.sin(frame * 0.03) * 5;
  const slenderBreath = Math.cos(frame * 0.026) * 4;

  // Rim light pulsante suave (baja amplitud, sin loops de shake).
  const jeffRimPulse = 0.7 + 0.22 * Math.max(0, Math.sin(frame * 0.06));
  const slenderRimPulse = 0.7 + 0.22 * Math.max(0, Math.sin(frame * 0.05 + 1.4));

  // Entrada cinética de la pregunta final.
  const questionSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 180, mass: 0.75, stiffness: 120 },
  });
  const questionScale = interpolate(questionSpring, [0, 1], [0.94, 1]);
  const questionOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Realce al pronunciar "equipo Jeff" (~local 87) y "equipo Slenderman" (~local 120).
  const jeffCallout = interpolate(frame, [82, 92, 108, 118], [0, 1, 1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slenderCallout = interpolate(frame, [112, 124, 150, 175], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${hitX}px, ${hitY}px) scale(${cameraScale})`,
          transformOrigin: "50% 52%",
        }}
      >
        {/* 1. Fondo profundo con contraluces enfrentados */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 22% 58%, rgba(127, 29, 29, 0.42) 0%, transparent 54%), radial-gradient(ellipse at 80% 54%, rgba(30, 64, 88, 0.42) 0%, transparent 54%), linear-gradient(180deg, #040508 0%, #090D13 52%, #030406 100%)",
          }}
        />

        {/* Línea divisoria vertical atmosférica */}
        <div
          style={{
            position: "absolute",
            top: 540,
            left: "50%",
            width: 2,
            height: 820,
            marginLeft: -1,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(242,239,233,0.16) 45%, rgba(220,38,38,0.28) 65%, transparent 100%)",
            filter: "blur(1px)",
          }}
        />

        {/* 2. Neblina envolvente */}
        <MistLayer
          tint="rgba(128, 152, 174, 0.15)"
          opacity={0.9}
          speed={0.45}
          yOffset={110}
          seed={55}
        />

        {/* 3A. Contendiente Izquierda: Jeff the Killer (rim carmesí) */}
        <div
          style={{
            position: "absolute",
            top: 665,
            left: -90,
            width: 620,
            height: 768,
            opacity: 1,
            transform: `translate(${jeffShiftX}px, ${jeffBreath}px) scale(${
              1 + jeffCallout * 0.03
            })`,
            transformOrigin: "48% 45%",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
          }}
        >
          <JeffCharacter
            width={620}
            rimColor="#DC2626"
            crimsonAccent={0.75 + jeffCallout * 0.2}
            headTiltBoost={-1}
            style={{
              filter: `brightness(${0.9 + jeffRimPulse * 0.12}) drop-shadow(-10px 0 30px rgba(220,38,38,${
                0.24 + jeffCallout * 0.3
              }))`,
            }}
          />
        </div>

        {/* 3B. Contendiente Derecha: Slenderman (tentáculos, rim azul) */}
        <div
          style={{
            position: "absolute",
            top: 660,
            right: -96,
            width: 620,
            height: 755,
            transform: `translate(${slenderShiftX}px, ${slenderBreath}px) scale(${
              1 + slenderCallout * 0.03
            })`,
            transformOrigin: "52% 45%",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
          }}
        >
          <SlenderCharacter
            width={620}
            rimColor="#38BDF8"
            tentacleIntensity={1.1}
            headTiltBoost={1}
            style={{
              filter: `brightness(${0.92 + slenderRimPulse * 0.1}) drop-shadow(10px 0 30px rgba(148,210,238,${
                0.24 + slenderCallout * 0.28
              }))`,
            }}
          />
        </div>

        {/* 4. Partículas y cenizas en primer plano */}
        <DustSporesLayer
          count={34}
          color="#DC2626"
          accentColor="#FDE047"
          seed={64}
          opacity={0.78}
          minY={300}
          maxY={1540}
        />
      </AbsoluteFill>

      {/* 5. Viñeta frontal */}
      <ForegroundVignette
        edgeStrength={0.78}
        topDarkness={0.56}
        bottomDarkness={0.9}
      />

      {/* 6. Texto cinético centrado dentro de zona segura (top 356) */}
      <SafeCentered top={356} zIndex={12}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 740,
            padding: "22px 28px",
            borderRadius: 16,
            background: "rgba(10, 10, 14, 0.78)",
            border: "1px solid rgba(220, 38, 38, 0.45)",
            boxShadow:
              "0 0 54px rgba(220, 38, 38, 0.22), 0 18px 52px rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(10px)",
            opacity: questionOpacity,
            transform: `scale(${questionScale})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 3.2,
              color: "rgba(242, 239, 233, 0.68)",
              marginBottom: 8,
            }}
          >
            GUERRA DE CREEPYPASTAS
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 900,
              fontSize: 42,
              lineHeight: 1.12,
              letterSpacing: 0.8,
              color: "#F2EFE9",
              textShadow: "0 3px 22px rgba(0, 0, 0, 0.9)",
            }}
          >
            ¿<span style={{ color: "#EF4444" }}>EQUIPO JEFF</span> O{" "}
            <span style={{ color: "#FDE047" }}>EQUIPO SLENDERMAN</span>?
          </div>
          <div
            style={{
              margin: "14px auto 0",
              width: 112,
              height: 4,
              borderRadius: 999,
              background: "linear-gradient(90deg, #DC2626, #FDE047)",
            }}
          />
          <div
            style={{
              display: "inline-block",
              marginTop: 14,
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(220, 38, 38, 0.16)",
              border: "1px solid rgba(220, 38, 38, 0.52)",
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 2,
              color: "#FCA5A5",
            }}
          >
            COMENTA TU BANDO ABAJO
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
