import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const meetup = "https://www.meetup.com/aws-user-group-valle-del-cauca/";
const instagram = "https://www.instagram.com/awsugvalle/";

test("Meetup es el CTA principal e Instagram acompaña los enlaces del grupo", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const cta = page.getByTestId("cta-principal");
  await expect(cta).toHaveAttribute("href", meetup);
  await expect(cta).toHaveText("Únete en Meetup");

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const zona of [".barra", ".hero", ".unirse", ".pie"]) {
      const seccion = page.locator(zona);
      await expect(seccion.locator(`a[href="${meetup}"]`)).toBeVisible();
      await expect(seccion.locator(`a[href="${instagram}"]`)).toBeVisible();
    }
  }
});

test("sin eventos futuros se muestra el último encuentro e invitación", async ({
  page,
}) => {
  await page.goto("/");
  const estadoVacio = page.getByTestId("eventos-vacio");
  await expect(estadoVacio).toBeVisible();
  await expect(estadoVacio).toContainText(
    "Únete a la comunidad para enterarte del próximo encuentro.",
  );
  await expect(
    estadoVacio.getByRole("link", { name: "Únete en Meetup" }),
  ).toHaveAttribute("href", meetup);
  await expect(page.getByTestId("evento-proximo")).toHaveCount(0);
  const ultimo = page.getByRole("article", { name: "Último encuentro" });
  await expect(ultimo.getByRole("heading")).toHaveText("TECH DAY CALI 2026");
  await expect(ultimo.getByRole("img")).toHaveAttribute("loading", "lazy");
  await expect(ultimo.locator("time")).toHaveText("21 de noviembre de 2026");
  await expect(ultimo.getByRole("link")).toHaveAttribute(
    "href",
    `${meetup}events/317059425/`,
  );
  await expect(ultimo).toContainText("Universidad Autónoma de Occidente");
});

test("un próximo encuentro del build reemplaza la tarjeta del último", async ({
  page,
}) => {
  await mkdir(".astro", { recursive: true });
  const salida = await mkdtemp(join(process.cwd(), ".astro", "meetup-e2e-"));
  try {
    await promisify(execFile)("pnpm", ["build", "--outDir", salida], {
      env: {
        ...process.env,
        MEETUP_DESACTIVADO: "0",
        MEETUP_EVENTOS_URL: new URL(
          "../fixtures/meetup-eventos.html",
          import.meta.url,
        ).href,
        MEETUP_ICAL_URL: new URL(
          "../fixtures/meetup-vacio.ics",
          import.meta.url,
        ).href,
      },
    });
    const html = await readFile(join(salida, "index.html"), "utf8");
    await page.route(/\/$/, (ruta) =>
      ruta.fulfill({ body: html, contentType: "text/html; charset=utf-8" }),
    );
    await page.route("https://secure.meetupstatic.com/**", (ruta) =>
      ruta.abort(),
    );
    await page.goto("/");
    const proximo = page.getByTestId("evento-proximo");
    await expect(proximo.getByRole("heading")).toHaveText(
      "Encuentro futuro de prueba",
    );
    await expect(proximo.getByRole("img")).toHaveAttribute("width", "800");
    await expect(page.getByTestId("eventos-vacio")).toHaveCount(0);
    await expect(
      page.getByRole("article", { name: "Último encuentro" }),
    ).toHaveCount(0);
    await expect(page.locator(".via")).toContainText("Taller pasado de prueba");
  } finally {
    await rm(salida, { recursive: true, force: true });
  }
});

test("hay enlace para estudiantes al SBG", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("enlace-sbg")).toHaveAttribute(
    "href",
    "https://www.meetup.com/aws-sbg-at-universidad-del-valle-colombia/",
  );
});

test("sin violaciones de accesibilidad", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.ok()).toBe(true);
  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(resultado.violations).toEqual([]);
});

test("404 responde con página propia", async ({ page }) => {
  const respuesta = await page.goto("/no-existe");
  expect(respuesta?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Volver al inicio" }),
  ).toHaveAttribute("href", "/");
});
