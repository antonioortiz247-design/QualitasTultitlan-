create extension if not exists pgcrypto;

create table if not exists public.solicitudes_cotizacion (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default (
    'QT-' || to_char(timezone('America/Mexico_City', now()), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  nombre text not null,
  telefono text not null,
  correo text not null,
  codigo_postal text not null,
  edad_conductor smallint not null check (edad_conductor between 16 and 100),
  uso_vehiculo text not null default 'Particular',
  marca text not null,
  modelo text not null,
  version text not null,
  anio smallint not null check (anio between 1980 and 2100),
  tipo_vehiculo text,
  cate text,
  cve text,
  clave_marca text,
  origen text,
  estado text not null default 'nuevo'
    check (estado in ('nuevo', 'contactado', 'cotizado', 'cerrado', 'descartado')),
  aviso_privacidad_aceptado boolean not null default false
    check (aviso_privacidad_aceptado = true),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists solicitudes_cotizacion_creado_en_idx
  on public.solicitudes_cotizacion (creado_en desc);

create index if not exists solicitudes_cotizacion_estado_idx
  on public.solicitudes_cotizacion (estado);

alter table public.solicitudes_cotizacion enable row level security;

-- No se crean políticas para anon/authenticated: los prospectos no deben poder
-- consultar ni insertar directamente. La API del servidor usará la clave secreta
-- almacenada exclusivamente en variables de entorno.
revoke all on table public.solicitudes_cotizacion from anon, authenticated;
grant all on table public.solicitudes_cotizacion to service_role;
