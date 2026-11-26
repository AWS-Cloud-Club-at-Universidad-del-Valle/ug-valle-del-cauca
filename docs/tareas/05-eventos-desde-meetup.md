# Tarea 05: eventos automáticos desde Meetup y reconstrucción diaria

Lee `AGENTS.md`. **Trabaja sin hacer preguntas.** Cuando tengas una duda, decide lo más conservador, anótalo en el entregable y sigue.

## Objetivo

Que los eventos del sitio salgan solos del Meetup del grupo, sin editar archivos a mano, y que el sitio se reconstruya cada día. Así se resuelve la "Limitación conocida" de `AGENTS.md`: un evento pasado ya no queda como próximo.

## Fuente

- Feed iCal público, sin credenciales: `https://www.meetup.com/aws-user-group-valle-del-cauca/events/ical/`. Hoy responde 200 y no trae eventos (`VCALENDAR` sin `VEVENT`).
- La URL del feed se deriva de `meetup_url` en `src/content/sitio.yaml`, que agrega `events/ical/` al final. No la escribas a mano en el código.
- En `main`, `meetup_url` todavía no existe porque la otra tarea la agrega en su rama. Si falta, omite el fetch sin error. Para probar con red, usa `MEETUP_ICAL_URL`.

## Qué construir

1. **`src/lib/meetup.ts`.** Una función pura que convierte texto iCal en eventos que cumplen `esquemaEvento`:
   - Lee `SUMMARY`, `DTSTART` con zona horaria, `LOCATION` y `URL`. `URL` pasa a `url_registro`.
   - Desdobla las líneas plegadas del iCal y desescapa `\,`, `\;` y `\n`.
   - Usa `modalidad: virtual` si no hay `LOCATION` o si la ubicación dice "Online", y `presencial` en los demás casos.
   - Pon `ejemplo: false`.
   - Usa un id estable, como el `UID` o un slug.
   - Agrega un parser iCal mínimo propio, sin dependencias nuevas.
2. **Loader en `src/content.config.ts`.** La colección `eventos` combina los archivos locales `.md`, que siguen funcionando, con los del feed.
   - Si el fetch falla (red, tiempo de espera de unos 8 s o respuesta distinta de 200), registra un aviso y sigue solo con los locales. El build **nunca** falla por Meetup.
   - Si hay un evento duplicado, gana el local.
   - Con una variable de entorno, por ejemplo `MEETUP_DESACTIVADO=1`, se omite el fetch. Úsala en las pruebas e2e y en `lighthouserc` (el que corre por script, sin tocar su archivo) para que sean deterministas. Revisa cómo arrancan `playwright.config` y `pnpm verify`.
3. **Pruebas unitarias** en `tests/unit/meetup.test.ts`. Usa un iCal de ejemplo como fixture en `tests/fixtures/` con:
   - dos eventos;
   - una línea plegada;
   - caracteres escapados;
   - un evento online;
   - un calendario vacío.
4. **Reconstrucción diaria.** Agrega `schedule` (cron diario, 11:00 UTC, que son las 6:00 en Cali) a `.github/workflows/desplegar.yml`.
   - Asegúrate de que el job `desplegar` corra con `schedule` sobre `main`.
   - La guarda de contenido de ejemplo sigue igual: mientras quede `ejemplo: true`, el cron construye, avisa y no publica. Eso es correcto, no lo cambies.
5. Actualiza en `AGENTS.md` solo el mapa del repo (los archivos nuevos) y la sección "Limitación conocida".

## Archivos permitidos

- `src/lib/meetup.ts`
- `src/content.config.ts`
- `tests/unit/**`
- `tests/fixtures/**`
- `.github/workflows/desplegar.yml`, solo el `schedule` y la condición del job
- `playwright.config.*`, solo para la variable de entorno
- `package.json`, solo si un script necesita la variable de entorno; sin dependencias nuevas
- `AGENTS.md`, solo lo que dice el punto 5
- este brief, para el entregable

## Archivos prohibidos

Otra tarea está trabajando en paralelo sobre estos archivos:

