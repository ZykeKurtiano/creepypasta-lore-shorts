/**
 * episodeConfig.ts — Zalgo: El Que Espera Detrás Del Muro (2004)
 *
 * Metadatos maestros de la composición vectorial articulada 2.5D (Estándar v3):
 * duración dinámica, FPS y límites exactos de las 4 escenas.
 */

export const COMP_ID = "ZalgoLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 53.629;
export const MUSIC_DURATION_SEC = 55.629;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(53.629 * 30) + 45 = 1654 frames (~55.13 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 4 escenas (frames globales @ 30 fps):
 *
 * 1. Origen en Something Awful 2004 (Dave Kelly + viñeta corrupta) :    0 –  621 (0.00s – 20.70s)
 * 2. El que espera detrás del muro (Zalgo 7 bocas + estrella)      :  621 – 1080 (20.70s – 36.00s)
 * 3. Zalgo vs. Slenderman — Guerra de Proxies (split dinámico)     : 1080 – 1427 (36.00s – 47.57s)
 * 4. Cierre y Debate (¿Podría Slenderman detenerlo?)               : 1427 – 1654 (47.57s – 55.13s)
 */
export const SCENES = {
  scene1: { start: 0, end: 621 },
  scene2: { start: 621, end: 1080 },
  scene3: { start: 1080, end: 1427 },
  scene4: { start: 1427, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
