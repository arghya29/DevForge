/* ═══════════════════════════════════════════════════════════════
   DevForge — app.js
   All application logic: state, editor, syntax highlighting,
   sidebar, console, preview, XP, keyboard shortcuts, resizer.
   Depends on: curriculum.js (CURRICULUM array must load first)
═══════════════════════════════════════════════════════════════ */

"use strict";

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */
let currentLessonId = CURRICULUM[0].lessons[0].id;
let activeTab = "html"; // "html" | "css" | "js"
let lessonPaneOpen = true;
let consolePaneOpen = true;
let goalsPanelOpen = true; // Goals checklist collapse state
let autorun = false;
let autorunTimer = null;
let shortcutsVisible = false;
let fsPanelVisible = false;
let sidebarOpen = true;
let xp = 0;
let streak = 0;
let lastRunLesson = null;
let errorCount = 0;
let consoleScrolledUp = false;
const CONSOLE_MAX_LINES = 200;
let consoleLineCount = 0;

const doneSet = new Set(); // lesson ids that have been run at least once
const buffers = {}; // { [lessonId]: { html, css, js } }  — user edits
const scrollPositions = {}; // { [lessonId_tab]: scrollTop }
const undoStacks = {}; // { [lessonId_tab]: [string] }
const redoStacks = {}; // { [lessonId_tab]: [string] }
const undoPushTimers = {}; // { [lessonId_tab]: timeoutId }
const pendingUndoValues = {}; // { [lessonId_tab]: string }
const UNDO_MAX = 50;

/* ══════════════════════════════════════════════════════════
   PERSISTENCE — save/restore learner progress via localStorage
══════════════════════════════════════════════════════════ */
const STORAGE_KEY = "devforge:progress:v1";
let saveTimer = null;

// Persist XP, streak, completed-lesson ids, and per-lesson code buffers.
function saveProgress() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        xp: xp,
        streak: streak,
        done: Array.from(doneSet),
        buffers: buffers,
      })
    );
  } catch {
    return; // storage unavailable (private mode) or quota exceeded — ignore
  }
}

// Debounced save so we don't write to storage on every keystroke.
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgress, 500);
}

// Restore saved progress on load, defensively validating every field.
function loadProgress() {
  let data;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    data = JSON.parse(raw);
  } catch {
    return; // storage unavailable or corrupt JSON — start fresh
  }
  if (!data || typeof data !== "object") return;

  if (typeof data.xp === "number" && Number.isFinite(data.xp) && data.xp >= 0) {
    xp = data.xp;
  }
  if (typeof data.streak === "number" && Number.isFinite(data.streak) && data.streak >= 0) {
    streak = data.streak;
  }
  const validIds = new Set(getAllLessons().map(l => l.id));
  if (Array.isArray(data.done)) {
    data.done.forEach(id => {
      if (validIds.has(id)) doneSet.add(id);
    });
  }
  if (data.buffers && typeof data.buffers === "object" && !Array.isArray(data.buffers)) {
    Object.keys(data.buffers).forEach(id => {
      if (!validIds.has(id)) return;
      const b = data.buffers[id];
      if (
        b &&
        typeof b === "object" &&
        typeof b.html === "string" &&
        typeof b.css === "string" &&
        typeof b.js === "string"
      ) {
        buffers[id] = { html: b.html, css: b.css, js: b.js };
      }
    });
  }
}

// Wipe persisted progress (used by the Restart flow).
function clearProgress() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return; // ignore
  }
}

// Accessible-name labels for the code editor, keyed by the active language tab.
const EDITOR_ARIA_LABELS = {
  html: "HTML code editor",
  css: "CSS code editor",
  js: "JS code editor",
};

/* ══════════════════════════════════════════════════════════
   HELPERS — curriculum lookups
══════════════════════════════════════════════════════════ */
function getLesson(id) {
  for (const ch of CURRICULUM) for (const l of ch.lessons) if (l.id === id) return l;
  return null;
}

function getAllLessons() {
  return CURRICULUM.flatMap(ch => ch.lessons);
}

function getLessonIndex(id) {
  return getAllLessons().findIndex(l => l.id === id);
}

