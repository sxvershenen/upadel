#!/usr/bin/env bash
set -Eeuo pipefail

umask 027

APP_ROOT="${APP_ROOT:-/srv/unlim}"
SHARED_DIR="${SHARED_DIR:-$APP_ROOT/shared}"
ENV_FILE="${ENV_FILE:-$SHARED_DIR/.env.production}"
MEDIA_DIR="${MEDIA_DIR:-$SHARED_DIR/media}"
readonly deployment_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
CURRENT_LINK="$APP_ROOT/current"
RUN_BACKUP="${RUN_BACKUP:-1}"
FIRST_DEPLOY="${FIRST_DEPLOY:-0}"

[[ -f "$ENV_FILE" ]] || { echo "Missing production env: $ENV_FILE" >&2; exit 1; }
[[ -f "$deployment_dir/package-lock.json" ]] || { echo "Not a UNLIM release: $deployment_dir" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required=(DATABASE_URL PAYLOAD_SECRET PREVIEW_SECRET PUBLIC_WEB_URL PUBLIC_CMS_URL PUBLIC_CONTENT_URL PUBLIC_SITE_URL CMS_URL LEAD_ALLOWED_ORIGINS ANALYTICS_ALLOWED_ORIGINS ANALYTICS_JOB_SECRET PAYLOAD_ADMIN_ROUTE ADMIN_USERNAME ADMIN_EMAIL ADMIN_PASSWORD)
for name in "${required[@]}"; do
  value="${!name:-}"
  [[ -n "$value" ]] || { echo "Required variable is empty: $name" >&2; exit 1; }
  [[ "$value" != *replace-with* && "$value" != *example.com* ]] || { echo "Placeholder remains in $name" >&2; exit 1; }
done

mkdir -p "$APP_ROOT/releases" "$SHARED_DIR" "$MEDIA_DIR" "${BACKUP_DIR:-/srv/backups/unlim}"
chmod 700 "$SHARED_DIR"
chmod 600 "$ENV_FILE"

if [[ -e "$deployment_dir/apps/cms/media" && ! -L "$deployment_dir/apps/cms/media" ]]; then
  echo "Refusing to replace non-symlink media path: $deployment_dir/apps/cms/media" >&2
  exit 1
fi
ln -sfn "$MEDIA_DIR" "$deployment_dir/apps/cms/media"

cd "$deployment_dir"
npm ci
npm run typecheck
npm run build

if [[ "$RUN_BACKUP" == "1" && -L "$CURRENT_LINK" ]]; then
  "$deployment_dir/deploy/backup.sh"
fi

npm run payload --workspace @unlim/cms -- migrate
if [[ "$FIRST_DEPLOY" == "1" ]]; then
  npm run seed:cms
  npm run admin:create
fi
npm run media:responsive --workspace @unlim/cms

[[ ! -e "$CURRENT_LINK" || -L "$CURRENT_LINK" ]] || { echo "Current path is not a symlink: $CURRENT_LINK" >&2; exit 1; }
[[ "$deployment_dir" != "$CURRENT_LINK" ]] || { echo "Release must not point to current itself." >&2; exit 1; }
activation_link="$APP_ROOT/.current-$$"
trap 'rm -f "$activation_link"' EXIT
ln -s "$deployment_dir" "$activation_link"
node -e 'require("node:fs").renameSync(process.argv[1], process.argv[2])' "$activation_link" "$CURRENT_LINK"
[[ -f "$CURRENT_LINK/package-lock.json" ]] || { echo "Activated release is invalid." >&2; exit 1; }

echo "Release active: $deployment_dir"
echo "Restart services as root: systemctl restart unlim-cms.service unlim-web.service"
