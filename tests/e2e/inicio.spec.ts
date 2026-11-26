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

test("sin eventos futuros se ve el estado vacío", async ({ page }) => {
  await page.goto("/");
  const estadoVacio = page.getByTestId("eventos-vacio");
  await expect(estadoVacio).toBeVisible();
  await expect(estadoVacio).toContainText(
    "Estamos preparando el próximo; suscríbete para enterarte",
  );
  await expect(
    estadoVacio.getByRole("link", { name: "Únete en Meetup" }),
  ).toHaveAttribute("href", meetup);
  await expect(page.getByTestId("evento-proximo")).toHaveCount(0);
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
