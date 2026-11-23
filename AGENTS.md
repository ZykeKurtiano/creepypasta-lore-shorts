# AGENTS.md — Creepypasta Lore Shorts Template (Estándar v5)

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **motion graphics oscuros 2.5D con anatomía capilar completa, 2-Bone IK con capas Z, locomoción biomecánica con inercia y transiciones continuas estilo Kurzgesagt oscuro** usando Remotion, React, TypeScript y Tailwind CSS. Diseñada para mantener una identidad visual cinematográfica coherente en toda la serie de creepypastas (Slenderman, Smile Dog, Jeff the Killer, Zalgo, Ben Drowned, Eyeless Jack, Siren Head, The Rake, etc.).

---

## 1. Identidad Visual Unificada — Estándar v5 (Anatomía Capilar Completa, 2-Bone IK con Capas Z e Inercia Biomecánica)

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `60–100 s`.
- **Prohibición de imágenes fotorrealistas estáticas:** Queda **estrictamente prohibido** usar imágenes fotorrealistas estáticas generadas con Fal.ai (ni fotos/recortes PNG estáticos) en esta serie.
- **Modelos 2.5D hiperdetallados (`55+` trazos `<path>` por personaje):**
  - Prohibido crear personajes simplificados, maniquíes genéricos, cabezas flotantes o geometrías planas.
  - Todo personaje (protagonistas, entidades, espíritus y secundarios) debe construirse en TSX/SVG de altísima complejidad (**mínimo 55+ trazos `<path>` orgánicos** con curvas Bézier):
    - **Cabello humano esculpido de cobertura completa (Cero efecto "pelón"):** Prohibido dibujar flequillos como líneas verticales sueltas sobre un cráneo ovalado expuesto. Todo personaje humano debe tener `hairBack` (más ancho que el cráneo, enmarcando cuello y orejas) y `hairCrown` + `hairFront` renderizados **encima** de la cabeza (`z-order` superior), cubriendo por completo el 35–40% superior del cráneo de sien a sien con mechones cerrados (`<path fill="...">`), volumen lateral y luz de borde (*rim light*).
    - **Rostro detallado y expresivo:** cejas articuladas, párpados animados, iris con brillo/pupila, nariz sombreada, boca expresiva animada y rasgos narrativos (cicatrices, lágrimas, máscaras agrietadas o heridas).
    - **Vestimenta detallada:** cuellos, solapas/capuchas, pliegues de tela, costuras, vendajes, botones/cordones/hebillas, calzado estructurado, **luz de borde (*rim light*) direccional** coherente con la fuente lumínica de la escena y **oclusión ambiental** en pliegues y uniones.
    - **Esqueleto articulado completo por jerarquía (`<g>` anidados):** cada personaje debe incluir grupos `<g>` jerárquicos con `transformOrigin` en articulaciones anatómicas reales (`pelvis -> torso -> cuello/cabeza`, `hombro -> brazo -> antebrazo -> mano`, `cadera -> rodilla -> tobillo -> calzado`) para ejecutar acciones narrativas claras mediante `interpolate` y `spring`, nunca poses rígidas.
- **2-Bone IK real y capas Z de interacción (Cero manos atravesando objetos):**
  - Ningún brazo puede estirarse más allá de `0.95 * (L1 + L2)` (usando ley de cosenos con clamp estricto).
  - Todo contacto con un objeto (cámara, lámpara, puerta, radiografía, bisturí, marco de ventana) debe calcularse mediante cinemática inversa de 2 segmentos (`hombro -> codo -> muñeca`) aterrizando en la cara frontal/cercana del objeto, renderizando `frontArm` **delante** del prop interactivo (nunca detrás ni asomando por el lado opuesto).
  - Si el objeto está lejos, el personaje debe caminar hacia él antes de extender el brazo.
