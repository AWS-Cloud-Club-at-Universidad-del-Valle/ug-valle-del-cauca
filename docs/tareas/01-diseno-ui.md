# Objetivo

Construir la interfaz completa de la página de inicio (fase 2) con una identidad que se sienta **del Valle del Cauca**: un hero tipo "collage de papel" animado, inspirado en la mecánica del componente de referencia _Brusha_ (descrito abajo), pero **portado a Astro + SVG + CSS, con cero JavaScript en el cliente** y con motivos y colores propios del Valle y del UG.

El éxito del sitio es que el visitante se suscriba al Meetup o, si no hay Meetup, siga al grupo en Instagram. Todo el diseño empuja hacia el CTA principal.

**Trabaja sin hacer preguntas.** Si algo es ambiguo, elige la opción más conservadora que cumpla `AGENTS.md`, anótala en la sección "Decisiones" de tu entregable y sigue.

## Contexto

- Reglas del repo: [`AGENTS.md`](../../AGENTS.md) (léelas completas: español de Colombia, cero JS, WCAG 2.2 AA, Lighthouse ≥ 0.95, sin contenido inventado, anti-objetivos de diseño).
- [Spec](../superpowers/specs/2026-11-25-sitio-awsug-valle-design.md), en especial §6 (secciones de la página) y §7 (identidad visual).
- Página actual: `src/pages/index.astro` (mínima, sin estilos). Lógica ya hecha y probada: `src/lib/cta.ts` (`resolverCta`) y `src/lib/eventos.ts` (`separarEventos`).

## Referencia: qué tomar del componente Brusha

Brusha es un hero en React. **No copies su código ni sus imágenes** (la niña, el logo y el texto son de otro estudio). Toma sus ideas y llévalas a CSS:

1. **Tarjeta de hero a pantalla completa** (`min-height: 100svh`; en escritorio ≥1024px exactamente una pantalla, sin scroll) con una **textura de grano de papel** encima (un `::after` con un SVG `feTurbulence` en data-URI, `mix-blend-mode: multiply`, opacidad ~0.2).
2. **Una unidad de layout `--u`** = 1% del ancho del hero (`container-type: inline-size; --u: 1cqw`, y en ≥1024px `--u: min(1cqw, 1.5625svh)`). Tipografía, espacios e ilustración escalan juntos.
3. **Titular enorme**: mayúsculas, peso 800, interlineado ~0.9. Cada línea sube desde detrás de su propia máscara al cargar (`overflow: hidden` en un span + animación `translate`). Debajo, descripción corta, **CTA principal en píldora** con flecha que gira a ↗ en hover/focus y se hunde un poco al hacer clic, y un enlace secundario subrayado.
4. **Entrada escalonada con CSS puro**: una clase `.enter` con `animation: enter var(--dur) cubic-bezier(.22,1,.36,1) var(--delay) backwards` y variables por elemento. Orden: barra de navegación → titular → descripción → CTA → piezas de la ilustración → detalles pequeños.
5. **Ilustración en franja inferior**: varias piezas SVG independientes posicionadas en un marco común de 1424 × 457 unidades (cada pieza con `left/top/width` en % de ese marco), anclada al borde inferior del hero. En móvil la franja se dibuja más ancha que la pantalla (≈240%) y se recorta centrada en el motivo principal. En tablet vertical, 175%.
6. **Textura de papel por pieza** con un filtro SVG `<filter>` (`feTurbulence` + `feComposite arithmetic`, sin cambiar el brillo), aplicado a cada pieza y no a toda la franja.
7. **Movimiento en reposo**: cada planta se mece desde su base (`transform-box: fill-box; transform-origin: 50% 100%`) con su propio ritmo, dirección y retraso (duraciones de 2 a 5 s, `alternate`, `ease-in-out`), para que nada se mueva al unísono. Una pieza flotante sube y baja despacio. Si hay ondas de agua, se desplazan lateralmente en bucle (un período exacto, para que no salten).
8. **Reacciones al hover** solo en las formas pintadas (`pointer-events: visiblePainted` en los SVG; el resto de la ilustración con `pointer-events: none` para no tapar los CTA): una hoja se agita, una flor crece 10%, el sol crece 12%.
9. **`prefers-reduced-motion: reduce`** apaga todas las animaciones y transiciones de movimiento.
10. **Navegación**: logo a la izquierda; enlaces de sección y botón de CTA a la derecha. En móvil, los enlaces van en un menú desplegable hecho con `<details>/<summary>` (sin JS), accesible con teclado.

Lo que Brusha hacía con JS (ojos que siguen el cursor, pausar animaciones fuera de pantalla) **se omite**.

## Identidad: que se sienta del Valle del Cauca

