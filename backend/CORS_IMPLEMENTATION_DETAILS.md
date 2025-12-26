# CORS Implementation Details

## Executive Summary

CORS (Cross-Origin Resource Sharing) configuration has been implemented in the Rate My Teacher Spring Boot backend to allow the Next.js frontend to communicate securely across different origins. The implementation uses Spring Framework's built-in CORS support with explicit origin whitelisting for production security.

## Technical Architecture

### Implementation File
**Location:** `/Users/yee/hello-world/backend/src/main/java/com/ratemyteacher/config/CorsConfig.java`

### Configuration Class Structure

```java
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // CORS mapping configuration
            }
        };
    }
}
```

### Key Components

1. **@Configuration Annotation**
   - Marks class as Spring configuration
   - Enables bean detection and auto-wiring
   - Loaded automatically on application startup

2. **@Bean Annotation**
   - Declares corsConfigurer() as a Spring Bean
   - Creates singleton instance managed by Spring Container
   - Injected into Spring MVC dispatcher servlet

3. **WebMvcConfigurer Interface**
   - Provides callback methods for customizing Spring MVC
   - addCorsMappings() method overridden for CORS setup
   - Non-invasive approach to configuration

## CORS Configuration Details

### Path Pattern Mapping

```java
registry.addMapping("/api/**")
```

- **Pattern:** `/api/**` - Matches all API endpoints
- **Scope:** Only applies to REST API routes
- **Exception:** Static resources (CSS, JS, images) not affected
- **Flexibility:** Can add multiple mappings for different patterns

### Allowed Origins Configuration

```java
.allowedOrigins(
    "https://hello-world-five-peach.vercel.app",  // Production frontend
    "http://localhost:3000",                       // Default Next.js dev
    "http://localhost:3001",                       // Alternative local port
    "http://localhost:8080"                        // Spring Boot dev
)
```

#### Origin Details

| Origin | Purpose | Environment |
|--------|---------|-------------|
| `https://hello-world-five-peach.vercel.app` | Next.js frontend on Vercel | Production |
| `http://localhost:3000` | Default Next.js development port | Development |
| `http://localhost:3001` | Alternative development port | Development |
| `http://localhost:8080` | Spring Boot development server | Development |

#### Why Explicit Origins?

1. **Security:** Prevents unauthorized domains from accessing API
2. **Specificity:** Avoids wildcard vulnerabilities
3. **Control:** Easy to audit and manage allowed domains
4. **Compliance:** Meets security best practices
5. **Monitoring:** Can track requests from unexpected origins

### HTTP Methods Configuration

```java
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

#### Method Mapping to Operations

| Method | Purpose | Use Case |
|--------|---------|----------|
| GET | Retrieve data | Fetch teachers, reviews, ratings |
| POST | Create resources | Submit new reviews, add teachers |
| PUT | Update resources | Modify teacher information |
| DELETE | Remove resources | Delete reviews, remove teachers |
| OPTIONS | CORS preflight | Browser-initiated automatic request |

### Headers Configuration

```java
.allowedHeaders("Content-Type", "Authorization")
```

#### Header Details

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Specifies request body format | `application/json` |
| `Authorization` | Carries authentication credentials | `Bearer <jwt_token>` |

### Credentials Configuration

```java
.allowCredentials(true)
```

**Implications:**
- Allows requests with credentials (cookies, authorization headers)
- Requires specific origin (cannot use wildcard *)
- Browser includes credentials in cross-origin requests
- Backend responds with `Access-Control-Allow-Credentials: true`

### Max Age Configuration

```java
.maxAge(3600)
```

**Performance Impact:**
- Caches preflight response for 3600 seconds (1 hour)
- Subsequent requests within 1 hour skip OPTIONS preflight
- Reduces latency on repeated API calls
- Trade-off: Updates require cache invalidation

## CORS Request/Response Flow

### Step 1: Browser Preflight Request

When frontend makes a cross-origin POST request:

```http
OPTIONS /api/teachers HTTP/1.1
Host: rate-my-teacher-api.fly.dev
Origin: https://hello-world-five-peach.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
Connection: keep-alive
```

**Browser Behavior:**
- Automatically sends OPTIONS request
- Checks if origin is allowed
- Validates allowed methods and headers
- User's actual request on hold until approval

### Step 2: Server Preflight Response

Backend responds with CORS headers:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 3600
Content-Length: 0
```

