import { expect, test } from "@playwright/test";

test("el hero se mueve con puntero fino y se pausa fuera de la pantalla", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".hero");
  const rayos = page.locator(".rayos");
  const notas = page.locator(".firma-cielo");
  await expect(hero).toHaveClass(/hero-puntero/);
  await expect(rayos).toHaveCSS("animation-play-state", "running");

  const caja = await notas.boundingBox();
  if (!caja) throw new Error("No se encontró el cuadro de las notas");
  await page.mouse.move(caja.x + caja.width / 2 - 42, caja.y + caja.height / 2);
  await expect
    .poll(() => hero.evaluate((el) => +el.style.getPropertyValue("--nx")))
    .toBeGreaterThan(0);
  await expect
    .poll(() => hero.evaluate((el) => +el.style.getPropertyValue("--mx")))
    .toBeGreaterThan(0);
  await expect(page.locator(".cara-sol")).toHaveCount(0);
  await expect
    .poll(() =>
      hero.evaluate((el) => Math.abs(+el.style.getPropertyValue("--mx"))),
    )
    .toBeLessThanOrEqual(1);

  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(hero).toHaveClass(/hero-fuera/);
  await expect(rayos).toHaveCSS("animation-play-state", "paused");
});

test("el movimiento reducido desactiva el seguimiento y los rayos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.mouse.move(400, 300);
  await expect(page.locator(".hero")).not.toHaveClass(/hero-puntero/);
  await expect(page.locator("body")).not.toHaveClass(/intro-activa/);
  await expect(page.locator(".rayos")).toHaveCSS("animation-name", "none");
});

test("el collage se ve completo con JavaScript desactivado", async ({
  browser,
}) => {
  const contexto = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const pagina = await contexto.newPage();
  await pagina.goto("/");
  await expect(pagina.getByTestId("cta-principal")).toBeVisible();
  await expect(pagina.locator(".sol-papel")).toBeVisible();
  await expect(pagina.locator(".hero")).not.toHaveClass(/hero-puntero/);
  await expect(
    pagina.getByRole("heading", { name: "Cómo unirse" }),
  ).toBeVisible();
  await contexto.close();
});

test("un dispositivo táctil conserva el collage sin activar seguimiento", async ({
  browser,
}) => {
  const contexto = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 812 },
  });
  const pagina = await contexto.newPage();
  await pagina.goto("/");
  await expect(pagina.locator(".hero")).not.toHaveClass(/hero-puntero/);
  await expect(pagina.locator(".sol-papel")).toBeVisible();
  await contexto.close();
});
