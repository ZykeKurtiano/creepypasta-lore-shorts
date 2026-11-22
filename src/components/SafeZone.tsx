import React from "react";

/**
 * Wrapper de centrado estricto obligatorio (AGENTS.md §3 y §6.1).
 * Todo texto/HUD debe montarse con este contenedor:
 *   left: 0, right: 0, width: "100%", display: "flex",
 *   justifyContent: "center", textAlign: "center", paddingInline: 90.
 * El contenido interno se limita a maxWidth 740 → queda centrado en
 * x=540 (rango x: [170, 910]) y nunca invade la columna derecha de
 * iconos de YouTube Shorts (x >= 918).
 */
export const SAFE_PADDING = 90;
export const SAFE_MAX_WIDTH = 740;

export const SafeCentered: React.FC<
  React.PropsWithChildren<{
    top: number;
    zIndex?: number;
    maxWidth?: number;
  }>
> = ({ top, zIndex, maxWidth = SAFE_MAX_WIDTH, children }) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        paddingInline: SAFE_PADDING,
        boxSizing: "border-box",
        zIndex,
      }}
    >
      <div style={{ width: "100%", maxWidth }}>{children}</div>
    </div>
  );
};

export const FONT_SANS =
  '"Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif';
export const FONT_MONO =
  'Consolas, "Courier New", ui-monospace, monospace';
