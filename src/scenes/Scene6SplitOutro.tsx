import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EyelessJackCharacter } from "../components/characters/EyelessJackCharacter";
import { JackNyrasCharacter } from "../components/characters/JackNyrasCharacter";
import { SafeCentered, FONT_MONO } from "../components/SafeZone";
import { IMPACT } from "../components/ui";

/**
 * Scene6SplitOutro (frames 2374–2701, ~10.9s) — Cierre y Debate: ¿Monstruo o Víctima?
 *
 * Pantalla dividida diagonal de alto contraste (CERO tarjetas estáticas):
 *  - Mitad izquierda: fondo abisal carmesí + Eyeless Jack (split_menace, bisturí).
 *  - Mitad derecha: fondo cobalto/pizarra + Jack Nyras (split_portrait, humano).
 *  - Línea divisoria diagonal luminosa con doble halo + cenizas cruzando.
 *  - Pregunta cinética "¿MONSTRUO O VÍCTIMA?" centrada en Zona Segura.
 */

const ASH = Array.from({ length: 16 }, (_, i) => ({
  t0: random(i * 7 + 1),
  drift: random(i * 11 + 3) * 10,
  r: 1.2 + random(i * 5 + 3) * 2.4,
  tone: i % 3,
}));

export const Scene6SplitOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Apertura limpia de la división diagonal con spring().
  const open = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 80 },
  });
  const lTop = interpolate(open, [0, 1], [50, 56], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lBot = interpolate(open, [0, 1], [50, 44], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const divTopX = (lTop / 100) * 1080;
  const divBotX = (lBot / 100) * 1080;

  // Entrada tipográfica con spring() escalonado.
  const ent = (delay: number) => {
    const p =
      frame >= delay
        ? spring({
            frame: frame - delay,
            fps,
            config: { damping: 200, mass: 0.7, stiffness: 120 },
          })
        : 0;
    const o = interpolate(p, [0, 0.4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ty = (1 - Math.min(1, p)) * 46;
    const sc = 0.9 + Math.min(1, p) * 0.1;
    return { o, ty, sc };
  };
  const a = ent(2);
  const b = ent(12);
  const c = ent(22);

  // Contraste dual inferior (aparece suavemente y se mantiene armónico).
  const labelOpacity = interpolate(frame, [26, 64], [0, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* ===== MITAD IZQUIERDA (carmesí abisal + Eyeless Jack) ===== */}
      <AbsoluteFill
        style={{
          clipPath: `polygon(0% 0%, ${lTop}% 0%, ${lBot}% 100%, 0% 100%)`,
          background:
            "radial-gradient(ellipse at 30% 40%, #1A0A10 0%, #0A060A 42%, #040507 100%)",
        }}
      >
        {/* Resplandor carmesí oscuro */}
        <div
          style={{
            position: "absolute",
            left: -200,
            top: 300,
            width: 900,
            height: 900,
            background:
              "radial-gradient(circle at 50% 50%, rgba(127,29,29,0.5), rgba(127,29,29,0.12) 55%, transparent 75%)",
            filter: "blur(6px)",
          }}
        />
        {/* Textura fotográfica 2009 sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)",
            opacity: 0.5,
          }}
        />
        <EyelessJackCharacter
          x={270}
          floorY={1490}
          scale={1.38}
          pose="split_menace"
          localFrame={frame}
          holdScalpel
          ichorIntensity={1.2}
          showFloorShadow={false}
          rimColor="#7F1D1D"
        />
      </AbsoluteFill>

      {/* ===== MITAD DERECHA (cobalto/pizarra + Jack Nyras) ===== */}
      <AbsoluteFill
        style={{
          clipPath: `polygon(${lTop}% 0%, 100% 0%, 100% 100%, ${lBot}% 100%)`,
          background:
            "radial-gradient(ellipse at 72% 42%, #12203A 0%, #0A1014 48%, #040507 100%)",
        }}
      >
        {/* Resplandor cobalto radial suave */}
        <div
          style={{
            position: "absolute",
            right: -220,
            top: 260,
            width: 900,
            height: 900,
            background:
              "radial-gradient(circle at 50% 50%, rgba(29,78,216,0.5), rgba(29,78,216,0.12) 55%, transparent 75%)",
            filter: "blur(6px)",
          }}
        />
        <JackNyrasCharacter
          x={810}
          floorY={1490}
          scale={1.38}
          variant="university_victim"
          pose="split_portrait"
          localFrame={frame}
          showFloorShadow={false}
        />
      </AbsoluteFill>

      {/* ===== LÍNEA DIVISORIA DIAGONAL LUMINOSA (doble halo) ===== */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <line
          x1={divTopX}
          y1="0"
          x2={divBotX}
          y2="1920"
          stroke="#3B82F6"
          strokeWidth={22}
          opacity={0.32}
        />
        <line
          x1={divTopX}
          y1="0"
          x2={divBotX}
          y2="1920"
          stroke="#DC2626"
          strokeWidth={4}
        />
        <line
          x1={divTopX}
          y1="0"
          x2={divBotX}
          y2="1920"
          stroke="#60A5FA"
          strokeWidth={1.5}
          opacity={0.8}
        />
      </svg>

      {/* Cenizas/luz cruzando la división */}
      {ASH.map((p, i) => {
        const s = (((p.t0 + frame * 0.004 + i * 0.071) % 1) + 1) % 1;
        const px = divTopX + (divBotX - divTopX) * s + Math.sin(frame * 0.05 + i) * p.drift;
        const py = s * 1920;
        const op = 0.25 + 0.55 * Math.abs(Math.sin(frame * 0.06 + i * 0.8));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: py,
              left: px,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: p.r,
              background:
                p.tone === 0 ? "#93C5FD" : p.tone === 1 ? "#F87171" : "#FDE047",
              opacity: op,
              boxShadow: "0 0 8px rgba(147,197,253,0.7)",
            }}
          />
        );
      })}

      {/* ===== PREGUNTA CINÉTICA CENTRADA EN ZONA SEGURA ===== */}
      <SafeCentered top={340} zIndex={50}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            columnGap: 20,
            fontFamily: IMPACT,
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: 1,
          }}
        >
          <span
            style={{
              color: "#DC2626",
              opacity: a.o,
              transform: `translateY(${a.ty}px) scale(${a.sc})`,
              textShadow: "0 7px 0 rgba(0,0,0,0.85), 0 0 48px rgba(220,38,38,0.5)",
            }}
          >
            ¿MONSTRUO
          </span>
          <span
            style={{
              color: "#F2EFE9",
              fontSize: 68,
              opacity: b.o,
              transform: `translateY(${b.ty}px) scale(${b.sc})`,
              textShadow: "0 6px 0 rgba(0,0,0,0.85)",
            }}
          >
            O
          </span>
          <span
            style={{
              color: "#FDE047",
              opacity: c.o,
              transform: `translateY(${c.ty}px) scale(${c.sc})`,
              textShadow: "0 7px 0 rgba(0,0,0,0.85), 0 0 48px rgba(253,224,71,0.45)",
            }}
          >
            VÍCTIMA<span style={{ color: "#60A5FA" }}>?</span>
          </span>
        </div>
      </SafeCentered>

      {/* ===== CONTRASTE DUAL INFERIOR (sin cajas, tipografía limpia) ===== */}
      <SafeCentered top={1125} zIndex={30}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            columnGap: 26,
            fontFamily: FONT_MONO,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: labelOpacity,
            textShadow: "0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <span style={{ color: "#F87171" }}>FOTO VIRAL 2009</span>
          <span style={{ color: "rgba(242,239,233,0.45)" }}>//</span>
          <span style={{ color: "#93C5FD" }}>RITUAL CHERNOBOG</span>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
