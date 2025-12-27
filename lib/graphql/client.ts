// GraphQL client for Spring Boot backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://rate-my-teacher-api.fly.dev';

const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

export class GraphQLError extends Error {
  constructor(
    message: string,
    public errors?: Array<{ message: string; path?: string[] }>,
    public data?: unknown
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

/**
 * Execute a GraphQL query or mutation
 */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new GraphQLError(
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const message = result.errors.map(e => e.message).join(', ');
    throw new GraphQLError(message, result.errors, result.data);
  }

  if (!result.data) {
    throw new GraphQLError('No data returned from GraphQL');
  }

  return result.data;
}

/**
 * Get the GraphQL endpoint URL (useful for debugging)
 */
export function getGraphQLEndpoint(): string {
  return GRAPHQL_ENDPOINT;
}
