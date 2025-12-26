# CORS Configuration - Quick Start Guide

## Overview
This guide provides step-by-step instructions to build and deploy the Spring Boot backend with CORS configuration enabled.

## Prerequisites

Verify you have the following installed:

```bash
# Check Java
java -version
# Should show version 17 or higher

# Check Maven
mvn -v
# Should show Maven 3.9 or higher

# Check Fly CLI
fly version
# Should show flyctl version

# Check Git
git --version
```

If any are missing, install them:
- [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
- [Maven](https://maven.apache.org/install.html)
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
- [Git](https://git-scm.com/download)

## CORS Configuration Summary

The backend has been configured with CORS to allow requests from:

```
Production:
  - https://hello-world-five-peach.vercel.app

Development (Local):
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:8080
```

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers:** Content-Type, Authorization

## Deployment Steps

### Option 1: Quick Deploy (Recommended)

1. Navigate to backend directory:
```bash
cd /Users/yee/hello-world/backend
```

2. Build the application:
```bash
mvn clean package -DskipTests
```

3. Deploy to Fly.io:
```bash
fly deploy -a rate-my-teacher-api
```

4. Monitor deployment:
```bash
fly status -a rate-my-teacher-api
fly logs -a rate-my-teacher-api
```

### Option 2: Using Deployment Script

If you've made the script executable:

```bash
cd /Users/yee/hello-world/backend
./deploy.sh
```

The script will:
- Check prerequisites
- Build the application
- Prompt for confirmation
- Deploy to Fly.io
- Show deployment status

## Local Development

### Start Backend Locally

```bash
cd /Users/yee/hello-world/backend
mvn spring-boot:run
```

Server will start on `http://localhost:8080`

### Test CORS Locally

In another terminal:

```bash
# Test preflight request
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:8080/api/teachers

# Test actual request
curl http://localhost:8080/api/teachers
```

### Start Frontend Locally

```bash
cd /Users/yee/hello-world

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

## Verify Deployment

### Check App Status

```bash
fly status -a rate-my-teacher-api
```

Expected output: "Running" with green status

### Test API Endpoint

```bash
# Test health check
curl https://rate-my-teacher-api.fly.dev/api/health

# Get all teachers
curl https://rate-my-teacher-api.fly.dev/api/teachers
```

### Test CORS Headers

```bash
curl -i -X OPTIONS \
  -H "Origin: https://hello-world-five-peach.vercel.app" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```

Look for response headers:
```
Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

### Test from Frontend

In browser console at `https://hello-world-five-peach.vercel.app`:

```javascript
fetch('https://rate-my-teacher-api.fly.dev/api/teachers')
  .then(r => r.json())
  .then(data => console.log('Success!', data))
  .catch(e => console.error('Error:', e));
```

## API Endpoints

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/{id}` - Get specific teacher
- `GET /api/teachers/search?name=...` - Search teachers
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher

### Reviews
- `GET /api/reviews` - List all reviews
- `GET /api/reviews/{id}` - Get specific review
- `GET /api/reviews/teacher/{teacherId}` - Get reviews for teacher
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/{id}` - Delete review

### Health
- `GET /api/health` - Health check

## Monitoring & Logs

### View Recent Logs

```bash
fly logs -a rate-my-teacher-api
```

### Follow Logs in Real-Time

```bash
fly logs -a rate-my-teacher-api --follow
```

### Search Logs

```bash
# Search for errors
fly logs -a rate-my-teacher-api | grep -i error

# Search for CORS issues
fly logs -a rate-my-teacher-api | grep -i cors
```

## Troubleshooting

### Build Fails

**Error:** `BUILD FAILURE`

```bash
# Try building with verbose output
mvn clean package -DskipTests --verbose

# Check Java version
java -version

# Check Maven has internet access
mvn dependency:tree
```

### Deployment Fails

**Error:** `Deployment failed`

```bash
# Check you're logged in to Fly
fly auth whoami

# View detailed deployment logs
fly logs -a rate-my-teacher-api

# Try redeploying
fly deploy -a rate-my-teacher-api --force-build
```

### CORS Still Not Working

1. Verify origin is in allowed list:
   ```bash
   grep -A 5 "allowedOrigins" src/main/java/com/ratemyteacher/config/CorsConfig.java
   ```

2. Check if CORS config is loaded:
   ```bash
   fly logs -a rate-my-teacher-api | grep -i "corsconfig\|cors"
   ```

3. Test with curl:
   ```bash
   curl -i -H "Origin: https://hello-world-five-peach.vercel.app" \
        https://rate-my-teacher-api.fly.dev/api/teachers
   ```

4. If still failing, rebuild and redeploy:
   ```bash
   mvn clean package -DskipTests
   fly deploy -a rate-my-teacher-api
   ```

## CORS Configuration File

Location: `src/main/java/com/ratemyteacher/config/CorsConfig.java`

To modify CORS settings:

1. Edit the file and update `allowedOrigins()` list
2. Rebuild: `mvn clean package -DskipTests`
3. Redeploy: `fly deploy -a rate-my-teacher-api`

## Environment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| Frontend (Production) | https://hello-world-five-peach.vercel.app | Active |
| Backend (Production) | https://rate-my-teacher-api.fly.dev | Active |
| Backend (Local) | http://localhost:8080 | On demand |
| Frontend (Local) | http://localhost:3000 | On demand |

## Common Commands Cheat Sheet

```bash
# Building
mvn clean package -DskipTests

# Local development
mvn spring-boot:run

# Deployment
fly deploy -a rate-my-teacher-api

# Monitoring
fly status -a rate-my-teacher-api
fly logs -a rate-my-teacher-api
fly scale show -a rate-my-teacher-api

# Testing CORS
curl -H "Origin: https://hello-world-five-peach.vercel.app" \
     https://rate-my-teacher-api.fly.dev/api/teachers

# Database
npm run db:push
npm run db:studio
npm run db:seed
```

## Next Steps

1. **Deploy:** Run `mvn clean package -DskipTests` then `fly deploy -a rate-my-teacher-api`
2. **Verify:** Test endpoint with `curl` or browser
3. **Monitor:** Watch logs with `fly logs -a rate-my-teacher-api`
4. **Test:** Try making API calls from frontend
5. **Troubleshoot:** Refer to troubleshooting section if issues arise

## Documentation

- `CORS_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `CORS_IMPLEMENTATION_DETAILS.md` - Technical implementation details
- `test-cors.sh` - CORS testing script

## Support

For issues:
1. Check the Troubleshooting section above
2. Review `fly logs -a rate-my-teacher-api`
3. Test locally first before redeploying
4. Verify all prerequisites are installed

---

**Status:** CORS configuration ready for deployment
**Last Updated:** 2025-12-25
