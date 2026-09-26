import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged service-role Supabase client.
 * ONLY for server-side trusted execution (API routes, Server Actions, Webhooks).
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser or client components.
 * In PostgreSQL / Supabase, the service_role automatically bypasses Row Level Security (RLS).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
