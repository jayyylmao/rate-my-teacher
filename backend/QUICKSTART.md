# Quick Start Guide

Get the Rate My Teacher API up and running in minutes!

## Prerequisites

- Java 17+ installed (`java -version`)
- Maven 3.6+ installed (`mvn -version`)
- PostgreSQL database connection string

## Option 1: Run with Maven (Recommended for Development)

```bash
# Navigate to backend directory
cd backend

# Set database connection
export DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Option 2: Run with Script

```bash
cd backend
./run-local.sh
```

This script automatically loads the DATABASE_URL from `../.env.local`

## Option 3: Build and Run JAR

```bash
cd backend

# Build
mvn clean package -DskipTests

# Run
export DATABASE_URL="your-database-url"
java -jar target/rate-my-teacher-api.jar
```

## Test the API

### Quick Test
```bash
# Check health
curl http://localhost:8080/api/health

# Get all teachers
curl http://localhost:8080/api/teachers
```

### Comprehensive Test
```bash
# Run full test suite (requires jq)
./test-api.sh http://localhost:8080
```

## Create Sample Data

### Create a Teacher
```bash
curl -X POST http://localhost:8080/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "subject": "Mathematics",
    "department": "Science"
  }'
```

### Create a Review
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": 1,
    "rating": 5,
    "comment": "Great teacher!",
    "reviewerName": "Jane Doe"
  }'
```

## Deploy to Fly.io

### First Time Setup

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login:
```bash
flyctl auth login
```

3. Deploy:
```bash
cd backend
./deploy.sh
```

### Update Deployment

```bash
cd backend
flyctl deploy
```

## Troubleshooting

### Port Already in Use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Database Connection Failed
1. Verify DATABASE_URL is set correctly
2. Check network connectivity to database
3. Ensure database credentials are valid

### Maven Build Failed
```bash
# Clean and rebuild
mvn clean install

# Update dependencies
mvn dependency:purge-local-repository
```

## Next Steps

1. View API documentation: See `README.md` for all endpoints
2. Test with Postman/Insomnia using the examples
3. Connect your Next.js frontend to `http://localhost:8080`
4. Deploy to production with `./deploy.sh`

## Useful Commands

```bash
# Check application logs
tail -f logs/spring.log

# View Fly.io logs (after deployment)
flyctl logs

# Check Fly.io status
flyctl status

# SSH into Fly.io app
flyctl ssh console

# Scale Fly.io app
flyctl scale count 2
```
