# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v7)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con Modelos Hiperdetallados de `fal.ai` recortados con `birefnet` (`RGBA`), Puppet-Rigs 2.5D, Micro-Beats Visuales cada 1.5–2.5s estilo Kurzgesagt / Date un Short y Transiciones Limpias Ancladas a Objetos** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual cinematográfica coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Eyeless Jack, Tails Doll, The Rake, Siren Head, etc.).

---

## 1. Identidad Visual Unificada — Estándar v7 (`fal.ai` + `birefnet`, Micro-Beats 1.5–2.5s y Transiciones Ancladas)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `60–100 s`.
- **Modelos de Personajes y Criaturas Hiperdetallados con `fal.ai` (`public/models/*.png`):**
  - Prohibido dibujar personajes o criaturas simples con pocos trazos SVG o geometrías planas.
  - Todo personaje o criatura debe renderizarse usando los **modelos PNG transparentes (`RGBA`)** de alta resolución generados por `fal.ai` (`fal-ai/flux/dev` sobre fondo gris neutro + recorte automático `fal-ai/birefnet/v2`) cargados con `<Img src={staticFile('models/...')} />` y envueltos en un componente **Puppet-Rig 2.5D** que anime:
    - Respiración orgánica (`scaleY` + sutil desplazamiento vertical),
    - Espasmos, temblores o sobresaltos biomecánicos (`rotate` + `translate`),
    - Ojos brillantes dinámicos en SVG superpuestos y rastreados sobre las cuencas,
    - *Rim light* direccional 360° mediante `drop-shadow` y capas de luz atmosférica,
    - Sombra elíptica de contacto anclada al plano de suelo (`floorY`),
    - ***Macro-Zooms* (`2.2x–3.0x`)** dirigidos a detalles anatómicos clave (garras, cuencas vacías, rostro en pánico, mutación, grabadora).
- **Escenarios Verticales Atmosféricos con `fal.ai` (`public/backgrounds/*.png`):**
  - Cada escena utiliza su propio escenario vertical `1080×1920` generado con `fal-ai/flux/dev` (sin texto incrustado ni personajes) montado con paralaje 2.5D en 3 capas (`background` con drift lento, `midground` con Puppet-Rigs + props interactivos + sombras de contacto, `foreground` con niebla volumétrica, partículas iluminadas y elementos cercanos en silueta).
- **Micro-Beats Visuales cada `1.5–2.5 segundos` (Ritmo Kurzgesagt / Date un Short):**
  - Ninguna escena puede permanecer estática ni en un único plano fijo.
  - Cada frase, año o sustantivo relevante del guion debe sincronizarse exactamente con los timestamps de `src/data/transcript.ts` para disparar un elemento visual concreto en pantalla:
    - Contadores/líneas de tiempo animadas (ej. `1691 → 1964 → 2003 → 2006`),
    - Lupas circulares analíticas (`2.2x–3.0x`) que amplían garras, marcas, texto de archivo o mutaciones,
    - Ondas de audio / espectrogramas de grabadora digital reactivos en tiempo real,
    - Sellos/iconos diegéticos cinematográficos y cambios de plano internos (Plano General → Plano Medio → *Macro Close-Up*).
  - **Cero tarjetas estáticas:** Queda prohibido usar tarjetas de texto plano, gráficas genéricas o cajas estáticas para explicar conceptos; toda explicación visual debe ser cinética, ilustrada y diegética.
- **Transiciones Limpias Ancladas a Objetos (*Match-Cuts* y *Zoom-Dives*):**
  - Queda prohibido usar cortes secos o barridos planos genéricos.
  - Cada cambio de escena debe ocurrir mediante un **elemento físico de la toma**:
    1. **Barrido con sombra y garras (*Claw-Swipe Wipe*):** garras oscuras y destellos rasgan el encuadre revelando el nuevo entorno.
    2. **Giro de página (*Page-Flip Match-Cut*):** hoja de diario o carta que gira en perspectiva 3D revelando la siguiente escena.
    3. **Inmersión en onda / lente (*Waveform / Lens Dive-Through*):** zoom exponencial dentro del lente o la onda sonora de una grabadora digital hacia el siguiente escenario.
    4. **División diagonal luminosa (*Split-Screen Diagonal Reveal*):** haz luminoso diagonal de alto contraste que separa y contrapone dos realidades.
