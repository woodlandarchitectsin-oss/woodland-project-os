# Woodland Project OS — hand-over (plain English)

## 1. The link and the PINs
App link: **https://woodlandarchitectsin-oss.github.io/woodland-project-os/**

PINs: open https://script.google.com/home/projects/1ZuOnpMGuprI7aYxZj0iq4DiaXGbW8TWkvE7gJCJjNilCCPYhNv84LDbJ/settings (signed in as woodlandarchitects.in@gmail.com) and look under **Script Properties**.
- `TEAM_PIN` — give this to your team. Asked once per phone.
- `ADMIN_PIN` — keep this to yourself. Unlocks fees, payments, archive, delete and import.
You can change either value there at any time (staff will be asked for the new PIN).

## 2. Install
- **Windows:** open the link in Chrome or Edge, click the install icon in the address bar (or the three dots, Cast / Save and share, Install page as app), then pin it to the taskbar.
- **Android:** open the link in Chrome, three dots, Add to Home screen / Install app.

## 3. Move your current data
The old file keeps its data in a different browser "address" than the new app, so "Upload data from this device" will usually find nothing. Use this instead:
1. Open the old file, Data & settings, **Download full backup**.
2. In the new app: More, Admin (enter admin PIN), Data & settings, **Restore from a backup file**, choose that file, confirm.
3. Check the counts message, then open the Google Sheet "Woodland Project OS — data" in your Drive.
(Your 39 starter projects were never loaded automatically. If you want them: Data & settings, "Import starter projects", choose `private\starter-projects.json` on this PC. Do this only once.)

## 4. WhatsApp message for the team
> Woodland Project OS is live. Open this link on your phone: https://woodlandarchitectsin-oss.github.io/woodland-project-os/
> Chrome menu (three dots), "Add to Home screen". Team PIN: (Ameen will send it separately).
> First time: type the PIN, then tap your name. Tick tasks done as you finish them. It works without signal and syncs when you are back online.

## 5. Asking for changes later
Open Claude Code in `D:\CLAUDE\project-os-app` and describe the change. It runs the tests, then publishes to the same link and the same back-end address.

## 6. What is not tested / things to know
- Tested with a mock of Google Apps Script and Sheets (the real back-end code runs inside it). The real Google Sheet has been exercised only by a wrong-PIN call from the live app. Please add one test project after signing in and check it appears in the Sheet.
- Not tested on a real Android phone or an installed Windows app window; Chrome reports no install problems.
- Changes appear on other devices within about 15 seconds while the app is open.
- Staff can read fees and money screens (read-only). Say if you want them hidden from staff.
- The AI command box is hidden (Phase 2, not built).
- The first-time sheet is created on the first signed-in call; the Apps Script owner (you) owns it.
