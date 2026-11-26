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
