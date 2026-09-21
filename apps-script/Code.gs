/**
 * The Google Sheet half of the login and progress system.
 *
 * Paste this into Extensions > Apps Script on the roster spreadsheet, then
 * Deploy > New deployment > Web app, "Execute as: Me", "Who has access:
 * Anyone". The resulting /exec URL is SHEETS_ENDPOINT on Cloudflare.
 *
 * "Anyone" sounds alarming and is fine here, because every request must carry
 * SHARED_SECRET. Set that to a long random string and put the same value in
 * Cloudflare as SHEETS_SECRET. The sheet itself stays private: nothing is
 * published, and the browser never talks to this script directly.
 *
 * Expected tabs:
 *   members   username | salt | hash | displayName | createdAt
 *   progress  username | checkpoints | gates | updatedAt
 *
 * The members tab holds a PBKDF2 hash, never a password. Generate rows with
 * `node scripts/add-member.mjs <username> <password> "<Display Name>"`.
 */

var SHARED_SECRET = 'REPLACE_WITH_A_LONG_RANDOM_STRING';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.secret !== SHARED_SECRET) {
      return reply({ ok: false, error: 'bad secret' });
    }

    switch (body.action) {
      case 'getMember':
        return reply({ ok: true, data: getMember_(body.username) });
      case 'getProgress':
        return reply({ ok: true, data: getProgress_(body.username) });
      case 'setProgress':
        return reply({
          ok: true,
          data: setProgress_(body.username, body.checkpoints, body.gates),
        });
      case 'addMember':
        return reply(addMember_(body));
      case 'claimReview':
        return reply({ ok: true, data: claimReview_(body.username, body.limit) });
      default:
        return reply({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === 'members') {
      sh.appendRow(['username', 'salt', 'hash', 'displayName', 'createdAt']);
    } else {
      sh.appendRow(['username', 'checkpoints', 'gates', 'updatedAt']);
    }
  }
  return sh;
}

function findRow_(sh, username) {
  var values = sh.getDataRange().getValues();
  var target = String(username || '').toLowerCase();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === target) return { row: i + 1, values: values[i] };
  }
  return null;
}

function getMember_(username) {
  var hit = findRow_(sheet_('members'), username);
  if (!hit) return null;
  return {
    username: String(hit.values[0]).toLowerCase(),
    // Trimmed: a cell can easily pick up a stray space on paste.
    salt: String(hit.values[1]).trim(),
    hash: String(hit.values[2]).trim(),
    displayName: String(hit.values[3] || ''),
  };
}

/** Upper bound on the roster, so an open signup form cannot fill the sheet. */
var MAX_MEMBERS = 1000;

/**
 * Creates a member row. The salt and hash are computed by the Cloudflare
 * Function, so no password ever reaches this script or the sheet.
 */
function addMember_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_('members');

    if (sh.getLastRow() - 1 >= MAX_MEMBERS) {
      return { ok: false, error: 'roster full' };
    }
    if (findRow_(sh, body.username)) {
      return { ok: false, error: 'taken' };
    }

    sh.appendRow([
      String(body.username).toLowerCase(),
      String(body.salt),
      String(body.hash),
      String(body.displayName || body.username),
      new Date().toISOString(),
    ]);
    return { ok: true, data: { username: String(body.username).toLowerCase() } };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Counts one design review against a member's daily allowance.
 *
 * Signing in stopped being a barrier once signup was opened to anyone, so the
 * cost control has to be per member and per day. Columns E and F of the
 * progress tab hold the date and the count.
 */
/**
 * The day, as a plain integer like 20260920.
 *
 * Deliberately not a date string: Sheets silently parses "2026-09-20" into a
 * Date on write, hands back a Date object on read, and the string comparison
 * then never matches. The counter reset on every call and the quota enforced
 * nothing. An integer survives the round trip untouched.
 */
function dayKey_() {
  var d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function claimReview_(username, limit) {
  var cap = Number(limit) || 20;
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_('progress');
    var today = dayKey_();
    var hit = findRow_(sh, username);

    if (!hit) {
      sh.appendRow([String(username).toLowerCase(), '[]', '[]', new Date().toISOString(), today, 1]);
      return { allowed: true, used: 1, limit: cap };
    }

    var used = Number(hit.values[4]) === today ? Number(hit.values[5]) || 0 : 0;

    if (used >= cap) return { allowed: false, used: used, limit: cap };

    sh.getRange(hit.row, 5, 1, 2).setValues([[today, used + 1]]);
    return { allowed: true, used: used + 1, limit: cap };
  } finally {
    lock.releaseLock();
  }
}

function parseList_(cell) {
  try {
    var parsed = JSON.parse(cell || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function getProgress_(username) {
  var hit = findRow_(sheet_('progress'), username);
  if (!hit) return { checkpoints: [], gates: [] };
  return { checkpoints: parseList_(hit.values[1]), gates: parseList_(hit.values[2]) };
}

function setProgress_(username, checkpoints, gates) {
  // Two members finishing a checkpoint at the same moment would otherwise
  // read-modify-write over each other.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_('progress');
    var row = [
      String(username).toLowerCase(),
      JSON.stringify(checkpoints || []),
      JSON.stringify(gates || []),
      new Date().toISOString(),
    ];

    var hit = findRow_(sh, username);
    // Columns 1-4 only: E and F hold the review counter and must survive this.
    if (hit) sh.getRange(hit.row, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);

    return { checkpoints: checkpoints || [], gates: gates || [] };
  } finally {
    lock.releaseLock();
  }
}
