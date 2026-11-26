import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { Camera25D } from "./components/Camera25D";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES } from "./data/episodeConfig";
import { Scene1BedroomHook } from "./scenes/Scene1BedroomHook";
import { Scene2LavenderTower } from "./scenes/Scene2LavenderTower";
import { Scene3BinauralCode731 } from "./scenes/Scene3BinauralCode731";
import { Scene4RetakeFile047 } from "./scenes/Scene4RetakeFile047";
import { Scene5EmptyVoid } from "./scenes/Scene5EmptyVoid";
import { Scene6SplitOutro } from "./scenes/Scene6SplitOutro";

/**
 * MainComposition — Orquestador maestro (Estándar v9).
 *
 * Monta las 6 escenas 2.5D en <Sequence>, envuelve cada una con la
 * Camera25D (handheld + zoom punches) y apila encima las transiciones
 * limpias ancladas a objetos (<SceneTransitions />), los subtítulos
 * cinéticos, el post-procesado VHS y la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: SCENES.scene1.start, end: SCENES.scene1.end, Component: Scene1BedroomHook },
  { start: SCENES.scene2.start, end: SCENES.scene2.end, Component: Scene2LavenderTower },
  { start: SCENES.scene3.start, end: SCENES.scene3.end, Component: Scene3BinauralCode731 },
  { start: SCENES.scene4.start, end: SCENES.scene4.end, Component: Scene4RetakeFile047 },
  { start: SCENES.scene5.start, end: SCENES.scene5.end, Component: Scene5EmptyVoid },
  { start: SCENES.scene6.start, end: SCENES.scene6.end, Component: Scene6SplitOutro },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas 2.5D con cámara continua */}
      {SCENE_SPECS.map(({ start, end, Component }, i) => (
        <Sequence
          key={i}
          from={start}
          durationInFrames={end - start}
        >
          <Camera25D sceneStart={start} sceneEnd={end}>
            <Component />
          </Camera25D>
        </Sequence>
      ))}

      {/* Transiciones limpias ancladas a objetos */}
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
