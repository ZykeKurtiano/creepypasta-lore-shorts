import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";
import {
  FPS,
  NARRATION_DURATION_SEC,
  SCENES,
  TOTAL_FRAMES,
} from "../data/episodeConfig";

/**
 * AudioMaster — Mezcla de audio del episodio (Zalgo):
 *  - narracion.mp3 al volumen 1.0 constante,
 *  - musica_terror.mp3 con ducking: 0.12 con voz activa, subida suave a
 *    0.35 en pausas (>= 0.40s) y en el cierre final, con fundido limpio a
 *    0.0 en los últimos 20 frames,
 *  - SFX con <Sequence> + <Audio> en cortes e impactos puntuales.
 */

const MUSIC_VOICE = 0.12;
const MUSIC_PAUSE = 0.35;
const MIN_PAUSE_SEC = 0.4;
const FINAL_FADE_START = TOTAL_FRAMES - 20;
const FINAL_FADE_END = TOTAL_FRAMES;

const LAST_WORD_END = TRANSCRIPT_WORDS.reduce(
  (max, w) => Math.max(max, w.end),
  0
);

function rawTargetAt(t: number): number {
  // ¿Voz activa en este instante?
  for (const w of TRANSCRIPT_WORDS) {
    if (t >= w.start && t < w.end) {
      return MUSIC_VOICE;
    }
  }

  // Cierre final: tras la última palabra, sostener el nivel de pausa.
  if (t >= LAST_WORD_END) {
    return MUSIC_PAUSE;
  }

  // Localizar el hueco de silencio actual.
  let gapStart = 0;
  let gapEnd = NARRATION_DURATION_SEC;
  for (const w of TRANSCRIPT_WORDS) {
    if (w.end <= t && w.end > gapStart) {
      gapStart = w.end;
    }
    if (w.start > t && w.start < gapEnd) {
      gapEnd = w.start;
    }
  }

  const gapLen = gapEnd - gapStart;
  if (gapLen < MIN_PAUSE_SEC) {
    return MUSIC_VOICE;
  }

  // Rampas suaves de entrada/salida de la pausa (0.35 s cada una).
  const into = Math.min(1, (t - gapStart) / 0.35);
  const out = Math.min(1, (gapEnd - t) / 0.35);
  const k = Math.max(0, Math.min(into, out));
  return MUSIC_VOICE + (MUSIC_PAUSE - MUSIC_VOICE) * k;
}

// Objetivos suavizados (media móvil ±3 frames → ataque/relajación ~0.2 s).
const SMOOTHED_TARGETS: number[] = (() => {
  const raw: number[] = [];
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    raw.push(rawTargetAt(f / FPS));
  }
  const out: number[] = [];
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    let sum = 0;
    let n = 0;
    for (let d = -3; d <= 3; d++) {
      const idx = Math.min(TOTAL_FRAMES, Math.max(0, f + d));
      sum += raw[idx];
      n++;
    }
    out.push(sum / n);
  }
  return out;
})();

/**
 * Volumen de la música para un frame dado.
 * Ducking 0.12 (voz) ↔ 0.35 (pausas y cierre), fundido final a 0.0.
 */
export const computeDuckedMusicVolume = (
  frame: number,
  fps: number = FPS
): number => {
  const f = Math.round(frame);
  let vol: number;
  if (fps === FPS) {
    vol = SMOOTHED_TARGETS[Math.min(TOTAL_FRAMES, Math.max(0, f))];
  } else {
    vol = rawTargetAt(f / fps);
  }
  if (f >= FINAL_FADE_START) {
    vol *=
      interpolate(f, [FINAL_FADE_START, FINAL_FADE_END], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  }
  return Math.max(0, vol);
};

export const AudioMaster: React.FC = () => {
  return (
    <>
      {/* Locución principal */}
      <Audio src={staticFile("narracion.mp3")} volume={1.0} />

      {/* Música dark ambient con ducking */}
      <Audio
        src={staticFile("musica_terror.mp3")}
        volume={(f) => computeDuckedMusicVolume(f)}
      />

      {/* SFX: ink_glitch — corrupción de la viñeta (Escena 1) */}
      <Sequence from={390} durationInFrames={70}>
        <Audio src={staticFile("sfx/ink_glitch.mp3")} volume={0.42} />
      </Sequence>

      {/* SFX: ink_glitch — camera dive (Escena 1 → 2) */}
      <Sequence from={SCENES.scene2.start - 12} durationInFrames={55}>
        <Audio src={staticFile("sfx/ink_glitch.mp3")} volume={0.32} />
      </Sequence>

      {/* SFX: wall_shatter — romperse el muro dimensional (Escena 2) */}
      <Sequence from={SCENES.scene2.start + 97} durationInFrames={98}>
        <Audio src={staticFile("sfx/wall_shatter.mp3")} volume={0.62} />
      </Sequence>

      {/* SFX: deep_boom — colapso hacia el cara a cara final (Escena 4) */}
      <Sequence from={SCENES.scene4.start - 2} durationInFrames={105}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.68} />
      </Sequence>
    </>
  );
};
