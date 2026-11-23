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
 * BenScene1Cartridge — Escena 1: El Cartucho Maldito (global 0–590).
 *
 * Habitación universitaria nocturna en penumbra profunda (3 capas 2.5D):
 *  - background (0.25): ventana con persianas proyectando luz lunar fría
 *    en diagonal, estantería con siluetas retro y póster difuminado.
 *  - midground: piso en perspectiva con sombras de contacto, mueble con
 *    CRT grueso emitiendo haz volumétrico verde-cian que ilumina polvo,
 *    N64 hiperdetallada con cables volumétricos y PlayerCharacter
 *    actuando (walk → sit_play con control N64, inserto orgánico grande
 *    de mano + cartucho "Majora" a plumón, CRT con partida BEN).
 *  - foreground (1.3): lámpara apagada desenfocada y cables.
 *  - Cámara: dolly-in único 1.0 → 1.12 (f 0–545) + zoom-through
 *    continuo a través del vidrio curvo del CRT (f 545–590).
 *
 * COORDENADAS: bottom = px sobre el borde inferior (y = 1920 - bottom).
 * Personajes plantados sobre el suelo real (y ≈ 1480–1540).
 */

const SCREEN_CX = 720;
const SCREEN_CY = 820;

/** Lámpara de escritorio apagada (silueta frontal desenfocada). */
const LampSilhouette: React.FC<{ blur: string }> = ({ blur }) => (
  <g filter={blur}>
    <path
      d={`M 20 1560 C 30 1420, 40 1300, 56 1180 L 118 1180 C 132 1290, 138 1400, 140 1500 L 128 1560 Z`}
      fill="#040507"
      opacity="0.95"
    />
    <path
      d={`M 34 1186 C 12 1130, -4 1078, -12 1030 L 40 1000 C 50 1040, 58 1086, 64 1130 Z`}
      fill="#040507"
      opacity="0.95"
    />
    <path
      d={`M -14 1026 C -22 1000, -24 978, -20 958 L 26 934 C 34 958, 36 982, 32 1006 Z`}
      fill="#040507"
      opacity="0.95"
    />
    <ellipse cx="86" cy="1184" rx="34" ry="9" fill="#040507" opacity="0.95" />
  </g>
);

