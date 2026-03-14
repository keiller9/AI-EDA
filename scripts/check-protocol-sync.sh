#!/bin/bash
# Check that BridgeCommand enum values are identical in both protocol.ts files
# Run this before commits or in CI to catch protocol drift

SERVER="mcp-server/src/protocol.ts"
EXTENSION="eda-extension/src/protocol.ts"

# Extract just the enum block from each file
extract_enum() {
  sed -n '/^export enum BridgeCommand/,/^}/p' "$1" | grep "=" | sed 's/^[[:space:]]*//' | sort
}

SERVER_ENUM=$(extract_enum "$SERVER")
EXTENSION_ENUM=$(extract_enum "$EXTENSION")

if [ "$SERVER_ENUM" = "$EXTENSION_ENUM" ]; then
  echo "✓ Protocol files are in sync ($(echo "$SERVER_ENUM" | wc -l | tr -d ' ') commands)"
  exit 0
else
  echo "✗ Protocol files are OUT OF SYNC!"
  echo ""
  echo "--- Server only ---"
  diff <(echo "$SERVER_ENUM") <(echo "$EXTENSION_ENUM") | grep "^<" | sed 's/^< /  /'
  echo ""
  echo "--- Extension only ---"
  diff <(echo "$SERVER_ENUM") <(echo "$EXTENSION_ENUM") | grep "^>" | sed 's/^> /  /'
  exit 1
fi
