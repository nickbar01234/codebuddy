#!/bin/bash

# Ensure concurrently is available
if ! command -v concurrently &> /dev/null; then
  echo "Installing concurrently..."
  pnpm add -D concurrently
fi

# Run everything concurrently
pnpm exec concurrently \
  --names "CODE,BUDDY,DEV" \
  --prefix-colors "blue,green,magenta" \
  "redux-devtools --hostname=localhost --port=8000 --open --name='Code'" \
  "redux-devtools --hostname=localhost --port=8001 --open --name='Buddy'" \
  "redux-devtools --hostname=localhost --port=8002 --open --name='Dev'" \
  "redux-devtools --hostname=localhost --port=8003 --open --name='Mode'" \
  "pnpm run dev"