/* ══════════════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════════════ */
function init() {
  loadProgress();
  buildSidebar();
  loadLesson(currentLessonId, { trackProgress: false });
  document.getElementById("xpVal").textContent = xp;
  document.getElementById("streakLabel").textContent = `🔥 ${streak} streak`;
  updateProgress();
  initResizer();
  if (window.innerWidth <= 768) {
    sidebarOpen = false;
    document.querySelector(".sidebar").classList.add("collapsed");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    sidebarToggleBtn.classList.add("active");
    sidebarToggleBtn.setAttribute("aria-expanded", "false");
  }
  console.info("DevForge initialised — " + getAllLessons().length + " lessons ready.");
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════ */
function buildSidebar(filter = "") {
  const listEl = document.getElementById("lessonList");
  listEl.innerHTML = "";
  const q = filter.toLowerCase();

  CURRICULUM.forEach(ch => {
    const matching = ch.lessons.filter(
      l => !q || l.title.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q)
    );
    if (!matching.length) return;

    const chDiv = document.createElement("div");
    chDiv.className = "chapter";
    chDiv.innerHTML = `<div class="chapter-label">${ch.chapter}</div>`;

    matching.forEach(l => {
      const item = document.createElement("div");
      item.className =
        "lesson-item" +
        (l.id === currentLessonId ? " active" : "") +
        (doneSet.has(l.id) ? " done" : "");
      item.id = "sidebar-" + l.id;
      item.innerHTML = `
        <span class="lesson-dot"></span>
        <div class="lesson-meta">
          <div class="lesson-title">${l.title}</div>
          <span class="lesson-tag tag-${l.tag}">${l.tag} · ${l.xp}xp</span>
        </div>`;
      item.addEventListener("click", () => loadLesson(l.id));
      chDiv.appendChild(item);
    });

    listEl.appendChild(chDiv);
  });
}

function filterLessons(val) {
  document.getElementById("searchClear").style.display = val ? "block" : "none";
  buildSidebar(val);
}

function clearSearch() {
  const inp = document.getElementById("searchInput");
  inp.value = "";
  document.getElementById("searchClear").style.display = "none";
  buildSidebar("");
}

