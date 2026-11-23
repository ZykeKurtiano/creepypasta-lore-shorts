import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * HumanSilhouette.tsx — Silueta humana vectorial oscura articulada en 2.5D
 * para los personajes no-creatura de la serie (investigador, gamer, durmiente).
 *
 * Construcción 100% SVG/TSX estilizada, sin imágenes fotorrealistas:
 *  - 25+ trazos <path> orgánicos por modo (Bézier, pliegues, mechones, rasgos),
 *  - degradados <linearGradient>/<radialGradient>, sombras profundas y luz de
 *    borde (rim light) configurable vía `rimColor`,
 *  - grupos <g> independientes animados con useCurrentFrame / useVideoConfig /
 *    interpolate / spring / Math.sin (CERO Math.random).
 */

export type HumanSilhouetteProps = {
  mode: "investigator" | "gamer" | "sleeper";
  width?: number;
  scale?: number;
  opacity?: number;
  rimColor?: string;
  /** Frame local (dentro de la composición) en que el gamer sufre el sobresalto. */
  startleFrame?: number;
  style?: React.CSSProperties;
};

/* ------------------------------------------------------------------ */
/* Helpers de dedos cónicos orgánicos (apuntando arriba o abajo)       */
/* ------------------------------------------------------------------ */

const fingerUp = (cx: number, cy: number, w: number, len: number): string =>
  [
    `M ${cx - w} ${cy}`,
    `C ${cx - w - 1.5} ${cy - len * 0.42}, ${cx - w * 0.55} ${cy - len + 5}, ${cx} ${cy - len}`,
    `C ${cx + w * 0.55} ${cy - len + 5}, ${cx + w + 1.5} ${cy - len * 0.42}, ${cx + w} ${cy}`,
    "Z",
  ].join(" ");

const fingerDown = (cx: number, cy: number, w: number, len: number): string =>
  [
    `M ${cx - w} ${cy}`,
    `C ${cx - w - 1.5} ${cy + len * 0.42}, ${cx - w * 0.55} ${cy + len - 5}, ${cx} ${cy + len}`,
    `C ${cx + w * 0.55} ${cy + len - 5}, ${cx + w + 1.5} ${cy + len * 0.42}, ${cx + w} ${cy}`,
    "Z",
  ].join(" ");

/* ------------------------------------------------------------------ */
/* Modo 1 — INVESTIGADOR: tres cuartos / sobre-el-hombro ante el CRT   */
/* ------------------------------------------------------------------ */

