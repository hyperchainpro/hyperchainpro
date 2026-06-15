#!/bin/bash
cd /home/z/my-project
while true; do
  bun run dev >> dev.log 2>&1
  echo "---RESTART $(date)---" >> dev.log
  sleep 3
done
