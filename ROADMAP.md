# DevForge Roadmap

## Vision

A code editor and a frontend curriculum that are the same object — not an editor
with lessons bolted on, and not a curriculum that sends you off to a separate
tool. That fusion is the wedge. Every phase below exists to either protect that
wedge or earn the trust needed for people to build on top of it.

## Guiding principles

These are the rules we use to break ties when deciding what to work on next.

1. **Reliability before features.** A learning tool that breaks loses to a
   boring tool that doesn't, every time — our audience has zero ability to
   tell "my mistake" from "the tool's bug."
2. **Protect the zero-friction default.** `git clone` + open `index.html`
   must always work, with no build step and no account. Anything added later
   is additive to that, never a replacement for it.
3. **One source of truth.** Lesson/achievement data lives in one place.
   Anything that needs a second copy of that data (e.g. a future profile
   site) imports it — it does not redefine it.
4. **Local-first, server-optional.** Progress, XP, and achievements work
   fully offline by default. A server, when it exists, mirrors that data —
   it is never required to use the app.
5. **Ship the unglamorous stuff first.** Tests, accessibility, and
   governance docs are not checkboxes done at the end — they're what makes
   everything after them safe to build quickly.

---

## Phase 0 — Foundations (governance)

Nothing here is visible in the product. All of it determines whether other
people can safely contribute to it.

- [x] `LICENSE` (MIT or similar permissive license)
- [x] `README.md` — what this is, how to run it, screenshot/gif, link to
      the roadmap
- [x] `CONTRIBUTING.md` — with a dedicated, low-friction section on **how
      to add a lesson** (the lesson object shape, how `goals` work, a
      minimal example). This is the single doc most likely to turn readers
      into contributors.
- [x] Issue templates, including a "New Lesson" template
- [x] PR template (checklist: tests pass, lesson ids unique, etc.)
- [x] `CODE_OF_CONDUCT.md`

## Phase 1 — Core reliability

The unglamorous work. This is the actual moat — it's also the prerequisite
for everything after it being safe to build quickly.

- [x] Vitest + jsdom test setup — 60 tests across 7 files, run against the
      real `index.html` + real `js/*.js` files via jsdom (no mocks of our
      own code)
  - `app.test.js`, `editor.test.js`, `storage.test.js`, `commands.test.js`,
    `analytics.test.js`, `a11y.test.js`
  - **`curriculum.test.js`** (not originally listed, but the highest-value
    test in the suite): every lesson id is unique, every goal's `check()`
    runs without throwing against empty/garbage input, no lesson is missing
    a required field. This is the file that will change most often as the
    project grows, so it's the file most worth protecting.
- [x] `ci.yml` — lint, format check, HTML validation, run tests on every PR
- [x] ESLint + Prettier config (so `ci.yml` has something to actually check)
- [~] Accessibility pass:
  - [x] focus trapping in modals (and focus returns to the trigger on close)
  - [x] ARIA live region for toasts (which cover goal-completion and most
        state-change messages already)
  - [x] no positive `tabindex` traps (tested)
  - [x] `prefers-reduced-motion` support
  - [x] every custom clickable control (sidebar items, category headers,
        the lesson panel header, goals bar, workspace layout presets) is a
        real `<button>` or has `role="button"` + `tabindex="0"` + a
        matching `keydown` handler — tested by actually calling `.focus()`
        on every interactive element and asserting it becomes
        `document.activeElement`, not just checking `tabindex` values
  - [x] every modal is exposed as `role="dialog"` with `aria-modal` and
        `aria-labelledby` pointing at its visible title
  - [x] the command palette follows the ARIA combobox/listbox pattern
        (`aria-selected`, `aria-activedescendant`) so the active option is
        announced even though focus stays in the search input
  - [x] the resizable dividers are `role="separator"`, keyboard-operable
        (arrow keys, Home/End), and report their current value via
        `aria-valuenow`
  - [ ] still open: a full screen-reader pass (NVDA/VoiceOver), not just
        automated checks. Automated tests can confirm reachability and
        correct ARIA wiring, but not what it actually _sounds_ like.
- [~] Performance pass:
  - [x] debounce syntax highlighting for large buffers (>4000 characters)
        so typing stays smooth even on pasted content, while staying fully
        synchronous (no perceptible lag) at normal lesson-sized files, and
        the debounced timer is now correctly cancelled on tab switch so a
        stale repaint can't land in the wrong tab
  - [ ] still open: curriculum-list rendering at large lesson counts
        (fine at 19 lessons; not yet stress-tested at, say, 200)
  - [ ] still open: real low-end-hardware testing
- [x] Harden the preview `postMessage` listener to also check
      `event.source === previewFrame.contentWindow`, not just the message
      shape
- [x] Escape raw-text closing tags (`</script>`, `</style>`) before
      embedding a learner's HTML/CSS/JS into the preview document, so code
      containing that literal string can't break out of its tag
