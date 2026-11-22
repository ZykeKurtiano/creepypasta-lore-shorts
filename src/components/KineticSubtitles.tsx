import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TRANSCRIPT_WORDS, WordTiming } from "../data/transcript";
import { FONT_SANS } from "./SafeZone";

/**
 * KineticSubtitles — Subtítulos cinéticos palabra por palabra.
 *
 * - Anclados a top: 1235px (~66% de altura, siempre sobre y=1440).
 * - Contenedor centrado estricto (left 0, right 0, width 100%, flex
 *   center, textAlign center, paddingInline 90) y píldora maxWidth 740.
 * - TODAS las palabras visibles en hueso brillante (#F2EFE9, sin
 *   atenuación gris); la palabra activa se resalta en carmesí sangre
 *   (#DC2626) o amarillo pálido (#FDE047) con pop sutil.
 * - La píldora se mantiene visible (opacity >= 0.88) durante las pausas
 *   breves tras una frase, y desaparece solo en silencios largos.
 * - Fraseado anti-huérfanas: 2–4 palabras, máx ~24 chars, puntuación
 *   consciente, y NINGUNA frase de una sola palabra suelta.
 */

interface Phrase {
  words: WordTiming[];
  start: number;
  end: number;
  runId: number;
}

const PHRASE_MAX_WORDS = 4;
const PHRASE_MAX_CHARS = 24;
const PAUSE_SPLIT_SEC = 0.35;
const HOLD_AFTER_SEC = 0.55;

const CONNECTOR_WORDS = new Set([
  "y", "a", "de", "en", "el", "la", "los", "las", "al", "un", "una",
  "que", "con", "sin", "por", "para", "desde", "su", "se", "no", "o",
  "si", "del", "lo", "mi", "es", "te", "tus",
]);

function endsWithPunctuation(w: string): boolean {
  return /[.,:;…?]$/.test(w);
}

function buildPhrases(): Phrase[] {
  // 1. Dividir en ráfagas por pausas >= 0.35 s (cada ráfaga = runId).
  const runs: WordTiming[][] = [];
  let current: WordTiming[] = [];
  for (let i = 0; i < TRANSCRIPT_WORDS.length; i++) {
    const w = TRANSCRIPT_WORDS[i];
    const prev = current[current.length - 1];
    if (prev && w.start - prev.end >= PAUSE_SPLIT_SEC) {
      runs.push(current);
      current = [];
    }
    current.push(w);
  }
  if (current.length > 0) {
    runs.push(current);
  }

  // 2. Dentro de cada ráfaga, cortar por presupuesto/palabras/puntuación.
  const phrases: Phrase[] = [];
  runs.forEach((run, runId) => {
    let seg: WordTiming[] = [];
    let chars = 0;
    for (const w of run) {
      const wLen = w.word.length + 1;
      const closeNow =
        (seg.length > 0 && chars + wLen > PHRASE_MAX_CHARS) ||
        seg.length >= PHRASE_MAX_WORDS ||
        (seg.length >= 2 && endsWithPunctuation(seg[seg.length - 1].word));
      if (closeNow) {
        phrases.push({
          words: seg,
          start: seg[0].start,
          end: seg[seg.length - 1].end,
          runId,
        });
        seg = [];
        chars = 0;
      }
      seg.push(w);
      chars += wLen;
    }
    if (seg.length > 0) {
      phrases.push({
        words: seg,
        start: seg[0].start,
        end: seg[seg.length - 1].end,
        runId,
      });
    }
  });

  // 3. Mover conectores finales ("y", "en", "un"...) a la siguiente frase.
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    if (p.words.length < 2) {
      continue;
    }
    const last = p.words[p.words.length - 1];
    if (CONNECTOR_WORDS.has(last.word.toLowerCase())) {
      const moved = p.words.pop() as WordTiming;
      p.end = p.words[p.words.length - 1].end;
      const next = phrases[i + 1];
      if (next) {
        next.words.unshift(moved);
        next.start = moved.start;
      }
    }
  }

  // 4. ANTI-HUÉRFANAS ESTRICTO: ninguna frase de una sola palabra.
  //    Si una frase queda con 1 palabra y comparte ráfaga con la
  //    anterior, se fusiona con ella (nunca queda suelta como "verla.").
  const merged: Phrase[] = [];
  for (const p of phrases) {
    const prev = merged[merged.length - 1];
    if (p.words.length === 1 && prev && prev.runId === p.runId) {
      prev.words.push(p.words[0]);
      prev.end = p.end;
    } else {
      merged.push(p);
    }
  }

  // 5. Revisión final: si aún queda una frase de 1 palabra corta
  //    (p. ej. huérfanas entre ráfagas), fusionarla con la anterior.
  //    Los golpes dramáticos largos como "smile.jpg." (10+ chars)
  //    permanecen como latido propio.
  const final: Phrase[] = [];
  for (const p of merged) {
    const prev = final[final.length - 1];
    if (
      p.words.length === 1 &&
      prev &&
      p.words[0].word.length <= 8 &&
      prev.words.length < PHRASE_MAX_WORDS + 1
    ) {
      prev.words.push(p.words[0]);
      prev.end = p.end;
    } else {
      final.push(p);
    }
  }

  return final;
}

