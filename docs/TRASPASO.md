# Publicación y traspaso del sitio

## Primera publicación en una cuenta

Desde la raíz del repositorio, con Terraform 1.10 o posterior, AWS CLI, `gh` y pnpm instalados, selecciona el perfil de AWS. Usa un perfil con permisos para crear los recursos. Conserva el estado local de bootstrap en un respaldo privado.

```bash
export AWS_PROFILE=default
export TF_PLUGIN_CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/terraform/plugin-cache"
mkdir -p "$TF_PLUGIN_CACHE_DIR"
cp infra/bootstrap/terraform.tfvars.example infra/bootstrap/terraform.tfvars
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

En ambos archivos configura `region`, `nombre_proyecto`, `github_owner`, `github_repo` y `tags`. Usa el dueño y el nombre actuales de GitHub con la misma capitalización. Si la cuenta ya tiene el proveedor OIDC de GitHub con audiencia `sts.amazonaws.com`, configura `crear_proveedor_oidc = false` en bootstrap. Deja `dominio` y `certificado_acm_arn` en `null` para usar el certificado de CloudFront. Para un dominio propio necesitarás un certificado ACM emitido en `us-east-1` y apuntar su DNS a la distribución.

```bash
terraform -chdir=infra/bootstrap init
terraform -chdir=infra/bootstrap plan
terraform -chdir=infra/bootstrap apply
export BUCKET_ESTADO="$(terraform -chdir=infra/bootstrap output -raw bucket_estado)"
export AWS_REGION=us-east-1 # Usa la región configurada en ambos archivos.
terraform -chdir=infra init -backend-config="bucket=$BUCKET_ESTADO" -backend-config="region=$AWS_REGION"
terraform -chdir=infra plan
terraform -chdir=infra apply

pnpm install --frozen-lockfile
pnpm build
pnpm revisar-ejemplo && scripts/desplegar.sh
terraform -chdir=infra output -raw url_sitio
```

El stack principal adjunta a los roles de bootstrap los permisos sobre los ARN que CloudFront asigna. La invalidación es asíncrona. Para publicar ejemplos de forma intencional, ejecuta el script directamente tras el build o inicia el workflow desde `main` con `forzar` activado. Si reemplazas una fuente, cambia su nombre de archivo para evitar que el navegador conserve la versión anterior durante un año.

## Variables de GitHub Actions

En **Settings → Secrets and variables → Actions → Variables**, carga estos valores. Con `gh` autenticado y el remoto apuntando al repositorio correcto, puedes usar:

```bash
gh variable set AWS_ROL_DESPLIEGUE --body "$(terraform -chdir=infra/bootstrap output -raw rol_despliegue_arn)"
gh variable set AWS_ROL_PLAN --body "$(terraform -chdir=infra/bootstrap output -raw rol_plan_arn)"
gh variable set AWS_REGION --body "$AWS_REGION"
gh variable set BUCKET_ESTADO --body "$BUCKET_ESTADO"
gh variable set BUCKET_SITIO --body "$(terraform -chdir=infra output -raw bucket_sitio)"
gh variable set DISTRIBUCION_ID --body "$(terraform -chdir=infra output -raw distribucion_id)"
gh variable set TERRAFORM_TFVARS < infra/terraform.tfvars
```

`TERRAFORM_TFVARS` es opcional cuando usas los valores por defecto y sirve para reproducir las variables del stack en CI. Usa solo valores aptos para el repositorio. El plan se publica en los PR de ramas del mismo repositorio una vez configurado el rol de plan. Los PR de forks pasan formato y validación. Mantén deshabilitado el envío de tokens de escritura a workflows de forks y reserva la creación de ramas en el repositorio para mantenedores de confianza. El plan informativo lee el estado sin tomar el bloqueo. Los cambios de infraestructura se aplican desde la terminal del operador con el bloqueo activo.

## Cambio de cuenta o dueño

1. Para cambiar de cuenta, usa una copia limpia del repositorio, un perfil de la cuenta destino y los pasos de primera publicación. Conserva por separado los archivos de estado y la configuración de la cuenta anterior. El stack nuevo arranca con estado propio y obtiene otra URL de CloudFront.
2. Tras transferir o renombrar el repositorio, cambia `github_owner` y `github_repo` en los dos archivos de variables y aplica bootstrap para actualizar la confianza OIDC. Actualiza el remoto de Git y las variables de GitHub. Si solo cambió el dueño del repo, conserva el backend y la distribución existentes.
3. Verifica el sitio nuevo por HTTPS, actualiza los enlaces que apunten al anterior y confirma que los workflows usan la cuenta destino.
4. Desde la copia de la cuenta anterior, selecciona su perfil. Haz un respaldo privado de ambos estados. Vacía el bucket del sitio y ejecuta `terraform -chdir=infra plan -destroy` seguido de `terraform -chdir=infra destroy`. Espera a que termine CloudFront antes de retirar el backend.
5. Si el proveedor OIDC está bajo gestión de bootstrap y lo usan otros repositorios, consérvalo. En la copia anterior ejecuta `terraform -chdir=infra/bootstrap state rm 'aws_iam_openid_connect_provider.github[0]'` y cambia `crear_proveedor_oidc` a `false`. Si ya usabas `false`, el proveedor se conserva.
6. Vacía el bucket de estado anterior desde la consola de S3, incluidas sus versiones y marcadores de borrado. Retira `prevent_destroy` del bucket de estado únicamente en la copia anterior. Ejecuta `terraform -chdir=infra/bootstrap plan -destroy`, revisa los recursos y ejecuta `terraform -chdir=infra/bootstrap destroy`.

S3 responde con 403 para objetos ausentes porque la distribución solo puede leer objetos. CloudFront traduce 403 y 404 a `/404.html` con código 404. `CachingOptimized` conserva un mínimo de un segundo en el borde, incluso cuando el HTML lleva `Cache-Control: no-cache`. La política CSP admite el script en línea del build porque puede cambiar en cada publicación y Terraform se aplica por separado.
