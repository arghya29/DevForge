/* ═══════════════════════════════════════════════════════════════
   DevForge — editor.js
   Code editor logic: key handling, undo/redo, syntax highlighting,
   line numbers, scroll sync, and the "Go to Line" feature.
   Depends on: shared state in app.js, storage.js, lesson.js (for
   validateGoals — resolved at call time)
═══════════════════════════════════════════════════════════════ */
/* exported
  editorUndo,
  editorRedo,
  applyEditorState,
  onEditorInput,
  pushUndoState,
  flushUndoState,
  seedUndoState,
  commitUndoState,
  updateLineNums,
  syncScroll,
  handleEditorKey,
  highlight,
  highlightHTML,
  highlightCSS,
  highlightJS,
  escHtml,
  escapeHtml,
  toggleGoToLine,
  showGoToLine,
  hideGoToLine,
  executeGoToLine
*/
"use strict";

const undoStacks = {}; // { [lessonId_tab]: [string] }
const redoStacks = {}; // { [lessonId_tab]: [string] }
const undoPushTimers = {}; // { [lessonId_tab]: timeoutId }
const pendingUndoValues = {}; // { [lessonId_tab]: string }
const UNDO_MAX = 50;

let lastLineCount = 0;

// Base editor font size is 13px with 1.65 line-height, yielding a default line height of 21.45px.
const DEFAULT_LINE_HEIGHT_PX = 21.45;

/* ══════════════════════════════════════════════════════════
   UNDO / REDO
══════════════════════════════════════════════════════════ */
function editorUndo() {
  const key = currentLessonId + "_" + activeTab;
  flushUndoState(key);
  const stack = undoStacks[key];
  if (!stack || stack.length < 2) return;
  const current = stack.pop();
  if (!redoStacks[key]) redoStacks[key] = [];
  redoStacks[key].push(current);
  const prev = stack[stack.length - 1];
  applyEditorState(prev);
}

function editorRedo() {
  const key = currentLessonId + "_" + activeTab;
  flushUndoState(key);
  const stack = redoStacks[key];
  if (!stack || stack.length === 0) return;
  const next = stack.pop();
  if (!undoStacks[key]) undoStacks[key] = [];
  undoStacks[key].push(next);
  applyEditorState(next);
}

function applyEditorState(val) {
  if (val === undefined) return;
  const editor = document.getElementById("codeEditor");
  editor.value = val;
  buffers[currentLessonId][activeTab] = val;
  updateLineNums();
  highlight();
  scheduleSave();
  if (autorun) {
    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCode, 900);
  }
}

/* ══════════════════════════════════════════════════════════
   EDITOR EVENTS
══════════════════════════════════════════════════════════ */
function onEditorInput() {
  if (isReadOnlyMode) return;
  if (!buffers[currentLessonId]) return;
  const editor = document.getElementById("codeEditor");
  const newVal = editor.value;
  const key = currentLessonId + "_" + activeTab;
  buffers[currentLessonId][activeTab] = newVal;
  updateLineNums();
  highlight();
  scheduleSave();

  if (autorun) {
    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCode, 900);
  }

  pushUndoState(key, newVal);

  // Live goal validation on every keystroke
  validateGoals();
}

function pushUndoState(key, val) {
  clearTimeout(undoPushTimers[key]);
  pendingUndoValues[key] = val;
  undoPushTimers[key] = setTimeout(() => flushUndoState(key), 100);
}

function flushUndoState(key, options = {}) {
  clearTimeout(undoPushTimers[key]);
  delete undoPushTimers[key];
  if (!Object.prototype.hasOwnProperty.call(pendingUndoValues, key)) return;
  const val = pendingUndoValues[key];
  delete pendingUndoValues[key];
  commitUndoState(key, val, options);
}

function seedUndoState(key, val) {
  if (!undoStacks[key]) undoStacks[key] = [];
  if (!redoStacks[key]) redoStacks[key] = [];
  if (undoStacks[key].length === 0 && val !== undefined) {
    undoStacks[key].push(val);
  }
}

function commitUndoState(key, val, options = {}) {
  if (!undoStacks[key]) undoStacks[key] = [];
  if (!redoStacks[key]) redoStacks[key] = [];
  const last = undoStacks[key][undoStacks[key].length - 1];
  if (last !== val && val !== undefined) {
    undoStacks[key].push(val);
    if (!options.preserveRedo) redoStacks[key] = [];
    if (undoStacks[key].length > UNDO_MAX) undoStacks[key].shift();
  }
}

function updateLineNums() {
  const editor = document.getElementById("codeEditor");
  if (!editor) return;
  const count = editor.value.split("\n").length;
  if (count === lastLineCount) return;
  lastLineCount = count;
  const nums = document.getElementById("lineNums");
  if (nums) {
    nums.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join("");
  }
}

function syncScroll(el) {
  // Use rAF so the highlight layer updates in the same paint frame as the textarea
  requestAnimationFrame(() => {
    document.getElementById("lineNums").scrollTop = el.scrollTop;
    const hl = document.getElementById("codeHighlight");
    hl.scrollTop = el.scrollTop;
    hl.scrollLeft = el.scrollLeft;
  });
}

