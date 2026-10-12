create table if not exists public.solicitudes_contacto (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default (
    'QC-' || to_char(timezone('America/Mexico_City', now()), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  nombre text not null,
  telefono text not null,
  correo text not null,
  producto text not null check (producto in ('Auto', 'Moto', 'Pickup', 'Otro')),
  aviso_privacidad_aceptado boolean not null default false check (aviso_privacidad_aceptado = true),
  origen text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'cotizado', 'cerrado', 'descartado')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists solicitudes_contacto_creado_en_idx
  on public.solicitudes_contacto (creado_en desc);
create index if not exists solicitudes_contacto_estado_idx
  on public.solicitudes_contacto (estado);

alter table public.solicitudes_contacto enable row level security;
revoke all on table public.solicitudes_contacto from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert on table public.solicitudes_contacto to service_role;
