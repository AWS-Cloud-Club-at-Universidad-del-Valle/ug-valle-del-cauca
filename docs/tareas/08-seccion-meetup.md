# Tarea 08: la sección "Próximos eventos" como vitrina del Meetup

Lee `AGENTS.md`, el entregable de la tarea 07 (`docs/tareas/07-eventos-meetup-automaticos.md`), `src/content.config.ts`, `src/lib/meetup.ts` y la escena de Calima en `src/pages/index.astro` y `src/styles/escenas.css`. **Trabaja sin hacer preguntas.** Cuando tengas una duda, decide lo más conservador, anótalo en el entregable y sigue.

## Qué pidió el dueño

Hoy la sección muestra una sola tarjeta de "Último encuentro", y al dueño le parece pobre. Quiere que la sección **sea el Meetup dentro de la página**, que muestre lo que pasa en el grupo y que encaje con el estilo del sitio (collage de papel y escena del Lago Calima). No basta con meter más tarjetas: tiene que verse diseñada.

## Qué construir

1. **Datos reales del grupo desde Meetup en build**, en la misma estructura pública que ya usas (`__NEXT_DATA__` / Apollo de la página del grupo):
   - el número de miembros;
   - el total de eventos realizados;
   - la ciudad;
   - si está, la fecha de fundación o "activo desde".
   - Solo lo que venga en los datos. Si algo no está, no se muestra.
   - Agrégalo al loader o a un módulo aparte, con un respaldo local estático si falla la red. El respaldo usa los valores obtenidos hoy, guardados en un archivo de datos con su fecha.
   - Las pruebas e2e siguen siendo deterministas con `MEETUP_DESACTIVADO=1`.
2. **Una composición nueva para la sección:**
   - **Próximo o último encuentro grande:** el afiche grande, el título, la fecha con día de la semana y hora, la sede, el formato y un botón "Reservar en Meetup" (o "Ver en Meetup" si ya pasó). Si es próximo, agrega una cuenta "faltan N días", calculada en build. Ojo: el sitio se reconstruye a diario, así que la cuenta es aproximada; usa un texto honesto como "en N días".
   - **Una tira con los 3 o 4 encuentros más recientes**, como boletos o afiches pegados con cinta sobre la escena, cada uno enlazado a Meetup. No dupliques la trayectoria completa: aquí van solo los recientes, y la trayectoria sigue más abajo con todos.
   - **El bloque del grupo en Meetup:** miembros, eventos realizados y un CTA claro "Únete en Meetup" (`cta-principal` sigue siendo el del hero). Puede ir como un sello o una estampilla de papel.
   - Si hay **varios próximos**, los muestras todos, el primero grande y los demás en la tira.
3. **Estilo:**
   - El papel recortado, las cintas, la sombra dura y la paleta de Calima se mantienen.
   - Que se vea bien en 1440, 1024 y 390.
   - Nada de grillas genéricas de tarjetas (lee los anti-objetivos de `AGENTS.md`).
   - Las imágenes remotas van con `width`/`height`, `loading="lazy"` y `alt`. El CLS se queda en 0.
4. **Accesibilidad:**
   - Encabezados en orden.
   - Fechas con `<time datetime>`.
   - Los enlaces dicen a dónde van ("Ver «X» en Meetup").
   - Cero violaciones de axe.
5. **Pruebas:**
   - Ajusta o agrega e2e para tres casos: sin próximos (último encuentro y la tira de recientes), con un próximo y con varios próximos.
   - Unitarias para el parseo de los datos del grupo.
   - Se mantienen los testid `evento-proximo` y `eventos-vacio` (o ajusta las pruebas con criterio y explícalo).

## Archivos permitidos

- `src/**`
- `tests/**`
- este brief, para el entregable.

## Archivos prohibidos

- `infra/**`: la CSP ya permite `secure.meetupstatic.com` y `secure-content.meetupstatic.com`.
- `.github/**`
- `package.json`, salvo variables de entorno
- `pnpm-lock.yaml`

## Verificación

1. `pnpm verify` en verde, con axe 0, Lighthouse ≥ 0.95 y CLS 0.
2. `pnpm build` con red: el log muestra los datos del grupo obtenidos.
3. Capturas en `/tmp/ug-capturas/v11/` de la sección a 1440, 1024 y 390, en el estado real (con red) y con un caso simulado de próximo evento.

## Entregable

Al final de este brief anota:

- el diseño elegido y por qué;
- los datos del grupo que obtuviste y su fuente;
- la salida resumida de la verificación.

No hagas commit. Sin menciones a Codex, Claude ni IA en ningún archivo.
