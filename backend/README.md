# Rate My Teacher API

A production-ready Spring Boot REST API for the Rate My Teacher application.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA**
- **PostgreSQL** (Supabase)
- **Maven**
- **Lombok**
- **Docker**
- **Fly.io** (Deployment)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL database (Supabase)
- Docker (for containerized deployment)
- Fly.io CLI (for deployment)

## Environment Variables

Create a `.env.local` file or set the following environment variable:

```bash
DATABASE_URL=postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## Local Development

### Build the application
```bash
mvn clean install
```

### Run the application
```bash
export DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Run tests
```bash
mvn test
```

## Docker

### Build Docker image
```bash
docker build -t rate-my-teacher-api .
```

### Run Docker container
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" \
  rate-my-teacher-api
```

## Deployment to Fly.io

### Prerequisites
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
flyctl auth login
```

### Deploy

1. **Create a new Fly app** (first time only):
```bash
cd backend
flyctl apps create rate-my-teacher-api --org personal
```

2. **Set secrets**:
```bash
flyctl secrets set DATABASE_URL="postgres://postgres.xaasythqqfgvinwnasii:uzOsWdK75hFXqRSs@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

3. **Deploy**:
```bash
flyctl deploy
```

4. **Check status**:
```bash
flyctl status
flyctl logs
```

### Access deployed API
```
https://rate-my-teacher-api.fly.dev
```

## API Endpoints

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | Get all teachers with average ratings |
| GET | `/api/teachers?department={dept}` | Filter teachers by department |
| GET | `/api/teachers?subject={subject}` | Filter teachers by subject |
| GET | `/api/teachers/{id}` | Get teacher by ID with reviews |
| GET | `/api/teachers/search?name={name}` | Search teachers by name |
| GET | `/api/teachers/{id}/average-rating` | Get average rating for a teacher |
| POST | `/api/teachers` | Create a new teacher |
| PUT | `/api/teachers/{id}` | Update a teacher |
| DELETE | `/api/teachers/{id}` | Delete a teacher |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get all reviews |
| GET | `/api/reviews?rating={rating}` | Filter reviews by rating |
| GET | `/api/reviews/{id}` | Get review by ID |
| GET | `/api/reviews/teacher/{teacherId}` | Get reviews for a teacher |
| POST | `/api/reviews` | Create a new review |
| DELETE | `/api/reviews/{id}` | Delete a review |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |

## Request/Response Examples

### Create Teacher
```bash
POST /api/teachers
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "subject": "Computer Science",
  "department": "Engineering"
}
```

### Create Review
```bash
POST /api/reviews
Content-Type: application/json

{
  "teacherId": 1,
  "rating": 5,
  "comment": "Excellent professor! Very clear explanations and always available for help.",
  "reviewerName": "John Doe"
}
```

### Get Teachers Response
```json
[
  {
    "id": 1,
    "name": "Dr. Jane Smith",
    "subject": "Computer Science",
    "department": "Engineering",
    "createdAt": "2024-01-15T10:30:00",
    "averageRating": 4.5,
    "reviewCount": 12
  }
]
```

## Error Handling

The API returns standardized error responses:

```json
{
  "status": 404,
  "message": "Teacher not found with id: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/teachers/999"
}
```

Validation errors include field-specific messages:

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/reviews",
  "errors": {
    "rating": "Rating must be between 1 and 5",
    "comment": "Comment must be between 10 and 2000 characters"
  }
}
```

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Next.js development)
- `https://*.vercel.app` (Vercel deployments)
- `https://*.fly.dev` (Fly.io deployments)

## Database Schema

### Teachers Table
```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Project Structure

```
backend/
├── src/
│   └── main/
│       ├── java/com/ratemyteacher/
│       │   ├── RateMyTeacherApplication.java
│       │   ├── config/
│       │   │   └── CorsConfig.java
│       │   ├── controller/
│       │   │   ├── HealthController.java
│       │   │   ├── TeacherController.java
│       │   │   └── ReviewController.java
│       │   ├── dto/
│       │   │   ├── CreateTeacherRequest.java
│       │   │   ├── CreateReviewRequest.java
│       │   │   ├── TeacherDTO.java
│       │   │   └── ReviewDTO.java
│       │   ├── entity/
│       │   │   ├── Teacher.java
│       │   │   └── Review.java
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── ResourceNotFoundException.java
│       │   ├── repository/
│       │   │   ├── TeacherRepository.java
│       │   │   └── ReviewRepository.java
│       │   └── service/
│       │       ├── TeacherService.java
│       │       └── ReviewService.java
│       └── resources/
│           └── application.properties
├── Dockerfile
├── fly.toml
├── pom.xml
└── README.md
```

## License

MIT
