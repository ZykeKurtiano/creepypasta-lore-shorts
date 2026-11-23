import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { AnimatorCharacter } from "../components/characters/AnimatorCharacter";
import { FONT_MONO } from "../components/SafeZone";

/**
 * ZalgoScene1Origin (frames 0–621, 0.00–20.70s) — Origen en Something Awful 2004.
 *
 * Estudio nocturno de 2004: Dave Kelly dibuja una viñeta inocente en su
 * tableta mientras una fuerza invisible corrompe el cómic de periódico en
 * tiempo real. Cámara dolly-in lento (1.0 → 1.08) que culmina en un camera
 * dive espacial dentro del charco de tinta negra de la viñeta corrupta
 * (localFrame 586–621) hasta llenar el lienzo de oscuridad líquida.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// Polvo iluminado determinista (sin Math.random).
const DUST = Array.from({ length: 24 }, (_, i) => ({
  x: random(i * 3.1 + 1) * 1080,
  y0: random(i * 7.3 + 2) * 1350,
  r: 1.5 + random(i * 5.1 + 3) * 2.2,
  speed: 0.12 + random(i * 9.7 + 4) * 0.2,
  phase: random(i * 13.7 + 5) * 300,
  op: 0.06 + random(i * 17.3 + 6) * 0.16,
}));

/** Libros de la estantería (colores apagados deterministas). */
const BOOKS = Array.from({ length: 18 }, (_, i) => ({
  x: 60 + (i % 6) * 30 + random(i * 11.3 + 2) * 8,
  w: 20 + random(i * 5.7 + 9) * 14,
  h: 96 + random(i * 3.3 + 7) * 46,
  row: Math.floor(i / 6),
  hue: ["#1A2A34", "#2A1F22", "#3A3224", "#1F2A24", "#2E2633", "#20222E"][
    Math.floor(random(i * 17.9 + 1) * 6)
  ],
}));

/**
 * Gato anaranjado de tira cómica. `corrupt` (0..1) transforma la sonrisa
 * inocente en mueca abisal sangrante con ojos negros vacíos llorando tinta.
 */
