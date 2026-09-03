"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, FormRecord } from "@/lib/supabaseClient";

interface ResponseRecord {
  id: string;
  answers: Record<string, string>;
  submitted_at: string;
}

export default function ResponsesPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data: formData } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
      setForm(formData as FormRecord);

      const { data: responseData } = await supabase
        .from("responses")
        .select("*")
        .eq("form_id", id)
        .order("submitted_at", { ascending: false });
      setResponses((responseData as ResponseRecord[]) || []);

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <main className="max-w-xl mx-auto px-5 py-10 text-muted">Loading…</main>;
  }

  if (!form) {
    return (
      <main className="max-w-xl mx-auto px-5 py-10">
        <p className="text-muted">This form doesn't exist.</p>
      </main>
    );
  }

  const orderedFieldIds = form.fields.map((f) => f.id);

  function labelFor(fieldId: string) {
    const field = form!.fields.find((f) => f.id === fieldId);
    return field ? field.label : "Removed question";
  }

  function orderedEntries(answers: Record<string, string>) {
    const entries = Object.entries(answers);
    return entries.sort((a, b) => {
      const aIndex = orderedFieldIds.indexOf(a[0]);
      const bIndex = orderedFieldIds.indexOf(b[0]);
      const aPos = aIndex === -1 ? Infinity : aIndex;
      const bPos = bIndex === -1 ? Infinity : bIndex;
      return aPos - bPos;
    });
  }

  // Filter: keep a response if ANY answer text contains the search term
  const filteredResponses = responses.filter((r) => {
    if (!search.trim()) return true;
    const haystack = Object.values(r.answers).join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function downloadCSV() {
    const headers = form!.fields.map((f) => f.label);
    const rows = filteredResponses.map((r) =>
      form!.fields.map((f) => {
        const val = r.answers[f.id] ?? "";
        // Escape quotes and wrap in quotes if it contains a comma
        const safe = String(val).replace(/"/g, '""');
        return `"${safe}"`;
      })
    );

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form!.title || "responses"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">{form.title || "Untitled form"}</h1>
      </div>
      <p className="text-muted text-sm mb-4">
        {filteredResponses.length} of {responses.length}{" "}
        {responses.length === 1 ? "response" : "responses"}
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search responses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-line outline-none focus:border-accent"
        />
        <button
          onClick={downloadCSV}
          disabled={responses.length === 0}
          className="bg-accent text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap disabled:opacity-40"
        >
          Export
        </button>
      </div>

      {filteredResponses.length === 0 && (
        <p className="text-muted text-sm">
          {responses.length === 0 ? "No responses yet." : "No matches."}
        </p>
      )}

      <div className="space-y-3">
        {filteredResponses.map((response) => (
          <div key={response.id} className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-xs text-muted mb-4">
              {new Date(response.submitted_at).toLocaleString()}
            </p>
            <div className="space-y-3">
              {orderedEntries(response.answers).map(([fieldId, value]) => (
                <div key={fieldId}>
                  <p className="text-[15px] font-semibold text-ink">
                    {labelFor(fieldId)}
                  </p>
                  <p className="text-sm text-muted">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
