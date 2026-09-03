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

  function labelFor(fieldId: string) {
    const field = form!.fields.find((f) => f.id === fieldId);
    return field ? field.label : fieldId;
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-semibold mb-1">{form.title || "Untitled form"}</h1>
      <p className="text-muted text-sm mb-6">
        {responses.length} {responses.length === 1 ? "response" : "responses"}
      </p>

      {responses.length === 0 && (
        <p className="text-muted text-sm">No responses yet.</p>
      )}

      <div className="space-y-3">
        {responses.map((response) => (
          <div key={response.id} className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-xs text-muted mb-3">
              {new Date(response.submitted_at).toLocaleString()}
            </p>
            <div className="space-y-2">
              {Object.entries(response.answers).map(([fieldId, value]) => (
                <div key={fieldId}>
                  <p className="text-xs text-muted">{labelFor(fieldId)}</p>
                  <p className="text-sm">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
