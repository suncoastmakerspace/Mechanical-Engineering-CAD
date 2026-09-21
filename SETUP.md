# Setting up accounts and review

The site works with none of this configured. Without a backend it runs in guest
mode: progress is kept in the browser and the sign-in pill says accounts are not
switched on. Everything below turns that into real per-member accounts.

There are three pieces: a Google Sheet, a Cloudflare deployment, and an OpenAI
key. They are independent, so you can do the sheet now and the key later.

---

## 1. The roster sheet

**Create a Google Sheet.** Name it whatever you like. Keep it private, it is
never read by the browser.

**You do not have to set up any structure.** The script creates both tabs and
both header rows the first time it runs, so an empty spreadsheet is fine. What
follows is just what it will look like once it has.

`members` and `progress` are two separate **tabs** along the bottom of the
window, not two rows of one sheet. Each tab has its own header in row 1.

**Tab `members`** — the only one you ever type into:

|   | A | B | C | D | E |
| - | - | - | - | - | - |
| **1** | username | salt | hash | displayName | createdAt |
| **2** | ada | `k3Jd...==` | `9fQ2...=` | Ada L. | 2026-09-20T... |
| **3** | linus | `p8Xm...==` | `Lw41...=` | Linus T. | 2026-09-20T... |

**Tab `progress`** — fills itself as members tick checkpoints off:

|   | A | B | C | D |
| - | - | - | - | - |
| **1** | username | checkpoints | gates | updatedAt |
| **2** | ada | `["Checkpoint 1a"]` | `["stage-1"]` | 2026-09-20T... |

One row per member in each tab. Row 1 is the header, data starts at row 2.

**Add the script.** Extensions, then Apps Script. Delete what is there and
paste in `apps-script/Code.gs` from this repo.

**Set the shared secret.** At the top of the script, replace
`REPLACE_WITH_A_LONG_RANDOM_STRING`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Deploy it.** Deploy, then New deployment, type Web app. Set *Execute as* to
**Me**, and *Who has access* to **Anyone**. Copy the `/exec` URL it gives you.

"Anyone" reads alarmingly, and is fine here: every request has to carry the
shared secret, and only your Cloudflare Function knows it. The sheet itself is
never shared or published.

**Opening the /exec URL in a browser will say `Script function not found:
doGet`. That means it worked.** The script only answers POST requests, and a
browser sends a GET. There is nothing to fix. What would be a real problem is a
Google sign-in page or a permissions error, which means *Who has access* is not
set to Anyone.

The tabs appear on the first real request, not on deployment, so an empty
spreadsheet right after deploying is also normal.

**If you ever edit the script later**, saving it does not update the live web
app. Use Deploy, then Manage deployments, then the pencil icon, then set
*Version* to **New version**. That keeps the same `/exec` URL.

Do not use *New deployment* for an edit: it issues a different URL, and
`SHEETS_ENDPOINT` in Cloudflare would still point at the old one, so logins
would quietly stop working.

---

## 2. Members

**Anyone can sign themselves up.** They open the site, click Sign in, then
Create an account. Nothing is needed from you, and no approval step exists.

That is a deliberate choice, and it has a cost: anyone who finds the URL can
make an account. Three things keep the blast radius small.

- The roster is capped at 1000 rows (`MAX_MEMBERS` in the Apps Script).
- Usernames must be 3 to 24 sensible characters and unique; passwords at least
  8 characters.
- **Every account gets 20 design reviews per day**, counted in columns E and F
  of the `progress` tab and enforced immediately before the paid call. Change
  it with the `REVIEW_LIMIT` variable on Cloudflare.

If it is ever abused, Cloudflare's own rate limiting on `/api/signup` is a
dashboard toggle and needs no code change.

### Adding one by hand

Still possible, for example to pre-create an account for someone:

```bash
node scripts/add-member.mjs ada "some-long-passphrase" "Ada L."
```

That prints one tab-separated row. Paste it as a new row in the `members` tab.
If the paste does not split across columns, enter the four values one cell at a
time; the fifth, `createdAt`, is never read and can be left blank.

The password is turned into a salt and a PBKDF2 hash on your machine and is not
stored anywhere, not even by the script. **The sheet never holds a password.**
This matters because club members reuse passwords, so a readable roster would
leak far more than access to this site.

Nobody can recover a forgotten password, including you. Run the command again
with a new one and replace the row.

---

## 3. Cloudflare

In the Pages project, under Settings, Environment variables, add:

| Name | Value |
| --- | --- |
| `SHEETS_ENDPOINT` | the `/exec` URL from step 1 |
| `SHEETS_SECRET` | the same secret you put in the script |
| `SESSION_SECRET` | another long random string, generated the same way |
| `OPENAI_API_KEY` | your key, once you have one |
| `OPENAI_MODEL` | optional, defaults to `gpt-4o-mini` |

`SESSION_SECRET` signs the login cookies. Changing it signs everyone out, which
is also how you boot everyone if a cookie ever leaks.

Redeploy after adding them. Environment variables are only picked up on a new
build.

---

## 4. The design review

Five checkpoints take a file upload: 0, 1c, 2a, 3 and 4c. These are the ones
with a judgeable right answer.

Each review counts against the member's daily allowance, claimed after the
upload passes every free check and before the paid call. A stub response costs
nothing and so does not consume any allowance.

**Until `OPENAI_API_KEY` is set**, the endpoint returns a placeholder that the
page labels as such. The upload, the preview and the result panel all work, so
you can see the whole flow before spending anything. Adding the key changes
nothing else.

**A note on the daily cap.** A failed call to OpenAI still consumes one from
the allowance. That is deliberate: refunding on failure would let a request
that always fails be repeated without limit.

---

## Running it locally

```bash
npm run dev          # Vite only. No Functions, so guest mode.
npm run mock-sheet   # in a second terminal: a fake sheet, two test members
npm run dev:cf       # in a third: builds, then serves with Functions
```

`npm run dev:cf` reads `.dev.vars`, which is gitignored. Copy
`.dev.vars.example` to `.dev.vars` to start. The mock sheet ships with two
members for testing: `ada` / `bracket-9000` and `linus` / `gear-ratio-42`.

The mock speaks the same protocol as the Apps Script, so anything that works
against it works against the real sheet.
