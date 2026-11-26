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
import { HumanBase } from "../components/stock/HumanBase";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene1BedroomHook (frames 0–556, local 0–556) — 1996 · Game Boy en Japón.
 *
 * 2.5D dormitorio tatami bajo luz lunar: niño (kid_96) de cuerpo entero
 * sosteniendo una Game Boy clásica de 1996. Micro-beats:
 *   - 0–195   : Plano General + notas musicales 8-bit flotantes (curious→melancholy).
 *   - 195–380 : Badge "1996 // JAPÓN" + dos cartuchos Rojo/Verde (spring).
 *   - 380–556 : Macro-Zoom 1.0x→2.4x a la pantalla y al rostro (uneasy),
 *               pantalla verde "PUEBLO LAVANDA" + silueta 8-bit de la torre
 *               y Screen-Dive final (530–556).
 */

const OUTLINE = "#090A12";

/** Bloques 8-bit de la torre dentro de la pantalla (viewBox 200×160). */
const TOWER_BLOCKS: Array<[number, number, number, number, string]> = [
  [70, 122, 60, 16, "#84CC16"],
  [78, 96, 44, 26, "#84CC16"],
  [86, 72, 28, 24, "#84CC16"],
  [92, 48, 16, 24, "#84CC16"],
  [96, 24, 8, 24, "#84CC16"],
  [98, 6, 4, 18, "#84CC16"],
  [92, 80, 5, 8, "#0A1F08"],
  [103, 80, 5, 8, "#0A1F08"],
  [97, 56, 5, 8, "#0A1F08"],
  [97, 32, 5, 8, "#0A1F08"],
];

/** Notas musicales 8-bit flotantes (deterministas). */
const NOTES = Array.from({ length: 10 }, (_, i) => ({
  x: 110 + random(i * 11 + 3) * 830,
  y0: 620 + random(i * 17 + 5) * 520,
  s: 16 + random(i * 7 + 9) * 20,
  phase: random(i * 23 + 1) * 320,
  speed: 0.3 + random(i * 13 + 7) * 0.55,
  op: 0.35 + random(i * 29 + 4) * 0.45,
}));

const Note8Bit: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 24 32" width={size} height={(size * 32) / 24} style={{ overflow: "visible" }}>
    <ellipse cx="8" cy="26" rx="6.2" ry="4.6" fill={color} transform="rotate(-14 8 26)" />
    <rect x="13" y="2" width="2.6" height="24" fill={color} />
    <path d="M 15.6 2 C 21 4.5, 23 9.5, 20.5 15.5 C 19.4 13.4, 16.4 10.6, 13 9.4 Z" fill={color} />
  </svg>
);

