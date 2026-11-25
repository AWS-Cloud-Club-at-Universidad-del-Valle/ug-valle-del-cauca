import type { Sitio } from "../content/esquemas";

export function resolverCta(
  sitio: Pick<Sitio, "meetup_url" | "instagram_url">,
): {
  url: string;
  etiqueta: "Únete en Meetup" | "Síguenos en Instagram";
  destino: "meetup" | "instagram";
} {
  if (sitio.meetup_url) {
    return {
      destino: "meetup",
      etiqueta: "Únete en Meetup",
      url: sitio.meetup_url,
    };
  }

  return {
    destino: "instagram",
    etiqueta: "Síguenos en Instagram",
    url: sitio.instagram_url,
  };
}
