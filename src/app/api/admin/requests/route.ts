import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getRows(table: string, supabaseUrl: string, serviceKey: string) {
  const url = new URL('/rest/v1/' + table, supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
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
    const [contacts, quotes] = await Promise.all([
      getRows('solicitudes_contacto', supabaseUrl, serviceKey),
      getRows('solicitudes_cotizacion', supabaseUrl, serviceKey),
    ]);
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
    return NextResponse.json({ requests }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Admin requests query failed:', error);
    return NextResponse.json({ error: 'No se pudieron consultar las solicitudes. Verifica las tablas y sus permisos.' }, { status: 502 });
  }
}
