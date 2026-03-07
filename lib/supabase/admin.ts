import { createClient } from '@supabase/supabase-js';

// Admin client using the service role key — bypasses RLS
// Only use this on the SERVER SIDE (API routes, server components)
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing SUPABASE_SERVICE_ROLE_KEY. Add it to your .env.local file.\n' +
            'Find it at: https://supabase.com/dashboard/project/_/settings/api'
        );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
