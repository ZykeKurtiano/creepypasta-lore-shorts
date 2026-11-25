import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GamerCharacter } from "../components/characters/GamerCharacter";
import { FONT_MONO } from "../components/SafeZone";
import { CamKey, cameraAt, cameraTransform } from "./camera";

/**
 * Scene4Ps2PrototypeRetake (frames locales 0–427 · 14.23s).
 *
 * El retake moderno: un investigador recibe un disco prototipo para
 * PlayStation 2 que corrompe la carrera, invierte el mapa y se expulsa solo.
 *
 *  - Fase A (0–20): sale del Whip-Zoom de la bandeja PS2 de la Escena 3.
 *  - Fase B (20–255): Plano General → Plano Medio (1.0x → 1.32x), el
 *    investigador observa con 'unease' el disco prototipo plateado y lo
 *    inserta en la consola.
 *  - Fase C (255–350): Plano Cerrado al Monitor (1.85x) — la pista 3D se
 *    corrompe con polígonos carmesí y se invierte 180° con spring(),
 *    revelando el rostro distorsionado de Tails Doll en el cielo invertido.
 *  - Fase D (350–392): Macro-Zoom (2.55x) a la PS2 — el LED azul parpadea,
 *    la bandeja motorizada se desliza expulsando el disco con halo carmesí.
 *  - Fase E (392–413): Whip-Zoom (2.6x) al rostro en 'panic'/'paranoia'.
 *  - Transición (413–427): Doorway Zoom-Through exponencial a la puerta
 *    entreabierta del fondo (Escena 5).
 */

const W = 1080;
const H = 1920;

// --- Cámara -----------------------------------------------------------------

const CAM_KEYS: CamKey[] = [
  { f: 0, s: 2.4, x: 575, y: 815 },
  { f: 20, s: 1.0, x: 540, y: 920 },
  { f: 255, s: 1.32, x: 560, y: 880 },
  { f: 350, s: 1.85, x: 570, y: 610 },
  { f: 392, s: 2.55, x: 575, y: 815 },
  { f: 413, s: 2.6, x: 800, y: 590 },
  { f: 427, s: 9.0, x: 230, y: 860, e: Easing.exp },
];

// --- Partículas deterministas ----------------------------------------------

const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: 120 + random(i * 3 + 1) * 840,
  y0: 420 + random(i * 7 + 2) * 900,
  r: 1.4 + random(i * 5 + 3) * 2.2,
  speed: 0.10 + random(i * 9 + 4) * 0.16,
  phase: random(i * 13 + 5) * 400,
}));

// --- Subcomponentes ---------------------------------------------------------

/** Disco prototipo plateado/rojo con etiqueta manuscrita. */
const ProtoDisc: React.FC<{
  size: number;
  spin: number;
  halo: number;
}> = ({ size, spin, halo }) => (
  <div
    style={{
      position: "absolute",
      left: -size / 2,
      top: -size / 2,
      width: size,
      height: size,
    }}
  >
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ transform: `rotate(${spin}deg)`, overflow: "visible" }}
    >
      <defs>
        <radialGradient id="disc-metal" cx="35%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#F2F5F7" />
          <stop offset="45%" stopColor="#9FB0BD" />
          <stop offset="75%" stopColor="#5A6872" />
          <stop offset="100%" stopColor="#2A333B" />
        </radialGradient>
      </defs>
      {/* Halo carmesí */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#DC2626" strokeWidth="3" opacity={halo} />
      <circle cx="50" cy="50" r="44" fill="#DC2626" opacity={halo * 0.25} />
      {/* Cuerpo plateado */}
      <circle cx="50" cy="50" r="44" fill="url(#disc-metal)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#1A222B" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="#0B0E13" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="#8FA3B0" strokeWidth="1" />
      {/* Etiqueta manuscrita */}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize="9"
        fontWeight="700"
        fill="#DC2626"
        letterSpacing="1"
      >
        TD
      </text>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize="5"
        fill="#F2EFE9"
        letterSpacing="1"
      >
        PROTO
      </text>
    </svg>
  </div>
);

