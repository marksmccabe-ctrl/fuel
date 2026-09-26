#!/bin/sh
# Bluebird Fuel: self-host Firebase's sign-in helper on the app's own domain.
#
# Why: Safari (iPhone, iPad, Mac) blocks the third-party storage that Firebase's redirect sign-in relies on when the
# helper lives on <project>.firebaseapp.com. Firebase's fix ("Best practices for using signInWithRedirect on browsers
# that block third-party storage", option 3) is to serve the helper from the app's own domain: this script downloads
# it from your Firebase project into this repo, so GitHub Pages serves it at https://<APP_DOMAIN>/__/auth/...
# (.nojekyll at the repo root makes GitHub Pages publish folders that start with "_").
#
# Usage (from anywhere, needs curl):
#   sh scripts/fetch-auth-helper.sh <firebase-project-id>
#   e.g. sh scripts/fetch-auth-helper.sh bluebird-fuel-12345
#
# It writes:
#   __/auth/handler  __/auth/handler.js  __/auth/experiments.js  __/auth/iframe  __/auth/iframe.js
#   __/firebase/init.json   (the project's web config, with authDomain set to APP_DOMAIN from index.html)
# Then commit them:  git add __ && git commit -m "Self-host the Firebase auth helper"
# Re-run it after Firebase updates the helper (rarely needed) or if sign-in on iPhone stops working.
#
# Before sign-in works you also need (see README): FIREBASE_CONFIG pasted in index.html with authDomain equal to
# APP_DOMAIN, the Google provider enabled, and APP_DOMAIN in Firebase Authentication > Settings > Authorized domains.
set -eu

PROJECT="${1:-}"
if [ -z "$PROJECT" ]; then
  echo "usage: sh scripts/fetch-auth-helper.sh <firebase-project-id>" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="https://${PROJECT}.firebaseapp.com"

# APP_DOMAIN lives in one place: index.html (const APP_DOMAIN = '...')
APP_DOMAIN="$(sed -n "s/^const APP_DOMAIN = '\([^']*\)'.*/\1/p" "$ROOT/index.html" | head -n 1)"
if [ -z "$APP_DOMAIN" ]; then
  echo "Could not find const APP_DOMAIN in index.html" >&2
  exit 1
fi

mkdir -p "$ROOT/__/auth" "$ROOT/__/firebase"
trap 'rm -f "$ROOT"/__/auth/*.tmp "$ROOT"/__/firebase/*.tmp' EXIT
for f in handler handler.js experiments.js iframe iframe.js; do
  echo "Fetching $SRC/__/auth/$f"
  curl -fsSL "$SRC/__/auth/$f" -o "$ROOT/__/auth/$f.tmp"
  if [ ! -s "$ROOT/__/auth/$f.tmp" ]; then
    echo "Empty response for $f. Is the project id right, and is Firebase Hosting / Authentication enabled?" >&2
    rm -f "$ROOT/__/auth/$f.tmp"
    exit 1
  fi
  mv "$ROOT/__/auth/$f.tmp" "$ROOT/__/auth/$f"
done

# init.json: Firebase Hosting serves the project's web config at this reserved URL. The helper reads apiKey,
# authDomain and projectId from it; authDomain must be the app's own domain.
echo "Fetching $SRC/__/firebase/init.json"
curl -fsSL "$SRC/__/firebase/init.json" -o "$ROOT/__/firebase/init.json.tmp"
if ! grep -q '"apiKey"' "$ROOT/__/firebase/init.json.tmp"; then
  echo "init.json has no apiKey. Register a web app in the Firebase console (Project settings > Your apps) and retry," >&2
  echo "or write __/firebase/init.json yourself: {\"apiKey\":\"...\",\"authDomain\":\"$APP_DOMAIN\",\"projectId\":\"$PROJECT\"}" >&2
  rm -f "$ROOT/__/firebase/init.json.tmp"
  exit 1
fi
sed "s/\"authDomain\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"authDomain\": \"$APP_DOMAIN\"/" "$ROOT/__/firebase/init.json.tmp" > "$ROOT/__/firebase/init.json"
rm -f "$ROOT/__/firebase/init.json.tmp"

echo
echo "Done. Files in $ROOT/__ (authDomain set to $APP_DOMAIN):"
ls -l "$ROOT/__/auth" "$ROOT/__/firebase"
echo
echo "Next: git add __ && git commit -m \"Self-host the Firebase auth helper\" && git push"
