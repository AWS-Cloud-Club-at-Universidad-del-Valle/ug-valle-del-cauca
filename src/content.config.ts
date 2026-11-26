import { readFile } from "node:fs/promises";
import { defineCollection } from "astro:content";
import { file, glob, type Loader } from "astro/loaders";
import { parse } from "yaml";
import {
  esquemaEvento,
  esquemaOrganizador,
  esquemaSitio,
} from "./content/esquemas";
import {
  combinarEventos,
  leerPaginaMeetup,
  leerPaginaSiguienteMeetup,
  parsearMeetup,
  parsearPaginaMeetup,
} from "./lib/meetup";

const rutaSitio = "src/content/sitio.yaml";

const sitio = defineCollection({
  loader: file(rutaSitio, {
    parser: (contenido) => ({ inicio: parse(contenido) }),
  }),
  schema: esquemaSitio,
});

const eventosLocales = glob({ base: "src/content/eventos", pattern: "*.md" });

async function leerFuente(url: string, fuente: string) {
  if (url.startsWith("file:")) return readFile(new URL(url), "utf8");
  const direccion = new URL(url);
  if (fuente === "pasados") direccion.searchParams.set("type", "past");
  const respuesta = await fetch(direccion, {
    signal: AbortSignal.timeout(8000),
  });
  if (respuesta.status !== 200) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.text();
}

// Operación persistida que usa el listado público de Meetup al desplazarse.
const consultaPasados =
  "7ee35e6c00aafa75572fea738e4a6d7188354af9c3836ed5bd4c25d22c95d271";

async function completarPasados(
  url: string,
  contenido: string,
  avisar: (mensaje: string) => void,
) {
  const pagina = leerPaginaMeetup(contenido, "pasados", avisar);
  const { eventos, fecha, grupo } = pagina;
  const origen = new URL(url).origin;
  if (!fecha || !grupo || origen !== "https://www.meetup.com") return eventos;

  const signal = AbortSignal.timeout(8000);
  const cursores = new Set<string>();
  let cursor = pagina.siguiente;
  try {
    while (cursor) {
      if (cursores.has(cursor) || cursores.size >= 50) {
        throw new Error("Paginación incompleta");
      }
      cursores.add(cursor);
      const respuesta = await fetch(new URL("/gql2", origen), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          operationName: "getPastGroupEvents",
          variables: { urlname: grupo, beforeDateTime: fecha, after: cursor },
          extensions: {
            persistedQuery: { version: 1, sha256Hash: consultaPasados },
          },
        }),
      });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const siguiente = leerPaginaSiguienteMeetup(
        await respuesta.json(),
        avisar,
      );
      eventos.push(...siguiente.eventos);
      cursor = siguiente.siguiente;
    }
  } catch {
    avisar(
      "No se pudo completar la paginación de Meetup. Se conservarán los eventos recibidos.",
    );
  }
  return eventos;
}

const cargarEventos: Loader = {
  name: "eventos-meetup",
  async load(contexto) {
    const { config, logger, store, parseData } = contexto;
    await eventosLocales.load(contexto);
    if (process.env.MEETUP_DESACTIVADO === "1") return;

    const datos = parse(
      await readFile(new URL(rutaSitio, config.root), "utf8"),
    );
    const sitioValidado = esquemaSitio.safeParse(datos);
    const meetup = sitioValidado.success && sitioValidado.data.meetup_url;
    const predeterminada = meetup
      ? new URL("events/", `${meetup.replace(/\/+$/, "")}/`).href
      : undefined;
    const urlIcal =
      process.env.MEETUP_ICAL_URL ??
      (predeterminada && new URL("ical/", predeterminada).href);
    const urlEventos = process.env.MEETUP_EVENTOS_URL ?? predeterminada;

    async function consultar<T>(
      url: string | undefined,
      fuente: string,
      convertir: (contenido: string, url: string) => T[] | Promise<T[]>,
    ) {
      if (!url) return [];
      try {
        const eventos = await convertir(await leerFuente(url, fuente), url);
        logger.info(
          `Eventos recibidos de Meetup (${fuente}): ${eventos.length}`,
        );
        return eventos;
      } catch (error) {
        const motivo =
          error instanceof Error && /^HTTP \d{3}$/.test(error.message)
            ? ` (${error.message})`
            : "";
        logger.warn(
          `No se pudieron cargar los eventos de Meetup (${fuente})${motivo}. Se conservarán los eventos locales.`,
        );
        return [];
      }
    }

    const [ical, futuros, pasados] = await Promise.all([
      consultar(urlIcal, "iCal", (contenido) => {
        if (
          !/^BEGIN:VCALENDAR\s*$/m.test(contenido) ||
          !/^END:VCALENDAR\s*$/m.test(contenido)
        ) {
          throw new Error("Calendario inválido");
        }
        return parsearMeetup(contenido);
      }),
      consultar(urlEventos, "futuros", (contenido) =>
        parsearPaginaMeetup(contenido, "futuros", (aviso) =>
          logger.warn(aviso),
        ),
      ),
      consultar(urlEventos, "pasados", (contenido, url) =>
        completarPasados(url, contenido, (aviso) => logger.warn(aviso)),
      ),
    ] as const);
    const locales = store.values();
    const entradas = combinarEventos(locales, [
      ...futuros,
      ...pasados,
      ...ical,
    ]);
    const ids = new Set(entradas.map(({ id }) => id));
    for (const local of locales) {
      if (!ids.has(local.id)) store.delete(local.id);
    }
    for (const entrada of entradas) {
      const local = store.get(entrada.id);
      if (local === entrada) continue;
      if (local) {
        // El glob debe releer el Markdown en el siguiente sync.
        store.set({ ...local, data: entrada.data, digest: undefined });
      } else {
        const { id, data } = entrada;
        store.set({ id, data: await parseData({ id, data }) });
      }
    }
  },
};

const eventos = defineCollection({
  loader: cargarEventos,
  schema: esquemaEvento,
});

const organizadores = defineCollection({
  loader: glob({ base: "src/content/organizadores", pattern: "*.yaml" }),
  schema: esquemaOrganizador,
});

export const collections = { sitio, eventos, organizadores };
