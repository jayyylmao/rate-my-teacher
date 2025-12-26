# CORS Configuration Deployment Checklist

Use this checklist to ensure proper deployment and verification of CORS configuration.

## Pre-Deployment Checklist

### Environment & Prerequisites
- [ ] Java 17+ installed: `java -version`
- [ ] Maven 3.9+ installed: `mvn -v`
- [ ] Fly CLI installed: `fly version`
- [ ] Git installed: `git --version`
- [ ] Logged in to Fly: `fly auth whoami`
- [ ] Database URL set in environment (if needed)

### Code Changes Verified
- [ ] CORS configuration file exists: `src/main/java/com/ratemyteacher/config/CorsConfig.java`
- [ ] Configuration contains correct origins:
  - [ ] `https://hello-world-five-peach.vercel.app`
  - [ ] `http://localhost:3000`
  - [ ] `http://localhost:3001`
  - [ ] `http://localhost:8080`
- [ ] Allowed methods include: GET, POST, PUT, DELETE, OPTIONS
- [ ] Allowed headers include: Content-Type, Authorization
- [ ] Credentials set to: true
- [ ] Path pattern set to: `/api/**`
- [ ] Max age set to: 3600

### Project Structure
- [ ] `pom.xml` exists with correct dependencies
- [ ] `Dockerfile` exists for containerization
- [ ] `fly.toml` exists with correct configuration
- [ ] Health check endpoint configured: `/api/health`

## Build Checklist

### Clean Build
- [ ] Navigate to backend: `cd /Users/yee/hello-world/backend`
- [ ] Run clean: `mvn clean`
- [ ] Build with tests skipped: `mvn package -DskipTests`

### Build Verification
- [ ] Build completes with "BUILD SUCCESS"
- [ ] JAR file created: `target/rate-my-teacher-api.jar`
- [ ] JAR size reasonable (50-100MB typical)
- [ ] No compilation errors or warnings

### Local Testing (Optional but Recommended)
- [ ] Start app locally: `mvn spring-boot:run`
- [ ] App starts on port 8080
- [ ] Health check works: `curl http://localhost:8080/api/health`
- [ ] API responds: `curl http://localhost:8080/api/teachers`
- [ ] Test CORS locally (see test section below)

## Deployment Checklist

### Pre-Deployment Verification
- [ ] Fly app name confirmed: `rate-my-teacher-api`
- [ ] Region confirmed: `ewr` (New Jersey)
- [ ] No uncommitted changes breaking build
- [ ] Database connection string available
- [ ] All environment variables set

### Deployment Execution
- [ ] Run: `fly deploy -a rate-my-teacher-api`
- [ ] Deployment starts building image
- [ ] Image builds successfully
- [ ] Image pushed to Fly registry
- [ ] App starts running
- [ ] Deployment completes without errors
- [ ] No "Error" messages in deployment output

### Deployment Wait Time
- [ ] Allow 5-10 minutes for deployment
- [ ] Wait for "Running" status
- [ ] Monitor logs for startup errors

## Post-Deployment Verification

### Status Check
- [ ] Run: `fly status -a rate-my-teacher-api`
- [ ] Status shows: "Running"
- [ ] Health shows: "Healthy"
- [ ] No error messages

### Health Endpoint
```bash
curl https://rate-my-teacher-api.fly.dev/api/health
```
- [ ] Returns 200 OK
- [ ] Response is valid JSON
- [ ] Contains health status information

### API Endpoint
```bash
curl https://rate-my-teacher-api.fly.dev/api/teachers
```
- [ ] Returns 200 OK
- [ ] Response is valid JSON array
- [ ] Contains teacher data or empty array

### CORS Headers - Production Origin
```bash
curl -i -X OPTIONS \
  -H "Origin: https://hello-world-five-peach.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```
- [ ] Returns 200 OK
- [ ] Includes header: `Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app`
- [ ] Includes header: `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- [ ] Includes header: `Access-Control-Allow-Headers: Content-Type,Authorization`
- [ ] Includes header: `Access-Control-Allow-Credentials: true`
- [ ] Includes header: `Access-Control-Max-Age: 3600`

### CORS Headers - Local Development
```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```
- [ ] Returns 200 OK
- [ ] Includes header: `Access-Control-Allow-Origin: http://localhost:3000`

### CORS Headers - Alternative Local Port
```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```
- [ ] Returns 200 OK
- [ ] Includes header: `Access-Control-Allow-Origin: http://localhost:3001`

### API Methods Testing
- [ ] GET request works
- [ ] POST request works
- [ ] PUT request works
- [ ] DELETE request works
- [ ] OPTIONS request works

### Logs Review
```bash
fly logs -a rate-my-teacher-api
```
- [ ] No ERROR messages
- [ ] No CORS-related warnings
- [ ] App started successfully
- [ ] Requests are being processed
- [ ] Database connection successful

## Frontend Verification

### From Production Frontend
Visit: `https://hello-world-five-peach.vercel.app`

In browser console (F12):
```javascript
fetch('https://rate-my-teacher-api.fly.dev/api/teachers')
  .then(r => r.json())
  .then(d => console.log('Success!', d))
  .catch(e => console.error('Error:', e));
```

- [ ] No CORS error messages
- [ ] API responds with data
- [ ] Console shows "Success!"
- [ ] Data displayed correctly in UI

### Local Frontend Test
```bash
cd /Users/yee/hello-world
npm run dev
```

Visit: `http://localhost:3000`

In browser console:
```javascript
fetch('https://rate-my-teacher-api.fly.dev/api/teachers')
  .then(r => r.json())
  .then(d => console.log('Teachers:', d))
  .catch(e => console.error('Error:', e));
```

