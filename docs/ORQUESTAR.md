# Orquestar una tarea

Claude o Codex pueden orquestar este ciclo. Mantén un máximo de tres agentes activos a la vez.

1. Copia `docs/tareas/_plantilla.md` en `docs/tareas/NN-nombre.md` y completa todas sus secciones.
2. Lanza el implementador con `workmux add <rama> -a gpt -b -P docs/tareas/NN-nombre.md`. Usa `-a cc` para el otro implementador.
3. Consulta el avance con `workmux status` y revisa la sesión con `workmux capture`.
4. Revisa `git diff` y los archivos nuevos contra «Archivos permitidos». Ejecuta `pnpm verify` en el worktree.
5. Crea el commit con la identidad del dueño del repo y sin atribuciones adicionales.
6. Pide aprobación humana antes de ejecutar `workmux merge`.
