import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use inside Server Components, Server Actions, and Route Handlers.
// Reads the logged-in user's session from cookies, so RLS policies apply
// exactly as they would in the browser.
export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component with no writable cookie store — safe to ignore
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // same as above
          }
        },
      },
    }
  );
}

// Admin/service-role client — bypasses RLS entirely. NEVER import this into
// client components; only use inside Route Handlers (app/api/**) for actions
// that must work regardless of who's logged in (e.g. writing a guest order,
// or admin bulk actions after we've already verified role server-side).
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
