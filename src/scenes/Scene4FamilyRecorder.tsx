import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RakeModelRig } from "../components/characters/RakeModelRig";
import { WitnessModelRig } from "../components/characters/WitnessModelRig";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene4FamilyRecorder (frames 1089–1605, 36.30–53.50s) — Caso de la Familia
 * y Grabadora Nocturna.
 *
 * Tres sub-bloques con su propia coreografía de cámara:
 *  A (local 0–248)   : el encuentro a 30 cm (madre en pánico + The Rake).
 *  B (local 248–325) : el ataque en el pasillo (lunge + destello carmesí).
 *  C (local 325–516) : grabadora nocturna + espectrograma en vivo + salida
 *                      Waveform Dive-Through (494–516).
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

/** Rostro de la madre (bed_panic) en coordenadas de mundo. */
const MF = { x: 323, y: 831 };
/** Altura del rostro del Rake agazapado (su x avanza con el tiempo). */
const RF_Y = 883;
/** Grabadora plateada en la mano del testigo (recorder). */
const REC = { x: 414, y: 1078 };

const BARS = 36;

const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: 80 + random(i * 3 + 1) * 900,
  y0: 360 + random(i * 7 + 2) * 1100,
  r: 1.2 + random(i * 5 + 3) * 2.2,
  speed: 0.05 + random(i * 9 + 4) * 0.12,
  phase: random(i * 13 + 5) * 1200,
  sway: (random(i * 11 + 7) - 0.5) * 22,
}));

