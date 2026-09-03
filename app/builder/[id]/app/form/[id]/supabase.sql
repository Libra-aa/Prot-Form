-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table forms (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  fields jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references forms(id) on delete cascade,
  answers jsonb not null default '{}',
  submitted_at timestamptz not null default now()
);

-- Enable row level security
alter table forms enable row level security;
alter table responses enable row level security;

-- Open policies for now (no login system yet) — anyone can read/write.
-- Tighten these once you add authentication.
create policy "public read forms" on forms for select using (true);
create policy "public write forms" on forms for insert with check (true);
create policy "public update forms" on forms for update using (true);

create policy "public insert responses" on responses for insert with check (true);
create policy "public read responses" on responses for select using (true);
