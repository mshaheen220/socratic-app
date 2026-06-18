#!/bin/bash

# Exit immediately if any command encounters an error
set -e

echo "🚀 [DEV MAC] Mindframe Deployment Sequence Initiated..."

# --- Branch Check ---
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "\033[0;91m❌ ERROR: Deployments can only be run from the 'main' branch. You are currently on '$CURRENT_BRANCH'.\033[0m"
  exit 1
fi

# Handle commit message and version flags from arguments
COMMIT_MSG="$1"
if [[ "$COMMIT_MSG" == "--minor" || "$COMMIT_MSG" == "--major" || -z "$COMMIT_MSG" ]]; then
  COMMIT_MSG="Automated build and deployment"
fi

VERSION_FLAG=""
if [[ "$*" == *"--major"* ]]; then
  VERSION_FLAG="--major"
elif [[ "$*" == *"--minor"* ]]; then
  VERSION_FLAG="--minor"
fi

echo "📦 [DEV MAC] Bumping app version..."
node scripts/node/bump-app-version.js $VERSION_FLAG

echo "🏗️ [DEV MAC] Compiling production-optimized static assets via Vite..."
npm run build

echo "🚀 [DEV MAC] Syncing application files to TheForge via rsync (excluding node_modules, .git, etc.)..."
# We only need to sync the compiled frontend assets. The server will get the rest from Git.
echo -e "\033[1;5;95m🔑 HEADS UP: Please enter your password for TheForge below...\033[0m"
rsync -avz --delete ./dist/ michael@TheForge:/Users/michael/Documents/dev/socratic-app/dist/

echo "💾 [DEV MAC] Committing and pushing version bump and changes to GitHub..."
git add .
git commit -m "$COMMIT_MSG"
git push

echo "🔗 [DEV MAC] Remotely triggering the deployment process handler on TheForge..."
echo -e "\033[1;5;95m🔑 HEADS UP: Please enter your password for TheForge below...\033[0m" # This is for the SSH connection
ssh michael@TheForge "cd /Users/michael/Documents/dev/socratic-app && git fetch --all && git reset --hard origin/main && bash ./scripts/bash/deploy-forge.sh"

echo "🎉 [DEV MAC] Deployment sequence completely finished!"
echo "🌐 [DEV MAC] Mindframe is securely live at mindframe.theshaheens.info"