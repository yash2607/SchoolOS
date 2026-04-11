import type { TokenStorage } from "@schoolos/api";

const ACCESS_KEY = "schoolos_access_token";
const REFRESH_KEY = "schoolos_refresh_token";

export const tokenStorage: TokenStorage = {
  getAccessToken: async () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: async () => localStorage.getItem(REFRESH_KEY),
  setTokens: async (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: async () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
