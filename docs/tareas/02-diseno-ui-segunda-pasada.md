# Objetivo

Segunda pasada sobre la interfaz de la tarea 01 (misma rama `ui-valle`). La primera versión cumple lo técnico, pero visualmente se queda corta. Ahora la página tiene que quedar **brutal**: cada sección es una escena distinta del Valle del Cauca, hecha como collage de papel animado, con el nivel de detalle y vida del componente _Brusha_ de referencia (tarea 01).

**Trabaja sin hacer preguntas.** Decide, anota tus decisiones en el entregable y sigue.

Todas las reglas de la tarea 01 y de `AGENTS.md` siguen vigentes: cero JS en el cliente, WCAG 2.2 AA, Lighthouse ≥ 0.95 en las cuatro categorías, `prefers-reduced-motion` apaga todo el movimiento, nada de contenido inventado, mismos `data-testid`, mismos archivos permitidos y prohibidos (puedes agregar este archivo y nuevos componentes).

## Problemas de la versión actual

1. **El hero es pobre.** Es una sola montaña plana, las cañas parecen maíz y el sol es un disco liso. El hexágono del paisaje lleva una hoja genérica.
2. **Todas las secciones son iguales**: título grande a la izquierda y texto a la derecha, separadas por líneas, con mucho vacío. Se vuelve monótono.
3. **En móvil**, la nube y los "+" quedan encima de la montaña y se pierden.
4. **Sobran** `public/img/logo/ug-hexagono.png` y `public/img/logo/ug-logo-completo.webp`: bórralos si no se usan.

## 1. Hero: atardecer en los Farallones de Cali

Que tenga la riqueza de Brusha, unas 20 piezas recortadas en papel, cada una en su capa, con textura y movimiento propio:

- **Fondo**: cielo de atardecer en franjas recortadas (de violeta a durazno y luego dorado), con un sol cuyos rayos giran muy lento (una vuelta por minuto) y que crece al pasar el mouse.
- **Farallones de Cali** en 3 o 4 planos de profundidad, con siluetas de picos irregulares reconocibles, del más lejano y claro al más cercano y oscuro.
- **Guayacanes en flor** (árbol icónico de Cali), uno amarillo y uno rosado, con copas de flores recortadas que se mecen. Al pasar el mouse sueltan o agitan pétalos con CSS puro.
- **Cañaduzal** en primer plano: cañas de verdad, con tallo segmentado por nudos y hojas largas, finas y arqueadas, no hojas anchas. Que se meza por grupos a ritmos distintos.
- **Río** (Pance o Cali) atravesando, con ondas que se desplazan en bucle y piedras de río.
- **Garzas blancas** (una o dos) volando lento o paradas en el río; el ala se mueve.
- **Notas de salsa** saliendo en curva de la escena, como en el logo (clave de sol, pentagrama ondulado), flotando con desfase.
- **Nubes de línea** y **destellos "+" violeta**, como en el logo, en el cielo y nunca encima de las montañas en móvil.
- **El hexágono** del paisaje lleva la **caña** del logo (blanca, con notas), no una hoja. Puedes usar la propia imagen `ug-hexagono.webp` como pieza recortada o redibujarla en SVG.
- **Entrada** escalonada desde abajo, por profundidad, con el sol bajando desde arriba (como el sol de Brusha), y luego los detalles.
- **Tipografía del hero**: mantén el titular grande y agrega una pequeña animación de línea dibujada (trazo violeta) que subraye "Valle del Cauca".

## 2. Cada sección, una escena distinta del Valle

Rompe el patrón "título a la izquierda, texto a la derecha": cada sección tiene su propia composición y su ilustración. Entre secciones, en vez de líneas, usa **bordes de papel rasgado** (SVG o `clip-path`) que dejan ver la sección de abajo. Propuesta (puedes mejorarla):

