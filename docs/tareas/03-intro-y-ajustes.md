# Objetivo

Tercera pasada en la rama `ui-valle`. A Pablo le encantó la versión 2. Ahora hay que hacer dos cambios de dirección y cuatro arreglos.

**Trabaja sin hacer preguntas.** Decide, anota y sigue. Siguen vigentes todas las reglas de `AGENTS.md` y de las tareas 01 y 02.

## 1. Quitar la cara del sol

El sol no lleva ojos ni boca. Borra la cara y el seguimiento de los ojos con el puntero. El sol se queda como sol recortado en papel con los rayos girando. Con el puntero, el sol solo participa del parallax como un plano más.

## 2. Intro: la silueta del User Group se dibuja y luego se arma todo

Como la intro de Brusha (tarea 01: una línea que se dibuja en el centro de la pantalla, se convierte en el logo y vuela a la barra de navegación, y luego entra el resto):

1. Pantalla de papel limpia. En el centro, grande, **se dibuja con trazo violeta la silueta del logo**: primero el hexágono (trazo que recorre el contorno con `stroke-dasharray`/`stroke-dashoffset`), luego la caña y las notas dentro del hexágono como trazos y, al lado, el texto **"User Group"** escrito como trazo.
   - Para el texto, usa trazos SVG o el contorno de la tipografía con `stroke` y relleno que aparece al final.
2. El trazo se rellena: aparece el logo real (la imagen `ug-hexagono.webp` + el wordmark en HTML) exactamente donde estaba el trazo.
3. El logo **viaja y se encoge hasta su lugar en la barra de navegación** y queda idéntico al logo de la barra.
   - Puedes medir la posición con el script en línea (como hacía Brusha con `getBoundingClientRect`) o resolverlo con CSS. Si usas JS y no corre, no hay intro y la página se ve normal.
4. Después **se dibuja todo**: los enlaces y el botón de la barra, el titular (con su subrayado violeta que se traza), la descripción y los CTA. Luego las capas del paisaje, una por una desde el fondo: el cielo, los Farallones plano por plano (sus siluetas también pueden entrar como trazo que se dibuja y luego se rellena), el sol bajando, el río, los guayacanes, las cañas, la garza y, al final, notas, nubes y destellos.

Restricciones:

- **Duración total de la intro hasta que el hero queda armado: 3,5 s como máximo.**
- **Rendimiento**: el contenido real (titular, CTA) debe estar en el HTML desde el primer render y contar para LCP. No lo ocultes con `display: none` ni lo dejes con opacidad 0 más allá de la intro. Lighthouse en rendimiento sigue en ≥ 0.95; si la intro lo baja, acórtala o cambia la técnica hasta que pase, y deja el número en el entregable.
- `prefers-reduced-motion: reduce`: sin intro; todo aparece en su sitio de una vez.
- Sin JS: la página se ve completa (la intro puede correr solo con CSS o simplemente no ocurrir).
- La intro corre una sola vez por sesión: si el script lo permite dentro de los 2 KB, usa `sessionStorage` para saltarla en recargas. Al quitar el código de los ojos del sol debería sobrar espacio.
- Nada de bloquear la interacción: si la persona hace clic o scroll durante la intro, que funcione igual.

## 3. Arreglos

1. En el hero, dos grupos de cañas muestran un recuadro de fondo más claro (se nota el rectángulo). Que no haya recuadros visibles en ninguna pieza.
2. En Organizadores, las flores del guayacán tapan el título. Reubícalas para que el título quede libre.
3. En la escena del Pacífico (Cómo unirse) hay mucho vacío entre el botón y el mar. Compacta o llena con algo de la escena (boyas con las redes, olas, una lancha), sin inventar datos.
4. La casilla "Pausar ilustraciones" queda flotando sola abajo a la derecha. Intégrala con mesura, por ejemplo como un control pequeño en el footer o en la barra, sin perder su función (WCAG 2.2.2 pausar movimiento).

## Verificación

- `pnpm verify` pasa (Chrome con `--no-sandbox --headless=new`).
- `dist/` sin archivos `.js`; un único `<script>` en línea de 2 KB como máximo.
- Capturas en `/tmp/ug-capturas/v3/`: las tres medidas de página completa con movimiento reducido, más una **secuencia de la intro** a 1440×900 sin movimiento reducido en 0,5 s, 1,2 s, 2 s, 3 s y 4 s (`intro-0.5s.png`, etc.). Míralas y corrige hasta que la intro se lea clara: trazo del logo, viaje a la barra y armado del paisaje.

