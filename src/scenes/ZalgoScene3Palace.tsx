import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ZalgoEntity } from "../components/characters/ZalgoEntity";

/**
 * ZalgoScene3Palace (frames 908–1649, 30.27–54.97s) — El Palacio de Cristal Torturado.
 *
 * Emerge de la tinta negra, retroceso lento majestuoso (pull-back 1.12 → 1.0)
 * revelando el monumental palacio de cristal torturado y a Zalgo completo.
 * Un único micro-impacto puntual en localFrame 90 (wall_shatter.mp3) hace
 * estallar la vidriera de cristal oscuro en fragmentos poligonales. Zalgo
 * despliega sus 4 brazos (estrella muerta y vela de luz oscura a la derecha,
 * manos carmesí goteantes a la izquierda) y abre sus 7 bocas: las 6 hablan
 * lenguas muertas (runas etéreas) y la séptima canta la melodía apocalíptica
 * lanzando ondas sonoras concéntricas carmesí que resquebrajan la Tierra.
 * Cierra con un foreground wipe de cristales negros y sombras carmesí
 * barriendo de derecha a izquierda hacia la Escena 4.
 *
 * Cámara: única intención — emerge + pull-back majestuoso + UN solo
 * micro-impacto puntual sincronizado con wall_shatter.mp3.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Bloques poligonales 2.5D en que se fragmenta la vidriera de cristal. */
const SHARDS = Array.from({ length: 14 }, (_, i) => ({
  cx: 120 + random(i * 4.7 + 1) * 840,
  cy: 360 + random(i * 6.3 + 5) * 1080,
  w: 70 + random(i * 3.1 + 9) * 130,
  h: 50 + random(i * 5.9 + 3) * 95,
  rot: (random(i * 7.7 + 2) - 0.5) * 150,
  dx: (random(i * 11.3 + 4) - 0.5) * 980,
  dy: (random(i * 13.1 + 8) - 0.5) * 760,
  flip: random(i * 17.9 + 6) > 0.5 ? 1 : -1,
}));

/** Relámpago negro quebrado (arco fractal) con borde carmesí. */
const makeBolt = (seed: number, len: number): string => {
  const segs = 5 + (seed % 3);
  let d = "M 0 0";
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const y = (-len * t).toFixed(1);
    const jx = ((seed * 7 + i * 13) % 9) - 4;
    const x = (i % 2 === 0 ? jx * 0.5 : jx) * (t * 2.2);
    d += ` L ${x.toFixed(1)} ${y}`;
  }
  return d;
};

/** Relámpagos negros del cielo abisal (deterministas). */
const BOLTS = Array.from({ length: 9 }, (_, i) => ({
  x: 90 + random(i * 5.3 + 2) * 900,
  y: 200 + random(i * 7.1 + 4) * 420,
  len: 260 + random(i * 3.7 + 6) * 340,
  d: makeBolt(i * 13 + 5, 260 + random(i * 3.7 + 6) * 340),
  phase: i * 1.7,
}));

/** Runas etéreas de lenguas muertas (deterministas). */
const RUNES = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {
    x: 540 + Math.cos(a) * (150 + ((i * 31) % 70)),
    y: 640 + Math.sin(a) * (80 + ((i * 17) % 50)),
    phase: i * 1.9,
    glyph: ["ᛟ", "ᚱ", "ᚨ", "ᚦ", "ᛗ", "ᛞ", "ᛉ", "ᛒ", "ᚷ", "ᛟ", "ᚲ", "ᛖ"][i % 12],
  };
});

