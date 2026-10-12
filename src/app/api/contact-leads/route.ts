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

    const createdAt = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
    const response = await fetch(new URL('/rest/v1/solicitudes_contacto', supabaseUrl), {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        nombre: name, telefono: phone, correo: email, producto: product,
        aviso_privacidad_aceptado: true, origen: text(body.source, 1000) || null,
      }),
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
      console.error('[contact-leads][' + errorId + '] Supabase insert failed', { status: response.status, detail });
      return NextResponse.json({
        error: 'No se pudieron guardar los datos de contacto.',
        details: detail,
        errorId,
        hint: 'Comparte el código de error con soporte. No compartas contraseñas ni claves.',
      }, { status: 502 });
    }

    const inserted = await response.json();
    const folio = inserted?.[0]?.folio || null;
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    let emailSent = false;

    if (resendKey && fromEmail && folio) {
      try {
        const mailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: ['romerorubio2@qualitas.com.mx'],
            subject: 'Nueva solicitud de atención ' + folio,
            text: [
              'Nueva solicitud desde el sitio de Quálitas Cuautitlán Romero Rubio.', '',
              'Folio: ' + folio, 'Fecha de registro: ' + createdAt,
              'Nombre: ' + name, 'Teléfono / WhatsApp: ' + phone,
              'Correo: ' + email, 'Producto que desea asegurar: ' + product,
              'Aviso de privacidad aceptado: Sí', '',
              'Consulta la solicitud en Supabase para dar seguimiento.',
            ].join('\n'),
          }),
          cache: 'no-store',
        });
        emailSent = mailResponse.ok;
        if (!mailResponse.ok) console.error('Resend email failed:', mailResponse.status, (await mailResponse.text()).slice(0, 500));
      } catch (mailError) {
        console.error('Resend email request failed:', mailError);
      }
    } else {
      console.warn('Email notification not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL.');
    }

    return NextResponse.json({ ok: true, folio, emailSent }, { status: 201 });
  } catch (error) {
    const errorId = crypto.randomUUID();
    const detail = error instanceof Error ? error.message.slice(0, 500) : 'Error desconocido al procesar el formulario.';
    console.error('[contact-leads][' + errorId + '] Request failed:', detail);
    return NextResponse.json({
      error: 'No se pudo procesar el formulario.',
      details: detail,
      errorId,
      hint: 'Verifica los datos e inténtalo de nuevo. Si persiste, comparte el código de error con soporte.',
    }, { status: 400 });
  }
}
