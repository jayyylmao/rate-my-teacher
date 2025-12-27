// GraphQL query definitions

/**
 * Get single interview with nested reviews and breakdown.
 * This is the canonical query for the interview detail page.
 */
export const INTERVIEW_QUERY = `
  query Interview($id: ID!) {
    interview(id: $id) {
      id
      company
      role
      level
      stage
      location
      createdAt
      averageRating
      reviewCount
      lastReviewedAt
      reviews {
        id
        rating
        comment
        reviewerName
        createdAt
        tags
        roundType
        interviewerInitials
        outcome
        helpfulCount
        viewerHasVoted
      }
      ratingBreakdown {
        rating
        count
      }
    }
  }
`;

/**
 * List interviews (summaries only, no nested reviews).
 */
export const INTERVIEWS_QUERY = `
  query Interviews($q: String, $company: String, $role: String, $level: String, $stage: String, $location: String, $sort: String, $limit: Int) {
    interviews(q: $q, company: $company, role: $role, level: $level, stage: $stage, location: $location, sort: $sort, limit: $limit) {
      items {
        id
        company
        role
        level
        stage
        location
        createdAt
        averageRating
        reviewCount
        lastReviewedAt
      }
      nextCursor
    }
  }
`;

export const TAGS_QUERY = `
  query Tags {
    tags {
      items {
        key
        label
        category
      }
    }
  }
`;

export const STATS_QUERY = `
  query Stats {
    stats {
      totalInterviews
      totalReviews
    }
  }
`;

/**
 * Get current user with their reviews (includes status for moderation).
 */
export const ME_QUERY = `
  query Me {
    me {
      id
      email
      roles
      myReviews {
        items {
          id
          interviewId
          rating
          comment
          reviewerName
          createdAt
          tags
          roundType
          interviewerInitials
          outcome
          status
          approvedAt
          interview {
            id
            company
            role
          }
        }
        count
      }
    }
  }
`;

/**
 * Get current user without reviews (lightweight auth check).
 */
export const ME_BASIC_QUERY = `
  query MeBasic {
    me {
      id
      email
      roles
    }
  }
`;

/**
 * Get company insights for an interview.
 * Returns full or preview based on contribution status.
 */
export const INSIGHTS_QUERY = `
  query Insights($interviewId: ID!) {
    insights(interviewId: $interviewId) {
      companyName
      totalReviews
      locked
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
        ratingChange
        direction
        recentReviewCount
        olderReviewCount
      }
      unlockMessage
      availableInsightsCount
      topTagsBlurred
    }
  }
`;

/**
 * Get interview with paginated reviews (mobile-friendly).
 * Use this instead of INTERVIEW_QUERY for better performance.
 */
export const INTERVIEW_PAGINATED_QUERY = `
  query InterviewPaginated($id: ID!, $first: Int, $after: String, $sort: String) {
    interview(id: $id) {
      id
      company
      role
      level
      stage
      location
      createdAt
      averageRating
      reviewCount
      lastReviewedAt
      ratingBreakdown {
        rating
        count
      }
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
            helpfulCount
            viewerHasVoted
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        totalCount
      }
    }
  }
`;
