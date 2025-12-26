#!/bin/bash

# Deployment script for Fly.io

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying Rate My Teacher API to Fly.io...${NC}"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}Error: flyctl is not installed${NC}"
    echo "Install it with: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Fly.io. Logging in...${NC}"
    flyctl auth login
fi

# Check if app exists
if ! flyctl status &> /dev/null; then
    echo -e "${YELLOW}App does not exist. Creating...${NC}"
    flyctl apps create rate-my-teacher-api --org personal

    echo -e "${YELLOW}Setting DATABASE_URL secret...${NC}"
    if [ -f "../.env.local" ]; then
        DATABASE_URL=$(grep "^DATABASE_URL=" ../.env.local | cut -d '=' -f2- | tr -d '"')
        flyctl secrets set DATABASE_URL="$DATABASE_URL"
    else
        echo -e "${RED}Error: .env.local not found${NC}"
        echo "Please set the DATABASE_URL secret manually:"
        echo "flyctl secrets set DATABASE_URL=\"your-database-url\""
        exit 1
    fi
fi

# Deploy
echo -e "${GREEN}Deploying application...${NC}"
flyctl deploy

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}View logs: ${NC}flyctl logs"
echo -e "${GREEN}Check status: ${NC}flyctl status"
echo -e "${GREEN}Open app: ${NC}flyctl open"
