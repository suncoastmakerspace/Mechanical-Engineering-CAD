import { json, readCookie, readToken } from '../_lib/session';
import { claimReview, SheetUnavailable, type Env } from '../_lib/sheet';
import { STAGES } from '../../src/content/path';

/**
 * POST /api/review  multipart: file, checkpointId  -> { stub, verdict, notes[] }
 *
 * The rubric is looked up here, from the same curriculum module the site
 * renders, rather than being sent by the browser. A client-supplied rubric
 * would be a client-supplied prompt.
 *
 * The API key is read only in this Function and never leaves it.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const DEFAULT_MODEL = 'gpt-4o-mini';
/** Reviews per member per day. Raise REVIEW_LIMIT to change it. */
const DEFAULT_REVIEW_LIMIT = 20;

type Feedback = { stub: boolean; verdict: string; notes: string[] };

/**
 * The Workers types expose File as an interface but not as a constructor
 * value, so neither `instanceof File` nor narrowing off `string` works here.
 * This is the shape actually used, stated plainly.
 */
type Upload = {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
};

const rubricFor = (checkpointId: string): string | null => {
  for (const stage of STAGES) {
    for (const cp of stage.checkpoints) {
      if (cp.id === checkpointId) return cp.review?.rubric ?? null;
    }
  }
  return null;
};

const bytesToB64 = (bytes: Uint8Array): string => {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  /*
   * Signup is open to anyone, so being signed in proves nothing about who you
   * are. The real cost control is the per-member daily quota claimed below,
   * just before the paid call.
   */
  let who: string | null = null;
  if (env.SESSION_SECRET) {
    who = await readToken(readCookie(request), env.SESSION_SECRET);
    if (!who) return json({ error: 'Sign in to get feedback on a design.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Expected a file upload.' }, { status: 400 });
  }

  const checkpointId = String(form.get('checkpointId') || '');
  const rubric = rubricFor(checkpointId);
  if (!rubric) {
    return json({ error: 'That checkpoint does not take a design review.' }, { status: 400 });
  }

  const entry = form.get('file') as unknown as Upload | string | null;
  if (!entry || typeof entry === 'string' || typeof entry.arrayBuffer !== 'function') {
    return json({ error: 'No file was attached.' }, { status: 400 });
  }
  const file: Upload = entry;
  if (file.size > MAX_BYTES) {
    return json({ error: 'That file is larger than 4MB.' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return json(
      {
        error:
          'Send a photo or a screenshot. A model cannot open a CAD file, so export a view of it first.',
      },
      { status: 415 },
    );
  }

  // No key yet. Return something obviously provisional rather than inventing
  // feedback and passing it off as a review.
  if (!env.OPENAI_API_KEY) {
    const stub: Feedback = {
      stub: true,
      verdict: 'Not reviewed yet',
      notes: [
        'The review service has no API key set, so nothing has actually looked at this file.',
        `Your upload arrived intact: ${file.name}, ${(file.size / 1024).toFixed(0)}KB.`,
        'Once a key is added to the site settings, this panel fills with real feedback and nothing else changes.',
      ],
    };
    return json({ ok: true, ...stub });
  }

  /*
   * Claimed only now, once the upload has passed every free check. Counting a
   * malformed request against someone's allowance would be unfair, and
   * claiming before the key check would burn quota on a stub response.
   */
  if (who) {
    const limit = Number(env.REVIEW_LIMIT) || DEFAULT_REVIEW_LIMIT;
    try {
      const claim = await claimReview(env, who, limit);
      if (!claim.allowed) {
        return json(
          {
            error: `That is ${claim.limit} reviews today, which is the daily limit. It resets tomorrow.`,
          },
          { status: 429 },
        );
      }
    } catch (err) {
      // A sheet outage should not become a free-for-all on a paid endpoint.
      if (err instanceof SheetUnavailable) {
        return json({ error: 'Review is unavailable right now.' }, { status: 503 });
      }
      throw err;
    }
  }

  const dataUrl = `data:${file.type};base64,${bytesToB64(new Uint8Array(await file.arrayBuffer()))}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || DEFAULT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You review work from a high-school makerspace CAD club. Be specific and practical, ' +
            'never flattering. Point at the actual geometry, not general advice. If it is good, ' +
            'say so briefly and give the next thing to improve. Reply as JSON: ' +
            '{"verdict": string, "notes": string[]} with two or three notes.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Checkpoint: ${checkpointId}\nWhat to judge: ${rubric}` },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    return json(
      { error: 'The review service did not respond. Try again in a minute.' },
      { status: 502 },
    );
  }

  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content || '{}';

  let parsed: { verdict?: string; notes?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { verdict: 'Reviewed', notes: [raw.slice(0, 500)] };
  }

  const feedback: Feedback = {
    stub: false,
    verdict: parsed.verdict || 'Reviewed',
    notes: Array.isArray(parsed.notes) ? parsed.notes.slice(0, 4) : [],
  };
  return json({ ok: true, ...feedback });
};
