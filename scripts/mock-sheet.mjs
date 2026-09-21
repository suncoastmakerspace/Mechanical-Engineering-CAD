#!/usr/bin/env node
/**
 * A stand-in for the Apps Script Web App, for local testing.
 *
 * Speaks the same JSON protocol as apps-script/Code.gs and keeps everything in
 * memory, so login and progress can be exercised end to end before the real
 * Google Sheet exists.
 *
 *   node scripts/mock-sheet.mjs [port]
 *
 * Then point SHEETS_ENDPOINT at http://127.0.0.1:<port>/ in .dev.vars.
 */

import { createServer } from 'node:http';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const PORT = Number(process.argv[2] || 8799);
const SECRET = process.env.MOCK_SHEET_SECRET || 'dev-shared-secret';

const hash = (password, salt) =>
  pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('base64');

/** Two seeded members, so per-user separation is testable. */
const members = new Map();
for (const [username, password, displayName] of [
  ['ada', 'bracket-9000', 'Ada L.'],
  ['linus', 'gear-ratio-42', 'Linus T.'],
]) {
  const salt = randomBytes(16);
  members.set(username, {
    username,
    salt: salt.toString('base64'),
    hash: hash(password, salt),
    displayName,
  });
}

const progress = new Map();

const server = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405).end();
    return;
  }

  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const send = (obj) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send({ ok: false, error: 'bad json' });
    }

    if (body.secret !== SECRET) return send({ ok: false, error: 'bad secret' });

    const user = String(body.username || '').toLowerCase();

    switch (body.action) {
      case 'getMember':
        return send({ ok: true, data: members.get(user) || null });

      case 'getProgress':
        return send({
          ok: true,
          data: progress.get(user) || { checkpoints: [], gates: [] },
        });

      case 'setProgress': {
        const prev = progress.get(user) || {};
        const next = {
          ...prev,
          checkpoints: body.checkpoints || [],
          gates: body.gates || [],
        };
        progress.set(user, next);
        return send({ ok: true, data: { checkpoints: next.checkpoints, gates: next.gates } });
      }

      case 'addMember': {
        if (members.size >= 1000) return send({ ok: false, error: 'roster full' });
        if (members.has(user)) return send({ ok: false, error: 'taken' });
        members.set(user, {
          username: user,
          salt: String(body.salt),
          hash: String(body.hash),
          displayName: String(body.displayName || user),
        });
        return send({ ok: true, data: { username: user } });
      }

      case 'claimReview': {
        const cap = Number(body.limit) || 20;
        // Integer day key, matching Code.gs. A date string would be silently
        // turned into a Date by real Sheets and never compare equal.
        const d = new Date();
        const today = d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
        const row = progress.get(user) || { checkpoints: [], gates: [] };
        const used = Number(row.reviewDate) === today ? row.reviewCount || 0 : 0;
        if (used >= cap) return send({ ok: true, data: { allowed: false, used, limit: cap } });
        progress.set(user, { ...row, reviewDate: today, reviewCount: used + 1 });
        return send({ ok: true, data: { allowed: true, used: used + 1, limit: cap } });
      }

      default:
        return send({ ok: false, error: 'unknown action' });
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock sheet on http://127.0.0.1:${PORT}/  (secret: ${SECRET})`);
  console.log('members: ada / bracket-9000   linus / gear-ratio-42');
});
