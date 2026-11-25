#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

case $# in
  0)
    bucket=$(terraform -chdir=infra output -raw bucket_sitio)
    distribucion=$(terraform -chdir=infra output -raw distribucion_id)
    ;;
  2)
    bucket=$1
    distribucion=$2
    ;;
  *)
    echo "Uso: scripts/desplegar.sh [bucket distribucion]" >&2
    exit 1
    ;;
esac

if [[ -z "$bucket" || -z "$distribucion" || ! -s dist/index.html || ! -s dist/404.html ]]; then
  echo "Configura el bucket y la distribución, y ejecuta pnpm build antes de publicar." >&2
  exit 1
fi

destino="s3://$bucket"
inmutables=(--include '_astro/*' --include '*.woff' --include '*.woff2' --include '*.ttf' --include '*.otf' --include '*.eot')

# Publica los recursos versionados antes del HTML que los referencia.
aws s3 sync dist/ "$destino" --exclude '*' "${inmutables[@]}" --exclude '*.html' \
  --cache-control 'public,max-age=31536000,immutable'
aws s3 sync dist/ "$destino" --delete "${inmutables[@]/--include/--exclude}" --exclude '*.html' \
  --cache-control 'public,max-age=3600'
aws s3 sync dist/ "$destino" --delete --exclude '*' --include '*.html' \
  --cache-control 'no-cache'
aws s3 sync dist/ "$destino" --delete --exclude '*' "${inmutables[@]}" --exclude '*.html' \
  --cache-control 'public,max-age=31536000,immutable'

aws cloudfront create-invalidation --distribution-id "$distribucion" --paths '/*'
