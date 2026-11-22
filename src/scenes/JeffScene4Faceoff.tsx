import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DustSporesLayer,
  ForegroundVignette,
  MistLayer,
} from "../components/Atmosphere25D";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";
import { SCENES } from "../data/episodeConfig";

/**
 * JeffScene4Faceoff (frames 1296–1501, duración 205 frames, 43.20–50.03s)
 * Cierre y debate — Cara a cara final: Jeff vs Slenderman.
 *
 * Capas 2.5D reales:
 *  1. Vacío nocturno con iluminación opuesta (carmesí izquierda / azul frío derecha)
 *  2. Neblina y cenizas flotando entre ambos contendientes
 *  3. Cara a cara en capas PNG recortadas con movimiento independiente:
 *       · Izquierda: public/art/char_jeff_shadow.png
 *       · Derecha:   public/art/char_slender_vs.png
 *  4. Texto cinético perfectamente centrado en zona segura:
 *       "¿EQUIPO JEFF O EQUIPO SLENDERMAN?"
 *  5. Viñeta frontal
 *
 * Movimiento de cámara único:
 *  - Un único micro-impacto en los primeros 10 frames sincronizado exclusivamente
 *    con el golpe subgrave (deep_boom.mp3), seguido de plano fijo tenso con
 *    push-in muy suave y estable (cero bucles periódicos).
 */

const SCENE_LEN = SCENES.scene4.end - SCENES.scene4.start;

export const JeffScene4Faceoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Único golpe de micro-impacto en toda la composición, sincronizado a deep_boom.mp3 (frames 0–10)
  const hitDecay =
    frame <= 10
      ? interpolate(frame, [0, 2, 10], [1, 0.75, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const hitX = hitDecay * Math.sin(frame * 2.1) * 7;
  const hitY = hitDecay * Math.cos(frame * 1.9) * 5;

  // Plano fijo tenso con push-in muy sutil y estable
  const cameraScale = interpolate(progress, [0, 1], [1.01, 1.055], {
    easing: Easing.out(Easing.quad),
  });

  // Acercamiento lento en capas opuestas
  const jeffShiftX = interpolate(progress, [0, 1], [-22, 10]);
  const slenderShiftX = interpolate(progress, [0, 1], [22, -10]);
  const jeffBreath = Math.sin(frame * 0.03) * 4;
  const slenderBreath = Math.cos(frame * 0.026) * 4;

  // Entrada cinética de la pregunta final
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

  // Realce sutil cuando pronuncia "equipo Jeff" (~local 100) y "equipo Slenderman" (~local 134)
  const jeffCallout = interpolate(frame, [94, 104, 120, 130], [0, 1, 1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slenderCallout = interpolate(frame, [126, 138, 165, 190], [0, 1, 1, 0.3], {
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
              "radial-gradient(ellipse at 24% 58%, rgba(127, 29, 29, 0.34) 0%, transparent 52%), radial-gradient(ellipse at 78% 54%, rgba(30, 64, 88, 0.34) 0%, transparent 52%), linear-gradient(180deg, #040508 0%, #090D13 52%, #030406 100%)",
          }}
        />

        {/* Línea divisoria vertical atmosférica muy sutil */}
        <div
          style={{
            position: "absolute",
            top: 560,
            left: "50%",
            width: 2,
            height: 760,
            marginLeft: -1,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(242,239,233,0.16) 45%, rgba(220,38,38,0.28) 65%, transparent 100%)",
            filter: "blur(1px)",
          }}
        />

        {/* 2. Neblina envolvente */}
        <MistLayer
          tint="rgba(128, 152, 174, 0.14)"
          opacity={0.9}
          speed={0.45}
          yOffset={110}
          seed={55}
        />

        {/* 3A. Contendiente Izquierda: Jeff the Killer */}
        <div
          style={{
            position: "absolute",
            top: 635,
            left: -58,
            width: 615,
            height: 790,
            transform: `translate(${jeffShiftX}px, ${jeffBreath}px) scale(${1 + jeffCallout * 0.025})`,
            transformOrigin: "48% 45%",
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
              filter: `brightness(${0.86 + jeffCallout * 0.1}) contrast(1.16) saturate(0.84) drop-shadow(0 24px 48px rgba(0,0,0,0.94)) drop-shadow(-10px 0 26px rgba(220,38,38,${0.28 + jeffCallout * 0.25}))`,
            }}
          />
        </div>

        {/* 3B. Contendiente Derecha: Slenderman */}
        <div
          style={{
            position: "absolute",
            top: 608,
            right: -56,
            width: 605,
            height: 790,
            transform: `translate(${slenderShiftX}px, ${slenderBreath}px) scale(${1 + slenderCallout * 0.025})`,
            transformOrigin: "52% 45%",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
          }}
        >
          <Img
            src={staticFile("art/char_slender_vs.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: `brightness(${0.9 + slenderCallout * 0.1}) contrast(1.18) drop-shadow(0 24px 48px rgba(0,0,0,0.94)) drop-shadow(10px 0 26px rgba(148,210,238,${0.26 + slenderCallout * 0.24}))`,
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

      {/* 6. Texto cinético perfectamente centrado dentro de zona segura (top 360) */}
      <SafeCentered top={360} zIndex={12}>
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
