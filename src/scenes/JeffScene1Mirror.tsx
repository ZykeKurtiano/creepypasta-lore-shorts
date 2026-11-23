import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  DustSporesLayer,
  ForegroundVignette,
  MistLayer,
} from "../components/Atmosphere25D";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";
import { JeffCharacter } from "../components/characters/JeffCharacter";
import { HumanSilhouette } from "../components/characters/HumanSilhouette";
import { SCENES } from "../data/episodeConfig";

/**
 * JeffScene1Mirror (frames 0–395 · 0.00–13.17s)
 * El misterio de 2008 — Cuarto oscuro, CRT retro y el investigador.
 *
 * Capas 2.5D reales (cero <Img> de public/art):
 *  1. Paredes con gradiente profundo y suelo en perspectiva 2.5D.
 *  2. Escritorio vectorial con vetas de madera y cajón.
 *  3. Monitor CRT retro encendido con resplandor azul-cian, scanlines y
 *     archivo corrupto en pantalla ("2008 · NEWGROUNDS // FOTO ORIGINAL:
 *     NO ENCONTRADA").
 *  4. JeffCharacter emergiendo fantasmagóricamente en/tras el resplandor
 *     azul entre interferencias sutiles.
 *  5. HumanSilhouette (investigador) en primer plano tecleando e inclinando
 *     la cabeza hacia el brillo del CRT.
 *  6. Tarjeta glassmorphism centrada en SafeCentered top=356.
 *  7. Neblina, polvo y viñeta frontal.
 *
 * Movimiento de cámara único: dolly-in lento y continuo (scale 1.00 → 1.09),
 * cero shake periódico.
 */

const SCENE_LEN = SCENES.scene1.end - SCENES.scene1.start;

