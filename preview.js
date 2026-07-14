/* exported
  runCode,
  extractBody,
  buildPreviewDoc,
  clearConsoleUI,
  addConsoleLog,
  copyConsoleText,
  toggleConsole,
  filterConsole,
  applyConsoleFilter,
  clearConsoleFilter
*/
"use strict";

/* ══════════════════════════════════════════════════════════
   RUN CODE → render into the preview iframe
══════════════════════════════════════════════════════════ */
function runCode(options = {}) {
  const { trackProgress = true } = options;
  saveCurrentBuffer();
  const buf = buffers[currentLessonId];
  if (!buf) return;

  const allGoalsMet = trackProgress ? checkAllGoalsMet(currentLessonId) : false;

  // Track retries before running the code (re-run after a failed check)
  if (trackProgress && failedCheckLessons.has(currentLessonId)) {
    Analytics.recordRetry(currentLessonId);
  }

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
  if (trackProgress && allGoalsMet && lastRunLesson !== currentLessonId) {
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
  if (trackProgress && allGoalsMet) {
    const isNewlyDone = !doneSet.has(currentLessonId);
    doneSet.add(currentLessonId);
    const sideEl = document.getElementById("sidebar-" + currentLessonId);
    if (sideEl) sideEl.classList.add("done");

    updateProgress();
    if (isNewlyDone) {
      saveProgress();
      Analytics.recordCompletion(currentLessonId);
    }
  }

  // Check if goals are met for failedCheckLessons update
  if (trackProgress) {
    if (!allGoalsMet) {
      failedCheckLessons.add(currentLessonId);
    } else {
      failedCheckLessons.delete(currentLessonId);
      Analytics.recordCompletion(currentLessonId);
    }
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
   CONSOLE PANEL
══════════════════════════════════════════════════════════ */
// Receive console messages forwarded from the iframe
window.addEventListener("message", e => {
  // Only accept messages from our own preview iframe. Its srcdoc document has an
  // opaque origin (reported inconsistently across browsers), so verify the source
  // window reference rather than e.origin.
  const previewFrame = document.getElementById("previewFrame");
  if (!previewFrame || !previewFrame.contentWindow || e.source !== previewFrame.contentWindow)
    return;

  // Stricter payload validation to prevent unexpected message structures
  if (!e.data || typeof e.data !== "object" || Array.isArray(e.data)) return;

  const { type, args, ts } = e.data;

  if (!["log", "error", "warn", "info"].includes(type)) return;
  if (!Array.isArray(args)) return;
  if (typeof ts !== "number" || !Number.isFinite(ts)) return;

  // Map and sanitize arguments to prevent unexpected objects/types
  const safeArgs = args.map(arg => {
    if (typeof arg === "string") return arg;
    try {
      return String(arg);
    } catch {
      return "";
    }
  });

  addConsoleLog(type, safeArgs.join(" "), ts);
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
