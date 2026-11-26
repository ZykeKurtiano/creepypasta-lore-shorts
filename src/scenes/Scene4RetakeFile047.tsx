import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { HumanBase } from "../components/stock/HumanBase";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene4RetakeFile047 (frames 1512–1919, local 0–407) — El Retake · Sobrecarga
 * Sensorial, Archivo 047.
 *
 * Estética de informe confidencial limpio (borde fino cian/lavanda) con un
 * investigador de cuerpo entero a la izquierda y un diagrama explicativo
 * estilo "Date un Short" a la derecha. Micro-beats:
 *   - 0–130   : Sello tachado "SIN MALDICIONES" + icono espectral disolviéndose
 *               en ondas geométricas puras.
 *   - 130–275 : Flujo paso a paso (chip DMG-CPU 4CH → audífonos estéreo) con
 *               flechas brillantes y ondas cuadradas disonantes.
 *   - 275–407 : Silueta cerebral vectorial con zonas VIGILANCIA (cian) e
 *               INCERTIDUMBRE (rojo/violeta) y pulsos sinápticos; cierre con
 *               suave Zoom-Out preparando el apagón de consola.
 */

const OUTLINE = "#090A12";

/** Ondas cuadradas disonantes deterministas del chip. */
function squareWavePath(yMid: number, amp: number, period: number, seed: number): string {
  let d = `M 0 ${yMid}`;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const x0 = (i * 2 * period) / n;
    const x1 = ((i * 2 + 1) * period) / n;
    d += ` L ${x0.toFixed(1)} ${(yMid - amp).toFixed(1)}`;
    d += ` L ${x1.toFixed(1)} ${(yMid + amp).toFixed(1)}`;
  }
  return d;
}

