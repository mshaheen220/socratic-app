#!/bin/bash

# Paths
PROJECT_ROOT="/Users/michael/Documents/dev/socratic-app"

# Ensure PM2's path is available to the script
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:~/.npm-global/bin

echo "⚙️ [THEFORGE] Preparing to deploy Mindframe..."

# --- Git Update ---
echo "⬇️  [THEFORGE] Pulling latest code from GitHub..."
git fetch --all
git reset --hard origin/main

# --- Dependency Installation ---
echo "📦 [THEFORGE] Installing production dependencies..."
# Use --omit=dev to avoid installing dev dependencies like eslint, nodemon, etc.
npm install --prefix "$PROJECT_ROOT" --omit=dev --loglevel=error --no-audit --no-fund

# --- Environment Loading ---
echo "🔒 [THEFORGE] Loading environment variables..."
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | xargs)
fi

# --- PM2 Process Management ---
echo "🔄 [THEFORGE] Restarting application services with PM2..."

# Define app configurations for PM2
FRONTEND_APP_NAME="mindframe-frontend"
BACKEND_APP_NAME="mindframe-backend"

# --- Frontend Service ---
echo "🖥️  [THEFORGE] Managing frontend service..."
if pm2 describe "$FRONTEND_APP_NAME" > /dev/null; then
  echo "Restarting existing frontend service..."
  pm2 restart "$FRONTEND_APP_NAME"
else
  echo "Starting new frontend service..."
  pm2 start npx --name "$FRONTEND_APP_NAME" -- serve -s "$PROJECT_ROOT/dist" -l 5174
fi

# --- Backend Service ---
echo "⚙️  [THEFORGE] Managing backend service..."
if pm2 describe "$BACKEND_APP_NAME" > /dev/null; then
  echo "Restarting existing backend service..."
  pm2 restart "$BACKEND_APP_NAME"
else
  echo "Starting new backend service..."
  pm2 start "$PROJECT_ROOT/src/server/index.js" --name "$BACKEND_APP_NAME"
fi

# Save the process list so PM2 can resurrect them on server reboot
echo "💾 [THEFORGE] Saving process list..."
pm2 save

echo "✅ [THEFORGE] PM2 has successfully restarted both services."
echo "🌐 [THEFORGE] Mindframe is securely live at mindframe.theshaheens.info"