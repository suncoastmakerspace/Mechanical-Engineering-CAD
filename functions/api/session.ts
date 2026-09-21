import { json, readCookie, readToken } from '../_lib/session';
import { getMember, SheetUnavailable, type Env } from '../_lib/sheet';

/**
 * GET /api/session — who is signed in.
 *
 * 401 is the normal, expected answer for a signed-out visitor, and the
 * frontend treats it as "run in guest mode" rather than as an error.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SESSION_SECRET) return json({ error: 'not configured' }, { status: 503 });

  const username = await readToken(readCookie(request), env.SESSION_SECRET);
  if (!username) return json({ error: 'not signed in' }, { status: 401 });

  let displayName = username;
  try {
    const member = await getMember(env, username);
    if (member) displayName = member.displayName || username;
  } catch (err) {
    // A signed cookie is proof enough of identity; a sheet outage should not
    // sign anyone out.
    if (!(err instanceof SheetUnavailable)) throw err;
  }

  return json({ ok: true, username, displayName });
};