export const BenScene1Cartridge: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- Intención única de cámara: dolly-in suave + zoom-through final ----
  const dollyT = Math.min(frame, 545);
  const baseScale = interpolate(dollyT, [0, 545], [1, 1.12], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zt = Math.max(0, frame - 545);
  const zoomMul = interpolate(zt, [0, 45], [1, 26], {
    easing: Easing.in(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camScale = baseScale * zoomMul;
  const bgScale = 1 + (camScale - 1) * 0.25;
  const fgScale = 1 + (camScale - 1) * 1.3;

  // CRT encendido en f 275.
  const crtOn = interpolate(frame, [275, 305], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phosphorFlicker = 0.82 + 0.14 * Math.sin(frame * 0.9);
  const benFlicker = 0.35 + 0.55 * Math.abs(Math.sin(frame * 0.6));
  const beamOpacity = crtOn * (0.2 + 0.06 * Math.sin(frame * 0.7));

  // Inserción del cartucho (f 200–272): grande, nítido, centro-derecha.
  const insertDown = interpolate(frame, [200, 268], [-640, 0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const insertScale = interpolate(frame, [200, 268], [1.9, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const insertRotate = interpolate(frame, [200, 245], [30, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handWithdraw = interpolate(frame, [262, 272], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Salida zoom-through: resplandor de fósforo y scanlines.
  const glowOut = interpolate(frame, [545, 585], [0.05, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanOut = 0.12 + interpolate(frame, [545, 588], [0, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const walkX = interpolate(frame, [0, 165], [-220, 110], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* ===================== CÁMARA (dolly-in + zoom-through) ===================== */}
      <AbsoluteFill
        style={{
          transform: `scale(${camScale})`,
          transformOrigin: `${SCREEN_CX}px ${SCREEN_CY}px`,
          overflow: "hidden",
        }}
      >
        {/* ============================ BACKGROUND (0.25) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: `${SCREEN_CX}px ${SCREEN_CY}px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s1-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#040507" />
                <stop offset="55%" stopColor="#0A1014" />
                <stop offset="100%" stopColor="#162129" />
              </linearGradient>
              <linearGradient id="s1-moon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C7D4E0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient id="s1-moonbeam" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#A9BBD0" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A9BBD0" stopOpacity="0" />
              </linearGradient>
              <filter id="s1-blur6" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            <rect x="0" y="0" width={WIDTH} height="1380" fill="url(#s1-wall)" />

            {/* Ventana con persianas + luz lunar diagonal (+25% brillo) */}
            <g>
              <rect x="90" y="330" width="240" height="420" rx="8" fill="#0B1116" stroke="#1A242C" strokeWidth="8" />
              <rect x="104" y="344" width="212" height="392" fill="#0E1820" />
              <circle cx="230" cy="420" r="74" fill="url(#s1-moon)" opacity="0.62" filter="url(#s1-blur6)" />
              <circle cx="230" cy="420" r="52" fill="url(#s1-moon)" opacity="0.95" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={i}
                  x="104"
                  y={380 + i * 66}
                  width="212"
                  height="16"
                  rx="3"
                  fill="#04070A"
                  transform={`rotate(-16 ${210} ${388 + i * 66})`}
                />
              ))}
              <rect x="90" y="330" width="240" height="420" rx="8" fill="none" stroke="#22303A" strokeWidth="2" />
              <path
                d={`M 210 620 L 430 620 L 840 1380 L 430 1380 Z`}
                fill="url(#s1-moonbeam)"
                filter="url(#s1-blur6)"
              />
            </g>

            {/* Estantería con siluetas de libros/cajas retro */}
            <g>
              <rect x="800" y="520" width="250" height="620" fill="#070C10" />
              <rect x="790" y="512" width="270" height="14" fill="#0C1218" />
              {[0, 1, 2, 3].map((r) => (
                <rect key={r} x="800" y={660 + r * 122} width="250" height="10" fill="#0C1218" />
              ))}
              {[
                { x: 812, w: 22, h: 130, c: "#11181F" },
                { x: 840, w: 18, h: 118, c: "#0E151B" },
                { x: 864, w: 26, h: 136, c: "#121A21" },
                { x: 898, w: 20, h: 112, c: "#10171D" },
                { x: 924, w: 30, h: 128, c: "#131B22" },
                { x: 962, w: 22, h: 120, c: "#0F161C" },
                { x: 990, w: 26, h: 132, c: "#121A21" },
                { x: 814, w: 40, h: 26, c: "#1A2430" },
                { x: 866, w: 44, h: 30, c: "#18212C" },
                { x: 920, w: 36, h: 24, c: "#1B2531" },
                { x: 962, w: 42, h: 28, c: "#19222D" },
              ].map((b, i) => (
                <rect key={i} x={b.x} y={524 - b.h + (i % 2) * 4} width={b.w} height={b.h} fill={b.c} />
              ))}
            </g>

            {/* Póster oscuro difuminado */}
            <g filter="url(#s1-blur6)">
              <rect x="380" y="450" width="180" height="290" rx="6" fill="#0A0F14" stroke="#141C23" strokeWidth="6" />
              <circle cx="470" cy="580" r="56" fill="#0E141A" />
              <path d={`M 420 700 C 440 680, 460 690, 470 670 C 480 650, 500 660, 520 700 Z`} fill="#0C1217" />
            </g>
          </svg>
        </AbsoluteFill>

        {/* ============================ MIDGROUND (1.0) ============================ */}
        <AbsoluteFill>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s1-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E1318" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <linearGradient id="s1-beam" x1="0" y1="0" x2="0.2" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.42" />
                <stop offset="45%" stopColor="#22D3EE" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="s1-beam-inner" x1="0" y1="0" x2="0.2" y2="1">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="s1-crt-body" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#23282F" />
                <stop offset="100%" stopColor="#101318" />
              </linearGradient>
              <linearGradient id="s1-crt-screen" x1="0" y1="0" x2="0.2" y2="1">
                <stop offset="0%" stopColor="#0B2417" />
                <stop offset="100%" stopColor="#05120C" />
              </linearGradient>
              <linearGradient id="s1-n64" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#4A515B" />
                <stop offset="100%" stopColor="#262B33" />
              </linearGradient>
              <linearGradient id="s1-cart" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#5A626C" />
                <stop offset="100%" stopColor="#33383F" />
              </linearGradient>
              <linearGradient id="s1-skin" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#CBBBA6" />
                <stop offset="100%" stopColor="#93816C" />
              </linearGradient>
              <radialGradient id="s1-faceglow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="s1-floorglow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="s1-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="s1-blur4" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <filter id="s1-blur10" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <clipPath id="s1-crt-clip">
                <rect x="595" y="700" width="250" height="240" rx="70" />
              </clipPath>
            </defs>

            {/* Piso en perspectiva con duelas */}
            <rect x="0" y="1380" width={WIDTH} height={HEIGHT - 1380} fill="url(#s1-floor)" />
            {[1380, 1450, 1540, 1660, 1800].map((y, i) => (
              <line key={i} x1="0" y1={y} x2={WIDTH} y2={y} stroke="#04070A" strokeWidth="2.5" opacity="0.7" />
            ))}
            <line x1="240" y1="1380" x2="120" y2="1920" stroke="#04070A" strokeWidth="2" opacity="0.5" />
            <line x1="620" y1="1380" x2="700" y2="1920" stroke="#04070A" strokeWidth="2" opacity="0.5" />
            <line x1="950" y1="1380" x2="1040" y2="1920" stroke="#04070A" strokeWidth="2" opacity="0.5" />

            {/* Sombras de contacto del mueble y consola */}
            <ellipse cx="740" cy="1400" rx="220" ry="24" fill="url(#s1-shadow)" opacity="0.6" />
            <ellipse cx="800" cy="1430" rx="100" ry="12" fill="url(#s1-shadow)" opacity="0.55" />

            {/* Mueble bajo del televisor */}
            <g>
              <rect x="550" y="1020" width="380" height="300" rx="10" fill="#0E1217" />
              <rect x="540" y="1020" width="400" height="18" rx="6" fill="#161B21" />
              <line x1="560" y1="1180" x2="920" y2="1180" stroke="#070A0D" strokeWidth="3" />
              <rect x="560" y="1200" width="360" height="100" fill="#0A0E12" />
              <rect x="578" y="1212" width="60" height="76" rx="4" fill="#070A0D" />
              <rect x="658" y="1212" width="60" height="76" rx="4" fill="#070A0D" />
              <rect x="738" y="1212" width="60" height="76" rx="4" fill="#070A0D" />
              <rect x="818" y="1212" width="60" height="76" rx="4" fill="#070A0D" />
            </g>

            {/* Televisor CRT grueso */}
            <g>
              <path
                d={`M 560 1020 C 560 950, 580 890, 620 850 C 640 834, 660 822, 684 814 L 756 814 C 780 822, 800 834, 820 850 C 860 890, 880 950, 880 1020 C 880 1040, 860 1060, 840 1060 L 600 1060 C 580 1060, 560 1040, 560 1020 Z`}
                fill="url(#s1-crt-body)"
              />
              <rect x="564" y="846" width="22" height="180" rx="8" fill="#0B0E12" />
              {[862, 890, 918, 946, 974, 1002].map((y) => (
                <line key={y} x1="566" y1={y} x2="584" y2={y} stroke="#04070A" strokeWidth="3" />
              ))}
              <circle cx="818" cy="1040" r="7" fill={crtOn > 0.5 ? "#22C55E" : "#7F1D1D"} opacity="0.9" />
              <rect x="824" y="1048" width="40" height="5" rx="2.5" fill="#070A0D" />
              <rect x="640" y="1048" width="40" height="5" rx="2.5" fill="#070A0D" />
              <circle cx="770" cy="1051" r="4" fill="#070A0D" />
              <circle cx="778" cy="1051" r="4" fill="#070A0D" />

              {/* Pantalla con vidrio curvo */}
              <rect x="595" y="700" width="250" height="240" rx="70" fill="url(#s1-crt-screen)" />
              <g clipPath="url(#s1-crt-clip)">
                <g opacity={crtOn * phosphorFlicker}>
                  <rect x="595" y="700" width="250" height="240" fill="#07130C" />
                  <text
                    x="720"
                    y="776"
                    textAnchor="middle"
                    fontFamily="'Courier New', monospace"
                    fontSize="21"
                    letterSpacing="4"
                    fill="#7FE0A8"
                  >
                    MAJORA'S MASK
                  </text>
                  {/* Ojos de la Máscara sutiles en la oscuridad */}
                  <path d={`M 656 748 C 666 740, 678 740, 684 750 C 676 758, 666 758, 656 748 Z`} fill="#03140B" opacity="0.9" />
                  <path d={`M 756 748 C 766 740, 778 740, 784 750 C 776 758, 766 758, 756 748 Z`} fill="#03140B" opacity="0.9" />
                  <circle cx="670" cy="749" r="3" fill="#22C55E" opacity="0.35" />
                  <circle cx="770" cy="749" r="3" fill="#22C55E" opacity="0.35" />
                  {/* Ranuras de partidas */}
                  <rect x="640" y="806" width="160" height="30" rx="6" fill="#0E2A1A" stroke="#2E7A50" strokeWidth="1.5" />
                  <rect x="640" y="846" width="160" height="30" rx="6" fill="#0E2A1A" stroke="#2E7A50" strokeWidth="1.5" />
                  <rect x="640" y="886" width="160" height="30" rx="6" fill="#0E2A1A" stroke="#2E7A50" strokeWidth="1.5" />
                  <text x="652" y="827" fontFamily="'Courier New', monospace" fontSize="19" fill="#B9FFD2" opacity={benFlicker}>
                    BEN
                  </text>
                  <text x="652" y="867" fontFamily="'Courier New', monospace" fontSize="14" fill="#3E6B52">
                    EMPTY
                  </text>
                  <text x="652" y="907" fontFamily="'Courier New', monospace" fontSize="14" fill="#3E6B52">
                    EMPTY
                  </text>
                  <path
                    d={`M 622 818 L 630 818 L 630 830 L 622 830 Z`}
                    fill="#7FE0A8"
                    opacity={0.5 + 0.5 * Math.sin(frame * 0.8)}
                  />
                  {/* Líneas de corrupción */}
                  <rect x="595" y={730 + ((frame * 7) % 190)} width="250" height="3" fill="#22C55E" opacity="0.14" />
                  <rect x="595" y={742 + ((frame * 11) % 170)} width="250" height="2" fill="#22D3EE" opacity="0.1" />
                </g>
                {/* Reflejo del vidrio */}
                <path
                  d={`M 608 750 C 640 732, 700 726, 756 730`}
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  fill="none"
                  opacity="0.05"
                  filter="url(#s1-blur4)"
                />
              </g>

              {/* Haz volumétrico del CRT (+25% visibilidad) */}
              <path
                d={`M 595 770 L 845 770 L 640 1450 L 260 1450 Z`}
                fill="url(#s1-beam)"
                opacity={beamOpacity}
                filter="url(#s1-blur10)"
              />
              <path
                d={`M 640 780 L 800 780 L 610 1400 L 360 1400 Z`}
                fill="url(#s1-beam-inner)"
                opacity={beamOpacity * 1.4}
                filter="url(#s1-blur10)"
              />
            </g>

            {/* Charco de luz verde en el piso */}
            <ellipse cx="600" cy="1460" rx="230" ry="66" fill="url(#s1-floorglow)" opacity={crtOn * (0.7 + 0.2 * Math.sin(frame * 0.7))} />

            {/* Partículas de polvo iluminadas por el haz */}
            {Array.from({ length: 12 }, (_, i) => {
              const t = ((frame * 0.6 + i * 31) % 180) / 180;
              const px = interpolate(t, [0, 1], [790, 420 - (i % 4) * 60]);
              const py = interpolate(t, [0, 1], [800, 1420]);
              const ox = Math.sin(frame * 0.4 + i * 1.9) * 22;
              const oy = Math.cos(frame * 0.33 + i * 1.3) * 14;
              const o = Math.sin(t * Math.PI) * (0.35 + 0.3 * Math.sin(frame * 0.5 + i));
              return (
                <circle
                  key={i}
                  cx={px + ox}
                  cy={py + oy}
                  r={1.2 + (i % 3) * 0.8}
                  fill="#B9FFD2"
                  opacity={crtOn * Math.max(0, o)}
                />
              );
            })}

            {/* Consola Nintendo 64 hiperdetallada (al frente, visible) */}
            <g>
              <path
                d={`M 720 1300 C 720 1290, 730 1282, 742 1282 L 858 1282 C 870 1282, 880 1290, 880 1300 L 880 1400 C 880 1410, 870 1418, 858 1418 L 742 1418 C 730 1418, 720 1410, 720 1400 Z`}
                fill="url(#s1-n64)"
              />
              {/* Ranura de cartucho */}
              <rect x="750" y="1270" width="100" height="20" rx="4" fill="#171B21" />
              <rect x="758" y="1274" width="84" height="12" rx="3" fill="#0B0E12" />
              {/* Tapa de ranura (se cierra tras insertar) */}
              <g
                transform={`rotate(${interpolate(frame, [268, 275], [0, -24], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 800 1282)`}
              >
                <rect x="746" y="1272" width="108" height="18" rx="5" fill="#2E343C" />
                <rect x="746" y="1286" width="108" height="4" fill="#171B21" />
              </g>
              {/* Botones power/reset */}
              <rect x="736" y="1312" width="30" height="12" rx="4" fill="#1A1F26" />
              <rect x="774" y="1312" width="30" height="12" rx="4" fill="#1A1F26" />
              <circle cx="746" cy="1318" r="2" fill={crtOn > 0.5 ? "#22C55E" : "#7F1D1D"} />
              <text x="789" y="1321" fontFamily="'Courier New', monospace" fontSize="8" fill="#8B919A">
                RESET
              </text>
              {/* Puertos de controles */}
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={820 + i * 15} y="1320" width="12" height="52" rx="5" fill="#0B0E12" />
              ))}
              {/* Vents y etiqueta */}
              {[1294, 1300, 1306].map((y) => (
                <line key={y} x1="888" y1={y} x2="906" y2={y} stroke="#070A0D" strokeWidth="2" opacity="0.8" />
              ))}
              <text x="734" y="1412" fontFamily="'Courier New', monospace" fontSize="9" fill="#6B7280" opacity="0.9">
                NINTENDO 64
              </text>
            </g>

            {/* Cables volumétricos cerrados con caída física (TV ↔ N64 ↔ control) */}
            <g>
              <path
                d={`M 776 1400 C 770 1490, 750 1580, 720 1660 L 740 1666 C 768 1586, 788 1496, 794 1406 Z`}
                fill="#0B0E12"
              />
              <path
                d={`M 776 1400 C 770 1490, 750 1580, 720 1660`}
                stroke="#3A424C"
                strokeWidth="1.6"
                fill="none"
                opacity="0.7"
              />
              <path
                d={`M 730 1300 C 700 1220, 640 1170, 560 1140 C 500 1118, 460 1100, 430 1104 L 434 1084 C 470 1078, 516 1098, 578 1122 C 660 1152, 722 1204, 744 1296 Z`}
                fill="#0B0E12"
              />
              <path
                d={`M 730 1300 C 700 1220, 640 1170, 560 1140 C 500 1118, 460 1100, 430 1104`}
                stroke="#3A424C"
                strokeWidth="1.6"
                fill="none"
                opacity="0.7"
              />
              {/* Cable de la consola al control del jugador */}
              <path
                d={`M 736 1380 C 640 1370, 520 1360, 400 1362 C 366 1363, 344 1368, 340 1376 L 352 1384 C 356 1378, 372 1374, 402 1374 C 520 1372, 640 1380, 738 1390 Z`}
                fill="#0B0E12"
              />
              <path
                d={`M 736 1380 C 640 1370, 520 1360, 400 1362 C 366 1363, 344 1368, 340 1376`}
                stroke="#3A424C"
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              />
            </g>

            {/* Inserto orgánico: mano insertando el cartucho (f 200–272), grande y nítido */}
            {frame >= 200 && frame <= 272 && (
              <g
                opacity={1 - handWithdraw * 0.95}
                transform={`translate(${handWithdraw * 70} ${insertDown}) rotate(${insertRotate}) scale(${insertScale})`}
              >
                <g transform="translate(800 1300) rotate(-4)">
                  {/* Cartucho gris con "Majora" a plumón */}
                  <path
                    d={`M 96 -6 C 96 -16, 86 -22, 74 -22 L 20 -22 C 8 -22, -2 -16, -2 -6 L -2 34 C -2 44, 8 50, 20 50 L 74 50 C 86 50, 96 44, 96 34 Z`}
                    fill="url(#s1-cart)"
                  />
                  <rect x="4" y="-12" width="86" height="24" rx="4" fill="#23272E" />
                  <text
                    x="47"
                    y="5"
                    textAnchor="middle"
                    fontFamily="'Segoe Script', 'Comic Sans MS', cursive"
                    fontSize="17"
                    fontWeight="700"
                    fill="#0A0A0A"
                    transform="rotate(-5 47 0)"
                    opacity="0.92"
                  >
                    Majora
                  </text>
                  <path d={`M 18 8 C 30 12, 52 10, 68 6`} stroke="#0A0A0A" strokeWidth="2.4" fill="none" opacity="0.35" />
                  <line x1="10" y1="22" x2="84" y2="22" stroke="#171B21" strokeWidth="2" />
                  <line x1="10" y1="30" x2="84" y2="30" stroke="#171B21" strokeWidth="2" />
                  {/* Mano sosteniendo el cartucho */}
                  <g transform="translate(102 14)">
                    <path
                      d={`M -6 -14 C -8 0, -8 10, -7 20 L 9 20 C 10 10, 10 0, 8 -14 C 5 -18, -3 -18, -6 -14 Z`}
                      fill="url(#s1-skin)"
                    />
                    <path d={`M -8 18 L -8 30 L -4 30 L -4 18 Z`} fill="url(#s1-skin)" />
                    <path d={`M -1 18 L -1 33 L 3 33 L 3 18 Z`} fill="url(#s1-skin)" />
                    <path d={`M 6 18 L 6 29 L 10 29 L 10 18 Z`} fill="url(#s1-skin)" />
                    <path
                      d={`M -6 -6 C -14 -2, -20 4, -21 12 L -17 12 C -16 6, -12 2, -6 0 Z`}
                      fill="url(#s1-skin)"
                    />
                  </g>
                </g>
              </g>
            )}

            {/* Luz verde corrupta sobre el rostro del jugador */}
            <ellipse
              cx="330"
              cy="1050"
              rx="300"
              ry="250"
              fill="url(#s1-faceglow)"
              opacity={crtOn * (0.5 + 0.18 * Math.sin(frame * 0.9))}
              filter="url(#s1-blur10)"
              style={{ mixBlendMode: "screen" }}
            />
          </svg>

          {/* Personaje: entra caminando desde la izquierda (f 0–165) */}
          <Sequence from={0} durationInFrames={165} name="s1-walk">
            <PlayerCharacter
              uid="s1-pc"
              width={430}
              outfit="hoodie"
              action="walk"
              expression="neutral"
              rimColor="#22D3EE"
              style={{ left: walkX, bottom: 380 }}
            />
          </Sequence>

          {/* Personaje: sentado jugando junto a la N64 (f 165–545) */}
          <Sequence from={165} durationInFrames={380} name="s1-sit">
            <PlayerCharacter
              uid="s1-pc"
              width={450}
              outfit="hoodie"
              action="sit_play"
              expression={frame >= 380 ? "terrified" : "curious"}
              rimColor="#22C55E"
              lookX={0.6}
              style={{ left: 90, bottom: 350 }}
            />
          </Sequence>
        </AbsoluteFill>

        {/* ============================ FOREGROUND (1.3) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${fgScale})`, transformOrigin: `${SCREEN_CX}px ${SCREEN_CY}px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <filter id="s1-fgblur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            <LampSilhouette blur="url(#s1-fgblur)" />
            <path
              d={`M 1052 0 C 1062 140, 1050 260, 1058 380 C 1064 470, 1056 540, 1062 620 L 1042 620 C 1036 540, 1044 470, 1038 380 C 1030 260, 1042 140, 1032 0 Z`}
              fill="#040507"
              opacity="0.96"
              filter="url(#s1-fgblur)"
            />
            <path
              d={`M 20 0 C 12 120, 26 240, 16 360 C 8 460, 20 560, 12 660 L -12 660 C -6 560, -14 460, -6 360 C 2 240, -8 120, 0 0 Z`}
              fill="#040507"
              opacity="0.96"
              filter="url(#s1-fgblur)"
            />
            <path d={`M 1048 200 C 1054 260, 1050 300, 1056 340`} stroke="#1A2430" strokeWidth="3" fill="none" opacity="0.8" />
            <path d={`M 14 260 C 8 320, 12 370, 6 410`} stroke="#1A2430" strokeWidth="3" fill="none" opacity="0.8" />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ===================== POST: scanlines + resplandor de salida ===================== */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
          opacity: scanOut,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${SCREEN_CX}px ${SCREEN_CY}px, rgba(34,197,94,${glowOut}) 0%, rgba(6,20,12,${glowOut * 0.7}) 34%, rgba(0,0,0,${0.4 + glowOut * 0.5}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