/* ══════════════════════════════════════════════════════════
   LESSON LOADING
══════════════════════════════════════════════════════════ */
function loadLesson(id, { trackProgress = true } = {}) {
  saveCurrentBuffer();
  currentLessonId = id;
  const lesson = getLesson(id);
  if (!lesson) return;

  // Initialise buffer on first visit
  if (!buffers[id]) {
    buffers[id] = { html: lesson.html, css: lesson.css, js: lesson.js };
  }

  // Highlight active sidebar item
  document.querySelectorAll(".lesson-item").forEach(el => el.classList.remove("active"));
  const sideEl = document.getElementById("sidebar-" + id);
  if (sideEl) {
    sideEl.classList.add("active");
    sideEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // Lesson instruction pane
  document.getElementById("lessonPaneTitle").textContent = "📖 " + lesson.paneTitle;
  document.getElementById("lessonContent").innerHTML = lesson.instruction;

  // Challenge badge in header
  const hasChal = lesson.instruction.includes("challenge-box");
  document.getElementById("challengeIndicator").classList.toggle("show", hasChal);

  // File tabs & editor
  buildFileTabs();
  loadTab(activeTab);
  updateNav();
  runCode({ trackProgress });

  // Build goals checklist for new lesson
  goalsPanelOpen = true;
  const goalsPanel = document.getElementById("goalsPanel");
  if (goalsPanel) {
    goalsPanel.classList.remove("collapsed");
    delete goalsPanel.dataset.celebrated;
  }
  validateGoals();
}

function saveCurrentBuffer() {
  if (!currentLessonId || !buffers[currentLessonId]) return;
  const editor = document.getElementById("codeEditor");
  buffers[currentLessonId][activeTab] = editor.value;
  scrollPositions[currentLessonId + "_" + activeTab] = editor.scrollTop;
  flushUndoState(currentLessonId + "_" + activeTab);
}

/* ══════════════════════════════════════════════════════════
   FILE TABS  (index.html / index.css / index.js)
══════════════════════════════════════════════════════════ */
const TAB_DOT_COLORS = { html: "#f0641e", css: "#58A6FF", js: "#D29922" };

function buildFileTabs() {
  const container = document.getElementById("fileTabs");
  container.innerHTML = ["html", "css", "js"]
    .map(
      t => `
    <button type="button" class="file-tab ${activeTab === t ? "active" : ""}"
         id="fileTab-${t}"
         role="tab"
         aria-selected="${activeTab === t ? "true" : "false"}"
         aria-controls="codeEditor"
         onclick="switchTab('${t}')">
      <span class="file-dot" style="background:${TAB_DOT_COLORS[t]}"></span>
      index.${t}
    </button>`
    )
    .join("");
}

function switchTab(tab) {
  saveCurrentBuffer();
  activeTab = tab;

  // Sync header tab buttons
  ["html", "css", "js"].forEach(t => {
    const btn = document.getElementById("tab" + t.toUpperCase());
    if (btn) btn.classList.toggle("active", t === tab);
  });

  buildFileTabs();
  loadTab(tab);
}

function loadTab(tab) {
  const buf = buffers[currentLessonId];
  if (!buf) return;

  const editor = document.getElementById("codeEditor");
  editor.value = buf[tab] || "";
  seedUndoState(currentLessonId + "_" + tab, editor.value);
  editor.setAttribute("aria-label", EDITOR_ARIA_LABELS[tab] || "Code editor");
  updateLineNums();
  highlight();

  requestAnimationFrame(() => {
    const key = currentLessonId + "_" + tab;
    if (scrollPositions[key] !== undefined) {
      editor.scrollTop = scrollPositions[key];
    }
  });

  editor.classList.add("glitch-in");
  setTimeout(() => editor.classList.remove("glitch-in"), 400);
}

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
  flushUndoState(key, { preserveRedo: true });
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
  const count = editor.value.split("\n").length;
  const nums = document.getElementById("lineNums");
  nums.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join("");
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
      // Template literals
      .replace(/(`[^`]*`)/g, `<span class="tok-str">$1</span>`)
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
   RUN CODE → render into the preview iframe
══════════════════════════════════════════════════════════ */
function runCode(options = {}) {
  const { trackProgress = true } = options;
  saveCurrentBuffer();
  const buf = buffers[currentLessonId];
  if (!buf) return;

  // Visual feedback
  const btn = document.getElementById("runBtn");
  btn.classList.add("running");
  btn.textContent = "⏳ Running";
  document.getElementById("previewOverlay").classList.add("show");
  errorCount = 0;
  clearConsoleUI();

  // Extract <body> content from the HTML buffer
  const bodyContent = extractBody(buf.html || "");

  // Build a standalone document to inject into the iframe
  const doc = buildPreviewDoc(bodyContent, buf.css || "", buf.js || "");
  document.getElementById("previewFrame").srcdoc = doc;

  // Award XP on first run of each lesson
  if (trackProgress && lastRunLesson !== currentLessonId) {
    const lesson = getLesson(currentLessonId);
    if (!doneSet.has(currentLessonId)) {
      xp += lesson.xp;
      streak += 1;
      document.getElementById("xpVal").textContent = xp;
      document.getElementById("streakLabel").textContent = `🔥 ${streak} streak`;
      showToast(`+${lesson.xp} XP earned! 🎉`, "success", "🏅");
    }
    lastRunLesson = currentLessonId;
  }

  // Mark lesson done
  if (trackProgress) {
    const isNewlyDone = !doneSet.has(currentLessonId);
    doneSet.add(currentLessonId);
    const sideEl = document.getElementById("sidebar-" + currentLessonId);
    if (sideEl) sideEl.classList.add("done");

    updateProgress();
    if (isNewlyDone) saveProgress();
  }

  // Remove overlay after a short delay
  setTimeout(() => {
    document.getElementById("previewOverlay").classList.remove("show");
    btn.classList.remove("running");
    btn.textContent = "▶ Run";
  }, 400);

  // Show completion banner if all lessons done
  if (trackProgress && doneSet.size === getAllLessons().length) {
    setTimeout(showCompletion, 700);
  }
}

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html;
}

function buildPreviewDoc(bodyContent, css, js) {
  // Escape any </script> in user code so it can't break out of the script block.
  const safeJs = (js || "").replace(/<\/script/gi, "<\\/script");
  // Intercept console.* inside the iframe and forward to parent via postMessage
  const consoleIntercept = `
(function () {
  ["log", "error", "warn", "info"].forEach(function(type) {
    var orig = console[type].bind(console);
    console[type] = function() {
      orig.apply(console, arguments);
      var args = Array.prototype.slice.call(arguments).map(function(x) {
        try { return typeof x === "object" ? JSON.stringify(x) : String(x); }
        catch(e) { return String(x); }
      });
      window.parent.postMessage({ type: type, args: args, ts: Date.now() }, "*");
    };
  });
  window.onerror = function(msg, src, line) {
    window.parent.postMessage({ type: "error", args: [msg + " (line " + line + ")"], ts: Date.now() }, "*");
    return true;
  };
})();`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  ${css}
</style>
</head>
<body>
${bodyContent}
<script>
${consoleIntercept}
</script>
<script>
${safeJs}
</script>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   LESSON NAVIGATION
══════════════════════════════════════════════════════════ */
function updateNav() {
  const all = getAllLessons();
  const idx = getLessonIndex(currentLessonId);
  document.getElementById("prevBtn").disabled = idx <= 0;
  document.getElementById("nextBtn").disabled = idx >= all.length - 1;
  document.getElementById("lessonPos").textContent = `${idx + 1} / ${all.length}`;
}

function navLesson(dir) {
  const all = getAllLessons();
  const idx = getLessonIndex(currentLessonId);
  const next = all[idx + dir];
  if (next) loadLesson(next.id);
}

/* ══════════════════════════════════════════════════════════
   CONSOLE PANEL
══════════════════════════════════════════════════════════ */
// Receive console messages forwarded from the iframe
window.addEventListener("message", e => {
  // Only accept messages from our own preview iframe. Its srcdoc document has an
  // opaque origin (reported inconsistently across browsers), so verify the source
  // window reference rather than e.origin.
  const previewFrame = document.getElementById("previewFrame");
  if (!previewFrame || e.source !== previewFrame.contentWindow) return;
  if (!e.data || !["log", "error", "warn", "info"].includes(e.data.type)) return;
  if (!Array.isArray(e.data.args)) return;
  addConsoleLog(e.data.type, e.data.args.join(" "), e.data.ts);
});

document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("consoleBody");
  if (body) {
    body.addEventListener("scroll", () => {
      const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 30;
      consoleScrolledUp = !atBottom;
    });
  }
});

function clearConsoleUI() {
  errorCount = 0;
  consoleLineCount = 0;
  consoleScrolledUp = false;
  document.getElementById("consoleBadge").style.display = "none";
  document.getElementById("consoleBody").innerHTML =
    `<div class="log-line info"><span class="log-prefix">ℹ</span><span>Running…</span></div>`;
}

function addConsoleLog(type, text, ts) {
  const body = document.getElementById("consoleBody");
  const el = document.createElement("div");
  const cls =
    type === "error" ? "err" : type === "warn" ? "warn" : type === "info" ? "info" : "log";
  const prefix = type === "error" ? "✖" : type === "warn" ? "⚠" : type === "info" ? "ℹ" : "›";
  const time = ts
    ? new Date(ts).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  const maxLen = 2000;
  const displayText = text.length > maxLen ? text.slice(0, maxLen) + "…" : text;

  el.className = "log-line " + cls;
  el.innerHTML = `
    <span class="log-prefix">${prefix}</span>
    <span class="log-ts">${time}</span>
    <span class="log-msg">${escapeHtml(displayText)}</span>
    <button type="button" class="log-copy" onclick="copyConsoleText(this)" title="Copy line">⎘</button>`;
  applyConsoleFilter(el);

  body.appendChild(el);
  consoleLineCount++;

  if (consoleLineCount > CONSOLE_MAX_LINES) {
    const excess = consoleLineCount - CONSOLE_MAX_LINES;
    for (let i = 0; i < excess; i++) {
      const first = body.firstElementChild;
      if (first) body.removeChild(first);
    }
    consoleLineCount = CONSOLE_MAX_LINES;
  }

  // Auto-scroll only if user hasn't scrolled up
  if (!consoleScrolledUp) {
    body.scrollTop = body.scrollHeight;
  }

  if (type === "error") {
    errorCount++;
    const badge = document.getElementById("consoleBadge");
    badge.style.display = "inline";
    badge.textContent = errorCount;
  }
}

function copyConsoleText(btn) {
  const msgEl = btn.parentElement.querySelector(".log-msg");
  if (!msgEl) return;
  const text = msgEl.textContent;
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      btn.textContent = "✓";
      setTimeout(() => {
        btn.textContent = "⎘";
      }, 1200);
    })
    .catch(() => {});
}

function toggleConsole() {
  consolePaneOpen = !consolePaneOpen;
  document.getElementById("consolePane").classList.toggle("collapsed", !consolePaneOpen);
  document.getElementById("consolCollapseBtn").style.transform = consolePaneOpen
    ? ""
    : "rotate(180deg)";
}

function filterConsole(val) {
  document.querySelectorAll("#consoleBody .log-line").forEach(el => {
    applyConsoleFilter(el, val);
  });
}

function applyConsoleFilter(el, val = null) {
  const filter = val !== null ? val : document.getElementById("consoleFilter")?.value || "";
  const q = filter.toLowerCase();
  const text = el.textContent.toLowerCase();
  el.style.display = !q || text.includes(q) ? "" : "none";
}

function clearConsoleFilter() {
  const inp = document.getElementById("consoleFilter");
  if (inp) {
    inp.value = "";
    filterConsole("");
  }
}

/* ══════════════════════════════════════════════════════════
   LESSON PANE (collapsible instruction area)
══════════════════════════════════════════════════════════ */
function toggleLessonPane() {
  lessonPaneOpen = !lessonPaneOpen;
  document.getElementById("lessonPane").classList.toggle("collapsed", !lessonPaneOpen);
  const collapseBtn = document.getElementById("collapseBtn");
  collapseBtn.style.transform = lessonPaneOpen ? "" : "rotate(180deg)";
  collapseBtn.setAttribute("aria-expanded", lessonPaneOpen ? "true" : "false");
  collapseBtn.setAttribute(
    "aria-label",
    lessonPaneOpen ? "Collapse lesson panel" : "Expand lesson panel"
  );
}

/* ══════════════════════════════════════════════════════════
   🎯 LESSON GOAL CHECKLIST  (#75 — sanket1035)
   Rules engine: validates each goal against the live buffer
   without touching the iframe — pure string/regex matching.
══════════════════════════════════════════════════════════ */

/**
 * Check one goal rule against the current code buffers.
 * Supported rule types:
 *   html-tag          — tag present in HTML buffer
 *   html-attr         — attribute string present in HTML buffer
 *   html-count-min    — at least N occurrences of a tag in HTML
 *   css-property      — CSS property used in CSS buffer
 *   css-property-value — CSS property with specific value
 *   css-contains      — any raw string in CSS buffer
 *   css-selector      — a selector exists before {
 *   js-contains       — raw string in JS buffer
 */
function checkGoalRule(rule, buf) {
  if (!rule || !rule.type) return false;
  const html = (buf.html || "").toLowerCase();
  const css  = buf.css  || "";
  const js   = buf.js   || "";

  switch (rule.type) {
    case "html-tag":
      // Matches <tagname> or <tagname ...>
      return new RegExp(`<${rule.value}[\\s>/]`, "i").test(buf.html || "");

    case "html-attr":
      // Matches attribute=... patterns in HTML
      return (buf.html || "").toLowerCase().includes(rule.attr.toLowerCase());

    case "html-count-min": {
      // Counts how many times a tag opening appears
      const matches = (buf.html || "").match(new RegExp(`<${rule.tag}[\\s>/]`, "gi"));
      return matches !== null && matches.length >= rule.min;
    }

    case "css-property":
      // Checks if a CSS property name is used (before a colon)
      return new RegExp(`${rule.value}\\s*:`, "i").test(css);

    case "css-property-value":
      // Checks if property: value combo appears
      return new RegExp(`${rule.property}\\s*:\\s*[^;]*${rule.value}`, "i").test(css);

    case "css-contains":
      // Raw substring match in CSS
      return css.toLowerCase().includes(rule.value.toLowerCase());

    case "css-selector":
      // Checks if selector exists before a {
      return new RegExp(`${rule.value}[\\s,:{]`).test(css);

    case "js-contains":
      // Raw substring match in JS
      return js.includes(rule.value);

    default:
      return false;
  }
}

/**
 * Rebuild and animate the Goals checklist panel for the current lesson.
 * Called on every editor input and on lesson load.
 */
function validateGoals() {
  const lesson = getLesson(currentLessonId);
  const panel  = document.getElementById("goalsPanel");
  const list   = document.getElementById("goalsList");
  const badge  = document.getElementById("goalsBadge");

  // Hide panel if lesson has no goals
  if (!lesson || !lesson.goals || lesson.goals.length === 0) {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "flex";

  const buf = buffers[currentLessonId] || {};
  let doneCount = 0;
  const total = lesson.goals.length;

  // Rebuild goal items
  list.innerHTML = "";

  // Progress bar (inserted as first child of goals-list wrapper)
  const progressBar = document.createElement("div");
  progressBar.className = "goals-progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "goals-progress-fill";
  progressBar.appendChild(progressFill);
  list.appendChild(progressBar);

  lesson.goals.forEach((goal) => {
    const met = checkGoalRule(goal.rule, buf);
    if (met) doneCount++;

    const item = document.createElement("div");
    item.className = "goal-item " + (met ? "done" : "pending");
    item.setAttribute("role", "listitem");
    item.setAttribute("aria-label", (met ? "Completed: " : "Pending: ") + goal.label);
    item.innerHTML = `
      <span class="goal-icon">${met ? "✅" : "○"}</span>
      <span class="goal-label">${escapeHtml(goal.label)}</span>
      <span class="goal-status-dot"></span>`;
    list.appendChild(item);
  });

  // Update progress bar width
  progressFill.style.width = total > 0 ? `${(doneCount / total) * 100}%` : "0%";

  // Update badge
  badge.textContent = `${doneCount} / ${total}`;
  badge.classList.toggle("all-done", doneCount === total && total > 0);

  // Celebrate when all goals met
  panel.classList.toggle("all-complete", doneCount === total && total > 0);

  // Show toast only when all goals newly met (avoid repeated toasts)
  if (doneCount === total && total > 0 && !panel.dataset.celebrated) {
    panel.dataset.celebrated = "1";
    showToast(`🎯 All ${total} goals met! Great work!`, "success", "🎯");
  } else if (doneCount < total) {
    delete panel.dataset.celebrated;
  }
}

/** Toggle goals panel open/collapsed */
function toggleGoalsPanel() {
  goalsPanelOpen = !goalsPanelOpen;
  document.getElementById("goalsPanel").classList.toggle("collapsed", !goalsPanelOpen);
  const btn = document.getElementById("goalsCollapseBtn");
  btn.style.transform = goalsPanelOpen ? "" : "rotate(180deg)";
  btn.setAttribute("aria-expanded", goalsPanelOpen ? "true" : "false");
}

/* ══════════════════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════════════════ */
function updateProgress() {
  const total = getAllLessons().length;
  const done = doneSet.size;
  const pct = (done / total) * 100;
  document.getElementById("progressText").textContent = `${done}/${total}`;
  document.getElementById("progressFill").style.width = `${pct}%`;
  const bar = document.getElementById("progressBar");
  if (bar) {
    bar.setAttribute("aria-valuenow", done);
    bar.setAttribute("aria-valuetext", `${done} of ${total} lessons complete`);
  }
}

/* ══════════════════════════════════════════════════════════
   AUTO-RUN TOGGLE
══════════════════════════════════════════════════════════ */
function toggleAutorun() {
  autorun = !autorun;
  document.getElementById("autorunToggle").classList.toggle("on", autorun);
  document.getElementById("autorunLabel").textContent = autorun ? "Auto ✓" : "Auto";
  const wrap = document.querySelector(".autorun-wrap");
  if (wrap) wrap.setAttribute("aria-checked", autorun);
  showToast(
    autorun ? "Auto-run ON — preview updates as you type" : "Auto-run OFF",
    autorun ? "success" : "warn",
    autorun ? "⚡" : "⏸"
  );
}

/* ══════════════════════════════════════════════════════════
   PREVIEW SIZE  (desktop / tablet / mobile)
══════════════════════════════════════════════════════════ */
function setPreviewSize(size) {
  const frame = document.getElementById("previewFrame");
  frame.className = "preview-iframe" + (size === "desktop" ? "" : " " + size);

  ["desktop", "tablet", "mobile"].forEach(s => {
    const id = "size" + s.charAt(0).toUpperCase() + s.slice(1);
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.toggle("active", s === size);
      btn.setAttribute("aria-pressed", s === size ? "true" : "false");
    }
  });
}

/* ══════════════════════════════════════════════════════════
   RESET MODAL
══════════════════════════════════════════════════════════ */
/* Shared modal focus management: expose dialogs to assistive tech, move
   focus into the dialog on open, trap Tab within it, and restore focus to
   the invoking control on close. activeModalEl drives the Tab trap in the
   global keydown handler below. */
let activeModalEl = null;
let modalReturnFocus = null;

function getModalFocusable(modalEl) {
  return Array.from(
    modalEl.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function openModal(modalEl) {
  modalReturnFocus = document.activeElement;
  modalEl.classList.add("show");
  activeModalEl = modalEl;
  const focusable = getModalFocusable(modalEl);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    modalEl.focus();
  }
}

function closeModal(modalEl) {
  if (!modalEl.classList.contains("show")) return;
  modalEl.classList.remove("show");
  if (activeModalEl === modalEl) activeModalEl = null;
  const target = modalReturnFocus;
  modalReturnFocus = null;
  if (target && typeof target.focus === "function") target.focus();
}

function showResetModal() {
  openModal(document.getElementById("resetModal"));
}

function hideResetModal() {
  closeModal(document.getElementById("resetModal"));
}

function confirmReset() {
  const lesson = getLesson(currentLessonId);
  if (!lesson) return;
  buffers[currentLessonId] = {
    html: lesson.html,
    css: lesson.css,
    js: lesson.js,
  };
  saveProgress();
  loadTab(activeTab);
  runCode();
  hideResetModal();
  showToast("Code reset to starter ↺", "warn", "⟳");
}

/* ══════════════════════════════════════════════════════════
   COPY ALL CODE
══════════════════════════════════════════════════════════ */
function copyAllCode() {
  const buf = buffers[currentLessonId];
  if (!buf) return;
  const all = `<!-- index.html -->\n${buf.html}\n\n/* index.css */\n${buf.css}\n\n// index.js\n${buf.js}`;
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    showToast("Clipboard unavailable — try Ctrl+A then Ctrl+C", "error", "✖");
    return;
  }
  navigator.clipboard
    .writeText(all)
    .then(() => showToast("All code copied to clipboard!", "success", "⎘"))
    .catch(() => showToast("Copy failed — try Ctrl+A then Ctrl+C", "error", "✖"));
}

/* ══════════════════════════════════════════════════════════
   FONT SIZE CONTROL
══════════════════════════════════════════════════════════ */
function changeFontSize(val) {
  document.documentElement.style.setProperty("--fs", val + "px");
  document.getElementById("fsValLabel").textContent = val + "px";
  updateLineNums();
}

function toggleFsPanel() {
  fsPanelVisible = !fsPanelVisible;
  document.getElementById("fsPanel").classList.toggle("show", fsPanelVisible);
  document.getElementById("fsSizeBtn").classList.toggle("active", fsPanelVisible);
  if (shortcutsVisible) toggleShortcuts();
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS PANEL
══════════════════════════════════════════════════════════ */
function toggleShortcuts() {
  shortcutsVisible = !shortcutsVisible;
  document.getElementById("shortcutsPanel").classList.toggle("show", shortcutsVisible);
  document.getElementById("shortcutsBtn").classList.toggle("active", shortcutsVisible);
  if (fsPanelVisible) toggleFsPanel();
}

/* ══════════════════════════════════════════════════════════
   COMPLETION BANNER + CONFETTI
══════════════════════════════════════════════════════════ */
function showCompletion() {
  document.getElementById("finalXp").textContent = xp;
  openModal(document.getElementById("completionBanner"));
  spawnConfetti();
}

function hideCompletion() {
  closeModal(document.getElementById("completionBanner"));
}

function restartAll() {
  doneSet.clear();
  xp = 0;
  streak = 0;
  lastRunLesson = null;
  Object.keys(buffers).forEach(id => {
    delete buffers[id];
  });
  clearProgress();
  document.getElementById("xpVal").textContent = "0";
  document.getElementById("streakLabel").textContent = "🔥 0 streak";
  hideCompletion();
  buildSidebar();
  loadLesson(CURRICULUM[0].lessons[0].id, { trackProgress: false });
  updateProgress();
}

function spawnConfetti() {
  const colors = ["#58A6FF", "#BC8CFF", "#3FB950", "#D29922", "#F85149", "#FF7B72", "#FFA657"];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      const size = 6 + Math.random() * 8;
      const round = Math.random() > 0.5 ? "50%" : "2px";
      el.style.cssText = `
        left:             ${Math.random() * 100}vw;
        background:       ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${1.4 + Math.random() * 1.6}s;
        animation-delay:  ${Math.random() * 0.6}s;
        width:            ${size}px;
        height:           ${size}px;
        border-radius:    ${round};`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3600);
    }, i * 35);
  }
}

