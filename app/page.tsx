"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, FormRecord } from "@/lib/supabaseClient";

export default function HomePage() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setForms(data as FormRecord[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your forms</h1>
        <Link
          href="/builder/new"
          className="bg-accent text-white text-sm px-4 py-2 rounded-lg"
        >
          + New form
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
          <div
            key={form.id}
            className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="font-medium">{form.title || "Untitled form"}</p>
              <p className="text-xs text-muted">
                {new Date(form.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/builder/${form.id}`} className="text-accent">
                Edit
              </Link>
              <Link href={`/form/${form.id}`} className="text-accent">
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
