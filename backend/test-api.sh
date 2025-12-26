#!/bin/bash

# API Testing Script
# Tests all endpoints of the Rate My Teacher API

set -e

# Configuration
API_URL="${1:-http://localhost:8080}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Rate My Teacher API at: $API_URL${NC}\n"

# Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
curl -s "$API_URL/api/health" | jq '.'
echo -e "\n"

# Get All Teachers
echo -e "${YELLOW}2. Getting all teachers...${NC}"
curl -s "$API_URL/api/teachers" | jq '.'
echo -e "\n"

# Create a Teacher
echo -e "${YELLOW}3. Creating a new teacher...${NC}"
TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/api/teachers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "subject": "Computer Science",
    "department": "Engineering"
  }')
echo "$TEACHER_RESPONSE" | jq '.'
TEACHER_ID=$(echo "$TEACHER_RESPONSE" | jq -r '.id')
echo -e "${GREEN}Created teacher with ID: $TEACHER_ID${NC}\n"

# Get Teacher by ID
echo -e "${YELLOW}4. Getting teacher by ID: $TEACHER_ID...${NC}"
curl -s "$API_URL/api/teachers/$TEACHER_ID" | jq '.'
echo -e "\n"

# Search Teachers
echo -e "${YELLOW}5. Searching teachers by name 'Jane'...${NC}"
curl -s "$API_URL/api/teachers/search?name=Jane" | jq '.'
echo -e "\n"

# Create a Review
echo -e "${YELLOW}6. Creating a review for teacher $TEACHER_ID...${NC}"
REVIEW_RESPONSE=$(curl -s -X POST "$API_URL/api/reviews" \
  -H "Content-Type: application/json" \
  -d "{
    \"teacherId\": $TEACHER_ID,
    \"rating\": 5,
    \"comment\": \"Excellent professor! Very clear explanations and always available for help.\",
    \"reviewerName\": \"John Doe\"
  }")
echo "$REVIEW_RESPONSE" | jq '.'
REVIEW_ID=$(echo "$REVIEW_RESPONSE" | jq -r '.id')
echo -e "${GREEN}Created review with ID: $REVIEW_ID${NC}\n"

# Get Reviews for Teacher
echo -e "${YELLOW}7. Getting reviews for teacher $TEACHER_ID...${NC}"
curl -s "$API_URL/api/reviews/teacher/$TEACHER_ID" | jq '.'
echo -e "\n"

# Get All Reviews
echo -e "${YELLOW}8. Getting all reviews...${NC}"
curl -s "$API_URL/api/reviews" | jq '.'
echo -e "\n"

# Get Teacher with Reviews
echo -e "${YELLOW}9. Getting teacher $TEACHER_ID with reviews...${NC}"
curl -s "$API_URL/api/teachers/$TEACHER_ID" | jq '.'
echo -e "\n"

# Get Average Rating
echo -e "${YELLOW}10. Getting average rating for teacher $TEACHER_ID...${NC}"
curl -s "$API_URL/api/teachers/$TEACHER_ID/average-rating" | jq '.'
echo -e "\n"

# Update Teacher
echo -e "${YELLOW}11. Updating teacher $TEACHER_ID...${NC}"
curl -s -X PUT "$API_URL/api/teachers/$TEACHER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith-Johnson",
    "subject": "Advanced Computer Science",
    "department": "Engineering"
  }' | jq '.'
echo -e "\n"

# Filter by Department
echo -e "${YELLOW}12. Filtering teachers by department 'Engineering'...${NC}"
curl -s "$API_URL/api/teachers?department=Engineering" | jq '.'
echo -e "\n"

# Test Validation Error
echo -e "${YELLOW}13. Testing validation error (invalid rating)...${NC}"
curl -s -X POST "$API_URL/api/reviews" \
  -H "Content-Type: application/json" \
  -d "{
    \"teacherId\": $TEACHER_ID,
    \"rating\": 10,
    \"comment\": \"Too high!\",
    \"reviewerName\": \"Test User\"
  }" | jq '.'
echo -e "\n"

# Delete Review
echo -e "${YELLOW}14. Deleting review $REVIEW_ID...${NC}"
curl -s -X DELETE "$API_URL/api/reviews/$REVIEW_ID" -w "\nHTTP Status: %{http_code}\n"
echo -e "\n"

# Delete Teacher
echo -e "${YELLOW}15. Deleting teacher $TEACHER_ID...${NC}"
curl -s -X DELETE "$API_URL/api/teachers/$TEACHER_ID" -w "\nHTTP Status: %{http_code}\n"
echo -e "\n"

# Test 404 Error
echo -e "${YELLOW}16. Testing 404 error (non-existent teacher)...${NC}"
curl -s "$API_URL/api/teachers/99999" | jq '.'
echo -e "\n"

echo -e "${GREEN}All tests completed!${NC}"
