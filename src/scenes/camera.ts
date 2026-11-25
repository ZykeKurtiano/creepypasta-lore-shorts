import { Easing } from "remotion";

/**
 * camera.ts — Núcleo de cámara 2.5D interna para las escenas del episodio
 * Tails Doll (Estándar v6).
 *
 * Cada escena define una lista de fotogramas clave (CamKey) con su encuadre
 * (escala + punto de foco en coordenadas de mundo 1080×1920). `cameraAt`
 * interpola entre claves con curvas de easing y `cameraTransform` traduce
 * el resultado a un CSS transform con `transformOrigin: "0 0"`, de modo que
 * el punto de foco siempre queda centrado en el lienzo.
 *
 * 100% determinista: solo usa el frame local, Easing e interpolación.
 */

export type EaseFn = (t: number) => number;

export interface CamKey {
  /** Frame local en el que se alcanza esta clave. */
  f: number;
  /** Escala de zoom (1.0 = plano general). */
  s: number;
  /** Punto de foco en coordenadas de mundo (px). */
  x: number;
  y: number;
  /** Easing del tramo que ARRANCA en esta clave (por defecto inOut cúbico). */
  e?: EaseFn;
}

export interface CamState {
  scale: number;
  x: number;
  y: number;
}

const EASE_IO = Easing.inOut(Easing.cubic);

/** Centro del lienzo 1080×1920. */
export const CENTER_X = 540;
export const CENTER_Y = 960;

/** Interpola el estado de cámara en un frame local dado. */
export const cameraAt = (frame: number, keys: CamKey[]): CamState => {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (frame <= first.f) {
    return { scale: first.s, x: first.x, y: first.y };
  }
  if (frame >= last.f) {
    return { scale: last.s, x: last.x, y: last.y };
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const span = b.f - a.f || 1;
      const t = Math.max(0, Math.min(1, (frame - a.f) / span));
      const e = (a.e ?? EASE_IO)(t);
      return {
        scale: a.s + (b.s - a.s) * e,
        x: a.x + (b.x - a.x) * e,
        y: a.y + (b.y - a.y) * e,
      };
    }
  }
  return { scale: last.s, x: last.x, y: last.y };
};

/**
 * Convierte el estado de cámara a un CSS transform. Con `transformOrigin`
 * en "0 0", `translate(CENTER_X - x*scale, CENTER_Y - y*scale) scale(scale)`
 * lleva el punto de foco (x, y) exactamente al centro del lienzo.
 */
export const cameraTransform = (
  cam: CamState,
  swayX = 0,
  swayY = 0
): string => {
  const tx = CENTER_X - cam.x * cam.scale + swayX;
  const ty = CENTER_Y - cam.y * cam.scale + swayY;
  return `translate(${tx}px, ${ty}px) scale(${cam.scale})`;
};
