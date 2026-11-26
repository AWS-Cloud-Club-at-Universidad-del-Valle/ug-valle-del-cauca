import { describe, expect, it } from "vitest";
import {
  esquemaEvento,
  esquemaOrganizador,
  esquemaSitio,
} from "../../src/content/esquemas";

const evento = {
  titulo: "Meetup",
  fecha: "2026-12-03",
  lugar: "Cali",
  modalidad: "presencial",
};

describe("esquemas de contenido", () => {
  it("acepta un evento válido", () => {
    expect(esquemaEvento.parse(evento)).toMatchObject({
      fecha: new Date("2026-12-03T05:00:00Z"),
      destacado: false,
      ejemplo: false,
    });
  });

  it.each(["resumen", "imagen_alt"])(
    "valida el texto opcional de %s",
    (campo) => {
      expect(esquemaEvento.parse(evento)).not.toHaveProperty(campo);
      expect(
        esquemaEvento.parse({ ...evento, [campo]: " Texto " }),
      ).toHaveProperty(campo, "Texto");
      expect(
        esquemaEvento.safeParse({ ...evento, [campo]: " " }).error?.issues[0]
          ?.message,
      ).toContain(`El campo ${campo} es obligatorio y debe contener texto`);
    },
  );

  it("acepta fecha sin comillas (Date de YAML) como día en Bogotá", () => {
    const resultado = esquemaEvento.parse({
      ...evento,
      fecha: new Date("2026-12-03T00:00:00Z"),
    });
    expect(resultado.fecha).toEqual(new Date("2026-12-03T00:00:00-05:00"));
  });

  it("rechaza fecha no ISO con mensaje en español", () => {
    const resultado = esquemaEvento.safeParse({
      ...evento,
      fecha: "25/11/2026",
    });
    expect(resultado.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["fecha"],
          message: expect.stringContaining("AAAA-MM-DD"),
        }),
      ]),
    );
  });

  it("rechaza modalidad desconocida", () => {
    const resultado = esquemaEvento.safeParse({
      ...evento,
      modalidad: "remoto",
    });
    expect(resultado.error?.issues[0]?.message).toContain(
      "presencial, virtual, hibrido",
    );
  });

  it("meetup_url vacío se trata como ausente", () => {
    const sitio = esquemaSitio.parse({
      nombre: "Sitio de ejemplo",
      descripcion: "Descripción de ejemplo",
      meetup_url: "",
      instagram_url: "https://example.com/instagram",
      sbg_url: "https://example.com/sbg",
    });
    expect(sitio.meetup_url).toBeUndefined();
  });

  it("valida la foto y el texto alternativo opcionales del organizador", () => {
    const organizador = { nombre: "Persona de ejemplo", rol: "Organizador" };
    const foto = "/img/organizadores/persona.webp";
    const foto_alt = "Retrato de Persona de ejemplo";

    expect(esquemaOrganizador.parse(organizador)).not.toHaveProperty("foto");
    expect(
      esquemaOrganizador.parse({ ...organizador, foto }),
    ).not.toHaveProperty("foto_alt");
    expect(
      esquemaOrganizador.parse({ ...organizador, foto, foto_alt }),
    ).toMatchObject({
      foto,
      foto_alt,
    });
    for (const campo of ["foto", "foto_alt"]) {
      expect(
        esquemaOrganizador.safeParse({ ...organizador, [campo]: " " }).error
          ?.issues[0]?.message,
      ).toContain(`El campo ${campo} es obligatorio y debe contener texto`);
    }
  });

  it("organizador sin nombre falla con mensaje en español", () => {
    const resultado = esquemaOrganizador.safeParse({ rol: "Rol de ejemplo" });
    const mensaje = resultado.error?.issues[0]?.message;
    expect(mensaje).toContain("nombre");
    expect(mensaje).toContain("obligatorio");
  });
});
