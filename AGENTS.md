# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v6)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con Actuación Facial Dinámica (`ExpressionRig`), Macro-Zooms en Detalles, Transiciones con Zoom Continuo, Rim Light 360°, anatomía capilar completa de 3 capas, 2-Bone IK con capas Z y locomoción biomecánica con inercia** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual cinematográfica coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Eyeless Jack, Tails Doll, Siren Head, The Rake, etc.).

---

## 1. Identidad Visual Unificada — Estándar v6 (Actuación Facial Dinámica, Macro-Zooms, Zoom Continuo y Rim Light 360°)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `60–100 s`.
- **Prohibición de imágenes fotorrealistas estáticas:** Queda **estrictamente prohibido** usar imágenes fotorrealistas estáticas generadas con Fal.ai (ni fotos/recortes PNG estáticos) en esta serie.
- **Modelos 2.5D hiperdetallados (`65–75+` trazos `<path>` por personaje):**
  - Prohibido crear personajes simplificados, maniquíes genéricos, cabezas flotantes o geometrías planas.
  - Todo personaje (protagonistas, entidades, espíritus y secundarios) debe construirse en TSX/SVG de altísima complejidad (**mínimo 65–75+ trazos `<path>` orgánicos** con curvas Bézier):
    - **Cabello humano esculpido de cobertura completa en 3 capas (Cero efecto "pelón"):** Prohibido dibujar flequillos como líneas verticales sueltas sobre un cráneo ovalado expuesto. Todo personaje humano debe tener `hairBack` (más ancho que el cráneo, enmarcando cuello y orejas) y `hairCrown` + `hairFront` renderizados **encima** de la cabeza (`z-order` superior), cubriendo por completo el 35–40% superior del cráneo de sien a sien con mechones cerrados (`<path fill="...">`), volumen lateral y luz de borde (*rim light*).
    - **Actuación Facial Dinámica (`ExpressionRig` obligatorio):** Prohibidos los rostros estáticos o inexpresivos. Todo personaje humano debe implementar morfología facial animada en tiempo real (`eyebrowAngle`, `eyelidOpen`, `pupilScale`, `mouthState`, `sweatDrops`, `darkCircles`) con esclerótica, iris/pupila, párpados articulados y boca con interior anatómico (`labios + dientes + lengua`), cambiando de emoción conforme a lo que vive en pantalla (`joy` / entusiasmo, `unease` / inquietud, `panic` / terror con pupilas contraídas y boca abierta, `paranoia` / agotamiento y ojeras marcadas).
    - **Silueta Completa con *Rim Light* 360° y Movimiento Continuo:** Todo personaje debe incluir vestimenta detallada (cuellos, solapas/capuchas, pliegues de tela, costuras, vendajes, botones/cordones/hebillas, calzado estructurado), oclusión ambiental en pliegues y **luz de contorno (*rim light*) direccional 360°** en piernas, calzado, pantalones, torso, brazos y cabello para que ninguna extremidad —especialmente las inferiores— se pierda jamás en fondos oscuros. Además, el personaje debe mantener micro-movimientos activos cada 2 segundos (respiración torácica, parpadeo natural, ajuste de manos/dedos, tensión cervical o desplazamiento sutil de peso).
    - **Esqueleto articulado completo por jerarquía (`<g>` anidados):** cada personaje debe incluir grupos `<g>` jerárquicos con `transformOrigin` en articulaciones anatómicas reales (`pelvis -> torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`, `cadera -> rodilla -> tobillo -> calzado`) para ejecutar acciones narrativas claras mediante `interpolate` y `spring`, nunca poses rígidas.
- **2-Bone IK real y capas Z de interacción (Cero manos atravesando objetos):**
  - Ningún brazo puede estirarse más allá de `0.95 * (L1 + L2)` (usando ley de cosenos con clamp estricto).
  - Todo contacto con un objeto (control de Sega Saturn/PS2, disco, televisor, lámpara, puerta, radiografía, bisturí, marco de ventana) debe calcularse mediante cinemática inversa de 2 segmentos (`hombro -> codo -> muñeca`) aterrizando en la cara frontal/cercana del objeto, renderizando `frontArm` **delante** del prop interactivo (nunca detrás ni asomando por el lado opuesto).
  - Si el objeto está lejos, el personaje debe caminar hacia él antes de extender el brazo.
