import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";
import { FPS, NARRATION_DURATION_SEC, TOTAL_FRAMES } from "../data/episodeConfig";

/**
 * AudioMaster — Mezcla de audio del episodio BEN Drowned (2754 frames @ 30 fps):
 *  - narracion.mp3 al volumen 1.0 constante,
 *  - musica_terror.mp3 dark ambient audible y envolvente con ducking:
 *    0.28 con voz activa, subida suave a 0.52 en pausas dramáticas
 *    (>= 0.38s) y en el cierre final tras la última palabra,
 *    con fundido limpio a 0.0 en los últimos 24 frames (dinámico
 *    usando TOTAL_FRAMES, nunca números fijos del episodio anterior).
 *  - Media móvil ±4 frames → ataque/relajación orgánicos sin saltos.
 *  - SFX sincronizados con los hitos de SCENES y TRANSCRIPT_WORDS
 *    (crt_glitch, fire_whoosh, water_submerge, deep_boom).
 */

const MUSIC_VOICE = 0.28;
const MUSIC_PAUSE = 0.52;
const MIN_PAUSE_SEC = 0.38;
const FINAL_FADE_START = TOTAL_FRAMES - 24;
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

// Objetivos suavizados (media móvil ±4 frames → ataque/relajación ~0.27 s).
const SMOOTHED_TARGETS: number[] = (() => {
  const raw: number[] = [];
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    raw.push(rawTargetAt(f / FPS));
  }
  const out: number[] = [];
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    let sum = 0;
    let n = 0;
    for (let d = -4; d <= 4; d++) {
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
 * Ducking 0.28 (voz) ↔ 0.52 (pausas y cierre), fundido final a 0.0.
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

      {/* SFX: glitch CRT en transiciones zoom-through / entradas digitales */}
      <Sequence from={572}>
        <Audio src={staticFile("sfx/crt_glitch.mp3")} volume={0.44} />
      </Sequence>
      <Sequence from={1242}>
        <Audio src={staticFile("sfx/crt_glitch.mp3")} volume={0.34} />
      </Sequence>
      <Sequence from={1884}>
        <Audio src={staticFile("sfx/crt_glitch.mp3")} volume={0.38} />
      </Sequence>
      <Sequence from={2514}>
        <Audio src={staticFile("sfx/crt_glitch.mp3")} volume={0.4} />
      </Sequence>

      {/* SFX: llamas volumétricas envolviendo a Link (~33.6s) */}
      <Sequence from={1008}>
        <Audio src={staticFile("sfx/fire_whoosh.mp3")} volume={0.56} />
      </Sequence>

      {/* SFX: inmersión Z-Dive y agua de la bañera */}
      <Sequence from={1216}>
        <Audio src={staticFile("sfx/water_submerge.mp3")} volume={0.58} />
      </Sequence>
      <Sequence from={2184}>
        <Audio src={staticFile("sfx/water_submerge.mp3")} volume={0.48} />
      </Sequence>
      <Sequence from={2516}>
        <Audio src={staticFile("sfx/water_submerge.mp3")} volume={0.38} />
      </Sequence>

      {/* SFX: golpe subgrave dramático en 'Tu turno' y revelación final */}
      <Sequence from={1128}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.62} />
      </Sequence>
      <Sequence from={2472}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.65} />
      </Sequence>
    </>
  );
};