const Investigator: React.FC<{
  frame: number;
  uid: string;
  rimColor: string;
}> = ({ frame, uid, rimColor }) => {
  // Respiración del torso + inclinación gradual de la cabeza hacia el brillo cian
  const breathe = 1 + Math.sin(frame * 0.12) * 0.012;
  const headLean =
    interpolate(frame, [0, 720], [-1.5, 5], { extrapolateRight: "clamp" }) +
    Math.sin(frame * 0.09) * 1.1;

  // Pulso de tecleo fluido por dedo (desfases distintos)
  const tap = (phase: number) => Math.max(0, Math.sin(frame * 0.34 + phase));

  return (
    <g>
      {/* Resplandor del monitor delante-izquierda */}
      <ellipse
        cx="96"
        cy="360"
        rx="150"
        ry="130"
        fill={`url(#${uid}-glow)`}
        opacity="0.5"
      />

      {/* Torso (respira) */}
      <g
        style={{
          transformOrigin: "230px 400px",
          transform: `scale(${breathe.toFixed(4)})`,
        }}
      >
        {/* Sudadera principal */}
        <path
          d="M 176 214 C 152 250, 146 300, 150 356 C 152 380, 160 398, 178 404 L 284 404 C 300 398, 308 380, 310 356 C 314 300, 308 250, 284 214 C 264 188, 248 180, 230 180 C 212 180, 194 188, 176 214 Z"
          fill={`url(#${uid}-hoodie)`}
        />
        {/* Capucha trasera */}
        <path
          d="M 204 190 C 196 208, 192 228, 198 248 C 212 242, 246 240, 260 244 C 268 228, 270 208, 262 190 C 244 182, 222 180, 204 190 Z"
          fill="#0B0F15"
        />
        {/* Pliegues de hombros */}
        <path
          d="M 176 214 C 168 250, 162 292, 164 340"
          stroke="#04060A"
          strokeWidth="5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 284 214 C 292 250, 298 292, 296 340"
          stroke="#04060A"
          strokeWidth="5"
          fill="none"
          opacity="0.7"
        />
        {/* Pliegue central de la espalda */}
        <path
          d="M 230 214 C 228 262, 228 316, 232 372"
          stroke="#04060A"
          strokeWidth="4"
          fill="none"
          opacity="0.5"
        />
        {/* Pliegues bajos */}
        <path
          d="M 168 356 C 180 372, 198 382, 216 386"
          stroke="#0A0E14"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M 292 356 C 280 372, 262 382, 244 386"
          stroke="#0A0E14"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
        />
        {/* Brazo izquierdo hacia el teclado */}
        <path
          d="M 176 216 C 166 258, 152 296, 142 330 C 138 346, 138 364, 144 380 L 172 390 C 168 372, 170 354, 174 336 C 180 306, 190 268, 198 232 Z"
          fill={`url(#${uid}-hoodie)`}
        />
        {/* Brazo derecho */}
        <path
          d="M 286 218 C 300 258, 308 296, 310 330 C 311 348, 308 366, 302 382 L 274 390 C 280 370, 282 350, 278 332 C 272 302, 260 266, 248 234 Z"
          fill={`url(#${uid}-hoodie)`}
        />
        {/* Luz de borde del hombro/espalda */}
        <path
          d="M 176 214 C 158 244, 152 292, 152 356"
          stroke={`url(#${uid}-rim)`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Cabeza + cuello (se inclina hacia el monitor) */}
      <g
        style={{
          transformOrigin: "230px 190px",
          transform: `rotate(${headLean.toFixed(2)}deg)`,
        }}
      >
        {/* Cuello */}
        <path d="M 216 178 L 244 178 L 246 212 L 214 212 Z" fill="#0A0E14" />
        {/* Cabeza (perfil tres cuartos) */}
        <path
          d="M 208 92 C 230 80, 262 84, 278 100 C 292 114, 298 136, 290 152 C 284 164, 270 174, 252 178 C 246 166, 238 158, 228 152 C 218 146, 210 140, 206 132 C 202 120, 202 104, 208 92 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Masa de cabello */}
        <path
          d="M 214 96 C 234 84, 262 84, 278 98 C 288 108, 294 122, 294 138 C 296 148, 294 156, 288 160 C 282 150, 274 142, 264 136 C 252 128, 240 122, 228 118 C 218 114, 212 106, 214 96 Z"
          fill={`url(#${uid}-hair)`}
        />
        {/* Mechones */}
        <path d="M 220 96 C 216 116, 218 138, 224 156" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 234 90 C 230 112, 232 134, 238 152" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 250 88 C 248 110, 250 130, 256 146" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 266 94 C 268 112, 270 128, 274 140" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 224 112 C 226 126, 228 140, 232 152" stroke="#0A0E14" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* Perfil del rostro hacia el monitor */}
        <path
          d="M 206 96 C 198 110, 196 124, 199 138 C 201 148, 206 156, 212 162 C 214 152, 216 144, 220 138 C 210 130, 208 116, 206 96 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Oreja */}
        <path
          d="M 226 138 C 232 132, 238 134, 240 140 C 242 148, 238 154, 232 156 C 228 158, 224 152, 226 138 Z"
          fill="#8B8473"
        />
        {/* Luz de borde cian sobre el perfil / cabello */}
        <path
          d="M 206 96 C 198 110, 196 124, 199 138 C 201 148, 206 156, 212 162"
          stroke={`url(#${uid}-rim)`}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Manos articuladas tecleando */}
      <g>
        {/* Palma izquierda */}
        <path
          d="M 144 378 C 138 392, 136 404, 140 416 C 144 424, 154 428, 164 428 C 176 428, 184 422, 188 412 C 190 404, 188 392, 182 382 C 172 376, 156 374, 144 378 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Dedos izquierdos (tecleo) */}
        <g transform={`rotate(${-tap(0) * 16} 168 422)`}>
          <path d={fingerDown(168, 422, 6, 22)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(1.3) * 14} 160 424)`}>
          <path d={fingerDown(160, 424, 6, 26)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(2.1) * 12} 152 424)`}>
          <path d={fingerDown(152, 424, 5.5, 24)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(2.8) * 10} 144 422)`}>
          <path d={fingerDown(144, 422, 5, 20)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(0.6) * 8} 182 414)`}>
          <path d={fingerDown(182, 414, 5.5, 14)} fill={`url(#${uid}-skin)`} />
        </g>

        {/* Palma derecha */}
        <path
          d="M 274 380 C 282 394, 286 406, 284 418 C 282 426, 274 430, 264 430 C 252 430, 244 424, 240 414 C 238 404, 240 394, 246 384 C 256 378, 266 376, 274 380 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Dedos derechos */}
        <g transform={`rotate(${-tap(1.7) * 12} 262 422)`}>
          <path d={fingerDown(262, 422, 5.5, 22)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(0.4) * 10} 254 424)`}>
          <path d={fingerDown(254, 424, 5, 24)} fill={`url(#${uid}-skin)`} />
        </g>
        <g transform={`rotate(${-tap(2.4) * 8} 246 422)`}>
          <path d={fingerDown(246, 422, 5, 20)} fill={`url(#${uid}-skin)`} />
        </g>

        {/* Rim light en las manos */}
        <path
          d="M 138 404 C 136 392, 138 380, 146 376"
          stroke={rimColor}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 292 402 C 290 392, 288 382, 282 378"
          stroke={rimColor}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Modo 2 — GAMER: busto en silla gamer con audífonos + sobresalto     */
/* ------------------------------------------------------------------ */

const Gamer: React.FC<{
  frame: number;
  fps: number;
  startleFrame: number;
  uid: string;
  rimColor: string;
}> = ({ frame, fps, startleFrame, uid, rimColor }) => {
  // Sobresalto puntual con spring (cabeza/torso hacia atrás + manos arriba)
  const startle = spring({
    frame: frame - startleFrame,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.7 },
  });
  const startleHands = spring({
    frame: frame - startleFrame - 3,
    fps,
    config: { damping: 9, stiffness: 120, mass: 0.9 },
  });

  const leanBack = startle * 12;
  const handsUp = startleHands * 46;
  const handsRot = startleHands * 24;
  const rimBoost = 0.5 + startle * 0.5;

  // Parpadeo sutil determinista
  const blink = Math.max(0, Math.sin(frame * 0.21) * 6 - 5);
  // LED del audífono respirando
  const led = 0.45 + 0.35 * Math.max(0, Math.sin(frame * 0.18));

  return (
    <g>
      {/* Silla gamer de respaldo alto */}
      <path
        d="M 150 120 C 150 96, 310 96, 310 120 L 322 300 C 324 330, 320 352, 308 366 C 296 378, 164 378, 152 366 C 140 352, 136 330, 138 300 Z"
        fill={`url(#${uid}-chair)`}
      />
      <path
        d="M 158 130 C 168 106, 292 106, 302 130 C 302 146, 296 158, 288 164 L 172 164 C 164 158, 158 146, 158 130 Z"
        fill="#0E131B"
      />
      <path
        d="M 150 120 C 140 150, 138 220, 142 300 C 150 300, 156 290, 156 270 C 152 210, 152 160, 156 132 Z"
        fill="#10151E"
      />
      <path
        d="M 310 120 C 320 150, 322 220, 318 300 C 310 300, 304 290, 304 270 C 308 210, 308 160, 304 132 Z"
        fill="#10151E"
      />

      {/* Cuerpo + cabeza (grupo que reacciona al sobresalto) */}
      <g
        style={{
          transformOrigin: "230px 360px",
          transform: `rotate(${leanBack.toFixed(2)}deg) translateX(${(-startle * 6).toFixed(2)}px)`,
        }}
      >
        {/* Torso */}
        <path
          d="M 186 220 C 180 264, 182 320, 196 372 C 204 396, 218 408, 230 408 C 242 408, 256 396, 264 372 C 278 320, 280 264, 274 220 C 252 200, 236 194, 230 194 C 210 194, 198 200, 186 220 Z"
          fill={`url(#${uid}-hoodie)`}
        />
        {/* Cuello y solapa */}
        <path d="M 218 200 L 242 200 L 244 230 L 216 230 Z" fill="#0A0E14" />
        <path d="M 204 210 C 220 202, 240 202, 256 210 L 250 228 L 210 228 Z" fill="#111722" />
        {/* Pliegues */}
        <path d="M 186 220 C 196 244, 200 268, 200 292" stroke="#04060A" strokeWidth="5" fill="none" opacity="0.6" />
        <path d="M 274 220 C 264 244, 260 268, 260 292" stroke="#04060A" strokeWidth="5" fill="none" opacity="0.6" />
        <path d="M 230 228 L 230 340" stroke="#0B1018" strokeWidth="4" fill="none" opacity="0.8" />

        {/* Cabeza */}
        <path
          d="M 206 132 C 210 108, 250 108, 254 132 C 258 156, 258 176, 252 192 C 246 202, 236 206, 230 206 C 224 206, 214 202, 208 192 C 202 176, 202 156, 206 132 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Cabello */}
        <path d="M 208 126 C 212 108, 248 108, 252 126 C 252 112, 244 104, 230 104 C 216 104, 208 112, 208 126 Z" fill={`url(#${uid}-hair)`} />
        <path d="M 204 138 C 200 156, 202 174, 208 190" stroke="#05070B" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 256 138 C 260 156, 258 174, 252 190" stroke="#05070B" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* Cejas */}
        <path d="M 214 168 C 220 164, 228 164, 234 168" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 226 168 C 232 164, 240 164, 246 168" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Ojos (parpadeo) + reflejo del monitor */}
        <g style={{ transformOrigin: "230px 180px", transform: `scaleY(${1 - blink * 0.85})` }}>
          <path d="M 214 180 C 220 174, 228 174, 234 180 C 228 186, 220 186, 214 180 Z" fill="#0A0E14" />
          <path d="M 226 180 C 232 174, 240 174, 246 180 C 240 186, 232 186, 226 180 Z" fill="#0A0E14" />
        </g>
        <circle cx="225" cy="180" r="2" fill={rimColor} opacity="0.7" />
        <circle cx="235" cy="180" r="2" fill={rimColor} opacity="0.7" />

        {/* Nariz y boca */}
        <path d="M 230 184 L 227 196 L 232 198" stroke="#6B6554" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 220 210 C 226 214, 234 214, 240 210" stroke="#3A3428" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 208 192 C 214 202, 246 202, 252 192 C 246 206, 214 206, 208 192 Z" fill="#05070B" opacity="0.4" />

        {/* Audífonos: diadema, copas y almohadillas */}
        <path d="M 208 130 C 204 92, 256 92, 252 130" stroke="#0B0F16" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M 202 142 C 196 150, 196 162, 202 170 C 208 176, 216 176, 220 168 C 224 160, 222 150, 216 144 Z" fill="#10151E" />
        <path d="M 258 142 C 264 150, 264 162, 258 170 C 252 176, 244 176, 240 168 C 236 160, 238 150, 244 144 Z" fill="#10151E" />
        <path d="M 206 150 C 208 156, 208 162, 206 166 C 210 162, 212 156, 210 150 Z" fill="#1A2230" />
        <path d="M 254 150 C 252 156, 252 162, 254 166 C 250 162, 248 156, 250 150 Z" fill="#1A2230" />
        <circle cx="252" cy="156" r="2.4" fill={rimColor} opacity={led} />

        {/* Luz de borde reactiva sobre el rostro */}
        <path
          d="M 208 130 C 204 150, 204 170, 210 188 C 216 202, 226 208, 230 208"
          stroke={rimColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity={rimBoost * 0.7}
        />
      </g>

      {/* Manos que se alzan en el sobresalto */}
      <g
        style={{
          transformOrigin: "230px 400px",
          transform: `translateY(${(-handsUp).toFixed(2)}px) rotate(${handsRot.toFixed(2)}deg)`,
        }}
      >
        <path d="M 192 300 C 178 340, 166 370, 158 396 L 186 402 C 192 378, 202 350, 214 322 Z" fill={`url(#${uid}-hoodie)`} />
        <path d="M 268 300 C 282 340, 294 370, 302 396 L 274 402 C 268 378, 258 350, 246 322 Z" fill={`url(#${uid}-hoodie)`} />

        {/* Palma izquierda + dedos */}
        <path
          d="M 158 396 C 150 404, 148 414, 152 422 C 158 428, 172 428, 178 420 C 182 414, 180 404, 174 398 Z"
          fill={`url(#${uid}-skin)`}
        />
        <path d={fingerUp(172, 400, 5.5, 18)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(166, 400, 5.5, 22)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(160, 400, 5.5, 20)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(155, 400, 5, 16)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(180, 404, 5, 12)} fill={`url(#${uid}-skin)`} />

        {/* Palma derecha + dedos */}
        <path
          d="M 302 396 C 310 404, 312 414, 308 422 C 302 428, 288 428, 282 420 C 278 414, 280 404, 286 398 Z"
          fill={`url(#${uid}-skin)`}
        />
        <path d={fingerUp(288, 400, 5.5, 18)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(294, 400, 5.5, 22)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(300, 400, 5.5, 20)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(305, 400, 5, 16)} fill={`url(#${uid}-skin)`} />
        <path d={fingerUp(280, 404, 5, 12)} fill={`url(#${uid}-skin)`} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Modo 3 — SLEEPER: durmiente bajo las sábanas a la luz de la luna    */
/* ------------------------------------------------------------------ */

const Sleeper: React.FC<{ frame: number; fps: number; uid: string }> = ({
  frame,
  fps,
  uid,
}) => {
  // Respiración lenta y profunda (frecuencia derivada de fps)
  const breatheY = Math.sin((frame / fps) * 1.25) * 2.4;
  const chestScale = 1 + Math.sin((frame / fps) * 1.25) * 0.008;

  return (
    <g>
      {/* Aura de luz de luna fría */}
      <ellipse
        cx="120"
        cy="310"
        rx="150"
        ry="100"
        fill={`url(#${uid}-moon)`}
        filter={`url(#${uid}-blur16)`}
        opacity="0.5"
      />

      {/* Almohada */}
      <path
        d="M 60 300 C 74 280, 150 278, 168 296 C 180 308, 180 322, 170 332 C 150 344, 84 344, 68 332 C 58 322, 56 310, 60 300 Z"
        fill={`url(#${uid}-blanket)`}
      />
      <path d="M 72 300 C 84 292, 96 290, 108 292" stroke="#05070B" strokeWidth="4" fill="none" opacity="0.6" />
      <path d="M 84 326 C 100 334, 140 336, 160 328" stroke="#0A0F16" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M 64 316 C 76 306, 96 302, 112 304" stroke="#1A2230" strokeWidth="3" fill="none" opacity="0.7" />

      {/* Cabeza recostada + rostro */}
      <g style={{ transform: `translateY(${breatheY.toFixed(2)}px)` }}>
        <path
          d="M 108 284 C 120 272, 150 274, 160 290 C 168 302, 168 314, 162 324 C 154 332, 132 334, 122 328 C 112 322, 104 306, 108 284 Z"
          fill={`url(#${uid}-skin)`}
        />
        <path
          d="M 160 290 C 168 298, 172 308, 172 318 C 172 324, 170 328, 166 330 C 164 322, 162 316, 160 310 C 158 304, 158 296, 160 290 Z"
          fill={`url(#${uid}-skin)`}
        />
        {/* Cabello descansando */}
        <path d="M 108 284 C 120 270, 148 270, 158 286 C 150 278, 134 274, 122 276 C 114 278, 108 280, 108 284 Z" fill={`url(#${uid}-hair)`} />
        <path d="M 112 280 C 106 286, 104 294, 106 302" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 126 274 C 122 282, 120 292, 122 300" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 142 272 C 140 280, 140 290, 144 298" stroke="#05070B" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Rasgos */}
        <path d="M 150 296 C 154 300, 160 300, 164 296" stroke="#05070B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 150 288 C 156 284, 162 286, 166 290" stroke="#05070B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 170 306 C 174 312, 176 316, 174 320" stroke="#6B6554" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 160 322 C 164 326, 168 326, 170 322" stroke="#3A3428" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 122 300 C 116 304, 114 312, 118 318 C 122 312, 122 306, 122 300 Z" fill="#8B8473" />
      </g>

      {/* Cuerpo bajo las sábanas (respira) */}
      <g
        style={{
          transformOrigin: "260px 420px",
          transform: `translateY(${(-breatheY).toFixed(2)}px) scale(${chestScale.toFixed(4)})`,
        }}
      >
        <path
          d="M 100 330 C 120 316, 150 310, 170 314 C 200 320, 260 320, 320 330 C 380 342, 410 366, 420 396 C 428 420, 424 442, 408 452 C 360 470, 160 470, 120 452 C 92 440, 84 420, 88 396 C 90 376, 94 352, 100 330 Z"
          fill={`url(#${uid}-blanket)`}
        />
        {/* Pliegues de sábana */}
        <path d="M 120 344 C 150 356, 190 358, 230 356" stroke="#05070B" strokeWidth="4" fill="none" opacity="0.55" />
        <path d="M 150 366 C 190 380, 240 382, 300 376" stroke="#0A0F16" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M 180 342 C 220 352, 260 354, 310 350" stroke="#0A0F16" strokeWidth="3" fill="none" opacity="0.4" />
        <path d="M 140 396 C 200 412, 280 414, 360 404" stroke="#05070B" strokeWidth="4" fill="none" opacity="0.5" />
        <path d="M 210 350 C 230 368, 244 390, 250 414" stroke="#0A0F16" strokeWidth="3" fill="none" opacity="0.45" />
        <path d="M 300 342 C 320 360, 332 386, 336 414" stroke="#0A0F16" strokeWidth="3" fill="none" opacity="0.45" />
        <path d="M 100 356 C 116 370, 130 384, 136 402" stroke="#0A0F16" strokeWidth="3" fill="none" opacity="0.5" />
        {/* Hombro bajo la sábana */}
        <path d="M 96 336 C 110 320, 136 314, 160 320 C 140 340, 116 348, 96 336 Z" fill="#16212B" />
        {/* Brazo dibujado bajo la tela */}
        <path d="M 120 356 C 160 350, 220 348, 260 352 C 220 364, 160 368, 120 356 Z" fill="#111922" />
        {/* Rim light de luna sobre el cuerpo */}
        <path d="M 92 388 C 84 414, 90 442, 120 452" stroke={`url(#${uid}-moon)`} strokeWidth="6" fill="none" opacity="0.7" />
      </g>

      {/* Rim light sobre almohada y cabeza */}
      <path d="M 64 306 C 58 314, 58 324, 68 332" stroke={`url(#${uid}-moon)`} strokeWidth="5" fill="none" opacity="0.7" />
      <path d="M 112 282 C 106 288, 104 296, 106 302" stroke={`url(#${uid}-moon)`} strokeWidth="4" fill="none" opacity="0.6" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export const HumanSilhouette: React.FC<HumanSilhouetteProps> = ({
  mode,
  width = 520,
  scale = 1,
  opacity = 1,
  rimColor = "#22D3EE",
  startleFrame = 90,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ID único sanitizado (válido como nombre XML) para los <defs>
  const rawId = React.useId();
  const uid = "hs" + rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const height = (width * 520) / 460;

  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <svg
          viewBox="0 0 460 520"
          width="100%"
          height="100%"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8D1C3" />
              <stop offset="55%" stopColor="#A79F8D" />
              <stop offset="100%" stopColor="#6B6554" />
            </linearGradient>
            <linearGradient id={`${uid}-hoodie`} x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#161C26" />
              <stop offset="60%" stopColor="#0A0E14" />
              <stop offset="100%" stopColor="#04060A" />
            </linearGradient>
            <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D1118" />
              <stop offset="100%" stopColor="#030408" />
            </linearGradient>
            <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={rimColor} stopOpacity="0.9" />
              <stop offset="50%" stopColor={rimColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={rimColor} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={rimColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={rimColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uid}-blanket`} x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor="#1B2430" />
              <stop offset="55%" stopColor="#0C1218" />
              <stop offset="100%" stopColor="#05070B" />
            </linearGradient>
            <linearGradient id={`${uid}-chair`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1A2230" />
              <stop offset="50%" stopColor="#0B0F16" />
              <stop offset="100%" stopColor="#06080D" />
            </linearGradient>
            <radialGradient id={`${uid}-moon`} cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor={rimColor} stopOpacity="0.55" />
              <stop offset="60%" stopColor={rimColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={rimColor} stopOpacity="0" />
            </radialGradient>
            <filter
              id={`${uid}-blur16`}
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {mode === "investigator" && (
            <Investigator frame={frame} uid={uid} rimColor={rimColor} />
          )}
          {mode === "gamer" && (
            <Gamer
              frame={frame}
              fps={fps}
              startleFrame={startleFrame}
              uid={uid}
              rimColor={rimColor}
            />
          )}
          {mode === "sleeper" && (
            <Sleeper frame={frame} fps={fps} uid={uid} />
          )}
        </svg>
      </div>
    </div>
  );
};
