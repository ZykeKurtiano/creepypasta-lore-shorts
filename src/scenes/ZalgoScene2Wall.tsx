import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ZalgoEntity } from "../components/characters/ZalgoEntity";

/**
 * ZalgoScene2Wall (frames 621–1080, 20.70–36.00s) — El que espera detrás del muro.
 *
 * Emerge de la oscuridad del camera dive, retroceso lento majestuoso
 * (pull-back 1.12 → 1.0) revelando la escala monumental de Zalgo. Un único
 * micro-impacto breve (8 frames) en localFrame 99, sincronizado con
 * wall_shatter.mp3, hace estallar el muro dimensional de obsidiana en 10+
 * bloques poligonales 2.5D, revelando a la entidad de siete bocas que abre
 * sus bocas, eleva sus brazos sosteniendo la estrella muerta y la vela negra,
 * y lanza ondas sonoras apocalípticas que resquebrajan el horizonte.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Bloques poligonales 2.5D en que se fragmenta el muro. */
const SHARDS = Array.from({ length: 14 }, (_, i) => ({
  cx: 120 + random(i * 4.7 + 1) * 840,
  cy: 360 + random(i * 6.3 + 5) * 1080,
  w: 70 + random(i * 3.1 + 9) * 120,
  h: 50 + random(i * 5.9 + 3) * 90,
  rot: (random(i * 7.7 + 2) - 0.5) * 150,
  dx: (random(i * 11.3 + 4) - 0.5) * 980,
  dy: (random(i * 13.1 + 8) - 0.5) * 760,
  flip: random(i * 17.9 + 6) > 0.5 ? 1 : -1,
}));

