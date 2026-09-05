"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  if (done) {
    return (
      <main className="max-w-sm mx-auto px-5 py-16 text-center">
        <p className="text-lg font-medium">Password updated</p>
        <p className="text-muted text-sm mt-1">Taking you to log in…</p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-semibold mb-1">Set a new password</h1>
      <p className="text-muted text-sm mb-6">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm space-y-4">
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
          <label>New password</label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-sm"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white rounded-xl py-3 font-medium"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
