# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v8)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **animación 2.5D estilo Kurzgesagt oscuro con Personajes Vectoriales Articulados de Cuerpo Entero (`90+ <path>` por personaje), Actuación Facial Real, 2-Bone IK, Micro-Beats Visuales cada 1.5–2.5s y Transiciones Limpias Ancladas a Objetos** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual cinematográfica y 100% cohesionada en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Eyeless Jack, Tails Doll, The Rake, Siren Head, etc.).

---

## 1. Identidad Visual Unificada — Estándar v8 (100% Personajes Articulados 2.5D + Estética Kurzgesagt Oscura)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `60–100 s`.
- **PROHIBIDO usar `<Img>` para personajes o criaturas (Cero PNGs estáticos):**
  - Queda estrictamente prohibido renderizar personajes, criaturas o partes del cuerpo usando imágenes `<Img>` o recortes PNG estáticos (no existe `public/models/`).
  - Todo personaje o criatura debe implementarse como un **componente SVG vectorial articulado en 2.5D (`90+ <path>` orgánicos por personaje)** con curvas Bézier suaves, degradados *cel-shaded* limpios y *rim light* direccional, dibujado siempre **de cuerpo entero** (nunca cortado a la cintura ni flotando con auras artificiales).
- **Esqueleto Jerárquico Completo y Movimiento Orgánico:**
  - Todo personaje debe articularse con jerarquía real (`<g transform="...">` anidados desde la raíz):
    1. **`pelvis` (raíz):** rebote vertical orgánico, inclinación pélvica, agacharse/incorporarse.
    2. **`torso`:** respiración orgánica continua, encorvamiento progresivo, rotación de hombros y pliegues textiles con luz de borde.
    3. **`neck + head`:** giro e inclinación con **anticipación de 4 frames y *follow-through*** suave al cambiar de objetivo.
    4. **`faceRig` (Actuación Facial Real):** cejas dinámicas, párpados superior e inferior que parpadean de forma natural y se abren en pánico, pupilas dilatables que miran hacia el objetivo narrativo, boca articulada con labios/dientes/lengua animada según emoción (`calm_sleep`, `startled`, `pure_terror`, `exhausted_focus`, `agony`, `screech`).
    5. **`arms` (2-Bone IK + Dedos Articulados):** cadena `shoulder → elbow → wrist` con **2-Bone IK real** para sujetar props (sábanas, grabadora digital, linterna) delante del torso + **5 dedos articulados individualmente** (con garras alargables en criaturas/mutaciones).
    6. **`legs`:** cadena `thigh → knee → ankle → foot` firmemente anclada a **`floorY`** con **sombra elíptica de contacto real** sobre el suelo.
    7. **Cabello en 3 capas (`hairBack`, `hairCrown`, `hairFront`)** en personajes humanos, con movimiento secundario sutil.
- **Cohesión Visual 2.5D — Fondos Vectoriales Planos Estilizados (`public/backgrounds/*.png`):**
  - **Cero estilo realista fotográfico IA:** Todos los escenarios verticales (`1080×1920`) deben generarse en estilo **ilustración vectorial plana estilizada (`Flat 2D vector art, Kurzgesagt dark horror aesthetic`, cel-shaded limpio, sin texto ni personajes)** para integrarse al 100% con los personajes vectoriales articulados 2.5D.
  - Cada escena se monta en 3 planos de paralaje (`background` con drift suave, `midground` con arquitectura/muebles 2.5D + personajes articulados anclados a `floorY` + sombras de contacto, `foreground` con niebla volumétrica, haces de luz y siluetas cercanas).
- **Micro-Beats Visuales cada `1.5–2.5 segundos` (Ritmo Kurzgesagt / Date un Short):**
  - Ninguna escena permanece estática ni en un solo plano.
  - Cada frase, fecha o sustantivo relevante sincronizado con `src/data/transcript.ts` dispara una acción visual concreta:
    - Coreografía multi-plano (`Plano General → Plano Medio → Macro Close-Up 2.4x–2.8x` alternando entre actuación facial y detalles anatómicos/props),
    - Líneas de tiempo animadas (`1691 → 1964 → 2003 → 2006`),
    - Lupas circulares analíticas translúcidas (`2.4x–2.6x`) con retícula fina sobre documentos, anatomía o mutación,
    - Espectrogramas / ondas de audio reactivas en tiempo real y monitores clínicos diegéticos.
  - **Cero tarjetas estáticas:** Prohibido usar cajas de texto planas genéricas; toda visualización debe ser cinética, ilustrada y diegética.