/** Cabecera de informe confidencial con borde fino cian/lavanda. */
const ReportHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const in0 = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scan = 0.5 + 0.5 * Math.sin(frame * 0.06);
  return (
    <SafeCentered top={356} zIndex={6} maxWidth={720}>
      <div
        style={{
          opacity: in0,
          display: "inline-block",
          fontFamily: FONT_MONO,
          letterSpacing: 3,
          color: "#F2EFE9",
          border: "1.5px solid rgba(34,211,238,0.55)",
          boxShadow:
            "0 0 0 1px rgba(167,139,250,0.35), 0 0 30px rgba(34,211,238,0.12), inset 0 0 24px rgba(167,139,250,0.08)",
          background: "linear-gradient(180deg, rgba(9,10,18,0.82), rgba(11,10,24,0.82))",
          padding: "10px 26px",
          borderRadius: 10,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 5 }}>
          ARCHIVO <span style={{ color: "#22D3EE" }}>047</span>
        </div>
        <div
          style={{
            margin: "8px auto 0",
            width: 240,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(34,211,238,${0.4 + scan * 0.3}), transparent)`,
          }}
        />
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 4, color: "rgba(242,239,233,0.72)", marginTop: 8 }}>
          ANÁLISIS PSICOACÚSTICO
        </div>
      </div>
    </SafeCentered>
  );
};

/** Fase 1 — Sello tachado SIN MALDICIONES + icono espectral → ondas puras. */
const Phase1: React.FC<{ frame: number }> = ({ frame }) => {
  const stampIn = spring({
    frame: frame - 12,
    fps: 30,
    config: { damping: 15, mass: 0.8, stiffness: 120 },
  });
  const stampScale = Math.min(1, stampIn);
  const stampOp = interpolate(frame, [12, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Línea roja de tachado que se dibuja.
  const slash = interpolate(frame, [40, 92], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Icono espectral disolviéndose en ondas geométricas.
  const iconFade = interpolate(frame, [30, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringT = interpolate(frame, [40, 130], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [40, 60, 115], [0, 0.5, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 515 665" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* Sello tachado SIN MALDICIONES */}
      <g
        opacity={stampOp}
        transform={`translate(257.5, 150) scale(${stampScale})`}
      >
        <rect
          x="-150"
          y="-54"
          width="300"
          height="108"
          rx="8"
          fill="rgba(9,10,18,0.78)"
          stroke="#DC2626"
          strokeWidth="3"
          strokeDasharray="1 0"
        />
        <rect
          x="-142"
          y="-46"
          width="284"
          height="92"
          rx="5"
          fill="none"
          stroke="rgba(220,38,38,0.35)"
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fontFamily={FONT_SANS}
          fontSize="30"
          fontWeight={800}
          letterSpacing="2"
          fill="#F2EFE9"
        >
          SIN MALDICIONES
        </text>
        {/* Línea de tachado que se dibuja */}
        <g clipPath="url(#s4-slash-clip)">
          <line
            x1={-160 * slash + 160}
            y1="-40"
            x2={160 * slash - 160}
            y2="40"
            stroke="#DC2626"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.7))" }}
          />
        </g>
      </g>

      {/* Icono espectral disolviéndose */}
      <g opacity={iconFade} transform="translate(257.5, 320)">
        <path
          d="M 0 -46 C 30 -46, 42 -18, 38 14 C 36 38, 24 52, 0 52 C -24 52, -36 38, -38 14 C -42 -18, -30 -46, 0 -46 Z"
          fill="rgba(167,139,250,0.55)"
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path
          d="M 0 46 C -14 40, -18 50, -26 44 C -34 38, -20 30, 0 38 C 20 30, 34 38, 26 44 C 18 50, 14 40, 0 46 Z"
          fill="rgba(167,139,250,0.55)"
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <circle cx="-14" cy="-2" r="3.2" fill="#0B0A18" />
        <circle cx="14" cy="-2" r="3.2" fill="#0B0A18" />
      </g>

      {/* Ondas geométricas puras que emergen del icono */}
      {[0, 1, 2].map((i) => {
        const r = 20 + ringT * (30 + i * 38);
        return (
          <circle
            key={i}
            cx="257.5"
            cy="320"
            r={r}
            fill="none"
            stroke={i % 2 === 0 ? "#22D3EE" : "#A78BFA"}
            strokeWidth="2"
            strokeDasharray="6 7"
            opacity={ringOpacity * (1 - i * 0.22)}
          />
        );
      })}
      <path
        d={`M ${90} ${430} Q 150 ${430 - 22 * ringT}, 210 ${430} T 330 ${430} T 450 ${430}`}
        fill="none"
        stroke="#A78BFA"
        strokeWidth="2"
        opacity={ringOpacity * 0.7}
        strokeLinecap="round"
      />

      <defs>
        <clipPath id="s4-slash-clip">
          <rect x="-160" y="-60" width={320 * slash} height="120" />
        </clipPath>
      </defs>
    </svg>
  );
};

/** Fase 2 — Flujo chip DMG-CPU 4CH → audífonos estéreo. */
const Phase2: React.FC<{ frame: number }> = ({ frame }) => {
  const chipIn = interpolate(frame, [130, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hpIn = interpolate(frame, [175, 205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowIn = interpolate(frame, [160, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const waveAmp = 10 + Math.sin(frame * 0.14) * 4;
  const emerald = squareWavePath(250, waveAmp, 130, 3);
  const lavender = squareWavePath(250, waveAmp + 6, 130, 7);
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.18);

  // Puntos de la flecha (3 flechas descendentes brillantes).
  const arrows = [0, 1, 2].map((i) => {
    const x = 150 + i * 105;
    const flow = ((frame * 1.4 + i * 30) % 90) / 90;
    return { x, flow };
  });

  return (
    <svg viewBox="0 0 515 665" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* Caja del chip DMG-CPU 4CH */}
      <g opacity={chipIn} transform="translate(257.5, 120)">
        <rect x="-95" y="-60" width="190" height="120" rx="10" fill="rgba(9,10,18,0.82)" stroke="#84CC16" strokeWidth="2" />
        <rect x="-80" y="-48" width="160" height="96" rx="6" fill="rgba(132,204,22,0.06)" stroke="rgba(132,204,22,0.4)" strokeWidth="1.2" />
        {/* Pines del chip */}
        {[-70, -40, -10, 20, 50, 80].map((x) => (
          <rect key={x} x={x} y={-72} width="10" height="12" fill="#1E293B" stroke={OUTLINE} strokeWidth="1.4" />
        ))}
        {[-70, -40, -10, 20, 50, 80].map((x) => (
          <rect key={x} x={x} y={60} width="10" height="12" fill="#1E293B" stroke={OUTLINE} strokeWidth="1.4" />
        ))}
        <text x="0" y="-16" textAnchor="middle" fontFamily={FONT_MONO} fontSize="17" fontWeight={800} letterSpacing="2" fill="#D9F99D">
          DMG-CPU 4CH
        </text>
        <text x="0" y="10" textAnchor="middle" fontFamily={FONT_MONO} fontSize="11" letterSpacing="3" fill="rgba(217,249,157,0.7)">
          ONDAS CUADRADAS
        </text>
      </g>

      {/* Ondas cuadradas disonantes emitidas */}
      <g opacity={chipIn} style={{ filter: "drop-shadow(0 0 6px rgba(132,204,22,0.5))" }}>
        <path d={emerald} fill="none" stroke="#84CC16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={lavender} fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </g>

      {/* Flechas brillantes descendentes */}
      {arrows.map((a, i) => (
        <g key={i} opacity={arrowIn}>
          <line
            x1={a.x}
            y1={200 + a.flow * 40}
            x2={a.x}
            y2={240 + a.flow * 40}
            stroke={i === 1 ? "#FDE047" : "#22D3EE"}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={`M ${a.x - 7} ${240 + a.flow * 40 - 8} L ${a.x} ${240 + a.flow * 40} L ${a.x + 7} ${240 + a.flow * 40 - 8}`}
            fill="none"
            stroke={i === 1 ? "#FDE047" : "#22D3EE"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* Caja de audífonos estéreo */}
      <g opacity={hpIn} transform="translate(257.5, 520)">
        <rect x="-135" y="-70" width="270" height="140" rx="12" fill="rgba(9,10,18,0.82)" stroke="#A78BFA" strokeWidth="2" />
        {/* Audífonos estilizados */}
        <g>
          <path
            d="M -60 -18 C -60 -68, 60 -68, 60 -18"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="-78" y="-24" width="24" height="44" rx="10" fill="#1E293B" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="54" y="-24" width="24" height="44" rx="10" fill="#1E293B" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="-73" y="-18" width="10" height="32" rx="5" fill="#22D3EE" opacity={pulse} />
          <rect x="59" y="-18" width="10" height="32" rx="5" fill="#22D3EE" opacity={pulse} />
        </g>
        <text x="0" y="42" textAnchor="middle" fontFamily={FONT_SANS} fontSize="18" fontWeight={800} letterSpacing="1" fill="#EDE9FE">
          AUDÍFONOS ESTÉREO
        </text>
        <text x="0" y="62" textAnchor="middle" fontFamily={FONT_MONO} fontSize="11" letterSpacing="3" fill="rgba(237,233,254,0.65)">
          INTERVALOS DISONANTES
        </text>
      </g>
    </svg>
  );
};

/** Fase 3 — Silueta cerebral con VIGILANCIA / INCERTIDUMBRE + sinapsis. */
const Phase3: React.FC<{ frame: number }> = ({ frame }) => {
  const brainIn = interpolate(frame, [275, 305], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vigPulse = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(frame * 0.16));
  const incPulse = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(frame * 0.13 + 1.6));
  const syn = (frame * 0.35) % 1;

  // Pulsos sinápticos recorriendo de la zona de incertidumbre a la de vigilancia.
  const synX = 160 + syn * 210;
  const synY = 320 + Math.sin(syn * Math.PI) * -46;

  return (
    <svg viewBox="0 0 515 665" width="100%" height="100%" style={{ overflow: "visible" }}>
      <g opacity={brainIn} transform="translate(257.5, 330)">
        {/* Silueta cerebral vectorial limpia */}
        <path
          d="M 0 -120
             C 46 -120, 78 -84, 78 -40
             C 78 -4, 60 16, 44 24
             C 66 34, 84 62, 84 96
             C 84 134, 52 152, 0 152
             C -52 152, -84 134, -84 96
             C -84 62, -66 34, -44 24
             C -60 16, -78 -4, -78 -40
             C -78 -84, -46 -120, 0 -120 Z"
          fill="rgba(23,15,46,0.9)"
          stroke="#A78BFA"
          strokeWidth="2.5"
        />
        {/* Fisura central */}
        <path
          d="M 0 -112 C -12 -84, 12 -60, -6 -32 C 8 -14, -10 18, 4 40 C -8 62, 10 88, 0 112"
          fill="none"
          stroke="#241B3A"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Zona INCERTIDUMBRE (temporal derecha, rojo/violeta) */}
        <ellipse
          cx="52"
          cy="16"
          rx="26"
          ry="34"
          fill="#F43F5E"
          opacity={incPulse}
          style={{ filter: "drop-shadow(0 0 12px rgba(244,63,94,0.7))" }}
        />
        <ellipse
          cx="52"
          cy="16"
          rx="26"
          ry="34"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Zona VIGILANCIA (frontal izquierda, cian) */}
        <ellipse
          cx="-46"
          cy="-38"
          rx="24"
          ry="26"
          fill="#22D3EE"
          opacity={vigPulse}
          style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.7))" }}
        />
        <ellipse
          cx="-46"
          cy="-38"
          rx="24"
          ry="26"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Tronco cerebral */}
        <rect x="-10" y="150" width="20" height="26" rx="8" fill="rgba(23,15,46,0.9)" stroke="#A78BFA" strokeWidth="2" />

        {/* Pulsos sinápticos */}
        <circle
          cx={synX - 130}
          cy={synY}
          r="4.5"
          fill="#FDE047"
          opacity={0.9}
          style={{ filter: "drop-shadow(0 0 8px rgba(253,224,71,0.8))" }}
        />
        <line
          x1="-46"
          y1="-38"
          x2="52"
          y2="16"
          stroke="rgba(253,224,71,0.35)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
      </g>

      {/* Leyendas de las zonas */}
      <g opacity={brainIn}>
        <g transform="translate(96, 236)">
          <rect x="0" y="-14" width="18" height="18" rx="4" fill="#22D3EE" opacity={vigPulse} />
          <text x="26" y="0" fontFamily={FONT_MONO} fontSize="14" fontWeight={700} letterSpacing="1" fill="#67E8F9">
            VIGILANCIA
          </text>
        </g>
        <g transform="translate(96, 596)">
          <rect x="0" y="-14" width="18" height="18" rx="4" fill="#F43F5E" opacity={incPulse} />
          <text x="26" y="0" fontFamily={FONT_MONO} fontSize="14" fontWeight={700} letterSpacing="1" fill="#F9A8D4">
            INCERTIDUMBRE
          </text>
        </g>
      </g>
    </svg>
  );
};

export const Scene4RetakeFile047: React.FC = () => {
  const frame = useCurrentFrame();

  // Curvas de opacidad por micro-beat.
  const p1Out = interpolate(frame, [130, 158], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2In = interpolate(frame, [130, 158], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p2Out = interpolate(frame, [275, 303], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p3In = interpolate(frame, [275, 303], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Suave Zoom-Out preparando el apagón de consola (375–407).
  const zoomOut = interpolate(frame, [375, 407], [1, 0.94], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgDriftX = Math.sin(frame * 0.006) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoomOut})`,
          transformOrigin: "540px 960px",
        }}
      >
        {/* Fondo vectorial + parallax */}
        <AbsoluteFill style={{ transform: `translate(${bgDriftX}px, 0px) scale(1.05)` }}>
          <Img
            src={staticFile("backgrounds/bg_s3.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>

        {/* Velo de informe confidencial */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(11,10,24,0.55) 0%, rgba(4,5,7,0.82) 100%)",
          }}
        />

        {/* Cabecera ARCHIVO 047 */}
        <ReportHeader frame={frame} />

        {/* Investigador de cuerpo entero (izquierda-inferior) */}
        <div style={{ position: "absolute", left: 70, top: 640, width: 300, height: 533 }}>
          <HumanBase
            variant="investigator"
            pose="standing"
            emotion="uneasy"
            glasses
            facing="right"
            rimColor="#22D3EE"
            rimIntensity={0.8}
            showShadow
            idPrefix="s4-inv"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Diagrama explicativo (derecha, x 380–895, y 455–1120) */}
        <div style={{ position: "absolute", left: 380, top: 455, width: 515, height: 665 }}>
          {/* Marco sutil del diagrama */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              border: "1px solid rgba(34,211,238,0.25)",
              background: "rgba(7,8,16,0.55)",
              boxShadow: "inset 0 0 40px rgba(167,139,250,0.06)",
              pointerEvents: "none",
            }}
          />
          <AbsoluteFill style={{ opacity: p1Out, padding: 20 }}>
            <Phase1 frame={frame} />
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: p2In * p2Out, padding: 20 }}>
            <Phase2 frame={frame} />
          </AbsoluteFill>
          <AbsoluteFill style={{ opacity: p3In, padding: 20 }}>
            <Phase3 frame={frame} />
          </AbsoluteFill>
        </div>

        {/* Viñeta de cierre del plano */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse at center, transparent 58%, rgba(2,3,5,0.4) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
