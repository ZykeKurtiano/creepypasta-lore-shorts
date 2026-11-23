import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * JeffCharacter — Jeff the Killer en vectorial oscuro articulado 2.5D.
 *
 * Construcción TSX/SVG estilizada (cero Fal.ai fotorrealista):
 *  - sudadera blanca sucia con capucha, pliegues, costuras, bolsillo y cordones;
 *  - capucha estilizada y dramática: abertura ovalada oscura vertical alrededor
 *    del rostro, con la tela cayendo en pliegues suaves hacia el cuello, las
 *    clavículas y los hombros (nunca un casco cerrado bajo la barbilla);
 *  - rostro pálido ceniza estrecho, demacrado y alargado, con pómulos marcados,
 *    mentón afilado y sombras profundas;
 *  - cuencas hundidas almendradas, esclerótica fría estrecha y pupilas diminutas
 *    fijas con brillo puntual tenue;
 *  - sonrisa cortada delgada, tensa y alargada hacia las mejillas, con cicatrices
 *    finas carmesí oscuro en las comisuras (sin U gorda ni dientes de caricatura);
 *  - mechones de cabello negro afilados, irregulares y orgánicos.
 *
 * Animación 100% determinista (useCurrentFrame + Math.sin, cero Math.random).
 */

// ---------------------------------------------------------------------------
// Geometría base (viewBox 420 x 520)
// ---------------------------------------------------------------------------

const TORSO_D =
  "M 30 520 " +
  "C 46 468, 72 424, 104 396 " +
  "C 116 384, 128 378, 140 375 " +
  "C 158 370, 262 370, 280 375 " +
  "C 292 378, 304 384, 316 396 " +
  "C 348 424, 374 468, 390 520 Z";

// Capucha estilizada: cúpula sobre la cabeza, laterales que se ensanchan y caen
// en pliegues suaves hacia los hombros. El borde inferior no se cierra bajo la
// barbilla: deja el cuello y las clavículas libres.
const COWL_D =
  "M 210 100 " +
  "C 150 104, 104 142, 90 202 " +
  "C 80 250, 84 304, 98 352 " +
  "C 106 380, 118 398, 136 409 " +
  "C 156 420, 178 424, 196 422 " +
  "C 202 410, 206 396, 208 382 " +
  "C 210 396, 214 410, 220 422 " +
  "C 238 424, 262 420, 284 409 " +
  "C 302 398, 314 380, 322 352 " +
  "C 336 304, 340 250, 330 202 " +
  "C 316 142, 270 104, 210 100 Z";

// Abertura interior oscura: óvalo vertical alto que enmarca el rostro.
const OPENING_D =
  "M 210 148 " +
  "C 178 150, 152 166, 140 198 " +
  "C 130 226, 128 262, 136 296 " +
  "C 144 326, 158 350, 178 362 " +
  "C 196 372, 224 372, 242 362 " +
  "C 262 350, 276 326, 284 296 " +
  "C 292 262, 290 226, 280 198 " +
  "C 268 166, 242 150, 210 148 Z";

// Rostro estrecho, demacrado y alargado verticalmente (mentón en y ~336).
const FACE_D =
  "M 166 182 " +
  "C 165 160, 172 146, 192 142 " +
  "C 206 139, 224 141, 238 145 " +
  "C 248 149, 254 164, 254 182 " +
  "C 254 200, 258 216, 262 234 " +
  "C 265 248, 260 262, 250 274 " +
  "C 242 284, 238 296, 239 308 " +
  "C 240 321, 232 331, 222 334 " +
  "C 216 336, 204 336, 198 334 " +
  "C 188 331, 180 321, 181 308 " +
  "C 182 296, 178 284, 170 274 " +
  "C 160 262, 155 248, 158 234 " +
  "C 162 216, 166 200, 166 182 Z";

// Cuello esquelético sombreado (de mentón a clavículas).
const NECK_D =
  "M 184 320 " +
  "C 186 342, 190 358, 197 370 " +
  "C 208 379, 222 379, 232 370 " +
  "C 239 358, 242 342, 244 320 " +
  "C 226 332, 200 332, 184 320 Z";

// Cuencas hundidas almendradas (no círculos tipo gafas).
const LEFT_SOCKET_D =
  "M 154 208 " +
  "C 158 194, 172 186, 184 187 " +
  "C 192 188, 198 195, 200 204 " +
  "C 197 216, 186 222, 176 221 " +
  "C 164 220, 155 214, 154 208 Z";

