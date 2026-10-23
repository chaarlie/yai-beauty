"use client";

import { useActionState, useState } from "react";
import { signIn, type LoginState } from "@/lib/admin/login";

// 16px inputs stop iOS zooming into the field.
const INPUT =
  "w-full border border-rule-button bg-cream px-3.5 py-3 text-base text-ink outline-none transition-colors focus:border-clay";
const LABEL = "t-label mb-2 block text-secondary";

const INITIAL: LoginState = { error: null, email: "" };

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="w-full max-w-[400px] bg-cream p-7 shadow-[0_40px_90px_-40px_rgb(26_22_20/0.35)] sm:p-9">
      <input type="hidden" name="next" value={next} />

      <p className="t-eyebrow">Yai Beauty · Admin</p>
      <h1 className="mt-4 font-display text-[36px] leading-[1.1] font-light">Entrar</h1>
      <p className="mt-2 text-[15px] leading-[1.6] font-light text-secondary">Ofertas y contenido de la página.</p>

      <div className="mt-8 grid gap-5">
        <div>
          <label htmlFor="email" className={LABEL}>
            Correo
          </label>
          {/* defaultValue from the action state: React clears form fields after an
              action, so a wrong password shouldn't make Yasmin retype her email. */}
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.email}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            className={INPUT}
          />
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
              autoComplete="current-password"
              required
              className={`${INPUT} pr-[92px]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-pressed={showPassword}
              aria-controls="password"
              className="t-button-sm absolute top-1/2 right-2 -translate-y-1/2 px-3 py-2 text-clay hover:text-ink"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
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
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </form>
  );
}
