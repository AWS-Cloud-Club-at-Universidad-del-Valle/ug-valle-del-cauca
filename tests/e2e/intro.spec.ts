import { expect, test } from "@playwright/test";

test("la intro se dibuja una vez por sesión y se puede omitir al bajar", async ({
  page,
}) => {
  await page.goto("/");
  const cuerpo = page.locator("body");
  await expect(cuerpo).toHaveClass(/intro-activa/);
  await page.mouse.wheel(0, 800);
  await expect(cuerpo).not.toHaveClass(/intro-activa/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.reload();
  await expect(cuerpo).not.toHaveClass(/intro-activa/);
});

test("la pausa del pie detiene las ilustraciones con teclado", async ({
  page,
}) => {
  await page.goto("/");
  const pausa = page.getByRole("checkbox", { name: "Pausar ilustraciones" });
  await pausa.focus();
  await page.keyboard.press("Space");
  await expect(pausa).toBeChecked();
  await expect(page.locator(".vela-calima")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.keyboard.press("Space");
  await expect(pausa).not.toBeChecked();
  await expect(page.locator(".vela-calima")).toHaveCSS(
    "animation-play-state",
    "running",
  );
});

for (const [width, height] of [
  [1440, 900],
  [390, 844],
]) {
  test(`el emblema mantiene su caja al rellenarse y aterriza en la barra a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const { inicio, lleno, vuelo, llegada, destino } = await page
      .locator(".intro-trazo")
      .evaluate((svg) => {
        const animacion = svg.getAnimations()[0]!;
        animacion.pause();
        function medir(tiempo: number) {
          animacion.currentTime = tiempo;
          return svg.getBoundingClientRect().toJSON();
        }
        return {
          inicio: medir(910),
          lleno: medir(1290),
          vuelo: medir(1440),
          llegada: medir(1599),
          destino: document
            .querySelector(".barra .marca img")!
            .getBoundingClientRect()
            .toJSON(),
        };
      });
    expect(inicio.x + inicio.width / 2).toBeCloseTo(width / 2, 1);
    expect(inicio.y + inicio.height / 2).toBeCloseTo(height / 2, 1);
    expect(lleno).toEqual(inicio);
    expect(vuelo.width).toBeLessThan(lleno.width);
    expect(vuelo.width).toBeGreaterThan(destino.width);
    for (const propiedad of ["x", "y", "width", "height"]) {
      expect(llegada[propiedad]).toBeCloseTo(destino[propiedad], 1);
    }
  });
}
