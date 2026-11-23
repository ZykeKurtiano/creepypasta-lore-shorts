# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v3)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con ilustración vectorial articulada por jerarquía** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Siren Head, The Rake, etc.).

---

## 1. Identidad Visual Unificada — Estilo Vectorial Oscuro Articulado en 2.5D (Estándar v3)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `45–60 s`.
- **Prohibición de imágenes fotorrealistas estáticas:** Queda **estrictamente prohibido** usar imágenes fotorrealistas estáticas generadas con Fal.ai (ni fotos/recortes PNG estáticos) en esta serie.
- **Construcción TSX/SVG estilizada de alta calidad:** Todos los personajes, criaturas, objetos narrativos y escenarios deben construirse en **TSX/SVG estilizado de alta complejidad**:
  - Mínimo **20 a 35+ trazos `<path>` orgánicos** por personaje (curvas Bézier, pliegues de ropa, mechones de cabello, rasgos faciales/anatómicos — jamás primitivas geométricas rígidas simples).
  - Iluminación cinematográfica en al menos **3 capas de profundidad**: sombras profundas base, degradados `<linearGradient>` / `<radialGradient>`, y luz de borde (*rim light*) coherente con el escenario.
  - **Esqueleto articulado por jerarquía (`<g>` anidados):** Todos los personajes deben incluir grupos `<g>` jerárquicos con `transformOrigin` en articulaciones reales (`torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`) para ejecutar acciones narrativas claras mediante `interpolate` y `spring` (dibujar, retroceder, cubrirse, luchar contra corrupción), nunca solo respirar o mover el cabello.
  - **Personajes secundarios humanos y detallados:** Prohibido usar siluetas genéricas tipo maniquí o cabezas flotantes. Todo personaje secundario (ilustradores, víctimas, proxies) debe tener anatomía estilizada completa: cabello definido, rasgos faciales expresivos (cejas, ojos y boca animados), ropa con pliegues/sombras y paletas acordes al entorno oscuro.
- **Profundidad 2.5D en 3 capas y transiciones espaciales:**
  1. **`background` (Escenario lejano, parallax lento `0.15×–0.35×`):** Gradientes profundos, arquitectura/paisaje/horizonte cósmico en perspectiva vectorial y neblina atmosférica trasera animada continuamente.
  2. **`midground` (Plano Z medio — Escenario activo + Personajes articulados):** Personajes humanos y entidades SVG/TSX actuando con esqueleto jerárquico animado.
  3. **`foreground` (Primer plano cercano, parallax rápido `1.0×–1.4×`):** Elementos cercanos en silueta o desenfoque en los bordes (lámparas, tazas, marcos, escombros, garras/zarcillos) que acentúan la profundidad 2.5D.
  4. **Polvo / esporas / partículas atmosféricas:** Motas iluminadas por la fuente de luz de cada escena.
  5. **HUD y Tipografía Cinética:** Subtítulos palabra por palabra dentro de Zona Segura. **Cero gráficas estáticas para explicar conceptos:** ninguna explicación narrativa puede resolverse con tarjetas de texto o barras de progreso estáticas; todo concepto debe representarse mediante una transformación o escena ilustrada y animada en pantalla.
  6. **Transiciones espaciales limpias:** *camera dive* hacia pantallas/viñetas, *foreground wipes* con siluetas/tentáculos/zarcillos y *split-screen* dinámico o colapso diagonal.
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
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, alertas VHS `REC`, energía carmesí |
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

- **Delegación obligatoria a OpenCode (`opencode run`):** Antigravity actúa **únicamente como coordinador, productor de audio/datos y auditor visual**. Antigravity **nunca crea ni edita código dentro de `src/` directamente** (excepto `src/data/transcript.ts` y `src/data/episodeConfig.ts` vía script de Python); toda la implementación en Remotion/TSX/SVG y actualizaciones de `src/` se delegan obligatoriamente a **OpenCode (`deepseek/deepseek-v4-pro`)** desde la terminal.

```text
├── AGENTS.md                        # Esta guía permanente de estilo y gobernanza (Estándar v3)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP)
│   ├── musica_terror.mp3            # Música dark ambient (duración narración + 2s)
│   └── sfx/                         # Efectos cortos temáticos del episodio (ink_glitch, wall_shatter, deep_boom, etc.)
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de escenas, transiciones espaciales, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── characters/              # Rigs articulados por jerarquía (<g> anidados con transformOrigin real)
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones espaciales (camera dive, foreground wipes, split-screen)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.12↔0.35), SFX
    └── scenes/
        └── *.tsx                    # Escenas 2.5D en 3 capas (background, midground, foreground)
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
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar capturas PNG con `npx remotion still` (cubriendo todas las escenas clave) en `.preview/`, auditarlas multimodalmente (anatomía humana detallada, articulaciones visibles, cero tarjetas estáticas, zonas seguras, contraste), eliminar `.preview/` y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual y Estándar v3

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, preguntas cinéticas y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Dinamismo real entre escenas (cero poses repetidas):**
   - Cada escena debe representar una **situación narrativa distinta con personajes articulados actuando**. Queda prohibido reutilizar la misma pose o el mismo fondo estático entre escenas.
3. **Personajes secundarios humanos y detallados:**
   - Prohibido usar siluetas genéricas tipo maniquí o cabezas flotantes. Todo personaje secundario (ilustradores, víctimas, proxies) debe tener anatomía estilizada completa: cabello definido, rasgos faciales expresivos (cejas, ojos y boca animados), ropa con pliegues/sombras y paletas acordes al entorno oscuro.
4. **Esqueleto articulado por jerarquía (`<g>` anidados):**
   - Todos los personajes deben incluir grupos `<g>` jerárquicos con `transformOrigin` en articulaciones reales (`torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`) para ejecutar acciones narrativas claras mediante `interpolate` y `spring` (dibujar, retroceder, cubrirse, luchar contra corrupción), nunca solo respirar o mover el cabello.
5. **Cero gráficas estáticas para explicar conceptos:**
   - Ninguna explicación narrativa puede resolverse con tarjetas de texto o barras de progreso estáticas. Todo concepto debe representarse mediante una transformación o escena ilustrada y animada en pantalla.
6. **Profundidad 2.5D en 3 capas y transiciones espaciales:**
   - Cada escena debe separar `foreground` (elementos cercanos en silueta/desenfoque con parallax rápido), `midground` (personajes) y `background` (escenario con parallax lento). Usa transiciones espaciales limpias (*camera dive* hacia pantallas/viñetas, *foreground wipes* con siluetas/tentáculos y *split-screen* dinámico).
7. **Una única intención de cámara suave por escena (prohibido *shake/zoom* periódico):**
   - Queda **estrictamente prohibido** usar bucles periódicos o temporizadores (`frame % N`) que disparen sacudidas (*shake*) o pulsos de zoom repetitivos.
   - Cada escena usa una única intención de cámara distinta y motivada (ej. *dolly-in* lento y continuo, *pan* lateral suave, avance progresivo lento en eje Z, plano dramático con empuje sutil).
   - Un micro-impacto puntual solo se permite **1 o 2 veces en todo el Short**, exclusivamente sincronizado con un golpe sonoro como `deep_boom.mp3` o `wall_shatter.mp3`.
