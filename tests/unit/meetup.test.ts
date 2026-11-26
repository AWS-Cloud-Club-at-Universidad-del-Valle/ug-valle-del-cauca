import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { esquemaEvento } from "../../src/content/esquemas";
import { parsearMeetup } from "../../src/lib/meetup";

function fixture(nombre: string) {
  return readFileSync(
    new URL(`../fixtures/${nombre}.ics`, import.meta.url),
    "utf8",
  );
}

describe("parsearMeetup", () => {
  it("desdobla líneas, desescapa texto e interpreta la zona horaria", () => {
    const eventos = parsearMeetup(fixture("meetup").replace(/\n/g, "\r\n"));

    expect(eventos.map(({ id }) => id)).toEqual([
      "presencial-ejemplo",
      "virtual-ejemplo",
    ]);
    expect(eventos.map(({ data }) => esquemaEvento.parse(data))).toEqual([
      {
        titulo: "Encuentro, charla; y taller\nEjercicio",
        fecha: new Date("2026-12-03T23:00:00Z"),
        lugar: "Cali, Valle del Cauca",
        modalidad: "presencial",
        url_registro: "https://example.org/eventos/presencial/",
        destacado: false,
        ejemplo: false,
      },
      {
        titulo: "Encuentro virtual de ejemplo",
        fecha: new Date("2026-12-04T00:00:00Z"),
        lugar: "En línea",
        modalidad: "virtual",
        url_registro: "https://example.org/eventos/virtual/",
        destacado: false,
        ejemplo: false,
      },
    ]);
  });

  it("devuelve una lista vacía para un calendario sin eventos", () => {
    expect(parsearMeetup(fixture("meetup-vacio"))).toEqual([]);
  });

  it("omite eventos inválidos y trata la ausencia de ubicación como virtual", () => {
    const entrada = fixture("meetup")
      .replace("America/Bogota", "Zona/Inexistente")
      .replace("LOCATION:Online\n", "");
    const eventos = parsearMeetup(entrada);
    expect(eventos).toHaveLength(1);
    expect(eventos[0].data.modalidad).toBe("virtual");
  });
});
