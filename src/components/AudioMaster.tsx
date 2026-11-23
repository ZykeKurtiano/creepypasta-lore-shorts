import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";
import {
  FPS,
  NARRATION_DURATION_SEC,
  SCENES,
  SFX_CUES,
  TOTAL_FRAMES,
} from "../data/episodeConfig";

/**
 * AudioMaster — Mezcla de audio del episodio EyelessJackLoreShort:
 *  - narracion.mp3 al volumen 1.0 constante,
 *  - musica_terror.mp3 con ducking audible 0.28 ↔ 0.52:
 *      0.28 con voz activa, subida suave a 0.52 en pausas >= 0.38s y en el
 *      cierre tras la última palabra, con fundido limpio a 0.0 en los
 *      últimos 24 frames (TOTAL_FRAMES - 24 → TOTAL_FRAMES),
 *  - SFX con <Sequence> + <Audio> en impactos y transiciones.
 */

const MUSIC_VOICE = 0.28;
const MUSIC_PAUSE = 0.52;
const MIN_PAUSE_SEC = 0.38;
const RAMP_SEC = 0.35;
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

  // Rampas suaves de entrada/salida de la pausa (RAMP_SEC cada una).
  const into = Math.min(1, (t - gapStart) / RAMP_SEC);
  const out = Math.min(1, (gapEnd - t) / RAMP_SEC);
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

      {/* SFX: latidos de corazón */}
      <Sequence from={150}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={SCENES.scene4.start + 35}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={SFX_CUES.windowHeartbeatFrame}>
        <Audio src={staticFile("sfx/heartbeat_thud.mp3")} volume={0.62} />
      </Sequence>

      {/* SFX: goteo de líquido (icor/alquitrán) */}
      <Sequence from={665}>
        <Audio src={staticFile("sfx/liquid_drip.mp3")} volume={0.58} />
      </Sequence>
      <Sequence from={SFX_CUES.ritualDripFrame}>
        <Audio src={staticFile("sfx/liquid_drip.mp3")} volume={0.65} />
      </Sequence>

      {/* SFX: obturador de cámara */}
      <Sequence from={SFX_CUES.cameraShutterFrame}>
        <Audio src={staticFile("sfx/camera_shutter.mp3")} volume={0.78} />
      </Sequence>

      {/* SFX: golpe subgrave */}
      <Sequence from={SCENES.scene3.start}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.62} />
      </Sequence>
      <Sequence from={SFX_CUES.outroBoomFrame}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.72} />
      </Sequence>
    </>
  );
};
