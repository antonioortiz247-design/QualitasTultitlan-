const COOKIE_NAME = 'qt_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function signature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))));
}

export function getAdminCookieName() { return COOKIE_NAME; }
export function getSessionMaxAge() { return SESSION_SECONDS; }

export async function createAdminSession(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.');
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })));
  return payload + '.' + await signature(payload, secret);
}

export async function verifyAdminSession(value?: string | null): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32 || !value) return false;
  const parts = value.split('.');
  if (parts.length !== 2) return false;
  try {
    const expected = await signature(parts[0], secret);
    const a = new TextEncoder().encode(parts[1]);
    const b = new TextEncoder().encode(expected);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])));
    return payload.role === 'admin' && Number.isInteger(payload.exp) && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
