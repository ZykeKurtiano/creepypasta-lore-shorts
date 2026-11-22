import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SmileDogCreature } from "../components/SmileDogCreature";
import { FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene4BiologicalForest (frames 1113–1347, 37.10–44.90s) — Retake
 * biológico: el bosque y la infección.
 *
 * 2.5D Bosque de pinos lluvioso en 4 capas de profundidad Z, niebla
 * volumétrica, lluvia diagonal determinista, investigador con linterna
 * cuyo haz barre la niebla y el perro infectado (husky malformado)
 * atrapado en el cono de luz con la mandíbula contrayéndose en la
 * sonrisa imposible.
 */

const pinePath = (x: number, yBase: number, h: number, w: number): string => {
  const y1 = yBase - h * 0.34;
  const y2 = yBase - h * 0.68;
  const y3 = yBase - h;
  return [
    `M ${x} ${yBase}`,
    `L ${x - w / 2} ${y1}`,
    `L ${x - w / 6} ${y1}`,
    `L ${x - w * 0.62} ${y2}`,
    `L ${x - w * 0.18} ${y2}`,
    `L ${x - w * 0.75} ${y3}`,
    `L ${x} ${y3 - h * 0.12}`,
    `L ${x + w * 0.75} ${y3}`,
    `L ${x + w * 0.18} ${y2}`,
    `L ${x + w * 0.62} ${y2}`,
    `L ${x + w / 6} ${y1}`,
    `L ${x + w / 2} ${y1}`,
    "Z",
  ].join(" ");
};

interface PineLayer {
  y: number;
  scale: number;
  fill: string;
  sway: number;
}

const PINE_LAYERS: PineLayer[] = [
  { y: 560, scale: 0.52, fill: "#0F1C26", sway: 0.5 },
  { y: 700, scale: 0.72, fill: "#0A141D", sway: 0.75 },
  { y: 880, scale: 0.98, fill: "#060B10", sway: 1.0 },
  { y: 1060, scale: 1.32, fill: "#04070B", sway: 1.35 },
];

const PINES_PER_LAYER = 11;

const RAIN = Array.from({ length: 92 }, (_, i) => ({
  x: random(i * 31 + 2) * 1120 - 20,
  len: 26 + random(i * 7 + 3) * 74,
  speed: 15 + random(i * 13 + 5) * 11,
  phase: random(i * 17 + 9) * 1920,
  w: 1.4 + random(i * 3 + 1) * 1.4,
}));

const FOG_BANKS = [
  { y: 520, s: 1.3, ph: 0 },
  { y: 860, s: 1.5, ph: 1.7 },
  { y: 1180, s: 1.8, ph: 3.1 },
];

export const Scene4BiologicalForest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mandíbula: crece durante la escena + pulsos en "infección" y "mueca".
  const baseJaw = interpolate(frame, [30, 200], [0.06, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const punchInfeccion = spring({
    frame: frame - (Math.round(39.54 * fps) - 1113),
    fps,
    config: { damping: 200 },
  });
  const punchMueca = spring({
    frame: frame - (Math.round(43.62 * fps) - 1113),
    fps,
    config: { damping: 200 },
  });
  const jawOpen = baseJaw + punchInfeccion * 0.1 + punchMueca * 0.14;

  // Haz de la linterna: barrido derecho con flicker.
  const sweep = Math.sin(frame * 0.03) * 70 + Math.sin(frame * 0.011) * 46;
  const beamFlicker =
    0.72 +
    0.28 * Math.sin(frame * 0.8) *
      (random(Math.floor(frame / 6) + 2) > 0.82 ? 0.3 : 1);

  // Parallax por capa.
  const driftFar = Math.sin(frame * 0.012) * 3;
  const driftMid = Math.sin(frame * 0.016 + 1.1) * 5;
  const driftNear = Math.sin(frame * 0.02 + 2.2) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Cielo nocturno profundo */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #0A1014 0%, #071014 45%, #05070B 100%)",
        }}
      />

      {/* 2. Niebla de horizonte gélida (#1A2E3B → #05090D) */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: 0,
          right: 0,
          height: 760,
          background:
            "linear-gradient(180deg, rgba(26,46,59,0.55) 0%, rgba(15,30,40,0.32) 42%, rgba(5,9,13,0) 78%)",
          filter: "blur(22px)",
        }}
      />

      {/* 2b. Niebla trasera */}
      {FOG_BANKS.slice(0, 2).map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: f.y,
            left: Math.sin(frame * 0.004 + f.ph) * 140 - 300,
            width: 1700,
            height: 260,
            background:
              "radial-gradient(ellipse, rgba(43,58,66,0.14), transparent 70%)",
            filter: "blur(18px)",
            transform: `scaleX(${f.s})`,
          }}
        />
      ))}

      {/* 3. Capas de pinos (4 profundidades Z) */}
      {PINE_LAYERS.map((layer, li) => {
        const drift = li === 0 ? driftFar : li === 1 ? driftMid * 0.7 : li === 2 ? driftNear * 0.5 : driftNear;
        return (
          <div
            key={li}
            style={{ position: "absolute", inset: 0, transform: `translateX(${drift}px)` }}
          >
            <svg width="1120" height="1500" viewBox="0 0 1120 1500" style={{ marginLeft: -20 }}>
              {Array.from({ length: PINES_PER_LAYER }, (_, i) => {
                const x = 40 + i * 118 + random(li * 100 + i * 7) * 70;
                const h = (240 + random(li * 50 + i * 3) * 190) * layer.scale;
                const w = (95 + random(li * 30 + i * 5) * 55) * layer.scale;
                const sway = Math.sin(frame * 0.02 + i * 0.9 + li) * layer.sway;
                return (
                  <path
                    key={i}
                    d={pinePath(x, layer.y, h, w)}
                    fill={layer.fill}
                    opacity={0.94 - li * 0.08}
                    transform={`rotate(${sway} ${x} ${layer.y})`}
                  />
                );
              })}
            </svg>
          </div>
        );
      })}

      {/* 4. Perro infectado en el cono de la linterna */}
      <div
        style={{
          position: "absolute",
          top: 660,
          left: 430,
          width: 400,
          transform: `translateX(${Math.sin(frame * 0.05) * 7}px) rotate(${Math.sin(frame * 0.03) * 2}deg)`,
        }}
      >
        <SmileDogCreature
          width={400}
          jawOpen={jawOpen}
          eyeGlow={1.45}
          variant="forest"
          style={{ left: 0, top: 0 }}
        />
        {/* Sombra de suelo */}
        <div
          style={{
            position: "absolute",
            bottom: -26,
            left: 40,
            width: 320,
            height: 30,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 70%)",
          }}
        />
      </div>

      {/* 5. Haz volumétrico de la linterna (barrido derecho, suave) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: beamFlicker,
          pointerEvents: "none",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
          <defs>
            <linearGradient id="beam-grad" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.34" />
              <stop offset="45%" stopColor="#F5E6B8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#F5E6B8" stopOpacity="0" />
            </linearGradient>
            <filter id="beam-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <polygon
            points={`300,1180 330,1174 ${1080},${880 + sweep} ${1080},${1400 + sweep * 1.4}`}
            fill="url(#beam-grad)"
            filter="url(#beam-soft)"
          />
        </svg>
        {/* Niebla iluminada flotando dentro del cono */}
        {Array.from({ length: 14 }, (_, i) => {
          const mx = 380 + random(i * 41 + 6) * 660;
          const my = 930 + random(i * 23 + 11) * 420;
          const drift = Math.sin(frame * 0.02 + i * 1.3) * 34;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: my + drift * 0.4,
                left: mx + drift,
                width: 26 + random(i * 7 + 3) * 44,
                height: 12 + random(i * 5 + 2) * 22,
                borderRadius: "50%",
                background: "rgba(245,230,184,0.10)",
                filter: "blur(5px)",
              }}
            />
          );
        })}
      </div>

      {/* 6. Investigador con linterna (primer plano izquierdo) */}
      <div
        style={{
          position: "absolute",
          top: 920,
          left: -10,
          width: 380,
          height: 700,
        }}
      >
        <svg viewBox="0 0 380 700" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Cuerpo de pie */}
          <path
            d="M 120 210
               C 130 330, 140 440, 146 560
               L 230 560
               C 234 440, 232 330, 240 220
               C 226 180, 200 170, 185 168
               C 165 168, 135 180, 120 210 Z"
            fill="#04070A"
          />
          {/* Cabeza */}
          <ellipse cx="190" cy="120" rx="46" ry="52" fill="#04070A" />
          {/* Brazo levantado con la linterna */}
          <g transform={`rotate(${Math.sin(frame * 0.05) * 1.6} 190 240)`}>
            <path
              d="M 205 240 L 268 300 L 322 318"
              stroke="#04070A"
              strokeWidth="26"
              fill="none"
              strokeLinecap="round"
            />
            {/* Linterna */}
            <rect
              x="300"
              y="292"
              width="52"
              height="26"
              rx="8"
              fill="#10151B"
              transform="rotate(-14 326 305)"
            />
            <ellipse cx="352" cy="310" rx="9" ry="12" fill="#FFF4D6" opacity="0.9" />
          </g>
          {/* Piernas */}
          <path d="M 150 560 L 142 660" stroke="#04070A" strokeWidth="34" strokeLinecap="round" />
          <path d="M 215 560 L 232 660" stroke="#04070A" strokeWidth="34" strokeLinecap="round" />
          {/* Rim-light pálido nítido sobre el investigador */}
          <g opacity={0.5}>
            <path
              d="M 152 74 A 46 52 0 0 1 228 96"
              fill="none"
              stroke="#A9C8DA"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M 238 210 C 234 300, 232 420, 228 540"
              fill="none"
              stroke="#A9C8DA"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 205 240 C 240 268, 292 296, 322 318"
              fill="none"
              stroke="#A9C8DA"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.9"
            />
            <ellipse cx="190" cy="120" rx="46" ry="52" fill="none" stroke="#A9C8DA" strokeWidth="2" opacity="0.55" />
          </g>
        </svg>
      </div>

      {/* 7. Lluvia diagonal determinista */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {RAIN.map((r, i) => {
          const y = (frame * r.speed + r.phase) % (1920 + r.len) - r.len;
          const alpha = 0.24 + 0.16 * Math.abs(Math.sin(frame * 0.6 + i));
          return (
            <line
              key={i}
              x1={r.x}
              y1={y}
              x2={r.x - r.len * 0.24}
              y2={y + r.len}
              stroke={`rgba(195,225,245,${alpha})`}
              strokeWidth={r.w}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* 8. Niebla frontal */}
      {FOG_BANKS.slice(2).map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: f.y,
            left: Math.sin(frame * 0.005 + f.ph) * 180 - 260,
            width: 1800,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(43,58,66,0.18), transparent 70%)",
            filter: "blur(22px)",
            transform: `scaleX(${f.s})`,
          }}
        />
      ))}

      {/* 9. Troncos de primer plano desenfocados (izquierda y derecha) */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -30,
          width: 150,
          height: 2000,
          background: "linear-gradient(90deg, #020305, #04070B)",
          filter: "blur(9px)",
          opacity: 0.97,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 118,
          width: 4,
          height: 2000,
          background: "rgba(90,130,160,0.22)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -30,
          width: 160,
          height: 2040,
          background: "linear-gradient(270deg, #020305, #04070B)",
          filter: "blur(9px)",
          opacity: 0.97,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          right: 128,
          width: 4,
          height: 2040,
          background: "rgba(90,130,160,0.22)",
          filter: "blur(2px)",
        }}
      />

      {/* 10. Encabezado centrado seguro (UNA sola línea) */}
      <SafeCentered top={380} zIndex={5}>
        <div
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 4,
            color: "#F2EFE9",
            textShadow: "0 2px 18px rgba(0,0,0,0.9)",
          }}
        >
          RETAKE BIOLÓGICO <span style={{ color: "#DC2626" }}>//</span>{" "}
          <span style={{ color: "#FDE047" }}>INFECCIÓN</span>
          <div
            style={{
              margin: "12px auto 0",
              width: 240,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(220,38,38,0.7), transparent)",
            }}
          />
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
