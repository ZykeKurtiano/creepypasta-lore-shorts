import React from "react";

/**
 * ikMath.ts — Núcleo matemático del Estándar v5.
 *
 * Cinemática inversa de 2 huesos (ley de cosenos con clamp estricto),
 * locomoción biomecánica con inercia/follow-through, anticipación y
 * sombra elíptica de contacto. 100% determinista (sin Math.random).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface TwoBoneIKResult {
  shoulder: Point2D;
  elbow: Point2D;
  wrist: Point2D;
  /** Ángulo global del brazo superior (grados SVG: 0 = +x, positivo = horario). */
  upperAngleDeg: number;
  /** Flexión del codo (grados): 0 = recto, positivo/negativo según bendDir. */
  lowerAngleDeg: number;
  /** true si el objetivo quedó fuera del alcance y fue clampado. */
  clamped: boolean;
}

const clamp01 = (v: number): number => Math.max(-1, Math.min(1, v));

/**
 * Resuelve un brazo de dos segmentos (shoulder -> elbow -> wrist) que debe
 * alcanzar `target` sin descoyuntarse jamás.
 *
 *  - d se clampa a [|l1 - l2| + 0.01, 0.95 * (l1 + l2)] (maxReach estricto),
 *  - ley de cosenos para el ángulo de hombro y el de codo,
 *  - sin NaN posibles (acos/acos con argumentos clampados y fallback de
 *    dirección cuando el objetivo coincide con el hombro).
 */
export function solveTwoBoneIK(
  shoulder: Point2D,
  target: Point2D,
  l1: number,
  l2: number,
  bendDir: 1 | -1 = 1
): TwoBoneIKResult {
  const maxReach = 0.95 * (l1 + l2);
  const minReach = Math.abs(l1 - l2) + 0.01;

  let dx = target.x - shoulder.x;
  let dy = target.y - shoulder.y;
  let d = Math.hypot(dx, dy);

  const clamped = d > maxReach || d < minReach;

  // Dirección hacia el objetivo (fallback determinista si es ~0).
  let dirX: number;
  let dirY: number;
  if (d < 1e-6) {
    dirX = 0;
    dirY = 1;
  } else {
    dirX = dx / d;
    dirY = dy / d;
  }

  const reach = Math.min(maxReach, Math.max(minReach, d));

  // Ángulo entre el brazo superior y la línea shoulder->wrist.
  const cosBeta = clamp01((l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach));
  const beta = Math.acos(cosBeta);

  // Ángulo global de la línea shoulder->wrist.
  const alpha = Math.atan2(dirY, dirX);
  const theta1 = alpha + bendDir * beta;

  const elbow: Point2D = {
    x: shoulder.x + Math.cos(theta1) * l1,
    y: shoulder.y + Math.sin(theta1) * l1,
  };
  const wrist: Point2D = {
    x: shoulder.x + dirX * reach,
    y: shoulder.y + dirY * reach,
  };

  const upperAngleDeg = (theta1 * 180) / Math.PI;

  // Flexión del codo calculada directamente del vector real elbow -> wrist.
  // Así `elbow + L2 * (cos(theta1 + deltaRad), sin(theta1 + deltaRad))` coincide
  // EXACTAMENTE con `wrist` para cualquier bendDir, cualquier target y cualquier
  // personaje (MitchCharacter, EyelessJackCharacter, CultistCharacter, JackNyrasCharacter).
  const theta2Global = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
  let deltaRad = theta2Global - theta1;
  while (deltaRad > Math.PI) deltaRad -= 2 * Math.PI;
  while (deltaRad < -Math.PI) deltaRad += 2 * Math.PI;
  const lowerAngleDeg = (deltaRad * 180) / Math.PI;

  return { shoulder, elbow, wrist, upperAngleDeg, lowerAngleDeg, clamped };
}

export interface WalkKinematics {
  /** Subida/bajada de pelvis en px (negativo = sube). */
  pelvisBobY: number;
  /** Inclinación del torso en grados. */
  torsoLeanDeg: number;
  /** Seguimiento retardado de la cabeza en grados (follow-through). */
  headFollowDeg: number;
  leftHipDeg: number;
  leftKneeDeg: number;
  rightHipDeg: number;
  rightKneeDeg: number;
  leftShoulderDeg: number;
  leftElbowDeg: number;
  rightShoulderDeg: number;
  rightElbowDeg: number;
  /** Elevación del pie en px. */
  footLift: number;
}

/**
 * Locomoción biomecánica con inercia:
 *  - pelvis baja en "contact" (|sin| máximo) y sube en "passing" (sin = 0),
 *  - cabeza y antebrazos siguen con retraso `phase - 0.35` (~3-4 frames),
 *  - braceo asimétrico en contrafase a las piernas.
 */
