import { describe, expect, it } from "vitest";
import { parsearGrupoMeetup } from "../../src/lib/meetup";

function pagina(grupo: Record<string, unknown>) {
  return `<script id="__NEXT_DATA__">${JSON.stringify({
    props: {
      pageProps: {
        __APOLLO_STATE__: {
          ROOT_QUERY: {
            'groupByUrlname:{"urlname":"prueba"}': { __ref: "Group:1" },
          },
          "Group:1": grupo,
        },
      },
    },
  })}</script>`;
}

describe("datos públicos del grupo en Meetup", () => {
  it("usa el total de pasados y la cantidad total de miembros", () => {
    expect(
      parsearGrupoMeetup(
        pagina({
          city: " Cali ",
          foundedDate: "2025-07-01T16:50:14-05:00",
          stats: { memberCounts: { all: 1200, pending: 27 } },
          'events({"filter":{"status":["ACTIVE"]},"first":4})': {
            totalCount: 9,
          },
          'events({"filter":{"status":["PAST"]},"first":4})': {
            totalCount: 23,
            edges: [],
          },
        }),
      ),
    ).toEqual({
      ciudad: "Cali",
      fundacion: "2025-07-01T16:50:14-05:00",
      miembros: 1200,
      realizados: 23,
    });
  });

  it("conserva ceros y omite datos ausentes o inválidos", () => {
    expect(
      parsearGrupoMeetup(
        pagina({
          city: " ",
          foundedDate: "2025-02-30",
          stats: { memberCounts: { all: 0 } },
          'events({"filter":{"status":["PAST"]}})': { totalCount: -2 },
        }),
      ),
    ).toEqual({ miembros: 0 });
  });

  it("tolera páginas sin datos o con JSON roto", () => {
    expect(parsearGrupoMeetup(pagina({}))).toBeUndefined();
    expect(parsearGrupoMeetup("<html>Sin datos</html>")).toBeUndefined();
  });
});
