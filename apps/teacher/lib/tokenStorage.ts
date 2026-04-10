import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@schoolos/api";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const tokenStorage: TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync("access_token", SECURE_STORE_OPTIONS);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync("refresh_token", SECURE_STORE_OPTIONS);
  },
  async setTokens(access: string, refresh: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync("access_token", access, SECURE_STORE_OPTIONS),
      SecureStore.setItemAsync("refresh_token", refresh, SECURE_STORE_OPTIONS),
    ]);
  },
  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync("access_token"),
      SecureStore.deleteItemAsync("refresh_token"),
    ]);
  },
};
