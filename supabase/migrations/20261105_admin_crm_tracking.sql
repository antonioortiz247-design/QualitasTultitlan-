-- CRM administrativo Quálitas Cuautitlán Romero Rubio
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- No modifica ni elimina los registros originales de cotizaciones, contactos o inspecciones.

create table if not exists public.admin_record_tracking (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  status text not null default 'nuevo',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_record_tracking_source_unique unique (source_type, source_id),
  constraint admin_record_tracking_status_check check (
    status in ('nuevo','contactado','seguimiento','proceso','atendido','no_concretado',
               'recibida','en_revision','observaciones','completada','cancelada')
  )
);

create table if not exists public.admin_record_activity (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  status text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists admin_record_tracking_lookup_idx
  on public.admin_record_tracking (source_type, source_id);
create index if not exists admin_record_activity_lookup_idx
  on public.admin_record_activity (source_type, source_id, created_at desc);

alter table public.admin_record_tracking enable row level security;
alter table public.admin_record_activity enable row level security;

-- El acceso se realiza exclusivamente desde las rutas API del servidor
-- mediante SUPABASE_SERVICE_ROLE_KEY. No se crean políticas para clientes públicos.
grant all on public.admin_record_tracking to service_role;
grant all on public.admin_record_activity to service_role;
