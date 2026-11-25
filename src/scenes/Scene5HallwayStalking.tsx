import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
} from "remotion";
import { GamerCharacter } from "../components/characters/GamerCharacter";
import { TailsDollCharacter } from "../components/characters/TailsDollCharacter";
import { CamKey, cameraAt, cameraTransform } from "./camera";

/**
 * Scene5HallwayStalking (frames locales 0–142 · 4.73s).
 *
 * El acecho en casa: la figura cosida aparece entre la rendija de una puerta
 * semiabierta mientras el investigador intenta cerrarla a empujones.
 *
 *  - Fase A (0–14): emerge del Doorway Zoom-Through hacia el pasillo.
 *  - Fase B (14–66): Plano General → Plano Medio (1.0x → 1.45x) cuerpo
 *    completo del investigador retrocediendo/empujando, piernas y tenis con
 *    rim light 360° anclados a floorY=1210.
 *  - Fase C (66–128): Macro-Zoom (2.75x) directo a la rendija de la puerta
 *    (transformOrigin en Tails Doll): costuras en cruz, ojos negros vacíos y
 *    gema roja ardiendo mientras avanza un paso flotante.
 *  - Transición (128–142): Flash de Gema Roja con Zoom-Out Diagonal que abre
 *    la pantalla dividida de la Escena 6 (overlay en SceneTransitions).
 */

// --- Cámara -----------------------------------------------------------------

const CAM_KEYS: CamKey[] = [
  { f: 0, s: 1.3, x: 540, y: 900 },
  { f: 14, s: 1.0, x: 540, y: 980 },
  { f: 66, s: 1.45, x: 560, y: 950 },
  { f: 128, s: 2.75, x: 395, y: 760 },
  { f: 142, s: 2.8, x: 395, y: 760 },
];

// --- Partículas carmesí deterministas --------------------------------------

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  x: 360 + random(i * 3 + 1) * 90,
  y0: 620 + random(i * 7 + 2) * 320,
  r: 1.5 + random(i * 5 + 3) * 2.2,
  speed: 0.3 + random(i * 9 + 4) * 0.5,
  phase: random(i * 13 + 5) * 400,
}));

