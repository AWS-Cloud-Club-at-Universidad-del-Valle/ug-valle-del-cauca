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
