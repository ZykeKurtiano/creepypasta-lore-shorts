/**
 * episodeConfig.ts — Síndrome de Pueblo Lavanda (Lavender Town Lore & Retakes)
 *
 * Metadatos maestros de la composición (Estándar v9):
 * duración dinámica, FPS y límites exactos de las 6 escenas.
 */

export const COMP_ID = "LavenderTownLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 81.946;
export const MUSIC_DURATION_SEC = 85.995;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(81.946 * 30) + 45 = 2504 frames (~83.47 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps).
 *
 * 1. 1996 — Game Boy en Japón                 : 0     – 556   (0.00s  – 18.54s)
 * 2. La Torre Pokémon y los Síntomas          : 556   – 1082  (18.54s – 36.08s)
 * 3. Tonos Binaurales y Código 731            : 1082  – 1512  (36.08s – 50.40s)
 * 4. El Retake — Sobrecarga Sensorial (047)   : 1512  – 1919  (50.40s – 63.95s)
 * 5. El Vacío Después de Apagar la Consola    : 1919  – 2145  (63.95s – 71.49s)
 * 6. Cierre y Debate — Split-Screen diagonal  : 2145  – 2504  (71.49s – 83.47s)
 */
export const SCENES = {
  scene1: { start: 0, end: 556 },
  scene2: { start: 556, end: 1082 },
  scene3: { start: 1082, end: 1512 },
  scene4: { start: 1512, end: 1919 },
  scene5: { start: 1919, end: 2145 },
  scene6: { start: 2145, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
