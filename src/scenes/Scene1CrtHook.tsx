import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { BeckoningHand, SmileDogCreature } from "../components/SmileDogCreature";
import { FONT_MONO, FONT_SANS, SafeCentered } from "../components/SafeZone";

/**
 * Scene1CrtHook (frames 0–489, 0.00–16.30s) — Gancho: smile.jpg y el flash.
 *
 * 2.5D Habitación oscura de 2008: pared/escritorio, monitor CRT vintage
 * con resplandor cian parpadeante, silueta humana sobre-el-hombro
 * tecleando, polvo flotando en el cono de luz.
 *
 * Pre-flash (0–137): visor retro cargando smile.jpg...
 * Flash (138+): estallido de cámara que revela a Smile Dog dentro y
 * más allá del resplandor del CRT, con la mano pálida llamando desde
 * la oscuridad.
 */

const FLASH_FRAME = 138;

const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: 320 + random(i * 3 + 1) * 500,
  y0: 840 + random(i * 7 + 2) * 280,
  r: 2 + random(i * 5 + 3) * 2.4,
  speed: 0.1 + random(i * 9 + 4) * 0.16,
  phase: random(i * 13 + 5) * 300,
}));

export const Scene1CrtHook: React.FC = () => {
  const frame = useCurrentFrame();
  const postFlash = frame >= FLASH_FRAME;

  const revealProg = interpolate(frame, [FLASH_FRAME, FLASH_FRAME + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const loadProg = interpolate(frame, [0, FLASH_FRAME], [0.08, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Resplandor blanco-caliente del flash decayendo en el CRT.
  const whiteHot = postFlash
    ? interpolate(frame, [FLASH_FRAME, FLASH_FRAME + 22], [1, 0.32], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const screenFlicker =
    0.9 + 0.1 * Math.sin(frame * 0.55) + (random(Math.floor(frame / 3) + 4) > 0.93 ? 0.05 : 0);
  const shadowFlicker = 0.7 + 0.3 * Math.max(0, Math.sin(frame * 0.31 + 0.8));

  // Sobresalto de la silueta con el flash.
  const flinch = postFlash
    ? interpolate(frame, [FLASH_FRAME, FLASH_FRAME + 7, FLASH_FRAME + 24], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Micro-glitch de teletransporte del ente que se cierne.
  const glitchGate = Math.max(0, Math.sin(frame * 0.9 + 2));
  const glitchX =
    (random(Math.floor(frame / 5) + 1) - 0.5) * 12 * Math.min(1, glitchGate * 3);
  const glitchY =
    (random(Math.floor(frame / 5) + 11) - 0.5) * 10 * Math.min(1, glitchGate * 3);

  // La mano llama con más intensidad cuando suena "mano llamándote".
  const handCurl = interpolate(frame, [424, 470], [0.4, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Parallax de capas (la cámara global ya aporta movimiento).
  const wallDrift = Math.sin(frame * 0.01) * 2;
  const deskDrift = Math.sin(frame * 0.013 + 1) * 3.5;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Fondo: pared nocturna + ventana de luna */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #06080C 0%, #0A1014 55%, #040507 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -140,
          left: 90 + wallDrift,
          width: 250,
          height: 1150,
          background:
            "linear-gradient(172deg, rgba(150,190,225,0.10), rgba(150,190,225,0.02))",
          transform: "skewX(-14deg)",
        }}
      />
      {/* Pósters / marcos tenues en la pared */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 130 + wallDrift,
          width: 150,
          height: 200,
          border: "1px solid rgba(140,170,200,0.10)",
          background: "rgba(20,28,36,0.25)",
          transform: "rotate(-2deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 812 + wallDrift,
          width: 120,
          height: 160,
          border: "1px solid rgba(140,170,200,0.09)",
          background: "rgba(18,26,34,0.22)",
          transform: "rotate(3deg)",
        }}
      />

      {/* 2. La mano pálida llamando desde la oscuridad (detrás del ente) */}
      <BeckoningHand
        width={230}
        opacity={0.55 * revealProg}
        curl={handCurl}
        style={{ top: 520, left: 118, transform: "rotate(-8deg)" }}
      />

      {/* 3. Sombra fantasmal imponente + ojos tras el monitor
             (aparece con el flash: solo silueta tenue y ojos, sin
             duplicar la foto del CRT) */}
      {postFlash ? (
        <div
          style={{
            position: "absolute",
            top: 340,
            left: 330,
            width: 420,
            height: 480,
            opacity: 0.9 * revealProg,
            transform: `translate(${glitchX}px, ${glitchY}px)`,
          }}
        >
          <svg viewBox="0 0 420 480" width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <filter id="s1-shadow-blur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>
            {/* Sombra alargada y demacrada */}
            <path
              d="M 190 20
                 L 236 130 L 320 148 L 292 236 L 348 272 L 322 372 L 296 448
                 L 258 432 L 240 500 L 204 438 L 196 358 L 152 320
                 L 198 244 L 214 196 L 158 148 Z"
              fill="#0A0E14"
              opacity="0.5"
              filter="url(#s1-shadow-blur)"
            />
            {/* Ojos puntiformes tenues */}
            <circle cx="246" cy="208" r="3.5" fill="#F0B25C" opacity={0.5 * shadowFlicker} />
            <circle cx="302" cy="208" r="3.5" fill="#F0B25C" opacity={0.5 * shadowFlicker} />
            <circle cx="246" cy="208" r="9" fill="#F0B25C" opacity={0.14 * shadowFlicker} filter="url(#s1-shadow-blur)" />
            <circle cx="302" cy="208" r="9" fill="#F0B25C" opacity={0.14 * shadowFlicker} filter="url(#s1-shadow-blur)" />
          </svg>
        </div>
      ) : null}

      {/* 4. Cono de luz del CRT sobre la habitación */}
      <div
        style={{
          position: "absolute",
          top: 1080,
          left: 180,
          width: 720,
          height: 640,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(140,205,245,0.16), rgba(140,205,245,0.05) 55%, transparent 75%)",
          opacity: (postFlash ? 0.35 : 0.6) * screenFlicker,
        }}
      />

      {/* 5. Escritorio */}
      <div
        style={{
          position: "absolute",
          top: 1190,
          left: deskDrift - 20,
          width: 1120,
          height: 120,
          background: "linear-gradient(180deg, #0C0F14 0%, #0A0C10 60%, #06080B 100%)",
          borderTop: "1px solid rgba(150,180,210,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1310,
          left: 0,
          right: 0,
          height: 620,
          background: "linear-gradient(180deg, #05070A 0%, #020306 100%)",
        }}
      />

      {/* Papeles y taza sobre el escritorio */}
      <div
        style={{
          position: "absolute",
          top: 1148,
          left: 800,
          width: 92,
          height: 118,
          background: "rgba(222,230,238,0.12)",
          transform: "rotate(7deg)",
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1156,
          left: 906,
          width: 82,
          height: 108,
          background: "rgba(222,230,238,0.09)",
          transform: "rotate(-5deg)",
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1098,
          left: 832,
          width: 52,
          height: 64,
          background: "linear-gradient(180deg, #10141B, #0A0D12)",
          borderRadius: "6px 6px 10px 10px",
          border: "1px solid rgba(150,180,210,0.10)",
        }}
      />

      {/* 6. Monitor CRT chunky 2008 */}
      <div style={{ position: "absolute", top: 800, left: 292, width: 496, height: 396 }}>
        {/* Carcasa */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #14181F 0%, #0D1016 55%, #0A0C11 100%)",
            borderRadius: 26,
            border: "1px solid rgba(160,190,220,0.10)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.7)",
          }}
        />
        {/* Marco del tubo */}
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 26,
            right: 26,
            bottom: 52,
            background: "#08090D",
            borderRadius: 18,
            border: "2px solid #05060A",
          }}
        />
        {/* Pantalla */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 44,
            right: 44,
            bottom: 76,
            borderRadius: 12,
            overflow: "hidden",
            background: postFlash
              ? `radial-gradient(ellipse at 50% 50%, rgba(240,246,255,${0.95 * whiteHot + 0.05}), rgba(165,195,225,${0.55 * whiteHot + 0.05}) 70%, rgba(60,80,105,${0.35 * whiteHot + 0.06}) 100%)`
              : "#0B0E13",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
          }}
        >
          {/* Visor retro cargando (pre-flash) */}
          {!postFlash ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                fontFamily: FONT_MONO,
              }}
            >
              <div
                style={{
                  height: 26,
                  background: "linear-gradient(180deg, #1E2A38, #16202C)",
                  borderBottom: "1px solid #0A0F16",
                  display: "flex",
                  alignItems: "center",
                  paddingInline: 10,
                  color: "#9FB4C8",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                smile.jpg — Visor de imágenes de Windows
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {/* Fantasma tenue de la criatura, premonitorio */}
                <div style={{ position: "absolute", opacity: 0.05 + 0.03 * Math.sin(frame * 0.4) }}>
                  <SmileDogCreature width={150} eyeGlow={0.4} variant="flash" />
                </div>
                <div style={{ color: "#B9C9D8", fontSize: 13, letterSpacing: 1 }}>
                  Cargando smile.jpg…
                </div>
                <div
                  style={{
                    width: 190,
                    height: 7,
                    background: "#151C25",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${loadProg * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #155E75, #22D3EE)",
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div style={{ color: "#5E7488", fontSize: 10 }}>
                  {Math.round(loadProg * 100)}% · 666 KB
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Criatura revelada DENTRO de la pantalla (cabeza completa) */}
              <SmileDogCreature
                width={220}
                eyeGlow={1.3}
                jawOpen={0.1}
                variant="flash"
                reveal={revealProg}
                style={{ top: 67, left: 94 }}
              />
              {/* Scanlines del tubo */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)",
                  opacity: 0.7,
                }}
              />
            </>
          )}
        </div>
        {/* Base del monitor */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 170,
            width: 156,
            height: 34,
            background: "#0B0D12",
            borderRadius: 10,
          }}
        />
        {/* LED de encendido */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 396,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: postFlash ? "#DC2626" : "#22D3EE",
            boxShadow: postFlash
              ? "0 0 10px rgba(220,38,38,0.9)"
              : "0 0 10px rgba(34,211,238,0.9)",
            opacity: 0.7 + 0.3 * Math.sin(frame * 0.5),
          }}
        />
      </div>

      {/* 7. Teclado sobre el escritorio */}
      <div
        style={{
          position: "absolute",
          top: 1206,
          left: 330 + deskDrift,
          width: 420,
          height: 92,
          background: "linear-gradient(180deg, #10141B, #0B0E13)",
          borderRadius: 10,
          border: "1px solid rgba(150,180,210,0.08)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
        }}
      >
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <div
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: 12 + row * 19,
                left: 14 + col * 50,
                width: 42,
                height: 13,
                background: "#161B23",
                borderRadius: 3,
                opacity: 0.85,
              }}
            />
          ))
        )}
        {/* Resplandor del CRT sobre el teclado */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(34,211,238,0.14), rgba(34,211,238,0.03))",
            opacity: postFlash ? 0.35 * screenFlicker : 0.55 * screenFlicker,
            borderRadius: 10,
          }}
        />
      </div>

      {/* 8. Silueta humana sobre-el-hombro (primer plano) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 560,
          transform: `translate(${-flinch * 26}px, ${flinch * 8}px)`,
        }}
      >
        <svg viewBox="0 0 560 1920" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Hombro + espalda (vista sobre-el-hombro) */}
          <path
            d="M 150 1480
               C 80 1560, 30 1660, 0 1780
               L 0 1920 L 430 1920
               C 400 1700, 350 1590, 265 1530
               Z"
            fill="#04060A"
          />
          {/* Cabeza (de espaldas, gran primer plano) */}
          <ellipse cx="160" cy="1400" rx="135" ry="150" fill="#04060A" />
          <path
            d="M 40 1370 C 30 1300, 45 1240, 80 1215 C 130 1180, 210 1185, 250 1230 C 285 1275, 292 1335, 270 1385"
            fill="#05070C"
          />
          {/* Brazo extendido hacia el teclado */}
          <path
            d="M 250 1580 C 330 1540, 400 1450, 470 1320"
            stroke="#04060A"
            strokeWidth="58"
            fill="none"
            strokeLinecap="round"
          />
          {/* Mano sobre el teclado */}
          <ellipse cx="500" cy="1286" rx="42" ry="26" fill="#04060A" transform="rotate(-16 500 1286)" />
          {/* Dedos tecleando (wiggle sutil) */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={518 + i * 21}
              y={1260 + Math.sin(frame * 6 + i * 0.9) * 2.4}
              width={15}
              height={40}
              rx={7}
              fill="#04060A"
              transform={`rotate(${-14 + i * 3} ${525 + i * 21} 1280)`}
            />
          ))}
          {/* Rim-light cian frío del CRT sobre el contorno del espectador */}
          <g opacity={0.35 + 0.2 * screenFlicker}>
            <path
              d="M 40 1370 C 30 1300, 45 1240, 80 1215 C 130 1180, 210 1185, 250 1230 C 285 1275, 292 1335, 270 1385"
              fill="none"
              stroke="#7EC8E3"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 250 1580 C 330 1540, 400 1450, 470 1320"
              fill="none"
              stroke="#7EC8E3"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
            <ellipse
              cx="500"
              cy="1286"
              rx="42"
              ry="26"
              fill="none"
              stroke="#7EC8E3"
              strokeWidth="2.5"
              opacity="0.8"
              transform="rotate(-16 500 1286)"
            />
            <path
              d="M 430 1920 C 400 1700, 350 1590, 265 1530"
              fill="none"
              stroke="#7EC8E3"
              strokeWidth="3"
              opacity="0.6"
            />
          </g>
        </svg>
      </div>

      {/* 9. Polvo flotando en el cono de luz */}
      {DUST.map((d, i) => {
        const y = d.y0 - ((frame * d.speed + d.phase) % 300);
        const op = 0.08 + 0.22 * Math.abs(Math.sin(frame * 0.05 + i * 1.1));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: d.x,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: d.r,
              background: "#CFE3F5",
              opacity: op * (postFlash ? 1.4 : 0.9),
              boxShadow: "0 0 6px rgba(190,220,245,0.5)",
            }}
          />
        );
      })}

      {/* 10. Enmarcado de primer plano desenfocado (laterales) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -70,
          width: 150,
          background: "#020306",
          filter: "blur(10px)",
          opacity: 0.92,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -70,
          width: 150,
          background: "#020306",
          filter: "blur(10px)",
          opacity: 0.92,
        }}
      />

      {/* 11. Encabezado centrado seguro */}
      <SafeCentered top={380} zIndex={5}>
        <div
          style={{
            display: "inline-block",
            opacity: postFlash ? 0.72 : 1,
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: 6,
            color: "#F2EFE9",
            textShadow: "0 2px 18px rgba(0,0,0,0.9)",
          }}
        >
          ARCHIVO MALDITO <span style={{ color: "#DC2626" }}>//</span>{" "}
          <span style={{ color: "#FDE047" }}>2008</span>
          <div
            style={{
              margin: "12px auto 0",
              width: 240,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(220,38,38,0.7), transparent)",
            }}
          />
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: 4,
              color: "rgba(159,180,200,0.85)",
            }}
          >
            REGISTRO RECUPERADO DE UN FORO
          </div>
        </div>
      </SafeCentered>
    </AbsoluteFill>
  );
};
