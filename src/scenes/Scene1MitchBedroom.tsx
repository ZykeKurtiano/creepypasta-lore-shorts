import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { MitchCharacter } from "../components/characters/MitchCharacter";
import { EyelessJackCharacter } from "../components/characters/EyelessJackCharacter";
import { flashEnvelope } from "../components/Camera25D";
import { SCENES, SFX_CUES } from "../data/episodeConfig";

/**
 * Scene1MitchBedroom (frames 0–1023, ~34.1s) — La Historia Original: Mitch y Edwin.
 *
 * Dormitorio nocturno en 3 planos (background ventana con luna llena fría,
 * midground cama + Mitch + Eyeless Jack, foreground postes/marco en sombra y
 * polvo). Tres beats fluidos: sobresalto en la cama, revelación de Eyeless
 * Jack, y flash de cámara + escape hacia el pasillo con zoom-through del lente.
 */

const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: 100 + random(i * 3 + 1) * 880,
  y0: 280 + random(i * 7 + 2) * 1000,
  r: 1.6 + random(i * 5 + 3) * 2.2,
  speed: 0.12 + random(i * 9 + 4) * 0.2,
  phase: random(i * 13 + 5) * 300,
}));

/** Cámara digital retro 2012 sostenida por Mitch (centrada en el origen, anclada a su muñeca). */
const CameraProp: React.FC = () => (
  <g>
    <rect x={-24} y={-16} width={48} height={32} rx={5} fill="#171C24" />
    <rect x={-24} y={-16} width={48} height={32} rx={5} fill="none" stroke="#333C48" strokeWidth={1.6} />
    <rect x={-17} y={-23} width={32} height={9} rx={2.5} fill="#202731" />
    <rect x={-17} y={-23} width={32} height={9} rx={2.5} fill="none" stroke="#333C48" strokeWidth={1} />
    <circle cx={17} cy={0} r={11} fill="#0A0D12" />
    <circle cx={17} cy={0} r={7} fill="#1D4ED8" opacity={0.45} />
    <circle cx={15} cy={-2} r={2.2} fill="#22D3EE" opacity={0.9} />
    <rect x={21} y={-1} width={7} height={18} rx={2.5} fill="#0F1218" />
    <path d="M -14 -23 C -14 -32, -2 -32, 0 -27" stroke="#2A333F" strokeWidth={2} fill="none" />
    <circle cx={-20} cy={-12} r={1.4} fill="#22D3EE" opacity={0.5} />
  </g>
);

