/**
 * The Google Sheet, reached through an Apps Script Web App bound to it.
 *
 * Deliberately not the Sheets REST API: that would mean a service account and
 * signing a JWT inside a Worker, which is a lot of machinery for a club
 * roster. The Apps Script is a dozen lines, lives with the sheet, and is
 * reached with a shared secret.
 *
 * See apps-script/Code.gs for the other half, and SETUP.md for deployment.
 */

export type Env = {
  SHEETS_ENDPOINT?: string;
  SHEETS_SECRET?: string;
  SESSION_SECRET?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  /** Reviews allowed per member per day. Defaults to 20. */
  REVIEW_LIMIT?: string;
};

export type MemberRow = {
  username: string;
  salt: string;
  hash: string;
  displayName: string;
};

export type ProgressRow = {
  checkpoints: string[];
  gates: string[];
};

export class SheetUnavailable extends Error {}

async function call<T>(env: Env, action: string, payload: Record<string, unknown>): Promise<T> {
  if (!env.SHEETS_ENDPOINT || !env.SHEETS_SECRET) {
    throw new SheetUnavailable('SHEETS_ENDPOINT or SHEETS_SECRET is not configured');
  }

  const res = await fetch(env.SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.SHEETS_SECRET, action, ...payload }),
  });

  if (!res.ok) throw new SheetUnavailable(`sheet responded ${res.status}`);

  const data = (await res.json()) as { ok: boolean; error?: string; data?: T };
  if (!data.ok) throw new SheetUnavailable(data.error || 'sheet rejected the request');
  return data.data as T;
}

/** Null when the username is not on the roster. */
export function getMember(env: Env, username: string): Promise<MemberRow | null> {
  return call<MemberRow | null>(env, 'getMember', { username });
}

export function getProgress(env: Env, username: string): Promise<ProgressRow> {
  return call<ProgressRow>(env, 'getProgress', { username });
}

export type ReviewClaim = { allowed: boolean; used: number; limit: number };

/** Creates a roster row. Resolves false when the username is already taken. */
export async function addMember(
  env: Env,
  row: { username: string; salt: string; hash: string; displayName: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!env.SHEETS_ENDPOINT || !env.SHEETS_SECRET) {
    throw new SheetUnavailable('SHEETS_ENDPOINT or SHEETS_SECRET is not configured');
  }

  const res = await fetch(env.SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.SHEETS_SECRET, action: 'addMember', ...row }),
  });
  if (!res.ok) throw new SheetUnavailable(`sheet responded ${res.status}`);

  const data = (await res.json()) as { ok: boolean; error?: string };
  return data.ok ? { ok: true } : { ok: false, reason: data.error || 'rejected' };
}

/**
 * Counts one review against the member's daily allowance and says whether it
 * is allowed. Anyone can create an account, so this is the only thing standing
 * between the review endpoint and an unbounded bill.
 */
export function claimReview(env: Env, username: string, limit: number): Promise<ReviewClaim> {
  return call<ReviewClaim>(env, 'claimReview', { username, limit });
}

export function setProgress(
  env: Env,
  username: string,
  progress: ProgressRow,
): Promise<ProgressRow> {
  return call<ProgressRow>(env, 'setProgress', { username, ...progress });
}
