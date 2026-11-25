import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES } from "./data/episodeConfig";
import { Scene1WakeupBed } from "./scenes/Scene1WakeupBed";
import { Scene2Archive2003 } from "./scenes/Scene2Archive2003";
import { Scene3AnatomyForest } from "./scenes/Scene3AnatomyForest";
import { Scene4FamilyRecorder } from "./scenes/Scene4FamilyRecorder";
import { Scene5ItalyParasite } from "./scenes/Scene5ItalyParasite";
import { Scene6SplitDebate } from "./scenes/Scene6SplitDebate";

/**
 * MainComposition — Orquestador maestro (The Rake / El Rastrillo).
 *
 * Monta las 6 escenas 2.5D en <Sequence> (sin el viejo Camera25D de Smile Dog:
 * cada escena controla su propia cámara multi-plano y Macro-Zooms con total
 * precisión) y apila encima transiciones ancladas a objetos, subtítulos
 * cinéticos, post-proceso VHS y la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: SCENES.scene1.start, end: SCENES.scene1.end, Component: Scene1WakeupBed },
  { start: SCENES.scene2.start, end: SCENES.scene2.end, Component: Scene2Archive2003 },
  { start: SCENES.scene3.start, end: SCENES.scene3.end, Component: Scene3AnatomyForest },
  { start: SCENES.scene4.start, end: SCENES.scene4.end, Component: Scene4FamilyRecorder },
  { start: SCENES.scene5.start, end: SCENES.scene5.end, Component: Scene5ItalyParasite },
  { start: SCENES.scene6.start, end: SCENES.scene6.end, Component: Scene6SplitDebate },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas 2.5D (tiempo local exacto desde cada start) */}
      {SCENE_SPECS.map(({ start, end, Component }, i) => (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          <Component />
        </Sequence>
      ))}

      {/* Transiciones ancladas a objetos */}
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
