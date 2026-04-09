#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1

BUILD_FILE="build-number.json"
DB_FILE="meals.db"

# Read current build number
if [ -f "$BUILD_FILE" ]; then
  CURRENT_BUILD=$(cat "$BUILD_FILE" | grep -o '"buildNumber": [0-9]*' | grep -o '[0-9]*')
else
  CURRENT_BUILD=0
fi

# Increment build number
NEW_BUILD=$((CURRENT_BUILD + 1))
echo "{\"buildNumber\": $NEW_BUILD}" > "$BUILD_FILE"

echo "=========================================="
echo "  Meal Planner Deployment"
echo "=========================================="
echo "  Previous build: #${CURRENT_BUILD}"
echo "  New build:     #${NEW_BUILD}"
echo "=========================================="

echo ""
echo "Running tests..."
npm test
TEST_RESULT=$?

if [ $TEST_RESULT -ne 0 ]; then
  echo "Tests failed! Aborting deployment."
  exit 1
fi

echo ""
echo "Tests passed! Building and starting container..."
docker compose up -d --build

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  Build Number: #${NEW_BUILD}"
echo "=========================================="
