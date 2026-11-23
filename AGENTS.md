# AGENTS.md — Creepypasta Lore Shorts Template

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con ilustración vectorial articulada** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Ben Drowned, Siren Head, The Rake, etc.).

---

## 1. Identidad Visual Unificada — Estilo Vectorial Oscuro Articulado en 2.5D

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `45–55 s`.
- **Prohibición de imágenes fotorrealistas estáticas:** Queda **estrictamente prohibido** usar imágenes fotorrealistas estáticas generadas con Fal.ai (ni fotos/recortes PNG estáticos) en esta serie.
- **Construcción TSX/SVG estilizada de alta calidad:** Todos los personajes, criaturas, objetos narrativos y escenarios deben construirse en **TSX/SVG estilizado de alta complejidad**:
  - Mínimo **20 a 35+ trazos `<path>` orgánicos** por personaje (curvas Bézier, pliegues de ropa, mechones de cabello, rasgos faciales/anatómicos — jamás primitivas geométricas rígidas simples).
  - Iluminación cinematográfica en al menos **3 capas de profundidad**: sombras profundas base, degradados `<linearGradient>` / `<radialGradient>`, y luz de borde (*rim light*) coherente con el escenario.
  - **Articulación real en grupos `<g>` independientes y animados** con `useCurrentFrame()` / `interpolate()` / `Math.sin()`: respiración del torso, inclinación de cabeza, parpadeo o brillo sutil en pupilas, movimiento de manos, mechones de cabello y tentáculos.
- **Capas visuales obligatorias (de fondo a frente):**
  1. **Fondo atmosférico 2.5D:** Gradientes profundos y arquitectura/paisaje en perspectiva vectorial con paralaje lento (`0.15×–0.35×`).
  2. **Neblina atmosférica trasera:** Capas radiales/SVG animadas horizontalmente de forma continua.
  3. **Plano Z medio (Escenario + Personajes articulados):** Personajes y entidades SVG/TSX actuando en la escena (escribiendo, reaccionando, acechando, enfrentándose) con movimiento independiente.
  4. **Plano Z cercano (Primer plano):** Marcos/siluetas desenfocadas en los bordes (`1.0×`) que acentúan la profundidad 2.5D.
  5. **Polvo / esporas / partículas atmosféricas:** Motas iluminadas por la fuente de luz de cada escena.
  6. **HUD y Tipografía Cinética:** Tarjetas glassmorphism limpias, expedientes y subtítulos palabra por palabra dentro de Zona Segura.
  7. **Post-procesado VHS:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual en cortes y viñeta perimetral.

---

## 2. Paleta de Colores Oscura

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y capas lejanas |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada por luna fría y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, alertas VHS `REC` |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (términos clave / CTA) |
| `--vhs-cyan` | `#22D3EE` | Reflejos CRT / canal desplazado de aberración cromática |
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

- **Delegación obligatoria a OpenCode (`opencode run`):** Antigravity actúa **únicamente como coordinador, productor de audio y auditor visual**. Antigravity **nunca crea ni edita código dentro de `src/` directamente**; toda la implementación en Remotion/TSX/SVG y actualizaciones de `src/` se delegan obligatoriamente a **OpenCode (DeepSeek V4 Pro)** mediante `opencode run` desde la terminal.

```text
├── AGENTS.md                        # Esta guía permanente de estilo y gobernanza
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP)
│   ├── musica_terror.mp3            # Música dark ambient (duración narración + 2s)
│   └── sfx/
│       ├── knife_scrape.mp3         # Foley atmosférico del episodio
│       ├── vhs_glitch.mp3           # Estática/interferencia en transiciones
│       └── deep_boom.mp3            # Golpe subgrave único en revelaciones clave
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de escenas, transiciones, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── Atmosphere25D.tsx        # Neblina orgánica, esporas/polvo y viñeta frontal 2.5D
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones VHS, whip-pan y corte subgrave
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.12↔0.35), SFX
    └── scenes/
        └── *.tsx                    # Escenas 2.5D vectoriales articuladas del episodio
```

---

## 5. Reglas Técnicas de Remotion y Audio

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: volumen controlado mediante `interpolate()` + pausas del transcript: `0.12` durante voz activa y subida suave a `0.35` en pausas dramáticas y en el cierre final, con fundido limpio a `0.0` al terminar.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en los cortes de escena e impactos puntuales.
- **Animación 100% determinista:** Todas las animaciones derivan exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido usar `Math.random()`, `setTimeout` o transiciones CSS no sincronizadas.
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar 4 capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente (articulación, detalle vectorial, zonas seguras, contraste), eliminar `.preview/` y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual y Dinamismo Sin *Shake* Periódico

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, tarjetas glassmorphism, expedientes y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Dinamismo real entre escenas (cero poses repetidas):**
   - Cada escena debe representar una **situación narrativa distinta con personajes articulados actuando** (investigando en un CRT con manos escribiendo, creador reaccionando a un jumpscare, intruso acechando tras una ventana mientras alguien duerme, duelo cara a cara con entidades animadas).
   - Queda prohibido reutilizar la misma pose o el mismo fondo estático entre escenas.
3. **Estilo Vectorial Oscuro Articulado en 2.5D (cero Fal.ai fotorrealista):**
   - Cada personaje principal o entidad debe tener **20 a 35+ trazos `<path>` orgánicos**, degradados `<linearGradient>` / `<radialGradient>`, sombras profundas, *rim light* y grupos `<g>` independientes animados (torso/respiración, cabeza, pupilas/parpadeo, manos/cabello/tentáculos).
4. **Una única intención de cámara suave por escena (prohibido *shake/zoom* periódico):**
   - Queda **estrictamente prohibido** usar bucles periódicos o temporizadores (`frame % N`) que disparen sacudidas (*shake*) o pulsos de zoom repetitivos.
   - Cada escena usa una única intención de cámara distinta y motivada (ej. *dolly-in* lento y continuo, *pan* lateral suave, avance progresivo lento en eje Z, plano dramático con empuje sutil).
   - Un micro-impacto puntual solo se permite **1 o 2 veces en todo el Short**, exclusivamente sincronizado con un golpe sonoro como `deep_boom.mp3`.
