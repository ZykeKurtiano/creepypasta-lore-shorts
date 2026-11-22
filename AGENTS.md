# AGENTS.md — Creepypasta Lore Shorts Template

Guía maestra reutilizable para producir **YouTube Shorts verticales (1080×1920, 9:16, 30 fps)** de terror psicológico en **2.5D / motion graphics oscuros** con Remotion, React, TypeScript y Tailwind CSS. Diseñada para adaptar rápidamente este repositorio a futuros personajes de creepypastas (Slenderman, Jeff the Killer, Ben Drowned, Siren Head, The Rake, Smile Dog, etc.).

---

## 1. Identidad Visual y Estética 2.5D

- **Formato:** `1080 × 1920` px (relación de aspecto `9:16`), `30 fps`, duración objetivo `45–55 s`.
- **Estilo:** Terror psicológico atmosférico en **2.5D** — sin dependencias de video stock ni assets raster pesados. Todo el entorno se compone por capas vectoriales SVG/CSS con paralaje en profundidad Z, niebla orgánica en movimiento, silueta vectorial animada del ente protagonista y post-procesado analógico estilo cinta VHS.
- **Capas visuales obligatorias (de fondo a frente):**
  1. **Cielo / Vacío nocturno:** Gradiente radial profundo con viñeta agresiva en bordes.
  2. **Plano Z lejano (Bosque/Escenario distante):** Siluetas difuminadas con desplazamiento lento (`0.15×` de la cámara) y baja opacidad.
  3. **Neblina atmosférica trasera:** Capas SVG/radiales animadas horizontalmente con `useCurrentFrame()` y `Math.sin()`.
  4. **Plano Z medio (Entorno + Personaje):** Árboles/arquitectura intermedia (`0.45×`) y la silueta vectorial SVG del personaje con animación procedural (respiración, tentáculos dinámicos con curvas Bézier, aparición progresiva, glitches de teletransporte).
  5. **Plano Z cercano (Primer plano):** Ramas/troncos desenfocados en los laterales (`1.0×`) que acentúan el efecto de profundidad 2.5D.
  6. **Neblina frontal + partículas / esporas:** Bruma tenue en movimiento continuo.
  7. **HUD y Tipografía Cinética:** Títulos de acto, artefactos de archivo paranormal (fechas, registros de foro, señal perdida) y subtítulos palabra por palabra.
  8. **Post-procesado VHS:** Grano de cinta animado determinista, líneas de escaneo (`scanlines`), aberración cromática sutil (desplazamiento RGB cian/rojo en picos de tensión), parpadeo de tracking y cortes con estática VHS entre actos.

---

## 2. Paleta de Colores Oscura

| Token | Hex | Uso principal |
| :--- | :--- | :--- |
| `--bg-void` | `#040507` | Fondo base, sombras absolutas, viñeta |
| `--bg-forest-deep` | `#0A1014` | Cielo nocturno y capas lejanas del bosque |
| `--bg-mist-slate` | `#162129` | Planos medios, neblina fría, siluetas secundarias |
| `--fog-cold` | `#2B3A42` | Bruma iluminada por luna fría y reflejos tenues |
| `--text-bone` | `#F2EFE9` | Subtítulos base, títulos de alto contraste |
| `--accent-blood` | `#DC2626` | Palabra activa / resaltado de tensión, alertas VHS `REC` |
| `--accent-crimson-dark` | `#7F1D1D` | Resplandores inquietantes, sombras sangrientas |
| `--accent-pale-yellow` | `#FDE047` | Resaltado alternativo de alto impacto (términos clave / CTA) |
| `--vhs-cyan` | `#22D3EE` | Canal desplazado de aberración cromática |
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
- **Posición de Subtítulos Cinéticos:** A **`~66%` de altura** (`y ≈ 1240px–1300px`), siempre por encima de `1440px`, perfectamente centrados en el eje horizontal (`left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`) con márgenes laterales seguros (`paddingInline: 90px`) para no chocar jamás con la columna derecha de iconos.
- **Elementos de fondo (bosque, niebla, grano VHS, viñeta):** Sí ocupan el `100%` del lienzo `1080×1920` a sangre completa.

---

## 4. Estructura Modular de Escenas (Reutilizable)

El proyecto sigue una arquitectura desacoplada para clonar y sustituir fácilmente el personaje, guion y audio en futuros episodios:

