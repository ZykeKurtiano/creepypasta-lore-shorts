/**
 * rigMath.ts — Utilidades de cinemática y color deterministas y puras
 * (sin dependencia de `remotion`) reutilizables por los 3 rigs vectoriales
 * 2.5D (RakeCharacter, MotherWitnessCharacter, PatientVictimCharacter).
 *
 * Todo es función pura: misma entrada → misma salida, sin `Math.random`
 * ni estado. El módulo devuelve valores acotados y NUNCA `NaN`.
 */

export interface TwoBoneIKSolution {
  elbowX: number;
  elbowY: number;
  /** Ángulo (grados) del segmento superior medido desde el eje +X. */
  upperAngleDeg: number;
  /** Ángulo (grados) del segmento inferior medido desde el eje +X. */
  lowerAngleDeg: number;
  wristX: number;
  wristY: number;
}

/**
 * Solución analítica exacta de 2-Bone IK.
 *
 * Dada una raíz (hombro/cadera), un objetivo (muñeca/tobillo) y las
 * longitudes de los dos segmentos, calcula la posición del codo y los
 * ángulos de ambos segmentos. El resultado se clampa con seguridad para
 * que NUNCA devuelva `NaN` (incluso con objetivo coincidente con la raíz
 * o fuera de alcance).
 *
 * Convención de dibujo: cada segmento se dibuja horizontal apuntando a +X
 * desde su articulación origen, y se rota por su ángulo en grados.
 *
 * @param bendDir `1` pliega el codo hacia un lado, `-1` hacia el opuesto.
 */
export function solveTwoBoneIK(
  rootX: number,
  rootY: number,
  targetX: number,
  targetY: number,
  len1: number,
  len2: number,
  bendDir: 1 | -1
): TwoBoneIKSolution {
  const l1 = Math.max(1e-3, len1);
  const l2 = Math.max(1e-3, len2);

  const dx = targetX - rootX;
  const dy = targetY - rootY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);
  const effDist = Math.max(dist, 1e-4);
  const clampedDist = Math.min(maxReach, Math.max(minReach, effDist));

  // Dirección raíz → objetivo (determinista incluso con dist ≈ 0).
  const targetDir = Math.atan2(dy, dx);

  // Ley del coseno para el ángulo en la raíz entre el brazo superior y la
  // línea al objetivo. Se clampa a [-1, 1] para evitar `acos` fuera de rango.
  const cosUpper =
    (l1 * l1 + clampedDist * clampedDist - l2 * l2) /
    (2 * l1 * clampedDist);
  const clampedCosUpper = Math.max(-1, Math.min(1, cosUpper));
  const upperAngleFromTarget = Math.acos(clampedCosUpper);

  const elbowAngle = targetDir + bendDir * upperAngleFromTarget;

  const elbowX = rootX + Math.cos(elbowAngle) * l1;
  const elbowY = rootY + Math.sin(elbowAngle) * l1;

  // La muñeca queda sobre la línea raíz→objetivo (a la distancia clampeada).
  const wristX = rootX + Math.cos(targetDir) * clampedDist;
  const wristY = rootY + Math.sin(targetDir) * clampedDist;

  const upperAngleDeg = (elbowAngle * 180) / Math.PI;
  const lowerAngleDeg =
    (Math.atan2(wristY - elbowY, wristX - elbowX) * 180) / Math.PI;

  return {
    elbowX,
    elbowY,
    upperAngleDeg,
    lowerAngleDeg,
    wristX,
    wristY,
  };
}

/**
 * Interpolación lineal limpia entre dos colores hex (#RGB o #RRGGBB).
 * Devuelve siempre una cadena `#rrggbb` válida.
 */
export function lerpHex(hexA: string, hexB: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const [ra, ga, ba] = hexToRgb(hexA);
  const [rb, gb, bb] = hexToRgb(hexB);
  const r = Math.round(ra + (rb - ra) * k);
  const g = Math.round(ga + (gb - ga) * k);
  const b = Math.round(ba + (bb - ba) * k);
  return rgbToHex(r, g, b);
}

