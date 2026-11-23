import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { EyelessJackCharacter } from "../components/characters/EyelessJackCharacter";
import { JackNyrasCharacter } from "../components/characters/JackNyrasCharacter";
import { SCENES, SFX_CUES } from "../data/episodeConfig";

/**
 * Scene5JackAgony (frames 1981–2374, ~13.1s) — Retake 2: La Agonía de Jack Nyras.
 *
 * Interior en penumbra de un dormitorio mirando a una gran ventana de guillotina
 * entreabierta, en 3 capas 2.5D:
 *  - background (parallax lento): noche fría azulada vista a través del cristal.
 *  - midground (floorY = 1450): pared interior + ventana de madera oscura con hoja
 *    inferior entreabierta (openGap animado), reflejo humano traslúcido de Jack
 *    Nyras recortado exactamente al vidrio, y Eyeless Jack en primer término cuya
 *    mano enguantada aterriza con 2-Bone IK sobre la cara interior del marco.
 *  - foreground (parallax rápido): cortinas ondulantes y motas de polvo.
 */

const FLOOR_Y = 1480;

const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: 90 + random(i * 5 + 1) * 900,
  y0: 400 + random(i * 7 + 2) * 1100,
  r: 1.4 + random(i * 5 + 3) * 2,
  speed: 0.1 + random(i * 9 + 4) * 0.2,
  phase: random(i * 13 + 5) * 400,
}));

