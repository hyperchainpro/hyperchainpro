#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting dev server at $(date)" >> /tmp/dev-wrapper.log
  npx next dev -p 3000 >> /tmp/dev-wrapper.log 2>&1
  echo "Server exited at $(date), restarting in 2s..." >> /tmp/dev-wrapper.log
  sleep 2
done
