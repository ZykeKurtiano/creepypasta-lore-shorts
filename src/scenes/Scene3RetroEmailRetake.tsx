import React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
} from "remotion";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene3RetroEmailRetake (frames 846–1113, 28.20–37.10s) — Retake
 * psicológico: correos olvidados y duelo.
 *
 * 2.5D Void cibernoir: hilos digitales carmesí/cian con destellos de
 * datos, rostros fantasmales soñando a la deriva, ventana flotante de
 * webmail retro 2008 con el asunto maldito y una silueta humana
 * nocturna leyendo el correo con rim-light del monitor.
 */

type Pt = [number, number, number, number, number, number, number, number];

const THREADS: Array<{ p: Pt; c: string }> = [
  { p: [-120, 420, 280, 300, 640, 640, 1200, 480], c: "#DC2626" },
  { p: [-80, 900, 320, 760, 700, 1020, 1200, 880], c: "#22D3EE" },
  { p: [-60, 1300, 360, 1160, 660, 1420, 1200, 1280], c: "#7F1D1D" },
  { p: [-100, 620, 240, 760, 600, 520, 1180, 700], c: "#155E75" },
  { p: [-60, 1100, 300, 1280, 680, 980, 1200, 1180], c: "#DC2626" },
  { p: [-40, 1580, 340, 1500, 620, 1700, 1180, 1600], c: "#22D3EE" },
  // Hilos de conexión desde la ventana de correo hacia los rostros soñadores
  { p: [300, 620, 220, 720, 160, 860, 120, 960], c: "#22D3EE" },
  { p: [760, 660, 830, 780, 880, 900, 900, 1020], c: "#DC2626" },
];

const bez = (p: Pt, t: number): [number, number] => {
  const mt = 1 - t;
  const x =
    mt * mt * mt * p[0] +
    3 * mt * mt * t * p[1] +
    3 * mt * t * t * p[2] +
    t * t * t * p[3];
  const y =
    mt * mt * mt * p[4] +
    3 * mt * mt * t * p[5] +
    3 * mt * t * t * p[6] +
    t * t * t * p[7];
  return [x, y];
};

const ptString = (p: Pt): string =>
  `M ${p[0]} ${p[1]} C ${p[2]} ${p[3]}, ${p[4]} ${p[5]}, ${p[6]} ${p[7]}`;

const GHOST_FACES = [
  { x: 210, y: 620, s: 1.0, ph: 0 },
  { x: 800, y: 940, s: 0.85, ph: 2.1 },
  { x: 130, y: 1180, s: 0.7, ph: 4.2 },
];

