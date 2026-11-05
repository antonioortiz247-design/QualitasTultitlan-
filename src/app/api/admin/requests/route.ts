import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getRows(table:string, supabaseUrl:string, serviceKey:string) {
  const url=new URL('/rest/v1/'+table,supabaseUrl);url.searchParams.set('select','*');url.searchParams.set('limit','100');
  const response=await fetch(url,{headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey},cache:'no-store'});
  if(!response.ok)throw new Error('Supabase '+table+' respondió '+response.status+': '+(await response.text()).slice(0,300));
  return response.json() as Promise<Record<string,unknown>[]>;
}
function credentials(){const url=process.env.SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Supabase no está configurado.');return{url,key};}
async function admin(request:NextRequest){return verifyAdminSession(request.cookies.get(getAdminCookieName())?.value);}
async function trackingData(url:string,key:string){
  const headers={apikey:key,Authorization:'Bearer '+key};
  const [trackingRes,activityRes]=await Promise.all([
    fetch(new URL('/rest/v1/admin_record_tracking?select=*',url),{headers,cache:'no-store'}),
    fetch(new URL('/rest/v1/admin_record_activity?select=*&order=created_at.desc&limit=1000',url),{headers,cache:'no-store'}),
  ]);
  if(!trackingRes.ok||!activityRes.ok)throw new Error('Falta ejecutar el SQL de seguimiento en Supabase.');
  const tracking=await trackingRes.json() as Record<string,unknown>[];
  const activity=await activityRes.json() as Record<string,unknown>[];
  return {tracking,activity};
}

export async function GET(request:NextRequest){
  if(!await admin(request))return NextResponse.json({error:'No autorizado.'},{status:401});
  try{
    const {url,key}=credentials();
    const results=await Promise.allSettled([getRows('solicitudes_contacto',url,key),getRows('solicitudes_cotizacion',url,key)]);
    const [contactsResult,quotesResult]=results;
    const contacts=contactsResult.status==='fulfilled'?contactsResult.value:[];
    const quotes=quotesResult.status==='fulfilled'?quotesResult.value:[];
    if(contactsResult.status==='rejected'&&quotesResult.status==='rejected')return NextResponse.json({error:'Falló la consulta de solicitudes en Supabase.'},{status:502});
    const normalized=[...contacts.map(row=>({row,table:'solicitudes_contacto',tipo:'Contacto'})),...quotes.map(row=>({row,table:'solicitudes_cotizacion',tipo:'Cotización'}))].map(({row,table,tipo})=>{
      const folio=typeof row.folio==='string'?row.folio:'';
      const created=typeof row.created_at==='string'?row.created_at:(typeof row.creado_en==='string'?row.creado_en:'');
      const fallback=[row.telefono,created].filter(Boolean).join('|')||JSON.stringify(row);
      return {sourceKey:table+'|'+(folio||fallback),folio,nombre:typeof row.nombre==='string'?row.nombre:'',telefono:typeof row.telefono==='string'?row.telefono:'',correo:typeof row.correo==='string'?row.correo:'',producto:tipo==='Cotización'?[row.tipo_vehiculo,row.marca,row.modelo,row.anio].filter(Boolean).join(' '):(typeof row.producto==='string'?row.producto:''),origen:typeof row.origen==='string'?row.origen:'',created_at:created,tipo};
    });
    const warnings:string[]=[];
    if(contactsResult.status==='rejected')warnings.push('No se pudieron cargar los formularios de contacto.');
    if(quotesResult.status==='rejected')warnings.push('No se pudieron cargar las cotizaciones.');
    let tracking:Record<string,unknown>[]=[];let activity:Record<string,unknown>[]=[];
    try{({tracking,activity}=await trackingData(url,key));}catch{warnings.push('Ejecuta el SQL de seguimiento para habilitar estatus, notas e historial.');}
    const requests=normalized.map(item=>{
      const [sourceType,...sourceParts]=item.sourceKey.split('|');const sourceId=sourceParts.join('|');
      const saved=tracking.find(x=>x.source_type===sourceType&&x.source_id===sourceId);
      const history=activity.filter(x=>x.source_type===sourceType&&x.source_id===sourceId).map(x=>({status:String(x.status||'nuevo'),note:String(x.note||''),created_at:String(x.created_at||'')}));
      return {...item,status:String(saved?.status||'nuevo'),notes:String(saved?.notes||''),history};
    }).sort((a,b)=>(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0)).slice(0,200);
    return NextResponse.json({requests,warnings},{headers:{'Cache-Control':'no-store, max-age=0'}});
  }catch(error){console.error('[admin-requests] list failed',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'No se pudieron consultar las solicitudes.'},{status:502});}
}

export async function PATCH(request:NextRequest){
  if(!await admin(request))return NextResponse.json({error:'No autorizado.'},{status:401});
  try{
    const body=await request.json();
    const sourceKey=typeof body.sourceKey==='string'?body.sourceKey:'';
    const status=typeof body.status==='string'?body.status:'';
    const note=typeof body.note==='string'?body.note.trim().slice(0,1000):'';
    const allowed=['nuevo','contactado','seguimiento','proceso','atendido','no_concretado'];
    const separator=sourceKey.indexOf('|');
    if(separator<1||!['solicitudes_contacto','solicitudes_cotizacion'].includes(sourceKey.slice(0,separator))||!allowed.includes(status))return NextResponse.json({error:'Datos de seguimiento no válidos.'},{status:400});
    const sourceType=sourceKey.slice(0,separator);const sourceId=sourceKey.slice(separator+1);const {url,key}=credentials();
    const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
    const save=await fetch(new URL('/rest/v1/admin_record_tracking?on_conflict=source_type,source_id',url),{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({source_type:sourceType,source_id:sourceId,status,updated_at:new Date().toISOString()}),cache:'no-store'});
    if(!save.ok)throw new Error('No se pudo guardar el estatus. Verifica el SQL de seguimiento.');
    if(note){const activity=await fetch(new URL('/rest/v1/admin_record_activity',url),{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({source_type:sourceType,source_id:sourceId,status,note}),cache:'no-store'});if(!activity.ok)throw new Error('El estatus se guardó, pero no se pudo guardar la nota.');}
    const [tracking,history]=await Promise.all([
      fetch(new URL('/rest/v1/admin_record_tracking?select=notes&source_type=eq.'+encodeURIComponent(sourceType)+'&source_id=eq.'+encodeURIComponent(sourceId),url),{headers,cache:'no-store'}).then(x=>x.json()),
      fetch(new URL('/rest/v1/admin_record_activity?select=status,note,created_at&source_type=eq.'+encodeURIComponent(sourceType)+'&source_id=eq.'+encodeURIComponent(sourceId)+'&order=created_at.desc&limit=100',url),{headers,cache:'no-store'}).then(x=>x.json()),
    ]);
    return NextResponse.json({ok:true,notes:String(tracking?.[0]?.notes||''),history:(history||[]).map((x:Record<string,unknown>)=>({status:String(x.status||'nuevo'),note:String(x.note||''),created_at:String(x.created_at||'')}))},{headers:{'Cache-Control':'no-store'}});
  }catch(error){console.error('[admin-requests] update failed',error instanceof Error?error.message:'unknown');return NextResponse.json({error:error instanceof Error?error.message:'No se pudo guardar el seguimiento.'},{status:502});}
}
