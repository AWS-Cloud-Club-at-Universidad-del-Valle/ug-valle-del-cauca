import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

for (const width of [1440, 390]) {
  test(`el scroll vertical recorre los tiquetes sin JavaScript a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const escena = page.locator(".escena-tren");
    const pista = escena.locator(".via");
    const region = escena.getByRole("region", {
      name: "Tiquetes de eventos pasados",
    });
    await expect(escena.locator(".anden")).toHaveCSS("position", "sticky");

    const distancia = await pista.evaluate(
      (elemento) => elemento.scrollWidth - elemento.parentElement!.clientWidth,
    );
    expect(distancia).toBeGreaterThan(0);

    for (const avance of [0, 0.5, 1]) {
      await escena.evaluate((elemento, fraccion) => {
        const inicio = scrollY + elemento.getBoundingClientRect().top;
        scrollTo(0, inicio + (elemento.clientHeight - innerHeight) * fraccion);
      }, avance);
      await expect
        .poll(() =>
          pista.evaluate((elemento, esperado) => {
            const transformacion = getComputedStyle(elemento).transform;
            return Math.abs(
              new DOMMatrixReadOnly(transformacion).m41 - esperado,
            );
          }, -distancia * avance),
        )
        .toBeLessThan(3);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(escena.locator(".anden")).toHaveCSS("position", "relative");
    await expect(region).toHaveCSS("overflow-x", "auto");
    await expect(region).toHaveCSS("scroll-snap-type", "x mandatory");

    const enlaces = region.getByRole("link");
    await region.focus();
    const pasos = await region.locator("a:visible, summary:visible").count();
    for (let i = 0; i < pasos; i++) {
      await page.keyboard.press("Tab");
    }
    await expect(enlaces.last()).toBeFocused();
    await expect(enlaces.last()).toBeInViewport();
  });
}
