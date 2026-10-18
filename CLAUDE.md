# Woodland Project OS — notes for future Claude Code sessions

Owner: Ameen (woodlandarchitects.in@gmail.com), non-technical. Explain results in plain English.

## What this is
Installable, shared, offline-capable version of the old single-file `woodland-project-os.html`.
- Front end: plain JS PWA in `app/` (no framework, no build). Hosted on GitHub Pages.
- Back end: Google Apps Script JSON API in `backend/Code.gs`; data in the Google Sheet "Woodland Project OS — data" (Ameen's Drive, created on first call).
- The inventory of every feature/calculation is `docs/CURRENT_APP.md`. Keep the look, wording and logic unless Ameen asks otherwise.

## Fixed facts
- Apps Script project (scriptId): `1ZuOnpMGuprI7aYxZj0iq4DiaXGbW8TWkvE7gJCJjNilCCPYhNv84LDbJ`
- **Deployment ID (never change; always redeploy to it):** `AKfycbxR4m5jgaS7zMm0f_L6H2Tw3SBrNpQjl_mdrc8g_xr3TfnZsc4lW4CgdLOMOFtshiZS`
- API URL: `https://script.google.com/macros/s/AKfycbxR4m5jgaS7zMm0f_L6H2Tw3SBrNpQjl_mdrc8g_xr3TfnZsc4lW4CgdLOMOFtshiZS/exec` (also in `app/config.js`)
- GitHub repo / app link: see the bottom of this file once deployed.
- `ADMIN_PIN` lives only in Apps Script > Project Settings > Script Properties. Staff have personal PINs (set by the admin in the Team screen, stored as salted hashes in the People tab; `PIN_SALT` is in Script Properties). `TEAM_PIN` is obsolete. Never write PINs in code, tests, docs or Git.
- `private/` (original file, starter projects) and `test/screenshots/` hold client data and are git-ignored. The repo is code only.

## Update back end
```
cd backend
clasp push --force
clasp deploy --deploymentId AKfycbxR4m5jgaS7zMm0f_L6H2Tw3SBrNpQjl_mdrc8g_xr3TfnZsc4lW4CgdLOMOFtshiZS --description "<what changed>"
```
## Update front end
`npm test` -> `npm run stamp` -> commit -> `npm run deploy:pages` (publishes `app/` to the gh-pages branch). `npm run stamp` changes the service-worker version so phones show "New version — tap to refresh".

## Design decisions worth remembering
- Every change is an outbox operation with field-level diff; server merges field by field, assigns WA-/T-/M-/PAY-/P- IDs (client uses `tmp_…` ids until acknowledged), and writes a History row (who, when, old, new).
- Sign-in = name + own PIN (server derives the author from it, ignoring the name the app sends); admin PIN works with any name. Server enforces: fees/payment fields/archive/delete/import/people changes/PINs = admin only; CLOSED needs no open tasks, no obligation conditions, no unpaid balance.
- `Sync` (app/sync.js) polls `changesSince` every 15 s while visible (+ focus/online) with a 15 s overlap; applying a row twice is harmless.
- Personal views (Mine, Top 3, Today's plan, quick-add default) use the signed-in person (`me()`); the bottleneck banner always uses the owner setting.
- AI command box is hidden (Phase 2, not built): server-side Anthropic call with key in Script Properties, proposals only applied after Ameen taps Apply.
- On Windows PowerShell 5.1, never use Get-Content/Set-Content on files containing non-ASCII (it corrupts them); use node scripts.

## Live
- Repo: https://github.com/woodlandarchitectsin-oss/woodland-project-os (public, code only)
- App link: https://woodlandarchitectsin-oss.github.io/woodland-project-os/ (served from the gh-pages branch)
- Hand-over text for Ameen: docs/HANDOVER.md
