#!/usr/bin/env bash
# Sube esta maqueta a un repo NUEVO de GitHub, activa Pages y comprueba que publica.
#   GITHUB_TOKEN=ghp_xxx REPO=zenqa-life-final-finalisima bash .test/deploy.sh
# El token se usa solo en memoria, en la línea de comandos de este proceso: no se guarda
# en .git/config ni en ningún archivo (el remote queda con la URL limpia).
set -uo pipefail
cd "$(dirname "$0")/.."

: "${GITHUB_TOKEN:?falta GITHUB_TOKEN (PAT clásico con el scope «repo»: los fine-grained no pueden crear repos)}"
REPO="${REPO:-zenqa-life-final-finalisima}"

who() { curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user; }
OWNER="$(who | sed -n 's/.*"login": "\([^"]*\)".*/\1/p' | head -1)"
if [ -z "$OWNER" ]; then
  echo "✗ El token no autentica (GitHub devuelve 401). Es el caso de un token revocado o caducado."
  echo "  Crea uno en https://github.com/settings/tokens/new?scopes=repo&description=zenqa"
  exit 1
fi
echo "· autenticado como $OWNER · repositorio destino: $OWNER/$REPO"

curl -s -f -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"ZENQA LIFE · tienda de matcha (v4): 5 páginas minimalistas y a vender. Maqueta técnica para migrar a Shopify.\",\"private\":false,\"has_issues\":false,\"has_projects\":false,\"has_wiki\":false,\"auto_init\":false}" \
  -o /dev/null && echo "· repositorio creado" || echo "· el repositorio ya existía (sigo con el push)"

git -c credential.helper= push "https://x-access-token:${GITHUB_TOKEN}@github.com/${OWNER}/${REPO}.git" HEAD:main 2>&1 | sed "s/${GITHUB_TOKEN}/**REDACTADO**/g"
git remote set-url origin "https://github.com/${OWNER}/${REPO}.git" 2>/dev/null || git remote add origin "https://github.com/${OWNER}/${REPO}.git"
echo "· remote local: $(git remote get-url origin)"

curl -s -f -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/pages" \
  -d '{"source":{"branch":"main","path":"/"}}' -o /dev/null && echo "· Pages activado en main/(root)" || echo "· Pages ya estaba activado (o hay que activarlo a mano en Settings → Pages)"

URL="https://${OWNER}.github.io/${REPO}/"
SHA="$(git rev-parse --short HEAD)"
echo "· esperando el build de Pages del commit $SHA …"
for _ in $(seq 1 36); do
  J="$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/${OWNER}/${REPO}/pages/builds/latest")"
  st="$(printf '%s' "$J" | sed -n 's/.*"status": "\([^"]*\)".*/\1/p' | head -1)"
  cs="$(printf '%s' "$J" | sed -n 's/.*"sha": "\([0-9a-f]\{7\}\)[0-9a-f]*".*/\1/p' | head -1)"
  echo "    build: ${st:-sin empezar} (commit ${cs:-?})"
  [ "$st" = "built" ] && break
  sleep 10
done

echo "· comprobando la URL pública…"
fallan=0
for p in index.html matcha.html productos.html recetas.html nosotros.html legal.html \
         tienda.html ritual.html contacto.html prepararlo.html \
         assets/css/zenqa.css assets/js/data.js assets/js/app.js .nojekyll \
         assets/img/hero-matcha.jpg assets/img/logo-2x.png assets/img/p-hojicha.jpg \
         assets/fonts/switzer-700.woff2 assets/downloads/guia-matcha-zenqa.pdf; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$URL$p")"
  [ "$code" = "200" ] || fallan=$((fallan+1))
  printf '    %s %s\n' "$code" "$p"
done

echo "· y la suite funcional contra lo publicado…"
BASE="$URL" node .test/smoke.mjs 2>&1 | tail -9

if [ "$fallan" -eq 0 ]; then echo; echo "✓ publicado en $URL"; else echo; echo "✗ $fallan recurso(s) sin 200 en $URL"; exit 2; fi
