"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, FormRecord } from "@/lib/supabaseClient";
import FloatingField from "@/components/FloatingField";

export default function PublicFormPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
      setForm(data as FormRecord);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("responses").insert({
      form_id: id,
      answers,
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (loading) {
    return <main className="max-w-md mx-auto px-5 py-10 text-muted">Loading…</main>;
  }

  if (!form) {
    return (
      <main className="max-w-md mx-auto px-5 py-10">
        <p className="text-muted">This form doesn't exist.</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="max-w-md mx-auto px-5 py-16 text-center">
        <p className="text-lg font-medium">Response recorded</p>
        <p className="text-muted text-sm mt-1">Thanks for filling this out.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-5 py-10">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h1 className="text-xl font-semibold">{form.title || "Untitled form"}</h1>
        {form.description && (
          <p className="text-muted text-sm mt-1">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-1">
        {form.fields.map((field) => (
          <FloatingField
            key={field.id}
            field={field}
            value={answers[field.id] || ""}
            onChange={(value) =>
              setAnswers((prev) => ({ ...prev, [field.id]: value }))
            }
          />
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 bg-accent text-white rounded-xl py-3 font-medium"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