## Entregable

Agrega al final de este archivo `## Entregable` con: cambios por archivo, cómo funciona la intro (tiempos), bytes del script, puntajes de Lighthouse, decisiones y rutas de capturas. No hagas commit. Sin menciones a Codex, Claude ni IA.

## Entregable

### Cambios por archivo

- `src/components/IntroMarca.astro` contiene el dibujo violeta del hexágono, la caña, las notas y el texto «User Group».
- `src/components/MejoraPortada.astro` mide el destino del logo y controla la intro y el parallax desde el único script en línea. El sol se desplaza como una capa del paisaje.
- `src/components/Collage.astro` conserva los rayos y elimina la cara del sol. Mueve las cañas por sus grupos SVG para evitar bordes de recorte y mantiene la nota flotante anclada al pentagrama.
- `src/pages/index.astro` monta el dibujo y el script en la portada. `src/layouts/Sitio.astro` integra la casilla de pausa en el pie y permite cargar la mejora después de ese control.
- `src/styles/intro.css` orquesta el trazo, el vuelo y el armado. `src/styles/sitio.css` incorpora esa hoja. `src/styles/escenas.css` ajusta las cañas, separa las flores del título de Organizadores, acerca el mar a los CTA y adapta la pausa al pie.
- `tests/e2e/intro.spec.ts` verifica que el desplazamiento interrumpe la intro, que la recarga la omite y que la pausa funciona con teclado. `tests/e2e/portada-puntero.spec.ts` comprueba el parallax actualizado y la ausencia de cara.

### Secuencia

- De 0 a 0,96 s se dibujan, en ese orden, el hexágono, la caña con las notas y el wordmark. El texto aparece por trazos vectoriales.
- De 0,96 a 1,74 s se revela y vuela el mismo logo de la barra. Su posición inicial toma como referencia el centro del dibujo y su posición final se calcula a partir de la barra.
- Desde 1,70 s entran la navegación, el titular, la descripción, el subrayado y los CTA. Desde 2,14 s entran el cielo, el relieve, el sol, el río, la vegetación, las aves y los detalles musicales. La última pieza termina a los 3,32 s y la secuencia se cierra a los 3,40 s.

### Decisiones

- La intro se guarda por sesión con `sessionStorage`. Se omite en enlaces directos a secciones, con movimiento reducido, si el almacenamiento está bloqueado o si JavaScript está desactivado.
- Un clic, una tecla o el desplazamiento acortan la secuencia y dejan el contenido en su posición final. Los enlaces y el titular están en el HTML inicial.
- La casilla del pie pausa las ilustraciones tanto del hero como de las escenas inferiores. La portada conserva su contenido y los destinos de los CTA.
- El puerto 4321 estaba ocupado. Se ejecutó `pnpm verify` en una copia temporal del mismo código con Playwright en el puerto 4390. Chromium recibió las flags `--no-sandbox --headless=new` de la configuración de Lighthouse del repositorio.

### Verificación

- `dist/` contiene cero archivos `.js` y un único script en línea de 1.999 bytes, en la portada. El 404 queda sin scripts.
- Las capturas de página completa con movimiento reducido quedaron en `/tmp/ug-capturas/v3/375x812.png`, `/tmp/ug-capturas/v3/768x1024.png` y `/tmp/ug-capturas/v3/1440x900.png`.
- La secuencia a 1440×900 quedó en `/tmp/ug-capturas/v3/intro-0.5s.png`, `/tmp/ug-capturas/v3/intro-0.9s.png`, `/tmp/ug-capturas/v3/intro-1.2s.png`, `/tmp/ug-capturas/v3/intro-2s.png`, `/tmp/ug-capturas/v3/intro-3s.png` y `/tmp/ug-capturas/v3/intro-4s.png`. La toma adicional a 0,9 s muestra el wordmark trazado antes de que aparezca el logo.
- `pnpm verify` pasó de punta a punta en la copia temporal con una corrida de Lighthouse por ruta. Se usó la variable `LHCI_COLLECT__NUMBER_OF_RUNS=1` porque la ejecución de seis corridas en un solo proceso se interrumpía. Pasaron 13 pruebas unitarias y 11 de navegador, con cero violaciones de axe.
- Lighthouse pasó también al verificar por tandas tres corridas de cada ruta. Los mínimos fueron 1,00 en rendimiento, 1,00 en accesibilidad, 0,96 en buenas prácticas y 1,00 en SEO. El LCP de la portada estuvo entre 1,05 y 1,06 s.
