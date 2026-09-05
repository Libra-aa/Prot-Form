"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmMsg(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setConfirmMsg("Account created. Check your email to confirm, then log in.");
        setMode("login");
      }
      return;
    }

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setConfirmMsg("Password reset link sent. Check your email.");
        setMode("login");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function switchMode(next: "login" | "signup" | "forgot") {
    setMode(next);
    setError(null);
    setConfirmMsg(null);
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-semibold mb-1">
        {mode === "login" && "Log in"}
        {mode === "signup" && "Create account"}
        {mode === "forgot" && "Reset password"}
      </h1>
      <p className="text-muted text-sm mb-6">
        {mode === "login" && "Access your saved forms and responses."}
        {mode === "signup" && "Create an account to save and manage your forms."}
        {mode === "forgot" && "Enter your email and we'll send you a reset link."}
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="field">
          <input
            type="email"
            placeholder=" "
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>

        {mode !== "forgot" && (
          <div className="field relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <label>Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-sm"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        )}

        {mode === "login" && (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            className="text-sm text-accent"
          >
            Forgot password?
          </button>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {confirmMsg && <p className="text-sm text-green-700">{confirmMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white rounded-xl py-3 font-medium"
        >
          {loading
            ? "Please wait…"
            : mode === "login"
            ? "Log in"
            : mode === "signup"
            ? "Sign up"
            : "Send reset link"}
        </button>
      </form>

      <button
        onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
        className="w-full text-center text-sm text-accent mt-4"
      >
        {mode === "signup"
          ? "Already have an account? Log in"
          : "Don't have an account? Sign up"}
      </button>

      {mode === "forgot" && (
        <button
          onClick={() => switchMode("login")}
          className="w-full text-center text-sm text-muted mt-2"
        >
          Back to log in
        </button>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="max-w-sm mx-auto px-5 py-16 text-muted">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
