#!/usr/bin/env bash
# Sube los secrets del .env local a GitHub Actions.
# Nunca imprime valores: solo nombres (✓ creado / WARN omitido).
# Uso: ./scripts/load-gh-secrets.sh   (desde la raíz del repo)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$DIR/.env"
REPO="electromedico/bjjquebecenfants-landing"
KEYS="CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID"

[ -f "$ENV_FILE" ] || { echo "falta $ENV_FILE" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

failed=0
for k in $KEYS; do
  v="${!k:-}"
  if [ -z "$v" ]; then
    echo "WARN: $k vacío, se omite" >&2
    failed=1
    continue
  fi
  if gh secret set "$k" --repo "$REPO" --body "$v" >/dev/null; then
    echo "✓ $k"
  else
    echo "ERROR: $k no se pudo cargar" >&2
    failed=1
  fi
done

exit "$failed"
