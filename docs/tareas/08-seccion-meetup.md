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

## Resultado de la tarea

- La vitrina pone el afiche principal y su ficha sobre una hoja con sombra dura. A su lado va la estampilla del grupo, con un borde perforado y el enlace de suscripción. Los boletos con cinta y fechas cortas dejan ver el lago al fondo y se acomodan en dos columnas a 390 px. El hero conserva `cta-principal`.
- El primer próximo ocupa la ficha grande y los demás aparecen en la tira «También vienen». Se muestran hasta cuatro encuentros pasados debajo. Cuando el último ocupa la ficha grande, la tira empieza por el anterior para evitar repetirlo. La trayectoria conserva el historial completo.
- La cuenta usa días calendario de Cali y se calcula al construir el sitio. Dice «Hoy» cuando el encuentro cae en la fecha del build. Se mantienen `evento-proximo` en la ficha y en cada boleto futuro y `eventos-vacio` en la invitación a unirse cuando no hay próximos.
- El 25 de noviembre de 2026, la [página pública del grupo](https://www.meetup.com/aws-user-group-valle-del-cauca/) devolvió 1.027 miembros, 23 eventos realizados, Cali y la fecha de fundación del 1 de julio de 2025. El loader lee `__NEXT_DATA__` → `props.pageProps.__APOLLO_STATE__` → `ROOT_QUERY.groupByUrlname`. Usa `stats.memberCounts.all`, el `totalCount` de la conexión filtrada por `PAST`, `city` y `foundedDate`.
- La copia fechada queda en `src/content/grupo-meetup.json` y aplica al grupo consultado si el dato remoto no se puede leer o si se desactiva la red con `MEETUP_DESACTIVADO=1`. Una respuesta parcial muestra solo los campos válidos que trajo esa respuesta.

### Verificación

- El build con red registró los cuatro datos del grupo, 0 eventos futuros de ambas fuentes y 23 pasados. Con `MEETUP_GRUPO_URL=https://host.invalido`, el build avisó y usó la copia fechada.
- Las capturas están en `/tmp/ug-capturas/v11/`, a 1440, 1024 y 390 px. El estado real muestra Tech Day Cali 2026 como último encuentro. La simulación reutiliza el afiche de un encuentro pasado y le asigna una fecha futura solo en los datos temporales de captura.
- `pnpm verify` pasó con 30 pruebas unitarias, 16 de navegador y 13 enlaces revisados. Axe reportó cero violaciones. Las seis mediciones de Lighthouse obtuvieron 1,00 en rendimiento, accesibilidad, buenas prácticas y SEO, con CLS de 0.
- Las seis capturas también se verificaron en Chromium. Axe reportó cero violaciones en la vitrina, CLS de 0 y la página no tuvo desborde horizontal en ninguno de los anchos.

## Retratos de los organizadores

- **Nathalie Chicaiza.** El estado de Apollo en la página pública del grupo identifica a Nathalie como `Member:209872571` y enlaza su foto desde `memberPhoto` → `PhotoInfo:323327495.highResUrl`. Se guardó una copia WebP cuadrada de 320 × 320 px y 12.864 bytes en `public/img/organizadores/nathalie-chicaiza.webp`. [Página del grupo](https://www.meetup.com/aws-user-group-valle-del-cauca/) · [Foto original](https://secure.meetupstatic.com/photos/member/b/9/8/7/highres_323327495.jpeg)
- **Jhorman Villanueva.** El listado de líderes del mismo estado público referencia a `Member:314540910` como «Jhorman» y no publica `memberPhoto`. Se muestra el monograma JV en el mismo marco de papel. [Página del grupo](https://www.meetup.com/aws-user-group-valle-del-cauca/)
- Los dos perfiles de miembro redirigen al inicio de sesión. Los datos públicos consultados tampoco publican enlaces personales de LinkedIn, así que no se agregaron enlaces de perfil. [Perfil de Nathalie](https://www.meetup.com/members/209872571/) · [Perfil de Jhorman](https://www.meetup.com/members/314540910/)
- `pnpm verify` pasó con 32 pruebas unitarias, 16 de navegador y 14 enlaces revisados. Playwright usó temporalmente el puerto 4374 porque el 4321 estaba ocupado. Lighthouse obtuvo 1,00 en las cuatro categorías y CLS de 0. Las capturas de `/tmp/ug-capturas/v12/` a 1440 y 390 px también registraron CLS de 0 y cero violaciones de axe en la sección.
- **Actualización posterior.** El retrato de Jhorman Villanueva se tomó de su avatar público de GitHub (`jhorvi24`, Cali) y su LinkedIn del enlace que él publica en su perfil de dev.to. El LinkedIn de Nathalie Chicaiza se tomó del enlace que ella publica en su perfil de GitHub (`nchicaizaliz`). Los enlaces se muestran con el ícono de LinkedIn.
