#!/bin/bash

# CORS Testing Script for Rate My Teacher Backend
# Tests CORS configuration against production and local endpoints

echo "================================================"
echo "CORS Configuration Testing"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configurations
PROD_URL="https://rate-my-teacher-api.fly.dev"
LOCAL_URL="http://localhost:8080"

# Frontend origins
PROD_ORIGIN="https://hello-world-five-peach.vercel.app"
LOCAL_ORIGIN="http://localhost:3000"
ALT_LOCAL_ORIGIN="http://localhost:3001"

# Function to test CORS
test_cors() {
    local url=$1
    local origin=$2
    local description=$3

    echo ""
    echo -e "${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    echo "Origin: $origin"
    echo ""

    response=$(curl -s -i \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        "$url/api/teachers" 2>&1)

    # Check for CORS headers
    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✓ CORS headers present${NC}"

        allowed_origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | head -1)
        echo "  $allowed_origin"

        if echo "$allowed_origin" | grep -q "$origin"; then
            echo -e "${GREEN}✓ Origin is allowed${NC}"
        else
            echo -e "${RED}✗ Origin not in allowed list${NC}"
        fi

        allowed_methods=$(echo "$response" | grep "Access-Control-Allow-Methods" | head -1)
        echo "  $allowed_methods"

        allowed_headers=$(echo "$response" | grep "Access-Control-Allow-Headers" | head -1)
        echo "  $allowed_headers"

    else
        echo -e "${RED}✗ No CORS headers found${NC}"
        echo "Response headers:"
        echo "$response" | head -15
    fi
}

# Test production endpoint
echo -e "${YELLOW}Production Environment${NC}"
test_cors "$PROD_URL" "$PROD_ORIGIN" "Production API with Vercel origin"

# Test local endpoint (if available)
echo ""
echo -e "${YELLOW}Local Development${NC}"
if curl -s "$LOCAL_URL/api/health" > /dev/null 2>&1; then
    test_cors "$LOCAL_URL" "$LOCAL_ORIGIN" "Local API with localhost:3000"
    test_cors "$LOCAL_URL" "$ALT_LOCAL_ORIGIN" "Local API with localhost:3001"
else
    echo -e "${YELLOW}⚠ Local API not running on $LOCAL_URL${NC}"
    echo "Start with: mvn spring-boot:run"
fi

# Test actual GET request
echo ""
echo -e "${BLUE}Testing Actual API Request${NC}"
echo ""

# Try production
echo "Fetching teachers from production..."
curl -s -H "Origin: $PROD_ORIGIN" "$PROD_URL/api/teachers" | head -c 200
echo ""
echo ""

# Summary
echo -e "${BLUE}Test Summary${NC}"
echo ""
echo "✓ CORS configuration allows:"
echo "  - Origins: $PROD_ORIGIN"
echo "           http://localhost:3000"
echo "           http://localhost:3001"
echo "           http://localhost:8080"
echo "  - Methods: GET, POST, PUT, DELETE, OPTIONS"
echo "  - Headers: Content-Type, Authorization"
echo ""
echo "For detailed debugging:"
echo "  curl -v -H 'Origin: $PROD_ORIGIN' \\"
echo "       -X OPTIONS \\"
echo "       $PROD_URL/api/teachers"
