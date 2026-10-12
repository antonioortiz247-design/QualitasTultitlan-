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
    const zip = text(body.zip, 5);
    const age = Number(body.age);
    const brand = text(body.brand, 100);
    const model = text(body.model, 150);
    const version = text(body.version, 150);
    const year = Number(body.year);
    const usage = text(body.usage, 30);
    const privacyAccepted = body.privacyAccepted === true;

    if (!name || phone.replace(/\D/g, '').length < 10 ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
        !/^\d{5}$/.test(zip) || !Number.isInteger(age) || age < 16 || age > 100 ||
        !brand || !model || !version || !Number.isInteger(year) || year < 1980 ||
        year > new Date().getFullYear() + 1 || !privacyAccepted ||
        !['Particular', 'Comercial'].includes(usage)) {
      return NextResponse.json({ error: 'Revisa los datos obligatorios e intenta de nuevo.' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'El registro aún no está configurado. Inténtalo más tarde o contacta al asesor por WhatsApp.' }, { status: 503 });
    }

    const row = {
      nombre: name,
      telefono: phone,
      correo: email,
      codigo_postal: zip,
      edad_conductor: age,
      uso_vehiculo: usage,
      marca: brand,
      modelo: model,
      version,
      anio: year,
      tipo_vehiculo: text(body.vehicleType, 100) || null,
      cate: text(body.cate, 40) || null,
      cve: text(body.cve, 40) || null,
      clave_marca: text(body.brandCode, 40) || null,
      origen: text(body.source, 500) || null,
      aviso_privacidad_aceptado: true,
    };

    const response = await fetch(new URL('/rest/v1/solicitudes_cotizacion', supabaseUrl), {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
      cache: 'no-store',
    });

    if (!response.ok) {
      const raw = (await response.text()).slice(0, 800);
      let detail = raw;
      try {
        const parsed = JSON.parse(raw);
        detail = [parsed.code, parsed.message, parsed.details, parsed.hint].filter(Boolean).join(' | ').slice(0, 800) || raw;
      } catch { /* conservar el texto original de Supabase */ }
      const errorId = crypto.randomUUID();
      console.error('[quote-requests][' + errorId + '] Supabase insert failed', { status: response.status, detail });
      return NextResponse.json({
        error: 'No se pudo guardar la cotización.',
        details: detail,
        errorId,
        hint: 'Comparte el código de error con soporte. No compartas contraseñas ni claves.',
      }, { status: 502 });
    }

    const inserted = await response.json();
    return NextResponse.json({ ok: true, folio: inserted?.[0]?.folio || null }, { status: 201 });
  } catch (error) {
    const errorId = crypto.randomUUID();
    const detail = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido al procesar la solicitud.';
    console.error('[quote-requests][' + errorId + '] Request failed:', detail);
    return NextResponse.json({
      error: 'No se pudo procesar la solicitud.',
      details: detail,
      errorId,
      hint: 'Verifica los datos e inténtalo de nuevo. Si persiste, comparte el código de error con soporte.',
    }, { status: 400 });
  }
}
