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
import { RakeCharacter } from "../components/characters/RakeCharacter";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene2Archive2003 (frames 177–853, 5.90–28.43s) — Apagón 2003 y archivos.
 *
 * Mesa de archivo oscura bajo lámpara cálida. Seis micro-beats Kurzgesagt:
 *  1. contador 2003 + mapa Noreste con pines de radar,
 *  2. apagón mediático (tiras de censura + sello MEDIA BLACKOUT),
 *  3. línea de tiempo 2003→2006 + hilos rojos a 1691/1964,
 *  4. bitácora 1691 + lupa circular 2.4x,
 *  5. carta 1964 + lupa circular 2.4x,
 *  6. revelación THE RAKE (RakeCharacter) + salida Page-Flip Match-Cut.
 */

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const DUST = Array.from({ length: 28 }, (_, i) => ({
  x: 120 + random(i * 3 + 1) * 840,
  y0: 420 + random(i * 7 + 2) * 900,
  r: 1.4 + random(i * 5 + 3) * 2.4,
  speed: 0.05 + random(i * 9 + 4) * 0.12,
  phase: random(i * 13 + 5) * 1200,
  sway: (random(i * 11 + 7) - 0.5) * 22,
}));

// Pines de radar (sistema de coordenadas del SVG 620x560).
const PINS = [
  { x: 470, y: 150 },
  { x: 500, y: 190 },
  { x: 448, y: 214 },
  { x: 330, y: 220 },
  { x: 360, y: 250 },
  { x: 320, y: 282 },
  { x: 260, y: 320 },
  { x: 290, y: 360 },
  { x: 250, y: 392 },
];

const NE_PATH =
  "M 210 70 L 320 60 L 400 50 L 470 70 L 520 110 L 545 165 L 500 205 L 470 200 L 450 240 L 420 280 L 430 330 L 400 370 L 410 420 L 380 460 L 340 470 L 300 440 L 280 390 L 250 340 L 210 300 L 190 250 L 170 190 L 180 130 Z";

