#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PG_BIN_DIR="/usr/local/opt/postgresql@16/bin"
DATA_DIR="${BACKEND_DIR}/.local_pg"
LOG_FILE="${DATA_DIR}/server.log"
PG_PORT="${PG_PORT:-55432}"

usage() {
  cat <<'EOF'
Usage: ./backend/scripts/local_pg.sh <command>

Commands:
  init      Initialize local PostgreSQL cluster for this project
  start     Start local PostgreSQL server
  stop      Stop local PostgreSQL server
  status    Show local PostgreSQL status
  createdb  Create bloom_english + bloom_english_test databases
  psql      Open psql shell to bloom_english (pass extra args after command)
EOF
}

require_bin() {
  local bin_name="$1"
  if [[ ! -x "${PG_BIN_DIR}/${bin_name}" ]]; then
    echo "Missing ${PG_BIN_DIR}/${bin_name}. Install postgresql@16 first."
    exit 1
  fi
}

require_bin "pg_ctl"

command="${1:-}"

case "${command}" in
  init)
    require_bin "initdb"
    mkdir -p "${DATA_DIR}"
    if [[ -f "${DATA_DIR}/PG_VERSION" ]]; then
      echo "Local cluster already initialized: ${DATA_DIR}"
      exit 0
    fi
    "${PG_BIN_DIR}/initdb" -D "${DATA_DIR}" --username=postgres --auth=trust
    ;;
  start)
    if [[ ! -f "${DATA_DIR}/PG_VERSION" ]]; then
      echo "Cluster is not initialized. Run: ./backend/scripts/local_pg.sh init"
      exit 1
    fi
    "${PG_BIN_DIR}/pg_ctl" -D "${DATA_DIR}" -l "${LOG_FILE}" -o "-p ${PG_PORT}" start
    ;;
  stop)
    if [[ ! -f "${DATA_DIR}/PG_VERSION" ]]; then
      echo "Cluster is not initialized."
      exit 0
    fi
    "${PG_BIN_DIR}/pg_ctl" -D "${DATA_DIR}" stop || true
    ;;
  status)
    if [[ ! -f "${DATA_DIR}/PG_VERSION" ]]; then
      echo "Cluster is not initialized."
      exit 1
    fi
    "${PG_BIN_DIR}/pg_ctl" -D "${DATA_DIR}" status
    ;;
  createdb)
    require_bin "createdb"
    "${PG_BIN_DIR}/createdb" -h localhost -p "${PG_PORT}" -U postgres bloom_english || true
    "${PG_BIN_DIR}/createdb" -h localhost -p "${PG_PORT}" -U postgres bloom_english_test || true
    ;;
  psql)
    require_bin "psql"
    shift || true
    "${PG_BIN_DIR}/psql" -h localhost -p "${PG_PORT}" -U postgres bloom_english "$@"
    ;;
  *)
    usage
    exit 1
    ;;
esac
