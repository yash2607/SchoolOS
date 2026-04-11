import { configureApiClient, apiClient } from "@schoolos/api";
import { tokenStorage } from "./tokenStorage.js";

// Vite replaces import.meta.env.VITE_* at build time
// Fallback to production URL if env var not set
const BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "https://api.vidyalay.online";

apiClient.defaults.baseURL = BASE_URL;
configureApiClient(tokenStorage);

export { apiClient };
