import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type FieldType =
  | "text"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "multiselect"
  | "date"
  | "time"
  | "scale";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for dropdown, radio, multiselect
  scaleMin?: number; // for scale
  scaleMax?: number; // for scale
}

export interface FormRecord {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  created_at: string;
}