const RIGHT_SOCKET_D =
  "M 266 208 " +
  "C 262 194, 248 186, 236 187 " +
  "C 228 188, 222 195, 220 204 " +
  "C 223 216, 234 222, 244 221 " +
  "C 256 220, 265 214, 266 208 Z";

// Esclerótica fría ligeramente estrecha.
const LEFT_EYE_D =
  "M 160 207 " +
  "C 164 197, 174 191, 184 192 " +
  "C 190 193, 194 198, 195 204 " +
  "C 193 212, 185 217, 177 216 " +
  "C 168 215, 162 211, 160 207 Z";

const RIGHT_EYE_D =
  "M 260 207 " +
  "C 256 197, 246 191, 236 192 " +
  "C 230 193, 226 198, 225 204 " +
  "C 227 212, 235 217, 243 216 " +
  "C 252 215, 258 211, 260 207 Z";

const LEFT_BAG_D =
  "M 156 224 " +
  "C 162 217, 172 214, 184 216 " +
  "C 192 218, 196 222, 193 226 " +
  "C 190 232, 170 232, 160 228 " +
  "C 157 227, 156 226, 156 224 Z";

const RIGHT_BAG_D =
  "M 264 224 " +
  "C 258 217, 248 214, 236 216 " +
  "C 228 218, 224 222, 227 226 " +
  "C 230 232, 250 232, 260 228 " +
  "C 263 227, 264 226, 264 224 Z";

const NOSE_D =
  "M 206 228 " +
  "C 205 236, 204 244, 204 252 " +
  "C 210 258, 218 255, 220 249 " +
  "C 221 240, 216 232, 206 228 Z";

// Sonrisa cortada delgada, tensa y alargada hacia las mejillas.
const MOUTH_D =
  "M 152 286 " +
  "C 174 294, 246 294, 268 286 " +
  "L 265 293 " +
  "C 244 300, 176 300, 155 293 Z";

// Cicatrices finas carmesí oscuro en las comisuras (Glasgow smile).
const LEFT_SCAR_D =
  "M 152 286 C 145 276, 137 266, 130 254 C 141 266, 148 278, 152 286 Z";

const RIGHT_SCAR_D =
  "M 268 286 C 275 276, 283 266, 290 254 C 279 266, 272 278, 268 286 Z";

const HAIR_BASE_D =
  "M 150 158 " +
  "C 146 128, 156 106, 178 100 " +
  "C 200 96, 222 96, 242 100 " +
  "C 264 106, 274 128, 270 158 " +
  "C 268 140, 262 128, 252 120 " +
  "C 238 108, 224 104, 210 104 " +
  "C 196 104, 182 108, 168 120 " +
  "C 158 128, 152 140, 150 158 Z";

const POCKET_D =
  "M 150 432 " +
  "C 160 426, 260 426, 270 432 " +
  "C 277 448, 281 470, 281 486 " +
  "C 281 494, 275 498, 265 498 " +
  "L 155 498 " +
  "C 145 498, 139 494, 139 486 " +
  "C 139 470, 143 448, 150 432 Z";

