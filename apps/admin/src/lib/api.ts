import { configureApiClient, apiClient } from "@schoolos/api";
import { tokenStorage } from "./tokenStorage.js";

// Always point to production API
apiClient.defaults.baseURL = "https://api.vidyalay.online";
configureApiClient(tokenStorage);

export { apiClient };
