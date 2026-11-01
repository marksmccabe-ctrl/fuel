#!/bin/sh
# usage: sh mknull.sh <checkout dir> <out dir>  -- writes <out>/null.html (Firebase off) and copies sw.js beside it
SRC="$1"; OUT="$2"; mkdir -p "$OUT"
python3 - "$SRC/index.html" "$OUT/null.html" <<'PY'
import re,sys
t=open(sys.argv[1],encoding='utf8').read()
t2,n=re.subn(r'const FIREBASE_CONFIG = \{.*?\n\};','const FIREBASE_CONFIG = null;',t,count=1,flags=re.S)
assert n==1, 'FIREBASE_CONFIG block not found'
open(sys.argv[2],'w',encoding='utf8').write(t2)
PY
cp "$SRC/sw.js" "$OUT/sw.js"