| Sección             | Escena                                                                                                                 | Composición sugerida                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Qué es el UG        | **Noche caleña**: fondo azul noche del logo, estrellas "+" violeta que titilan, notas de salsa, guirnalda de bombillos | Texto centrado y ancho; los tres puntos (charlas, talleres, networking) como notas en un pentagrama, no como tarjetas con ícono |
| Próximos eventos    | **Lago Calima**: agua azul verdosa, lomas verdes, veleros y tablas de windsurf que cruzan despacio, líneas de viento   | El evento (o el estado vacío) como una vela o un boleto de papel sobre el lago                                                  |
| Lo que hemos hecho  | **Cañaduzal y tren cañero**: filas de caña en perspectiva y un tren de vagones de caña que pasa                        | Tech Day Cali como un sello o un boleto grande destacado; los eventos pasados como vagones o una línea de tiempo sobre la vía   |
| Organizadores       | **Guayacanes**: ramas con flores amarillas y rosadas                                                                   | Cada persona como una foto tipo polaroid colgada de una rama, levemente girada, que se endereza al pasar el mouse               |
| Cómo unirse / redes | **Pacífico vallecaucano**: mar de Bahía Málaga con una ballena jorobada que saca la cola cada tanto                    | CTA principal grande y centrado; las redes como boyas o botellas flotando                                                       |
| Footer              | Silueta de la cordillera en azul noche y destellos                                                                     | Logo, texto de relación con AWS y enlace al repo                                                                                |

Reglas para las escenas:

- **Coherencia de estilo**: todo es el mismo papel recortado con textura (el mismo filtro y grano), la misma paleta de tokens y el mismo lenguaje de movimiento (mecerse desde la base, flotar, entrar escalonado). Nada de mezclar estilos.
- **Movimiento al hacer scroll sin JS**: usa `animation-timeline: view()` para que cada escena entre al aparecer en pantalla, envuelto en `@supports (animation-timeline: view())`. Sin soporte, la escena se ve completa y quieta.
- **Rendimiento**: `content-visibility: auto` con `contain-intrinsic-size` en las secciones bajo el pliegue. Anima solo `transform` y `opacity`. Ilustraciones como SVG en línea, compactas (reutiliza piezas con `<use>` o componentes con props).
- **Accesibilidad**: las ilustraciones son decorativas (`aria-hidden`) y no bloquean clics (`pointer-events` solo en formas con hover). Todo el texto sobre escenas cumple contraste AA; si hace falta, ponlo sobre un papel liso.
- **Textos**: pocos y concretos, en tono de comunidad caleña. No inventes datos. Donde falte contenido, usa lo que hay en `src/content/`.

## 3. Móvil

- Los elementos del cielo (nube, "+", notas) se reubican en móvil para que no queden sobre las montañas: usa posiciones distintas por punto de quiebre.
- Cada escena se recorta centrada en su motivo principal.

## 4. Limpieza

Borra los PNG y WebP del logo que no se usen.

## Verificación

1. `pnpm verify` pasa (con el ajuste de Chromium que ya usaste si hace falta; `lighthouserc.json` en `main` ya trae `--no-sandbox`).
2. `find dist -name '*.js' | wc -l` da `0`.
3. Capturas nuevas en `/tmp/ug-capturas/v2/` a 375×812, 768×1024 y 1440×900. Página completa con movimiento reducido y, además, una del hero sin movimiento reducido después de 6 s. **Míralas tú y corrige** lo que se vea pobre, vacío, solapado o cortado. Itera hasta que cada escena se vea rica y terminada.

## Entregable

Agrega al final de este archivo una sección `## Entregable` con: cambios por archivo, escenas y piezas de cada sección, decisiones tomadas, salida resumida de `verify` y rutas de las capturas. No hagas commit. Ningún archivo ni mensaje menciona a Codex, Claude ni IA.

## Entregable

### Cambios por archivo

