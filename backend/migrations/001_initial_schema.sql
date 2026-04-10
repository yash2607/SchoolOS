-- SchoolOS Initial Schema Migration
-- Each school gets its own PostgreSQL schema: school_{schoolId}
-- Run via: npm run create-tenant -- --schoolId=<id> --name=<name>
-- Tech Spec Section 5.2

-- ============================================================
-- GLOBAL TABLES (in 'public' schema, shared across all tenants)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(300) NOT NULL,
  logo_url      TEXT,
  timezone      VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  subdomain     VARCHAR(100) UNIQUE NOT NULL,
  data_region   VARCHAR(50) NOT NULL DEFAULT 'ap-south-1',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_subdomain ON public.schools (subdomain);

-- ============================================================
-- TENANT SCHEMA TABLES (replicated per school schema)
-- ============================================================

-- This function creates a new school schema and runs all tenant-level migrations
CREATE OR REPLACE FUNCTION public.provision_tenant(p_school_id TEXT, p_school_name TEXT)
RETURNS void AS $$
DECLARE
  schema_name TEXT := 'school_' || p_school_id;
BEGIN
  -- Create schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

  -- Set search path for this session
  EXECUTE format('SET search_path TO %I, public', schema_name);

  -- Create all tenant tables (called from createTenant.ts script)
  PERFORM public.create_tenant_tables(schema_name);

  RAISE NOTICE 'Provisioned tenant schema: %', schema_name;
END;
$$ LANGUAGE plpgsql;
