import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { JackNyrasCharacter } from "../components/characters/JackNyrasCharacter";
import { CultistCharacter } from "../components/characters/CultistCharacter";
import { FONT_MONO } from "../components/SafeZone";

/**
 * Scene2Origins2009 (frames 1023–1489, ~15.5s) — DeviantArt 2009 y los Tres Orígenes.
 *
 * Apertura tipo visor/archivo fotográfico de 2009 que se despliega mediante
 * spring() en 3 paneles horizontales/diagonales animados en paralelo dentro de
 * la zona y: 330..1195 (siempre por encima de los subtítulos en y: 1235).
 * CERO tarjetas estáticas: cada panel es una escena 2.5D ilustrada.
 */

/** Ilustración en alto contraste de la máscara azul en penumbra. */
const BlueMaskArchive: React.FC<{ glow: number }> = ({ glow }) => (
  <svg viewBox="0 0 320 380" width="100%" height="100%">
    <defs>
      <linearGradient id="s2-mask" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="55%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
    </defs>
    <path
      d="M 128 110 C 130 60, 190 60, 192 110 C 198 150, 195 190, 186 230 C 180 258, 140 258, 134 230 C 125 190, 122 150, 128 110 Z"
      fill="url(#s2-mask)"
      opacity={0.9}
    />
    <path d="M 128 150 C 134 132, 152 132, 158 152 C 152 172, 134 172, 128 150 Z" fill="#020306" />
    <path d="M 162 150 C 168 132, 186 132, 192 152 C 186 172, 168 172, 162 150 Z" fill="#020306" />
    <path d="M 132 116 C 138 138, 136 158, 128 176" stroke="#060A14" strokeWidth={1.4} fill="none" />
    <path d="M 188 230 C 185 212, 188 194, 196 176" stroke="#060A14" strokeWidth={1.4} fill="none" />
    <path d="M 158 100 C 160 116, 158 132, 154 146" stroke="#060A14" strokeWidth={1.2} fill="none" />
    <path d="M 130 116 C 128 92, 156 82, 172 82" stroke="#60A5FA" strokeWidth={2.2} fill="none" opacity={0.6 * glow} />
  </svg>
);

