import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CharacterSilhouette } from "../components/CharacterSilhouette";
import { pinePath } from "../components/ForestParallax25D";
import { Flicker, HANDWRITING, IMPACT, MONO, Panel } from "../components/ui";

/**
 * Act2Origin.tsx (frames 156-855, local 0-699) — Archivo paranormal /
 * found-footage sobre el bosque 2.5D. Tarjetas dossier/Polaroid dentro de
 * la caja segura x:[72, 896] y:[360, 1140] que rotan con la narración.
 *
 * Local:  0.0– 5.3s  JUNIO 2009 + ¿ENTIDAD ANTIGUA? tachado -> ORIGEN REAL
 *         5.3–11.6s  FOTO #01 / #02 + ERIC KNUDSEN + SOMETHING AWFUL // FORO
 *        11.6–23.3s  Collage viral: cinta, nota de diario y red carmesí
 */

const CARD_LEFT = 72;
const CARD_WIDTH = 824;
const CARD_TOP = 360;
const CARD_HEIGHT = 780;

const fadeIn = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const fadeOut = (frame: number, from: number, to: number) =>
  1 - fadeIn(frame, from, to);

/** Fondo de foto vintage gelatina de plata: bosque oscuro + figuras fantasmales.
 *  En la FOTO #02 aparece Slenderman acechando, marcado con círculo de evidencia. */
const MiniForest: React.FC<{ lurker?: boolean }> = ({ lurker = false }) => {
  const id = lurker ? "ph2" : "ph1";
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 300" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222B30" />
          <stop offset="55%" stopColor="#141B21" />
          <stop offset="100%" stopColor="#0B1014" />
        </linearGradient>
      </defs>
      <rect width="240" height="300" fill={`url(#${id})`} />
      {/* Luna velada */}
      <circle cx="170" cy="44" r="22" fill="rgba(230,227,218,0.12)" />
      <circle cx="170" cy="44" r="9" fill="rgba(230,227,218,0.45)" />
      {/* Abetos oscuros */}
      <path d={pinePath(28, 130, 66, 170)} fill="#0A0F13" />
      <path d={pinePath(96, 92, 84, 208)} fill="#0A0F13" />
      <path d={pinePath(172, 110, 70, 190)} fill="#0A0F13" />
      <path d={pinePath(220, 140, 56, 160)} fill="#0A0F13" />
      {/* Niebla baja */}
      <ellipse cx="120" cy="250" rx="130" ry="28" fill="#12181E" opacity="0.55" />
      <rect y="256" width="240" height="44" fill="#07090C" />

      {lurker ? (
        <g>
          {/* Slenderman acechando entre los árboles */}
          <ellipse cx="150" cy="104" rx="6.5" ry="9" fill="#C9C6BC" opacity="0.92" />
          <rect x="144.5" y="113" width="11" height="66" fill="#05070A" />
          <rect x="138" y="122" width="4" height="40" fill="#05070A" />
          <rect x="158" y="122" width="4" height="40" fill="#05070A" />
          <path d="M 150 116 C 132 96, 120 100, 106 88" stroke="#05070A" strokeWidth="2.5" fill="none" />
          <path d="M 150 116 C 168 96, 180 100, 194 88" stroke="#05070A" strokeWidth="2.5" fill="none" />
          <path d="M 150 116 C 150 82, 140 68, 126 56" stroke="#05070A" strokeWidth="2.5" fill="none" />
          {/* Círculo rojo de evidencia + marcas de mira */}
          <circle cx="150" cy="118" r="30" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.85" />
          <line x1="150" y1="82" x2="150" y2="90" stroke="#DC2626" strokeWidth="2" opacity="0.85" />
          <line x1="150" y1="146" x2="150" y2="154" stroke="#DC2626" strokeWidth="2" opacity="0.85" />
          <line x1="112" y1="118" x2="120" y2="118" stroke="#DC2626" strokeWidth="2" opacity="0.85" />
          <line x1="180" y1="118" x2="188" y2="118" stroke="#DC2626" strokeWidth="2" opacity="0.85" />
        </g>
      ) : (
        <g>
          {/* Columpios de parque abandonados + figura fantasmal */}
          <g stroke="#1A222A" strokeWidth="2" opacity="0.8">
            <line x1="64" y1="246" x2="56" y2="180" />
            <line x1="64" y1="246" x2="72" y2="180" />
            <line x1="136" y1="246" x2="128" y2="180" />
            <line x1="136" y1="246" x2="144" y2="180" />
            <line x1="56" y1="178" x2="144" y2="178" />
            <line x1="70" y1="178" x2="70" y2="226" />
            <line x1="74" y1="178" x2="74" y2="226" />
            <line x1="126" y1="178" x2="126" y2="226" />
            <line x1="130" y1="178" x2="130" y2="226" />
          </g>
          <rect x="66" y="224" width="12" height="4" fill="#1A222A" opacity="0.8" />
          <rect x="122" y="224" width="12" height="4" fill="#1A222A" opacity="0.8" />
          <ellipse cx="32" cy="196" rx="4" ry="5" fill="#202830" opacity="0.7" />
          <rect x="27" y="200" width="9" height="32" fill="#202830" opacity="0.5" />
        </g>
      )}

      {/* Arañazos y grano de emulsión */}
      <line x1="20" y1="60" x2="90" y2="58" stroke="#E8E4DA" strokeWidth="1.2" opacity="0.14" />
      <line x1="150" y1="30" x2="210" y2="34" stroke="#E8E4DA" strokeWidth="1.2" opacity="0.12" />
      <line x1="30" y1="210" x2="110" y2="206" stroke="#E8E4DA" strokeWidth="1.2" opacity="0.1" />
      <line x1="180" y1="252" x2="226" y2="250" stroke="#E8E4DA" strokeWidth="1" opacity="0.12" />
      <circle cx="52" cy="120" r="0.8" fill="#E8E4DA" opacity="0.16" />
      <circle cx="128" cy="160" r="0.8" fill="#04070A" opacity="0.25" />
      <circle cx="204" cy="88" r="0.9" fill="#E8E4DA" opacity="0.14" />
      <circle cx="36" cy="240" r="0.8" fill="#E8E4DA" opacity="0.12" />
      <circle cx="220" cy="180" r="0.7" fill="#04070A" opacity="0.28" />
      <circle cx="90" cy="52" r="0.7" fill="#E8E4DA" opacity="0.15" />
    </svg>
  );
};

