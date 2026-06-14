#!/bin/bash
# Keepalive dev server for BranchBoard
export DATABASE_URL="postgresql://z@127.0.0.1:5433/branchboard"
export NODE_OPTIONS="--max-old-space-size=4096"

while true; do
  echo "[$(date)] Starting dev server..."
  npx next dev -p 3000 --turbopack 2>&1 | tee -a /home/z/my-project/dev.log
  echo "[$(date)] Server exited, restarting in 3s..."
  sleep 3
done