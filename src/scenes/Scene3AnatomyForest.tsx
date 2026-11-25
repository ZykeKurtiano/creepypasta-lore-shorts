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
import { RakeModelRig } from "../components/characters/RakeModelRig";
import { FONT_MONO } from "../components/SafeZone";

/**
 * Scene3AnatomyForest (frames 853–1089, 28.43–36.30s) — Anatomía de la
 * criatura en el bosque de pinos del norte de Nueva York.
 *
 * 3 planos: Plano Medio-General entre niebla (callouts anatómicos) →
 * Macro-Zoom 2.7x a las cuencas vacías (retícula OPTIC CAVITIES) →
 * Macro-Zoom 2.8x a las garras (retícula CLAWS + rasguños, preparando
 * el Claw-Swipe Wipe hacia Escena 4).
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

// Puntos anatómicos en coordenadas del lienzo (modelo closeup_claws).
const FACE = { x: 539, y: 628 }; // cuencas negras vacías
const HANDS = { x: 813, y: 1059 }; // manos con garras

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
  const s =
    frame < 96
      ? interpolate(frame, [0, 96], [1, 1.15], {
          easing: Easing.out(Easing.cubic),
          ...CLAMP,
        })
      : frame < 152
        ? interpolate(frame, [96, 152], [1.15, 2.7], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [152, 236], [2.7, 2.8], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const px =
    frame < 96
      ? OX
      : frame < 152
        ? interpolate(frame, [96, 152], [OX, FACE.x], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [152, 236], [FACE.x, HANDS.x], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const py =
    frame < 96
      ? OY
      : frame < 152
        ? interpolate(frame, [96, 152], [OY, FACE.y], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [152, 236], [FACE.y, HANDS.y], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const sx =
    frame < 152
      ? OX
      : interpolate(frame, [152, 236], [OX, 560], {
          easing: Easing.inOut(Easing.cubic),
          ...CLAMP,
        });

  const sy =
    frame < 96
      ? OY
      : frame < 152
        ? interpolate(frame, [96, 152], [OY, 640], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [152, 236], [640, 1040], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const TX = sx - (px * s + OX * (1 - s));
  const TY = sy - (py * s + OY * (1 - s));

  // Posición en pantalla de los puntos anatómicos (screen = (q - p)*s + S).
  const faceSX = (FACE.x - px) * s + sx;
  const faceSY = (FACE.y - py) * s + sy;
  const handSX = (HANDS.x - px) * s + sx;
  const handSY = (HANDS.y - py) * s + sy;
  const bodySX = (540 - px) * s + sx;
  const bodySY = (940 - py) * s + sy;

  // --- Ventanas de los planos ---
  const calloutOp = interpolate(frame, [8, 40, 90, 100], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const opticOp = interpolate(frame, [96, 110, 146, 156], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const clawOp = interpolate(frame, [152, 168], [0, 1], { ...CLAMP });

  // --- Espasmos al mencionar las garras (local 149–225) ---
  const spasm = interpolate(frame, [150, 225], [0.1, 0.7], { ...CLAMP });

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
          transformOrigin: "50% 50%",
        }}
      >
        {/* 1. Background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s3.png")}
            style={{
              position: "absolute",
              width: "112%",
              height: "112%",
              left: "-6%",
              top: "-6%",
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

        {/* 3. The Rake (closeup_claws) centrado */}
        <RakeModelRig
          variant="closeup_claws"
          width={780}
          x={540}
          y={1350}
          rimColor="rgba(147,197,253,0.55)"
          breathingIntensity={1.2}
          spasmIntensity={spasm}
          eyeGlow={0.9}
          eyeColor="#F8FAFC"
          showFloorShadow
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
            d={`M 240 540 L ${bodySX.toFixed(0)} ${bodySY.toFixed(0)}`}
            stroke="rgba(242,239,233,0.55)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx={bodySX} cy={bodySY} r="5" fill="#F2EFE9" opacity="0.7" />
          {/* SIN PELO / ENCORVADO → cabeza */}
          <path
            d={`M 820 470 L ${faceSX.toFixed(0)} ${faceSY.toFixed(0)}`}
            stroke="rgba(242,239,233,0.55)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx={faceSX} cy={faceSY} r="5" fill="#F2EFE9" opacity="0.7" />
        </svg>

        <div
          style={{
            position: "absolute",
            left: 70,
            top: 520,
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
          <div
            style={{
              marginTop: 4,
              fontSize: 15,
              letterSpacing: 3,
              color: "rgba(147,197,253,0.85)",
            }}
          >
            SIN PELO — ENCORVADO
          </div>
        </div>
      </div>

      {/* Retícula de cuencas ópticas (Plano 2) */}
      <Reticle
        x={faceSX}
        y={faceSY}
        r={150}
        label="OPTIC CAVITIES // HOLLOW"
        sub="CUENCAS NEGRAS VACÍAS"
        opacity={opticOp}
        rotate={frame * 0.5}
      />

      {/* Retícula de garras (Plano 3) */}
      <Reticle
        x={handSX}
        y={handSY}
        r={170}
        label="CLAWS // ELONGATED"
        sub="GARRAS LARGUÍSIMAS"
        opacity={clawOp}
        rotate={-frame * 0.4}
        color="#FDE047"
        labelAbove
      />

      {/* Rasguños carmesí al decir "garras larguísimas" (191–225) */}
      {frame >= 191 ? (
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[0, 1, 2].map((k) => {
            const o = interpolate(
              frame,
              [191 + k * 10, 199 + k * 10, 224 + k * 10],
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
