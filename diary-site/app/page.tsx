"use client";
import { useState, useActionState } from "react";
import { login, register } from "@/app/actions/auth";

type State = { error?: string } | null;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loginState, loginAction, loginPending] = useActionState<State, FormData>(login as any, null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [regState, regAction, regPending] = useActionState<State, FormData>(register as any, null);

  const state = mode === "login" ? loginState : regState;
  const action = mode === "login" ? loginAction : regAction;
  const pending = mode === "login" ? loginPending : regPending;

  return (
    <main className="min-h-screen bg-[#0e0c0a] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-light text-stone-100 tracking-wide">мой дневник</h1>
          <p className="text-stone-500 text-sm">тихое место для твоих мыслей</p>
        </div>

        <form action={action} className="bg-stone-900/70 backdrop-blur border border-stone-700/40 rounded-2xl p-6 space-y-4">
          {mode === "register" && (
            <input
              name="name"
              placeholder="Имя (необязательно)"
              className="w-full bg-stone-800/60 border border-stone-700/40 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-500 outline-none focus:border-amber-500/40 transition"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full bg-stone-800/60 border border-stone-700/40 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-500 outline-none focus:border-amber-500/40 transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            required
            className="w-full bg-stone-800/60 border border-stone-700/40 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-500 outline-none focus:border-amber-500/40 transition"
          />
          {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 text-sm border border-amber-500/30 hover:bg-amber-500/30 transition disabled:opacity-50"
          >
            {pending ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-600">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-stone-400 hover:text-stone-200 transition"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </main>
  );
}
