import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TailsDollCharacter } from "../components/characters/TailsDollCharacter";
import { SafeCentered, FONT_SANS } from "../components/SafeZone";

/**
 * Scene6SplitDebateOutro (frames locales 0–286 · 9.53s).
 *
 * Cierre y debate: ¿mito retro o maldición? Pantalla dividida diagonal:
 *  - Mitad Izquierda (MODELO 3D · 1997): cuadrícula retro Sega Saturn en
 *    azul/cian con Tails Doll en mode lowpoly1997 girando suavemente.
 *  - Mitad Derecha (ENTIDAD MALDITA): abismo carmesí/negro con Tails Doll
 *    en mode plush hiperdetallado, gema roja iluminando las costuras.
 *  - Pregunta cinética centrada en Zona Segura (¿MITO RETRO / O MALDICIÓN?).
 *  - Cierre atmosférico final (240–286): la gema roja palpita una última vez.
 */

// --- Partículas carmesí ascendentes ----------------------------------------

const RED_PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  x: 620 + random(i * 3 + 1) * 420,
  y0: 400 + random(i * 7 + 2) * 1300,
  r: 1.5 + random(i * 5 + 3) * 2.4,
  speed: 0.4 + random(i * 9 + 4) * 0.7,
  phase: random(i * 13 + 5) * 400,
}));

const GRID_LINES = Array.from({ length: 14 }, (_, i) => i / 13);

