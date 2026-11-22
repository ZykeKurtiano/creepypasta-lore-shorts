import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./MainComposition";
import {
  COMP_ID,
  FPS,
  HEIGHT,
  TOTAL_FRAMES,
  WIDTH,
} from "./data/episodeConfig";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={COMP_ID}
      component={MainComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