/** Vidriera de cristal oscuro que se agrieta y estalla en fragmentos. */
const CrystalWall: React.FC<{ frame: number }> = ({ frame }) => {
  const crack = clamp01(interpolate(frame, [20, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const intact = 1 - clamp01(interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const shardProg = clamp01(interpolate(frame, [90, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const shardOpacity = clamp01(interpolate(frame, [90, 95, 150, 165], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
      role="img"
      aria-label="Vidriera de cristal oscuro agrietándose y estallando"
    >
      <defs>
        <linearGradient id="s3-stone" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#141219" />
          <stop offset="50%" stopColor="#0B0A0E" />
          <stop offset="100%" stopColor="#040507" />
        </linearGradient>
        <radialGradient id="s3-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#DC2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Vidriera intacta */}
      <g opacity={intact}>
        <rect x="90" y="300" width="900" height="1220" rx="10" fill="url(#s3-stone)" />
        <g fill="none" stroke="#1A1820" strokeWidth="6" opacity="0.6">
          <path d="M 130 360 C 260 420, 200 560, 320 640 C 440 720, 380 880, 480 980" />
          <path d="M 950 400 C 820 480, 880 620, 760 700 C 640 780, 700 940, 600 1040" />
          <path d="M 500 320 C 520 440, 480 560, 540 680" />
        </g>
        {/* Núcleo carmesí */}
        <circle cx="540" cy="900" r={60 + crack * 180} fill="url(#s3-core)" opacity={0.5 + crack * 0.5} />
        <g fill="none" stroke="#DC2626" strokeLinecap="round">
          <path d="M 540 900 C 520 820, 500 740, 470 660 C 450 600, 460 540, 430 480 C 410 440, 420 380, 400 330" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 560 820, 580 740, 610 660 C 630 600, 620 540, 650 480 C 670 440, 660 380, 680 330" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 540 1000, 540 1100, 540 1200 C 540 1280, 530 1360, 545 1500" strokeWidth="4" opacity={crack} />
          <path d="M 540 900 C 470 920, 400 930, 330 940 C 260 950, 190 930, 120 960" strokeWidth="3" opacity={crack * 0.8} />
          <path d="M 540 900 C 610 920, 680 930, 750 940 C 820 950, 890 930, 960 960" strokeWidth="3" opacity={crack * 0.8} />
          <path d="M 470 660 C 380 640, 300 660, 230 610" strokeWidth="2.5" opacity={crack * 0.7} />
          <path d="M 610 660 C 700 640, 780 660, 850 610" strokeWidth="2.5" opacity={crack * 0.7} />
        </g>
        <circle cx="540" cy="900" r={30 + crack * 90} fill="#F43F5E" opacity={crack * 0.4} filter="blur(6px)" />
      </g>

      {/* Fragmentos poligonales despedidos */}
      <g opacity={shardOpacity}>
        {SHARDS.map((s, i) => {
          const tx = s.cx + s.dx * shardProg;
          const ty = s.cy + s.dy * shardProg + 260 * shardProg * shardProg;
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

export const ZalgoScene3Palace: React.FC = () => {
  const frame = useCurrentFrame();

  // Retroceso lento majestuoso (pull-back 1.12 → 1.0).
  const pullBack = interpolate(frame, [0, 741], [1.12, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Emerger de la tinta negra (0–16).
  const emerge = 1 - clamp01(interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Único micro-impacto puntual (wall_shatter.mp3) en localFrame 90.
  const impact = clamp01(interpolate(frame, [90, 94, 98], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const shakeX = Math.sin(frame * 1.9) * 9 * impact;
  const shakeY = Math.cos(frame * 1.5) * 7 * impact;
  const scale = pullBack * (1 + impact * 0.035);

  // Apertura progresiva de las 7 bocas (130–300).
  const mouthsOpen = clamp01(interpolate(frame, [130, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Brazos elevados sosteniendo estrella muerta y vela negra (300–440).
  const starPower = clamp01(interpolate(frame, [300, 440], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Las 6 bocas hablan lenguas muertas (150–420).
  const deadTongues = clamp01(interpolate(frame, [150, 200, 400, 420], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // La séptima boca canta la melodía apocalíptica (480–710).
  const seventhMouthSing = clamp01(interpolate(frame, [480, 710], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Ondas sonoras apocalípticas concéntricas carmesí (nacen en 480).
  const waveT = Math.max(0, frame - 480);
  const waveOn = clamp01(interpolate(frame, [480, 500], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const horizonPulse = waveOn * Math.sin(waveT * 0.08) * 9;

  // Foreground wipe de salida (717–741): cristales negros + sombras carmesí.
  const wipe = clamp01(interpolate(frame, [717, 741], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const wipeX = interpolate(frame, [717, 741], [1120, -320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parallax foreground.
  const fgDrift = Math.sin(frame * 0.01 + 1.1) * 20;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia: pull-back + micro-impacto puntual */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ============ BACKGROUND (palacio de cristal torturado) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 120% 70% at 50% 42%, #2A0609 0%, #14040A 40%, #0A0305 62%, #040507 100%)",
            }}
          />

          {/* Arcos góticos gigantescos de vidrio obsidiana / cristal carmesí */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="s3-arch" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#1A0E16" />
                <stop offset="55%" stopColor="#0D070C" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <radialGradient id="s3-nebula" cx="50%" cy="46%" r="60%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
                <stop offset="45%" stopColor="#7F1D1D" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="540" cy="860" rx="620" ry="760" fill="url(#s3-nebula)" />

            {/* Arco central monumental detrás de Zalgo */}
            <path d="M 240 1500 L 240 760 C 240 520, 360 400, 540 400 C 720 400, 840 520, 840 760 L 840 1500" fill="none" stroke="url(#s3-arch)" strokeWidth="34" />
            <path d="M 240 1500 L 240 760 C 240 520, 360 400, 540 400 C 720 400, 840 520, 840 760 L 840 1500" fill="none" stroke="#7F1D1D" strokeWidth="3" opacity="0.5" />
            {/* Arcos laterales menores */}
            <path d="M 120 1500 L 120 860 C 120 640, 210 520, 330 480" fill="none" stroke="#0D070C" strokeWidth="22" />
            <path d="M 960 1500 L 960 860 C 960 640, 870 520, 750 480" fill="none" stroke="#0D070C" strokeWidth="22" />
            <path d="M 120 1500 L 120 860 C 120 640, 210 520, 330 480" fill="none" stroke="#7F1D1D" strokeWidth="2" opacity="0.35" />
            <path d="M 960 1500 L 960 860 C 960 640, 870 520, 750 480" fill="none" stroke="#7F1D1D" strokeWidth="2" opacity="0.35" />

            {/* Relámpagos negros fractales con borde carmesí */}
            <g>
              {BOLTS.map((b, i) => {
                const flicker = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.2 + b.phase));
                return (
                  <g key={i} transform={`translate(${b.x} ${b.y})`} opacity={flicker}>
                    <path d={b.d} stroke="#050308" strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                    <path d={b.d} stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinejoin="round" opacity="0.8" />
                    <circle cy={-b.len} r="3" fill="#DC2626" opacity={0.5 + flicker * 0.5} filter="blur(2px)" />
                  </g>
                );
              })}
            </g>

            {/* Curvatura de la Tierra iluminada tenuemente (base) */}
            <g>
              <linearGradient id="s3-earth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14080A" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <path d={`M 0 ${1620 + horizonPulse} C 260 ${1560 + horizonPulse}, 820 ${1560 + horizonPulse}, 1080 ${1620 + horizonPulse} L 1080 1920 L 0 1920 Z`} fill="url(#s3-earth)" />
              <path d={`M 0 ${1610 + horizonPulse} C 260 ${1550 + horizonPulse}, 820 ${1550 + horizonPulse}, 1080 ${1610 + horizonPulse} L 1080 1660 L 0 1660 Z`} fill="#08040A" />
              <path d={`M 0 ${1620 + horizonPulse} C 260 ${1560 + horizonPulse}, 820 ${1560 + horizonPulse}, 1080 ${1620 + horizonPulse}`} stroke="#DC2626" strokeWidth="3" fill="none" opacity={0.5 + waveOn * 0.5} />
              {/* Grietas de la Tierra que crecen con las ondas */}
              <g stroke="#DC2626" strokeWidth="3.5" fill="none" opacity={waveOn}>
                <path d={`M 300 ${1610 + horizonPulse} L 360 ${1640 + horizonPulse} L 420 ${1618 + horizonPulse} L 500 ${1650 + horizonPulse}`} />
                <path d={`M 700 ${1610 + horizonPulse} L 760 ${1640 + horizonPulse} L 820 ${1618 + horizonPulse}`} />
              </g>
            </g>
          </svg>
        </div>

        {/* ============ MIDGROUND (vidriera → Zalgo) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Zalgo monumental revelado detrás de la vidriera */}
          <div
            style={{
              position: "absolute",
              top: 300,
              left: 60,
              width: 960,
              height: 1060,
            }}
          >
            <ZalgoEntity
              mode="cosmic"
              mouthsOpen={mouthsOpen}
              starPower={starPower}
              seventhMouthSing={seventhMouthSing}
              localFrame={frame}
              idPrefix="s3-zalgo"
            />
          </div>

          {/* Runas etéreas de lenguas muertas emanando de las 6 bocas */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <g opacity={deadTongues}>
              {RUNES.map((r, i) => {
                const drift = Math.sin(frame * 0.06 + r.phase) * 8;
                const op = (0.4 + 0.5 * Math.abs(Math.sin(frame * 0.08 + r.phase))) * deadTongues;
                return (
                  <text
                    key={i}
                    x={r.x + drift}
                    y={r.y + drift * 0.5}
                    textAnchor="middle"
                    fontFamily="Consolas, monospace"
                    fontSize="22"
                    fontWeight="700"
                    fill="#F43F5E"
                    opacity={op}
                    filter="blur(0.4px)"
                  >
                    {r.glyph}
                  </text>
                );
              })}
            </g>

            {/* Ondas sonoras apocalípticas concéntricas carmesí descendiendo */}
            {waveOn > 0.01 ? (
              <g fill="none" strokeLinecap="round" transform="translate(540 640)">
                {[0, 1, 2, 3].map((k) => {
                  const phase = (waveT * 3 + k * 70) % 260;
                  const r = 30 + phase * 4.4;
                  const op = waveOn * (1 - phase / 260) * (1 - k * 0.2);
                  return (
                    <ellipse
                      key={k}
                      cx="0"
                      cy="0"
                      rx={r}
                      ry={r * 0.3}
                      stroke={k === 0 ? "#F43F5E" : "#DC2626"}
                      strokeWidth={4 - k * 0.7}
                      opacity={op}
                    />
                  );
                })}
              </g>
            ) : null}
          </svg>

          {/* Vidriera + fragmentación (sobre Zalgo, delante) */}
          <CrystalWall frame={frame} />
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.35x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Fragmentos de cristal fracturado cruzando los bordes */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift}px)` }}>
            {SHARDS.slice(0, 6).map((s, i) => {
              const fg = clamp01(interpolate(frame, [100, 115], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }));
              const ty = 400 + ((frame * (2.4 + i) + i * 180) % 1200);
              const tx = (s.cx % 1080) + Math.sin(frame * 0.05 + i) * 30;
              return (
                <polygon
                  key={i}
                  points={`${tx},${ty} ${tx + 70},${ty - 20} ${tx + 90},${ty + 30} ${tx + 20},${ty + 44}`}
                  fill="#040507"
                  stroke="#7F1D1D"
                  strokeWidth="1.5"
                  opacity={fg * 0.85}
                  filter="blur(3px)"
                />
              );
            })}
          </svg>

          {/* Volutas de sombra cruzando los bordes */}
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <g filter="blur(7px)" fill="none" strokeLinecap="round">
              <path d="M -30 300 C 60 420, 40 640, 90 860 C 130 1020, 90 1240, 140 1460" stroke="#7F1D1D" strokeWidth="26" opacity="0.8" />
              <path d="M -30 420 C 80 560, 50 800, 120 1080" stroke="#DC2626" strokeWidth="12" opacity="0.6" />
              <path d="M 1110 360 C 1000 500, 1030 720, 980 940 C 940 1120, 990 1320, 950 1540" stroke="#04070B" strokeWidth="26" opacity="0.8" />
            </g>
          </svg>

          {/* Siluetas de borde desenfocadas */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.88 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: -80, width: 150, background: "#020306", filter: "blur(12px)", opacity: 0.88 }} />
        </div>
      </AbsoluteFill>

      {/* Emerger de la tinta negra */}
      <AbsoluteFill style={{ background: "#020304", opacity: emerge }} />

      {/* Transición espacial de salida: foreground wipe de cristales negros y sombras carmesí */}
      {wipe > 0.004 ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${wipeX}px)` }}
          >
            <defs>
              <linearGradient id="s3-wipe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#040507" />
                <stop offset="70%" stopColor="#0B0A0E" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
            </defs>
            {/* Losa de cristal negro barriendo */}
            <path d="M 60 -40 C 200 120, 260 320, 240 540 C 260 760, 220 980, 200 1200 C 180 1440, 200 1680, 240 1960 L 560 1960 C 500 1500, 520 1100, 560 760 C 580 520, 540 280, 460 60 Z" fill="url(#s3-wipe)" />
            {/* Fragmentos poligonales adheridos */}
            <g opacity="0.9">
              {[0, 1, 2, 3, 4].map((k) => {
                const px = 120 + k * 90;
                const py = 500 + k * 240;
                return (
                  <polygon
                    key={k}
                    points={`${px},${py} ${px + 70},${py - 24} ${px + 96},${py + 34} ${px + 22},${py + 48}`}
                    fill="#0B0A0E"
                    stroke="#7F1D1D"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
            {/* Volutas de sombra carmesí */}
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
