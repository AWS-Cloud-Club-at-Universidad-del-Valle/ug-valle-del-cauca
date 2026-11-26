# Tarea 09: enlaces externos en pestaña nueva, íconos de marca, tarjetas parejas y tren

Lee `AGENTS.md` y los entregables de las tareas 04, 07 y 08 de esta carpeta. **Trabaja sin hacer preguntas.** Cuando tengas una duda, decide lo más conservador, anótalo en el entregable y sigue.

## Qué pidió el dueño

1. **Enlaces externos en pestaña nueva.** Todo enlace que sale del sitio (Meetup, Instagram, LinkedIn, SBG, eventos de Meetup, enlaces de la vitrina, la trayectoria y el pie) se abre en otra pestaña: `target="_blank" rel="noopener noreferrer"`. Los enlaces internos (`#secciones`, `/`) siguen en la misma pestaña.
   - Hazlo en un solo lugar si se puede, por ejemplo con un componente o una utilidad para enlaces externos, en vez de repetirlo a mano.
   - Accesibilidad: avisa que abre en pestaña nueva a los lectores de pantalla. Usa texto oculto ("(abre en otra pestaña)") o inclúyelo en el `aria-label` si ya existe. Axe tiene que quedar en 0.
   - Agrega una prueba e2e: todo `a[href^="http"]` tiene `target="_blank"` y un `rel` con `noopener`.
2. **Íconos de Meetup e Instagram en la parte principal.** Hoy los botones del hero y la barra usan íconos genéricos o ningún ícono (`src/components/BotonCta.astro`, `src/pages/index.astro`). Cámbialos por los logotipos reconocibles de cada marca: la "m" de Meetup y la cámara de Instagram.
   - Usa SVG en línea, de un solo color (`currentColor`) y del mismo tamaño en todos los lugares: barra, hero, Cómo unirse y pie.
   - Que se vean "generales", es decir, que se reconozcan de inmediato.
   - Sin dependencias nuevas. `aria-hidden="true"` en el SVG porque el texto del enlace ya nombra el destino.
3. **Tarjetas del carrusel de eventos con la misma proporción.** En la trayectoria horizontal ("Lo que hemos hecho") y en la tira de recientes, los afiches tienen alturas distintas según la imagen (los locales y los remotos de Meetup no miden lo mismo). Todas las tarjetas deben tener la misma proporción y el mismo alto.
   - Caja de imagen con `aspect-ratio` fijo y `object-fit: cover`.
   - Si el texto varía, la tarjeta mantiene el alto: recorta el resumen con `line-clamp` o deja el desplegable que ya existe.
   - Que se vea bien en 1440, 1024 y 390, con CLS 0.
4. **Mejorar la animación del tren al pasar** (escena `tren` en `src/components/Escena.astro`; estilos `.tren-pasa` y `@keyframes viaje-tren` en `src/styles/escenas.css`).
   - Hoy el tren se desliza rígido. Haz que se sienta vivo y de papel recortado:
     - ruedas que giran;
     - un leve traqueteo vertical de los vagones, desfasado entre ellos;
     - humo o vapor de papel que sale de la locomotora y se queda atrás;
     - entrada y salida suaves, con aceleración y frenado, en vez de lineal.
   - Sigue ligada al scroll como hoy (`view-timeline`), con un respaldo con `@supports`.
   - Solo `transform` y `opacity`.
   - Con `prefers-reduced-motion: reduce` o con la pausa del arte activa, el tren queda quieto y completo.
   - Revisa que no baje el rendimiento: Lighthouse ≥ 0.95, sin `will-change` salvo que lo justifiques.

## Archivos permitidos

- `src/**`
- `tests/**`
- este brief, para el entregable

## Archivos prohibidos

- `infra/**`, `.github/**`, `package.json`, `pnpm-lock.yaml`, `lighthouserc.json`, `AGENTS.md`

## Restricciones