/**
 * Factor de parpadeo natural determinista.
 *
 * Devuelve un valor suave `0..1` (`0` = ojo abierto, `1` = ojo cerrado).
 * El parpadeo ocurre en un instante pseudo-aleatorio dentro de cada
 * intervalo (`intervalFrames`, default 90 ≈ 3 s a 30 fps) y dura ~5 frames
 * (cierre y apertura rápidos). La "fase" del parpadeo es estable por
 * `(frame, seed)` — nunca usa `Math.random`.
 */
export function blinkFactor(
  frame: number,
  seed: number,
  intervalFrames = 90
): number {
  const cycleLength = Math.max(6, Math.floor(intervalFrames));
  const cycle = Math.floor(frame / cycleLength);
  const local = frame - cycle * cycleLength;

  // El parpadeo cae en una zona pseudo-aleatoria interior del ciclo
  // (evitando los extremos para que no choque con el reinicio del ciclo).
  const span = Math.max(1, cycleLength - 40);
  const offset =
    20 + Math.floor(hash01(cycle * 12.9898 + seed * 71.13) * span);
  const d = local - offset;
  if (d < 0 || d >= 5) {
    return 0;
  }
  // Forma triangular: 0 → 1 → 0 en 5 frames (rápido y natural).
  return d <= 2.5 ? d / 2.5 : (5 - d) / 2.5;
}

/**
 * Anticipación de 4 frames + llegada elástica con *follow-through*.
 *
 * Durante los primeros `anticipationFrames` (por defecto 4) el valor se
 * desplaza en sentido OPUESTO al objetivo (`anticipationAmount` proporcional
 * al recorrido), y después hace un *ease-out* elástico con sobreimpulso
 * (follow-through) hasta asentarse en `toVal`.
 *
 * Útil para giros de cabeza, sobresaltos y ataques.
 */
export function anticipationFollowThrough(
  frame: number,
  triggerFrame: number,
  duration: number,
  fromVal: number,
  toVal: number,
  anticipationAmount = 0.15
): number {
  const d = frame - triggerFrame;
  if (d <= 0) {
    return fromVal;
  }
  if (d >= duration) {
    return toVal;
  }

  const span = toVal - fromVal;
  const dur = Math.max(1, duration);
  const anticFrames = Math.min(4, Math.max(1, dur * 0.25));
  const anticipationDip = span * anticipationAmount;

  if (d < anticFrames) {
    // Fase de anticipación: se aleja del objetivo (ease-in).
    const t = d / anticFrames;
    return fromVal - anticipationDip * (t * t);
  }

  // Fase principal: desde el pico de anticipación hasta el objetivo,
  // con llegada elástica (sobreimpulso = follow-through).
  const t = (d - anticFrames) / (dur - anticFrames);
  const startVal = fromVal - anticipationDip;
  return startVal + (toVal - startVal) * easeOutElastic(t);
}

/**
 * Genera el `d` de una extremidad orgánica cónica (cápsula) entre dos puntos.
 * Dibuja un cuadrilátero que se estrecha de `w1` (raíz) a `w2` (punta),
 * con la anchura perpendicular a la dirección del hueso.
 */
export function limbPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w1: number,
  w2: number
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const h1 = w1 / 2;
  const h2 = w2 / 2;
  return [
    `M ${(x1 + nx * h1).toFixed(2)} ${(y1 + ny * h1).toFixed(2)}`,
    `L ${(x2 + nx * h2).toFixed(2)} ${(y2 + ny * h2).toFixed(2)}`,
    `L ${(x2 - nx * h2).toFixed(2)} ${(y2 - ny * h2).toFixed(2)}`,
    `L ${(x1 - nx * h1).toFixed(2)} ${(y1 - ny * h1).toFixed(2)}`,
    "Z",
  ].join(" ");
}

/** Hash seno determinista → [0,1) estable para un entero dado. */
function hash01(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453123;
  return s - Math.floor(s);
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const safe = /^[0-9a-fA-F]{6}$/.test(h) ? h : "000000";
  const num = parseInt(safe, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function easeOutElastic(t: number): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
