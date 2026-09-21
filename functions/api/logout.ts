import { clearCookie, json } from '../_lib/session';
import type { Env } from '../_lib/sheet';

/** POST /api/logout — drops the session cookie. */
export const onRequestPost: PagesFunction<Env> = async () =>
  json({ ok: true }, { headers: { 'Set-Cookie': clearCookie() } });