export function computeWalkBiomechanics(
  phase: number,
  stealth = false
): WalkKinematics {
  const amp = stealth ? 0.55 : 1;
  const hipSwing = (stealth ? 24 : 32) * amp;
  const shoulderSwing = (stealth ? 18 : 26) * amp;
  const kneeBend = (stealth ? 58 : 42) * amp;

  // Pelvis: -|sin(phase)| -> más baja en contact, más alta en passing.
  const pelvisBobY = -Math.abs(Math.sin(phase)) * 7 * amp;

  // Torso: leve inclinación frontal sostenida (más acusada en sigilo).
  const torsoLeanDeg =
    (stealth ? 13 : 6) + Math.sin(phase) * (stealth ? 3.2 : 2.2);

  // Cabeza: follow-through con retraso ~0.35 rad (~3-4 frames @ 30fps).
  const headFollowDeg = Math.sin(phase - 0.35) * (stealth ? 4.5 : 2.8);

  const leftHipDeg = Math.sin(phase) * hipSwing;
  const rightHipDeg = Math.sin(phase + Math.PI) * hipSwing;

  // Rodilla se flexiona en la fase de balanceo (mismo signo que footLift).
  const leftKneeDeg = Math.max(0, Math.sin(phase)) * kneeBend + (stealth ? 6 : 2);
  const rightKneeDeg =
    Math.max(0, Math.sin(phase + Math.PI)) * kneeBend + (stealth ? 6 : 2);

  // Braceo asimétrico en contrafase a las piernas.
  const leftShoulderDeg = Math.sin(phase + Math.PI) * shoulderSwing;
  const rightShoulderDeg = Math.sin(phase) * shoulderSwing;

  // Antebrazos con follow-through.
  const leftElbowDeg =
    (stealth ? 16 : 10) +
    Math.max(0, Math.sin(phase - 0.35 + Math.PI)) * (stealth ? 34 : 38);
  const rightElbowDeg =
    (stealth ? 16 : 10) +
    Math.max(0, Math.sin(phase - 0.35)) * (stealth ? 34 : 38);

  const footLift = Math.max(0, Math.sin(phase)) * (stealth ? 7 : 12);

  return {
    pelvisBobY,
    torsoLeanDeg,
    headFollowDeg,
    leftHipDeg,
    leftKneeDeg,
    rightHipDeg,
    rightKneeDeg,
    leftShoulderDeg,
    leftElbowDeg,
    rightShoulderDeg,
    rightElbowDeg,
    footLift,
  };
}

/**
 * Pulso suave negativo (0 -> -1 -> 0) durante los `anticipationFrames`
 * previos a `triggerFrame`. Útil para encoger el cuerpo antes de un
 * sobresalto o giro brusco (5 frames de anticipación del estándar).
 */
export function computeAnticipation(
  frame: number,
  triggerFrame: number,
  anticipationFrames = 5
): number {
  const start = triggerFrame - anticipationFrames;
  if (frame < start || frame >= triggerFrame) {
    return 0;
  }
  const progress = (frame - start) / anticipationFrames;
  return -Math.sin(progress * Math.PI);
}

/**
 * FloorShadow — Sombra elíptica SVG suave, anclada exactamente en `floorY`.
 * Se encoge y atenúa ligeramente cuando `lift > 0` (pie/zancada elevada).
 *
 * Implementada con elipses concéntricas (sin defs/gradientes) para ser
 * 100% determinista y libre de colisiones de id entre instancias.
 */
export const FloorShadow: React.FC<{
  cx: number;
  floorY: number;
  rx: number;
  ry?: number;
  lift?: number;
  opacity?: number;
}> = ({ cx, floorY, rx, ry = rx * 0.3, lift = 0, opacity = 0.55 }) => {
  const k = Math.max(0, Math.min(1, lift / 60));
  const shrink = 1 - k * 0.26;
  const fade = 1 - k * 0.42;
  const o = opacity * fade;
  const rr = rx * shrink;
  const rrY = ry * shrink;

  return React.createElement(
    "g",
    null,
    React.createElement("ellipse", {
      cx,
      cy: floorY,
      rx: rr,
      ry: rrY,
      fill: "#000000",
      opacity: o * 0.5,
    }),
    React.createElement("ellipse", {
      cx,
      cy: floorY,
      rx: rr * 0.66,
      ry: rrY * 0.66,
      fill: "#000000",
      opacity: o * 0.42,
    }),
    React.createElement("ellipse", {
      cx,
      cy: floorY,
      rx: rr * 0.36,
      ry: rrY * 0.36,
      fill: "#000000",
      opacity: o * 0.34,
    })
  );
};
