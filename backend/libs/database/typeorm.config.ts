import { DataSource } from "typeorm";

/**
 * TypeORM DataSource configuration.
 * Uses schema-per-tenant: each school gets schema `school_{schoolId}`.
 * The TenantMiddleware sets search_path per request.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env["DATABASE_URL"],
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  ssl:
    process.env["DATABASE_SSL"] === "true"
      ? { rejectUnauthorized: false }
      : false,
  logging: process.env["APP_ENV"] === "development" ? ["error", "warn"] : ["error"],
  poolSize: 20,
  connectTimeoutMS: 10_000,
});

export const databaseConfig = {
  type: "postgres" as const,
  url: process.env["DATABASE_URL"],
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  ssl:
    process.env["DATABASE_SSL"] === "true"
      ? { rejectUnauthorized: false }
      : false,
  logging: process.env["APP_ENV"] === "development" ? ["error", "warn"] : ["error"],
  poolSize: 20,
};
