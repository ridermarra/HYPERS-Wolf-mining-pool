#!/bin/bash
until node mine.js; do
  echo "Script crashed with exit code $?. Restarting..." >&2
  sleep 1
done
