#!/bin/bash

# Auto-increment build number before docker compose
BUILD_FILE="build-number.json"

if [ -f "$BUILD_FILE" ]; then
  # Use node to increment the build number
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$BUILD_FILE', 'utf8'));
    data.buildNumber = (data.buildNumber || 0) + 1;
    fs.writeFileSync('$BUILD_FILE', JSON.stringify(data, null, 2) + '\n');
    console.log('Build number incremented to: ' + data.buildNumber);
  "
fi

# Run docker compose
docker compose up -d --build