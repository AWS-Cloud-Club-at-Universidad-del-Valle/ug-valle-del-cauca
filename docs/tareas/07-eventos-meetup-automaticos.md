# Tarea 07: próximos y recientes desde Meetup, automáticos

Lee `AGENTS.md`, `src/content.config.ts`, `src/lib/meetup.ts` y la entrega de las tareas 05 y 06. **Trabaja sin hacer preguntas.** Cuando tengas una duda, decide lo más conservador, anótalo en el entregable y sigue.

## Objetivo

Que el sitio muestre solo, en cada build y sin tocar archivos, lo que hay en Meetup:

- La sección **"Próximos eventos"** muestra los eventos futuros del grupo.
- Si no hay ninguno, en vez de un estado vacío seco muestra **el último evento realizado**, con su afiche, fecha, sede y enlace. Va con la etiqueta "Último encuentro" y una invitación a unirse al Meetup para enterarse del próximo.
- La trayectoria ("Lo que hemos hecho") se alimenta sola de los eventos pasados del Meetup. Cuando el grupo haga un evento nuevo, aparece ahí al día siguiente sin editar nada.

El sitio ya se reconstruye cada día a las 6:00 de Cali (`desplegar.yml`), así que basta con resolverlo en build.

## Fuentes

- Eventos futuros: el feed iCal que ya existe (`…/events/ical/`). Revisa también si la página `https://www.meetup.com/aws-user-group-valle-del-cauca/events/` trae los futuros en su JSON incrustado (`__NEXT_DATA__` / estado de Apollo) con más datos, como la imagen destacada. Si es así, úsala.
- Eventos pasados: `https://www.meetup.com/aws-user-group-valle-del-cauca/events/?type=past`, con su JSON incrustado: título, `dateTime`, sede, `eventUrl`, imagen destacada y descripción si viene.
  - Meetup dice que hay 23 eventos históricos y la página trae 10.
  - Si hay paginación accesible sin iniciar sesión, por ejemplo la consulta GraphQL pública que usa la propia página o parámetros de cursor, trae todos.
  - Si no se puede sin credenciales, quédate con lo que haya y anótalo. **Nada de credenciales ni de saltarse bloqueos.**

## Qué construir

1. **`src/lib/meetup.ts`:** agrega una función pura que extraiga los eventos del HTML o JSON de Meetup y los valide con `esquemaEvento`, con pruebas unitarias sobre un fixture recortado en `tests/fixtures/`. El parser tiene que tolerar cambios: si no encuentra la estructura, devuelve una lista vacía y registra un aviso. Nunca lanza un error.
2. **Loader (`src/content.config.ts`):**
   - Combina tres fuentes: los archivos locales (`src/content/eventos/*.md`), el iCal y la página de eventos (futuros y pasados).
   - Deduplica por id de evento de Meetup.
   - Precedencia: **lo local gana** (los `.md` tienen resumen, cuerpo e imagen curados). Lo remoto solo agrega eventos nuevos o completa los campos que falten.
   - Ante cualquier falla de red o de parseo, el build sigue con lo local, igual que hoy.
   - Se respetan `MEETUP_DESACTIVADO=1` (lo usan `verify` y las pruebas e2e, que deben seguir siendo deterministas) y `MEETUP_ICAL_URL`. Agrega `MEETUP_EVENTOS_URL` si hace falta.
3. **Imágenes de eventos remotos:**
   - Para eventos nuevos que no tengan imagen local, usa la URL de la imagen destacada de Meetup tal cual (`secure.meetupstatic.com` o el CDN que use), con `width`/`height`, `loading="lazy"` y `alt`.
   - Agrega ese host a `img-src` de la CSP en `infra/main.tf`, en la política de cabeceras. Es el único cambio permitido en `infra/`. Dilo en el entregable para que el orquestador aplique Terraform.
   - Si prefieres descargar las imágenes en build a `dist/`, también vale, pero sin pasarte del tiempo del build ni agregar dependencias.
4. **UI de "Próximos eventos"** (`src/pages/index.astro` y los estilos que correspondan):
   - Con eventos futuros, muestra la lista (testid `evento-proximo`).
   - Sin futuros, muestra la tarjeta "Último encuentro" con el más reciente. Mantén `eventos-vacio` en el contenedor del mensaje de invitación, para que las pruebas actuales sigan teniendo un ancla, y ajústalas.
   - Con un evento destacado, se respeta la lógica actual de `separarEventos`.
   - Mantén el estilo de la escena de Calima.
