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
import { HumanBase } from "../components/stock/HumanBase";
import { LavenderGhostRig } from "../components/stock/LavenderGhostRig";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene6SplitOutro (frames 2145–2504, local 0–359) — Cierre y Debate.
 *
 * Pantalla dividida diagonal limpia (haz violeta #A78BFA / índigo #4F46E5 con
 * clipPath) enfrentando dos lecturas:
 *   - Izquierda (MITO MALDITO · 1996): entidad glitch_731 + Game Boy retro
 *     encendida en esmeralda #84CC16.
 *   - Derecha (PSICOACÚSTICA REAL): niño con audífonos + onda disonante
 *     cian/violeta.
 * Tipografía cinética centrada en zona segura y cierre con CTA.
 */

const OUTLINE = "#090A12";

/** Game Boy retro compacta encendida en esmeralda. */
const RetroGameBoy: React.FC<{ frame: number; width: number }> = ({ frame, width }) => {
  const h = (width * 480) / 320;
  const led = 0.55 + 0.45 * Math.max(0, Math.sin(frame * 0.2));
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.09);
  return (
    <svg
      viewBox="0 0 320 480"
      width={width}
      height={h}
      style={{ overflow: "visible", filter: `drop-shadow(0 0 ${14 + glow * 16}px rgba(132,204,22,${0.35 + glow * 0.3}))` }}
    >
      <rect x="10" y="10" width="300" height="460" rx="36" fill="#1B2A1D" stroke={OUTLINE} strokeWidth="5" />
      <rect x="40" y="48" width="240" height="210" rx="16" fill="#0A140B" stroke={OUTLINE} strokeWidth="4" />
      <rect x="52" y="60" width="216" height="186" rx="6" fill="#071208" stroke="#84CC16" strokeWidth="3" />
      {/* Pantalla esmeralda con destello */}
      <rect x="52" y="60" width="216" height="186" rx="6" fill="rgba(132,204,22,0.22)" opacity={0.5 + glow * 0.4} />
      {/* Silueta 8-bit de la torre */}
      <g fill="#84CC16">
        <rect x="128" y="196" width="64" height="16" />
        <rect x="136" y="168" width="48" height="28" />
        <rect x="144" y="140" width="32" height="28" />
        <rect x="152" y="112" width="16" height="28" />
        <rect x="157" y="88" width="6" height="24" />
      </g>
      <circle cx="58" cy="34" r="6" fill="#84CC16" opacity={led} />
      <g fill="#25382A" stroke="#0C0D12" strokeWidth="2">
        <rect x="78" y="318" width="24" height="84" rx="6" />
        <rect x="48" y="336" width="84" height="48" rx="6" />
      </g>
      <circle cx="216" cy="316" r="22" fill="#3C6B28" stroke="#0C0D12" strokeWidth="3" />
      <circle cx="250" cy="372" r="22" fill="#3C6B28" stroke="#0C0D12" strokeWidth="3" />
    </svg>
  );
};

/** Onda sonora disonante cian/violeta. */
const DissonantWave: React.FC<{ frame: number }> = ({ frame }) => {
  const a = 12 + Math.sin(frame * 0.18) * 6;
  let d = "M 0 40";
  for (let x = 8; x <= 280; x += 8) {
    const yy = 40 + Math.sin(x * 0.16 + frame * 0.22) * a + Math.sin(x * 0.32 - frame * 0.12) * (a * 0.5);
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return (
    <svg viewBox="0 0 280 80" width="100%" height="100%" style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.6))" }} />
      <path d={d} fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" transform="translate(0,2)" />
    </svg>
  );
};

/** Título cinético superior (fase 0–185 vs 185–359). */
const KineticTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const t1In = interpolate(frame, [6, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t1Out = interpolate(frame, [170, 186], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t2In = interpolate(frame, [188, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headphonePop = spring({
    frame: frame - 210,
    fps,
    config: { damping: 13, mass: 0.7, stiffness: 120 },
  });
  const headphoneScale = Math.min(1, headphonePop);
  const hpPulse = 1 + Math.sin(frame * 0.1) * 0.06;

  return (
    <SafeCentered top={360} zIndex={8} maxWidth={720}>
      <div style={{ position: "relative", height: 155 }}>
        {/* Título 1: ¿MALDICIÓN O PSICOACÚSTICA? */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: t1In * t1Out }}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 900,
              fontSize: 58,
              lineHeight: 1.08,
              letterSpacing: 1,
              color: "#F2EFE9",
              textShadow: "0 2px 22px rgba(0,0,0,0.9)",
            }}
          >
            <span style={{ color: "#DC2626", textShadow: "0 0 24px rgba(220,38,38,0.45)" }}>
              MALDICIÓN
            </span>{" "}
            <span style={{ color: "#F2EFE9", opacity: 0.75 }}>O</span>{" "}
            <span style={{ color: "#22D3EE", textShadow: "0 0 24px rgba(34,211,238,0.45)" }}>
              PSICOACÚSTICA
            </span>
            <span style={{ color: "#F2EFE9" }}>?</span>
          </div>
          <div
            style={{
              margin: "14px auto 0",
              width: 300,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
            }}
          />
        </div>

        {/* Título 2: ¿LA ESCUCHARÍAS CON AUDÍFONOS? */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: t2In }}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1.1,
              letterSpacing: 1,
              color: "#F2EFE9",
              textShadow: "0 2px 22px rgba(0,0,0,0.9)",
              transform: `scale(${0.92 + headphoneScale * 0.08})`,
            }}
          >
            ¿LA ESCUCHARÍAS CON{" "}
            <span style={{ color: "#FDE047", textShadow: "0 0 26px rgba(253,224,71,0.5)" }}>
              AUDÍFONOS
            </span>
            ?
          </div>
          {/* Icono de audífonos pulsando */}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `scale(${hpPulse})`, opacity: t2In }}>
              <svg viewBox="0 0 80 80" width={54} height={54}>
                <path
                  d="M 14 34 L 14 40 C 14 54, 66 54, 66 40 L 66 34"
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <rect x="6" y="26" width="16" height="26" rx="7" fill="#FDE047" />
                <rect x="58" y="26" width="16" height="26" rx="7" fill="#FDE047" />
                <circle cx="14" cy="39" r="3" fill="#040507" />
                <circle cx="66" cy="39" r="3" fill="#040507" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </SafeCentered>
  );
};

