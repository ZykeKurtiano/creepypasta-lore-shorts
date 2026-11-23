import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * ZalgoEntity.tsx — Entidad cósmica monumental en negro abisal (Estándar v3).
 *
 * Mitología fiel: coloso eldritch SIN OJOS de piel azabache (#050508 / #0D0609)
 * cuyo rostro liso oscuro se desgarra en 7 bocas orgánicas asimétricas:
 *   1 gran mandíbula central (la "séptima" que canta la melodía apocalíptica
 *   y brilla intensamente al hacerlo), 2 bocas laterales en las mejillas,
 *   1 boca superior en la frente, 1 boca en la garganta y 2 bocas en las
 *   clavículas/hombros.
 *
 * Corona de relámpagos negros (arcos fractales quebrados negro-azabache con
 * borde luminoso carmesí sangre #DC2626 chisporroteando alrededor de la
 * cabeza). CUATRO brazos articulados con esqueleto jerárquico `<g>` real:
 *   - Brazo Derecho Superior  (upperRightShoulder -> forearm -> clawedHand):
 *     extendido hacia afuera sosteniendo la estrella muerta implosionando.
 *   - Brazo Derecho Inferior  (lowerRightShoulder -> forearm -> clawedHand):
 *     extendido más abajo sosteniendo la vela negra cuya luz irradia oscuridad.
 *   - Brazo Izquierdo Superior (upperLeftShoulder -> forearm -> clawedHand):
 *     garra larga manchada de sangre carmesí goteante alzándose/lanzando sombras.
 *   - Brazo Izquierdo Inferior (lowerLeftShoulder -> forearm -> clawedHand):
 *     mano manchada de carmesí extendiéndose agresivamente o en guardia baja.
 *
 * Iluminación en 3 capas + rim light carmesí intenso. viewBox 0 0 960 980
 * para que los 4 brazos extendidos quepan con holgura sin cortarse jamás.
 *
 * Animación 100% determinista: useCurrentFrame + interpolate + Math.sin.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------
// Boca articulada individual (desgarradura orgánica + dientes irregulares)
// ---------------------------------------------------------------------------
const ZalgoMouth: React.FC<{
  hw: number; // media anchura
  open: number; // 0..1
  pid: string;
  seed: number;
}> = ({ hw, open, pid, seed }) => {
  const gap = hw * 0.6 * open;
  // Dientes superiores/inferiores: posiciones y longitudes irregulares.
  const upper = Array.from({ length: 6 }, (_, i) => {
    const x = -hw * 0.82 + (i * hw * 1.64) / 5;
    const len = hw * (0.3 + 0.2 * (((seed * 7 + i * 13) % 5) / 4));
    const skew = (0.5 - (((seed * 11 + i * 7) % 7) / 6)) * hw * 0.22;
    return { x, len, skew };
  });
  const lower = Array.from({ length: 6 }, (_, i) => {
    const x = -hw * 0.78 + (i * hw * 1.56) / 5;
    const len = hw * (0.26 + 0.18 * (((seed * 5 + i * 17) % 5) / 4));
    const skew = (0.5 - (((seed * 13 + i * 5) % 7) / 6)) * hw * 0.2;
    return { x, len, skew };
  });

  return (
    <g>
      {/* Cavidad oscura con brillo carmesí interno (desgarradura asimétrica) */}
      {open > 0.01 ? (
        <path
          d={`M ${-hw} 0 C ${-hw * 0.72} ${-gap * 0.9}, ${-hw * 0.2} ${
            -gap * 1.2
          }, ${hw * 0.1} ${-gap} C ${hw * 0.5} ${-gap * 0.82}, ${hw * 0.86} ${
            -gap * 0.5
          }, ${hw} ${-gap * 0.2} C ${hw * 0.8} ${gap * 0.5}, ${hw * 0.3} ${
            gap * 1.15
          }, ${-hw * 0.15} ${gap} C ${-hw * 0.55} ${gap * 0.85}, ${-hw * 0.85} ${
            gap * 0.4
          }, ${-hw} 0 Z`}
          fill={`url(#${pid}-mouth-cavity)`}
        />
      ) : null}
      {/* Resplandor carmesí interior */}
      {open > 0.01 ? (
        <path
          d={`M ${-hw * 0.5} 0 C ${-hw * 0.36} ${-gap * 0.55}, ${hw * 0.3} ${
            -gap * 0.55
          }, ${hw * 0.5} 0 C ${hw * 0.3} ${gap * 0.55}, ${-hw * 0.36} ${
            gap * 0.55
          }, ${-hw * 0.5} 0 Z`}
          fill="#F43F5E"
          opacity={0.4 * open}
          filter={`url(#${pid}-blur)`}
        />
      ) : null}

      {/* Labio superior carnoso + dientes superiores curvos */}
      <g transform={`translate(0, ${-gap * 0.55})`}>
        <path
          d={`M ${-hw} 0 C ${-hw * 0.7} ${-hw * 0.2}, ${-hw * 0.1} ${
            -hw * 0.26
          }, ${hw * 0.1} ${-hw * 0.18} C ${hw * 0.7} ${-hw * 0.24}, ${hw} ${
            -hw * 0.08
          }, ${hw} 0 C ${hw * 0.6} ${hw * 0.12}, ${-hw * 0.6} ${
            hw * 0.12
          }, ${-hw} 0 Z`}
          fill="#0A0608"
        />
        <g opacity={open}>
          {upper.map((t, i) => (
            <path
              key={`ut-${i}`}
              d={`M ${t.x - hw * 0.09} ${-gap * 0.4} C ${
                t.x - hw * 0.06
              } ${-gap * 0.55 - t.len * 0.4}, ${t.x + t.skew} ${
                -gap * 0.4 - t.len * 0.82
              }, ${t.x + t.skew * 0.4} ${-gap * 0.4 - t.len} C ${
                t.x + t.skew * 0.3
              } ${-gap * 0.45 - t.len * 0.7}, ${t.x + hw * 0.05} ${
                -gap * 0.5 - t.len * 0.3
              }, ${t.x + hw * 0.09} ${-gap * 0.4} Z`}
              fill="#C9BFAE"
            />
          ))}
        </g>
      </g>

      {/* Labio inferior + dientes inferiores curvos */}
      <g transform={`translate(0, ${gap * 0.55})`}>
        <path
          d={`M ${-hw} 0 C ${-hw * 0.7} ${hw * 0.2}, ${-hw * 0.1} ${
            hw * 0.26
          }, ${hw * 0.1} ${hw * 0.18} C ${hw * 0.7} ${hw * 0.24}, ${hw} ${
            hw * 0.08
          }, ${hw} 0 C ${hw * 0.6} ${-hw * 0.12}, ${-hw * 0.6} ${
            -hw * 0.12
          }, ${-hw} 0 Z`}
          fill="#0A0608"
        />
        <g opacity={open}>
          {lower.map((t, i) => (
            <path
              key={`lt-${i}`}
              d={`M ${t.x - hw * 0.08} ${gap * 0.4} C ${
                t.x - hw * 0.05
              } ${gap * 0.55 + t.len * 0.4}, ${t.x + t.skew} ${
                gap * 0.4 + t.len * 0.82
              }, ${t.x + t.skew * 0.4} ${gap * 0.4 + t.len} C ${
                t.x + t.skew * 0.3
              } ${gap * 0.45 + t.len * 0.7}, ${t.x + hw * 0.04} ${
                gap * 0.5 + t.len * 0.3
              }, ${t.x + hw * 0.08} ${gap * 0.4} Z`}
              fill="#B0A691"
            />
          ))}
        </g>
      </g>

      {/* Humo oscuro exhalado */}
      <g opacity={open * 0.6}>
        <path
          d={`M ${-hw * 0.3} ${-gap - 2} C ${-hw * 0.5} ${-gap - 16}, ${
            -hw * 0.15
          } ${-gap - 30}, ${-hw * 0.3} ${-gap - 46}`}
          stroke="#0B0A0E"
          strokeWidth={hw * 0.12}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${hw * 0.25} ${-gap - 2} C ${hw * 0.05} ${-gap - 18}, ${
            hw * 0.4
          } ${-gap - 32}, ${hw * 0.2} ${-gap - 48}`}
          stroke="#0B0A0E"
          strokeWidth={hw * 0.1}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Estrella muerta implosionando
// ---------------------------------------------------------------------------
const DeadStar: React.FC<{ power: number; pid: string; frame: number }> = ({
  power,
  pid,
  frame,
}) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.09);
  const ringRot = frame * 0.4;
  const orbitR = 52 - 18 * power;
  const particles = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + frame * 0.06 * (i % 2 === 0 ? 1 : -1);
    return { x: Math.cos(a) * orbitR, y: Math.sin(a) * orbitR, i };
  });

  return (
    <g opacity={0.85 + 0.15 * power}>
      {/* Núcleo negro */}
      <circle r="24" fill="#040507" />
      <circle r="24" fill="none" stroke="#7F1D1D" strokeWidth="3" opacity={0.7 + 0.3 * pulse} />
      <circle r="16" fill="#0B0305" />
      <circle
        r="30"
        fill="#DC2626"
        opacity={0.25 * pulse * power}
        filter={`url(#${pid}-blur)`}
      />
      {/* Anillos de acreción carmesí / dorado pálido */}
      <g transform={`rotate(${ringRot})`} fill="none">
        <ellipse rx="46" ry="15" stroke="#DC2626" strokeWidth="3" opacity="0.8" />
        <ellipse rx="58" ry="22" stroke="#FDE047" strokeWidth="2" opacity="0.45" />
        <ellipse rx="70" ry="28" stroke="#7F1D1D" strokeWidth="2.5" opacity="0.5" />
      </g>
      {/* Partículas colapsando */}
      <g fill="#F43F5E">
        {particles.map((p) => (
          <circle key={p.i} cx={p.x} cy={p.y} r={2.2 + (p.i % 3)} opacity={0.85} />
        ))}
      </g>
      <g fill="#FDE047" opacity="0.7">
        {particles.map((p) => (
          <circle
            key={`g-${p.i}`}
            cx={p.x * 0.7}
            cy={p.y * 0.7}
            r="1.4"
            opacity={0.6}
          />
        ))}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Vela negra que irradia sombras / antiluz
// ---------------------------------------------------------------------------
const BlackCandle: React.FC<{ power: number; pid: string; frame: number }> = ({
  power,
  pid,
  frame,
}) => {
  const flicker = Math.sin(frame * 0.13) * 3 + Math.sin(frame * 0.5) * 1.5;

  return (
    <g opacity={0.85 + 0.15 * power}>
      {/* Cuerpo de la vela */}
      <path
        d="M -13 -44 L 13 -44 L 14 20 C 14 28, 8 34, 0 34 C -8 34, -14 28, -14 20 Z"
        fill="#0A070B"
      />
      <path d="M -13 -44 L 13 -44 L 13 -38 L -13 -38 Z" fill="#131019" />
      {/* Gotas de cera */}
      <path d="M -10 -30 C -10 -24, -6 -22, -5 -26 C -5 -30, -8 -32, -10 -30 Z" fill="#131019" />
      <path d="M 6 -18 C 6 -12, 10 -10, 11 -14 C 11 -18, 8 -20, 6 -18 Z" fill="#131019" />
      {/* Llama oscura (antiluz) */}
      <g transform={`translate(0, -52) rotate(${flicker})`}>
        <path
          d="M 0 8 C -7 2, -8 -8, -4 -16 C 0 -24, 2 -30, 0 -34 C -2 -30, -1 -24, 1 -18 C 3 -12, 5 -8, 4 -2 C 3 4, 1 8, 0 8 Z"
          fill="#050308"
        />
        <path
          d="M 0 8 C -7 2, -8 -8, -4 -16"
          stroke="#DC2626"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />
        {/* Halo carmesí invertido */}
        <ellipse
          cx="0"
          cy="-12"
          rx="16"
          ry="22"
          fill="#DC2626"
          opacity={0.22 * power}
          filter={`url(#${pid}-blur)`}
        />
      </g>
      {/* Ondas de sombra irradiadas */}
      <g fill="none" stroke="#0B0A0E" strokeLinecap="round">
        <path d="M -14 -34 C -26 -40, -34 -52, -40 -68" strokeWidth="4" opacity={0.5 * power} />
        <path d="M 14 -34 C 26 -40, 34 -52, 40 -68" strokeWidth="4" opacity={0.5 * power} />
        <path d="M 0 -36 C 0 -48, 2 -60, 6 -74" strokeWidth="3" opacity={0.4 * power} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Generador de tentáculos Bézier cónicos (rellenos + rim)
// ---------------------------------------------------------------------------
const makeTendril = (
  sx: number,
  sy: number,
  baseA: number,
  len: number,
  sway: number,
  phase: number,
  frame: number
): { fill: string; rim: string } => {
  const t = frame * 0.045;
  const a0 = baseA;
  const a1 = a0 + Math.sin(t * 1.1 + phase) * sway;
  const a2 = a0 + Math.cos(t * 0.9 + phase * 1.3) * sway * 1.4;
  const a3 = a0 + Math.sin(t * 0.7 + phase * 2.1) * sway * 1.9;
  const l3 = len * (1 + 0.06 * Math.sin(t + phase));

  const ax = sx + Math.cos(a1) * 0.16 * len;
  const ay = sy + Math.sin(a1) * 0.16 * len;
  const bx = sx + Math.cos(a2) * 0.66 * len;
  const by = sy + Math.sin(a2) * 0.66 * len;
  const ex = sx + Math.cos(a3) * l3;
  const ey = sy + Math.sin(a3) * l3;

  const perp1 = { x: -Math.sin(a1), y: Math.cos(a1) };
  const perp3 = { x: -Math.sin(a3), y: Math.cos(a3) };
  const wb = 11 + ((phase * 7) % 6);

  const p0l = { x: sx + perp1.x * wb, y: sy + perp1.y * wb };
  const p0r = { x: sx - perp1.x * wb, y: sy - perp1.y * wb };
  const al = { x: ax + perp1.x * wb * 0.55, y: ay + perp1.y * wb * 0.55 };
  const ar = { x: ax - perp1.x * wb * 0.55, y: ay - perp1.y * wb * 0.55 };
  const bl = { x: bx + perp3.x * 1.5, y: by + perp3.y * 1.5 };
  const br = { x: bx - perp3.x * 1.5, y: by - perp3.y * 1.5 };
  const tip = { x: ex, y: ey };

  const f = (p: { x: number; y: number }) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  const fill = `M ${f(p0l)} C ${f(al)} ${f(bl)} ${f(tip)} C ${f(br)} ${f(ar)} ${f(p0r)} Z`;
  const rim = `M ${f({ x: ax, y: ay })} C ${f({ x: bx, y: by })} ${f(tip)}`;
  return { fill, rim };
};

// ---------------------------------------------------------------------------
// Relámpago negro quebrado (arco fractal) para la corona
// ---------------------------------------------------------------------------
const makeBolt = (seed: number, len: number): string => {
  const segs = 5 + (seed % 3);
  let d = "M 0 0";
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const y = (-len * t).toFixed(1);
    const jx = ((seed * 7 + i * 13) % 9) - 4;
    const x = (i % 2 === 0 ? jx * 0.5 : jx) * (t * 2.2);
    d += ` L ${x.toFixed(1)} ${y}`;
  }
  return d;
};

/** Corona de relámpagos negros: ángulos y longitudes deterministas. */
const CROWN = Array.from({ length: 13 }, (_, i) => {
  const angle = -150 + (i * 300) / 12;
  const len = 92 + ((i * 37) % 54);
  return { angle, len, d: makeBolt(i * 13 + 5, len) };
});

/** Chispas carmesí que chisporrotean alrededor de la corona. */
const CROWN_SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (-160 + (i * 320) / 13) * (Math.PI / 180);
  const r = 128 + ((i * 31) % 46);
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r - 46,
    r: 1.6 + ((i * 7) % 4) * 0.9,
    phase: i * 1.7,
  };
});

// ---------------------------------------------------------------------------
// Brazo eldritch articulado (reutilizable, jerarquía shoulder -> forearm -> hand)
// ---------------------------------------------------------------------------
const ZalgoArm: React.FC<{
  pid: string;
  flip: boolean; // true = lado derecho visual (espejo)
  shoulder: number;
  elbow: number;
  mode: "cosmic" | "battle" | "finale";
  star: number;
  attack: number;
  frame: number;
  held: "star" | "candle" | "blood" | "guard";
}> = ({ pid, flip, shoulder, elbow, mode, star, attack, frame, held }) => {
  const s = flip ? -1 : 1;
  const clawX = [-16, -6, 4, 14];
  const claws = flip ? [-14, -4, 6, 16] : clawX;

  // Sangre goteante (garra izquierda superior) — ciclo determinista.
  const bloodDrops = [0, 1, 2].map((i) => {
    const cycle = 44 + i * 14;
    const p = (frame * 1.5 + i * 17) % cycle;
    const y = 34 + p * 1.9;
    const op = Math.max(0, 1 - p / cycle);
    return { x: -8 + i * 8, y, r: 2.4 + (i % 2), op };
  });

  return (
    <g transform={`rotate(${shoulder})`}>
      {/* Hombro / brazo superior (deltoides angular) */}
      <path
        d="M -26 2 C -30 40, -27 84, -19 122 L 26 122 C 20 84, 20 40, 22 2 Z"
        fill={`url(#${pid}-abyss)`}
      />
      <path
        d="M 22 2 C 18 40, 18 84, 22 122"
        stroke="#DC2626"
        strokeWidth="2.5"
        fill="none"
        opacity="0.55"
        transform={flip ? "scale(-1,1)" : undefined}
      />
      {/* Antebrazo */}
      <g transform={`translate(0, 122) rotate(${elbow})`}>
        <path
          d="M -19 0 C -22 42, -20 80, -13 116 L 23 116 C 17 80, 17 42, 16 0 Z"
          fill={`url(#${pid}-abyss)`}
        />
        <path
          d="M -13 116 C -18 80, -18 42, -19 0"
          stroke="#7F1D1D"
          strokeWidth="2"
          fill="none"
          opacity="0.45"
        />
        {/* Mano con garras */}
        <g transform="translate(0, 116)">
          <path
            d="M -22 0 C -26 11, -24 22, -16 30 L 26 30 C 20 22, 20 11, 17 0 Z"
            fill="#0A070C"
          />
          {claws.map((x, i) => (
            <path
              key={`claw-${i}`}
              d={`M ${x} 28 C ${x - 2 * s} 44, ${x - 5 * s} 58, ${
                x - 8 * s
              } 72 C ${x - 5 * s} 74, ${x - 1 * s} 74, ${x + 1 * s} 68 C ${
                x + 4 * s
              } 54, ${x + 4 * s} 40, ${x + 5 * s} 28 Z`}
              fill="#060409"
            />
          ))}

          {/* Objeto sostenido en espacio abierto, SIN tapar la cabeza */}
          {held === "star" ? (
            <g transform="translate(0, 52)" opacity={star}>
              <DeadStar power={star} pid={pid} frame={frame} />
            </g>
          ) : null}
          {held === "candle" ? (
            <g transform="translate(0, 46)" opacity={star}>
              <BlackCandle power={star} pid={pid} frame={frame} />
            </g>
          ) : null}

          {/* Garra izquierda superior: mancha de sangre + goteo + sombras */}
          {held === "blood" ? (
            <g>
              {/* Mancha carmesí sobre la garra */}
              <path
                d="M -20 4 C -12 12, 2 16, 14 10 C 18 18, 12 24, 2 27 C -8 28, -18 22, -20 4 Z"
                fill="#DC2626"
                opacity="0.72"
              />
              {/* Gotas cayendo */}
              {bloodDrops.map((d, i) => (
                <g key={`drop-${i}`} opacity={d.op}>
                  <ellipse cx={d.x} cy={d.y} rx={d.r * 0.7} ry={d.r} fill="#DC2626" />
                  <ellipse
                    cx={d.x + d.r * 0.3}
                    cy={d.y - d.r * 0.4}
                    rx={d.r * 0.3}
                    ry={d.r * 0.4}
                    fill="#F43F5E"
                  />
                </g>
              ))}
              {/* Zarcillos de sombra alzándose desde la garra */}
              <g fill="none" strokeLinecap="round" opacity={0.55 + attack * 0.45}>
                <path
                  d="M -4 22 C -22 6, -36 -16, -44 -44"
                  stroke="#0B0A0E"
                  strokeWidth="5"
                />
                <path
                  d="M 8 24 C -4 8, -14 -12, -18 -38"
                  stroke="#7F1D1D"
                  strokeWidth="3"
                />
                <path
                  d="M -4 22 C -22 6, -36 -16, -44 -44"
                  stroke="#DC2626"
                  strokeWidth="1.4"
                />
              </g>
            </g>
          ) : null}

          {/* Garra izquierda inferior: mano manchada de carmesí, en guardia baja */}
          {held === "guard" ? (
            <g>
              <path
                d="M -22 0 C -26 11, -24 22, -16 30 L 26 30 C 20 22, 20 11, 17 0 Z"
                fill="#1A0508"
                opacity="0.5"
              />
              <path
                d="M -18 8 C -8 16, 4 18, 16 12 C 12 22, 2 26, -10 24 C -16 22, -20 16, -18 8 Z"
                fill="#DC2626"
                opacity="0.6"
              />
              {/* Zarcillo carmesí de corrupción (modo battle) */}
              {mode === "battle" ? (
                <g opacity={0.4 + attack * 0.6} fill="none" strokeLinecap="round">
                  <path
                    d="M 2 22 C -10 4, -20 -18, -26 -46"
                    stroke="#DC2626"
                    strokeWidth="3"
                  />
                </g>
              ) : null}
            </g>
          ) : null}

          {/* Zarcillos carmesí de corrupción (modo battle, brazo derecho superior) */}
          {mode === "battle" && held === "star" ? (
            <g opacity={0.5 + attack * 0.5}>
              {[0, 1, 2].map((i) => {
                const a = (-20 + i * 40) * (Math.PI / 180);
                const L = 150 + i * 40;
                const ex = Math.cos(a) * L;
                const ey = 30 + Math.sin(a) * L;
                return (
                  <path
                    key={`zc-${i}`}
                    d={`M 0 30 C ${ex * 0.3} ${ey * 0.4}, ${ex * 0.7} ${
                      ey * 0.7
                    }, ${ex} ${ey}`}
                    stroke="#DC2626"
                    strokeWidth={4 - i}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Entidad Zalgo
// ---------------------------------------------------------------------------
export const ZalgoEntity: React.FC<{
  mode?: "cosmic" | "battle" | "finale";
  mouthsOpen?: number;
  starPower?: number;
  seventhMouthSing?: number;
  attackIntensity?: number;
  localFrame?: number;
  idPrefix?: string;
}> = ({
  mode = "cosmic",
  mouthsOpen = 0,
  starPower = 0.5,
  seventhMouthSing = 0,
  attackIntensity = 0,
  localFrame,
  idPrefix = "zalgo",
}) => {
  const currentFrame = useCurrentFrame();
  const frame = localFrame ?? currentFrame;

  const m = clamp01(mouthsOpen);
  const star = clamp01(starPower);
  const sing = clamp01(seventhMouthSing);
  const attack = clamp01(attackIntensity);
  const pid = idPrefix;
  const gid = (n: string) => `${pid}-${n}`;

  // Levitación cósmica + expansión torácica
  const levitate = Math.sin(frame * 0.04) * 8;
  const expand = 1 + Math.sin(frame * 0.05) * 0.03;

  // Pose de los 4 brazos por modo (pivotes en hombros EXTERNOS).
  let uLShoulder: number;
  let uLElbow: number;
  let uRShoulder: number;
  let uRElbow: number;
  let lLShoulder: number;
  let lLElbow: number;
  let lRShoulder: number;
  let lRElbow: number;
  let torsoTilt = 0;

  if (mode === "cosmic") {
    // Brazos superiores en "V" alzada; inferiores extendidos a los lados.
    uLShoulder = 128;
    uLElbow = 36;
    uRShoulder = -128;
    uRElbow = -36;
    lLShoulder = 66;
    lLElbow = 24;
    lRShoulder = -66;
    lRElbow = -24;
  } else if (mode === "battle") {
    // Izquierdos en guardia, derechos agresivos hacia el enemigo (derecha).
    uLShoulder = 108;
    uLElbow = 32;
    uRShoulder = -118 - attack * 12;
    uRElbow = -38 - attack * 10;
    lLShoulder = 58;
    lLElbow = 22;
    lRShoulder = -58;
    lRElbow = -22;
    torsoTilt = 5 + attack * 7;
  } else {
    // finale: postura imponente, brazos abiertos / en guardia alzados.
    uLShoulder = 122;
    uLElbow = 30;
    uRShoulder = -122;
    uRElbow = -30;
    lLShoulder = 62;
    lLElbow = 22;
    lRShoulder = -62;
    lRElbow = -22;
  }

  // Apertura escalonada de las 7 bocas
  const mouthOpenAt = (i: number) => clamp01(m * 1.15 - i * 0.04);
  // La séptima boca central se abre más y brilla al cantar.
  const centralOpen = clamp01(mouthOpenAt(0) + sing * 0.22);

  // Tentáculos traseros (absolutos) y frontales (locales al torso): humo abisal
  // descendente que fluye desde la cintura hasta la base del viewBox.
  const backTendrils = [0, 1, 2, 3].map((i) =>
    makeTendril(
      480 + (i - 1.5) * 78,
      660,
      Math.PI / 2 + (i - 1.5) * 0.3,
      300 + i * 55,
      0.32 + 0.06 * i,
      i * 1.7,
      frame
    )
  );
  const frontTendrils = [0, 1, 2, 3].map((i) =>
    makeTendril(
      (i - 1.5) * 56,
      20,
      Math.PI / 2 + (i - 1.5) * 0.38,
      230 + i * 48,
      0.4 + 0.05 * i,
      i * 1.9 + 0.6,
      frame
    )
  );

  // Chisporroteo de la corona (flicker determinista).
  const sparkFlicker = (i: number) =>
    0.3 + 0.7 * Math.abs(Math.sin(frame * 0.22 + CROWN_SPARKS[i].phase));

  return (
    <svg
      viewBox="0 0 960 980"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Zalgo, coloso cósmico sin ojos de siete bocas y cuatro brazos"
    >
      <defs>
        <linearGradient id={gid("abyss")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#0B0A0E" />
          <stop offset="55%" stopColor="#070509" />
          <stop offset="100%" stopColor="#040507" />
        </linearGradient>
        <linearGradient id={gid("mantle")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06040A" />
          <stop offset="50%" stopColor="#0C0910" />
          <stop offset="100%" stopColor="#040305" />
        </linearGradient>
        <radialGradient id={gid("mouth-cavity")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#050102" />
          <stop offset="55%" stopColor="#2A0608" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <linearGradient id={gid("vein")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gid("tendril")} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#0B0A0E" />
          <stop offset="100%" stopColor="#040305" />
        </linearGradient>
        <filter id={gid("blur")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={gid("glow")} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      {/* Aura cósmica tenue */}
      <ellipse cx="480" cy="470" rx="360" ry="400" fill="#7F1D1D" opacity="0.12" filter={`url(#${gid("glow")})`} />

      {/* Tentáculos traseros (manto posterior) */}
      <g fill={`url(#${gid("tendril")})`}>
        {backTendrils.map((t, i) => (
          <path key={`bt-${i}`} d={t.fill} />
        ))}
      </g>

      {/* ===== torsoGroup: levitación + expansión (pivote en la cintura) ===== */}
      <g transform={`translate(480, ${820 + levitate}) rotate(${torsoTilt}) scale(${expand}, ${expand})`}>
        {/* --- Manto de sombras rasgadas (silueta monumental hasta la base) --- */}
        <path
          d="M -235 -430 C -262 -350, -276 -230, -268 -90 C -262 30, -286 120, -268 190 L -196 158 L -176 208 L -96 158 L -40 210 L 40 210 L 96 158 L 176 208 L 196 158 L 268 190 C 286 120, 262 30, 268 -90 C 276 -230, 262 -350, 235 -430 C 150 -456, -150 -456, -235 -430 Z"
          fill={`url(#${gid("mantle")})`}
        />
        {/* Cuerpo abisal central (torso angosto hacia la cintura) */}
        <path
          d="M -150 -430 C -168 -360, -176 -270, -168 -170 C -160 -80, -150 -30, -110 0 L 110 0 C 150 -30, 160 -80, 168 -170 C 176 -270, 168 -360, 150 -430 C 90 -456, -90 -456, -150 -430 Z"
          fill={`url(#${gid("abyss")})`}
        />
        {/* Hombreras angulares rasgadas */}
        <path d="M -235 -432 L -150 -456 L -120 -398 L -152 -338 L -216 -356 Z" fill="#0C0910" />
        <path d="M 235 -432 L 150 -456 L 120 -398 L 152 -338 L 216 -356 Z" fill="#0C0910" />
        <path d="M -235 -432 L -150 -456 L -120 -398" stroke="#DC2626" strokeWidth="2.5" fill="none" opacity="0.5" />
        <path d="M 235 -432 L 150 -456 L 120 -398" stroke="#DC2626" strokeWidth="2.5" fill="none" opacity="0.5" />

        {/* Venas / grietas cósmicas carmesí */}
        <g fill="none" strokeLinecap="round">
          <path d="M -78 -420 C -66 -360, -74 -280, -58 -200 C -50 -150, -46 -100, -38 -40" stroke={`url(#${gid("vein")})`} strokeWidth="4" opacity="0.85" />
          <path d="M 78 -420 C 66 -360, 74 -280, 58 -200 C 50 -150, 46 -100, 38 -40" stroke={`url(#${gid("vein")})`} strokeWidth="4" opacity="0.85" />
          <path d="M 0 -430 C -6 -340, 8 -250, 0 -160 C -4 -110, -2 -60, 0 -10" stroke={`url(#${gid("vein")})`} strokeWidth="3" opacity="0.6" />
          <path d="M -108 -400 C -112 -340, -108 -280, -116 -220" stroke="#7F1D1D" strokeWidth="3" opacity="0.7" />
          <path d="M 108 -400 C 112 -340, 108 -280, 116 -220" stroke="#7F1D1D" strokeWidth="3" opacity="0.7" />
          <path d="M -58 -200 C -64 -180, -68 -160, -66 -140" stroke="#DC2626" strokeWidth="2.5" opacity="0.5" />
          <path d="M 58 -200 C 64 -180, 68 -160, 66 -140" stroke="#DC2626" strokeWidth="2.5" opacity="0.5" />
        </g>

        {/* Bocas de las clavículas/hombros (6 y 7) */}
        <g transform="translate(-118, -398)">
          <ZalgoMouth hw={38} open={mouthOpenAt(5)} pid={pid} seed={5} />
        </g>
        <g transform="translate(118, -398)">
          <ZalgoMouth hw={38} open={mouthOpenAt(6)} pid={pid} seed={6} />
        </g>

        {/* ===== neckHeadGroup (cuello → cabeza → corona) ===== */}
        <g transform="translate(0, -456)">
          {/* Cuello */}
          <path d="M -20 0 C -20 -16, -18 -30, -15 -46 L 15 -46 C 18 -30, 20 -16, 20 0 Z" fill="#0A070C" />

          <g transform="translate(0, -44)">
            {/* Corona de relámpagos negros detrás del cráneo */}
            <g>
              {CROWN.map((bolt, i) => (
                <g key={`bolt-${i}`} transform={`rotate(${bolt.angle})`}>
                  <path
                    d={bolt.d}
                    stroke="#050308"
                    strokeWidth="6"
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <path
                    d={bolt.d}
                    stroke="#0D0609"
                    strokeWidth="2.6"
                    fill="none"
                    strokeLinejoin="round"
                  />
                  <path
                    d={bolt.d}
                    stroke="#DC2626"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinejoin="round"
                    opacity={mode === "finale" ? 0.85 : 0.55}
                  />
                  {/* Punta luminosa del relámpago */}
                  <circle
                    cy={-bolt.len}
                    r={3}
                    fill="#DC2626"
                    opacity={0.4 + sparkFlicker(i) * 0.5}
                    filter={`url(#${gid("blur")})`}
                  />
                </g>
              ))}
              {/* Chispas carmesí chisporroteando */}
              {CROWN_SPARKS.map((sp, i) => (
                <circle
                  key={`spark-${i}`}
                  cx={sp.x}
                  cy={sp.y}
                  r={sp.r}
                  fill="#DC2626"
                  opacity={sparkFlicker(i)}
                />
              ))}
            </g>

            {/* Cabeza eldritch SIN OJOS */}
            <g transform="translate(0, -40)">
              {/* Cráneo (anguloso, alargado, liso y oscuro) */}
              <path
                d="M 0 -116 C 52 -116, 96 -92, 102 -50 C 108 -14, 102 14, 88 40 C 72 70, 46 92, 22 102 C 6 108, -6 108, -22 102 C -46 92, -72 70, -88 40 C -102 14, -108 -14, -102 -50 C -96 -92, -52 -116, 0 -116 Z"
                fill={`url(#${gid("abyss")})`}
              />
              {/* Rostro liso oscuro: sin cuencas, solo sombra de pómulos */}
              <path d="M -58 -34 C -40 -52, -20 -56, 0 -56 C 20 -56, 40 -52, 58 -34 C 38 -40, 18 -42, 0 -42 C -18 -42, -38 -40, -58 -34 Z" fill="#0D0609" opacity="0.55" />
              {/* Rim light carmesí del cráneo */}
              <path d="M -88 40 C -102 14, -108 -14, -102 -50 C -96 -92, -52 -116, 0 -116" stroke="#DC2626" strokeWidth="2.5" fill="none" opacity="0.55" />

              {/* Bocas del rostro: frente (1), mejillas (2 y 3), mandíbula central (0) */}
              <g transform="translate(0, -70)">
                <ZalgoMouth hw={30} open={mouthOpenAt(1)} pid={pid} seed={1} />
              </g>
              <g transform="translate(-54, 2) rotate(-30)">
                <ZalgoMouth hw={26} open={mouthOpenAt(2)} pid={pid} seed={2} />
              </g>
              <g transform="translate(54, 2) rotate(30)">
                <ZalgoMouth hw={26} open={mouthOpenAt(3)} pid={pid} seed={3} />
              </g>

              {/* Séptima boca central: brilla intensamente al cantar la melodía */}
              {sing > 0.01 ? (
                <ellipse
                  cx="0"
                  cy="46"
                  rx="76"
                  ry="44"
                  fill="#DC2626"
                  opacity={0.3 * sing}
                  filter={`url(#${gid("glow")})`}
                />
              ) : null}
              <g transform="translate(0, 44)">
                <ZalgoMouth hw={54} open={centralOpen} pid={pid} seed={0} />
              </g>

              {/* Grietas carmesí en el cráneo */}
              <path d="M -20 -110 C -16 -80, -20 -50, -12 -20" stroke="#7F1D1D" strokeWidth="2.5" fill="none" opacity="0.7" />
              <path d="M 20 -110 C 16 -80, 20 -50, 12 -20" stroke="#7F1D1D" strokeWidth="2.5" fill="none" opacity="0.7" />
            </g>
          </g>

          {/* Boca de la garganta (5) */}
          <g transform="translate(0, 20)">
            <ZalgoMouth hw={30} open={mouthOpenAt(4)} pid={pid} seed={4} />
          </g>
        </g>

        {/* ===== Brazo Izquierdo Superior (garra de sangre) ===== */}
        <g transform="translate(-215, -400)">
          <ZalgoArm
            pid={pid}
            flip={false}
            shoulder={uLShoulder}
            elbow={uLElbow}
            mode={mode}
            star={star}
            attack={attack}
            frame={frame}
            held="blood"
          />
        </g>

        {/* ===== Brazo Derecho Superior (estrella muerta) ===== */}
        <g transform="translate(215, -400)">
          <ZalgoArm
            pid={pid}
            flip
            shoulder={uRShoulder}
            elbow={uRElbow}
            mode={mode}
            star={star}
            attack={attack}
            frame={frame}
            held="star"
          />
        </g>

        {/* ===== Brazo Izquierdo Inferior (guardia baja carmesí) ===== */}
        <g transform="translate(-145, -252)">
          <ZalgoArm
            pid={pid}
            flip={false}
            shoulder={lLShoulder}
            elbow={lLElbow}
            mode={mode}
            star={star}
            attack={attack}
            frame={frame}
            held="guard"
          />
        </g>

        {/* ===== Brazo Derecho Inferior (vela negra) ===== */}
        <g transform="translate(145, -252)">
          <ZalgoArm
            pid={pid}
            flip
            shoulder={lRShoulder}
            elbow={lRElbow}
            mode={mode}
            star={star}
            attack={attack}
            frame={frame}
            held="candle"
          />
        </g>

        {/* Tentáculos frontales (manto frontal) */}
        <g fill="#050309">
          {frontTendrils.map((t, i) => (
            <path key={`ft-${i}`} d={t.fill} />
          ))}
        </g>
        {/* Borde carmesí de tentáculos frontales */}
        <g fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.4">
          {frontTendrils.map((t, i) => (
            <path key={`fr-${i}`} d={t.rim} />
          ))}
        </g>
      </g>
    </svg>
  );
};
