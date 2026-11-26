# Qué es este repo

Sitio estático del AWS User Group Valle del Cauca.  
El éxito es lograr una suscripción al Meetup o, si falta, que sigan al grupo en Instagram.  
El público son profesionales de tecnología del Valle. Los estudiantes cuentan con el SBG.

## Mapa del repo

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
src/lib/meetup.ts                 # convierte el calendario de Meetup en eventos
src/pages/index.astro             # página mínima sin estilos de diseño
src/pages/404.astro
scripts/revisar-ejemplo.mjs       # falla si queda contenido de ejemplo
scripts/desplegar.sh              # publicación manual desde dist/
infra/                            # sitio privado con S3 y CloudFront
infra/bootstrap/                  # bucket de estado y roles OIDC
docs/TRASPASO.md                  # primera publicación y cambio de cuenta o dueño
tests/unit/*.test.ts              # Vitest
tests/unit/meetup.test.ts          # pruebas del parser iCal
tests/fixtures/meetup*.ics         # calendarios de prueba
tests/e2e/*.spec.ts               # Playwright + axe
lighthouserc.json
.github/workflows/verify.yml
.github/workflows/desplegar.yml
```

## Comandos

- `pnpm dev` inicia el servidor de desarrollo.
- `pnpm build` genera el sitio estático.
- `pnpm preview` sirve el sitio construido.
- `pnpm test` ejecuta las pruebas unitarias.
- `pnpm test:e2e` prueba el sitio construido en el navegador.
- `pnpm verify` ejecuta la verificación completa.
- `pnpm revisar-ejemplo` detecta contenido de ejemplo pendiente.
- `scripts/desplegar.sh` publica el build local con las salidas de Terraform.

## Definición de terminado

`pnpm verify` pasa y el diff toca solo los archivos permitidos por el brief.

## Reglas

- Todo texto visible, mensajes de error de validación y documentación: **español (Colombia)**.
- **Sin atribución de IA en ningún lugar**: nada de `Co-Authored-By`, "Generated with…" ni menciones a Claude o Codex en commits, PRs o archivos publicados. Los commits salen con la identidad git del dueño del repo.
- No inventar contenido real (eventos, organizadores, cifras). Todo el contenido de esta fase lleva `ejemplo: true`.
- Nada puede depender del usuario `pablo` ni de una cuenta concreta: el repo se va a transferir.
- Gestor de paquetes: **pnpm**. Nunca npm ni yarn; el único lockfile es `pnpm-lock.yaml`.
- Sin dependencias fuera de las del stack sin justificarlo en el PR.
- JS en el cliente: solo como mejora progresiva, en un único script en línea de JavaScript plano de 2 KB como máximo, sin frameworks ni dependencias. La página debe verse y funcionar completa sin JS, y el script no hace nada con `prefers-reduced-motion: reduce`.
- Accesibilidad WCAG 2.2 AA: cero violaciones de axe.
- Lighthouse ≥ 0.95 en performance, accessibility, best-practices y seo.
- No tocar `infra/` ni `.github/` salvo que el brief lo diga.
- El contenido real lo da el UG. Nunca inventarlo.

## Anti-objetivos de diseño

- **Cara de "hecho por IA":** hero con gradiente genérico, grillas de 3 tarjetas con íconos, emojis decorativos, textos tipo "empoderamos la innovación", fotos de stock, mezcla aleatoria de estilos. El sitio debe sentirse hecho por y para la comunidad de Cali.

## Limitación conocida

El sitio estático congela la clasificación de eventos al construirlo. La reconstrucción diaria está programada para las 6:00 a. m. de Cali. Un evento puede seguir apareciendo como próximo hasta el siguiente despliegue exitoso. La guarda de contenido de ejemplo también aplica a las ejecuciones programadas.
