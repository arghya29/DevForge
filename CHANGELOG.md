# Changelog

All notable changes to DevForge are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-06-30

### Fixed

- Critical bug in `handleEditorKey`: duplicate auto-close logic for brackets and quotes
  caused redundant code paths with mismatched undo behavior. Refactored to a single
  clean execution path with proper selection wrapping and fallback insertion.
- Improved Escape key handling now also blurs the search input when open
- Added missing ARIA roles (`role="banner"`, `role="tablist"`, `role="tab"`,
  `role="switch"`, `role="progressbar"`) and `aria-live` regions for accessibility
- Progress bar now updates `aria-valuenow` and `aria-valuetext` attributes dynamically
- Autorun toggle now reflects its state in the `aria-checked` attribute

### Changed

- Restructured auto-close logic to eliminate nested duplicate `PAIRS` checks
- Consolidated duplicate `isQuote` guard clauses into a single check

## [1.0.0] — 2025-06-19

### Added

- 16 interactive lessons across 3 chapters: HTML Foundations, CSS Styling, JavaScript
- Live preview iframe that renders HTML + CSS + JS instantly on Run
- Regex-based syntax highlighting for HTML, CSS, and JavaScript (no external libraries)
- Collapsible console panel with timestamped log, warn, and error output via postMessage
- XP system — each lesson awards points on first run
- Streak counter for consecutive lesson completions
- Lesson progress bar in the header
- Prev / Next lesson navigation buttons
- Sidebar lesson search with real-time filtering
- Auto-run toggle — re-runs preview 0.9s after you stop typing
- Preview size modes: Desktop, Tablet (768px), Mobile (390px)
- Draggable resizer between editor and preview panels
- Font size control (11px–20px) via slider panel
- Keyboard shortcuts panel (Ctrl+Enter, Ctrl+], Ctrl+[, Ctrl+1/2/3, etc.)
- Reset modal to restore lesson starter code
- Copy all code button (HTML + CSS + JS combined)
- Completion banner with confetti animation on finishing all 16 lessons
- Toast notification system
- Tab-switch glitch animation
- Hint boxes and challenge boxes inside lesson instructions
- Zero external JavaScript dependencies
- Zero build tools required — open index.html and go
- Apache 2.0 license
- GitHub Pages deployment support

### Fixed

- Editor cursor misalignment caused by `word-break: break-all` on highlight layer
- Hex color swatches in CSS highlighter no longer shift text layout
- Scroll sync between textarea and highlight layer now uses requestAnimationFrame
- `-webkit-text-fill-color: transparent` applied to textarea to fix Safari caret rendering
