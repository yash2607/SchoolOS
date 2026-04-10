/**
 * Cursor-based pagination response (Tech Spec Section 5.4)
 * All list endpoints use cursor-based pagination (not offset).
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    /** null means no more pages */
    nextCursor: string | null;
    hasMore: boolean;
    /** Only returned if explicitly requested via ?count=true */
    total?: number;
  };
}

export interface PaginationRequest {
  limit?: number;
  cursor?: string;
  count?: boolean;
}