const GameBoy: React.FC<{
  frame: number;
  glow: number;
  label: number;
  width: number;
}> = ({ frame, glow, label, width }) => {
  const h = (width * 480) / 320;
  const led = 0.55 + 0.45 * Math.max(0, Math.sin(frame * 0.22));
  const shimmer = 0.06 + 0.05 * Math.sin(frame * 0.16);
  return (
    <svg
      viewBox="0 0 320 480"
      width={width}
      height={h}
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${12 + glow * 34}px rgba(132,204,22,${0.25 + glow * 0.5}))`,
      }}
    >
      <defs>
        <linearGradient id="s1-gb-shell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#AEB4BE" />
          <stop offset="55%" stopColor="#838A96" />
          <stop offset="100%" stopColor="#4B5160" />
        </linearGradient>
        <linearGradient id="s1-gb-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0D2410" />
          <stop offset="100%" stopColor="#071208" />
        </linearGradient>
        <radialGradient id="s1-gb-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#C6F27A" stopOpacity={0.5 * glow} />
          <stop offset="60%" stopColor="#84CC16" stopOpacity={0.16 * glow} />
          <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
        </radialGradient>
        <clipPath id="s1-gb-screenclip">
          <rect x="52" y="60" width="216" height="186" rx="6" />
        </clipPath>
      </defs>

      {/* Carcasa */}
      <rect x="10" y="10" width="300" height="460" rx="36" fill="url(#s1-gb-shell)" stroke={OUTLINE} strokeWidth="5" />
      <rect x="26" y="26" width="268" height="428" rx="28" fill="none" stroke="#3A3F49" strokeWidth="2" opacity="0.7" />

      {/* LED de encendido */}
      <circle cx="58" cy="34" r="6" fill="#DC2626" opacity={led} />
      <circle cx="58" cy="34" r="11" fill="#DC2626" opacity={led * 0.25} />

      {/* Bisel de pantalla */}
      <rect x="40" y="48" width="240" height="210" rx="16" fill="#151A23" stroke={OUTLINE} strokeWidth="4" />
      {/* Pantalla verde */}
      <rect x="52" y="60" width="216" height="186" rx="6" fill="url(#s1-gb-screen)" stroke="#050A06" strokeWidth="3" />

      <g clipPath="url(#s1-gb-screenclip)">
        {/* Luz de fondo verde sutil */}
        <rect x="52" y="60" width="216" height="186" fill="#0E2210" opacity={0.5 + shimmer} />
        {/* Silueta de la torre (escalada desde viewBox 200×160 a 216×186) */}
        <g transform="translate(52,60) scale(1.08,1.1625)">
          {TOWER_BLOCKS.map(([x, y, w, hh, c], i) => (
            <rect key={i} x={x} y={y} width={w} height={hh} fill={c} />
          ))}
        </g>
        {/* Resplandor del centro de la pantalla */}
        <rect x="52" y="60" width="216" height="186" fill="url(#s1-gb-glow)" />
        {/* Scanlines retro */}
        <rect
          x="52"
          y="60"
          width="216"
          height="186"
          fill="rgba(0,0,0,0.22)"
          opacity={0.6}
        />
        {/* Texto PUEBLO LAVANDA */}
        <text
          x="160"
          y="120"
          textAnchor="middle"
          fontFamily={FONT_MONO}
          fontSize="15"
          fontWeight={700}
          letterSpacing="2"
          fill="#D9F99D"
          opacity={label}
          style={{ filter: `drop-shadow(0 0 4px rgba(132,204,22,${0.5 + glow * 0.5}))` }}
        >
          PUEBLO LAVANDA
        </text>
      </g>

      {/* Cruceta (D-Pad) */}
      <g fill="#2B2F39" stroke="#0C0D12" strokeWidth="2">
        <rect x="78" y="318" width="24" height="84" rx="6" />
        <rect x="48" y="336" width="84" height="48" rx="6" />
      </g>
      <rect x="86" y="352" width="8" height="16" rx="2" fill="#0C0D12" opacity="0.55" />

      {/* Botones A / B */}
      <circle cx="216" cy="316" r="22" fill="#B33A5B" stroke="#0C0D12" strokeWidth="3" />
      <circle cx="250" cy="372" r="22" fill="#B33A5B" stroke="#0C0D12" strokeWidth="3" />
      <text x="216" y="322" textAnchor="middle" fontFamily={FONT_MONO} fontSize="15" fontWeight={700} fill="#F4D6DF">A</text>
      <text x="250" y="378" textAnchor="middle" fontFamily={FONT_MONO} fontSize="15" fontWeight={700} fill="#F4D6DF">B</text>

      {/* Select / Start */}
      <g transform="rotate(-22 116 432)">
        <rect x="94" y="426" width="44" height="12" rx="6" fill="#2B2F39" stroke="#0C0D12" strokeWidth="2" />
      </g>
      <g transform="rotate(-22 186 432)">
        <rect x="164" y="426" width="44" height="12" rx="6" fill="#2B2F39" stroke="#0C0D12" strokeWidth="2" />
      </g>
      <text x="116" y="424" textAnchor="middle" fontFamily={FONT_MONO} fontSize="7" fill="#0C0D12">SELECT</text>
      <text x="186" y="424" textAnchor="middle" fontFamily={FONT_MONO} fontSize="7" fill="#0C0D12">START</text>

      {/* Altavoz */}
      <g stroke="#0C0D12" strokeWidth="3" strokeLinecap="round" opacity="0.75">
        <line x1="206" y1="436" x2="206" y2="458" />
        <line x1="216" y1="436" x2="216" y2="458" />
        <line x1="226" y1="436" x2="226" y2="458" />
        <line x1="236" y1="436" x2="236" y2="458" />
        <line x1="246" y1="436" x2="246" y2="458" />
      </g>
    </svg>
  );
};

const Cartridge: React.FC<{
  color: string;
  label: string;
  width: number;
  frame: number;
  at: number;
  fps: number;
}> = ({ color, label, width, frame, at, fps }) => {
  const h = (width * 150) / 130;
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 15, mass: 0.85, stiffness: 120 },
  });
  const scale = Math.min(1, p);
  const opacity = interpolate(frame, [at, at + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `scale(${scale})`, transformOrigin: "50% 100%" }}>
      <svg viewBox="0 0 130 150" width={width} height={h} style={{ overflow: "visible" }}>
        <rect x="8" y="0" width="114" height="150" rx="10" fill={color} stroke={OUTLINE} strokeWidth="5" />
        <rect x="20" y="14" width="90" height="26" rx="6" fill="#0C0D12" stroke={OUTLINE} strokeWidth="3" />
        <rect x="26" y="50" width="78" height="78" rx="8" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
        <rect x="34" y="58" width="62" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
        <text x="65" y="34" textAnchor="middle" fontFamily={FONT_MONO} fontSize="13" fontWeight={800} fill="#F2EFE9">
          {label}
        </text>
        <rect x="24" y="142" width="82" height="6" rx="3" fill="#0C0D12" opacity="0.6" />
      </svg>
    </div>
  );
};

/** Tarjeta limpia agrandada de la pantalla "PUEBLO LAVANDA" (Macro-Zoom 380–556). */
const LavandaScreenCard: React.FC<{ glow: number }> = ({ glow }) => (
  <svg viewBox="0 0 200 150" width="100%" height="100%" style={{ overflow: "visible" }}>
    <rect x="4" y="4" width="192" height="142" rx="12" fill="#0D2410" stroke="#050A06" strokeWidth="4" />
    <rect x="4" y="4" width="192" height="142" rx="12" fill="none" stroke="#84CC16" strokeWidth="2" opacity="0.5" />
    {/* Silueta 8-bit de la torre centrada en la parte superior */}
    <g transform="translate(100,56) scale(0.8) translate(-90,-72)">
      {TOWER_BLOCKS.map(([x, y, w, hh, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={hh} fill={c} />
      ))}
    </g>
    <text
      x="100"
      y="132"
      textAnchor="middle"
      fontFamily={FONT_MONO}
      fontSize="12"
      fontWeight={700}
      letterSpacing="2"
      fill="#D9F99D"
      style={{ filter: `drop-shadow(0 0 6px rgba(132,204,22,${0.5 + glow * 0.5}))` }}
    >
      PUEBLO LAVANDA
    </text>
  </svg>
);

export const Scene1BedroomHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emotion = frame < 195 ? "curious" : frame < 380 ? "melancholy" : "uneasy";
  const eyeLookY = frame < 380 ? 1 : 3;

  // Macro-Zoom hacia pantalla + rostro (380–530) y Screen-Dive final (530–556).
  const macro = interpolate(frame, [380, 530], [1, 2.4], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dive = interpolate(frame, [530, 556], [1, 1.22], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = macro * dive;

  const glow = 0.5 + 0.5 * interpolate(frame, [380, 520], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label = interpolate(frame, [400, 435], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeIn = interpolate(frame, [195, 215], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Desvanece badge + cartuchos limpios antes del Macro-Zoom (355–385).
  const badgeOut = interpolate(frame, [355, 385], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Tarjeta limpia "PUEBLO LAVANDA" que emerge durante el Macro-Zoom.
  const cleanScreen = interpolate(frame, [390, 430], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parallax suave de fondo (la cámara global ya aporta movimiento).
  const bgDriftX = Math.sin(frame * 0.008) * 10;
  const bgDriftY = Math.cos(frame * 0.006) * 8;
  const moonGlow = 0.5 + 0.12 * Math.sin(frame * 0.05);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Contenedor con Macro-Zoom centrado en pantalla+rostro */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "540px 900px",
        }}
      >
        {/* Fondo vectorial 2D plano + parallax */}
        <AbsoluteFill style={{ transform: `translate(${bgDriftX}px, ${bgDriftY}px) scale(1.04)` }}>
          <Img
            src={staticFile("backgrounds/bg_s1.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>

        {/* Luz lunar sutil (SVG) */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: 640,
            width: 520,
            height: 520,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 520 520" width="100%" height="100%">
            <circle cx="300" cy="220" r="150" fill="rgba(190,205,235,0.10)" />
            <circle cx="300" cy="220" r="86" fill="rgba(216,226,246,0.16)" />
            <circle cx="300" cy="220" r="46" fill="#E7EDF8" opacity={0.32 * moonGlow} />
            <circle cx="282" cy="202" r="10" fill="#C7D2E6" opacity="0.25" />
            <circle cx="318" cy="238" r="7" fill="#C7D2E6" opacity="0.2" />
          </svg>
        </div>

        {/* Velo de luna sobre el tatami */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 78% 12%, rgba(190,205,235,0.14), transparent 42%)",
            pointerEvents: "none",
          }}
        />

        {/* Niño de cuerpo entero apoyado en el tatami */}
        <div style={{ position: "absolute", left: 270, top: 640, width: 540, height: 960 }}>
          <HumanBase
            variant="kid_96"
            pose="holding_gameboy"
            emotion={emotion}
            headphones
            facing="right"
            eyeLookY={eyeLookY}
            showShadow
            rimColor="#A78BFA"
            rimIntensity={0.7}
            idPrefix="s1-kid"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Cono de luz verde desde la pantalla */}
        <div
          style={{
            position: "absolute",
            top: 700,
            left: 330,
            width: 420,
            height: 560,
            background:
              "radial-gradient(ellipse at 50% 46%, rgba(132,204,22,0.22), transparent 62%)",
            mixBlendMode: "screen",
            opacity: 0.4 + glow * 0.6,
            pointerEvents: "none",
          }}
        />

        {/* Game Boy clásica 1996 sostenida en las manos (escala real, debajo del rostro) */}
        <div style={{ position: "absolute", left: 542, top: 1015, width: 115, height: 173 }}>
          <GameBoy frame={frame} glow={glow} label={label} width={115} />
        </div>

        {/* Notas musicales 8-bit flotantes (0–195) */}
        {NOTES.map((n, i) => {
          const y = n.y0 - ((frame * n.speed + n.phase) % 420);
          const noteOp = n.op * (0.35 + 0.65 * Math.abs(Math.sin(frame * 0.04 + i * 0.7)));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: n.x,
                opacity: noteOp * (frame < 260 ? 1 : 0),
                transform: `rotate(${Math.sin(frame * 0.03 + i) * 14}deg)`,
              }}
            >
              <Note8Bit size={n.s} color={i % 3 === 0 ? "#FDE047" : "#A78BFA"} />
            </div>
          );
        })}

        {/* Badge limpio 1996 // JAPÓN */}
        <SafeCentered top={355} zIndex={5}>
          <div style={{ opacity: badgeIn * badgeOut }}>
            <div
              style={{
                display: "inline-block",
                fontFamily: FONT_SANS,
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: 6,
                color: "#F2EFE9",
                textShadow: "0 2px 18px rgba(0,0,0,0.9)",
              }}
            >
              1996 <span style={{ color: "#A78BFA" }}>//</span>{" "}
              <span style={{ color: "#FDE047" }}>JAPÓN</span>
            </div>
            <div
              style={{
                margin: "12px auto 0",
                width: 240,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)",
              }}
            />
          </div>
        </SafeCentered>

        {/* Cartuchos Rojo / Verde entrando con spring (195–380) */}
        <div
          style={{
            position: "absolute",
            top: 560,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 120,
            zIndex: 6,
          }}
        >
          <div style={{ opacity: badgeIn * badgeOut }}>
            <Cartridge color="#DC2626" label="ROJO" width={130} frame={frame} at={200} fps={fps} />
          </div>
          <div style={{ opacity: badgeIn * badgeOut }}>
            <Cartridge color="#22C55E" label="VERDE" width={130} frame={frame} at={216} fps={fps} />
          </div>
        </div>

        {/* Tarjeta limpia "PUEBLO LAVANDA" durante el Macro-Zoom (al lado/debajo del rostro) */}
        <div
          style={{
            position: "absolute",
            left: 440,
            top: 990,
            width: 200,
            height: 150,
            opacity: cleanScreen,
            zIndex: 7,
            pointerEvents: "none",
          }}
        >
          <LavandaScreenCard glow={glow} />
        </div>

        {/* Viñeta de cierre del plano */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.4) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
