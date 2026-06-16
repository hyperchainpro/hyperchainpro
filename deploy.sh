#!/bin/bash
# ─── HyperChain Pro — One-Command Deploy to Vercel ───────────────────────
# Usage:
#   1. Create a new GitHub Personal Access Token (classic) with "repo" scope
#      at https://github.com/settings/tokens/new?scopes=repo&description=hyperchainpro-deploy
#   2. Run:  export GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"
#   3. Run:  bash deploy.sh
#
# This script will:
#   - Create a new GitHub repo "hyperchainpro"
#   - Push all code to GitHub
#   - Deploy to Vercel via CLI (or trigger auto-deploy if connected)

set -e

# ─── Configuration ───────────────────────────────────────────────────────
GITHUB_USER="hyperchainpro"
REPO_NAME="hyperchainpro"
BRANCH="main"

# ─── Colors ──────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  HyperChain Pro — Deploy to Vercel${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"

# ─── Step 1: Check GitHub Token ─────────────────────────────────────────
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN not set.${NC}"
    echo ""
    echo "Please create a GitHub Personal Access Token (classic) with 'repo' scope:"
    echo "  https://github.com/settings/tokens/new?scopes=repo&description=hyperchainpro-deploy"
    echo ""
    echo "Then run:"
    echo "  export GITHUB_TOKEN=\"ghp_YOUR_TOKEN_HERE\""
    echo "  bash deploy.sh"
    exit 1
fi

# ─── Step 2: Create GitHub Repo ────────────────────────────────────────
echo -e "${YELLOW}[1/4] Creating GitHub repository...${NC}"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://api.github.com/user/repos" \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"HyperChain Pro - AI-Powered Design Platform\",\"private\":false,\"auto_init\":false}")

if [ "$HTTP_STATUS" = "201" ]; then
    echo -e "${GREEN}  ✓ Repository created: https://github.com/$GITHUB_USER/$REPO_NAME${NC}"
elif [ "$HTTP_STATUS" = "422" ]; then
    echo -e "${YELLOW}  ! Repository already exists, pushing to it...${NC}"
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo -e "${RED}  ✗ Authentication failed. Make sure your token has 'repo' scope.${NC}"
    exit 1
else
    echo -e "${YELLOW}  ! Unexpected status ($HTTP_STATUS), attempting to push anyway...${NC}"
fi

# ─── Step 3: Push Code to GitHub ───────────────────────────────────────
echo -e "${YELLOW}[2/4] Pushing code to GitHub...${NC}"

# Add remote (force update if exists)
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Push
if git push -u origin $BRANCH --force 2>/dev/null; then
    echo -e "${GREEN}  ✓ Code pushed successfully!${NC}"
else
    echo -e "${RED}  ✗ Failed to push. Check your token permissions.${NC}"
    exit 1
fi

# Clean up remote URL (remove token)
git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# ─── Step 4: Deploy to Vercel ──────────────────────────────────────────
echo -e "${YELLOW}[3/4] Deploying to Vercel...${NC}"

if command -v vercel &> /dev/null; then
    if vercel --token "$VERCEL_TOKEN" deploy --prod --yes 2>/dev/null; then
        echo -e "${GREEN}  ✓ Deployed to Vercel!${NC}"
    else
        echo -e "${YELLOW}  ! Vercel CLI deploy failed. Trying auto-deploy...${NC}"
        echo -e "${YELLOW}  ! If your Vercel project is connected to GitHub, it will auto-deploy.${NC}"
        echo -e "${YELLOW}  ! Check: https://vercel.com/hyperchainproject-2935s-projects${NC}"
    fi
else
    echo -e "${YELLOW}  ! Vercel CLI not found. Install it: npm i -g vercel${NC}"
    echo -e "${YELLOW}  ! If your Vercel project is connected to GitHub, it will auto-deploy.${NC}"
    echo -e "${YELLOW}  ! Check: https://vercel.com/hyperchainproject-2935s-projects${NC}"
fi

# ─── Done ──────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Deployment complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "GitHub:   https://github.com/$GITHUB_USER/$REPO_NAME"
echo "Vercel:   https://vercel.com/hyperchainproject-2935s-projects"
echo ""
echo -e "${YELLOW}Don't forget to set these environment variables on Vercel:${NC}"
echo "  DATABASE_URL  = your Neon PostgreSQL connection string (pgbouncer)"
echo "  DIRECT_URL    = your Neon PostgreSQL direct connection string"
echo ""
echo "Get them from: https://console.neon.tech"