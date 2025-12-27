// GraphQL mutation definitions

/**
 * Create a review. Returns minimal response.
 * Client should refetch interview query on success.
 */
export const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      status
    }
  }
`;

/**
 * Update a review. Returns minimal response.
 * Client should refetch as needed.
 */
export const UPDATE_REVIEW_MUTATION = `
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      id
      status
    }
  }
`;

/**
 * Delete a review.
 */
export const DELETE_REVIEW_MUTATION = `
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id) {
      success
    }
  }
`;
