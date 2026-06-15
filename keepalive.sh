#!/bin/bash
cd /home/z/my-project
rm -f dev.log

while true; do
  echo "=== START $(date) ===" >> dev.log
  NODE_OPTIONS="--max-old-space-size=256" bun run dev >> dev.log 2>&1
  echo "=== EXIT $(date) code=$? ===" >> dev.log
  sleep 1
done