**Server Response Details:**
- Specific origin echoed back (not wildcard)
- Lists all allowed methods
- Lists all allowed headers
- Cache duration specified

### Step 3: Browser Validation

Browser checks response:
- ✓ Origin matches request origin
- ✓ Method is in allowed methods
- ✓ Headers are in allowed headers
- → Preflight passes, actual request proceeds

### Step 4: Actual Request

Browser sends the real request:

```http
POST /api/teachers HTTP/1.1
Host: rate-my-teacher-api.fly.dev
Origin: https://hello-world-five-peach.vercel.app
Content-Type: application/json
Content-Length: 142

{
  "name": "Dr. Smith",
  "subject": "Mathematics",
  "department": "STEM"
}
```

### Step 5: Actual Response

Backend processes request and responds:

```http
HTTP/1.1 201 Created
Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app
Content-Type: application/json
Content-Length: 156

{
  "id": 42,
  "name": "Dr. Smith",
  "subject": "Mathematics",
  "department": "STEM",
  "averageRating": 0.0,
  "reviewCount": 0
}
```

## Integration with Spring MVC

### How Spring Processes CORS

1. **Configuration Loading**
   ```
   Application Startup
   → Detect @Configuration classes
   → Find @Bean methods
   → Create CorsConfig instance
   → Register WebMvcConfigurer beans
   ```

2. **Request Interception**
   ```
   Request arrives
   → DispatcherServlet checks path
   → Matches /api/** pattern
   → Applies CORS configuration
   → Adds CORS headers to response
   → Forwards to handler method
   ```

3. **Response Enrichment**
   ```
   Handler method returns response
   → CorsFilter adds CORS headers
   → Response sent to browser
   → Browser validates headers
   ```

### Spring CORS Processing Order

1. Check if request is OPTIONS (preflight)
2. Validate origin against allowed origins list
3. Validate method against allowed methods
4. Validate headers against allowed headers
5. Add CORS headers to response
6. If OPTIONS request, return 200 OK
7. If regular request, proceed to handler

## API Endpoint Coverage

### Affected Endpoints

All `/api/**` endpoints are CORS-enabled:

#### Teacher Management
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/{id}` - Get specific teacher
- `GET /api/teachers/search?name=...` - Search teachers
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher
- `GET /api/teachers/{id}/average-rating` - Get rating

#### Review Management
- `GET /api/reviews` - List reviews
- `GET /api/reviews/{id}` - Get specific review
- `GET /api/reviews/teacher/{teacherId}` - Get reviews for teacher
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/{id}` - Delete review

#### Health Check
- `GET /api/health` - Health check endpoint

### Excluded Endpoints

CORS configuration does NOT apply to:
- `/actuator/**` - Actuator endpoints
- `/static/**` - Static resources
- `/error` - Error pages
- Any non-API routes

## Deployment Considerations

### Environment-Specific Configuration

Current implementation has hardcoded origins. For production:

**Future Enhancement: Environment Variables**
```properties
# application.properties
cors.allowed.origins=https://hello-world-five-peach.vercel.app,http://localhost:3000
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed.headers=Content-Type,Authorization
```

**Updated CorsConfig:**
```java
@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Value("${cors.allowed.methods}")
    private String allowedMethods;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String[] origins = allowedOrigins.split(",");
        String[] methods = allowedMethods.split(",");

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods(methods)
                        .allowedHeaders("Content-Type", "Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
```

### Docker Deployment

Dockerfile includes CORS config:
- JAR contains compiled CorsConfig class
- No additional configuration needed
- CORS works immediately on startup
- Health check at `/api/health`

### Fly.io Deployment

fly.toml configuration:
- Internal port: 8080
- HTTPS enforced: true
- Health check path: `/api/health`
- CORS headers returned in responses

## Testing CORS Implementation

### Manual Testing with curl

**Test preflight request:**
```bash
curl -i -X OPTIONS \
  -H "Origin: https://hello-world-five-peach.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```

**Expected response headers:**
```
Access-Control-Allow-Origin: https://hello-world-five-peach.vercel.app
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 3600
```

**Test actual request:**
```bash
curl -i -X GET \
  -H "Origin: https://hello-world-five-peach.vercel.app" \
  https://rate-my-teacher-api.fly.dev/api/teachers
```

### Browser Testing

