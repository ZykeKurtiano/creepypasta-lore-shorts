import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMaster } from "./components/AudioMaster";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SceneTransitions } from "./components/SceneTransitions";
import { VhsPostProcess } from "./components/VhsPostProcess";
import { SCENES } from "./data/episodeConfig";
import { ZalgoScene1Origin } from "./scenes/ZalgoScene1Origin";
import { ZalgoScene2Wall } from "./scenes/ZalgoScene2Wall";
import { ZalgoScene3War } from "./scenes/ZalgoScene3War";
import { ZalgoScene4Finale } from "./scenes/ZalgoScene4Finale";

/**
 * MainComposition — Orquestador maestro (Estándar v3, Bloque B).
 *
 * Monta las 4 escenas 2.5D de Zalgo en <Sequence> según `SCENES`. Cada escena
 * controla su propia cámara limpia (dolly-in / pull-back / pan lateral /
 * push-in) y sus transiciones espaciales internas (camera dive, foreground
 * wipe, colapso diagonal), por lo que NO se usa el viejo `Camera25D` de zoom
 * punches periódicos. Encima se apilan las transiciones globales, los
 * subtítulos cinéticos, el post-proceso VHS y la mezcla de audio.
 */

interface SceneSpec {
  start: number;
  end: number;
  Component: React.FC;
}

const SCENE_SPECS: SceneSpec[] = [
  {
    start: SCENES.scene1.start,
    end: SCENES.scene1.end,
    Component: ZalgoScene1Origin,
  },
  {
    start: SCENES.scene2.start,
    end: SCENES.scene2.end,
    Component: ZalgoScene2Wall,
  },
  {
    start: SCENES.scene3.start,
    end: SCENES.scene3.end,
    Component: ZalgoScene3War,
  },
  {
    start: SCENES.scene4.start,
    end: SCENES.scene4.end,
    Component: ZalgoScene4Finale,
  },
];

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      {/* Escenas 2.5D con cámara y transiciones espaciales propias */}
      {SCENE_SPECS.map(({ start, end, Component }, i) => (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          <Component />
        </Sequence>
      ))}

      {/* Transiciones espaciales globales entre escenas */}
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
