-- Evidencia de consentimiento para mensajes de WhatsApp.
-- Ejecutar una sola vez en Supabase > SQL Editor.
alter table public.inspecciones_vehiculares
  add column if not exists whatsapp_marketing_consent boolean not null default false,
  add column if not exists whatsapp_consent_source text,
  add column if not exists whatsapp_consent_at timestamptz;

alter table public.inspecciones_vehiculares
  drop constraint if exists inspecciones_vehiculares_whatsapp_consent_source_check;
alter table public.inspecciones_vehiculares
  add constraint inspecciones_vehiculares_whatsapp_consent_source_check
  check (whatsapp_consent_source is null or whatsapp_consent_source in ('formulario_web'));

create table if not exists public.whatsapp_marketing_consents (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  consent_source text not null check (consent_source = 'staff_recorded'),
  consent_method text not null check (consent_method in ('verbal', 'written', 'digital')),
  purpose text not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists whatsapp_marketing_consents_phone_date_idx
  on public.whatsapp_marketing_consents (phone, consented_at desc);
alter table public.whatsapp_marketing_consents enable row level security;
revoke all on table public.whatsapp_marketing_consents from anon, authenticated;
grant select, insert on table public.whatsapp_marketing_consents to service_role;
