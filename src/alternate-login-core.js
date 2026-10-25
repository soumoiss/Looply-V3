// Shared core for secondary access to existing Looply accounts.
// Password checks must happen in the original Auth service, never in public JavaScript.
export function normalizeIdentity(value) {
  const identity = String(value ?? "").trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity) && identity.length <= 254)
    return { kind: "email", value: identity };
  if (/^[a-z0-9_]{3,30}$/.test(identity))
    return { kind: "username", value: identity };
  throw new Error("invalid_identity");
}

export async function authenticateOriginal(client, identityInput, password) {
  const identity = normalizeIdentity(identityInput);
  if (typeof password !== "string" || !password.length || password.length > 256)
    throw new Error("invalid_credentials");

  if (identity.kind === "email") {
    const { data, error } = await client.auth.signInWithPassword({ email: identity.value, password });
    if (error || !data?.session?.access_token) throw new Error("invalid_credentials");
  } else {
    const { data, error } = await client.functions.invoke("looply-login", {
      body: { username: identity.value, password }
    });
    if (error || !data?.access_token || !data?.refresh_token)
      throw new Error("invalid_credentials");

    const { data: saved, error: sessionError } = await client.auth.setSession({
      access_token: data.access_token, refresh_token: data.refresh_token
    });
    if (sessionError || !saved?.session?.access_token)
      throw new Error("session_not_created");
  }

  const { data: userData, error: userError } = await client.auth.getUser();
  const user = userData?.user;
  if (userError || !user?.id) throw new Error("session_not_created");
  return user;
}

export async function getOwnOriginalProfile(client, userId) {
  // The UUID is taken from a verified Auth session, never from a form field.
  if (!/^[a-f0-9-]{36}$/i.test(String(userId)))
    throw new Error("invalid_user");
  const { data, error } = await client.from("profiles")
    .select("id,username,display_name,bio,avatar_path,profile_visibility")
    .eq("id", userId).maybeSingle();
  if (error) throw new Error("profile_unavailable");
  if (!data || data.id !== userId) throw new Error("profile_not_found");
  return {
    id: data.id,
    username: data.username,
    display_name: data.display_name,
    bio: data.bio,
    profile_visibility: data.profile_visibility
  };
}
