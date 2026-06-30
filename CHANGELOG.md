# Changelog

All notable changes to DevForge are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-06-30

### Added

- Console output truncation at 2000 characters with ellipsis
- Console line limit (max 200 lines) with automatic oldest-line removal
- Auto-scroll lock: console stops auto-scrolling when user scrolls up
- Copy-to-clipboard button on each console line (appears on hover)
- Console filter input to search/filter log output in real-time
- `filterConsole()`, `clearConsoleFilter()`, `copyConsoleText()` functions

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
