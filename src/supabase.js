import { createClient, SupabaseAuthAdapter } from "../assets/vendor/neon-js.js";

const config = window.LOOPLY_CONFIG || {};
const authUrl = String(config.neonAuthUrl || "").trim();
const dataApiUrl = String(config.neonDataApiUrl || "").trim();

function isAllowedProjectUrl(value) {
  try {
    const parsed = new URL(value);
    const isNeonHost = parsed.protocol === "https:" && parsed.hostname.endsWith(".neon.tech");
    const isLocalHost = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
    return isNeonHost || isLocalHost;
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  config.backendProvider === "neon" && isAllowedProjectUrl(authUrl) && isAllowedProjectUrl(dataApiUrl);

export const supabase = isSupabaseConfigured
  ? createClient({
      auth: { adapter: SupabaseAuthAdapter(), url: authUrl },
      dataApi: { url: dataApiUrl }
    })
  : null;

// Provider-neutral aliases for new V3 modules. The compatibility exports above
// keep the existing application imports stable while each module is ported.
export const isBackendConfigured = isSupabaseConfigured;
export const backend = supabase;

