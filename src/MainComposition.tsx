import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES } from "./data/episodeConfig";
import { Scene1SonicR1997 } from "./scenes/Scene1SonicR1997";
import { Scene2Curse1983To1998 } from "./scenes/Scene2Curse1983To1998";
import { Scene3RealOrigin2000s } from "./scenes/Scene3RealOrigin2000s";
import { Scene4Ps2PrototypeRetake } from "./scenes/Scene4Ps2PrototypeRetake";
import { Scene5HallwayStalking } from "./scenes/Scene5HallwayStalking";
import { Scene6SplitDebateOutro } from "./scenes/Scene6SplitDebateOutro";

/**
 * MainComposition — Orquestador maestro (Estándar v6).
 *
 * Monta las 6 escenas 2.5D en <Sequence> directamente, SIN el viejo
 * whip-pan lateral de Smile Dog ni Camera25D con shake periódico: cada
 * escena implementa su propia coreografía Multi-Plano y Macro-Zooms
 * (2.2x–3.2x) con `cameraAt`/`cameraTransform` internos. Encima se apilan
 * las transiciones con zoom continuo, subtítulos cinéticos, post-proceso
 * VHS y la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  { start: SCENES.scene1.start, end: SCENES.scene1.end, Component: Scene1SonicR1997 },
  { start: SCENES.scene2.start, end: SCENES.scene2.end, Component: Scene2Curse1983To1998 },
  { start: SCENES.scene3.start, end: SCENES.scene3.end, Component: Scene3RealOrigin2000s },
  { start: SCENES.scene4.start, end: SCENES.scene4.end, Component: Scene4Ps2PrototypeRetake },
  { start: SCENES.scene5.start, end: SCENES.scene5.end, Component: Scene5HallwayStalking },
  { start: SCENES.scene6.start, end: SCENES.scene6.end, Component: Scene6SplitDebateOutro },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas 2.5D con su propia coreografía Multi-Plano y Macro-Zooms */}
      {SCENE_SPECS.map(({ start, end, Component }, i) => (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          <Component />
        </Sequence>
      ))}

      {/* Transiciones con zoom continuo (Gem-Dive, Pupil-Dive, Whip-Zoom, …) */}
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
