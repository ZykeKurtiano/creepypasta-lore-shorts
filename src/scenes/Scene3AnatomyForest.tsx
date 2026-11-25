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
import { FONT_MONO } from "../components/SafeZone";

/**
 * Scene3AnatomyForest (frames 853–1089, 28.43–36.30s) — Anatomía de la
 * criatura en el bosque de pinos del norte.
 *
 * 3 planos: Plano General-Medio entre niebla (callouts anatómicos) →
 * Macro-Zoom 2.6x a las cuencas vacías (retícula CUENCAS VACÍAS) →
 * Macro-Zoom 2.6x a la mano con garras (retícula GARRAS ALARGADAS +
 * zarpazos), enlazando con el Claw-Swipe Wipe hacia Escena 4.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

// Anclas anatómicas en coordenadas de mundo (RakeCharacter scale 1.75,
// floorY 1540): cuencas negras vacías y mano delantera con garras.
const FACE = { x: 540, y: 987 };
const HANDS = { x: 666, y: 1418 };
const BODY = { x: 540, y: 1076 };

const SPORES = Array.from({ length: 30 }, (_, i) => ({
  x: random(i * 3 + 1) * 1080,
  y0: random(i * 7 + 2) * 1920,
  r: 1.2 + random(i * 5 + 3) * 2.2,
  speed: 0.08 + random(i * 9 + 4) * 0.18,
  phase: random(i * 13 + 5) * 1200,
  sway: (random(i * 11 + 7) - 0.5) * 30,
}));

/** Retícula circular analítica con marcas de mira y etiqueta. */
const Reticle: React.FC<{
  x: number;
  y: number;
  r: number;
  label: string;
  sub: string;
  opacity: number;
  rotate: number;
  color?: string;
  labelAbove?: boolean;
}> = ({ x, y, r, label, sub, opacity, rotate, color = "#DC2626", labelAbove = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 0,
      height: 0,
      opacity,
      pointerEvents: "none",
    }}
  >
    <svg
      width={r * 2.6}
      height={r * 2.6}
      viewBox={`0 0 ${r * 2.6} ${r * 2.6}`}
      style={{
        position: "absolute",
        left: -r * 1.3,
        top: -r * 1.3,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <circle cx={r * 1.3} cy={r * 1.3} r={r} fill="none" stroke={color} strokeWidth="2" opacity="0.7" />
      <circle cx={r * 1.3} cy={r * 1.3} r={r * 0.55} fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="4 4" opacity="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={r * 1.3}
          y1={r * 0.1}
          x2={r * 1.3}
          y2={r * 0.32}
          stroke={color}
          strokeWidth="2.4"
          transform={`rotate(${a} ${r * 1.3} ${r * 1.3})`}
        />
      ))}
    </svg>
    <div
      style={{
        position: "absolute",
        left: -170,
        top: labelAbove ? -r * 1.25 - 58 : r * 1.25,
        width: 340,
        textAlign: "center",
        fontFamily: FONT_MONO,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 3,
        color,
        textShadow: "0 0 14px rgba(220,38,38,0.4), 0 2px 10px rgba(0,0,0,0.9)",
      }}
    >
      {label}
    </div>
    <div
      style={{
        position: "absolute",
        left: -170,
        top: labelAbove ? -r * 1.25 - 28 : r * 1.25 + 28,
        width: 340,
        textAlign: "center",
        fontFamily: FONT_MONO,
        fontSize: 15,
        letterSpacing: 4,
        color: "rgba(242,239,233,0.8)",
        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
      }}
    >
      {sub}
    </div>
  </div>
);

