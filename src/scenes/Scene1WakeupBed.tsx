import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RakeModelRig } from "../components/characters/RakeModelRig";
import { WitnessModelRig } from "../components/characters/WitnessModelRig";
import { FONT_MONO, SafeCentered } from "../components/SafeZone";

/**
 * Scene1WakeupBed (frames 0–177, 0.00–5.90s) — El Despertar al Pie de la Cama.
 *
 * Dormitorio 3 AM: testigo en pánico en la cama (derecha), The Rake
 * agazapado al pie (izquierda/inferior) en penumbra. Coreografía de cámara
 * en 3 planos: Plano General (zoom lento) → Macro-Zoom 2.4x a los ojos →
 * Whip-Pan cinematográfico al pie de la cama (preparando el Claw-Swipe).
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

// Motas de polvo iluminadas por la luna (deterministas).
const DUST = Array.from({ length: 34 }, (_, i) => ({
  x: 90 + random(i * 3 + 1) * 900,
  y0: 360 + random(i * 7 + 2) * 1000,
  r: 1.4 + random(i * 5 + 3) * 2.8,
  speed: 0.07 + random(i * 9 + 4) * 0.15,
  phase: random(i * 13 + 5) * 1200,
  sway: (random(i * 11 + 7) - 0.5) * 26,
}));

export const Scene1WakeupBed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Coreografía de cámara en 3 planos -----------------------------
  // Punto objetivo (px,py) en el mundo → punto (sx,sy) en pantalla con escala s.
  const s =
    frame < 62
      ? interpolate(frame, [0, 62], [1, 1.12], {
          easing: Easing.out(Easing.cubic),
          ...CLAMP,
        })
      : frame < 124
        ? interpolate(frame, [62, 124], [1.12, 2.4], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [124, 177], [2.4, 1.55], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const px =
    frame < 62
      ? OX
      : frame < 124
        ? interpolate(frame, [62, 124], [OX, 645], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [124, 177], [645, 330], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const py =
    frame < 62
      ? OY
      : frame < 124
        ? interpolate(frame, [62, 124], [OY, 721], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [124, 177], [721, 1050], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  const sx =
    frame < 124
      ? OX
      : interpolate(frame, [124, 177], [OX, 500], {
          easing: Easing.inOut(Easing.cubic),
          ...CLAMP,
        });

  const sy =
    frame < 62
      ? OY
      : frame < 124
        ? interpolate(frame, [62, 124], [OY, 721], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          })
        : interpolate(frame, [124, 177], [721, 1180], {
            easing: Easing.inOut(Easing.cubic),
            ...CLAMP,
          });

  // Aceleración final (últimos 10 frames) preparando el Claw-Swipe.
  const accel =
    frame >= 167
      ? interpolate(frame, [167, 177], [0, 1], {
          easing: Easing.in(Easing.quad),
          ...CLAMP,
        })
      : 0;

  const TX = sx - (px * s + OX * (1 - s)) - accel * 72;
  const TY = sy - (py * s + OY * (1 - s)) + accel * 20;

  // --- Testigo: se incorpora con sobresalto al decir "despertaste" ---
  const startle =
    frame >= 15
      ? spring({
          frame: frame - 15,
          fps,
          config: { damping: 14, stiffness: 150, mass: 0.7 },
        })
      : 0;
  const panicLevel = interpolate(frame, [15, 130], [0.3, 1], { ...CLAMP });

  // --- Criatura: emerge de la penumbra durante el whip-pan -----------
  const rakeReveal = interpolate(frame, [124, 165], [0.25, 1], { ...CLAMP });
  const rakeEye = interpolate(frame, [124, 160], [0, 1], { ...CLAMP });
  const rakeSpasm = interpolate(frame, [124, 177], [0, 0.55], { ...CLAMP });

  // --- Reloj HUD diegético -------------------------------------------
  const clockFade = interpolate(frame, [62, 82], [1, 0], { ...CLAMP });
  const clockBlink = 0.72 + 0.28 * Math.sin(frame * 0.35);

  // --- Parallax lento del fondo --------------------------------------
  const bgDrift = Math.sin(frame * 0.011) * 6;

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
        {/* 1. Background con sobrescala para parallax */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s1.png")}
            style={{
              position: "absolute",
              width: "110%",
              height: "110%",
              left: "-5%",
              top: "-5%",
              objectFit: "cover",
              transform: `translate(${bgDrift.toFixed(2)}px, 0px)`,
            }}
          />
        </div>

        {/* 2. Haces volumétricos de luz lunar */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="s1-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BDE3F5" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#BDE3F5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="150,-30 300,-30 520,1520 300,1520"
            fill="url(#s1-beam)"
            opacity="0.5"
          />
          <polygon
            points="360,-30 460,-30 700,1520 560,1520"
            fill="url(#s1-beam)"
            opacity="0.32"
          />
        </svg>

        {/* 3. Testigo en la cama (derecha/centro-derecha) */}
        <WitnessModelRig
          variant="bed_panic"
          width={740}
          x={650}
          y={1360}
          panicLevel={panicLevel}
          startleProgress={startle}
          rimColor="rgba(125,211,252,0.45)"
          showFloorShadow
        />

        {/* 4. The Rake agazapado al pie (penumbra → revelación) */}
        <RakeModelRig
          variant="crouched"
          width={540}
          x={300}
          y={1450}
          opacity={rakeReveal}
          eyeGlow={rakeEye}
          eyeColor="#FDE047"
          rimColor="rgba(148,197,255,0.4)"
          spasmIntensity={rakeSpasm}
          showFloorShadow
          brightness={0.8}
        />

        {/* 5. Polvo iluminado por la luna */}
        {DUST.map((d, i) => {
          const y = d.y0 - ((frame * d.speed + d.phase) % 1200);
          const x = d.x + Math.sin(frame * 0.02 + i * 1.3) * d.sway;
          const op = 0.06 + 0.18 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
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

        {/* 6. Marco de cabecera/sombra desenfocada en bordes */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -70,
            width: 150,
            background: "#020306",
            filter: "blur(10px)",
            opacity: 0.92,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: -70,
            width: 150,
            background: "#020306",
            filter: "blur(10px)",
            opacity: 0.92,
          }}
        />
      </div>

      {/* Reloj despertador digital rojo tenue (fijo a pantalla, se desvanece
          al entrar el Macro-Zoom) */}
      <SafeCentered top={345} zIndex={6}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONT_MONO,
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#DC2626",
            textShadow:
              "0 0 18px rgba(220,38,38,0.6), 0 0 40px rgba(220,38,38,0.3)",
            opacity: clockFade * clockBlink,
            background: "rgba(4,5,7,0.55)",
            padding: "10px 24px",
            borderRadius: 12,
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          03:14 <span style={{ opacity: 0.6 }}>AM</span>
        </div>
      </SafeCentered>

      {/* Destellos de rasguño carmesí preparando el Claw-Swipe Wipe */}
      {frame >= 165 ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {[0, 1, 2].map((k) => {
            const o = interpolate(
              frame,
              [165 + k * 2, 172 + k * 2],
              [0, 0.8],
              { ...CLAMP }
            );
            const x0 = 860 + k * 30;
            const y0 = 700 + k * 260;
            return (
              <line
                key={k}
                x1={x0}
                y1={y0}
                x2={x0 - 380}
                y2={y0 + 120 + k * 40}
                stroke="#DC2626"
                strokeWidth={3 - k * 0.6}
                strokeLinecap="round"
                opacity={o}
                style={{ filter: "blur(0.5px)" }}
              />
            );
          })}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
