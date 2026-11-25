import { expect, it } from "vitest";
import { esquemaEvento } from "../../src/content/esquemas";
import { separarEventos } from "../../src/lib/eventos";

const evento = (fecha: string) =>
  esquemaEvento.parse({
    titulo: "Evento de ejemplo",
    lugar: "Cali",
    modalidad: "presencial",
    fecha,
  });

const meetup = evento("2026-12-03T19:00:00-05:00");

it("evento de hoy en Bogotá sigue siendo próximo aunque en UTC ya sea mañana", () => {
  const ahora = new Date("2026-12-04T03:30:00Z");
  expect(separarEventos([meetup], ahora)).toEqual({
    proximos: [meetup],
    pasados: [],
  });
});

it("evento de ayer es pasado", () => {
  const ahora = new Date("2026-12-04T15:00:00Z");
  expect(separarEventos([meetup], ahora)).toEqual({
    proximos: [],
    pasados: [meetup],
  });
});

it("ordena los próximos de más cercano a más lejano y los pasados al revés", () => {
  const pasados = ["2026-12-02", "2026-12-01", "2026-11-30"].map(evento);
  const proximos = ["2026-12-03", "2026-12-04", "2026-12-05"].map(evento);
  const ahora = new Date("2026-12-03T16:00:00Z");
  const eventos = [...pasados.toReversed(), ...proximos.toReversed()];

  expect(separarEventos(eventos, ahora)).toEqual({ proximos, pasados });
});

it("devuelve las dos listas vacías si faltan eventos", () => {
  expect(separarEventos([], new Date())).toEqual({ proximos: [], pasados: [] });
});
