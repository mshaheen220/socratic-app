#!/bin/bash

# Paths
PROJECT_ROOT="/Users/michael/Documents/dev/socratic-app"

# Ensure PM2's path is available to the script
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.npm-global/bin

echo "⚙️ [THEFORGE] Preparing to deploy Mindframe..."

# Change into the project directory first to ensure all subsequent commands run in the correct context
cd "$PROJECT_ROOT"

# --- Git Update ---
echo "⬇️  [THEFORGE] Pulling latest code from GitHub..."
git fetch --all
git reset --hard origin/main

# --- Dependency Installation ---
echo "📦 [THEFORGE] Installing production dependencies..."
# Use --omit=dev to avoid installing dev dependencies like eslint, nodemon, etc.
npm install --omit=dev --loglevel=error --no-audit --no-fund

# --- Environment Loading ---
echo "🔒 [THEFORGE] Loading environment variables..."
if [ -f ".env" ]; then
  export $(cat .env | xargs)
fi

# --- PM2 Process Management ---
echo "🔄 [THEFORGE] Restarting application services with PM2..."

# Define app configurations for PM2
BACKEND_APP_NAME="mindframe-backend"

# --- Backend Service ---
echo "⚙️  [THEFORGE] Managing backend service..."
if pm2 describe "$BACKEND_APP_NAME" > /dev/null 2>&1; then
  echo "Restarting existing backend service..."
  pm2 restart "$BACKEND_APP_NAME" || npx pm2 restart "$BACKEND_APP_NAME"
else
  echo "Starting new backend service..."
  pm2 start "src/server/index.js" --name "$BACKEND_APP_NAME" || npx pm2 start "src/server/index.js" --name "$BACKEND_APP_NAME"
fi

# Save the process list so PM2 can resurrect them on server reboot
echo "💾 [THEFORGE] Saving process list..."
pm2 save || npx pm2 save

echo "✅ [THEFORGE] PM2 has successfully restarted the backend service."

echo "🔃 [THEFORGE] Reloading Caddy to apply changes..."
caddy reload --config /Users/michael/.config/caddy/Caddyfile

echo "🌐 [THEFORGE] Mindframe is securely live at mindframe.theshaheens.info"