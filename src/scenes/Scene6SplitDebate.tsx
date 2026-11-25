import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { RakeCharacter } from "../components/characters/RakeCharacter";
import { PatientVictimCharacter } from "../components/characters/PatientVictimCharacter";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene6SplitDebate (frames 2078–2375, 69.27–79.17s) — Cierre y Debate.
 *
 * Split-screen diagonal de alto contraste: leyenda ancestral (carmesí,
 * izquierda) vs. parásito mutante (cian, derecha), ambos de cuerpo entero
 * anclados a floorY. Pregunta cinética central y cierre atmosférico con
 * push-in, resplandor carmesí y fade-out suave en los últimos 12 frames.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** División diagonal (arriba-derecha → abajo-izquierda, ~6° de vertical). */
const AX = 620;
const AY = -40;
const BX = 420;
const BY = 1960;

/** Banda diagonal (clip reveal) alrededor de la línea divisoria. */
const bandPoints = (h: number): string => {
  const vx = 0.9946;
  const vy = 0.1036;
  const p1 = `${(AX + vx * h).toFixed(1)},${(vy * h).toFixed(1)}`;
  const p2 = `${(AX - vx * h).toFixed(1)},${(-vy * h).toFixed(1)}`;
  const p3 = `${(BX - vx * h).toFixed(1)},${(BY - vy * h).toFixed(1)}`;
  const p4 = `${(BX + vx * h).toFixed(1)},${(BY + vy * h).toFixed(1)}`;
  return `${p1} ${p2} ${p3} ${p4}`;
};

