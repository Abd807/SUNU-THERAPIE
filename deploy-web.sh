#!/usr/bin/env bash
# Construit l'app web et l'envoie sur le serveur.
# Le build se fait en local : le serveur n'a pas de chaine Node, et il n'en a pas besoin.
set -euo pipefail

SERVEUR="${SUNU_SERVEUR:-root@108.61.99.111}"
CIBLE="/var/www/sunutherapie-web"
ICI="$(cd "$(dirname "$0")" && pwd)/sunutherapie-web"

echo "→ Build"
npm --prefix "$ICI" run build

echo "→ Envoi vers $SERVEUR:$CIBLE"
rsync -az --delete "$ICI/dist/" "$SERVEUR:$CIBLE/"
ssh "$SERVEUR" "chown -R www-data:www-data $CIBLE && chmod -R 755 $CIBLE"

echo "✓ En ligne sur https://app.sunutherapi.com"
