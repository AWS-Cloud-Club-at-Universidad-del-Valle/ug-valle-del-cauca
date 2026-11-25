import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { parse } from "yaml";
import {
  esquemaEvento,
  esquemaOrganizador,
  esquemaSitio,
} from "./content/esquemas";

const sitio = defineCollection({
  loader: file("src/content/sitio.yaml", {
    parser: (contenido) => ({ inicio: parse(contenido) }),
  }),
  schema: esquemaSitio,
});

const eventos = defineCollection({
  loader: glob({ base: "src/content/eventos", pattern: "*.md" }),
  schema: esquemaEvento,
});

const organizadores = defineCollection({
  loader: glob({ base: "src/content/organizadores", pattern: "*.yaml" }),
  schema: esquemaOrganizador,
});

export const collections = { sitio, eventos, organizadores };
