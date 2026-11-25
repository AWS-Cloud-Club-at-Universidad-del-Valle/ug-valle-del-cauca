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

for (const [width, height, proporcion] of [
  [1440, 900, 0.5],
  [375, 812, 0.8],
]) {
  test(`el dibujo queda centrado y el logo se encoge hasta la barra a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const trazo = page.locator(".intro-trazo");
    const dibujo = await trazo.evaluate((svg: SVGSVGElement) => {
      const centrado = svg
        .getAnimations()
        .find(
          (animacion) =>
            animacion instanceof CSSAnimation &&
            animacion.animationName === "centrar-dibujo",
        )!;
      centrado.pause();
      centrado.currentTime = 0;
      const contorno = svg
        .querySelector(".trazo-contorno")!
        .getBoundingClientRect();
      centrado.currentTime = 900;
      const { x, y, width, height } = svg.getBoundingClientRect();
      return {
        inicioX: contorno.x + contorno.width / 2,
        inicioY: contorno.y + contorno.height / 2,
        centroX: x + width / 2,
        centroY: y + height / 2,
        ancho: (svg.getBBox().width / svg.viewBox.baseVal.width) * width,
        anchoSvg: width,
      };
    });
    expect(dibujo.inicioX).toBeCloseTo(width / 2, 0);
    expect(dibujo.inicioY).toBeCloseTo(height / 2, 0);
    expect(dibujo.centroX).toBeCloseTo(width / 2, 0);
    expect(dibujo.centroY).toBeCloseTo(height / 2, 0);
    expect(Math.abs(dibujo.ancho / width - proporcion)).toBeLessThan(0.01);

    const { inicio, mitad, fin, destino } = await page
      .locator(".barra .marca")
      .evaluate((marca) => {
        const vuelo = marca
          .getAnimations()
          .find(
            (animacion) =>
              animacion instanceof CSSAnimation &&
              animacion.animationName === "volar-marca",
          )!;
        vuelo.pause();
        const medir = (tiempo: number) => {
          vuelo.currentTime = tiempo;
          const { x, y, width, height } = marca.getBoundingClientRect();
          return { x, y, width, height };
        };
        const inicio = medir(1090);
        const mitad = medir(1400);
        const fin = medir(1739);
        const destino = medir(1740);
        return { inicio, mitad, fin, destino };
      });

    expect(Math.abs(inicio.x + inicio.width / 2 - width / 2)).toBeLessThan(1);
    expect(Math.abs(inicio.y + inicio.height / 2 - height / 2)).toBeLessThan(1);
    expect(inicio.width).toBeCloseTo(dibujo.anchoSvg, 0);
    expect(mitad.width).toBeLessThan(inicio.width);
    expect(mitad.width).toBeGreaterThan(destino.width);
    expect(fin.x).toBeCloseTo(destino.x, 0);
    expect(fin.y).toBeCloseTo(destino.y, 0);
    expect(fin.width).toBeCloseTo(destino.width, 0);
  });
}
