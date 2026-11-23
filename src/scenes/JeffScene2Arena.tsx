import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DustSporesLayer,
  ForegroundVignette,
  MistLayer,
} from "../components/Atmosphere25D";
import { ForestParallax25D } from "../components/ForestParallax25D";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";
import { JeffCharacter } from "../components/characters/JeffCharacter";
import { SlenderCharacter } from "../components/characters/SlenderCharacter";
import { HumanSilhouette } from "../components/characters/HumanSilhouette";

/**
 * JeffScene2Arena (frames 395–911 · 13.17–30.37s)
 * Juegos indie, YouTube y rivalidad con Slenderman.
 *
 * Escenario 2.5D ancho enlazado por un pan lateral suave hacia la mitad:
 *  - Primera mitad (local 0–275): HumanSilhouette gamer con audífonos
 *    reaccionando con sobresalto (spring) frente a un jumpscare estilizado
 *    en un monitor retro + tarjeta "Indie Horror · Fiebre en YouTube".
 *  - Segunda mitad (local 260–516): pan lateral suave hacia un bosque brumoso
 *    2.5D revelando el cara a cara JeffCharacter (izq) vs SlenderCharacter
 *    (der, tentáculos ondulando) + tarjeta "JEFF vs SLENDERMAN".
 *
 * Movimiento de cámara único: pan lateral suave continuo, cero shake periódico.
 */

const STAGE_WIDTH = 2160;
const PAN_START = 260;
const PAN_END = 340;
const STARTLE_FRAME = 150;