export const Scene6SplitDebateOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Emergencia desde el flash diagonal (0–22).
  const emerge = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // La mitad derecha gana terreno (100–200) empujando la diagonal a la izquierda.
  const push = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 90 },
  });

  const topX = 780 - push * 80;
  const botX = 300 - push * 80;

  // Acercamiento dramático global (1.0x → 1.18x).
  const wholeScale = interpolate(frame, [10, 100, 200], [1, 1.06, 1.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Macro-Push hacia el rostro/gema del lado derecho (210–275).
  const rightMacro = spring({
    frame: frame - 210,
    fps,
    config: { damping: 200, mass: 0.55, stiffness: 100 },
  });

  // Pregunta cinética con entrada escalonada (110–155).
  const q1 = spring({
    frame: frame - 110,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 130 },
  });
  const q2 = spring({
    frame: frame - 128,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 130 },
  });

  // Pulso final de la gema roja (240–286).
  const finalPulse = interpolate(frame, [240, 286], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const finalGlow = 0.3 + 0.7 * Math.abs(Math.sin((frame - 240) * 0.35));

  // División cromática de la línea divisoria.
  const dividerGlow = 0.5 + 0.5 * Math.sin(frame * 0.3);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Contenedor con acercamiento global */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${wholeScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ===================== MITAD IZQUIERDA · MODELO 3D 1997 ===================== */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(0px 0px, ${topX}px 0px, ${botX}px 1920px, 0px 1920px)`,
          }}
        >
          {/* Fondo retro de cuadrícula 3D Sega Saturn */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, #070B16 0%, #0A1424 45%, #123048 78%, #081018 100%)",
            }}
          />
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            {GRID_LINES.map((t, i) => {
              const y = 700 + Math.pow(t, 2) * 1180;
              return (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="1080"
                  y2={y}
                  stroke="#22D3EE"
                  strokeWidth={0.6 + t * 1.8}
                  opacity={0.10 + t * 0.36}
                />
              );
            })}
            {Array.from({ length: 11 }, (_, i) => {
              const x = 100 + i * 88;
              return (
                <line
                  key={i}
                  x1="540"
                  y1="700"
                  x2={x * 2.2 - 540}
                  y2="1920"
                  stroke="#22D3EE"
                  strokeWidth="1"
                  opacity="0.2"
                />
              );
            })}
          </svg>
          {/* Tails Doll lowpoly1997 girando suavemente (bajado, sin superponer) */}
          <div
            style={{
              position: "absolute",
              left: 380 - 150,
              top: 693,
              width: 300,
              height: 480,
              transform: `rotate(${Math.sin(frame * 0.05) * 8}deg)`,
            }}
          >
            <TailsDollCharacter
              x={150}
              y={240}
              scale={0.85}
              mode="lowpoly1997"
              gemIntensity={0.5}
              hoverAmp={0.4}
              headTiltDeg={Math.sin(frame * 0.05) * 6}
              rimColor="#22D3EE"
            />
          </div>
        </AbsoluteFill>

        {/* ===================== MITAD DERECHA · ENTIDAD MALDITA ===================== */}
        <AbsoluteFill
          style={{
            clipPath: `polygon(${topX}px 0px, 1080px 0px, 1080px 1920px, ${botX}px 1920px)`,
            transform: `scale(${1 + rightMacro * 0.14})`,
            transformOrigin: "70% 43%",
          }}
        >
          {/* Fondo abisal carmesí/negro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, #040507 0%, #0C0506 40%, #1A0A0B 72%, #040507 100%)",
            }}
          />
          {/* Bruma carmesí */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 70% 45%, rgba(127,29,29,0.5), transparent 70%)",
            }}
          />
          {/* Tails Doll plush hiperdetallado (bajado, sin superponer) */}
          <div
            style={{
              position: "absolute",
              left: 810 - 172,
              top: 693,
              width: 344,
              height: 494,
            }}
          >
            <TailsDollCharacter
              x={172}
              y={240}
              scale={0.85}
              mode="plush"
              gemIntensity={1.45}
              hoverAmp={0.5}
              headTiltDeg={-8}
              rimColor="#DC2626"
            />
          </div>
          {/* Pulso final de la gema (cierre atmosférico) */}
          {finalPulse > 0.004 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 70% 38%, rgba(220,38,38,0.55), transparent 60%)",
                opacity: finalPulse * finalGlow,
              }}
            />
          ) : null}
        </AbsoluteFill>

        {/* Línea divisoria diagonal luminosa */}
        <svg
          viewBox="0 0 1080 1920"
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <line
            x1={topX}
            y1="0"
            x2={botX}
            y2="1920"
            stroke="#F2EFE9"
            strokeWidth="3"
            opacity={0.4 + dividerGlow * 0.3}
          />
          <line
            x1={topX}
            y1="0"
            x2={botX}
            y2="1920"
            stroke="#DC2626"
            strokeWidth="10"
            opacity={0.15 + dividerGlow * 0.2}
          />
          <line
            x1={topX}
            y1="0"
            x2={botX}
            y2="1920"
            stroke="#22D3EE"
            strokeWidth="6"
            opacity={0.12 + dividerGlow * 0.15}
          />
        </svg>
      </div>

      {/* Partículas carmesí ascendentes */}
      {RED_PARTICLES.map((p, i) => {
        const y = 1920 - ((frame * p.speed + p.phase) % 1500);
        const op = 0.10 + 0.35 * Math.abs(Math.sin(frame * 0.06 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: p.x,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: p.r,
              background: "#DC2626",
              opacity: op,
              boxShadow: "0 0 8px rgba(220,38,38,0.6)",
            }}
          />
        );
      })}

      {/* Pregunta cinética centrada en Zona Segura */}
      <SafeCentered top={332} zIndex={35}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 82,
              color: "#F2EFE9",
              transform: `scale(${0.85 + q1 * 0.15}) translateY(${(1 - q1) * 20}px)`,
              opacity: emerge * Math.min(1, q1 * 1.4),
              textShadow: "0 0 26px rgba(34,211,238,0.5), 0 4px 18px rgba(0,0,0,0.9)",
            }}
          >
            ¿MITO RETRO
          </div>
          <div
            style={{
              fontSize: 96,
              color: "#DC2626",
              transform: `scale(${0.85 + q2 * 0.15}) translateY(${(1 - q2) * 20}px)`,
              opacity: emerge * Math.min(1, q2 * 1.4),
              textShadow: "0 0 30px rgba(220,38,38,0.7), 0 4px 18px rgba(0,0,0,0.9)",
            }}
          >
            O MALDICIÓN?
          </div>
        </div>
      </SafeCentered>

      {/* Emergencia del flash diagonal (entrada) */}
      {emerge < 1 ? (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(135deg, rgba(252,165,165,0.9) 0%, rgba(220,38,38,0.7) 40%, rgba(127,29,29,0.9) 70%, #040507 100%)",
            opacity: 1 - emerge,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
