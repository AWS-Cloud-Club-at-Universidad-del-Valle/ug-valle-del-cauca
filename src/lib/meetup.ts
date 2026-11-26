import { createHash } from "node:crypto";
import { z } from "zod";
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
  if (campos.get("STATUS")?.valor.toUpperCase() === "CANCELLED") return;
  const inicio = campos.get("DTSTART");
  const fecha = inicio && convertirFecha(inicio);
  const titulo = desescapar(campos.get("SUMMARY")?.valor ?? "").trim();
  if (!fecha || !titulo) return;

  const ubicacion = desescapar(campos.get("LOCATION")?.valor ?? "").trim();
  const virtual =
    !ubicacion || /^(online( event)?|en l[ií]nea)$/i.test(ubicacion);
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

type EventoRemoto = {
  id: string;
  data: z.input<typeof esquemaEvento>;
};

type Objeto = Record<string, unknown>;

function objeto(valor: unknown): Objeto {
  return valor && typeof valor === "object" ? (valor as Objeto) : {};
}

function cadena(valor: unknown) {
  return typeof valor === "string" ? valor.trim() || undefined : undefined;
}

function resolverReferencia(estado: Objeto, valor: unknown) {
  const referencia = cadena(objeto(valor).__ref);
  return objeto(referencia ? estado[referencia] : valor);
}

const hostsAfichesMeetup = [
  "secure.meetupstatic.com",
  "secure-content.meetupstatic.com",
];

function aficheMeetup(foto: Objeto) {
  const imagen = cadena(foto.highResUrl) ?? cadena(foto.standardUrl);
  const url = URL.parse(imagen ?? "");
  if (url?.protocol === "https:" && hostsAfichesMeetup.includes(url.hostname)) {
    return imagen;
  }
}

function leerConexion(
  conexion: Objeto,
  estado: Objeto,
  avisar: (mensaje: string) => void,
) {
  if (!Array.isArray(conexion.edges)) throw new Error("Faltan los eventos");
  const eventos = new Map<string, EventoRemoto>();
  let invalidos = 0;
  for (const arista of conexion.edges as unknown[]) {
    const evento = resolverReferencia(estado, objeto(arista).node);
    if (evento.status === "CANCELLED" || evento.status === "DRAFT") continue;

    const titulo = cadena(evento.title);
    const id = cadena(evento.id);
    const fecha = cadena(evento.dateTime);
    const url_registro = cadena(evento.eventUrl);
    if (!titulo || !id || !fecha || !url_registro) {
      invalidos++;
      continue;
    }

    const virtual = evento.eventType === "ONLINE" || evento.isOnline === true;
    const sede = resolverReferencia(estado, evento.venue);
    const foto = resolverReferencia(estado, evento.featuredEventPhoto);
    const imagen = aficheMeetup(foto);
    const data: EventoRemoto["data"] = {
      titulo,
      fecha,
      url_registro,
      modalidad:
        evento.eventType === "HYBRID"
          ? "hibrido"
          : virtual
            ? "virtual"
            : "presencial",
      lugar: virtual ? "En línea" : (cadena(sede.name) ?? "Sede por confirmar"),
      imagen,
      imagen_alt: imagen ? `Afiche de ${titulo}` : undefined,
      resumen: cadena(evento.description),
      ejemplo: false,
    };
    if (esquemaEvento.safeParse(data).success) eventos.set(id, { id, data });
    else invalidos++;
  }
  if (invalidos)
    avisar(`Meetup devolvió ${invalidos} registros de eventos inválidos.`);
  const pagina = objeto(conexion.pageInfo);
  return {
    eventos: [...eventos.values()],
    siguiente:
      pagina.hasNextPage === true ? cadena(pagina.endCursor) : undefined,
  };
}

type TipoListado = "futuros" | "pasados";

type ListadoMeetup = {
  eventos: EventoRemoto[];
  siguiente?: string;
  fecha?: string;
  grupo?: string;
};

function leerGrupoApollo(contenido: string) {
  const incrustado =
    /<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(
      contenido,
    );
  const documento = objeto(JSON.parse(incrustado?.[1] ?? contenido));
  const props = objeto(objeto(documento.props).pageProps);
  const estado = objeto(props.__APOLLO_STATE__ ?? documento.__APOLLO_STATE__);
  const consulta = Object.entries(objeto(estado.ROOT_QUERY)).find(([clave]) =>
    /^groupByUrlname\b/.test(clave),
  );
  const grupo = resolverReferencia(estado, consulta?.[1]);
  return { estado, grupo };
}

function conteo(valor: unknown) {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0
    ? valor
    : undefined;
}

