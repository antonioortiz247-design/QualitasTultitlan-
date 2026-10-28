create extension if not exists pgcrypto;

create table if not exists public.inspecciones_vehiculares (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default (
    'IV-' || to_char(timezone('America/Mexico_City', now()), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  token_hash text not null unique,
  nombre text not null,
  telefono text not null,
  correo text not null,
  tipo_vehiculo text not null check (tipo_vehiculo in ('Automóvil', 'Motocicleta')),
  marca text not null,
  modelo text not null,
  anio smallint not null check (anio between 1980 and 2100),
  placas text,
  color text,
  numero_serie text,
  observaciones_cliente text,
  fotografias jsonb not null default '[]'::jsonb,
  estado text not null default 'recibida'
    check (estado in ('recibida', 'en_revision', 'observaciones', 'completada', 'cancelada')),
  aviso_privacidad_aceptado boolean not null default false check (aviso_privacidad_aceptado = true),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists inspecciones_vehiculares_creado_en_idx
  on public.inspecciones_vehiculares (creado_en desc);
create index if not exists inspecciones_vehiculares_estado_idx
  on public.inspecciones_vehiculares (estado);

alter table public.inspecciones_vehiculares enable row level security;
revoke all on table public.inspecciones_vehiculares from anon, authenticated;
grant select, insert, update on table public.inspecciones_vehiculares to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inspecciones-vehiculares', 'inspecciones-vehiculares', false, 10485760,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- El acceso a datos y archivos se realiza exclusivamente desde la API del servidor con service_role.