- `src/components/Collage.astro` dibuja el atardecer, aloja las figuras SVG compartidas e incluye el script en línea que sigue al puntero.
- `src/components/Escena.astro` reúne las ilustraciones bajo el pliegue y la cordillera del pie.
- `src/pages/index.astro` compone las escenas alrededor de los datos de sitio, eventos y organizadores. Conserva los destinos y los identificadores de prueba.
- `src/layouts/Sitio.astro` añade la cordillera al pie de la portada. El 404 sigue usando el mismo layout.
- `src/styles/escenas.css` define la composición, los bordes rasgados, el movimiento por profundidad y los recortes. `src/styles/sitio.css` comparte la base del sitio. `src/styles/tokens.css` reúne los colores nuevos y el grano de papel.
- `tests/e2e/portada-puntero.spec.ts` comprueba el seguimiento, la pausa fuera de pantalla, el puntero táctil, el movimiento reducido y la portada con JavaScript desactivado.
- Se retiraron `public/img/logo/ug-hexagono.png` y `public/img/logo/ug-logo-completo.webp`. El hexágono WebP existente se utiliza en el logo y en el paisaje.

### Escenas

| Sección                     | Piezas                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atardecer en los Farallones | Cielo de tres tonos, sol con rayos móviles y pupilas, cuatro planos de relieve, río con ondas y piedras, dos garzas, dos guayacanes, cuatro grupos de caña, hexágono, nubes, destellos y pentagrama de salsa. |
| Noche caleña                | Guirnalda, edificios, destellos y un pentagrama para las tres actividades.                                                                                                                                    |
| Lago Calima                 | Boleto de papel, lomas, capas de agua, viento, velero y tabla de windsurf.                                                                                                                                    |
| Cañaduzal                   | Filas en perspectiva, vía, locomotora y tres vagones. Tech Day Cali es un boleto destacado y el historial sigue la vía.                                                                                       |
| Guayacanes                  | Ramas de flores amarillas y rosadas, pétalos y fichas colgadas. Las fichas usan las fotos disponibles en la colección.                                                                                        |
| Bahía Málaga                | Bruma, lomas de la costa, olas, cola de ballena jorobada y enlaces con forma de boya.                                                                                                                         |
| Pie                         | Cordillera recortada y cruces violetas detrás del logo y los enlaces.                                                                                                                                         |

### Decisiones

- Los paisajes son interpretaciones en papel. El hero conserva el texto del YAML, y el río evoca el Pance.
- Las ilustraciones entran con el desplazamiento en navegadores compatibles con `animation-timeline: view()`. Con movimiento reducido o sin soporte para la línea de tiempo, las escenas inferiores quedan completas y quietas.
- El script guarda las dimensiones y las renueva tras el desplazamiento, el cambio de tamaño o la intersección. Escribe las variables de movimiento en un solo cuadro de animación y suspende el trabajo fuera de pantalla. La casilla del hero pausa el collage y las ilustraciones inferiores.
- En las capturas de página completa se habilitó el pintado fuera de pantalla para mostrar todas las secciones. El sitio usa `content-visibility: auto` durante la navegación.
- Durante la verificación se normalizó temporalmente el Markdown de la tarea anterior para que pasara Prettier. Se restauró ese archivo al terminar. Chromium recibió `--no-sandbox --headless=new` mediante `CHROME_PATH`, sin editar la configuración del repositorio.

### Verificación

- Capturas revisadas con movimiento reducido en `/tmp/ug-capturas/v2/375x812.png`, `/tmp/ug-capturas/v2/768x1024.png` y `/tmp/ug-capturas/v2/1440x900.png`. La captura animada a los seis segundos quedó en `/tmp/ug-capturas/v2/hero-1440x900-6s.png`.
- Se comprobó que `dist` contiene cero archivos JavaScript y un solo `<script>` en línea de 1.997 bytes, en la portada. El 404 tiene cero scripts.
- `pnpm verify` completó Astro check, lint, 13 pruebas unitarias, el build, la revisión de enlaces y 9 pruebas de navegador con cero violaciones de axe. Los mínimos de Lighthouse en seis corridas de la portada y el 404 fueron 1.00 en rendimiento, 1.00 en accesibilidad, 0.96 en buenas prácticas y 1.00 en SEO.
