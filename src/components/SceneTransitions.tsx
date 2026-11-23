import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SCENES, SFX_CUES } from "../data/episodeConfig";
import { flashEnvelope } from "./Camera25D";

/**
 * SceneTransitions — Transiciones cinematográficas continuas estilo
 * Kurzgesagt oscuro (CERO cortes secos) sobre las fronteras exactas de las 6
 * escenas. Cada ventana dura ~22–28 frames centrada en el límite de escena
 * para ocultar cualquier corte seco.
 *
 *  1. Flash de cámara dentro de Escena 1 (SFX_CUES.cameraShutterFrame).
 *  2. 1→2 (SCENES.scene2.start): zoom-through por lente/visor de cámara.
 *  3. 2→3 (SCENES.scene3.start): losa monolítica de basalto deslizante.
 *  4. 3→4 (SCENES.scene4.start): aislamiento por cono de luz (spotlight).
 *  5. 4→5 (SCENES.scene5.start): zoom-through por cristal de ventana.
 *  6. 5→6 (SCENES.scene6.start): divisor diagonal luminoso cobalto/abisal.
 */

/** Progreso 0→1 de una ventana centrada en `center` con semi-ancho `half`. */
const winProg = (frame: number, center: number, half: number): number =>
  interpolate(frame, [center - half, center + half], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Retícula fugaz de visor digital (postimagen del flash). */
const Reticle: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    width="1080"
    height="1920"
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, opacity }}
  >
    <g stroke="rgba(34,211,238,0.85)" strokeWidth={2} fill="none">
      <line x1={540} y1={840} x2={540} y2={1080} />
      <line x1={420} y1={960} x2={660} y2={960} />
    </g>
    <circle cx={540} cy={960} r={210} fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
    <g stroke="rgba(242,239,233,0.7)" strokeWidth={3} fill="none">
      <path d="M 300 760 L 340 760 L 340 800" />
      <path d="M 780 760 L 740 760 L 740 800" />
      <path d="M 300 1160 L 340 1160 L 340 1120" />
      <path d="M 780 1160 L 740 1160 L 740 1120" />
    </g>
    <circle cx={540} cy={960} r={5} fill="#22D3EE" />
  </svg>
);

/** Losa monolítica de basalto con arista cincelada y luz de borde azul fría. */
const BasaltSlab: React.FC<{ x: number }> = ({ x }) => (
  <div style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1120 }}>
    <svg width="1120" height="1920" viewBox="0 0 1120 1920" style={{ display: "block" }}>
      <defs>
        <linearGradient id="st-basalt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06080C" />
          <stop offset="55%" stopColor="#0B0F16" />
          <stop offset="100%" stopColor="#040507" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1120" height="1920" fill="url(#st-basalt)" />
      <g stroke="#131A24" strokeWidth={1.5} fill="none" opacity={0.5}>
        <path d="M 60 0 C 90 400, 70 900, 110 1920" />
        <path d="M 300 0 C 280 500, 320 1100, 290 1920" />
        <path d="M 600 0 C 620 450, 590 1000, 630 1920" />
        <path d="M 900 0 C 880 600, 920 1200, 890 1920" />
      </g>
      <rect x="0" y="0" width="46" height="1920" fill="#151D28" />
      <path d="M 46 0 L 78 0 L 60 1920 L 30 1920 Z" fill="#0A0E15" />
      <rect x="0" y="0" width="6" height="1920" fill="#2B4A8C" opacity={0.85} />
      <rect x="0" y="0" width="2" height="1920" fill="#60A5FA" opacity={0.6} />
    </svg>
  </div>
);

/** Aislamiento por cono de luz: velo de siluetas + haz volumétrico cónico. */
const SpotlightIsolation: React.FC<{ veil: number; coneW: number }> = ({ veil, coneW }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(2,3,5,0.9) 75%, #020306 100%)",
        opacity: veil,
      }}
    />
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="st-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9FC6E8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9FC6E8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${540 - coneW / 2},420 ${540 + coneW / 2},420 680,1580 400,1580`}
        fill="url(#st-cone)"
        opacity={1 - veil * 0.4}
      />
    </svg>
    <div
      style={{
        position: "absolute",
        top: 400,
        left: 540 - 14,
        width: 28,
        height: 40,
        background: "#BFD7EC",
        borderRadius: "0 0 8px 8px",
        boxShadow: "0 0 40px rgba(159,198,232,0.9)",
      }}
    />
  </AbsoluteFill>
);

/** Marcos de madera y reflejos diagonales de vidrio que escalan rápido. */
const WindowGlass: React.FC<{ scale: number }> = ({ scale }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      width: 900,
      height: 1400,
      transform: `translate(-50%, -50%) scale(${scale})`,
    }}
  >
    <svg width="900" height="1400" viewBox="0 0 900 1400" style={{ display: "block" }}>
      <defs>
        <linearGradient id="st-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#162129" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#04070C" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="900" height="1400" rx="14" fill="#1A150E" />
      <rect x="26" y="26" width="848" height="1348" fill="url(#st-glass)" />
      <rect x="26" y="440" width="848" height="40" fill="#241C10" />
      <rect x="26" y="920" width="848" height="40" fill="#241C10" />
      <rect x="430" y="26" width="40" height="1348" fill="#241C10" />
      <g stroke="rgba(34,211,238,0.25)" strokeWidth={14} fill="none">
        <path d="M 40 60 L 430 460" />
        <path d="M 60 240 L 560 760" />
        <path d="M 60 900 L 300 1200" />
        <path d="M 470 60 L 860 460" />
      </g>
      <g stroke="rgba(220,240,255,0.12)" strokeWidth={6} fill="none">
        <path d="M 40 160 L 560 720" />
        <path d="M 500 100 L 860 500" />
      </g>
    </svg>
  </div>
);

