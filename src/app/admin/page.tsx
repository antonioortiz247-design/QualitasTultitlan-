'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, RefreshCw, ClipboardList, PackageOpen, ExternalLink, Search, ClipboardCheck, MessageCircle, Phone, Eye, X, Save, Clock3 } from 'lucide-react';
import { siteConfig } from '@/config/site';

type Lead = { sourceKey:string; folio?:string; nombre?:string; telefono?:string; correo?:string; producto?:string; created_at?:string; origen?:string; tipo?:string; status:string; notes:string; history?:{status:string;note:string;created_at:string}[] };
const states = [{value:'nuevo',label:'Nuevo'},{value:'contactado',label:'Contactado'},{value:'seguimiento',label:'En seguimiento'},{value:'proceso',label:'En proceso'},{value:'atendido',label:'Atendido'},{value:'no_concretado',label:'No concretado'}];
const stateLabel = (value:string) => states.find(x=>x.value===value)?.label || 'Nuevo';

export default function AdminPage() {
  const [leads,setLeads]=useState<Lead[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [warnings,setWarnings]=useState<string[]>([]);
  const [searchTerm,setSearchTerm]=useState('');
  const [typeFilter,setTypeFilter]=useState('Todas');
  const [statusFilter,setStatusFilter]=useState('todos');
  const [active,setActive]=useState<Lead|null>(null);
  const [saving,setSaving]=useState(false);
  const [draftStatus,setDraftStatus]=useState('nuevo');
  const [draftNote,setDraftNote]=useState('');
  const router=useRouter();

  async function load(){
    setLoading(true);setError('');setWarnings([]);
    try{
      const response=await fetch('/api/admin/requests',{cache:'no-store'});
      if(response.status===401){router.replace('/admin/login');return;}
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'No se pudieron cargar las solicitudes.');
      setLeads(data.requests||[]);setWarnings(Array.isArray(data.warnings)?data.warnings:[]);
    }catch(e){setError(e instanceof Error?e.message:'Error al consultar solicitudes.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function logout(){await fetch('/api/admin/logout',{method:'POST'});router.replace('/admin/login');router.refresh();}
  const filtered=useMemo(()=>leads.filter(lead=>{
    const term=searchTerm.trim().toLocaleLowerCase('es-MX');
    return (typeFilter==='Todas'||lead.tipo===typeFilter)&&(statusFilter==='todos'||lead.status===statusFilter)&&(!term||[lead.folio,lead.nombre,lead.telefono,lead.correo,lead.producto,lead.origen].some(v=>String(v||'').toLocaleLowerCase('es-MX').includes(term)));
  }),[leads,searchTerm,typeFilter,statusFilter]);
  const count=(s:string)=>leads.filter(x=>x.status===s).length;
  function openDetails(lead:Lead){setActive(lead);setDraftStatus(lead.status);setDraftNote('');}
  async function saveTracking(){
    if(!active||saving)return;setSaving(true);setError('');
    try{
      const response=await fetch('/api/admin/requests',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sourceKey:active.sourceKey,status:draftStatus,note:draftNote})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo guardar el seguimiento.');
      setLeads(old=>old.map(x=>x.sourceKey===active.sourceKey?{...x,status:draftStatus,notes:data.notes||x.notes,history:data.history||x.history}:x));
      setActive(old=>old?{...old,status:draftStatus,notes:data.notes||old.notes,history:data.history||old.history}:old);setDraftNote('');
    }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');}
    finally{setSaving(false);}
  }
  function whatsapp(lead:Lead){
    const digits=(lead.telefono||'').replace(/\D/g,'');if(digits.length<10)return;
    const number=digits.startsWith('52')?digits:'52'+digits;
    const msg='Hola '+(lead.nombre||'')+', te contactamos de '+siteConfig.businessName+' para dar seguimiento a tu '+(lead.tipo==='Cotización'?'solicitud de cotización':'solicitud')+(lead.folio?' con folio '+lead.folio:'')+'. ¿Podemos ayudarte?';
    window.open('https://wa.me/'+number+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
  }

  return <main data-admin-panel className="min-h-screen bg-[#f7f8fa] text-[#25232a]">
    <header className="border-b border-[#e4e5e9] bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1"><Image src="/Q-morado.png" alt="Q de Quálitas" width={44} height={44} className="h-full w-full object-contain" priority/></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[#0096ae]">Quálitas Cuautitlán Romero Rubio</p><h1 className="text-lg font-bold sm:text-xl">Panel privado</h1></div></div>
      <div className="flex flex-wrap items-center gap-2"><a href="/admin/inspecciones" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0096ae] px-3 text-sm font-semibold text-[#007b8e]"><ClipboardCheck size={16}/> Inspecciones</a><a href="https://inventario-six-pi.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#941b80] px-3 text-sm font-semibold text-white"><PackageOpen size={16}/> Inventario <ExternalLink size={14}/></a><button onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e4e5e9] px-3 text-sm font-medium"><LogOut size={16}/> Salir</button></div>
    </div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold sm:text-3xl">Seguimiento de prospectos</h2><p className="mt-1 text-sm text-[#62616a]">Control comercial de contactos y cotizaciones recibidas.</p></div><button onClick={()=>void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8d9df] bg-white px-4 text-sm font-semibold"><RefreshCw size={16} className={loading?'animate-spin':''}/> Actualizar</button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[{label:'Total',value:leads.length,color:'#25232a'},{label:'Nuevos',value:count('nuevo'),color:'#941b80'},{label:'Contactados',value:count('contactado'),color:'#007b8e'},{label:'Seguimiento',value:count('seguimiento'),color:'#946200'},{label:'En proceso',value:count('proceso'),color:'#2563a6'},{label:'Atendidos',value:count('atendido'),color:'#15803d'}].map(x=><article key={x.label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{x.label}</p><p className="mt-1 text-2xl font-bold" style={{color:x.color}}>{loading?'—':x.value}</p></article>)}</div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4"><ClipboardList size={19} className="text-[#941b80]"/><h3 className="font-bold">Registros recibidos</h3><span className="ml-auto text-xs text-slate-500">{filtered.length} resultados</span></div>
        {error&&<p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{warnings.map(w=><p key={w} className="m-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{w}</p>)}
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_190px_190px]">
          <label className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><span className="sr-only">Buscar</span><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Buscar folio, cliente, teléfono o correo" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm"/></label>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="Todas">Todos los tipos</option><option value="Contacto">Contacto</option><option value="Cotización">Cotización</option></select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="todos">Todos los estatus</option>{states.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select>
        </div>
        {loading?<p className="p-8 text-sm text-slate-500">Cargando registros…</p>:filtered.length===0?<div className="p-8 text-center text-sm text-slate-500"><ClipboardList size={28} className="mx-auto mb-2"/>No hay registros para mostrar.</div>:<>
          <div className="grid gap-3 p-3 sm:p-4 md:hidden">{filtered.map((lead,i)=><article key={lead.sourceKey||i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-[#941b80]">{lead.folio||lead.tipo||'Solicitud'}</p><h4 className="mt-1 truncate font-bold">{lead.nombre||'Sin nombre'}</h4><p className="mt-1 text-xs text-slate-500">{lead.created_at?new Date(lead.created_at).toLocaleString('es-MX'):'Fecha no disponible'}</p></div><span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#941b80]">{stateLabel(lead.status)}</span></div>
            <p className="mt-3 text-sm text-slate-700">{lead.producto||lead.tipo||'Solicitud de contacto'}</p><p className="mt-1 text-xs text-slate-500">{lead.telefono||'Sin teléfono'} · {lead.correo||'Sin correo'}</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>whatsapp(lead)} disabled={!lead.telefono} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#009b70] px-3 text-sm font-bold text-white disabled:opacity-40"><MessageCircle size={16}/> WhatsApp</button><button onClick={()=>openDetails(lead)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#941b80] px-3 text-sm font-bold text-[#941b80]"><Eye size={16}/> Gestionar</button></div>
          </article>)}</div>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Folio','Cliente','Contacto','Solicitud','Estatus','Fecha','Acciones'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{filtered.map((lead,i)=><tr key={lead.sourceKey||i} className="border-t border-slate-100 align-top"><td className="px-4 py-4 font-bold text-[#941b80]">{lead.folio||'—'}</td><td className="px-4 py-4 font-semibold">{lead.nombre||'—'}</td><td className="px-4 py-4"><span>{lead.telefono||'—'}</span><span className="block text-xs text-slate-500">{lead.correo||''}</span></td><td className="px-4 py-4">{lead.producto||lead.tipo||'—'}</td><td className="px-4 py-4"><span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold">{stateLabel(lead.status)}</span></td><td className="whitespace-nowrap px-4 py-4 text-xs">{lead.created_at?new Date(lead.created_at).toLocaleString('es-MX'):'—'}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={()=>whatsapp(lead)} disabled={!lead.telefono} aria-label="WhatsApp" className="rounded-lg bg-[#009b70] p-2 text-white disabled:opacity-40"><MessageCircle size={17}/></button><button onClick={()=>openDetails(lead)} className="rounded-lg border border-[#941b80] p-2 text-[#941b80]" aria-label="Gestionar"><Eye size={17}/></button></div></td></tr>)}</tbody></table></div>
        </>}
      </section>
      <p className="mt-4 text-xs text-slate-500">El seguimiento es interno. Las cotizaciones y pólizas oficiales se gestionan en los sistemas autorizados de Quálitas.</p>
    </div>
    {active&&<div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null);}}><section role="dialog" aria-modal="true" aria-labelledby="lead-dialog-title" className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#0096ae]">{active.folio||active.tipo}</p><h3 id="lead-dialog-title" className="mt-1 text-xl font-bold">Gestionar prospecto</h3><p className="text-sm text-slate-500">{active.nombre}</p></div><button onClick={()=>setActive(null)} className="rounded-full border p-2" aria-label="Cerrar"><X size={18}/></button></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><a href={active.telefono?'tel:'+active.telefono:undefined} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold"><Phone size={16}/> Llamar</a><button onClick={()=>whatsapp(active)} disabled={!active.telefono} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#009b70] text-sm font-bold text-white disabled:opacity-40"><MessageCircle size={16}/> WhatsApp</button></div>
      <div className="mt-5"><label className="mb-1 block text-sm font-semibold">Estatus comercial</label><select value={draftStatus} onChange={e=>setDraftStatus(e.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 px-3">{states.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
      <div className="mt-4"><label className="mb-1 block text-sm font-semibold">Nota de seguimiento</label><textarea value={draftNote} onChange={e=>setDraftNote(e.target.value)} rows={3} maxLength={1000} placeholder="Ej. Se llamó, solicita cotización para mañana…" className="w-full rounded-xl border border-slate-200 p-3 text-sm"/></div>
      <button onClick={()=>void saveTracking()} disabled={saving} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#941b80] to-[#007f91] font-bold text-white disabled:opacity-50"><Save size={17}/>{saving?'Guardando…':'Guardar seguimiento'}</button>
      <div className="mt-6"><h4 className="flex items-center gap-2 font-bold"><Clock3 size={17} className="text-[#941b80]"/> Historial de actividad</h4>{active.history?.length?<ol className="mt-3 space-y-3">{active.history.map((h,i)=><li key={i} className="border-l-2 border-[#0096ae]/40 pl-3"><p className="text-sm font-semibold">{stateLabel(h.status)}</p>{h.note&&<p className="text-sm text-slate-600">{h.note}</p>}<p className="mt-1 text-xs text-slate-400">{new Date(h.created_at).toLocaleString('es-MX')}</p></li>)}</ol>:<p className="mt-2 text-sm text-slate-500">Aún no hay actividad registrada.</p>}</div>
    </section></div>}
  </main>;
}
