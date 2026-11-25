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
import { MotherWitnessCharacter } from "../components/characters/MotherWitnessCharacter";
import { FONT_MONO, SafeCentered } from "../components/SafeZone";

/**
 * Scene1WakeupBed (frames 0–177, 0.00–5.90s) — El Despertar al Pie de la Cama.
 *
 * Dormitorio nocturno 3:14 AM: la madre (izquierda) despierta sobresaltada en
 * su cama mientras The Rake acecha agazapado al pie (derecha). Coreografía de
 * cámara en 3 planos: Plano General → Macro-Zoom 2.4x al rostro en
 * "pure_terror" → Whip-Pan 2.2x a las cuencas del Rake, preparando el
 * Media Blackout hacia Escena 2.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

// Anclas de mundo (lienzo 1080×1920).
const MOTHER_X = 265;
const MOTHER_FLOOR_Y = 1560;
const MOTHER_FACE_Y = 1260;
const RAKE_X = 740;
const RAKE_FLOOR_Y = 1600;

// Motas de polvo iluminadas por la luna (deterministas).
const DUST = Array.from({ length: 30 }, (_, i) => ({
  x: 80 + random(i * 3 + 1) * 900,
  y0: 320 + random(i * 7 + 2) * 1080,
  r: 1.4 + random(i * 5 + 3) * 2.6,
  speed: 0.06 + random(i * 9 + 4) * 0.14,
  phase: random(i * 13 + 5) * 1200,
  sway: (random(i * 11 + 7) - 0.5) * 26,
}));

/**
 * Manta plana y sutil 2.5D: reposa baja sobre el borde del colchón (floorY
 * 1560) cubriendo únicamente pies/espinillas de la madre, sin envolverla en
 * una burbuja oscura. Altura máxima ~110px pegada al borde del colchón.
 */
const BedBlanket: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, overflow: "visible" }}
  >
    <defs>
      <linearGradient id="s1-blanket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2B4452" />
        <stop offset="55%" stopColor="#1B2E39" />
        <stop offset="100%" stopColor="#12202A" />
      </linearGradient>
    </defs>
    {/* Cuerpo plano y bajo (solo ~104px de alto, pegado al colchón) */}
    <path
      d="M 118 1560 C 128 1520 164 1502 214 1498 C 268 1494 330 1498 396 1516 C 436 1528 452 1548 448 1560 Z"
      fill="url(#s1-blanket)"
    />
    {/* Pliegues textiles sutiles (casi horizontales) */}
    <path d="M 150 1532 C 196 1522 252 1518 316 1524" stroke="#0B141A" strokeWidth="3.5" fill="none" opacity="0.55" />
    <path d="M 152 1546 C 200 1538 256 1535 320 1540" stroke="#0B141A" strokeWidth="3.5" fill="none" opacity="0.5" />
    {/* Borde iluminado por la luna */}
    <path
      d="M 118 1560 C 128 1520 164 1502 214 1498 C 268 1494 330 1498 396 1516"
      stroke="#8FA6C8"
      strokeWidth="2.5"
      fill="none"
      opacity="0.45"
      strokeLinecap="round"
    />
  </svg>
);

