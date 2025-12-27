# Mobile GraphQL Queries Reference

This file provides copy-paste GraphQL queries for mobile clients (iOS/Android/React Native/Expo).

## ✅ Authentication

Mobile clients must include auth token in headers:

```typescript
// Apollo Client example
const client = new ApolloClient({
  uri: 'https://rate-my-teacher-api.fly.dev/graphql',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
```

---

## 📱 Feature 1: Interview Feed (Browse)

**Query:**
```graphql
query InterviewFeed($q: String, $limit: Int) {
  interviews(q: $q, limit: $limit) {
    items {
      id
      company
      role
      averageRating
      reviewCount
      lastReviewedAt
    }
  }
}
```

**Variables:**
```json
{
  "q": "google",
  "limit": 20
}
```

**Mobile UX:**
- Fast first paint (minimal fields)
- No nested reviews
- Paginate with `limit`

---

## 📱 Feature 2: Interview Detail (Paginated)

**Query (Mobile-Optimized):**
```graphql
query InterviewDetail($id: ID!, $first: Int, $after: String, $sort: ReviewSort) {
  interview(id: $id) {
    id
    company
    role
    level
    stage
    location
    averageRating
    reviewCount
    ratingBreakdown {
      rating
      count
    }

    # Paginated reviews (mobile-friendly)
    reviewsConnection(first: $first, after: $after, sort: $sort) {
      edges {
        node {
          id
          rating
          comment
          reviewerName
          createdAt
          tags
          roundType
          interviewerInitials
          outcome
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
}
```

**Variables:**
```json
{
  "id": "5",
  "first": 10,
  "after": null,
  "sort": "RECENT"
}
```

**Sorting Options:**
- `RECENT` - Newest first (default)
- `HIGHEST` - Highest rated first
- `LOWEST` - Lowest rated first

**Mobile UX:**
- First load: Fetch 10 reviews
- Infinite scroll: Use `endCursor` from `pageInfo` as `after` parameter
- Only fetch next page when `hasNextPage = true`
- All reviews are pre-filtered (APPROVED only)

**Legacy Query (Deprecated):**
```graphql
# Don't use this on mobile - fetches ALL reviews
interview(id: $id) {
  reviews { ... }  # ⚠️ Could be 100+ reviews
}
```

---

## 📱 Feature 3: Write Review

**Mutation:**
```graphql
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "interviewId": "5",
    "rating": 5,
    "comment": "Great interview experience!",
    "reviewerName": "Anonymous",
    "roundType": "CODING",
    "tagKeys": ["WELL_ORGANIZED", "PROMPT_FEEDBACK"],
    "interviewerInitials": "JD",
    "outcome": "OFFER"
  }
}
```

**Mobile UX:**
- After submit, show: "Thanks! Your review is pending moderation."
- `status` will be "PENDING"

---

## 📱 Feature 4: My Reviews

**Query:**
```graphql
query MyReviews {
  me {
    id
    email
    myReviews {
      items {
        id
        rating
        status
        createdAt
        interview {
          company
          role
        }
      }
    }
  }
}
```

**Mobile UX:**
- Shows company + role via nested `interview` field
- Display status badge: PENDING | APPROVED | REJECTED
- No need for separate API call to get interview data

---

## 📱 Feature 5: Company Insights (Preview)

**Query:**
```graphql
query CompanyInsights($interviewId: ID!) {
  insights(interviewId: $interviewId) {
    companyName
    totalReviews
    locked

    # If locked = false (user contributed)
    tagDistribution {
      tag
      percentage
    }
    averageDifficulty
    feedbackSpeed
    commonFeedback
    outcomeDistribution {
      outcome
      percentage
    }
    recentTrend {
      recentAverageRating
      olderAverageRating
      direction
    }

    # If locked = true (user didn't contribute)
    unlockMessage
    topTagsBlurred
    availableInsightsCount
  }
}
```

**Variables:**
```json
{
  "interviewId": "5"
}
```

**Mobile UX:**
- If `locked = true`: Show blurred preview + "Share your experience to unlock"
- If `locked = false`: Show full insights

---

## 🔑 Available Tags

**Query:**
```graphql
query Tags {
  tags {
    items {
      key
      label
      category
    }
  }
}
```

**Mobile UX:**
- Use for tag picker UI
- Categories: PROCESS | QUALITY | BEHAVIOR

---

## ⚠️ Error Handling

Mobile must handle:

```typescript
// Offline mode
if (!navigator.onLine) {
  showCachedFeed();
}

// Auth expired
if (error.message === 'UNAUTHENTICATED') {
  redirectToLogin();
}

// Moderation rejection
if (review.status === 'REJECTED') {
  showRejectionReason();
}
```

---

## 🚀 Performance Tips

1. **Minimal queries** - Only request fields visible on screen
2. **Pagination** - Use `limit` for feeds (default: 20-50)
3. **No deep nesting** - Avoid `reviews { interview { reviews { ... } } }`
4. **Cache aggressively** - Use Apollo/Relay normalized cache

---

## 📋 Validation Checklist

Before shipping mobile:
- [ ] All queries use GraphQL (no REST)
- [ ] Auth via Bearer token (not cookies)
- [ ] Feed paginated
- [ ] Minimal field selection
- [ ] Offline mode handled
- [ ] Guest + authenticated review submission tested

---

## 🔗 Endpoints

**Production:**
- GraphQL: `https://rate-my-teacher-api.fly.dev/graphql`

**Web App Reference:**
- https://hello-world-five-peach.vercel.app
