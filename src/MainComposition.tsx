import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  ACT1_END,
  ACT2_END,
  ACT2_START,
  ACT3_END,
  ACT3_START,
  ACT4_END,
  ACT4_START,
  TOTAL_FRAMES,
} from "./data/episodeConfig";
import { AudioMaster } from "./components/AudioMaster";
import { ForestParallax25D } from "./components/ForestParallax25D";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { VhsPostProcess, getGlitchIntensity } from "./components/VhsPostProcess";
import { Act1Hook } from "./scenes/Act1Hook";
import { Act2Origin } from "./scenes/Act2Origin";
import { Act3Abilities } from "./scenes/Act3Abilities";
import { Act4Outro } from "./scenes/Act4Outro";

/**
 * MainComposition.tsx — Orquestador maestro:
 * bosque 2.5D con mood por acto, las 4 escenas en <Sequence>,
 * subtítulos cinéticos, post-procesado VHS y mezcla de audio.
 */

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const MainComposition: React.FC = () => {
  const frame = useCurrentFrame();

  // Mood del bosque interpolado a lo largo de los 4 actos
  const cameraZoom = interpolate(
    frame,
    [0, ACT2_START, ACT3_START, ACT4_START, TOTAL_FRAMES],
    [0.55, 0.42, 0.62, 0.8, 1],
    clamp
  );
  const fogDensity = interpolate(
    frame,
    [0, ACT2_START, ACT3_START, ACT4_START, TOTAL_FRAMES],
    [0.92, 0.72, 0.86, 0.96, 1],
    clamp
  );
  const redTint = interpolate(
    frame,
    [0, ACT2_START, ACT3_START, ACT4_START, TOTAL_FRAMES],
    [0.05, 0.12, 0.3, 0.52, 0.66],
    clamp
  );
  const cameraShake = interpolate(
    frame,
    [0, ACT2_START, ACT3_START, ACT4_START, TOTAL_FRAMES],
    [0.2, 0.14, 0.34, 0.55, 0.42],
    clamp
  );

  // Desplazamiento VHS del mundo (cuantizado) en picos de glitch
  const g = getGlitchIntensity(frame);
  const jx = Math.round(Math.sin(frame * 3.1) * 2.4) * 6 * g;
  const jy = Math.round(Math.sin(frame * 2.7 + 1.1) * 1.8) * 4 * g;

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${jx}px, ${jy}px)`,
        }}
      >
        <ForestParallax25D
          cameraZoom={cameraZoom}
          fogDensity={fogDensity}
          redTint={redTint}
          cameraShake={cameraShake}
        />
        <Sequence from={0} durationInFrames={ACT1_END}>
          <Act1Hook />
        </Sequence>
        <Sequence
          from={ACT2_START}
          durationInFrames={ACT2_END - ACT2_START}
        >
          <Act2Origin />
        </Sequence>
        <Sequence
          from={ACT3_START}
          durationInFrames={ACT3_END - ACT3_START}
        >
          <Act3Abilities />
        </Sequence>
        <Sequence
          from={ACT4_START}
          durationInFrames={ACT4_END - ACT4_START}
        >
          <Act4Outro />
        </Sequence>
      </div>

      <KineticSubtitles />
      <VhsPostProcess />
      <AudioMaster />
    </AbsoluteFill>
  );
};
