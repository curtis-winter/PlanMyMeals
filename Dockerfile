# Use Node.js 20 as the base image
FROM node:20-slim AS base

# Install build dependencies for better-sqlite3 (if needed)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["./node_modules/.bin/tsx", "server.ts"]
