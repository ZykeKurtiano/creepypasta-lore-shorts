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
import { WitnessModelRig } from "../components/characters/WitnessModelRig";
import { FONT_MONO, SafeCentered } from "../components/SafeZone";

/**
 * Scene5ItalyParasite (frames 1605–2078, 53.50–69.27s) — El Retake:
 * Parásito biológico documentado en una clínica aislada de Italia (2010).
 *
 * Micro-beats clínicos estilo Date un Short:
 *  1. Plano General del pasillo + sello RETAKE MODERNO + línea ECG.
 *  2. Sello ITALIA — 2010 + insignia QUARANTINE WARD + ECG acelerando.
 *  3. Lupa circular clínica (2.6x) sobre manos necróticas + rayos-X.
 *  4. Macro-Zoom 2.6x al rostro mutante + ECG carmesí (TRANSFORMACIÓN).
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OX = 540;
const OY = 960;

/** Manos necróticas del paciente (world). */
const HANDS = { x: 670, y: 1026 };
/** Rostro mutante del paciente (world). */
const FACE = { x: 511, y: 648 };

const MIST = Array.from({ length: 20 }, (_, i) => ({
  x: random(i * 3 + 1) * 1080,
  y0: 500 + random(i * 7 + 2) * 900,
  r: 40 + random(i * 5 + 3) * 120,
  speed: 0.03 + random(i * 9 + 4) * 0.08,
  phase: random(i * 13 + 5) * 1600,
}));

/** Parpadeo realista determinista del tubo fluorescente (2 momentos clave). */
const tubeFlicker = (frame: number): number => {
  const dip1 = interpolate(frame, [105, 112, 118, 126], [1, 0.42, 0.48, 1], {
    ...CLAMP,
  });
  const dip2 = interpolate(frame, [318, 325, 332, 340], [1, 0.38, 0.44, 1], {
    ...CLAMP,
  });
  const base =
    0.9 +
    0.06 * Math.sin(frame * 0.7) +
    (random(Math.floor(frame / 7) * 3 + 1) - 0.5) * 0.05;
  return Math.min(1, Math.max(0.3, base * dip1 * dip2));
};

/** Trazo ECG determinista que late y acelera con el bpm. */
const EcgTrace: React.FC<{
  bpm: number;
  color: string;
  glow: string;
  opacity: number;
}> = ({ bpm, color, glow, opacity }) => {
  const frame = useCurrentFrame();
  const W = 620;
  const H = 120;
  const speed = 30 + bpm * 1.2;
  const period = W / 2.2;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 6) {
    const phase = (((x - frame * speed) % period) + period) % period;
    const qrs = Math.exp(-Math.pow((phase - period * 0.52) / 9, 2)) * -62;
    const pwave = Math.exp(-Math.pow((phase - period * 0.22) / 20, 2)) * 16;
    const t = Math.exp(-Math.pow((phase - period * 0.72) / 26, 2)) * 10;
    const y = H * 0.5 + qrs + pwave + t;
    pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity }}>
      <line
        x1="0"
        y1={H * 0.5}
        x2={W}
        y2={H * 0.5}
        stroke="rgba(242,239,233,0.18)"
        strokeWidth="1"
      />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      />
    </svg>
  );
};

/** Insignia vectorial QUARANTINE WARD // BIO-PARASITE. */
const BiohazardInsignia: React.FC<{ opacity: number; scale: number }> = ({
  opacity,
  scale,
}) => (
  <SafeCentered top={560} zIndex={8}>
    <div style={{ opacity, transform: `scale(${scale})`, display: "inline-block" }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block", margin: "0 auto" }}>
        <circle cx="60" cy="60" r="54" fill="rgba(4,5,7,0.5)" stroke="#22D3EE" strokeWidth="3" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="#22D3EE" strokeWidth="2.5" opacity="0.9" />
        <circle cx="60" cy="60" r="9" fill="#DC2626" />
        {[0, 1, 2].map((k) => {
          const a = (k * 120 - 90) * (Math.PI / 180);
          const cx = 60 + Math.cos(a) * 30;
          const cy = 60 + Math.sin(a) * 30;
          return (
            <circle key={k} cx={cx} cy={cy} r="11" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
          );
        })}
      </svg>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 3,
          color: "#22D3EE",
          textShadow: "0 0 14px rgba(34,211,238,0.5)",
        }}
      >
        QUARANTINE WARD <span style={{ color: "#DC2626" }}>//</span> BIO-PARASITE
      </div>
    </div>
  </SafeCentered>
);

