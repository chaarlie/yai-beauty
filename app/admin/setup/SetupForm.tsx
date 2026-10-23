"use client";

import { useActionState, useState } from "react";
import { completeSetup, type SetupState } from "@/lib/admin/login";

// Kept in step with MIN_PASSWORD_LENGTH in lib/admin/password.ts, which the
// server enforces; this only stops an obviously short password before the trip.
const MIN_LENGTH = 10;

const INPUT =
  "w-full border border-rule-button bg-cream px-3.5 py-3 text-base text-ink outline-none transition-colors focus:border-clay";
const LABEL = "t-label mb-2 block text-secondary";

const INITIAL: SetupState = { error: null };

export default function SetupForm({ token, email, creating }: { token: string; email: string; creating: boolean }) {
  const [state, action, pending] = useActionState(completeSetup, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="w-full max-w-[400px] bg-cream p-7 shadow-[0_40px_90px_-40px_rgb(26_22_20/0.35)] sm:p-9">
      <input type="hidden" name="token" value={token} />

      <p className="t-eyebrow">Yai Beauty · Admin</p>
      <h1 className="mt-4 font-display text-[36px] leading-[1.1] font-light">
        {creating ? "Crea tu cuenta" : "Nueva contraseña"}
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] font-light text-secondary">
        {creating
          ? "Elige la contraseña con la que vas a entrar para editar tus ofertas."
          : "Elige una contraseña nueva. Cualquier otra sesión abierta se cerrará."}
      </p>

      <div className="mt-8 grid gap-5">
        <div>
          <label htmlFor="email" className={LABEL}>
            Correo
          </label>
          {/* Shown, not editable: the account is tied to this address. Present for
              password managers, which save the pair. */}
          <input id="email" type="email" value={email} readOnly autoComplete="username" className={`${INPUT} text-secondary`} />
        </div>

        <div>
          <label htmlFor="password" className={LABEL}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              required
              aria-describedby="password-hint"
              className={`${INPUT} pr-[92px]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-pressed={showPassword}
              aria-controls="password confirm"
              className="t-button-sm absolute top-1/2 right-2 -translate-y-1/2 px-3 py-2 text-clay hover:text-ink"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p id="password-hint" className="mt-2 text-[13px] leading-[1.5] text-muted">
            Al menos {MIN_LENGTH} caracteres. Unas cuantas palabras juntas funcionan bien.
          </p>
        </div>

        <div>
          <label htmlFor="confirm" className={LABEL}>
            Repite la contraseña
          </label>
          <input
            id="confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            required
            className={INPUT}
          />
        </div>

        {state.error ? (
          <p role="alert" className="bg-blush-50 px-3.5 py-3 text-[15px] leading-[1.5] text-[#8a3b2e]">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="t-button min-h-[52px] bg-ink text-cream transition-colors hover:bg-[#0f0c0b] disabled:opacity-60"
        >
          {pending ? "Guardando…" : creating ? "Crear cuenta" : "Guardar contraseña"}
        </button>
      </div>
    </form>
  );
}
