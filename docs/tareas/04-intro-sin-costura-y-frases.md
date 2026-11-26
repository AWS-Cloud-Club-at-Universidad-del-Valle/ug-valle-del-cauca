# Tarea 04: intro sin costura, hero quieto, logo protagonista y frases del Valle

Lee `AGENTS.md` y los briefs `01` a `03` de esta carpeta. **Trabaja sin hacer preguntas**: decide lo más conservador, anótalo en el entregable y sigue.

## Lo que pidió el dueño (en sus palabras, resumido)

1. **El paso del dibujo al logo se nota.** La primera parte, el trazo dibujándose, está muy bien. Pero cuando el trazo se cambia por la imagen del logo (`ug-hexagono.webp`) se ve el corte. Tiene que ser una sola pieza: el trazo termina y el logo "se rellena" sin salto de posición, tamaño, grosor ni color, y luego vuela a la barra.
   - Opciones válidas: alinear al píxel el SVG del trazo con la imagen (mismo `viewBox` y caja), hacer un relleno progresivo (clip o máscara que avanza) en vez de un fundido cruzado, o que el logo final sea el mismo SVG rellenado y no un bitmap.
   - Elige la que se vea mejor. Compruébalo con capturas cuadro a cuadro de la transición.
2. **Nada se mueve con el mouse.** Quita el parallax por puntero (`--mx`/`--my`) del hero y de cualquier escena. Las animaciones propias, como el vaivén o los rayos, pueden quedarse.
   - Borra el código del script que ya no se use.
   - Ajusta o elimina `tests/e2e/portada-puntero.spec.ts` para que pruebe lo nuevo: que el hero no cambia con el puntero.
3. **El logo del User Group tiene que estar más presente en el hero**, después de la intro. Hoy queda perdido. Dale un lugar protagonista y bien ubicado en la composición de la portada, sin tapar el titular ni el CTA (`cta-principal`).
4. **Que se sienta todavía más Valle del Cauca.** Hazlo con detalles, no con más ruido:
   - farallones de Cali, cañaduzales, guadua, samanes, el río Cali;
   - la salsa: tambores, timbal, disco de acetato;
   - la luz de la tarde caleña.
   - Es una mejora de lo que ya hay, sin rehacer todo.
5. **Frases de la tierra en los fondos de las escenas** (`Escena.astro`: cali, calima, tren, guayacanes, pacifico).
   - Frases cortas del Valle y de su salsa, en tipografía grande y sutil dentro de la ilustración: baja opacidad, como pintadas en un muro o recortadas en papel. Algunos ejemplos:
     - "Bienvenidos al User Group Valle del Cauca"
     - "Cali pachanguero"
     - "Cielo de tambores"
     - "¡Oiga, mire, vea!"
     - "Cali es Cali, lo demás es loma"
     - "Ve, ¿y qué más pues?"
     - "Del Pacífico pa'l mundo"
   - **Solo títulos o frases de 2 a 6 palabras**, nunca versos de canciones.
   - Una por escena, que cuadre con el lugar.
   - Son decorativas: `aria-hidden="true"` y que no compitan en contraste con el texto real.
   - La de bienvenida va en la primera escena o en el hero.
   - El efecto que se busca es "sutil pero brutal".
6. **Rendimiento.** Mídelo antes y después (Lighthouse y el peso de `dist/`). Busca dónde se puede bajar:
   - el CSS es de unos 20 KB: quita reglas muertas, simplifica filtros SVG costosos (`feTurbulence` repetido) y anima solo `transform` y `opacity`;
   - usa `will-change` solo donde haga falta;
   - revisa el `content-visibility` de las escenas, el peso del logo y la fuente con `preload` y `font-display`;
   - el LCP y el CLS no pueden empeorar.

## Archivos permitidos

- `src/**`
- `public/**`
- `tests/e2e/**`
- este brief, para agregar el entregable al final.

## Archivos prohibidos

- `infra/**`
- `.github/**`
- `package.json` y `pnpm-lock.yaml`, salvo que lo justifiques.
- `lighthouserc.json`
- `AGENTS.md`

## Restricciones

- Siguen valiendo todas las de `AGENTS.md`:
  - un solo script en línea de 2 KB como máximo, solo como mejora progresiva;
  - la página completa y usable sin JS;
  - con `prefers-reduced-motion` no hay intro ni movimiento;
  - cero violaciones de axe;
  - Lighthouse ≥ 0.95.
- Se mantienen los testid `cta-principal`, `evento-proximo`, `eventos-vacio` y `enlace-sbg`.
- Sin menciones a Codex, Claude ni IA en ningún archivo. No hagas commit.

## Verificación

1. `pnpm verify` en verde.
2. Capturas en `/tmp/ug-capturas/v5/`:
   - la transición del trazo al logo, cuadro a cuadro (8 cuadros o más);
   - el hero final en escritorio (1440×900) y en móvil (390×844);
   - cada escena con su frase.

## Entregable

Agrega al final de este brief:

