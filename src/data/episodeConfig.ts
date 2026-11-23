/**
 * episodeConfig.ts — Eyeless Jack Lore & Modern Retakes (Estándar v5)
 *
 * Metadatos maestros de la composición:
 * duración dinámica, FPS, límites exactos de las 6 escenas y cues sonoros.
 */

export const COMP_ID = "EyelessJackLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 88.529;
export const MUSIC_DURATION_SEC = 105.038;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(88.529 * 30) + 45 = 2701 frames (~90.03 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps).
 * 1. La Historia Original (Mitch y Edwin)      : 0 – 1023 (0.00s – 34.10s)
 * 2. DeviantArt 2009 y los Tres Orígenes       : 1023 – 1489 (34.10s – 49.63s)
 * 3. El Ritual de Chernobog (Jack Nyras)       : 1489 – 1723 (49.63s – 57.43s)
 * 4. Retake 1 — El Depredador Nocturno        : 1723 – 1981 (57.43s – 66.03s)
 * 5. Retake 2 — La Agonía de Jack Nyras       : 1981 – 2374 (66.03s – 79.13s)
 * 6. Cierre y Debate — ¿Monstruo o Víctima?   : 2374 – 2701 (79.13s – 90.03s)
 */
export const SCENES = {
  scene1: { start: 0, end: 1023 },
  scene2: { start: 1023, end: 1489 },
  scene3: { start: 1489, end: 1723 },
  scene4: { start: 1723, end: 1981 },
  scene5: { start: 1981, end: 2374 },
  scene6: { start: 2374, end: TOTAL_FRAMES },
} as const;

/** Cues exactos para SFX e impactos narrativos (frames globales). */
export const SFX_CUES = {
  cameraShutterFrame: 794,
  ritualDripFrame: 1649,
  windowHeartbeatFrame: 2302,
  outroBoomFrame: 2374,
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