export const Scene6SplitOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // La división diagonal se asienta tras la transición (0–24).
  const settle = interpolate(frame, [0, 24], [0.4, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Pulso de la etiqueta izquierda.
  const leftLabelIn = interpolate(frame, [24, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightLabelIn = interpolate(frame, [34, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgDrift = Math.sin(frame * 0.004) * 6;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Fondo vectorial + parallax */}
      <AbsoluteFill style={{ transform: `translate(${bgDrift}px, 0px) scale(1.06)` }}>
        <Img
          src={staticFile("backgrounds/bg_s6.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* División diagonal con clipPath + tintes */}
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="s6-left-clip">
            <polygon points="0,0 640,0 280,1920 0,1920" />
          </clipPath>
          <clipPath id="s6-right-clip">
            <polygon points="640,0 1080,0 1080,1920 280,1920" />
          </clipPath>
          <linearGradient id="s6-beam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Tinte izquierdo violeta */}
        <g clipPath="url(#s6-left-clip)">
          <rect x="0" y="0" width="1080" height="1920" fill="rgba(167,139,250,0.14)" />
        </g>
        {/* Tinte derecho índigo */}
        <g clipPath="url(#s6-right-clip)">
          <rect x="0" y="0" width="1080" height="1920" fill="rgba(79,70,229,0.16)" />
        </g>

        {/* Haz diagonal luminoso */}
        <line
          x1="640"
          y1="-40"
          x2="280"
          y2="1960"
          stroke="url(#s6-beam)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity={settle}
          style={{ filter: "drop-shadow(0 0 26px rgba(167,139,250,0.85))" }}
        />
        {/* Pulso viajero a lo largo del haz */}
        {(() => {
          const t = (frame * 0.025) % 1;
          const bx = 640 - (640 - 280) * t;
          const by = -40 + (1960 - -40) * t;
          return (
            <circle
              cx={bx}
              cy={by}
              r="7"
              fill="#EDE9FE"
              opacity={settle * 0.9}
              style={{ filter: "drop-shadow(0 0 14px rgba(237,233,254,0.9))" }}
            />
          );
        })()}
      </svg>

      {/* LADO IZQUIERDO — MITO MALDITO · 1996 */}
      <div style={{ position: "absolute", left: 60, top: 570, width: 400, height: 580 }}>
        <LavenderGhostRig
          mode="glitch_731"
          pose="split_reveal"
          intensity={0.92}
          idPrefix="s6-ghost"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ position: "absolute", left: 150, top: 1110, width: 130, height: 195 }}>
        <RetroGameBoy frame={frame} width={130} />
      </div>
      <div style={{ position: "absolute", top: 540, left: 82, opacity: leftLabelIn }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 3,
            color: "#84CC16",
            textShadow: "0 0 18px rgba(132,204,22,0.5)",
          }}
        >
          MITO MALDITO
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 15, letterSpacing: 4, color: "rgba(242,239,233,0.7)", marginTop: 6 }}>
          · 1996 ·
        </div>
      </div>

      {/* LADO DERECHO — PSICOACÚSTICA REAL */}
      <div style={{ position: "absolute", left: 640, top: 610, width: 270, height: 480 }}>
        <HumanBase
          variant="kid_96"
          pose="standing"
          emotion="uneasy"
          headphones
          facing="left"
          rimColor="#22D3EE"
          rimIntensity={0.85}
          showShadow
          idPrefix="s6-kid"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ position: "absolute", left: 620, top: 1090, width: 290, height: 83 }}>
        <DissonantWave frame={frame} />
      </div>
      <div style={{ position: "absolute", top: 540, right: 175, opacity: rightLabelIn, textAlign: "right" }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#22D3EE",
            textShadow: "0 0 18px rgba(34,211,238,0.5)",
          }}
        >
          PSICOACÚSTICA
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 15, letterSpacing: 4, color: "rgba(242,239,233,0.7)", marginTop: 6 }}>
          REAL
        </div>
      </div>

      {/* Tipografía cinética centrada */}
      <KineticTitle frame={frame} fps={fps} />

      {/* Viñeta */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 56%, rgba(2,3,5,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
