import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS, TOTAL_FRAMES } from "../data/episodeConfig";
import { TRANSCRIPT_WORDS } from "../data/transcript";

/**
 * AudioMaster.tsx — Mezcla completa:
 * - narracion.mp3 a volumen 1.0
 * - musica_terror.mp3 con ducking: 0.12 con voz, rampa suave a 0.35 en
 *   pausas (>= 0.45s) y en el cierre final (frames 1581-1643), con fade
 *   final en los últimos 18 frames (1625-1643 -> 0.0)
 * - SFX con <Sequence> + <Audio> en cortes de acto e impactos.
 */

const SPEECH_VOL = 0.12;
const PAUSE_VOL = 0.35;
const HOLD_START = 1581;
const FADE_START = 1625;

/** Volumen por frame de la música, precalculado desde el transcript */
const MUSIC_VOLUME: number[] = (() => {
  // Máscara de voz activa derivada de los intervalos exactos del transcript
  const target: number[] = new Array(TOTAL_FRAMES).fill(PAUSE_VOL);
  for (const w of TRANSCRIPT_WORDS) {
    const from = Math.ceil(w.start * FPS);
    const to = Math.ceil(w.end * FPS);
    for (let f = from; f < to && f < TOTAL_FRAMES; f++) {
      target[f] = SPEECH_VOL;
    }
  }
  const vol: number[] = new Array(TOTAL_FRAMES);
  let v = PAUSE_VOL;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f >= HOLD_START ? PAUSE_VOL : target[f];
    // Ataque rápido hacia abajo (ducking), liberación suave hacia arriba
    v = t < v ? v + (t - v) * 0.55 : v + (t - v) * 0.12;
    vol[f] = v;
  }
  // Fade out suave en los últimos 18 frames
  for (let f = FADE_START; f < TOTAL_FRAMES; f++) {
    vol[f] =
      vol[f] *
      interpolate(f, [FADE_START, TOTAL_FRAMES], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  }
  return vol;
})();

export const computeDuckedMusicVolume = (frame: number, fps: number): number => {
  const idx = Math.round((frame / fps) * FPS);
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, idx));
  return MUSIC_VOLUME[clamped];
};

export const AudioMaster: React.FC = () => {
  return (
    <>
      {/* Locución principal */}
      <Audio src={staticFile("narracion.mp3")} volume={1.0} />
      {/* Música dark ambient con ducking */}
      <Audio
        src={staticFile("musica_terror.mp3")}
        volume={(f) => computeDuckedMusicVolume(f, FPS)}
      />

      {/* Viento de bosque: apertura (0.26 -> 0.0 en 150 frames) */}
      <Sequence from={0} durationInFrames={150}>
        <Audio
          src={staticFile("sfx/forest_wind.mp3")}
          volume={(f) =>
            interpolate(f, [0, 150], [0.26, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
      {/* Viento de bosque: cierre (0.0 -> 0.24 -> 0.0 en 153 frames) */}
      <Sequence from={1490} durationInFrames={153}>
        <Audio
          src={staticFile("sfx/forest_wind.mp3")}
          volume={(f) =>
            interpolate(f, [0, 60, 153], [0, 0.24, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {/* Golpes subgraves en revelaciones clave */}
      <Sequence from={124}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={1116}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={1458}>
        <Audio src={staticFile("sfx/deep_boom.mp3")} volume={0.62} />
      </Sequence>

      {/* Estática VHS en cortes de acto */}
      <Sequence from={150} durationInFrames={36}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.42} />
      </Sequence>
      <Sequence from={850} durationInFrames={36}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.42} />
      </Sequence>
      <Sequence from={1380} durationInFrames={40}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.48} />
      </Sequence>
      <Sequence from={1406} durationInFrames={35}>
        <Audio src={staticFile("sfx/vhs_glitch.mp3")} volume={0.38} />
      </Sequence>
    </>
  );
};
