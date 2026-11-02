import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Helper Supabase client sederhana untuk project NAIK (Summittact).
 * Menggunakan @supabase/supabase-js resmi tanpa kompleksitas SSR/auth untuk V1.
 *
 * Cara pakai:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from("nama_tabel").select();
 *
 * Atau langsung impor instance default:
 *   import { supabase } from "@/lib/supabase/client";
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabasePublishableKey);
}

export const supabase = createSupabaseClient(supabaseUrl, supabasePublishableKey);