const ComicCat: React.FC<{
  corrupt: number;
  cx: number;
  cy: number;
  s: number;
  raisedPaw?: boolean;
}> = ({ corrupt, cx, cy, s, raisedPaw = false }) => {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* Cola */}
      <path
        d="M 34 44 C 78 40, 104 20, 112 -6 C 116 -18, 108 -24, 102 -16 C 96 -4, 84 12, 60 24 Z"
        fill="#C77A26"
      />
      {/* Cuerpo sentado */}
      <path
        d="M -46 60 C -54 30, -50 4, -38 -14 C -26 -30, -10 -36, 0 -36 C 10 -36, 26 -30, 38 -14 C 50 4, 54 30, 46 60 C 34 76, -34 76, -46 60 Z"
        fill="#E8A33D"
      />
      {/* Pecho / vientre claro */}
      <path
        d="M -30 66 C -32 38, -26 16, -14 2 C -6 -8, 6 -8, 14 2 C 26 16, 32 38, 30 66 C 22 74, -22 74, -30 66 Z"
        fill="#F2C078"
      />
      {/* Rayas del lomo */}
      <g stroke="#B26A1E" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M -8 -34 C -10 -28, -10 -20, -8 -12" />
        <path d="M 2 -36 C 0 -28, 0 -20, 2 -12" />
        <path d="M 12 -34 C 10 -28, 10 -20, 12 -12" />
      </g>
      {/* Pata delantera */}
      <path
        d="M -26 20 C -32 34, -34 50, -32 66 L -14 66 C -14 50, -14 34, -12 22 Z"
        fill="#E8A33D"
      />
      {raisedPaw ? (
        <path
          d="M 18 6 C 30 -4, 40 -10, 52 -12 C 56 -12, 58 -8, 56 -4 C 48 0, 38 4, 28 10 Z"
          fill="#E8A33D"
        />
      ) : (
        <path
          d="M 12 20 C 14 34, 14 50, 12 66 L 30 66 C 30 50, 30 34, 28 22 Z"
          fill="#E8A33D"
        />
      )}

      {/* Cabeza */}
      <g transform="translate(0, -58)">
        {/* Orejas */}
        <path d="M -38 -30 C -44 -56, -36 -74, -24 -80 C -16 -74, -14 -56, -18 -34 Z" fill="#E8A33D" />
        <path d="M 38 -30 C 44 -56, 36 -74, 24 -80 C 16 -74, 14 -56, 18 -34 Z" fill="#E8A33D" />
        <path d="M -34 -36 C -36 -54, -32 -66, -25 -73 C -22 -64, -21 -52, -23 -38 Z" fill="#B26A1E" />
        <path d="M 34 -36 C 36 -54, 32 -66, 25 -73 C 22 -64, 21 -52, 23 -38 Z" fill="#B26A1E" />
        {/* Cráneo */}
        <path
          d="M 0 -70 C 28 -70, 48 -60, 50 -36 C 52 -18, 48 -4, 40 6 C 32 16, 22 20, 12 21 C 4 22, -4 22, -12 21 C -22 20, -32 16, -40 6 C -48 -4, -52 -18, -50 -36 C -48 -60, -28 -70, 0 -70 Z"
          fill="#E8A33D"
        />
        {/* Rayas de la frente */}
        <g stroke="#B26A1E" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 0 -66 C -2 -58, -2 -50, 0 -42" />
          <path d="M -14 -62 C -13 -56, -12 -50, -10 -44" />
          <path d="M 14 -62 C 13 -56, 12 -50, 10 -44" />
        </g>

        {/* Ojos inocentes (se apagan con la corrupción) */}
        <g opacity={1 - corrupt}>
          <ellipse cx="-17" cy="-32" rx="12" ry="13" fill="#FFF7E8" />
          <ellipse cx="17" cy="-32" rx="12" ry="13" fill="#FFF7E8" />
          <circle cx="-15" cy="-31" r="5" fill="#241A10" />
          <circle cx="19" cy="-31" r="5" fill="#241A10" />
          <circle cx="-13" cy="-34" r="1.8" fill="#FFFFFF" />
          <circle cx="21" cy="-34" r="1.8" fill="#FFFFFF" />
        </g>

        {/* Ojos negros vacíos llorando tinta + sangre */}
        <g opacity={corrupt}>
          <ellipse cx="-17" cy="-31" rx="13" ry="15" fill="#040507" />
          <ellipse cx="17" cy="-31" rx="13" ry="15" fill="#040507" />
          {/* Lágrimas de tinta negra */}
          <path d="M -21 -20 C -22 -8, -23 2, -24 12 C -23 14, -21 14, -20 12 C -19 2, -18 -8, -17 -20 Z" fill="#050102" opacity={0.9} />
          <path d="M 21 -20 C 22 -8, 23 2, 24 12 C 23 14, 21 14, 20 12 C 19 2, 18 -8, 17 -20 Z" fill="#050102" opacity={0.9} />
          {/* Hilos de sangre carmesí */}
          <path d="M -12 -18 C -12 -4, -12 8, -11 18" stroke="#DC2626" strokeWidth="2.2" fill="none" opacity={0.85} />
          <path d="M 12 -18 C 12 -4, 12 8, 11 18" stroke="#DC2626" strokeWidth="2.2" fill="none" opacity={0.85} />
        </g>

        {/* Nariz */}
        <path d="M -4 -16 C -4 -20, 4 -20, 4 -16 C 4 -12, -4 -12, -4 -16 Z" fill="#C25E2A" />

        {/* Boca: sonrisa inocente → mueca abisal */}
        <g>
          {/* Sonrisa */}
          <g opacity={1 - corrupt}>
            <path d="M -14 -6 C -8 -1, 8 -1, 14 -6" stroke="#5A2C12" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M -4 -4 C -2 -1, 2 -1, 4 -4 C 2 1, -2 1, -4 -4 Z" fill="#D4553A" />
          </g>
          {/* Mueca sangrante */}
          <g opacity={corrupt}>
            <path
              d="M -18 -2 C -12 -10, -6 -12, 0 -12 C 6 -12, 12 -10, 18 -2 C 14 6, 8 10, 0 10 C -8 10, -14 6, -18 -2 Z"
              fill="#1A0204"
            />
            <path d="M -18 -2 C -12 -10, -6 -12, 0 -12" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M 0 -12 C 6 -12, 12 -10, 18 -2" stroke="#DC2626" strokeWidth="2" fill="none" opacity="0.8" />
            {/* Dientes afilados */}
            <path d="M -13 -2 L -9 -8 L -6 -2 Z" fill="#D8CFBE" />
            <path d="M -3 -3 L 0 -10 L 3 -3 Z" fill="#D8CFBE" />
            <path d="M 6 -2 L 9 -8 L 13 -2 Z" fill="#D8CFBE" />
            {/* Tinta negra goteando de la boca */}
            <path d="M -12 6 C -13 14, -14 22, -15 30" stroke="#050102" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 0 9 C 0 18, 0 26, 1 34" stroke="#050102" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M 12 6 C 13 14, 14 22, 15 30" stroke="#050102" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Bigotes */}
        <g stroke="#5A2C12" strokeWidth="2" strokeLinecap="round" fill="none" opacity={1 - corrupt * 0.6}>
          <path d="M -36 -16 C -46 -18, -54 -18, -62 -16" />
          <path d="M -36 -10 C -46 -10, -54 -10, -62 -10" />
          <path d="M 36 -16 C 46 -18, 54 -18, 62 -16" />
          <path d="M 36 -10 C 46 -10, 54 -10, 62 -10" />
        </g>
      </g>
    </g>
  );
};

