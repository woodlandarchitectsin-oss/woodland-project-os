# Tests

Run everything: `npm test` (about 2 minutes). Quick backend-only run: `npm run test:fast`.

| File | What it proves |
|---|---|
| `scripts/syntax-check.js` (runs first) | `app.js`, `sync.js`, `config.js`, `service-worker.js`, `Code.gs` all parse; the on-screen error reporter is the first `<script>`; no `alert/confirm/prompt`. |
| `backend.test.js` | The real `backend/Code.gs` running against mocked SpreadsheetApp / PropertiesService / LockService / CacheService: PINs, sheet auto-creation (tabs, frozen headers, text-formatted ID/date columns), server-assigned IDs, retry safety, field-level merge, History tab, admin-only rules, close rules, `changesSince`, `importBulk`, 49,000-character limit, PIN lock-out. |
| `e2e.test.js` | Playwright drives the real app against that real backend (a local mock of the web address): PIN + "Who are you?", Ameen assigns / Shafeeq completes / Ameen sees "completed · Shafeeq", simultaneous project creation, edits to different fields, offline queue surviving close and reopen, close refusals, fee protection and admin unlock, old-data upload with matching counts, unreachable server. |
| `parity.test.js` | The ORIGINAL single file and the new app get identical data (5 generated data sets built on your 39 starter projects) and a frozen clock. Top 3, plan, re-plan, money at risk, payment status, scores, owner load, blocked / waiting lists, close rules, the daily-report text, 9 screens and 6 project sheets must be identical. |
| `pwa.test.js` | Manifest and icons valid, service worker active, Chrome reports no installability problems, app opens with no internet, "New version — tap to refresh" appears and works. |
| `visual.test.js` | Screenshots of old and new at 390 px and 1280 px, light and dark (Today, Projects, Tasks, Money, Weekly review, Project sheet) and a pixel comparison. Images are written to `test/screenshots/` (`-old`, `-new`, `-diff`). |

`parity.test.js` and `visual.test.js` need your original file and starter data in `private/` (kept out of Git on purpose). They are skipped if those files are missing.