- **Locomoción biomecánica con inercia y anclaje al suelo (`floorY`):**
  - Prohibido el movimiento pendular simétrico y los personajes flotando al arrodillarse, sentarse o caminar.
  - Todo ciclo de caminata o sigilo debe incluir:
    - Ascenso y descenso de pelvis (`contact pose` vs `passing pose`),
    - Braceo asimétrico en contrafase con retraso de `3–4 frames` (`phase - 0.35`) en antebrazo, cabeza y capucha (*follow-through*),
    - `5 frames` de anticipación antes de sobresaltos, disparos o giros bruscos,
    - Apoyo exacto de pies/rodillas en `floorY` con **sombra elíptica dinámica** proyectada que reacciona a su desplazamiento, peso y altura de zancada.
  - **Física volumétrica en elementos secundarios:** icor/alquitrán líquido, cables, llamas, humo, telas y agua deben dibujarse como **formas volumétricas cerradas (`<path fill="...">`)** con degradados, brillos internos, ondas propagadas en fase y física `spring`.
- **Profundidad 2.5D en 3 capas:**
  1. **`background` (Escenario lejano, parallax lento `0.15×–0.35×`):** Gradientes profundos, arquitectura/paisaje/horizonte en perspectiva vectorial y neblina atmosférica trasera en movimiento continuo.
  2. **`midground` (Plano Z medio — Escenario activo + Personajes articulados):** Plano de suelo `floorY` con sombra de contacto, muebles/objetos interactivos con orden Z correcto (`backArm -> prop -> frontArm`) y personajes con esqueleto completo actuando.
  3. **`foreground` (Primer plano cercano, parallax rápido `1.0×–1.4×`):** Elementos cercanos en silueta o desenfoque en los bordes (marcos, lámparas, ramas, bordes de ventana, gotas, cenizas) que acentúan la profundidad 2.5D.
  4. **Partículas atmosféricas:** polvo, cenizas, esporas, vapor o gotas en suspensión iluminadas por el foco de luz de cada escena.
  5. **HUD y Tipografía Cinética (Cero tarjetas estáticas):** Subtítulos palabra por palabra centrados en Zona Segura. **Queda prohibido usar tarjetas de texto, gráficas o barras estáticas para explicar conceptos:** todo concepto narrativo debe mostrarse mediante una transformación o escena ilustrada y animada en pantalla.
  6. **Post-procesado VHS sutil:** Grano determinista (`feTurbulence`), líneas de escaneo horizontales, aberración cromática puntual únicamente en impactos/transiciones y viñeta perimetral.
- **Transiciones continuas estilo Kurzgesagt oscuro (cero cortes secos):**
  - Queda **estrictamente prohibido** usar cortes secos entre escenas. Toda transición entre escenas debe usar exclusivamente uno de estos 4 lenguajes cinematográficos continuos:
    1. **Divisores arquitectónicos deslizantes:** muros, losas de piedra negra, paredes, marcos de puerta o bordes que barren horizontal o diagonalmente la pantalla revelando la siguiente escena mientras la cámara sigue en movimiento continuo.
    2. **Aislamiento por cono de luz (*spotlight*):** oscurecimiento progresivo del fondo en siluetas profundas mientras un haz volumétrico de luz recorta al protagonista o al reflejo clave.
    3. **Paneles divididos dinámicos (*split-screen grid*):** ventanas, viñetas o mitades de encuadre que se abren, deslizan o colapsan con bordes animados para mostrar múltiples eventos en paralelo o contraponer dos realidades.
    4. **Zoom-through continuo:** la cámara atraviesa ventanas, lentes de cámara, espejos o marcos de puerta para sumergirse directamente en la siguiente escena.

---

