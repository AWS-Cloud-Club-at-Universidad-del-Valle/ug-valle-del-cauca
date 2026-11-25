import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("el CTA principal apunta a Instagram cuando no hay Meetup", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page.getByTestId("cta-principal");
  await expect(cta).toHaveAttribute(
    "href",
    "https://www.instagram.com/awsugvalle/",
  );
  await expect(cta).toHaveText("Síguenos en Instagram");
});

test("sin eventos futuros se ve el estado vacío", async ({ page }) => {
  await page.goto("/");
  const estadoVacio = page.getByTestId("eventos-vacio");
  await expect(estadoVacio).toBeVisible();
  await expect(estadoVacio).toContainText(
    "Estamos preparando el próximo; suscríbete para enterarte",
  );
  await expect(
    estadoVacio.getByRole("link", { name: "Síguenos en Instagram" }),
  ).toHaveAttribute("href", "https://www.instagram.com/awsugvalle/");
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
