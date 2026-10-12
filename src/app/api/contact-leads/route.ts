import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(value: unknown, max = 300): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = text(body.name, 150);
    const phone = text(body.phone, 30);
    const email = text(body.email, 254).toLowerCase();
    const product = text(body.product, 30);
    if (!name || phone.replace(/\D/g, '').length < 10 ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
        !['Auto', 'Moto', 'Pickup', 'Otro'].includes(product) ||
        body.privacyAccepted !== true) {
      return NextResponse.json({ error: 'Revisa los datos obligatorios y acepta el aviso de privacidad.' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'El registro aún no está configurado. Inténtalo más tarde.' }, { status: 503 });
    }

    const response = await fetch(new URL('/rest/v1/solicitudes_contacto', supabaseUrl), {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        nombre: name,
        telefono: phone,
        correo: email,
        producto: product,
        aviso_privacidad_aceptado: true,
        origen: text(body.source, 1000) || null,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Supabase contact lead insert failed:', response.status, (await response.text()).slice(0, 500));
      return NextResponse.json({ error: 'No se pudieron guardar tus datos. Inténtalo de nuevo en unos minutos.' }, { status: 502 });
    }

    const inserted = await response.json();
    return NextResponse.json({ ok: true, folio: inserted?.[0]?.folio || null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la solicitud. Revisa los datos e inténtalo de nuevo.' }, { status: 400 });
  }
}