- [x] Escape quote characters in `escapeHtml()` (not just `&`/`<`/`>`), and
      apply it consistently everywhere dynamic or lesson-authored text is
      interpolated via `innerHTML`
- [x] Validate the shape of an imported progress file before trusting it
      to replace the live store
- [x] Surface `localStorage` write failures (once per failure episode, not
      spammed) instead of silently swallowing them
- [x] Calculate streaks and consistency tracking using the learner's local
      calendar day, not UTC (fixed in all 5 places this was computed, not
      just the one originally flagged)
- [x] CI hardening: explicit least-privilege `permissions:`, a
      `concurrency` group to cancel superseded runs, and
      `persist-credentials: false` on checkout

## Phase 2 — Sharpen the wedge

Everything here should make the editor+curriculum fusion sharper, not just
catch up to a feature CodePen already has.

- [x] Copy-all-code (HTML+CSS+JS together, not just the active tab)
- [x] Command palette (Cmd/Ctrl+K): jump to lesson, reset code, toggle
      theme, etc. — the single feature that most reads as "professional
      tool" rather than "student project"
- [x] Progressive hints: vague nudge → more specific → show the fix,
      replacing the current all-or-nothing goal pass/fail. Infrastructure
      supports it on any lesson (`hints: []`); currently written for 5
      lessons as the reference examples — extending to the rest of the
      curriculum is straightforward follow-up work, not infrastructure work
- [x] Lesson content versioning: `version` field + mismatch detection
      shipped. No lesson has needed a version bump yet, so this is proven
      in tests but not yet exercised by a real content change
- [ ] More lessons, prioritizing **depth over breadth** — real small
      projects (already have the Todo App as a model), not just isolated
      concept drills. Deliberately not tackled in this pass to keep it
      focused on infrastructure — content growth is ongoing work, not a
      one-time task
- [ ] Revisit regex-based goal checking for lessons where it's prone to
      false positives/negatives; consider a lightweight AST-based check for
      JS goals specifically

## Phase 3 — Deploy & distribution

- [ ] `deploy.yml` — GitHub Pages deploy on merge to `main`
- [ ] PWA support: `manifest.json`, `sw.js`, `offline.html`, app icons - Note: service workers don't run over `file://`. This phase commits
      the project to "hosted app is the primary experience, clone-and-open
      is a secondary/degraded path" — a deliberate call, not a free add-on.

## Phase 4 — Accounts & profiles (optional layer)

Everything in this phase is additive. Logged-out usage before this phase and
after this phase must be identical.

- [ ] Supabase project (Postgres + Auth), owned by the project maintainer(s)
- [ ] GitHub OAuth only (no password storage/reset burden)
- [ ] `profiles` table: XP total, streak, completed lesson ids, unlocked
      achievements, a platform-specific username (not raw GitHub username),
      `is_public` flag (default **off**)
- [ ] Row Level Security: write only your own row; read only rows marked
      public
- [ ] Second app (`apps/profile-site` in a monorepo): SSR frontend serving
      `domain.com/u/username`
- [ ] Shared package (`packages/shared`) holding lesson/achievement
      metadata and types, imported by both apps — this is what prevents the
      two projects' displayed data from silently drifting apart
- [ ] `supabase/migrations` owned at the repo root, touched only via PR —
      neither app modifies schema directly
- [ ] Consider shipping a **static, anonymous "share my progress" export**
      before full accounts, to validate demand for sharing before committing
      to the bigger lift

## Phase 5 — Community infrastructure

Sequenced last deliberately — these solve problems a project only has once
it has real contributor volume.

- [ ] `labeler.yml`
- [ ] `stale.yml`
- [ ] `devcontainer-check.yml`
- [ ] Revisit classroom/teacher mode as a stretch goal once there's a
      credible cohort of educators asking for it

---

## Explicitly deferred (the "not yet" list)

Naming these on purpose so they don't quietly creep into earlier phases.

- Server-side telemetry / usage tracking beyond the existing local-only
  Learner Analytics modal. If this is ever added, it must be anonymous,
  aggregate, and opt-in — never tied to individual accounts.
- Leaderboards / social ranking features
- Monetization of any kind
- Native mobile apps
- Custom backend API server beyond Supabase's auto-generated API — only
  reach for this if a specific need (e.g. computed leaderboards, rate
  limiting) can't be solved with RLS + the client SDK

---

## Why this order

Phases 0–1 are invisible and unglamorous on purpose. Everything exciting in
Phase 2 onward is only worth building on a foundation that won't crumble
under real contributor volume. Phase 4 — the piece that got the most
discussion — is intentionally the _fourth_ priority: it's a large, ongoing
operational commitment (key rotation, abuse monitoring on public profiles, a
privacy policy, account-deletion handling), and it should only be taken on
once the project has the governance and trust infrastructure in place to
support it responsibly.
