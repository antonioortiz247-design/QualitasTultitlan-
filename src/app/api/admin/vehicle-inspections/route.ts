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
    const inspections = await response.json();
    let offset = 0;
    let inspectionCount = 0;
    let photoCount = 0;
    let photoBytes = 0;
    while (true) {
      const metricsUrl = new URL('/rest/v1/inspecciones_vehiculares', url);
      metricsUrl.searchParams.set('select', 'fotografias');
      metricsUrl.searchParams.set('order', 'creado_en.asc');
      metricsUrl.searchParams.set('limit', '1000');
      const metricsResponse = await fetch(metricsUrl, { headers: { apikey: key, Authorization: 'Bearer ' + key, Range: offset + '-' + (offset + 999), Prefer: 'count=exact' }, cache: 'no-store' });
      if (!metricsResponse.ok) throw new Error('No se pudo calcular el consumo de fotografías.');
      const rows = await metricsResponse.json();
      inspectionCount += rows.length;
      for (const row of rows) {
        for (const photo of Array.isArray(row.fotografias) ? row.fotografias : []) {
          photoCount++;
          photoBytes += Number(photo.size) || 0;
        }
      }
      if (rows.length < 1000) break;
      offset += 1000;
    }
    const storageLimitBytes = 1024 * 1024 * 1024;
    const estimatedPercent = Math.min(100, photoBytes / storageLimitBytes * 100);
    const warning = estimatedPercent >= 85 ? 'critical' : estimatedPercent >= 70 ? 'warning' : 'normal';
    return NextResponse.json({ inspections, storageMetrics: { inspectionCount, photoCount, photoBytes, storageLimitBytes, estimatedPercent, remainingBytes: Math.max(0, storageLimitBytes - photoBytes), warning } }, { headers: { 'Cache-Control': 'no-store' } });
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


export async function DELETE(request: NextRequest) {
  if (!await authorized(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  try {
    const body = await request.json();
    const ids: unknown = body.ids;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 200 || !ids.every((id): id is string => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id))) {
      return NextResponse.json({ error: 'Selecciona entre 1 y 200 registros válidos.' }, { status: 400 });
    }
    const uniqueIds = [...new Set(ids)];
    const { url, key } = await config();
    const rowsUrl = new URL('/rest/v1/inspecciones_vehiculares', url);
    rowsUrl.searchParams.set('select', 'id,folio,fotografias');
    rowsUrl.searchParams.set('id', 'in.(' + uniqueIds.join(',') + ')');
    const rowsResponse = await fetch(rowsUrl, {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      cache: 'no-store',
    });
    if (!rowsResponse.ok) throw new Error('No se pudieron consultar los registros seleccionados.');
    const rows = await rowsResponse.json();
    if (rows.length !== uniqueIds.length) return NextResponse.json({ error: 'Uno o más registros ya no existen. Actualiza la lista e inténtalo de nuevo.' }, { status: 409 });

    const paths: string[] = [];
    for (const row of rows) {
      for (const photo of Array.isArray(row.fotografias) ? row.fotografias : []) {
        if (typeof photo.path !== 'string' || !photo.path.startsWith(row.id + '/')) {
          return NextResponse.json({ error: 'Se detectó una ruta de fotografía no válida. No se eliminó ningún registro.' }, { status: 409 });
        }
        paths.push(photo.path);
      }
    }

    if (paths.length) {
      const storageResponse = await fetch(new URL('/storage/v1/object/inspecciones-vehiculares', url), {
        method: 'DELETE',
        headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: paths }),
        cache: 'no-store',
      });
      if (!storageResponse.ok) {
        console.error('[admin-inspections] selected photo cleanup failed', storageResponse.status, (await storageResponse.text()).slice(0, 300));
        return NextResponse.json({ error: 'No se pudieron eliminar las fotografías privadas. Los registros se conservaron.' }, { status: 502 });
      }
    }

    const deleteUrl = new URL('/rest/v1/inspecciones_vehiculares', url);
    deleteUrl.searchParams.set('id', 'in.(' + uniqueIds.join(',') + ')');
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'return=representation', 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!deleteResponse.ok) {
      console.error('[admin-inspections] selected records delete failed', deleteResponse.status, (await deleteResponse.text()).slice(0, 300));
      return NextResponse.json({ error: 'Las fotografías se eliminaron, pero no se pudieron eliminar los registros. Contacta al administrador.' }, { status: 502 });
    }
    const deleted = await deleteResponse.json();
    return NextResponse.json({ ok: true, deletedCount: Array.isArray(deleted) ? deleted.length : uniqueIds.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[admin-inspections] selected cleanup failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'No se pudieron eliminar los registros seleccionados.' }, { status: 502 });
  }
}
