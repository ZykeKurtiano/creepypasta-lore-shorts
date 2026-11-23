import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { EyelessJackCharacter } from "../components/characters/EyelessJackCharacter";

/**
 * Scene4PredatorStalk (frames 1723–1981, ~8.6s) — Retake 1: El Depredador Nocturno.
 *
 * Calle residencial nocturna envuelta en bruma, en 3 capas 2.5D:
 *  - background (parallax lento): cielo azul-pizarra, luna menguante fría,
 *    siluetas de casas vecinales, bancos de niebla y farolas con conos de luz
 *    volumétricos.
 *  - midground (floorY = 1440): acera/césped en perspectiva, fachada de 2 pisos
 *    con ladrillos, tubería de desagüe y ventana superior iluminada. Eyeless Jack
 *    camina en sigilo (locomoción biomecánica) y al llegar trepa hacia el
 *    alféizar con 2-Bone IK (frontArm delante del alféizar).
 *  - foreground (parallax rápido): reja de hierro, ramas nocturnas y lluvia fina.
 */

const FLOOR_Y = 1440;

const MIST = Array.from({ length: 16 }, (_, i) => ({
  x: -80 + random(i * 5 + 1) * 1240,
  y0: 360 + random(i * 11 + 2) * 760,
  r: 70 + random(i * 7 + 3) * 180,
  speed: 0.1 + random(i * 3 + 4) * 0.16,
  phase: random(i * 17 + 5) * 500,
}));

const RAIN = Array.from({ length: 36 }, (_, i) => ({
  x: random(i * 7 + 1) * 1080,
  y0: random(i * 13 + 2) * 1920,
  len: 9 + random(i * 5 + 3) * 16,
  speed: 2.4 + random(i * 3 + 4) * 2.6,
  phase: random(i * 19 + 5) * 900,
  op: 0.08 + random(i * 11 + 6) * 0.16,
}));

