import { timingSafeEqual, createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, getAdminCookieName, getSessionMaxAge } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right) && a.length === b.length;
}

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!expectedPassword || expectedPassword.length < 12 || !sessionSecret || sessionSecret.length < 32) {
    return NextResponse.json({ error: 'El acceso de administrador no está configurado correctamente.' }, { status: 503 });
  }

  let password = '';
  try {
    const body = await request.json();
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  if (!password || password.length > 256 || !safeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const session = await createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), session, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: getSessionMaxAge(),
  });
  return response;
}
