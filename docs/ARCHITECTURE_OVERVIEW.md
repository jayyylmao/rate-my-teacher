# Rate My Teacher - Architecture Overview

**Audience**: Senior Software Engineers onboarding to the codebase
**Last Updated**: December 2024

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [API Integration](#api-integration)
6. [Deployment Infrastructure](#deployment-infrastructure)
7. [Development Workflow](#development-workflow)
8. [Key Patterns & Conventions](#key-patterns--conventions)

---

## System Architecture

Rate My Teacher is a full-stack web application with a **decoupled architecture**:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Next.js 16    │  HTTP   │  Spring Boot 3   │   JPA   │ PostgreSQL  │
│   Frontend      │ ──────> │  REST API        │ ──────> │  Database   │
│   (Port 3000)   │         │  (Port 8080)     │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
     Fly.io                      Fly.io                    Fly.io
  rate-my-teacher            rate-my-teacher-api        (managed DB)
```

### Technology Stack Summary

| Layer         | Technology                  | Version  |
|---------------|----------------------------|----------|
| Frontend      | Next.js (App Router)       | 16.1.1   |
| UI Library    | React                      | 19.2.3   |
| Styling       | Tailwind CSS               | v4       |
| Language      | TypeScript (strict mode)   | Latest   |
| Backend       | Spring Boot                | 3.2.1    |
| Language      | Java                       | 17       |
| ORM           | Spring Data JPA            | Latest   |
| Database      | PostgreSQL                 | Latest   |
| Deployment    | Fly.io (both services)     | N/A      |

---

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 16.1.1 with App Router (Server Components by default)
- **React**: 19.2.3 with RSC (React Server Components)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with custom animations
- **Path Aliases**: `@/*` resolves to root directory

### Project Structure

```
/app                          # Next.js App Router
├── layout.tsx                # Root layout (Geist font, metadata)
├── page.tsx                  # Homepage (stats + featured teachers)
├── /teachers
│   ├── page.tsx              # Teacher browse/search page
│   └── /[id]
│       ├── page.tsx          # Teacher profile with reviews
│       ├── loading.tsx       # Suspense loading state
│       └── not-found.tsx     # 404 handler

/components                   # React components (organized by feature)
├── /ui                       # Reusable UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── star-rating.tsx
│   ├── breadcrumb.tsx
│   └── share-button.tsx
├── /teachers                 # Teacher-specific components
│   ├── teacher-card.tsx
│   ├── teacher-grid.tsx      # Grid with filtering/sorting
│   └── rating-distribution.tsx
├── /reviews                  # Review-specific components
│   ├── review-card.tsx
│   ├── review-list.tsx
│   └── review-sort.tsx
└── /search
    └── search-bar.tsx

/lib                          # Utility libraries
├── /api                      # API client layer
│   ├── client.ts             # HTTP client (fetch wrapper)
│   └── teachers.ts           # Teacher API methods + DTOs
└── /utils                    # Shared utilities

/db                           # Database layer (legacy - not used in production)
├── schema.ts                 # Drizzle ORM schema (reference only)
├── index.ts                  # DB client
└── seed.ts                   # Seed script

/public                       # Static assets
```

### Key Frontend Patterns

#### 1. **Server Components (Default)**
Most components are React Server Components (RSC), enabling:
- Data fetching at the component level
- Reduced client-side JavaScript
- Direct database access (currently via API)

**Example** (`app/page.tsx:7-24`):
```typescript
export default async function Home() {
  try {
    const stats = await teacherApi.getStats();
    const teachersWithRating = await teacherApi.getRecentlyReviewed(6);
  } catch (error) {
    // Graceful degradation
  }
  // ... render
}
```

#### 2. **Client Components (Explicit)**
Components using hooks, browser APIs, or interactivity require `"use client"`:
- Search bar (form state)
- Interactive buttons (click handlers)
- Animations (client-side transitions)

**Example Pattern**:
```typescript
"use client";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  // ...
}
```

#### 3. **Async Route Parameters** (Next.js 16 Breaking Change)
All `params` and `searchParams` are now asynchronous Promises:

```typescript
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search } = await searchParams;
}
```

#### 4. **API Client Layer** (`lib/api/`)
Centralized API client abstracts backend communication:

**Client** (`lib/api/client.ts`):
- Base URL configuration via environment variables
- Error handling with custom `ApiError` class
- Type-safe request methods (GET, POST, PUT, DELETE)
- Response parsing with proper error messages

**Teacher API** (`lib/api/teachers.ts`):
- TypeScript DTOs matching Java backend structure
- Wrapper methods for all teacher/review endpoints
- Client-side data transformations (e.g., sorting, filtering)

#### 5. **Metadata Generation**
Dynamic metadata for SEO using `generateMetadata`:

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const teacher = await teacherApi.getTeacherById(id);
  return {
    title: `${teacher.name} - ${teacher.subject}`,
    description: `${reviewCount} reviews - Rating: ${avgRating}/5.0`,
  };
}
```

#### 6. **Suspense & Loading States**
Streaming UI with React Suspense:
- `loading.tsx` files for route-level loading states
- Suspense boundaries in page components
- Graceful fallbacks for slow data fetching

### Styling Architecture

**Tailwind CSS v4** with utility-first approach:
- Custom animations in `globals.css` (`fade-in`, `slide-up`)
- Responsive design with mobile-first breakpoints
- Design system via component variants (Button, Card)

**Custom Properties**:
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Backend Architecture

### Tech Stack
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **ORM**: Spring Data JPA
- **Database**: PostgreSQL
- **Build Tool**: Maven
- **Deployment**: Fly.io (Dockerized)

### Project Structure

```
/backend
├── pom.xml                   # Maven dependencies
├── Dockerfile                # Multi-stage Docker build
├── fly.toml                  # Fly.io deployment config
└── /src/main/java/com/ratemyteacher
    ├── RateMyTeacherApplication.java   # Spring Boot entry point
    ├── /entity                          # JPA entities
    │   ├── Teacher.java
    │   └── Review.java
    ├── /dto                             # Data Transfer Objects
    │   ├── TeacherDTO.java
    │   ├── ReviewDTO.java
    │   ├── CreateTeacherRequest.java
    │   └── CreateReviewRequest.java
    ├── /repository                      # Spring Data repositories
    │   ├── TeacherRepository.java
    │   └── ReviewRepository.java
    ├── /service                         # Business logic layer
    │   ├── TeacherService.java
    │   └── ReviewService.java
    ├── /controller                      # REST controllers
    │   ├── TeacherController.java
    │   ├── ReviewController.java
    │   └── HealthController.java
    ├── /config                          # Configuration
    │   └── CorsConfig.java
    └── /exception                       # Exception handling
        ├── ResourceNotFoundException.java
        └── GlobalExceptionHandler.java
```

### Layered Architecture

```
┌──────────────────────────────────────┐
│         REST Controllers             │  ← HTTP layer (@RestController)
│   - TeacherController                │
│   - ReviewController                 │
└────────────┬─────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│         Service Layer                │  ← Business logic (@Service)
│   - TeacherService                   │
│   - ReviewService                    │
└────────────┬─────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│         Repository Layer             │  ← Data access (Spring Data JPA)
│   - TeacherRepository                │
│   - ReviewRepository                 │
└────────────┬─────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│         PostgreSQL Database          │
└──────────────────────────────────────┘
```

### Key Backend Patterns

#### 1. **RESTful API Design**
Standard REST conventions with proper HTTP methods:

| Endpoint                        | Method | Description                    |
|---------------------------------|--------|--------------------------------|
| `/api/teachers`                 | GET    | List all teachers              |
| `/api/teachers/{id}`            | GET    | Get teacher with reviews       |
| `/api/teachers/search?name=...` | GET    | Search teachers by name        |
| `/api/teachers`                 | POST   | Create new teacher             |
| `/api/teachers/{id}`            | PUT    | Update teacher                 |
| `/api/teachers/{id}`            | DELETE | Delete teacher (cascade)       |
| `/api/reviews`                  | GET    | List all reviews               |
| `/api/reviews`                  | POST   | Create review                  |
| `/api/reviews/teacher/{id}`     | GET    | Get reviews for teacher        |

#### 2. **DTO Pattern**
Separation of entities from API contracts:
- **Entities** (`@Entity`): Database models with JPA annotations
- **DTOs** (Data Transfer Objects): API request/response objects
- **Converters**: Service layer transforms entities ↔ DTOs

**Example** (`TeacherService.java:155-168`):
```java
private TeacherDTO convertToTeacherDTOWithoutReviews(Teacher teacher) {
    Double avgRating = reviewRepository.calculateAverageRatingByTeacherId(teacher.getId());
    Long reviewCount = reviewRepository.countByTeacherId(teacher.getId());

    return new TeacherDTO(
        teacher.getId(),
        teacher.getName(),
        teacher.getSubject(),
        teacher.getDepartment(),
        teacher.getCreatedAt(),
        avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
        reviewCount != null ? reviewCount.intValue() : 0
    );
}
```

#### 3. **Transaction Management**
Declarative transactions via `@Transactional`:
- `@Transactional(readOnly = true)` for queries (performance optimization)
- `@Transactional` for write operations (ACID guarantees)

#### 4. **Exception Handling**
Global exception handler with consistent error responses:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

#### 5. **CORS Configuration**
Explicitly configured CORS for cross-origin requests:

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
                        "https://rate-my-teacher.fly.dev",
                        "http://localhost:3000"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

#### 6. **Repository Pattern**
Spring Data JPA repositories with custom queries:

```java
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.teacher.id = :teacherId")
    Double calculateAverageRatingByTeacherId(@Param("teacherId") Integer teacherId);

    Long countByTeacherId(Integer teacherId);
}
```

#### 7. **Lombok Integration**
Reduces boilerplate with annotations:
- `@Data`: Getters, setters, toString, equals, hashCode
- `@RequiredArgsConstructor`: Constructor injection for `final` fields
- `@Slf4j`: Logger instance

---

## Database Design

### Schema Overview

Two main tables with one-to-many relationship:

```sql
┌─────────────────────────┐
│       teachers          │
├─────────────────────────┤
│ id (PK)         SERIAL  │
│ name            VARCHAR │
│ subject         VARCHAR │
│ department      VARCHAR │
│ created_at      TIMESTAMP│
└──────────┬──────────────┘
           │
           │ 1:N (cascade delete)
           │
┌──────────▼──────────────┐
│       reviews           │
├─────────────────────────┤
│ id (PK)         SERIAL  │
│ teacher_id (FK) INTEGER │
│ rating          INTEGER │
│ comment         TEXT    │
│ reviewer_name   VARCHAR │
│ created_at      TIMESTAMP│
└─────────────────────────┘
```

### Entity Relationships

**Teacher Entity**:
```java
@Entity
@Table(name = "teachers")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();
}
```

**Review Entity**:
```java
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
}
```

### Key Database Patterns

1. **Cascade Delete**: Deleting a teacher removes all associated reviews
2. **Lazy Loading**: Reviews are fetched only when needed
3. **Calculated Fields**: Average rating and review count computed in service layer
4. **Timestamps**: `created_at` automatically set via JPA lifecycle hooks

---

## API Integration

### Frontend → Backend Communication

**API Base URL Configuration**:
```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://rate-my-teacher-api.fly.dev';
```

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Client-side API URL (public)
- `API_URL`: Server-side API URL (SSR)

### Type Safety

TypeScript DTOs mirror Java backend structure:

**Frontend DTO** (`lib/api/teachers.ts:5-14`):
```typescript
export interface TeacherDTO {
  id: number;
  name: string;
  subject: string;
  department: string | null;
  createdAt: string;
  averageRating: number | null;
  reviewCount: number;
  reviews?: ReviewDTO[];
}
```

**Backend DTO** (`TeacherDTO.java`):
```java
@Data
public class TeacherDTO {
    private Integer id;
    private String name;
    private String subject;
    private String department;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Integer reviewCount;
    private List<ReviewDTO> reviews;
}
```

### Error Handling

**Backend** returns structured errors:
```json
{
  "message": "Teacher with id 999 not found",
  "status": 404
}
```

**Frontend** catches and displays gracefully:
```typescript
try {
  const teacher = await teacherApi.getTeacherById(id);
} catch (error) {
  if (error instanceof ApiError && error.status === 404) {
    notFound(); // Next.js 404 page
  }
}
```

---

## Deployment Infrastructure

### Fly.io Architecture

Both frontend and backend deployed as separate Fly.io apps:

**Frontend** (`rate-my-teacher`):
- Region: `ewr` (New Jersey)
- Instances: 2 VMs
- Resources: 1 CPU, 1024 MB each
- Port: 3000 (Next.js)
- URL: `https://rate-my-teacher.fly.dev`

**Backend** (`rate-my-teacher-api`):
- Region: `ewr` (New Jersey)
- Dockerized Spring Boot application
- Port: 8080
- URL: `https://rate-my-teacher-api.fly.dev`

**Database**:
- Managed PostgreSQL on Fly.io
- Connection string via `DATABASE_URL` environment variable

### Docker Configuration

**Frontend Dockerfile** (standard Next.js):
- Multi-stage build (dependencies → builder → runner)
- Node.js 18+ Alpine base
- Optimized layer caching

**Backend Dockerfile** (`backend/Dockerfile`):
- Multi-stage build (Maven → JRE)
- Java 17 runtime
- Port 8080 exposed
- Optimized JAR packaging

### Deployment Commands

**Frontend**:
```bash
fly deploy                    # Deploy latest code
fly status -a rate-my-teacher # Check status
fly logs -a rate-my-teacher   # View logs
```

**Backend**:
```bash
cd backend
fly deploy                         # Deploy API
fly status -a rate-my-teacher-api  # Check status
```

### Environment Variables

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=https://rate-my-teacher-api.fly.dev
NEXT_PUBLIC_SITE_URL=https://rate-my-teacher.fly.dev
```

**Backend** (`application.properties` + Fly secrets):
```properties
spring.datasource.url=${DATABASE_URL}
server.port=8080
```

---

## Development Workflow

### Setup

**Frontend**:
```bash
npm install
npm run dev           # http://localhost:3000
npm run build         # Production build
npm run lint          # ESLint
```

**Backend**:
```bash
cd backend
./run-local.sh        # Starts Spring Boot on port 8080
```

**Database** (legacy Drizzle setup - not used in production):
```bash
npm run db:push       # Push schema changes
npm run db:studio     # Open Drizzle Studio UI
npm run db:seed       # Seed sample data
```

### Git Workflow

**Current Branch**: `main`

**Modified Files** (staged):
```
M  app/page.tsx
M  db/seed.ts
M  package.json
D  next.config.ts  (removed - now next.config.js)
```

**Untracked Files**:
- Backend implementation (`backend/`)
- New components (`components/teachers/`, `components/reviews/`)
- API layer (`lib/api/`)
- Documentation (`docs/`)

### Testing Strategy

**Frontend**:
- Manual testing in development
- Browser automation via Playwright (configured via MCP)
- Next.js 16 dev tools for diagnostics

**Backend**:
- Spring Boot Test framework
- API testing via `api-examples.http` or `test-api.sh`
- Health endpoint: `GET /actuator/health`

---

## Key Patterns & Conventions

### Code Style

**TypeScript**:
- Strict mode enabled
- `@/` path alias for imports
- Async/await for asynchronous operations
- Functional components with hooks

**Java**:
- Lombok for boilerplate reduction
- Constructor injection for dependencies
- SLF4J logging throughout
- RESTful naming conventions

### Naming Conventions

**Frontend**:
- Components: PascalCase (`TeacherCard.tsx`)
- Files: kebab-case for multi-word (`teacher-grid.tsx`)
- Props: camelCase with descriptive names

**Backend**:
- Classes: PascalCase (`TeacherService`)
- Methods: camelCase (`getTeacherById`)
- Packages: lowercase (`com.ratemyteacher.service`)

### Data Flow

1. **User Request** → Next.js page component
2. **Server Component** → Fetches data via `teacherApi`
3. **API Client** → HTTP request to Spring Boot backend
4. **Controller** → Validates request, delegates to service
5. **Service** → Business logic, queries repository
6. **Repository** → JPA query to PostgreSQL
7. **Response** → DTO converted and returned up the chain
8. **Render** → Next.js renders HTML with data

### Performance Optimizations

**Frontend**:
- Server-side rendering (SSR) for initial load
- Suspense for progressive loading
- Image optimization (Next.js `<Image>`)
- Static metadata generation

**Backend**:
- Read-only transactions for queries
- Database indexes on foreign keys
- Connection pooling (HikariCP)
- Lazy loading for relationships

---

## Onboarding Checklist

- [ ] Clone repository and install dependencies (both frontend and backend)
- [ ] Set up `.env.local` with `DATABASE_URL` and API URLs
- [ ] Run frontend (`npm run dev`) and backend (`./backend/run-local.sh`)
- [ ] Explore API endpoints via `backend/api-examples.http`
- [ ] Review database schema in `db/schema.ts` and Java entities
- [ ] Test a complete flow: create teacher → add review → view profile
- [ ] Deploy changes to Fly.io staging (if available)
- [ ] Read CLAUDE.md for Claude Code integration details

---

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Fly.io Deployment Guide](https://fly.io/docs/)

**Internal Documentation**:
- `CLAUDE.md` - Claude Code integration
- `backend/PROJECT_SUMMARY.md` - Backend project summary
- `backend/DEPLOYMENT.md` - Deployment guide
- `TESTING_GUIDE.md` - Testing procedures

---

**Questions?** Reach out to the team or reference the codebase documentation in `/docs` and `/backend`.