export const Scene1WakeupBed: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Coreografía de cámara en 3 planos -----------------------------
  // Plano 1 (0–58): Plano General (1.0 → 1.12). Plano 2 (58–116): Macro-Zoom
  // 2.4x al rostro de la madre. Plano 3 (116–177): Whip-Pan 2.2x al Rake.
  let s: number;
  let px: number;
  let py: number;

  if (frame < 58) {
    s = interpolate(frame, [0, 58], [1, 1.12], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = OX;
    py = OY;
  } else if (frame < 116) {
    s = interpolate(frame, [58, 116], [1.12, 2.4], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [58, 116], [OX, MOTHER_X], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    // El rostro queda centrado en pantalla y ≈ 720 (sobre los subtítulos).
    py = interpolate(
      frame,
      [58, 116],
      [OY, MOTHER_FACE_Y + (OY - 720) / 2.4],
      { easing: Easing.inOut(Easing.cubic), ...CLAMP }
    );
  } else {
    s = interpolate(frame, [116, 177], [2.4, 2.2], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    // El Whip-Pan llega y fija el encuadre sobre The Rake a partir del
    // frame 142 (y no al final, frame 177), de modo que el personaje queda
    // centrado en pantalla (x ≈ 540) durante el macro-zoom final en vez de
    // quedar pegado al borde derecho.
    px = interpolate(frame, [116, 142], [MOTHER_X, RAKE_X], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(
      frame,
      [116, 142],
      [MOTHER_FACE_Y + (OY - 720) / 2.4, 1258],
      { easing: Easing.inOut(Easing.cubic), ...CLAMP }
    );
  }

  const TX = OX - px * s;
  const TY = OY - py * s;

  // --- Actuación de la madre ----------------------------------------
  const posture = frame < 18 ? "sleeping_bed" : "sitting_bed";
  const emotion =
    frame < 18 ? "calm_sleep" : frame < 55 ? "startled" : "pure_terror";
  const headTurn = interpolate(frame, [18, 42], [0, 0.6], { ...CLAMP });
  const lookX = interpolate(frame, [40, 62], [0, 0.9], { ...CLAMP });

  // --- The Rake acechando al pie de la cama --------------------------
  const rakeOpacity = interpolate(frame, [0, 24], [0.45, 0.95], { ...CLAMP });
  const clawFlex = 0.4 + 0.3 * Math.sin(frame * 0.11);
  const mouthOpen = 0.08 + 0.05 * Math.sin(frame * 0.2);

  // --- Reloj despertador (se desvanece al entrar el Macro-Zoom) ------
  const clockFade = interpolate(frame, [0, 8, 52, 66], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const clockBlink = 0.72 + 0.28 * Math.sin(frame * 0.35);

  // --- Parallax del fondo --------------------------------------------
  const bgDrift = Math.sin(frame * 0.011) * 7;

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
        {/* 1. Background con sobrescala 1.08 para parallax */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s1.png")}
            style={{
              position: "absolute",
              width: "108%",
              height: "108%",
              left: "-4%",
              top: "-4%",
              objectFit: "cover",
              transform: `translate(${bgDrift.toFixed(2)}px, 0px)`,
            }}
          />
        </div>

        {/* 2. Haz de luz lunar geométrico suave (foreground) */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="s1-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BDE3F5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#BDE3F5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="180,-40 330,-40 560,1580 380,1580"
            fill="url(#s1-beam)"
            opacity="0.5"
          />
        </svg>

        {/* 3. Manta/sábana delantera 2.5D */}
        <BedBlanket />

        {/* 4. Madre en la cama (izquierda, mirando hacia la derecha) */}
        <MotherWitnessCharacter
          x={MOTHER_X}
          floorY={MOTHER_FLOOR_Y}
          scale={1.4}
          flipX={false}
          posture={posture}
          emotion={emotion}
          headTurn={headTurn}
          lookTarget={{ x: lookX, y: 0.25 }}
          startleTriggerFrame={18}
          rimColor="#60A5FA"
        />

        {/* 5. The Rake al pie de la cama (derecha, mirando a la madre) */}
        <RakeCharacter
          x={RAKE_X}
          floorY={RAKE_FLOOR_Y}
          scale={1.4}
          flipX
          opacity={rakeOpacity}
          mode="crouch_watch"
          lookTarget={{ x: -0.85, y: -0.2 }}
          mouthOpen={mouthOpen}
          clawFlex={clawFlex}
          rimColor="#38BDF8"
          eyeGlowColor="#F8FAFC"
        />

        {/* 6. Polvo iluminado por la luna */}
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

        {/* 7. Viñeta de bordes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Reloj despertador diegético (fijo a pantalla) */}
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
    </AbsoluteFill>
  );
};
