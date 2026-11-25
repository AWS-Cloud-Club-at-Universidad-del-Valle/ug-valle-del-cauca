import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { buscarEjemplos } from "../../scripts/revisar-ejemplo.mjs";

it("devuelve solo las rutas con ejemplo verdadero en sus datos", async () => {
  const directorio = await mkdtemp(join(tmpdir(), "awsug-ejemplos-"));
  const yaml = join(directorio, "ejemplo.yaml");
  const markdown = join(directorio, "ejemplo.md");
  const real = join(directorio, "real.md");

  try {
    await Promise.all([
      writeFile(yaml, "ejemplo: true\n"),
      writeFile(markdown, "---\nejemplo: true\n---\n"),
      writeFile(real, "---\nejemplo: false\n---\n\nejemplo: true\n"),
    ]);

    expect(await buscarEjemplos(directorio)).toEqual([markdown, yaml]);
  } finally {
    await rm(directorio, { recursive: true, force: true });
  }
});
