import React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * ForestParallax25D.tsx — Escenario 2.5D multicapa:
 * cielo nocturno profundo con resplandor de niebla en el horizonte,
 * 4 planos Z reales de pinos/abetos silueteados a todo lo ancho (0..1080),
 * niebla volumétrica a la deriva entre capas, esporas deterministas y
 * push-in de cámara con deriva handheld.
 * Props de mood por acto: cameraZoom, fogDensity, redTint, cameraShake.
 */

export type ForestParallax25DProps = {
  cameraZoom?: number; // 0..1 — intensidad del push-in
  fogDensity?: number; // 0..1 — densidad de niebla
  redTint?: number; // 0..1 — tinte carmesí
  cameraShake?: number; // 0..1 — deriva handheld
};

/**
 * Abeto silueteado con copa escalonada (5 pisos cónicos superpuestos)
 * y tronco delgado. (x, y) = centro-x, top-y. Exportado para las fotos.
 */
export const pinePath = (x: number, y: number, w: number, h: number): string => {
  const tiers = 5;
  const pts: string[] = [];
  for (let k = 0; k < tiers; k++) {
    const apexY = y + h * (0.1 + k * 0.185);
    const baseY = y + h * (0.1 + (k + 1) * 0.185);
    const half = (w / 2) * (0.32 + k * 0.16);
    pts.push(
      `M ${x.toFixed(1)} ${apexY.toFixed(1)}`,
      `L ${(x - half).toFixed(1)} ${baseY.toFixed(1)}`,
      `L ${(x + half).toFixed(1)} ${baseY.toFixed(1)}`,
      "Z"
    );
  }
  const trunkW = Math.max(5, w * 0.12);
  const trunkY = y + h * 0.88;
  pts.push(
    `M ${(x - trunkW / 2).toFixed(1)} ${trunkY.toFixed(1)}`,
    `L ${(x + trunkW / 2).toFixed(1)} ${trunkY.toFixed(1)}`,
    `L ${(x + trunkW / 2).toFixed(1)} ${(y + h).toFixed(1)}`,
    `L ${(x - trunkW / 2).toFixed(1)} ${(y + h).toFixed(1)}`,
    "Z"
  );
  return pts.join(" ");
};

type TreeLayerProps = {
  count: number;
  color: string;
  opacity: number;
  blur: number;
  seed: number;
  minH: number;
  maxH: number;
  parallax: number;
  phase: number;
  shake: number;
  frame: number;
  /** Rangos de distribución en coordenadas de lienzo (0..1080) */
  ranges: Array<[number, number]>;
  widthRatio?: number;
  driftAmp?: number;
};