/** Sello diegético de tinta con golpe de spring. */
const Stamp: React.FC<{
  text: string;
  top: number;
  rotate?: number;
  color?: string;
  scale: number;
  opacity: number;
}> = ({ text, top, rotate = -6, color = "#DC2626", scale, opacity }) => (
  <SafeCentered top={top} zIndex={7}>
    <div
      style={{
        display: "inline-block",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
        fontFamily: FONT_MONO,
        fontWeight: 800,
        letterSpacing: 2,
        fontSize: 34,
        color,
        border: `4px solid ${color}`,
        borderRadius: 8,
        padding: "14px 26px",
        background: "rgba(4,5,7,0.42)",
        boxShadow: `0 0 30px ${color}55`,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </SafeCentered>
);

/** Lupa circular analítica con zoom interno (clipPath circular). */
const Loupe: React.FC<{
  x: number;
  y: number;
  r: number;
  opacity: number;
  text: string;
  label?: string;
  accent?: string;
}> = ({ x, y, r, opacity, text, label, accent = "#7F1D1D" }) => (
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
    {/* Contenido ampliado recortado en círculo */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 35% 30%, #F5EBD6, #D8C7A8)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 34px",
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: 30,
          color: accent,
          lineHeight: 1.15,
        }}
      >
        {text}
      </div>
      {label ? (
        <div
          style={{
            position: "absolute",
            bottom: r * 0.18,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT_MONO,
            fontSize: r * 0.085,
            letterSpacing: 2,
            color: "#6B5B43",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
    {/* Anillo metálico */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "6px solid rgba(120,130,140,0.85)",
        boxShadow:
          "0 4px 18px rgba(0,0,0,0.6), inset 0 0 8px rgba(0,0,0,0.4)",
      }}
    />
    {/* Reflejo de cristal */}
    <div
      style={{
        position: "absolute",
        top: r * 0.12,
        left: r * 0.14,
        width: r * 0.5,
        height: r * 0.28,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05))",
        transform: "rotate(-24deg)",
      }}
    />
  </div>
);

/** Bitácora marítima 1691 (hoja envejecida sepia). */
const MarinerLog: React.FC<{
  opacity: number;
  x: number;
  y: number;
  rot: number;
  highlightOpacity?: number;
}> = ({ opacity, x, y, rot, highlightOpacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 620,
      opacity,
      transform: `rotate(${rot}deg)`,
      transformOrigin: "50% 50%",
    }}
  >
    <svg
      viewBox="0 0 620 840"
      width="100%"
      style={{ overflow: "visible", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }}
    >
      <rect x="0" y="0" width="620" height="840" rx="6" fill="#E8DCC0" stroke="#8A7350" strokeWidth="2" />
      {/* Manchas de envejecimiento */}
      <ellipse cx="500" cy="90" rx="120" ry="60" fill="#C9B78E" opacity="0.5" />
      <ellipse cx="90" cy="760" rx="150" ry="80" fill="#C9B78E" opacity="0.45" />
      <ellipse cx="120" cy="300" rx="90" ry="50" fill="#D5C49C" opacity="0.4" />
      {/* Encabezado */}
      <text x="310" y="84" textAnchor="middle" fontFamily={FONT_MONO} fontSize="38" fill="#3E2F1C" fontWeight="700">
        BITÁCORA — 1691
      </text>
      <line x1="110" y1="112" x2="510" y2="112" stroke="#3E2F1C" strokeWidth="2" opacity="0.6" />
      {/* Líneas caligráficas */}
      {[
        "el mar estaba en calma, el farol bajo,",
        "la tripulación no pudo dormir.",
        "vimos al pie del mástil,",
        "un ser pálido que no se iba —",
      ].map((line, i) => (
        <text
          key={i}
          x="90"
          y={196 + i * 66}
          fontFamily={FONT_SANS}
          fontStyle="italic"
          fontSize="31"
          fill="#57432A"
          opacity="0.85"
        >
          {line}
        </text>
      ))}
      {/* Frase destacada (tinta oscura/roja) */}
      <text x="90" y="520" fontFamily={FONT_SANS} fontStyle="italic" fontSize="33" fill="#7F1D1D" fontWeight="700" opacity={highlightOpacity}>
        “cuencas negras…
      </text>
      <text x="90" y="566" fontFamily={FONT_SANS} fontStyle="italic" fontSize="33" fill="#7F1D1D" fontWeight="700" opacity={highlightOpacity}>
        nos observaba”
      </text>
      <text x="90" y="660" fontFamily={FONT_SANS} fontStyle="italic" fontSize="31" fill="#57432A" opacity="0.85">
        rezamos para que la marea se lo llevara.
      </text>
    </svg>
  </div>
);

/** Carta mecanografiada 1964 (papel amarillento, fuente mono). */
const SuicideNote: React.FC<{
  opacity: number;
  x: number;
  y: number;
  rot: number;
}> = ({ opacity, x, y, rot }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 560,
      opacity,
      transform: `rotate(${rot}deg)`,
      transformOrigin: "50% 50%",
    }}
  >
    <svg
      viewBox="0 0 560 640"
      width="100%"
      style={{ overflow: "visible", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }}
    >
      <rect x="0" y="0" width="560" height="640" rx="6" fill="#E6D7A8" stroke="#9A8458" strokeWidth="2" />
      <ellipse cx="460" cy="560" rx="130" ry="70" fill="#CDB87E" opacity="0.5" />
      <text x="280" y="74" textAnchor="middle" fontFamily={FONT_MONO} fontSize="34" fill="#2E2313" fontWeight="700">
        CARTA DE SUICIDIO — 1964
      </text>
      <line x1="80" y1="98" x2="480" y2="98" stroke="#2E2313" strokeWidth="2" opacity="0.5" />
      {[
        "I cannot sleep. It stands there",
        "every night, watching me breathe.",
        "It has no face, only sockets,",
        "and long fingers that scrape",
        "the wall beside the bed.",
      ].map((line, i) => (
        <text key={i} x="70" y={172 + i * 46} fontFamily={FONT_MONO} fontSize="24" fill="#3A2D18" opacity="0.9">
          {line}
        </text>
      ))}
      {/* Frase destacada */}
      <text x="70" y="440" fontFamily={FONT_MONO} fontSize="26" fill="#7F1D1D" fontWeight="700">
        “el Rastrillo…
      </text>
      <text x="70" y="484" fontFamily={FONT_MONO} fontSize="26" fill="#7F1D1D" fontWeight="700">
        al pie de la cama”
      </text>
    </svg>
  </div>
);

