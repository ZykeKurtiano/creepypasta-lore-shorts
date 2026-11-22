/**
 * episodeConfig.ts — Smile Dog (smile.jpg) Lore & Modern Retakes
 *
 * Metadatos maestros de la composición:
 * duración dinámica, FPS y límites exactos de las 5 escenas.
 */

export const COMP_ID = "SmileDogLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 51.252;
export const MUSIC_DURATION_SEC = 53.252;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(51.252 * 30) + 45 = 1538 + 45 = 1583 frames (~52.77 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 5 escenas (frames globales @ 30 fps).
 *
 * 1. Hook — smile.jpg y el flash            : 0     – 489   (0.00s – 16.30s)
 * 2. Lore clásico — Mary y el disquete      : 489   – 846   (16.30s – 28.20s)
 * 3. Retake psicológico — Correos y duelo   : 846   – 1113  (28.20s – 37.10s)
 * 4. Retake biológico — Bosque e infección  : 1113  – 1347  (37.10s – 44.90s)
 * 5. Cierre perturbador — Close-up final    : 1347  – 1583  (44.90s – 52.77s)
 */
export const SCENES = {
  scene1: { start: 0, end: 489 },
  scene2: { start: 489, end: 846 },
  scene3: { start: 846, end: 1113 },
  scene4: { start: 1113, end: 1347 },
  scene5: { start: 1347, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
