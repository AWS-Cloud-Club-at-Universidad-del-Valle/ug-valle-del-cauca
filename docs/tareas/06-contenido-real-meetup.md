# Tarea 06: contenido real desde el Meetup y el Instagram del grupo

Lee `AGENTS.md`. **Trabaja sin hacer preguntas.** Cuando tengas una duda, decide lo más conservador, anótalo en el entregable y sigue.

## Objetivo

Reemplazar el contenido de ejemplo por contenido **real y verificable**, tomado de las páginas públicas del grupo. El dueño lo autorizó. Fuentes:

- Meetup: `https://www.meetup.com/aws-user-group-valle-del-cauca/`. Los eventos pasados están en `https://www.meetup.com/aws-user-group-valle-del-cauca/events/?type=past`. La página trae los datos en JSON incrustado (`__NEXT_DATA__` / estado de Apollo): título, fecha, sede, `eventUrl` e imagen destacada. Cada evento tiene su página con la descripción completa.
- Instagram: `https://www.instagram.com/awsugvalle/`. Saca solo lo que puedas leer públicamente, como la bio. Si el sitio bloquea el acceso, anótalo y sigue sin Instagram.
- Puedes usar búsqueda web para el **Tech Day Cali 2026** (sitio propio, agenda, ponentes o aliados), siempre que la fuente sea oficial del grupo o del evento.

**Regla de oro: no inventes nada.** Cada dato tiene que salir de una fuente que puedas citar. Si algo no está, no lo pongas. Anota las fuentes en el entregable.

## Qué construir

1. **Eventos pasados reales** en `src/content/eventos/`, un `.md` por evento del Meetup (hoy son unos 10). Cada uno lleva:
   - título, fecha con hora y zona, sede y modalidad;
   - `url_registro`, que es la URL del evento en Meetup;
   - `ejemplo: false`;
   - un resumen corto de 1 o 2 frases sacado de la descripción oficial (puedes condensarla, sin agregar afirmaciones).
   - Si el esquema necesita campos nuevos (por ejemplo `resumen`, `imagen` o `fuente`), agrégalos como **opcionales** en `src/content/esquemas.ts`, con mensajes en español y pruebas unitarias.
   - Borra `2026-10-15-ejemplo.md`.
   - Los ids deben coincidir con la deduplicación del loader de Meetup (`src/content.config.ts` deduplica por URL del evento de Meetup). Verifica que un evento futuro del feed no se duplique con uno local.
2. **Tech Day Cali 2026 destacado** en "Lo que hemos hecho" o en "Trayectoria", con más detalle: fecha, sede, descripción, agenda o temas y ponentes **solo si aparecen en las fuentes**, y el enlace oficial.
   - Hoy hay una tarjeta "Tech Day Cali" con el texto "Conoce Tech Day Cali": cámbiala por la información real.
3. **Sección de trayectoria o "Lo que hemos hecho"**: la lista real de eventos pasados, en orden cronológico inverso, con fecha, título y enlace a Meetup.
   - Mantén el estilo de la escena (el tren y la caña). Puede ser una línea de tiempo tipo boletos de tren o tiquetes.
   - Que se lea bien con 10 eventos o más en escritorio y en móvil.
4. **Imágenes:** para el Tech Day y unos 3 o 4 eventos clave puedes descargar las imágenes destacadas oficiales del Meetup. Son material promocional del propio grupo.
   - Conviértelas a WebP, máximo 800 px de ancho y unos 60 KB cada una, en `public/img/eventos/`.
   - Ponles `alt` descriptivo, `loading="lazy"` y `width`/`height` para que no haya CLS.
   - Nada de imágenes en el hero, para no afectar el LCP.
5. **`src/content/sitio.yaml`:** reemplaza `descripcion` por una basada en la descripción oficial del grupo en Meetup y pon `ejemplo: false` cuando ya no quede nada inventado. Si Instagram tiene una bio útil, úsala como apoyo.
6. **Organizadores:** si el Meetup muestra públicamente a los organizadores (nombre y rol), créalos con `ejemplo: false`, solo con nombre y rol, sin fotos personales. Si no aparecen, deja el de ejemplo tal cual y anótalo.
7. **Revisa los textos del sitio** que digan "de ejemplo" y corrígelos solo si ya hay dato real.
8. Corre `pnpm revisar-ejemplo` y reporta qué queda pendiente.

## Archivos permitidos

- `src/**`
- `public/img/**`
- `tests/**`
- este brief, para agregar el entregable al final.

## Archivos prohibidos

- `infra/**`
- `.github/**`
- `package.json` y `pnpm-lock.yaml`
- `AGENTS.md`, salvo el mapa del repo si agregas carpetas

## Restricciones

Siguen valiendo las de `AGENTS.md`:

- español de Colombia;
- cero violaciones de axe;
- Lighthouse ≥ 0.95;
- un solo script en línea de 2 KB como máximo;
- nada de embeds de terceros (iframes, widgets de Instagram o de Meetup);
- se mantienen los testid existentes. Si el estado vacío de eventos ya no aplica porque hay eventos pasados pero no futuros, la sección de próximos eventos sigue mostrando `eventos-vacio` y los pasados van en su propia sección.

## Verificación

1. `pnpm verify` en verde.
2. Capturas en `/tmp/ug-capturas/v8/` de las secciones de eventos, Tech Day y trayectoria, a 1440 y 390.

## Entregable

Agrega al final de este brief:

- la lista de eventos importados, con su fuente;
- los datos del Tech Day, con su fuente;
- qué se pudo sacar de Instagram;
- los campos nuevos del esquema;
- el peso de las imágenes;
- el resultado de `pnpm revisar-ejemplo`;
- el resultado de `pnpm verify`.

No hagas commit. Sin menciones a Codex, Claude ni IA en ningún archivo.