- **Transiciones Limpias Ancladas a Objetos (*Match-Cuts* y *Zoom-Dives*):**
  - **Barrido de franjas negras (*Media Blackout*):** bandas horizontales de censura cierran y abren hacia el archivo.
  - **Giro de página (*Page-Flip Match-Cut*):** hoja de diario en perspectiva 3D revelando el siguiente escenario.
  - **Barrido con garras (*Claw-Swipe Wipe*):** zarpazos estilizados con destello carmesí rasgan el encuadre.
  - **Inmersión en onda (*Waveform Dive-Through*):** zoom exponencial dentro de la onda sonora hacia la siguiente escena.
  - **División diagonal luminosa (*Split-Screen Diagonal Reveal*):** haz luminoso diagonal contraponiendo dos realidades.
- **Post-procesado VHS sutil:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual únicamente en impactos/transiciones y viñeta perimetral. Prohibido el *shake/zoom* periódico mecánico (`frame % N`).

---

## 2. Paleta de Colores Oscura (Kurzgesagt Dark Horror)

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y planos lejanos |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / tensión, alertas `REC`, destellos de ataque |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (fechas, términos clave, CTA) |
| `--vhs-cyan` | `#22D3EE` | Reflejos clínicos / rim light frío / aberración cromática |
| `--vhs-magenta` | `#F43F5E` | Canal opuesto de aberración cromática |

---

## 3. Reglas de Zonas Seguras para YouTube Shorts (OBLIGATORIO)

Sobre un lienzo de **`1080 × 1920` px**, la interfaz móvil de YouTube Shorts cubre los bordes superior, inferior y derecho. **Ningún texto, subtítulo, etiqueta ni elemento narrativo clave debe invadir las zonas bloqueadas:**

| Zona restringida | Porcentaje | Rango en píxeles (`1080×1920`) | Elemento de UI de Shorts |
| :--- | :--- | :--- | :--- |
| **Margen superior libre** | `15%` superior | `y: 0px – 288px` | Barra de estado, búsqueda y controles superiores |
| **Margen inferior libre** | `25%` inferior | `y: 1440px – 1920px` | Canal, descripción, audio y barra de progreso |
| **Margen derecho libre** | `15%` derecho | `x: 918px – 1080px` | Botones de Like, Comentarios, Compartir y Remix |
| **Respiro izquierdo recomendado** | `6%` izquierdo | `x: 0px – 64px` | Seguridad de bordes curvos en móviles |

- **Caja Segura Activa:** `x: [64px, 918px]` (`ancho útil = 854px`), `y: [288px, 1440px]` (`alto útil = 1152px`).
- **Posición de Subtítulos Cinéticos:** A **`~66%` de altura** (`y ≈ 1235px–1300px`), siempre por encima de `1440px`, perfectamente centrados en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`) con márgenes laterales seguros (`paddingInline: 90px`).
- **Elementos de fondo (escenarios vectoriales, niebla, grano VHS, viñeta):** Ocupan el `100%` del lienzo `1080×1920` a sangre completa.

---

## 4. Delegación Obligatoria a OpenCode y Estructura Modular

- **Delegación obligatoria a OpenCode:** El agente coordinador actúa **únicamente como coordinador, generador de fondos estilizados y auditor visual**. Nunca crea ni edita código dentro de `src/` directamente; toda la implementación en Remotion/TSX/SVG dentro de `src/` se delega obligatoriamente a **OpenCode (`deepseek/deepseek-v4-pro`)**.

```text
├── AGENTS.md                        # Guía permanente de estilo y gobernanza (Estándar v8)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── backgrounds/                 # 6 fondos vectoriales planos 1080x1920 estilo Kurzgesagt oscuro (fal.ai)
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP — uso exclusivo para voz)
│   ├── musica_terror.mp3            # Música dark ambient sintetizada localmente (~100s, -12 dBFS)
│   └── sfx/                         # Efectos cortos temáticos sintetizados localmente
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de las 6 escenas, transiciones, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de las 6 escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── characters/              # Rigs vectoriales articulados 2.5D de cuerpo entero (90+ paths, IK, faceRig)
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones ancladas (Media Blackout, Page-Flip, Claw-Swipe, Waveform Dive, Diagonal Split)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD diegético
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.28↔0.52), SFX
    └── scenes/
        └── *.tsx                    # 6 escenas 2.5D con actuación facial, micro-beats cada 1.5–2.5s y Macro-Zooms
```

---

## 5. Reglas Técnicas de Remotion y Audio

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking audible:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: `0.28` durante voz activa y subida suave a `0.52` en pausas dramáticas y cierre final, con fundido limpio a `0.0`.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en transiciones e impactos puntuales.
- **Animación 100% determinista:** Todas las animaciones derivan exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido `Math.random()`, `setTimeout` o bucles periódicos `frame % N` para sacudidas.
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar 6 capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente confirmando **cero `<Img>` de personajes estáticos**, personajes vectoriales 2.5D de cuerpo entero anclados a `floorY` con actuación facial clara, fondos vectoriales coherentes, *Macro-Zooms* bien encuadrados y subtítulos centrados en zona segura; luego eliminar `.preview/` y `.prompts/` y validar `npx tsc --noEmit`.
