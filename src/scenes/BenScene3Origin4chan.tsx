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
import { ElegyStatueCharacter } from "../components/characters/ElegyStatueCharacter";
import { PlayerCharacter } from "../components/characters/PlayerCharacter";

/**
 * BenScene3Origin4chan — Escena 3: Origen Real (global 1248–1892).
 *
 *  - Entrada (f 0–28): divisor arquitectónico deslizante con línea verde
 *    fósforo que barre el azul abisal y revela el escritorio de 2010.
 *  - Fase 1 (f 0–315): dormitorio universitario de 2010 con reloj 03:14,
 *    notas pegadas, escritorio con monitor panorámico mostrando la UI
 *    ilustrada de Project64 (SVG diegético) y PlayerCharacter desk_edit
 *    operando teclado/mouse, con fecha "SEPT 2010 // JADUSABLE".
 *  - Fase 2 (f 315–605): split-screen grid dinámico: hilo 4chan /x/
 *    en cascada, portal youshouldnthavedonethat.net con símbolos de los
 *    Moon Children, y estatua fragmentándose en código verde con
 *    zarcillos luminosos volumétricos cruzando las fronteras.
 *  - Cámara: avance progresivo en Z (1.0 → 1.08) + desplazamiento suave.
 *  - Salida (f 605–644): aislamiento por cono de luz (spotlight) sobre
 *    el reflejo inquietante de la pantalla mientras todo se oscurece.
 */

const CODE_CHARS = "01▓░#@&%$!?=+<>";

const hash01 = (n: number): number => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const CHAN_POSTS = [
  { at: 318, body: ">Anónimo: BEN", no: "No.6666661" },
  { at: 346, body: ">Jadusable: the truth.wmv", no: "No.6666669" },
  { at: 374, body: ">¿dónde está el archivo?", no: "No.6666675" },
  { at: 402, body: ">la estatua se mueve sola", no: "No.6666683" },
];

/** ---- Panel 1: hilo diegético de 4chan /x/ ---- */
const ChanPanel: React.FC<{ frame: number; reveal: number }> = ({ frame, reveal }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "#0B0E11",
      borderRadius: 22,
      border: "2px solid #1E4A33",
      boxShadow: "0 0 40px rgba(34,197,94,0.12)",
      overflow: "hidden",
      opacity: reveal,
    }}
  >
    <svg viewBox="0 0 416 460" width="100%" height="100%">
      <text x="28" y="52" fontFamily="'Courier New', monospace" fontSize="26" fontWeight="700" fill="#7FE0A8">
        /x/ - Paranormal
      </text>
      <text x="28" y="82" fontFamily="'Courier New', monospace" fontSize="15" fill="#3E6B52">
        files 6666666 / replies 0
      </text>
      <line x1="28" y1="96" x2="388" y2="96" stroke="#1E4A33" strokeWidth="1.5" />
      {CHAN_POSTS.map((p, i) => {
        const o = interpolate(frame, [p.at, p.at + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g key={i} opacity={o}>
            <rect x="28" y={120 + i * 82} width="360" height="70" rx="8" fill="#0E141A" stroke="#16281E" strokeWidth="1" />
            <text x="44" y={146 + i * 82} fontFamily="'Courier New', monospace" fontSize="13" fill="#5A6B60">
              {p.no}
            </text>
            <text x="44" y={170 + i * 82} fontFamily="'Courier New', monospace" fontSize="20" fill="#C9F7D8">
              {p.body}
            </text>
            <text x="44" y={186 + i * 82} fontFamily="'Courier New', monospace" fontSize="12" fill="#2E7A50">
              {">>"}4
            </text>
          </g>
        );
      })}
    </svg>
  </div>
);