- Siguen valiendo todas las de `AGENTS.md`: un solo script en línea de 2 KB como máximo, la página completa sin JS, cero violaciones de axe y Lighthouse ≥ 0.95.
- Se mantienen los testid `cta-principal`, `evento-proximo`, `eventos-vacio` y `enlace-sbg`.
- Sin menciones a Codex, Claude ni IA en ningún archivo. No hagas commit.

## Verificación

1. `pnpm verify` en verde. Si el puerto 4321 está ocupado, usa otro solo para tu ejecución y anótalo.
2. Capturas en `/tmp/ug-capturas/v13/`:
   - el hero y el pie con los íconos nuevos, a 1440 y 390;
   - la trayectoria y la tira de recientes, a 1440 y 390, con todas las tarjetas del mismo alto (haz también un build con red);
   - 6 cuadros o más del tren pasando, a 1440.

## Entregable

Al final de este brief anota:

- qué cambiaste en cada punto;
- cómo resolviste los enlaces externos;
- la proporción elegida para las tarjetas;
- la salida resumida de la verificación y la ruta de las capturas.

## Resultado de la tarea

- **Enlaces.** `Enlace.astro` aplica `target="_blank"` y `rel="noopener noreferrer"` a las URL externas HTTP(S). Agrega «(abre en otra pestaña)» al nombre accesible mediante texto oculto o al `aria-label` existente. Los enlaces al inicio y a las secciones conservan la navegación en la misma pestaña. El destino de la agenda destacada pasó a `url_agenda` para renderizarlo con el mismo componente. La prueba recorre los enlaces de la portada y del 404.
- **Íconos.** La «m» de Meetup y la cámara de Instagram usan SVG en línea de 20 × 20 px, con `currentColor` y `aria-hidden="true"`. Comparten los mismos trazos en la barra, el hero, Cómo unirse y el pie. [Meetup](https://github.com/simple-icons/simple-icons/blob/develop/icons/meetup.svg) · [Instagram](https://github.com/simple-icons/simple-icons/blob/develop/icons/instagram.svg)
- **Tarjetas.** Los afiches locales y remotos ocupan cajas de **16:9** con `object-fit: cover`. Se reserva la misma caja si falta la imagen. La trayectoria iguala el alto de los tiquetes y limita los resúmenes a tres líneas. Las descripciones largas siguen en un desplegable y la agenda destacada tiene su propio desplegable. Recientes usa una cuadrícula de cuatro columnas en escritorio y dos en móvil, con filas de igual altura. Los próximos adicionales conservan los boletos de texto.
- **Tren.** El avance tiene aceleración y frenado. Los radios de las ruedas giran, las carrocerías de los vagones tienen fases distintas y el vapor se eleva hacia atrás en recortes que se desvanecen. La animación usa `view-timeline`, `transform` y `opacity`. Sin soporte CSS, con movimiento reducido o con la pausa activa, se ve el tren completo y quieto.

### Verificación

- `pnpm verify` pasó en el puerto habitual 4321 de Playwright. Pasaron 32 pruebas unitarias, 17 de navegador y la revisión de 15 enlaces. Axe registró cero violaciones. En las seis corridas de Lighthouse, el mínimo de rendimiento fue 0,98 y los mínimos de accesibilidad, buenas prácticas y SEO fueron 1,00. CLS fue 0 en todas las corridas.
- El build con red generó inicio y 404, con 23 eventos pasados y cero futuros. Se sirvió en el puerto 4399 para las capturas. En Chromium se comprobó a 1440, 1024 y 390 px la geometría de los 23 tiquetes de trayectoria y los cuatro de recientes, con afiches remotos cargados, CLS de 0, cero violaciones de axe y sin desborde horizontal de la página. El único script en línea mide 839 bytes.
- Las capturas están en `/tmp/ug-capturas/v13/`. Incluyen hero, pie, recientes y trayectoria a 1440 y 390 px, dos vistas adicionales de la trayectoria con afiches remotos y diez cuadros del tren a 1440 px. También se comprobaron en el navegador el giro, el desfase de los vagones, el vapor y el estado quieto al activar la pausa o el movimiento reducido.