/** Viñeta de cómic de periódico de 2 paneles que se corrompe en tiempo real. */
const CorruptingComic: React.FC<{ frame: number }> = ({ frame }) => {
  const corrupt = clamp01(interpolate(frame, [340, 520], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  // Charco de tinta central que SOLO aparece durante el camera dive (586–621).
  const inkPool = clamp01(interpolate(frame, [586, 621], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  // Deriva de los glifos distorsionados.
  const glyphX = Math.sin(frame * 0.08) * 4 * corrupt;
  const glyphY = Math.cos(frame * 0.06) * 3 * corrupt;

  const crackOpacity = clamp01(interpolate(frame, [350, 430], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <svg
      viewBox="0 0 760 470"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Viñeta de cómic de periódico corrompiéndose"
    >
      <defs>
        <linearGradient id="z1-paper" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#EAE1C6" />
          <stop offset="60%" stopColor="#D6C9A4" />
          <stop offset="100%" stopColor="#B7A87E" />
        </linearGradient>
        <radialGradient id="z1-paper-glow" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#F4EBD1" />
          <stop offset="100%" stopColor="#B7A87E" />
        </radialGradient>
        <radialGradient id="z1-rot" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#2A0506" stopOpacity="0" />
          <stop offset="70%" stopColor="#2A0506" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0A0102" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="z1-ink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020102" />
          <stop offset="70%" stopColor="#050102" />
          <stop offset="100%" stopColor="#020102" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Papel crema envejecido */}
      <rect x="6" y="6" width="748" height="458" rx="14" fill="url(#z1-paper)" />
      <rect x="6" y="6" width="748" height="458" rx="14" fill="url(#z1-paper-glow)" opacity="0.5" />
      {/* Borde de tinta */}
      <rect x="10" y="10" width="740" height="450" rx="10" fill="none" stroke="#4A443A" strokeWidth="3" />
      {/* Textura punteada */}
      <g fill="#6B6456" opacity="0.22">
        {Array.from({ length: 40 }, (_, i) => {
          const x = 22 + random(i * 7.7 + 3) * 716;
          const y = 22 + random(i * 5.9 + 11) * 426;
          return <circle key={i} cx={x} cy={y} r="1.4" />;
        })}
      </g>

      {/* Panel 1 (izquierda): gato sentado sonriendo */}
      <rect x="28" y="28" width="344" height="414" rx="8" fill="none" stroke="#4A443A" strokeWidth="2.4" />
      {/* Sillón/escritorio del panel 1 */}
      <g>
        <rect x="76" y="352" width="248" height="74" rx="12" fill="#9C6B3A" />
        <rect x="70" y="340" width="260" height="28" rx="10" fill="#7A4E28" />
        <path d="M 60 426 C 66 380, 74 350, 90 334" stroke="#6B4422" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 340 426 C 334 380, 326 350, 310 334" stroke="#6B4422" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
      <ComicCat corrupt={corrupt} cx={200} cy={330} s={1.55} />

      {/* Panel 2 (derecha): gato saludando + bocadillo de texto */}
      <rect x="388" y="28" width="344" height="414" rx="8" fill="none" stroke="#4A443A" strokeWidth="2.4" />
      <rect x="424" y="330" width="272" height="96" rx="10" fill="#9C6B3A" />
      <rect x="418" y="320" width="284" height="30" rx="10" fill="#7A4E28" />
      <ComicCat corrupt={corrupt} cx={560} cy={328} s={1.32} raisedPaw />

      {/* Bocadillo de diálogo (superior derecha, sin tapar al gato) */}
      <g>
        <ellipse cx="628" cy="104" rx="100" ry="46" fill="#F7F1DD" stroke="#4A443A" strokeWidth="2.4" />
        <path d="M 600 146 C 590 166, 588 182, 584 192 C 598 188, 606 178, 612 168 Z" fill="#F7F1DD" stroke="#4A443A" strokeWidth="2" />
        {/* Texto inocente → glifos distorsionados Zalgo */}
        <text
          x="628"
          y="100"
          textAnchor="middle"
          fontFamily={FONT_MONO}
          fontSize="30"
          fontWeight="700"
          fill="#3A2E1A"
          opacity={1 - corrupt}
        >
          HOLA.
        </text>
        <g opacity={corrupt} transform={`translate(${glyphX} ${glyphY})`}>
          <text x="628" y="100" textAnchor="middle" fontFamily={FONT_MONO} fontSize="30" fontWeight="700" fill="#7F1D1D" dx="-2" dy="-1">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
          <text x="628" y="100" textAnchor="middle" fontFamily={FONT_MONO} fontSize="30" fontWeight="700" fill="#DC2626" dx="2" dy="1">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
          <text x="628" y="100" textAnchor="middle" fontFamily={FONT_MONO} fontSize="30" fontWeight="700" fill="#050102">
            H̷E̶ C̷O̶M̷E̶S̷
          </text>
        </g>
      </g>

      {/* Grietas negras que invaden el papel */}
      <g fill="none" stroke="#050102" strokeLinecap="round" opacity={crackOpacity}>
        <path d="M 30 40 C 80 70, 90 130, 70 190 C 60 220, 66 250, 80 280 C 90 300, 88 330, 80 360" strokeWidth="3" />
        <path d="M 70 190 C 120 210, 160 200, 190 230" strokeWidth="2.2" />
        <path d="M 80 280 C 130 300, 180 290, 220 320" strokeWidth="2" />
        <path d="M 370 60 C 330 90, 340 150, 360 200 C 370 230, 366 260, 360 300" strokeWidth="3" />
        <path d="M 360 200 C 410 210, 450 200, 480 230" strokeWidth="2.2" />
        <path d="M 30 60 C 60 40, 120 30, 190 30" strokeWidth="2" />
        <path d="M 570 60 C 600 40, 660 30, 730 40" strokeWidth="2.2" />
        <path d="M 200 40 C 240 60, 260 90, 250 130" strokeWidth="2" />
      </g>

      {/* Desaturación cálida → rojo/negro */}
      <rect x="6" y="6" width="748" height="458" rx="14" fill="url(#z1-rot)" opacity={corrupt * 0.9} />

      {/* Charco de tinta negra central (solo visible durante el camera dive) */}
      {inkPool > 0.02 ? (
        <circle cx="380" cy="235" r={40 + inkPool * 540} fill="url(#z1-ink)" opacity={inkPool * 0.9} />
      ) : null}
    </svg>
  );
};

export const ZalgoScene1Origin: React.FC = () => {
  const frame = useCurrentFrame();

  // Corrupción del animador (percibe la anomalía y retrocede).
  const corruption = clamp01(
    interpolate(frame, [270, 420, 585], [0, 0.5, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Dolly-in lento y continuo (1.0 → 1.08).
  const dolly = interpolate(frame, [0, 621], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera dive en los últimos 35 frames (586–621).
  const dive = clamp01(
    interpolate(frame, [586, 621], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const scale = dolly * (1 + dive * 1.6);

  // Parallax de capas.
  const bgDrift = Math.sin(frame * 0.006) * 6;
  const fgDrift = Math.sin(frame * 0.011 + 1.2) * 14;

  // Cono de luz de la lámpara (foreground, arriba-izquierda).
  const lampSway = Math.sin(frame * 0.05) * 1.4;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Cámara propia de la escena (única intención: dolly-in + dive final) */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* ============ BACKGROUND (parallax lento) ============ */}
        <div data-layer="background" style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #06080C 0%, #0A1014 52%, #040507 100%)",
            }}
          />
          {/* Ventana con silueta urbana nocturna */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${bgDrift}px)` }}
          >
            <defs>
              <linearGradient id="z1-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B151C" />
                <stop offset="100%" stopColor="#16212B" />
              </linearGradient>
              <radialGradient id="z1-moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(242,239,233,0.55)" />
                <stop offset="60%" stopColor="rgba(242,239,233,0.12)" />
                <stop offset="100%" stopColor="rgba(242,239,233,0)" />
              </radialGradient>
            </defs>
            {/* Marco de la ventana */}
            <rect x="96" y="300" width="360" height="500" rx="8" fill="url(#z1-sky)" stroke="#1A232B" strokeWidth="12" />
            <rect x="128" y="332" width="296" height="436" fill="none" stroke="#0D1218" strokeWidth="6" />
            {/* Luna */}
            <circle cx="240" cy="430" r="110" fill="url(#z1-moon)" />
            {/* Silueta urbana */}
            <g fill="#0A0E14">
              <rect x="140" y="640" width="52" height="128" />
              <rect x="200" y="600" width="40" height="168" />
              <rect x="250" y="660" width="56" height="108" />
              <rect x="318" y="620" width="46" height="148" />
              <rect x="368" y="664" width="40" height="104" />
            </g>
            {/* Ventanas iluminadas */}
            <g fill="#F2B14A" opacity="0.75">
              <rect x="150" y="656" width="8" height="10" />
              <rect x="212" y="672" width="8" height="10" />
              <rect x="262" y="678" width="8" height="10" />
              <rect x="328" y="636" width="8" height="10" />
            </g>
            {/* Bruma fría del alféizar */}
            <ellipse cx="276" cy="800" rx="230" ry="40" fill="rgba(22,33,41,0.55)" filter="blur(10px)" />
          </svg>

          {/* Estantería con libros/tintas */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${bgDrift * 0.5}px)` }}
          >
            <g>
              <rect x="816" y="330" width="230" height="600" rx="6" fill="#0D1218" />
              {[0, 1, 2].map((row) => (
                <rect key={row} x="824" y={430 + row * 160} width="214" height="10" fill="#1A232B" />
              ))}
              {BOOKS.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={440 + b.row * 160 - b.h}
                  width={b.w}
                  height={b.h}
                  rx="3"
                  fill={b.hue}
                  opacity="0.9"
                />
              ))}
              {/* Tinteros */}
              <rect x="880" y="880" width="46" height="40" rx="6" fill="#141C24" />
              <rect x="896" y="872" width="14" height="10" rx="2" fill="#040507" />
              <rect x="950" y="890" width="40" height="34" rx="6" fill="#141C24" />
              <rect x="964" y="882" width="12" height="10" rx="2" fill="#040507" />
            </g>
          </svg>

          {/* Resplandor frío del monitor de foro retro (atmosfera, sin texto) */}
          <div
            style={{
              position: "absolute",
              top: 620,
              left: 60 + bgDrift,
              width: 420,
              height: 320,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.16), rgba(34,211,238,0.04) 55%, transparent 75%)",
              filter: "blur(6px)",
              opacity: 0.5 + 0.12 * Math.sin(frame * 0.03),
            }}
          />
          {/* CRT retro desenfocado de fondo */}
          <div
            style={{
              position: "absolute",
              top: 700,
              left: 120 + bgDrift,
              width: 320,
              height: 250,
              background: "linear-gradient(180deg, #14181F, #0A0C11)",
              borderRadius: 18,
              border: "1px solid rgba(160,190,220,0.08)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.7)",
              filter: "blur(1.5px)",
              opacity: 0.85,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 20,
                borderRadius: 10,
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.22), rgba(34,211,238,0.05) 60%, #07090D 100%)",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
              }}
            />
          </div>
        </div>

        {/* ============ MIDGROUND (personaje + viñeta) ============ */}
        <div data-layer="midground" style={{ position: "absolute", inset: 0 }}>
          {/* Animador dibujando (plano medio cercano, ~1.45x más grande) */}
          <div
            style={{
              position: "absolute",
              top: 215,
              left: "50%",
              transform: "translateX(-50%)",
              width: 560,
              height: 490,
            }}
          >
            <AnimatorCharacter
              corruption={corruption}
              localFrame={frame}
              idPrefix="z1-anim"
            />
          </div>

          {/* Viñeta de cómic de periódico en 2 paneles (central-inferior) */}
          <div
            style={{
              position: "absolute",
              top: 720,
              left: "50%",
              transform: "translateX(-50%)",
              width: 760,
              height: 470,
            }}
          >
            <CorruptingComic frame={frame} />
          </div>
        </div>

        {/* ============ FOREGROUND (parallax rápido 1.3x) ============ */}
        <div data-layer="foreground" style={{ position: "absolute", inset: 0 }}>
          {/* Brazo curvo de lámpara de escritorio (arriba-izquierda, halo cálido) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift}px)` }}
          >
            <defs>
              <radialGradient id="z1-lamp-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(242,177,74,0.34)" />
                <stop offset="58%" stopColor="rgba(242,177,74,0.10)" />
                <stop offset="100%" stopColor="rgba(242,177,74,0)" />
              </radialGradient>
              <linearGradient id="z1-lamp-cone" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="rgba(226,214,178,0.5)" />
                <stop offset="100%" stopColor="rgba(140,180,210,0)" />
              </linearGradient>
            </defs>
            {/* Halo cálido de la bombilla */}
            <ellipse cx="272" cy="254" rx="122" ry="112" fill="url(#z1-lamp-halo)" />
            {/* Brazo */}
            <path d="M -40 60 C 120 40, 220 120, 260 240" stroke="#020304" strokeWidth="34" fill="none" strokeLinecap="round" />
            {/* Pantalla de la lámpara */}
            <g filter="blur(1.5px)">
              <path d="M 210 210 C 250 190, 310 190, 330 240 C 320 290, 250 300, 210 270 Z" fill="#0A0C11" />
              {/* Rim light cálido en el borde inferior */}
              <path d="M 210 270 C 250 300, 320 290, 330 240" stroke="#F2B14A" strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round" />
              {/* Bombilla cálida */}
              <ellipse cx="270" cy="270" rx="11" ry="8" fill="#F2B14A" opacity="0.8" />
            </g>
            {/* Cono de luz cálida-fría proyectada */}
            <g opacity={0.16 + 0.04 * Math.sin(frame * 0.04)}>
              <path
                d={`M ${260 + lampSway} 270 C 180 320, 120 430, 96 600 L 420 640 C 380 440, 330 340, ${300 + lampSway} 300 Z`}
                fill="url(#z1-lamp-cone)"
              />
            </g>
          </svg>

          {/* Taza de café humeante (abajo-derecha, con rim light cálido) */}
          <svg
            viewBox="0 0 1080 1920"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, transform: `translateX(${fgDrift * 0.7}px)` }}
          >
            <g filter="blur(1.5px)">
              <path d="M 880 1460 C 860 1450, 850 1470, 852 1490 L 888 1490 L 940 1472 L 936 1454 Z" fill="#0A0C11" />
              <path d="M 940 1460 C 950 1464, 950 1478, 940 1482" stroke="#0A0C11" strokeWidth="8" fill="none" />
              {/* Rim light cálido en el borde superior-derecho */}
              <path d="M 888 1490 L 940 1472 L 936 1454" stroke="#F2B14A" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round" />
              {/* Vapor */}
              <path d="M 890 1448 C 884 1432, 896 1420, 890 1406" stroke="#2B3A42" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M 906 1448 C 900 1430, 912 1418, 906 1402" stroke="#2B3A42" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.45" />
            </g>
            {/* Portalápices */}
            <g filter="blur(1.5px)">
              <rect x="960" y="1490" width="56" height="70" rx="8" fill="#0A0C11" />
              <rect x="968" y="1466" width="8" height="30" fill="#141C24" />
              <rect x="982" y="1462" width="8" height="34" fill="#2A1F22" />
              <rect x="996" y="1468" width="8" height="28" fill="#1F2A24" />
              {/* Rim light sutil */}
              <rect x="960" y="1490" width="56" height="70" rx="8" fill="none" stroke="#F2B14A" strokeWidth="1.5" opacity="0.35" />
            </g>
          </svg>

          {/* Silueta de borde desenfocada lateral */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: -80,
              width: 150,
              background: "#020306",
              filter: "blur(12px)",
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: -80,
              width: 150,
              background: "#020306",
              filter: "blur(12px)",
              opacity: 0.9,
            }}
          />
        </div>

        {/* Polvo iluminado */}
        <div data-layer="background" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {DUST.map((d, i) => {
            const y = d.y0 - ((frame * d.speed + d.phase) % 1400);
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
                  opacity: d.op * (0.6 + 0.4 * Math.sin(frame * 0.04 + i)),
                  boxShadow: "0 0 6px rgba(190,220,245,0.5)",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Oscuridad líquida del camera dive (charco de tinta → lienzo negro) */}
      {dive > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 52%, rgba(2,1,2,0.98) 0%, rgba(2,1,2,0.9) 55%, transparent 78%)",
            opacity: dive,
          }}
        />
      ) : null}

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.3) 0%, transparent 22%, transparent 62%, rgba(4,5,7,0.82) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
