/**
 * episodeConfig.ts — Metadatos del episodio, duración dinámica exacta
 * y límites de los 4 actos (Slenderman Lore Short).
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Duración exacta de la narración (public/narracion.mp3) */
export const NARRATION_DURATION_SEC = 53.264;

/** Frames de cierre atmosférico (1.5 s) */
export const OUTRO_HOLD_FRAMES = 45;

/** 53.264s * 30fps = 1597.92 -> ceil = 1598 + 45 = 1643 frames (~54.77 s) */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/** Límites de los 4 actos (frames globales) */
export const ACT1_START = 0;
export const ACT1_END = 156; // 0.00s – 5.20s
export const ACT2_START = 156;
export const ACT2_END = 855; // 5.20s – 28.50s
export const ACT3_START = 855;
export const ACT3_END = 1386; // 28.50s – 46.20s
export const ACT4_START = 1386;
export const ACT4_END = TOTAL_FRAMES; // 46.20s – 54.77s

export type ActNumber = 1 | 2 | 3 | 4;

export const getActForFrame = (frame: number): ActNumber => {
  if (frame < ACT2_START) {
    return 1;
  }
  if (frame < ACT3_START) {
    return 2;
  }
  if (frame < ACT4_START) {
    return 3;
  }
  return 4;
};

/**
 * Zonas seguras de YouTube Shorts (1080x1920):
 * - Superior libre: y < 288
 * - Inferior libre: y > 1440
 * - Columna derecha de iconos: x > 918
 * - Respiro izquierdo recomendado: x < 64
 * Todo texto/UI narrativo vive dentro de SAFE (x: [64, 904], y: [300, 1200]).
 */
export const SAFE = {
  left: 64,
  right: 904,
  top: 300,
  bottom: 1200,
} as const;

/** Línea base de los subtítulos cinéticos (~66% de altura, sobre 1440px) */
export const SUBTITLE_TOP = 1235;
export const SUBTITLE_LEFT = 64;
export const SUBTITLE_WIDTH = 840;
