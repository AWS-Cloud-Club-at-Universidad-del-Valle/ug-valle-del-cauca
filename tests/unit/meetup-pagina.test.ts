import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  combinarEventos,
  leerPaginaSiguienteMeetup,
  parsearPaginaMeetup,
} from "../../src/lib/meetup";

const fixture = readFileSync(
  new URL("../fixtures/meetup-eventos.html", import.meta.url),
  "utf8",
);
const json = /<script[^>]+>([\s\S]+?)<\/script>/.exec(fixture)![1];

describe("listados de Meetup", () => {
  it("acepta una conexión vacía", () => {
    const documento = JSON.parse(json);
    const grupo = documento.props.pageProps.__APOLLO_STATE__["Group:1"];
    Object.values<{ edges: unknown[] }>(grupo)[0].edges = [];
    const avisar = vi.fn();
    expect(
      parsearPaginaMeetup(JSON.stringify(documento), "futuros", avisar),
    ).toEqual([]);
    expect(avisar).not.toHaveBeenCalled();
  });

  it("extrae un encuentro futuro con el afiche, la sede y la descripción", () => {
    const avisar = vi.fn();
    expect(parsearPaginaMeetup(fixture, "futuros", avisar)).toEqual([
      {
        id: "1001",
        data: {
          titulo: "Encuentro futuro de prueba",
          fecha: "2099-12-05T10:00:00-05:00",
          modalidad: "presencial",
          lugar: "Sede de prueba",
          url_registro: "https://www.meetup.com/grupo-de-prueba/events/1001/",
          imagen:
            "https://secure.meetupstatic.com/photos/event/afiche-de-prueba.jpg",
          imagen_alt: "Afiche de Encuentro futuro de prueba",
          resumen: "Descripción de prueba.",
          ejemplo: false,
        },
      },
    ]);
    expect(avisar).not.toHaveBeenCalled();
  });

  it("acepta JSON con varios encuentros y omite los cancelados", () => {
    const avisar = vi.fn();
    expect(
      parsearPaginaMeetup(json, "pasados", avisar).map(({ id }) => id),
    ).toEqual(["1002", "1003"]);
    expect(avisar).not.toHaveBeenCalled();
  });

  it("lee otra página por cursor y tolera una respuesta de error", () => {
    const avisar = vi.fn();
    const estado = JSON.parse(json).props.pageProps.__APOLLO_STATE__;
    const events = {
      pageInfo: { hasNextPage: true, endCursor: "otro-cursor" },
      edges: [{ node: { ...estado["Event:1002"], venue: estado["Venue:2"] } }],
    };
    expect(
      leerPaginaSiguienteMeetup(
        { data: { groupByUrlname: { events } } },
        avisar,
      ),
    ).toMatchObject({
      siguiente: "otro-cursor",
      eventos: [{ id: "1002", data: { lugar: "Sede de prueba" } }],
    });
    expect(avisar).not.toHaveBeenCalled();
    expect(leerPaginaSiguienteMeetup({}, avisar)).toEqual({ eventos: [] });
    expect(avisar).toHaveBeenCalledOnce();
  });

  it.each(["{", "{}"])(
    "avisa si la estructura es inesperada (%s)",
    (contenido) => {
      const avisar = vi.fn();
      expect(parsearPaginaMeetup(contenido, "pasados", avisar)).toEqual([]);
      expect(avisar).toHaveBeenCalledOnce();
    },
  );
});

describe("combinación de fuentes", () => {
  it("conserva los datos y el cuerpo locales, y completa los campos faltantes", () => {
    const remotos = parsearPaginaMeetup(fixture, "pasados", vi.fn());
    const local = {
      id: "taller",
      body: "Agenda local",
      data: {
        titulo: "Título local",
        imagen: "/afiche.webp",
        url_registro: "https://meetup.com/otro-slug/events/1002?from=prueba",
      },
    };
    const combinados = combinarEventos([local], remotos);
    expect(combinados).toHaveLength(2);
    expect(combinados[0]).toMatchObject({
      ...local,
      data: { ...local.data, resumen: "Descripción de prueba." },
    });
    expect(combinados[0].data).not.toHaveProperty("imagen_alt");
    expect(combinados[1]).toBe(remotos[1]);
  });

  it("completa el afiche y deduplica las dos fuentes remotas por número de Meetup", () => {
    const [pagina] = parsearPaginaMeetup(fixture, "futuros", vi.fn());
    const ical = {
      ...pagina,
      id: "uid-1001",
      data: { ...pagina.data, imagen: undefined },
    };
    const resultado = combinarEventos(
      [{ id: "1001", data: {} }],
      [pagina, ical],
    );
    expect(resultado).toEqual([pagina]);
  });
});
