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
let autorun = false;
let autorunTimer = null;
let shortcutsVisible = false;
let fsPanelVisible = false;
let sidebarOpen = true;
let xp = 0;
let streak = 0;
let lastRunLesson = null;
let errorCount = 0;

const doneSet = new Set(); // lesson ids that have been run at least once
const buffers = {}; // { [lessonId]: { html, css, js } }  — user edits

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
  buildSidebar();
  loadLesson(currentLessonId);
  updateProgress();
  initResizer();
  if (window.innerWidth <= 768) {
    sidebarOpen = false;
    document.querySelector(".sidebar").classList.add("collapsed");
    document.getElementById("sidebarToggleBtn").classList.add("active");
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
function loadLesson(id) {
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
  runCode();
}

function saveCurrentBuffer() {
  if (!currentLessonId || !buffers[currentLessonId]) return;
  buffers[currentLessonId][activeTab] = document.getElementById("codeEditor").value;
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
    <div class="file-tab ${activeTab === t ? "active" : ""}"
         id="fileTab-${t}"
         onclick="switchTab('${t}')">
      <span class="file-dot" style="background:${TAB_DOT_COLORS[t]}"></span>
      index.${t}
    </div>`
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
  updateLineNums();
  highlight();

  // Glitch-in animation on switch
  editor.classList.add("glitch-in");
  setTimeout(() => editor.classList.remove("glitch-in"), 400);
}

/* ══════════════════════════════════════════════════════════
   EDITOR EVENTS
══════════════════════════════════════════════════════════ */
function onEditorInput() {
  if (!buffers[currentLessonId]) return;
  buffers[currentLessonId][activeTab] = document.getElementById("codeEditor").value;
  updateLineNums();
  highlight();

  if (autorun) {
    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCode, 900);
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

  // Tab → insert 2 spaces
  if (e.key === "Tab") {
    e.preventDefault();
    el.value = el.value.substring(0, s) + "  " + el.value.substring(end);
    el.selectionStart = el.selectionEnd = s + 2;
    onEditorInput();
    return;
  }

  // Enter → auto-indent
  if (e.key === "Enter") {
    e.preventDefault();
    const lines = el.value.substring(0, s).split("\n");
    const lastLine = lines[lines.length - 1];
    const indent = lastLine.match(/^(\s*)/)[1];
    const extra = /[{:]$/.test(lastLine.trimEnd()) ? "  " : "";
    const ins = "\n" + indent + extra;
    el.value = el.value.substring(0, s) + ins + el.value.substring(end);
    el.selectionStart = el.selectionEnd = s + ins.length;
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

  // Typing a closing char when the same char is already next → step over it
  // instead of inserting a duplicate. This is what makes auto-close feel
  // natural rather than producing ")) " when you "close" a pair yourself.
  if (CLOSERS.has(e.key) && nextChar === e.key && s === end) {
    e.preventDefault();
    el.selectionStart = el.selectionEnd = end + 1;
    return;
  }
   const isQuote =e.key === '"' || e.key === "'" || e.key === "`";
   if (isQuote && s === end) {
      const prevChar =el.value.charAt(s-1);
      const wordBefore = /[\w]/.test(prevChar);
      const wordAfter = /[\w]/.test(nextChar);
      if (wordBefore || wordAfter || nextChar === e.key) return;
  }
  // Typing an opening char (or a quote): insert the matching closer.
   if (Object.prototype.hasOwnProperty.call(PAIRS, e.key)) {
       const close = PAIRS[e.key];

    // If there's a selection, wrap it in the pair (e.g. select foo, press "(" → (foo)).
// Typing an opening char: insert the matching closer.
   if (Object.prototype.hasOwnProperty.call(PAIRS, e.key)) {
     const close = PAIRS[e.key];
     const selected = (s !== end) ? el.value.substring(s, end) : "";
     e.preventDefault();

    // 1. First, insert the opening char and any selected text
     const firstPart = e.key + selected;
     document.execCommand('insertText', false, firstPart);

    // 2. Use a timeout to force the closer as a separate undoable action
    setTimeout(() => {
      // Move caret to after the first part
      const newPos = s + firstPart.length;
      el.setSelectionRange(newPos, newPos);
      // 3. Insert the closing char
      document.execCommand('insertText', false, close);
      // 4. Move caret back inside
      el.setSelectionRange(newPos,newPos);
      onEditorInput();
    }, 0);
    return;
  }
    // For quotes, don't auto-close when typing directly after a word character
    // (e.g. the apostrophe in don't) or before one — only the single quote is
    // inserted in those cases so we don't mangle contractions or identifiers.
    const isQuote = e.key === '"' || e.key === "'" || e.key === "`";
    if (isQuote) {
      const prevChar = el.value.charAt(s - 1);
      const wordBefore = /[\w]/.test(prevChar);
      const wordAfter = /[\w]/.test(nextChar);
      // Also avoid doubling when the cursor is right before the same quote.
      if (wordBefore || wordAfter || nextChar === e.key) {
        return; // let the single character insert normally
      }
    }

    e.preventDefault();
    el.value = el.value.substring(0, s) + e.key + close + el.value.substring(end);
    el.selectionStart = el.selectionEnd = s + 1; // caret between the pair
    onEditorInput();
    return;
  }

  // Backspace between an empty auto-closed pair → delete both characters,
  // so deleting the opener you just typed also removes the inserted closer.
  if (e.key === "Backspace" && s === end && s > 0) {
    const prevChar = el.value.charAt(s - 1);
    if (Object.prototype.hasOwnProperty.call(PAIRS, prevChar) && PAIRS[prevChar] === nextChar) {
      e.preventDefault();
      el.value = el.value.substring(0, s - 1) + el.value.substring(s + 1);
      el.selectionStart = el.selectionEnd = s - 1;
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
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Safe escape for user-provided strings inside innerHTML
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ══════════════════════════════════════════════════════════
   RUN CODE → render into the preview iframe
══════════════════════════════════════════════════════════ */
function runCode() {
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
  if (lastRunLesson !== currentLessonId) {
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
  doneSet.add(currentLessonId);
  const sideEl = document.getElementById("sidebar-" + currentLessonId);
  if (sideEl) sideEl.classList.add("done");

  updateProgress();

  // Remove overlay after a short delay
  setTimeout(() => {
    document.getElementById("previewOverlay").classList.remove("show");
    btn.classList.remove("running");
    btn.textContent = "▶ Run";
  }, 400);

  // Show completion banner if all lessons done
  if (doneSet.size === getAllLessons().length) {
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
  if (!e.data || !["log", "error", "warn", "info"].includes(e.data.type)) return;
  addConsoleLog(e.data.type, e.data.args.join(" "), e.data.ts);
});

function clearConsoleUI() {
  errorCount = 0;
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

  el.className = "log-line " + cls;
  el.innerHTML = `
    <span class="log-prefix">${prefix}</span>
    <span class="log-ts">${time}</span>
    <span>${escapeHtml(text)}</span>`;

  body.appendChild(el);
  body.scrollTop = body.scrollHeight;

  if (type === "error") {
    errorCount++;
    const badge = document.getElementById("consoleBadge");
    badge.style.display = "inline";
    badge.textContent = errorCount;
  }
}

function toggleConsole() {
  consolePaneOpen = !consolePaneOpen;
  document.getElementById("consolePane").classList.toggle("collapsed", !consolePaneOpen);
  document.getElementById("consolCollapseBtn").style.transform = consolePaneOpen
    ? ""
    : "rotate(180deg)";
}

/* ══════════════════════════════════════════════════════════
   LESSON PANE (collapsible instruction area)
══════════════════════════════════════════════════════════ */
function toggleLessonPane() {
  lessonPaneOpen = !lessonPaneOpen;
  document.getElementById("lessonPane").classList.toggle("collapsed", !lessonPaneOpen);
  document.getElementById("collapseBtn").style.transform = lessonPaneOpen ? "" : "rotate(180deg)";
}

/* ══════════════════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════════════════ */
function updateProgress() {
  const total = getAllLessons().length;
  const done = doneSet.size;
  document.getElementById("progressText").textContent = `${done}/${total}`;
  document.getElementById("progressFill").style.width = `${(done / total) * 100}%`;
}

/* ══════════════════════════════════════════════════════════
   AUTO-RUN TOGGLE
══════════════════════════════════════════════════════════ */
function toggleAutorun() {
  autorun = !autorun;
  document.getElementById("autorunToggle").classList.toggle("on", autorun);
  document.getElementById("autorunLabel").textContent = autorun ? "Auto ✓" : "Auto";
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
    if (btn) btn.classList.toggle("active", s === size);
  });
}

/* ══════════════════════════════════════════════════════════
   RESET MODAL
══════════════════════════════════════════════════════════ */
function showResetModal() {
  document.getElementById("resetModal").classList.add("show");
}

function hideResetModal() {
  document.getElementById("resetModal").classList.remove("show");
}

function confirmReset() {
  const lesson = getLesson(currentLessonId);
  if (!lesson) return;
  buffers[currentLessonId] = {
    html: lesson.html,
    css: lesson.css,
    js: lesson.js,
  };
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
  document.getElementById("completionBanner").classList.add("show");
  spawnConfetti();
}

function hideCompletion() {
  document.getElementById("completionBanner").classList.remove("show");
}

function restartAll() {
  doneSet.clear();
  xp = 0;
  streak = 0;
  lastRunLesson = null;
  document.getElementById("xpVal").textContent = "0";
  document.getElementById("streakLabel").textContent = "🔥 0 streak";
  hideCompletion();
  buildSidebar();
  loadLesson(CURRICULUM[0].lessons[0].id);
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
  document.getElementById("sidebarToggleBtn").classList.toggle("active", !sidebarOpen);
}

/* ══════════════════════════════════════════════════════════
   GLOBAL KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  const ctrl = e.ctrlKey || e.metaKey;

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

  if (e.key === "Escape") {
    if (shortcutsVisible) toggleShortcuts();
    if (fsPanelVisible) toggleFsPanel();
    hideResetModal();
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
// Font size
window.changeFontSize = changeFontSize;
// Reset modal
window.hideResetModal = hideResetModal;
window.confirmReset = confirmReset;
// Completion modal
window.hideCompletion = hideCompletion;
window.restartAll = restartAll;