- **Paleta**: la base sale del logo del UG (spec §7): **azul noche** casi negro, **violeta** del borde del logo, blanco y un neutro cálido. Encima, **acentos del Valle** que se usan sobre todo en la ilustración: verde de caña de azúcar, dorado o naranja de atardecer caleño, azul de río. Si usas los colores de la bandera del Valle del Cauca, **verifícalos con una búsqueda web** y cita la fuente en el entregable. Define todo como variables CSS en un solo archivo de tokens, con un comentario que diga que el azul y el violeta son provisionales hasta tener el logo original.
- **Motivos de la ilustración** (con mesura, recortados en papel, sin fotos ni personas):
  - silueta de los **Farallones de Cali** (cordillera) como colinas del fondo;
  - **cañas de azúcar** que se mecen, en lugar de las plantas de Brusha;
  - **notas musicales de salsa** flotando, en lugar del pájaro y la estrella;
  - un **sol de atardecer**;
  - el **río** con ondas, en lugar de las colinas azules;
  - el **hexágono** de los AWS User Groups como una pieza recortada.
  
  Nada de íconos genéricos ni emojis.
- **Tipografía**: una display ancha y pesada para el titular y una sans legible para el texto. Si usas fuentes web, deben ser de licencia libre (OFL), en `woff2` alojado en `public/fonts/` con su licencia al lado, solo pesos y glifos latinos que uses, con `font-display: swap` y `preload` de la principal. No agregues paquetes npm para esto.
- **Anti-objetivos** (de `AGENTS.md`): nada de hero con gradiente genérico, ni grillas de 3 tarjetas con ícono, ni emojis decorativos, ni textos tipo "empoderamos la innovación", ni fotos de stock, ni mezcla de estilos. Los textos son concretos y en tono de comunidad caleña, sin exagerar.

## Contenido de la página (spec §6)

Hero → Qué es el UG (incluida la línea para estudiantes con el SBG) → Próximos eventos (con estado vacío digno) → Lo que hemos hecho (con Tech Day Cali, techdaycali.com, destacado) → Organizadores → Cómo unirse / redes → Footer (comunidad independiente, parte del programa AWS User Groups, enlace al repo `https://github.com/AWS-Cloud-Club-at-Universidad-del-Valle/ug-valle-del-cauca`).

- **No inventes datos**: fechas, nombres, cifras, fotos o cuentas de redes. Todo sale de `src/content/` (sitio, eventos, organizadores). Si una sección necesita un campo que no existe en el esquema, muestra solo lo que hay y anota en el entregable qué campo faltaría.
- **Logo**: todavía no tenemos el original. Crea `src/components/Logo.astro` con un marcador de posición sobrio: un hexágono + el texto "aws User Group · Valle del Cauca", con "Valle del Cauca" en violeta. Debe ser fácil de reemplazar por la imagen real cambiando solo ese componente. Puede tener una animación de entrada simple en CSS (trazo que se dibuja con `stroke-dasharray`), desactivada con movimiento reducido.

## Archivos permitidos

- `src/pages/index.astro`, `src/pages/404.astro` (que el 404 use el mismo layout y estilo)
- `src/layouts/**`, `src/components/**`, `src/styles/**` (nuevos)
- `public/fonts/**`, `public/img/**` (solo SVG o fuentes que tú crees o que tengan licencia libre)
- `tests/e2e/*.spec.ts`: puedes **agregar** pruebas; no borres ni debilites las que existen
- `docs/tareas/01-diseno-ui.md`: solo para agregar tu entregable al final

## Archivos prohibidos

`src/content/**` (esquemas y contenido), `src/content.config.ts`, `src/lib/**`, `scripts/**`, `package.json`, `pnpm-lock.yaml`, `lighthouserc.json`, `.github/**`, `infra/**`, `AGENTS.md`, `CLAUDE.md`. No agregues dependencias ni integraciones de Astro (nada de React, `motion` ni `lucide-react`).

## Interfaz a respetar

- Conserva los `data-testid` existentes: `cta-principal` (el CTA del hero, con destino `resolverCta(sitio)`), `evento-proximo`, `eventos-vacio` y `enlace-sbg`.
- Usa `resolverCta` y `separarEventos` tal cual; las fechas se muestran en `America/Bogota` como ya hace la página.
- **Cero JS en el cliente**: ningún `<script>` ni `client:*` en las páginas. Comprueba que `dist/` no tenga archivos `.js` después del build: `find dist -name '*.js' | wc -l` debe dar `0`.
- HTML semántico: un solo `h1`, landmarks (`header`, `nav`, `main`, `footer`), foco visible y contraste AA en todo el texto, incluido el texto sobre la ilustración.

## Verificación

1. `pnpm verify` pasa de punta a punta (check, lint, tests, build, links, e2e con axe y Lighthouse ≥ 0.95 en las cuatro categorías).
2. `find dist -name '*.js' | wc -l` da `0`.
3. Capturas con Playwright de la página construida a 375×812, 768×1024 y 1440×900, con movimiento reducido (para que salgan quietas), guardadas **fuera del repo** en `/tmp/ug-capturas/`. Revísalas tú mismo y corrige solapamientos, texto cortado o desbordes antes de entregar.

## Entregable

Al final de este archivo agrega una sección `## Entregable` con:

- resumen de lo que hiciste, por archivo;
- paleta final (variables y valores) y fuentes usadas, con licencia;
- decisiones que tomaste sin preguntar;
- campos de contenido que faltarían;
- salida final resumida de `pnpm verify` y rutas de las capturas.

No hagas commit: deja los cambios sin commitear para que el orquestador los revise. Ningún archivo ni mensaje puede mencionar a Codex, Claude ni IA.
