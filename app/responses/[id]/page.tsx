"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, FormRecord, FormField } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ResponseRecord {
  id: string;
  answers: Record<string, string>;
  submitted_at: string;
}

interface StatBar {
  label: string;
  count: number;
}

const STAT_TYPES: FormField["type"][] = [
  "dropdown",
  "radio",
  "multiselect",
  "checkbox",
  "scale",
];

export default function ResponsesPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showStats, setShowStats] = useState(false);

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

  function fieldFor(fieldId: string): FormField | undefined {
    return form!.fields.find((f) => f.id === fieldId);
  }

  function displayValue(fieldId: string, value: string) {
    const field = fieldFor(fieldId);
    if (!value) return "—";
    if (field?.type === "scale") {
      const max = field.scaleMax ?? 5;
      return `${value}/${max}`;
    }
    return value;
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

  const filteredResponses = responses.filter((r) => {
    if (!search.trim()) return true;
    const haystack = Object.values(r.answers).join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function computeStats(field: FormField): StatBar[] {
    const counts: Record<string, number> = {};

    function bump(key: string) {
      counts[key] = (counts[key] || 0) + 1;
    }

    for (const r of filteredResponses) {
      const raw = r.answers[field.id];
      if (!raw) continue;

      if (field.type === "multiselect") {
        raw.split(",").forEach((opt) => opt && bump(opt));
      } else if (field.type === "checkbox") {
        bump(raw === "true" ? "Checked" : "Unchecked");
      } else if (field.type === "scale") {
        const max = field.scaleMax ?? 5;
        bump(`${raw}/${max}`);
      } else {
        bump(raw);
      }
    }

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  const statFields = form.fields.filter((f) => STAT_TYPES.includes(f.type));

  function downloadPDF() {
    const printFields = form!.fields
      .filter((f) => f.printOrder !== undefined && f.printOrder !== null)
      .sort((a, b) => (a.printOrder as number) - (b.printOrder as number));

    if (printFields.length === 0) {
      alert("No fields have a Print column number set yet. Open the form builder and set Print numbers on the questions you want in the export.");
      return;
    }

    const chronological = [...filteredResponses].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );

    const headers = ["S/N", ...printFields.map((f) => f.label)];
    const rows = chronological.map((r, i) => [
      String(i + 1),
      ...printFields.map((f) => {
        const raw = r.answers[f.id] ?? "";
        return displayValue(f.id, raw);
      }),
    ]);

    const doc = new jsPDF({ orientation: printFields.length > 4 ? "landscape" : "portrait" });
    doc.setFontSize(14);
    doc.text(form!.title || "Form responses", 14, 15);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [22, 101, 52] },
    });

    doc.save(`${form!.title || "responses"}.pdf`);
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

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0 bg-white rounded-lg px-3 py-2 text-sm border border-line outline-none focus:border-accent"
        />
        <button
          onClick={() => setShowStats((s) => !s)}
          disabled={responses.length === 0}
          className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap disabled:opacity-40"
        >
          {showStats ? "Hide Stats" : "Stats"}
        </button>
        <button
          onClick={downloadPDF}
          disabled={responses.length === 0}
          className="bg-accent text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap disabled:opacity-40"
        >
          Export PDF
        </button>
      </div>

      {showStats && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 space-y-6">
          <p className="text-sm font-semibold text-ink">Response statistics</p>
          {statFields.length === 0 && (
            <p className="text-sm text-muted">
              No multiple-choice, dropdown, checkbox, or scale questions to chart yet.
            </p>
          )}
          {statFields.map((field) => {
            const bars = computeStats(field);
            const total = bars.reduce((sum, b) => sum + b.count, 0);
            return (
              <div key={field.id}>
                <p className="text-sm text-ink mb-2">{field.label}</p>
                {bars.length === 0 && (
                  <p className="text-xs text-muted">No answers yet.</p>
                )}
                <div className="space-y-2">
                  {bars.map((bar) => {
                    const pct = total > 0 ? Math.round((bar.count / total) * 100) : 0;
                    return (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs text-muted mb-1">
                          <span>{bar.label}</span>
                          <span>
                            {bar.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                  <p className="text-base text-ink">{labelFor(fieldId)}</p>
                  <p className="text-[15px] font-bold text-ink">
                    {displayValue(fieldId, value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