**JavaScript fetch with CORS:**
```javascript
// From https://hello-world-five-peach.vercel.app

fetch('https://rate-my-teacher-api.fly.dev/api/teachers', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'  // Include credentials
})
.then(response => response.json())
.then(data => console.log('Teachers:', data))
.catch(error => console.error('CORS Error:', error));
```

### Debugging CORS Issues

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Look for OPTIONS request
4. Check Response Headers for CORS headers
5. If blocked, check Origin header matches allowed origins

**Server-side logging:**
```bash
# Monitor CORS-related requests
fly logs -a rate-my-teacher-api | grep -i "cors\|options"
```

## Security Best Practices

### Current Implementation

1. ✓ Explicit origins (no wildcards)
2. ✓ Limited HTTP methods
3. ✓ Restricted headers
4. ✓ HTTPS in production
5. ✓ Credentials explicitly enabled

### Future Enhancements

1. **Rate Limiting**
   ```java
   @Bean
   public RateLimitingInterceptor rateLimiting() {
       // Limit requests per IP/origin
   }
   ```

2. **Request Validation**
   ```java
   // Add request signature verification
   // Validate Origin header against whitelist
   ```

3. **Monitoring**
   ```java
   // Log CORS rejections
   // Alert on suspicious origins
   // Track preflight request patterns
   ```

4. **Token Validation**
   ```java
   // Verify JWT in Authorization header
   // Validate token expiration
   // Check token permissions
   ```

## Performance Metrics

### Typical CORS Impact

| Metric | Value | Impact |
|--------|-------|--------|
| Preflight latency | 100-200ms | First request only |
| Cache duration | 3600s | Subsequent requests cached |
| Memory overhead | <1KB | Per request |
| CPU overhead | Minimal | Header parsing only |

### Optimization Techniques

1. **Longer max-age:** Reduces preflight requests
   - Current: 3600s (1 hour)
   - Could increase to 86400s (1 day) if origins stable

2. **Conditional CORS:** Different max-age by origin
   - Local development: 0s (no caching)
   - Production: 3600s (1 hour)

3. **HTTP/2 Server Push:** Send CORS headers proactively
4. **Connection pooling:** Reuse browser connections

## Troubleshooting Guide

### Issue: "No 'Access-Control-Allow-Origin' header"

**Causes:**
- Origin not in allowed origins list
- CORS config not loaded
- Wrong endpoint path

**Solutions:**
1. Check origin in browser console
2. Verify CorsConfig.java exists and is @Configuration
3. Check endpoint is under /api/**

### Issue: "Method not allowed in CORS"

**Causes:**
- HTTP method not in allowedMethods
- Using unsupported method

**Solutions:**
1. Verify method is GET, POST, PUT, DELETE, or OPTIONS
2. Check method matches API endpoint

### Issue: "Headers not allowed"

**Causes:**
- Header not in allowedHeaders
- Sending unexpected headers

**Solutions:**
1. Only send Content-Type and Authorization
2. Verify header names match exactly (case-sensitive)

### Issue: "Preflight request returns 404"

**Causes:**
- Endpoint doesn't exist
- Path doesn't match /api/**
- Wrong server

**Solutions:**
1. Verify endpoint path exists
2. Ensure path starts with /api/
3. Check server URL is correct

## Documentation Files

### Related Documentation
- `CORS_DEPLOYMENT_GUIDE.md` - Deployment procedures
- `deploy.sh` - Automated deployment script
- `test-cors.sh` - CORS testing script
- `CORS_IMPLEMENTATION_DETAILS.md` - This file

## References

### Spring Framework
- [Spring Boot CORS Guide](https://spring.io/guides/gs/rest-service-cors/)
- [WebMvcConfigurer Documentation](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/config/annotation/WebMvcConfigurer.html)
- [CorsRegistry API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/config/annotation/CorsRegistry.html)

### Web Standards
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

### Tools & Platforms
- [Fly.io Documentation](https://fly.io/docs/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Maven Documentation](https://maven.apache.org/guides/)

## Summary

The CORS implementation provides a secure, production-ready configuration that:
- Allows frontend to communicate with backend across origins
- Uses explicit origin whitelisting for security
- Supports all necessary HTTP methods and headers
- Caches preflight responses for performance
- Integrates seamlessly with Spring MVC
- Works across development and production environments
- Follows security best practices and standards

The configuration is easily maintainable and can be extended for additional features like rate limiting, request validation, and monitoring.