export const JeffScene2Arena: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pan lateral suave: quieto en la primera mitad, desliza a la segunda.
  const panProg = interpolate(frame, [PAN_START, PAN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const panX = -(STAGE_WIDTH - 1080) * panProg;

  // Sobresalto del gamer (spring) frente al jumpscare.
  const scare = spring({
    frame: frame - STARTLE_FRAME,
    fps,
    config: { damping: 9, stiffness: 140, mass: 0.8 },
  });

  // Rostro fantasmal del jumpscare: visible desde el inicio y crece hasta el sobresalto.
  const faceOpacity = interpolate(frame, [20, 110], [0.4, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scareScale = 1 + scare * 0.22;
  const faceGlitch = Math.sin(frame * 1.7) * 0.7 + Math.sin(frame * 0.9) * 0.5;
  // Destello rojo/blanco puntual sincronizado con startleFrame.
  const scareFlash = interpolate(
    frame,
    [STARTLE_FRAME, STARTLE_FRAME + 3, STARTLE_FRAME + 14],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Parpadeo determinista del monitor del gamer.
  const gamerGlow = 0.8 + 0.06 * Math.sin(frame * 0.27) + 0.04 * Math.sin(frame * 0.63);

  // Entrada de la tarjeta.
  const cardIn = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [6, 26], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* Escenario ancho 2.5D enlazado por el pan lateral */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: STAGE_WIDTH,
          height: 1920,
          transform: `translateX(${panX}px)`,
        }}
      >
        {/* ============ SET A (x 0–1080): gamer + jumpscare ============ */}
        <div style={{ position: "absolute", left: 0, width: 1080, height: 1920, overflow: "hidden" }}>
          {/* Fondo de la habitación gamer */}
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, #0A1014 0%, #060A0E 52%, #040507 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 42% 46%, rgba(14, 58, 74, 0.5) 0%, transparent 60%)",
            }}
          />

          {/* Monitor retro con jumpscare */}
          <div
            style={{ position: "absolute", left: 110, top: 560, width: 540, height: 440 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 540 440">
              <defs>
                <linearGradient id="s2-bezel" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%" stopColor="#3A454E" />
                  <stop offset="55%" stopColor="#202B33" />
                  <stop offset="100%" stopColor="#0C1218" />
                </linearGradient>
              </defs>
              <path d="M 240 414 L 210 434 L 330 434 L 300 414 Z" fill="#141D24" />
              <rect x="180" y="434" width="180" height="14" rx="6" fill="#1A232C" />
              <rect x="10" y="10" width="520" height="406" rx="24" fill="url(#s2-bezel)" stroke="#0A1014" strokeWidth="3" />
            </svg>

            {/* Pantalla */}
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 24,
                width: 492,
                height: 378,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#050A0E",
              }}
            >
              {/* Pasillo de juego oscuro */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 55%, rgba(24,58,72,0.55) 0%, rgba(4,7,9,0.9) 70%)",
                }}
              />
              {/* Jumpscare estilizado indie horror: rostro fantasmal pálido/carmesí */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 492 378"
                preserveAspectRatio="xMidYMid slice"
                style={{ position: "absolute", inset: 0, opacity: faceOpacity }}
              >
                <defs>
                  <radialGradient id="s2-face" cx="50%" cy="42%" r="62%">
                    <stop offset="0%" stopColor="#F2EFE9" />
                    <stop offset="48%" stopColor="#C9CFD4" />
                    <stop offset="78%" stopColor="#8B9AA6" />
                    <stop offset="100%" stopColor="#4A5560" />
                  </radialGradient>
                  <radialGradient id="s2-eye" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="62%" stopColor="#7F1D1D" />
                    <stop offset="100%" stopColor="#0B0B0E" />
                  </radialGradient>
                  <linearGradient id="s2-grin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B0B0E" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>

                {/* Halo de distorsión / estática trasera */}
                <ellipse cx="246" cy="188" rx="178" ry="150" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="2" opacity="0.5" />
                <ellipse cx="246" cy="188" rx="152" ry="126" fill="none" stroke="rgba(242,239,233,0.16)" strokeWidth="1.5" />

                {/* Rostro fantasmal (glitch lateral sutil + pop de sobresalto) */}
                <g transform={`translate(246 190) scale(${scareScale}) translate(${-246 + faceGlitch} ${-190})`}>
                  <path
                    d="M 246 64 C 196 68 158 118 154 182 C 150 248 190 316 246 328 C 302 316 342 248 338 182 C 334 118 296 68 246 64 Z"
                    fill="url(#s2-face)"
                  />
                  {/* Huecos de mejillas */}
                  <path d="M 182 216 C 194 250 220 268 246 270 C 272 268 298 250 310 216" fill="none" stroke="rgba(74,85,96,0.5)" strokeWidth="3" />
                  {/* Ojos fijos (cuencas + pupila carmesí) */}
                  <ellipse cx="210" cy="178" rx="27" ry="31" fill="#0B0B0E" />
                  <ellipse cx="282" cy="178" rx="27" ry="31" fill="#0B0B0E" />
                  <circle cx="212" cy="182" r="7" fill="url(#s2-eye)" />
                  <circle cx="280" cy="182" r="7" fill="url(#s2-eye)" />
                  {/* Ceño marcado */}
                  <path d="M 183 146 C 197 136 225 138 237 148" stroke="#0B0B0E" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M 309 146 C 295 136 267 138 255 148" stroke="#0B0B0E" strokeWidth="6" fill="none" strokeLinecap="round" />
                  {/* Nariz */}
                  <path d="M 246 188 L 240 216 L 250 220" stroke="rgba(74,85,96,0.7)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  {/* Boca: sonrisa abierta con dientes */}
                  <path d="M 196 252 C 216 288 276 288 296 252 C 284 300 208 300 196 252 Z" fill="url(#s2-grin)" />
                  <path d="M 206 256 C 226 266 266 266 286 256" stroke="#F2EFE9" strokeWidth="3" fill="none" />
                  <path d="M 216 268 L 226 266 M 240 270 L 246 268 M 256 270 L 262 268 M 270 268 L 278 264" stroke="#F2EFE9" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Líneas de estática sobre el rostro */}
                  <path d="M 150 130 L 200 130 M 250 110 L 300 110 M 160 300 L 220 300 M 290 250 L 330 250" stroke="rgba(242,239,233,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </svg>
              {/* Interfaz retro oscura (HUD indie horror) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  fontFamily: FONT_MONO,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.6,
                    color: "#F2EFE9",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      backgroundColor: "#DC2626",
                      boxShadow: "0 0 8px rgba(220,38,38,0.9)",
                    }}
                  />
                  REC
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1.6,
                    color: "rgba(242,239,233,0.75)",
                  }}
                >
                  CH-01 // DISTORSIÓN
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 14,
                    fontSize: 12,
                    letterSpacing: 1.4,
                    color: "rgba(220,38,38,0.85)",
                  }}
                >
                  SYS.ERR · STATIC LEAK
                </div>
              </div>
              {/* Destello rojo/blanco en startleFrame */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.92) 0%, rgba(220,38,38,0.78) 46%, rgba(220,38,38,0) 76%)",
                  mixBlendMode: "screen",
                  opacity: scareFlash,
                  pointerEvents: "none",
                }}
              />
              {/* Scanlines + glow */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(to bottom, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.22) 0%, transparent 60%)",
                  opacity: gamerGlow,
                }}
              />
            </div>
          </div>

          {/* Gamer en primer plano, centrado y completo en la mitad izquierda */}
          <div
            style={{
              position: "absolute",
              left: 420,
              top: 690,
              width: 520,
              height: 588,
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 92%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 74%, rgba(0,0,0,0.4) 92%, transparent 100%)",
            }}
          >
            <HumanSilhouette
              mode="gamer"
              width={520}
              rimColor="#22D3EE"
              startleFrame={STARTLE_FRAME}
            />
          </div>

          {/* Neblina + polvo del set A */}
          <MistLayer tint="rgba(96, 152, 168, 0.12)" opacity={0.7} speed={0.4} yOffset={50} seed={22} />
          <DustSporesLayer count={24} color="#A5D8EA" seed={29} opacity={0.6} minY={260} maxY={1480} />
        </div>

        {/* ============ SET B (x 1080–2160): bosque + Jeff vs Slenderman ============ */}
        <div style={{ position: "absolute", left: 1080, width: 1080, height: 1920, overflow: "hidden" }}>
          <ForestParallax25D cameraZoom={0.4} fogDensity={0.8} redTint={0.16} cameraShake={0.2} />

          {/* Jeff (izquierda) */}
          <div
            style={{
              position: "absolute",
              top: 640,
              left: -60,
              width: 580,
              height: 718,
              transform: `translateX(${panProg * -14}px) scale(${0.92 + panProg * 0.08})`,
              transformOrigin: "48% 45%",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
              filter: "drop-shadow(-8px 0 26px rgba(220,38,38,0.22))",
            }}
          >
            <JeffCharacter
              width={580}
              rimColor="#DC2626"
              crimsonAccent={0.6}
              headTiltBoost={-1}
            />
          </div>

          {/* Slenderman (derecha, tentáculos ondulando) */}
          <div
            style={{
              position: "absolute",
              top: 600,
              right: -80,
              width: 580,
              height: 706,
              transform: `translateX(${panProg * 14}px) scale(${0.92 + panProg * 0.08})`,
              transformOrigin: "52% 45%",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0.4) 88%, transparent 98%)",
              filter: "drop-shadow(8px 0 26px rgba(148,210,238,0.2))",
            }}
          >
            <SlenderCharacter
              width={580}
              rimColor="#38BDF8"
              tentacleIntensity={1.1}
              headTiltBoost={1}
            />
          </div>

          {/* Ceniza del set B */}
          <DustSporesLayer count={30} color="#DC2626" accentColor="#FDE047" seed={47} opacity={0.7} minY={300} maxY={1520} />
        </div>
      </div>

      {/* Viñeta frontal (fija) */}
      <ForegroundVignette
        edgeStrength={0.76}
        topDarkness={0.58}
        bottomDarkness={0.9}
      />

      {/* Tarjeta glassmorphism fija que actualiza su contenido con el pan */}
      <SafeCentered top={356} zIndex={10}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 700,
            padding: "18px 28px",
            borderRadius: 16,
            background: "rgba(8, 13, 20, 0.72)",
            border: "1px solid rgba(242, 239, 233, 0.18)",
            boxShadow:
              "0 16px 46px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            opacity: cardIn,
            transform: `translateY(${cardY}px)`,
          }}
        >
          {/* Contenido superpuesto con crossfade (grid stack) */}
          <div style={{ display: "grid" }}>
          {/* Contenido primera mitad: Indie Horror */}
          <div
            style={{
              gridArea: "1 / 1",
              opacity: 1 - panProg,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontFamily: FONT_SANS,
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: "#F2EFE9",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: "#DC2626",
                  boxShadow: "0 0 14px rgba(220, 38, 38, 0.75)",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                ▶
              </span>
              <span>Indie Horror · Fiebre en YouTube</span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: FONT_MONO,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 2.2,
                color: "rgba(186, 214, 230, 0.8)",
              }}
            >
              ERA DORADA DEL TERROR DIGITAL · 2011–2014
            </div>
          </div>

          {/* Contenido segunda mitad: Jeff vs Slenderman */}
          <div
            style={{
              gridArea: "1 / 1",
              opacity: panProg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                fontFamily: FONT_SANS,
                fontWeight: 900,
                fontSize: 30,
                letterSpacing: 2.5,
              }}
            >
              <span style={{ color: "#F2EFE9" }}>JEFF</span>
              <span
                style={{
                  color: "#DC2626",
                  fontSize: 18,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: "rgba(220, 38, 38, 0.16)",
                  border: "1px solid rgba(220, 38, 38, 0.45)",
                }}
              >
                VS
              </span>
              <span style={{ color: "#FDE047" }}>SLENDERMAN</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: FONT_MONO,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2,
                color: "rgba(186, 214, 230, 0.8)",
              }}
            >
              LA RIVALIDAD DEL TERROR DIGITAL
            </div>
          </div>
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
