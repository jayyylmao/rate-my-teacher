# Deployment Guide - Rate My Teacher API

Complete guide for deploying the Spring Boot API to Fly.io.

## Prerequisites

1. **Fly.io Account**: jayyylmao88@gmail.com
2. **Fly CLI installed**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
3. **Database**: PostgreSQL on Supabase (already configured)
4. **Java 17+** and **Maven 3.6+** (for building)

## Step-by-Step Deployment

### 1. Login to Fly.io

```bash
flyctl auth login
```

This will open a browser for authentication.

### 2. Initialize Fly App (First Time Only)

The `fly.toml` is already configured. Verify the settings:

```toml
app = "rate-my-teacher-api"
primary_region = "ewr"  # US East (Newark)
```

Create the app:

```bash
cd backend
flyctl apps create rate-my-teacher-api --org personal
```

### 3. Set Environment Variables

Set the DATABASE_URL as a secret (not in fly.toml for security):

```bash
flyctl secrets set DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

Verify secrets:
```bash
flyctl secrets list
```

### 4. Deploy

**Option A: Using the deploy script** (Recommended)
```bash
./deploy.sh
```

**Option B: Manual deployment**
```bash
flyctl deploy
```

The deploy process will:
1. Build the Docker image locally
2. Push the image to Fly.io registry
3. Create/update the VM
4. Start the application
5. Run health checks

### 5. Verify Deployment

```bash
# Check application status
flyctl status

# View logs
flyctl logs

# Open in browser
flyctl open
```

Test the API:
```bash
curl https://rate-my-teacher-api.fly.dev/api/health
```

## Configuration Details

### Resource Allocation

From `fly.toml`:
- **CPU**: 1 shared CPU
- **Memory**: 512 MB
- **Region**: ewr (US East)

### Auto-scaling

- **Min machines**: 0 (stops when idle to save costs)
- **Auto-stop**: Enabled
- **Auto-start**: Enabled

### Health Checks

- **Path**: `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Grace Period**: 10 seconds

## Post-Deployment

### View Application Info

```bash
# Get app details
flyctl info

# Get assigned URL
flyctl status --json | jq -r '.Hostname'
```

### Monitor Application

```bash
# Real-time logs
flyctl logs -f

# SSH into container
flyctl ssh console

# Execute commands in container
flyctl ssh console -C "java -version"
```

### Scaling

**Scale horizontally (add more VMs):**
```bash
flyctl scale count 2
```

**Scale vertically (increase resources):**
```bash
flyctl scale vm shared-cpu-2x  # 2 CPUs
flyctl scale memory 1024       # 1 GB RAM
```

**Always-on (no auto-stop):**
```bash
flyctl scale count 1 --min-machines-running=1
```

### Update Application

After making code changes:

```bash
# Quick deploy
flyctl deploy

# Deploy specific Dockerfile
flyctl deploy --dockerfile Dockerfile

# Deploy with build args
flyctl deploy --build-arg VERSION=1.0.1
```

## Environment Management

### Production Profile

The application uses `SPRING_PROFILES_ACTIVE=production` (set in fly.toml).

You can add `application-production.properties`:

```properties
# src/main/resources/application-production.properties
logging.level.root=WARN
logging.level.com.ratemyteacher=INFO
spring.jpa.show-sql=false
```

### Additional Secrets

```bash
# Set additional environment variables
flyctl secrets set STRIPE_API_KEY=sk_live_xxx
flyctl secrets set JWT_SECRET=your-secret-key

# Unset a secret
flyctl secrets unset STRIPE_API_KEY
```

## Custom Domain (Optional)

### Add Custom Domain

```bash
flyctl certs create api.ratemyteacher.com
```

Follow the instructions to add DNS records:
- Add an A record pointing to Fly.io's IP
- Add an AAAA record for IPv6

### Verify SSL Certificate

```bash
flyctl certs show api.ratemyteacher.com
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs for errors
flyctl logs

# Verify secrets are set
flyctl secrets list

# Check health check status
flyctl checks list
```