export const Scene1MitchBedroom: React.FC = () => {
  const frame = useCurrentFrame();
  const localFlashFrame = SFX_CUES.cameraShutterFrame - SCENES.scene1.start;

  // Beat C empieza en 785 (Mitch levanta la cámara).
  const mitchPose = frame >= 785 ? "camera_flash" : "bed_startle";

  // Revelado de Eyeless Jack (Beat B).
  const jackReveal = interpolate(frame, [420, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sombra encapuchada emergiendo junto al pie de la cama (Beat A).
  const shadowEmerg = interpolate(frame, [90, 400], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flash local.
  const flashEnv = flashEnvelope(frame, localFlashFrame, 16, 1);

  // Escape hacia el pasillo tras el flash.
  const escapeProg = interpolate(frame, [810, 960], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mitchX = 470 - escapeProg * 430;
  const mitchOpacity = 1 - escapeProg * 0.85;

  // El lente crece hacia la cámara en los últimos 30 frames.
  const lensGrow = interpolate(frame, [993, 1023], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lensR = interpolate(lensGrow, [0, 1], [40, 1500]);
  const lensRing = interpolate(lensGrow, [0, 1], [90, 24]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* ===== BACKGROUND ===== */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #06080C 0%, #0A1014 55%, #040507 100%)",
        }}
      />

      {/* Ventana con luna llena fría y árboles exteriores */}
      <div style={{ position: "absolute", top: 120, left: 96, width: 300, height: 460 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "6px solid #162129",
            borderRadius: 14,
            background: "#0A1014",
            overflow: "hidden",
          }}
        >
          <svg viewBox="0 0 300 460" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <rect width="300" height="460" fill="url(#s1-sky)" />
            <circle cx={150} cy={120} r={62} fill="#EAF2F8" opacity={0.95} />
            <circle cx={164} cy={108} r={56} fill="#0D1820" opacity={0.16} />
            <path d="M 0 460 L 0 300 L 40 240 L 26 200 L 60 150 L 44 116 L 78 90 L 78 460 Z" fill="#05080C" />
            <path d="M 300 460 L 300 320 L 260 250 L 276 210 L 244 160 L 258 128 L 226 96 L 226 460 Z" fill="#05080C" />
            <path d="M 90 460 L 110 360 L 130 460 Z" fill="#060A0F" opacity={0.8} />
          </svg>
        </div>
        {/* travesaño del marco */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 8,
            background: "#10161C",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Haz de luz volumétrico diagonal desde la ventana */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 260,
          width: 620,
          height: 1180,
          background:
            "linear-gradient(120deg, rgba(150,190,225,0.12), rgba(150,190,225,0.02) 60%, transparent)",
          transform: "skewX(-16deg)",
          opacity: 0.7,
        }}
      />

      {/* ===== MIDGROUND ===== */}
      {/* Cama con cabecera, colchón y sábanas arrugadas */}
      <div style={{ position: "absolute", top: 1080, left: 260, width: 640, height: 200 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -170,
            width: 120,
            height: 370,
            background: "linear-gradient(180deg, #1A222B, #0E141B)",
            borderRadius: "12px 12px 0 0",
            border: "1px solid rgba(150,180,210,0.08)",
          }}
        />
        <div style={{ position: "absolute", left: 14, top: -150, width: 92, height: 330, background: "#131A22", borderRadius: 10 }} />
        <div
          style={{
            position: "absolute",
            left: 120,
            top: -60,
            width: 520,
            height: 150,
            background: "linear-gradient(180deg, #22303C, #16202A)",
            borderRadius: "18px 18px 6px 6px",
          }}
        />
        <div style={{ position: "absolute", left: 150, top: -30, width: 460, height: 90, background: "#1A2631", borderRadius: 10, opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 300, top: 10, width: 220, height: 60, background: "#141E28", borderRadius: 10, transform: "rotate(-3deg)" }} />
        <div style={{ position: "absolute", left: 120, top: 90, width: 520, height: 70, background: "linear-gradient(180deg, #0E141B, #070A0E)" }} />
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 160,
            width: 560,
            height: 34,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)",
          }}
        />
      </div>

      {/* Mesita de noche con lámpara apagada y reloj digital 03:14 (junto a la cabecera, sobre subtítulos) */}
      <div style={{ position: "absolute", top: 1000, left: 130, width: 130, height: 200 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #121820, #0B0F15)", borderRadius: 8 }} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 20,
            width: 90,
            height: 120,
            background: "#05070B",
            borderRadius: 5,
            border: "1px solid rgba(34,211,238,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Consolas, ui-monospace, monospace",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#22D3EE",
            textShadow: "0 0 10px rgba(34,211,238,0.6)",
          }}
        >
          03:14
        </div>
        <div style={{ position: "absolute", top: 148, left: 44, width: 42, height: 42, background: "#0C1116", borderRadius: 21, border: "1px solid rgba(150,180,210,0.1)" }} />
        <div style={{ position: "absolute", top: 190, left: 20, width: 90, height: 10, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)" }} />
      </div>

      {/* Sombra encapuchada emergiendo junto al pie de la cama (Beat A) */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 700,
          width: 260,
          height: 460,
          opacity: shadowEmerg * 0.55,
          transform: `translateY(${(1 - shadowEmerg) * 120}px)`,
        }}
      >
        <svg viewBox="0 0 260 460" width="100%" height="100%" style={{ overflow: "visible" }}>
          <path d="M 130 10 C 90 70, 78 150, 84 220 L 176 220 C 182 150, 170 70, 130 10 Z" fill="#05070C" />
          <path d="M 96 90 C 100 140, 104 180, 112 212 C 104 180, 102 140, 104 92 Z" fill="#030408" />
          <path d="M 164 90 C 160 140, 156 180, 148 212 C 156 180, 158 140, 156 92 Z" fill="#030408" />
          <circle cx={116} cy={150} r={4} fill="#1D4ED8" opacity={0.5} />
          <circle cx={144} cy={150} r={4} fill="#1D4ED8" opacity={0.5} />
        </svg>
      </div>

      {/* Eyeless Jack encapuchado (Beat B/C), agazapado al pie de la cama (máscara ~y 800) */}
      <div style={{ position: "absolute", left: 0, top: 0, opacity: jackReveal }}>
        {/* Charco de icor negro bajo Jack */}
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 1230,
            width: 260,
            height: 60,
            background: "radial-gradient(ellipse at center, rgba(4,5,10,0.85), rgba(4,5,10,0.25) 55%, transparent 75%)",
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 762,
            top: 1228,
            width: 20,
            height: 8,
            background: "rgba(20,26,36,0.7)",
            borderRadius: "50%",
            opacity: 0.8 + Math.sin(frame * 0.4) * 0.2,
          }}
        />
        <EyelessJackCharacter
          x={820}
          floorY={1240}
          scale={1.0}
          pose="crouch_weeping"
          localFrame={frame}
          holdScalpel
          ichorIntensity={0.9 + flashEnv * 0.5}
          rimColor={flashEnv > 0.3 ? "#60A5FA" : "#2B3A42"}
        />
      </div>

      {/* Resplandor azul del flash sobre la máscara de Jack */}
      {flashEnv > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 620,
            top: 600,
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle at 50% 50%, rgba(96,165,250,0.55), rgba(29,78,216,0.25) 55%, transparent 75%)",
            opacity: flashEnv,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Mitch sentado en la cama (piernas ocultas bajo las sábanas, rostro ~y 640..800) */}
      <div style={{ position: "absolute", left: 0, top: 0, opacity: mitchOpacity }}>
        <MitchCharacter
          x={mitchX}
          floorY={1250}
          scale={1.2}
          pose={mitchPose}
          localFrame={frame}
          startleFrame={30}
          flashFrame={localFlashFrame}
          showCheekScar
          showSideBandage
          seatedInBed
          renderPropBetweenArms={frame >= 785 ? <CameraProp /> : undefined}
        />
      </div>

      {/* Pasillo oscuro (escape) */}
      <div
        style={{
          position: "absolute",
          top: 860,
          left: -120 + escapeProg * 40,
          width: 220,
          height: 620,
          background: "linear-gradient(180deg, #04060A, #010204)",
          opacity: 0.4 + escapeProg * 0.6,
          borderRadius: "0 120px 0 0",
        }}
      />

      {/* ===== FOREGROUND ===== */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: -60, width: 120, background: "#020306", filter: "blur(8px)", opacity: 0.9 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: -60, width: 120, background: "#020306", filter: "blur(8px)", opacity: 0.9 }} />

      {/* Polvo flotando en el haz de luz */}
      {DUST.map((d, i) => {
        const y = d.y0 - ((frame * d.speed + d.phase) % 320);
        const op = 0.07 + 0.2 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
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
              opacity: op * (flashEnv > 0.2 ? 1.6 : 1),
              boxShadow: "0 0 6px rgba(190,220,245,0.5)",
            }}
          />
        );
      })}

      {/* Iluminación global del dormitorio en el flash */}
      {flashEnv > 0.01 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 68% 56%, rgba(240,246,255,0.9), rgba(165,195,225,0.25) 55%, transparent 80%)",
            opacity: flashEnv * 0.5,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Lente de cámara creciendo hacia el espectador (últimos 30 frames) */}
      {lensGrow > 0.001 ? (
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <mask id="s1-lens-mask">
              <rect width="1080" height="1920" fill="white" />
              <circle cx="540" cy="960" r={lensR} fill="black" />
            </mask>
          </defs>
          <rect width="1080" height="1920" fill="#040507" mask="url(#s1-lens-mask)" />
          <circle cx="540" cy="960" r={lensR} fill="none" stroke="#0B0F16" strokeWidth={lensRing} />
          <circle cx="540" cy="960" r={lensR + 30} fill="none" stroke="#22D3EE" strokeWidth={2.5} opacity={0.6} />
        </svg>
      ) : null}

      {/* Defs globales del fondo (cielo nocturno) */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="s1-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D1820" />
            <stop offset="100%" stopColor="#0A1014" />
          </linearGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
