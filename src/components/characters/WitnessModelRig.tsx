import React, { useId } from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";

/**
 * WitnessModelRig — Puppet-Rig 2.5D para los 3 modelos RGBA humanos/mutantes
 * de la serie (fal.ai flux/dev + birefnet/v2):
 *  - "bed_panic"        : testigo en pánico en la cama,
 *  - "recorder"         : testigo con grabadora nocturna,
 *  - "patient_mutated"  : paciente transformado por el parásito.
 *
 * Incluye:
 *  - respiración agitada orgánica (scaleY + micro-oscilación de hombros),
 *  - pánico (panicLevel) que acelera la respiración torácica y añade
 *    micro-temblor ansioso,
 *  - sobresalto (startleProgress) hacia atrás/arriba,
 *  - rim light 360° con drop-shadow + integración tonal nocturna,
 *  - overlays SVG acoplados al mismo contenedor transformado:
 *      reflejo lunar en ojos (bed_panic), destello LED/pantalla de
 *      grabadora con ondas concéntricas (recorder), venas/ojos
 *      oscureciéndose + brillo clínico (patient_mutated).
 *
 * Animación 100% determinista (useCurrentFrame + random(seed)).
 */

export type WitnessVariant = "bed_panic" | "recorder" | "patient_mutated";

interface EyeSpec {
  x: number; // % del ancho natural
  y: number; // % del alto natural
}

interface WitnessRigSpec {
  src: string;
  width: number;
  height: number;
  eyes: EyeSpec[];
  recorderScreen?: { x: number; y: number };
  hands?: { x: number; y: number };
}

const RIGS: Record<WitnessVariant, WitnessRigSpec> = {
  bed_panic: {
    src: "models/witness_bed_panic.png",
    width: 1011,
    height: 1269,
    eyes: [
      { x: 42.5, y: 31.2 },
      { x: 56.2, y: 30.8 },
    ],
  },
  recorder: {
    src: "models/witness_recorder.png",
    width: 930,
    height: 1280,
    eyes: [
      { x: 40.5, y: 29.0 },
      { x: 54.5, y: 29.0 },
    ],
    recorderScreen: { x: 31.5, y: 63.5 },
  },
  patient_mutated: {
    src: "models/patient_mutated.png",
    width: 821,
    height: 1268,
    eyes: [
      { x: 41.8, y: 18.2 },
      { x: 51.2, y: 18.0 },
    ],
    hands: { x: 68, y: 52 },
  },
};

export interface WitnessModelRigProps {
  variant: WitnessVariant;
  /** Ancho del modelo en px; el alto se deriva del aspect ratio nativo. */
  width: number;
  /** Centro horizontal absoluto (opcional). */
  x?: number;
  /** Base en el suelo (floorY) absoluta (opcional). */
  y?: number;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
  /** 0..1 — acelera respiración torácica y micro-temblor ansioso. */
  panicLevel?: number;
  /** 0..1 — sobresalto hacia atrás/arriba. */
  startleProgress?: number;
  /** 0..1 — pulso luminoso cian/rojo en la pantalla de la grabadora. */
  recorderPulse?: number;
  /** 0..1 — oscurecimiento y brillo frío en las cuencas negras. */
  mutationEyeDarkness?: number;
  rimColor?: string;
  showFloorShadow?: boolean;
  brightness?: number;
  contrast?: number;
}

