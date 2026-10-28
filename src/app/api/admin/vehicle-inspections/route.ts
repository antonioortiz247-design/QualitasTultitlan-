import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authorized(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(getAdminCookieName())?.value);
}
async function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no está configurado.');
  return { url, key };
}

export async function GET(request: NextRequest) {
  if (!await authorized(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  try {
    const { url, key } = await config();
    const endpoint = new URL('/rest/v1/inspecciones_vehiculares', url);
    endpoint.searchParams.set('select', 'id,folio,nombre,telefono,correo,tipo_vehiculo,marca,modelo,anio,placas,color,numero_serie,observaciones_cliente,fotografias,estado,creado_en,actualizado_en');
    endpoint.searchParams.set('order', 'creado_en.desc');
    endpoint.searchParams.set('limit', '200');
    const response = await fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store' });
    if (!response.ok) throw new Error('Supabase respondió ' + response.status);
    return NextResponse.json({ inspections: await response.json() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[admin-inspections] list failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'No se pudieron cargar las inspecciones. Verifica la migración de Supabase.' }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!await authorized(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const estado = typeof body.estado === 'string' ? body.estado : '';
    const allowed = ['recibida', 'en_revision', 'observaciones', 'completada', 'cancelada'];
    if (!/^[0-9a-f-]{36}$/i.test(id) || !allowed.includes(estado)) return NextResponse.json({ error: 'Datos de actualización no válidos.' }, { status: 400 });
    const { url, key } = await config();
    const endpoint = new URL('/rest/v1/inspecciones_vehiculares?id=eq.' + id, url);
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ estado, actualizado_en: new Date().toISOString() }),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Supabase respondió ' + response.status);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[admin-inspections] update failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'No se pudo actualizar el estado.' }, { status: 502 });
  }
}
