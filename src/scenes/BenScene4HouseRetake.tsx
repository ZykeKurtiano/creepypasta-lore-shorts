import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { HEIGHT, WIDTH } from "../data/episodeConfig";
import { PlayerCharacter } from "../components/characters/PlayerCharacter";

/**
 * BenScene4HouseRetake — Escena 4: El Retake (global 1892–2188).
 *
 *  - Entrada (f 0–28): pared en ruinas agrietada con yeso desprendido
 *    barre el encuadre de derecha a izquierda revelando el pasillo.
 *  - background (0.25): pasillo en ruinas en perspectiva de punto de
 *    fuga hacia la puerta entreabierta del baño que emite un haz
 *    azul-frío; papel tapiz rasgado, grietas húmedas, fotos torcidas
 *    con vidrios rotos y calendario cuyas paredes se deforman con
 *    texturas glitcheadas de Majora's Mask (ojos de la máscara y
 *    polígonos verde-púrpura filtrándose por las grietas).
 *  - midground: tablas rotas + polvo, frasco de terapia caído y Matt
 *    (coat_retake / walk_heavy / grief) avanzando con zancada pesada
 *    real y sombra elíptica.
 *  - foreground (1.3): viga astillada y marco roto en silueta + motas.
 *  - Cámara: tracking/dolly-in lento y melancólico; salida (f 258–296)
 *    zoom-through continuo a través de la puerta del baño.
 */

const VP_X = 540;
const VP_Y = 860;

