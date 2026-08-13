"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;

// Singleton so we don't spin up a new client on every import
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
