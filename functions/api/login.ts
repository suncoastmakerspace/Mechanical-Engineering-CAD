import { hashPassword, safeEqual } from '../_lib/hash';
import { createToken, json, setCookie } from '../_lib/session';
import { getMember, SheetUnavailable, type Env } from '../_lib/sheet';

/**
 * POST /api/login  { username, password }
 *
 * The password is compared against a PBKDF2 hash from the sheet and is never
 * echoed back. A failure says only that the pair was wrong: saying which half
 * was wrong would tell someone which usernames exist.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SESSION_SECRET) {
    return json({ error: 'Sign-in is not configured yet.' }, { status: 503 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const username = (body.username || '').trim().toLowerCase();
  const password = body.password || '';
  if (!username || !password) {
    return json({ error: 'Username and password are both required.' }, { status: 400 });
  }

  let member;
  try {
    member = await getMember(env, username);
  } catch (err) {
    if (err instanceof SheetUnavailable) {
      return json({ error: 'The member list is unreachable right now.' }, { status: 503 });
    }
    throw err;
  }

  /*
   * Hash even when the member does not exist, against a throwaway salt.
   * Returning early would make a missing username measurably faster to reject
   * than a wrong password, which is enough to enumerate the roster.
   */
  const salt = member?.salt || 'AAAAAAAAAAAAAAAAAAAAAA';
  const attempt = await hashPassword(password, salt);

  // Compare in one encoding. A cell may hold base64url or legacy base64, and
  // may have picked up whitespace on the way into the sheet.
  const stored = (member?.hash || '')
    .trim()
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  if (!member || !safeEqual(attempt, stored)) {
    return json({ error: 'That username and password do not match.' }, { status: 401 });
  }

  const token = await createToken(member.username, env.SESSION_SECRET);
  return json(
    { ok: true, username: member.username, displayName: member.displayName || member.username },
    { headers: { 'Set-Cookie': setCookie(token) } },
  );
};