export const Scene5JackAgony: React.FC = () => {
  const frame = useCurrentFrame();
  const localHeartbeatFrame = SFX_CUES.windowHeartbeatFrame - SCENES.scene5.start; // 321

  // Apertura de la hoja inferior (se entreabre suavemente al final).
  const openGap = 14 + interpolate(frame, [300, 370], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulso suave de luz lunar en el latido (resalta la abertura y el reflejo).
  const hb = interpolate(
    frame,
    [localHeartbeatFrame, localHeartbeatFrame + 9, localHeartbeatFrame + 41],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // El reflejo aparta lentamente la mano del marco tras el latido.
  const pullAway = interpolate(
    frame,
    [localHeartbeatFrame, localHeartbeatFrame + 67],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const reflectionReach = {
    x: interpolate(pullAway, [0, 1], [262, 250], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    y: interpolate(pullAway, [0, 1], [240, 302], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };

  // Parallax.
  const bgDrift = Math.sin(frame * 0.003) * 6;
  const fgDrift = Math.sin(frame * 0.01) * 14;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* ===== BACKGROUND (parallax lento 0.2×) — noche fría a través del cristal ===== */}
      <AbsoluteFill style={{ transform: `translateX(${bgDrift}px)` }}>
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #0A1118 0%, #0B1620 45%, #070C12 100%)",
          }}
        />
        {/* Noche vista a través del cristal: luna + techos + niebla */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="s5-moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EAF2F8" />
              <stop offset="70%" stopColor="#C7D8E6" />
              <stop offset="100%" stopColor="#8FA6BC" />
            </radialGradient>
            <linearGradient id="s5-fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2B3A42" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2B3A42" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx={740} cy={520} r={64} fill="url(#s5-moon)" opacity={0.85} />
          <circle cx={762} cy={502} r={60} fill="#0B1620" />
          <g fill="#05080C">
            <path d="M 470 900 L 520 820 L 570 900 Z" />
            <rect x="480" y="880" width="80" height="80" />
            <path d="M 600 920 L 660 830 L 720 920 Z" />
            <rect x="860" y="900" width="70" height="60" />
            <path d="M 855 900 L 895 850 L 935 900 Z" />
          </g>
          <rect x="470" y="700" width="440" height="240" fill="url(#s5-fog)" opacity={0.5} />
        </svg>
      </AbsoluteFill>

      {/* ===== MIDGROUND (floorY = 1450) ===== */}
      {/* Pared interior del dormitorio en penumbra */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #0B0E14 0%, #0E1118 45%, #090C11 100%)",
        }}
      />
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        <g stroke="#141821" strokeWidth={1.2} opacity={0.4} fill="none">
          <path d="M 0 200 L 466 200" />
          <path d="M 0 700 L 466 700" />
          <path d="M 0 1200 L 466 1200" />
          <path d="M 914 200 L 1080 200" />
          <path d="M 914 700 L 1080 700" />
          <path d="M 914 1200 L 1080 1200" />
        </g>
      </svg>

      {/* Ventana alta de madera oscura (x 470..910, y 420..1140) */}
      <div style={{ position: "absolute", left: 466, top: 416, width: 448, height: 728 }}>
        {/* Marco de madera */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #241C10 0%, #1A150E 50%, #120D08 100%)",
            borderRadius: 8,
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          }}
        />
        {/* Cristal (clip exacto del vidrio) */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            width: 424,
            height: 704,
            overflow: "hidden",
            background: "linear-gradient(180deg, #0B1620 0%, #0A1014 100%)",
          }}
        >
          {/* Noche a través del cristal */}
          <svg width="424" height="704" viewBox="0 0 424 704" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="s5-glass-moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EAF2F8" />
                <stop offset="100%" stopColor="#8FA6BC" />
              </radialGradient>
            </defs>
            <circle cx={300} cy={150} r={44} fill="url(#s5-glass-moon)" opacity={0.85} />
            <circle cx={316} cy={138} r={42} fill="#0B1620" />
            <g fill="#05080C">
              <path d="M 0 360 L 44 300 L 88 360 Z" />
              <rect x="10" y="340" width="64" height="56" />
              <path d="M 320 370 L 370 300 L 424 370 Z" />
              <rect x="340" y="360" width="60" height="44" />
            </g>
          </svg>

          {/* Reflejo humano traslúcido de Jack Nyras (clip exacto al vidrio) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: 0.52 + hb * 0.13,
              filter: "blur(0.4px)",
            }}
          >
            <JackNyrasCharacter
              x={212}
              floorY={820}
              scale={1.12}
              variant="university_victim"
              pose="reflection_reach"
              localFrame={frame}
              reflectionMode
              reflectionReach={reflectionReach}
              showFloorShadow={false}
            />
          </div>

          {/* Brillo diagonal del cristal */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(128deg, rgba(159,216,240,0.14) 0%, rgba(159,216,240,0.03) 34%, transparent 52%, rgba(34,211,238,0.1) 78%, transparent 92%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -60,
              top: 40,
              width: 90,
              height: 620,
              background: "rgba(220,240,255,0.08)",
              transform: "rotate(16deg)",
            }}
          />

          {/* Hoja inferior entreabierta: apertura oscura al pie */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: openGap,
              background: "#04070C",
              boxShadow: hb > 0.01 ? `0 0 ${26 * hb}px rgba(159,198,232,${0.5 * hb})` : "none",
            }}
          />
          {/* Riel inferior de la hoja levantada */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: openGap,
              height: 30,
              background: "linear-gradient(180deg, #2A2112 0%, #1A150E 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: openGap + 30,
              height: 6,
              background: "rgba(159,198,232,0.16)",
            }}
          />
        </div>

        {/* Travesaño central del marco */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 10,
            background: "#1A150E",
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* Pulso de luz lunar resaltando la abertura (heartbeat) */}
      {hb > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 466,
            top: 900,
            width: 448,
            height: 250,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(159,198,232,0.5), rgba(159,198,232,0.14) 55%, transparent 78%)",
            opacity: hb,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* Eyeless Jack en primer término (2-Bone IK: mano enguantada aterriza en el borde interior izquierdo del marco) */}
      <EyelessJackCharacter
        x={345}
        floorY={FLOOR_Y}
        scale={1.5}
        facing={1}
        pose="window_touch"
        localFrame={frame}
        reachTarget={{ x: 247, y: 200 }}
        ichorIntensity={1}
        rimColor="#60A5FA"
      />

      {/* ===== FOREGROUND (parallax rápido 1.25×) ===== */}
      <AbsoluteFill style={{ transform: `translateX(${fgDrift}px)` }}>
        {/* Cortinas oscuras ondulando por la brisa */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <g>
            <path
              d={`M 0 0 C ${60 + Math.sin(frame * 0.04) * 12} 300, ${-20 + Math.sin(frame * 0.05 + 1) * 16} 900, 40 1920 L 210 1920 C 170 1200, 210 500, 150 0 Z`}
              fill="#05070B"
            />
            <path
              d={`M 0 0 C 50 320, 40 940, 60 1920 L 120 1920 C 100 1100, 120 400, 70 0 Z`}
              fill="#080B11"
            />
            <path
              d={`M 1080 0 C ${1020 - Math.sin(frame * 0.04) * 12} 300, ${1100 - Math.sin(frame * 0.05 + 1) * 16} 900, 1040 1920 L 870 1920 C 910 1200, 870 500, 930 0 Z`}
              fill="#05070B"
            />
            <path
              d={`M 1080 0 C 1030 320, 1040 940, 1020 1920 L 960 1920 C 980 1100, 960 400, 1010 0 Z`}
              fill="#080B11"
            />
          </g>
          <g stroke="#141A22" strokeWidth={2} fill="none" opacity={0.5}>
            <path d="M 40 0 C 60 500, 20 1200, 40 1920" />
            <path d="M 1040 0 C 1020 500, 1060 1200, 1040 1920" />
          </g>
        </svg>

        {/* Motas de polvo iluminadas */}
        {DUST.map((d, i) => {
          const y = d.y0 - ((frame * d.speed + d.phase) % 500);
          const op = 0.08 + 0.18 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: d.x,
                width: d.r * 2,
                height: d.r * 2,
                borderRadius: d.r,
                background: "#CFE3F5",
                opacity: op * (1 + hb * 0.6),
                boxShadow: "0 0 6px rgba(190,220,245,0.5)",
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