export const Scene4FamilyRecorder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Coreografía de cámara en 9 tramos -----------------------------
  let s: number;
  let px: number;
  let py: number;

  if (frame < 90) {
    s = interpolate(frame, [0, 90], [1, 1.08], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = 540;
    py = 960;
  } else if (frame < 160) {
    s = interpolate(frame, [90, 160], [1.08, 1.28], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [90, 160], [540, 452], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [90, 160], [960, 1000], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  } else if (frame < 216) {
    s = interpolate(frame, [160, 216], [1.28, 2.4], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = 452;
    py = 1000;
  } else if (frame < 248) {
    s = 2.4;
    px = 452;
    py = 1000;
  } else if (frame < 260) {
    s = interpolate(frame, [248, 260], [2.4, 1.05], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [248, 260], [452, 540], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [248, 260], [1000, 1080], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
  } else if (frame < 325) {
    s = interpolate(frame, [260, 325], [1.05, 1.18], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = 540;
    py = 1080;
  } else if (frame < 370) {
    s = interpolate(frame, [325, 370], [1.18, 1.3], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = 540;
    py = interpolate(frame, [325, 370], [1080, 1000], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
  } else if (frame < 445) {
    s = interpolate(frame, [370, 445], [1.3, 2.5], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [370, 445], [540, REC.x], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [370, 445], [1000, REC.y], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  } else if (frame < 494) {
    s = 2.5;
    px = REC.x;
    py = REC.y;
  } else {
    s = interpolate(frame, [494, 516], [2.5, 4.2], {
      easing: Easing.in(Easing.cubic),
      ...CLAMP,
    });
    px = REC.x;
    py = REC.y;
  }

  // Micro-sacudida puntual (solo 10 frames) sincronizada al impacto.
  const impactEnv = interpolate(frame, [260, 264, 270], [0, 1, 0], { ...CLAMP });
  const shakeX = Math.sin(frame * 1.6) * 7 * impactEnv;
  const shakeY = Math.cos(frame * 1.3) * 5 * impactEnv;

  const TX = (OX - px) * s + shakeX;
  const TY = (OY - py) * s + shakeY;

  // --- Ventanas de sub-bloques ---
  const blockA = frame < 248;
  const blockB = frame >= 248 && frame < 325;
  const blockC = frame >= 325;

  // --- Sub-bloque A: avance del Rake y cota 30 CM ---
  const rakeX = interpolate(frame, [90, 200], [760, 560], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const rakeFaceX = rakeX + 21;
  const measureOp = interpolate(frame, [158, 172, 240, 248], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const rakeEye = interpolate(frame, [90, 160], [0.3, 0.95], { ...CLAMP });
  const rakeOpacity = interpolate(frame, [20, 90], [0.2, 0.95], { ...CLAMP });

  // --- Sub-bloque B: lunge ---
  const lungeX = interpolate(frame, [248, 320], [1150, -180], {
    easing: Easing.in(Easing.cubic),
    ...CLAMP,
  });
  const lungeScale = interpolate(frame, [248, 320], [0.95, 1.55], {
    easing: Easing.in(Easing.cubic),
    ...CLAMP,
  });
  const crimsonCut = interpolate(frame, [248, 251, 256], [0, 1, 0], { ...CLAMP });
  const impactFlash = interpolate(frame, [260, 263, 272], [0, 1, 0], { ...CLAMP });

  // --- Sub-bloque C: grabadora + espectrograma ---
  const recorderPulse = interpolate(frame, [325, 360], [0, 1], { ...CLAMP });
  const crimsonT = interpolate(frame, [405, 415, 495, 505], [0, 1, 1, 0], {
    ...CLAMP,
  });
  const diveProg = interpolate(frame, [494, 516], [0, 1], {
    easing: Easing.in(Easing.cubic),
    ...CLAMP,
  });

  const stampScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, stiffness: 150, mass: 0.7 },
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Mundo 2.5D bajo la cámara */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${TX.toFixed(2)}px, ${TY.toFixed(
            2
          )}px) scale(${s.toFixed(4)})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* 1. Background con sobrescala para parallax */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s4.png")}
            style={{
              position: "absolute",
              width: "112%",
              height: "112%",
              left: "-6%",
              top: "-6%",
              objectFit: "cover",
              transform: `translate(${(Math.sin(frame * 0.008) * 10).toFixed(
                2
              )}px, 0px)`,
            }}
          />
        </div>

        {/* 2. Tinte nocturno y penumbra */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(4,6,10,0.55), rgba(4,6,10,0.12) 40%, rgba(2,3,5,0.72))",
          }}
        />

        {/* 3. Polvo nocturno iluminado */}
        {DUST.map((d, i) => {
          const y = d.y0 - ((frame * d.speed + d.phase) % 1200);
          const x = d.x + Math.sin(frame * 0.02 + i * 1.3) * d.sway;
          const op = 0.05 + 0.15 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: x,
                width: d.r * 2,
                height: d.r * 2,
                borderRadius: d.r,
                background: "#CFE3F5",
                opacity: op,
                boxShadow: "0 0 6px rgba(190,220,245,0.5)",
              }}
            />
          );
        })}

        {/* 4. Sub-bloque A: madre + Rake + cota 30 CM */}
        {blockA ? (
          <>
            <WitnessModelRig
              variant="bed_panic"
              width={680}
              x={330}
              y={1420}
              panicLevel={0.95}
              rimColor="rgba(125,211,252,0.4)"
              showFloorShadow
            />
            <RakeModelRig
              variant="crouched"
              width={520}
              x={rakeX}
              y={1560}
              opacity={rakeOpacity}
              eyeGlow={rakeEye}
              eyeColor="#FDE047"
              rimColor="rgba(148,197,255,0.4)"
              breathingIntensity={0.9}
              showFloorShadow
              brightness={0.72}
            />

            {/* Cota cinética 30 CM entre la criatura y el rostro de la madre */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1080 1920"
              style={{
                position: "absolute",
                inset: 0,
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              <g opacity={measureOp}>
                <line
                  x1={MF.x}
                  y1={RF_Y}
                  x2={rakeFaceX}
                  y2={RF_Y}
                  stroke="#FDE047"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                />
                <line x1={MF.x} y1={RF_Y - 12} x2={MF.x} y2={RF_Y + 12} stroke="#FDE047" strokeWidth="3" />
                <line x1={rakeFaceX} y1={RF_Y - 12} x2={rakeFaceX} y2={RF_Y + 12} stroke="#FDE047" strokeWidth="3" />
                <polygon points={`${MF.x},${RF_Y} ${MF.x + 15},${RF_Y - 8} ${MF.x + 15},${RF_Y + 8}`} fill="#FDE047" />
                <polygon points={`${rakeFaceX},${RF_Y} ${rakeFaceX - 15},${RF_Y - 8} ${rakeFaceX - 15},${RF_Y + 8}`} fill="#FDE047" />
                <text
                  x={(MF.x + rakeFaceX) / 2}
                  y={RF_Y - 24}
                  textAnchor="middle"
                  fontFamily={FONT_MONO}
                  fontSize="30"
                  fontWeight="800"
                  fill="#FDE047"
                  style={{ letterSpacing: 2, filter: "drop-shadow(0 0 12px rgba(253,224,71,0.6))" }}
                >
                  30 CM
                </text>
              </g>
            </svg>
          </>
        ) : null}

        {/* 5. Sub-bloque B: lunge explosivo con rastro de sombra */}
        {blockB ? (
          <>
            <div
              style={{
                position: "absolute",
                left: lungeX - 260,
                top: 720,
                width: 520,
                height: 960,
                background:
                  "radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)",
                filter: "blur(42px)",
              }}
            />
            <RakeModelRig
              variant="lunge"
              width={760}
              x={lungeX}
              y={1500}
              scale={lungeScale}
              flipX
              spasmIntensity={0.85}
              eyeGlow={1}
              eyeColor="#DC2626"
              rimColor="rgba(220,38,38,0.75)"
              showFloorShadow
              brightness={0.85}
            />
          </>
        ) : null}

        {/* 6. Sub-bloque C: testigo con grabadora */}
        {blockC ? (
          <WitnessModelRig
            variant="recorder"
            width={680}
            x={540}
            y={1420}
            recorderPulse={recorderPulse}
            panicLevel={0.35}
            rimColor="rgba(125,211,252,0.45)"
            showFloorShadow
          />
        ) : null}
      </div>

      {/* Sello CASE FILE — NIAGARA 2003 (zona segura) */}
      <SafeCentered top={330} zIndex={8}>
        <div
          style={{
            display: "inline-block",
            transform: `scale(${stampScale.toFixed(3)})`,
            opacity: interpolate(frame, [8, 20, 305, 320], [0, 1, 1, 0], {
              ...CLAMP,
            }),
            fontFamily: FONT_MONO,
            fontWeight: 800,
            letterSpacing: 3,
            fontSize: 26,
            color: "rgba(242,239,233,0.9)",
            border: "2px solid rgba(242,239,233,0.4)",
            borderRadius: 6,
            padding: "10px 22px",
            background: "rgba(4,5,7,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          CASE FILE <span style={{ color: "#DC2626" }}>—</span> NIAGARA 2003
        </div>
      </SafeCentered>

      {/* Destello carmesí del corte A→B */}
      {crimsonCut > 0.004 ? (
        <AbsoluteFill
          style={{ background: "#7F1D1D", opacity: crimsonCut * 0.7, zIndex: 9 }}
        />
      ) : null}

      {/* Flash rojo del impacto (B) */}
      {impactFlash > 0.004 ? (
        <AbsoluteFill
          style={{
            background: "#DC2626",
            opacity: impactFlash * 0.5,
            zIndex: 9,
            mixBlendMode: "screen",
          }}
        />
      ) : null}

      {/* Panel espectral diegético (C): AUDIO LOG // 03:41 AM */}
      {blockC ? (
        <div
          style={{
            position: "absolute",
            top: 360,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 560,
              background: "rgba(4,6,10,0.72)",
              border: "1px solid rgba(34,211,238,0.35)",
              borderRadius: 12,
              padding: "14px 20px",
              boxShadow: "0 0 30px rgba(34,211,238,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONT_MONO,
                fontSize: 15,
                letterSpacing: 2,
                color: "rgba(242,239,233,0.85)",
              }}
            >
              <span>AUDIO LOG</span>
              <span style={{ color: "#22D3EE" }}>03:41 AM</span>
            </div>
            <svg width="100%" height="90" viewBox="0 0 520 90" style={{ marginTop: 8 }}>
              {Array.from({ length: BARS }, (_, i) => {
                const base =
                  0.16 +
                  0.5 * Math.abs(Math.sin(frame * 0.11 + i * 0.53)) +
                  0.28 * Math.abs(Math.sin(frame * 0.043 + i * 1.27));
                const burst = random(Math.floor(frame / 2) * BARS + i);
                const h =
                  crimsonT > 0
                    ? base * (1 - crimsonT) + (0.15 + burst * 0.9) * crimsonT
                    : base;
                const hh = Math.min(1, h);
                const color = crimsonT > 0.3 ? "#DC2626" : "#22D3EE";
                const x = 4 + i * (512 / BARS);
                const bw = (512 / BARS) * 0.5;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={88 - hh * 84}
                    width={bw}
                    height={hh * 84}
                    rx={1.5}
                    fill={color}
                    opacity={0.55 + hh * 0.45}
                  />
                );
              })}
            </svg>
            <div
              style={{
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: 3,
                  color: "#DC2626",
                  textShadow: "0 0 18px rgba(220,38,38,0.7)",
                  opacity: crimsonT,
                  transform: `translate(${(
                    (random(Math.floor(frame / 2) * 7 + 3) - 0.5) *
                    crimsonT *
                    10
                  ).toFixed(2)}px, ${(
                    (random(Math.floor(frame / 2) * 13 + 9) - 0.5) *
                    crimsonT *
                    8
                  ).toFixed(2)}px)`,
                }}
              >
                «soy el Rastrillo»
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Waveform Dive-Through de salida (494–516) */}
      {diveProg > 0.004 ? (
        <AbsoluteFill style={{ zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 56%, rgba(34,211,238,0.0), rgba(34,211,238,0.16) 30%, rgba(4,5,7,0.6) 76%)",
              opacity: diveProg,
            }}
          />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const rr = interpolate(
              diveProg,
              [0, 1],
              [120 + k * 40, 900 + k * 160],
              { easing: Easing.in(Easing.cubic) }
            );
            const o = (1 - diveProg) * (0.5 - k * 0.06);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "56%",
                  width: rr * 2,
                  height: rr * 2,
                  transform: "translate(-50%,-50%)",
                  borderRadius: "50%",
                  border: `3px solid ${
                    k % 2 === 0
                      ? "rgba(34,211,238,0.7)"
                      : "rgba(220,38,38,0.7)"
                  }`,
                  opacity: Math.max(0, o),
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
