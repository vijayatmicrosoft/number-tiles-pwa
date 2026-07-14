---
name: publish-pwa-to-store
description: "Streamlined, repeatable workflow to publish a Progressive Web App (PWA) to the Microsoft Store. Use when the user wants to: ship/publish/submit a web app or PWA to the Microsoft Store; package a website as a Windows app; make a site installable and Store-ready; use PWABuilder or Partner Center; validate a web app manifest or service worker for Store compliance; or build/update a slide deck documenting the PWA publishing process. Covers PWA compliance, HTTPS hosting, PWABuilder MSIX packaging, and Partner Center submission."
---

# Publish a PWA to the Microsoft Store

A repeatable, app-agnostic workflow for taking any Progressive Web App from source to a
live Microsoft Store listing. Work through the phases in order; skip phases the user has
already completed.

## Prerequisites (confirm before starting)

- A working web app (HTML/CSS/JS). No framework or build step is required.
- A Microsoft **Partner Center** developer account (one-time: ~$19 individual / ~$99 company).
- Ability to host on a **public HTTPS URL** (required for both PWAs and the Store).

If any are missing, tell the user and pause on that item.

## Phase 1 — Make it a compliant, installable PWA

Verify (and fix) these. Read the existing `manifest.json`, `sw.js`/service worker, and
`index.html` before changing anything.

**Web App Manifest** must include:
- `id`, `name`, `short_name`, `description`, `start_url`, `scope`
- `display: standalone`, `theme_color`, `background_color`
- Icons at **192** and **512** px, with both `any` and `maskable` purposes
- `screenshots` for `narrow` (mobile) and `wide` (desktop) form factors
- `categories`

**Service worker**:
- Registered from the page (relative path, e.g. `./sw.js`, so it works under a subpath).
- Prefer **network-first** during active development (fresh when online, cache fallback
  offline). Cache-first serves stale assets and causes "my edits don't show up" confusion.
- Bump the cache version constant (e.g. `CACHE_NAME`) whenever cached assets change.

**Gotcha to call out:** if edits don't appear after refresh, it's almost always the
service worker cache or the browser HTTP cache. Fix: network-first + bump cache version;
hard-refresh (Ctrl+Shift+R) to clear the browser HTTP cache.

## Phase 2 — Host on public HTTPS

Pick one free host and deploy:
- **GitHub Pages** (simple, free): push to a repo; add a GitHub Actions workflow
  (`.github/workflows/deploy.yml`) that auto-deploys on push to `main`. Served under
  `https://<user>.github.io/<repo>/` — use **relative paths** so assets resolve under the subpath.
- Alternatives: **Azure Static Web Apps**, **Netlify**, **Vercel**, **Cloudflare Pages**.

Confirm the live URL loads over HTTPS before continuing.

## Phase 3 — Package with PWABuilder

1. Go to **https://www.pwabuilder.com** and enter the live HTTPS URL.
2. Review the manifest / service worker / security report; fix any flagged gaps (loop back
   to Phase 1, redeploy, re-scan).
3. Choose **Package For Stores → Windows** to generate a signed **`.msixbundle`**.
4. When prompted, supply the **Partner Center Publisher ID** and **Publisher display name**
   (from Partner Center → Account settings → product identity). These must match exactly or
   the Store rejects the package.

## Phase 4 — Submit in Partner Center

1. Reserve the app **name** (confirm availability).
2. Upload the `.msixbundle` under **Packages**.
3. Complete the listing: **description**, **screenshots**, **category**, **age rating**
   questionnaire, and a **privacy policy URL** (required to pass certification — generate a
   simple `privacy.html` and host it alongside the app if the user lacks one).
4. Submit for **certification** and monitor status.

## Phase 5 — Maintain & update

- Content/UI changes: just redeploy the web host — users get them automatically.
- Bump the service worker cache version so clients pick up new assets.
- Only **repackage + resubmit** when the app package version/identity changes.

## Keep the process deck updated (optional but recommended)

This workspace ships a re-runnable generator, `build_deck.py`, that produces
`Publishing-PWA-to-Microsoft-Store.pptx`. Slide content lives in the `SLIDES` list under the
`# === MILESTONES (append new slides here) ===` marker.

- To record progress or a new milestone, **append a dict** (`{"title": ..., "bullets": [...]}`)
  to `SLIDES`, then re-run the generator:
  `python build_deck.py` (idempotent — overwrites the pptx in place).
- To avoid blocking the main conversation, dispatch a **read-only-then-write subagent** to
  update `SLIDES` and re-run the generator at each milestone.

## Definition of done

- [ ] Manifest complete (icons 192/512 + maskable, screenshots narrow+wide, colors, scope)
- [ ] Service worker registered; network-first for development; cache version bumped
- [ ] App deployed to a public HTTPS URL and verified
- [ ] `.msixbundle` produced via PWABuilder with correct Publisher identity
- [ ] Privacy policy page published and linked
- [ ] Submitted in Partner Center and passed certification
