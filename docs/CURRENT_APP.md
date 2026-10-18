# CURRENT_APP.md — what `woodland-project-os.html` does today

Source: `D:\WL\02 Woodland Firm\Templates & Tools\woodland-project-os.html` (167,683 bytes, 1,174 lines), copied unchanged to `project-os-app\woodland-project-os.html`.
(A second, older copy `woodland-project-os (1).html`, 120 KB, exists in the same folder. It was NOT used.)

Structure: one `<style>` block (lines 12-258), one HTML shell (rail + `<main>` + `#layer`), one seed script (line 272, 47 KB), one app script (lines 273-1171). No framework. Fonts: Familjen Grotesk, IBM Plex Sans, IBM Plex Mono from Google Fonts.

## 1. Design tokens (must be kept exactly)
- Light: bg `#f4f5f1`, surface `#fff`, surface-2 `#ecede7`, line `#dfe1d8`, line-2 `#c6cabd`, fg `#1a1d19`, muted `#5f655b`, faint `#8c9286`, accent `#2c5a47`, accent-soft `#dfe9e3`, crit `#b3261e`, warn `#9a6200`, ok `#2b7a4b`, info `#365a8c` (+ soft variants).
- Dark: via `prefers-color-scheme` (unless `data-theme="light"`) and `data-theme="dark"`. Accent `#86bfa2`.
- Layout: desktop = 200 px left rail + main (max 1180 px). Phone (≤820 px) = bottom tab bar (Today, Projects, Tasks, Money, More). Project file opens as a right-hand sheet (full width on phone). Radius 8 px, tab height 58 px.

## 2. Reference lists (constants)
- LIFECYCLE (17): ENQUIRY, QUALIFICATION, PROPOSAL / QUOTATION, WON, PRE-DESIGN, CONCEPT DESIGN, DESIGN DEVELOPMENT, CLIENT APPROVAL, WORKING DRAWINGS, TENDER / BOQ, EXECUTION / SITE, COMPLETION, SNAGGING, CLOSED, ON HOLD, LOST / CANCELLED, UNKNOWN — CONFIRM. (Your brief says 16 stages; the file has 17 including "UNKNOWN — CONFIRM". All 17 are kept.)
- LC_GROUP: enq (first 3), design (WON → WORKING DRAWINGS), exec (TENDER/BOQ, EXECUTION/SITE), snag (COMPLETION, SNAGGING), closed, hold, lost, unk.
- TYPES (13), CONDITIONS (14), OBLIGATIONS (6: PAYMENT PENDING, SNAGGING PENDING, DOCUMENTS PENDING, HANDOVER PENDING, WARRANTY ISSUE, FINAL PHOTOS PENDING), TSTAT (6), PRI (P0-P3 + labels), CATS (5), BLOCKERS (10), PAYSTAT (6), ESTS (15-240 min), CONFIRMABLE (11 fields).
- DEFAULT_SETTINGS: owner "Ameen", dayStart 09:00, dayEnd 18:00, buffer 10, dailyControl 30, fixed = "13:00-14:00 Lunch + Dhuhr" / "16:15-16:35 Asr".
  - Note: the default protected blocks contain only Dhuhr/lunch and Asr. Fajr and Maghrib are outside the 09:00-18:00 day (Maghrib is ~18:30 in Mangaluru in October), so they never collide today. They remain editable in settings. If the day end is moved later, Maghrib must be added by hand. Flagged as a suggestion, not changed.

## 3. Data model (collections)
Collections: `projects`, `tasks`, `people`, `meetings`, `payments`, `plans`, plus a single `settings` document.
Seed (`window.WPOS_SEED`, exported 2026-10-07): 39 projects, 16 tasks, 6 people, 0 meetings/payments/plans, empty settings.

**Project** (`WA-###`): id, name, client, clientContact, location, types[], scope, area, leadSource, enquiryDate, startDate, targetDate, created, lifecycle, conditions[], priority, lead, team[], responsible, quotedFee, agreedFee, openingReceived, paymentMilestone, nextPaymentDue, paymentStatus (only used to hold "NOT APPLICABLE"), nextAction, nextActionOwner, nextActionDeadline, blocker {type, since, who, action}, siteIssues[] {d, text, status OPEN/RESOLVED, resolved}, folder, links (text, one per line), notes, confirm[], history[] {d, t} (max 300, newest first), archived, updatedAt, waitingSince, nextMeeting.
**Task** (`T-####`): id, projectId, title, desc, assignee, created, due, est (min), priority, status, category, dependency, clientDependency, startAfter, notes, completed (date), waitingSince, blockType, updatedAt.
**Meeting** (`M-####`): id, projectId, date, time, purpose, participants, decisions[], requests, payment, duration, nextMeeting.
**Payment** (`PAY-####`): id, projectId, amount, date, milestone, mode.
**Person** (`P-###`): id, name, role, capacity (focused h/day), contact, archived.
**Plan** (key = date): id (=date), taskIds[], blocks[] {s, e, label, taskId}.

