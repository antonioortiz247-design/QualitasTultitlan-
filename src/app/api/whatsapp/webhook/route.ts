import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * Meta webhook handshake.
 * Configure WHATSAPP_VERIFY_TOKEN in Vercel and use the same value in Meta.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken) {
    return jsonError('WhatsApp webhook verification is not configured.', 503);
  }

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
    });
  }

  return jsonError('Invalid webhook verification request.', 403);
}

/**
 * Validate Meta's X-Hub-Signature-256 header before accepting notifications.
 *
 * This first-stage endpoint intentionally does not persist message contents,
 * contacts, or chat history. Add approved event processing/storage before
 * subscribing the production WhatsApp account to this callback.
 */
export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return jsonError('WhatsApp webhook signature validation is not configured.', 503);
  }

  const signature = request.headers.get('x-hub-signature-256') || '';
  const match = /^sha256=([a-f0-9]{64})$/i.exec(signature);
  if (!match) {
    return jsonError('Missing or invalid webhook signature.', 401);
  }

  const rawBody = await request.text();
  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest();
  const received = Buffer.from(match[1], 'hex');

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return jsonError('Webhook signature verification failed.', 401);
  }

  let payload: {
    object?: unknown;
    entry?: Array<{ changes?: Array<{ field?: unknown }> }>;
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonError('Invalid webhook JSON payload.', 400);
  }

  if (payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    return jsonError('Unsupported webhook payload.', 400);
  }

  // Deliberately acknowledge only. Do not log or store customer message data here.
  const receivedFields = payload.entry.flatMap((entry) =>
    Array.isArray(entry.changes)
      ? entry.changes.map((change) => typeof change.field === 'string' ? change.field : 'unknown')
      : [],
  );

  return NextResponse.json({
    ok: true,
    accepted: true,
    receivedFields: [...new Set(receivedFields)],
    storage: 'not_configured',
  }, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
