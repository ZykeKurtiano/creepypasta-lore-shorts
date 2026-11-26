# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v9)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **animación 2.5D estilo Kurzgesagt oscuro con Stock Vectorial Reutilizable (`HumanBase.tsx` + rig de criatura/entidad por episodio), Anclajes Matemáticos Compartidos, Micro-Beats Visuales cada 1.5–2.5s y Transiciones Limpias Ancladas a Objetos** usando Remotion, React, TypeScript y Tailwind CSS.

---

## 1. División de Roles — Estándar v9 (Ahorro de cuota sin sacrificar anatomía)

- **Gemini (Director visual, diseñador de stock 2.5D, generador de assets y auditor):**
  - Diseña, implementa y valida visualmente **únicamente** los rigs base en `src/components/stock/` (`HumanBase.tsx` reutilizable y el rig de entidad del episodio, p. ej. `LavenderGhostRig.tsx`).
  - Genera/procesa el audio (`narracion.mp3`, `musica_terror.mp3`, `sfx/*.mp3`), el transcript (`src/data/transcript.ts`), `src/data/episodeConfig.ts` y los 6 fondos vectoriales 2D planos (`public/backgrounds/bg_s1.png`–`bg_s6.png`).
  - Audita multimodalmente las capturas PNG finales en `.preview/`, dispara pulidos si hace falta y ejecuta el render final y Git/PR.
- **OpenCode (`deepseek/deepseek-v4-pro`):**
  - Programa de forma 100% automática todas las escenas (`src/scenes/*.tsx`), props diegéticos, coreografía de cámara, `SceneTransitions.tsx`, `AudioMaster.tsx`, `VhsPostProcess.tsx`, `MainComposition.tsx` y correcciones de TypeScript.
  - **RESTRICCIÓN ABSOLUTA:** OpenCode tiene estrictamente **PROHIBIDO** modificar, sobreescribir o redibujar la anatomía dentro de `src/components/stock/`.

---

## 2. Identidad Visual Unificada — Estándar v9

- **Formato:** `1080 × 1920` px (`9:16`), `30 fps`, duración objetivo `60–100 s`.
- **Cero personajes PNG / Cero realismo IA:**
  - Queda estrictamente **PROHIBIDO** usar `<Img>` para personajes, criaturas o partes del cuerpo.
  - Todos los personajes humanos deben instanciarse **exclusivamente** desde `src/components/stock/HumanBase.tsx`, personalizables por props (`variant`, `hairStyle`, `skinTone`, `shirtColor`, `pantsColor`, `emotion`, `pose`, `facing`, accesorios diegéticos como audífonos o sangrado nasal).
- **Geometría limpia con anclajes matemáticos compartidos:**
  - Estilo 2.5D estilizado tipo **Kurzgesagt oscuro / Zalgo Short**: máximo **35–45 formas limpias** por personaje, contorno oscuro uniforme, sombreado *cel-shaded* suave y *rim light* direccional.
  - **Anclajes rígidos por constantes compartidas:** Todas las extremidades se unen matemáticamente a constantes exportadas (`NECK_Y`, `SHOULDER_Y`, `SHOULDER_X`, `HIP_Y`, `HIP_X`, `FLOOR_Y`) con rotaciones suaves de hombro/codo/cadera/rodilla, garantizando que ningún brazo, pierna o cabeza salga del torso ni flote despegado.
  - Todos los personajes de pie o sentados deben apoyarse con sombra elíptica de contacto real en `FLOOR_Y` (nunca cortados a la cintura ni flotando).
- **Fondos Vectoriales 2D Planos (`public/backgrounds/bg_s1.png`–`bg_s6.png`):**
  - Ilustración vectorial plana estilizada (`Flat 2D vector art, Kurzgesagt dark horror aesthetic`, cel-shaded limpio, sin personas, sin texto, cero realismo fotográfico IA).
  - Montaje en 3 planos de paralaje (`background` con drift suave, `midground` con props diegéticos 2.5D + personajes de `src/components/stock/`, `foreground` con bruma, reflejos y viñeta).
- **Micro-beats cada `1.5–2.5 segundos` y transiciones limpias:**
  - Ninguna escena permanece estática ni en un solo plano.
  - Coreografía multi-plano (`Plano General → Plano Medio → Macro-Zoom 2.4x`) sincronizada con `src/data/transcript.ts`.
  - Props diegéticos animados en SVG (Game Boy, audífonos, osciloscopio / ondas de frecuencia binaurales, archivo confidencial 047, Torre Pokémon, pantallas divididas).
  - Transiciones limpias ancladas a objetos: apagón/zoom de pantalla Game Boy, niebla violeta / torre, barrido de osciloscopio / onda sonora, glitch 8-bit 731, divisor diagonal violeta/índigo.
