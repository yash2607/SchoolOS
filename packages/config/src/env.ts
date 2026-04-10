import { z } from "zod";

// In React Native (Expo), plain process.env vars are NOT injected into the bundle
// unless prefixed with EXPO_PUBLIC_ (SDK 49+) or set via app.json extra.
// For Phase 0 dev, we read EXPO_PUBLIC_APP_ENV / EXPO_PUBLIC_API_BASE_URL and
// fall back to safe development defaults so the app boots without a .env file.
const rawEnv =
  typeof process !== "undefined"
    ? {
        APP_ENV:
          process.env["EXPO_PUBLIC_APP_ENV"] ??
          process.env["APP_ENV"],
        API_BASE_URL:
          process.env["EXPO_PUBLIC_API_BASE_URL"] ??
          process.env["API_BASE_URL"],
        SENTRY_DSN:
          process.env["EXPO_PUBLIC_SENTRY_DSN"] ?? process.env["SENTRY_DSN"],
        AMPLITUDE_API_KEY:
          process.env["EXPO_PUBLIC_AMPLITUDE_API_KEY"] ??
          process.env["AMPLITUDE_API_KEY"],
      }
    : {};

const envSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  API_BASE_URL: z.string().url().default("http://localhost:3001"),
  // AI key is NEVER on mobile — handled server-side
  SENTRY_DSN: z.string().optional(),
  AMPLITUDE_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten());
  // Only hard-fail in CI / production builds
  if (
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] === "production" &&
    process.env["CI"] === "true"
  ) {
    throw new Error("Invalid environment variables. Check your .env file.");
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      APP_ENV: "development" as const,
      API_BASE_URL: "http://localhost:3001",
      SENTRY_DSN: undefined,
      AMPLITUDE_API_KEY: undefined,
    };