export const Scene2Archive2003: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Ventanas de visibilidad de cada micro-beat --------------------
  const mb1 = interpolate(frame, [0, 10, 138, 150], [0, 1, 1, 0], { ...CLAMP });
  const mb2 = interpolate(frame, [140, 150, 245, 255], [0, 1, 1, 0], { ...CLAMP });
  const mb3 = interpolate(frame, [245, 255, 355, 365], [0, 1, 1, 0], { ...CLAMP });
  const mb4 = interpolate(frame, [355, 365, 440, 450], [0, 1, 1, 0], { ...CLAMP });
  const mb5 = interpolate(frame, [440, 450, 530, 540], [0, 1, 1, 0], { ...CLAMP });
  const mb6 = interpolate(frame, [530, 540], [0, 1], { ...CLAMP });

  // --- Micro-beat 1: contador 2003 + pines de radar ------------------
  const count = Math.round(
    interpolate(frame, [10, 38], [1960, 2003], {
      easing: Easing.out(Easing.cubic),
      ...CLAMP,
    })
  );

  // --- Micro-beat 2: sello MEDIA BLACKOUT ----------------------------
  const stampScale = spring({
    frame: frame - 168,
    fps,
    config: { damping: 13, stiffness: 160, mass: 0.7 },
  });
  const blackoutDim = interpolate(frame, [145, 175, 240, 255], [0, 0.5, 0.5, 0], {
    ...CLAMP,
  });

  // --- Micro-beat 3: línea de tiempo ---------------------------------
  const timelineDraw = interpolate(frame, [255, 330], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const archiveScale = spring({
    frame: frame - 330,
    fps,
    config: { damping: 13, stiffness: 160, mass: 0.7 },
  });

  // --- Micro-beat 4: bitácora 1691 + lupa ----------------------------
  const logRot = interpolate(frame, [360, 400], [6, -2], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const logY = interpolate(frame, [360, 400], [140, 0], {
    easing: Easing.out(Easing.cubic),
    ...CLAMP,
  });
  const loupe1x = interpolate(frame, [380, 430], [-120, 540], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const loupe1y = interpolate(frame, [380, 430], [620, 1040], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });

  // La lupa 1 pasa sobre la bitácora: la línea roja subyacente se desvanece
  // para no quedar cortada por el borde izquierdo de la lupa.
  const logHighlightOp = interpolate(loupe1x, [100, 240], [1, 0], { ...CLAMP });

  // --- Micro-beat 5: carta 1964 + lupa -------------------------------
  const noteX = interpolate(frame, [445, 485], [520, 40], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const noteRot = interpolate(frame, [445, 485], [-10, -4], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const loupe2x = interpolate(frame, [470, 515], [-120, 640], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const loupe2y = interpolate(frame, [470, 515], [640, 1120], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });

  // --- Micro-beat 6: THE RAKE ----------------------------------------
  const rakeOpacity = interpolate(frame, [535, 600], [0, 0.92], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const rakeMouth = interpolate(frame, [535, 645], [0, 0.62], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const rakeClaw = 0.3 + 0.25 * Math.sin(frame * 0.13);
  const titlePop = spring({
    frame: frame - 605,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
  });
  const docsDim = interpolate(frame, [535, 600], [0, 0.9], { ...CLAMP });

  // --- Salida Page-Flip Match-Cut (654–676) --------------------------
  const flipDeg = interpolate(frame, [654, 676], [0, 88], {
    easing: Easing.inOut(Easing.cubic),
    ...CLAMP,
  });
  const flipProg = interpolate(frame, [654, 676], [0, 1], { ...CLAMP });

  // --- Parpadeo cálido del cono de lámpara ---------------------------
  const lampFlicker = 0.78 + 0.22 * Math.sin(frame * 0.4) + (random(Math.floor(frame / 5) + 3) > 0.94 ? 0.08 : 0);

  // --- Deriva de cámara suave ----------------------------------------
  const drift = 1 + interpolate(frame, [0, 650], [0, 0.05], { ...CLAMP });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      {/* Capa de revelación: bg_s3 (visible al girar la página) */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile("backgrounds/bg_s3.png")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9,
          }}
        />
        <AbsoluteFill style={{ background: "rgba(2,3,5,0.35)" }} />
      </AbsoluteFill>

      {/* Página (contenido de la escena) que gira al salir */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "left center",
          transform: `perspective(1400px) rotateY(${(-flipDeg).toFixed(2)}deg)`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Mundo interior (con deriva de cámara) */}
        <AbsoluteFill
          style={{ transform: `scale(${drift.toFixed(4)})`, transformOrigin: "50% 50%" }}
        >
          {/* 1. Background */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <Img
              src={staticFile("backgrounds/bg_s2.png")}
              style={{
                position: "absolute",
                width: "108%",
                height: "108%",
                left: "-4%",
                top: "-4%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* 2. Cono de lámpara cálido (blend screen) */}
          <div
            style={{
              position: "absolute",
              top: 200,
              left: 140,
              width: 800,
              height: 900,
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,214,150,0.22), rgba(255,190,120,0.06) 55%, transparent 75%)",
              mixBlendMode: "screen",
              opacity: lampFlicker,
              pointerEvents: "none",
            }}
          />

          {/* 3. Polvo iluminado */}
          {DUST.map((d, i) => {
            const y = d.y0 - ((frame * d.speed + d.phase) % 1200);
            const x = d.x + Math.sin(frame * 0.02 + i * 1.3) * d.sway;
            const op = 0.06 + 0.2 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
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
                  background: "#FFE6B8",
                  opacity: op,
                  boxShadow: "0 0 6px rgba(255,214,150,0.5)",
                }}
              />
            );
          })}

          {/* --- Micro-Beat 1: 2003 + mapa Noreste --- */}
          <div style={{ opacity: mb1, pointerEvents: "none" }}>
            {/* Contador 2003 */}
            <SafeCentered top={345} zIndex={6}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontWeight: 800,
                  fontSize: 96,
                  letterSpacing: 2,
                  color: "#FDE047",
                  textShadow: "0 0 30px rgba(253,224,71,0.4), 0 2px 18px rgba(0,0,0,0.9)",
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: FONT_MONO,
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: 4,
                  color: "#F2EFE9",
                  opacity: 0.9,
                }}
              >
                NORESTE EE.UU. <span style={{ color: "#DC2626" }}>—</span> OLEADA DE AVISTAMIENTOS
              </div>
            </SafeCentered>

            {/* Silueta cartográfica + pines de radar */}
            <div
              style={{
                position: "absolute",
                top: 760,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 620 560" width="620" style={{ overflow: "visible" }}>
                <defs>
                  <radialGradient id="s2-radar" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Rejilla */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={`v${i}`} x1={i * 124} y1="0" x2={i * 124} y2="560" stroke="rgba(148,197,255,0.1)" strokeWidth="1" />
                ))}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={`h${i}`} x1="0" y1={i * 112} x2="620" y2={i * 112} stroke="rgba(148,197,255,0.1)" strokeWidth="1" />
                ))}
                {/* Silueta */}
                <path d={NE_PATH} fill="rgba(43,58,66,0.22)" stroke="rgba(148,197,255,0.35)" strokeWidth="2" />
                {/* Pines de radar brotando secuencialmente */}
                {PINS.map((p, i) => {
                  const sp = spring({
                    frame: frame - (20 + i * 9),
                    fps,
                    config: { damping: 12, stiffness: 170, mass: 0.6 },
                  });
                  const ring = ((frame * 1.1 + i * 13) % 60) / 60;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={12 + ring * 26} fill="none" stroke="#DC2626" strokeWidth="1.5" opacity={(1 - ring) * 0.6} />
                      <circle cx={p.x} cy={p.y} r={14} fill="url(#s2-radar)" opacity={0.5 + ring * 0.5} />
                      <circle cx={p.x} cy={p.y} r={4 * sp} fill="#DC2626" style={{ filter: "drop-shadow(0 0 6px #DC2626)" }} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* --- Micro-Beat 2: apagón mediático --- */}
          <div style={{ opacity: mb2, pointerEvents: "none" }}>
            {/* Caída de brillo ambiental */}
            <AbsoluteFill style={{ background: "rgba(2,3,5,0.9)", opacity: blackoutDim }} />
            {/* Tiras de censura */}
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const y = 360 + k * 150 + Math.sin(frame * 0.02 + k) * 8;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    top: y,
                    left: 0,
                    right: 0,
                    height: 34 + (k % 2) * 18,
                    background: "#000000",
                    boxShadow: "0 0 20px rgba(0,0,0,0.7)",
                    transform: `rotate(${k % 2 === 0 ? 0.6 : -0.5}deg)`,
                  }}
                />
              );
            })}
            <Stamp text="MEDIA BLACKOUT" top={620} rotate={-6} scale={stampScale} opacity={mb2} />
          </div>

          {/* --- Micro-Beat 3: línea de tiempo 2003 → 2006 --- */}
          <div style={{ opacity: mb3, pointerEvents: "none" }}>
            <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
              {/* Eje horizontal */}
              <line
                x1="150"
                y1="560"
                x2="930"
                y2="560"
                stroke="#F2EFE9"
                strokeWidth="3"
                strokeDasharray="780"
                strokeDashoffset={780 * (1 - timelineDraw)}
              />
              <circle cx="150" cy="560" r="10" fill="#F2EFE9" />
              <circle cx="930" cy="560" r="10" fill="#FDE047" />
              <text x="150" y="530" textAnchor="middle" fontFamily={FONT_MONO} fontSize="30" fill="#F2EFE9" fontWeight="700">
                2003
              </text>
              <text x="930" y="530" textAnchor="middle" fontFamily={FONT_MONO} fontSize="30" fill="#FDE047" fontWeight="700">
                2006
              </text>
              {/* Hilos rojos a 1691 y 1964 */}
              <path d="M 300 560 C 300 700, 260 800, 320 900" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="6 6" opacity={timelineDraw} />
              <path d="M 720 560 C 720 720, 760 840, 700 960" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="6 6" opacity={timelineDraw} />
              <text x="320" y="950" textAnchor="middle" fontFamily={FONT_MONO} fontSize="34" fill="#FDE047" fontWeight="700">
                1691
              </text>
              <text x="700" y="1010" textAnchor="middle" fontFamily={FONT_MONO} fontSize="34" fill="#FDE047" fontWeight="700">
                1964
              </text>
            </svg>
            <Stamp text="ARCHIVO DE SOBREVIVIENTES // 2006" top={1100} rotate={3} color="#FDE047" scale={archiveScale} opacity={mb3} />
          </div>

          {/* --- Micro-Beat 4: bitácora 1691 + lupa --- */}
          <div style={{ opacity: mb4 }}>
            <MarinerLog
              opacity={mb4}
              x={230}
              y={560 + logY}
              rot={logRot}
              highlightOpacity={logHighlightOp}
            />
            <Loupe x={loupe1x} y={loupe1y} r={150} opacity={mb4} text="“cuencas negras… nos observaba”" label="1691 · BITÁCORA" />
          </div>

          {/* --- Micro-Beat 5: carta 1964 + lupa --- */}
          <div style={{ opacity: mb5 }}>
            <SuicideNote opacity={mb5} x={noteX} y={680} rot={noteRot} />
            <Loupe x={loupe2x} y={loupe2y} r={150} opacity={mb5} text="“el Rastrillo… al pie de la cama”" label="1964 · SUICIDIO" />
          </div>

          {/* --- Micro-Beat 6: THE RAKE --- */}
          <div style={{ opacity: mb6, pointerEvents: "none" }}>
            {/* Oscurecimiento de documentos */}
            <AbsoluteFill style={{ background: "rgba(2,3,5,0.9)", opacity: docsDim * mb6 }} />

            {/* The Rake emergiendo tras la mesa (cuerpo entero, floorY=1480) */}
            <RakeCharacter
              x={540}
              floorY={1480}
              scale={1.3}
              opacity={rakeOpacity * mb6}
              mode="crouch_watch"
              lookTarget={{ x: 0.15, y: -0.1 }}
              mouthOpen={rakeMouth}
              clawFlex={rakeClaw}
              rimColor="#DC2626"
              eyeGlowColor="#FDE047"
            />

            {/* Título monumental */}
            <SafeCentered top={410} zIndex={8}>
              <div
                style={{
                  display: "inline-block",
                  transform: `scale(${titlePop})`,
                  fontFamily: FONT_SANS,
                  fontWeight: 900,
                  fontSize: 96,
                  letterSpacing: 2,
                  color: "#F2EFE9",
                  textShadow:
                    "0 0 34px rgba(220,38,38,0.55), 0 4px 30px rgba(0,0,0,0.9)",
                  lineHeight: 1,
                }}
              >
                THE RAKE
                <div
                  style={{
                    margin: "14px auto 0",
                    width: 260,
                    height: 3,
                    background:
                      "linear-gradient(90deg, transparent, rgba(220,38,38,0.9), transparent)",
                  }}
                />
                <div
                  style={{
                    marginTop: 16,
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 34,
                    letterSpacing: 6,
                    color: "#FDE047",
                    textShadow: "0 0 22px rgba(253,224,71,0.4)",
                  }}
                >
                  EL RASTRILLO
                </div>
              </div>
            </SafeCentered>
          </div>
        </AbsoluteFill>

        {/* Sombreado dinámico del pliegue al girar la página */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
            opacity: flipProg,
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
