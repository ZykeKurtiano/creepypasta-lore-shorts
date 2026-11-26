import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FONT_MONO } from "./SafeZone";

/**
 * SceneTransitions — Transiciones limpias ancladas a objetos (Estándar v9),
 * exactamente en las 5 fronteras de `SCENES` (frames globales):
 *
 *  - 556  (Escena 1 → 2) Screen-Dive Zoom: zoom inmersivo entrando en el marco
 *         verde-negro #84CC16/#040507 de la pantalla de Game Boy (16 frames).
 *  - 1082 (Escena 2 → 3) Barrido de onda sonora violeta #A78BFA/#C084FC
 *         horizontal con estela suave (14 frames).
 *  - 1512 (Escena 3 → 4) Carpetazo / Page-Flip: barrido rígido tipo expediente
 *         con borde iluminado girando hacia el Archivo 047 (14 frames).
 *  - 1919 (Escena 4 → 5) Zoom-Out suave apagando consola: colapso horizontal
 *         a un punto blanco-lavanda y fundido al cuarto oscuro (14 frames).
 *  - 2145 (Escena 5 → 6) Divisor diagonal violeta/índigo #A78BFA/#4F46E5 que
 *         corta el encuadre y abre la pantalla dividida final (16 frames).
 */

/** Progreso 0→1 de una transición de `dur` frames centrada en `center`. */
const windowProgress = (
  frame: number,
  center: number,
  dur: number
): number =>
  interpolate(frame, [center - dur / 2, center + dur / 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const ScreenDive: React.FC<{ p: number }> = ({ p }) => {
  // El marco de la pantalla crece hasta tragarse la cámara.
  const scale = interpolate(p, [0, 1], [0.22, 3.2], {
    easing: Easing.in(Easing.cubic),
  });
  const black = interpolate(p, [0.05, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Fondo que se apaga hacia el interior de la pantalla */}
      <AbsoluteFill style={{ background: "#040507", opacity: black }} />
      {/* Marco verde-negro de la pantalla de Game Boy */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 420,
          height: 320,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#040507",
            border: "12px solid #84CC16",
            borderRadius: 18,
            boxShadow: "0 0 120px rgba(132,204,22,0.65), inset 0 0 80px rgba(132,204,22,0.25)",
          }}
        />
        {/* Rejilla retro 8-bit del interior */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            background:
              "repeating-linear-gradient(to bottom, rgba(132,204,22,0.16) 0 2px, transparent 2px 12px), repeating-linear-gradient(to right, rgba(132,204,22,0.12) 0 2px, transparent 2px 12px)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const WaveSweep: React.FC<{ p: number }> = ({ p }) => {
  // Barrido de onda sonora violeta con estela.
  const crests = [0, 1, 2, 3, 4];
  const leadX = interpolate(p, [0, 1], [-120, 1160], {
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "screen" }}>
      {crests.map((k) => {
        const x = interpolate(p, [0, 1], [-260 + k * 120, 1080 + k * 60], {
          easing: Easing.inOut(Easing.quad),
        });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              top: -80,
              left: x,
              width: 90 + k * 30,
              height: 2080,
              background:
                "linear-gradient(90deg, transparent, rgba(192,132,252,0.34), transparent)",
              filter: "blur(12px)",
            }}
          />
        );
      })}
      {/* Borde luminoso de la onda */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: leadX,
          width: 6,
          height: 1920,
          background:
            "linear-gradient(180deg, transparent, #A78BFA, #C084FC, transparent)",
          boxShadow: "0 0 42px rgba(167,139,250,0.95)",
          filter: "blur(1px)",
        }}
      />
    </AbsoluteFill>
  );
};