export const Scene5HallwayStalking: React.FC = () => {
  const frame = useCurrentFrame();

  const cam = cameraAt(frame, CAM_KEYS);
  const swayX = Math.sin(frame * 0.008) * 3 + Math.sin(frame * 0.0037 + 1.3) * 2;
  const swayY = Math.cos(frame * 0.006) * 2.4 + Math.sin(frame * 0.0041 + 0.8) * 1.6;

  // Emergencia del Doorway Zoom-Through (0–14).
  const emerge = interpolate(frame, [0, 14], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Intensidad de la gema roja (sube de 1.0 a 1.6).
  const gemIntensity = interpolate(frame, [14, 128], [1.0, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rim light: mezcla de luz lunar cian → luz roja de la rendija.
  const rimColor = interpolateColors(frame, [14, 110], ["#22D3EE", "#DC2626"]);

  // Resplandor rojo de la rendija (crece con la gema).
  const slitGlow = interpolate(frame, [14, 128], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Neblina baja arrastrándose.
  const fogDrift = Math.sin(frame * 0.02) * 20;

  // Luz lunar parpadeante de la ventana.
  const moonPulse = 0.6 + 0.3 * Math.sin(frame * 0.5);

  // Caminata de retroceso/empuje (walkPhase).
  const walkPhase = frame * 0.06;

  // TailsDoll avanza un paso flotante hacia la cámara (66–128).
  const dollAdvance = interpolate(frame, [66, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Objetivos de mano IK (local) sobre la madera frontal de la hoja de la puerta
  // (mundo x≈470, alturas y≈720 y y≈810).
  const handTargetL = { x: -38, y: 318 };
  const handTargetR = { x: -38, y: 430 };

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#040507" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: cameraTransform(cam, swayX, swayY),
          transformOrigin: "0 0",
        }}
      >
        {/* ============================ BACKGROUND ============================ */}
        {/* Pasillo en perspectiva profunda */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #05070A 0%, #0A1014 40%, #10171E 74%, #040507 100%)",
          }}
        />
        {/* Paredes laterales en fuga */}
        <div
          style={{
            position: "absolute",
            top: 360,
            left: -80,
            width: 360,
            height: 900,
            background: "linear-gradient(165deg, #0B1116, #05070B)",
            transform: "skewY(6deg)",
            borderRight: "1px solid rgba(140,170,200,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 360,
            right: -80,
            width: 360,
            height: 900,
            background: "linear-gradient(195deg, #0B1116, #05070B)",
            transform: "skewY(-6deg)",
            borderLeft: "1px solid rgba(140,170,200,0.05)",
          }}
        />
        {/* Papel tapiz oscuro descolorido */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, rgba(70,60,60,0.06) 0px, rgba(70,60,60,0.06) 2px, transparent 2px, transparent 44px)",
            opacity: 0.7,
          }}
        />

        {/* Cuadro torcido en la pared */}
        <div
          style={{
            position: "absolute",
            top: 430,
            left: 620,
            width: 150,
            height: 190,
            background: "linear-gradient(180deg, #241A12, #170F0A)",
            border: "4px solid #0A0E13",
            transform: "rotate(-6deg)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 14,
              background:
                "radial-gradient(circle at 50% 40%, rgba(34,211,238,0.25), transparent 65%)",
            }}
          />
        </div>

        {/* Ventana al fondo con luz lunar azulada */}
        <div
          style={{
            position: "absolute",
            top: 480,
            left: 470,
            width: 150,
            height: 230,
            borderRadius: 6,
            background:
              "linear-gradient(180deg, #0A1424 0%, #0E1E30 55%, #123048 100%)",
            border: "3px solid rgba(140,170,200,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 30,
              right: 26,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "rgba(190,220,245,0.4)",
              filter: "blur(2px)",
              opacity: moonPulse,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 60% 30%, rgba(34,211,238,0.22), transparent 70%)",
            }}
          />
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 26 + i * 30,
                width: 7,
                background: "rgba(8,12,18,0.9)",
              }}
            />
          ))}
        </div>

        {/* Haz de luz lunar sobre el pasillo */}
        <div
          style={{
            position: "absolute",
            top: 380,
            left: 320,
            width: 460,
            height: 900,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.16), transparent 68%)",
            opacity: moonPulse,
          }}
        />

        {/* Suelo de tablas + floorY */}
        <div
          style={{
            position: "absolute",
            top: 1210,
            left: 0,
            right: 0,
            height: 710,
            background: "linear-gradient(180deg, #171E26 0%, #0A0F14 40%, #040507 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 1210,
            left: 0,
            right: 0,
            height: 60,
            background:
              "repeating-linear-gradient(90deg, #202B35 0px, #202B35 70px, #162129 70px, #162129 140px)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 1206,
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(150,180,210,0.10)",
          }}
        />

        {/* ============================ MIDGROUND · PUERTA ============================ */}
        {/* Marco de la puerta */}
        <div style={{ position: "absolute", top: 380, left: 330, width: 260, height: 830 }}>
          {/* Poste izquierdo */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 20,
              background: "linear-gradient(180deg, #1A130E, #0D0906)",
              borderRadius: 2,
            }}
          />
          {/* Poste derecho */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 20,
              background: "linear-gradient(180deg, #1A130E, #0D0906)",
              borderRadius: 2,
            }}
          />
          {/* Dintel */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 22,
              background: "linear-gradient(180deg, #1A130E, #0D0906)",
              borderRadius: 2,
            }}
          />

          {/* Rendija vertical oscura con resplandor rojo (dintel → floorY=1210) */}
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 20,
              width: 90,
              height: 808,
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(220,38,38,0.55), rgba(127,29,29,0.35) 55%, #020306 100%)",
              opacity: slitGlow,
              overflow: "hidden",
            }}
          >
            {/* Tails Doll asomando la cabeza cosida por la rendija */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${dollAdvance * 20}px)`,
              }}
            >
              <TailsDollCharacter
                x={45}
                y={404}
                scale={0.55}
                mode="plush"
                gemIntensity={gemIntensity}
                hoverAmp={0.5}
                headTiltDeg={-14}
                rimColor="#DC2626"
              />
            </div>
          </div>

          {/* Hoja de la puerta semiabierta (hacia la derecha) */}
          <div
            style={{
              position: "absolute",
              top: 30,
              right: 20,
              width: 120,
              height: 800,
              background: "linear-gradient(180deg, #2A1F14 0%, #1B120A 100%)",
              transform: "skewY(2deg)",
              transformOrigin: "left top",
              border: "1px solid rgba(120,90,60,0.3)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            {/* Molduras de la hoja */}
            <div
              style={{
                position: "absolute",
                inset: 14,
                border: "2px solid rgba(120,90,60,0.22)",
                borderRadius: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: 12,
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#3A2A1A",
                border: "2px solid rgba(120,90,60,0.3)",
              }}
            />
            {/* Resplandor rojo bañando el borde de la puerta */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(220,38,38,0.35), transparent 70%)",
                opacity: slitGlow,
              }}
            />
          </div>
        </div>

        {/* ============================ GAMER (capas Z) ============================ */}
        {/* Cuerpo + brazo trasero */}
        <GamerCharacter
          x={660}
          floorY={1210}
          scale={0.8}
          pose="pushing_door"
          walkPhase={walkPhase}
          expression={{ emotion: "paranoia", intensity: 1, gazeX: -0.9, gazeY: 0.05 }}
          leftHandTarget={handTargetL}
          renderLayer="body_and_back_arm"
          rimColor={rimColor}
          rimStrength={1.35}
          outfit="investigator"
          showFloorShadow
        />

        {/* Brazo frontal (delante de la puerta, nunca la atraviesa) */}
        <GamerCharacter
          x={660}
          floorY={1210}
          scale={0.8}
          pose="pushing_door"
          walkPhase={walkPhase}
          expression={{ emotion: "paranoia", intensity: 1, gazeX: -0.9, gazeY: 0.05 }}
          rightHandTarget={handTargetR}
          renderLayer="front_arm_only"
          rimColor={rimColor}
          rimStrength={1.35}
          outfit="investigator"
          showFloorShadow={false}
        />

        {/* ============================ FOREGROUND ============================ */}
        {/* Marco de pared desenfocado a la derecha */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: -30,
            width: 130,
            height: 1920,
            background: "#020306",
            filter: "blur(8px)",
            opacity: 0.85,
          }}
        />
      </div>

      {/* Partículas carmesí flotando desde la rendija */}
      {EMBERS.map((e, i) => {
        const y = e.y0 - ((frame * e.speed + e.phase) % 380);
        const op = 0.12 + 0.4 * Math.abs(Math.sin(frame * 0.08 + i * 0.8));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: e.x + Math.sin(frame * 0.05 + e.phase) * 12,
              width: e.r * 2,
              height: e.r * 2,
              borderRadius: e.r,
              background: "#DC2626",
              opacity: op,
              boxShadow: "0 0 8px rgba(220,38,38,0.7)",
            }}
          />
        );
      })}

      {/* Neblina baja arrastrándose por el suelo */}
      <div
        style={{
          position: "absolute",
          top: 1180,
          left: -100 + fogDrift,
          width: 1280,
          height: 140,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(43,58,66,0.30), transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Emergencia desde el Doorway Zoom-Through */}
      {emerge > 0.004 ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 45%, transparent 0%, rgba(2,3,5,0.92) 55%, #020306 100%)",
            opacity: emerge,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
