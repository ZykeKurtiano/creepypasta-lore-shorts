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
 * JeffScene3Retakes (frames 911–1278 · 30.37–42.60s)
 * Los Retakes Modernos — Acecho nocturno y expediente médico.
 *
 * Capas 2.5D reales (cero <Img>):
 *  1. Dormitorio nocturno en tonos azul frío con ventana en perspectiva 2.5D,
 *     cortinas traslúcidas ondeando y haz de luna en el suelo.
 *  2. JeffCharacter en silueta sombría (shadowMode) acechando tras el cristal.
 *  3. HumanSilhouette (sleeper) respirando suavemente en la cama en primer plano.
 *  4. Expediente médico translúcido estilizado en zona segura con diagramas
 *     anatómicos SVG (piel frágil, capas dérmicas y cicatrices) con luz clínica
 *     fría/carmesí.
 *  5. Neblina, polvo y viñeta frontal.
 *
 * Movimiento de cámara único: avance progresivo lento en eje Z en capas
 * diferenciadas, cero shake periódico.
 */

const SCENE_LEN = SCENES.scene3.end - SCENES.scene3.start;

export const JeffScene3Retakes: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / SCENE_LEN));

  // Avance progresivo lento en eje Z con capas diferenciadas.
  const bgScale = 1 + 0.05 * progress;
  const midScale = 1 + 0.09 * progress;
  const fgScale = 1 + 0.12 * progress;

  // Cortinas ondeando ligeramente.
  const curtainSwayL = Math.sin(frame * 0.03) * 7;
  const curtainSwayR = Math.sin(frame * 0.026 + 1.4) * 6;

  // Aparición progresiva de la silueta tras el cristal.
  const jeffShadowOpacity = interpolate(frame, [10, 60, 170], [0.25, 0.72, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Expediente médico (segunda mitad: local 195–367).
  const medProg = interpolate(frame, [195, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Sub-enfoque: patología genética (local ~280+ = "enfermedad genética").
  const geneticFocus = interpolate(frame, [280, 305], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dossierY = interpolate(frame, [195, 240], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040507", overflow: "hidden" }}>
      {/* 1. Fondo: dormitorio nocturno azul frío (capa Z lejana) */}
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: "50% 42%" }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
          <defs>
            <linearGradient id="s3-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A141E" />
              <stop offset="55%" stopColor="#070D14" />
              <stop offset="100%" stopColor="#04070B" />
            </linearGradient>
            <linearGradient id="s3-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B131C" />
              <stop offset="100%" stopColor="#030507" />
            </linearGradient>
          </defs>
          {/* Pared */}
          <rect x="0" y="0" width="1080" height="1240" fill="url(#s3-wall)" />
          {/* Rodapié */}
          <rect x="0" y="1180" width="1080" height="60" fill="#081019" />
          {/* Suelo */}
          <rect x="0" y="1240" width="1080" height="680" fill="url(#s3-floor)" />
          <path
            d="M 0 1290 L 1080 1290 M 0 1400 L 1080 1410 M 0 1540 L 1080 1580 M 0 1710 L 1080 1780"
            stroke="#0A141E"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </AbsoluteFill>

      {/* Haz de luna en el suelo (desde la ventana) */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 900,
          width: 460,
          height: 760,
          background:
            "linear-gradient(200deg, rgba(186,214,236,0.16) 0%, rgba(186,214,236,0.05) 55%, transparent 85%)",
          transform: "skewX(-8deg)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />

      {/* 2. Ventana en perspectiva + Jeff tras el cristal (capa Z media) */}
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 410,
          width: 420,
          height: 450,
          transform: `scale(${midScale})`,
          transformOrigin: "50% 40%",
        }}
      >
        {/* Marco exterior */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background: "linear-gradient(180deg, #18222B 0%, #0B1219 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 50px rgba(148,190,220,0.10)",
          }}
        />

        {/* Cristal (contenedor con clip) */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: 8,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(24,44,62,0.55) 0%, rgba(8,14,22,0.6) 100%)",
          }}
        >
          {/* Silueta de Jeff acechando tras el cristal */}
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 150,
              width: 400,
              opacity: jeffShadowOpacity,
              filter: "brightness(0.55) contrast(1.2) saturate(0.4)",
            }}
          >
            <JeffCharacter
              width={400}
              rimColor="#6E9FC4"
              crimsonAccent={0.25}
              shadowMode
              headTiltBoost={2}
            />
          </div>

          {/* Cristal azul translúcido sobre la silueta */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(120,160,190,0.22) 0%, rgba(40,70,92,0.16) 60%, rgba(10,20,30,0.28) 100%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Reflejo diagonal del cristal */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: -120,
              width: 220,
              height: 760,
              background:
                "linear-gradient(90deg, rgba(190,220,240,0.16), transparent)",
              transform: "rotate(18deg)",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Crucetas del marco */}
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: "50%",
            height: 6,
            marginTop: -3,
            background: "#101820",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 18,
            bottom: 18,
            left: "50%",
            width: 6,
            marginLeft: -3,
            background: "#101820",
          }}
        />
        {/* Repisa inferior */}
        <div
          style={{
            position: "absolute",
            left: -14,
            right: -14,
            bottom: -20,
            height: 26,
            borderRadius: 4,
            background: "linear-gradient(180deg, #1A242E 0%, #0A1118 100%)",
          }}
        />
      </div>

      {/* Cortinas traslúcidas ondeando (delante de la ventana) */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 320,
          width: 480,
          height: 600,
          pointerEvents: "none",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 480 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="s3-curtain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A3A48" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#121A24" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 0 C 40 120, 30 260, 44 600 L 92 600 C 84 400, 92 200, 88 0 Z`}
            fill="url(#s3-curtain)"
            transform={`translateX(${curtainSwayL}px)`}
          />
          <path
            d={`M 480 0 C 440 120, 450 260, 436 600 L 388 600 C 396 400, 388 200, 392 0 Z`}
            fill="url(#s3-curtain)"
            transform={`translateX(${curtainSwayR}px)`}
          />
          {/* Pliegues de cortina */}
          <path
            d={`M 40 0 C 52 160, 46 320, 52 600`}
            stroke="#3A4A58"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
            transform={`translateX(${curtainSwayL}px)`}
          />
          <path
            d={`M 440 0 C 428 160, 434 320, 428 600`}
            stroke="#3A4A58"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
            transform={`translateX(${curtainSwayR}px)`}
          />
        </svg>
      </div>

      {/* 3. Cama y HumanSilhouette durmiendo (capa Z cercana) */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 540,
          width: 780,
          height: 882,
          transform: `scale(${fgScale})`,
          transformOrigin: "50% 90%",
        }}
      >
        {/* Cama / somier oscuro */}
        <div
          style={{
            position: "absolute",
            left: -20,
            bottom: -30,
            width: 820,
            height: 240,
            borderRadius: "50% 50% 0 0 / 30% 30% 0 0",
            background: "linear-gradient(180deg, #0C141C 0%, #05080C 100%)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
          }}
        />
        <HumanSilhouette mode="sleeper" width={780} rimColor="#AECFE8" />
      </div>

      {/* 4. Neblina y polvo lunar */}
      <MistLayer tint="rgba(162, 194, 218, 0.13)" opacity={0.9} speed={0.35} yOffset={100} seed={33} />
      <DustSporesLayer count={26} color="#DCEAF5" seed={41} opacity={0.7} minY={260} maxY={1460} />

      {/* Viñeta frontal */}
      <ForegroundVignette
        edgeStrength={0.82}
        topDarkness={0.62}
        bottomDarkness={0.9}
      />

      {/* 5. Expediente médico translúcido en zona segura (top 356) */}
      <SafeCentered top={356} zIndex={10}>
        <div
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 710,
            padding: "18px 26px",
            borderRadius: 14,
            background: "rgba(9, 14, 20, 0.78)",
            border: "1px solid rgba(186, 214, 235, 0.24)",
            boxShadow:
              "0 18px 48px rgba(0,0,0,0.7), 0 0 40px rgba(127,29,29,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)",
            opacity: medProg,
            transform: `translateY(${dossierY}px) scale(${0.96 + medProg * 0.04})`,
          }}
        >
          {/* Cabecera clínica */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: FONT_MONO,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 2.4,
              color: "#F87171",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(220, 38, 38, 0.18)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
              }}
            >
              ✚ EXPEDIENTE
            </span>
            <span style={{ color: "rgba(186, 214, 235, 0.75)" }}>
              CASE-FILE // REVISIÓN MODERNA
            </span>
          </div>

          {/* Título principal */}
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_SANS,
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#F2EFE9",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            Retakes Modernos · Realismo &amp; Origen Genético
          </div>

          {/* Diagrama anatómico SVG de capas dérmicas y cicatrices */}
          <svg
            width="100%"
            height="150"
            viewBox="0 0 660 150"
            style={{ marginTop: 14 }}
          >
            <defs>
              <linearGradient id="s3-epidermis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B9C7D6" />
                <stop offset="100%" stopColor="#7C8B9B" />
              </linearGradient>
              <linearGradient id="s3-dermis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5560" />
                <stop offset="100%" stopColor="#5C2A33" />
              </linearGradient>
              <linearGradient id="s3-hypo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A3A3E" />
                <stop offset="100%" stopColor="#231A1D" />
              </linearGradient>
            </defs>

            {/* Etiquetas clínicas */}
            <text x="12" y="30" fill="#9FB4C8" fontSize="15" fontFamily={FONT_MONO} letterSpacing="1.5">EPIDERMIS</text>
            <text x="12" y="78" fill="#E7A8B0" fontSize="15" fontFamily={FONT_MONO} letterSpacing="1.5">DERMIS</text>
            <text x="12" y="126" fill="#C08B92" fontSize="15" fontFamily={FONT_MONO} letterSpacing="1.5">HIPODERMIS</text>

            {/* Capas */}
            <rect x="150" y="16" width="470" height="22" rx="4" fill="url(#s3-epidermis)" opacity={0.9 + geneticFocus * 0.08} />
            <rect x="150" y="62" width="470" height="24" rx="4" fill="url(#s3-dermis)" opacity={0.9 + geneticFocus * 0.08} />
            <rect x="150" y="110" width="470" height="22" rx="4" fill="url(#s3-hypo)" opacity={0.9 + geneticFocus * 0.08} />

            {/* Fibras de colágeno */}
            <path d="M 180 74 C 220 78, 250 70, 300 74 M 340 74 C 390 78, 420 70, 470 74 M 500 74 C 540 78, 580 70, 610 74" stroke="#E7A8B0" strokeWidth="1.6" fill="none" opacity="0.5" />

            {/* Cicatrices iluminadas (luz clínica carmesí) */}
            <path d="M 230 16 L 236 38" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            <path d="M 300 38 L 308 16" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            <path d="M 420 16 L 414 38" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            <path d="M 520 38 L 528 16" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />

            {/* Marcador de luz clínica fría */}
            <ellipse cx="330" cy="74" rx="240" ry="70" fill="rgba(148,210,238,0.06)" />
          </svg>

          {/* Indicador de sub-enfoque sincronizado con el guion */}
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "center",
              gap: 16,
              fontFamily: FONT_MONO,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background:
                  medProg < 0.35
                    ? "rgba(220, 38, 38, 0.22)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  medProg < 0.35
                    ? "1px solid rgba(220, 38, 38, 0.55)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                color: medProg < 0.35 ? "#F2EFE9" : "rgba(186, 214, 235, 0.55)",
              }}
            >
              01 · ACOSO REAL
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background:
                  medProg >= 0.35
                    ? "rgba(253, 224, 71, 0.16)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  medProg >= 0.35
                    ? "1px solid rgba(253, 224, 71, 0.55)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                color: medProg >= 0.35 ? "#FDE047" : "rgba(186, 214, 235, 0.55)",
              }}
            >
              02 · PATOLOGÍA GENÉTICA
            </span>
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