/** Sello clínico estampado. */
const ClinicalStamp: React.FC<{
  text: string;
  top: number;
  color?: string;
  scale: number;
  opacity: number;
  rotate?: number;
}> = ({ text, top, color = "#F2EFE9", scale, opacity, rotate = -4 }) => (
  <SafeCentered top={top} zIndex={8}>
    <div
      style={{
        display: "inline-block",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
        fontFamily: FONT_MONO,
        fontWeight: 800,
        letterSpacing: 3,
        fontSize: 30,
        color,
        border: `3px solid ${color}`,
        borderRadius: 8,
        padding: "12px 24px",
        background: "rgba(4,5,7,0.45)",
        boxShadow: `0 0 30px ${color}44`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </SafeCentered>
);

/** Lupa clínica con retícula médica, rayos-X de falanges y etiquetas. */
const ClinicalLoupe: React.FC<{
  x: number;
  y: number;
  r: number;
  opacity: number;
  progress: number;
}> = ({ x, y, r, opacity, progress }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      opacity,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        overflow: "hidden",
        background:
          "radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(6,24,34,0.34) 100%)",
        boxShadow: "inset 0 0 30px rgba(34,211,238,0.18)",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="loupe-xray" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#loupe-xray)" />
        {/* Guías de medición ósea (siguen los dedos sin taparlos) */}
        {[0, 1, 2].map((k) => {
          const len = 18 + progress * 34;
          const yBase = 84 + k * 22;
          const ang = -18 + k * 18;
          const x0 = 60 + k * 4;
          return (
            <g
              key={k}
              transform={`rotate(${ang} ${x0} ${yBase})`}
              stroke="#7DD3FC"
              strokeWidth="1.5"
              opacity="0.65"
              fill="none"
            >
              <line x1={x0} y1={yBase - 4} x2={x0 + len} y2={yBase - 4} />
              <line x1={x0} y1={yBase + 4} x2={x0 + len} y2={yBase + 4} />
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={x0 + len * f}
                  y1={yBase - 5}
                  x2={x0 + len * f}
                  y2={yBase + 5}
                />
              ))}
            </g>
          );
        })}
        {/* Retícula analítica fina cian/roja */}
        <circle cx="100" cy="100" r="78" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.65" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.65" />
        <line x1="100" y1="8" x2="100" y2="192" stroke="#22D3EE" strokeWidth="1" opacity="0.5" />
        <line x1="8" y1="100" x2="192" y2="100" stroke="#22D3EE" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
    {/* Anillo metálico */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "5px solid rgba(34,211,238,0.55)",
        boxShadow:
          "0 0 24px rgba(34,211,238,0.35), inset 0 0 8px rgba(0,0,0,0.5)",
      }}
    />
    {/* Etiquetas compactas */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -40,
        transform: "translateX(-50%)",
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 2,
        color: "#22D3EE",
        background: "rgba(4,5,7,0.82)",
        border: "1px solid rgba(34,211,238,0.7)",
        borderRadius: 6,
        padding: "6px 14px",
        whiteSpace: "nowrap",
        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
      }}
    >
      NECROSIS DÉRMICA
    </div>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: r * 2 + 10,
        transform: "translateX(-50%)",
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 2,
        color: "#DC2626",
        background: "rgba(4,5,7,0.82)",
        border: "1px solid rgba(220,38,38,0.7)",
        borderRadius: 6,
        padding: "6px 14px",
        whiteSpace: "nowrap",
        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
      }}
    >
      ELONGACIÓN ÓSEA
    </div>
  </div>
);

