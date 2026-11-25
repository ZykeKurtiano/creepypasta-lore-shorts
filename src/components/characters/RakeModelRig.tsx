import React, { useId } from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";

/**
 * RakeModelRig — Puppet-Rig 2.5D de alta calidad para los 3 modelos RGBA
 * transparentes de The Rake (fal.ai flux/dev + birefnet/v2).
 *
 * Envuelve cada PNG con:
 *  - respiración orgánica irregular (scaleY + translateY, dos ondas),
 *  - espasmos/temblores biomecánicos puntuales (rotate + micro translate),
 *  - rim light direccional 360° con doble drop-shadow (borde lumínico +
 *    sombra de volumen profunda),
 *  - sombra elíptica de contacto en el suelo (floorY),
 *  - ojos brillantes dinámicos en SVG superpuestos EXACTAMENTE sobre las
 *    cuencas relativas de cada variante, acoplados al mismo transform del
 *    cuerpo para que nunca se despeguen.
 *
 * Animación 100% determinista (useCurrentFrame + random(seed)).
 */

export type RakeVariant = "crouched" | "closeup_claws" | "lunge";

interface EyeSpec {
  /** % del ancho natural del modelo */
  x: number;
  /** % del alto natural del modelo */
  y: number;
}

interface RigSpec {
  src: string;
  width: number; // px naturales del PNG
  height: number; // px naturales del PNG
  eyes: EyeSpec[];
}

const RIGS: Record<RakeVariant, RigSpec> = {
  crouched: {
    src: "models/rake_crouched.png",
    width: 804,
    height: 1164,
    eyes: [
      { x: 50.5, y: 17.2 },
      { x: 58.2, y: 17.5 },
    ],
  },
  closeup_claws: {
    src: "models/rake_closeup_claws.png",
    width: 998,
    height: 1164,
    eyes: [
      { x: 45.2, y: 20.6 },
      { x: 54.6, y: 20.6 },
    ],
  },
  lunge: {
    src: "models/rake_lunge.png",
    width: 953,
    height: 1252,
    eyes: [{ x: 21.8, y: 33.8 }],
  },
};

export interface RakeModelRigProps {
  variant: RakeVariant;
  /** Ancho del modelo en px; el alto se deriva del aspect ratio nativo. */
  width: number;
  /** Centro horizontal absoluto (opcional). */
  x?: number;
  /** Base en el suelo (floorY) absoluta (opcional). */
  y?: number;
  scale?: number;
  flipX?: boolean;
  opacity?: number;
  /** Intensidad de la respiración orgánica (default 1). */
  breathingIntensity?: number;
  /** Intensidad de espasmos/temblores biomecánicos (default 0). */
  spasmIntensity?: number;
  /** Brillo ocular 0..1 (default 0.75). */
  eyeGlow?: number;
  eyeColor?: string;
  rimColor?: string;
  showFloorShadow?: boolean;
  brightness?: number;
  contrast?: number;
}