export const Scene3RetroEmailRetake: React.FC = () => {
  const frame = useCurrentFrame();

  // Corrupción intermitente de las líneas del correo.
  const corruption = random(Math.floor(frame / 9) + 7) > 0.55;
  const lineFlicker = 0.92 + 0.08 * Math.sin(frame * 0.9);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const windowFloat = Math.sin(frame * 0.03) * 6;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Vacío cibernoir */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #0A0F16 0%, #04070B 55%, #020408 100%)",
        }}
      />

      {/* 2. Hilos digitales con pulsos viajeros */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {THREADS.map((t, i) => {
          const dashOffset = -(frame * 1.6 + i * 95);
          const pulse1 = bez(t.p, (frame * 0.004 + i * 0.17) % 1);
          const pulse2 = bez(t.p, (frame * 0.005 + 0.5 + i * 0.13) % 1);
          const sparkTwinkle = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.13 + i * 1.4));
          const glow = 0.5 + 0.28 * Math.sin(frame * 0.05 + i);
          return (
            <g key={i}>
              <path
                d={ptString(t.p)}
                fill="none"
                stroke={t.c}
                strokeWidth={2.2}
                opacity={glow}
                strokeDasharray="30 240"
                strokeDashoffset={dashOffset}
              />
              <circle cx={pulse1[0]} cy={pulse1[1]} r={4.2} fill={t.c} opacity={sparkTwinkle} />
              <circle cx={pulse2[0]} cy={pulse2[1]} r={3} fill={t.c} opacity={0.75} />
            </g>
          );
        })}
      </svg>

      {/* 3. Rostros fantasmales soñando a la deriva */}
      {GHOST_FACES.map((g, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: g.y,
            left: g.x,
            width: 300 * g.s,
            height: 320 * g.s,
            opacity: 0.13 + 0.06 * Math.sin(frame * 0.03 + g.ph),
            transform: `translate(${Math.sin(frame * 0.008 + g.ph) * 70}px, ${Math.sin(frame * 0.005 + g.ph * 2) * 40}px) rotate(${Math.sin(frame * 0.004 + g.ph) * 4}deg)`,
          }}
        >
          <svg viewBox="0 0 300 320" width="100%" height="100%">
            <path
              d="M 90 300
                 C 70 240, 80 190, 110 160
                 C 140 128, 180 118, 210 140
                 C 250 168, 268 210, 262 250
                 C 256 288, 200 300, 150 300
                 Z"
              fill="#10161E"
              stroke="#1F3545"
              strokeWidth="1.5"
            />
            <ellipse cx="120" cy="120" rx="62" ry="70" fill="#10161E" stroke="#1F3545" strokeWidth="1.5" />
          </svg>
        </div>
      ))}

      {/* 4. Ventana flotante de webmail retro 2008 */}
      <SafeCentered top={400} zIndex={6}>
        <div
          style={{
            transform: `translateY(${windowFloat}px)`,
            background: "#070B11",
            border: "1px solid #1B2733",
            borderRadius: 10,
            boxShadow: "0 24px 80px rgba(0,0,0,0.75), 0 0 60px rgba(34,211,238,0.07)",
            textAlign: "left",
            fontFamily: FONT_SANS,
            opacity: lineFlicker,
          }}
        >
          {/* Titlebar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 16px",
              height: 46,
              background: "linear-gradient(180deg, #0C1220, #0A0F16)",
              borderBottom: "1px solid #16222E",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#7F1D1D" }} />
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#A16207" }} />
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#14532D" }} />
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#9FB2C2",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2,
                fontFamily: FONT_MONO,
              }}
            >
              CORREO OLVIDADO <span style={{ color: "#DC2626" }}>//</span> 2008
            </div>
            <span style={{ width: 34 }} />
          </div>

          <div style={{ padding: "18px 22px 22px" }}>
            {/* Remitente */}
            <div style={{ color: "#6E8496", fontSize: 15, fontFamily: FONT_MONO }}>
              De: <span style={{ color: "#9FB2C2" }}>remitente_desconocido@archive.net</span>
            </div>
            <div style={{ color: "#46586A", fontSize: 12, fontFamily: FONT_MONO, marginTop: 3 }}>
              Para: tú — hace 0 minutos
            </div>

            {/* Asunto destacado */}
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "rgba(220,38,38,0.10)",
                borderLeft: "3px solid #DC2626",
                borderRadius: 4,
                color: "#F2EFE9",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              <span style={{ color: "#DC2626" }}>ASUNTO:</span> PÁSALO O QUÉDATELO
            </div>

            {/* Adjunto */}
            <div
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                background: "rgba(253,224,71,0.08)",
                border: "1px solid rgba(253,224,71,0.3)",
                borderRadius: 6,
                color: "#FDE047",
                fontSize: 14,
                fontFamily: FONT_MONO,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <path
                  d="M 3 1.5 L 10 1.5 A 2.6 2.6 0 0 1 12.5 4.1 L 12.5 8.6 A 4.4 4.4 0 0 1 8.1 12.5 L 4.6 12.5 A 3.4 3.4 0 0 1 1.5 8.8 L 1.5 4.5 A 1.5 1.5 0 0 1 3 1.5 Z"
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="1.2"
                />
              </svg>
              smile.jpg (666 KB)
            </div>

            {/* Cuerpo del correo */}
            <div
              style={{
                marginTop: 16,
                borderTop: "1px dashed #16222E",
                paddingTop: 14,
                color: "#AEBCCB",
                fontSize: 15.5,
                lineHeight: 1.65,
                fontFamily: FONT_MONO,
              }}
            >
              <div>No puedo dormir desde que abrí el archivo.</div>
              <div>
                Sueño con una sonrisa que no es humana{" "}
                <span style={{ color: "#DC2626", opacity: cursorOn ? 0.9 : 0.3 }}>
                  ▓▓▓▓
                </span>
              </div>
              {corruption ? (
                <div style={{ color: "#F87171" }}>
                  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                </div>
              ) : (
                <div>Si no lo reenvías, la verás cada noche.</div>
              )}
              <div style={{ color: "#F87171" }}>
                &gt; reenviar a 5 contactos… o quedártela tú.
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 9,
                    height: 17,
                    background: cursorOn ? "#22D3EE" : "transparent",
                    marginTop: 2,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </SafeCentered>

      {/* 5. Resplandor cian del CRT iluminando la mitad inferior */}
      <div
        style={{
          position: "absolute",
          top: 740,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(21,50,67,0.55) 0%, rgba(21,50,67,0.24) 42%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {/* 6. Silueta humana nocturna leyendo el correo (bajo los subtítulos) */}
      <div style={{ position: "absolute", top: 900, left: 0, right: 0, height: 620 }}>
        {/* Monitor del escritorio */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 430,
            width: 220,
            height: 150,
            background: "#0A0D12",
            border: "1px solid #131A22",
            borderRadius: 6,
            boxShadow: "0 0 60px rgba(34,211,238,0.28)",
          }}
        />
        {/* Escritorio */}
        <div
          style={{
            position: "absolute",
            top: 300,
            left: 0,
            right: 0,
            height: 150,
            background: "linear-gradient(180deg, #0C1016, #07090D)",
            borderTop: "1px solid rgba(90,160,200,0.14)",
          }}
        />
        <svg
          viewBox="0 0 1080 620"
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* Cabeza inclinada */}
          <g transform={`rotate(${Math.sin(frame * 0.05) * 2} 560 300)`}>
            <ellipse cx="560" cy="300" rx="64" ry="72" fill="#060B11" />
          </g>
          {/* Hombros */}
          <path
            d="M 340 620
               C 400 500, 480 460, 545 452
               C 630 460, 720 510, 770 620
               Z"
            fill="#060B11"
          />
          {/* Brazo al ratón con movimiento inquieto */}
          <g transform={`translate(${Math.sin(frame * 0.14) * 3} 0)`}>
            <path
              d="M 640 520 C 690 545, 730 560, 760 570"
              stroke="#060B11"
              strokeWidth="30"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="768" cy="576" rx="22" ry="18" fill="#060B11" />
          </g>
          {/* Rim-light cian nítido del monitor en el contorno */}
          <g opacity={0.55 + 0.25 * Math.sin(frame * 0.4)}>
            <path
              d="M 600 245 C 628 270, 630 320, 610 358"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 545 452 C 630 460, 720 510, 770 620"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M 640 520 C 690 545, 730 560, 760 570"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2.6"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        </svg>
        {/* Ratón */}
        <div
          style={{
            position: "absolute",
            top: 555,
            left: 782 + Math.sin(frame * 0.14) * 3,
            width: 30,
            height: 44,
            background: "#0D1117",
            borderRadius: "10px 10px 12px 12px",
            border: "1px solid #1A222C",
          }}
        />
      </div>

      {/* 6. Niebla frontal */}
      <div
        style={{
          position: "absolute",
          top: 1180,
          left: Math.sin(frame * 0.006) * 120 - 200,
          width: 1400,
          height: 420,
          background:
            "radial-gradient(ellipse, rgba(43,58,66,0.16), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(2,4,8,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