### Database Connection Failed

```bash
# SSH into container and test connection
flyctl ssh console

# Test DATABASE_URL
echo $DATABASE_URL

# Test connection
apt-get update && apt-get install -y postgresql-client
psql $DATABASE_URL -c "SELECT version();"
```

### Out of Memory

```bash
# Check memory usage
flyctl metrics

# Increase memory allocation
flyctl scale memory 1024
```

### Slow Response Times

```bash
# Check metrics
flyctl metrics

# Scale horizontally
flyctl scale count 2

# Change to dedicated CPU
flyctl scale vm dedicated-cpu-1x
```

## Rollback

### Rollback to Previous Version

```bash
# List releases
flyctl releases

# Rollback to specific release
flyctl releases rollback <release-number>
```

## Cost Optimization

### Free Tier Limits

Fly.io free tier includes:
- Up to 3 shared-cpu-1x VMs
- 256 MB RAM per VM
- 3 GB persistent storage

**Current configuration uses:**
- 1 VM with 512 MB RAM (within free tier if it's your only app)

### Reduce Costs

```bash
# Enable auto-stop (already enabled)
# Reduce to 256 MB RAM
flyctl scale memory 256

# Stop when not in use
flyctl apps stop rate-my-teacher-api

# Start when needed
flyctl apps restart rate-my-teacher-api
```

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/fly-deploy.yml`:

```yaml
name: Fly Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy:
    name: Deploy to Fly.io
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get API token:
```bash
flyctl auth token
```

Add to GitHub Secrets as `FLY_API_TOKEN`.

## Backup and Recovery

### Database Backups

Supabase handles automatic backups. To manually backup:

```bash
# Connect to database
flyctl ssh console

# Dump database
pg_dump $DATABASE_URL > backup.sql

# Download backup (from local machine)
flyctl ssh sftp get backup.sql
```

## Security

### Network Security

Fly.io provides:
- Automatic HTTPS with valid certificates
- DDoS protection
- Firewall rules

### Application Security

The API includes:
- CORS configuration for allowed origins
- Input validation on all endpoints
- SQL injection prevention (JPA/Hibernate)
- Error handling that doesn't leak sensitive info

### Secrets Management

Never commit secrets to git:
- Use `flyctl secrets` for sensitive data
- Keep `.env.local` in `.gitignore`
- Rotate DATABASE_URL periodically

## Monitoring and Alerts

### Basic Monitoring

```bash
# View metrics
flyctl metrics

# Check disk usage
flyctl ssh console -C "df -h"

# Check memory usage
flyctl ssh console -C "free -m"
```

### Third-Party Monitoring (Optional)

Integrate with:
- **Sentry**: For error tracking
- **DataDog**: For APM
- **Prometheus**: For metrics

Add to `pom.xml`:
```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-spring-boot-starter</artifactId>
    <version>6.34.0</version>
</dependency>
```

## Support Resources

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Quick Commands Reference

```bash
# Deploy
flyctl deploy

# Logs
flyctl logs -f

# Status
flyctl status

# Scale
flyctl scale count 2
flyctl scale memory 1024

# Secrets
flyctl secrets set KEY=value
flyctl secrets list

# Restart
flyctl apps restart rate-my-teacher-api

# SSH
flyctl ssh console

# Open in browser
flyctl open

# Destroy app (CAREFUL!)
flyctl apps destroy rate-my-teacher-api
```

## Next Steps

1. Deploy the application: `./deploy.sh`
2. Test all endpoints: `./test-api.sh https://rate-my-teacher-api.fly.dev`
3. Update your Next.js frontend to use: `https://rate-my-teacher-api.fly.dev`
4. Set up monitoring and alerts
5. Configure custom domain (optional)
6. Set up CI/CD pipeline (optional)

---

**Deployment Status**: Ready for production!
**Estimated Deploy Time**: 3-5 minutes
**Monthly Cost**: Free (within Fly.io free tier)
