import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { JackNyrasCharacter } from "../components/characters/JackNyrasCharacter";
import { CultistCharacter } from "../components/characters/CultistCharacter";
import { SCENES, SFX_CUES } from "../data/episodeConfig";

/**
 * Scene3ChernobogRitual (frames 1489–1723, ~7.8s) — El Ritual de Chernobog.
 *
 * Claro del bosque nocturno en 3 capas: fondo de pinos profundos, luna fría
 * velada por bruma, círculo de monolitos y 2 cultistas con antorchas; medio
 * con la losa/altar de piedra negra, Jack Nyras atado (pose altar_bound) y un
 * cultista vertiendo alquitrán hirviendo (2-Bone IK delante del cáliz); y
 * primer plano con ramas de pino en silueta y brasas/cenizas ascendentes.
 */

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  x: 200 + random(i * 3 + 1) * 680,
  y0: 1200 + random(i * 7 + 2) * 300,
  r: 1.4 + random(i * 5 + 3) * 1.8,
  speed: 0.3 + random(i * 9 + 4) * 0.6,
  phase: random(i * 13 + 5) * 300,
}));

export const Scene3ChernobogRitual: React.FC = () => {
  const frame = useCurrentFrame();
  const localDripFrame = SFX_CUES.ritualDripFrame - SCENES.scene3.start;

  // Vierte alquitrán (90..195, pico en localDripFrame=160).
  const pourProgress = interpolate(frame, [90, localDripFrame, 195], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // El alquitrán cubre las cuencas de Jack (110..195).
  const tarCoverProgress = interpolate(frame, [110, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // La máscara azul cobalto emerge/cristaliza (150..234).
  const maskFormationProgress = interpolate(frame, [150, 234], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Halo cálido pulsante de las antorchas.
  const torchPulse = 0.75 + 0.25 * Math.sin(frame * 0.13);

  // Parallax de capas (la cámara global ya aporta movimiento).
  const bgDrift = Math.sin(frame * 0.004) * 8;
  const fgDrift = Math.sin(frame * 0.012) * 16;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* ===== BACKGROUND (parallax lento) ===== */}
      <AbsoluteFill style={{ transform: `translateX(${bgDrift}px)` }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #05070B 0%, #0A1014 55%, #040507 100%)" }} />

        {/* Luna fría velada por bruma */}
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 360,
            width: 200,
            height: 200,
            borderRadius: 100,
            background: "radial-gradient(circle, rgba(226,238,248,0.85), rgba(150,180,210,0.2) 70%, transparent)",
            filter: "blur(6px)",
            opacity: 0.7,
          }}
        />
        <div style={{ position: "absolute", top: 130, left: 300, width: 320, height: 90, background: "rgba(43,58,66,0.35)", filter: "blur(18px)" }} />

        {/* Bosque de pinos profundos (anillo) */}
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <path d="M 0 1500 L 80 700 L 160 1500 Z" fill="#04060A" />
          <path d="M 120 1500 L 210 820 L 300 1500 Z" fill="#030509" />
          <path d="M 780 1500 L 870 760 L 960 1500 Z" fill="#04060A" />
          <path d="M 900 1500 L 990 820 L 1080 1500 Z" fill="#030509" />
          <path d="M 0 1500 L 60 1000 L 120 1500 Z" fill="#05080C" />
          <path d="M 960 1500 L 1020 1000 L 1080 1500 Z" fill="#05080C" />
        </svg>

        {/* Círculo de monolitos oscuros */}
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <path d="M 200 1320 L 232 1160 L 264 1320 Z" fill="#0A0E15" />
          <path d="M 180 1330 L 210 1180 L 240 1330 Z" fill="#070A0F" />
          <path d="M 820 1320 L 852 1160 L 884 1320 Z" fill="#0A0E15" />
          <path d="M 850 1330 L 880 1180 L 910 1330 Z" fill="#070A0F" />
          <path d="M 500 1240 L 528 1090 L 556 1240 Z" fill="#0A0E15" />
        </svg>

        {/* 2 cultistas secundarios con antorchas + halos cálidos */}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <CultistCharacter x={260} floorY={1320} scale={0.32} pose="hold_torch" localFrame={frame} showFloorShadow={false} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <CultistCharacter x={820} floorY={1320} scale={0.32} facing={-1} pose="hold_torch" localFrame={frame} showFloorShadow={false} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 970,
            left: 140,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,135,30,0.34) 0%, rgba(180,65,30,0.12) 40%, transparent 68%)",
            opacity: torchPulse,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 970,
            left: 680,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,135,30,0.34) 0%, rgba(180,65,30,0.12) 40%, transparent 68%)",
            opacity: torchPulse,
          }}
        />
      </AbsoluteFill>

      {/* ===== MIDGROUND (floorY = 1440) ===== */}
      {/* Altar de piedra negra: losa superior en y=1040 sobre dos pilares de basalto */}
      <div style={{ position: "absolute", top: 1040, left: 300, width: 460, height: 36 }}>
        <div style={{ position: "absolute", left: -16, top: 0, width: 492, height: 36, background: "linear-gradient(180deg, #1A212B, #0E141B)", borderRadius: "10px 10px 0 0" }} />
        <div style={{ position: "absolute", left: -16, top: 20, width: 492, height: 16, background: "linear-gradient(180deg, #0C1118, #070A0E)" }} />
        <svg width="492" height="36" viewBox="0 0 492 36" style={{ position: "absolute", left: -16, top: 0 }}>
          <g stroke="#131A24" strokeWidth={1.4} fill="none" opacity={0.5}>
            <path d="M 40 4 C 46 16, 40 24, 48 34" />
            <path d="M 180 4 C 176 18, 184 26, 178 34" />
            <path d="M 320 4 C 326 16, 320 24, 328 34" />
            <path d="M 440 4 C 444 16, 438 24, 444 34" />
          </g>
          <path d="M 0 20 L 492 20" stroke="#2B3A42" strokeWidth={1.5} opacity={0.6} />
        </svg>
      </div>
      {/* Pilares robustos de basalto apoyados firmemente en el suelo floorY=1440 */}
      <div style={{ position: "absolute", top: 1076, left: 330, width: 90, height: 364, background: "linear-gradient(180deg, #0C1118, #070A0E)", borderRadius: "6px 6px 0 0" }} />
      <div style={{ position: "absolute", top: 1076, left: 640, width: 90, height: 364, background: "linear-gradient(180deg, #0C1118, #070A0E)", borderRadius: "6px 6px 0 0" }} />
      <div style={{ position: "absolute", top: 1076, left: 330, width: 90, height: 364, background: "linear-gradient(90deg, transparent 0%, #131A24 18%, transparent 40%)", opacity: 0.5 }} />
      <div style={{ position: "absolute", top: 1076, left: 640, width: 90, height: 364, background: "linear-gradient(90deg, transparent 0%, #131A24 18%, transparent 40%)", opacity: 0.5 }} />
      {/* Sombra de contacto del altar en el suelo */}
      <div style={{ position: "absolute", left: 280, top: 1440, width: 500, height: 28, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75), transparent 70%)" }} />

      {/* Jack Nyras atado sobre la losa (pose altar_bound, acostado horizontalmente, CERO flotación) */}
      <JackNyrasCharacter
        x={460}
        floorY={1045}
        scale={1.05}
        facing={-1}
        variant="university_victim"
        pose="altar_bound"
        localFrame={frame}
        tarCoverProgress={tarCoverProgress}
        maskFormationProgress={maskFormationProgress}
      />

      {/* Cultista vertiendo alquitrán (2-Bone IK, frontArm delante del cáliz) */}
      <CultistCharacter
        x={700}
        floorY={1440}
        scale={1.15}
        facing={-1}
        pose="pour_tar"
        localFrame={frame}
        pourProgress={pourProgress}
      />

      {/* Resplandor frío de la máscara al cristalizar */}
      {maskFormationProgress > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 360,
            top: 800,
            width: 320,
            height: 320,
            background: "radial-gradient(circle at 50% 55%, rgba(96,165,250,0.4), rgba(29,78,216,0.18) 55%, transparent 75%)",
            opacity: maskFormationProgress * 0.8,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* ===== FOREGROUND (parallax rápido) ===== */}
      <AbsoluteFill style={{ transform: `translateX(${fgDrift}px)` }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <path d="M -40 300 C 60 260, 120 300, 170 360 L 150 420 C 90 380, 20 380, -40 420 Z" fill="#020306" opacity={0.9} />
          <path d="M 1120 360 C 1020 320, 960 360, 910 420 L 930 480 C 990 440, 1060 440, 1120 480 Z" fill="#020306" opacity={0.9} />
        </svg>
        {/* Brasas y cenizas ascendentes */}
        {EMBERS.map((e, i) => {
          const y = e.y0 - ((frame * e.speed + e.phase) % 500);
          const op = 0.25 + 0.55 * Math.abs(Math.sin(frame * 0.09 + i * 0.8));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: e.x,
                width: e.r * 2,
                height: e.r * 2,
                borderRadius: e.r,
                background: i % 3 === 0 ? "#E8871E" : "#B4411E",
                opacity: op * (1 - maskFormationProgress * 0.3),
                boxShadow: "0 0 6px rgba(232,135,30,0.6)",
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