/** Consola PlayStation 2 negra con bandeja óptica motorizada y LED. */
const PS2Console: React.FC<{
  x: number;
  y: number;
  w: number;
  trayOpen: number;
  ledFlicker: number;
  discSpin: number;
  discHalo: number;
}> = ({ x, y, w, trayOpen, ledFlicker, discSpin, discHalo }) => {
  const h = Math.round(w * 0.28);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      {/* Aletas frontales icónicas */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 4,
          bottom: 4,
          width: w * 0.16,
          background:
            "repeating-linear-gradient(90deg, #0B0E13 0px, #0B0E13 6px, #1B222B 6px, #1B222B 11px)",
          borderRadius: 4,
          border: "1px solid rgba(120,170,220,0.10)",
        }}
      />
      {/* Cuerpo principal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #1B2A3A 0%, #0E1620 55%, #060A0F 100%)",
          borderRadius: 10,
          border: "1px solid rgba(120,170,220,0.18)",
          boxShadow: "0 22px 50px rgba(0,0,0,0.8)",
        }}
      />
      {/* Banda del logo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: w * 0.12,
          width: w * 0.30,
          height: h,
          background:
            "linear-gradient(180deg, rgba(34,211,238,0.16), rgba(34,211,238,0.02))",
          borderRadius: "0 10px 10px 0",
        }}
      />
      {/* Logo PS2 sutil */}
      <div
        style={{
          position: "absolute",
          top: h * 0.2,
          right: w * 0.16,
          fontFamily: FONT_MONO,
          fontSize: Math.max(11, Math.round(w * 0.06)),
          letterSpacing: 2,
          color: "#7FA9D0",
          opacity: 0.7,
        }}
      >
        PS2
      </div>
      {/* LED azul/verde parpadeante */}
      <div
        style={{
          position: "absolute",
          top: h * 0.26,
          left: w * 0.20,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: ledFlicker > 0.5 ? "#22D3EE" : "#22C55E",
          boxShadow: `0 0 12px ${ledFlicker > 0.5 ? "rgba(34,211,238,0.95)" : "rgba(34,197,94,0.9)"}`,
          opacity: 0.5 + 0.5 * ledFlicker,
        }}
      />
      {/* Bandeja óptica deslizándose frontalmente en perspectiva */}
      <div
        style={{
          position: "absolute",
          top: h * 0.58,
          left: w * 0.16,
          width: w * 0.52,
          height: h * 0.30,
          background: "linear-gradient(180deg, #111B26, #0A111A)",
          borderRadius: 4,
          border: "1px solid rgba(120,170,220,0.14)",
          transform: `translateY(${trayOpen * 16}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 3,
            background: "#02040A",
            borderRadius: 3,
            boxShadow: "inset 0 0 12px #000000",
          }}
        />
        {/* Disco descansando PLANO (elipse) dentro de la bandeja abierta */}
        {trayOpen > 0.02 ? (
          <div
            style={{
              position: "absolute",
              top: Math.round(h * 0.05),
              left: Math.round(w * 0.14),
              width: Math.round(w * 0.24),
              height: Math.round(w * 0.24),
              transform: "scaleY(0.4)",
            }}
          >
            <ProtoDisc size={Math.round(w * 0.24)} spin={discSpin} halo={discHalo} />
          </div>
        ) : null}
      </div>
      {/* Reflejo superior */}
      <div
        style={{
          position: "absolute",
          top: 3,
          left: w * 0.16,
          width: w * 0.60,
          height: h * 0.12,
          background:
            "linear-gradient(90deg, transparent, rgba(140,190,230,0.12), transparent)",
          borderRadius: 6,
        }}
      />
    </div>
  );
};

/** Pista de carreras 3D retro (se corrompe e invierte). */
const RacingTrack: React.FC<{ corrupt: number; flip: number }> = ({
  corrupt,
  flip,
}) => (
  <svg
    viewBox="0 0 360 300"
    width="100%"
    height="100%"
    preserveAspectRatio="none"
    style={{ transform: `rotate(${flip * 180}deg)` }}
  >
    <defs>
      <linearGradient id="s4-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#123058" />
        <stop offset="60%" stopColor="#2E6CC0" />
        <stop offset="100%" stopColor="#7FC7E8" />
      </linearGradient>
    </defs>
    <rect width="360" height="300" fill="url(#s4-sky)" />
    <circle cx="300" cy="44" r="16" fill="#FDE047" />
    {/* Suelo */}
    <path d="M0 210 L360 186 L360 300 L0 300 Z" fill="#3E8E4E" />
    <path d="M0 236 L360 216 L360 300 L0 300 Z" fill="#2F6F3C" />
    {/* Pista en perspectiva */}
    <path d="M40 300 L150 186 L210 186 L320 300 Z" fill="#4A4E55" />
    <path d="M130 186 L140 300 L170 300 L160 186 Z" fill="#E9E2C8" opacity="0.85" />
    {/* Polígonos rotos carmesí (corrupción) */}
    {corrupt > 0.01 ? (
      <g opacity={corrupt}>
        <path d="M90 120 L140 90 L118 150 Z" fill="#DC2626" />
        <path d="M220 70 L260 110 L205 120 Z" fill="#7F1D1D" />
        <path d="M160 40 L190 60 L150 80 Z" fill="#DC2626" />
        <path d="M250 170 L300 150 L280 200 Z" fill="#7F1D1D" />
        <path d="M70 200 L120 180 L95 240 Z" fill="#DC2626" />
        <path d="M40 260 L90 230 L70 290 Z" fill="#DC2626" />
        <path d="M300 90 L340 70 L330 120 Z" fill="#7F1D1D" />
        <path d="M180 150 L220 130 L200 190 Z" fill="#DC2626" />
      </g>
    ) : null}
    {/* Silueta glitcheada de Tails Doll en el cielo invertido (wireframe 3D) */}
    {flip > 0.6 ? (
      <g opacity={(flip - 0.6) * 2.5}>
        {/* Cabeza poligonal de zorro (wireframe cian) */}
        <path d="M 180 70 L 150 130 L 180 150 L 210 130 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1.5" />
        <path d="M 158 78 L 140 48 L 178 96 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1.2" />
        <path d="M 202 78 L 220 48 L 182 96 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1.2" />
        <path d="M 150 130 L 180 150 L 168 196 L 144 180 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1.2" />
        <path d="M 210 130 L 180 150 L 192 196 L 216 180 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1.2" />
        {/* Ojos vacíos */}
        <path d="M 162 112 L 178 112 L 174 132 L 166 132 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1" />
        <path d="M 198 112 L 182 112 L 186 132 L 194 132 Z" fill="#040507" stroke="#22D3EE" strokeWidth="1" />
        {/* Gema roja brillando entre interferencias */}
        <path d="M 180 70 L 172 86 L 180 92 L 188 86 Z" fill="#DC2626" opacity="0.9" />
        <circle cx="180" cy="74" r="10" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.7" />
        {/* Barras de interferencia */}
        <path d="M 140 120 L 220 116 M 144 146 L 216 142" stroke="#F2EFE9" strokeWidth="1.2" opacity="0.7" />
      </g>
    ) : null}
    {/* Static lines */}
    {corrupt > 0.01 ? (
      <g opacity={corrupt * 0.6}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <line
            key={k}
            x1={20 + k * 62}
            y1={random(k * 7 + 1) * 60}
            x2={40 + k * 60}
            y2={140 + random(k * 5 + 2) * 120}
            stroke="#F2EFE9"
            strokeWidth="1.5"
          />
        ))}
      </g>
    ) : null}
  </svg>
);

export const Scene4Ps2PrototypeRetake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cam = cameraAt(frame, CAM_KEYS);
  const swayX = Math.sin(frame * 0.008) * 3 + Math.sin(frame * 0.0037 + 1.3) * 2;
  const swayY = Math.cos(frame * 0.006) * 2.4 + Math.sin(frame * 0.0041 + 0.8) * 1.6;

  // Salida del Whip-Zoom (0–20).
  const emerge = interpolate(frame, [0, 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Expresión: 'unease' observando el disco, a 'panic'/'paranoia' en el clímax.
  let emotion: "unease" | "panic" | "paranoia" = "unease";
  if (frame < 392) {
    emotion = "unease";
  } else if (frame < 410) {
    emotion = "panic";
  } else {
    emotion = "paranoia";
  }

  // Rim light: cian del monitor → carmesí en el clímax.
  const rimColor = interpolateColors(frame, [392, 415], ["#22D3EE", "#DC2626"]);

  // Corrupción del monitor (273–350) e inversión del mapa (330–350).
  const corrupt = interpolate(frame, [273, 320], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flip = spring({
    frame: frame - 330,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 110 },
  });

  // Bandeja PS2: expulsa el disco por sí solo (353+).
  const trayOpen = spring({
    frame: frame - 353,
    fps,
    config: { damping: 16, mass: 1, stiffness: 90 },
  });
  const discSpin = (frame - 353) * 4;
  const discHalo = interpolate(frame, [353, 372, 410], [0, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ledFlicker =
    frame >= 340
      ? 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.9))
      : 0.5 + 0.3 * Math.sin(frame * 0.4);

  // Disco en mano (20–320) → hacia la bandeja (320–355).
  const discX = interpolate(frame, [320, 355], [700, 590], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const discY = interpolate(frame, [320, 355], [812, 828], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const discSpinHand = frame * 1.2;
  const handDiscOpacity = interpolate(frame, [320, 355], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Resplandor rojo tenue desde la puerta (fondo, clímax).
  const doorGlow = interpolate(frame, [392, 427], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Doorway Zoom-Through (413–427).
  const dive = interpolate(frame, [413, 427], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Lámpara de escritorio parpadeando.
  const lampFlicker = 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.6 + 1.2));
  const lampDim = interpolate(frame, [340, 392], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Objetivos de mano IK (local) → borde del disco prototipo (TD-PROTO).
  const handTargetL = { x: 40, y: 450 };
  const handTargetR = { x: 124, y: 450 };
  // Retrocede asustado en Fase C/D (tras soltar el disco en la bandeja).
  const backing = frame >= 350;
  const gamerPose: "standing_inspect" | "backing_up" = backing ? "backing_up" : "standing_inspect";
  const gamerWalk = backing ? (frame - 350) * 0.08 : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: cameraTransform(cam, swayX, swayY),
          transformOrigin: "0 0",
        }}
      >
        {/* ============================ BACKGROUND ============================ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #080C11 0%, #0C1218 42%, #162129 76%, #040507 100%)",
          }}
        />
        {/* Estantes de discos/archivos (izquierda) */}
        <div
          style={{
            position: "absolute",
            top: 220,
            left: 60,
            width: 220,
            height: 520,
            background: "linear-gradient(180deg, #10161D, #0A0F14)",
            borderRadius: 5,
            border: "1px solid rgba(140,170,200,0.08)",
          }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 18 + i * 96,
                left: 16,
                width: 46,
                height: 72,
                borderRadius: 2,
                background: i % 2 ? "#1A2430" : "#232E3C",
                border: "1px solid rgba(160,190,220,0.12)",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
              }}
            />
          ))}
        </div>

        {/* Lámpara de escritorio cálida (parpadeando) */}
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 760,
            width: 200,
            height: 200,
            borderRadius: 100,
            background:
              "radial-gradient(circle, rgba(240,180,90,0.5), rgba(240,180,90,0.08) 60%, transparent 75%)",
            opacity: lampFlicker * lampDim,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 340,
            left: 830,
            width: 60,
            height: 120,
            background: "#0A0D12",
            transform: "rotate(12deg)",
            borderRadius: 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -16,
              left: 10,
              width: 40,
              height: 26,
              borderRadius: "12px 12px 0 0",
              background: "#151A21",
            }}
          />
        </div>

        {/* Puerta de habitación entreabierta al fondo izquierda (x 140–320) */}
        <div
          style={{
            position: "absolute",
            top: 480,
            left: 140,
            width: 180,
            height: 740,
          }}
        >
          {/* Marco */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "6px solid #1A222B",
              background: "#05070A",
              borderRadius: 2,
            }}
          />
          {/* Umbral oscuro del pasillo */}
          <div
            style={{
              position: "absolute",
              inset: 8,
              background:
                "linear-gradient(180deg, #020306 0%, #04060A 70%, #0A0F14 100%)",
            }}
          />
          {/* Hoja entreabierta */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 8,
              width: 120,
              background: "linear-gradient(180deg, #241A12, #180F0A)",
              transform: "skewY(3deg)",
              border: "1px solid rgba(120,90,60,0.25)",
            }}
          />
          {/* Resplandor rojo tenue del pasillo (clímax) */}
          <div
            style={{
              position: "absolute",
              inset: 8,
              background:
                "radial-gradient(circle at 60% 55%, rgba(220,38,38,0.55), transparent 70%)",
              opacity: doorGlow,
            }}
          />
        </div>

        {/* ============================ MIDGROUND ============================ */}
        {/* Escritorio técnico */}
        <div
          style={{
            position: "absolute",
            top: 840,
            left: 260,
            width: 560,
            height: 40,
            background: "linear-gradient(180deg, #241A12 0%, #170F0A 100%)",
            borderRadius: 6,
            border: "1px solid rgba(120,90,60,0.25)",
            boxShadow: "0 24px 50px rgba(0,0,0,0.7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 880,
            left: 300,
            width: 22,
            height: 340,
            background: "linear-gradient(180deg, #1A120C, #0C0806)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 880,
            left: 760,
            width: 22,
            height: 340,
            background: "linear-gradient(180deg, #1A120C, #0C0806)",
            borderRadius: 4,
          }}
        />

        {/* Monitor de pruebas CRT/LCD (x 380–760, y 460–760) */}
        <div style={{ position: "absolute", top: 460, left: 380, width: 380, height: 300 }}>
          {/* Marco del monitor */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #161C24 0%, #0D1117 55%, #0A0D11 100%)",
              borderRadius: 14,
              border: "1px solid rgba(160,190,220,0.12)",
              boxShadow: "0 26px 60px rgba(0,0,0,0.7)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              bottom: 22,
              background: "#06080B",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
            }}
          >
            {/* Pista 3D corrompida e invertida */}
            <RacingTrack corrupt={corrupt} flip={flip} />
            {/* Reflejo de cristal + scanlines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, rgba(200,230,250,0.12) 0%, transparent 26%, transparent 74%, rgba(200,230,250,0.06) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
                opacity: 0.6,
              }}
            />
          </div>
          {/* Etiqueta del monitor */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 16,
              right: 16,
              display: "flex",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: 3,
              color: "#22D3EE",
              opacity: 0.5,
            }}
          >
            TD-PROTO // DEBUG
          </div>
        </div>

        {/* Consola PlayStation 2 negra */}
        <PS2Console
          x={460}
          y={790}
          w={230}
          trayOpen={trayOpen}
          ledFlicker={ledFlicker}
          discSpin={discSpin}
          discHalo={discHalo}
        />

        {/* ============================ DISCO + GAMER (capas Z) ============================ */}
        {/* Cuerpo + brazo trasero */}
        <GamerCharacter
          x={800}
          floorY={1220}
          scale={0.85}
          pose={gamerPose}
          walkPhase={gamerWalk}
          expression={{ emotion, intensity: 1, gazeX: -0.5, gazeY: 0.05 }}
          leftHandTarget={backing ? undefined : handTargetL}
          renderLayer="body_and_back_arm"
          rimColor={rimColor}
          rimStrength={1.15}
          outfit="investigator"
          showFloorShadow
        />

        {/* Disco prototipo (entre el brazo trasero y el frontal) */}
        <div
          style={{
            position: "absolute",
            left: discX,
            top: discY,
            width: 84,
            height: 84,
            transform: "translate(-42px, -42px)",
            opacity: handDiscOpacity,
          }}
        >
          <ProtoDisc size={84} spin={discSpinHand} halo={discHalo * 0.5} />
        </div>

        {/* Brazo frontal */}
        <GamerCharacter
          x={800}
          floorY={1220}
          scale={0.85}
          pose={gamerPose}
          walkPhase={gamerWalk}
          expression={{ emotion, intensity: 1, gazeX: -0.5, gazeY: 0.05 }}
          rightHandTarget={backing ? undefined : handTargetR}
          renderLayer="front_arm_only"
          rimColor={rimColor}
          rimStrength={1.15}
          outfit="investigator"
          showFloorShadow={false}
        />

        {/* ============================ FOREGROUND ============================ */}
        {/* Borde de teclado en primer plano */}
        <div
          style={{
            position: "absolute",
            top: 1160,
            left: 320,
            width: 440,
            height: 120,
            background: "linear-gradient(180deg, #0A0D12, #05070A)",
            borderRadius: 10,
            border: "1px solid rgba(140,170,200,0.10)",
            filter: "blur(2px)",
            opacity: 0.9,
            transform: "skewX(-8deg)",
          }}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 16,
                left: 18 + i * 58,
                width: 44,
                height: 44,
                borderRadius: 6,
                background: "#0E1217",
                border: "1px solid rgba(140,170,200,0.08)",
              }}
            />
          ))}
        </div>
        {/* Cable DualShock 2 en primer plano */}
        <svg
          viewBox="0 0 1080 1920"
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <path
            d="M 1080 1560 C 960 1500, 880 1460, 700 1520 C 560 1568, 480 1620, 420 1700"
            fill="none"
            stroke="#0B0E13"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 1080 1560 C 960 1500, 880 1460, 700 1520 C 560 1568, 480 1620, 420 1700"
            fill="none"
            stroke="#2A3540"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Polvo iluminado por el monitor */}
      {DUST.map((d, i) => {
        const y = d.y0 - ((frame * d.speed + d.phase) % 520);
        const op = 0.05 + 0.16 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: d.x,
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

      {/* Emergencia desde el Whip-Zoom de la Escena 3 */}
      {emerge > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.5) 0%, rgba(2,4,10,0.95) 55%, #02040A 100%)",
            opacity: emerge,
          }}
        />
      ) : null}

      {/* Doorway Zoom-Through: túnel oscuro hacia la puerta */}
      {dive > 0.004 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 45%, transparent 0%, rgba(2,3,5,0.55) 40%, rgba(2,3,5,0.96) 72%, #020306 100%)",
              opacity: dive,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              width: 360,
              height: 560,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.4), transparent 70%)",
              opacity: dive * doorGlow,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
