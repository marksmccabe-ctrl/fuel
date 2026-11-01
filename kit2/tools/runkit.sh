#!/bin/sh
# usage: sh runkit.sh <page> [checkout]   -- the whole kit, one step at a time (4-CPU machine), on one built test page
#   page      a null.html built by tools/mknull.sh from the checkout (Firebase off, sw.js beside it)
#   checkout  the fred checkout the page was built from (default /home/user/fuel): the answer sheet runs there, and its history says
#             which item tests apply
# Steps, in order:
#   answer     cd <checkout> && npm test (the answer sheet)
#   smoke      smoke/smoke.test.mjs
#   contrast   contrast/contrast.test.mjs (every screen)
#   layout-W   layout/layout.test.mjs at each of its widths W (320, 375, 390, 430: its own default list, read from the file), one
#              process per width (each about 8 minutes; all four in one process pass the 1500 s limit), 100/150/200% text
#   inventory  inventory/inventory.mjs: snap the page, diff inventory/baseline-main.json against it with inventory/allow.json
#   motion     motion/motion.test.mjs (all passes)
#   qNN        every item test qNN/qNN.test.mjs, alphabetically, when item NN is in <checkout>: its history has a commit "qNN: ...",
#              "qNN WIP ..." or "Merge item NN ..." (main before an item is merged has none, so that item test is skipped and says so).
#              KIT_ITEMS="91 93" runs just those, KIT_ITEMS=all runs every one, KIT_ITEMS=none none. A test whose usage line (line 1)
#              asks for [main null.html] gets KIT_MAIN as its second argument (default: <scratchpad>/fred/null.html, main with
#              Firebase off). QNN_REPO defaults to <checkout>.
# Output (stdout): a first line naming the page, checkout and log folder; one line per step, "name: <the step's final line> (<n> s)";
#   a last line "kit: OK: ..." or "kit: FAIL n of m steps ...". A step passes only when it exits 0 and its final line starts with "OK:".
#   A failing step shows its final line ("FAIL n"), or "FAIL (exit n) <last Error line>" when it crashed, or "FAIL timeout ..." when
#   it ran past KIT_TIMEOUT seconds (default 1500 per step). Every step's full output is in the log folder (KIT_LOGS, default
#   <kit>/logs/runkit-<date-time>/<name>.log). Exit status: 0 when every step passed.
PAGE="$1"; CO="${2:-/home/user/fuel}"
[ -n "$PAGE" ] && [ -f "$PAGE" ] || { echo "usage: sh runkit.sh <page> [checkout]   (page not found: $PAGE)"; exit 2; }
[ -f "$CO/package.json" ] || { echo "usage: sh runkit.sh <page> [checkout]   (no package.json in the checkout: $CO)"; exit 2; }
PAGE="$(cd "$(dirname "$PAGE")" && pwd)/$(basename "$PAGE")"; CO="$(cd "$CO" && pwd)"
KIT="$(cd "$(dirname "$0")/.." && pwd)"; SCRATCH="$(dirname "$KIT")"
MAIN="${KIT_MAIN:-$SCRATCH/fred/null.html}"; T="${KIT_TIMEOUT:-1500}"
LOGS="${KIT_LOGS:-$KIT/logs/runkit-$(date +%Y%m%d-%H%M%S)-$$}"; mkdir -p "$LOGS"
unset LAYOUT_ONLY LAYOUT_SCALES LAYOUT_ALL LAYOUT_DEBUG MO_PASS MO_DEBUG MO_INSPECT_ALL KC_DEBUG KC_HIDDEN INV_VERBOSE Q93_ONLY
export LC_ALL=C
BUILD="$(grep -o "APP_BUILD *= *'[^']*'" "$PAGE" | head -1 | sed "s/.*'\(.*\)'/\1/")"
HEAD="$(git -C "$CO" log -1 --format='%h %s' 2>/dev/null | cut -c1-60)"
echo "runkit: page $PAGE (${BUILD:-no APP_BUILD}), checkout $CO (${HEAD:-not a git checkout}), logs $LOGS"
START=$(date +%s); N=0; BAD=0; SKIP=0

