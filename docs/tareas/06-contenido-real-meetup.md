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

## Resultado de la tarea

### Eventos importados

Se importaron los diez eventos que entrega el listado público inicial al 25 de noviembre de 2026. El estado de la página registra 23 eventos y devuelve diez filas en la primera carga. El parámetro `page=2` devolvió las mismas filas. El historial local cubre esas diez fechas verificadas. Cada archivo usa el número de la URL como ID, conserva la hora con el desfase de Colombia y enlaza a su ficha oficial. [Listado de Meetup](https://www.meetup.com/aws-user-group-valle-del-cauca/events/?type=past).

| Fecha en Colombia        | Evento y fuente                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21 de noviembre de 2026  | [TECH DAY CALI 2026](https://www.meetup.com/aws-user-group-valle-del-cauca/events/317059425/)                                                            |
| 20 de octubre de 2026    | [De estudiante al primer trabajo en tech](https://www.meetup.com/aws-user-group-valle-del-cauca/events/316954925/)                                       |
| 26 de septiembre de 2026 | [De la Spec a Producción: El nuevo desarrollo agéntico en AWS](https://www.meetup.com/aws-user-group-valle-del-cauca/events/316377259/)                  |
| 1 de septiembre de 2026  | [Fundamentos de Redes en AWS: conecta, protege y escala](https://www.meetup.com/aws-user-group-valle-del-cauca/events/316229522/)                        |
| 25 de julio de 2026      | [Construye Rápido... Despliega seguro!](https://www.meetup.com/aws-user-group-valle-del-cauca/events/315473395/)                                         |
| 21 de julio de 2026      | [AWS Backup: Resiliencia ante Desastres y Ransomware](https://www.meetup.com/aws-user-group-valle-del-cauca/events/315679723/)                           |
| 23 de mayo de 2026       | [AWS Community Day Colombia 2026](https://www.meetup.com/aws-user-group-valle-del-cauca/events/314830765/)                                               |
| 9 de mayo de 2026        | [AWS Tech & Strategy: Elevando el Talento con IA Generativa y Gobernanza de TI](https://www.meetup.com/aws-user-group-valle-del-cauca/events/314520697/) |
| 22 de abril de 2026      | [Serverless vs Contenedores: cuando la arquitectura habilita el negocio](https://www.meetup.com/aws-user-group-valle-del-cauca/events/314249801/)        |
| 27 de marzo de 2026      | [Arquitectura Serverless en AWS para IoT](https://www.meetup.com/aws-user-group-valle-del-cauca/events/313927731/)                                       |

En Fundamentos de Redes, la descripción oficial confirma una transmisión por YouTube y el listado lo clasifica como presencial con sede vacía. Se usó la descripción del grupo. Se conservó la modalidad híbrida de AWS Community Day indicada en los datos de Meetup. [Fundamentos de Redes](https://www.meetup.com/aws-user-group-valle-del-cauca/events/316229522/) y [AWS Community Day](https://www.meetup.com/aws-user-group-valle-del-cauca/events/314830765/).

### Tech Day Cali 2026

El encuentro se programó para el sábado 21 de noviembre de 2026, desde las 7:30 a. m., hora de Colombia, en la Universidad Autónoma de Occidente. Nueve comunidades del Valle del Cauca organizaron la jornada con un propósito solidario. La agenda oficial señala los auditorios Quincha y Xepia, con DevFest Cali 2026 en Xepia. La ficha destaca «Elige tu vida», con Paula Gallego, la charla sobre Amazon Bedrock AgentCore, con Jhon Robert Quintero Hurtado, y el taller de aplicaciones agénticas con Angular y Flutter, con Daniel Herrera Sánchez. [Ficha en Meetup](https://www.meetup.com/aws-user-group-valle-del-cauca/events/317059425/) y [agenda oficial](https://techdaycali.com/#agenda).

### Comunidad, organizadores e Instagram

La descripción del sitio se condensó de la presentación pública del grupo. El estado público de Meetup muestra a Nathalie Chicaiza como organizadora principal y a Jhorman Villanueva entre los organizadores. Se publicaron sus nombres y roles. [Página del grupo](https://www.meetup.com/aws-user-group-valle-del-cauca/) y [listado público con datos del grupo](https://www.meetup.com/aws-user-group-valle-del-cauca/events/?type=past).

Los metadatos públicos de Instagram confirmaron el nombre de la cuenta y el usuario `@awsugvalle`. La biografía no estaba disponible en la respuesta pública consultada. Se conservó el enlace ya anunciado en Meetup. [Perfil de Instagram](https://www.instagram.com/awsugvalle/) y [página del grupo en Meetup](https://www.meetup.com/aws-user-group-valle-del-cauca/).

### Esquema y afiches

Se añadieron `resumen` e `imagen_alt` como textos opcionales, con validación y pruebas unitarias en español. Se reutilizaron `imagen` y `destacado`. Los cuatro afiches provienen del campo de imagen destacada de las fichas de Meetup. Se convirtieron a WebP de 800 × 450 px y se muestran con texto alternativo, dimensiones explícitas y carga diferida.

| Archivo          |         Peso | Fuente                                                                                                                           |
| ---------------- | -----------: | -------------------------------------------------------------------------------------------------------------------------------- |
| `317059425.webp` | 20.396 bytes | [Afiche de Tech Day](https://secure.meetupstatic.com/photos/event/1/9/6/2/highres_536706498.jpeg)                                |
| `316954925.webp` | 23.304 bytes | [Afiche de De estudiante al primer trabajo en tech](https://secure.meetupstatic.com/photos/event/e/5/c/d/highres_536578829.jpeg) |
| `316377259.webp` | 38.262 bytes | [Afiche de De la Spec a Producción](https://secure.meetupstatic.com/photos/event/2/a/0/5/highres_536290757.jpeg)                 |
| `314830765.webp` | 18.568 bytes | [Afiche de AWS Community Day](https://secure.meetupstatic.com/photos/event/8/c/0/7/highres_534275847.jpeg)                       |

### Verificación

- `pnpm revisar-ejemplo` terminó con código 0 y el mensaje «Sin contenido de ejemplo».
- Se construyó el sitio con un calendario de prueba que contenía dos eventos futuros. El loader descartó la variante de URL del Tech Day local y mostró el encuentro futuro de control.
- Se guardaron seis capturas en `/tmp/ug-capturas/v8/`, a 1440 y 390 px, de próximos eventos, Tech Day y trayectoria. Se verificaron el orden inverso y el ancho de la página con JavaScript desactivado.
- `pnpm verify` terminó con código 0. Pasaron 18 pruebas unitarias y 12 de navegador, con cero violaciones de axe. Lighthouse obtuvo 1,00 en rendimiento, accesibilidad, buenas prácticas y SEO en las seis mediciones de inicio y 404.