export const Scene2Origins2009: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Apertura: despliegue suave del visor 2009 y salida hacia los paneles.
  const archivePop = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 110 },
  });
  const archiveOut = interpolate(frame, [100, 122], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Entrada escalonada rápida de los 3 paneles (frames 110, 122, 134).
  const p1In = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2In = interpolate(frame, [122, 142], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3In = interpolate(frame, [134, 154], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Activación (iluminación + push-in) del panel narrado en cada ventana.
  const p1Active = interpolate(frame, [130, 145, 280, 295], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2Active = interpolate(frame, [280, 295, 380, 395], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3Active = interpolate(frame, [380, 395, 466, 480], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Los 3 paneles permanecen vivos y visibles (opacidad >= 0.52); el panel
  // narrado en ese instante se ilumina a 1.0 con borde luminoso y push-in.
  const p1 = p1In * (0.52 + 0.48 * p1Active);
  const p2 = p2In * (0.52 + 0.48 * p2Active);
  const p3 = p3In * (0.52 + 0.48 * p3Active);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #06080C 0%, #0A1014 50%, #040507 100%)",
        }}
      />

      {/* Apertura: visor/archivo fotográfico 2009 */}
      {archiveOut > 0.01 ? (
        <AbsoluteFill
          style={{
            opacity: archiveOut,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 560,
              height: 720,
              background: "#0A0D12",
              border: "2px solid rgba(43,58,66,0.9)",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              transform: `scale(${0.9 + archivePop * 0.1})`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 44,
                background: "#10151C",
                borderBottom: "1px solid rgba(43,58,66,0.6)",
                display: "flex",
                alignItems: "center",
                paddingInline: 18,
                gap: 8,
                fontFamily: FONT_MONO,
                fontSize: 13,
                letterSpacing: 1,
                color: "#9FB4C8",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 5, background: "#DC2626", opacity: 0.7 }} />
              <span>2009 // ARCHIVE</span>
            </div>
            <div
              style={{
                position: "absolute",
                top: 44,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(ellipse at 50% 46%, #0F1520, #05070C 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 340, height: 420, opacity: 0.95 }}>
                <BlueMaskArchive glow={archivePop} />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 4px)",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== PANEL 1: Soldado WW2 (activo frames 130–280) ===== */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 60,
          right: 60,
          height: 265,
          overflow: "hidden",
          borderRadius: 16,
          border: "1.5px solid rgba(93,102,64,0.7)",
          boxShadow: `0 0 ${20 * p1Active}px rgba(110,123,76,${0.35 * p1Active})`,
          opacity: p1,
          transform: `translateX(${(1 - p1In) * -60}px) scale(${1 + 0.025 * p1Active})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0C1208, #080C06)" }} />
        <svg viewBox="0 0 960 270" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <g opacity={0.55}>
            <path d="M 0 220 C 80 170, 170 190, 260 160 C 340 132, 420 150, 520 130 C 620 110, 700 140, 820 120 C 900 108, 950 130, 960 120 L 960 270 L 0 270 Z" fill="#3E4A26" />
            <path d="M 0 240 C 120 200, 260 220, 400 190 C 540 160, 680 190, 820 170 C 900 158, 950 170, 960 168 L 960 270 L 0 270 Z" fill="#2A3416" />
            <path d="M 60 200 C 140 180, 200 190, 280 172 C 360 154, 440 170, 520 156 C 620 140, 720 160, 800 148" stroke="#6B7A3C" strokeWidth={14} fill="none" opacity={0.3} />
          </g>
        </svg>
        <svg viewBox="0 0 960 270" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <path d="M 0 60 C 200 40, 400 80, 600 56 C 720 42, 840 62, 960 50" stroke="#151A0C" strokeWidth={3} fill="none" />
          <path d="M 0 60 C 200 40, 400 80, 600 56 C 720 42, 840 62, 960 50" stroke="#2E3A18" strokeWidth={1.2} fill="none" />
          {[90, 260, 430, 600, 770].map((xx, i) => (
            <circle key={i} cx={xx} cy={52 + (i % 2) * 10} r={7} stroke="#2E3A18" strokeWidth={1.4} fill="none" />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 60,
            width: 120,
            height: 46,
            background: "#12160C",
            borderRadius: 6,
            border: "1px solid #2E3A18",
          }}
        >
          <div style={{ position: "absolute", top: 12, left: -40, width: 44, height: 20, background: "rgba(222,236,200,0.12)", transform: "skewX(-18deg)", filter: "blur(2px)" }} />
          <div style={{ position: "absolute", top: 16, left: 30, width: 24, height: 14, background: "#E8F2D0", borderRadius: 3, boxShadow: "0 0 18px rgba(232,242,208,0.8)", opacity: 0.85 }} />
        </div>
        <JackNyrasCharacter x={330} floorY={400} scale={0.7} variant="ww2_soldier" pose="gas_stagger" localFrame={frame} />
      </div>

      {/* ===== PANEL 2: Tragedia del hermano cirujano (activo frames 280–380) ===== */}
      <div
        style={{
          position: "absolute",
          top: 625,
          left: 60,
          right: 60,
          height: 265,
          overflow: "hidden",
          borderRadius: 16,
          border: "1.5px solid rgba(70,84,95,0.7)",
          boxShadow: `0 0 ${20 * p2Active}px rgba(70,84,95,${0.35 * p2Active})`,
          opacity: p2,
          transform: `translateX(${(1 - p2In) * 60}px) scale(${1 + 0.025 * p2Active})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #10161C, #0A0F14)" }} />
        {/* Lámpara quirúrgica oscilante */}
        <div style={{ position: "absolute", top: 0, left: 120, width: 6, height: 120, background: "#1A222B" }}>
          <div
            style={{
              position: "absolute",
              top: 120,
              left: -60,
              width: 126,
              height: 30,
              background: "#2B3946",
              borderRadius: 16,
              boxShadow: "0 8px 30px rgba(159,198,232,0.25)",
              transform: `rotate(${Math.sin(frame * 0.04) * 6}deg)`,
              transformOrigin: "60px 0",
            }}
          >
            <div style={{ position: "absolute", bottom: -26, left: 22, width: 82, height: 26, background: "radial-gradient(ellipse at center, rgba(159,198,232,0.4), transparent 70%)", filter: "blur(3px)" }} />
          </div>
        </div>
        {/* Mesa metálica + silueta de bisturí */}
        <svg viewBox="0 0 960 270" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <path d="M 640 230 L 640 210 L 900 210 L 900 230 Z" fill="#151B22" />
          <path d="M 660 210 L 656 150" stroke="#7C8794" strokeWidth={3} />
          <path d="M 656 150 C 700 148, 740 146, 770 148 C 748 152, 708 154, 668 152 Z" fill="#C8D2DC" />
        </svg>
        {/* Reflejo de la máscara azul */}
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 90,
            width: 110,
            height: 130,
            background: "radial-gradient(ellipse at center, rgba(29,78,216,0.35), transparent 70%)",
            filter: "blur(4px)",
          }}
        >
          <BlueMaskArchive glow={0.6} />
        </div>
        <JackNyrasCharacter x={350} floorY={400} scale={0.7} variant="surgeon_brother" pose="standing_agony" localFrame={frame} />
      </div>

      {/* ===== PANEL 3: Culto en el bosque (activo frames 380–466) ===== */}
      <div
        style={{
          position: "absolute",
          top: 910,
          left: 60,
          right: 60,
          height: 265,
          overflow: "hidden",
          borderRadius: 16,
          border: "1.5px solid rgba(92,19,24,0.75)",
          boxShadow: `0 0 ${20 * p3Active}px rgba(184,65,30,${0.35 * p3Active})`,
          opacity: p3,
          transform: `translateY(${(1 - p3In) * 40}px) scale(${1 + 0.025 * p3Active})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0A0E12, #06080A)" }} />
        <svg viewBox="0 0 960 280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <path d="M 120 280 L 150 120 L 180 280 Z" fill="#04060A" />
          <path d="M 820 280 L 850 100 L 880 280 Z" fill="#04060A" />
          <path d="M 60 280 L 90 160 L 120 280 Z" fill="#05080C" />
        </svg>
        <CultistCharacter x={310} floorY={400} scale={0.7} facing={1} pose="hold_torch" localFrame={frame} />
        <CultistCharacter x={650} floorY={400} scale={0.7} facing={-1} pose="hold_torch" localFrame={frame} />
        <JackNyrasCharacter x={480} floorY={400} scale={0.7} variant="university_victim" pose="standing_agony" localFrame={frame} />
      </div>
    </AbsoluteFill>
  );
};
