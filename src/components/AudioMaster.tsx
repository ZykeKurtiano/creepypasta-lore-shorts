import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";
import { FPS, NARRATION_DURATION_SEC, TOTAL_FRAMES } from "../data/episodeConfig";

/**
 * AudioMaster — Mezcla de audio del episodio "The Rake (El Rastrillo)":
 *  - narracion.mp3 al volumen 1.0 constante,
 *  - musica_terror.mp3 con ducking: 0.28 con voz activa, subida suave a
 *    0.52 en pausas (>= 0.38s) y en el cierre atmosférico tras la última
 *    palabra, con fundido limpio a 0.0 en los últimos 25 frames
 *    (TOTAL_FRAMES - 25 → TOTAL_FRAMES),
 *  - SFX con <Sequence> + <Audio> en impactos y transiciones exactas.
 */

const MUSIC_VOICE = 0.28;
const MUSIC_PAUSE = 0.52;
const MIN_PAUSE_SEC = 0.38;
const FINAL_FADE_START = TOTAL_FRAMES - 25;
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

      {/* SFX: raspado de garras (Claw-Swipe y ataques) */}
      <Sequence from={170}>
        <Audio src={staticFile("sfx/claw_scrape.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={1044}>
        <Audio src={staticFile("sfx/claw_scrape.mp3")} volume={0.62} />
      </Sequence>
      <Sequence from={1355}>
        <Audio src={staticFile("sfx/claw_scrape.mp3")} volume={0.52} />
      </Sequence>

      {/* SFX: golpe subgrave en revelaciones clave */}
      <Sequence from={125}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={785}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.62} />
      </Sequence>
      <Sequence from={1346}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={2076}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.58} />
      </Sequence>
      <Sequence from={2290}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.65} />
      </Sequence>

      {/* SFX: chirrido de grabadora (voz "¿soy el Rastrillo?") */}
      <Sequence from={1495}>
        <Audio src={staticFile("sfx/recorder_screech.mp3")} volume={0.65} />
      </Sequence>

      {/* SFX: latido cardiaco (parásito biológico Italia 2010) */}
      <Sequence from={1750}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.58} />
      </Sequence>
      <Sequence from={1910}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={1985}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.62} />
      </Sequence>
    </>
  );
};
