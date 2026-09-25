-- =============================================================================
-- 0001_users.sql — Tabel profil user internal (Tahapan 1: Auth & User Layer)
-- =============================================================================
-- Sumber skema: PRD Tahapan 1 §5.1. Skema, RLS, dan trigger di bawah ini
-- mengikuti PRD. Baris yang ditandai [TAMBAHAN] adalah penambahan di luar PRD
-- dan dijelaskan di `notes/TAHAPAN-1-NOTES.md`.
--
-- Cara menjalankan (pilih salah satu):
--   1. Supabase Dashboard → SQL Editor → tempel seluruh isi file → Run.
--   2. `supabase link --project-ref <ref>` lalu `supabase db push`.
--
-- File ini aman dijalankan berulang kali (idempotent).
-- =============================================================================

-- [TAMBAHAN] `if not exists` supaya file bisa dijalankan ulang tanpa error.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  name text,
  avatar text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  credits integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index untuk kolom yang sering di-query (CONVENTIONS.md §10).
create index if not exists users_email_idx on public.users (email);

-- Row Level Security: user hanya boleh membaca/mengubah barisnya sendiri.
alter table public.users enable row level security;

-- [TAMBAHAN] `drop policy if exists` supaya file idempotent.
drop policy if exists "users_select_own" on public.users;

create policy "users_select_own" on public.users for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;

create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Trigger: otomatis membuat baris profil setelah signup.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- [TAMBAHAN] Menjaga kolom `updated_at` tetap akurat.
-- PRD §5.1 tidak menyertakan trigger ini, sehingga `updated_at` akan selalu
-- sama dengan `created_at` tanpa ini. Hapus blok ini bila ingin persis
-- mengikuti PRD.
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_users_updated_at on public.users;

create trigger on_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- =============================================================================
-- Catatan keamanan (lihat notes/TAHAPAN-1-NOTES.md §9)
-- =============================================================================
-- Policy `users_update_own` mengikuti PRD apa adanya: user boleh meng-update
-- barisnya sendiri untuk semua kolom, termasuk `plan` dan `credits`. Bila nanti
-- kredit/plan dikelola server (Tahapan 13), persempit policy menjadi:
--
--   create policy "users_update_own_profile" on public.users
--     for update using (auth.uid() = id)
--     with check (
--       plan = (select plan from public.users where id = auth.uid())
--       and credits = (select credits from public.users where id = auth.uid())
--     );
