"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAccount, savePassword } from "@/lib/admin/account";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/admin/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  adminEmail,
  createToken,
  verifyToken,
  type AdminClaim,
} from "@/lib/admin/session-token";

/** `email` is echoed back so the form keeps it after a failed attempt (React resets form fields). */
export type LoginState = { error: string | null; email: string };
export type SetupState = { error: string | null };

/** Compares two strings without leaking their length or where they differ. */
function sameText(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function configured(): boolean {
  return adminEmail() !== null && (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32;
}

async function startSession(claim: AdminClaim) {
  (await cookies()).set(SESSION_COOKIE, createToken("session", claim, SESSION_MAX_AGE_S), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!configured()) {
    return { error: "El acceso todavía no está configurado (faltan ADMIN_EMAIL o ADMIN_SESSION_SECRET).", email };
  }

  let account;
  try {
    account = await getAccount();
  } catch (error) {
    console.error("[admin] getAccount", error);
    return { error: "No se pudo conectar. Inténtalo de nuevo en un momento.", email };
  }
  if (!account) {
    return { error: "Todavía no has creado tu cuenta. Usa el enlace de invitación que te enviaron.", email };
  }

  // Always hash the password, so a wrong email takes as long as a wrong password.
  const passwordOk = await verifyPassword(password, account.passwordHash);
  if (!(sameText(email, account.email) && passwordOk)) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Correo o contraseña incorrectos.", email };
  }

  await startSession({ email: account.email, stamp: account.passwordStamp });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin/");
}

/**
 * Creates the account, or sets a new password, from an invite link. The link's
 * stamp must match the account's ("" while there is none) — saving replaces it,
 * so the same link can't be used twice. Signs her straight in.
 */
export async function completeSetup(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const claim = verifyToken("setup", String(formData.get("token") ?? ""));
  if (!claim) return { error: "Este enlace no es válido o ya caducó. Pide uno nuevo." };

  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres. Unas cuantas palabras juntas funcionan bien.` };
  }
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Las contraseñas no coinciden." };

  let stamp: string;
  try {
    const account = await getAccount();
    if ((account?.passwordStamp ?? "") !== claim.stamp) {
      return { error: "Este enlace ya se usó. Pide uno nuevo." };
    }
    stamp = await savePassword(claim.email, await hashPassword(password), account);
  } catch (error) {
    // A create or patch that lost a race lands here too — the link was just spent.
    console.error("[admin] completeSetup", error);
    return { error: "No se pudo guardar. Si ya usaste este enlace, pide uno nuevo." };
  }

  await startSession({ email: claim.email, stamp });
  redirect("/admin/");
}

export async function signOut(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login/");
}