/** Grieta luminosa del muro (nace del centro). */
const Wall: React.FC<{ frame: number }> = ({ frame }) => {
  const crack = clamp01(
    interpolate(frame, [20, 99], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  // El muro intacto se desvanece al estallar (99–130).
  const intact = 1 - clamp01(
    interpolate(frame, [99, 130], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shardProg = clamp01(
    interpolate(frame, [99, 165], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shardOpacity = clamp01(
    interpolate(frame, [99, 104, 150, 165], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="z2-stone" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#141219" />
          <stop offset="50%" stopColor="#0B0A0E" />
          <stop offset="100%" stopColor="#040507" />
        </linearGradient>
        <radialGradient id="z2-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#DC2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Muro intacto de piedra obsidiana */}
      <g opacity={intact}>
        <rect x="90" y="300" width="900" height="1220" rx="10" fill="url(#z2-stone)" />
        {/* Vetas de obsidiana */}
        <g fill="none" stroke="#1A1820" strokeWidth="6" opacity="0.6">
          <path d="M 130 360 C 260 420, 200 560, 320 640 C 440 720, 380 880, 480 980" />
          <path d="M 950 400 C 820 480, 880 620, 760 700 C 640 780, 700 940, 600 1040" />
          <path d="M 500 320 C 520 440, 480 560, 540 680" />
        </g>
        {/* Núcleo de energía carmesí */}
        <circle cx="540" cy="900" r={60 + crack * 180} fill="url(#z2-core)" opacity={0.5 + crack * 0.5} />
        {/* Grietas luminosas que se abren desde el centro */}
        <g fill="none" stroke="#DC2626" strokeLinecap="round">
          <path d="M 540 900 C 520 820, 500 740, 470 660 C 450 600, 460 540, 430 480 C 410 440, 420 380, 400 330" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 560 820, 580 740, 610 660 C 630 600, 620 540, 650 480 C 670 440, 660 380, 680 330" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 540 1000, 540 1100, 540 1200 C 540 1280, 530 1360, 545 1500" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 470 920, 400 930, 330 940 C 260 950, 190 930, 120 960" strokeWidth="3" opacity={crack * 0.8} />
          <path d="M 540 900 C 610 920, 680 930, 750 940 C 820 950, 890 930, 960 960" strokeWidth="3" opacity={crack * 0.8} />
          <path d="M 470 660 C 380 640, 300 660, 230 610" strokeWidth="2.5" opacity={crack * 0.7} />
          <path d="M 610 660 C 700 640, 780 660, 850 610" strokeWidth="2.5" opacity={crack * 0.7} />
        </g>
        {/* Destello del núcleo justo antes de estallar */}
        <circle cx="540" cy="900" r={30 + crack * 90} fill="#F43F5E" opacity={crack * 0.4} filter="blur(6px)" />
      </g>

      {/* Bloques poligonales que salen despedidos */}
      <g opacity={shardOpacity}>
        {SHARDS.map((s, i) => {
          const tx = s.cx + s.dx * shardProg;
          const ty = s.cy + s.dy * shardProg + 260 * shardProg * shardProg; // gravedad suave
          const rot = s.rot * shardProg * s.flip;
          return (
            <g key={i} transform={`translate(${tx} ${ty}) rotate(${rot})`}>
              <polygon
                points={`${-s.w / 2},${-s.h / 2} ${s.w * 0.4},${-s.h * 0.35} ${s.w / 2},${s.h * 0.3} ${-s.w * 0.35},${s.h / 2}`}
                fill="#0B0A0E"
                stroke="#7F1D1D"
                strokeWidth="2"
              />
              <polygon
                points={`${-s.w / 2},${-s.h / 2} ${s.w * 0.4},${-s.h * 0.35} ${s.w * 0.2},${-s.h * 0.05}`}
                fill="#1A1820"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const ZalgoScene2Wall: React.FC = () => {
  const frame = useCurrentFrame();

  // Retroceso lento majestuoso (pull-back 1.12 → 1.0).
  const pullBack = interpolate(frame, [0, 459], [1.12, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Emerger de la oscuridad del camera dive (0–16).
  const emerge = 1 - clamp01(
    interpolate(frame, [0, 16], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Único micro-impacto (8 frames) sincronizado con wall_shatter.mp3 (local 99).
  const impact = clamp01(
    interpolate(frame, [99, 103, 107], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shakeX = Math.sin(frame * 1.9) * 9 * impact;
  const shakeY = Math.cos(frame * 1.5) * 7 * impact;
  const scale = pullBack * (1 + impact * 0.035);

  // Apertura progresiva de las 7 bocas (125–300).
  const mouthsOpen = clamp01(
    interpolate(frame, [125, 300], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  // Brazos elevados sosteniendo estrella muerta y vela negra (300–440).
  const starPower = clamp01(
    interpolate(frame, [300, 440], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Ondas sonoras apocalípticas (nacen en 300).
  const waveT = Math.max(0, frame - 300);
  const waveOn = clamp01(interpolate(frame, [300, 320], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const horizonPulse = waveOn * Math.sin(waveT * 0.08) * 8;

  // Foreground wipe de salida (438–459): garra + zarcillos cruzan a la izquierda.
  const wipe = clamp01(
    interpolate(frame, [438, 459], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const wipeX = interpolate(frame, [438, 459], [1120, -320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: pull-back + micro-impacto puntual */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ============ BACKGROUND (vacío cósmico) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 120% 70% at 50% 42%, #2A0609 0%, #14040A 40%, #0A0305 62%, #040507 100%)",
            }}
          />
          {/* Nebulosa carmesí con mayor contraste */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="z2-nebula" cx="50%" cy="46%" r="60%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.34" />
                <stop offset="45%" stopColor="#7F1D1D" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="540" cy="860" rx="620" ry="760" fill="url(#z2-nebula)" />
            <g fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.3">
              <path d="M 160 700 C 320 620, 420 760, 620 640 C 760 550, 860 620, 980 540" />
              <path d="M 120 900 C 300 800, 500 940, 700 820 C 840 740, 940 820, 1040 760" />
              <path d="M 260 1100 C 420 1000, 620 1120, 820 1000" opacity="0.5" />
            </g>
            <g fill="none" stroke="#7F1D1D" strokeWidth="2" opacity="0.25">
              <path d="M 0 320 C 240 280, 520 380, 760 300 C 920 250, 1020 300, 1080 280" />
              <path d="M 0 520 C 300 460, 600 560, 900 480 C 1000 450, 1050 470, 1080 460" />
              <path d="M 0 780 C 260 720, 560 800, 820 720 C 940 680, 1020 720, 1080 700" />
            </g>
            {/* Estrellas apagadas */}
            <g fill="#F2EFE9" opacity="0.4">
              {Array.from({ length: 30 }, (_, i) => (
                <circle
                  key={i}
                  cx={random(i * 13.7 + 2) * 1080}
                  cy={random(i * 17.3 + 5) * 760}
                  r={0.8 + random(i * 3.3 + 9) * 1.6}
                />
              ))}
            </g>
          </svg>

          {/* Horizonte planetario curvo (pulsa/resquebraja con las ondas) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <linearGradient id="z2-earth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14080A" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 ${1620 + horizonPulse} C 260 ${1560 + horizonPulse}, 820 ${1560 + horizonPulse}, 1080 ${1620 + horizonPulse} L 1080 1920 L 0 1920 Z`}
              fill="url(#z2-earth)"
            />
            {/* Silueta de la Tierra resquebrajada */}
            <g fill="#08040A">
              <path d={`M 0 ${1610 + horizonPulse} C 260 ${1550 + horizonPulse}, 820 ${1550 + horizonPulse}, 1080 ${1610 + horizonPulse} L 1080 1660 L 0 1660 Z`} />
            </g>
            {/* Rim light carmesí sobre el arco del horizonte */}
            <path
              d={`M 0 ${1620 + horizonPulse} C 260 ${1560 + horizonPulse}, 820 ${1560 + horizonPulse}, 1080 ${1620 + horizonPulse}`}
              stroke="#DC2626"
              strokeWidth="3"
              fill="none"
              opacity={0.5 + waveOn * 0.5}
            />
            {/* Grietas del horizonte que crecen con las ondas */}
            <g stroke="#DC2626" strokeWidth="3.5" fill="none" opacity={waveOn}>
              <path d={`M 300 ${1610 + horizonPulse} L 360 ${1640 + horizonPulse} L 420 ${1618 + horizonPulse} L 500 ${1650 + horizonPulse}`} />
              <path d={`M 700 ${1610 + horizonPulse} L 760 ${1640 + horizonPulse} L 820 ${1618 + horizonPulse}`} />
            </g>
            {/* Ondas sonoras concéntricas naciendo del centro */}
            {waveOn > 0.01 ? (
              <g fill="none" strokeLinecap="round" transform={`translate(540 ${1550 + horizonPulse})`}>
                {[0, 1, 2].map((k) => {
                  const phase = (waveT * 3 + k * 60) % 240;
                  const r = 40 + phase * 3.2;
                  const op = waveOn * (1 - phase / 240) * (1 - k * 0.22);
                  return (
                    <ellipse
                      key={k}
                      cx="0"
                      cy="0"
                      rx={r}
                      ry={r * 0.32}
                      stroke={k === 0 ? "#F43F5E" : "#DC2626"}
                      strokeWidth={3.4 - k * 0.7}
                      opacity={op}
                    />
                  );
                })}
              </g>
            ) : null}
          </svg>
        </div>

        {/* ============ MIDGROUND (muro → Zalgo) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Zalgo revelado detrás del muro (monumental, centrado, brazos desplegados) */}
          <div
            style={{
              position: "absolute",
              top: 260,
              left: 80,
              width: 920,
              height: 1077,
            }}
          >
            <ZalgoEntity
              mode="cosmic"
              mouthsOpen={mouthsOpen}
              starPower={starPower}
              localFrame={frame}
              idPrefix="z2-zalgo"
            />
          </div>

          {/* Muro dimensional + fragmentación */}
          <Wall frame={frame} />
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.35x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Escombros desenfocados tras la explosión */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {SHARDS.slice(0, 6).map((s, i) => {
              const fg = clamp01(interpolate(frame, [108, 120], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }));
              const tx = (s.cx % 1080) + Math.sin(frame * 0.05 + i) * 30;
              const ty = 600 + ((frame * (2.4 + i) + i * 180) % 1200);
              return (
                <polygon
                  key={i}
                  points={`${tx},${ty} ${tx + 70},${ty - 20} ${tx + 90},${ty + 30} ${tx + 20},${ty + 44}`}
                  fill="#040507"
                  opacity={fg * 0.85}
                  filter="blur(3px)"
                />
              );
            })}
          </svg>

          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.85 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.85 }} />
        </div>
      </AbsoluteFill>

      {/* Emerger de la oscuridad líquida */}
      <AbsoluteFill style={{ background: "#020304", opacity: emerge }} />

      {/* Transición espacial de salida: garra colosal + zarcillos (derecha → izquierda) */}
      {wipe > 0.004 ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${wipeX}px)` }}
          >
            <defs>
              <linearGradient id="z2-wipe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#040507" />
                <stop offset="70%" stopColor="#0B0A0E" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
            </defs>
            {/* Garra colosal */}
            <g>
              <path d="M 60 -40 C 200 120, 260 320, 240 540 C 260 760, 220 980, 200 1200 C 180 1440, 200 1680, 240 1960 L 520 1960 C 460 1500, 480 1100, 520 760 C 540 520, 500 280, 420 60 Z" fill="url(#z2-wipe)" />
              {[0, 1, 2, 3].map((k) => (
                <path
                  key={k}
                  d={`M ${180 + k * 60} 560 C ${200 + k * 60} 420, ${220 + k * 60} 300, ${260 + k * 60} 180 C ${262 + k * 60} 176, ${266 + k * 60} 178, ${264 + k * 60} 184 C ${232 + k * 60} 300, ${210 + k * 60} 430, ${210 + k * 60} 560 Z`}
                  fill="#0B0A0E"
                  stroke="#7F1D1D"
                  strokeWidth="2"
                />
              ))}
            </g>
            {/* Haz de zarcillos carmesí-negros */}
            <g fill="none" strokeLinecap="round">
              <path d="M 400 120 C 640 200, 800 320, 900 500 C 980 640, 1000 820, 960 1000" stroke="#0B0A0E" strokeWidth="30" />
              <path d="M 440 80 C 700 140, 900 260, 1020 460" stroke="#0B0A0E" strokeWidth="22" />
              <path d="M 420 220 C 680 320, 880 460, 980 680" stroke="#7F1D1D" strokeWidth="8" opacity="0.7" />
              <path d="M 460 340 C 720 460, 900 620, 990 860" stroke="#DC2626" strokeWidth="6" opacity="0.55" />
            </g>
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
