#!/usr/bin/env bash
# Claude Code PostToolUse hook: formats and lint-fixes a file that was just
# edited. Receives the tool payload as JSON on stdin (see .claude/settings.json).
set -euo pipefail
file=$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.stdout.write(j.tool_input?.file_path||"")}catch{}})')
[[ -z "$file" ]] && exit 0
case "$file" in
  */src/*.ts|*/src/*.tsx)
    pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
    pnpm exec eslint --fix "$file" >/dev/null 2>&1 || true
    ;;
  */src/*.scss)
    pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
    pnpm exec stylelint --fix "$file" >/dev/null 2>&1 || true
    ;;
  */src/*.json)
    pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
    ;;
esac
exit 0