- `src/pages/**`
- `src/components/**`
- `src/styles/**`
- `src/layouts/**`
- `src/content/sitio.yaml`
- `public/**`
- `tests/e2e/**`

## Verificación

1. `pnpm test`.
2. `MEETUP_DESACTIVADO=1 pnpm verify` y también `pnpm verify` sin la variable; los dos tienen que pasar.
3. `pnpm build` con red. El log debe mostrar cuántos eventos llegaron de Meetup (hoy 0) y que no falla.
4. `pnpm build` simulando una caída, con la URL del feed apuntando a un host inválido por variable de entorno, por ejemplo `MEETUP_ICAL_URL`. El build tiene que pasar con el aviso.
5. `actionlint` o `pnpm dlx @action-validator/cli` sobre el workflow.

## Entregable

Al final de este brief anota:

- los archivos que creaste o cambiaste;
- tus decisiones;
- la salida resumida de cada paso de la verificación.

No hagas commit. Sin menciones a Codex, Claude ni IA en ningún archivo.

## Resultado de la tarea

### Archivos

- Nuevos `src/lib/meetup.ts`, `tests/unit/meetup.test.ts`, `tests/fixtures/meetup.ics` y `tests/fixtures/meetup-vacio.ics`.
- Actualizados `src/content.config.ts`, `playwright.config.ts`, `package.json`, `.github/workflows/desplegar.yml`, `AGENTS.md` y este brief.

### Decisiones

- Los eventos Markdown se cargan con el loader de Astro. Tienen prioridad cuando coincide el identificador o la URL de registro. En las URLs de eventos de Meetup se compara el número de evento, de modo que los parámetros de seguimiento y las variantes de la ruta no generan duplicados.
- El parser usa `UID` cuando existe, luego la URL de registro y finalmente un identificador derivado del título, la fecha y la ubicación. Omite entradas inválidas. Interpreta las horas sin zona en `America/Bogota` y las fechas sin hora como el día calendario en Cali.
- El build consulta el calendario por hasta 8 segundos. `MEETUP_ICAL_URL` permite probar el feed antes de que se agregue `meetup_url` y `MEETUP_DESACTIVADO=1` tiene prioridad. La verificación sirve el build estático con el feed desactivado.
- El cron se programó para las 11:00 UTC, 6:00 a. m. en Cali. GitHub ejecuta la programación desde la rama predeterminada. La condición existente de `desplegar` admite `schedule` en `main` y la guarda sigue omitiendo la publicación cuando hay contenido de ejemplo.

### Verificación

- `pnpm test` pasó con 16 pruebas en 5 archivos.
- `MEETUP_DESACTIVADO=1 pnpm verify` y `pnpm verify` sin la variable pasaron en una copia temporal. Cada ejecución completó el chequeo de tipos, lint, 16 pruebas unitarias, build, 6 enlaces, 13 pruebas de navegador con cero violaciones de axe y los umbrales de Lighthouse en las dos páginas. En el árbol de trabajo, ambas ejecuciones se detuvieron al llegar a Playwright porque el puerto 4321 estaba ocupado. Se usó el puerto 14321 solo en la copia temporal.
- La instalación previa a los scripts de pnpm emitió un aviso por un bloqueo del sistema de archivos. Las verificaciones usaron las dependencias ya instaladas.
- `pnpm build` con el feed público en `MEETUP_ICAL_URL` generó las 2 páginas y registró «Eventos recibidos de Meetup: 0».
- `pnpm build` con un host inválido generó las 2 páginas y avisó que usaría los eventos locales. También pasó sin una URL configurada y omitió la consulta. Una respuesta HTTP 503 y una conexión sin respuesta también generaron las páginas con el aviso correspondiente.
- Un build con el calendario de prueba recibió 2 eventos. La página conservó el evento local cuando su identificador coincidía con uno del feed y mostró el otro evento importado. El build posterior con el host inválido retiró el evento importado.
- `actionlint .github/workflows/desplegar.yml` pasó sin diagnósticos. El chequeo de contenido de ejemplo todavía detectó los tres archivos de ejemplo.