- **Post-procesado VHS sutil:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual únicamente en impactos/transiciones y viñeta perimetral. Prohibido el *shake/zoom* periódico mecánico (`frame % N`).

---

## 2. Paleta de Colores Oscura

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y capas lejanas |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, alertas VHS `REC`, destellos de ataque |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (fechas, términos clave, CTA) |
| `--vhs-cyan` | `#22D3EE` | Reflejos clínicos / rim light frío / canal desplazado de aberración cromática |
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
- **Posición de Subtítulos Cinéticos:** A **`~66%` de altura** (`y ≈ 1235px–1300px`), siempre por encima de `1440px`, perfectamente centrados en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`) con márgenes laterales seguros (`paddingInline: 90px`) para no chocar jamás con la columna derecha de iconos.
- **Elementos de fondo (escenarios, niebla, grano VHS, viñeta):** Ocupan el `100%` del lienzo `1080×1920` a sangre completa.

---

## 4. Delegación Obligatoria a OpenCode y Estructura Modular

- **Delegación obligatoria a OpenCode:** El agente coordinador actúa **únicamente como coordinador, generador de assets (audio + modelos/fondos `fal.ai`) y auditor visual**. Nunca crea ni edita código dentro de `src/` directamente (excepto `src/data/transcript.ts` y `src/data/episodeConfig.ts` vía Python); toda la implementación en Remotion/TSX/SVG dentro de `src/` se delega obligatoriamente a **OpenCode (`deepseek/deepseek-v4-pro`)**.

```text
├── AGENTS.md                        # Guía permanente de estilo y gobernanza (Estándar v7)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── backgrounds/                 # 6 escenarios verticales 1080x1920 generados con fal.ai (flux/dev)
│   ├── models/                      # 6 modelos RGBA transparentes (fal.ai flux/dev + birefnet/v2)
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
    │   ├── characters/              # Puppet-Rigs 2.5D para modelos PNG transparentes de fal.ai
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones ancladas a objetos (Claw-Swipe, Page-Flip, Waveform Dive, Diagonal Split)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD diegético
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.28↔0.52), SFX
    └── scenes/
        └── *.tsx                    # 6 escenas 2.5D con micro-beats cada 1.5–2.5s y Macro-Zooms (2.2x–3.0x)
```

---

## 5. Reglas Técnicas de Remotion y Audio

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking audible:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: volumen controlado mediante `interpolate()` + pausas del transcript: `0.28` durante voz activa y subida suave a `0.52` en pausas dramáticas y en el cierre final, con fundido limpio a `0.0` al terminar.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en transiciones e impactos puntuales.
- **Animación 100% determinista:** Todas las animaciones derivan exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido usar `Math.random()`, `setTimeout` o transiciones CSS no sincronizadas.
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar 6 capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente (recortes transparentes limpios sin halos/bordes grises, fondos nítidos, micro-beats visibles, *Macro-Zooms* bien encuadrados, cero tarjetas estáticas, subtítulos centrados en zona segura, alto contraste), eliminar `.preview/` y `.prompts/`, y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual (Estándar v7)

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, preguntas cinéticas y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Modelos `fal.ai` RGBA + Puppet-Rigs 2.5D:**
   - Ningún personaje o criatura se dibuja con SVG básico. Todos usan modelos PNG transparentes recortados con `fal-ai/birefnet/v2`, envueltos en Puppet-Rigs con respiración (`scaleY`), espasmos (`rotate` + `translate`), ojos brillantes SVG superpuestos, *rim light* (`drop-shadow`) y sombra en `floorY`.
3. **Micro-Beats Visuales cada `1.5–2.5s` (Kurzgesagt / Date un Short):**
   - Cada frase clave del transcript dispara un evento visual sincronizado (contadores de años, lupas circulares `2.2x–3.0x`, espectrogramas de voz, sellos diegéticos, cambios de plano). Cero pantallas estáticas y cero tarjetas planas.
4. **Transiciones Ancladas a Objetos:**
   - Solo transiciones físicas motivadas (*Claw-Swipe*, *Page-Flip Match-Cut*, *Waveform Dive-Through*, *Diagonal Split*).
5. **Cinematografía motivada (cero *shake/zoom* periódico):**
   - Prohibido usar bucles `frame % N` para sacudidas o pulsos. Cada movimiento de cámara o impacto responde a un momento narrativo y sonoro concreto.
