import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HumanBase } from "../components/stock/HumanBase";
import { LavenderGhostRig } from "../components/stock/LavenderGhostRig";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene2LavenderTower (frames 556–1082, local 0–526) — La Torre Pokémon y los Síntomas.
 *
 * Micro-beats:
 *   - 0–190   : Plano General de la Torre + LavenderGhostRig (tower_shadow/looming)
 *               y badge "7 · 12 AÑOS · PUEBLO LAVANDA".
 *   - 190–410 : Panel dividido: niño (hands_on_ears, headache, nosebleed) a la
 *               izquierda; tarjetas vectoriales (reloj 03:17 AM, ondas de migraña,
 *               alerta CASOS INEXPLICABLES) a la derecha con spring.
 *   - 410–526 : Ventana diegética retro Game Boy "PARTIDA GUARDADA: PUEBLO LAVANDA"
 *               con cursor parpadeante y zoom suave.
 */

/** Capas de bruma violeta en paralaje (deterministas). */
const FOG = [
  { top: 520, left: -120, w: 700, h: 520, drift: 0.006, phase: 0, op: 0.16 },
  { top: 880, left: 420, w: 760, h: 560, drift: 0.008, phase: 1.4, op: 0.13 },
  { top: 640, left: 120, w: 820, h: 600, drift: 0.005, phase: 2.2, op: 0.1 },
];

const DigitalClock: React.FC<{ frame: number }> = ({ frame }) => {
  const colon = 0.25 + 0.75 * Math.max(0, Math.sin(frame * 0.35));
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: 4,
        color: "#DC2626",
        textShadow: "0 0 18px rgba(220,38,38,0.55)",
      }}
    >
      03<span style={{ opacity: colon }}>:</span>17<span style={{ opacity: colon }}> AM</span>
    </div>
  );
};

const MigraineWaves: React.FC<{ frame: number }> = ({ frame }) => {
  const amp = Math.sin(frame * 0.06);
  return (
    <svg viewBox="0 0 200 72" width="200" height="72" style={{ overflow: "visible" }}>
      <path
        d={`M 0 36 L 22 36 L 34 ${36 - 20 - amp * 6} L 46 ${36 + 20 + amp * 6} L 58 ${36 - 26 - amp * 5} L 70 ${36 + 24 + amp * 7} L 82 ${36 - 18 - amp * 4} L 94 36 L 200 36`}
        fill="none"
        stroke="#DC2626"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,0.5))" }}
      />
      <line x1="0" y1="36" x2="200" y2="36" stroke="rgba(220,38,38,0.18)" strokeWidth="1.5" strokeDasharray="4 6" />
    </svg>
  );
};

