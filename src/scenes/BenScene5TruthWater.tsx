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
import { BenSpiritCharacter } from "../components/characters/BenSpiritCharacter";
import { ElegyStatueCharacter } from "../components/characters/ElegyStatueCharacter";
import { PlayerCharacter } from "../components/characters/PlayerCharacter";

/**
 * BenScene5TruthWater — Escena 5: La Verdad en el Agua (global 2188–2521).
 *
 *  - background (0.25): baño abandonado en penumbra con azulejos
 *    agrietados y cono de luz cenital volumétrico (chiaroscuro).
 *  - midground: bañera vintage oscura de porcelana desgastada en
 *    perspectiva 2.5D (x 240..880, y 1020..1400) con borde enrollado
 *    con brillo especular frío, patas metálicas y sombra densa sobre
 *    las baldosas; agua oscura profunda (WATER_CY 1090) con ondas
 *    volumétricas cerradas, reflejos cian y caustics.
 *  - Transformación en el agua (sin tarjetas): reflejo glitcheado de la
 *    estatua (f 0–130) → BenSpiritCharacter emergiendo (f 130–285) con
 *    gotas y halo cian; Matt arrodillado cubriéndose el rostro.
 *  - Cámara: push-in dramático muy suave + único micro-impacto en
 *    local f 285 (deep_boom, global 2473).
 *  - Salida (f 300–333): barrido dividido diagonal (ola abisal cian +
 *    banda de estática CRT) dividiendo la pantalla en dos mitades.
 *
 * COORDENADAS: bottom = px sobre el borde inferior (y = 1920 - bottom).
 */

const WATER_CY = 1090;
const TUB_CX = 560;

