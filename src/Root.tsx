import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./MainComposition";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./data/episodeConfig";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SlendermanLoreShort"
        component={MainComposition}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