export const RakeModelRig: React.FC<RakeModelRigProps> = ({
  variant,
  width,
  x,
  y,
  scale = 1,
  flipX = false,
  opacity = 1,
  breathingIntensity = 1,
  spasmIntensity = 0,
  eyeGlow = 0.75,
  eyeColor = "#F8FAFC",
  rimColor = "rgba(148, 197, 255, 0.45)",
  showFloorShadow = true,
  brightness = 0.92,
  contrast = 1.08,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const rig = RIGS[variant];
  const aspect = rig.width / rig.height;
  const height = width / aspect;

  // Solo absoluto si se especifican x e y (base en y = floorY).
  const hasAbs = typeof x === "number" && typeof y === "number";

  // --- Respiración orgánica irregular (dos ondas sinusoidales suaves) ---
  const waveA = Math.sin(frame * 0.09);
  const waveB = Math.sin(frame * 0.043 + 1.7);
  const breathe =
    1 + (waveA * 0.55 + waveB * 0.45) * 0.014 * breathingIntensity;
  const breatheY =
    (waveA * 0.5 + Math.sin(frame * 0.06 + 0.8) * 0.5) *
    1.6 *
    breathingIntensity;

  // --- Espasmos / temblores biomecánicos motivados (spasmIntensity > 0) ---
  const spasm = Math.max(0, spasmIntensity);
  const spasmRot =
    (Math.sin(frame * 0.9) * 0.55 + Math.sin(frame * 1.7 + 2.1) * 0.45) *
    1.8 *
    spasm;
  const spasmX =
    Math.sin(frame * 1.3 + 1.1) * 1.7 * spasm +
    (random(Math.floor(frame / 3) * 13 + 7) - 0.5) * 1.4 * spasm;
  const spasmY =
    Math.cos(frame * 1.1 + 0.4) * 1.1 * spasm +
    (random(Math.floor(frame / 2) * 29 + 3) - 0.5) * 1.0 * spasm;

  const sx = flipX ? -1 : 1;

  // Parpadeo orgánico + shimmer por ojo.
  const eyeFlicker = 0.9 + 0.1 * Math.sin(frame * 0.21 + 1.2);

  const bodyTransform = `translate(${(spasmX).toFixed(2)}px, ${(
    breatheY + spasmY
  ).toFixed(2)}px) rotate(${spasmRot.toFixed(2)}deg) scale(${sx}, ${breathe.toFixed(
    4
  )})`;

  // Rim light 360°: doble drop-shadow (borde lumínico + volumen profundo).
  const imgFilter = `brightness(${brightness}) contrast(${contrast}) drop-shadow(0 0 22px ${rimColor}) drop-shadow(0 28px 44px rgba(0,0,0,0.85))`;

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
      {/* Cuerpo + ojos acoplados al MISMO transform (nunca se despegan). */}
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

        {/* Ojos brillantes SVG superpuestos sobre las cuencas relativas. */}
        <svg
          viewBox={`0 0 ${rig.width} ${rig.height}`}
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id={`${uid}-rake-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={eyeColor} stopOpacity={0.5} />
              <stop offset="55%" stopColor={eyeColor} stopOpacity={0.18} />
              <stop offset="100%" stopColor={eyeColor} stopOpacity={0} />
            </radialGradient>
          </defs>
          {rig.eyes.map((eye, i) => {
            const cx = (eye.x / 100) * rig.width;
            const cy = (eye.y / 100) * rig.height;
            const phase = i * 2.4;
            // Parpadeo orgánico breve y suave.
            const blink =
              1 - Math.pow(Math.max(0, Math.sin(frame * 0.05 + phase)), 20);
            const intensity = Math.max(
              0,
              Math.min(1, eyeGlow * blink * eyeFlicker)
            );

            // Cuencas negras vacías (closeup): solo un destello especular frío.
            const isCloseup = variant === "closeup_claws";
            // Núcleo diminuto y afilado, incrustado en la cuenca.
            const coreR = isCloseup
              ? rig.width * 0.005 // 0.5% — micro destello especular frío
              : rig.width * 0.0075; // 0.75% — ~4–7px en pantalla
            // Halo radial exterior suave y translúcido (nunca disco opaco).
            const haloR = rig.width * 0.026; // 2.6%
            const haloOpacity = isCloseup ? 0.35 : 0.38;

            // Micro-drift del núcleo (tracking vivo, no mecánico).
            const driftX = Math.sin(frame * 0.07 + i * 1.7) * coreR * 0.12;
            const driftY = Math.cos(frame * 0.05 + i * 2.1) * coreR * 0.12;
            return (
              <g key={i} opacity={intensity.toFixed(3)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={haloR}
                  fill={`url(#${uid}-rake-glow)`}
                  opacity={haloOpacity}
                  style={{ mixBlendMode: "screen" }}
                />
                <circle
                  cx={cx + driftX}
                  cy={cy + driftY}
                  r={coreR}
                  fill={eyeColor}
                  opacity={isCloseup ? 0.32 : 0.9}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Sombra elíptica de contacto anclada al suelo. */}
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
