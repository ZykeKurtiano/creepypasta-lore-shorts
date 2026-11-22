import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES } from "./data/episodeConfig";
import { JeffScene1Mirror } from "./scenes/JeffScene1Mirror";
import { JeffScene2Arena } from "./scenes/JeffScene2Arena";
import { JeffScene3Retakes } from "./scenes/JeffScene3Retakes";
import { JeffScene4Faceoff } from "./scenes/JeffScene4Faceoff";

/**
 * MainComposition — Orquestador maestro de JeffTheKillerLoreShort.
 *
 * Monta las 4 escenas 2.5D en <Sequence>, cada una con su propia intención
 * de cámara suave y sin bucles periódicos de shake o zoom:
 *  1. JeffScene1Mirror  (dolly-in lento y estable)
 *  2. JeffScene2Arena   (pan lateral suave)
 *  3. JeffScene3Retakes (avance progresivo lento en eje Z)
 *  4. JeffScene4Faceoff (corte con deep_boom único + plano fijo tenso)
 *
 * Aplica deslizamiento whip-pan real en el barrido rápido Escena 2 → 3
 * y apila encima transiciones, subtítulos cinéticos, post-procesado VHS y audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { ...SCENES.scene1, Component: JeffScene1Mirror },
  { ...SCENES.scene2, Component: JeffScene2Arena },
  { ...SCENES.scene3, Component: JeffScene3Retakes },
  { ...SCENES.scene4, Component: JeffScene4Faceoff },
];

/** Frontera con barrido rápido (whip-pan): Escena 2 → 3 (10 frames). */
const WHIP_WINDOWS: Record<number, number> = {
  [SCENES.scene3.start]: 10,
};

export const MainComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {SCENE_SPECS.map(({ start, end, Component }, i) => {
        const whipIn = WHIP_WINDOWS[start] ?? 0;
        const whipOut = WHIP_WINDOWS[end] ?? 0;
        if (frame < start || frame >= end + whipOut) {
          return null;
        }

        let tx = 0;
        if (whipIn > 0 && frame < start + whipIn) {
          tx = interpolate(frame, [start, start + whipIn], [width, 0], {
            easing: Easing.in(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        } else if (whipOut > 0 && frame >= end) {
          tx = interpolate(frame, [end, end + whipOut], [0, -width * 0.65], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }

        return (
          <AbsoluteFill
            key={i}
            style={{ transform: `translateX(${tx}px)`, overflow: "hidden" }}
          >
            <Sequence from={start} durationInFrames={end - start + whipOut}>
              <Component />
            </Sequence>
          </AbsoluteFill>
        );
      })}

      {/* Transiciones entre escenas (VHS, whip-pan y corte subgrave) */}
      <SceneTransitions />

      {/* Subtítulos cinéticos palabra por palabra dentro de zona segura */}
      <KineticSubtitles />

      {/* Post-procesado VHS + HUD */}
      <VhsPostProcess />

      {/* Mezcla de audio con ducking + SFX */}
      <AudioMaster />
    </AbsoluteFill>
  );
};
