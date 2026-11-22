import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { SmileDogCloseup } from "../components/SmileDogCreature";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene5ChillingOutro (frames 1347–1583, 44.90–52.77s) — Cierre
 * perturbador: primerísimo plano en oscuridad absoluta.
 *
 * Ojos brillantes y sonrisa humana emergiendo orgánicamente de la
 * sombra inferior central, con brasas flotantes y neblina carmesí.
 * Insignia glitch (1347–1460) y después la tarjeta final con la
 * pregunta (1460–1583, sosteniéndose durante el fade del outro).
 */

const BADGE_END = 113; // frame local (global 1460)
const CARD_START = 113;

const EMBERS = Array.from({ length: 36 }, (_, i) => ({
  x: random(i * 11 + 1) * 1080,
  y0: 500 + random(i * 7 + 2) * 900,
  r: 1.5 + random(i * 5 + 3) * 1.8,
  speed: 0.28 + random(i * 3 + 1) * 0.4,
  phase: random(i * 13 + 5) * 1200,
  warm: i % 3 === 0,
}));

export const Scene5ChillingOutro: React.FC = () => {
  const frame = useCurrentFrame();

  // Emergencia orgánica del rostro.
  const emerge = interpolate(frame, [0, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emergeFlicker = emerge * (0.93 + 0.07 * Math.sin(frame * 0.7));

  const badgeProg = interpolate(frame, [0, 8, BADGE_END - 4, BADGE_END], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardProg = interpolate(frame, [CARD_START, CARD_START + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch de la insignia (jitter + división RGB).
  const glitchJitter = (random(Math.floor(frame / 4) + 9) - 0.5) * 7 * badgeProg;
  const rimPulse = 0.5 + 0.5 * Math.sin(frame * 0.05);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Vacío profundo */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 62%, #07090D 0%, #030406 55%, #010203 100%)",
        }}
      />

      {/* 2. Neblina carmesí respirando en los bordes */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -260,
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(127,29,29,0.22), transparent 70%)",
          opacity: rimPulse,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -260,
          right: -260,
          width: 760,
          height: 760,
          background:
            "radial-gradient(circle, rgba(127,29,29,0.26), transparent 70%)",
          opacity: rimPulse * 1.2,
          filter: "blur(46px)",
        }}
      />

      {/* 3. Brasas / polvo estático flotante */}
      {EMBERS.map((e, i) => {
        const y = e.y0 - ((frame * e.speed + e.phase) % 1200);
        const op = 0.05 + 0.3 * Math.abs(Math.sin(frame * 0.04 + i * 0.8));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: e.x,
              width: e.r * 2,
              height: e.r * 2,
              borderRadius: e.r,
              background: e.warm ? "#FDE047" : "#DC2626",
              opacity: op,
              boxShadow: e.warm
                ? "0 0 8px rgba(253,224,71,0.5)"
                : "0 0 8px rgba(220,38,38,0.55)",
            }}
          />
        );
      })}

      {/* 4. Primerísimo plano: ojos y sonrisa en la oscuridad */}
      <SmileDogCloseup
        width={700}
        opacity={emergeFlicker}
        style={{ top: 680, left: 190 }}
      />

      {/* 5. Insignia glitch (local 0–113, global 1347–1460) */}
      {badgeProg > 0.01 ? (
        <SafeCentered top={400} zIndex={7}>
          <div
            style={{
              display: "inline-block",
              transform: `translateX(${glitchJitter}px)`,
              padding: "14px 30px",
              background: "rgba(4,5,7,0.62)",
              border: "1px solid rgba(220,38,38,0.45)",
              borderRadius: 8,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 3,
              color: "#F2EFE9",
              textShadow:
                "2px 0 rgba(34,211,238,0.8), -2px 0 rgba(244,63,94,0.8), 0 0 18px rgba(220,38,38,0.5)",
              opacity: badgeProg,
            }}
          >
            MENSAJE RECIBIDO <span style={{ color: "#DC2626" }}>//</span> PÁSALO O
            QUÉDATELO
          </div>
        </SafeCentered>
      ) : null}

      {/* 6. Tarjeta final con la pregunta (local 113–236, global 1460–1583) */}
      {cardProg > 0.01 ? (
        <SafeCentered top={400} zIndex={7}>
          <div
            style={{
              display: "inline-block",
              maxWidth: 740,
              padding: "26px 30px",
              background: "rgba(20,8,10,0.84)",
              border: "1px solid rgba(220,38,38,0.5)",
              borderRadius: 14,
              boxShadow:
                "0 0 60px rgba(220,38,38,0.28), 0 20px 60px rgba(0,0,0,0.7)",
              opacity: cardProg,
              fontFamily: FONT_SANS,
            }}
          >
            <div
              style={{
                color: "#F2EFE9",
                fontWeight: 900,
                fontSize: 45,
                lineHeight: 1.14,
                letterSpacing: 1,
                textShadow: "0 0 26px rgba(220,38,38,0.4)",
              }}
            >
              ¿CONDENARÍAS A ALGUIEN MÁS PARA SALVARTE?
            </div>
            <div
              style={{
                margin: "16px auto 0",
                width: 120,
                height: 5,
                borderRadius: 3,
                background: "#DC2626",
                boxShadow: "0 0 16px rgba(220,38,38,0.8)",
              }}
            />
            <div
              style={{
                display: "inline-block",
                marginTop: 18,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.55)",
                color: "#F87171",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 2,
                boxShadow: `0 0 24px rgba(220,38,38,${0.25 + 0.25 * Math.sin(frame * 0.16)})`,
              }}
            >
              COMENTA TU RESPUESTA ABAJO
            </div>
          </div>
        </SafeCentered>
      ) : null}

      {/* 7. Oscurecimiento de bordes */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(1,2,3,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
