import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene2MaryBedroom (frames 489–846, 16.30–28.20s) — Lore clásico:
 * Mary y el disquete.
 *
 * 2.5D Habitación cerrada: barras de luz de luna azul-plateada nítidas
 * (#284050 / #4A6B7E) a través de las persianas venecianas + haces
 * diagonales sobre pared y suelo, silueta de Mary encorvada al borde de
 * la cama con rim-light frío, disquete 3.5" con etiqueta legible, y
 * sombras de pesadilla (garras alargadas + silueta canina con ojos
 * brillantes) reptando por la pared rayada.
 */

const WHISPER_AT = 281; // frame local (global 770)

const BLINDS = Array.from({ length: 29 }, (_, i) => i);

const EYES = [
  { x: 208, y: 560, ph: 1.2 },
  { x: 700, y: 645, ph: 2.4 },
  { x: 430, y: 885, ph: 0.5 },
  { x: 812, y: 985, ph: 3.1 },
  { x: 318, y: 1092, ph: 1.9 },
];

/** Garras de pesadilla alargadas y cónicas. */
const WALL_HANDS = [
  { x: 62, y: 700, ph: 0.4, s: 0.9 },
  { x: 948, y: 618, ph: 2.1, s: 1.0 },
  { x: 892, y: 1010, ph: 1.3, s: 0.85 },
];

const clawPath = (x: number, y: number, len: number, tilt: number): string => {
  return [
    `M ${x} ${y}`,
    `L ${x + 13} ${y}`,
    `L ${x + 9} ${y - len + 6}`,
    `L ${x + 6.5} ${y - len}`,
    `L ${x + 4} ${y - len + 6}`,
    "Z",
  ].join(" ");
};

export const Scene2MaryBedroom: React.FC = () => {
  const frame = useCurrentFrame();

  const whisperProg = interpolate(frame, [WHISPER_AT, WHISPER_AT + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tremor de la mano de Mary que sostiene el disquete.
  const trembleX = Math.sin(frame * 11) * 1.7;
  const trembleY = Math.sin(frame * 9.3 + 1) * 1.3;
  const bodySway = Math.sin(frame * 0.4) * 0.6;

  // Parallax de capas.
  const wallDrift = Math.sin(frame * 0.012) * 2.4;
  const midDrift = Math.sin(frame * 0.016 + 1.3) * 4;

  // Silueta canina de pesadilla reptando por la pared.
  const dogCreep = interpolate(frame, [0, 300], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Pared de la habitación */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #05070A 0%, #080C11 55%, #040609 100%)",
        }}
      />

      {/* 2. Barras de luz de luna nítidas (#4A6B7E / #284050) */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${wallDrift}px)` }}>
        {BLINDS.map((i) => {
          const y = 288 + i * 40;
          const shimmer = 0.82 + 0.18 * Math.sin(frame * 0.04 + i * 0.55);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                width: 1080,
                height: 31,
                background:
                  "linear-gradient(180deg, rgba(74,107,126,0.85), rgba(40,64,80,0.75))",
                opacity: shimmer,
                transform: `translateX(${Math.sin(frame * 0.015 + i * 0.3) * 4}px)`,
                boxShadow: "0 1px 0 rgba(160,200,230,0.4), 0 2px 6px rgba(0,0,0,0.5)",
              }}
            />
          );
        })}
      </div>

      {/* 2b. Haces diagonales de luna sobre pared y suelo */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: -260,
          width: 1250,
          height: 250,
          background:
            "linear-gradient(112deg, rgba(74,107,126,0.30), rgba(40,64,80,0.12) 70%, transparent)",
          transform: "rotate(-17deg)",
          filter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1040,
          left: -160,
          width: 1250,
          height: 240,
          background:
            "linear-gradient(112deg, rgba(74,107,126,0.26), rgba(40,64,80,0.10) 70%, transparent)",
          transform: "rotate(-17deg)",
          filter: "blur(8px)",
        }}
      />

      {/* 3. Silueta canina de pesadilla reptando por la pared */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 250 + dogCreep,
          width: 420,
          height: 300,
          opacity: 0.55 + 0.15 * Math.sin(frame * 0.06),
          transform: "rotate(4deg)",
        }}
      >
        <svg viewBox="0 0 420 300" width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            <filter id="s2-dog-blur" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          {/* Lomo/cabeza canina elongada */}
          <path
            d="M 30 210
               C 40 150, 60 120, 96 96
               L 128 40
               L 150 84
               L 168 34
               L 190 92
               C 250 118, 300 160, 330 214
               C 352 252, 360 276, 356 296
               L 24 296 Z"
            fill="#0A0F16"
            opacity="0.85"
            filter="url(#s2-dog-blur)"
          />
          {/* Ojos brillantes tenues */}
          <circle cx="118" cy="96" r="3" fill="#F0B25C" opacity={0.5 + 0.3 * Math.sin(frame * 0.2)} />
          <circle cx="160" cy="92" r="3" fill="#F0B25C" opacity={0.5 + 0.3 * Math.sin(frame * 0.2 + 0.7)} />
          {/* Pelaje erizado */}
          <g stroke="#0C121A" strokeWidth="4" strokeLinecap="round">
            <path d="M 96 96 L 118 74" />
            <path d="M 150 84 L 156 56" />
            <path d="M 190 92 L 214 70" />
            <path d="M 240 118 L 262 98" />
            <path d="M 290 152 L 314 136" />
          </g>
        </svg>
      </div>

      {/* 4. Garras de pesadilla alargadas */}
      {WALL_HANDS.map((h, idx) => {
        const rise = interpolate(frame, [0, 280], [0, 46], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const writhe = Math.sin(frame * 0.05 + h.ph) * 7;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: h.y - rise + writhe * 0.3,
              left: h.x + midDrift * 0.5,
              width: 120 * h.s,
              height: 150 * h.s,
              opacity: 0.6 + 0.2 * Math.sin(frame * 0.08 + h.ph),
              transform: `rotate(${writhe}deg)`,
            }}
          >
            <svg viewBox="0 0 120 150" width="100%" height="100%">
              <ellipse cx="60" cy="108" rx="32" ry="27" fill="#0E141B" />
              {[0, 1, 2, 3].map((f) => (
                <g key={f} transform={`rotate(${-16 + f * 9 + Math.sin(frame * 0.09 + h.ph + f) * 4} ${38 + f * 15} 100)`}>
                  <path d={clawPath(33 + f * 15, 100, 92 - f * 10, -2)} fill="#0E141B" />
                </g>
              ))}
              <g transform="rotate(40 90 95)">
                <path d={clawPath(85, 95, 48, 0)} fill="#0E141B" />
              </g>
            </svg>
          </div>
        );
      })}

      {/* 5. Ojos vigilantes que parpadean en la pared */}
      {EYES.map((e, i) => {
        const blink = Math.pow(Math.max(0, Math.sin(frame * 0.09 + e.ph)), 7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: e.y + midDrift * 0.4,
              left: e.x,
              display: "flex",
              gap: 14,
              opacity: 0.45 * (0.4 + 0.6 * blink),
            }}
          >
            {[0, 1].map((k) => (
              <div
                key={k}
                style={{
                  width: 30,
                  height: 11,
                  borderRadius: 15,
                  background: "linear-gradient(180deg, #93AECB, #5E7488)",
                  boxShadow: "0 0 10px rgba(120,155,195,0.55)",
                  transform: `scaleY(${0.15 + 0.85 * blink})`,
                }}
              />
            ))}
          </div>
        );
      })}

      {/* 6. Cama con silueta definida */}
      <div style={{ position: "absolute", top: 1140, left: 0, right: 0, height: 360 }}>
        {/* Cabecero con lamas */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 240,
            width: 600,
            height: 92,
            background: "linear-gradient(180deg, #10151C, #0A0D12)",
            borderRadius: 12,
            border: "1px solid rgba(150,180,210,0.08)",
          }}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 10,
                left: 28 + i * 82,
                width: 8,
                height: 72,
                background: "#0D1117",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
        {/* Colchón con borde iluminado por la luna */}
        <div
          style={{
            position: "absolute",
            top: 84,
            left: 220,
            width: 640,
            height: 112,
            background: "linear-gradient(180deg, #12171E, #0B0E13)",
            borderRadius: 14,
            boxShadow: "0 -2px 0 rgba(110,147,168,0.4)",
          }}
        />
        {/* Almohada */}
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 700,
            width: 130,
            height: 62,
            background: "#141A22",
            borderRadius: "10px 10px 18px 18px",
            boxShadow: "0 -1px 0 rgba(110,147,168,0.3)",
          }}
        />
        {/* Manta colgando */}
        <div
          style={{
            position: "absolute",
            top: 170,
            left: 240,
            width: 600,
            height: 190,
            background: "linear-gradient(180deg, #0A0D12, #05070A)",
            borderRadius: "0 0 12px 12px",
          }}
        />
      </div>

      {/* 7. Silueta de Mary, encorvada al borde de la cama */}
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 330,
          width: 430,
          height: 620,
          transform: `translateX(${midDrift * 0.6}px) rotate(${bodySway}deg)`,
        }}
      >
        <svg viewBox="0 0 430 620" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Piernas colgando */}
          <path d="M 150 470 L 175 590" stroke="#04060A" strokeWidth="34" strokeLinecap="round" />
          <path d="M 250 470 L 295 600" stroke="#04060A" strokeWidth="34" strokeLinecap="round" />
          {/* Torso encorvado */}
          <path
            d="M 120 180
               C 140 300, 155 400, 150 480
               C 210 505, 280 500, 320 465
               C 315 370, 300 260, 310 180
               C 262 110, 160 110, 120 180 Z"
            fill="#04060A"
          />
          {/* Cabeza inclinada */}
          <circle cx="160" cy="95" r="58" fill="#04060A" />
          {/* Brazo cubriéndose la cara */}
          <path
            d="M 165 160 C 130 135, 105 115, 92 92"
            stroke="#04060A"
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="86" cy="84" rx="22" ry="26" fill="#04060A" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={60 + i * 14}
              y={44 + i * 5}
              width={11}
              height={38}
              rx={5.5}
              fill="#04060A"
              transform={`rotate(${-30 + i * 14} ${65 + i * 14} 82)`}
            />
          ))}
          {/* Brazo extendido tembloroso con el disquete */}
          <g transform={`translate(${trembleX} ${trembleY})`}>
            <path
              d="M 220 170 C 280 215, 330 260, 372 312"
              stroke="#04060A"
              strokeWidth="30"
              fill="none"
              strokeLinecap="round"
            />
            {/* Mano */}
            <ellipse cx="382" cy="326" rx="24" ry="20" fill="#04060A" transform="rotate(20 382 326)" />
            {/* Disquete 3.5" */}
            <g transform="rotate(12 386 336)">
              <rect x="356" y="316" width="52" height="62" rx="7" fill="#1A2029" stroke="#2E3A46" strokeWidth="1.5" />
              <rect x="368" y="328" width="28" height="32" fill="#333D49" />
              <rect x="368" y="328" width="28" height="12" fill="#4A5665" />
              {/* Etiqueta blanca con smile.jpg */}
              <rect x="361" y="364" width="42" height="11" fill="#E4E1D8" />
              <text
                x="382"
                y="373"
                textAnchor="middle"
                fontSize="8"
                fontWeight={700}
                fontFamily={FONT_MONO}
                fill="#2E343B"
              >
                smile.jpg
              </text>
              {/* Destello tenue sobre la etiqueta */}
              <rect
                x="361"
                y="364"
                width="42"
                height="11"
                fill="#FFFFFF"
                opacity={Math.max(0, Math.sin(frame * 0.5)) * 0.3}
                style={{ mixBlendMode: "overlay" }}
              />
            </g>
          </g>

          {/* Rim-light frío de luna sobre Mary */}
          <g opacity={0.5}>
            <path
              d="M 138 200 C 132 300, 128 400, 135 470"
              fill="none"
              stroke="#6E93A8"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M 124 62 A 58 58 0 0 1 166 38"
              fill="none"
              stroke="#7FA4BA"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M 165 160 C 140 140, 112 118, 100 96"
              fill="none"
              stroke="#6E93A8"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 225 180 C 285 222, 330 265, 370 310"
              fill="none"
              stroke="#6E93A8"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        </svg>
      </div>

      {/* 8. Enmarcado frontal: marco de puerta / cortinas desenfocadas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -60,
          width: 170,
          background: "#03050A",
          filter: "blur(8px)",
          opacity: 0.96,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -60,
          width: 170,
          background: "#03050A",
          filter: "blur(8px)",
          opacity: 0.96,
        }}
      />
      {/* Cortina superior */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: 0,
          right: 0,
          height: 330,
          background: "linear-gradient(180deg, #03050A, transparent)",
          opacity: 0.95,
        }}
      />

      {/* 9. Encabezado centrado seguro (UNA sola línea) */}
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
          LORE ORIGINAL <span style={{ color: "#DC2626" }}>//</span> MARY —{" "}
          <span style={{ color: "#FDE047" }}>15 AÑOS</span>
          <div
            style={{
              margin: "12px auto 0",
              width: 240,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(120,160,200,0.6), transparent)",
            }}
          />
        </div>
      </SafeCentered>

      {/* 10. Etiqueta susurrante "DIFUNDE LA PALABRA" (local 281 = global 770) */}
      {whisperProg > 0.01 ? (
        <SafeCentered top={510} zIndex={6}>
          <div
            style={{
              display: "inline-block",
              padding: "10px 26px",
              borderRadius: 999,
              background: "rgba(220,38,38,0.12)",
              border: "1px solid rgba(220,38,38,0.4)",
              fontFamily: FONT_SANS,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 3,
              color: "#F87171",
              textShadow: "0 0 16px rgba(220,38,38,0.6)",
              opacity: whisperProg * (0.55 + 0.45 * Math.sin(frame * 0.14)),
            }}
          >
            “DIFUNDE LA PALABRA”
          </div>
        </SafeCentered>
      ) : null}

      {/* 11. Polvo atmosférico */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = random(i * 17 + 3) * 1080;
        const y = 300 + random(i * 23 + 7) * 1100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y + Math.sin(frame * 0.02 + i) * 14,
              left: x,
              width: 3,
              height: 3,
              borderRadius: 2,
              background: "#B9C9D8",
              opacity: 0.05 + 0.08 * Math.abs(Math.sin(frame * 0.04 + i * 1.7)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
