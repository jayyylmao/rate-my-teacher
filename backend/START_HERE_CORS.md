# START HERE - CORS Configuration for Rate My Teacher Backend

Welcome! This file will guide you through the CORS configuration setup and deployment process.

## What Was Done

CORS (Cross-Origin Resource Sharing) has been configured in your Spring Boot backend to allow your Next.js frontend to communicate securely across different origins.

### In 30 Seconds

The backend now allows requests from:
- **Production:** `https://hello-world-five-peach.vercel.app`
- **Development:** `http://localhost:3000`, `http://localhost:3001`, `http://localhost:8080`

The configuration is in: `src/main/java/com/ratemyteacher/config/CorsConfig.java`

## What You Need To Do

### Option A: Fast Deploy (5 minutes)

```bash
cd /Users/yee/hello-world/backend
mvn clean package -DskipTests
fly deploy -a rate-my-teacher-api
```

Then verify:
```bash
fly status -a rate-my-teacher-api
```

### Option B: Guided Deploy (10 minutes)

Follow the **QUICK_START.md** document for step-by-step instructions with explanations.

### Option C: Automated Deploy (1 minute)

```bash
cd /Users/yee/hello-world/backend
bash deploy.sh
```

## Quick Navigation

### I Want To...

#### Deploy Now
1. Run the 5-minute quick deploy above
2. Or read `QUICK_START.md` for detailed steps

#### Understand What Changed
1. Read `CORS_SETUP_SUMMARY.md` for overview
2. Read `CORS_IMPLEMENTATION_DETAILS.md` for technical details

#### Verify It Works
```bash
# Test CORS headers
curl -i -H "Origin: https://hello-world-five-peach.vercel.app" \
     https://rate-my-teacher-api.fly.dev/api/teachers

# Or run the test script
bash test-cors.sh
```

#### Troubleshoot Issues
1. Check `CORS_DEPLOYMENT_GUIDE.md` - Troubleshooting section
2. Check logs: `fly logs -a rate-my-teacher-api`
3. Check status: `fly status -a rate-my-teacher-api`

#### Monitor Deployment
```bash
fly logs -a rate-my-teacher-api --follow
```

## Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICK_START.md** | Fast deployment guide | 5 min |
| **CORS_SETUP_SUMMARY.md** | Configuration overview | 10 min |
| **CORS_DEPLOYMENT_GUIDE.md** | Detailed deployment | 15 min |
| **CORS_IMPLEMENTATION_DETAILS.md** | Technical deep-dive | 20 min |
| **DEPLOYMENT_CHECKLIST.md** | Verification checklist | 5 min |
| **CORS_CONFIGURATION_COMPLETE.md** | Final summary | 10 min |

## Key Files Changed

### Modified
- `src/main/java/com/ratemyteacher/config/CorsConfig.java` - CORS configuration updated

### Created (Documentation)
- `CORS_SETUP_SUMMARY.md`
- `CORS_DEPLOYMENT_GUIDE.md`
- `CORS_IMPLEMENTATION_DETAILS.md`
- `QUICK_START.md`
- `DEPLOYMENT_CHECKLIST.md`
- `CORS_CONFIGURATION_COMPLETE.md`

### Created (Scripts)
- `deploy.sh` - Automated deployment
- `test-cors.sh` - CORS testing

## CORS Configuration

### What's Allowed

**Origins:**
```
https://hello-world-five-peach.vercel.app    (Production)
http://localhost:3000                         (Development)
http://localhost:3001                         (Development)
http://localhost:8080                         (Development)
```

**Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Headers:**
```
Content-Type, Authorization
```

### Why These Settings?

- **Explicit origins:** More secure than wildcards
- **All HTTP methods:** Full REST API support
- **Specific headers:** Only what the API needs
- **Credentials enabled:** Support for authentication
- **1-hour cache:** Performance optimization

## Deployment Checklist

Before deploying, ensure:

- [ ] Java 17+ installed: `java -version`
- [ ] Maven installed: `mvn -v`
- [ ] Fly CLI installed: `fly version`
- [ ] Logged in to Fly: `fly auth whoami`
- [ ] You've read at least the overview

## Deployment Steps

### Step 1: Build (2 minutes)
```bash
cd /Users/yee/hello-world/backend
mvn clean package -DskipTests
```

**Expected output:** `BUILD SUCCESS`

### Step 2: Deploy (8 minutes)
```bash
fly deploy -a rate-my-teacher-api
```

**Expected output:** App runs and is healthy

### Step 3: Verify (1 minute)
```bash
# Check status
fly status -a rate-my-teacher-api

# Test health
curl https://rate-my-teacher-api.fly.dev/api/health

# Test CORS
curl -i -H "Origin: https://hello-world-five-peach.vercel.app" \
     https://rate-my-teacher-api.fly.dev/api/teachers
```

**Expected output:** 200 OK responses with CORS headers

### Step 4: Test from Frontend (2 minutes)

Visit: `https://hello-world-five-peach.vercel.app`

Open browser console (F12) and run:
```javascript
fetch('https://rate-my-teacher-api.fly.dev/api/teachers')
  .then(r => r.json())
  .then(d => console.log('Success!', d))
  .catch(e => console.error('Error:', e));
```

**Expected:** No CORS error, data returned

## API Endpoints