const PHRASES: Phrase[] = buildPhrases();

const ACTIVE_COLORS = {
  default: "#F2EFE9",
  blood: "#DC2626",
  yellow: "#FDE047",
} as const;

export const KineticSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Localizar la frase activa o el estado de pausa breve posterior.
  let phrase: Phrase | null = null;
  let opacity = 0;
  let holdPause = false;

  for (const p of PHRASES) {
    if (t >= p.start - 0.1 && t <= p.end + 0.14) {
      phrase = p;
      break;
    }
  }

  if (phrase) {
    const fadeIn = interpolate(t, [phrase.start - 0.1, phrase.start - 0.02], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(t, [phrase.end + 0.04, phrase.end + 0.14], [1, 0.88], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    opacity = Math.min(fadeIn, fadeOut);
  } else {
    // Pausa breve: mantener la última frase visible con opacity 0.88.
    let last: Phrase | null = null;
    for (const p of PHRASES) {
      if (p.end <= t) {
        last = p;
      }
    }
    if (last && t - last.end <= HOLD_AFTER_SEC) {
      phrase = last;
      opacity = 0.88;
      holdPause = true;
    }
  }

  if (!phrase || opacity <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 1235,
        left: 0,
        right: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        paddingInline: 90,
        boxSizing: "border-box",
        zIndex: 40,
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 740,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 24,
          rowGap: 10,
          padding: "14px 28px",
          background: "rgba(4,5,7,0.82)",
          borderRadius: 16,
          border: "1px solid rgba(242,239,233,0.18)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
          fontFamily: FONT_SANS,
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: 0.5,
        }}
      >
        {phrase.words.map((w, i) => {
          const active = !holdPause && t >= w.start && t < w.end;
          const pop = active
            ? spring({
                frame: frame - Math.round(w.start * fps),
                fps,
                config: { damping: 200, mass: 0.6, stiffness: 150 },
              })
            : 0;

          // TODAS las palabras en hueso brillante; la activa cambia de color.
          const color = active ? ACTIVE_COLORS[w.emphasis ?? "default"] : "#F2EFE9";
          const opacityWord = active ? 1 : 0.92;

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color,
                opacity: opacityWord,
                transform: `scale(${1 + pop * 0.06}) translateY(${-pop * 3}px)`,
                textShadow: active
                  ? w.emphasis === "blood"
                    ? "0 0 22px rgba(220,38,38,0.5)"
                    : w.emphasis === "yellow"
                      ? "0 0 22px rgba(253,224,71,0.5)"
                      : "0 0 18px rgba(242,239,233,0.35)"
                  : "0 2px 10px rgba(0,0,0,0.7)",
                whiteSpace: "pre",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
