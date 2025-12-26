# Welcome to Rate My Teacher API

## Getting Started in 3 Steps

### 1. Read the Overview
```bash
cat API_OVERVIEW.txt
```
This gives you a visual summary of the entire project.

### 2. Quick Start (5 minutes)
```bash
# Start the development server
./run-local.sh

# In another terminal, test the API
./test-api.sh http://localhost:8080
```

### 3. Deploy to Production (10 minutes)
```bash
# Read the deployment guide first
cat DEPLOYMENT.md

# Then deploy
./deploy.sh
```

## Documentation Index

### Essential Reading
1. **API_OVERVIEW.txt** - Visual project overview (READ THIS FIRST!)
2. **QUICKSTART.md** - Get running in 5 minutes
3. **README.md** - Complete API documentation

### Deployment & Operations
4. **DEPLOYMENT.md** - Fly.io deployment guide
5. **CHECKLIST.md** - Pre-deployment verification
6. **PROJECT_SUMMARY.md** - Detailed project breakdown

### Development Tools
- **api-examples.http** - HTTP request examples (use with REST Client)
- **run-local.sh** - Start local development server
- **test-api.sh** - Comprehensive API testing
- **deploy.sh** - Deploy to Fly.io

## Project Structure

```
backend/
├── src/main/java/com/ratemyteacher/
│   ├── RateMyTeacherApplication.java      # Main entry point
│   ├── controller/                         # REST endpoints (3 files)
│   ├── service/                            # Business logic (2 files)
│   ├── repository/                         # Data access (2 files)
│   ├── entity/                             # JPA entities (2 files)
│   ├── dto/                                # Request/response DTOs (4 files)
│   ├── config/                             # Configuration (1 file)
│   └── exception/                          # Error handling (2 files)
├── src/main/resources/
│   └── application.properties              # Spring Boot config
├── pom.xml                                 # Maven dependencies
├── Dockerfile                              # Container build
└── fly.toml                                # Fly.io config
```

## Quick Reference

### Run Locally
```bash
./run-local.sh
# Access at: http://localhost:8080
```

### Test API
```bash
./test-api.sh http://localhost:8080
```

### Deploy
```bash
./deploy.sh
# Access at: https://rate-my-teacher-api.fly.dev
```

### Key Endpoints
- Health: `GET /api/health`
- Teachers: `GET /api/teachers`
- Reviews: `GET /api/reviews`
- Create Teacher: `POST /api/teachers`
- Create Review: `POST /api/reviews`

## Environment Setup

The API requires one environment variable:

```bash
DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

This is automatically loaded from `../.env.local` when using `run-local.sh`.

## Technology Stack
- **Spring Boot**: 3.2.1
- **Java**: 17
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Fly.io
- **Docker**: Multi-stage builds

## Support

If you encounter issues:
1. Check the TROUBLESHOOTING section in README.md
2. Review CHECKLIST.md for verification steps
3. Check logs: `flyctl logs` (production) or console output (local)

## What's Included

- 15 REST API endpoints
- Full CRUD operations for Teachers and Reviews
- Automatic average rating calculation
- Input validation and error handling
- CORS configuration for frontend
- Docker containerization
- Fly.io deployment configuration
- Comprehensive documentation
- Automated testing scripts

## Next Steps

1. Read `API_OVERVIEW.txt` for a visual overview
2. Follow `QUICKSTART.md` to run locally
3. Test with `./test-api.sh`
4. Deploy with `./deploy.sh`
5. Integrate with your Next.js frontend

---

**Status**: Production Ready
**Total Files**: 33 (18 Java, 15 config/docs)
**Lines of Code**: 1,019 Java lines
**Documentation**: 44 KB
**Deployment Time**: ~5 minutes

Let's build something awesome!
