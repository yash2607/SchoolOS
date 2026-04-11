import { configureApiClient, apiClient } from "@schoolos/api";
import { tokenStorage } from "./tokenStorage.js";

const BASE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_BASE_URL ?? "https://api.vidyalay.online";

apiClient.defaults.baseURL = BASE_URL;
configureApiClient(tokenStorage);

export { apiClient };
