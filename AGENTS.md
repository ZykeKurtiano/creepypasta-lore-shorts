# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v4+)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con modelos vectoriales hiperdetallados, física orgánica y transiciones dinámicas** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual cinematográfica coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Siren Head, The Rake, etc.).

---

## 1. Identidad Visual Unificada — Estándar v4+ (Modelos Detallados, Física y Transiciones Dinámicas)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `60–95 s`.
- **Prohibición de imágenes fotorrealistas estáticas:** Queda **estrictamente prohibido** usar imágenes fotorrealistas estáticas generadas con Fal.ai (ni fotos/recortes PNG estáticos) en esta serie.
- **Modelos 2.5D hiperdetallados (`45+` trazos `<path>` por personaje):**
  - Prohibido crear personajes simplificados, maniquíes genéricos, cabezas flotantes o geometrías planas.
  - Todo personaje (protagonistas, entidades, espíritus y secundarios) debe construirse en TSX/SVG de altísima complejidad (**mínimo 45+ trazos `<path>` orgánicos** con curvas Bézier):
    - **Rostro detallado y expresivo:** cejas articuladas, párpados animados, iris con brillo/pupila, nariz sombreada, boca expresiva animada y mechones de cabello en múltiples capas con luz y sombra.
    - **Vestimenta detallada:** cuellos, solapas/capuchas, pliegues de tela, costuras, botones/cordones/hebillas, calzado estructurado, **luz de borde (*rim light*) direccional** coherente con la fuente lumínica de la escena y **oclusión ambiental** en pliegues y uniones.
    - **Esqueleto articulado completo por jerarquía (`<g>` anidados):** cada personaje debe incluir grupos `<g>` jerárquicos con `transformOrigin` en articulaciones anatómicas reales (`torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`, `cadera -> rodilla -> tobillo -> calzado`) para ejecutar acciones narrativas claras mediante `interpolate` y `spring`, nunca poses rígidas.
- **Locomoción real y acoplamiento físico:**
  - Todo personaje debe pisar un **plano de suelo real** con **sombra elíptica dinámica** proyectada que reacciona a su desplazamiento, peso y altura de zancada.
  - Los desplazamientos deben ejecutarse con **ciclos reales de zancada y braceo** (`interpolate` / `spring` en caderas, rodillas, tobillos y brazos), jamás trasladando un personaje en bloque con pose congelada.
  - **Física volumétrica en elementos secundarios:** cables, llamas, zarcillos de glitch, telas y agua deben dibujarse como **formas volumétricas cerradas (`<path fill="...">`)** con degradados, brillos internos, ondas propagadas en fase y reacción física al entorno.
- **Profundidad 2.5D en 3 capas:**
  1. **`background` (Escenario lejano, parallax lento `0.15×–0.35×`):** Gradientes profundos, arquitectura/paisaje/horizonte en perspectiva vectorial y neblina atmosférica trasera en movimiento continuo.
  2. **`midground` (Plano Z medio — Escenario activo + Personajes articulados):** Plano de suelo con sombra de contacto, muebles/objetos interactivos y personajes con esqueleto completo actuando.
  3. **`foreground` (Primer plano cercano, parallax rápido `1.0×–1.4×`):** Elementos cercanos en silueta o desenfoque en los bordes (marcos, lámparas, cables, bordes CRT, escombros, gotas) que acentúan la profundidad 2.5D.
  4. **Partículas atmosféricas:** polvo, esporas, brasas o gotas en suspensión iluminadas por el foco de luz de cada escena.
  5. **HUD y Tipografía Cinética (Cero tarjetas estáticas):** Subtítulos palabra por palabra centrados en Zona Segura. **Queda prohibido usar tarjetas de texto, gráficas o barras estáticas para explicar conceptos:** todo concepto narrativo debe mostrarse mediante una transformación o escena ilustrada y animada en pantalla.
  6. **Post-procesado VHS sutil:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual únicamente en impactos/transiciones y viñeta perimetral.
- **Transiciones dinámicas estilo Kurzgesagt (adaptadas a terror oscuro 2.5D):**
  - Queda **estrictamente prohibido** usar cortes secos entre escenas. Toda transición entre escenas debe usar exclusivamente uno de estos 4 lenguajes cinematográficos continuos:
    1. **Divisores arquitectónicos deslizantes:** muros, paredes en ruinas, marcos de puerta o bordes de monitor CRT que barren horizontal o diagonalmente la pantalla revelando la siguiente escena mientras la cámara sigue en movimiento continuo.
    2. **Aislamiento por cono de luz (*spotlight*):** oscurecimiento progresivo del fondo en siluetas profundas mientras un haz volumétrico de luz recorta al protagonista o al reflejo clave.
    3. **Paneles divididos dinámicos (*split-screen grid*):** ventanas, viñetas o mitades de encuadre que se abren, deslizan o colapsan con bordes animados para mostrar múltiples eventos en paralelo o contraponer dos realidades.
    4. **Zoom-through continuo:** la cámara atraviesa pantallas CRT, superficies de agua con ondas físicas o marcos de puerta para sumergirse directamente en la siguiente escena.

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
| `--vhs-cyan` | `#22D3EE` | Reflejos CRT / agua abisal / canal desplazado de aberración cromática |
| `--vhs-magenta` | `#F43F5E` | Canal opuesto de aberración cromática |
| `--corrupt-green` | `#22C55E` | Corrupción digital CRT / fósforo verde / aura de cartucho maldito |

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

