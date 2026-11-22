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
 * AudioMaster — Mezcla maestra de audio para Jeff the Killer:
 *  - narracion.mp3 a volumen 1.0 constante,
 *  - musica_terror.mp3 con Audio Ducking suave:
 *      · 0.12 durante voz activa,
 *      · 0.35 en pausas dramáticas (>= 0.40 s) y en el cierre final,
 *      · fundido limpio a 0.0 en los últimos 20 frames,
 *  - SFX sincronizados con <Sequence> + <Audio>:
 *      · knife_scrape.mp3 en "‘ve a dormir’" y en el acecho del dormitorio,
 *      · vhs_glitch.mp3 en las transiciones VHS (Escena 1→2 y 2→3),
 *      · deep_boom.mp3 como golpe subgrave único al cortar a la Escena 4.
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
  for (const w of TRANSCRIPT_WORDS) {
    if (t >= w.start && t < w.end) {
      return MUSIC_VOICE;
    }
  }

  if (t >= LAST_WORD_END) {
    return MUSIC_PAUSE;
  }

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

  const into = Math.min(1, (t - gapStart) / 0.32);
  const out = Math.min(1, (gapEnd - t) / 0.32);
  const k = Math.max(0, Math.min(into, out));
  return MUSIC_VOICE + (MUSIC_PAUSE - MUSIC_VOICE) * k;
}

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
    vol *= interpolate(f, [FINAL_FADE_START, FINAL_FADE_END], [1, 0], {
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

      {/* Música dark ambient con ducking automático */}
      <Audio
        src={staticFile("musica_terror.mp3")}
        volume={(f) => computeDuckedMusicVolume(f)}
      />

      {/* SFX: roce metálico sutil en "‘ve a dormir’" y acecho en dormitorio */}
      <Sequence from={34} durationInFrames={50}>
        <Audio src={staticFile("sfx/knife_scrape.mp3")} volume={0.44} />
      </Sequence>
      <Sequence from={1028} durationInFrames={50}>
        <Audio src={staticFile("sfx/knife_scrape.mp3")} volume={0.28} />
      </Sequence>

      {/* SFX: interferencia VHS en corte Escena 1 → 2 y barrido Escena 2 → 3 */}
      <Sequence from={SCENES.scene2.start - 2} durationInFrames={40}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.46} />
      </Sequence>
      <Sequence from={SCENES.scene3.start - 2} durationInFrames={40}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.34} />
      </Sequence>

      {/* SFX: único golpe subgrave al cortar al cara a cara final (Escena 4) */}
      <Sequence from={SCENES.scene4.start - 1} durationInFrames={80}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.68} />
      </Sequence>
    </>
  );
};
