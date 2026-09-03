"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, FormField, FieldType } from "@/lib/supabaseClient";

function newField(): FormField {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "text",
    required: false,
    options: [],
  };
}

export default function BuilderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([newField()]);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setFields(data.fields && data.fields.length ? data.fields : [newField()]);
      }
    }
    load();
  }, [id, isNew]);

  function updateField(index: number, patch: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function addField() {
    setFields((prev) => [...prev, newField()]);
  }

  function updateOptions(index: number, raw: string) {
    const options = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField(index, { options });
  }

  async function saveForm() {
    setSaving(true);
    const payload = { title, description, fields };

    if (isNew) {
      const { data, error } = await supabase
        .from("forms")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (!error && data) {
        setShareUrl(`${window.location.origin}/form/${data.id}`);
        router.replace(`/builder/${data.id}`);
      }
    } else {
      const { error } = await supabase
        .from("forms")
        .update(payload)
        .eq("id", id);
      setSaving(false);
      if (!error) {
        setShareUrl(`${window.location.origin}/form/${id}`);
      }
    }
  }

  return (
    <main className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-semibold mb-6">
        {isNew ? "New form" : "Edit form"}
      </h1>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="field">
          <input
            type="text"
            placeholder=" "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label>Form title</label>
        </div>
        <div className="field">
          <input
            type="text"
            placeholder=" "
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label>Description (optional)</label>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Field label (e.g. Full Name)"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                className="flex-1 border-b border-line text-[15px] py-1 outline-none focus:border-accent"
              />
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(index, { type: e.target.value as FieldType })
                }
                className="border-b border-line text-[15px] py-1 outline-none bg-transparent"
              >
                <option value="text">Short text</option>
                <option value="textarea">Paragraph</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>

            {field.type === "dropdown" && (
              <input
                type="text"
                placeholder="Options, comma separated"
                value={(field.options || []).join(", ")}
                onChange={(e) => updateOptions(index, e.target.value)}
                className="w-full border-b border-line text-sm py-1 mb-3 outline-none focus:border-accent"
              />
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                />
                Required
              </label>
              <button
                onClick={() => removeField(index)}
                className="text-sm text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addField}
        className="w-full mt-4 border border-dashed border-line rounded-xl py-3 text-sm text-muted"
      >
        + Add field
      </button>

      <button
        onClick={saveForm}
        disabled={saving}
        className="w-full mt-6 bg-accent text-white rounded-xl py-3 font-medium"
      >
        {saving ? "Saving…" : "Save form"}
      </button>

      {shareUrl && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm text-sm">
          <p className="text-muted mb-1">Shareable link:</p>
          <a href={shareUrl} className="text-accent break-all">
            {shareUrl}
          </a>
        </div>
      )}
    </main>
  );
}