/** Divisor diagonal luminoso cobalto/abisal que barre y se fija en el centro. */
const DiagonalDivider: React.FC<{ x: number }> = ({ x }) => (
  <AbsoluteFill>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <line x1={x - 900} y1="0" x2={x + 900} y2="1920" stroke="#1D4ED8" strokeWidth={7} />
      <line x1={x - 900} y1="0" x2={x + 900} y2="1920" stroke="#60A5FA" strokeWidth={2} />
      <line
        x1={x - 900}
        y1="0"
        x2={x + 900}
        y2="1920"
        stroke="rgba(29,78,216,0.5)"
        strokeWidth={26}
        opacity={0.4}
      />
    </svg>
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: x,
        right: 0,
        background: "#040507",
        opacity: 0.75,
      }}
    />
  </AbsoluteFill>
);

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- 1. Flash de cámara dentro de Escena 1 ----
  const flash = flashEnvelope(frame, SFX_CUES.cameraShutterFrame, 16, 1);
  const flashAfter =
    frame >= SFX_CUES.cameraShutterFrame + 2 &&
    frame <= SFX_CUES.cameraShutterFrame + 24
      ? interpolate(
          frame,
          [SFX_CUES.cameraShutterFrame + 2, SFX_CUES.cameraShutterFrame + 24],
          [0.22, 0]
        )
      : 0;
  const reticle =
    frame >= SFX_CUES.cameraShutterFrame &&
    frame <= SFX_CUES.cameraShutterFrame + 18
      ? interpolate(
          frame,
          [SFX_CUES.cameraShutterFrame, SFX_CUES.cameraShutterFrame + 5, SFX_CUES.cameraShutterFrame + 18],
          [0, 0.85, 0]
        )
      : 0;

  // ---- 2. Zoom-through por lente/visor (1→2) ----
  const t1 = winProg(frame, SCENES.scene2.start, 14);
  const holeR = interpolate(t1, [0, 1], [36, 1560]);
  const ringW = interpolate(t1, [0, 1], [140, 18]);
  const ringAlpha = interpolate(t1, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // ---- 3. Losa de piedra negra (2→3) ----
  const t2 = winProg(frame, SCENES.scene3.start, 13);
  const slabX = interpolate(t2, [0, 1], [1120, -1120]);

  // ---- 4. Aislamiento por cono de luz (3→4) ----
  const t3 = winProg(frame, SCENES.scene4.start, 14);
  const veil = interpolate(t3, [0, 0.5, 1], [0, 0.86, 0]);
  const coneW = interpolate(t3, [0, 0.5, 1], [540, 120, 540]);

  // ---- 5. Zoom-through por cristal de ventana (4→5) ----
  const t4 = winProg(frame, SCENES.scene5.start, 13);
  const glassScale = interpolate(t4, [0, 1], [0.6, 3.4]);

  // ---- 6. Divisor diagonal luminoso (5→6) ----
  const t5 = winProg(frame, SCENES.scene6.start, 13);
  const diagX = interpolate(t5, [0, 0.5, 1], [1180, 540, 540]);

  // Envolventes de opacidad para que los overlays entren y desaparezcan a 0%
  // sin dejar artefactos fuera de su ventana (~26-28 frames).
  const fade3 = interpolate(t3, [0, 0.16, 0.84, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade5 = interpolate(t5, [0, 0.16, 0.84, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {/* 1. Flash de cámara */}
      {flash > 0.004 ? <AbsoluteFill style={{ background: "#F7FAFD", opacity: flash }} /> : null}
      {flashAfter > 0.004 ? <AbsoluteFill style={{ background: "#B9D4EC", opacity: flashAfter }} /> : null}
      {reticle > 0.004 ? <Reticle opacity={reticle} /> : null}

      {/* 2. Zoom-through por lente/visor */}
      {t1 > 0.004 && t1 < 0.996 ? (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="st-lens-mask">
              <rect width="1080" height="1920" fill="white" />
              <circle cx="540" cy="960" r={holeR} fill="black" />
            </mask>
          </defs>
          <rect width="1080" height="1920" fill="#040507" mask="url(#st-lens-mask)" />
          <circle cx="540" cy="960" r={holeR} fill="none" stroke="#0B0F16" strokeWidth={ringW} opacity={ringAlpha} />
          <circle cx="540" cy="960" r={holeR + ringW * 0.5} fill="none" stroke="#22D3EE" strokeWidth={2.5} opacity={ringAlpha * 0.7} />
          <circle cx="540" cy="960" r={holeR} fill="none" stroke="#22D3EE" strokeWidth={1.5} opacity={ringAlpha * 0.5} />
        </svg>
      ) : null}

      {/* 3. Losa de piedra negra */}
      {t2 > 0.004 && t2 < 0.996 ? <BasaltSlab x={slabX} /> : null}

      {/* 4. Aislamiento por cono de luz */}
      {t3 > 0.004 && t3 < 0.996 ? (
        <div style={{ position: "absolute", inset: 0, opacity: fade3 }}>
          <SpotlightIsolation veil={veil} coneW={coneW} />
        </div>
      ) : null}

      {/* 5. Zoom-through por cristal de ventana */}
      {t4 > 0.004 && t4 < 0.996 ? <WindowGlass scale={glassScale} /> : null}

      {/* 6. Divisor diagonal luminoso */}
      {t5 > 0.004 && t5 < 0.996 ? (
        <div style={{ position: "absolute", inset: 0, opacity: fade5 }}>
          <DiagonalDivider x={diagX} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