const TreeLayer: React.FC<TreeLayerProps> = ({
  count,
  color,
  opacity,
  blur,
  seed,
  minH,
  maxH,
  parallax,
  phase,
  shake,
  frame,
  ranges,
  widthRatio = 0.5,
  driftAmp = 46,
}) => {
  const W = 1600;
  const OFF = (W - 1080) / 2; // 260 — desplaza coordenadas de lienzo a capa
  const trees = Array.from({ length: count }, (_, i) => {
    const [x0, x1] = ranges[i % ranges.length];
    const groupIdx = Math.floor(i / ranges.length);
    const groupCount = Math.max(1, Math.ceil(count / ranges.length));
    const baseX = x0 + ((x1 - x0) * groupIdx) / Math.max(1, groupCount - 1);
    const jitter = (random(seed + i * 23.7) - 0.5) * (x1 - x0) * 0.5;
    const x = Math.min(x1, Math.max(x0, baseX + jitter));
    const h = minH + random(seed + i * 31.7) * (maxH - minH);
    const w = h * (widthRatio + random(seed + i * 7.9) * 0.08);
    return { x: x - w / 2 + OFF, w, h, k: i };
  });
  const xShift =
    Math.sin(frame * 0.006 + phase) * driftAmp * parallax * (0.55 + shake);
  const yShift =
    Math.cos(frame * 0.0048 + phase * 1.7) * 12 * parallax * (0.5 + shake);
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${xShift.toFixed(2)}px) translateY(${yShift.toFixed(2)}px)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: W,
          height: "100%",
          marginLeft: -W / 2,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} 1920`}
          preserveAspectRatio="none"
        >
          {trees.map((tr) => (
            <path
              key={tr.k}
              d={pinePath(tr.x, 1920 - tr.h, tr.w, tr.h)}
              fill={color}
            />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const PARTICLES = 22;

export const ForestParallax25D: React.FC<ForestParallax25DProps> = ({
  cameraZoom = 0.5,
  fogDensity = 0.8,
  redTint = 0.2,
  cameraShake = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Push-in continuo de cámara (determinista)
  const push =
    1 + 0.085 * (frame / durationInFrames) * (0.5 + 0.5 * cameraZoom);

  // Deriva handheld suave
  const driftX = Math.sin(frame * 0.007) * 16 * (0.35 + cameraShake * 0.65);
  const driftY = Math.cos(frame * 0.0053) * 10 * (0.35 + cameraShake * 0.65);

  const fogShift1 = Math.sin(frame * 0.0041 + 0.8) * 300 * (0.6 + cameraShake);
  const fogShift2 = Math.sin(frame * 0.0033 + 2.4) * 380 * (0.6 + cameraShake);
  const fogShift3 = Math.sin(frame * 0.0052 + 4.1) * 260 * (0.6 + cameraShake);

  const particles = Array.from({ length: PARTICLES }, (_, i) => ({
    x: random(i * 101 + 5) * 1080,
    y: random(i * 71 + 3) * 1920,
    r: 1 + random(i * 37 + 9) * 2,
    speed: 0.4 + random(i * 53 + 2) * 1.1,
    amp: 8 + random(i * 29 + 7) * 26,
    freq: 0.004 + random(i * 43 + 1) * 0.008,
    phase: random(i * 61 + 3) * Math.PI * 2,
    op: 0.12 + random(i * 89 + 4) * 0.3,
  }));

  return (
    <AbsoluteFill style={{ transform: `scale(${push.toFixed(4)})` }}>
      {/* 1. Cielo nocturno profundo con resplandor de niebla en el horizonte */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #040507 0%, #0B151C 45%, #060A0E 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 95% 46% at 50% 45%, rgba(30,48,60,0.95) 0%, rgba(30,48,60,0.5) 42%, #05080B 82%)",
        }}
      />
      {/* Luna pálida difusa (no un punto gris nítido) */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 168,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(242,239,233,0.16) 0%, transparent 65%)",
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 202,
          top: 262,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(226,224,215,0.55) 0%, rgba(226,224,215,0.18) 55%, transparent 75%)",
          filter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${driftX.toFixed(2)}px) translateY(${driftY.toFixed(2)}px)`,
        }}
      >
        {/* 2. Cordillera lejana densa (0.15x) — fila continua de abetos */}
        <TreeLayer
          count={20}
          color="#0E1820"
          opacity={0.8}
          blur={1.5}
          seed={11}
          minH={300}
          maxH={620}
          parallax={0.15}
          phase={0.4}
          shake={cameraShake}
          frame={frame}
          ranges={[[-100, 1180]]}
          widthRatio={0.42}
          driftAmp={40}
        />
        {/* 3. Neblina atmosférica trasera (#162129) */}
        <div
          style={{
            position: "absolute",
            left: -380 + fogShift1,
            top: 640,
            width: 1700,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(22,33,41,0.9) 0%, rgba(22,33,41,0.42) 45%, transparent 72%)",
            filter: "blur(34px)",
            opacity: 0.3 + 0.55 * fogDensity,
          }}
        />
        {/* 4a. Bosque medio-lejano (0.35x) — ambos lados, claro central */}
        <TreeLayer
          count={11}
          color="#12202A"
          opacity={0.85}
          blur={0}
          seed={23}
          minH={620}
          maxH={980}
          parallax={0.35}
          phase={1.9}
          shake={cameraShake}
          frame={frame}
          ranges={[
            [30, 420],
            [660, 1050],
          ]}
          widthRatio={0.48}
        />
        {/* Neblina media (#2B3A42) entre capas medias */}
        <div
          style={{
            position: "absolute",
            left: -520 + fogShift2,
            top: 900,
            width: 1700,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(43,58,66,0.7) 0%, rgba(43,58,66,0.32) 46%, transparent 72%)",
            filter: "blur(38px)",
            opacity: 0.26 + 0.5 * fogDensity,
          }}
        />
        {/* 4b. Bosque medio (0.58x) — troncos verticales con copas cónicas */}
        <TreeLayer
          count={9}
          color="#162129"
          opacity={0.92}
          blur={0}
          seed={37}
          minH={880}
          maxH={1280}
          parallax={0.58}
          phase={3.2}
          shake={cameraShake}
          frame={frame}
          ranges={[
            [50, 400],
            [700, 1030],
          ]}
          widthRatio={0.5}
        />
        {/* Árboles bajos en el claro central (tras Slenderman) */}
        <TreeLayer
          count={2}
          color="#162129"
          opacity={0.55}
          blur={0}
          seed={71}
          minH={430}
          maxH={520}
          parallax={0.58}
          phase={4.4}
          shake={cameraShake}
          frame={frame}
          ranges={[[480, 620]]}
          widthRatio={0.44}
        />
        {/* 5. Primer plano 1.0x: troncos gruesos desenfocados en ambos bordes */}
        <AbsoluteFill
          style={{
            transform: `translateX(${(
              Math.sin(frame * 0.006 + 2.6) *
              70 *
              (0.55 + cameraShake)
            ).toFixed(2)}px)`,
            filter: "blur(4px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              width: 1600,
              height: "100%",
              marginLeft: -800,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1600 1920"
              preserveAspectRatio="none"
            >
              {/* Tronco izquierdo + ramas retorcidas */}
              <path
                d="M 250 0 L 244 420 L 274 440 L 238 860 L 268 880 L 232 1320 L 262 1340 L 246 1920 L 332 1920 L 312 1380 L 330 700 L 300 320 L 332 0 Z"
                fill="#020305"
              />
              <path
                d="M 300 640 L 430 600 L 436 646 L 312 690 Z"
                fill="#020305"
              />
              <path
                d="M 286 1180 L 400 1230 L 408 1276 L 298 1236 Z"
                fill="#020305"
              />
              {/* Tronco derecho + ramas retorcidas */}
              <path
                d="M 1310 0 L 1318 400 L 1288 430 L 1322 800 L 1288 840 L 1330 1240 L 1296 1280 L 1320 1920 L 1230 1920 L 1244 1340 L 1212 720 L 1244 330 L 1216 0 Z"
                fill="#020305"
              />
              <path
                d="M 1250 860 L 1130 820 L 1136 866 L 1246 906 Z"
                fill="#020305"
              />
              <path
                d="M 1270 1460 L 1160 1520 L 1168 1566 L 1280 1518 Z"
                fill="#020305"
              />
            </svg>
          </div>
        </AbsoluteFill>
        {/* 6. Neblina frontal + niebla de suelo */}
        <div
          style={{
            position: "absolute",
            left: -380 + fogShift3,
            top: 1220,
            width: 1700,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(22,33,41,0.78) 0%, rgba(22,33,41,0.36) 46%, transparent 72%)",
            filter: "blur(40px)",
            opacity: 0.28 + 0.52 * fogDensity,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 420,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(22,33,41,0.4) 70%, rgba(4,5,7,0.75) 100%)",
          }}
        />
        {/* Esporas / ceniza flotante determinista */}
        <AbsoluteFill>
          {particles.map((p, i) => {
            const y = (((p.y - frame * p.speed) % 2100) + 2100) % 2100 - 90;
            const x = p.x + Math.sin(frame * p.freq + p.phase) * p.amp;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: p.r,
                  height: p.r,
                  borderRadius: "50%",
                  background: "rgba(242,239,233,0.9)",
                  opacity: p.op * (0.5 + 0.5 * fogDensity),
                  boxShadow: "0 0 6px rgba(242,239,233,0.5)",
                }}
              />
            );
          })}
        </AbsoluteFill>
      </div>

      {/* Oscurecimiento inferior para anclar la escena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,7,0.35) 0%, transparent 22%, transparent 60%, rgba(4,5,7,0.85) 100%)",
        }}
      />
      {/* Tinte carmesí del acto */}
      <AbsoluteFill
        style={{
          opacity: redTint,
          mixBlendMode: "screen",
          background:
            "radial-gradient(ellipse 150% 42% at 50% 106%, rgba(127,29,29,0.8) 0%, rgba(127,29,29,0.3) 45%, transparent 72%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: redTint * 0.55,
          boxShadow: "inset 0 0 320px rgba(127,29,29,0.9)",
        }}
      />
    </AbsoluteFill>
  );
};
