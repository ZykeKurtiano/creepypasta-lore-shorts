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
import { Camera25D } from "./components/Camera25D";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { TOTAL_FRAMES } from "./data/episodeConfig";
import { Scene1CrtHook } from "./scenes/Scene1CrtHook";
import { Scene2MaryBedroom } from "./scenes/Scene2MaryBedroom";
import { Scene3RetroEmailRetake } from "./scenes/Scene3RetroEmailRetake";
import { Scene4BiologicalForest } from "./scenes/Scene4BiologicalForest";
import { Scene5ChillingOutro } from "./scenes/Scene5ChillingOutro";

/**
 * MainComposition — Orquestador maestro.
 *
 * Monta las 5 escenas 2.5D en <Sequence>, envuelve cada una con la
 * Camera25D (handheld + zoom punches), ejecuta las transiciones
 * dinámicas entre escenas (deslizamiento whip-pan real sobre las dos
 * escenas implicadas) y apila encima subtítulos, post-proceso VHS y
 * la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: 0, end: 489, Component: Scene1CrtHook },
  { start: 489, end: 846, Component: Scene2MaryBedroom },
  { start: 846, end: 1113, Component: Scene3RetroEmailRetake },
  { start: 1113, end: 1347, Component: Scene4BiologicalForest },
  { start: 1347, end: TOTAL_FRAMES, Component: Scene5ChillingOutro },
];

/** Fronteras con whip-pan: duración del barrido en frames. */
const WHIP_WINDOWS: Record<number, number> = {
  846: 10,
  1113: 12,
};

export const MainComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas con deslizamiento whip-pan real en las fronteras */}
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
              <Camera25D sceneStart={start} sceneEnd={end}>
                <Component />
              </Camera25D>
            </Sequence>
          </AbsoluteFill>
        );
      })}

      {/* Transiciones dinámicas entre escenas */}
      <SceneTransitions />

      {/* Subtítulos cinéticos palabra por palabra */}
      <KineticSubtitles />

      {/* Post-procesado VHS + HUD */}
      <VhsPostProcess />

      {/* Mezcla de audio */}
      <AudioMaster />
    </AbsoluteFill>
  );
};