All `/api/**` endpoints now support CORS:

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/{id}` - Get specific teacher
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/{id}` - Get specific review
- `DELETE /api/reviews/{id}` - Delete review
- `GET /api/reviews/teacher/{teacherId}` - Get reviews for teacher

### Health
- `GET /api/health` - Health check

## Common Commands

```bash
# Build
mvn clean package -DskipTests

# Deploy
fly deploy -a rate-my-teacher-api

# Status
fly status -a rate-my-teacher-api

# Logs
fly logs -a rate-my-teacher-api
fly logs -a rate-my-teacher-api --follow

# Test
curl https://rate-my-teacher-api.fly.dev/api/health
bash test-cors.sh
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | https://hello-world-five-peach.vercel.app |
| Backend API | https://rate-my-teacher-api.fly.dev |
| Health Check | https://rate-my-teacher-api.fly.dev/api/health |

## Local Development

### Start Backend Locally
```bash
cd /Users/yee/hello-world/backend
mvn spring-boot:run
```

Server: `http://localhost:8080`

### Start Frontend Locally
```bash
cd /Users/yee/hello-world
npm run dev
```

Server: `http://localhost:3000`

### Test CORS Locally
```bash
curl -i -H "Origin: http://localhost:3000" \
     http://localhost:8080/api/teachers
```

## Troubleshooting

### "BUILD FAILURE"
```bash
# Check Java version
java -version  # Should be 17+

# Try clean rebuild
mvn clean dependency:resolve
mvn clean package -DskipTests
```

### "Deployment failed"
```bash
# Verify Fly login
fly auth whoami

# Check app exists
fly apps list

# Try force rebuild
fly deploy -a rate-my-teacher-api --force-build
```

### "CORS error in browser"
```bash
# Test CORS headers
curl -i -H "Origin: https://hello-world-five-peach.vercel.app" \
     https://rate-my-teacher-api.fly.dev/api/teachers

# Check logs
fly logs -a rate-my-teacher-api | grep -i cors

# Verify config file
cat src/main/java/com/ratemyteacher/config/CorsConfig.java
```

## Reading Guide

### If You Have 5 Minutes
Read: `QUICK_START.md`

### If You Have 10 Minutes
Read: `CORS_SETUP_SUMMARY.md`

### If You Have 15 Minutes
Read: `CORS_DEPLOYMENT_GUIDE.md`

### If You Have 30 Minutes
Read: `CORS_IMPLEMENTATION_DETAILS.md`

### If You Need To Verify
Use: `DEPLOYMENT_CHECKLIST.md`

## Next Steps

### Now (Today)
1. [ ] Run: `mvn clean package -DskipTests`
2. [ ] Run: `fly deploy -a rate-my-teacher-api`
3. [ ] Wait for deployment (5-10 minutes)
4. [ ] Verify: `fly status -a rate-my-teacher-api`
5. [ ] Test: `curl https://rate-my-teacher-api.fly.dev/api/health`

### Soon (This Week)
1. [ ] Test from frontend
2. [ ] Monitor logs
3. [ ] Perform load testing if needed
4. [ ] Get team feedback

### Later (This Month)
1. [ ] Implement monitoring/alerts
2. [ ] Add rate limiting if needed
3. [ ] Optimize performance
4. [ ] Security hardening review

## Questions?

### What is CORS?
Cross-Origin Resource Sharing. It allows the frontend (different domain/port) to make requests to the backend.

### Why do I need it?
The frontend and backend are on different domains. Without CORS, browser security blocks their communication.

### Is it secure?
Yes. This configuration uses explicit origin whitelisting, making it more secure than wildcard approaches.

### Can I add more origins?
Yes. Edit `CorsConfig.java`, add origin to `allowedOrigins()` list, rebuild, and redeploy.

### What if something goes wrong?
Check the Troubleshooting section above or refer to `CORS_DEPLOYMENT_GUIDE.md`.

## File Structure

```
backend/
├── src/main/java/com/ratemyteacher/config/
│   └── CorsConfig.java                    (CORS configuration)
├── pom.xml                                (Build config)
├── fly.toml                               (Deploy config)
├── Dockerfile                             (Docker build)
│
├── QUICK_START.md                         (Start here for fast deploy)
├── CORS_SETUP_SUMMARY.md                  (Overview)
├── CORS_DEPLOYMENT_GUIDE.md               (Detailed guide)
├── CORS_IMPLEMENTATION_DETAILS.md         (Technical details)
├── DEPLOYMENT_CHECKLIST.md                (Verification)
├── CORS_CONFIGURATION_COMPLETE.md         (Final summary)
├── START_HERE_CORS.md                     (This file)
│
├── deploy.sh                              (Automated deployment)
└── test-cors.sh                           (CORS testing)
```

## Status

- [x] CORS configuration implemented
- [x] Configuration verified
- [x] Documentation complete
- [x] Automation scripts created
- [ ] Ready to deploy (you are here!)
- [ ] Deployment complete (next step)

## Ready?

### Quick Deploy
```bash
cd /Users/yee/hello-world/backend
mvn clean package -DskipTests && fly deploy -a rate-my-teacher-api
```

### Detailed Deploy
Read: `QUICK_START.md`

### Need Help?
Check: `CORS_DEPLOYMENT_GUIDE.md`

---

**Status:** Ready for Production Deployment
**Last Updated:** December 25, 2025
**Configuration Version:** 1.0.0

**Next Action:** Choose Option A, B, or C above and execute deployment.