/** ---- Panel 2: portal youshouldnthavedonethat.net + Moon Children ---- */
const PortalPanel: React.FC<{ frame: number; reveal: number }> = ({ frame, reveal }) => {
  const ring = 0.55 + 0.3 * Math.sin(frame * 0.35);
  const symPulse = 0.5 + 0.4 * Math.sin(frame * 0.5);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0B0E11",
        borderRadius: 22,
        border: "2px solid #1E4A33",
        boxShadow: "0 0 40px rgba(34,197,94,0.12)",
        overflow: "hidden",
        opacity: reveal,
      }}
    >
      <svg viewBox="0 0 416 460" width="100%" height="100%">
        {/* Portal oscuro */}
        <circle cx="208" cy="200" r="96" fill="#04070A" />
        <circle cx="208" cy="200" r="96" fill="none" stroke="#22C55E" strokeWidth="3" opacity={ring} />
        <circle cx="208" cy="200" r="112" fill="none" stroke="#22C55E" strokeWidth="1.4" opacity={ring * 0.5} />
        <circle cx="208" cy="200" r="70" fill="none" stroke="#0E2A1A" strokeWidth="2" opacity="0.9" />
        <path
          d={`M 148 200 C 168 168, 248 168, 268 200 C 248 232, 168 232, 148 200 Z`}
          stroke="#22C55E"
          strokeWidth="1.6"
          fill="none"
          opacity={0.4 + 0.3 * Math.sin(frame * 0.4)}
        />
        <circle cx="208" cy="200" r="14" fill="#0A1F14" />
        {/* Símbolos de los Moon Children */}
        <g opacity={symPulse}>
          <g transform="translate(96 96) scale(1.5)">
            <path
              d={`M 0 -20 A 20 20 0 1 1 0 20 A 16 16 0 1 0 0 -20 Z`}
              fill="#E8D8A0"
            />
          </g>
          <g transform="translate(322 112) scale(1.3)">
            <path d={`M -10 4 L 0 4 L -5 -12 Z`} fill="#FDE047" />
            <path d={`M 0 4 L 10 4 L 5 -12 Z`} fill="#FDE047" />
          </g>
          <g transform="translate(306 300) scale(1.6)">
            <path
              d={`M 0 -20 A 20 20 0 1 1 0 20 A 16 16 0 1 0 0 -20 Z`}
              fill="#C9A8C0"
            />
          </g>
          <g transform="translate(112 310) scale(1.2)">
            <path d={`M -10 4 L 0 4 L -5 -12 Z`} fill="#E8D8A0" />
            <path d={`M 0 4 L 10 4 L 5 -12 Z`} fill="#E8D8A0" />
          </g>
        </g>
        <text x="208" y="370" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="19" fill="#7FE0A8" opacity="0.85">
          youshouldnthavedonethat.net
        </text>
        <text x="208" y="396" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="13" fill="#3E6B52">
          the moon children are watching
        </text>
      </svg>
    </div>
  );
};

/** ---- Panel 3: estatua fragmentándose en código verde ---- */
const StatuePanel: React.FC<{ frame: number; reveal: number }> = ({ frame, reveal }) => {
  const glitch = 0.32 + 0.22 * Math.abs(Math.sin(frame * 0.55));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0B0E11",
        borderRadius: 22,
        border: "2px solid #1E4A33",
        boxShadow: "0 0 40px rgba(34,197,94,0.12)",
        overflow: "hidden",
        opacity: reveal,
      }}
    >
      <svg viewBox="0 0 880 600" width="100%" height="100%">
        <defs>
          <linearGradient id="s3-codefade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Columnas de código ascendente */}
        {Array.from({ length: 12 }, (_, c) =>
          Array.from({ length: 7 }, (_, r) => {
            const rowY = 560 - ((frame * 2.2 + r * 90 + c * 47) % 620);
            const ch = CODE_CHARS[Math.floor(hash01(c * 3.7 + r * 7.1 + Math.floor(frame / 3)) * CODE_CHARS.length)];
            return (
              <text
                key={`${c}-${r}`}
                x={60 + c * 70}
                y={rowY}
                fontFamily="'Courier New', monospace"
                fontSize="15"
                fill="url(#s3-codefade)"
                opacity={Math.min(1, Math.max(0, (560 - rowY) / 120))}
              >
                {ch}
              </text>
            );
          })
        ).flat()}
        {/* Líneas de desplazamiento horizontal sobre la estatua */}
        <rect x="330" y={300 + ((frame * 9) % 240)} width="220" height="6" fill="#22C55E" opacity="0.22" style={{ mixBlendMode: "screen" }} />
        <rect x="340" y={260 + ((frame * 13) % 260)} width="200" height="3" fill="#F43F5E" opacity="0.18" style={{ mixBlendMode: "screen" }} />
      </svg>
      {/* Estatua fragmentándose */}
      <div style={{ position: "absolute", left: 330, bottom: 8, width: 230 }}>
        <ElegyStatueCharacter
          uid="s3-es"
          width={230}
          rimColor="#22C55E"
          glowEyes
          eyeGlowColor="#22C55E"
          teleportGlitch={glitch}
          opacity={0.9}
          style={{ left: 0, bottom: 0 }}
        />
      </div>
    </div>
  );
};