/* ══════════════════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = "info", icon = "") {
  const toast = document.getElementById("toast");
  document.getElementById("toastIcon").textContent = icon;
  document.getElementById("toastMsg").textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ══════════════════════════════════════════════════════════
   DRAG RESIZER  (editor ↔ preview panel)
   Supports mouse + touch for mobile/tablet devices.
══════════════════════════════════════════════════════════ */
function initResizer() {
  const resizer = document.getElementById("resizer");
  const workspace = document.getElementById("workspace");
  let dragging = false;
  let startX = 0;
  let startEditorW = 0;

  function getPointerX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function startDrag(e) {
    dragging = true;
    startX = getPointerX(e);
    const cols = getComputedStyle(workspace).gridTemplateColumns.split(" ");
    startEditorW = parseFloat(cols[1]);
    resizer.classList.add("dragging");
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  function moveDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    const dx = getPointerX(e) - startX;
    const sidebarW = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w")
    );
    const totalW = workspace.offsetWidth - sidebarW - 4;
    const newEditorW = Math.max(200, Math.min(startEditorW + dx, totalW - 200));
    workspace.style.gridTemplateColumns = `${sidebarW}px ${newEditorW}px 4px 1fr`;
  }

  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove("dragging");
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  resizer.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", stopDrag);

  resizer.addEventListener("touchstart", startDrag, { passive: true });
  document.addEventListener("touchmove", moveDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR TOGGLE  (for mobile / narrow screens)
══════════════════════════════════════════════════════════ */
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.querySelector(".sidebar").classList.toggle("collapsed", !sidebarOpen);
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  sidebarToggleBtn.classList.toggle("active", !sidebarOpen);
  sidebarToggleBtn.setAttribute("aria-expanded", String(sidebarOpen));
}