export const Scene5ItalyParasite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Coreografía de cámara en 4 micro-beats -------------------------
  let s: number;
  let px: number;
  let py: number;

  if (frame < 105) {
    s = interpolate(frame, [0, 105], [1, 1.12], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    });
    px = 540;
    py = 960;
  } else if (frame < 210) {
    s = interpolate(frame, [105, 210], [1.12, 1.25], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = 540;
    py = 980;
  } else if (frame < 315) {
    s = interpolate(frame, [210, 315], [1.25, 1.75], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [210, 315], [540, 590], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [210, 315], [980, 1000], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  } else {
    s = interpolate(frame, [315, 473], [1.75, 2.6], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    px = interpolate(frame, [315, 473], [590, FACE.x], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
    py = interpolate(frame, [315, 473], [1000, FACE.y], {
      easing: Easing.inOut(Easing.cubic),
      ...CLAMP,
    });
  }

  const TX = (OX - px) * s;
  const TY = (OY - py) * s;

  // Posiciones en pantalla de manos y rostro.
  const handSX = (HANDS.x - px) * s + OX;
  const handSY = (HANDS.y - py) * s + OY;
  const faceSX = (FACE.x - px) * s + OX;
  const faceSY = (FACE.y - py) * s + OY;

  // --- Progresión del paciente (0.2 → 1.0) ----------------------------
  const mutation = interpolate(frame, [105, 473], [0.2, 1], { ...CLAMP });
  const panicLevel = interpolate(frame, [105, 473], [0.15, 0.9], { ...CLAMP });

  // --- Ventanas de micro-beats ---
  const mb1 = interpolate(frame, [0, 10, 96, 105], [0, 1, 1, 0], { ...CLAMP });
  const mb2 = interpolate(frame, [105, 115, 200, 210], [0, 1, 1, 0], { ...CLAMP });
  const mb3 = interpolate(frame, [210, 220, 306, 315], [0, 1, 1, 0], { ...CLAMP });
  const mb4 = interpolate(frame, [315, 325], [0, 1], { ...CLAMP });

  const bpm = interpolate(frame, [105, 315], [70, 150], { ...CLAMP });

  const stamp1 = spring({
    frame: frame - 14,
    fps,
    config: { damping: 13, stiffness: 160, mass: 0.7 },
  });
  const stamp2 = spring({
    frame: frame - 118,
    fps,
    config: { damping: 13, stiffness: 160, mass: 0.7 },
  });

  const xrayProgress = interpolate(frame, [220, 306], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });

  const flicker = tubeFlicker(frame);

  // Pulso carmesí del monitor ECG final (315–473).
  const finalPulse =
    mb4 * (0.5 + 0.5 * Math.sin(frame * 0.3));

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
        {/* 1. Background clínico */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img
            src={staticFile("backgrounds/bg_s5.png")}
            style={{
              position: "absolute",
              width: "112%",
              height: "112%",
              left: "-6%",
              top: "-6%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* 2. Tubo fluorescente superior parpadeante */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: 0,
            right: 0,
            height: 260,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.35), transparent 70%)",
            mixBlendMode: "screen",
            opacity: flicker,
            pointerEvents: "none",
          }}
        />

        {/* 3. Niebla estéril verdosa/cian */}
        {MIST.map((m, i) => {
          const y = m.y0 - ((frame * m.speed + m.phase) % 1400);
          const x = m.x + Math.sin(frame * 0.01 + i * 1.1) * 40;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: x,
                width: m.r * 2,
                height: m.r * 0.6,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(34,211,238,0.08), transparent 70%)",
                filter: "blur(16px)",
              }}
            />
          );
        })}

        {/* 4. Paciente mutado */}
        <WitnessModelRig
          variant="patient_mutated"
          width={720}
          x={540}
          y={1560}
          panicLevel={panicLevel}
          mutationEyeDarkness={mutation}
          rimColor="rgba(34,211,238,0.52)"
          showFloorShadow
        />
      </div>

      {/* --- Micro-beat 1: RETAKE MODERNO + ECG --- */}
      <div style={{ opacity: mb1, pointerEvents: "none" }}>
        <ClinicalStamp
          text="RETAKE MODERNO — BIO-HORROR"
          top={340}
          color="#F2EFE9"
          scale={stamp1}
          opacity={mb1}
        />
        <SafeCentered top={760} zIndex={6}>
          <EcgTrace bpm={70} color="#22D3EE" glow="#22D3EE" opacity={mb1 * 0.9} />
        </SafeCentered>
      </div>

      {/* --- Micro-beat 2: ITALIA — 2010 + insignia --- */}
      <div style={{ opacity: mb2, pointerEvents: "none" }}>
        <ClinicalStamp
          text="ITALIA — 2010"
          top={360}
          color="#FDE047"
          scale={stamp2}
          opacity={mb2}
        />
        <BiohazardInsignia opacity={mb2} scale={stamp2} />
        <SafeCentered top={800} zIndex={6}>
          <EcgTrace bpm={bpm} color="#22D3EE" glow="#22D3EE" opacity={mb2 * 0.9} />
        </SafeCentered>
      </div>

      {/* --- Micro-beat 3: lupa clínica sobre manos --- */}
      <ClinicalLoupe
        x={handSX}
        y={handSY}
        r={150}
        opacity={mb3}
        progress={xrayProgress}
      />

      {/* --- Micro-beat 4: monitor ECG carmesí + transformación --- */}
      <div style={{ opacity: mb4, pointerEvents: "none" }}>
        <SafeCentered top={340} zIndex={8}>
          <EcgTrace
            bpm={150}
            color="#DC2626"
            glow="#DC2626"
            opacity={finalPulse}
          />
        </SafeCentered>
        <SafeCentered top={500} zIndex={8}>
          <div
            style={{
              display: "inline-block",
              opacity: finalPulse,
              fontFamily: FONT_MONO,
              fontWeight: 800,
              letterSpacing: 4,
              fontSize: 26,
              color: "#DC2626",
              textShadow: "0 0 20px rgba(220,38,38,0.6)",
              background: "rgba(4,5,7,0.5)",
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid rgba(220,38,38,0.5)",
            }}
          >
            TRANSFORMATION: <span style={{ color: "#F2EFE9" }}>100%</span>
          </div>
        </SafeCentered>
      </div>

      {/* Retícula clínica final sobre el rostro mutante */}
      {mb4 > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: faceSX - 170,
            top: faceSY - 170,
            width: 340,
            height: 340,
            opacity: mb4,
            pointerEvents: "none",
          }}
        >
          <svg width="340" height="340" viewBox="0 0 340 340">
            <circle cx="170" cy="170" r="150" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.8" />
            <circle cx="170" cy="170" r="110" fill="none" stroke="#22D3EE" strokeWidth="1.4" strokeDasharray="4 4" opacity="0.7" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1="170"
                y1="22"
                x2="170"
                y2="60"
                stroke="#DC2626"
                strokeWidth="2.6"
                transform={`rotate(${a} 170 170)`}
              />
            ))}
          </svg>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
