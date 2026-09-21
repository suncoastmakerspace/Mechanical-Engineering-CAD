/**
 * Sessions: an HMAC-signed token in an httpOnly cookie.
 *
 * No session store, because there is nothing to store. The cookie carries the
 * username and an expiry, and the signature is what makes it trustworthy. A
 * member cannot edit it to become someone else without SESSION_SECRET.
 */

import { bytesToB64, safeEqual } from './hash';

const COOKIE = 'mecad_session';
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days; a club term, roughly

const enc = new TextEncoder();

type Payload = { u: string; exp: number };

function b64url(s: string): string {
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return s.replace(/-/g, '+').replace(/_/g, '/') + pad;
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(bytesToB64(new Uint8Array(sig)));
}

export async function createToken(username: string, secret: string): Promise<string> {
  const payload: Payload = { u: username, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS };
  const body = b64url(btoa(JSON.stringify(payload)));
  return `${body}.${await sign(body, secret)}`;
}

/** Returns the username, or null if the token is absent, forged or expired. */
export async function readToken(token: string | null, secret: string): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, await sign(body, secret))) return null;

  try {
    const payload = JSON.parse(atob(unb64url(body))) as Payload;
    if (!payload.u || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.u;
  } catch {
    return null;
  }
}

export function readCookie(request: Request): string | null {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === COOKIE) return rest.join('=');
  }
  return null;
}

export function setCookie(token: string): string {
  // httpOnly keeps it away from any script on the page; SameSite=Lax is enough
  // here because nothing is mutated by a cross-site GET.
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}