/* ══════════════════════════════════════════════════════════
   GLOBAL KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  const ctrl = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();

  if (activeModalEl && e.key === "Tab") {
    const focusable = getModalFocusable(activeModalEl);
    if (focusable.length > 0) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (ctrl && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
  if (ctrl && e.key === "]") {
    e.preventDefault();
    navLesson(1);
  }
  if (ctrl && e.key === "[") {
    e.preventDefault();
    navLesson(-1);
  }
  if (ctrl && e.key === "1") {
    e.preventDefault();
    switchTab("html");
  }
  if (ctrl && e.key === "2") {
    e.preventDefault();
    switchTab("css");
  }
  if (ctrl && e.key === "3") {
    e.preventDefault();
    switchTab("js");
  }
  if (ctrl && e.shiftKey && e.key === "R") {
    e.preventDefault();
    showResetModal();
  }
  if (ctrl && e.shiftKey && e.key === "C") {
    e.preventDefault();
    copyAllCode();
  }

  if (ctrl && key === "z" && !e.shiftKey) {
    e.preventDefault();
    editorUndo();
  }
  if ((ctrl && key === "y") || (ctrl && e.shiftKey && key === "z")) {
    e.preventDefault();
    editorRedo();
  }

  if (e.key === "Escape") {
    if (shortcutsVisible) toggleShortcuts();
    if (fsPanelVisible) toggleFsPanel();
    hideResetModal();
    hideCompletion();
    if (document.activeElement && document.activeElement.id === "searchInput") {
      document.activeElement.blur();
    }
  }
});

/* ══════════════════════════════════════════════════════════
   CLOSE FLOATING PANELS ON OUTSIDE CLICK
══════════════════════════════════════════════════════════ */
document.addEventListener("click", e => {
  if (
    shortcutsVisible &&
    !e.target.closest("#shortcutsPanel") &&
    !e.target.closest("#shortcutsBtn")
  ) {
    toggleShortcuts();
  }
  if (fsPanelVisible && !e.target.closest("#fsPanel") && !e.target.closest("#fsSizeBtn")) {
    toggleFsPanel();
  }
  if (e.target === document.getElementById("resetModal")) hideResetModal();
  if (e.target === document.getElementById("completionBanner")) hideCompletion();
});

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
init();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveProgress();
});
window.addEventListener("pagehide", saveProgress);

