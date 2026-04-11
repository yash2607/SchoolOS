import { configureApiClient, apiClient } from "@schoolos/api";
import { tokenStorage } from "./tokenStorage.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL ?? "https://api.vidyalay.online";

apiClient.defaults.baseURL = BASE_URL;
configureApiClient(tokenStorage);

export { apiClient };