- **Post-procesado VHS sutil:** Grano determinista muy limpio (`feTurbulence`), líneas de escaneo tenues, aberración cromática puntual solo en impactos/cortes y viñeta perimetral sin ensuciar el trazo vectorial.

---

## 3. Paleta de Colores Oscura (Kurzgesagt Dark Horror + Acentos Lavanda)

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-indigo-deep` | `#0B0A18` | Sombras nocturnas y fondos profundos |
| `--bg-lavender-dark` | `#241B3A` | Planos medios, neblina morada, arquitectura |
| `--lavender-glow` | `#A78BFA` | Rim light espectral, ondas binaurales, acentos Pueblo Lavanda |
| `--gb-emerald` | `#84CC16` | Pantalla retro 8-bit Game Boy / glitch 731 |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / tensión, alertas `REC`, sangrado nasal |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (fechas, cifras, CTA) |
| `--vhs-cyan` | `#22D3EE` | Reflejos clínicos / rim light frío / aberración cromática |
| `--vhs-magenta` | `#F43F5E` | Canal opuesto de aberración cromática |

---

## 4. Reglas de Zonas Seguras para YouTube Shorts (OBLIGATORIO)

Sobre un lienzo de **`1080 × 1920` px**, ningún texto, subtítulo, etiqueta ni elemento narrativo clave debe invadir las zonas bloqueadas de la UI móvil:

| Zona restringida | Porcentaje | Rango en píxeles (`1080×1920`) | Elemento de UI de Shorts |
| :--- | :--- | :--- | :--- |
| **Margen superior libre** | `15%` superior | `y: 0px – 288px` | Barra de estado, búsqueda y controles superiores |
| **Margen inferior libre** | `25%` inferior | `y: 1440px – 1920px` | Canal, descripción, audio y barra de progreso |
| **Margen derecho libre** | `15%` derecho | `x: 918px – 1080px` | Botones de Like, Comentarios, Compartir y Remix |
| **Respiro izquierdo recomendado** | `6%` izquierdo | `x: 0px – 64px` | Seguridad de bordes curvos en móviles |

- **Caja Segura Activa:** `x: [64px, 918px]` (`ancho útil = 854px`), `y: [288px, 1440px]` (`alto útil = 1152px`).
- **Posición de Subtítulos Cinéticos:** A **`~66%` de altura** (`y ≈ 1235px–1300px`), siempre por encima de `1440px`, estrictamente centrados (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).

---

## 5. Estructura Modular del Proyecto

```text
├── AGENTS.md                        # Guía permanente de estilo y gobernanza (Estándar v9)
├── opencode.json                    # Permisos para ejecución autónoma de OpenCode
├── public/
│   ├── backgrounds/                 # 6 fondos vectoriales planos 1080x1920 estilo Kurzgesagt oscuro (fal.ai)
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP — uso exclusivo para voz)
│   ├── musica_terror.mp3            # Tema procesado con ffmpeg (-14 dBFS RMS, afade 1.5s)
│   └── sfx/                         # Efectos cortos sintetizados localmente (Python + ffmpeg)
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de las 6 escenas, transiciones, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de las 6 escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── stock/                   # SOLO GEMINI: Rigs 2.5D limpios con anclajes matemáticos compartidos
    │   │   ├── HumanBase.tsx        # Rig humano reutilizable (PROHIBIDO editar por OpenCode)
    │   │   └── LavenderGhostRig.tsx # Entidad espectral Pueblo Lavanda (PROHIBIDO editar por OpenCode)
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones limpias ancladas a objetos
    │   ├── VhsPostProcess.tsx       # Grano fino determinista, scanlines, aberración puntual y HUD diegético
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.24↔0.48), SFX
    └── scenes/
        └── *.tsx                    # 6 escenas 2.5D con micro-beats cada 1.5–2.5s y Macro-Zooms
```

---

## 6. Reglas Técnicas de Remotion, Audio y Verificación

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking audible:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: normalizada a `-14 dBFS` RMS; ducking suave `0.24` durante voz activa y subida a `0.48` en pausas dramáticas y cierre final, con fundido limpio a `0.0`.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en transiciones e impactos puntuales.
- **Animación 100% determinista:** Todas las animaciones derivan exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido `Math.random()`, `setTimeout` o sacudidas periódicas mecánicas (`frame % N`).
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:**
  1. Validar rigs base en `src/components/stock/` antes de delegar escenas a OpenCode.
  2. Exportar 6 capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente confirmando anatomía limpia con anclajes rígidos, cero PNGs de personajes, cero texto encimado y subtítulos centrados en zona segura.
  3. Eliminar `.preview/` y `.prompts/`, validar `npx tsc --noEmit` con 0 errores y renderizar el MP4 final con `--crf=18`.