export const Scene3AnatomyForest: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Coreografía de cámara en 3 planos -----------------------------
  let s: number;
  let px: number;
  let py: number;

  if (frame < 96) {
    s = interpolate(frame, [0, 96], [1, 1.14], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = OX;
    py = OY;
  } else if (frame < 152) {
    s = interpolate(frame, [96, 152], [1.14, 2.6], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = OX;
    py = interpolate(frame, [96, 152], [OY, FACE.y], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  } else {
    s = 2.6;
    px = interpolate(frame, [152, 236], [FACE.x, HANDS.x], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [152, 236], [FACE.y, HANDS.y], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  }

  const TX = OX - px * s;
  const TY = OY - py * s;

  // Posición en pantalla de los puntos anatómicos.
  const toScreen = (wx: number, wy: number) => ({
    x: (wx - px) * s + OX,
    y: (wy - py) * s + OY,
  });
  const faceS = toScreen(FACE.x, FACE.y);
  const handS = toScreen(HANDS.x, HANDS.y);
  const bodyS = toScreen(BODY.x, BODY.y);

  // --- Ventanas de los planos ---
  const calloutOp = interpolate(frame, [8, 40, 90, 100], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const opticOp = interpolate(frame, [96, 110, 146, 156], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const clawOp = interpolate(frame, [152, 168], [0, 1], { ...CLAMP });

  // --- Dedos flexionándose dinámicamente + respiración profunda ------
  const clawFlex = 0.35 + 0.25 * Math.sin(frame * 0.12);

  // --- Parallax de niebla (2 capas) ---
  const fogFarX = Math.sin(frame * 0.004) * 160 - 300;
  const fogNearX = Math.sin(frame * 0.007 + 1.7) * 260 - 420;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Mundo 2.5D bajo la cámara */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${TX.toFixed(2)}px, ${TY.toFixed(
            2
          )}px) scale(${s.toFixed(4)})`,
          transformOrigin: "0 0",
        }}
      >
        {/* 1. Background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s3.png")}
            style={{
              position: "absolute",
              width: "108%",
              height: "108%",
              left: "-4%",
              top: "-4%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* 2. Niebla volumétrica lejana (parallax lento) */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: fogFarX,
            width: 1800,
            height: 320,
            background:
              "radial-gradient(ellipse, rgba(43,58,66,0.16), transparent 70%)",
            filter: "blur(22px)",
          }}
        />

        {/* 3. The Rake de cuerpo entero en el claro lunar */}
        <RakeCharacter
          x={540}
          floorY={1540}
          scale={1.75}
          mode="crouch_watch"
          lookTarget={{ x: 0.1, y: -0.15 }}
          mouthOpen={0.12}
          clawFlex={clawFlex}
          rimColor="#38BDF8"
          eyeGlowColor="#F8FAFC"
        />

        {/* 4. Niebla volumétrica cercana (parallax rápido) */}
        <div
          style={{
            position: "absolute",
            top: 900,
            left: fogNearX,
            width: 1900,
            height: 360,
            background:
              "radial-gradient(ellipse, rgba(43,58,66,0.2), transparent 70%)",
            filter: "blur(26px)",
          }}
        />

        {/* 5. Esporas frías iluminadas por la luna */}
        {SPORES.map((d, i) => {
          const y = d.y0 - ((frame * d.speed + d.phase) % 1920);
          const x = d.x + Math.sin(frame * 0.02 + i * 1.3) * d.sway;
          const op = 0.05 + 0.16 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: x,
                width: d.r * 2,
                height: d.r * 2,
                borderRadius: d.r,
                background: "#CFE3F5",
                opacity: op,
                boxShadow: "0 0 6px rgba(190,220,245,0.5)",
              }}
            />
          );
        })}

        {/* 6. Siluetas desenfocadas de ramas de pino en bordes */}
        <div
          style={{
            position: "absolute",
            top: -100,
            bottom: -100,
            left: -80,
            width: 190,
            background:
              "linear-gradient(90deg, #020305, rgba(4,7,11,0.6) 60%, transparent)",
            filter: "blur(8px)",
            opacity: 0.96,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -100,
            bottom: -100,
            right: -80,
            width: 190,
            background:
              "linear-gradient(270deg, #020305, rgba(4,7,11,0.6) 60%, transparent)",
            filter: "blur(8px)",
            opacity: 0.96,
          }}
        />
      </div>

      {/* Callouts anatómicos (Plano 1) */}
      <div style={{ opacity: calloutOp, pointerEvents: "none" }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {/* PIEL PÁLIDA → torso */}
          <path
            d={`M 250 565 L ${bodyS.x.toFixed(0)} ${bodyS.y.toFixed(0)}`}
            stroke="rgba(242,239,233,0.55)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx={bodyS.x} cy={bodyS.y} r="5" fill="#F2EFE9" opacity="0.7" />
          {/* ENCORVADO / SIN PELO → cabeza */}
          <path
            d={`M 830 455 L ${faceS.x.toFixed(0)} ${faceS.y.toFixed(0)}`}
            stroke="rgba(242,239,233,0.55)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx={faceS.x} cy={faceS.y} r="5" fill="#F2EFE9" opacity="0.7" />
        </svg>

        {/* Badge PIEL PÁLIDA (conectado a la línea guía del torso) */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 540,
            textAlign: "left",
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
            color: "#F2EFE9",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          PIEL PÁLIDA
        </div>

        {/* Badge ENCORVADO — SIN PELO (conectado a la línea guía de la cabeza) */}
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 420,
            textAlign: "right",
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
            color: "#F2EFE9",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          ENCORVADO — SIN PELO
        </div>
      </div>

      {/* Retícula de cuencas ópticas (Plano 2) */}
      <Reticle
        x={faceS.x}
        y={faceS.y}
        r={150}
        label="CUENCAS VACÍAS"
        sub="SOCKETS · HOLLOW"
        opacity={opticOp}
        rotate={frame * 0.5}
      />

      {/* Retícula de garras (Plano 3) */}
      <Reticle
        x={handS.x}
        y={handS.y}
        r={170}
        label="GARRAS ALARGADAS"
        sub="CLAWS · ELONGATED"
        opacity={clawOp}
        rotate={-frame * 0.4}
        color="#FDE047"
        labelAbove
      />

      {/* Zarpazos carmesí al decir "garras larguísimas" (196–232) */}
      {frame >= 196 ? (
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[0, 1, 2].map((k) => {
            const o = interpolate(
              frame,
              [196 + k * 10, 204 + k * 10, 228 + k * 10],
              [0, 0.9, 0],
              { ...CLAMP }
            );
            const x0 = 300 + k * 180;
            const y0 = 860 + k * 40;
            return (
              <g key={k} opacity={o}>
                <line
                  x1={x0}
                  y1={y0}
                  x2={x0 + 520 - k * 40}
                  y2={y0 - 150 - k * 20}
                  stroke="#DC2626"
                  strokeWidth={4 - k * 0.8}
                  strokeLinecap="round"
                  style={{ filter: "blur(0.5px)" }}
                />
                <line
                  x1={x0 + 30}
                  y1={y0 + 30}
                  x2={x0 + 540 - k * 30}
                  y2={y0 - 120 - k * 20}
                  stroke="#DC2626"
                  strokeWidth={2.5 - k * 0.5}
                  strokeLinecap="round"
                  opacity={0.7}
                  style={{ filter: "blur(0.5px)" }}
                />
              </g>
            );
          })}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
