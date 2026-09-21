import { json, readCookie, readToken } from '../_lib/session';
import { getProgress, setProgress, SheetUnavailable, type Env } from '../_lib/sheet';

/**
 * GET  /api/progress  -> { checkpoints: string[], gates: string[] }
 * POST /api/progress  { kind: 'checkpoint' | 'gate', id, done } -> the new state
 *
 * Progress is always read and written for whoever the cookie says you are.
 * The client never names the user, so nobody can write to someone else's row
 * by editing a request.
 */

const MAX_IDS = 200;

async function requireUser(request: Request, env: Env): Promise<string | Response> {
  if (!env.SESSION_SECRET) return json({ error: 'not configured' }, { status: 503 });
  const username = await readToken(readCookie(request), env.SESSION_SECRET);
  if (!username) return json({ error: 'not signed in' }, { status: 401 });
  return username;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const who = await requireUser(request, env);
  if (typeof who !== 'string') return who;

  try {
    return json({ ok: true, ...(await getProgress(env, who)) });
  } catch (err) {
    if (err instanceof SheetUnavailable) {
      return json({ error: 'Progress is unreachable right now.' }, { status: 503 });
    }
    throw err;
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const who = await requireUser(request, env);
  if (typeof who !== 'string') return who;

  let body: { kind?: string; id?: string; done?: boolean; adopt?: string[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const kind = body.kind === 'gate' ? 'gates' : 'checkpoints';
  const id = (body.id || '').slice(0, 64);
  if (!id) return json({ error: 'An id is required.' }, { status: 400 });

  try {
    const current = await getProgress(env, who);
    const set = new Set(current[kind]);

    if (body.done) set.add(id);
    else set.delete(id);

    /*
     * Progress made while signed out is carried over on the first write after
     * signing in, so nobody loses a session's work by logging in late.
     */
    if (Array.isArray(body.adopt)) {
      for (const extra of body.adopt.slice(0, MAX_IDS)) {
        if (typeof extra === 'string' && extra) set.add(extra.slice(0, 64));
      }
    }

    const next = { ...current, [kind]: [...set].slice(0, MAX_IDS) };
    return json({ ok: true, ...(await setProgress(env, who, next)) });
  } catch (err) {
    if (err instanceof SheetUnavailable) {
      return json({ error: 'Progress could not be saved right now.' }, { status: 503 });
    }
    throw err;
  }
};
