import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Auto-refresh token before it expires
        autoRefreshToken: true,
        // Persist session in cookies (managed by @supabase/ssr)
        persistSession: true,
        // Detect session in other tabs/windows
        detectSessionInUrl: true,
      },
    }
  );
}
