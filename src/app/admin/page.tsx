'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw, ShieldCheck, ClipboardList } from 'lucide-react';

type Lead = { folio?: string; nombre?: string; telefono?: string; correo?: string; producto?: string; created_at?: string; origen?: string; tipo?: string };

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const router = useRouter();

  async function load() {
    setLoading(true); setError(''); setWarnings([]);
    try {
      const response = await fetch('/api/admin/requests', { cache: 'no-store' });
      if (response.status === 401) { router.replace('/admin/login'); return; }
      const data = await response.json();
      if (!response.ok) {
        const details = typeof data.details === 'string'
          ? data.details
          : data.details && typeof data.details === 'object'
            ? Object.entries(data.details as Record<string, unknown>)
                .map(([table, message]) => table + ': ' + String(message))
                .join(' | ')
            : '';
        const errorId = typeof data.errorId === 'string' ? ' Código: ' + data.errorId : '';
        const hint = typeof data.hint === 'string' ? ' ' + data.hint : '';
        throw new Error([data.error || 'No se pudieron cargar las solicitudes.', details, errorId, hint].filter(Boolean).join(' '));
      }
      setLeads(data.requests || []);
      setWarnings(Array.isArray(data.warnings) ? data.warnings : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al consultar solicitudes.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  const countContact = leads.filter(x => x.tipo === 'Contacto').length;
  const countQuote = leads.filter(x => x.tipo === 'Cotización').length;

  return <main className="min-h-screen bg-[#f7f8fa] text-[#25232a]">
    <header className="border-b border-[#e4e5e9] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#941b80]/10 text-[#941b80]"><ShieldCheck/></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[#0096ae]">Quálitas Cuautitlán Romero Rubio</p><h1 className="text-lg font-bold sm:text-xl">Panel privado</h1></div></div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-[#e4e5e9] px-3 py-2 text-sm font-medium hover:bg-gray-50"><LogOut size={16}/> Salir</button>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold sm:text-3xl">Solicitudes de clientes</h2><p className="mt-1 text-sm text-[#62616a]">Consulta los registros recibidos desde el sitio web.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#d8d9df] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Actualizar</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#e4e5e9] bg-white p-5"><p className="text-sm text-[#62616a]">Solicitudes cargadas</p><p className="mt-2 text-3xl font-bold">{loading ? '—' : leads.length}</p></article>
        <article className="rounded-2xl border border-[#e4e5e9] bg-white p-5"><p className="text-sm text-[#62616a]">Formularios de contacto</p><p className="mt-2 text-3xl font-bold">{loading ? '—' : countContact}</p></article>
        <article className="rounded-2xl border border-[#e4e5e9] bg-white p-5"><p className="text-sm text-[#62616a]">Solicitudes de cotización</p><p className="mt-2 text-3xl font-bold">{loading ? '—' : countQuote}</p></article>
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[#e4e5e9] bg-white">
        <div className="flex items-center gap-2 border-b border-[#e4e5e9] px-5 py-4"><ClipboardList size={19} className="text-[#941b80]"/><h3 className="font-bold">Registros recientes</h3></div>
        {error && <div role="alert" className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {warnings.map((warning) => <div key={warning} role="status" className="mx-4 mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{warning}</div>)}
        {loading ? <p className="p-6 text-sm text-[#62616a]">Cargando solicitudes…</p> : !error && leads.length === 0 ? <div className="p-10 text-center"><ClipboardList size={30} className="mx-auto text-[#a5a5ae]"/><p className="mt-3 font-semibold">Todavía no hay solicitudes</p><p className="mt-1 text-sm text-[#62616a]">Cuando lleguen formularios, aparecerán aquí.</p></div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f7f8fa] text-xs uppercase tracking-wide text-[#62616a]"><tr><th className="px-5 py-3">Folio</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Contacto</th><th className="px-5 py-3">Producto</th><th className="px-5 py-3">Origen</th><th className="px-5 py-3">Fecha</th></tr></thead><tbody>{leads.map((lead,i)=><tr key={(lead.folio || '')+i} className="border-t border-[#eeeef1] align-top"><td className="whitespace-nowrap px-5 py-4 font-semibold text-[#941b80]">{lead.folio || '—'}</td><td className="px-5 py-4 font-medium">{lead.nombre || '—'}</td><td className="px-5 py-4"><a className="block text-[#0096ae] hover:underline" href={lead.telefono ? 'https://wa.me/52'+lead.telefono.replace(/\D/g,'') : undefined} target="_blank" rel="noreferrer">{lead.telefono || '—'}</a><span className="mt-1 block text-xs text-[#62616a]">{lead.correo || ''}</span></td><td className="px-5 py-4">{lead.producto || lead.tipo || '—'}</td><td className="px-5 py-4 max-w-[180px] truncate">{lead.origen || 'Sitio web'}</td><td className="whitespace-nowrap px-5 py-4">{lead.created_at ? new Date(lead.created_at).toLocaleString('es-MX') : '—'}</td></tr>)}</tbody></table></div>}
      </section>
      <p className="mt-4 text-xs leading-5 text-[#62616a]">Acceso restringido al administrador. Las solicitudes se consultan desde la base de datos y no se exponen en páginas públicas.</p>
    </div>
  </main>;
}
