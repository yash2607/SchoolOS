import { QueryClient } from "@tanstack/react-query";
import { extractApiError } from "./client.js";

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes in cache
      retry: (failureCount: number, error: unknown) => {
        const apiErr = extractApiError(error);
        // Don't retry on auth or permission errors
        if (
          apiErr.error.code === "UNAUTHORIZED" ||
          apiErr.error.code === "FORBIDDEN"
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
