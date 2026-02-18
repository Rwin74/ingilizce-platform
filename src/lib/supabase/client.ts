import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
    if (!supabaseUrl || !supabaseKey) {
        return null;
    }
    return createBrowserClient(supabaseUrl, supabaseKey);
}

// Singleton for convenience
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
    if (!_client) {
        _client = createClient();
    }
    return _client;
}
