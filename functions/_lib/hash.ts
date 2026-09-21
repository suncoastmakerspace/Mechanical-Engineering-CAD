/**
 * Password hashing, using only Web Crypto so the Function needs no dependencies.
 *
 * The sheet stores a per-member salt and a PBKDF2 hash. It never stores a
 * password, and it is never read by the browser. Club members are students who
 * reuse passwords elsewhere, so a readable sheet would leak far more than
 * access to this site.
 */

const ITERATIONS = 100_000;
const KEY_BITS = 256;

const enc = new TextEncoder();

/**
 * base64url, not base64.
 *
 * These values get pasted into a Google Sheet by hand, and standard base64's
 * `+`, `/` and `=` do not survive that: a spreadsheet treats some of them as
 * formula syntax, and they are easy to mistype or truncate. base64url is just
 * letters, digits, `-` and `_`.
 */
export function bytesToB64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Accepts base64url or plain base64, and ignores surrounding whitespace, so a
 * stray space picked up from a spreadsheet cell cannot lock someone out.
 */
export function b64ToBytes(input: string): Uint8Array {
  const cleaned = input.trim().replace(/-/g, '+').replace(/_/g, '/');
  const padded = cleaned + '='.repeat((4 - (cleaned.length % 4)) % 4);
  const s = atob(padded);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** A fresh 16-byte salt, base64url encoded. */
export function randomSalt(): string {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(password: string, saltB64: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_BITS,
  );
  return bytesToB64(new Uint8Array(bits));
}

/**
 * Compares in constant time, so the response latency does not leak how much of
 * a hash matched.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
