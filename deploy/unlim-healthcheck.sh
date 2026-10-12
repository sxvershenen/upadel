#!/usr/bin/env bash
set -u

state_dir=/var/lib/unlim-healthcheck

check_service() {
  local unit="$1"
  shift
  local state_file="$state_dir/$unit.failures"
  local failures

  if curl --silent --fail --output /dev/null --connect-timeout 3 --max-time 12 "$@"; then
    rm -f "$state_file"
    return 0
  fi

  failures="$(cat "$state_file" 2>/dev/null || printf '0')"
  if [[ ! "$failures" =~ ^[0-9]+$ ]]; then
    failures=0
  fi
  failures=$((failures + 1))
  printf '%s\n' "$failures" > "$state_file.tmp"
  mv -f "$state_file.tmp" "$state_file"
  logger -t unlim-healthcheck "$unit health check failed ($failures consecutive failures)"

  if (( failures >= 2 )); then
    if systemctl restart "$unit.service"; then
      logger -t unlim-healthcheck "restarted $unit after failed health checks"
      rm -f "$state_file"
    else
      logger -t unlim-healthcheck "failed to restart $unit after failed health checks"
    fi
  fi
}

check_service unlim-web http://127.0.0.1:4321/
check_service unlim-cms http://127.0.0.1:3000/api/public/homepage
check_service nginx --resolve unlimpadel.ru:443:127.0.0.1 https://unlimpadel.ru/