- **Locomoción biomecánica con inercia y anclaje al suelo (`floorY`):**
  - Prohibido el movimiento pendular simétrico y los personajes flotando al arrodillarse, sentarse o caminar.
  - Todo ciclo de caminata, retroceso o sigilo debe incluir:
    - Ascenso y descenso de pelvis (`contact pose` vs `passing pose`),
    - Braceo asimétrico en contrafase con retraso de `3–4 frames` (`phase - 0.35`) en antebrazo, cabeza y ropa (*follow-through*),
    - `5 frames` de anticipación antes de sobresaltos, giros bruscos o impactos,
    - Apoyo exacto de pies/rodillas en `floorY` con **sombra elíptica dinámica** proyectada que reacciona a su desplazamiento, peso y altura de zancada.
  - **Física volumétrica en elementos secundarios:** energía/brillo de gemas, cables, llamas, humo, telas, estática y agua deben dibujarse como **formas volumétricas cerradas (`<path fill="...">`)** con degradados, brillos internos, ondas propagadas en fase y física `spring`.
- **Coreografía de Cámara Multi-Plano y *Macro-Zooms* (`2.2x–3.2x`):**
  - Queda **prohibido** mantener una escena entera en un único plano fijo.
  - Cada escena debe ejecutar al menos **3 cambios de encuadre internos** (ej. Plano General → Plano Medio → *Macro Close-Up* `2.2x–3.2x`) sincronizados con los momentos exactos del guion: cada vez que la narración mencione una parte del cuerpo, un rasgo expresivo, un detalle de la entidad o un objeto clave (la gema roja, los ojos negros, el rostro en pánico, la bandeja expulsando el disco, las costuras en la rendija), la cámara debe dirigir un zoom suave pero decidido directamente a ese detalle usando `transformOrigin` exacto y curvas `Easing`.
  - Prohibido el *shake* o zoom periódico mecánico (`frame % N`); todo movimiento de cámara responde a la narrativa y a golpes sonoros puntuales.
- **Transiciones Espectaculares con *Zoom* Continuo (cero cortes secos ni barridos planos):**
  - Queda **estrictamente prohibido** usar cortes secos entre escenas. Sustituir barridos simples por transiciones cinematográficas de cámara con aceleración exponencial (*Whip-Zoom* y *Dive-Through*):
    1. **Gem-Dive Zoom / Object Dive-Through:** acelerar la cámara haciendo zoom exponencial dentro de una gema luminosa, lente, pantalla CRT o bandeja óptica hasta sumergirse en la siguiente escena.
    2. **Pupil-Dive Zoom:** acercamiento exponencial atravesando la pupila dilatada del protagonista hacia un recuerdo, pesadilla o mundo poligonal 3D.
    3. **Doorway / Architectural Zoom-Through:** cruzar el umbral de una puerta entreabierta, pasillo o ventana con paralaje acelerado.
    4. **Paneles divididos dinámicos (*split-screen grid*) y flash diagonal:** mitades o diagonales animadas que se abren o colapsan con profundidad Z y destello lumínico para contraponer dos realidades o épocas.
- **Profundidad 2.5D en 3 capas:**
  1. **`background` (Escenario lejano, parallax lento `0.15×–0.35×`):** Gradientes profundos, arquitectura/paisaje/horizonte en perspectiva vectorial y neblina atmosférica trasera en movimiento continuo.
  2. **`midground` (Plano Z medio — Escenario activo + Personajes articulados):** Plano de suelo `floorY` con sombra de contacto, muebles/objetos interactivos con orden Z correcto (`backArm -> prop -> frontArm`) y personajes con esqueleto completo y *rim light* 360° actuando.
  3. **`foreground` (Primer plano cercano, parallax rápido `1.0×–1.4×`):** Elementos cercanos en silueta o desenfoque en los bordes (marcos, lámparas, cables, bordes de monitor/puerta, partículas) que acentúan la profundidad 2.5D.
  4. **Partículas atmosféricas:** polvo, cenizas, chispas de CRT o destellos carmesí en suspensión iluminados por el foco de luz de cada escena.
  5. **HUD y Tipografía Cinética (Cero tarjetas estáticas):** Subtítulos palabra por palabra centrados en Zona Segura. **Queda prohibido usar tarjetas de texto, gráficas o barras estáticas para explicar conceptos:** todo concepto narrativo debe mostrarse mediante una transformación o escena ilustrada y animada en pantalla.
  6. **Post-procesado VHS sutil:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual únicamente en impactos/transiciones y viñeta perimetral.

---

## 2. Paleta de Colores Oscura

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y capas lejanas |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, gema roja, alertas VHS `REC` |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (términos clave / CTA) |
| `--amber-plush` | `#D97706` | Felpa ámbar/naranja desgastada y destellos retro |
| `--vhs-cyan` | `#22D3EE` | Reflejos CRT / rim light frío / canal desplazado de aberración cromática |
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