// Mechones de cabello afilados e irregulares (mechón frontal + sienes).
// Cada mechón es una forma rellena con punta, con su anclaje para balanceo.
const HAIR_STRANDS = [
  { d: "M 166 124 C 156 142, 150 162, 146 186 C 156 170, 164 150, 170 128 Z", ox: 166, oy: 124, phase: 0.0 },
  { d: "M 178 116 C 174 138, 170 160, 166 188 C 176 170, 182 148, 186 124 Z", ox: 178, oy: 116, phase: 0.7 },
  { d: "M 192 110 C 190 136, 189 160, 190 190 C 197 168, 200 142, 201 118 Z", ox: 192, oy: 110, phase: 1.4 },
  { d: "M 208 107 C 207 133, 208 159, 210 190 C 216 166, 217 140, 216 116 Z", ox: 208, oy: 107, phase: 2.1 },
  { d: "M 224 108 C 226 134, 229 158, 234 188 C 229 164, 226 140, 224 118 Z", ox: 224, oy: 108, phase: 2.8 },
  { d: "M 238 114 C 242 138, 246 160, 252 188 C 245 168, 240 146, 236 122 Z", ox: 238, oy: 114, phase: 3.5 },
  { d: "M 250 122 C 256 140, 262 158, 268 184 C 260 168, 255 148, 251 130 Z", ox: 250, oy: 122, phase: 4.2 },
  { d: "M 158 128 C 150 144, 143 162, 138 186 C 147 168, 155 148, 160 132 Z", ox: 158, oy: 128, phase: 4.9 },
  { d: "M 262 128 C 270 144, 277 162, 282 186 C 273 168, 265 148, 260 132 Z", ox: 262, oy: 128, phase: 5.3 },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface JeffCharacterProps {
  width?: number;
  scale?: number;
  opacity?: number;
  rimColor?: string;
  /** Intensidad de tinte/resplandor carmesí (0..1). */
  crimsonAccent?: number;
  /** Oscurece rostro/sudadera para modo acecho tras una ventana. */
  shadowMode?: boolean;
  /** Rotación extra de cabeza en grados. */
  headTiltBoost?: number;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export const JeffCharacter: React.FC<JeffCharacterProps> = ({
  width = 520,
  scale = 1,
  opacity = 1,
  rimColor = "#22D3EE",
  crimsonAccent = 0.4,
  shadowMode = false,
  headTiltBoost = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  // IDs únicos (sanitizados) para evitar colisiones si el componente se monta varias veces.
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string): string => `j${uid}-${name}`;

  // Animación determinista.
  const breathe = Math.sin(frame * 0.045) * 3.2;
  const breatheScale = 1 + Math.sin(frame * 0.045) * 0.006;
  const headTilt = Math.sin(frame * 0.028) * 1.8 + headTiltBoost;
  const eyeGlint = 0.72 + 0.18 * Math.max(0, Math.sin(frame * 0.31 + 0.8));
  const crimsonPulse = 0.85 + 0.15 * Math.sin(frame * 0.07 + 1.2);
  const crimson = Math.max(0, Math.min(1, crimsonAccent));

  // Paleta condicionada por el modo acecho.
  const skin = shadowMode
    ? { hi: "#5A5750", mid: "#45423B", lo: "#2A2823", deep: "#141210" }
    : { hi: "#DAD5CA", mid: "#B6B1A5", lo: "#6E685E", deep: "#3E3A34" };

  const hood = shadowMode
    ? { hi: "#5E5B53", mid: "#49463F", lo: "#2B2924", deep: "#151310" }
    : { hi: "#ECE8DD", mid: "#CBC6B9", lo: "#8B857A", deep: "#58544B" };

  const eyeWhite = shadowMode ? "#8E8A80" : "#E9E4D9";

  const height = (width * 520) / 420;

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
      <svg
        viewBox="0 0 420 520"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <defs>
          {/* Piel pálida ceniza con sombreado de pómulos/cuencas */}
          <radialGradient id={id("skin")} cx="42%" cy="38%" r="74%">
            <stop offset="0%" stopColor={skin.hi} />
            <stop offset="45%" stopColor={skin.mid} />
            <stop offset="80%" stopColor={skin.lo} />
            <stop offset="100%" stopColor={skin.deep} />
          </radialGradient>
          <radialGradient id={id("skinShadow")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0A0B0E" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0A0B0E" stopOpacity="0" />
          </radialGradient>

          {/* Tela de sudadera blanca sucia/manchada */}
          <linearGradient id={id("hoodie")} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={hood.hi} />
            <stop offset="45%" stopColor={hood.mid} />
            <stop offset="85%" stopColor={hood.lo} />
            <stop offset="100%" stopColor={hood.deep} />
          </linearGradient>

          {/* Interior profundo de la capucha */}
          <radialGradient id={id("hoodInner")} cx="50%" cy="45%" r="62%">
            <stop offset="0%" stopColor="#0B0C0F" />
            <stop offset="70%" stopColor="#07080A" />
            <stop offset="100%" stopColor="#040507" />
          </radialGradient>

          {/* Rim light (luz de borde) */}
          <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor={rimColor} stopOpacity="0.5" />
            <stop offset="35%" stopColor={rimColor} stopOpacity="0.12" />
            <stop offset="70%" stopColor={rimColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("rimEdge")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={rimColor} stopOpacity="0.5" />
            <stop offset="50%" stopColor={rimColor} stopOpacity="0.14" />
            <stop offset="100%" stopColor={rimColor} stopOpacity="0" />
          </linearGradient>

          {/* Cabello negro */}
          <linearGradient id={id("hair")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141419" />
            <stop offset="50%" stopColor="#0A0A0E" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>

          {/* Resplandor carmesí inquietante */}
          <radialGradient id={id("crimson")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#7F1D1D" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
          </radialGradient>

          <filter id={id("blur")} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Aura de penumbra tras la cabeza */}
        <ellipse
          cx="210"
          cy="252"
          rx="150"
          ry="170"
          fill="#10141A"
          opacity="0.28"
          filter={`url(#${id("blur")})`}
        />

        {/* ===================== 1. TORSO / SUDADERA (respiración) ===================== */}
        <g transform={`translateY(${breathe}px)`}>
          <g transform={`scale(${breatheScale})`} style={{ transformOrigin: "210px 520px" }}>
            {/* Cuerpo de la sudadera */}
            <path d={TORSO_D} fill={`url(#${id("hoodie")})`} stroke="#0B0C0F" strokeWidth="1.5" />

            {/* Sombras de pliegues en hombros */}
            <path
              d="M 132 400 C 152 422, 170 442, 180 472"
              stroke={hood.deep}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M 288 400 C 268 422, 250 442, 240 472"
              stroke={hood.deep}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* Pliegues junto al cuello */}
            <path
              d="M 176 388 C 182 408, 186 428, 186 452"
              stroke={hood.lo}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 244 388 C 238 408, 234 428, 234 452"
              stroke={hood.lo}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            {/* Pliegue central */}
            <path
              d="M 210 380 C 206 412, 208 448, 210 484"
              stroke={hood.lo}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.35"
            />

            {/* Costura del canesú */}
            <path
              d="M 104 396 C 130 386, 290 386, 316 396"
              stroke={hood.lo}
              strokeWidth="1.6"
              fill="none"
              strokeDasharray="7 7"
              opacity="0.7"
            />

            {/* Costura central frontal (cremallera) */}
            <path
              d="M 210 388 L 210 520"
              stroke={hood.deep}
              strokeWidth="1.4"
              fill="none"
              strokeDasharray="4 6"
              opacity="0.6"
            />

            {/* Bolsillo canguro */}
            <path d={POCKET_D} fill={hood.mid} stroke={hood.deep} strokeWidth="1.6" opacity="0.92" />
            <path
              d="M 150 432 C 190 444, 230 444, 270 432"
              stroke={hood.deep}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 160 470 C 180 476, 240 476, 260 470"
              stroke={hood.lo}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Cordones de la sudadera */}
            <path
              d="M 188 380 C 186 404, 184 434, 182 462"
              stroke="#E4E0D6"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 232 380 C 234 404, 236 434, 238 462"
              stroke="#E4E0D6"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <rect x="179.5" y="462" width="5" height="11" rx="2.5" fill="#9B968A" opacity="0.95" />
            <rect x="235.5" y="462" width="5" height="11" rx="2.5" fill="#9B968A" opacity="0.95" />
          </g>
        </g>

        {/* ===================== 2. CAPUCHA (sombra interna + rim light) ===================== */}
        <g transform={`translateY(${breathe * 0.5}px)`}>
          {/* Tela exterior de la capucha */}
          <path d={COWL_D} fill={`url(#${id("hoodie")})`} stroke="#0B0C0F" strokeWidth="1.5" />

          {/* Pliegues de la capucha cayendo hacia cuello/clavículas/hombros */}
          <path
            d="M 112 302 C 120 260, 128 232, 140 210"
            stroke={hood.deep}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 308 302 C 300 260, 292 232, 280 210"
            stroke={hood.deep}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 130 344 C 142 324, 158 310, 178 300"
            stroke={hood.lo}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M 290 344 C 278 324, 262 310, 242 300"
            stroke={hood.lo}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
          {/* Pliegues largos de la tela sobre los hombros */}
          <path
            d="M 108 372 C 116 388, 126 400, 138 408"
            stroke={hood.deep}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 312 372 C 304 388, 294 400, 282 408"
            stroke={hood.deep}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 152 392 C 168 410, 184 420, 200 424"
            stroke={hood.lo}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 268 392 C 252 410, 236 420, 220 424"
            stroke={hood.lo}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Interior profundo (sombra) */}
          <path d={OPENING_D} fill={`url(#${id("hoodInner")})`} />

          {/* Borde interior iluminado (rim light de la abertura) */}
          <path
            d="M 210 148 C 178 150, 152 166, 140 198 C 130 226, 128 262, 136 296 C 144 326, 158 350, 178 362"
            stroke={`url(#${id("rim")})`}
            strokeWidth="3"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 136 296 C 144 326, 158 350, 178 362 C 196 372, 224 372, 242 362 C 262 350, 276 326, 284 296"
            stroke={`url(#${id("rimEdge")})`}
            strokeWidth="2.4"
            fill="none"
            opacity="0.7"
          />
        </g>

        {/* ===================== 3. CABEZA (inclinación orgánica) ===================== */}
        <g transform={`rotate(${headTilt} 210 285)`}>
          {/* Cuello esquelético sombreado */}
          <path d={NECK_D} fill={skin.lo} opacity="0.75" />

          {/* Rostro pálido esculpido */}
          <path d={FACE_D} fill={`url(#${id("skin")})`} stroke={skin.deep} strokeWidth="1.4" />

          {/* Sombreado de pómulos (huecos marcados) */}
          <path
            d="M 162 234 C 170 252, 186 262, 198 262 C 184 268, 170 264, 163 246 Z"
            fill={`url(#${id("skinShadow")})`}
            opacity="0.55"
          />
          <path
            d="M 258 234 C 250 252, 234 262, 222 262 C 236 268, 250 264, 257 246 Z"
            fill={`url(#${id("skinShadow")})`}
            opacity="0.55"
          />
          {/* Huecos bajo los pómulos (demacrado) */}
          <path
            d="M 170 274 C 180 288, 192 294, 202 292 C 190 298, 178 294, 172 280 Z"
            fill={skin.deep}
            opacity="0.35"
          />
          <path
            d="M 250 274 C 240 288, 228 294, 218 292 C 230 298, 242 294, 248 280 Z"
            fill={skin.deep}
            opacity="0.35"
          />
          {/* Sienes hundidas */}
          <path
            d="M 168 190 C 161 204, 159 220, 164 236 C 158 218, 159 202, 168 190 Z"
            fill={skin.lo}
            opacity="0.5"
          />
          <path
            d="M 252 190 C 259 204, 261 220, 256 236 C 262 218, 261 202, 252 190 Z"
            fill={skin.lo}
            opacity="0.5"
          />

          {/* Cuencas oculares profundas */}
          <path d={LEFT_SOCKET_D} fill="#07080A" />
          <path d={RIGHT_SOCKET_D} fill="#07080A" />

          {/* Sombra del arco superciliar */}
          <path
            d="M 156 197 C 164 189, 176 185, 190 185"
            stroke="#0A0B0E"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 264 197 C 256 189, 244 185, 230 185"
            stroke="#0A0B0E"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Ojeras negras hondas */}
          <path d={LEFT_BAG_D} fill={`url(#${id("skinShadow")})`} opacity="0.85" />
          <path d={RIGHT_BAG_D} fill={`url(#${id("skinShadow")})`} opacity="0.85" />

          {/* Ojos abiertos sin párpados */}
          <g opacity={eyeGlint}>
            <path d={LEFT_EYE_D} fill={eyeWhite} />
            <path d={RIGHT_EYE_D} fill={eyeWhite} />
            {/* Pupilas diminutas fijas */}
            <circle cx="180" cy="204" r="2.5" fill="#060607" />
            <circle cx="240" cy="204" r="2.5" fill="#060607" />
            {/* Brillo frío sutil */}
            <circle cx="177.5" cy="201.5" r="1.4" fill={rimColor} opacity="0.9" />
            <circle cx="237.5" cy="201.5" r="1.4" fill={rimColor} opacity="0.9" />
            {/* Vasos sanguíneos (ojos irritados, sin párpados) */}
            <path
              d="M 162 213 C 168 215, 174 215, 180 213"
              stroke="#C23B3B"
              strokeWidth="1"
              fill="none"
              opacity={0.25 + crimson * 0.55}
            />
            <path
              d="M 258 213 C 252 215, 246 215, 240 213"
              stroke="#C23B3B"
              strokeWidth="1"
              fill="none"
              opacity={0.25 + crimson * 0.55}
            />
            {/* Reborde inferior irritado */}
            <path
              d="M 163 217 C 170 221, 182 222, 190 218"
              stroke="#8A2A2A"
              strokeWidth="1.4"
              fill="none"
              opacity={0.2 + crimson * 0.4}
            />
            <path
              d="M 257 217 C 250 221, 238 222, 230 218"
              stroke="#8A2A2A"
              strokeWidth="1.4"
              fill="none"
              opacity={0.2 + crimson * 0.4}
            />
          </g>

          {/* Nariz sombreada */}
          <path d={NOSE_D} fill={skin.lo} opacity="0.55" />
          <path
            d="M 207 230 C 205 240, 204 248, 205 256"
            stroke={skin.deep}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Fosas nasales */}
          <path
            d="M 201 252 C 204 254, 208 254, 210 251 C 208 255, 204 255, 201 252 Z"
            fill={skin.deep}
            opacity="0.8"
          />
          <path
            d="M 221 252 C 218 254, 214 254, 212 251 C 214 255, 218 255, 221 252 Z"
            fill={skin.deep}
            opacity="0.8"
          />

          {/* Sonrisa cortada ancha, delgada y tensa */}
          <path d={MOUTH_D} fill="#0A0506" stroke="#1A0809" strokeWidth="1.2" />
          {/* Línea superior del corte */}
          <path
            d="M 152 286 C 174 293, 246 293, 268 286"
            stroke="#240A0C"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Dientes apenas insinuados como hilera fina y sombreada */}
          <path
            d="M 174 290 C 192 292, 228 292, 246 290 L 244 295 C 228 298, 192 298, 176 295 Z"
            fill="#B9B4A6"
            opacity="0.28"
          />
          {/* Labio inferior sombreado */}
          <path
            d="M 158 296 C 182 301, 238 301, 262 296"
            stroke="#1A0809"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Cicatrices laterales (Glasgow smile) */}
          <path d={LEFT_SCAR_D} fill="#7F1D1D" opacity={0.5 + crimson * 0.4} />
          <path d={RIGHT_SCAR_D} fill="#7F1D1D" opacity={0.5 + crimson * 0.4} />
          <path
            d="M 152 286 C 146 278, 140 269, 133 259"
            stroke="#8A2A2A"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity={0.5 + crimson * 0.4}
          />
          <path
            d="M 268 286 C 274 278, 280 269, 287 259"
            stroke="#8A2A2A"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity={0.5 + crimson * 0.4}
          />

          {/* Luz de borde del rostro (rim light izquierdo) */}
          <path
            d="M 166 182 C 164 158, 172 144, 192 141"
            stroke={`url(#${id("rimEdge")})`}
            strokeWidth="2.2"
            fill="none"
            opacity="0.65"
          />
        </g>

        {/* ===================== 4. CABELLO (mechones afilados, balanceo desfasado) ===================== */}
        <g transform={`rotate(${headTilt} 210 285)`}>
          {/* Masa base del cabello */}
          <path d={HAIR_BASE_D} fill={`url(#${id("hair")})`} stroke="#040507" strokeWidth="1" />

          {/* Mechones orgánicos afilados */}
          {HAIR_STRANDS.map((s, i) => {
            const sway = Math.sin(frame * 0.05 + s.phase) * 2.2;
            return (
              <g
                key={i}
                style={{
                  transformOrigin: `${s.ox}px ${s.oy}px`,
                  transform: `rotate(${sway}deg)`,
                }}
              >
                <path d={s.d} fill={`url(#${id("hair")})`} stroke="#040507" strokeWidth="0.6" />
              </g>
            );
          })}

          {/* Brillos tenues del cabello (reflejo frío) */}
          <path
            d="M 184 116 C 188 132, 194 148, 200 162"
            stroke={rimColor}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.14"
          />
          <path
            d="M 226 118 C 232 134, 238 150, 246 164"
            stroke={rimColor}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.1"
          />
        </g>

        {/* ===================== Resplandor carmesí ambiental ===================== */}
        <g pointerEvents="none" opacity={crimson * crimsonPulse}>
          <ellipse
            cx="210"
            cy="252"
            rx="120"
            ry="100"
            fill={`url(#${id("crimson")})`}
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d="M 152 286 C 174 294, 246 294, 268 286"
            stroke="#DC2626"
            strokeWidth="5"
            fill="none"
            opacity="0.2"
            filter={`url(#${id("blur")})`}
          />
        </g>
      </svg>
    </div>
  );
};
