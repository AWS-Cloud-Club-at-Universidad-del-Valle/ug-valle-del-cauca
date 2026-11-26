import { createHash } from "node:crypto";
import { esquemaEvento } from "../content/esquemas";

type Propiedad = { valor: string; zona?: string };
type DatosMeetup = {
  titulo: string;
  fecha: string;
  lugar: string;
  modalidad: "virtual" | "presencial";
  url_registro?: string;
  ejemplo: false;
};

function desescapar(valor: string) {
  return valor.replace(/\\([nN,;\\])/g, (_, caracter: string) =>
    caracter.toLowerCase() === "n" ? "\n" : caracter,
  );
}

function convertirFecha({ valor, zona }: Propiedad) {
  const partes = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(
    valor,
  );
  if (!partes) return;

  const [, anio, mes, dia, hora, minuto, segundo, utc] = partes;
  const fecha = `${anio}-${mes}-${dia}`;
  if (hora === undefined) return fecha;

  const local = `${fecha}T${hora}:${minuto}:${segundo}`;
  const referencia = Date.parse(`${local}Z`);
  if (
    !Number.isFinite(referencia) ||
    new Date(referencia).toISOString() !== `${local}.000Z`
  )
    return;
  if (utc) return `${local}Z`;

  try {
    const formato = new Intl.DateTimeFormat("sv-SE", {
      timeZone: zona ?? "America/Bogota",
      dateStyle: "short",
      timeStyle: "medium",
    });
    const enZona = (instante: number) =>
      formato.format(instante).replace(" ", "T");
    const desfase = Date.parse(`${enZona(referencia)}Z`) - referencia;
    const instante = referencia - desfase;
    // Se descartan horas inexistentes durante un cambio de horario.
    if (enZona(instante) === local) return new Date(instante).toISOString();
    const ajuste = referencia - Date.parse(`${enZona(instante)}Z`);
    if (enZona(instante + ajuste) === local) {
      return new Date(instante + ajuste).toISOString();
    }
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
  }
}

function convertirEvento(campos: Map<string, Propiedad>) {
  const inicio = campos.get("DTSTART");
  const fecha = inicio && convertirFecha(inicio);
  const titulo = desescapar(campos.get("SUMMARY")?.valor ?? "").trim();
  if (!fecha || !titulo) return;

  const ubicacion = desescapar(campos.get("LOCATION")?.valor ?? "").trim();
  const virtual = !ubicacion || ubicacion.toLowerCase() === "online";
  const url_registro = campos.get("URL")?.valor.trim() || undefined;
  const data: DatosMeetup = {
    titulo,
    fecha,
    lugar: virtual ? "En línea" : ubicacion,
    modalidad: virtual ? "virtual" : "presencial",
    url_registro,
    ejemplo: false,
  };
  if (!esquemaEvento.safeParse(data).success) return;

  const uid = campos.get("UID")?.valor.trim();
  const id =
    uid ||
    url_registro ||
    createHash("sha256")
      .update(JSON.stringify([titulo, fecha, ubicacion]))
      .digest("hex");
  return { id, data };
}

export function parsearMeetup(ical: string) {
  const eventos = new Map<
    string,
    NonNullable<ReturnType<typeof convertirEvento>>
  >();
  const componentes: string[] = [];
  let campos = new Map<string, Propiedad>();

  for (const linea of ical.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    const propiedad = /^([^;:]+)((?:;[^:]*?)?):(.*)$/.exec(linea);
    if (!propiedad) continue;
    const [, nombre, parametros, valor] = propiedad;
    const clave = nombre.toUpperCase();

    if (clave === "BEGIN") {
      componentes.push(valor.toUpperCase());
      if (componentes.join("/") === "VCALENDAR/VEVENT") campos = new Map();
    } else if (clave === "END") {
      if (valor.toUpperCase() !== componentes.at(-1)) continue;
      if (componentes.join("/") === "VCALENDAR/VEVENT") {
        const evento = convertirEvento(campos);
        if (evento) eventos.set(evento.id, evento);
      }
      componentes.pop();
    } else if (componentes.join("/") === "VCALENDAR/VEVENT") {
      const zona = /;TZID=(?:"([^"]+)"|([^;]+))/i.exec(parametros);
      campos.set(clave, { valor, zona: zona?.[1] ?? zona?.[2] });
    }
  }

  return [...eventos.values()];
}
