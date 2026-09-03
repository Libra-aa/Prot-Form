"use client";

import { FormField } from "@/lib/supabaseClient";

interface Props {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export default function FloatingField({ field, value, onChange }: Props) {
  const fieldId = `field-${field.id}`;

  if (field.type === "textarea") {
    return (
      <div className="field">
        <textarea
          id={fieldId}
          placeholder=" "
          rows={3}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label htmlFor={fieldId}>
          {field.label} {field.required && <span className="required">*</span>}
        </label>
      </div>
    );
  }

  if (field.type === "dropdown") {
    return (
      <div className={`field ${value ? "has-value" : ""}`}>
        <select
          id={fieldId}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value=""></option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label htmlFor={fieldId}>
          {field.label} {field.required && <span className="required">*</span>}
        </label>
        <span className="arrow">▾</span>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-2 py-3">
        <input
          type="checkbox"
          id={fieldId}
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="w-4 h-4"
        />
        <label htmlFor={fieldId} className="text-[15px] text-ink">
          {field.label} {field.required && <span className="required">*</span>}
        </label>
      </div>
    );
  }

  // default: text
  return (
    <div className="field">
      <input
        type="text"
        id={fieldId}
        placeholder=" "
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label htmlFor={fieldId}>
        {field.label} {field.required && <span className="required">*</span>}
      </label>
    </div>
  );
}