5. **Pruebas:**
   - Unitarias del parser (página con 0, 1 y varios eventos, y estructura rota).
   - Unitarias de la combinación (gana lo local y se completan campos faltantes).
   - E2E con contenido local determinista para los casos "hay próximo" y "sin próximos: último encuentro". Puedes usar un fixture servido por `MEETUP_EVENTOS_URL` apuntando a un archivo local, o eventos locales temporales en la prueba, como te quede más limpio.

## Archivos permitidos

- `src/**`
- `tests/**`
- `infra/main.tf`, solo el `img-src` de la CSP
- `package.json`, solo variables de entorno en scripts, sin dependencias nuevas
- `playwright.config.ts`
- `AGENTS.md`, solo el mapa y la limitación conocida
- este brief, para el entregable

## Archivos prohibidos

- `.github/**`
- `pnpm-lock.yaml`
- `public/**`, salvo que descargues imágenes en build a `dist/`

## Verificación

1. `pnpm verify` en verde, con axe 0, Lighthouse ≥ 0.95 y CLS 0.
2. `pnpm build` **con red**: el log dice cuántos eventos llegaron del iCal y de la página (futuros y pasados), y el `dist/index.html` muestra la trayectoria con los eventos remotos.
3. `MEETUP_EVENTOS_URL=https://host.invalido pnpm build` pasa con un aviso.
4. `terraform -chdir=infra fmt -check` y `validate`, si tocaste `main.tf`.
5. Capturas en `/tmp/ug-capturas/v10/` de "Próximos eventos" en el estado actual (sin futuros, así que muestra el último encuentro) y de la trayectoria con los eventos remotos, a 1440 y 390.

## Entregable

Al final de este brief anota:

- qué estructura de Meetup usas y qué tan frágil es;
- cuántos eventos se obtuvieron;
- si se pudo paginar;
- los cambios en la CSP;
- la salida resumida de la verificación.

No hagas commit. Sin menciones a Codex, Claude ni IA en ningún archivo.

## Resultado de la tarea

- Los listados usan `__NEXT_DATA__` → `props.pageProps.__APOLLO_STATE__`. El parser sigue `ROOT_QUERY.groupByUrlname`, selecciona la conexión por `afterDateTime` o `beforeDateTime` y resuelve las referencias de eventos, sedes y fotos. La estructura es interna de Meetup. Si cambia, el build avisa y conserva las otras fuentes disponibles.
- El calendario iCal y la página de futuros devolvieron 0 eventos. El listado de pasados trajo 10 en el HTML y 13 adicionales mediante `getPastGroupEvents` en `/gql2`. Se usó la misma operación persistida y el cursor del sitio público, sin iniciar sesión. Si cambia el identificador de la operación o falla una página, se conserva lo recibido hasta ese punto.
- El HTML contiene 23 tiquetes con enlaces distintos. Diez coincidieron con archivos locales, que conservaron su contenido curado y recibieron los datos faltantes. Los otros trece se incorporaron automáticamente. En ausencia de próximos, Calima muestra Tech Day Cali 2026 con su afiche local e invitación al Meetup.
- La CSP agrega `https://secure.meetupstatic.com` y `https://secure-content.meetupstatic.com` únicamente a `img-src`. El orquestador debe aplicar Terraform para que CloudFront permita esos afiches. El catálogo público observado usó el primer host en las URLs de imagen.
- Se mantiene la clasificación por día calendario en Cali. Los afiches ocupan una caja de proporción fija y se cargan de forma diferida. Los tiquetes conservan la descripción del listado cuando no hay resumen local y muestran las descripciones largas en un desplegable.

### Verificación

- `pnpm verify` pasó con Meetup desactivado. Pasaron 26 pruebas unitarias, 15 de navegador y la revisión de 13 enlaces. Axe reportó cero violaciones. Las seis mediciones de Lighthouse (inicio y 404) obtuvieron 1,00 en rendimiento, accesibilidad, buenas prácticas y SEO, con CLS de 0.
- `pnpm build` con red generó las dos páginas y registró 0 eventos del iCal, 0 futuros de la página y 23 pasados. Se verificaron los 23 tiquetes del HTML y la carga de un afiche remoto a ambos anchos. Axe también reportó cero violaciones en el inicio construido con red a 1440 y 390 px.
- `MEETUP_EVENTOS_URL=https://host.invalido pnpm build` generó las dos páginas y avisó que conservaría los eventos locales. El calendario siguió disponible.
- `terraform -chdir=infra fmt -check` y `terraform -chdir=infra validate` pasaron. La inicialización para validar usó el backend desactivado.
- Se guardaron `proximos-1440.png`, `proximos-390.png`, `trayectoria-1440.png` y `trayectoria-390.png` en `/tmp/ug-capturas/v10/`.
