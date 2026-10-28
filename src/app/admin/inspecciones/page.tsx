'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bike, CarFront, ClipboardCheck, ExternalLink, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

type Inspection = {
  id:string; folio:string; nombre:string; telefono:string; correo:string;
  tipo_vehiculo:string; marca:string; modelo:string; anio:number; placas?:string|null;
  color?:string|null; numero_serie?:string|null; observaciones_cliente?:string|null;
  fotografias:{path:string;name:string;type:string;size:number}[]; estado:string;
  creado_en:string; actualizado_en:string;
};
const statuses = [
  ['recibida','Recibida'],['en_revision','En revisión'],['observaciones','Con observaciones'],['completada','Completada'],['cancelada','Cancelada'],
];
export default function AdminInspectionsPage() {
  const [items,setItems] = useState<Inspection[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [filter,setFilter] = useState('todas');
  const [query,setQuery] = useState('');
  const router = useRouter();
  async function load() {
    setLoading(true);setError('');
    try {
      const response = await fetch('/api/admin/vehicle-inspections',{cache:'no-store'});
      if(response.status===401){router.replace('/admin/login');return;}
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'No se pudieron cargar las inspecciones.');
      setItems(data.inspections||[]);
    } catch(e) {setError(e instanceof Error?e.message:'Error al consultar inspecciones.');}
    finally {setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function updateStatus(id:string,estado:string) {
    const response=await fetch('/api/admin/vehicle-inspections',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,estado})});
    const data=await response.json();
    if(!response.ok){setError(data.error||'No se pudo actualizar.');return;}
    setItems(old=>old.map(item=>item.id===id?{...item,estado}:item));
  }
  function whatsapp(item:Inspection) {
    const digits=item.telefono.replace(/\D/g,'');
    const number=digits.startsWith('52')?digits:('52'+digits);
    const inspectionUrl=siteConfig.url+'/inspeccion-vehicular';
    const message='Hola '+item.nombre+', te contactamos de '+siteConfig.businessName+'. Para completar la inspección de tu '+item.tipo_vehiculo.toLowerCase()+' puedes ingresar a este enlace: '+inspectionUrl+'. Ten a la mano tu vehículo y toma fotografías claras de sus condiciones actuales. Folio de seguimiento: '+item.folio+'. La recepción no implica aprobación de la inspección ni emisión de póliza.';
    window.open('https://wa.me/'+number+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
  }
  const filtered=items.filter(item=>(filter==='todas'||item.estado===filter)&&[item.folio,item.nombre,item.telefono,item.marca,item.modelo,item.placas,item.tipo_vehiculo].some(v=>String(v||'').toLocaleLowerCase('es-MX').includes(query.trim().toLocaleLowerCase('es-MX'))));
  const count=(state:string)=>items.filter(i=>i.estado===state).length;
  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-7 text-[#25232a] sm:px-6 sm:py-10"><div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#941b80]/10 text-[#941b80]"><ShieldCheck size={25}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-[#0096ae]">{siteConfig.businessName}</p><h1 className="text-2xl font-bold">Inspección vehicular</h1></div></div><div className="flex gap-2"><a href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold"><ArrowLeft size={16}/> Panel</a><a href="/inspeccion-vehicular" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#941b80] px-3 text-sm font-bold text-white"><ExternalLink size={16}/> Formulario público</a></div></header>
    <section className="mt-5 grid gap-3 sm:grid-cols-4"><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Total</p><p className="mt-1 text-3xl font-bold">{loading?'—':items.length}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Recibidas</p><p className="mt-1 text-3xl font-bold text-[#941b80]">{loading?'—':count('recibida')}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">En revisión</p><p className="mt-1 text-3xl font-bold text-[#0096ae]">{loading?'—':count('en_revision')}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Con observaciones</p><p className="mt-1 text-3xl font-bold">{loading?'—':count('observaciones')}</p></article></section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><h2 className="flex items-center gap-2 font-bold"><ClipboardCheck className="text-[#941b80]"/> Solicitudes recibidas</h2><button onClick={()=>void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-60"><RefreshCw size={15} className={loading?'animate-spin':''}/> Actualizar</button></div>
    <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_220px]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar folio, cliente, placas o modelo" className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0096ae]"/><select value={filter} onChange={e=>setFilter(e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0096ae]"><option value="todas">Todos los estados</option>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    {error&&<p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading?<p className="p-8 text-sm text-slate-500">Cargando registros…</p>:filtered.length===0?<p className="p-8 text-sm text-slate-500">No hay inspecciones para mostrar.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Folio / fecha</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Vehículo</th><th className="px-4 py-3">Evidencia</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id} className="border-t border-slate-100 align-top"><td className="whitespace-nowrap px-4 py-4"><strong className="text-[#941b80]">{item.folio}</strong><span className="mt-1 block text-xs text-slate-500">{new Date(item.creado_en).toLocaleString('es-MX')}</span></td><td className="px-4 py-4"><strong>{item.nombre}</strong><a className="mt-1 block text-[#0096ae] hover:underline" href={'mailto:'+item.correo}>{item.correo}</a><span className="block text-xs text-slate-500">{item.telefono}</span>{item.observaciones_cliente&&<p className="mt-2 max-w-[220px] whitespace-normal text-xs text-slate-600">{item.observaciones_cliente}</p>}</td><td className="px-4 py-4"><span className="flex items-center gap-1 font-semibold">{item.tipo_vehiculo==='Motocicleta'?<Bike size={16}/>:<CarFront size={16}/>} {item.marca} {item.modelo}</span><span className="block text-xs text-slate-500">{item.anio} · {item.placas||'Sin placas registradas'} · {item.color||'Color no indicado'}</span>{item.numero_serie&&<span className="block text-xs text-slate-500">VIN: {item.numero_serie}</span>}</td><td className="px-4 py-4">{item.fotografias?.length?item.fotografias.length+' archivo(s) privado(s)':'Sin fotografías'}<span className="mt-1 block text-xs text-slate-500">Los archivos están en almacenamiento privado.</span></td><td className="px-4 py-4"><select aria-label={'Estado de '+item.folio} value={item.estado} onChange={e=>void updateStatus(item.id,e.target.value)} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold">{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></td><td className="px-4 py-4"><button onClick={()=>whatsapp(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0096ae] px-3 text-xs font-bold text-[#007b8e]"><MessageCircle size={15}/> WhatsApp</button></td></tr>)}</tbody></table></div>}</section>
    <p className="mt-4 text-xs leading-5 text-slate-500">La revisión registrada aquí es seguimiento interno. No representa una aprobación oficial ni sustituye los sistemas de suscripción de Quálitas.</p>
  </div></main>;
}
