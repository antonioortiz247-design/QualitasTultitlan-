import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getRows(table: string, supabaseUrl: string, serviceKey: string) {
  const url = new URL('/rest/v1/' + table, supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('limit', '100');
  const response = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey },
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error('Supabase ' + table + ' respondió ' + response.status + ': ' + detail);
  }
  return response.json() as Promise<Record<string, unknown>[]>;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(getAdminCookieName())?.value;
  if (!await verifyAdminSession(session)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'La conexión a la base de datos no está configurada.' }, { status: 503 });

  try {
    // No ordenar en PostgREST: algunas versiones de las tablas pueden no tener
    // created_at o tener otro nombre de fecha. Ordenamos después de normalizar.
    const results = await Promise.allSettled([
      getRows('solicitudes_contacto', supabaseUrl, serviceKey),
      getRows('solicitudes_cotizacion', supabaseUrl, serviceKey),
    ]);
    const [contactsResult, quotesResult] = results;
    const contacts = contactsResult.status === 'fulfilled' ? contactsResult.value : [];
    const quotes = quotesResult.status === 'fulfilled' ? quotesResult.value : [];
    if (contactsResult.status === 'rejected') console.error('Admin query solicitudes_contacto failed:', contactsResult.reason);
    if (quotesResult.status === 'rejected') console.error('Admin query solicitudes_cotizacion failed:', quotesResult.reason);
    if (contactsResult.status === 'rejected' && quotesResult.status === 'rejected') {
      const describe = (reason: unknown) => reason instanceof Error ? reason.message.slice(0, 800) : String(reason).slice(0, 800);
      const errorId = crypto.randomUUID();
      const details = {
        contactos: describe(contactsResult.reason),
        cotizaciones: describe(quotesResult.reason),
      };
      console.error('[admin-requests][' + errorId + '] Both Supabase table queries failed:', details);
      return NextResponse.json({
        error: 'Falló la consulta a Supabase.',
        details,
        errorId,
        hint: 'Abre la respuesta de /api/admin/requests en la pestaña Network o busca este código en los logs de funciones.',
      }, { status: 502 });
    }
    const normalize = (row: Record<string, unknown>, tipo: string) => ({
      folio: typeof row.folio === 'string' ? row.folio : '',
      nombre: typeof row.nombre === 'string' ? row.nombre : '',
      telefono: typeof row.telefono === 'string' ? row.telefono : '',
      correo: typeof row.correo === 'string' ? row.correo : '',
      producto: tipo === 'Cotización' ? [row.tipo_vehiculo, row.marca, row.modelo, row.anio].filter(Boolean).join(' ') : (typeof row.producto === 'string' ? row.producto : ''),
      origen: typeof row.origen === 'string' ? row.origen : '',
      created_at: typeof row.created_at === 'string' ? row.created_at : '',
      tipo,
    });
    const requests = [...contacts.map(row => normalize(row, 'Contacto')), ...quotes.map(row => normalize(row, 'Cotización'))]
      .sort((a,b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0))
      .slice(0, 100);
    const warnings = [];
    if (contactsResult.status === 'rejected') warnings.push('No se pudieron cargar los formularios de contacto.');
    if (quotesResult.status === 'rejected') warnings.push('No se pudieron cargar las cotizaciones.');
    return NextResponse.json({ requests, warnings }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    const errorId = crypto.randomUUID();
    const details = error instanceof Error ? error.message.slice(0, 800) : String(error).slice(0, 800);
    console.error('[admin-requests][' + errorId + '] Unexpected query failure:', details);
    return NextResponse.json({
      error: 'No se pudieron consultar las solicitudes.',
      details,
      errorId,
      hint: 'Comparte el identificador con soporte. No compartas claves de acceso.',
    }, { status: 502 });
  }
}