- [ ] No CORS error messages
- [ ] API responds with data
- [ ] Data is accessible from frontend

### Functionality Testing
- [ ] Can view list of teachers
- [ ] Can create new teacher
- [ ] Can view teacher details
- [ ] Can create review
- [ ] Can delete review
- [ ] Can update teacher info
- [ ] Can search teachers

## Monitoring & Logging

### Log Monitoring
- [ ] Monitor logs: `fly logs -a rate-my-teacher-api`
- [ ] Watch logs: `fly logs -a rate-my-teacher-api --follow`

### Specific Log Checks
- [ ] Check for CORS errors: `fly logs -a rate-my-teacher-api | grep -i cors`
- [ ] Check for OPTIONS requests: `fly logs -a rate-my-teacher-api | grep OPTIONS`
- [ ] Check for errors: `fly logs -a rate-my-teacher-api | grep ERROR`
- [ ] Check for warnings: `fly logs -a rate-my-teacher-api | grep WARN`

### Performance Check
- [ ] Response times reasonable (<500ms)
- [ ] No timeout errors
- [ ] No database connection errors
- [ ] CPU and memory usage normal

## Troubleshooting Verification

### If Build Fails
- [ ] Check Java version is 17+
- [ ] Check Maven has internet access
- [ ] Try: `mvn clean dependency:resolve`
- [ ] Review build output for specific errors
- [ ] Check no typos in pom.xml

### If Deployment Fails
- [ ] Check logged in to Fly: `fly auth whoami`
- [ ] Check Fly organization: `fly orgs list`
- [ ] Check app exists: `fly apps list`
- [ ] Try: `fly deploy -a rate-my-teacher-api --force-build`
- [ ] Review deployment logs for errors

### If CORS Not Working
- [ ] Verify origin is in allowed list
- [ ] Verify endpoint path starts with `/api/`
- [ ] Check HTTP method is allowed
- [ ] Check headers are in allowed list
- [ ] Rebuild and redeploy
- [ ] Clear browser cache

### If API Slow
- [ ] Check server logs for errors
- [ ] Monitor CPU usage: `fly scale show`
- [ ] Check database connection
- [ ] Test with curl for baseline
- [ ] Review query performance

## Documentation Verification

- [ ] CORS_SETUP_SUMMARY.md created and complete
- [ ] CORS_DEPLOYMENT_GUIDE.md created and complete
- [ ] CORS_IMPLEMENTATION_DETAILS.md created and complete
- [ ] QUICK_START.md created and complete
- [ ] deploy.sh script created
- [ ] test-cors.sh script created
- [ ] DEPLOYMENT_CHECKLIST.md (this file) complete

## Sign-Off

### Deployment Complete
- [ ] All pre-deployment checks passed
- [ ] Build successful
- [ ] Deployment successful
- [ ] Post-deployment verification passed
- [ ] Frontend working correctly
- [ ] Monitoring in place

### Known Issues (if any)
- [ ] Document any known issues
- [ ] Create follow-up tasks if needed
- [ ] Plan mitigation if necessary

## Next Steps After Deployment

### Immediate (Today)
- [ ] Monitor logs for 30 minutes
- [ ] Test all main features
- [ ] Get team feedback
- [ ] Document any issues found

### Short-term (This Week)
- [ ] Load testing
- [ ] Performance optimization if needed
- [ ] Security review
- [ ] User acceptance testing

### Medium-term (This Month)
- [ ] Add monitoring/alerts
- [ ] Implement rate limiting
- [ ] Add detailed logging
- [ ] Security hardening

## Team Communication

### Notify Team
- [ ] CORS configuration deployed
- [ ] API available at: `https://rate-my-teacher-api.fly.dev`
- [ ] All endpoints working correctly
- [ ] Frontend can now make cross-origin requests

### Share Resources
- [ ] Share QUICK_START.md with team
- [ ] Share CORS_DEPLOYMENT_GUIDE.md for reference
- [ ] Provide API documentation
- [ ] Document any team-specific setup

## Rollback Plan

If issues arise:
```bash
# View releases
fly releases -a rate-my-teacher-api

# Rollback to previous version
fly releases rollback <release-id> -a rate-my-teacher-api

# Verify rollback
fly status -a rate-my-teacher-api
```

- [ ] Rollback procedure documented
- [ ] Previous release ID noted
- [ ] Rollback tested (don't actually rollback)

## Final Verification

**All items checked?** If yes, deployment is complete and verified.

**Date Deployed:** _____________
**Deployed By:** _____________
**Verified By:** _____________
**Notes:**

---

## Quick Reference

### Key URLs
- Frontend: https://hello-world-five-peach.vercel.app
- API: https://rate-my-teacher-api.fly.dev
- Health: https://rate-my-teacher-api.fly.dev/api/health

### Key Commands
```bash
mvn clean package -DskipTests          # Build
fly deploy -a rate-my-teacher-api      # Deploy
fly status -a rate-my-teacher-api      # Status
fly logs -a rate-my-teacher-api        # Logs
fly logs -a rate-my-teacher-api --follow  # Live logs
```

### Key Files
- Configuration: `/Users/yee/hello-world/backend/src/main/java/com/ratemyteacher/config/CorsConfig.java`
- Build: `/Users/yee/hello-world/backend/pom.xml`
- Deploy: `/Users/yee/hello-world/backend/fly.toml`
- Output: `/Users/yee/hello-world/backend/target/rate-my-teacher-api.jar`

---

**Checklist Version:** 1.0
**Last Updated:** December 25, 2025
**Status:** Ready for deployment