export const BenScene5TruthWater: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cámara: push-in dramático suave + único micro-impacto (f 285).
  const baseScale = interpolate(frame, [0, 333], [1, 1.07], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const punch = spring({
    frame: frame - 285,
    fps,
    config: { damping: 200, mass: 0.55, stiffness: 140 },
  });
  const camScale = baseScale * (1 + punch * 0.03);
  const camY = -punch * 5;
  const bgScale = 1 + (camScale - 1) * 0.25;
  const fgScale = 1 + (camScale - 1) * 1.3;

  // Reflejo glitcheado de la estatua (f 0–130) → disolución (f 130–175).
  const statueReflect = interpolate(frame, [0, 24, 130, 175], [0, 0.55, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ben emergiendo del agua (f 130–285).
  const emergence = interpolate(frame, [130, 285], [0.2, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitchOverlay = interpolate(frame, [130, 220], [0.85, 0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Matt cae de rodillas (f 15–75).
  const kneelFall = interpolate(frame, [15, 75], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mattOpacity = interpolate(frame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Salida: barrido dividido diagonal (f 300–333).
  const sweepT = interpolate(frame, [300, 333], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const staticOp = interpolate(frame, [300, 310, 322], [0, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const halfTint = interpolate(frame, [312, 330], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${camY}px) scale(${camScale})`,
          transformOrigin: `${TUB_CX}px 1180px`,
          overflow: "hidden",
        }}
      >
        {/* ============================ BACKGROUND (0.25) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: `${TUB_CX}px 1180px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s5-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#020306" />
                <stop offset="55%" stopColor="#060A10" />
                <stop offset="100%" stopColor="#0A1016" />
              </linearGradient>
              <linearGradient id="s5-cone" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#BFD9EC" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#BFD9EC" stopOpacity="0" />
              </linearGradient>
              <filter id="s5-blur10" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#s5-wall)" />
            {/* Azulejos agrietados y húmedos */}
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={80 + c * 230}
                  y={160 + r * 230}
                  width="220"
                  height="220"
                  fill="none"
                  stroke="#0E141B"
                  strokeWidth="3"
                  opacity="0.7"
                />
              ))
            )}
            <path d={`M 320 200 L 336 260 L 322 330`} stroke="#04070A" strokeWidth="3" fill="none" opacity="0.9" />
            <path d={`M 760 420 L 744 490 L 762 560`} stroke="#04070A" strokeWidth="3" fill="none" opacity="0.9" />
            <path d={`M 200 900 L 220 960`} stroke="#0E2A1A" strokeWidth="4" fill="none" opacity="0.4" />
            <path d={`M 880 300 L 862 360`} stroke="#0E2A1A" strokeWidth="4" fill="none" opacity="0.35" />
            {/* Cono de luz cenital volumétrico */}
            <path
              d={`M ${TUB_CX} -120 L 180 1600 L 940 1600 Z`}
              fill="url(#s5-cone)"
              filter="url(#s5-blur10)"
            />
          </svg>
        </AbsoluteFill>

        {/* ============================ MIDGROUND (1.0) ============================ */}
        <AbsoluteFill>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s5-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A0E12" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <linearGradient id="s5-tub" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#38434C" />
                <stop offset="55%" stopColor="#1B232B" />
                <stop offset="100%" stopColor="#0B0F14" />
              </linearGradient>
              <radialGradient id="s5-water" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0A2434" />
                <stop offset="70%" stopColor="#061623" />
                <stop offset="100%" stopColor="#04101A" />
              </radialGradient>
              <radialGradient id="s5-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="s5-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="s5-blur6" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <clipPath id="s5-tub-clip">
                <ellipse cx={TUB_CX} cy={WATER_CY} rx="252" ry="46" />
              </clipPath>
            </defs>

            {/* Piso de baldosa mojado */}
            <rect x="0" y="1420" width={WIDTH} height={HEIGHT - 1420} fill="url(#s5-floor)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={1480 + i * 90} x2={WIDTH} y2={1480 + i * 90} stroke="#04070A" strokeWidth="2.5" opacity="0.7" />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`v${i}`} x1={90 + i * 180} y1="1420" x2={90 + i * 180} y2="1920" stroke="#04070A" strokeWidth="2.5" opacity="0.6" />
            ))}
            {/* Reflejo húmedo de la bañera en el piso */}
            <ellipse cx={TUB_CX} cy="1460" rx="330" ry="40" fill="#0A141C" opacity="0.5" />
            <ellipse cx={TUB_CX} cy="1450" rx="300" ry="26" fill="url(#s5-shadow)" opacity="0.55" filter="url(#s5-blur6)" />

            {/* Bañera vintage oscura de porcelana desgastada en perspectiva 2.5D */}
            <g>
              {/* Patas metálicas */}
              <path d={`M 300 1360 L 288 1450 L 312 1450 L 324 1360 Z`} fill="#1A222B" />
              <path d={`M 820 1360 L 808 1450 L 832 1450 L 844 1360 Z`} fill="#1A222B" />
              <path d={`M 288 1450 L 312 1450 L 316 1458 L 284 1458 Z`} fill="#0B0F14" />
              <path d={`M 808 1450 L 832 1450 L 836 1458 L 804 1458 Z`} fill="#0B0F14" />
              {/* Cuerpo de porcelana en penumbra */}
              <path
                d={`M 240 1080 C 240 1040, 310 1008, 400 1002 L 720 1002 C 810 1008, 880 1040, 880 1080 L 880 1330 C 880 1364, 838 1392, 792 1398 L 328 1398 C 282 1392, 240 1364, 240 1330 Z`}
                fill="url(#s5-tub)"
              />
              {/* Sombras de oclusión ambiental en la base */}
              <path d={`M 250 1300 C 300 1334, 820 1334, 870 1300 C 860 1370, 810 1388, 760 1392 L 360 1392 C 310 1388, 260 1370, 250 1300 Z`} fill="#04070A" opacity="0.55" filter="url(#s5-blur6)" />
              {/* Desgaste y grietas de porcelana */}
              <path d={`M 300 1160 C 320 1184, 344 1198, 372 1202`} stroke="#0B0F14" strokeWidth="2.4" fill="none" opacity="0.6" />
              <path d={`M 760 1230 C 786 1248, 812 1258, 838 1260`} stroke="#0B0F14" strokeWidth="2" fill="none" opacity="0.5" />
              <ellipse cx="330" cy="1260" rx="20" ry="30" fill="#2A333C" opacity="0.35" />
              {/* Borde enrollado superior con brillo especular frío */}
              <ellipse cx={TUB_CX} cy="1050" rx="316" ry="52" fill="none" stroke="#94A3B8" strokeWidth="10" opacity="0.55" />
              <ellipse cx={TUB_CX} cy="1046" rx="316" ry="52" fill="none" stroke="#C9D8E4" strokeWidth="3" opacity="0.5" />
              <path d={`M 250 1040 C 340 1004, 780 1004, 870 1040`} stroke="#C9D8E4" strokeWidth="2.4" fill="none" opacity="0.4" />

              {/* Agua oscura profunda */}
              <ellipse cx={TUB_CX} cy={WATER_CY} rx="288" ry="52" fill="url(#s5-water)" />
              {/* Ondas físicas volumétricas */}
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${320 + i * 60} ${WATER_CY + 6 + Math.sin(frame * 0.24 + i * 1.7) * 4} C ${350 + i * 60} ${WATER_CY - 2 + Math.sin(frame * 0.21 + i) * 4}, ${380 + i * 60} ${WATER_CY + 4 + Math.sin(frame * 0.27 + i * 2.1) * 4}, ${410 + i * 60} ${WATER_CY + 6 + Math.sin(frame * 0.24 + i * 1.7) * 4} L ${404 + i * 60} ${WATER_CY + 14} L ${326 + i * 60} ${WATER_CY + 14} Z`}
                  fill="#0E3A4C"
                  opacity="0.5"
                />
              ))}
              {/* Caustics sutiles */}
              <path d={`M 400 ${WATER_CY - 6} C 440 ${WATER_CY - 14}, 490 ${WATER_CY - 8}, 530 ${WATER_CY - 14}`} stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.13" />
              <path d={`M 580 ${WATER_CY - 4} C 630 ${WATER_CY - 12}, 680 ${WATER_CY - 6}, 720 ${WATER_CY - 12}`} stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.11" />
              {/* Halo cian abisal de Ben */}
              <ellipse cx={TUB_CX} cy={WATER_CY - 30} rx="150" ry="90" fill="url(#s5-halo)" opacity={emergence * (0.6 + 0.25 * Math.sin(frame * 0.3))} filter="url(#s5-blur6)" />

              {/* Reflejo glitcheado de la estatua (f 0–130) */}
              <g clipPath="url(#s5-tub-clip)" opacity={statueReflect}>
                <rect x={TUB_CX - 240} y={WATER_CY - 26 + ((frame * 6) % 56)} width="480" height="3" fill="#22C55E" opacity="0.35" />
              </g>

              {/* Corrupción verde del cartucho sobre el agua (f 0–130) */}
              {frame <= 130 && (
                <g clipPath="url(#s5-tub-clip)" opacity={0.55 * (1 - frame / 150)}>
                  <rect x={TUB_CX - 200} y={WATER_CY - 30 + ((frame * 6) % 60)} width="400" height="3" fill="#22C55E" opacity="0.5" />
                  <rect x={TUB_CX - 160} y={WATER_CY - 24 + ((frame * 9) % 50)} width="320" height="2" fill="#22D3EE" opacity="0.4" />
                  <text
                    x={TUB_CX}
                    y={WATER_CY - 8}
                    textAnchor="middle"
                    fontFamily="'Courier New', monospace"
                    fontSize="30"
                    fill="#22C55E"
                    opacity={0.4 + 0.3 * Math.abs(Math.sin(frame * 0.5))}
                  >
                    BEN
                  </text>
                </g>
              )}

              {/* Ondas concéntricas físicas de la transformación (f 130–285) */}
              {[0, 1, 2].map((i) => {
                const t = ((frame - 130) * 0.9 + i * 44) % 132;
                const active = frame >= 130 && frame <= 285;
                const rr = active ? t : 0;
                return (
                  <ellipse
                    key={i}
                    cx={TUB_CX}
                    cy={WATER_CY}
                    rx={rr}
                    ry={rr * 0.16}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1.6"
                    opacity={active ? Math.max(0, 0.5 - rr / 132) * 0.8 : 0}
                  />
                );
              })}
            </g>
          </svg>

          {/* Ben emergiendo del agua (f 130–285) */}
          <Sequence from={0} durationInFrames={333} name="s5-ben">
            <BenSpiritCharacter
              uid="s5-ben"
              width={380}
              emergence={emergence}
              glitchOverlay={glitchOverlay}
              showWaterRipples={false}
              raiseHand
              floatAmplitude={4}
              style={{ left: 370, top: 470 }}
            />
          </Sequence>

          {/* Estatua sumergida y glitcheada en el agua (f 0–175) */}
          {statueReflect > 0.01 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `ellipse(250px 110px at ${TUB_CX}px 1160px)`,
              }}
            >
              <Sequence from={0} durationInFrames={333} name="s5-statue-reflect">
                <ElegyStatueCharacter
                  uid="s5-es"
                  width={240}
                  rimColor="#22C55E"
                  glowEyes
                  eyeGlowColor="#22C55E"
                  teleportGlitch={0.24}
                  opacity={statueReflect}
                  style={{ left: TUB_CX - 120, top: 966 }}
                />
              </Sequence>
            </div>
          )}

          {/* Borde frontal de la bañera (sobre el agua y Ben) */}
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path
              d={`M 240 1080 C 240 1040, 310 1008, 400 1002 L 720 1002 C 810 1008, 880 1040, 880 1080 C 880 1100, 842 1116, 792 1120 C 742 1124, 680 1126, 560 1126 C 440 1126, 378 1124, 328 1120 C 278 1116, 240 1100, 240 1080 Z`}
              fill="none"
              stroke="#38434C"
              strokeWidth="14"
              opacity="0.95"
            />
            <path
              d={`M 252 1096 C 330 1130, 790 1130, 868 1096`}
              stroke="#94A3B8"
              strokeWidth="3"
              fill="none"
              opacity="0.55"
            />
          </svg>

          {/* Matt arrodillado junto a la bañera cubriéndose el rostro */}
          <Sequence from={0} durationInFrames={333} name="s5-matt">
            <div
              style={{
                position: "absolute",
                left: 40,
                bottom: 240,
                width: 410,
                height: 649,
                opacity: mattOpacity,
                transform: `translateY(${-170 * (1 - kneelFall)}px) rotate(${-7 * (1 - kneelFall)}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <PlayerCharacter
                uid="s5-matt"
                width={410}
                outfit="coat_retake"
                action="kneel_grief"
                expression="grief"
                rimColor="#22D3EE"
                style={{ left: 0, bottom: 0 }}
              />
            </div>
          </Sequence>
        </AbsoluteFill>

        {/* ============================ FOREGROUND (1.3) ============================ */}
        <AbsoluteFill style={{ transform: `scale(${fgScale})`, transformOrigin: `${TUB_CX}px 1180px` }}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <filter id="s5-fgblur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="11" />
              </filter>
            </defs>
            {/* Grifo oxidado goteando (borde superior izquierdo) */}
            <g filter="url(#s5-fgblur)">
              <path d={`M -20 260 C 60 250, 120 258, 170 300 L 158 322 C 110 286, 60 280, -20 288 Z`} fill="#040507" opacity="0.97" />
              <circle cx="150" cy="318" r="7" fill="#040507" />
            </g>
            {[0, 1, 2].map((i) => {
              const t = ((frame * 3 + i * 47) % 140) / 140;
              const dx = 156 + Math.sin(i * 2) * 6;
              return (
                <path
                  key={i}
                  d={`M ${dx} ${320 + t * 220} C ${dx - 4} ${320 + t * 220 + 8}, ${dx + 4} ${320 + t * 220 + 14}, ${dx} ${320 + t * 220 + 18} Z`}
                  fill="#22D3EE"
                  opacity={Math.sin(t * Math.PI) * 0.5}
                />
              );
            })}
            {/* Vapor frío tenue */}
            <g opacity="0.14">
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${700 + i * 120} 1480 C ${680 + i * 120} 1420 + Math.sin(frame * 0.2 + i) * 10, ${720 + i * 120} 1360, ${700 + i * 120} 1300 C ${730 + i * 120} 1360, ${730 + i * 120} 1420, ${710 + i * 120} 1480 Z`}
                  fill="#8FB2CC"
                  filter="url(#s5-fgblur)"
                />
              ))}
            </g>
            {/* Desenfoque en esquinas */}
            <g filter="url(#s5-fgblur)">
              <polygon points="0,0 260,0 0,420" fill="#040507" opacity="0.9" />
              <polygon points="1080,0 860,0 1080,360" fill="#040507" opacity="0.9" />
            </g>
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ============ SALIDA: barrido dividido diagonal (f 300–333) ============ */}
      {frame >= 300 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Ola volumétrica de agua abisal */}
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
            <defs>
              <linearGradient id="s5-sweepwater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A2434" />
                <stop offset="100%" stopColor="#04121F" />
              </linearGradient>
            </defs>
            <g transform={`translate(${-1400 + sweepT * 3000} 0)`}>
              <path
                d={`M 0 1920 L 0 1300 C 120 1280, 220 1330, 340 1300 C 460 1270, 560 1330, 680 1300 C 800 1270, 900 1330, 1020 1300 L 1020 1920 Z`}
                fill="url(#s5-sweepwater)"
                opacity="0.96"
              />
              <path
                d={`M 0 1300 C 120 1280, 220 1330, 340 1300 C 460 1270, 560 1330, 680 1300 C 800 1270, 900 1330, 1020 1300`}
                stroke="#22D3EE"
                strokeWidth="4"
                fill="none"
                opacity="0.7"
              />
            </g>
          </svg>
          {/* Banda de estática CRT diagonal */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, rgba(34,197,94,0.5) 0px, rgba(34,197,94,0.5) 1px, transparent 1px, transparent 4px)",
              opacity: staticOp * 0.6,
              clipPath: `polygon(${30 - sweepT * 10}% 0, ${46 - sweepT * 10}% 0, ${8 + sweepT * 12}% 100%, ${-8 + sweepT * 12}% 100%)`,
            }}
          />
          {/* Dos mitades de alto contraste */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#03140C",
              opacity: halfTint * 0.85,
              clipPath: `polygon(0 0, ${34 + sweepT * 8}% 0, ${-4 + sweepT * 8}% 100%, 0 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#04121F",
              opacity: halfTint * 0.85,
              clipPath: `polygon(${34 + sweepT * 8}% 0, 100% 0, 100% 100%, ${-4 + sweepT * 8}% 100%)`,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
