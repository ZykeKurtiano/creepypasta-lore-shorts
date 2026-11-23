/**
 * episodeConfig.ts — Jeff the Killer (2008) Lore, Rivalry & Modern Retakes
 *
 * Metadatos maestros de la composición vectorial articulada 2.5D:
 * duración dinámica, FPS y límites exactos de las 4 escenas.
 */

export const COMP_ID = "JeffTheKillerLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 47.726;
export const MUSIC_DURATION_SEC = 49.763;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(47.726 * 30) + 45 = 1432 + 45 = 1477 frames (~49.23 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 4 escenas (frames globales @ 30 fps):
 *
 * 1. El misterio de 2008 (CRT + investigador)     : 0    – 395  (0.00s – 13.17s)
 * 2. Juegos indie, YouTube y Jeff vs Slenderman   : 395  – 911  (13.17s – 30.37s)
 * 3. Los Retakes Modernos (acecho + expediente)   : 911  – 1278 (30.37s – 42.60s)
 * 4. Cierre y Debate (¿Jeff o Slenderman?)        : 1278 – 1477 (42.60s – 49.23s)
 */
export const SCENES = {
  scene1: { start: 0, end: 395 },
  scene2: { start: 395, end: 911 },
  scene3: { start: 911, end: 1278 },
  scene4: { start: 1278, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