// Register service worker for offline/PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(error => {
    console.warn("DevForge service worker registration failed", error);
  });
}

/* ════════════════════════════════════════════════════════════
   Expose EVERY handler referenced by an inline HTML event
   attribute (onclick / oninput / onkeydown / onscroll) on window.
   In script mode these top-level functions are already global, so
   this changes no behaviour — it documents the markup contract
   explicitly and makes every handler visibly "used" to ESLint.
   The list below mirrors the on*="…" attributes in index.html,
   in document order; keep it in sync when markup handlers change.
   (window.onerror, set in buildPreviewDoc, is the browser error
   hook — not an inline handler — and is intentionally not listed.)
════════════════════════════════════════════════════════════ */
// Toolbar
window.switchTab = switchTab;
window.toggleAutorun = toggleAutorun;
window.toggleFsPanel = toggleFsPanel;
window.toggleShortcuts = toggleShortcuts;
window.runCode = runCode;
// Lesson search
window.filterLessons = filterLessons;
window.clearSearch = clearSearch;
// Editor
window.handleEditorKey = handleEditorKey;
window.onEditorInput = onEditorInput;
window.syncScroll = syncScroll;
// Sidebar
window.toggleSidebar = toggleSidebar;
// Lesson pane / navigation
window.toggleLessonPane = toggleLessonPane;
window.navLesson = navLesson;
// Preview size + actions
window.setPreviewSize = setPreviewSize;
window.showResetModal = showResetModal;
window.copyAllCode = copyAllCode;
// Console
window.toggleConsole = toggleConsole;
window.filterConsole = filterConsole;
window.clearConsoleFilter = clearConsoleFilter;
window.copyConsoleText = copyConsoleText;
// Font size
window.changeFontSize = changeFontSize;
// Reset modal
window.hideResetModal = hideResetModal;
window.confirmReset = confirmReset;
// Undo/redo
window.editorUndo = editorUndo;
window.editorRedo = editorRedo;
// Completion modal
window.hideCompletion = hideCompletion;
window.restartAll = restartAll;
// Goals checklist (#75)
window.validateGoals = validateGoals;
window.toggleGoalsPanel = toggleGoalsPanel;
