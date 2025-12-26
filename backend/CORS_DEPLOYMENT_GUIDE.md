# CORS Configuration Deployment Guide

## Overview
This guide documents the CORS (Cross-Origin Resource Sharing) configuration for the Rate My Teacher Spring Boot backend API. The configuration enables the Next.js frontend to communicate securely with the backend across different origins.

## Configuration Details

### File Location
`/Users/yee/hello-world/backend/src/main/java/com/ratemyteacher/config/CorsConfig.java`

### Current CORS Settings

```java
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "https://hello-world-five-peach.vercel.app",
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "http://localhost:8080"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("Content-Type", "Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
```

### Configuration Parameters Explained

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **Path Pattern** | `/api/**` | Applies CORS to all API endpoints |
| **Allowed Origins** | See below | Specifies which domains can make requests |
| **Allowed Methods** | GET, POST, PUT, DELETE, OPTIONS | HTTP methods permitted from frontend |
| **Allowed Headers** | Content-Type, Authorization | Request headers the frontend can send |
| **Allow Credentials** | true | Allows cookies/authentication headers in requests |
| **Max Age** | 3600 seconds | Browser cache duration for preflight responses |

### Allowed Origins

1. **Production**
   - `https://hello-world-five-peach.vercel.app` - Next.js frontend on Vercel

2. **Development/Local**
   - `http://localhost:3000` - Local Next.js dev server (default Next.js port)
   - `http://localhost:3001` - Alternative local dev port
   - `http://localhost:8080` - Local Spring Boot development server

### HTTP Methods Allowed
- **GET** - Retrieve teacher and review data
- **POST** - Create new teachers and reviews
- **PUT** - Update existing teacher records
- **DELETE** - Remove teachers and reviews
- **OPTIONS** - Required for CORS preflight requests

### Headers Allowed
- **Content-Type** - Specifies JSON request body format
- **Authorization** - For future authentication/JWT token implementation

## Deployment Instructions

### Prerequisites
- Java 17+ (Maven builds with Java 17)
- Maven 3.9+
- Fly.io CLI (`flyctl`) installed and configured
- Git with repository access

### Step 1: Build the Application Locally

```bash
cd /Users/yee/hello-world/backend

# Clean and build with Maven
mvn clean package -DskipTests

# Expected output: BUILD SUCCESS
# Output JAR: target/rate-my-teacher-api.jar
```

**Verification:**
```bash
# Verify JAR was created
ls -lh target/rate-my-teacher-api.jar
```

### Step 2: Test Locally (Optional)

If you want to test the CORS configuration before deploying:

```bash
# Start Spring Boot app locally
java -jar target/rate-my-teacher-api.jar

# In another terminal, test CORS with curl
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/teachers -v

# Look for these response headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
# Access-Control-Allow-Headers: Content-Type,Authorization
```

### Step 3: Deploy to Fly.io

```bash
# From the backend directory
cd /Users/yee/hello-world/backend

# Deploy using Fly.io CLI
fly deploy -a rate-my-teacher-api

# Expected output:
# --> Validating app configuration
# --> Building image with Docker
# --> Pushing image to Fly registry
# --> Starting app
# --> Waiting for deployment to be healthy
```

**Monitor Deployment:**
```bash
# Watch deployment progress
fly status -a rate-my-teacher-api

# View real-time logs
fly logs -a rate-my-teacher-api

# Check resource usage
fly scale show -a rate-my-teacher-api
```

### Step 4: Verify Deployment

After deployment completes, verify CORS is working:

```bash
# Test from production frontend origin
curl -H "Origin: https://hello-world-five-peach.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://rate-my-teacher-api.fly.dev/api/teachers -v

# Check for proper CORS headers in response
```

### Step 5: Test from Frontend

Test API connectivity from your Next.js frontend:

```javascript
// Example API call from Next.js
const response = await fetch('https://rate-my-teacher-api.fly.dev/api/teachers', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' // Include cookies if needed
});

const data = await response.json();
console.log('Teachers:', data);
```

## Architecture Diagram

```
Frontend (Next.js)
├── https://hello-world-five-peach.vercel.app (Production)
├── http://localhost:3000 (Local Dev)
└── http://localhost:3001 (Alternative Local)
        |
        | CORS Preflight (OPTIONS)
        | Request Headers: Content-Type, Authorization
        |
        v
Backend (Spring Boot)
├── https://rate-my-teacher-api.fly.dev (Production)
└── http://localhost:8080 (Local Dev)
        |
        | CORS Response Headers
        | Access-Control-Allow-Origin
        | Access-Control-Allow-Methods
        | Access-Control-Allow-Headers
        |
        v
    API Response
    ├── GET /api/teachers
    ├── POST /api/reviews
    ├── PUT /api/teachers/{id}
    └── DELETE /api/reviews/{id}
```

