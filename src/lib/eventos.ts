import type { Evento } from "../content/esquemas";

const diaEnBogota = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function diasHastaEvento(fecha: Date, ahora: Date) {
  return (
    (Date.parse(diaEnBogota.format(fecha)) -
      Date.parse(diaEnBogota.format(ahora))) /
    86_400_000
  );
}

export function separarEventos(eventos: Evento[], ahora: Date) {
  const hoy = diaEnBogota.format(ahora);
  const proximos: Evento[] = [];
  const pasados: Evento[] = [];

  for (const evento of eventos) {
    const grupo = diaEnBogota.format(evento.fecha) >= hoy ? proximos : pasados;
    grupo.push(evento);
  }

  proximos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  pasados.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return { proximos, pasados };
}