export const WitnessModelRig: React.FC<WitnessModelRigProps> = ({
  variant,
  width,
  x,
  y,
  scale = 1,
  flipX = false,
  opacity = 1,
  panicLevel = 0,
  startleProgress = 0,
  recorderPulse = 0,
  mutationEyeDarkness = 0,
  rimColor = "rgba(125, 211, 252, 0.42)",
  showFloorShadow = false,
  brightness = 0.9,
  contrast = 1.05,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const rig = RIGS[variant];
  const aspect = rig.width / rig.height;
  const height = width / aspect;

  const hasAbs = typeof x === "number" && typeof y === "number";

  const panic = Math.max(0, Math.min(1, panicLevel));
  const startle = Math.max(0, Math.min(1, startleProgress));
  const recInt = Math.max(0, Math.min(1, recorderPulse));
  const mutDark = Math.max(0, Math.min(1, mutationEyeDarkness));

  // --- Respiración agitada orgánica (el pánico acelera el ritmo) ---
  const freq = 0.1 + panic * 0.16;
  const waveA = Math.sin(frame * freq);
  const waveB = Math.sin(frame * freq * 0.5 + 1.3);
  const breathe =
    1 + (waveA * 0.55 + waveB * 0.45) * (0.012 + panic * 0.022);
  const breatheY =
    Math.sin(frame * freq * 0.9 + 0.7) * (1.2 + panic * 2.2);

  // Micro-oscilación de hombros (ansiedad).
  const shoulderRot =
    Math.sin(frame * (0.5 + panic * 0.7) + 0.4) * (0.3 + panic * 0.8);

  // Micro-temblor ansioso en manos/hombros.
  const tremorX =
    (random(Math.floor(frame / 2) * 11 + 5) - 0.5) * (0.8 + panic * 1.8);
  const tremorY =
    (random(Math.floor(frame / 3) * 17 + 9) - 0.5) * (0.6 + panic * 1.4);

  // Sobresalto hacia atrás/arriba.
  const startleY = -startle * 16;
  const startleX = startle * 2.5;
  const startleRot = startle * 1.2;

  const sx = flipX ? -1 : 1;
  const rot = shoulderRot + startleRot;
  const tx = tremorX + startleX;
  const ty = breatheY + tremorY + startleY;

  const bodyTransform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(
    2
  )}px) rotate(${rot.toFixed(2)}deg) scale(${sx}, ${breathe.toFixed(4)})`;

  // Rim light 360° + integración tonal nocturna (bruma fría de fondo).
  const imgFilter = `brightness(${brightness}) contrast(${contrast}) drop-shadow(0 0 20px ${rimColor}) drop-shadow(0 0 34px rgba(43, 58, 66, 0.35)) drop-shadow(0 26px 40px rgba(0, 0, 0, 0.8))`;

  const shadowScale = 1 + (breathe - 1) * 2.2;

  return (
    <div
      style={{
        position: hasAbs ? "absolute" : "relative",
        left: hasAbs ? (x as number) - width / 2 : undefined,
        top: hasAbs ? (y as number) - height : undefined,
        width,
        height,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "50% 100%",
      }}
    >
      {/* Cuerpo + overlays acoplados al MISMO transform. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 92%",
          transform: bodyTransform,
        }}
      >
        <Img
          src={staticFile(rig.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: imgFilter,
          }}
        />

        <svg
          viewBox={`0 0 ${rig.width} ${rig.height}`}
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id={`${uid}-moon`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F4FBFF" stopOpacity={0.55} />
              <stop offset="60%" stopColor="#BDE3F5" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#BDE3F5" stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${uid}-mut-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity={0.7} />
              <stop offset="55%" stopColor="#22D3EE" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${uid}-mut-dark`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#02040A" stopOpacity={0.85} />
              <stop offset="60%" stopColor="#050B12" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#050B12" stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${uid}-rec-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.8} />
              <stop offset="70%" stopColor="#22D3EE" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* OJOS por variante */}
          {rig.eyes.map((eye, i) => {
            const cx = (eye.x / 100) * rig.width;
            const cy = (eye.y / 100) * rig.height;

            if (variant === "patient_mutated") {
              // Cuencas: solo oscurecimiento sutil + micro-destello clínico.
              const darkOp = mutDark > 0.5 ? (mutDark - 0.5) * 0.5 : 0;
              const glintR = rig.width * 0.0045; // 0.45% — micro-destello clínico
              return (
                <g key={i}>
                  {darkOp > 0.001 ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={rig.width * 0.022}
                      fill="#02040A"
                      opacity={Math.min(0.3, darkOp)}
                    />
                  ) : null}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={glintR}
                    fill="#7DD3FC"
                    opacity={0.4}
                    style={{ mixBlendMode: "screen" }}
                  />
                </g>
              );
            }

            // Micro-reflejo lunar diminuto (bed_panic / recorder).
            const microR = rig.width * 0.0035; // 0.35% — ~2.5–3.5px
            const jx = -microR * 0.5; // arriba-izquierda en la pupila
            const jy = -microR * 0.5;
            return (
              <g key={i}>
                <circle
                  cx={cx + jx}
                  cy={cy + jy}
                  r={microR}
                  fill="#F4FBFF"
                  opacity={0.45}
                  style={{ mixBlendMode: "screen" }}
                />
              </g>
            );
          })}

          {/* PANTALLA DE GRABADORA (variant === "recorder") */}
          {variant === "recorder" && rig.recorderScreen ? (
            (() => {
              const scx = (rig.recorderScreen!.x / 100) * rig.width;
              const scy = (rig.recorderScreen!.y / 100) * rig.height;
              const sw = rig.width * 0.16;
              const sh = rig.height * 0.05;
              const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2);
              const ledR = rig.width * 0.006; // ~4px en pantalla
              return (
                <g>
                  {/* Brillo sutil de pantalla (translúcido, sin tapar la grabadora) */}
                  <rect
                    x={scx - sw / 2}
                    y={scy - sh / 2}
                    width={sw}
                    height={sh}
                    rx={sh * 0.3}
                    fill={`url(#${uid}-rec-glow)`}
                    opacity={recInt * pulse * 0.32}
                    style={{ mixBlendMode: "screen" }}
                  />
                  {/* Punto LED rojo REC parpadeante */}
                  <circle
                    cx={scx - sw * 0.32}
                    cy={scy - sh * 0.5}
                    r={ledR}
                    fill="#EF4444"
                    opacity={recInt * (0.4 + 0.6 * pulse)}
                    style={{ mixBlendMode: "screen" }}
                  />
                  {/* Ondas sonoras concéntricas finas */}
                  {[0, 1, 2].map((k) => {
                    const rr = (frame * 1.2 + k * 40) % 80;
                    const o = (1 - rr / 80) * recInt * 0.5;
                    return (
                      <circle
                        key={k}
                        cx={scx}
                        cy={scy}
                        r={rr + sh * 0.5}
                        fill="none"
                        stroke={k % 2 === 0 ? "#22D3EE" : "#F43F5E"}
                        strokeWidth={1.5}
                        opacity={o}
                      />
                    );
                  })}
                </g>
              );
            })()
          ) : null}

        </svg>
      </div>

      {/* Sombra elíptica de contacto (por defecto desactivada en planos medios). */}
      {showFloorShadow ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -height * 0.015,
            width: width * 0.66,
            height: height * 0.1,
            transform: `translateX(-50%) scale(${shadowScale.toFixed(3)})`,
            transformOrigin: "50% 50%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.7), rgba(0,0,0,0) 68%)",
            filter: "blur(6px)",
          }}
        />
      ) : null}
    </div>
  );
};