export const JeffScene1Mirror: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Única intención de cámara: dolly-in lento y continuo.
  const cameraScale = interpolate(progress, [0, 1], [1.0, 1.09], {
    easing: Easing.out(Easing.quad),
  });

  // Parpadeo determinista del fósforo del CRT (amplitud baja, no es shake).
  const crtGlow =
    0.82 + 0.07 * Math.sin(frame * 0.23) + 0.05 * Math.sin(frame * 0.71 + 1.3);

  // Aparición fantasmagórica de Jeff en/tras el resplandor azul.
  const jeffGhost = interpolate(frame, [110, 185, 300, 385], [0, 0.5, 0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const jeffRise = interpolate(frame, [110, 320], [58, -16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Banda de interferencia que recorre la pantalla (motivo puntual, sin loop).
  const tearY = interpolate(frame, [0, SCENE_LEN], [170, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tearOpacity = 0.08 + 0.09 * Math.max(0, Math.sin(frame * 0.16 + 0.4));

  // Entrada de la tarjeta glassmorphism.
  const cardIn = interpolate(frame, [8, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [8, 30], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* Cámara: dolly-in lento y continuo */}
      <AbsoluteFill
        style={{ transform: `scale(${cameraScale})`, transformOrigin: "50% 46%" }}
      >
        {/* 1. Paredes con gradiente profundo y suelo en perspectiva */}
        <AbsoluteFill>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1080 1920"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="s1-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A1014" />
                <stop offset="55%" stopColor="#060A0E" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>
              <linearGradient id="s1-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B0F13" />
                <stop offset="100%" stopColor="#030405" />
              </linearGradient>
              <radialGradient id="s1-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0E232E" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0E232E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Pared */}
            <rect x="0" y="0" width="1080" height="1180" fill="url(#s1-wall)" />
            {/* Halo cian tenue tras el monitor */}
            <ellipse cx="420" cy="700" rx="460" ry="560" fill="url(#s1-halo)" opacity="0.7" />
            {/* Zócalo de panel */}
            <rect x="0" y="1120" width="1080" height="60" fill="#081016" />
            <rect x="0" y="1118" width="1080" height="3" fill="#162129" opacity="0.7" />
            {/* Suelo en fuga */}
            <rect x="0" y="1180" width="1080" height="740" fill="url(#s1-floor)" />
            <path
              d="M 0 1200 L 1080 1200 M 0 1270 L 1080 1290 M 0 1360 L 1080 1400 M 0 1490 L 1080 1550"
              stroke="#0A1218"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M 540 1180 L 430 1920 M 540 1180 L 620 1920 M 540 1180 L 720 1920 M 540 1180 L 300 1920"
              stroke="#081016"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </AbsoluteFill>

        {/* 2. Escritorio vectorial (tablero + panel frontal con vetas + cajón) */}
        <div
          style={{ position: "absolute", left: 0, right: 0, top: 940, height: 430 }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1080 430"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="s1-desk-top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A232C" />
                <stop offset="100%" stopColor="#0C1218" />
              </linearGradient>
              <linearGradient id="s1-desk-front" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E161D" />
                <stop offset="100%" stopColor="#05070B" />
              </linearGradient>
            </defs>
            {/* Tablero */}
            <path d="M 0 60 L 1080 60 L 1080 132 L 0 132 Z" fill="url(#s1-desk-top)" />
            <path d="M 0 60 L 1080 60" stroke="#2B3A42" strokeWidth="2" opacity="0.5" />
            {/* Panel frontal */}
            <rect x="0" y="132" width="1080" height="298" fill="url(#s1-desk-front)" />
            {/* Vetas de madera */}
            <path
              d="M 60 190 C 200 180, 420 200, 620 190 C 780 182, 900 196, 1020 188"
              stroke="#0A1218"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 40 250 C 260 244, 520 258, 800 246 C 900 242, 980 250, 1040 246"
              stroke="#0A1218"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M 120 320 C 320 314, 620 324, 900 316"
              stroke="#0A1218"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            {/* Cajón */}
            <rect x="660" y="200" width="300" height="140" rx="8" fill="#0A1118" stroke="#1A232C" strokeWidth="2" />
            <rect x="720" y="256" width="180" height="8" rx="4" fill="#2B3A42" opacity="0.7" />
          </svg>
        </div>

        {/* 3. Monitor CRT retro encendido */}
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 470,
            width: 560,
            height: 480,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 560 480">
            <defs>
              <linearGradient id="s1-bezel" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#3A454E" />
                <stop offset="55%" stopColor="#202B33" />
                <stop offset="100%" stopColor="#0C1218" />
              </linearGradient>
              <linearGradient id="s1-screen" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#0B1820" />
                <stop offset="100%" stopColor="#050A0E" />
              </linearGradient>
            </defs>
            {/* Cuello y peana */}
            <path d="M 248 452 L 214 478 L 346 478 L 312 452 Z" fill="#141D24" />
            <rect x="180" y="478" width="200" height="16" rx="6" fill="#1A232C" />
            {/* Carcasa del monitor */}
            <rect x="10" y="10" width="540" height="444" rx="26" fill="url(#s1-bezel)" stroke="#0A1014" strokeWidth="3" />
            <rect x="24" y="24" width="512" height="416" rx="14" fill="#0A0F13" />
            {/* Marco interior con tornillos */}
            <circle cx="40" cy="420" r="3" fill="#10171D" />
            <circle cx="520" cy="420" r="3" fill="#10171D" />
            <circle cx="40" cy="44" r="3" fill="#10171D" />
            <circle cx="520" cy="44" r="3" fill="#10171D" />
          </svg>

          {/* Pantalla (clip) */}
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 34,
              width: 492,
              height: 396,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#050A0E",
            }}
          >
            {/* Resplandor azul-cian del fósforo */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.30) 0%, rgba(14,58,74,0.18) 46%, rgba(4,7,9,0.6) 100%)",
                opacity: crtGlow,
              }}
            />
            {/* Scanlines del CRT */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
                opacity: 0.7,
              }}
            />

            {/* Archivo corrupto en pantalla */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 20px",
                fontFamily: FONT_MONO,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 2,
                  color: "rgba(120,220,238,0.85)",
                  textShadow: "0 0 8px rgba(34,211,238,0.7)",
                  marginBottom: 8,
                }}
              >
                ── FILE://IMG_2008.JPG ──
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  color: "rgba(242,239,233,0.92)",
                  textShadow: "0 0 10px rgba(34,211,238,0.6)",
                }}
              >
                2008 · NEWGROUNDS
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#DC2626",
                  textShadow: "0 0 10px rgba(220,38,38,0.7)",
                }}
              >
                FOTO ORIGINAL: NO ENCONTRADA
              </div>
              {/* Barra de progreso corrupta */}
              <div
                style={{
                  marginTop: 14,
                  width: "78%",
                  height: 4,
                  background: "rgba(242,239,233,0.14)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${24 + 46 * progress}%`,
                    height: "100%",
                    background: "#22D3EE",
                    boxShadow: "0 0 8px rgba(34,211,238,0.8)",
                  }}
                />
              </div>
            </div>

            {/* Jeff fantasmagórico EN la pantalla (clipado, rostro grande) */}
            <div
              style={{
                position: "absolute",
                left: -40,
                top: -70,
                width: 580,
                opacity: jeffGhost * 0.5,
                mixBlendMode: "screen",
                filter: "contrast(1.2) saturate(0.75)",
              }}
            >
              <JeffCharacter
                width={580}
                scale={1.12}
                rimColor="#22D3EE"
                crimsonAccent={0.55}
                shadowMode={false}
              />
            </div>

            {/* Banda de interferencia horizontal */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: tearY % 396,
                height: 10,
                background:
                  "linear-gradient(90deg, transparent, rgba(34,211,238,0.7), transparent)",
                opacity: tearOpacity,
                mixBlendMode: "screen",
              }}
            />
          </div>
        </div>

        {/* 4. JeffCharacter emergiendo tras el resplandor azul (plano medio Z) */}
        <div
          style={{
            position: "absolute",
            left: 175,
            top: 430 + jeffRise,
            width: 540,
            height: 669,
            opacity: jeffGhost * 0.85,
            transform: `scale(${0.86 + jeffGhost * 0.14})`,
            transformOrigin: "50% 100%",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 98%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 98%)",
            filter:
              "brightness(0.9) contrast(1.16) drop-shadow(0 0 34px rgba(34,211,238,0.35))",
          }}
        >
          <JeffCharacter
            width={540}
            rimColor="#22D3EE"
            crimsonAccent={0.4}
            headTiltBoost={-2}
          />
        </div>

        {/* 5. HumanSilhouette investigador en primer plano (tecleando, inclinado al CRT) */}
        <div
          style={{
            position: "absolute",
            left: 430,
            top: 560,
            width: 620,
            height: 701,
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.4) 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.4) 90%, transparent 100%)",
          }}
        >
          <HumanSilhouette mode="investigator" width={620} rimColor="#22D3EE" />
        </div>

        {/* 6. Neblina atmosférica */}
        <MistLayer
          tint="rgba(96, 152, 168, 0.14)"
          opacity={0.8}
          speed={0.42}
          yOffset={40}
          seed={1}
        />

        {/* 7. Polvo iluminado por el resplandor */}
        <DustSporesLayer
          count={26}
          color="#BFE3EE"
          seed={11}
          opacity={0.72}
          minY={220}
          maxY={1460}
        />
      </AbsoluteFill>

      {/* Viñeta frontal (fija) */}
      <ForegroundVignette
        edgeStrength={0.78}
        topDarkness={0.56}
        bottomDarkness={0.88}
      />

      {/* 8. Tarjeta glassmorphism centrada en zona segura (top 356) */}
      <SafeCentered top={356} zIndex={10}>
        <div
          style={{
            display: "inline-block",
            maxWidth: 740,
            padding: "16px 28px",
            borderRadius: 16,
            background: "rgba(6, 10, 14, 0.74)",
            border: "1px solid rgba(242, 239, 233, 0.18)",
            boxShadow:
              "0 16px 46px rgba(0, 0, 0, 0.65), 0 0 26px rgba(34, 211, 238, 0.12)",
            backdropFilter: "blur(10px)",
            opacity: cardIn,
            transform: `translateY(${cardY}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontFamily: FONT_MONO,
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: "#F2EFE9",
              textShadow: "0 1px 8px rgba(0,0,0,0.85)",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                backgroundColor: "#DC2626",
                boxShadow: "0 0 12px rgba(220,38,38,0.9)",
                flexShrink: 0,
              }}
            />
            <span>
              <span style={{ color: "#FDE047" }}>2008</span> · NEWGROUNDS
            </span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_MONO,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#DC2626",
              textShadow: "0 0 12px rgba(220,38,38,0.55)",
            }}
          >
            FOTO ORIGINAL: NO ENCONTRADA
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 3.5,
              color: "rgba(191, 215, 228, 0.72)",
              textTransform: "uppercase",
            }}
          >
            Origen del mito digital
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
