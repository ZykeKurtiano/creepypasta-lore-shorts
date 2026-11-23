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
 *  - musica_terror.mp3 en loop continuo hasta el último frame (TOTAL_FRAMES),
 *    con ducking suave: 0.28 con voz activa, subida a 0.52 en pausas
 *    dramáticas (>= 0.38s) y en el clímax/cierre final, con fundido limpio a
 *    0.0 en los últimos 25 frames,
 *  - SFX (ink_glitch, wall_shatter, light_pulse, deep_boom) con
 *    <Sequence> + <Audio> sincronizados con las 6 escenas.
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
 * Ducking 0.28 (voz) ↔ 0.52 (pausas y clímax/cierre), fundido final a 0.0.
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

      {/* Música dark ambient con ducking, en loop hasta el último frame */}
      <Audio
        src={staticFile("musica_terror.mp3")}
        loop
        volume={(f) => computeDuckedMusicVolume(f)}
      />

      {/* SFX: ink_glitch — el virus corrompe los cómics (Escena 2) */}
      <Sequence from={SCENES.scene2.start + 270} durationInFrames={70}>
        <Audio src={staticFile("sfx/ink_glitch.mp3")} volume={0.44} />
      </Sequence>

      {/* SFX: ink_glitch — camera dive (Escena 2 → 3) */}
      <Sequence from={SCENES.scene3.start - 14} durationInFrames={55}>
        <Audio src={staticFile("sfx/ink_glitch.mp3")} volume={0.34} />
      </Sequence>

      {/* SFX: wall_shatter — revelación de Zalgo en el Palacio de Cristal Torturado (Escena 3) */}
      <Sequence from={SCENES.scene3.start + 90} durationInFrames={98}>
        <Audio src={staticFile("sfx/wall_shatter.mp3")} volume={0.62} />
      </Sequence>

      {/* SFX: light_pulse — revelación de los Niños de Luz (Escena 4) */}
      <Sequence from={SCENES.scene4.start + 75} durationInFrames={85}>
        <Audio src={staticFile("sfx/light_pulse.mp3")} volume={0.55} />
      </Sequence>

      {/* SFX: light_pulse — rescate de Slenderman (Escena 5) */}
      <Sequence from={SCENES.scene5.start + 210} durationInFrames={85}>
        <Audio src={staticFile("sfx/light_pulse.mp3")} volume={0.46} />
      </Sequence>

      {/* SFX: deep_boom — inicio de la revelación de Zalgo (Escena 1) */}
      <Sequence from={350} durationInFrames={85}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.48} />
      </Sequence>

      {/* SFX: deep_boom — corte de alto contraste hacia Escena 6 */}
      <Sequence from={SCENES.scene6.start - 2} durationInFrames={105}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.68} />
      </Sequence>
    </>
  );
};
