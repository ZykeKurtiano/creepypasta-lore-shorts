import React from "react";
import { random } from "remotion";

/** Tipografías del sistema (offline, deterministas en render local) */
export const IMPACT =
  "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'Arial Black', sans-serif";
export const MONO = "'Consolas', 'Courier New', monospace";
export const HANDWRITING = "'Segoe Script', 'Bradley Hand', cursive";

/** Panel frosted oscuro reutilizable (archivo paranormal / dossier) */
export const Panel: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ style, children }) => {
  return (
    <div
      style={{
        background: "rgba(8, 11, 16, 0.82)",
        border: "1px solid rgba(43, 58, 66, 0.9)",
        boxShadow:
          "0 18px 60px rgba(0, 0, 0, 0.55), inset 0 0 40px rgba(22, 33, 41, 0.35)",
        borderRadius: 12,
        padding: 26,
        backdropFilter: "blur(6px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Parpadeo determinista (cambia cada 6 frames, sin Math.random) */
export const Flicker: React.FC<{
  frame: number;
  seed?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ frame, seed = 0, style, children }) => {
  const f = random(Math.floor(frame / 6) * 31 + seed * 977);
  const opacity = f > 0.55 ? 1 : 0.84 - f * 0.28;
  return <span style={{ opacity, ...style }}>{children}</span>;
};
