import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SUBTITLE_LEFT, SUBTITLE_TOP, SUBTITLE_WIDTH } from "../data/episodeConfig";
import { TRANSCRIPT_WORDS, type WordTiming } from "../data/transcript";

/**
 * KineticSubtitles.tsx — Subtítulos palabra por palabra dentro de la zona
 * segura de YouTube Shorts: top 1235px (~66% de altura, muy por encima de
 * 1440px), píldora CENTRADA en la caja horizontal x:[64, 904] (lejos de la
 * columna de iconos x>918).
 *
 * Agrupación por puntuación: frases naturales de 2-4 palabras que nunca
 * dividen una oración corta ("Ya llegó.", "no voltees.") ni dejan una
 * palabra huérfana como última frase. Palabra activa con spring + color
 * según énfasis (sangre #DC2626 / amarillo pálido #FDE047).
 */

const GROUP_MAX_WORDS = 4;
const GROUP_MAX_CHARS = 24;
const STRONG_END = /[.!?:]$/;

type Phrase = {
  words: WordTiming[];
  start: number;
  end: number;
};

/** Trocea una oración en frases de 2-4 palabras / <=24 chars sin huérfanas */
const chunkSentence = (words: WordTiming[]): WordTiming[][] => {
  if (words.length === 0) {
    return [];
  }
  const chunks: WordTiming[][] = [];
  let cur: WordTiming[] = [];
  let chars = 0;
  for (const w of words) {
    const wouldChars = chars + (cur.length > 0 ? 1 : 0) + w.word.length;
    if (
      cur.length > 0 &&
      (cur.length >= GROUP_MAX_WORDS || wouldChars > GROUP_MAX_CHARS)
    ) {
      chunks.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(w);
    chars += (cur.length > 1 ? 1 : 0) + w.word.length;
  }
  if (cur.length > 0) {
    chunks.push(cur);
  }
  // Anti-huérfana: la última frase nunca queda con una sola palabra
  if (chunks.length >= 2 && chunks[chunks.length - 1].length === 1) {
    const last = chunks[chunks.length - 1];
    const prev = chunks[chunks.length - 2];
    if (prev.length >= 2) {
      const moved = prev.pop() as WordTiming;
      chunks[chunks.length - 1] = [moved, ...last];
    }
  }
  return chunks;
};

const PHRASES: Phrase[] = (() => {
  // Primero separamos en oraciones por puntuación fuerte (. ! ? :)
  const sentences: WordTiming[][] = [];
  let cur: WordTiming[] = [];
  for (const w of TRANSCRIPT_WORDS) {
    cur.push(w);
    if (STRONG_END.test(w.word)) {
      sentences.push(cur);
      cur = [];
    }
  }
  if (cur.length > 0) {
    sentences.push(cur);
  }
  const phrases: Phrase[] = [];
  for (const sentence of sentences) {
    for (const chunk of chunkSentence(sentence)) {
      phrases.push({
        words: chunk,
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
      });
    }
  }
  return phrases;
})();

const Word: React.FC<{
  word: WordTiming;
  frame: number;
  fps: number;
  t: number;
}> = ({ word, frame, fps, t }) => {
  const active = t >= word.start && t <= word.end;
  const color = !active
    ? "#F2EFE9"
    : word.emphasis === "yellow"
      ? "#FDE047"
      : "#DC2626";

  const pop = active
    ? spring({
        frame: frame - word.start * fps,
        fps,
        config: { damping: 13, stiffness: 220, mass: 0.5 },
      })
    : 0;

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily:
          "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'Arial Black', sans-serif",
        fontWeight: 900,
        textTransform: "uppercase",
        fontSize: 54,
        lineHeight: 1.18,
        letterSpacing: "0.03em",
        color,
        transform: `translateY(${active ? -pop * 3 : 0}px) scale(${active ? 1 + pop * 0.06 : 1})`,
        textShadow: active
          ? `0 2px 0 rgba(4,5,7,0.9), 0 0 14px rgba(4,5,7,0.85), 0 0 ${
              word.emphasis === "yellow" ? 22 : 20
            }px ${
              word.emphasis === "yellow"
                ? "rgba(253,224,71,0.4)"
                : "rgba(220,38,38,0.45)"
            }`
          : "0 2px 0 rgba(4,5,7,0.9), 0 0 12px rgba(4,5,7,0.85)",
      }}
    >
      {word.word}
    </span>
  );
};

export const KineticSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let phraseIndex = -1;
  for (let i = 0; i < PHRASES.length; i++) {
    if (PHRASES[i].start <= t) {
      phraseIndex = i;
    } else {
      break;
    }
  }
  if (phraseIndex < 0) {
    return null;
  }
  const phrase = PHRASES[phraseIndex];
  const dim = t > phrase.end + 0.4;

  return (
    <div
      style={{
        position: "absolute",
        top: SUBTITLE_TOP,
        left: SUBTITLE_LEFT,
        width: SUBTITLE_WIDTH,
        display: "flex",
        justifyContent: "center",
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 24,
          rowGap: 10,
          maxWidth: "100%",
          background: "rgba(4,5,7,0.72)",
          border: "1px solid rgba(242,239,233,0.16)",
          borderRadius: 14,
          padding: "14px 28px",
          backdropFilter: "blur(8px)",
        }}
      >
        {phrase.words.map((w, i) => (
          <Word key={`${phrase.start}-${i}`} word={w} frame={frame} fps={fps} t={t} />
        ))}
      </div>
    </div>
  );
};
