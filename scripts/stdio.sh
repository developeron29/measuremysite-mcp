#!/bin/sh
# Runs the server locally (wrangler dev + a local D1) and serves its MCP endpoint over stdio,
# for MCP clients and directories (Glama) that start servers as a command instead of a URL.
# Needs SITE_DOMAIN, HASH_SECRET and MCP_READ_KEY in the environment. Data stays in .wrangler/ on this machine.
set -e
cd "$(dirname "$0")/.."
export CI=1 WRANGLER_SEND_METRICS=false
npx wrangler d1 migrations apply DB --local >&2
npx wrangler dev --local --ip 127.0.0.1 --port 8787 \
  --var "SITE_DOMAIN:$SITE_DOMAIN" --var "HASH_SECRET:$HASH_SECRET" --var "MCP_READ_KEY:$MCP_READ_KEY" >&2 &
until node -e "fetch('http://127.0.0.1:8787/').then(() => process.exit(0), () => process.exit(1))"; do sleep 1; done
exec node scripts/stdio-bridge.mjs
