#!/usr/bin/env node
/**
 * Generates a members row for the roster sheet.
 *
 *   node scripts/add-member.mjs <username> <password> "<Display Name>"
 *
 * Prints a tab-separated line to paste straight into the members tab. The
 * password is turned into a salt and a PBKDF2 hash here and is not stored
 * anywhere, so the sheet never holds anything worth stealing.
 *
 * This must stay in step with functions/_lib/hash.ts. Same algorithm, same
 * iteration count, same encoding, or logins will fail.
 */

import { pbkdf2Sync, randomBytes } from 'node:crypto';

const ITERATIONS = 100_000;
const KEY_BYTES = 32;

const [, , rawUsername, password, ...nameParts] = process.argv;

if (!rawUsername || !password) {
  console.error('Usage: node scripts/add-member.mjs <username> <password> "<Display Name>"');
  process.exit(1);
}

const username = rawUsername.trim().toLowerCase();
const displayName = nameParts.join(' ').trim() || rawUsername.trim();

if (password.length < 8) {
  console.error('Use at least 8 characters. Club members reuse passwords; make this one dull.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, 'sha256');

/*
 * base64url, because these get pasted into a Google Sheet. Standard base64's
 * `+`, `/` and `=` do not survive that trip: spreadsheets treat some of them
 * as formula syntax, and they are easy to mistype or truncate by hand.
 */
const row = [
  username,
  salt.toString('base64url'),
  hash.toString('base64url'),
  displayName,
  new Date().toISOString(),
];

console.log('\nPaste this as a new row in the "members" tab:\n');
console.log(row.join('\t'));
console.log('\nColumns: username | salt | hash | displayName | createdAt\n');
