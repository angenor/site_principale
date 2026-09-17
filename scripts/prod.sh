#!/usr/bin/env bash
# ============================================
# Opérations sur la production, lancées depuis le poste local
#
# Usage :
#   ./scripts/prod.sh backup    Sauvegarde la base de production dans backups/
#   ./scripts/prod.sh migrate   Sauvegarde puis aligne la base sur le schéma de origin/main
#                               (refuse toute modification destructrice)
#
# Variables facultatives :
#   MOM_PROD_HOST   Accès SSH (défaut : root@164.68.112.108)
#   MOM_PROD_DIR    Dossier de l'application sur le serveur (défaut : /opt/mom)
# ============================================

set -euo pipefail

HOST="${MOM_PROD_HOST:-root@164.68.112.108}"
APP_DIR="${MOM_PROD_DIR:-/opt/mom}"
DB_CONTAINER="mom-db"
DOCKER_NETWORK="mom_mom-network"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() { echo -e "\n${YELLOW}>>> $1${NC}"; }
ok()   { echo -e "${GREEN}$1${NC}"; }
fail() { echo -e "${RED}Erreur : $1${NC}" >&2; exit 1; }

# Une seule connexion SSH partagée : le serveur coupe les connexions trop rapprochées
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15 -o ControlMaster=auto -o "ControlPath=$HOME/.ssh/mom-prod-%C" -o ControlPersist=120)

remote() {
  ssh "${SSH_OPTS[@]}" "$HOST" "$@"
}

# Nombre de lignes par table, trié, pour comparer avant/après une migration
count_rows() {
  remote "APP_DIR='$APP_DIR' DB_CONTAINER='$DB_CONTAINER' bash -s" <<'EOF'
set -euo pipefail
cd "$APP_DIR"
set -a; . ./.env; set +a
docker exec "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -F= -c "
  select table_name,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I', table_name), false, true, '')))[1]::text
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by 1"
EOF
}

cmd_backup() {
  local label="${1:-sauvegarde}"
  local ts file remote_file local_sum remote_sum tables
  ts="$(date +%Y%m%d-%H%M%S)"
  file="mom_db-$label-$ts.dump"
  remote_file="/tmp/$file"

  step "Sauvegarde de la base de production ($HOST)"
  remote "APP_DIR='$APP_DIR' DB_CONTAINER='$DB_CONTAINER' REMOTE_FILE='$remote_file' bash -s" <<'EOF'
set -euo pipefail
cd "$APP_DIR"
set -a; . ./.env; set +a
docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$REMOTE_FILE"
EOF

  # L'archive doit être relisible et contenir des données
  tables="$(remote "docker exec -i $DB_CONTAINER pg_restore -l < '$remote_file' | grep -c 'TABLE DATA' || true")"
  [ "${tables:-0}" -gt 0 ] || fail "archive illisible ou vide sur le serveur ($remote_file)"

  mkdir -p "$BACKUP_DIR"
  scp -q "${SSH_OPTS[@]}" "$HOST:$remote_file" "$BACKUP_DIR/$file"

  local_sum="$(shasum -a 256 "$BACKUP_DIR/$file" | cut -d' ' -f1)"
  remote_sum="$(remote "sha256sum '$remote_file' | cut -d' ' -f1")"
  [ "$local_sum" = "$remote_sum" ] || fail "somme de contrôle différente, copie conservée sur le serveur : $remote_file"

  remote "rm -f '$remote_file'"
  ok "Sauvegarde : backups/$file ($(du -h "$BACKUP_DIR/$file" | cut -f1), $tables tables)"
  LAST_BACKUP="$BACKUP_DIR/$file"
}

