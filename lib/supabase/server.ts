import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

import { getCleanSupabaseUrl } from "@/lib/supabase/client";

/**
 * Server-only client for user sessions and customer-facing queries.
 * Privileged writes (order creation, Hubtel webhooks) use createAdminClient() from lib/supabase/admin.ts.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be called from Server Component where cookies cannot be mutated
          }
        },
      },
    }
  );
}

