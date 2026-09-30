import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged service-role Supabase client.
 * ONLY for server-side trusted execution (API routes, Server Actions, Webhooks).
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser or client components.
 * In PostgreSQL / Supabase, the service_role automatically bypasses Row Level Security (RLS).
 */
/**
 * Sanitizes Supabase Project URL by stripping:
 * - Trailing slashes
 * - Accidental /rest/v1 or /rest/v1/ paths copied from the Supabase API settings
 * - Leading/trailing whitespace
 */
export function getCleanSupabaseUrl(rawUrl?: string): string {
  const url = (rawUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Privileged service-role Supabase client.
 * ONLY for server-side trusted execution (API routes, Server Actions, Webhooks).
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser or client components.
 * In PostgreSQL / Supabase, the service_role automatically bypasses Row Level Security (RLS).
 */
export function createAdminClient() {
  const url = getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined"
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

