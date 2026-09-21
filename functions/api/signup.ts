import { hashPassword, randomSalt } from '../_lib/hash';
import { createToken, json, setCookie } from '../_lib/session';
import { addMember, SheetUnavailable, type Env } from '../_lib/sheet';

/**
 * POST /api/signup  { username, password, displayName }
 *
 * Open signup: anyone with the link can make an account. That was a deliberate
 * choice, and it means this route and /api/review are the two places where
 * abuse would show up. The roster is capped in the Apps Script, and reviews are
 * capped per member per day.
 *
 * The password is hashed here and thrown away. The sheet only ever sees a salt
 * and a hash, which is what makes an open roster survivable.
 */

const USERNAME = /^[a-z0-9][a-z0-9._-]{2,23}$/;
const MIN_PASSWORD = 8;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SESSION_SECRET) {
    return json({ error: 'Accounts are not configured yet.' }, { status: 503 });
  }

  let body: { username?: string; password?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const username = (body.username || '').trim().toLowerCase();
  const password = body.password || '';
  const displayName = (body.displayName || '').trim().slice(0, 40) || username;

  if (!USERNAME.test(username)) {
    return json(
      {
        error:
          'Usernames are 3 to 24 characters: letters, numbers, dot, dash or underscore, starting with a letter or number.',
      },
      { status: 400 },
    );
  }
  if (password.length < MIN_PASSWORD) {
    return json(
      { error: `Use at least ${MIN_PASSWORD} characters for the password.` },
      { status: 400 },
    );
  }

  const salt = randomSalt();
  const hash = await hashPassword(password, salt);

  let result;
  try {
    result = await addMember(env, { username, salt, hash, displayName });
  } catch (err) {
    if (err instanceof SheetUnavailable) {
      return json({ error: 'The member list is unreachable right now.' }, { status: 503 });
    }
    throw err;
  }

  if (!result.ok) {
    if (result.reason === 'taken') {
      return json({ error: 'That username is already taken.' }, { status: 409 });
    }
    if (result.reason === 'roster full') {
      return json(
        { error: 'The roster is full. Ask Mr. Chroniak to make room.' },
        { status: 507 },
      );
    }
    return json({ error: 'Could not create that account.' }, { status: 400 });
  }

  // Straight in, no second sign-in step.
  const token = await createToken(username, env.SESSION_SECRET);
  return json(
    { ok: true, username, displayName },
    { headers: { 'Set-Cookie': setCookie(token) } },
  );
};
