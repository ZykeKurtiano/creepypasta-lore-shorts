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
 * JeffScene1Mirror (frames 0–436, 0.00–14.53s)
 * Gancho — El espejo y el origen 2008.
 *
 * Capas 2.5D reales:
 *  1. Fondo: public/art/bg_bathroom_2008.png (dolly-in lento y estable)
 *  2. Neblina fría de baño nocturno en deriva continua
 *  3. Personaje recortado: public/art/char_jeff_shadow.png emergiendo frente al espejo
 *     con movimiento independiente de paralaje en Z y respiración orgánica sutil
 *  4. Partículas de polvo iluminadas por la luz fría superior
 *  5. Etiqueta discreta dentro de zona segura: "2008 · Newgrounds / Lost Photo"
 *  6. Viñeta frontal de profundidad
 *
 * Movimiento de cámara único: dolly-in lento y estable (cero shake/zoom periódicos).
 */

const SCENE_LEN = SCENES.scene1.end - SCENES.scene1.start;

export const JeffScene1Mirror: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Dolly-in lento y estable (única intención de cámara de la escena)
  const bgScale = interpolate(progress, [0, 1], [1.02, 1.11], {
    easing: Easing.out(Easing.quad),
  });
  const bgY = interpolate(progress, [0, 1], [8, -22]);

  // Paralaje 2.5D independiente del personaje (avanza ligeramente más rápido que el fondo)
  const charScale = interpolate(progress, [0, 1], [0.95, 1.13], {
    easing: Easing.out(Easing.quad),
  });
  const charReveal = interpolate(frame, [0, 42, 105], [0.45, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const charBreathY = Math.sin(frame * 0.032) * 5.5;
  const charDriftX = interpolate(progress, [0, 1], [18, -8]);

  // Etiqueta discreta: entrada suave y realce al mencionar "2008 en Newgrounds" (~frame 215)
  const tagOpacity = interpolate(frame, [10, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagHighlight = interpolate(frame, [205, 228, 285, 315], [0, 1, 1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parpadeo muy sutil de la luz fría del baño (baja amplitud, no es shake)
  const lampGlow = 0.22 + 0.05 * Math.sin(frame * 0.08);

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* 1. Fondo 9:16 generado en Fal.ai (dolly-in lento) */}
      <AbsoluteFill
        style={{
          transform: `translateY(${bgY}px) scale(${bgScale})`,
          transformOrigin: "48% 42%",
        }}
      >
        <Img
          src={staticFile("art/bg_bathroom_2008.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.84) contrast(1.08) saturate(0.88)",
          }}
        />
      </AbsoluteFill>

      {/* Luz cenital fría sobre el espejo agrietado */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 120,
          width: 680,
          height: 820,
          background:
            "radial-gradient(ellipse at 42% 20%, rgba(165, 224, 232, 0.26) 0%, rgba(45, 92, 108, 0.09) 48%, transparent 74%)",
          opacity: lampGlow,
          pointerEvents: "none",
        }}
      />

      {/* 2. Neblina atmosférica trasera */}
      <MistLayer
        tint="rgba(96, 152, 168, 0.16)"
        opacity={0.85}
        speed={0.42}
        yOffset={40}
        seed={1}
      />

      {/* 3. Personaje PNG recortado con movimiento 2.5D independiente */}
      <div
        style={{
          position: "absolute",
          top: 505,
          left: 225,
          width: 680,
          height: 874,
          opacity: charReveal,
          transform: `translate(${charDriftX}px, ${charBreathY}px) scale(${charScale})`,
          transformOrigin: "50% 42%",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.45) 89%, transparent 99%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.45) 89%, transparent 99%)",
        }}
      >
        <Img
          src={staticFile("art/char_jeff_shadow.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter:
              "brightness(0.82) contrast(1.16) saturate(0.72) drop-shadow(0 22px 44px rgba(0, 0, 0, 0.92)) drop-shadow(-8px -4px 20px rgba(90, 170, 190, 0.22))",
          }}
        />
      </div>

      {/* 4. Polvo y bruma frontal flotando en la luz fría */}
      <DustSporesLayer
        count={28}
        color="#BFE3EE"
        seed={11}
        opacity={0.78}
        minY={220}
        maxY={1460}
      />

      {/* 5. Viñeta frontal y sombreado de profundidad */}
      <ForegroundVignette
        edgeStrength={0.78}
        topDarkness={0.56}
        bottomDarkness={0.88}
      />

      {/* 6. Etiqueta discreta dentro de zona segura (top 362) */}
      <SafeCentered top={362} zIndex={10}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 24px",
            borderRadius: 999,
            background: "rgba(6, 10, 14, 0.74)",
            border: `1px solid rgba(242, 239, 233, ${0.18 + tagHighlight * 0.28})`,
            boxShadow: `0 10px 34px rgba(0,0,0,0.65), 0 0 ${18 + tagHighlight * 22}px rgba(220, 38, 38, ${0.14 + tagHighlight * 0.28})`,
            backdropFilter: "blur(8px)",
            opacity: tagOpacity,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              backgroundColor: "#DC2626",
              boxShadow: "0 0 12px rgba(220,38,38,0.9)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: "#F2EFE9",
              textShadow: "0 1px 8px rgba(0,0,0,0.85)",
            }}
          >
            <span style={{ color: "#FDE047" }}>2008</span> · Newgrounds / Lost Photo
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_SANS,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 3.5,
            color: "rgba(191, 215, 228, 0.72)",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            opacity: tagOpacity * 0.9,
          }}
        >
          ORIGEN DEL MITO DIGITAL
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
