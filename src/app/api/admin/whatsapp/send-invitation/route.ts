import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 10) digits = '52' + digits;
  if (digits.startsWith('521') && digits.length === 13) digits = '52' + digits.slice(3);
  if (!/^52\d{10}$/.test(digits)) return null;
  return digits;
}

/**
 * Sends an approved WhatsApp template from the office's Cloud API number.
 * The recipient must have explicitly opted in to WhatsApp messages.
 * Credentials and sender identifiers are server-only environment variables.
 */
export async function POST(request: NextRequest) {
  const session = request.cookies.get(getAdminCookieName())?.value;
  if (!await verifyAdminSession(session)) return jsonError('No autorizado.', 401);

  let body: { phone?: unknown; name?: unknown; consentConfirmed?: unknown; consentMethod?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError('Solicitud no válida.', 400);
  }

  const to = normalizePhone(body.phone);
  if (!to) return jsonError('Ingresa un teléfono móvil mexicano válido con 10 dígitos o lada +52.', 400);

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
  if (body.consentConfirmed !== true) {
    return jsonError('Confirma que el cliente autorizó recibir mensajes por WhatsApp antes de enviar.', 400);
  }
  const consentMethod = typeof body.consentMethod === 'string' && ['verbal', 'written', 'digital'].includes(body.consentMethod)
    ? body.consentMethod : null;
  if (!consentMethod) return jsonError('Selecciona cómo otorgó el cliente su consentimiento.', 400);

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_INVITATION_TEMPLATE;
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'es_MX';
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v26.0';

  if (!accessToken || !phoneNumberId || !templateName) {
    return jsonError('El envío por WhatsApp aún no está habilitado. Falta configurar el token, el número emisor y la plantilla aprobada de Meta.', 503);
  }
  if (!/^\d{5,30}$/.test(phoneNumberId) || !/^v\d+\.\d+$/.test(graphVersion) || !/^[a-z0-9_]{1,512}$/.test(templateName)) {
    return jsonError('La configuración de WhatsApp Cloud API no es válida.', 503);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return jsonError('No se pudo guardar la evidencia de consentimiento. Verifica la conexión de datos.', 503);

  const consentResponse = await fetch(new URL('/rest/v1/whatsapp_marketing_consents', supabaseUrl), {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      phone: to,
      name: name || null,
      consent_source: 'staff_recorded',
      consent_method: consentMethod,
      purpose: 'Invitación y seguimiento del proceso de inspección vehicular por WhatsApp',
    }),
    cache: 'no-store',
  });
  if (!consentResponse.ok) {
    console.error('[whatsapp-consent] could not save staff consent', consentResponse.status);
    return jsonError('No se pudo guardar la evidencia del consentimiento; no se envió el mensaje.', 502);
  }

  const inspectionUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qualitas-tultitlan-lemon.vercel.app').replace(/\/+$/, '') + '/inspeccion-vehicular';
  const templateBody = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLanguage },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: name || 'cliente' },
          { type: 'text', text: inspectionUrl },
        ],
      }],
    },
  };

  try {
    const response = await fetch('https://graph.facebook.com/' + graphVersion + '/' + phoneNumberId + '/messages', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateBody),
      cache: 'no-store',
    });
    const result = await response.json().catch(() => ({})) as {
      messages?: Array<{ id?: string; message_status?: string }>;
      error?: { message?: string; code?: number; error_subcode?: number; fbtrace_id?: string };
    };

    if (!response.ok) {
      console.error('[whatsapp-send] Meta rejected template message', {
        status: response.status,
        code: result.error?.code,
        subcode: result.error?.error_subcode,
        trace: result.error?.fbtrace_id,
      });
      return jsonError('Meta no aceptó el mensaje. Verifica que la plantilla esté aprobada, que el idioma y las variables coincidan y que el número emisor tenga Cloud API habilitada.', 502);
    }

    const messageId = result.messages?.[0]?.id;
    if (!messageId) return jsonError('Meta respondió sin un identificador de mensaje.', 502);

    return NextResponse.json({
      ok: true,
      messageId,
      status: result.messages?.[0]?.message_status || 'accepted',
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return jsonError('No fue posible conectar con WhatsApp Cloud API. Inténtalo nuevamente.', 502);
  }
}