## 4. Screens and features
**Shell:** left rail (desktop) / bottom tabs (phone); "More" tab on phone; overdue count on Tasks, money-at-risk count on Money; mode dot ("Saved in this browser"); in-page toast; in-page confirm box (`confirmBox`) and form modal (`openModal`); Esc closes layers; Enter on a card opens it.
**Header on every screen:** title, subtitle, action button, and a search box. Search matches projects (id, name, client, location, notes, scope, responsible), tasks (title, desc, notes, assignee), meetings (purpose, participants, decisions, requests). With Claude available, the same box becomes a command box (see §7).

1. **Today:** greeting; "No projects yet" empty state; red banner "YOU are the bottleneck" when ≥5 projects wait on the owner, else amber "N tasks have no owner"; KPI strip (Active, Enquiries, Design, On site, Snagging, Overdue, Money at risk, Waiting client, To confirm), each KPI jumps to the filtered screen; **Top 3 outcomes** (with tick); sections: Needs an owner, **Today's plan** (time pickers, Replan, Lock plan, over-capacity banner, no-estimate hint, time blocks, "Didn't fit" with recommendation), Must do today, Overdue, Waiting for client, Money at risk, Waiting for team, Blocked, Next 7 days, Meetings, Site issues, Quick wins ≤20 min. Sections collapse and remember state.
2. **Projects:** 12 saved views (Active, Enquiries, Design, On site, Snagging, Waiting client, Payment due, To confirm, Mine, On hold, All, Closed/lost); filters (stage, type, person, priority, payment); sort (priority, next deadline, recent activity, name, ID); cards (id, priority, name, client·location, stage + 2 condition pills, next action, open/late tasks, balance, progress bar); "+ Project".
3. **Project sheet:** every field edits in place. Name; stage; priority; Next action (what/who/by when); Status toggles (14 conditions) + Blocked by/who/to unblock + days blocked; Tasks (quick add, open, completed-fold); Details (client, contact, location, scope, area, lead source, lead, responsible, 3 dates, Type toggles, Team toggles); Money (quoted, agreed, received, balance, received-before-app, milestone, next due, status pill, payment list, + Payment); Meetings; Site issues (log → also creates a P0 SITE task due today and sets SITE ISSUE condition; Resolve clears the condition when none open); Notes & files (notes, folder, links with clickable URLs); Needs confirmation toggles (flag shown beside each field); History (+ add note); Archive/Restore.
4. **Tasks:** 8 views (Mine, Due today [= due ≤ today], This week [= due ≤ today+7], Overdue, No owner, Waiting, All open, Done); person and project filters; quick-add (project + assignee, remembers last); task row = tick, editable title, project link, assignee, due, priority, time estimate, status, client pill, "More" modal (description, category, time, waits-for, don't-plan-before, needs-client, notes, Delete).
5. **Money:** subtitle totals (agreed / received / balance); "no agreed fee" banner; Money at risk; fees table with editable quoted / agreed / received-before / next-due and live balance + status; Payments received list with delete; "+ Payment received" modal.
6. **More (phone):** list to Follow-ups, Meetings, Team, Weekly review, Daily report, Data & settings.
7. **Follow-ups:** client dependencies oldest first (days pill red >5d; "Done" logs follow-up and resets the clock); payment follow-ups.
8. **Meetings:** list; New/Edit modal; each decision line becomes a P1 task (assignee + due chosen in form) and a history line on the project; delete.
9. **Team:** workload bars (open minutes ÷ (capacity×300)); one collapsible card per person with editable name (renaming re-assigns their tasks), role, hours, contact, their open tasks; "Remove from team" (archives); "+ Member".
10. **Weekly review:** KPI row (Active, Stuck, No activity 7d, Money at risk, Overdue, Outstanding, Proposals open, Lost, Waiting on you); Stuck; No activity in 7 days; What to stop / delegate / automate / personal attention.
11. **Daily report:** end-of-day review of the locked plan (Done / Tomorrow / Drop per task); the WhatsApp-style "WOODLAND DAILY CONTROL" text with Copy button.
12. **Data & settings:** working-day settings (name = owner, buffer, day start/end, protected time); Backup (JSON, Projects CSV, Tasks CSV); "Reset to the data this file came with" (re-loads the seed); Restore from JSON (merge by ID, no deletes, asks to confirm); Archived projects (Restore / permanent Delete with its tasks).

## 5. Calculations (the parity-test list)
- `received(p)` = openingReceived + Σ payments (null if neither). `balance(p)` = agreedFee − received (null if no agreed fee). `payStatus(p)`: NOT APPLICABLE / UNKNOWN / PAID (balance ≤ 0) / OVERDUE (nextPaymentDue < today) / PARTIAL (received>0) / PENDING.
- `isActive` = group design, exec or snag. `taskScore`: priority weight (P0 1000, P1 300, P2 100, P3 30) + overdue (500 + 25/day) / due today 420 / ≤2 days 200 / ≤7 days 80 + project priority/4 + 40 if project on site + 60 if client-dependent.
- `condsOf` (adds "N OVERDUE", "PAYMENT <status>" for active projects, "BLOCKED · type"); `condClass` colours.
- `progress`, `nextDeadline`, `waitingClient`, `waitingTeam`, `blocked`, `ownerLoad`, `moneyAtRisk` (active projects: no agreed fee → crit; unpaid ≥50 % or OVERDUE → warn/crit), `meetingsOn`, `upcomingMeetings`.
- **Planner `buildPlan`:** daily-control block at day start; protected blocks (parsed "HH:MM-HH:MM label" lines) and that day's meetings are busy; free gaps; 20-min end-of-day review if the last gap ≥50 min; candidate tasks = owner's open tasks not WAITING/BLOCKED and past startAfter, by score; greedy fit with buffer; ordered by category then score; placed into first slot that fits; leftovers go to "Didn't fit".
- `recommend(t)`: Delegate → least loaded person (DRAWING/SITE/ADMIN) / Drop or park (P3 no date) / Do — move a P2 out (P0 or due) / Defer → tomorrow.
- `topOutcomes`: owner's top 3 tasks by score, one per project, excluding WAITING.
- Close rules `closeOk`: refuses CLOSED with open tasks, obligation conditions, or balance > 0 (message ends "Completed ≠ closed").
- `dailyReport()` text, with all 13 headed sections, exactly as written (§4.11).
- Stale-project rule in weekly review; stop/delegate/automate/attention rules (thresholds: >25 open projects, >6 proposals, >3 client waits).
- Every field change on a project appends a history line (`FIELD_LABEL` map); task changes to assignee/due/status/priority also write to the project's history.

## 6. Storage today
`localStorage["wpos_v1"]` = `{settings, projects, tasks, people, meetings, payments, plans}`. If empty, the seed is auto-loaded (this is the behaviour to REMOVE). `window.claude` cloud DB mode exists for use inside Claude (to be dropped).
IDs are generated in the browser as max+1 (`nextId`). This is unsafe with several people, so IDs will be server-assigned.

## 7. AI command box
Only active inside Claude (`CAP.sample`). Sends data to Claude, gets `{reply, actions[]}`, shows proposed actions, applies only on "Apply". Seven action types: create_project, update_project, create_task, update_task, add_note, add_payment, add_site_issue. To be hidden now; Phase 2 afterwards.

## 8. Things in the old file that the brief asks to ADD (they do not exist today)
- Who made each change (history lines have only date + text; no `by`).
- "completed · Shafeeq" on a done task (tasks store only the completion date, not who completed them).
- Per-person "Mine"/Top 3/plan (today all of these use the single Settings "owner").
- PIN gate, admin lock, server-enforced rules, outbox, sync, install, offline shell.

## 9. Observations and suggestions (NOT changed; for you to decide)
1. Brief says 16 lifecycle stages; file has 17 (incl. UNKNOWN — CONFIRM). Keeping 17.
2. "Reset to the data this file came with" must go (it would wipe shared data). Replaced by admin-only "Import starter projects".
3. Maghrib/Fajr aren't in the default protected blocks (see §2). Suggest adding "18:30-18:45 Maghrib" in settings if you work late.
4. Dates use each device's local clock. Fine for India-only team; noted.
5. "Delete project" removes its tasks permanently; in the shared version I will keep this admin-only.
6. Task rename of a person (Team screen) rewrites all their tasks; in the shared version this will be one batch write.
