# Sitio web del AWS User Group Valle del Cauca — Diseño

Fecha: 2026-11-25 · Autor del diseño: Pablo Nicolás Marín (con Claude como orquestador)

## 1. Intención

El AWS User Group Valle del Cauca (Instagram: [@awsugvalle](https://www.instagram.com/awsugvalle/)) necesita un sitio propio que reúna quiénes son, qué hacen y cómo unirse.

**Una sola acción define el éxito:** que un profesional de tecnología del Valle que no conoce el grupo termine **suscrito al Meetup del UG**. Si el UG todavía no tiene Meetup, la acción es **seguirlos en Instagram**. Todo el resto de la página existe para convencer de dar ese clic.

Pablo construye el sitio y lo entrega. **El mantenimiento queda en manos de la gente del UG**, que no debe depender de Pablo para publicar un evento.

## 2. Público

- **Principal:** profesionales de tecnología del Valle del Cauca (devs, cloud, DevOps, datos, emprendedores técnicos) que aún no conocen el grupo.
- **No es el público:** estudiantes. Para ellos existe el AWS Student Builder Group (SBG), una comunidad distinta. El sitio los redirige con un enlace breve y no se convierte en el sitio del SBG.
- **Tensión abierta:** la bio de Instagram dice "abierta a profesionales, estudiantes, emprendedores, docentes…". El UG debe confirmar el mensaje público (ver §11).

## 3. Objetivos, no-objetivos y anti-objetivos

**Objetivos**
- Una persona entiende qué es el UG y cuál es el próximo meetup en los primeros segundos, y encuentra el botón de unirse sin buscarlo.
- La gente del UG puede publicar o editar un evento, un organizador o un texto desde la web de GitHub, sin instalar nada.
- Un error de edición (fecha mal escrita, campo faltante) **rompe el build con un mensaje claro** y nunca llega a producción.
- El sitio se aloja en AWS y sirve como ejemplo de buenas prácticas del propio grupo.

**No-objetivos**
- Registro de asistentes, login, formularios o backend propio. Meetup ya hace eso.
- Blog, CMS visual o panel de administración.
- Ser el sitio de la red de comunidades del Valle o del SBG.
- Multi-idioma. Solo español en la v1.

**Anti-objetivos** (si pasa esto, fracasó aunque "funcione")
- **Cara de "hecho por IA":** hero con gradiente genérico, grillas de 3 tarjetas con íconos, emojis decorativos, textos tipo "empoderamos la innovación", fotos de stock, mezcla aleatoria de estilos. El sitio debe sentirse hecho por y para la comunidad de Cali.
- **Depender de Pablo** (o de alguien técnico) para cada cambio de contenido.
- Que un estudiante crea que esto es el SBG, o que un profesional crea que es un grupo estudiantil.
- Contenido inventado: eventos, cifras, organizadores o fotos que no sean reales.

## 4. Restricciones

- Idioma: español (Colombia).
- Mantenimiento por profesionales del UG vía GitHub. Se asume que saben usar GitHub web; no necesitan saber Astro.
- La cuenta AWS y el dominio deben ser **del UG**, no personales de Pablo.
- Accesibilidad WCAG 2.2 AA. Funciona bien en móvil, que es por donde llega la mayoría desde Instagram.
- Rendimiento: HTML estático, sin JS salvo donde aporte. Lighthouse ≥ 95 en las cuatro categorías.

## 5. Enfoques considerados

| Enfoque | A favor | En contra |
|---|---|---|
| **A. Astro estático + S3/CloudFront** ✅ | Las *content collections* con esquema (zod) validan el contenido en el build. HTML puro, rápido y barato. Componentes reutilizables. | Requiere Node para desarrollar (no para editar contenido). |
| B. HTML/CSS a mano + script | Sin dependencias. | No valida nada: un error del mantenedor pasa directo a producción. Tiende a duplicar código. |
| C. Next.js en Amplify | Backend y formularios disponibles. | Sobredimensionado para una landing que redirige a Meetup/Instagram. Más carga de mantenimiento. |

**Elegido: A** (decisión de Pablo, 2026-11-25). Es el único que protege a los mantenedores no técnicos sin exigirles saber programar.

## 6. Contenido y estructura

Una sola página principal (landing) más una página 404. Secciones en orden:

1. **Hero:** qué es el UG en una frase, el **próximo meetup** (fecha, lugar, tema) si existe y el **CTA principal** ("Únete en Meetup" o "Síguenos en Instagram").
2. **Qué es el UG:** comunidad de profesionales AWS del Valle, qué se hace en un meetup (charlas, networking, hands-on). Incluye una línea para estudiantes con enlace al SBG.
3. **Próximos eventos:** lista desde `eventos`. Si no hay ninguno futuro, un estado vacío digno ("Estamos preparando el próximo; suscríbete para enterarte") con el CTA.
4. **Lo que hemos hecho:** eventos pasados, con **Tech Day Cali** (techdaycali.com) destacado como prueba de trayectoria.
5. **Organizadores:** foto, nombre, rol y enlace (LinkedIn), desde `organizadores`.
6. **Cómo unirse / redes:** el CTA otra vez, más Instagram, Meetup, LinkedIn y otros canales que existan.
7. **Footer:** relación con AWS (comunidad independiente, parte del programa AWS User Groups), créditos y enlace al repo.

**Regla del CTA:** el destino sale de **un solo dato** en `src/content/sitio.yaml`. Si `meetup_url` existe se usa; si no, se usa `instagram_url`. Cambiar de Instagram a Meetup es editar una línea.

### Modelo de contenido (archivos editables por el UG)

```
src/content/
  sitio.yaml            # nombre, descripción, meetup_url?, instagram_url, otras redes, url_sbg
  eventos/*.md          # frontmatter: titulo, fecha (ISO), lugar, modalidad, url_registro?, destacado?, imagen?
  organizadores/*.yaml  # nombre, rol, foto, linkedin?
public/img/             # fotos subidas por el UG
```

Cada colección tiene esquema zod. Un evento sin fecha válida o un organizador sin nombre rompe el build con un mensaje en español que dice qué archivo y qué campo fallaron.

## 7. Identidad visual

El UG **ya tiene identidad** y el sitio parte de ella, no inventa una nueva:
- Badge **hexagonal** (formato de los AWS User Groups) sobre **azul noche** casi negro, con **borde violeta**.
- Ilustración de **caña de azúcar** blanca con **notas musicales** (salsa), destellos y nube.
- Tipografía: "aws / User Group" en blanco y "Valle del Cauca" en violeta.

Lineamientos:
- Paleta base: azul noche, violeta del logo, blanco y un neutro. Los valores exactos salen del logo original.
- Los motivos locales (caña, notas, hexágono) se usan con mesura como recursos gráficos, no como decoración en cada sección.
- Al construir el front se usa la skill **`frontend-design`**, y la revisión anti-slop se hace con **`impeccable`**.
- **Logo:** se pide el original (SVG o PNG grande) al UG. Si no llega, se redibuja en SVG copiando fielmente el actual (skill `logo-identity`), sin rediseñarlo.

## 8. Infraestructura y despliegue

- **Hosting:** S3 privado + CloudFront con Origin Access Control y HTTPS. Dominio pendiente (ver §11).
- **IaC (decisión de Pablo): Terraform** en `infra/`. El estado remoto vive en S3 con bloqueo nativo (`use_lockfile`). Un módulo `infra/bootstrap/` crea una sola vez el bucket de estado y el proveedor OIDC de GitHub con su rol de despliegue.
- **CI/CD:** GitHub Actions. En cada PR corre la verificación completa (§9) más `terraform fmt -check`, `validate` y `plan`, con el plan publicado en el PR. En cada merge a `main` se construye y despliega con rol IAM asumido por **OIDC** (sin llaves guardadas) y se invalida CloudFront.
- **Antes del lanzamiento** *(decisión del orquestador)*: un solo entorno. El job de despliegue revisa si queda contenido `ejemplo: true`; si queda, **se salta con un aviso, no falla**. Así `main` puede recibir merges con contenido de ejemplo sin poner el CI en rojo, y el primer despliegue real ocurre solo cuando llega el contenido verdadero. No hay staging en la v1; para revisar se usa `astro preview` en local.
- **Cuenta AWS (decisión de Pablo):** la v1 se despliega en la cuenta de Pablo, con el dominio por defecto de CloudFront (`*.cloudfront.net`). Después se traslada a la cuenta del UG.
- **Diseñado para traspasar:** nada queda amarrado a Pablo. La cuenta, la región, el repo de GitHub (owner/nombre) y el dominio opcional son **variables** de Terraform (`terraform.tfvars`), no valores escritos en el código. La condición OIDC del rol de despliegue se arma con esos parámetros. `docs/TRASPASO.md` explica paso a paso cómo mover el stack a otra cuenta y cambiar el repo de dueño.

### Repositorio y flujo de cambios (decisión de Pablo)

- **Ahora:** el repo vive en la cuenta de GitHub de Pablo. Pablo aprueba los merges mientras se construye.
- **Después:** se transfiere a la organización del UG o a un miembro. Desde ese momento, los mantenedores editan desde la web, eso abre un PR, el CI corre `verify` y cualquier otro miembro del UG aprueba. Pablo sale del flujo.
- Nada en el repo (workflows, Terraform, docs) puede depender del usuario `pablo`. El traspaso tiene que ser transferir el repo y actualizar dos parámetros.

## 9. Arnés para agentes (harness engineering)

Objetivo: que Codex (y luego cualquier persona o agente del UG) trabaje en el repo **sin adivinar**, con verificación automática de "terminado".

**Archivos del arnés**
- **El arnés no depende del agente** *(decisión de Pablo: se quiere usar con Codex, incluso como orquestador)*. `AGENTS.md` es la fuente única, que Codex lee de forma nativa. `CLAUDE.md` solo lo importa. Los briefs, el `verify` y las reglas de orquestación viven en el repo, así que Claude o Codex pueden orquestar o implementar con las mismas reglas.
- `AGENTS.md`: propósito del sitio, estructura, comandos, reglas (no inventar contenido, no tocar `infra/` salvo tarea explícita, no agregar dependencias sin justificar, textos en español), anti-objetivos de diseño y definición de terminado.
- `docs/tareas/NN-nombre.md`: un brief por tarea con objetivo, archivos permitidos y prohibidos, interfaz a respetar, comando de verificación y entregable. Es lo que recibe cada agente.
- `docs/ORQUESTAR.md`: cómo un agente orquestador (Claude o Codex) toma un brief de `docs/tareas/`, lanza el implementador, revisa el diff contra los archivos permitidos, corre `verify` y deja el PR listo para aprobación humana.
- `MANTENER.md`: guía para la gente del UG, con capturas, de cómo agregar un evento o un organizador o cambiar el CTA desde GitHub web.

**Verificación: un solo comando `npm run verify`** que corre, en orden:
1. `astro check` + TypeScript estricto (tipos y esquemas de contenido).
2. ESLint + Prettier (formato).
3. `astro build`.
4. Revisión de enlaces del build (enlaces internos rotos = falla).
5. Playwright: smoke tests (la página carga, el CTA apunta a la URL configurada, la regla Meetup→Instagram funciona, el estado vacío de eventos se ve).
6. axe-core: cero violaciones de accesibilidad.
7. Lighthouse CI con presupuesto (≥ 95).

CI corre el mismo `npm run verify`. *(Decisión del orquestador)*: los agentes corren en esta máquina con workmux, con red y navegadores. Si en la fase 1 resulta que Lighthouse no corre en local, se separa en `verify` (local, pasos 1–6) y `verify:ci` (todo, incluido Lighthouse), y el brief de cada tarea dice cuál se exige. **Una tarea está terminada solo si `npm run verify` pasa** y el diff toca únicamente los archivos permitidos en su brief.

## 10. Orquestación (Claude orquesta, Codex implementa)

| Fase | Quién | Qué | Por qué ese agente |
|---|---|---|---|
| 0. Arnés | Claude (orquestador) con Pablo | `AGENTS.md`, briefs de tareas, definición de `verify` | Requiere criterio y las decisiones de este diseño |
| 1. Esqueleto + tooling | Codex | Proyecto Astro, esquemas de contenido, `npm run verify` completo con tests de ejemplo, CI | Tarea definida con criterio de terminado claro |
| 2. Identidad + logo SVG | Codex, con los lineamientos de `frontend-design` copiados en el brief; Claude revisa | Tokens de diseño desde el logo, SVG fiel, layout base | Ahorro de cuota de Claude; el criterio va escrito en el brief |
| 3. Secciones | Codex (1–2 agentes en paralelo, archivos disjuntos) | Componentes de cada sección contra el brief y los tokens | Implementación contra interfaz dada |
| 4. Infra | Codex | Terraform + workflows de GitHub Actions (plan en PR, apply en `main`, OIDC) | Mecánico y verificable con `terraform validate/plan` |
| 5. Revisión | Claude + `impeccable` | Auditoría anti-slop, accesibilidad y textos | Criterio; es donde Claude aporta más por token |
| 6. Guía de mantenimiento | Codex; Claude revisa | `MANTENER.md`, `docs/TRASPASO.md` | Texto guiado por plantilla |

**Reparto de cuota (decisión de Pablo):** Codex hace todo el trabajo de implementación. Claude escribe los briefs, revisa las entregas y hace la auditoría final. Máximo 2–3 agentes a la vez. Cada entrega se revisa (diff y `verify`) y se mergea solo con el visto bueno de Pablo.

**Sin rastro de IA en GitHub (decisión de Pablo):** ningún commit, PR, issue ni archivo publicado lleva atribución a Claude ni a Codex (nada de `Co-Authored-By`, "Generated with…" ni bots como autores). Los commits salen con la identidad git de Pablo.

## 11. Pendiente del UG (bloquea contenido, no el arnés)

- Logo original en SVG o PNG de alta resolución.
- ¿Existe Meetup del UG? URL.
- Los otros dos links de la bio de Instagram y demás redes (LinkedIn, etc.).
- Organizadores: nombres, roles, fotos y LinkedIn, con su permiso para publicarlos.
- Eventos pasados reales (incluido Tech Day Cali: qué rol tuvo el UG, fecha, fotos) y próximo meetup.
- Mensaje público: ¿"solo profesionales" o "abierta a todos" como dice la bio?
- Para el traspaso, no para la v1: dominio, cuenta AWS del UG y organización de GitHub destino.

Mientras tanto, las fases 0–4 avanzan con **contenido de ejemplo marcado como tal** (`ejemplo: true`). El build de producción falla si queda contenido de ejemplo.

## 12. Lo que se deja al constructor

- Versiones exactas de dependencias y configuración de herramientas.
- Estructura interna de componentes y nombres de archivos fuera de `src/content/`.
- Detalles de animación y microinteracciones, siempre que respeten `prefers-reduced-motion` y los anti-objetivos.
- Herramienta concreta para revisar enlaces.
