/**
 * Tenant provisioning script
 * Usage: npm run create-tenant -- --schoolId=<id> --name=<name>
 *
 * Creates:
 * 1. Row in public.schools
 * 2. PostgreSQL schema school_{schoolId}
 * 3. All tables from 002_tenant_tables.sql
 * 4. Seed data: default grade levels, default fee types
 */

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(): { schoolId: string; name: string } {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (const arg of args) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key && value) result[key] = value;
  }

  if (!result["schoolId"]) throw new Error("--schoolId is required");
  if (!result["name"]) throw new Error("--name is required");

  // Validate schoolId: alphanumeric and underscores only
  if (!/^[a-zA-Z0-9_]+$/.test(result["schoolId"])) {
    throw new Error("--schoolId must be alphanumeric and underscores only");
  }

  return { schoolId: result["schoolId"], name: result["name"] };
}

async function createTenant(): Promise<void> {
  const { schoolId, name } = parseArgs();
  const schemaName = `school_${schoolId}`;

  const client = new Client({ connectionString: process.env["DATABASE_URL"] });

  try {
    await client.connect();
    console.log(`Provisioning tenant: ${schoolId} (${name})`);

    // 1. Insert into public.schools
    await client.query(
      `
      INSERT INTO public.schools (id, name, subdomain, timezone)
      VALUES (gen_random_uuid(), $1, $2, 'Asia/Kolkata')
      ON CONFLICT (subdomain) DO NOTHING
    `,
      [name, schoolId]
    );

    // 2. Create schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`Created schema: ${schemaName}`);

    // 3. Set search_path and run tenant tables migration
    await client.query(`SET search_path TO "${schemaName}", public`);

    const tenantSql = fs.readFileSync(
      path.join(__dirname, "002_tenant_tables.sql"),
      "utf-8"
    );
    await client.query(tenantSql);
    console.log("Created all tenant tables");

    // 4. Seed default data
    await seedDefaults(client, schoolId);

    console.log(`\n✅ Tenant ${schoolId} (${name}) provisioned successfully!`);
    console.log(`   Schema: ${schemaName}`);
  } finally {
    await client.end();
  }
}

async function seedDefaults(client: Client, _schoolId: string): Promise<void> {
  // Seed default academic year
  const yearResult = await client.query<{ id: string }>(
    `
    INSERT INTO academic_years (name, start_date, end_date, is_active)
    VALUES ('2025-2026', '2025-04-01', '2026-03-31', true)
    ON CONFLICT DO NOTHING
    RETURNING id
  `
  );

  const yearId = yearResult.rows[0]?.id;

  if (yearId) {
    // Seed terms
    await client.query(
      `
      INSERT INTO terms (academic_year_id, name, start_date, end_date, is_active)
      VALUES
        ($1, 'Term 1', '2025-04-01', '2025-09-30', true),
        ($1, 'Term 2', '2025-10-01', '2026-03-31', false)
      ON CONFLICT DO NOTHING
    `,
      [yearId]
    );

    // Seed grade levels (Nursery → 12)
    const grades = [
      "Nursery",
      "KG",
      "Grade 1",
      "Grade 2",
      "Grade 3",
      "Grade 4",
      "Grade 5",
      "Grade 6",
      "Grade 7",
      "Grade 8",
      "Grade 9",
      "Grade 10",
      "Grade 11",
      "Grade 12",
    ];

    for (let i = 0; i < grades.length; i++) {
      await client.query(
        `
        INSERT INTO grade_levels (name, sort_order)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
        [grades[i], i]
      );
    }
  }

  console.log("Seeded default data (academic year, terms, grade levels)");
}

createTenant().catch((err) => {
  console.error("❌ Tenant provisioning failed:", err);
  process.exit(1);
});
