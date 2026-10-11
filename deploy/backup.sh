#!/usr/bin/env bash
set -Eeuo pipefail

# Keep one replaceable archive per backup cadence.
umask 077

BACKUP_DIR="${BACKUP_DIR:-/srv/backups/unlim}"
BACKUP_NAME="${BACKUP_NAME:-daily}"
MEDIA_DIR="${MEDIA_DIR:-/srv/unlim/shared/media}"
ENV_FILE="${ENV_FILE:-/srv/unlim/shared/.env.production}"
RELEASE_DIR="${RELEASE_DIR:-/srv/unlim/current}"
PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-unlim}"
PGUSER="${PGUSER:-unlim}"

mkdir -p "$BACKUP_DIR"
[[ "$BACKUP_NAME" == daily || "$BACKUP_NAME" == weekly ]] || { echo "BACKUP_NAME must be daily or weekly." >&2; exit 1; }
lock_dir=""
if command -v flock >/dev/null 2>&1; then
  exec 9>"$BACKUP_DIR/.backup.lock"
  flock -n 9 || { echo "Another backup is already running." >&2; exit 1; }
else
  lock_dir="$BACKUP_DIR/.backup.lock.d"
  mkdir "$lock_dir" 2>/dev/null || { echo "Another backup is already running." >&2; exit 1; }
fi

work_dir="$(mktemp -d "$BACKUP_DIR/.work.XXXXXX")"
archive="$BACKUP_DIR/unlim-backup-${BACKUP_NAME}.tar.gz"
archive_tmp="$BACKUP_DIR/.unlim-backup-${BACKUP_NAME}.tar.gz.tmp"
cleanup() {
  rm -rf "$work_dir" "$archive_tmp"
  [[ -z "$lock_dir" ]] || rmdir "$lock_dir" 2>/dev/null || true
}
trap cleanup EXIT

[[ -d "$MEDIA_DIR" ]] || { echo "Media directory not found: $MEDIA_DIR" >&2; exit 1; }
[[ -f "$ENV_FILE" ]] || { echo "Production env file not found: $ENV_FILE" >&2; exit 1; }

echo "Dumping PostgreSQL database..."
pg_dump --format=custom --no-owner --no-privileges --file="$work_dir/database.dump"
cp "$ENV_FILE" "$work_dir/production.env"

release_commit="unknown"
if git -C "$RELEASE_DIR" rev-parse HEAD >/dev/null 2>&1; then
  release_commit="$(git -C "$RELEASE_DIR" rev-parse HEAD)"
fi
{
  echo "created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "release_commit=$release_commit"
  echo "database=$PGDATABASE"
  echo "media_dir=$MEDIA_DIR"
} > "$work_dir/release.txt"

echo "Packing database, media and production configuration..."
ln -s "$MEDIA_DIR" "$work_dir/media"
tar -czhf "$archive_tmp" -C "$work_dir" database.dump production.env release.txt media

mv -f "$archive_tmp" "$archive"
chmod 600 "$archive"

echo "Backup complete: $archive"
du -h "$archive"
df -h "$BACKUP_DIR"
