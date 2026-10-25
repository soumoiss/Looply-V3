// Temporary compatibility bridge for existing Looply identities.
// Uses only the same public publishable key already present in the original frontend.
// Do not place service_role keys, password hashes or private user data in this module.
// Remove when all six legacy accounts have been safely moved to self-managed auth.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";
const legacyUrl = "https://qixocgetiwlrsbadpbvh.supabase.co";
const publicKey = "sb_publishable_GEUz-cJM1qXuaR7KbM2EBA_vk1hGxdT";
export const legacySupabase = createClient(legacyUrl, publicKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true,
    storageKey: "looply-v3-legacy-compat-session" }
});
