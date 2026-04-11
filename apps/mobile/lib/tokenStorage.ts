import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@schoolos/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const tokenStorage: TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY, SECURE_STORE_OPTIONS);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY, SECURE_STORE_OPTIONS);
  },

  async setTokens(access: string, refresh: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access, SECURE_STORE_OPTIONS),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh, SECURE_STORE_OPTIONS),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

export async function getBiometricRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync("rt_biometric", SECURE_STORE_OPTIONS);
}

export async function setBiometricRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("rt_biometric", token, SECURE_STORE_OPTIONS);
}

export async function clearBiometricRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync("rt_biometric");
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync("biometric_enabled", "true", SECURE_STORE_OPTIONS);
  } else {
    await SecureStore.deleteItemAsync("biometric_enabled");
    await clearBiometricRefreshToken();
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync("biometric_enabled", SECURE_STORE_OPTIONS);
  return val === "true";
}
