# DevForge API Reference

## Overview

DevForge exposes its functionality through global functions on the `window`
object. These are referenced by inline event handlers in `index.html` and
are listed here for contributor reference.

---

## Curriculum

### `window.CURRICULUM` (read-only array)

The frozen curriculum array. Each chapter object:
```ts
{
  chapter: string;
  lessons: Lesson[];
}
```

Each lesson object:
```ts
{
  id: string;           // unique kebab-case ID
  tag: "HTML" | "CSS" | "JS";
  title: string;        // short sidebar title
  xp: number;           // 20–50
  paneTitle: string;    // instruction pane header
  instruction: string;  // HTML instruction content
  html: string;         // starter HTML code
  css: string;          // starter CSS code
  js: string;           // starter JS code
}
```

---

## Lesson Management

### `loadLesson(id: string): void`
Loads a lesson by ID. Saves current buffer, updates sidebar highlight,
renders instruction pane, builds file tabs, and runs the code.

### `navLesson(dir: 1 | -1): void`
Navigates to the next (`1`) or previous (`-1`) lesson.

### `getLesson(id: string): Lesson | null`
Returns the lesson object for the given ID.

### `getAllLessons(): Lesson[]`
Returns all lessons flattened across all chapters.

### `getLessonIndex(id: string): number`
Returns the flat index of a lesson by ID.

---

## Editor

### `switchTab(tab: "html" | "css" | "js"): void`
Switches the editor to the specified language tab. Saves current buffer,
updates tab highlighting, loads the new tab's content.

### `loadTab(tab: "html" | "css" | "js"): void`
Loads editor content for the given tab from the current lesson's buffer.

### `onEditorInput(): void`
Called on every editor input event. Saves the buffer, updates line numbers
and syntax highlighting. Triggers auto-run if enabled.

### `handleEditorKey(e: KeyboardEvent): void`
Handles special key events in the editor:
- **Tab**: inserts 2 spaces
- **Enter**: auto-indents to match previous line
- **Brackets/quotes**: auto-close pairs and handles overtyping
- **Backspace**: deletes both characters of an empty pair

### `syncScroll(el: HTMLElement): void`
Syncs the line-number column and highlight layer scroll to match the
textarea scroll position.

### `editorUndo(): void`
Undoes the last editor change for the current (lesson, tab).

### `editorRedo(): void`
Redoes the last undone editor change.

---

## Preview

### `runCode(): void`
Builds the preview document from the current lesson buffers and renders
it in the iframe. Awards XP on first lesson run, updates progress, and
checks for completion.

### `extractBody(html: string): string`
Extracts the content between `<body>` tags from HTML code.

### `buildPreviewDoc(body: string, css: string, js: string): string`
Constructs a standalone HTML document with console interception.

### `setPreviewSize(size: "desktop" | "tablet" | "mobile"): void`
Changes the preview viewport size, adding CSS class constraints.

---

## Sidebar

### `buildSidebar(filter?: string): void`
Rebuilds the sidebar lesson list. Optionally filters by search query.

### `filterLessons(val: string): void`
Filters the sidebar by search input value.

### `clearSearch(): void`
Clears the sidebar search input and restores all lessons.

### `toggleSidebar(): void`
Toggles sidebar visibility (for mobile/narrow layouts).

---

## Console

### `clearConsoleUI(): void`
Clears the console output and resets the error badge.

### `addConsoleLog(type: string, text: string, ts: number): void`
Adds a log entry to the console with prefix, timestamp, and copy button.

### `toggleConsole(): void`
Collapses/expands the console panel.

### `filterConsole(val: string): void`
Filters visible console entries by text match.

### `clearConsoleFilter(): void`
Clears the console filter input and restores all entries.

### `copyConsoleText(btn: HTMLElement): void`
Copies a specific console line's text content to the clipboard.

---

## XP & Progress

### `updateProgress(): void`
Updates the progress bar, text, and ARIA attributes based on completed
lessons.

### `toggleAutorun(): void`
Toggles the auto-run feature on/off.

### `showToast(msg: string, type?: string, icon?: string): void`
Shows a toast notification with optional icon and styling.

### `announce(msg: string): void`
Updates the screen reader live region for accessibility announcements.

---

## Modals & UI

### `showResetModal(): void`
Opens the reset confirmation modal with keyboard focus trap.

### `hideResetModal(): void`
Closes the reset modal and returns focus to the Run button.

### `confirmReset(): void`
Resets the current lesson's code to starter values.

### `toggleLessonPane(): void`
Collapses/expands the lesson instruction pane.

### `toggleShortcuts(): void`
Toggles the keyboard shortcuts panel.

### `toggleFsPanel(): void`
Toggles the font size slider panel.

### `changeFontSize(val: string): void`
Changes the editor font size and updates the display.

### `copyAllCode(): void`
Copies all three code tabs (HTML + CSS + JS) to clipboard in a formatted
block.

### `showCompletion(): void`
Shows the completion banner with confetti animation.

### `hideCompletion(): void`
Hides the completion banner.

### `restartAll(): void`
Resets all progress — clears XP, streak, and completed set, reloads
the first lesson.

---

## Drag Resizer

### `initResizer(): void`
Initializes the editor/preview split resizer with mouse and touch support.
Called once at startup.

---

## Syntax Highlighting

### `highlight(): void`
Applies syntax highlighting to the current editor content based on the
active tab (HTML, CSS, or JS).

### `highlightHTML(code: string): string`
Highlights HTML syntax (tags, attributes, values, comments).

### `highlightCSS(code: string): string`
Highlights CSS syntax (selectors, properties, values, comments, hex colors).

### `highlightJS(code: string): string`
Highlights JavaScript syntax (keywords, strings, numbers, booleans,
comments, function calls, template literals).

### `escHtml(s: string): string`
HTML-escapes a string for safe injection (used by the highlighter).

### `escapeHtml(s: string): string`
HTML-escapes a string for safe `innerHTML` (used by console rendering).