# the answer sheet: node --test ends with its counts ("pass N", "fail N", then duration_ms); make them one OK / FAIL line
npmline() {
  p=$(grep -aE '^[^ ]+ pass [0-9]+$' "$1" | tail -1 | awk '{print $NF}')
  f=$(grep -aE '^[^ ]+ fail [0-9]+$' "$1" | tail -1 | awk '{print $NF}')
  if [ "$2" = 0 ] && [ "$f" = 0 ] && [ -n "$p" ] && [ "$p" -gt 0 ]; then echo "OK: answer sheet (npm test) $p pass, 0 fail"
  elif [ "$2" != 124 ]; then echo "FAIL ${f:-?} (npm test exit $2: ${p:-?} pass, ${f:-?} fail)"; fi
}

# step <name> <dir> <command...>: run one step in <dir>, its output into <name>.log, and print its summary line
step() {
  name="$1"; dir="$2"; shift 2; log="$LOGS/$name.log"; t0=$(date +%s); N=$((N + 1))
  (cd "$dir" && exec timeout "$T" "$@") > "$log" 2>&1; e=$?
  s=$(( $(date +%s) - t0 ))
  [ "$name" = answer ] && npmline "$log" "$e" >> "$log"
  last="$(grep -av '^[[:space:]]*$' "$log" | tail -1)"
  if [ "$e" = 0 ] && [ "${last#OK:}" != "$last" ]; then echo "$name: $last ($s s)"; return 0; fi
  BAD=$((BAD + 1))
  if [ "$e" = 124 ]; then echo "$name: FAIL timeout after $T s, last line: $last"
  elif [ "${last#FAIL}" != "$last" ]; then echo "$name: $last ($s s)"
  else err="$(grep -aE 'Error|error:' "$log" | tail -1)"; echo "$name: FAIL (exit $e) ${err:-$last} ($s s)"; fi
  return 1
}

# applies <NN>: is item NN in the checkout (or chosen with KIT_ITEMS)?
applies() {
  case " $(echo "${KIT_ITEMS:-auto}" | tr ',' ' ') " in
    *" all "*) return 0 ;; *" none "*) return 1 ;; *" auto "*) ;; *" $1 "*) return 0 ;; *) return 1 ;;
  esac
  git -C "$CO" rev-parse --git-dir > /dev/null 2>&1 || return 0
  git -C "$CO" log --format=%s HEAD | grep -qE "^q$1([: ]|\$)|^Merge item $1([^0-9]|\$)"
}

step answer "$CO" npm test
step smoke "$KIT/smoke" node smoke.test.mjs "$PAGE"
step contrast "$KIT/contrast" node contrast.test.mjs "$PAGE"
WIDTHS="$(sed -n "s/.*process.argv\[3\] || '\([0-9,]*\)'.*/\1/p" "$KIT/layout/layout.test.mjs" | head -1)"
for w in $(echo "${WIDTHS:-320,375,390,430}" | tr ',' ' '); do step "layout-$w" "$KIT/layout" node layout.test.mjs "$PAGE" "$w"; done
if [ -f "$KIT/inventory/allow.json" ]; then step inventory "$KIT/inventory" node inventory.mjs "$PAGE" "$KIT/inventory/allow.json"
else step inventory "$KIT/inventory" node inventory.mjs "$PAGE"; fi
step motion "$KIT/motion" node motion.test.mjs "$PAGE"

for t in "$KIT"/q*/q*.test.mjs; do
  [ -f "$t" ] || continue
  dir="$(dirname "$t")"; name="$(basename "$t" .test.mjs)"; n="${name#q}"
  if ! applies "$n"; then
    SKIP=$((SKIP + 1)); echo "$name: skipped, item $n is not in this checkout (no q$n or Merge item $n commit; KIT_ITEMS=$n runs it)"; continue
  fi
  repo="$CO"; case "$n" in ''|*[!0-9]*) ;; *) eval "repo=\${Q${n}_REPO:-\$CO}" ;; esac
  if head -1 "$t" | grep -q '\[main null.html\]'; then step "$name" "$dir" env "Q${n}_REPO=$repo" node "$(basename "$t")" "$PAGE" "$MAIN"
  else step "$name" "$dir" env "Q${n}_REPO=$repo" node "$(basename "$t")" "$PAGE"; fi
done

TOTAL=$(( $(date +%s) - START ))
if [ "$BAD" = 0 ]; then echo "kit: OK: $N steps passed, $SKIP item tests skipped ($TOTAL s)"; exit 0; fi
echo "kit: FAIL $BAD of $N steps ($SKIP item tests skipped, $TOTAL s)"; exit 1