- qué cambiaste en cada punto;
- la técnica elegida para la transición y por qué;
- las frases que usaste en cada escena;
- las métricas antes y después: Lighthouse, LCP, CLS, peso del CSS, bytes del script y peso total de `dist/`;
- la ruta de las capturas.

## Entregable

- **Intro.** El emblema se dibuja en su caja original de 319 × 368. Una máscara SVG usa los píxeles del mismo WebP para pintar el borde desde el primer trazo. Entre 0,91 y 1,29 s, un rectángulo sube dentro de la máscara y descubre el relleno sobre el dibujo. El emblema lleno viaja hasta la caja de la imagen de la barra a los 1,60 s. El nombre del grupo entra en la barra al aterrizar. El dibujo central se concentra en el hexágono, la caña y las notas. El hero termina de armarse antes de los 2,35 s.
- **Puntero.** Se retiraron el seguimiento, las variables de desplazamiento y las reacciones al pasar sobre el sol, los árboles y las fichas. Se conservaron el giro de los rayos, el vaivén y el control de pausa. La prueba de navegador congela las animaciones autónomas y comprueba que el puntero no cambia la composición.
- **Marca en la portada.** El hexágono oficial ocupa el tercio derecho del paisaje en escritorio y el centro de la franja inferior en móvil, separado del titular y los CTA.
- **Paisaje y salsa.** El relieve y las franjas cálidas del atardecer enmarcan el río Cali. Se añadieron un samán en la ribera, surcos de cañaduzal y guadua en primer plano. El acetato y el timbal quedaron integrados a la escena nocturna de Cali.
- **Rendimiento.** Se reemplazó el ruido de los filtros SVG por una textura estática de 1.058 bytes compartida por el hero y las escenas. El vuelo, el relleno y la entrada usan transformaciones y opacidad, con el desplazamiento del trazo SVG durante el dibujo. Se mantuvieron el WebP original de 15.322 bytes, el preload de Archivo con `font-display: swap` y `content-visibility: auto` en las escenas. No se añadió `will-change`. La intro se reproduce una vez por sesión y se omite con movimiento reducido, sin JavaScript o al entrar por un enlace a una sección.

### Frases

| Escena     | Frase                                     | Lugar                                 |
| ---------- | ----------------------------------------- | ------------------------------------- |
| Cali       | Bienvenidos al User Group Valle del Cauca | Barrio Obrero, Cali · Valle del Cauca |
| Calima     | Que sople el viento                       | Lago Calima · Calima El Darién        |
| Tren       | Entre caña y rieles                       | Zona cañera · Valle del Cauca         |
| Guayacanes | Cali pachanguero                          | Cali · Valle del Cauca                |
| Pacífico   | Cielo de tambores                         | Buenaventura · Valle del Cauca        |

Los rótulos van al pie de las ilustraciones. La frase es decorativa y usa `aria-hidden="true"`. El lugar se lee sobre papel claro con contraste AA y queda disponible para lectores de pantalla.

### Enlaces del grupo

El botón principal lleva a Meetup y el enlace secundario a Instagram. Ambos se ven en la barra, la portada, Cómo unirse y el pie. En móvil, los enlaces de la barra quedan debajo del logo y del menú. El estado sin eventos también lleva a Meetup. La descripción conserva `ejemplo: true` y la prueba unitaria sigue cubriendo el uso de Instagram cuando falta Meetup.

### Mediciones

Lighthouse móvil con tres corridas por ruta y la configuración del repositorio. Los puntajes son el mínimo entre portada y 404. LCP y CLS son medianas de las tres corridas de cada ruta. Los pesos se midieron en bytes sin comprimir.

| Métrica             |    Antes |  Después |
| ------------------- | -------: | -------: |
| Rendimiento         |     1,00 |     1,00 |
| Accesibilidad       |     1,00 |     1,00 |
| Buenas prácticas    |     0,96 |     0,96 |
| SEO                 |     1,00 |     1,00 |
| LCP de la portada   |  1,053 s |  0,753 s |
| LCP del 404         |  0,755 s |  0,756 s |
| CLS en ambas rutas  |        0 |        0 |
| CSS compilado       | 20.782 B | 19.257 B |
| Script en línea     |  1.999 B |    839 B |
| Archivos de `dist/` | 92.865 B | 93.303 B |

### Verificación y capturas

- `pnpm verify` en verde con 13 pruebas unitarias, 12 de navegador, cero violaciones de axe y seis corridas de Lighthouse. El puerto 4321 estaba ocupado. Para la ejecución completa se usó una copia temporal con Playwright en el puerto 4396. Chromium usó las flags `--no-sandbox --headless=new` mediante `CHROME_PATH`.
- `/tmp/ug-capturas/v5/` contiene 17 cuadros de la intro, las portadas a 1440 × 900 y 390 × 844 y las cinco escenas con su frase en ambos tamaños. Se revisó el borde del hexágono ampliado antes, durante y después del relleno.
- Las capturas de esta ronda quedaron en `/tmp/ug-capturas/v6/`, con el hero y las cinco escenas a 1440 × 900 y 390 × 844.
