"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, FormRecord } from "@/lib/supabaseClient";

export default function HomePage() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
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

      setLoading(false);
    }
    load();
  }, []);

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

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <div className="relative bg-green-700 rounded-2xl p-6 mb-6 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-16 h-16 bg-white/20"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
        <h1 className="text-3xl font-extrabold text-white mb-1">Your forms</h1>
        <p className="text-sm italic text-green-100 mb-4">Melki Online Form</p>
        <Link
          href="/builder/new"
          className="inline-block bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          + Create form
        </Link>
      </div>

      {loading && <p className="text-muted text-sm">Loading…</p>}

      {!loading && forms.length === 0 && (
        <p className="text-muted text-sm">
          No forms yet. Create your first one.
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