## CORS Flow Explanation

### Preflight Request (Browser-Initiated)
When the frontend makes a cross-origin request, the browser first sends an OPTIONS request:

```http
OPTIONS /api/teachers HTTP/1.1
Host: rate-my-teacher-api.fly.dev
Origin: https://hello-world-five-peach.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### Preflight Response
The backend responds with CORS headers:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 3600
```

### Actual Request
If preflight succeeds, the browser sends the actual request with CORS headers.

## Troubleshooting

### Issue: CORS error in browser console
```
Access to XMLHttpRequest at 'https://rate-my-teacher-api.fly.dev/api/teachers'
from origin 'https://hello-world-five-peach.vercel.app' has been blocked by CORS policy
```

**Solutions:**
1. Verify origin is in `allowedOrigins` list
2. Check that HTTP methods match `allowedMethods`
3. Ensure headers sent are in `allowedHeaders`
4. Verify backend deployment completed successfully

### Issue: OPTIONS request returns 404
**Cause:** Spring Boot not handling OPTIONS requests properly
**Solution:** The `CorsConfig.java` configuration handles this automatically

### Issue: Missing CORS headers in response
**Cause:** CORS configuration not applied
**Solution:**
```bash
# Rebuild and redeploy
mvn clean package -DskipTests
fly deploy -a rate-my-teacher-api
```

### Issue: Authentication headers being blocked
**Cause:** Authorization header not in allowed headers
**Solution:** Already configured in `allowedHeaders("Content-Type", "Authorization")`

## Security Considerations

### Current Implementation
1. **Explicit Origins:** Uses specific origin URLs instead of wildcards (*)
2. **Method Whitelist:** Only allows necessary HTTP methods
3. **Header Whitelist:** Only allows Content-Type and Authorization
4. **Credentials:** Enabled for authenticated requests (HTTPS enforced in production)

### Production Recommendations
1. **Never use wildcard origins** (`"*"`) in production
2. **Use HTTPS only** - Currently configured with `force_https = true` in fly.toml
3. **Monitor CORS errors** - Check logs for unauthorized origin attempts
4. **Rotate credentials** - Implement token rotation for Authorization header
5. **Rate limiting** - Consider adding rate limiting to API endpoints

### Future Enhancements
1. **Environment-based configuration** - Load allowed origins from environment variables
2. **Dynamic origin validation** - Validate origins against a database/config service
3. **API key authentication** - Implement per-client API key validation
4. **Request signing** - Add request signature validation for sensitive operations

## Performance Impact

- **Preflight requests:** Add ~100-200ms latency on first request (cached for 3600s)
- **Memory footprint:** Negligible (CORS configuration is stateless)
- **CPU usage:** Minimal (header parsing is lightweight)

## Maintenance

### Monitoring CORS Issues
```bash
# Watch for CORS-related errors in logs
fly logs -a rate-my-teacher-api | grep -i cors

# Monitor failed preflight requests
fly logs -a rate-my-teacher-api | grep OPTIONS
```

### Adding New Origins
When adding a new frontend:
1. Update `CorsConfig.java` with new origin URL
2. Rebuild: `mvn clean package -DskipTests`
3. Redeploy: `fly deploy -a rate-my-teacher-api`
4. Test CORS from new origin

### Removing Origins
To remove an origin (e.g., decommissioned service):
1. Edit `CorsConfig.java`
2. Remove origin from `.allowedOrigins()` list
3. Rebuild and redeploy

## References

- [Spring Boot CORS Documentation](https://spring.io/guides/gs/rest-service-cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fly.io Documentation](https://fly.io/docs/)
- [Spring Framework WebMvcConfigurer](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/config/annotation/WebMvcConfigurer.html)

## Rollback Procedure

If issues arise after deployment:

```bash
# View deployment history
fly apps volumes list -a rate-my-teacher-api

# Check previous deployment status
fly status -a rate-my-teacher-api

# Rollback to previous image (if available)
fly releases -a rate-my-teacher-api

# Redeploy specific release
fly releases rollback <release-id> -a rate-my-teacher-api
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Fly.io logs: `fly logs -a rate-my-teacher-api`
3. Test locally first: `mvn spring-boot:run`
4. Verify network connectivity and firewall rules
