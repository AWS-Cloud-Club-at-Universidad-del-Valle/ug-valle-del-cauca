import { expect, it } from "vitest";
import { resolverCta } from "../../src/lib/cta";

const instagram_url = "https://example.com/instagram";

it("prioriza Meetup cuando hay una URL", () => {
  expect(
    resolverCta({ meetup_url: "https://meetup.com/x", instagram_url }),
  ).toEqual({
    destino: "meetup",
    etiqueta: "Únete en Meetup",
    url: "https://meetup.com/x",
  });
});

it("usa Instagram cuando falta Meetup", () => {
  expect(resolverCta({ instagram_url })).toEqual({
    destino: "instagram",
    etiqueta: "Síguenos en Instagram",
    url: instagram_url,
  });
});
