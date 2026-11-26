import { expect, test } from "@playwright/test";

test("el puntero no transforma las piezas de la portada", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.keyboard.press("Escape");
  const paisaje = page.locator(".paisaje");
  await paisaje.evaluate(async (el) => {
    const animaciones = el.getAnimations({ subtree: true });
    for (const animacion of animaciones) animacion.pause();
    await Promise.all(animaciones.map((animacion) => animacion.ready));
  });
  const estado = () =>
    paisaje.evaluate((el) =>
      Array.from(el.querySelectorAll("*"), (pieza) => {
        const { transform, translate, scale, opacity, animationName } =
          getComputedStyle(pieza);
        return { transform, translate, scale, opacity, animationName };
      }),
    );
  const antes = await estado();
  for (const selector of [".sol-papel", ".copa", ".firma-cielo", ".canas"]) {
    await page.locator(selector).first().hover({ force: true });
    await page.evaluate(
      () =>
        new Promise((fin) =>
          requestAnimationFrame(() => requestAnimationFrame(fin)),
        ),
    );
    expect(await estado()).toEqual(antes);
  }
  await expect(page.locator(".hero")).not.toHaveAttribute("style");
});

test("el movimiento reducido desactiva la intro y los rayos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
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
  await expect(pagina.locator(".sello-papel")).toBeVisible();
  await expect(pagina.locator("body")).not.toHaveClass(/intro-activa/);
  await expect(
    pagina.getByRole("heading", { name: "Cómo unirse" }),
  ).toBeVisible();
  await contexto.close();
});
