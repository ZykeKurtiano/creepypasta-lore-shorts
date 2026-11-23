import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { Camera25D } from "./components/Camera25D";
import type { CameraIntention } from "./components/Camera25D";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES, TOTAL_FRAMES } from "./data/episodeConfig";
import { Scene1MitchBedroom } from "./scenes/Scene1MitchBedroom";
import { Scene2Origins2009 } from "./scenes/Scene2Origins2009";
import { Scene3ChernobogRitual } from "./scenes/Scene3ChernobogRitual";
import { Scene4PredatorStalk } from "./scenes/Scene4PredatorStalk";
import { Scene5JackAgony } from "./scenes/Scene5JackAgony";
import { Scene6SplitOutro } from "./scenes/Scene6SplitOutro";

/**
 * MainComposition — Orquestador maestro (Estándar v5).
 *
 * Monta las 6 escenas 2.5D en <Sequence> contiguas (frame 0 → TOTAL_FRAMES sin
 * huecos), envuelve cada una con Camera25D usando una ÚNICA intención de cámara
 * suave y distinta por escena, y apila encima las transiciones continuas, los
 * subtítulos cinéticos, el post-procesado VHS y la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
  intention: CameraIntention;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: SCENES.scene1.start, end: SCENES.scene1.end, Component: Scene1MitchBedroom, intention: "dolly_in" },
  { start: SCENES.scene2.start, end: SCENES.scene2.end, Component: Scene2Origins2009, intention: "pan_right" },
  { start: SCENES.scene3.start, end: SCENES.scene3.end, Component: Scene3ChernobogRitual, intention: "z_advance" },
  { start: SCENES.scene4.start, end: SCENES.scene4.end, Component: Scene4PredatorStalk, intention: "subtle_push" },
  { start: SCENES.scene5.start, end: SCENES.scene5.end, Component: Scene5JackAgony, intention: "steady_tension" },
  { start: SCENES.scene6.start, end: TOTAL_FRAMES, Component: Scene6SplitOutro, intention: "dramatic_lock" },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas contiguas con continuidad absoluta de frame 0 a TOTAL_FRAMES */}
      {SCENE_SPECS.map(({ start, end, Component, intention }) => (
        <Sequence key={start} from={start} durationInFrames={end - start}>
          <Camera25D sceneStart={start} sceneEnd={end} intention={intention}>
            <Component />
          </Camera25D>
        </Sequence>
      ))}

      {/* Transiciones cinematográficas continuas estilo Kurzgesagt oscuro */}
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
