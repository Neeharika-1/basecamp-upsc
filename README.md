# Base Camp — a personal UPSC prep tracker

A single-page dashboard for UPSC Civil Services preparation: syllabus
tracker (pre-loaded with the real Prelims + Mains syllabus), a daily
planner, a current affairs diary, a test score log with a trend chart,
and a habit/goals tracker.

It's plain HTML/CSS/JS — no build step, no framework, no signup. All your
data is saved in your browser's `localStorage`, so it's completely
private and works offline once loaded. There's an Export/Import button
in Settings for backups.

**Files:**
- `index.html` — page structure
- `style.css` — all styling
- `script.js` — all app logic and the default syllabus data
- `README.md` — this file

---

## 1. Try it locally first (optional)

Double-click `index.html`, or from a terminal in this folder run:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.

---

## 2. Push it to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit — Base Camp UPSC tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Replace `<your-username>/<repo-name>` with your own — create an empty
repo on GitHub first (don't initialize it with a README, so there's no
conflict with the push).

---

## 3. Turn on GitHub Pages (free hosting)

1. On your repo's GitHub page, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main`, folder `/ (root)`, then **Save**.
4. Wait a minute, then your site is live at:

   ```
   https://<your-username>.github.io/<repo-name>/
   ```

Bookmark that URL on your phone too — it's a real website, so it works
on any device, though each device keeps its own local data (see below).

---

## About your data

Everything — checked topics, tasks, current affairs notes, test scores,
habits — is stored only in the browser you're using, via `localStorage`.
Nothing is sent to a server (there isn't one).

That means:
- Clearing your browser data, or using a different browser/device, gives
  you a blank slate unless you've imported a backup.
- Use **Settings → Export backup** regularly, and especially before
  clearing site data or switching devices. Re-import it from any browser
  with **Settings → Import backup**.

---

## Customizing it

- **Rename the app:** search for `BASE` / `Base Camp` in `index.html`
  and `script.js` and replace with whatever you like.
- **Colors:** all in the `:root { ... }` block at the top of `style.css`
  (`--saffron`, `--sage`, `--ink-*`, etc.).
- **Syllabus content:** edit the `defaultSyllabus()` function near the
  top of `script.js`. This only affects the *default* list shown to new
  visitors — once you've started checking things off, your saved data in
  `localStorage` takes over, so editing this later won't retroactively
  change what you already have (use **Reset all data** in Settings if
  you want to start over with new defaults).
- **Optional subject:** there's no hardcoded optional-subject syllabus,
  since UPSC offers ~48 of them — add your own topics under "Mains —
  Optional" directly in the app, and name the subject in Settings.

---

## Notes

- The Prelims exam date isn't hardcoded (the syllabus structure is
  stable, but exam dates shift every year) — set your own target date in
  **Settings** to drive the countdown on the dashboard.
- Fonts (Spectral, IBM Plex Sans, IBM Plex Mono) load from Google Fonts.
  If you'd rather not depend on that, they're easy to remove from the
  `<link>` tags in `index.html` — the app will just fall back to system
  fonts.