const Card: React.FC<{
  frame: number;
  at: number;
  fps: number;
  children: React.ReactNode;
}> = ({ frame, at, fps, children }) => {
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 110 },
  });
  const scale = Math.min(1, p);
  const opacity = interpolate(frame, [at, at + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - scale) * 26}px) scale(${scale})`,
        transformOrigin: "50% 50%",
        background: "rgba(10,9,22,0.78)",
        border: "1px solid rgba(167,139,250,0.25)",
        borderRadius: 14,
        padding: "18px 22px",
        boxShadow: "0 14px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(167,139,250,0.05)",
        backdropFilter: "blur(4px)",
      }}
    >
      {children}
    </div>
  );
};

export const Scene2LavenderTower: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Curvas de opacidad por micro-beat.
  const wideDim = interpolate(frame, [190, 240], [1, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const splitIn = interpolate(frame, [190, 228], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const splitOut = interpolate(frame, [410, 446], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gameWin = interpolate(frame, [410, 442], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nosebleed = interpolate(frame, [245, 315], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Zoom suave de la ventana retro.
  const winZoom = 1 + interpolate(frame, [410, 526], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursor = 0.15 + 0.85 * Math.max(0, Math.sin(frame * 0.42));

  const bgDriftX = Math.sin(frame * 0.006) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Fondo vectorial + parallax */}
      <AbsoluteFill style={{ transform: `translate(${bgDriftX}px, 0px) scale(1.05)` }}>
        <Img
          src={staticFile("backgrounds/bg_s2.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Bruma violeta en paralaje */}
      {FOG.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: f.top,
            left: f.left + Math.sin(frame * f.drift + f.phase) * 60,
            width: f.w,
            height: f.h,
            background:
              "radial-gradient(ellipse at center, rgba(167,139,250,0.34), rgba(36,27,58,0.14) 60%, transparent 75%)",
            filter: "blur(28px)",
            opacity: f.op,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Plano General: torre + entidad (se atenúa al entrar el panel) */}
      <AbsoluteFill style={{ opacity: wideDim }}>
        <div style={{ position: "absolute", left: 270, top: 300, width: 540, height: 783 }}>
          <LavenderGhostRig
            mode="tower_shadow"
            pose="looming"
            intensity={0.9}
            idPrefix="s2-ghost"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <SafeCentered top={358} zIndex={5}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(4,5,7,0.72)",
              padding: "8px 20px",
              borderRadius: 10,
              boxShadow: "0 4px 24px rgba(0,0,0,0.55)",
              fontFamily: FONT_SANS,
              fontWeight: 800,
              fontSize: 34,
              letterSpacing: 4,
              color: "#F2EFE9",
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            <span style={{ color: "#FDE047" }}>7 · 12 AÑOS</span>{" "}
            <span style={{ color: "#A78BFA" }}>·</span>{" "}
            <span style={{ color: "#C4B5FD" }}>PUEBLO LAVANDA</span>
            <div
              style={{
                margin: "12px auto 0",
                width: 260,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.7), transparent)",
              }}
            />
          </div>
        </SafeCentered>
      </AbsoluteFill>

      {/* Panel dividido: síntomas (190–410) */}
      <AbsoluteFill style={{ opacity: splitIn * splitOut }}>
        {/* Niño con migraña a la izquierda */}
        <div style={{ position: "absolute", left: 96, top: 900, width: 330, height: 587 }}>
          <HumanBase
            variant="kid_96"
            pose="hands_on_ears"
            emotion="headache"
            headphones
            nosebleed={nosebleed}
            facing="right"
            rimColor="#DC2626"
            rimIntensity={0.85}
            showShadow
            idPrefix="s2-kid"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Tarjetas vectoriales a la derecha */}
        <div
          style={{
            position: "absolute",
            top: 470,
            left: 588,
            width: 300,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <Card frame={frame} at={205} fps={fps}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, color: "rgba(242,239,233,0.6)", marginBottom: 8 }}>
              INSOMNIO
            </div>
            <DigitalClock frame={frame} />
          </Card>

          <Card frame={frame} at={235} fps={fps}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, color: "rgba(242,239,233,0.6)", marginBottom: 10 }}>
              MIGRAÑA
            </div>
            <MigraineWaves frame={frame} />
          </Card>

          <Card frame={frame} at={265} fps={fps}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                lineHeight: 1.2,
                color: "#DC2626",
                textShadow: "0 0 16px rgba(220,38,38,0.4)",
              }}
            >
              CASOS
              <br />
              INEXPLICABLES
            </div>
          </Card>
        </div>
      </AbsoluteFill>

      {/* Ventana diegética retro Game Boy (410–526) */}
      <SafeCentered top={375} zIndex={8}>
        <div style={{ opacity: gameWin, transform: `scale(${winZoom})` }}>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(180deg, #1A1E28, #0C0F16)",
              borderRadius: 22,
              border: "4px solid #090B12",
              padding: 22,
              boxShadow: "0 24px 70px rgba(0,0,0,0.7)",
            }}
          >
            {/* Pantalla verde */}
            <div
              style={{
                width: 636,
                minHeight: 320,
                borderRadius: 14,
                border: "4px solid #050A06",
                background: "linear-gradient(180deg, #0D2410, #071208)",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.7), 0 0 40px rgba(132,204,22,0.25)",
                padding: "26px 30px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  letterSpacing: 3,
                  color: "rgba(132,204,22,0.55)",
                  marginBottom: 22,
                }}
              >
                — SAVE DATA —
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "#D9F99D",
                  lineHeight: 1.25,
                  textShadow: "0 0 12px rgba(132,204,22,0.5)",
                }}
              >
                PARTIDA GUARDADA:
                <br />
                PUEBLO LAVANDA
              </div>
              <div style={{ height: 22 }} />
              <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: "#84CC16", opacity: cursor }}>
                ▌ CONTINUAR
              </div>
            </div>
          </div>
        </div>
      </SafeCentered>

      {/* Viñeta */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
