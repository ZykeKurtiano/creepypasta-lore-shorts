/**
 * episodeConfig.ts — BEN Drowned (Majora's Mask) Lore & Modern Retake
 *
 * Metadatos maestros de la composición (Estándar v4+):
 * duración dinámica, FPS y límites exactos de las 6 escenas.
 */

export const COMP_ID = "BenDrownedLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 90.279;
export const MUSIC_DURATION_SEC = 100.049;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(90.279 * 30) + 45 = 2754 frames (~91.80 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps).
 *
 * 1. El Cartucho Maldito                   : 0     – 590   ( 0.00s – 19.67s)
 * 2. La Estatua y 'Your Turn'              : 590   – 1248  (19.67s – 41.60s)
 * 3. Origen Real — Alex Hall y 4chan 2010  : 1248  – 1892  (41.60s – 63.07s)
 * 4. El Retake — La Casa de la Infancia    : 1892  – 2188  (63.07s – 72.93s)
 * 5. La Verdad en el Agua                  : 2188  – 2521  (72.93s – 84.03s)
 * 6. Cierre y Debate                       : 2521  – 2754  (84.03s – 91.80s)
 */
export const SCENES = {
  scene1: { start: 0, end: 590 },
  scene2: { start: 590, end: 1248 },
  scene3: { start: 1248, end: 1892 },
  scene4: { start: 1892, end: 2188 },
  scene5: { start: 2188, end: 2521 },
  scene6: { start: 2521, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
