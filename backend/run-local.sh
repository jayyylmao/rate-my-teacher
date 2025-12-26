#!/bin/bash

# Local development script for Rate My Teacher API

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Rate My Teacher API locally...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL not set in environment${NC}"
    echo -e "${YELLOW}Attempting to read from ../.env.local${NC}"

    if [ -f "../.env.local" ]; then
        export DATABASE_URL=$(grep "^DATABASE_URL=" ../.env.local | cut -d '=' -f2- | tr -d '"')
        echo -e "${GREEN}Loaded DATABASE_URL from .env.local${NC}"
    else
        echo -e "${YELLOW}Warning: .env.local not found. Using default connection string${NC}"
        export DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    fi
fi

# Convert postgres:// to jdbc:postgresql:// for JDBC compatibility
chmod +x convert-db-url.sh
export DATABASE_URL=$(./convert-db-url.sh "$DATABASE_URL")
echo -e "${GREEN}Converted DATABASE_URL to JDBC format${NC}"

echo -e "${GREEN}Building application...${NC}"
mvn clean package -DskipTests

echo -e "${GREEN}Starting Spring Boot application...${NC}"
java -jar target/rate-my-teacher-api.jar
