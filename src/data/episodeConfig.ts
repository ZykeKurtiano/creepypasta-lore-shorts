/**
 * episodeConfig.ts — Zalgo, Slenderman y los Niños de Luz (Edición Extendida 90s)
 *
 * Metadatos maestros de la composición vectorial articulada 2.5D (Estándar v3):
 * duración dinámica (~94.83 s), FPS y límites exactos de las 6 escenas.
 */

export const COMP_ID = "ZalgoLoreShort";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const NARRATION_DURATION_SEC = 93.309;
export const MUSIC_DURATION_SEC = 95.033;

/** 45 frames = 1.5 s de cierre atmosférico tras la locución. */
export const OUTRO_HOLD_FRAMES = 45;

/** ceil(93.309 * 30) + 45 = 2845 frames (~94.83 s). */
export const TOTAL_FRAMES =
  Math.ceil(NARRATION_DURATION_SEC * FPS) + OUTRO_HOLD_FRAMES;

/**
 * Límites exactos de las 6 escenas (frames globales @ 30 fps):
 *
 * 1. El Misterio de Slenderman (bosque + portal + niño)      :    0 –  380 (0.00s – 12.67s)
 * 2. Origen 27 de julio de 2004 (Dave Kelly, SA -> 4chan)    :  380 –  908 (12.67s – 30.27s)
 * 3. El Palacio de Cristal Torturado (Zalgo 4 brazos/7 bocas):  908 – 1649 (30.27s – 54.97s)
 * 4. Los Niños de Luz (batería vital: artista y soldado)     : 1649 – 2106 (54.97s – 70.20s)
 * 5. Cacería y Rescate en las Sombras (seguidores vs Slender): 2106 – 2589 (70.20s – 86.30s)
 * 6. Caos vs. Protección (¿Caos o Protección?)               : 2589 – 2845 (86.30s – 94.83s)
 */
export const SCENES = {
  scene1: { start: 0, end: 380 },
  scene2: { start: 380, end: 908 },
  scene3: { start: 908, end: 1649 },
  scene4: { start: 1649, end: 2106 },
  scene5: { start: 2106, end: 2589 },
  scene6: { start: 2589, end: TOTAL_FRAMES },
} as const;

/** Zona segura horizontal (YouTube Shorts): x útil [64, 918], centrado 540. */
export const SAFE_LEFT = 64;
export const SAFE_RIGHT = 918;
export const SAFE_CENTER_X = 540;

/** Zona segura vertical: textos/HUD solo entre y=288 y y=1440. */
export const SAFE_TOP = 288;
export const SAFE_BOTTOM = 1440;