cmd_migrate() {
  local work="/tmp/mom-migration-$$"
  local ts diff_file before after
  ts="$(date +%Y%m%d-%H%M%S)"
  diff_file="$BACKUP_DIR/migration-$ts.sql"

  step "Vérification du dépôt local"
  git -C "$ROOT_DIR" fetch -q origin
  if ! git -C "$ROOT_DIR" diff --quiet origin/main -- prisma/schema.prisma; then
    echo -e "${YELLOW}Attention : prisma/schema.prisma local diffère de origin/main.${NC}"
    echo "La migration utilise le schéma de origin/main (celui qui sera déployé)."
  fi
  ok "Schéma de référence : origin/main ($(git -C "$ROOT_DIR" rev-parse --short origin/main))"

  cmd_backup "avant-migration"

  step "Calcul des changements à appliquer"
  mkdir -p "$BACKUP_DIR"
  remote "mkdir -p '$work/prisma'"
  git -C "$ROOT_DIR" show origin/main:prisma/schema.prisma | remote "cat > '$work/prisma/schema.prisma'"
  remote "APP_DIR='$APP_DIR' WORK='$work' NETWORK='$DOCKER_NETWORK' bash -s" > "$diff_file" <<'EOF'
set -euo pipefail
cd "$APP_DIR"
set -a; . ./.env; set +a
docker run --rm --network "$NETWORK" -e DATABASE_URL="$DATABASE_URL" -v "$WORK":/app -w /app node:22-alpine sh -c \
  'npm install --silent --no-audit --no-fund prisma@6 >/dev/null 2>&1 && npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script' \
  2>/dev/null
EOF

  if ! grep -q '[A-Za-z]' <(grep -v '^--' "$diff_file" | grep -v 'This is an empty migration'); then
    remote "rm -rf '$work'"
    rm -f "$diff_file"
    ok "La base de production est déjà à jour, rien à appliquer."
    return
  fi

  cat "$diff_file"

  # Seuls les ajouts et assouplissements sont acceptés
  if grep -n -i -E 'drop (table|column|type|schema|view)|truncate|delete from|alter column .* type |set not null|rename' "$diff_file"; then
    remote "rm -rf '$work'"
    fail "changement potentiellement destructeur détecté (lignes ci-dessus). Rien n'a été appliqué. Script conservé : ${diff_file#$ROOT_DIR/}"
  fi

  echo ""
  read -r -p "Appliquer ces changements à la production ? [o/N] " answer
  if [[ ! "$answer" =~ ^[oOyY]$ ]]; then
    remote "rm -rf '$work'"
    echo "Annulé, rien n'a été appliqué."
    return
  fi

  before="$(count_rows)"

  step "Application en une seule transaction"
  remote "APP_DIR='$APP_DIR' DB_CONTAINER='$DB_CONTAINER' bash -s" < <(
    cat <<'EOF'
set -euo pipefail
cd "$APP_DIR"
set -a; . ./.env; set +a
docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 --single-transaction -q <<'SQL'
EOF
    cat "$diff_file"
    echo "SQL"
  )
  ok "Migration appliquée"

  step "Vérifications"
  local remaining
  remaining="$(remote "APP_DIR='$APP_DIR' WORK='$work' NETWORK='$DOCKER_NETWORK' bash -s" <<'EOF'
set -euo pipefail
cd "$APP_DIR"
set -a; . ./.env; set +a
docker run --rm --network "$NETWORK" -e DATABASE_URL="$DATABASE_URL" -v "$WORK":/app -w /app node:22-alpine sh -c \
  'npm install --silent --no-audit --no-fund prisma@6 >/dev/null 2>&1; npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code >/dev/null 2>&1; echo $?'
EOF
)"
  remote "rm -rf '$work'"
  [ "$remaining" = "0" ] || fail "la base diffère encore du schéma (code $remaining)"
  ok "Base alignée sur le schéma"

  after="$(count_rows)"
  # Aucune table existante ne doit perdre de lignes (le site reste en ligne,
  # certaines tables comme page_visits peuvent augmenter pendant l'opération)
  local lost
  lost="$(awk -F= 'NR == FNR { after[$1] = $2; next } !($1 in after) || after[$1] + 0 < $2 + 0 { print $1 ": " $2 " -> " (($1 in after) ? after[$1] : "absente") }' \
    <(echo "$after") <(echo "$before"))"
  [ -z "$lost" ] || fail "lignes perdues : $lost (restaurer avec ${LAST_BACKUP#$ROOT_DIR/})"
  ok "Données intactes ($(echo "$before" | wc -l | tr -d ' ') tables vérifiées)"

  echo -e "\nScript appliqué : ${diff_file#$ROOT_DIR/}"
  echo "Sauvegarde      : ${LAST_BACKUP#$ROOT_DIR/}"
  echo -e "${YELLOW}Le code n'est pas redéployé : pensez au git pull et à la reconstruction des conteneurs sur le serveur.${NC}"
}

usage() {
  sed -n '3,12p' "$0" | sed 's/^# \{0,1\}//'
}

case "${1:-}" in
  backup|backups) cmd_backup ;;
  migrate) cmd_migrate ;;
  -h|--help|help|"") usage ;;
  *) usage; exit 1 ;;
esac
