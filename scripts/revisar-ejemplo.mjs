import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

/**
 * @param {string} directorio
 * @returns {Promise<string[]>}
 */
export async function buscarEjemplos(directorio) {
  const entradas = await readdir(directorio, {
    recursive: true,
    withFileTypes: true,
  });
  const rutas = [];

  for (const entrada of entradas) {
    if (!entrada.isFile()) continue;

    const extension = extname(entrada.name);
    if (![".yaml", ".yml", ".md"].includes(extension)) continue;

    const ruta = join(entrada.parentPath, entrada.name);
    const contenido = await readFile(ruta, "utf8");
    const datos =
      extension === ".md"
        ? contenido.match(
            /^\uFEFF?---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)??---[ \t]*(?:\r?\n|$)/,
          )?.[1]
        : contenido;

    if (datos !== undefined && parse(datos)?.ejemplo === true) {
      rutas.push(ruta);
    }
  }

  return rutas.sort();
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const rutas = await buscarEjemplos("src/content");
  if (rutas.length > 0) {
    console.error(["Contenido de ejemplo pendiente:", ...rutas].join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Sin contenido de ejemplo.");
  }
}
