# Fase 0–1: Arnés y esqueleto — Plan de implementación

> **Para agentes:** ejecuta este plan tarea por tarea, en orden. Los pasos usan checkboxes (`- [ ]`). Lee primero el spec completo. Si no puedes hacer commits en tu entorno, deja cada tarea sin commitear y avisa: el orquestador revisa y commitea.

**Objetivo:** dejar el repo listo para que cualquier agente (Codex o Claude) construya el sitio sin adivinar. Eso incluye reglas escritas, modelo de contenido validado, una página mínima y un solo `pnpm verify` que decide cuándo algo está terminado.

**Arquitectura:** Astro estático con *content collections*. Los esquemas zod viven en un módulo propio para poder testearlos sin Astro. La lógica pura (qué CTA mostrar, qué eventos son próximos) va en `src/lib/` con tests unitarios (Vitest). La página se prueba ya construida con Playwright + axe y Lighthouse CI. Esta fase **no** incluye diseño visual, secciones finales ni infraestructura (fases 2–4).

**Stack:** Node 24 LTS, **pnpm** (fijado en `packageManager` de `package.json`, vía corepack), Astro (última estable), TypeScript estricto, Vitest, Playwright, @axe-core/playwright, linkinator, @lhci/cli, ESLint + Prettier, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-25-sitio-awsug-valle-design.md`

## Restricciones globales

- Todo texto visible, mensajes de error de validación y documentación: **español (Colombia)**.
- **Sin atribución de IA en ningún lugar**: nada de `Co-Authored-By`, "Generated with…" ni menciones a Claude o Codex en commits, PRs o archivos publicados. Los commits salen con la identidad git del dueño del repo.
- No inventar contenido real (eventos, organizadores, cifras). Todo el contenido de esta fase lleva `ejemplo: true`.
- Nada puede depender del usuario `pablo` ni de una cuenta concreta: el repo se va a transferir.
- Gestor de paquetes: **pnpm**. Nunca npm ni yarn; el único lockfile es `pnpm-lock.yaml`.
- Sin dependencias fuera de las del stack sin justificarlo en el PR.
- JS en el cliente: cero en esta fase.
- Accesibilidad WCAG 2.2 AA: cero violaciones de axe.
- Lighthouse ≥ 0.95 en performance, accessibility, best-practices y seo.

## Foco de revisión

1. **Zona horaria:** el build corre en UTC (CI), pero un evento del 2026-12-03 a las 19:00 de Cali debe seguir contando como "próximo" durante todo ese día en hora de Bogotá (UTC−5). → test en Tarea 3.
2. **`meetup_url` vacío:** un mantenedor que borra la URL y deja `meetup_url: ""` debe ver el CTA de Instagram, no un build roto ni un enlace vacío. → test en Tarea 3.
3. **Fecha no ISO:** `fecha: 25/11/2026` tiene que romper el build con un mensaje en español que nombre el campo `fecha`. → test en Tarea 2.
4. **Cero eventos futuros:** la página muestra el estado vacío con el CTA, no una sección en blanco. → test en Tarea 4.
5. **El sitio estático "congela" el próximo evento:** un evento ya pasado sigue apareciendo como próximo hasta el siguiente build. Esta fase solo lo documenta en `AGENTS.md`. La solución (rebuild diario programado) va en el plan de infraestructura (fase 4).

---

## Estructura de archivos

```
AGENTS.md                         # reglas para cualquier agente (fuente única)
CLAUDE.md                         # una línea: @AGENTS.md
docs/ORQUESTAR.md                 # cómo un orquestador lanza, revisa y entrega tareas
docs/tareas/_plantilla.md         # plantilla de brief por tarea
src/content.config.ts             # registra las colecciones de Astro usando los esquemas
src/content/esquemas.ts           # esquemas zod (testeables sin Astro)
src/content/sitio.yaml            # datos globales del sitio (ejemplo)
src/content/eventos/*.md          # eventos (ejemplo)
src/content/organizadores/*.yaml  # organizadores (ejemplo)
src/lib/cta.ts                    # resolverCta
src/lib/eventos.ts                # separarEventos
src/pages/index.astro             # página mínima sin estilos de diseño
src/pages/404.astro
scripts/revisar-ejemplo.mjs       # falla si queda contenido de ejemplo
tests/unit/*.test.ts              # Vitest
tests/e2e/*.spec.ts               # Playwright + axe
lighthouserc.json
.github/workflows/verify.yml
```

---

### Tarea 1: Documentos del arnés

**Archivos:** crear `AGENTS.md`, `CLAUDE.md`, `docs/ORQUESTAR.md`, `docs/tareas/_plantilla.md`.

**Interfaces:**
- Produce: los comandos `pnpm dev | build | preview | test | test:e2e | verify | revisar-ejemplo` (los implementan las Tareas 2–5; `AGENTS.md` los documenta con esos nombres exactos).

- [ ] **Paso 1:** escribir `AGENTS.md` con estas secciones, en este orden:
  1. *Qué es este repo*: tres líneas desde el spec §1–2 (sitio del AWS UG Valle del Cauca; éxito = suscripción al Meetup, si no hay Meetup = seguir en Instagram; público: profesionales, no estudiantes).
  2. *Mapa del repo*: la estructura de arriba, con una línea por archivo.
  3. *Comandos*: los siete de Interfaces, uno por línea con lo que hacen.
  4. *Definición de terminado*: `pnpm verify` pasa y el diff toca solo los archivos permitidos por el brief.
  5. *Reglas*: copiar las Restricciones globales de este plan. Agregar "no tocar `infra/` ni `.github/` salvo que el brief lo diga" y "el contenido real lo da el UG; nunca inventarlo".
  6. *Anti-objetivos de diseño*: copiar literal el bloque "Cara de hecho por IA" del spec §3.
  7. *Limitación conocida*: Foco de revisión #5.
- [ ] **Paso 2:** `CLAUDE.md` con una sola línea: `@AGENTS.md`.
- [ ] **Paso 3:** `docs/tareas/_plantilla.md` con estos encabezados: Objetivo · Contexto (links al spec y al plan) · Archivos permitidos · Archivos prohibidos · Interfaz a respetar · Verificación (comando + salida esperada) · Entregable (resumen del diff + salida de `verify`).
- [ ] **Paso 4:** `docs/ORQUESTAR.md`. Explica el ciclo para Claude o Codex como orquestador: (1) copiar la plantilla en `docs/tareas/NN-nombre.md` y llenarla; (2) lanzar el implementador con `workmux add <rama> -a gpt -b -P docs/tareas/NN-nombre.md` (o `-a cc`); (3) vigilar con `workmux status` / `workmux capture`; (4) revisar `git diff` contra "Archivos permitidos" y correr `pnpm verify` en el worktree; (5) commitear sin atribución de IA; (6) pedir aprobación humana antes de `workmux merge`. Máximo 3 agentes a la vez.
- [ ] **Paso 5:** verificar que los comandos se llamen igual en los documentos: `grep -ohE 'pnpm [a-z:-]+' AGENTS.md docs/ORQUESTAR.md | sort -u`.
- [ ] **Paso 6:** commit `docs: arnés para agentes (AGENTS.md, orquestación, plantilla de tareas)`.

### Tarea 2: Esqueleto Astro + esquemas de contenido

**Archivos:** crear `package.json`, `astro.config.mjs`, `tsconfig.json`, configuración de ESLint/Prettier, `.nvmrc` (`24`), `src/content/esquemas.ts`, `src/content.config.ts`, contenido de ejemplo y `tests/unit/esquemas.test.ts`.

**Interfaces:**
- Produce (en `src/content/esquemas.ts`):
  - `esquemaSitio`: `{ nombre: string; descripcion: string; meetup_url?: string (url o "" → undefined); instagram_url: string (url); linkedin_url?: string (url); otras_redes: { nombre: string; url: string }[] (default []); sbg_url: string (url); ejemplo: boolean (default false) }`
  - `esquemaEvento`: `{ titulo: string; fecha: Date (solo ISO 8601: "2026-12-03" o "2026-12-03T19:00:00-05:00"; si no trae hora se asume 00:00 en America/Bogota); lugar: string; modalidad: "presencial" | "virtual" | "hibrido"; url_registro?: string (url); destacado: boolean (default false); imagen?: string; ejemplo: boolean (default false) }`
  - `esquemaOrganizador`: `{ nombre: string; rol: string; foto?: string; linkedin?: string (url); orden: number (default 99); ejemplo: boolean (default false) }`
  - Tipos `Sitio`, `Evento`, `Organizador` = `z.infer` de cada uno.
  - Colecciones Astro `sitio` (file loader sobre `src/content/sitio.yaml`), `eventos` (glob `*.md`), `organizadores` (glob `*.yaml`).
- Scripts: `dev`, `build`, `preview`, `check` (`astro check`), `lint` (eslint + `prettier --check`), `test` (vitest run).

- [ ] **Paso 1:** inicializar Astro (plantilla mínima, TS `strict`), agregar Vitest, ESLint y Prettier.
- [ ] **Paso 2:** escribir `tests/unit/esquemas.test.ts` con:
  - `acepta un evento válido`: `{titulo:"Meetup", fecha:"2026-12-03", lugar:"Cali", modalidad:"presencial"}` parsea, `destacado === false` y `ejemplo === false`.
  - `rechaza fecha no ISO con mensaje en español`: `fecha:"25/11/2026"` falla; algún issue tiene `path` que contiene `"fecha"` y el `message` contiene `"AAAA-MM-DD"`.
  - `rechaza modalidad desconocida`: `modalidad:"remoto"` falla y el mensaje lista `presencial, virtual, hibrido`.
  - `meetup_url vacío se trata como ausente`: `esquemaSitio.parse({...base, meetup_url:""}).meetup_url === undefined`.
  - `organizador sin nombre falla con mensaje en español`: el mensaje contiene `"nombre"` y `"obligatorio"`.
- [ ] **Paso 3:** `pnpm test` → FALLA (los esquemas no existen todavía).
- [ ] **Paso 4:** implementar `esquemas.ts` y `content.config.ts`. Todos los mensajes de error van en español y nombran el campo. Para `fecha`: `"La fecha debe ir en formato AAAA-MM-DD (por ejemplo 2026-12-03)"`.
- [ ] **Paso 5:** contenido de ejemplo, todo con `ejemplo: true`:
  - `sitio.yaml`: sin `meetup_url`, `instagram_url: https://www.instagram.com/awsugvalle/`, `sbg_url: https://www.meetup.com/aws-sbg-at-universidad-del-valle-colombia/`.
  - un evento **pasado** (`eventos/2026-10-15-ejemplo.md`, título "Evento de ejemplo") y **ningún** evento futuro.
  - un organizador (`organizadores/ejemplo.yaml`, nombre "Persona de ejemplo").
- [ ] **Paso 6:** `pnpm test && pnpm check && pnpm build` → todo PASA.
- [ ] **Paso 7:** prueba manual de que un error rompe el build. Cambiar temporalmente la fecha del evento a `25/11/2026`, correr `pnpm build` → FALLA mostrando el mensaje en español. Revertir el cambio.
- [ ] **Paso 8:** commit `feat: esqueleto Astro y esquemas de contenido validados`.

### Tarea 3: Lógica pura — CTA y eventos

**Archivos:** crear `src/lib/cta.ts`, `src/lib/eventos.ts`, `tests/unit/cta.test.ts`, `tests/unit/eventos.test.ts`.

**Interfaces:**
- Consume: `Sitio`, `Evento` de la Tarea 2.
- Produce:
  - `resolverCta(sitio: Pick<Sitio, "meetup_url" | "instagram_url">): { url: string; etiqueta: "Únete en Meetup" | "Síguenos en Instagram"; destino: "meetup" | "instagram" }`
  - `separarEventos(eventos: Evento[], ahora: Date): { proximos: Evento[]; pasados: Evento[] }`. Un evento es próximo si su **día en America/Bogota** es ≥ el día de `ahora` en America/Bogota. `proximos` va ordenado ascendente y `pasados` descendente.

- [ ] **Paso 1:** tests de `cta.test.ts`:
  - con `meetup_url: "https://meetup.com/x"` → `{destino:"meetup", etiqueta:"Únete en Meetup", url:"https://meetup.com/x"}`
  - sin `meetup_url` → `{destino:"instagram", etiqueta:"Síguenos en Instagram", url: instagram_url}`
- [ ] **Paso 2:** tests de `eventos.test.ts`:
  - `evento de hoy en Bogotá sigue siendo próximo aunque en UTC ya sea mañana`: evento `2026-12-03T19:00:00-05:00`, `ahora = new Date("2026-12-04T03:30:00Z")` (22:30 del 3 en Bogotá) → está en `proximos`.
  - `evento de ayer es pasado`: `ahora = new Date("2026-12-04T15:00:00Z")` → está en `pasados`.
  - `orden`: tres eventos futuros desordenados salen ascendentes; tres pasados salen descendentes.
  - `lista vacía` → `{proximos:[], pasados:[]}`.
- [ ] **Paso 3:** `pnpm test` → FALLA.
- [ ] **Paso 4:** implementar ambas funciones. Comparar días con `Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" })` (formato `AAAA-MM-DD`), sin librerías de fechas.
- [ ] **Paso 5:** `pnpm test` → PASA.
- [ ] **Paso 6:** commit `feat: lógica de CTA y separación de eventos en hora de Bogotá`.

### Tarea 4: Página mínima + pruebas de navegador

**Archivos:** crear `src/pages/index.astro`, `src/pages/404.astro`, `playwright.config.ts`, `tests/e2e/inicio.spec.ts`.

**Interfaces:**
- Consume: `resolverCta`, `separarEventos` y las colecciones.
- Produce (contrato que las fases 2–3 deben conservar):
  - `data-testid="cta-principal"`: `<a>` con `href` = `resolverCta(sitio).url` y texto = `etiqueta`.
  - `data-testid="evento-proximo"`: un elemento por evento próximo.
  - `data-testid="eventos-vacio"`: aparece solo si no hay próximos, con el texto "Estamos preparando el próximo; suscríbete para enterarte" y un segundo enlace CTA.
  - `data-testid="enlace-sbg"`: enlace a `sbg_url`.
  - `<html lang="es-CO">`, un solo `<h1>` y `<title>` + `meta description` desde `sitio.yaml`.
- Scripts: `test:e2e` (playwright contra `astro preview` sobre el build).

- [ ] **Paso 1:** tests de `inicio.spec.ts`:
  - `el CTA principal apunta a Instagram cuando no hay Meetup`: `href === "https://www.instagram.com/awsugvalle/"` y el texto es "Síguenos en Instagram".
  - `sin eventos futuros se ve el estado vacío`: `eventos-vacio` visible y `evento-proximo` con count 0.
  - `hay enlace para estudiantes al SBG`: `enlace-sbg` tiene el `href` de `sbg_url`.
  - `sin violaciones de accesibilidad`: `new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze()` → `violations` es `[]`.
  - `404 responde con página propia`: `/no-existe` muestra un enlace de vuelta a `/`.
- [ ] **Paso 2:** `pnpm build && pnpm test:e2e` → FALLA.
- [ ] **Paso 3:** implementar ambas páginas con HTML semántico y estilos mínimos (los justos para contraste AA). Nada de diseño: eso es la fase 2.
- [ ] **Paso 4:** `pnpm build && pnpm test:e2e` → PASA.
- [ ] **Paso 5:** commit `feat: página mínima con contrato de testids y pruebas e2e`.

### Tarea 5: `verify` completo + revisión de contenido de ejemplo

**Archivos:** crear `scripts/revisar-ejemplo.mjs`, `tests/unit/revisar-ejemplo.test.ts`, `lighthouserc.json`; modificar `package.json` (scripts).

**Interfaces:**
- Produce:
  - `pnpm revisar-ejemplo`: sale con código 1 e imprime `Contenido de ejemplo pendiente:` seguido de una ruta por línea si algún archivo de `src/content/` tiene `ejemplo: true`; si no hay ninguno, sale con 0 e imprime `Sin contenido de ejemplo.`. Exporta `buscarEjemplos(dir: string): Promise<string[]>` para testearla.
  - `pnpm verify` = `check` → `lint` → `test` → `build` → `links` (linkinator sobre `dist/`, solo enlaces internos) → `test:e2e` → `lighthouse` (lhci autorun sobre `dist/`, aserciones ≥ 0.95 en las cuatro categorías). Se detiene en el primer fallo.
  - `verify` **no** corre `revisar-ejemplo`. Ese chequeo lo usa el despliegue (fase 4).

- [ ] **Paso 1:** test `buscarEjemplos` con un directorio temporal: un `.yaml` con `ejemplo: true`, un `.md` con frontmatter `ejemplo: true` y uno con `ejemplo: false` → devuelve exactamente las dos rutas.
- [ ] **Paso 2:** `pnpm test` → FALLA. Implementar. `pnpm test` → PASA.
- [ ] **Paso 3:** `pnpm revisar-ejemplo` en el repo → sale 1 y lista los tres archivos de ejemplo.
- [ ] **Paso 4:** configurar `links`, `lighthouse` y `verify`.
- [ ] **Paso 5:** `pnpm verify` → PASA de punta a punta. Si Lighthouse no puede correr en local (falta Chrome), separar en `verify` (sin Lighthouse) y `verify:ci` (con Lighthouse), actualizar `AGENTS.md` y anotarlo en el entregable.
- [ ] **Paso 6:** commit `chore: pnpm verify como definición de terminado`.

### Tarea 6: CI en GitHub Actions

**Archivos:** crear `.github/workflows/verify.yml`; modificar `AGENTS.md` (sección Comandos) solo si cambió algo en la Tarea 5.

**Interfaces:**
- Consume: `pnpm verify` (o `verify:ci`) de la Tarea 5.
- Produce: un job `verify` en `pull_request` y en `push` a `main`. Usa `actions/setup-node` con `node-version-file: .nvmrc` y caché pnpm (`pnpm/action-setup` antes de `setup-node` con `cache: pnpm`), `pnpm install --frozen-lockfile`, `pnpm exec playwright install --with-deps chromium` y luego el verify completo.

- [ ] **Paso 1:** escribir el workflow con permisos mínimos (`contents: read`).
- [ ] **Paso 2:** validar la sintaxis con `pnpm dlx @action-validator/cli .github/workflows/verify.yml` (o `actionlint` si está instalado) → sin errores.
- [ ] **Paso 3:** commit `ci: verificación en cada PR y push a main`.

---

## Entregable de la fase

Un resumen con: la lista de commits, la salida final de `pnpm verify` y cualquier desviación del plan (por ejemplo, la separación `verify:ci`). El orquestador revisa el diff completo contra este plan antes de pedir aprobación para mergear.
