#!/bin/bash

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
echo "Building and starting container..."
docker compose up -d --build

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  Build Number: #${NEW_BUILD}"
echo "=========================================="