export const Scene6SplitDebate: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Apertura diagonal limpia desde el corte inicial ---
  const revealH = interpolate(frame, [0, 40], [4, 680], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });

  // --- Push-in gradual tenso (175–297) ---
  const pushScale = interpolate(frame, [175, 297], [1, 1.14], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });

  // --- Resaltes por lado ---
  const leftGlow = interpolate(frame, [0, 15, 85, 95], [0, 1, 1, 0], { ...CLAMP });
  const rightGlow = interpolate(frame, [95, 110, 165, 175], [0, 1, 1, 0], { ...CLAMP });

  // --- Pregunta cinética central ---
  const questionOp = interpolate(frame, [10, 28], [0, 1], { ...CLAMP });
  const questionPop = interpolate(frame, [10, 30], [0.86, 1], {
    easing: Easing.out(Easing.cubic),
    ...CLAMP,
  });

  // --- Cierre final ---
  const outroOp = interpolate(frame, [175, 205], [0, 1], { ...CLAMP });
  const edgeDark = interpolate(frame, [175, 297], [0, 0.7], { ...CLAMP });
  const glintOp = interpolate(frame, [245, 262, 285], [0, 1, 1], { ...CLAMP });
  // Fade-out suave en los últimos 12 frames (285–297).
  const fadeOut = interpolate(frame, [285, 297], [0, 0.9], { ...CLAMP });

  // Latido suave de la línea divisoria.
  const linePulse = 0.82 + 0.18 * Math.sin(frame * 0.12);

  // Garras "vivas" del Rake (clawFlex orgánico).
  const clawFlex = 0.3 + 0.25 * Math.sin(frame * 0.13);

  // Destellos de ojos (penumbra inferior) con parpadeo determinista.
  const glintFlickerL = 0.6 + 0.4 * Math.abs(Math.sin(frame * 0.5));
  const glintFlickerR =
    0.6 + 0.4 * Math.abs(Math.sin(frame * 0.5 + 1.7)) *
    (random(Math.floor(frame / 8) * 3 + 1) > 0.35 ? 1 : 0.25);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Mundo 2.5D (push-in) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${pushScale.toFixed(4)})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* 1. Background con split + apertura diagonal clipPath */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            clipPath: `polygon(${bandPoints(revealH)})`,
          }}
        >
          <Img
            src={staticFile("backgrounds/bg_s6.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* 2. Lado izquierdo: The Rake (leyenda ancestral, cuerpo entero) */}
        <RakeCharacter
          x={265}
          floorY={1620}
          scale={1.35}
          mode="crouch_watch"
          lookTarget={{ x: 0.7, y: -0.1 }}
          mouthOpen={0.35}
          clawFlex={clawFlex}
          rimColor="#DC2626"
          eyeGlowColor="#FDE047"
        />

        {/* 3. Lado derecho: paciente mutado (cuerpo entero) */}
        <PatientVictimCharacter
          x={815}
          floorY={1620}
          scale={1.35}
          mutationProgress={1}
          spasmIntensity={0.35}
          lookTarget={{ x: -0.6, y: -0.1 }}
          rimColor="#22D3EE"
        />

        {/* 4. Línea diagonal luminosa divisoria */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <line
            x1={AX}
            y1={AY}
            x2={BX}
            y2={BY}
            stroke="rgba(220,38,38,0.55)"
            strokeWidth="30"
            style={{ filter: "blur(18px)" }}
            opacity={linePulse}
          />
          <line
            x1={AX}
            y1={AY}
            x2={BX}
            y2={BY}
            stroke="rgba(34,211,238,0.55)"
            strokeWidth="30"
            style={{ filter: "blur(18px)" }}
            opacity={linePulse * 0.8}
          />
          <line
            x1={AX}
            y1={AY}
            x2={BX}
            y2={BY}
            stroke="#F8FAFC"
            strokeWidth="4"
            opacity={0.95}
            style={{ filter: "blur(0.5px)" }}
          />
        </svg>
      </div>

      {/* Etiqueta superior izquierda: LEYENDA ANCESTRAL */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 80,
          maxWidth: 360,
          textAlign: "left",
          fontFamily: FONT_MONO,
          fontWeight: 800,
          letterSpacing: 2,
          fontSize: 26,
          color: "#F2EFE9",
          textShadow: `0 0 ${12 + leftGlow * 20}px rgba(220,38,38,${
            0.4 + leftGlow * 0.5
          }), 0 3px 14px rgba(0,0,0,0.9)`,
          opacity: 0.7 + leftGlow * 0.3,
        }}
      >
        LEYENDA ANCESTRAL
      </div>

      {/* Etiqueta superior derecha: PARÁSITO MUTANTE */}
      <div
        style={{
          position: "absolute",
          top: 350,
          right: 162,
          maxWidth: 360,
          textAlign: "right",
          fontFamily: FONT_MONO,
          fontWeight: 800,
          letterSpacing: 2,
          fontSize: 26,
          color: "#F2EFE9",
          textShadow: `0 0 ${12 + rightGlow * 20}px rgba(34,211,238,${
            0.4 + rightGlow * 0.5
          }), 0 3px 14px rgba(0,0,0,0.9)`,
          opacity: 0.7 + rightGlow * 0.3,
        }}
      >
        PARÁSITO MUTANTE
      </div>

      {/* Pregunta cinética central */}
      <SafeCentered top={500} zIndex={8}>
        <div
          style={{
            transform: `scale(${questionPop.toFixed(3)})`,
            opacity: questionOp,
            fontFamily: FONT_SANS,
            fontWeight: 900,
            fontSize: 54,
            letterSpacing: 1,
            lineHeight: 1.05,
            textShadow: "0 6px 30px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          <span style={{ color: "#DC2626", textShadow: "0 0 28px rgba(220,38,38,0.55), 0 6px 30px rgba(0,0,0,0.9)" }}>
            ¿PESADILLA
          </span>{" "}
          <span style={{ color: "#F2EFE9" }}>O</span>{" "}
          <span style={{ color: "#22D3EE", textShadow: "0 0 28px rgba(34,211,238,0.55), 0 6px 30px rgba(0,0,0,0.9)" }}>
            INFECCIÓN?
          </span>
        </div>
      </SafeCentered>

      {/* Cierre final: subtítulo diegético + penumbra + destellos */}
      <div style={{ opacity: outroOp, pointerEvents: "none" }}>
        {/* Pregunta de cierre (encima de subtítulos, top 1085) */}
        <SafeCentered top={1085} zIndex={8}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              letterSpacing: 4,
              fontSize: 26,
              color: "#F2EFE9",
              textShadow:
                "0 0 22px rgba(220,38,38,0.5), 0 3px 14px rgba(0,0,0,0.9)",
            }}
          >
            ¿REVISARÍAS LOS PIES DE TU CAMA ESTA NOCHE?
          </div>
        </SafeCentered>

        {/* Destellos de ojos en la penumbra inferior */}
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 1510,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#FDE047",
            boxShadow: "0 0 18px rgba(253,224,71,0.9)",
            opacity: glintOp * glintFlickerL,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 666,
            top: 1510,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#22D3EE",
            boxShadow: "0 0 18px rgba(34,211,238,0.9)",
            opacity: glintOp * glintFlickerR,
          }}
        />
      </div>

      {/* Oscurecimiento progresivo de bordes */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(2,3,5,0.85) 88%)",
          opacity: edgeDark,
          pointerEvents: "none",
        }}
      />

      {/* Fade-out suave final (últimos 12 frames) */}
      <AbsoluteFill
        style={{ background: "#000000", opacity: fadeOut, pointerEvents: "none" }}
      />
    </AbsoluteFill>
  );
};
