#!/bin/bash
# Keepalive script for Next.js dev server
LOG="/home/z/my-project/dev.log"
MAX_RETRIES=0
RETRY_COUNT=0

while true; do
  echo "[$(date '+%H:%M:%S')] Starting Next.js dev server (attempt $((RETRY_COUNT+1)))" >> "$LOG"
  
  NODE_OPTIONS="--max-old-space-size=256" npx next dev -p 3000 >> "$LOG" 2>&1
  
  EXIT_CODE=$?
  echo "[$(date '+%H:%M:%S')] Server exited with code $EXIT_CODE" >> "$LOG"
  
  RETRY_COUNT=$((RETRY_COUNT+1))
  
  # Brief pause before restart
  sleep 2
done