## 2. Paleta de Colores Oscura

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y capas lejanas |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada por luna fría y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, alertas VHS `REC`, sangre/cicatrices |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (términos clave / CTA) |
| `--cobalt-mask` | `#1D4ED8` | Azul cobalto de la máscara / reflejos lunares fríos |
| `--vhs-cyan` | `#22D3EE` | Reflejos de vidrio/lente / canal desplazado de aberración cromática |
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
├── AGENTS.md                        # Esta guía permanente de estilo y gobernanza (Estándar v5)
├── opencode.json                    # Configuración de permisos para ejecución autónoma de OpenCode
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs MCP — uso exclusivo para voz)
│   ├── musica_terror.mp3            # Música dark ambient sintetizada localmente (duración narración + ~6s)
│   └── sfx/                         # Efectos cortos temáticos sintetizados localmente
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de escenas, transiciones continuas, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del episodio, duración exacta y límites de escenas
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── characters/              # Rigs v5 (55+ <path>, cabello 3 capas, 2-Bone IK, inercia biomecánica, floorY)
    │   ├── SafeZone.tsx             # Contenedor centrado estricto (paddingInline: 90)
    │   ├── SceneTransitions.tsx     # Transiciones continuas estilo Kurzgesagt oscuro
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
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar capturas PNG con `npx remotion still` (una por escena) en `.preview/`, auditarlas multimodalmente (cabello completo 3 capas sin efecto pelón, 2-Bone IK delante de props sin atravesarlos, pies/rodillas apoyados en `floorY` con sombra, transiciones continuas, cero tarjetas estáticas, zonas seguras, contraste), eliminar `.preview/` y verificar `npx tsc --noEmit`.

---

## 6. Reglas Permanentes de Dirección Visual (Estándar v5)

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos, preguntas cinéticas y subtítulos palabra por palabra deben centrarse estrictamente en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`, `paddingInline: 90`).
2. **Cabello humano esculpido de cobertura completa (Cero efecto "pelón"):**
   - Prohibido dibujar flequillos como líneas verticales sueltas sobre un cráneo ovalado expuesto. Todo personaje humano debe tener `hairBack` (más ancho que el cráneo, enmarcando cuello y orejas) y `hairCrown` + `hairFront` renderizados **encima** de la cabeza (`z-order` superior), cubriendo por completo el 35–40% superior del cráneo de sien a sien con mechones cerrados (`<path fill="...">`), volumen lateral y luz de borde.
3. **2-Bone IK real y capas Z de interacción (Cero manos atravesando objetos):**
   - Ningún brazo puede estirarse más allá de `0.95 * (L1 + L2)`. Todo contacto con un objeto (cámara, lámpara, puerta, radiografía, bisturí, marco de ventana) debe calcularse mediante cinemática inversa de 2 segmentos (`hombro -> codo -> muñeca`) aterrizando en la cara frontal/cercana del objeto, renderizando `frontArm` **delante** del prop interactivo (nunca detrás ni asomando por el lado opuesto). Si el objeto está lejos, el personaje debe caminar hacia él antes de extender el brazo.
4. **Locomoción biomecánica con inercia y anclaje al suelo (`floorY`):**
   - Prohibido el movimiento pendular simétrico y los personajes flotando al arrodillarse o sentarse. Todo ciclo de caminata/sigilo debe incluir ascenso y descenso de pelvis (`contact` vs `passing pose`), braceo asimétrico en contrafase con retraso de `3–4 frames` (`phase - 0.35`) en antebrazo y cabeza (*follow-through*), `5 frames` de anticipación antes de sobresaltos o giros bruscos, y apoyo exacto en `floorY` con sombra elíptica reactiva.
5. **Dinamismo real entre escenas y cero tarjetas estáticas:**
   - Cada escena debe representar una situación narrativa distinta con personajes articulados actuando. Ninguna explicación narrativa puede resolverse con tarjetas de texto o barras estáticas: todo concepto debe representarse mediante una transformación o escena ilustrada y animada en pantalla.
6. **Transiciones continuas estilo Kurzgesagt oscuro (cero cortes secos):**
   - Usar exclusivamente divisores arquitectónicos deslizantes, aislamiento por cono de luz (*spotlight*), paneles divididos dinámicos (*split-screen grid*) y *zoom-through* continuo por ventanas/lentes/espejos.
7. **Una única intención de cámara suave por escena (prohibido *shake/zoom* periódico):**
   - Queda **estrictamente prohibido** usar bucles periódicos o temporizadores (`frame % N`) que disparen sacudidas (*shake*) o pulsos de zoom repetitivos.
   - Cada escena usa una única intención de cámara distinta y motivada (ej. *dolly-in* continuo, *pan* lateral suave, avance progresivo en eje Z, plano dramático con empuje sutil).
   - Un micro-impacto puntual solo se permite **1 o 2 veces en todo el Short**, exclusivamente sincronizado con un golpe sonoro como `deep_boom.mp3` o un impacto `spring` clave.
