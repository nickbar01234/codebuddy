#!/bin/bash

# Not setting this because firebase complains since we're not authenticated
# set -e -o pipefail

DATA_DIR="$1"

# https://firebase.google.com/docs/emulator-suite/connect_firestore#choose_a_firebase_project
cd "functions" && pnpm dev
firebase use demo-codebuddy-development
firebase emulators:start --import="$DATA_DIR" --export-on-exit

