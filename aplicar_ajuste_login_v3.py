#!/usr/bin/env python3
"""One-time Looply V3 frontend adapter repair; run in repository root.
No passwords/keys here. SQL credentials are a separate private Neon operation.
"""
from pathlib import Path


def substitute(path, old, new):
    file = Path(path)
    original = file.read_text(encoding="utf-8")
    if old not in original or original.count(old) != 1:
        raise RuntimeError(f"Expected unique source block not found in {path}")
    file.write_text(original.replace(old, new), encoding="utf-8")
    print(f"Updated: {path}")


substitute("src/identities.js", '''export function emailForUsername(value) {
  const username = String(value ?? "").trim().toLowerCase();
  return isAllowedUsername(username) ? `${username}@${AUTH_EMAIL_DOMAIN}` : null;
}''', '''export function emailForUsername(value) {
  const username = String(value ?? "").trim().toLowerCase();
  const overrides = {
    gaberinjela: "gaberinjela@loooply.app",
    eukeiliane: "keilageo@loooply.app"
  };
  return overrides[username] || (isAllowedUsername(username) ? `${username}@${AUTH_EMAIL_DOMAIN}` : null);
}''')

substitute("src/login.js", '''import { captureIncomingSharedLink } from "./shared-link.js";''', '''import { captureIncomingSharedLink } from "./shared-link.js";
import { emailForUsername } from "./identities.js";''')

substitute("src/login.js", '''      // The previous username gateway belongs to Supabase; Neon Auth accepts email.
      if (!isEmailLogin && window.LOOPLY_CONFIG?.backendProvider === "neon") {
        status(message, "O login pelo nome de usuário ainda não foi migrado para o V3. Entre com o e-mail e a senha de uma conta já ativada no Neon. Senhas antigas ainda não foram transferidas.");
        return;
      }''', '''      // Resolve historical aliases without storing or checking a password in the client.
      if (!isEmailLogin && window.LOOPLY_CONFIG?.backendProvider === "neon" && !emailForUsername(username)) {
        status(message, "Usuário não encontrado no diretório do Looply V3.");
        return;
      }''')

substitute("src/login.js", '''        if (isEmailLogin) {
          const { data: emailAuthData, error: emailAuthError } = await supabase.auth.signInWithPassword({
            email: identity,
            password: secret
          });''', '''        if (isEmailLogin || window.LOOPLY_CONFIG?.backendProvider === "neon") {
          const email = isEmailLogin ? identity : emailForUsername(username);
          const { data: emailAuthData, error: emailAuthError } = await supabase.auth.signInWithPassword({
            email,
            password: secret
          });''')

substitute("src/page-runtime.js", '''async function loadProfile(userId) {
  const { data, error } = await supabase.from("profiles")
    .select("id,username,display_name,bio,profile_visibility,playlist_url,avatar_path,theme,font_family,font_size")
    .eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("O perfil desta conta não foi encontrado.");
  return data;
}''', '''async function loadProfile(userId) {
  if (window.LOOPLY_CONFIG?.backendProvider === "neon") {
    // Uses the server-verified mapping from Neon Auth user to original profile.
    const { data, error } = await supabase.from("v3_self_profile")
      .select("id,username,display_name,bio,avatar_path,theme").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Seu perfil original ainda não foi vinculado à conta Neon.");
    return { ...data, profile_visibility: "members", playlist_url: null, font_family: null, font_size: null };
  }
  const { data, error } = await supabase.from("profiles")
    .select("id,username,display_name,bio,profile_visibility,playlist_url,avatar_path,theme,font_family,font_size")
    .eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("O perfil desta conta não foi encontrado.");
  return data;
}''')

substitute("src/page-runtime.js", '''if (!profile.avatar_path && page !== "profile" && page !== "gallery") {''', '''if (window.LOOPLY_CONFIG?.backendProvider !== "neon" && !profile.avatar_path && page !== "profile" && page !== "gallery") {''')

substitute("tests/login-flow.test.mjs",
           "'FormData', 'console', source",
           "'FormData', 'console', 'emailForUsername', source")
substitute("tests/login-flow.test.mjs",
           '    { warn() {}, error() {} });',
           '    { warn() {}, error() {} }, username => ({ patati: "patati@loooply.app" }[username] || null));')
substitute("tests/login-flow.test.mjs",
           '  assert.match(message, /nome de usuário ainda não foi migrado/);',
           '  assert.match(message, /Usuário não encontrado no diretório/);')

print("Frontend patch complete. Run npm test; deploy only after CI passes.")