function handleEditorKey(e) {
  if (isReadOnlyMode) return;
  const el = e.target;
  const s = el.selectionStart;
  const end = el.selectionEnd;

  // Tab → insert 2 spaces. Uses execCommand so the edit lands on the textarea's
  // native undo stack (Ctrl+Z), consistent with the auto-close paths below.
  if (e.key === "Tab") {
    e.preventDefault();
    document.execCommand("insertText", false, "  ");
    onEditorInput();
    return;
  }

  // Enter → auto-indent, carrying the current line's leading whitespace (and an
  // extra level after an opening "{" or ":"). Uses execCommand so it, too, is
  // undoable.
  if (e.key === "Enter") {
    e.preventDefault();
    const lines = el.value.substring(0, s).split("\n");
    const lastLine = lines[lines.length - 1];
    const indent = lastLine.match(/^(\s*)/)[1];
    const extra = /[{:]$/.test(lastLine.trimEnd()) ? "  " : "";
    document.execCommand("insertText", false, "\n" + indent + extra);
    onEditorInput();
    return;
  }

  // Don't hijack keyboard shortcuts (e.g. Cmd+[, Ctrl+], Alt+combos) or mangle
  // their input. Shift is intentionally NOT included — "(", "{", '"', etc. are
  // shifted characters and must still auto-close.
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Auto-close brackets and quotes (as advertised in the README feature table).
  const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
  const CLOSERS = new Set(Object.values(PAIRS));
  const nextChar = el.value.charAt(end);
  const isPairKey = Object.prototype.hasOwnProperty.call(PAIRS, e.key);

  // Typing a closing char when the same char is already next → step over it
  if (CLOSERS.has(e.key) && nextChar === e.key && s === end) {
    e.preventDefault();
    el.selectionStart = el.selectionEnd = end + 1;
    return;
  }

  // For quotes, skip auto-close when adjacent to word characters
  // to avoid mangling contractions (e.g. "don't") or identifiers.
  const isQuote = e.key === '"' || e.key === "'" || e.key === "`";
  if (isQuote && s === end) {
    const prevChar = el.value.charAt(s - 1);
    const wordBefore = /[\w]/.test(prevChar);
    const wordAfter = /[\w]/.test(nextChar);
    if (wordBefore || wordAfter || nextChar === e.key) return;
  }
  // Typing an opening bracket/brace/quote: insert the matching closer. If there's
  // a selection, wrap it in the pair (e.g. select foo, press "(" → (foo)). The
  // opener, any wrapped selection, and the closer are inserted as a single
  // synchronous execCommand call, so the whole edit is one atomic action on the
  // textarea's native undo stack (Ctrl+Z). Doing it in the same turn — rather
  // than deferring the closer with setTimeout — also means we never mutate the
  // editor through a stale el/selection reference if focus, the active tab, or
  // the current lesson changes before a timer would have fired.
  if (isPairKey) {
    const close = PAIRS[e.key];
    const selected = s !== end ? el.value.substring(s, end) : "";
    e.preventDefault();
    document.execCommand("insertText", false, e.key + selected + close);
    // Caret goes between the pair: after the opener and any wrapped selection,
    // before the closer.
    const caret = s + e.key.length + selected.length;
    el.setSelectionRange(caret, caret);
    onEditorInput();
    return;
  }

  // Backspace between an empty auto-closed pair → delete both characters, so
  // removing the opener you just typed also removes the inserted closer. Uses
  // execCommand so the paired delete stays on the native undo stack.
  if (e.key === "Backspace" && s === end && s > 0) {
    const prevChar = el.value.charAt(s - 1);
    if (Object.prototype.hasOwnProperty.call(PAIRS, prevChar) && PAIRS[prevChar] === nextChar) {
      e.preventDefault();
      el.setSelectionRange(s - 1, s + 1);
      document.execCommand("delete");
      onEditorInput();
      return;
    }
  }
}

/* ══════════════════════════════════════════════════════════
    SYNTAX HIGHLIGHTING
   (A simple regex-based highlighter — no external deps)
══════════════════════════════════════════════════════════ */
function highlight() {
  const editor = document.getElementById("codeEditor");
  const hlEl = document.getElementById("codeHighlight");
  let code = editor.value;
  const tab = activeTab;

  // Escape HTML entities first so we don't break the DOM
  code = escHtml(code);

  if (tab === "html") {
    code = highlightHTML(code);
  } else if (tab === "css") {
    code = highlightCSS(code);
  } else if (tab === "js") {
    code = highlightJS(code);
  }

  hlEl.innerHTML = code + "\n"; // trailing newline keeps caret visible on last line
}

function highlightHTML(code) {
  return (
    code
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span class="tok-cmt">$1</span>`)
      // Tags: opening/closing brackets + tag name
      .replace(/(&lt;\/?)([\w-]+)/g, (_, p1, p2) => `${p1}<span class="tok-tag">${p2}</span>`)
      // Attributes
      .replace(/ ([\w-]+)=/g, (_, p1) => ` <span class="tok-attr">${p1}</span>=`)
      // Attribute values (quoted)
      .replace(
        /=(&quot;[^&"]*&quot;|&#039;[^']*&#039;)/g,
        (_, p1) => `=<span class="tok-val">${p1}</span>`
      )
  );
}

function highlightCSS(code) {
  return (
    code
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, `<span class="tok-cmt">$1</span>`)
      // Hex colors — tiny inline swatch that does NOT change text width
      .replace(/(#[0-9a-fA-F]{3,8})\b/g, (_, hex) => {
        return `<span class="tok-val" style="border-bottom:2px solid ${hex}">${hex}</span>`;
      })
      // Selectors (before {)
      .replace(
        /([.#]?[\w-]+(?:\s*,\s*[.#]?[\w-]+)*)\s*\{/g,
        (m, sel) => `<span class="tok-sel">${sel}</span> {`
      )
      // Properties (before :)
      .replace(/([\w-]+)\s*:/g, (_, p) => `<span class="tok-prop">${p}</span>:`)
      // Values (after :, before ; or })
      .replace(/:\s*([^;{}\n]+)/g, (_, v) => `: <span class="tok-unit">${v}</span>`)
  );
}

function highlightJS(code) {
  // Order matters — apply broader patterns first, then narrow
  const KW =
    /\b(const|let|var|function|return|if|else|for|while|of|in|new|this|class|extends|super|async|await|try|catch|finally|throw|import|export|default|typeof|instanceof|void|delete|switch|case|break|continue)\b/g;
  const BOOL = /\b(true|false|null|undefined|NaN|Infinity)\b/g;

  return (
    code
      // Single-line comments (do first to avoid clashing with other patterns)
      .replace(/(\/\/[^\n]*)/g, `<span class="tok-cmt">$1</span>`)
      // Multi-line comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, `<span class="tok-cmt">$1</span>`)
      // Template literals (backticks were escaped to &#96; by escHtml)
      .replace(/(&#96;[\s\S]*?&#96;)/g, `<span class="tok-str">$1</span>`)
      // Double-quoted strings
      .replace(/(&quot;[^&\n]*&quot;)/g, `<span class="tok-str">$1</span>`)
      // Single-quoted strings
      .replace(/(&#039;[^&\n]*&#039;)/g, `<span class="tok-str">$1</span>`)
      // Keywords
      .replace(KW, `<span class="tok-kw">$1</span>`)
      // Booleans / null / undefined
      .replace(BOOL, `<span class="tok-bool">$1</span>`)
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, `<span class="tok-num">$1</span>`)
      // Function calls (word followed by open paren)
      .replace(/\b([\w$]+)\s*\(/g, (m, name) => {
        if (/^(if|for|while|switch|catch)$/.test(name)) return m;
        return `<span class="tok-fn">${name}</span>(`;
      })
  );
}

// Escape HTML for safe injection into the highlight layer
function escHtml(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#96;");
}

// Safe escape for user-provided strings inside innerHTML
function escapeHtml(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ══════════════════════════════════════════════════════════
   GO TO LINE FEATURE (#81)
══════════════════════════════════════════════════════════ */
function toggleGoToLine() {
  const popover = document.getElementById("goToLinePopover");
  if (!popover) return;
  if (popover.style.display === "none") {
    showGoToLine();
  } else {
    hideGoToLine();
  }
}

function showGoToLine() {
  const popover = document.getElementById("goToLinePopover");
  const input = document.getElementById("goToLineInput");
  const error = document.getElementById("goToLineError");
  if (!popover || !input) return;

  // Close other popovers or modals if open
  if (activeModalEl) closeModal(activeModalEl);
  if (fsPanelVisible) toggleFsPanel();

  popover.style.display = "flex";
  input.value = "";
  if (error) error.style.display = "none";
  input.focus();
}

function hideGoToLine() {
  const popover = document.getElementById("goToLinePopover");
  if (!popover) return;
  popover.style.display = "none";
  const editor = document.getElementById("codeEditor");
  if (editor) editor.focus();
}

function executeGoToLine() {
  const input = document.getElementById("goToLineInput");
  const error = document.getElementById("goToLineError");
  const editor = document.getElementById("codeEditor");
  if (!input || !editor) return;

  const lineNum = parseInt(input.value, 10);
  const lines = editor.value.split("\n");

  if (isNaN(lineNum) || lineNum < 1 || lineNum > lines.length) {
    if (error) error.style.display = "block";
    return;
  }

  if (error) error.style.display = "none";
  hideGoToLine();

  // Calculate position index. Since split('\n') leaves '\r' in CRLF files,
  // lines[i].length naturally accounts for '\r' if present.
  let pos = 0;
  for (let i = 0; i < lineNum - 1; i++) {
    pos += lines[i].length + 1;
  }

  editor.focus();
  editor.selectionStart = pos;
  editor.selectionEnd = pos;

  // Scroll to line
  const style = window.getComputedStyle(editor);
  const lh = parseFloat(style.lineHeight) || DEFAULT_LINE_HEIGHT_PX;
  editor.scrollTop = (lineNum - 1) * lh;
}
