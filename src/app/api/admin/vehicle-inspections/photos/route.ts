import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StoredPhoto = { path?: string; name?: string; type?: string; size?: number };

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(getAdminCookieName())?.value;
  if (!await verifyAdminSession(session)) return error('No autorizado.', 401);

  const id = request.nextUrl.searchParams.get('id') || '';
  const path = request.nextUrl.searchParams.get('path') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !path || path.includes('..') || !path.startsWith(id + '/')) {
    return error('La fotografía solicitada no es válida.', 400);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return error('Supabase no está configurado.', 503);

  try {
    const recordUrl = new URL('/rest/v1/inspecciones_vehiculares', url);
    recordUrl.searchParams.set('id', 'eq.' + id);
    recordUrl.searchParams.set('select', 'fotografias');
    recordUrl.searchParams.set('limit', '1');
    const recordResponse = await fetch(recordUrl, {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      cache: 'no-store',
    });
    if (!recordResponse.ok) throw new Error('No se pudo verificar el registro.');
    const rows = await recordResponse.json();
    const photos: StoredPhoto[] = rows?.[0]?.fotografias || [];
    const photo = photos.find(item => item.path === path);
    if (!photo) return error('La fotografía no pertenece a esta inspección.', 404);

    const fileResponse = await fetch(
      new URL('/storage/v1/object/inspecciones-vehiculares/' + path.split('/').map(encodeURIComponent).join('/'), url),
      { headers: { apikey: key, Authorization: 'Bearer ' + key }, cache: 'no-store' },
    );
    if (!fileResponse.ok || !fileResponse.body) {
      if (fileResponse.status === 404) return error('No se encontró el archivo en almacenamiento.', 404);
      throw new Error('No se pudo descargar el archivo.');
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const contentType = allowedTypes.has(photo.type || '') ? photo.type! : 'application/octet-stream';
    const fallbackName = path.split('/').pop() || 'fotografia';
    const originalName = (photo.name || fallbackName).replace(/[\r\n"]/g, '_').slice(0, 120);
    const safeAsciiName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_') || fallbackName;
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="' + safeAsciiName + '"; filename*=UTF-8\'\'' + encodeURIComponent(originalName),
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    });
    if (photo.size && Number.isFinite(photo.size)) headers.set('Content-Length', String(photo.size));
    return new NextResponse(fileResponse.body, { status: 200, headers });
  } catch (cause) {
    console.error('[admin-inspection-photo] download failed', cause instanceof Error ? cause.message : 'unknown');
    return error('No se pudo descargar la fotografía.', 502);
  }
}