export const BenScene4HouseRetake: React.FC = () => {
  const frame = useCurrentFrame();

  // Cámara: dolly-in melancólico + zoom-through final por la puerta.
  const dollyT = Math.min(frame, 258);
  const baseScale = interpolate(dollyT, [0, 258], [1, 1.14], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zt = Math.max(0, frame - 258);
  const zoomMul = interpolate(zt, [0, 38], [1, 18], {
    easing: Easing.in(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camScale = baseScale * zoomMul;
  const bgScale = 1 + (camScale - 1) * 0.25;
  const fgScale = 1 + (camScale - 1) * 1.3;

  // Pared de entrada barriendo de derecha a izquierda (f 0–28).
  const wallX = interpolate(frame, [0, 28], [1080, -240], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch de Majora's Mask filtrándose por las grietas (progresivo).
  const glitchT = interpolate(frame, [40, 220], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const maskPulse = 0.5 + 0.3 * Math.sin(frame * 0.23);

  // Matt camina desde el primer plano alejándose hacia la puerta del fondo.
  const mattX = interpolate(frame, [0, 240], [600, 540], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mattW = interpolate(frame, [0, 240], [450, 320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mattBottom = interpolate(frame, [0, 240], [260, 460], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Salida: la puerta se abre y el marco se expande fuera del encuadre.
  const doorOpen = interpolate(frame, [258, 290], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coldFlare = interpolate(frame, [258, 296], [0.1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${camScale})`,
          transformOrigin: `${VP_X}px ${VP_Y}px`,
          overflow: "hidden",
        }}
      >
        {/* ============================ BACKGROUND (0.25) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: `${VP_X}px ${VP_Y}px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s4-ceil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#04060A" />
                <stop offset="100%" stopColor="#0A0E13" />
              </linearGradient>
              <linearGradient id="s4-wallL" x1="0" y1="0" x2="1" y2="0.6">
                <stop offset="0%" stopColor="#0A0E12" />
                <stop offset="100%" stopColor="#131A20" />
              </linearGradient>
              <linearGradient id="s4-wallR" x1="0" y1="0" x2="1" y2="0.6">
                <stop offset="0%" stopColor="#131A20" />
                <stop offset="100%" stopColor="#0A0E12" />
              </linearGradient>
              <linearGradient id="s4-doorlight" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#8FB2CC" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#8FB2CC" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="s4-coldflare" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#BFD9EC" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#7FA8C8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7FA8C8" stopOpacity="0" />
              </radialGradient>
              <filter id="s4-blur6" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Techo */}
            <polygon points={`0,0 1080,0 1080,300 ${VP_X},${VP_Y} 0,300`} fill="url(#s4-ceil)" />
            {/* Paredes */}
            <polygon points={`0,300 ${470},${VP_Y} 0,1920`} fill="url(#s4-wallL)" />
            <polygon points={`1080,300 ${610},${VP_Y} 1080,1920`} fill="url(#s4-wallR)" />
            {/* Pared trasera */}
            <polygon points={`470,300 610,300 610,${VP_Y} 470,${VP_Y}`} fill="#0C1116" />

            {/* Papel tapiz rasgado (pared izquierda) */}
            {[
              { x1: 60, y1: 620, x2: 240, y2: 900, w: 46 },
              { x1: 30, y1: 980, x2: 320, y2: 1240, w: 58 },
              { x1: 80, y1: 1400, x2: 380, y2: 1680, w: 52 },
            ].map((s, i) => (
              <path
                key={i}
                d={`M ${s.x1} ${s.y1} L ${s.x2} ${s.y2} L ${s.x2 + 12} ${s.y2 + 10} L ${s.x1 + 14} ${s.y1 + 12} Z`}
                fill="#1A222A"
                opacity="0.5"
              />
            ))}

            {/* Grietas húmedas */}
            <path d={`M 130 500 L 150 620 L 138 760 L 170 900`} stroke="#04060A" strokeWidth="4" fill="none" opacity="0.9" />
            <path d={`M 940 560 L 918 700 L 936 830`} stroke="#04060A" strokeWidth="4" fill="none" opacity="0.9" />
            <path d={`M 60 1280 L 90 1360 L 78 1470`} stroke="#04060A" strokeWidth="3.5" fill="none" opacity="0.85" />

            {/* Marcos de fotos torcidos con vidrios rotos */}
            {[
              { x: 150, y: 520, r: -7, w: 84, h: 104 },
              { x: 250, y: 760, r: 5, w: 74, h: 94 },
            ].map((f, i) => (
              <g key={i} transform={`rotate(${f.r} ${f.x} ${f.y})`}>
                <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="5" fill="#10151A" stroke="#1E262E" strokeWidth="5" />
                <rect x={f.x + 10} y={f.y + 10} width={f.w - 20} height={f.h - 20} fill="#0A0E12" />
                <path d={`M ${f.x + 16} ${f.y + 22} C ${f.x + 30} ${f.y + 14}, ${f.x + 48} ${f.y + 20}, ${f.x + 56} ${f.y + 34}`} stroke="#1E262E" strokeWidth="3" fill="none" />
                {/* Vidrio roto */}
                <path d={`M ${f.x + 8} ${f.y + 60} L ${f.x + 42} ${f.y + 30} L ${f.x + 30} ${f.y + 84} Z`} stroke="#3A4652" strokeWidth="1.6" fill="none" opacity="0.9" />
                <path d={`M ${f.x + 42} ${f.y + 30} L ${f.x + 68} ${f.y + 14}`} stroke="#3A4652" strokeWidth="1.4" fill="none" opacity="0.7" />
              </g>
            ))}

            {/* Calendario antiguo deformándose con glitch de Majora */}
            <g transform={`rotate(-6 740 470) skewX(${glitchT * Math.sin(frame * 0.2) * 3})`}>
              <rect x="690" y="430" width="110" height="130" rx="4" fill="#1A222A" opacity="0.9" />
              <rect x="698" y="438" width="94" height="114" fill="#13181E" />
              <text x="745" y="478" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="17" fill="#5A6B60">
                OCTUBRE
              </text>
              <text x="745" y="526" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="42" fill="#8B919A">
                23
              </text>
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${706 + i * 24} ${442 + i * 6} L ${714 + i * 24} ${450 + i * 6}`}
                  stroke="#7F1D1D"
                  strokeWidth="3"
                  opacity="0.8"
                />
              ))}
            </g>

            {/* Ojos de la Máscara filtrándose por las grietas */}
            <g opacity={glitchT * (0.55 + maskPulse * 0.5)}>
              <path
                d={`M 396 780 C 412 764, 436 764, 448 784 C 432 800, 408 800, 396 780 Z`}
                fill="#040A06"
                stroke="#22C55E"
                strokeWidth="2"
                opacity="0.8"
              />
              <path
                d={`M 634 780 C 650 764, 674 764, 686 784 C 670 800, 646 800, 634 780 Z`}
                fill="#040A06"
                stroke="#22C55E"
                strokeWidth="2"
                opacity="0.8"
              />
              <circle cx="422" cy="778" r="4" fill="#22C55E" opacity="0.8" />
              <circle cx="660" cy="778" r="4" fill="#22C55E" opacity="0.8" />
            </g>

            {/* Polígonos corruptos verde-púrpura filtrándose */}
            <g opacity={glitchT * 0.7} style={{ mixBlendMode: "screen" }}>
              <polygon points={`138,760 150,748 158,762 146,772`} fill="#22C55E" opacity="0.5" transform={`scale(${1 + Math.sin(frame * 0.16) * 0.12})`} />
              <polygon points={`918,700 932,690 940,704 926,712`} fill="#9333EA" opacity="0.5" transform={`scale(${1 + Math.sin(frame * 0.13 + 2) * 0.1})`} />
              <polygon points={`78,1470 90,1462 96,1474 84,1480`} fill="#22C55E" opacity="0.4" />
              <polygon points={`250,760 262,752 268,764 256,770`} fill="#9333EA" opacity="0.35" />
            </g>

            {/* Puerta entreabierta del baño al fondo */}
            <g>
              <rect x="500" y="664" width="80" height="196" fill="#02040A" />
              <path
                d={`M 500 700 L 580 700 L 980 1900 L 100 1900 Z`}
                fill="url(#s4-doorlight)"
                filter="url(#s4-blur6)"
              />
              {/* Hojas de la puerta entreabiertas */}
              <g transform={`rotate(${-8 - doorOpen * 52} 500 860)`}>
                <rect x="462" y="660" width="38" height="204" rx="3" fill="#151B21" />
                <rect x="470" y="700" width="22" height="12" fill="#0A0E12" />
              </g>
              <g transform={`rotate(${8 + doorOpen * 52} 580 860)`}>
                <rect x="580" y="660" width="38" height="204" rx="3" fill="#151B21" />
                <rect x="588" y="700" width="22" height="12" fill="#0A0E12" />
              </g>
              <rect x="494" y="656" width="92" height="10" fill="#1E262E" />
            </g>
          </svg>
        </AbsoluteFill>

        {/* ============================ MIDGROUND (1.0) ============================ */}
        <AbsoluteFill>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s4-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E1216" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <radialGradient id="s4-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Suelo de madera en perspectiva */}
            <polygon points={`${470},${VP_Y} ${610},${VP_Y} 1080,1920 0,1920`} fill="url(#s4-floor)" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const t = i / 9;
              const y = VP_Y + Math.pow(t, 1.9) * (1920 - VP_Y);
              return <line key={i} x1="0" y1={y} x2={WIDTH} y2={y} stroke="#04070A" strokeWidth={1.5 + t * 3} opacity="0.85" />;
            })}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`v${i}`}
                x1={470 + i * 35}
                y1={VP_Y}
                x2={80 + i * 220}
                y2="1920"
                stroke="#04070A"
                strokeWidth="2"
                opacity="0.5"
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={`vr${i}`}
                x1={610 - i * 35}
                y1={VP_Y}
                x2={1000 - i * 220}
                y2="1920"
                stroke="#04070A"
                strokeWidth="2"
                opacity="0.5"
              />
            ))}
            {/* Tabla rota levantada */}
            <g transform="rotate(5 420 1490)">
              <polygon points="360,1450 500,1450 492,1510 352,1510" fill="#10151A" />
              <polygon points="352,1510 492,1510 488,1522 348,1522" fill="#07090C" />
            </g>
            {/* Polvo en el suelo */}
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={i}
                cx={200 + ((i * 157) % 700)}
                cy={1500 + ((i * 211) % 380)}
                rx={3 + (i % 3)}
                ry="1.4"
                fill="#1A222A"
                opacity="0.4"
              />
            ))}

            {/* Frasco de terapia caído */}
            <g transform="rotate(-24 320 1730)">
              <rect x="296" y="1680" width="44" height="62" rx="7" fill="#A86A2E" opacity="0.9" />
              <rect x="304" y="1668" width="28" height="16" rx="4" fill="#7A4A1E" />
              <rect x="304" y="1696" width="28" height="30" rx="3" fill="#C9C4B8" opacity="0.9" />
              <line x1="304" y1="1706" x2="332" y2="1706" stroke="#5A6B60" strokeWidth="1.6" />
              <line x1="304" y1="1716" x2="332" y2="1716" stroke="#5A6B60" strokeWidth="1.6" />
            </g>
            <circle cx="272" cy="1726" r="4" fill="#C9C4B8" opacity="0.9" />
            <circle cx="262" cy="1736" r="4" fill="#C9C4B8" opacity="0.8" />
            <circle cx="284" cy="1738" r="4" fill="#C9C4B8" opacity="0.7" />

            {/* Sombras proyectadas en el pasillo */}
            <ellipse cx="700" cy="1580" rx="130" ry="16" fill="url(#s4-shadow)" opacity="0.4" />
            <ellipse cx="380" cy="1800" rx="90" ry="12" fill="url(#s4-shadow)" opacity="0.4" />
          </svg>

          {/* Matt avanzando con paso pesado hacia la puerta */}
          <Sequence from={0} durationInFrames={296} name="s4-matt">
            <PlayerCharacter
              uid="s4-matt"
              width={mattW}
              outfit="coat_retake"
              action="walk_heavy"
              expression="grief"
              rimColor="#94A3B8"
              style={{ left: mattX - mattW / 2, bottom: mattBottom }}
            />
          </Sequence>
        </AbsoluteFill>

        {/* ============================ FOREGROUND (1.3) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${fgScale})`, transformOrigin: `${VP_X}px ${VP_Y}px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <filter id="s4-fgblur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="11" />
              </filter>
            </defs>
            {/* Viga astillada y marco roto en silueta */}
            <g filter="url(#s4-fgblur)">
              <polygon points="0,0 190,0 120,1920 0,1920" fill="#040507" opacity="0.96" />
              <polygon points="1080,0 890,0 960,1920 1080,1920" fill="#040507" opacity="0.96" />
              <path d={`M 176 300 L 148 620 L 162 900`} stroke="#0A0E12" strokeWidth="14" fill="none" opacity="0.9" />
              <path d={`M 908 420 L 936 760 L 920 1080`} stroke="#0A0E12" strokeWidth="12" fill="none" opacity="0.9" />
            </g>
            {/* Motas de polvo iluminadas por la rendija */}
            {Array.from({ length: 9 }, (_, i) => {
              const t = ((frame * 0.5 + i * 41) % 200) / 200;
              const px = VP_X - 260 + t * 520 + Math.sin(frame * 0.35 + i) * 18;
              const py = VP_Y + 60 + t * 760;
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={1.4 + (i % 3)}
                  fill="#BFD9EC"
                  opacity={Math.sin(t * Math.PI) * 0.4}
                />
              );
            })}
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Resplandor frío de la salida zoom-through */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${VP_X}px ${VP_Y - 60}px, rgba(191,217,236,${coldFlare}) 0%, rgba(127,168,200,${coldFlare * 0.5}) 30%, rgba(4,7,10,${0.3 + coldFlare * 0.6}) 100%)`,
          pointerEvents: "none",
        }}
      />
      {/* Pared de entrada barriendo de derecha a izquierda (f 0–28) */}
      {frame <= 28 && (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s4-entrywall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#13161A" />
                <stop offset="70%" stopColor="#0B0D10" />
                <stop offset="100%" stopColor="#06080A" />
              </linearGradient>
            </defs>
            <polygon
              points={`${wallX},0 ${wallX + 30},-20 ${wallX - 14},180 ${wallX + 22},430 ${wallX - 10},760 ${wallX + 18},1100 ${wallX - 12},1450 ${wallX + 24},1750 ${wallX - 8},1920 1080,1920 1080,0`}
              fill="url(#s4-entrywall)"
            />
            <path d={`M ${wallX + 6} 300 L ${wallX + 40} 340 L ${wallX + 2} 420`} stroke="#040507" strokeWidth="3" fill="none" opacity="0.8" />
            <path d={`M ${wallX - 4} 900 L ${wallX + 34} 960 L ${wallX - 6} 1040`} stroke="#040507" strokeWidth="3" fill="none" opacity="0.8" />
            <path d={`M ${wallX + 10} 1500 L ${wallX + 44} 1560`} stroke="#040507" strokeWidth="3" fill="none" opacity="0.7" />
            {/* Borde de yeso desprendido */}
            <path
              d={`M ${wallX} 0 L ${wallX + 30} -20 L ${wallX - 14} 180 L ${wallX + 22} 430 L ${wallX - 10} 760 L ${wallX + 18} 1100 L ${wallX - 12} 1450 L ${wallX + 24} 1750 L ${wallX - 8} 1920`}
              stroke="#23282F"
              strokeWidth="3"
              fill="none"
              opacity="0.9"
            />
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
