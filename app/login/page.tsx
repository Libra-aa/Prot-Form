"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

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
        setConfirmMsg("Account created. You can now log in.");
        setMode("login");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-semibold mb-1">
        {mode === "login" ? "Log in" : "Create account"}
      </h1>
      <p className="text-muted text-sm mb-6">
        {mode === "login"
          ? "Access your saved forms and responses."
          : "Create an account to save and manage your forms."}
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
        <div className="field">
          <input
            type="password"
            placeholder=" "
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {confirmMsg && <p className="text-sm text-green-700">{confirmMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white rounded-xl py-3 font-medium"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setConfirmMsg(null);
        }}
        className="w-full text-center text-sm text-accent mt-4"
      >
        {mode === "login"
          ? "Don't have an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </main>
  );
}
