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
