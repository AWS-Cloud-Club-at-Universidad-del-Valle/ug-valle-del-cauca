import { z } from "zod";

function texto(campo: string) {
  const error = `El campo ${campo} es obligatorio y debe contener texto`;
  return z.string({ error }).trim().min(1, { error });
}

function url(campo: string) {
  return z.url({
    protocol: /^https?$/,
    error: `El campo ${campo} debe ser una URL válida con HTTP o HTTPS`,
  });
}

const ejemplo = z
  .boolean({ error: "El campo ejemplo debe ser verdadero o falso" })
  .default(false);
const mensajeFecha =
  "La fecha debe ir en formato AAAA-MM-DD (por ejemplo 2026-12-03)";
const fechaSinHora = z.iso.date();
const fechaConHora = z.iso.datetime({ offset: true });

const fechaTexto = z
  .string({ error: mensajeFecha })
  .refine(
    (valor) =>
      fechaSinHora.safeParse(valor).success ||
      fechaConHora.safeParse(valor).success,
    { error: mensajeFecha },
  )
  .transform(
    (valor) =>
      new Date(valor.length === 10 ? `${valor}T00:00:00-05:00` : valor),
  );

const fecha = z.preprocess((valor) => {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) return valor;

  // YAML puede representar una fecha sin hora como medianoche UTC.
  const iso = valor.toISOString();
  return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso;
}, fechaTexto);

export const esquemaSitio = z.object({
  nombre: texto("nombre"),
  descripcion: texto("descripcion"),
  meetup_url: z.preprocess(
    (valor) => (valor === "" ? undefined : valor),
    url("meetup_url").optional(),
  ),
  instagram_url: url("instagram_url"),
  linkedin_url: url("linkedin_url").optional(),
  otras_redes: z
    .array(
      z.object(
        { nombre: texto("nombre"), url: url("url") },
        { error: "Cada entrada del campo otras_redes debe tener nombre y url" },
      ),
      { error: "El campo otras_redes debe ser una lista" },
    )
    .default([]),
  sbg_url: url("sbg_url"),
  ejemplo,
});

export const esquemaEvento = z.object({
  titulo: texto("titulo"),
  fecha,
  lugar: texto("lugar"),
  modalidad: z.enum(["presencial", "virtual", "hibrido"], {
    error: "El campo modalidad debe ser uno de: presencial, virtual, hibrido",
  }),
  url_registro: url("url_registro").optional(),
  url_agenda: url("url_agenda").optional(),
  destacado: z
    .boolean({ error: "El campo destacado debe ser verdadero o falso" })
    .default(false),
  imagen: texto("imagen").optional(),
  imagen_alt: texto("imagen_alt").optional(),
  resumen: texto("resumen").optional(),
  ejemplo,
});

export const esquemaOrganizador = z.object({
  nombre: texto("nombre"),
  rol: texto("rol"),
  foto: texto("foto").optional(),
  foto_alt: texto("foto_alt").optional(),
  linkedin: url("linkedin").optional(),
  orden: z.number({ error: "El campo orden debe ser un número" }).default(99),
  ejemplo,
});

export type Sitio = z.infer<typeof esquemaSitio>;
export type Evento = z.infer<typeof esquemaEvento>;
export type Organizador = z.infer<typeof esquemaOrganizador>;