- **Delegación obligatoria a OpenCode:** Antigravity actúa **únicamente como coordinador, productor de audio/datos y auditor visual**. Antigravity **nunca crea ni edita código dentro de `src/` directamente** (excepto `src/data/transcript.ts` y `src/data/episodeConfig.ts` vía script de Python); toda la implementación en Remotion/TSX/SVG y actualizaciones de `src/` se delegan obligatoriamente a **OpenCode (`deepseek/deepseek-v4-pro`)**.

```text
├── AGENTS.md                        # Esta guía permanente de estilo y gobernanza (Estándar v6)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP — uso exclusivo para voz)
│   ├── musica_terror.mp3            # Música dark ambient sintetizada localmente (duración narración + ~10s)
│   └── sfx/                         # Efectos cortos temáticos sintetizados localmente
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de escenas, transiciones con zoom continuo, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de las 6 escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── characters/              # Rigs v6 (70+ <path>, ExpressionRig, cabello 3 capas, Rim Light 360°, 2-Bone IK, floorY)
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones con zoom continuo (Gem-Dive, Pupil-Dive, Whip-Zoom, Doorway Zoom-Through)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración puntual y HUD diegético
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.28↔0.52), SFX
    └── scenes/
        └── *.tsx                    # Escenas 2.5D en 3 capas con Multi-Plano y Macro-Zooms (2.2x–3.2x)
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
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente (expresiones faciales dinámicas acordes a cada emoción, cabello completo 3 capas sin efecto pelón, piernas/calzado con *rim light* 360° visibles, 2-Bone IK delante de props sin atravesarlos, pies/rodillas apoyados en `floorY` con sombra, *macro-zooms*, transiciones continuas, cero tarjetas estáticas, zonas seguras, contraste), eliminar `.preview/` y `.prompts/`, y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual (Estándar v6)

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, preguntas cinéticas y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Actuación Facial Dinámica (`ExpressionRig` obligatorio):**
   - Prohibidos los rostros estáticos o inexpresivos. Todo personaje humano implementa `eyebrowAngle`, `eyelidOpen`, `pupilScale`, `mouthState`, `sweatDrops` y `darkCircles`, con esclerótica, iris/pupila, párpados articulados y boca con interior (`labios + dientes + lengua`), transitando en tiempo real entre `joy`, `unease`, `panic` y `paranoia` según el guion.
3. **Cabello humano esculpido de cobertura completa en 3 capas (Cero efecto "pelón"):**
   - Prohibido dibujar flequillos como líneas verticales sueltas sobre un cráneo ovalado expuesto. Todo personaje humano debe tener `hairBack`, `hairCrown` y `hairFront` renderizados en capas Z correctas, cubriendo el 35–40% superior del cráneo de sien a sien con mechones cerrados (`<path fill="...">`), volumen lateral y *rim light*.
4. **Silueta Completa con *Rim Light* 360° y Movimiento Continuo:**
   - Todo personaje debe tener *rim light* direccional en piernas, calzado, torso, brazos y cabello para que las extremidades inferiores nunca se pierdan en fondos oscuros, más micro-movimientos activos cada ~2 segundos.
5. **2-Bone IK real y capas Z de interacción (Cero manos atravesando objetos):**
   - Ningún brazo puede estirarse más allá de `0.95 * (L1 + L2)`. Todo contacto con objetos (controles, disco, puerta, televisor) usa cinemática inversa de 2 segmentos aterrizando en la cara frontal del prop con `frontArm` renderizado **delante** del objeto.
6. **Locomoción biomecánica con inercia y anclaje al suelo (`floorY`):**
   - Ascenso/descenso de pelvis, braceo asimétrico con *follow-through*, anticipación de 5 frames antes de sobresaltos y apoyo exacto en `floorY` con sombra elíptica reactiva.
7. **Coreografía de Cámara Multi-Plano y *Macro-Zooms* (`2.2x–3.2x`):**
   - Mínimo 3 cambios de encuadre internos por escena (Plano General → Plano Medio → *Macro Close-Up* `2.2x–3.2x`) dirigidos exactamente a detalles mencionados por la narración. Prohibido *shake/zoom* periódico (`frame % N`); micro-impactos puntuales solo sincronizados con golpes sonoros clave.
8. **Transiciones Espectaculares con *Zoom* Continuo y cero tarjetas estáticas:**
   - Usar exclusivamente *Whip-Zoom*, *Gem-Dive Zoom*, *Pupil-Dive Zoom*, *Doorway Zoom-Through* y paneles divididos dinámicos con aceleración exponencial. Ningún concepto se explica con tarjetas de texto o barras estáticas.