export const Scene4PredatorStalk: React.FC = () => {
  const frame = useCurrentFrame();

  // Fase 1 (0–155): sigilo de izquierda a derecha. Fase 2 (155–258): trepa.
  const x = interpolate(frame, [0, 155], [180, 585], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const climbProgress = interpolate(frame, [155, 182], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pose = frame < 155 ? "stealth_walk" : "climb_ledge";
  const walkPhase = frame * 0.34;

  // Mano enguantada subiendo hacia el alféizar conforme trepa (2-Bone IK real).
  const reachTarget = {
    x: 270,
    y: interpolate(climbProgress, [0, 1], [300, 220], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };

  // Parallax por capa.
  const bgDrift = Math.sin(frame * 0.004) * 9;
  const fgDrift = Math.sin(frame * 0.012) * 20;

  // Pulso suave de las farolas.
  const lampPulse = 0.8 + 0.2 * Math.sin(frame * 0.09);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* ===== BACKGROUND (parallax lento 0.22×) ===== */}
      <AbsoluteFill style={{ transform: `translateX(${bgDrift}px)` }}>
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #070B11 0%, #0A121C 42%, #131E29 100%)",
          }}
        />

        {/* Luna menguante fría (creciente tallada) */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="s4-moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EAF2F8" />
              <stop offset="70%" stopColor="#C7D8E6" />
              <stop offset="100%" stopColor="#9FB4C8" />
            </radialGradient>
          </defs>
          <circle cx={300} cy={300} r={92} fill="url(#s4-moon)" opacity={0.92} />
          <circle cx={340} cy={272} r={92} fill="#0B1620" />
        </svg>

        {/* Neblina fría velando la luna */}
        <div
          style={{
            position: "absolute",
            top: 210,
            left: 150,
            width: 380,
            height: 110,
            background: "rgba(43,58,66,0.4)",
            filter: "blur(20px)",
          }}
        />

        {/* Siluetas de casas vecinales lejanas */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <g fill="#060A10">
            <path d="M -20 900 L 20 760 L 70 900 Z" />
            <path d="M 10 900 L 10 860 L 60 860 L 60 900 Z" />
            <rect x="80" y="880" width="90" height="120" />
            <path d="M 80 880 L 125 820 L 170 880 Z" />
            <rect x="220" y="900" width="70" height="100" />
            <path d="M 215 900 L 255 850 L 295 900 Z" />
          </g>
          <g fill="#04070C" opacity={0.85}>
            <rect x="780" y="860" width="120" height="140" />
            <path d="M 775 860 L 840 800 L 905 860 Z" />
            <rect x="940" y="890" width="80" height="110" />
          </g>
        </svg>

        {/* Bancos de niebla desplazándose suavemente */}
        {MIST.map((m, i) => {
          const xPos = m.x + Math.sin(frame * 0.008 + m.phase * 0.01) * 60;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: m.y0,
                left: xPos,
                width: m.r * 2,
                height: m.r * 0.5,
                borderRadius: "50%",
                background: "rgba(43,58,66,0.16)",
                filter: "blur(14px)",
              }}
            />
          );
        })}

        {/* Farola izquierda + cono volumétrico */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <linearGradient id="s4-cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9FC6E8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#9FC6E8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="196" y="600" width="8" height="360" fill="#0A0E14" />
          <rect x="176" y="588" width="48" height="12" rx="4" fill="#0A0E14" />
          <ellipse cx="200" cy="584" rx="16" ry="7" fill="#BFD7EC" opacity={lampPulse} />
          <polygon points="200,584 120,960 280,960" fill="url(#s4-cone)" opacity={lampPulse * 0.9} />
        </svg>

        {/* Farola derecha + cono volumétrico */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <rect x="836" y="640" width="8" height="330" fill="#0A0E14" />
          <rect x="816" y="628" width="48" height="12" rx="4" fill="#0A0E14" />
          <ellipse cx="840" cy="624" rx="16" ry="7" fill="#BFD7EC" opacity={lampPulse} />
          <polygon points="840,624 762,1000 918,1000" fill="url(#s4-cone)" opacity={lampPulse * 0.9} />
        </svg>
      </AbsoluteFill>

      {/* ===== MIDGROUND (floorY = 1440) ===== */}
      {/* Acera/césped oscuro en perspectiva con textura húmeda */}
      <div
        style={{
          position: "absolute",
          top: 1320,
          left: 0,
          right: 0,
          height: 600,
          background:
            "linear-gradient(180deg, #0B1116 0%, #070C11 45%, #04070B 100%)",
        }}
      />
      <svg
        width="1080"
        height="600"
        viewBox="0 0 1080 600"
        style={{ position: "absolute", top: 1320, left: 0 }}
      >
        <g stroke="#141D26" strokeWidth={1.4} opacity={0.5} fill="none">
          <path d="M 540 0 L 0 600" />
          <path d="M 540 0 L 260 600" />
          <path d="M 540 0 L 820 600" />
          <path d="M 540 0 L 1080 600" />
        </g>
        <g stroke="#1B2833" strokeWidth={1} opacity={0.35} fill="none">
          <path d="M 360 0 C 380 140, 400 360, 430 600" />
          <path d="M 720 0 C 700 140, 680 360, 650 600" />
        </g>
      </svg>

      {/* Halo suave de farola sobre la acera húmeda (realza el sigilo) */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 1170,
          width: 500,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(159,198,232,0.22), rgba(96,165,250,0.08) 45%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 700,
          top: 1200,
          width: 420,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(159,198,232,0.16), rgba(96,165,250,0.06) 45%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />

      {/* Fachada residencial de 2 pisos a la derecha */}
      <div style={{ position: "absolute", left: 590, top: 300, width: 490, height: 1140 }}>
        {/* Muro de ladrillo/revestimiento */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #151B22 0%, #0E141B 50%, #0A0F15 100%)",
          }}
        />
        <svg
          width="490"
          height="1140"
          viewBox="0 0 490 1140"
          style={{ position: "absolute", inset: 0 }}
        >
          <g stroke="#1A222B" strokeWidth={1.4} opacity={0.5} fill="none">
            {Array.from({ length: 14 }, (_, i) => (
              <line key={i} x1="0" y1={40 + i * 78} x2="490" y2={40 + i * 78} />
            ))}
          </g>
          <g stroke="#1A222B" strokeWidth={1.2} opacity={0.4} fill="none">
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={40 + i * 82} y1="0" x2={40 + i * 82} y2="1140" />
            ))}
          </g>
          {/* Reborde de techo */}
          <rect x="0" y="0" width="490" height="26" fill="#070B11" />
          <rect x="0" y="26" width="490" height="6" fill="#1C2630" />
          {/* Sombra del alero */}
          <rect x="0" y="32" width="490" height="34" fill="#05080C" opacity={0.7} />
        </svg>

        {/* Tubería de desagüe */}
        <div
          style={{
            position: "absolute",
            left: 322,
            top: 40,
            width: 22,
            height: 1100,
            background: "linear-gradient(90deg, #0C1117 0%, #1A222B 45%, #0C1117 100%)",
          }}
        />
        {[60, 220, 380, 540, 700, 860, 1020].map((yy, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 318,
              top: yy,
              width: 30,
              height: 10,
              background: "#05080C",
              borderRadius: 2,
            }}
          />
        ))}

        {/* Ventana iluminada del piso superior (y 760..1020) */}
        <div style={{ position: "absolute", left: 30, top: 460, width: 260, height: 260 }}>
          {/* Marco de madera */}
          <div
            style={{
              position: "absolute",
              inset: -10,
              background: "linear-gradient(180deg, #241C10 0%, #1A150E 100%)",
              borderRadius: 6,
            }}
          />
          {/* Cristal con luz cálida-fría */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              background:
                "radial-gradient(ellipse at 50% 40%, #E8C98A 0%, #B97A3E 55%, #6E3F20 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(255,232,190,0.9), rgba(185,122,62,0.25) 60%, rgba(30,45,60,0.6) 100%)",
              }}
            />
            {/* Travesaño central */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 6,
                background: "#1A150E",
                transform: "translateX(-50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 6,
                background: "#1A150E",
                transform: "translateY(-50%)",
              }}
            />
            {/* Resplandor proyectado hacia la calle */}
            <div
              style={{
                position: "absolute",
                left: -120,
                top: 20,
                width: 340,
                height: 300,
                background:
                  "linear-gradient(120deg, rgba(232,201,138,0.18), rgba(232,201,138,0.02) 60%, transparent)",
                transform: "skewX(-14deg)",
              }}
            />
          </div>
          {/* Alféizar saliente */}
          <div
            style={{
              position: "absolute",
              left: -16,
              bottom: -20,
              width: 292,
              height: 16,
              background: "linear-gradient(180deg, #241C10 0%, #120D08 100%)",
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Eyeless Jack en sigilo / trepando (2-Bone IK, frontArm delante del alféizar) */}
      <EyelessJackCharacter
        x={x}
        floorY={FLOOR_Y}
        scale={1.22}
        pose={pose}
        localFrame={frame}
        walkPhase={walkPhase}
        reachTarget={reachTarget}
        ichorIntensity={1}
        rimColor="#60A5FA"
      />

      {/* ===== FOREGROUND (parallax rápido 1.35×) ===== */}
      <AbsoluteFill style={{ transform: `translateX(${fgDrift}px)` }}>
        {/* Reja de hierro forjado */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <g stroke="#020306" strokeWidth={10} fill="none">
            <path d="M -10 0 L 120 0 L 120 1920 L -10 1920 Z" fill="#020306" stroke="none" />
            <path d="M 10 200 L 10 320" />
            <path d="M 10 340 L 10 460" />
            <path d="M 10 480 L 10 600" />
            <path d="M 10 620 L 10 740" />
            <path d="M 10 760 L 10 880" />
            <path d="M 10 900 L 10 1020" />
            <path d="M 10 1040 L 10 1160" />
          </g>
          <g stroke="#030509" strokeWidth={4} fill="none" opacity={0.9}>
            <path d="M 20 210 L 96 210" />
            <path d="M 20 350 L 96 350" />
            <path d="M 20 490 L 96 490" />
            <path d="M 20 630 L 96 630" />
            <path d="M 20 770 L 96 770" />
            <path d="M 20 910 L 96 910" />
            <path d="M 20 1050 L 96 1050" />
          </g>
          <g fill="#020306">
            {[200, 340, 480, 620, 760, 900, 1040].map((yy, i) => (
              <path key={i} d={`M 16 ${yy} C 20 ${yy - 22}, 96 ${yy - 22}, 100 ${yy} L 96 ${yy} C 92 ${yy - 16}, 24 ${yy - 16}, 20 ${yy} Z`} />
            ))}
          </g>
        </svg>

        {/* Ramas nocturnas en los bordes */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0 }}
        >
          <g stroke="#020306" strokeWidth={9} fill="none" strokeLinecap="round">
            <path d="M -20 120 C 80 100, 140 160, 200 130 C 260 100, 300 150, 380 120" />
            <path d="M 160 150 C 200 220, 240 260, 300 320" />
            <path d="M 1120 260 C 1020 230, 980 290, 900 260 C 840 240, 800 290, 720 270" />
            <path d="M 960 280 C 920 360, 880 410, 820 470" />
          </g>
        </svg>

        {/* Lluvia fina / partículas de neblina iluminadas */}
        {RAIN.map((r, i) => {
          const y = ((r.y0 + frame * r.speed + r.phase) % 1920) - 40;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: r.x,
                width: 1.4,
                height: r.len,
                background: "linear-gradient(180deg, rgba(159,198,232,0.5), rgba(159,198,232,0.05))",
                opacity: r.op * (1 + lampPulse * 0.4),
                transform: "rotate(14deg)",
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
