/**
 * episodeConfig.ts — The Rake (El Rastrillo) Lore & Modern Retakes (Estándar v7)
 *
 * Metadatos maestros de la composición:
 * duración dinámica, FPS y límites exactos de las 6 escenas.
 */

export const COMP_ID = "TheRakeLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 77.636;
export const MUSIC_DURATION_SEC = 102.034;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(77.636 * 30) + 45 = 2375 frames (~79.17 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps).
 *
 * 1. El Despertar al Pie de la Cama           :    0 –  177 ( 0.00s –  5.90s)
 * 2. Apagón 2003 y Archivos 1691 / 1964       :  177 –  853 ( 5.90s – 28.43s)
 * 3. Anatomía de la Criatura                  :  853 – 1089 (28.43s – 36.30s)
 * 4. Caso de la Familia y Grabadora Nocturna  : 1089 – 1605 (36.30s – 53.50s)
 * 5. El Retake — Parásito de Italia 2010      : 1605 – 2078 (53.50s – 69.27s)
 * 6. Cierre y Debate                          : 2078 – 2375 (69.27s – 79.17s)
 */
export const SCENES = {
  scene1: { start: 0, end: 177 },
  scene2: { start: 177, end: 853 },
  scene3: { start: 853, end: 1089 },
  scene4: { start: 1089, end: 1605 },
  scene5: { start: 1605, end: 2078 },
  scene6: { start: 2078, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
