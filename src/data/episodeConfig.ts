/**
 * episodeConfig.ts — Jeff the Killer (2008) Lore, Rivalry & Modern Retakes
 *
 * Metadatos maestros de la composición:
 * duración dinámica, FPS y límites exactos de las 4 escenas.
 */

export const COMP_ID = "JeffTheKillerLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 48.509;
export const MUSIC_DURATION_SEC = 50.547;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(48.509 * 30) + 45 = 1456 + 45 = 1501 frames (~50.03 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 4 escenas (frames globales @ 30 fps):
 *
 * 1. Gancho — El espejo y el origen 2008       : 0    – 436  (0.00s – 14.53s)
 * 2. Juegos indie, YouTube y Jeff vs Slenderman: 436  – 896  (14.53s – 29.87s)
 * 3. Retakes modernos — Realismo y drama médico: 896  – 1296 (29.87s – 43.20s)
 * 4. Cierre y debate — ¿Jeff o Slenderman?     : 1296 – 1501 (43.20s – 50.03s)
 */
export const SCENES = {
  scene1: { start: 0, end: 436 },
  scene2: { start: 436, end: 896 },
  scene3: { start: 896, end: 1296 },
  scene4: { start: 1296, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
