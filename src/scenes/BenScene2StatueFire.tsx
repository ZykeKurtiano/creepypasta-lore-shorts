import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HEIGHT, WIDTH } from "../data/episodeConfig";
import { SafeCentered } from "../components/SafeZone";
import { ElegyStatueCharacter } from "../components/characters/ElegyStatueCharacter";
import { PlayerCharacter } from "../components/characters/PlayerCharacter";

/**
 * BenScene2StatueFire — Escena 2: La Estatua y "Your Turn" (global 590–1248).
 *
 * Ciudad Reloj crepuscular y desierta (3 capas 2.5D):
 *  - background (0.2): Torre del Reloj, edificios medievales torcidos,
 *    cielo violeta-carmesí y notas musicales invertidas (Canción de
 *    Curación al revés) flotando; borde CRT de salida (f 0–35).
 *  - midground: empedrado real con sombras, Link (link_tunic) corriendo
 *    con zancada real, estatua con 3 teletransportes bruscos cada vez
 *    más cerca, llamas volumétricas (f 415–560) y texto diegético
 *    corrupto "YOUR TURN" centrado (f 525–615).
 *  - foreground (1.3): arcos de piedra, brasas y chispas.
 *  - Cámara: pan lateral suave siguiendo la carrera + un único empuje
 *    spring en el clímax de "Tu turno" (local f 538, deep_boom).
 *  - Salida (f 615–658): Z-Dive continuo atravesando la superficie del
 *    agua oscura de la Gran Bahía con ondas volumétricas y burbujas.
 */

/** Nota musical invertida (corchea) espectral. */
const InvertedNote: React.FC<{
  x: number;
  y: number;
  color: string;
  scale: number;
  frame: number;
  seed: number;
}> = ({ x, y, color, scale, frame, seed }) => {
  const drift = Math.sin(frame * 0.01 + seed) * 12;
  const pulse = 0.22 + 0.14 * Math.sin(frame * 0.09 + seed * 2);
  return (
    <g transform={`translate(${x + drift} ${y}) scale(${scale})`} opacity={pulse}>
      <g transform="scale(1 -1)">
        <ellipse cx="0" cy="0" rx="8" ry="6" fill={color} transform="rotate(-18)" />
        <path
          d={`M 7 -2 L 7 -34 C 16 -32, 21 -26, 21 -16 C 21 -11, 16 -9, 12 -13`}
          stroke={color}
          strokeWidth="3"
          fill="none"
        />
        <path d={`M 7 -34 C 14 -33, 19 -30, 22 -25`} stroke={color} strokeWidth="2.4" fill="none" />
      </g>
    </g>
  );
};

