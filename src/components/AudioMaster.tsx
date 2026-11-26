import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { TRANSCRIPT_WORDS } from "../data/transcript";
import { FPS, NARRATION_DURATION_SEC, TOTAL_FRAMES } from "../data/episodeConfig";

/**
 * AudioMaster — Mezcla de audio del episodio (Estándar v9):
 *  - narracion.mp3 a volumen constante 1.0.
 *  - musica_terror.mp3 (piano de Pueblo Lavanda, normalizado a -14 dBFS RMS)
 *    con ducking suave 0.30 ↔ 0.58: 0.30 con voz activa, subida suave a 0.58
 *    en pausas dramáticas (>= 0.36 s) y en el cierre final, con fundido
 *    limpio a 0.0 en los últimos 28 frames (TOTAL_FRAMES - 28 → TOTAL_FRAMES).
 *  - 4 SFX locales con <Sequence> + <Audio> en arranque, menciones, golpes
 *    y transiciones.
 */

const MUSIC_VOICE = 0.3;
const MUSIC_PAUSE = 0.58;
const MIN_PAUSE_SEC = 0.36;
const RAMP_SEC = 0.35;
const FINAL_FADE_FRAMES = 28;
const FINAL_FADE_START = TOTAL_FRAMES - FINAL_FADE_FRAMES;

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
 * Ducking 0.30 (voz) ↔ 0.58 (pausas y cierre), fundido final a 0.0.
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
      interpolate(f, [FINAL_FADE_START, TOTAL_FRAMES], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  }
  return Math.max(0, vol);
};

/** SFX con sus puntos de disparo exactos (frames globales @ 30 fps). */
const SFX: Array<{ file: string; at: number; volume: number }> = [
  // gameboy_chime.mp3 — arranque, mención 1996/Game Boy, apagado de pantalla.
  { file: "sfx/gameboy_chime.mp3", at: 14, volume: 0.45 },
  { file: "sfx/gameboy_chime.mp3", at: 230, volume: 0.4 },
  { file: "sfx/gameboy_chime.mp3", at: 2095, volume: 0.34 },

  // deep_boom.mp3 — golpes de revelación y transiciones.
  { file: "sfx/deep_boom.mp3", at: 516, volume: 0.52 },
  { file: "sfx/deep_boom.mp3", at: 554, volume: 0.42 },
  { file: "sfx/deep_boom.mp3", at: 942, volume: 0.46 },
  { file: "sfx/deep_boom.mp3", at: 1510, volume: 0.48 },
  { file: "sfx/deep_boom.mp3", at: 2143, volume: 0.52 },

  // binaural_ring.mp3 — frecuencias agudas/binaurales.
  { file: "sfx/binaural_ring.mp3", at: 1082, volume: 0.44 },
  { file: "sfx/binaural_ring.mp3", at: 1750, volume: 0.3 },

  // glitch_731.mp3 — interferencia del Código 731.
  { file: "sfx/glitch_731.mp3", at: 1348, volume: 0.5 },
];

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

      {/* SFX diegéticos anclados a cortes e impactos */}
      {SFX.map((sfx, i) => (
        <Sequence key={i} from={sfx.at}>
          <Audio src={staticFile(sfx.file)} volume={sfx.volume} />
        </Sequence>
      ))}
    </>
  );
};
