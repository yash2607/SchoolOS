import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_TIMEOUT_MS } from "@schoolos/config";
import type { ApiError } from "@schoolos/types";

// Token storage abstraction — real implementation uses expo-secure-store
// This allows the API package to be platform-agnostic
export interface TokenStorage {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (access: string, refresh: string) => Promise<void>;
  clearTokens: () => Promise<void>;
}

let tokenStorage: TokenStorage | null = null;
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

export function configureApiClient(storage: TokenStorage): void {
  tokenStorage = storage;
}

export const apiClient: AxiosInstance = axios.create({
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tokenStorage) {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response interceptor: handle 401 with silent refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest["_retry"]
    ) {
      originalRequest["_retry"] = true;

      if (isRefreshing) {
        // Wait for current refresh to complete
        return new Promise<string>((resolve) => {
          pendingRequests.push(resolve);
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>)[
              "Authorization"
            ] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage?.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
          { refreshToken },
          { timeout: API_TIMEOUT_MS }
        );

        await tokenStorage?.setTokens(
          data.accessToken,
          data.refreshToken ?? refreshToken
        );

        pendingRequests.forEach((cb) => cb(data.accessToken));
        pendingRequests = [];

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        pendingRequests = [];
        await tokenStorage?.clearTokens();
        // Emit event for app to handle logout
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | ApiError
      | { message?: string | string[]; error?: { message?: string } }
      | undefined;

    const message =
      (typeof data === "object" && data && "error" in data && data.error?.message) ||
      (typeof data === "object" && data && "message" in data
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        : undefined) ||
      error.message ||
      (error.request ? "Unable to reach the server. Check your connection and try again." : undefined) ||
      "An unexpected error occurred";

    return {
      error: {
        code:
          (typeof data === "object" && data && "error" in data && data.error?.code) ||
          "UNKNOWN_ERROR",
        message,
        details:
          typeof data === "object" && data && "error" in data ? data.error?.details : undefined,
        requestId:
          (typeof data === "object" && data && "error" in data && data.error?.requestId) || "",
        timestamp:
          (typeof data === "object" && data && "error" in data && data.error?.timestamp) ||
          new Date().toISOString(),
      },
    };
  }
  return {
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      requestId: "",
      timestamp: new Date().toISOString(),
    },
  };
}
