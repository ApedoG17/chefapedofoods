import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function getCleanSupabaseUrl(rawUrl?: string): string {
  const url = (rawUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function createClient() {
  const url = getCleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return createBrowserClient<Database>(url, anonKey);
}