export function parsearGrupoMeetup(contenido: string) {
  try {
    const { estado, grupo } = leerGrupoApollo(contenido);
    const estadisticas = resolverReferencia(estado, grupo.stats);
    const miembros = conteo(
      resolverReferencia(estado, estadisticas.memberCounts).all,
    );
    const ciudad = cadena(grupo.city);
    const fecha = cadena(grupo.foundedDate);
    const fundacion =
      z.iso.datetime({ offset: true }).safeParse(fecha).data ??
      z.iso.date().safeParse(fecha).data;

    let realizados: number | undefined;
    for (const [clave, valor] of Object.entries(grupo)) {
      const argumentos = /^events\((.*)\)$/.exec(clave);
      if (!argumentos) continue;
      let filtro: Objeto;
      try {
        filtro = objeto(objeto(JSON.parse(argumentos[1])).filter);
      } catch {
        continue;
      }
      if (
        Array.isArray(filtro.status) &&
        filtro.status.length === 1 &&
        filtro.status[0] === "PAST"
      ) {
        realizados = conteo(resolverReferencia(estado, valor).totalCount);
        if (realizados !== undefined) break;
      }
    }
    if (
      [miembros, realizados, ciudad, fundacion].some(
        (dato) => dato !== undefined,
      )
    ) {
      return { miembros, realizados, ciudad, fundacion };
    }
  } catch {
    return undefined;
  }
}

export function leerPaginaMeetup(
  contenido: string,
  tipo: TipoListado,
  avisar: (mensaje: string) => void,
): ListadoMeetup {
  try {
    const { estado, grupo } = leerGrupoApollo(contenido);
    const filtro = tipo === "pasados" ? "beforeDateTime" : "afterDateTime";
    const resultado = Object.entries(grupo).find(
      ([clave]) => clave.startsWith("events(") && clave.includes(`"${filtro}"`),
    );
    const pagina = leerConexion(objeto(resultado?.[1]), estado, avisar);
    const fecha = resultado?.[0].match(/"beforeDateTime"\s*:\s*"([^"]+)"/)?.[1];
    return { ...pagina, fecha, grupo: cadena(grupo.urlname) };
  } catch {
    avisar(
      `No se pudo leer el listado de eventos ${tipo} de Meetup: estructura inesperada.`,
    );
    return { eventos: [] };
  }
}

export function parsearPaginaMeetup(
  contenido: string,
  tipo: TipoListado,
  avisar: (mensaje: string) => void,
) {
  return leerPaginaMeetup(contenido, tipo, avisar).eventos;
}

export function leerPaginaSiguienteMeetup(
  respuesta: unknown,
  avisar: (mensaje: string) => void,
): ListadoMeetup {
  const grupo = objeto(objeto(objeto(respuesta).data).groupByUrlname);
  const conexion = objeto(grupo.events);
  if (!Array.isArray(conexion.edges)) {
    avisar("No se pudo leer la siguiente página de eventos de Meetup.");
    return { eventos: [] };
  }
  return leerConexion(conexion, {}, avisar);
}

function claveRegistro(url: unknown) {
  const registro = typeof url === "string" ? URL.parse(url) : null;
  if (!registro) return;
  const ruta = registro.pathname.replace(/\/+$/, "");
  const id =
    /^(?:www\.)?meetup\.com$/.test(registro.hostname) &&
    /\/events\/(\d+)$/.exec(ruta)?.[1];
  return id || `${registro.host}${ruta}${registro.search}`;
}

type EntradaEvento = { id: string; data: Objeto };

export function combinarEventos(
  locales: EntradaEvento[],
  remotos: EventoRemoto[],
) {
  const entradas = new Map<string, EntradaEvento>();
  const clavesPorId = new Map<string, string>();
  for (const local of locales) {
    const clave = claveRegistro(local.data.url_registro) ?? local.id;
    if (!entradas.has(clave)) entradas.set(clave, local);
    clavesPorId.set(local.id, clave);
  }

  for (const remoto of remotos) {
    const clave =
      clavesPorId.get(remoto.id) ??
      claveRegistro(remoto.data.url_registro) ??
      remoto.id;
    const anterior = entradas.get(clave);
    if (!anterior) {
      entradas.set(clave, remoto);
      clavesPorId.set(remoto.id, clave);
      continue;
    }
    const data = { ...anterior.data };
    for (const [campo, valor] of Object.entries(remoto.data)) {
      if (campo === "imagen_alt" && data.imagen !== remoto.data.imagen)
        continue;
      if (data[campo] === undefined && valor !== undefined) data[campo] = valor;
    }
    entradas.set(clave, { ...anterior, data });
  }
  return [...entradas.values()];
}