- **Delegación obligatoria a OpenCode:** Antigravity actúa **únicamente como coordinador, productor de audio/datos y auditor visual**. Antigravity **nunca crea ni edita código dentro de `src/` directamente** (excepto `src/data/transcript.ts` y `src/data/episodeConfig.ts` vía script de Python); toda la implementación en Remotion/TSX/SVG y actualizaciones de `src/` se delegan obligatoriamente a **OpenCode (`deepseek/deepseek-v4-pro`)**.

```text
├── AGENTS.md                        # Esta guía permanente de estilo y gobernanza (Estándar v4+)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP — uso exclusivo para voz)
│   ├── musica_terror.mp3            # Música dark ambient sintetizada localmente (duración narración + ~6s)
│   └── sfx/                         # Efectos cortos temáticos sintetizados localmente
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de escenas, transiciones dinámicas, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── characters/              # Rigs hiperdetallados 45+ <path> con esqueleto completo y sombra en suelo
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones estilo Kurzgesagt oscuro (divisores, spotlight, split-screen, zoom-through)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD diegético
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.28↔0.52), SFX
    └── scenes/
        └── *.tsx                    # Escenas 2.5D en 3 capas (background, midground, foreground)
```

---

## 5. Reglas Técnicas de Remotion y Audio

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking audible:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: volumen controlado mediante `interpolate()` + pausas del transcript: `0.28` durante voz activa y subida suave a `0.52` en pausas dramáticas y en el cierre final, con fundido limpio a `0.0` al terminar.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en las transiciones de escena e impactos puntuales.
- **Animación 100% determinista:** Todas las animaciones derivan exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido usar `Math.random()`, `setTimeout` o transiciones CSS no sincronizadas.
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente (anatomía 45+ `<path>`, pisada con sombra en el suelo, transiciones dinámicas, cero tarjetas estáticas, zonas seguras, contraste), eliminar `.preview/` y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual (Estándar v4+)

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, preguntas cinéticas y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Dinamismo real entre escenas (cero poses repetidas):**
   - Cada escena debe representar una **situación narrativa distinta con personajes articulados actuando**. Queda prohibido reutilizar la misma pose o el mismo fondo estático entre escenas.
3. **Modelos 2.5D hiperdetallados (45+ `<path>` por personaje):**
   - Rostro completo (cejas articuladas, párpados, iris con brillo, nariz sombreada, boca expresiva, mechones de cabello en capas con luz y sombra) y ropa detallada (cuellos, pliegues, costuras, botones/cordones, `rim light` y oclusión ambiental).
4. **Esqueleto completo, locomoción real y acoplamiento físico:**
   - Jerarquía `<g>` completa (`torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`, `cadera -> rodilla -> tobillo -> calzado`), pisada sobre plano de suelo con sombra elíptica dinámica, ciclos reales de zancada/braceo y formas volumétricas cerradas (`<path fill="...">`) con ondas físicas para cables, llamas, glitch y agua.
5. **Cero gráficas o tarjetas estáticas para explicar conceptos:**
   - Ninguna explicación narrativa puede resolverse con tarjetas de texto o barras de progreso estáticas. Todo concepto debe representarse mediante una transformación o escena ilustrada y animada en pantalla.
6. **Transiciones dinámicas estilo Kurzgesagt oscuro (prohibido cortes secos):**
   - Usar exclusivamente divisores arquitectónicos deslizantes, aislamiento por cono de luz (*spotlight*), paneles divididos dinámicos (*split-screen grid*) y *zoom-through* continuo (CRT, agua, marcos de puerta).
7. **Una única intención de cámara suave por escena (prohibido *shake/zoom* periódico):**
   - Queda **estrictamente prohibido** usar bucles periódicos o temporizadores (`frame % N`) que disparen sacudidas (*shake*) o pulsos de zoom repetitivos.
   - Cada escena usa una única intención de cámara distinta y motivada (ej. *dolly-in* continuo, *pan* lateral suave, avance progresivo en eje Z, plano dramático con empuje sutil).
   - Un micro-impacto puntual solo se permite **1 o 2 veces en todo el Short**, exclusivamente sincronizado con un golpe sonoro como `deep_boom.mp3` o un impacto `spring` clave.
