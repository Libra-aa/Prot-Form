"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, FormRecord } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0e27] text-white">
      <div className="max-w-xl mx-auto px-5">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center font-bold text-sm">
              M
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm">Melki</p>
              <p className="text-[10px] text-green-400 -mt-1">Online Form</p>
            </div>
          </div>
          <span className="text-sm border-b-2 border-green-400 pb-1">Home</span>
        </div>

        <div className="pt-12 pb-16">
          <span className="inline-block text-xs border border-white/30 rounded-full px-3 py-1 mb-6 text-white/80">
            Welcome to Melki Online Form
          </span>

          <h1 className="text-4xl font-extrabold leading-tight mb-6">
            <span className="text-white">Simplify.</span>
            <br />
            <span className="text-green-400">Collect.</span>
            <br />
            <span className="text-blue-400">Succeed.</span>
          </h1>

          <p className="text-white/70 text-sm mb-8">
            Create professional forms, collect well-organized responses, and
            manage your data efficiently — all in one platform.
          </p>

          <div className="flex gap-3 mb-8">
            <Link
              href="/login"
              className="flex-1 bg-green-500 text-white text-sm font-medium px-4 py-3 rounded-lg text-center"
            >
              Log in →
            </Link>
            <Link
              href="/login?mode=signup"
              className="flex-1 border border-white/30 text-white text-sm font-medium px-4 py-3 rounded-lg text-center"
            >
              Sign up
            </Link>
          </div>

          <p className="text-xs text-white/50 flex items-center gap-1">
            <span className="text-green-400">✓</span> Secure. Reliable. Easy
            to use.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getUser();
      const currentUser = sessionData.user;
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });
        if (!error && data) setForms(data as FormRecord[]);

        const { data: responseRows } = await supabase
          .from("responses")
          .select("form_id");
        if (responseRows) {
          const counts: Record<string, number> = {};
          for (const row of responseRows as { form_id: string }[]) {
            counts[row.form_id] = (counts[row.form_id] || 0) + 1;
          }
          setResponseCounts(counts);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function shareForm(formId: string) {
    const url = `${window.location.origin}/form/${formId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied:\n" + url);
    } catch {
      prompt("Copy this link:", url);
    }
  }

  async function deleteForm(formId: string) {
    const sure = confirm("Delete this form and all its responses? This can't be undone.");
    if (!sure) return;
    const { error } = await supabase.from("forms").delete().eq("id", formId);
    if (!error) {
      setForms((prev) => prev.filter((f) => f.id !== formId));
    }
  }

  if (loading) {
    return <main className="max-w-xl mx-auto px-5 py-10 text-muted">Loading…</main>;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <div className="relative bg-green-700 rounded-2xl p-6 mb-6 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-16 h-16 bg-white/20"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
        <h1 className="text-3xl font-extrabold text-white mb-1">Your forms</h1>
        <p className="text-sm italic text-green-100 mb-4">Melki Online Form</p>
        <div className="flex gap-2">
          <Link
            href="/builder/new"
            className="inline-block bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            + Create form
          </Link>
          <button
            onClick={handleLogout}
            className="inline-block bg-white/20 text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            Log out
          </button>
        </div>
      </div>

      {forms.length === 0 && (
        <p className="text-muted text-sm">
          No forms yet. Tap "+ Create form" to make your first one.
        </p>
      )}

      <div className="space-y-3">
        {forms.map((form) => (
          <div key={form.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-baseline gap-3 flex-wrap mb-1">
              <p className="text-lg font-bold text-ink">
                {form.title || "Untitled form"}
              </p>
              <Link href={`/builder/${form.id}`} className="text-accent text-sm">
                Edit
              </Link>
              <Link href={`/form/${form.id}`} className="text-accent text-sm">
                Fill
              </Link>
              <button
                onClick={() => shareForm(form.id)}
                className="text-accent text-sm"
              >
                Share
              </button>
              <Link href={`/responses/${form.id}`} className="text-accent text-sm">
                Responses ({responseCounts[form.id] ?? 0})
              </Link>
            </div>
            <p className="text-xs text-muted mb-1">
              {new Date(form.created_at).toLocaleDateString()}
            </p>
            <button
              onClick={() => deleteForm(form.id)}
              className="text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