export const BenScene3Origin4chan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- Intención única de cámara: avance progresivo en Z + deriva suave ----
  const camScale = interpolate(frame, [0, 644], [1, 1.08], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camX = interpolate(frame, [0, 644], [0, -40], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgScale = 1 + (camScale - 1) * 0.25;
  const fgScale = 1 + (camScale - 1) * 1.3;

  // Divisor deslizante de entrada (f 0–28).
  const dividerX = interpolate(frame, [0, 28], [-240, 1140], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fase 2: paneles divididos.
  const panel1T = interpolate(frame, [315, 345], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panel2T = interpolate(frame, [323, 353], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panel3T = interpolate(frame, [331, 361], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const roomDim = interpolate(frame, [315, 345], [0, 0.74], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p1Spring = spring({ frame: frame - 315, fps, config: { damping: 200, mass: 0.5, stiffness: 120 } });
  const p2Spring = spring({ frame: frame - 323, fps, config: { damping: 200, mass: 0.5, stiffness: 120 } });
  const p3Spring = spring({ frame: frame - 331, fps, config: { damping: 200, mass: 0.5, stiffness: 120 } });
  const panelCollapse = interpolate(frame, [605, 632], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Salida: aislamiento por cono de luz.
  const spotlight = interpolate(frame, [605, 640], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const darkRoom = interpolate(frame, [605, 640], [0, 0.93], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* ================================ CÁMARA ================================ */}
      <AbsoluteFill
        style={{
          transform: `translateX(${camX}px) scale(${camScale})`,
          transformOrigin: "55% 45%",
          overflow: "hidden",
        }}
      >
        {/* ============================ BACKGROUND (0.25) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: "55% 45%" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s3-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#070B0F" />
                <stop offset="60%" stopColor="#0B1217" />
                <stop offset="100%" stopColor="#10181E" />
              </linearGradient>
              <linearGradient id="s3-window" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A1420" />
                <stop offset="100%" stopColor="#050A12" />
              </linearGradient>
              <filter id="s3-blur4" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <rect x="0" y="0" width={WIDTH} height="1240" fill="url(#s3-wall)" />

            {/* Ventana oscura */}
            <rect x="700" y="240" width="260" height="380" rx="8" fill="url(#s3-window)" stroke="#16222C" strokeWidth="10" />
            <line x1="830" y1="250" x2="830" y2="610" stroke="#16222C" strokeWidth="8" />
            <line x1="710" y1="430" x2="950" y2="430" stroke="#16222C" strokeWidth="8" />
            <circle cx="880" cy="320" r="26" fill="#8FB2CC" opacity="0.16" filter="url(#s3-blur4)" />

            {/* Notas pegadas en la pared */}
            {[
              { x: 130, y: 420, r: -6 },
              { x: 260, y: 470, r: 4 },
              { x: 470, y: 400, r: -2 },
            ].map((n, i) => (
              <g key={i} transform={`rotate(${n.r} ${n.x} ${n.y})`}>
                <rect x={n.x} y={n.y} width="86" height="86" rx="4" fill="#1A2116" opacity="0.9" />
                <path d={`M ${n.x + 14} ${n.y + 26} C ${n.x + 30} ${n.y + 18}, ${n.x + 48} ${n.y + 24}, ${n.x + 60} ${n.y + 20}`} stroke="#3E4A38" strokeWidth="2.4" fill="none" opacity="0.8" />
                <path d={`M ${n.x + 14} ${n.y + 42} C ${n.x + 32} ${n.y + 36}, ${n.x + 52} ${n.y + 40}, ${n.x + 66} ${n.y + 34}`} stroke="#3E4A38" strokeWidth="2.4" fill="none" opacity="0.7" />
                <path d={`M ${n.x + 14} ${n.y + 58} C ${n.x + 28} ${n.y + 52}, ${n.x + 44} ${n.y + 56}, ${n.x + 58} ${n.y + 52}`} stroke="#3E4A38" strokeWidth="2.4" fill="none" opacity="0.6" />
              </g>
            ))}

            {/* Reloj marcando 03:14 */}
            <g>
              <circle cx="170" cy="330" r="52" fill="#0C1116" stroke="#1A242C" strokeWidth="5" />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                <line
                  key={i}
                  x1={170 + Math.cos((i * Math.PI) / 6) * 42}
                  y1={330 + Math.sin((i * Math.PI) / 6) * 42}
                  x2={170 + Math.cos((i * Math.PI) / 6) * 36}
                  y2={330 + Math.sin((i * Math.PI) / 6) * 36}
                  stroke="#3A464E"
                  strokeWidth="3"
                />
              ))}
              <line x1="170" y1="330" x2={170 + Math.cos((-97 * Math.PI) / 180) * 26} y2={330 + Math.sin((-97 * Math.PI) / 180) * 26} stroke="#9AA7B0" strokeWidth="5" strokeLinecap="round" />
              <line x1="170" y1="330" x2={170 + Math.cos((-84 * Math.PI) / 180) * 36} y2={330 + Math.sin((-84 * Math.PI) / 180) * 36} stroke="#9AA7B0" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="170" cy="330" r="4" fill="#9AA7B0" />
              <text x="170" y="412" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="16" fill="#5A6B60">
                03:14
              </text>
            </g>
          </svg>
        </AbsoluteFill>

        {/* ============================ MIDGROUND (1.0) ============================ */}
        <AbsoluteFill>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s3-desk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A3038" />
                <stop offset="100%" stopColor="#12161B" />
              </linearGradient>
              <linearGradient id="s3-monitor" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#171B20" />
                <stop offset="100%" stopColor="#0A0C0F" />
              </linearGradient>
              <linearGradient id="s3-screen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1216" />
                <stop offset="100%" stopColor="#05090C" />
              </linearGradient>
              <radialGradient id="s3-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Escritorio en perspectiva */}
            <path d={`M 60 1220 L 1020 1220 L 1080 1450 L 0 1450 Z`} fill="url(#s3-desk)" />
            <line x1="0" y1="1450" x2={WIDTH} y2="1450" stroke="#07090C" strokeWidth="5" />
            <path d={`M 60 1220 L 1020 1220`} stroke="#3A424C" strokeWidth="2" opacity="0.6" />

            {/* Sombra de contacto del escritorio */}
            <ellipse cx="560" cy="1660" rx="420" ry="46" fill="url(#s3-shadow)" opacity="0.55" />

            {/* Silla oscura tras el personaje */}
            <g>
              <rect x="300" y="1010" width="170" height="240" rx="26" fill="#0A0D10" />
              <rect x="308" y="1040" width="154" height="14" rx="7" fill="#11161B" />
              <rect x="308" y="1100" width="154" height="14" rx="7" fill="#11161B" />
              <rect x="300" y="1250" width="16" height="120" fill="#0A0D10" />
            </g>

            {/* Monitor panorámico de 2010 */}
            <g>
              <path d={`M 600 780 L 940 780 L 940 1190 C 940 1206, 926 1220, 910 1220 L 630 1220 C 614 1220, 600 1206, 600 1190 Z`} fill="url(#s3-monitor)" />
              <rect x="612" y="794" width="316" height="296" fill="url(#s3-screen)" />
              {/* Base */}
              <path d={`M 730 1220 L 810 1220 L 800 1270 L 740 1270 Z`} fill="#0A0C0F" />
              <rect x="690" y="1268" width="160" height="16" rx="8" fill="#0A0C0F" />

              {/* UI de Project64 (SVG diegético) */}
              <g opacity={1 - roomDim * 0.3}>
                <rect x="612" y="794" width="316" height="30" fill="#101418" />
                <text x="622" y="814" fontFamily="'Courier New', monospace" fontSize="13" fill="#9AA7B0">
                  Project64 1.6 — MAJORA.Z64
                </text>
                <circle cx="912" cy="809" r="4" fill="#7F1D1D" />
                <circle cx="898" cy="809" r="4" fill="#6B7280" />
                {/* Viewport 3D con estatua congelada */}
                <rect x="620" y="834" width="180" height="246" fill="#06120A" stroke="#122A1A" strokeWidth="1" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1={620 + i * 40}
                    y1="1080"
                    x2={640 + i * 16}
                    y2="880"
                    stroke="#0E2A1A"
                    strokeWidth="1.4"
                  />
                ))}
                <line x1="620" y1="1080" x2="800" y2="1080" stroke="#0E2A1A" strokeWidth="1.6" />
                <g transform="translate(700 960)">
                  <path d={`M -26 -60 C -24 -78, -14 -92, 0 -98 C 14 -92, 24 -78, 26 -60 C 24 -70, 14 -76, 0 -76 C -14 -76, -24 -70, -26 -60 Z`} fill="#0E2A18" stroke="#22C55E" strokeWidth="1.4" />
                  <path d={`M -20 -58 C -24 -40, -26 -20, -24 0 C -20 -18, -14 -30, -8 -38 C -14 -46, -18 -52, -20 -58 Z`} fill="#0E2A18" stroke="#22C55E" strokeWidth="1.2" />
                  <path d={`M -22 0 C -16 26, -8 48, 4 62 C 16 48, 24 26, 26 0 C 18 20, 8 32, 0 36 C -8 32, -18 20, -22 0 Z`} fill="#0E2A18" stroke="#22C55E" strokeWidth="1.2" />
                </g>
                <text x="628" y="852" fontFamily="'Courier New', monospace" fontSize="11" fill="#2E7A50">
                  FPS: 29.97
                </text>
                <text x="628" y="868" fontFamily="'Courier New', monospace" fontSize="11" fill="#2E7A50">
                  ELEGY.STATUE.RM
                </text>
                {/* Panel de códigos GameShark */}
                <rect x="810" y="834" width="108" height="246" fill="#0B0E11" stroke="#16281E" strokeWidth="1" />
                <text x="820" y="856" fontFamily="'Courier New', monospace" fontSize="11" fontWeight="700" fill="#7FE0A8">
                  GAMESHARK
                </text>
                {[
                  "810F4B28 0001",
                  "800FE0A0 0004",
                  "8111A5D0 0066",
                  "800FE0A4 FFFF",
                ].map((code, i) => (
                  <text
                    key={i}
                    x="820"
                    y={884 + i * 24}
                    fontFamily="'Courier New', monospace"
                    fontSize="10"
                    fill={i === 1 ? "#C9F7D8" : "#22C55E"}
                    opacity={i === 1 ? 0.6 + 0.4 * Math.abs(Math.sin(frame * 0.4)) : 0.75}
                  >
                    {code}
                  </text>
                ))}
                <rect x="820" y="896" width="88" height="16" fill="#0E2A1A" opacity={0.5 + 0.3 * Math.sin(frame * 0.4)} />
                <rect
                  x="820"
                  y={984 + Math.floor(frame / 8) % 2 * 12}
                  width="2"
                  height="12"
                  fill="#7FE0A8"
                  opacity={0.6 + 0.4 * Math.abs(Math.sin(frame * 0.5))}
                />
                {/* Barra de estado + fecha diegética */}
                <rect x="612" y="1080" width="316" height="10" fill="#0E141A" />
                <text x="620" y="1088" fontFamily="'Courier New', monospace" fontSize="9" fill="#5A6B60">
                  EMULATION 100% · INPUT: N64
                </text>
                <text x="880" y="1088" fontFamily="'Courier New', monospace" fontSize="9" fill="#7A868E" opacity="0.85">
                  SEPT 2010 // JADUSABLE
                </text>
                {/* Reflejo del vidrio */}
                <path d={`M 622 806 C 660 800, 740 798, 800 802`} stroke="#FFFFFF" strokeWidth="5" fill="none" opacity="0.04" />
              </g>
            </g>
          </svg>

          {/* Personaje operando teclado/mouse (desk_edit) */}
          <Sequence from={0} durationInFrames={644} name="s3-desk">
            <PlayerCharacter
              uid="s3-pc"
              width={460}
              outfit="hoodie"
              action="desk_edit"
              expression="focused"
              rimColor="#22C55E"
              style={{ left: 90, bottom: 440 }}
            />
          </Sequence>
        </AbsoluteFill>

        {/* ============================ FOREGROUND (1.3) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${fgScale})`, transformOrigin: "55% 45%" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <filter id="s3-fgblur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="11" />
              </filter>
            </defs>
            {/* Borde de monitor */}
            <g filter="url(#s3-fgblur)">
              <path d={`M -40 1520 L 320 1450 L 300 1620 L -40 1700 Z`} fill="#040507" opacity="0.95" />
            </g>
            {/* Taza de café con vapor volumétrico */}
            <g filter="url(#s3-fgblur)">
              <path d={`M 900 1560 C 900 1544, 912 1532, 928 1532 L 990 1532 C 1006 1532, 1018 1544, 1018 1560 L 1010 1650 C 1010 1666, 996 1678, 978 1678 L 932 1678 C 914 1678, 900 1666, 900 1650 Z`} fill="#0B0E12" opacity="0.96" />
              <path d={`M 1018 1568 C 1040 1568, 1052 1578, 1052 1594 C 1052 1610, 1040 1620, 1018 1620`} stroke="#0B0E12" strokeWidth="12" fill="none" opacity="0.96" />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${930 + i * 34} 1524 C ${922 + i * 34} 1498 + Math.sin(frame * 0.4 + i) * 6, ${938 + i * 34} 1476, ${928 + i * 34} 1448 C ${944 + i * 34} 1472, ${946 + i * 34} 1502, ${938 + i * 34} 1524 Z`}
                  fill="#8FB2CC"
                  opacity="0.22"
                />
              ))}
            </g>
            {/* Partículas de código en primer plano */}
            {Array.from({ length: 6 }, (_, i) => {
              const t = ((frame * 1.1 + i * 53) % 320) / 320;
              const px = 90 + i * 180 + Math.sin(frame * 0.06 + i) * 16;
              const py = 1900 - t * 1700;
              const ch = CODE_CHARS[Math.floor(hash01(i * 5.3 + Math.floor(frame / 4)) * CODE_CHARS.length)];
              return (
                <text
                  key={i}
                  x={px}
                  y={py}
                  fontFamily="'Courier New', monospace"
                  fontSize="16"
                  fill="#22C55E"
                  opacity={Math.sin(t * Math.PI) * 0.4}
                >
                  {ch}
                </text>
              );
            })}
          </svg>
        </AbsoluteFill>

        {/* Oscurecimiento del dormitorio durante la Fase 2 */}
        <AbsoluteFill style={{ backgroundColor: "#040507", opacity: roomDim, pointerEvents: "none" }} />

        {/* ==================== FASE 2: PANELES DIVIDIDOS DINÁMICOS ==================== */}
        {(panel1T > 0.001 || panel2T > 0.001 || panel3T > 0.001) && (
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: 100,
                top: 355,
                width: 416,
                height: 390,
                transform: `scale(${0.92 + 0.08 * p1Spring * (1 - panelCollapse * 0.4)}) translateY(${-10 * p1Spring}px)`,
                opacity: panel1T * panelCollapse,
              }}
            >
              <ChanPanel frame={frame} reveal={1} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 564,
                top: 355,
                width: 416,
                height: 390,
                transform: `scale(${0.92 + 0.08 * p2Spring * (1 - panelCollapse * 0.4)}) translateY(${-10 * p2Spring}px)`,
                opacity: panel2T * panelCollapse,
              }}
            >
              <PortalPanel frame={frame} reveal={1} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 100,
                top: 775,
                width: 880,
                height: 430,
                transform: `scale(${0.92 + 0.08 * p3Spring * (1 - panelCollapse * 0.4)}) translateY(${-12 * p3Spring}px)`,
                opacity: panel3T * panelCollapse,
              }}
            >
              <StatuePanel frame={frame} reveal={1} />
            </div>

            {/* Zarcillos luminosos volumétricos cruzando las fronteras */}
            {(panel1T > 0.001 || panel2T > 0.001 || panel3T > 0.001) && (
              <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <linearGradient id="s3-tendril" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0E2A1A" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="s3-tendril-blur" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>
                {[0, 1].map((i) => {
                  // Hilos esbeltos y simétricos: estatua (540,940) → paneles (310/770, 560).
                  const wave = Math.sin(frame * 0.12 + i * 2) * 12;
                  const o = panel3T * panelCollapse * (0.75 + 0.2 * Math.sin(frame * 0.3 + i));
                  const xTarget = i === 0 ? 310 : 770;
                  const dir = i === 0 ? 1 : -1;
                  const c1 = 540 - 70 * dir + wave;
                  const c2 = 540 - 160 * dir - wave;
                  const c1r = c1 + 8;
                  const c2r = c2 + 8;
                  return (
                    <g key={i} opacity={o} filter="url(#s3-tendril-blur)">
                      <path
                        d={`M 540 940 C ${c1} 830, ${c2} 680, ${xTarget} 560 L ${xTarget + 8} 548 C ${c2r} 668, ${c1r} 816, 552 928 Z`}
                        fill="url(#s3-tendril)"
                      />
                      <path
                        d={`M 540 940 C ${c1} 830, ${c2} 680, ${xTarget} 560`}
                        stroke="#22C55E"
                        strokeWidth="1.6"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 540 946 C ${c1 + 12} 836, ${c2 + 12} 686, ${xTarget + 10} 568`}
                        stroke="#86F0A8"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.4"
                      />
                    </g>
                  );
                })}
              </svg>
            )}
          </AbsoluteFill>
        )}

        {/* ==================== ENTRADA: divisor deslizante (f 0–28) ==================== */}
        {frame <= 28 && (
          <AbsoluteFill style={{ overflow: "hidden" }}>
            {/* Azul abisal de la Gran Bahía (capa saliente de la Escena 2) */}
            <AbsoluteFill
              style={{
                background: "linear-gradient(180deg, #04121F 0%, #072B40 60%, #0A2434 100%)",
                clipPath: `inset(0 0 0 ${Math.max(0, dividerX)}px)`,
              }}
            >
              <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
                {Array.from({ length: 8 }, (_, i) => {
                  const t = ((frame * 1.6 + i * 61) % 320) / 320;
                  return (
                    <circle
                      key={i}
                      cx={160 + i * 110 + Math.sin(frame * 0.05 + i) * 20}
                      cy={1900 - t * 2000}
                      r={2.5 + (i % 3) * 2}
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="1.4"
                      opacity={0.3 + 0.3 * Math.sin(t * Math.PI)}
                    />
                  );
                })}
              </svg>
            </AbsoluteFill>
            {/* Borde metálico del divisor con línea verde fósforo */}
            <AbsoluteFill
              style={{
                background: "linear-gradient(90deg, #0A0C0F 0%, #1A2026 78%, #23292F 100%)",
                left: dividerX,
                width: 26,
                boxShadow: "0 0 34px rgba(34,197,94,0.55)",
              }}
            />
            <AbsoluteFill
              style={{
                left: dividerX + 11,
                width: 4,
                background: "linear-gradient(180deg, rgba(34,197,94,0) 0%, #22C55E 20%, #22C55E 80%, rgba(34,197,94,0) 100%)",
                boxShadow: "0 0 18px rgba(34,197,94,0.9)",
              }}
            />
          </AbsoluteFill>
        )}

        {/* ==================== SALIDA: cono de luz spotlight (f 605–644) ==================== */}
        <AbsoluteFill style={{ backgroundColor: "#040507", opacity: darkRoom, pointerEvents: "none" }} />
        {spotlight > 0.01 && (
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
              <defs>
                <linearGradient id="s3-cone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9D8E4" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#C9D8E4" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="s3-reflect" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </radialGradient>
                <filter id="s3-cone-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="22" />
                </filter>
              </defs>
              {/* Cono de luz volumétrico */}
              <path
                d={`M 770 -140 L 590 1270 L 950 1270 Z`}
                fill="url(#s3-cone)"
                opacity={spotlight}
                filter="url(#s3-cone-blur)"
              />
              {/* Reflejo inquietante en la pantalla */}
              <g opacity={spotlight * (0.7 + 0.25 * Math.sin(frame * 0.6))}>
                <ellipse cx="770" cy="1020" rx="170" ry="150" fill="url(#s3-reflect)" />
                <path
                  d={`M 706 930 C 726 906, 758 898, 786 902 C 812 906, 832 918, 842 936 C 846 944, 848 950, 847 957 C 843 962, 839 964, 835 964 C 831 962, 829 958, 828 953 C 820 962, 808 968, 794 969 C 780 970, 767 966, 757 960 C 745 954, 736 946, 730 936 C 722 924, 717 912, 714 900 C 710 910, 707 920, 706 930 Z`}
                  fill="#0A1F14"
                  stroke="#86F0A8"
                  strokeWidth="2"
                />
                <path d={`M 728 916 C 736 908, 748 906, 758 910 C 748 914, 738 914, 728 916 Z`} fill="#22C55E" opacity="0.7" />
                <path d={`M 806 916 C 814 908, 826 906, 836 910 C 826 914, 816 914, 806 916 Z`} fill="#22C55E" opacity="0.7" />
              </g>
            </svg>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