const PageFlip: React.FC<{ p: number }> = ({ p }) => {
  // Barrido rígido tipo expediente con borde iluminado + sello Archivo 047.
  const x = interpolate(p, [0, 1], [-140, 1160], {
    easing: Easing.inOut(Easing.cubic),
  });
  const stamp = interpolate(p, [0.45, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Página rígida del expediente */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: x,
          width: 460,
          height: 1920,
          background: "linear-gradient(90deg, #0B0A18, #171426 60%, #0B0A18)",
          transform: "skewY(-2deg)",
          boxShadow: "0 0 80px rgba(0,0,0,0.85)",
        }}
      />
      {/* Borde iluminado que gira */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: x + 452,
          width: 14,
          height: 1920,
          background: "linear-gradient(180deg, transparent, #A78BFA, transparent)",
          boxShadow: "0 0 46px rgba(167,139,250,0.9)",
        }}
      />
      {/* Sello cinético ARCHIVO 047 */}
      {stamp > 0.01 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            paddingTop: 640,
            opacity: stamp,
            transform: `scale(${0.9 + stamp * 0.1})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: 8,
              color: "#F2EFE9",
              border: "3px solid #DC2626",
              padding: "14px 34px",
              transform: "rotate(-3deg)",
              background: "rgba(4,5,7,0.72)",
              boxShadow: "0 0 40px rgba(220,38,38,0.35)",
            }}
          >
            ARCHIVO 047
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const ConsoleOff: React.FC<{ p: number }> = ({ p }) => {
  // Colapso horizontal a un punto blanco-lavanda y fundido al cuarto oscuro.
  const converge = interpolate(p, [0, 0.55], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineGlow = interpolate(p, [0.4, 0.62, 0.8], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blackout = interpolate(p, [0.62, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barTop = converge * 905;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Barras negras que convergen al centro */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: barTop,
          background: "#020306",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: barTop,
          background: "#020306",
        }}
      />
      {/* Línea blanca-lavanda de la pantalla que se apaga */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 958,
          height: 4,
          background:
            "linear-gradient(90deg, transparent, #EDE9FE, #A78BFA, transparent)",
          boxShadow: "0 0 60px rgba(167,139,250,0.95)",
          opacity: lineGlow,
        }}
      />
      {/* Fundido al cuarto oscuro */}
      <AbsoluteFill style={{ background: "#040507", opacity: blackout }} />
    </AbsoluteFill>
  );
};

const DiagonalDivider: React.FC<{ p: number }> = ({ p }) => {
  // Haz diagonal que corta el encuadre y abre la pantalla dividida.
  const t = interpolate(p, [0, 1], [-0.5, 1.5], {
    easing: Easing.inOut(Easing.quad),
  });
  // Línea que recorre de esquina inferior-izquierda a superior-derecha.
  const x0 = -300;
  const y0 = 1620;
  const x1 = 1380;
  const y1 = 300;
  const bx = x0 + (x1 - x0) * t;
  const by = y0 + (y1 - y0) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "screen" }}>
      {/* Estela diagonal */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          background:
            "linear-gradient(115deg, transparent 42%, rgba(167,139,250,0.28) 50%, rgba(79,70,229,0.28) 58%, transparent 66%)",
          opacity: interpolate(p, [0, 1], [0, 1]),
        }}
      />
      {/* Haz principal móvil */}
      <div
        style={{
          position: "absolute",
          width: 30,
          height: 2600,
          left: bx - 15,
          top: by - 1300,
          background:
            "linear-gradient(180deg, transparent, #A78BFA, #4F46E5, transparent)",
          transform: "rotate(45deg)",
          transformOrigin: "center",
          boxShadow: "0 0 70px rgba(167,139,250,0.9)",
          filter: "blur(1px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  const p556 = windowProgress(frame, 556, 16);
  const p1082 = windowProgress(frame, 1082, 14);
  const p1512 = windowProgress(frame, 1512, 14);
  const p1919 = windowProgress(frame, 1919, 14);
  const p2145 = windowProgress(frame, 2145, 16);

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
      {p556 > 0 && p556 < 1 ? <ScreenDive p={p556} /> : null}
      {p1082 > 0 && p1082 < 1 ? <WaveSweep p={p1082} /> : null}
      {p1512 > 0 && p1512 < 1 ? <PageFlip p={p1512} /> : null}
      {p1919 > 0 && p1919 < 1 ? <ConsoleOff p={p1919} /> : null}
      {p2145 > 0 && p2145 < 1 ? <DiagonalDivider p={p2145} /> : null}
    </AbsoluteFill>
  );
};
