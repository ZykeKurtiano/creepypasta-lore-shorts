/**
 * episodeConfig.ts — Tails Doll (Sonic R / 1997) Lore & Modern Retakes (Estándar v6)
 *
 * Metadatos maestros de la composición:
 * duración dinámica, FPS y límites exactos de las 6 escenas.
 */

export const COMP_ID = "TailsDollLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 85.891;
export const MUSIC_DURATION_SEC = 105.0;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(85.891 * 30) + 45 = 2622 frames (~87.40 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps).
 *
 * 1. El Desbloqueo en Sonic R 1997             : 0    – 622  (0.00s – 20.73s)
 * 2. La Marca TD 1983 y la Tragedia de 1998    : 622  – 1405 (20.73s – 46.83s)
 * 3. El Origen Real — Diseño 3D y Foros 2000   : 1405 – 1767 (46.83s – 58.90s)
 * 4. El Retake — El Disco Prototipo de PS2     : 1767 – 2194 (58.90s – 73.13s)
 * 5. El Acecho en Casa                         : 2194 – 2336 (73.13s – 77.87s)
 * 6. Cierre y Debate — ¿Mito o Maldición?      : 2336 – 2622 (77.87s – 87.40s)
 */
export const SCENES = {
  scene1: { start: 0, end: 622 },
  scene2: { start: 622, end: 1405 },
  scene3: { start: 1405, end: 1767 },
  scene4: { start: 1767, end: 2194 },
  scene5: { start: 2194, end: 2336 },
  scene6: { start: 2336, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