```text
├── AGENTS.md                        # Esta guía de estilo y arquitectura
├── public/
│   ├── narracion.mp3                # Locución principal (ElevenLabs)
│   ├── musica_terror.mp3            # Música dark ambient (duración narración + 2s)
│   └── sfx/
│       ├── vhs_glitch.mp3           # Estática/interferencia en transiciones
│       ├── deep_boom.mp3            # Golpe subgrave en revelaciones clave
│       └── forest_wind.mp3          # Ambiente de viento/bosque en apertura/cierre
└── src/
    ├── Root.tsx                     # Registro de composición 1080x1920 @ 30fps con duración dinámica
    ├── MainComposition.tsx          # Orquestador maestro de actos, audio y capas globales
    ├── data/
    │   ├── episodeConfig.ts         # Metadatos del personaje, duración exacta y límites de los 4 actos
    │   └── transcript.ts            # Tiempos exactos palabra por palabra (start/end en segundos)
    ├── components/
    │   ├── ForestParallax25D.tsx    # Escenario 2.5D multi-capa (árboles Z, niebla, cámara lenta)
    │   ├── CharacterSilhouette.tsx  # Silueta SVG animada del personaje (ej. Slenderman + tentáculos)
    │   ├── VhsPostProcess.tsx       # Grano determinista, scanlines, aberración cromática y glitch
    │   ├── KineticSubtitles.tsx     # Subtítulos palabra por palabra dentro de la zona segura (~66%)
    │   └── AudioMaster.tsx          # Mezcla: narración (1.0), música con ducking (0.12↔0.35), SFX
    └── scenes/
        ├── Act1Hook.tsx             # Acto 1 (~0–5s): Gancho atmosférico e impacto inicial
        ├── Act2Origin.tsx           # Acto 2 (~5–22s): Origen real, archivo visual y viralización
        ├── Act3Abilities.tsx        # Acto 3 (~22–40s): Poderes, distorsión y síntomas del ente
        └── Act4Outro.tsx            # Acto 4 (~40–50s+): Cierre perturbador y CTA de comentarios
```

### Cómo adaptar esta plantilla a otra Creepypasta
1. Reemplaza los audios en `public/` (`narracion.mp3`, `musica_terror.mp3`, `sfx/`).
2. Actualiza `src/data/episodeConfig.ts` y `src/data/transcript.ts` con los nuevos tiempos palabra por palabra y la nueva duración total (`ceil(audioDurationSec * 30) + 45` frames).
3. Sustituye `CharacterSilhouette.tsx` por el SVG animado del nuevo personaje y ajusta los motivos gráficos de los 4 actos en `src/scenes/`.

---

## 5. Reglas Técnicas de Remotion y Audio

- **Duración dinámica:** `durationInFrames = Math.ceil(narrationDurationSeconds * 30) + 45` (45 frames = 1.5 s de cierre atmosférico).
- **Mezcla de audio con Ducking:**
  - `narracion.mp3`: volumen constante `1.0`.
  - `musica_terror.mp3`: volumen controlado mediante `interpolate()` (y detección de pausas del transcript): `0.12` durante segmentos con voz activa y subida suave a `0.35` en pausas dramáticas y en el cierre final.
  - `sfx/`: integrados con `<Sequence>` y `<Audio>` en los cortes de acto, impactos y atmósfera inicial.
- **Animación 100% determinista:** Todas las animaciones deben derivar exclusivamente de `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, `spring()` y `random(seed)` de Remotion. Prohibido usar `Math.random()`, `setTimeout` o transiciones CSS no sincronizadas.
- **Rutas con espacios (Windows):** Encerrar siempre las rutas entre comillas dobles en comandos CLI (`"C:\Creepypastas IA\video-slenderman"`).
- **Verificación visual obligatoria:** Antes de renderizar el MP4 final, exportar 4 capturas PNG con `npx remotion still` (una por acto) en `.preview/` y auditar zonas seguras, contraste tipográfico y estética 2.5D.

---

## 6. Reglas Obligatorias de Dirección Visual, Centrado y Dinamismo Multi-Escena (Futuros Episodios)

Estas 3 reglas aplican de forma **estricta y obligatoria** para todos los futuros Shorts de creepypastas generados con esta plantilla:

1. **Centrado estricto de textos y subtítulos:**
   - Todos los títulos en pantalla y subtítulos dinámicos palabra por palabra deben estar **perfectamente centrados en el eje horizontal** usando:
     - `left: 0`, `right: 0`, `width: '100%'`, `display: 'flex'`, `justifyContent: 'center'`, `textAlign: 'center'`
   - Mantener siempre márgenes laterales seguros (`paddingInline: 90px`) para evitar que cualquier texto o píldora de subtítulo choque con la columna derecha de iconos de YouTube Shorts o los bordes del lienzo.

2. **Narrativa multi-escena en 2.5D (prohibido usar un solo fondo estático):**
   - Está prohibido mantener un único escenario o fondo repetitivo durante todo el video.
   - Cada vez que el guion cambie de subtema o idea, el video debe ejecutar una **transición dinámica** (corte con interferencia VHS, barrido rápido / *whip-pan* o cambio de plano) hacia un **escenario 2.5D distinto** acorde con lo narrado.
   - Incluir **siluetas humanas viviendo la situación narrada** en cada entorno: por ejemplo, personas experimentando el suceso en el lugar, alguien escribiendo o investigando la historia frente a una computadora en penumbra, rumores y archivos propagándose en foros/redes, etc.

3. **Mayor dinamismo en animaciones y cámara:**
   - Evitar planos estáticos en cualquier acto.
   - Mantener **movimiento continuo de cámara en 2.5D**: balanceo suave tipo cámara en mano y golpes de zoom con `spring()` sincronizados con palabras clave o revelaciones del guion.
   - Acompañar cada escena con **animaciones secundarias vivas**: parpadeo de luces o monitores, movimiento de manos/cuerpos en siluetas, partículas flotantes, neblina orgánica en desplazamiento y efectos ambientales acordes al momento narrativo.

