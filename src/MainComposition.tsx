import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { Camera25D, CameraIntent } from "./components/Camera25D";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES, TOTAL_FRAMES } from "./data/episodeConfig";
import { BenScene1Cartridge } from "./scenes/BenScene1Cartridge";
import { BenScene2StatueFire } from "./scenes/BenScene2StatueFire";
import { BenScene3Origin4chan } from "./scenes/BenScene3Origin4chan";
import { BenScene4HouseRetake } from "./scenes/BenScene4HouseRetake";
import { BenScene5TruthWater } from "./scenes/BenScene5TruthWater";
import { BenScene6DebateOutro } from "./scenes/BenScene6DebateOutro";

/**
 * MainComposition — Orquestador maestro del Short BEN Drowned.
 *
 * Monta las 6 escenas 2.5D en <Sequence> usando los límites exactos de
 * SCENES, envuelve cada una con Camera25D (deriva ultra-suave por
 * intención + micro-impactos puntuales de zoomPunch), mantiene un
 * solapamiento limpio de transición (OVERLAP = 16 frames) para que
 * jamás exista un corte seco ni un frame vacío, y apila encima las
 * transiciones globales, subtítulos cinéticos, post-proceso VHS y la
 * mezcla de audio.
 */

/** Solapamiento limpio entre escenas (jamás un corte seco). */
const OVERLAP = 16;

interface SceneSpec {
  start: number;
  end: number;
  intent: CameraIntent;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: SCENES.scene1.start, end: SCENES.scene1.end, intent: "steady", Component: BenScene1Cartridge },
  { start: SCENES.scene2.start, end: SCENES.scene2.end, intent: "pan", Component: BenScene2StatueFire },
  { start: SCENES.scene3.start, end: SCENES.scene3.end, intent: "push", Component: BenScene3Origin4chan },
  { start: SCENES.scene4.start, end: SCENES.scene4.end, intent: "dolly", Component: BenScene4HouseRetake },
  { start: SCENES.scene5.start, end: SCENES.scene5.end, intent: "push", Component: BenScene5TruthWater },
  { start: SCENES.scene6.start, end: SCENES.scene6.end, intent: "push", Component: BenScene6DebateOutro },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas 1–6 con solapamiento limpio (las posteriores se apilan encima) */}
      {SCENE_SPECS.map(({ start, end, intent, Component }, i) => {
        const isLast = i === SCENE_SPECS.length - 1;
        const durationInFrames = isLast
          ? TOTAL_FRAMES - start
          : end - start + OVERLAP;
        return (
          <Sequence
            key={i}
            from={start}
            durationInFrames={durationInFrames}
            name={`ben-scene-${i + 1}`}
          >
            <Camera25D sceneStart={start} sceneEnd={end} intent={intent}>
              <Component />
            </Camera25D>
          </Sequence>
        );
      })}

      {/* Transiciones dinámicas globales entre escenas */}
      <SceneTransitions />

      {/* Subtítulos cinéticos palabra por palabra (zona segura top 1235) */}
      <KineticSubtitles />

      {/* Post-procesado VHS + HUD diegético */}
      <VhsPostProcess />

      {/* Mezcla de audio */}
      <AudioMaster />
    </AbsoluteFill>
  );
};