export const BenScene2StatueFire: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Intención única de cámara: pan lateral siguiendo la carrera ----
  // (limitado a [-65, 0] para no descubrir franjas oscuras laterales)
  const panX = interpolate(frame, [20, 390], [0, -65], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Único empuje spring sincronizado con deep_boom (local f 538).
  const punch = spring({
    frame: frame - 538,
    fps,
    config: { damping: 190, mass: 0.55, stiffness: 130 },
  });
  const camScale = 1 + punch * 0.06;
  const camY = -punch * 9;
  const bgScale = 1 + (camScale - 1) * 0.25;
  const fgScale = 1 + (camScale - 1) * 1.3;

  // Borde CRT de salida del zoom-through (f 0–35).
  const crtEdge = interpolate(frame, [0, 35], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crtFrameScale = interpolate(frame, [0, 35], [0.16, 2.1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Link corriendo (f 20–390) y retrocediendo en recoil (f 395–515).
  const linkX = interpolate(frame, [20, 390], [900, 140], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Estatua: 3 teletransportes bruscos cada vez más cerca.
  const farGlitch = interpolate(frame, [270, 274, 294], [1, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const farOpacity = interpolate(frame, [270, 276, 320, 335], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const midGlitch = interpolate(frame, [335, 339, 359], [1, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const midOpacity = interpolate(frame, [335, 341, 380, 395], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const closeGlitch = interpolate(frame, [395, 399, 419], [1, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const closeOpacity = interpolate(frame, [395, 401, 560, 590], [0, 1, 1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Llamas: flameIntensity 0 → 1 (f 415–480), sostenido y caída.
  const flame = interpolate(frame, [415, 480, 545, 600], [0, 1, 1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statueRim = frame >= 415 ? "#F97316" : "#22C55E";

  // Texto diegético "YOUR TURN" (f 525–615).
  const textReveal = interpolate(frame, [525, 555], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subReveal = interpolate(frame, [548, 578], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textFlicker = 0.72 + 0.22 * Math.abs(Math.sin(frame * 0.7)) + punch * 0.4;

  // Transición Z-Dive (f 615–658).
  const waterY = interpolate(frame, [615, 648], [1920, 620], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const abyss = interpolate(frame, [645, 658], [0, 1], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0812", overflow: "hidden" }}>
      {/* ================================ CÁMARA ================================ */}
      <AbsoluteFill
        style={{
          transform: `translateX(${panX}px) translateY(${camY}px) scale(${camScale})`,
          transformOrigin: "50% 50%",
          overflow: "hidden",
        }}
      >
        {/* ============================ BACKGROUND (0.2) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: "50% 50%" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s2-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A0812" />
                <stop offset="55%" stopColor="#1E1022" />
                <stop offset="100%" stopColor="#2B1218" />
              </linearGradient>
              <radialGradient id="s2-moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D8C0A8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D8C0A8" stopOpacity="0" />
              </radialGradient>
              <filter id="s2-blur6" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            <rect x="0" y="0" width={WIDTH} height="1040" fill="url(#s2-sky)" />
            {[120, 300, 520, 720, 900, 980, 160, 640, 830].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={140 + ((i * 137) % 420)}
                r={1.2 + (i % 3) * 0.8}
                fill="#C9A8C0"
                opacity={0.3 + 0.2 * Math.sin(frame * 0.05 + i)}
              />
            ))}
            {/* Luna enfermiza */}
            <circle cx="760" cy="260" r="120" fill="url(#s2-moon)" filter="url(#s2-blur6)" />
            <circle cx="760" cy="260" r="66" fill="#C9A8B4" opacity="0.35" />

            {/* Torre del Reloj */}
            <g>
              <rect x="500" y="300" width="80" height="700" fill="#141020" />
              <rect x="486" y="264" width="108" height="60" rx="8" fill="#191428" />
              <path d={`M 470 268 L 540 160 L 610 268 Z`} fill="#191428" />
              <path d={`M 470 268 L 540 160 L 540 190 Z`} fill="#241A38" />
              <circle cx="540" cy="468" r="46" fill="#0E0B16" stroke="#241A38" strokeWidth="5" />
              <circle cx="540" cy="468" r="40" fill="#181226" />
              <line x1="540" y1="468" x2="540" y2="440" stroke="#C9A8C0" strokeWidth="4" strokeLinecap="round" />
              <line x1="540" y1="468" x2="562" y2="480" stroke="#C9A8C0" strokeWidth="3" strokeLinecap="round" />
              {[0, 1, 2, 3].map((i) => (
                <circle key={i} cx={540 + Math.cos((i * Math.PI) / 2) * 34} cy={468 + Math.sin((i * Math.PI) / 2) * 34} r="3" fill="#C9A8C0" opacity="0.6" />
              ))}
              <rect x="470" y="950" width="140" height="50" fill="#141020" />
            </g>

            {/* Edificios medievales torcidos y vacíos */}
            <g transform="rotate(4 240 700)">
              <path d={`M 60 1000 L 60 620 L 190 620 L 190 700 L 150 700 L 150 1000 Z`} fill="#120E1C" />
              <path d={`M 40 620 L 130 520 L 220 620 Z`} fill="#150F22" />
              <path d={`M 210 1000 L 210 700 L 330 700 L 330 760 L 290 760 L 290 1000 Z`} fill="#100C18" />
              <path d={`M 195 700 L 262 610 L 345 700 Z`} fill="#150F22" />
              <rect x="110" y="720" width="18" height="24" fill="#2E1E36" opacity="0.5" />
              <rect x="250" y="800" width="18" height="24" fill="#2E1E36" opacity="0.4" />
            </g>
            <g transform="rotate(-3 880 700)">
              <path d={`M 840 1000 L 840 660 L 960 660 L 960 730 L 920 730 L 920 1000 Z`} fill="#120E1C" />
              <path d={`M 820 660 L 900 560 L 980 660 Z`} fill="#150F22" />
              <path d={`M 980 1000 L 980 740 L 1080 740 L 1080 800 L 1050 800 L 1050 1000 Z`} fill="#100C18" />
              <rect x="876" y="760" width="18" height="24" fill="#2E1E36" opacity="0.45" />
            </g>

            {/* Notas musicales invertidas (Canción de Curación al revés) */}
            <InvertedNote x={170} y={620} color="#22D3EE" scale={1.6} frame={frame} seed={0} />
            <InvertedNote x={330} y={760} color="#FDE047" scale={1.2} frame={frame} seed={2.1} />
            <InvertedNote x={700} y={640} color="#22D3EE" scale={1.8} frame={frame} seed={4.2} />
            <InvertedNote x={880} y={790} color="#FDE047" scale={1.3} frame={frame} seed={6.3} />
            <InvertedNote x={520} y={700} color="#22D3EE" scale={1.1} frame={frame} seed={8.1} />
            <InvertedNote x={90} y={850} color="#FDE047" scale={1.4} frame={frame} seed={10.4} />
          </svg>
        </AbsoluteFill>

        {/* ============================ MIDGROUND (1.0) ============================ */}
        <AbsoluteFill>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s2-plaza" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#161B22" />
                <stop offset="100%" stopColor="#08090D" />
              </linearGradient>
              <radialGradient id="s2-firelight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="s2-water" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0A2434" />
                <stop offset="100%" stopColor="#04101A" />
              </radialGradient>
              <radialGradient id="s2-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="s2-blur8" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Empedrado de la plaza con sombras proyectadas */}
            <rect x="0" y="1040" width={WIDTH} height={HEIGHT - 1040} fill="url(#s2-plaza)" />
            <path d={`M 470 1040 L 300 1920 L 780 1920 L 610 1040 Z`} fill="#0E1014" opacity="0.55" filter="url(#s2-blur8)" />
            <path d={`M 180 1040 L 80 1600 L 260 1600 L 320 1040 Z`} fill="#0A0B0E" opacity="0.4" filter="url(#s2-blur8)" />
            {[0, 1, 2, 3].map((row) => (
              <g key={row}>
                {[0, 1, 2, 3, 4].map((col) => (
                  <rect
                    key={col}
                    x={90 + col * 205 + (row % 2) * 100}
                    y={1090 + row * 160}
                    width={190}
                    height={120}
                    rx="14"
                    fill={row % 2 === 0 ? "#1A2028" : "#171C23"}
                    stroke="#0A0C0F"
                    strokeWidth="3"
                    transform={`rotate(${(row + col) % 3 - 1} ${90 + col * 205 + (row % 2) * 100 + 95} ${1090 + row * 160 + 60})`}
                  />
                ))}
              </g>
            ))}
            {/* Juntas del empedrado */}
            <line x1="0" y1="1040" x2={WIDTH} y2="1040" stroke="#05070A" strokeWidth="4" />

            {/* Luz de fuego dinámica sobre la plaza */}
            <ellipse
              cx="715"
              cy="1180"
              rx="480"
              ry="400"
              fill="url(#s2-firelight)"
              opacity={flame * (0.8 + 0.2 * Math.sin(frame * 0.55))}
              filter="url(#s2-blur8)"
              style={{ mixBlendMode: "screen" }}
            />
            <ellipse cx="715" cy="1560" rx="300" ry="60" fill="url(#s2-firelight)" opacity={flame * 0.6} filter="url(#s2-blur8)" />
          </svg>

          {/* Link corriendo (f 20–390) */}
          <Sequence from={20} durationInFrames={375} name="s2-link-run">
            <PlayerCharacter
              uid="s2-link"
              width={380}
              outfit="link_tunic"
              action="run"
              expression="terrified"
              rimColor="#22D3EE"
              lookX={-0.85}
              style={{ left: linkX, bottom: 380 }}
            />
          </Sequence>

          {/* Link retrocediendo (recoil, f 395–515) */}
          <Sequence from={395} durationInFrames={120} name="s2-link-recoil">
            <PlayerCharacter
              uid="s2-link"
              width={380}
              outfit="link_tunic"
              action="recoil"
              expression="terrified"
              rimColor="#22D3EE"
              lookX={-0.85}
              style={{ left: 140, bottom: 380 }}
            />
          </Sequence>

          {/* Estatua: 1er teletransporte (lejano) */}
          <Sequence from={270} durationInFrames={65} name="s2-statue-far">
            <ElegyStatueCharacter
              uid="s2-es-far"
              width={260}
              rimColor="#22C55E"
              glowEyes
              eyeGlowColor="#22C55E"
              teleportGlitch={farGlitch}
              opacity={farOpacity}
              style={{ left: 740, bottom: 520 }}
            />
          </Sequence>

          {/* Estatua: 2º teletransporte (plano medio) */}
          <Sequence from={335} durationInFrames={60} name="s2-statue-mid">
            <ElegyStatueCharacter
              uid="s2-es-mid"
              width={360}
              rimColor="#22C55E"
              glowEyes
              eyeGlowColor="#22C55E"
              teleportGlitch={midGlitch}
              opacity={midOpacity}
              style={{ left: 660, bottom: 440 }}
            />
          </Sequence>

          {/* Estatua: 3er teletransporte (justo detrás) + llamas */}
          <Sequence from={395} durationInFrames={200} name="s2-statue-close">
            <ElegyStatueCharacter
              uid="s2-es-close"
              width={470}
              rimColor={statueRim}
              glowEyes
              eyeGlowColor={frame >= 415 ? "#DC2626" : "#22C55E"}
              teleportGlitch={closeGlitch}
              flameIntensity={flame}
              opacity={closeOpacity}
              style={{ left: 480, bottom: 350 }}
            />
          </Sequence>

          {/* Texto "YOUR TURN" se dibuja encima de la cámara (ver SafeCentered abajo) */}

          {/* Transición Z-Dive: superficie de agua oscura de la Gran Bahía */}
          {frame >= 615 && (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <g transform={`translate(0 ${waterY})`}>
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M 0 ${100 + i * 40} C 135 ${100 + i * 40 + 16 + Math.sin(frame * 0.3 + i) * 10}, 270 ${100 + i * 40 - 16 + Math.sin(frame * 0.26 + i * 2) * 10}, 405 ${100 + i * 40} C 540 ${100 + i *40 + 16 + Math.sin(frame * 0.31 + i * 1.3) * 10}, 675 ${100 + i * 40 - 16 + Math.sin(frame * 0.27 + i * 2.2) * 10}, 810 ${100 + i * 40} C 945 ${100 + i * 40 + 16 + Math.sin(frame * 0.3 + i) * 10}, 1010 ${100 + i * 40 - 8}, 1080 ${100 + i * 40} L 1080 900 L 0 900 Z`}
                    fill="url(#s2-water)"
                    opacity={0.96}
                  />
                ))}
                <path
                  d={`M 0 100 C 135 116, 270 84, 405 100 C 540 116, 675 84, 810 100 C 945 116, 1010 92, 1080 100`}
                  stroke="#22D3EE"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d={`M 0 118 C 120 108, 260 128, 420 118 C 600 108, 760 128, 920 118 C 1000 113, 1050 115, 1080 118`}
                  stroke="#7FD8EC"
                  strokeWidth="1.6"
                  fill="none"
                  opacity="0.3"
                />
              </g>
              {/* Azul abisal + burbujas al sumergirse */}
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#04121F" opacity={abyss} />
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#072B40" opacity={abyss * 0.6} />
              {abyss > 0.01 &&
                Array.from({ length: 10 }, (_, i) => {
                  const t = ((frame * 1.8 + i * 61) % 300) / 300;
                  const bx = 160 + i * 90 + Math.sin(frame * 0.05 + i) * 24;
                  const by = 1900 - t * 2100;
                  return (
                    <circle
                      key={i}
                      cx={bx}
                      cy={by}
                      r={2.5 + (i % 3) * 2}
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="1.4"
                      opacity={abyss * (0.3 + 0.3 * Math.sin(t * Math.PI))}
                    />
                  );
                })}
            </svg>
          )}
        </AbsoluteFill>

        {/* ============================ FOREGROUND (1.3) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${fgScale})`, transformOrigin: "50% 50%" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <filter id="s2-fgblur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>
            {/* Arcos de piedra oscuros en los bordes (máx 75px de grosor) */}
            <g filter="url(#s2-fgblur)">
              <path d={`M -60 1920 L -60 560 C -60 320, 10 260, 75 310 C 100 330, 106 380, 100 560 L 100 1920 Z`} fill="#040507" opacity="0.95" />
              <path d={`M 1140 1920 L 1140 560 C 1140 320, 1070 260, 1005 310 C 980 330, 974 380, 980 560 L 980 1920 Z`} fill="#040507" opacity="0.95" />
              <path d={`M 66 440 C 20 360, -10 320, -60 336`} stroke="#0F0A16" strokeWidth="14" fill="none" opacity="0.9" />
              <path d={`M 1014 440 C 1060 360, 1090 320, 1140 336`} stroke="#0F0A16" strokeWidth="14" fill="none" opacity="0.9" />
            </g>
            {/* Brasas y chispas en primer plano */}
            {Array.from({ length: 9 }, (_, i) => {
              const t = ((frame * 1.4 + i * 67) % 260) / 260;
              const ex = 60 + (i * 130) % 1000 + Math.sin(frame * 0.09 + i * 2.2) * 30;
              const ey = 1880 - t * 1500;
              const eo = Math.sin(t * Math.PI) * (0.35 + 0.35 * Math.sin(frame * 0.6 + i));
              return (
                <g key={i} opacity={interpolate(frame, [415, 470, 600, 640], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                  <circle cx={ex} cy={ey} r={3 + (i % 3)} fill="#F97316" opacity={Math.max(0, eo) * 0.5} filter="url(#s2-fgblur)" />
                  <circle cx={ex} cy={ey} r={1.6 + (i % 2)} fill="#FDE047" opacity={Math.max(0, eo)} />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Texto diegético corrupto "YOUR TURN" — encima de la cámara, centrado estricto */}
      {frame >= 525 && frame <= 615 && (
        <SafeCentered top={390} zIndex={30}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 90,
                transform: "translateX(-50%)",
                width: 640,
                height: 300,
                background:
                  "radial-gradient(ellipse at center, rgba(4,5,7,0.8) 0%, rgba(4,5,7,0.42) 55%, rgba(4,5,7,0) 78%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ opacity: textReveal * textFlicker }}>
              <div
                style={{
                  position: "relative",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 82,
                  fontWeight: 700,
                  letterSpacing: 6,
                  color: "#C9F7D8",
                  textShadow: "0 0 26px rgba(34,197,94,0.45), 0 4px 24px rgba(0,0,0,0.9)",
                  whiteSpace: "nowrap",
                }}
              >
                YOUR TURN
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    color: "#F43F5E",
                    transform: "translateX(-3px)",
                    opacity: 0.5,
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                >
                  YOUR TURN
                </span>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    color: "#22D3EE",
                    transform: "translateX(3px)",
                    opacity: 0.45,
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                >
                  YOUR TURN
                </span>
              </div>
            </div>
            <div style={{ opacity: subReveal * (0.7 + 0.25 * Math.sin(frame * 0.5)) }}>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 24,
                  letterSpacing: 2.5,
                  color: "#7FE0A8",
                  textShadow: "0 3px 16px rgba(0,0,0,0.9)",
                  lineHeight: 1.35,
                }}
              >
                TE HAS ENCONTRADO CON UN
                <br />
                DESTINO TERRIBLE
              </div>
            </div>
          </div>
        </SafeCentered>
      )}

      {/* Borde CRT de salida del zoom-through (f 0–35) */}
      {crtEdge > 0.01 && (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <g
              opacity={crtEdge}
              transform={`translate(${WIDTH / 2} ${960}) scale(${crtFrameScale}) translate(${-WIDTH / 2} ${-960})`}
            >
              <rect x="40" y="120" width="1000" height="1680" rx="90" fill="#040507" opacity="0.96" />
              <rect x="40" y="120" width="1000" height="1680" rx="90" fill="none" stroke="#22C55E" strokeWidth="14" opacity="0.85" />
              <rect x="62" y="142" width="956" height="1636" rx="72" fill="none" stroke="#0A1F14" strokeWidth="8" opacity="0.8" />
            </g>
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
