import { readFile } from "node:fs/promises";
import { defineCollection } from "astro:content";
import { file, glob, type Loader } from "astro/loaders";
import { parse } from "yaml";
import {
  esquemaEvento,
  esquemaOrganizador,
  esquemaSitio,
} from "./content/esquemas";
import { parsearMeetup } from "./lib/meetup";

const rutaSitio = "src/content/sitio.yaml";

const sitio = defineCollection({
  loader: file(rutaSitio, {
    parser: (contenido) => ({ inicio: parse(contenido) }),
  }),
  schema: esquemaSitio,
});

const eventosLocales = glob({ base: "src/content/eventos", pattern: "*.md" });

function claveRegistro(valor: unknown) {
  if (typeof valor !== "string") return;
  const url = new URL(valor);
  const ruta = url.pathname.replace(/\/+$/, "");
  const eventoMeetup =
    /^(?:www\.)?meetup\.com$/.test(url.hostname) &&
    /\/events\/(\d+)$/.exec(ruta);
  return eventoMeetup
    ? `meetup.com/events/${eventoMeetup[1]}`
    : `${url.host}${ruta}${url.search}`;
}

const cargarEventos: Loader = {
  name: "eventos-meetup",
  async load(contexto) {
    const { config, logger, store, parseData } = contexto;
    await eventosLocales.load(contexto);
    if (process.env.MEETUP_DESACTIVADO === "1") return;

    try {
      let urlFeed = process.env.MEETUP_ICAL_URL;
      if (!urlFeed) {
        const datos = parse(
          await readFile(new URL(rutaSitio, config.root), "utf8"),
        );
        const sitioValidado = esquemaSitio.safeParse(datos);
        const meetup = sitioValidado.success && sitioValidado.data.meetup_url;
        if (!meetup) return;
        const url = new URL(meetup);
        url.pathname = `${url.pathname.replace(/\/+$/, "")}/events/ical/`;
        url.search = "";
        url.hash = "";
        urlFeed = url.href;
      }

      const respuesta = await fetch(urlFeed, {
        signal: AbortSignal.timeout(8000),
      });
      if (respuesta.status !== 200) throw new Error(`HTTP ${respuesta.status}`);
      const recibidos = parsearMeetup(await respuesta.text());
      const registros = new Set(
        store
          .values()
          .map(({ data }) => claveRegistro(data.url_registro))
          .filter(Boolean),
      );
      const nuevos = [];
      for (const { id, data } of recibidos) {
        const registro = claveRegistro(data.url_registro);
        if (store.has(id) || (registro && registros.has(registro))) continue;
        nuevos.push({ id, data: await parseData({ id, data }) });
        if (registro) registros.add(registro);
      }
      for (const evento of nuevos) store.set(evento);
      logger.info(`Eventos recibidos de Meetup: ${recibidos.length}`);
    } catch (error) {
      let motivo = "error al consultar o procesar el calendario";
      if (error instanceof Error) {
        if (error.name === "TimeoutError") motivo = "tiempo de espera agotado";
        if (/^HTTP \d{3}$/.test(error.message)) motivo = error.message;
      }
      logger.warn(
        `No se pudieron cargar los eventos de Meetup. Se usarán los eventos locales (${motivo}).`,
      );
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
