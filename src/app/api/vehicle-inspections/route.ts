import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = new Set(['image/jpeg']);

function text(value: FormDataEntryValue | null, max = 300): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const nombre = text(data.get('nombre'), 150);
    const telefono = text(data.get('telefono'), 30);
    const correo = text(data.get('correo'), 254).toLowerCase();
    const tipoVehiculo = text(data.get('tipoVehiculo'), 30);
    const marca = text(data.get('marca'), 80);
    const modelo = text(data.get('modelo'), 100);
    const anio = Number(text(data.get('anio'), 4));
    const placas = text(data.get('placas'), 20);
    const color = text(data.get('color'), 40);
    const numeroSerie = text(data.get('numeroSerie'), 40);
    const observaciones = text(data.get('observaciones'), 1500);
    if (!nombre || telefono.replace(/\D/g, '').length < 10 ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo) ||
        !['Automóvil', 'Motocicleta'].includes(tipoVehiculo) || !marca || !modelo ||
        !Number.isInteger(anio) || anio < 1980 || anio > new Date().getFullYear() + 1 ||
        data.get('privacidad') !== 'on') {
      return jsonError('Revisa los datos obligatorios y acepta el aviso de privacidad.', 400);
    }

    const photos = data.getAll('fotos').filter((value): value is File => value instanceof File && value.size > 0);
    if (photos.length > MAX_FILES) return jsonError('Puedes adjuntar un máximo de 5 fotografías.', 400);
    for (const photo of photos) {
      if (!ALLOWED_TYPES.has(photo.type) || photo.size > MAX_FILE_SIZE) {
        return jsonError('Cada fotografía debe ser JPG optimizado y pesar como máximo 2 MB.', 400);
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return jsonError('El registro de inspecciones aún no está configurado. Contacta al asesor por WhatsApp.', 503);

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const inserted = await fetch(new URL('/rest/v1/inspecciones_vehiculares', supabaseUrl), {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        token_hash: tokenHash, nombre, telefono, correo, tipo_vehiculo: tipoVehiculo,
        marca, modelo, anio, placas: placas || null, color: color || null,
        numero_serie: numeroSerie || null, observaciones_cliente: observaciones || null,
        aviso_privacidad_aceptado: true, estado: 'recibida',
      }),
      cache: 'no-store',
    });
    if (!inserted.ok) {
      console.error('[vehicle-inspections] insert failed', inserted.status, (await inserted.text()).slice(0, 500));
      return jsonError('No se pudo guardar la solicitud. Inténtalo de nuevo más tarde.', 502);
    }
    const rows = await inserted.json();
    const row = rows?.[0];
    if (!row?.id || !row?.folio) return jsonError('No se pudo confirmar el registro.', 502);

    const uploaded: { path: string; name: string; type: string; size: number }[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const extension = photo.type === 'image/jpeg' ? 'jpg' : photo.type === 'image/png' ? 'png' : 'webp';
      const path = row.id + '/' + String(i + 1).padStart(2, '0') + '-' + randomBytes(8).toString('hex') + '.' + extension;
      const upload = await fetch(new URL('/storage/v1/object/inspecciones-vehiculares/' + path.split('/').map(encodeURIComponent).join('/'), supabaseUrl), {
        method: 'POST',
        headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': photo.type, 'x-upsert': 'false' },
        body: await photo.arrayBuffer(),
        cache: 'no-store',
      });
      if (!upload.ok) {
        console.error('[vehicle-inspections] photo upload failed', upload.status, (await upload.text()).slice(0, 300));
        return jsonError('La solicitud se guardó, pero no se pudieron cargar todas las fotografías. Contacta al asesor con tu folio ' + row.folio + '.', 502);
      }
      uploaded.push({ path, name: photo.name.slice(0, 120), type: photo.type, size: photo.size });
    }

    if (uploaded.length) {
      const update = await fetch(new URL('/rest/v1/inspecciones_vehiculares?id=eq.' + encodeURIComponent(row.id), supabaseUrl), {
        method: 'PATCH',
        headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ fotografias: uploaded }),
        cache: 'no-store',
      });
      if (!update.ok) {
        console.error('[vehicle-inspections] photo metadata update failed', update.status);
        return jsonError('La solicitud se recibió con el folio ' + row.folio + ', pero no se pudo actualizar su registro fotográfico. Contacta al asesor.', 502);
      }
    }

    return NextResponse.json({ ok: true, folio: row.folio }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[vehicle-inspections] request failed', error instanceof Error ? error.message : 'unknown');
    return jsonError('No se pudo procesar la solicitud. Verifica tu conexión e inténtalo de nuevo.', 400);
  }
}
