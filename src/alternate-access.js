import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";
import { ALLOWED_USERNAMES } from "./identities.js";
import { authenticateOriginal, getOwnOriginalProfile } from "./alternate-login-core.js";

// This is the same public client configuration used by the original Looply.
// Actual passwords and their hashes are never included in the browser bundle.
const client = createClient(
  "https://qixocgetiwlrsbadpbvh.supabase.co",
  "sb_publishable_GEUz-cJM1qXuaR7KbM2EBA_vk1hGxdT",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "looply-auth"
    }
  }
);

const form = document.getElementById("alternateLogin");
const account = document.getElementById("account");
const message = document.getElementById("message");
const button = document.getElementById("submit");
const usernameList = document.getElementById("legacyUsernames");

for (const username of ALLOWED_USERNAMES) {
  const option = document.createElement("option");
  option.value = username;
  usernameList.append(option);
}

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

async function renderAccount(user) {
  const profile = await getOwnOriginalProfile(client, user.id);
  document.getElementById("profileName").textContent =
    profile.display_name || profile.username || "Seu perfil";
  document.getElementById("profileUsername").textContent = "@" + (profile.username || "");
  document.getElementById("profileBio").textContent = profile.bio || "Perfil carregado.";
  form.hidden = true;
  account.hidden = false;
  showMessage("Login confirmado. Seu perfil original foi carregado.");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (button.disabled) return;
  const identity = document.getElementById("identity").value;
  const passwordField = document.getElementById("secret");
  const password = passwordField.value;
  button.disabled = true;
  button.textContent = "Validando...";
  showMessage("");
  try {
    const user = await authenticateOriginal(client, identity, password);
    passwordField.value = "";
    try {
      await renderAccount(user);
    } catch {
      showMessage("Senha validada, mas o perfil original não pôde ser carregado. Confira se a conta ainda possui perfil.", "error");
    }
  } catch (error) {
    if (error?.message === "invalid_identity") {
      showMessage("Informe um usuário válido ou e-mail completo.", "error");
    } else {
      showMessage("Não foi possível autenticar com o servidor original. Confira os dados ou a disponibilidade do projeto antigo.", "error");
    }
  } finally {
    passwordField.value = "";
    button.disabled = false;
    button.textContent = "Entrar na conta antiga";
  }
});

document.getElementById("signOut").addEventListener("click", async () => {
  await client.auth.signOut();
  account.hidden = true;
  form.hidden = false;
  showMessage("Você saiu da conta.");
});

try {
  const { data: { user }, error } = await client.auth.getUser();
  if (!error && user?.id) await renderAccount(user);
} catch {
  // A network error must never grant access or reveal private profile data.
}