const VintagePhoto: React.FC<{ label: string; rotate: number; lurker?: boolean }> = ({
  label,
  rotate,
  lurker = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 300,
        height: 360,
        background: "#0D1218",
        border: "4px solid rgba(43,58,66,0.95)",
        padding: 14,
        transform: `rotate(${rotate}deg)`,
        filter: "grayscale(0.6) sepia(0.28) contrast(1.06) brightness(0.92)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 4,
          width: 92,
          height: 24,
          background: "rgba(242,239,233,0.22)",
          transform: "rotate(-3deg)",
        }}
      />
      <MiniForest lurker={lurker} />
    </div>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 18,
        letterSpacing: "0.28em",
        color: "rgba(242,239,233,0.75)",
      }}
    >
      {label}
    </div>
  </div>
);

/** Red de conexión carmesí brillante (determinista) */
const ConnectionWeb: React.FC<{ frame: number }> = ({ frame }) => {
  const nodes = [
    { x: 50, y: 115, label: "FORO" },
    { x: 215, y: 45, label: "FOTOS" },
    { x: 215, y: 185, label: "DIARIOS" },
    { x: 390, y: 115, label: "VIDEOS" },
    { x: 585, y: 115, label: "LEYENDA" },
  ];
  const links: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 4],
  ];
  return (
    <svg width="100%" height="230" viewBox="0 0 640 230">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(220,38,38,0.55)"
          strokeWidth={2}
        />
      ))}
      {nodes.map((n, i) => {
        const pulse = Math.sin(frame * 0.09 + i * 1.2) * 1.8;
        return (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={7 + pulse}
              fill="none"
              stroke="rgba(220,38,38,0.45)"
              strokeWidth={1.5}
            />
            <circle cx={n.x} cy={n.y} r={4.5 + pulse * 0.4} fill="#DC2626" />
            <text
              x={n.x}
              y={n.y + 26}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={15}
              fill="#B9B4A6"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const Act2Origin: React.FC = () => {
  const frame = useCurrentFrame();

  const cardA = fadeIn(frame, 2, 20) * fadeOut(frame, 148, 162);
  const cardB = fadeIn(frame, 161, 178) * fadeOut(frame, 338, 352);
  const cardC = fadeIn(frame, 350, 368) * fadeOut(frame, 686, 699);

  const slideA = (1 - fadeIn(frame, 2, 20)) * 40;
  const slideB = (1 - fadeIn(frame, 161, 178)) * 40;
  const slideC = (1 - fadeIn(frame, 350, 368)) * 40;

  return (
    <AbsoluteFill>
      {/* Slenderman fantasmagórico, escondido tras el tronco izquierdo */}
      <CharacterSilhouette
        scale={0.8}
        xOffset={-395}
        opacity={0.12}
        tentacleSpread={0.18}
        glitchIntensity={0}
        rimColor="#2B3A42"
      />

      <div
        style={{
          position: "absolute",
          left: CARD_LEFT,
          top: CARD_TOP,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
      >
        {/* ---- Tarjeta A: JUNIO 2009 ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            opacity: cardA,
            transform: `translateY(${slideA}px)`,
          }}
        >
          <Panel
            style={{
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 30,
            }}
          >
            <div
              style={{
                border: "3px solid rgba(127,29,29,0.9)",
                background: "rgba(127,29,29,0.28)",
                color: "#F2EFE9",
                fontFamily: MONO,
                fontSize: 40,
                letterSpacing: "0.2em",
                padding: "12px 30px",
                transform: "rotate(-5deg)",
                filter: "blur(0.6px) contrast(1.05)",
              }}
            >
              JUNIO 2009
            </div>
            <div
              style={{
                position: "relative",
                fontFamily: IMPACT,
                fontSize: 36,
                letterSpacing: "0.06em",
                color: "#B9B4A6",
                textAlign: "center",
              }}
            >
              ¿ENTIDAD ANTIGUA?
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "108%",
                  height: 5,
                  marginLeft: "-54%",
                  background: "#DC2626",
                  boxShadow: "0 0 12px rgba(220,38,38,0.6)",
                  transform: "translateY(-50%) rotate(-3deg)",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: IMPACT,
                fontSize: 44,
                letterSpacing: "0.05em",
                color: "#FDE047",
                textShadow: "0 0 18px rgba(253,224,71,0.35), 0 2px 0 rgba(4,5,7,0.9)",
              }}
            >
              → ORIGEN REAL
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 18,
                letterSpacing: "0.3em",
                color: "rgba(242,239,233,0.55)",
              }}
            >
              ARCHIVO PARANORMAL — CLASIFICADO
            </div>
          </Panel>
        </div>

        {/* ---- Tarjeta B: Fotos + Eric Knudsen ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            opacity: cardB,
            transform: `translateY(${slideB}px)`,
          }}
        >
          <Panel
            style={{
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              paddingTop: 18,
            }}
          >
            {/* Encabezado de foro / terminal vintage */}
            <div
              style={{
                alignSelf: "stretch",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(4,5,7,0.9)",
                border: "1px solid rgba(43,58,66,0.8)",
                padding: "10px 18px",
                fontFamily: MONO,
                fontSize: 20,
                letterSpacing: "0.1em",
              }}
            >
              <span style={{ color: "rgba(34,211,238,0.85)" }}>
                SOMETHING AWFUL // FORO
              </span>
              <span style={{ color: "rgba(242,239,233,0.5)" }}>12 JUN 2009</span>
            </div>

            <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
              <VintagePhoto label="FOTO #01" rotate={-2.2} />
              <VintagePhoto label="FOTO #02" rotate={2} lurker />
            </div>

            <Flicker
              frame={frame}
              seed={7}
              style={{
                border: "2px solid rgba(253,224,71,0.7)",
                color: "#FDE047",
                fontFamily: MONO,
                fontSize: 26,
                letterSpacing: "0.24em",
                padding: "8px 26px",
                transform: "rotate(-2deg)",
                textShadow: "0 0 12px rgba(253,224,71,0.3)",
              }}
            >
              ERIC KNUDSEN
            </Flicker>
          </Panel>
        </div>

        {/* ---- Tarjeta C: Collage viral ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            opacity: cardC,
            transform: `translateY(${slideC}px)`,
          }}
        >
          <Panel
            style={{
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
            }}
          >
            {/* Etiqueta de casete found-footage parpadeante */}
            <Flicker
              frame={frame}
              seed={11}
              style={{
                fontFamily: MONO,
                fontSize: 20,
                letterSpacing: "0.22em",
                color: "#FDE047",
                border: "1px dashed rgba(253,224,71,0.5)",
                padding: "8px 22px",
              }}
            >
              ▶ FOUND FOOTAGE — CINTA #09
            </Flicker>

            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {/* Nota de diario rasgada */}
              <div
                style={{
                  width: 300,
                  background: "#0F141A",
                  border: "1px dashed rgba(242,239,233,0.25)",
                  clipPath: "polygon(1% 0%, 99% 3%, 100% 96%, 2% 100%)",
                  padding: "22px 24px",
                  transform: "rotate(-1.4deg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: HANDWRITING,
                    fontSize: 30,
                    color: "#F2EFE9",
                    transform: "rotate(-1deg)",
                  }}
                >
                  NO LO MIRES
                </div>
                <div
                  style={{
                    fontFamily: HANDWRITING,
                    fontSize: 30,
                    color: "#DC2626",
                    transform: "rotate(0.8deg)",
                  }}
                >
                  8 PÁGINAS
                </div>
                <div
                  style={{
                    fontFamily: HANDWRITING,
                    fontSize: 30,
                    color: "#FDE047",
                    transform: "rotate(-0.6deg)",
                  }}
                >
                  EL OPERADOR
                </div>
              </div>

              {/* Red de conexión carmesí */}
              <div style={{ width: 440 }}>
                <ConnectionWeb frame={frame} />
              </div>
            </div>

            <div
              style={{
                fontFamily: IMPACT,
                fontSize: 30,
                letterSpacing: "0.1em",
                color: "#DC2626",
                textShadow: "0 0 16px rgba(220,38,38,0.55), 0 2px 0 rgba(4,5,7,0.9)",
              }}
            >
              LEYENDA DEL TERROR DIGITAL
            </div>
          </Panel>
        </div>
      </div>
    </AbsoluteFill>
  );
};
