/* ═══════════════════════════════════════════════════════════════
   DevForge — lesson.js
   Lesson loading, sidebar, file tabs, progressive hints, navigation,
   goals checklist validation, and shareable snapshot link system.
   Depends on: shared state in app.js, storage.js, editor.js,
   preview.js (runCode — resolved at call time)
═══════════════════════════════════════════════════════════════ */
/* exported
  getLesson,
  getAllLessons,
  getLessonIndex,
  generateSnapshot,
  checkSnapshotOnLoad,
  enterReadOnlyMode,
  forkSnapshot,
  buildSidebar,
  filterLessons,
  clearSearch,
  loadLesson,
  saveCurrentBuffer,
  renderLessonHints,
  revealNextHint,
  buildFileTabs,
  switchTab,
  loadTab,
  updateNav,
  navLesson,
  escapeRegExp,
  checkGoalRule,
  checkAllGoalsMet,
  validateGoals,
  toggleGoalsPanel
*/
"use strict";

const TAB_DOT_COLORS = { html: "#f0641e", css: "#58A6FF", js: "#D29922" };

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
   SHAREABLE SNAPSHOT LINK FEATURE (#82)
══════════════════════════════════════════════════════════ */
function generateSnapshot() {
  const editor = document.getElementById("codeEditor");
  if (editor && buffers[currentLessonId]) {
    buffers[currentLessonId][activeTab] = editor.value;
  }
  const current = buffers[currentLessonId] || { html: "", css: "", js: "" };
  const data = {
    html: current.html || "",
    css: current.css || "",
    js: current.js || "",
  };
  const json = JSON.stringify(data);
  let compressed = "";
  try {
    compressed = LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("LZString compression failed:", err);
    showToast("Failed to compress snapshot", "error", "❌");
    return;
  }

  if (compressed.length > 50000) {
    showToast("Snapshot too large to share via URL", "error", "⚠️");
    return;
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}#snapshot=${compressed}`;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Link copied to clipboard! 🔗", "success", "📋");
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        showToast("Failed to copy link", "error", "❌");
      });
  } else {
    showToast("Clipboard copy not supported", "error", "❌");
  }
}

function checkSnapshotOnLoad() {
  const hash = window.location.hash;
  if (hash.startsWith("#snapshot=")) {
    const encoded = hash.substring(10);

    if (encoded.length > 50000) {
      showToast("Snapshot link is too large to load", "error", "⚠️");
      return;
    }

    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (json) {
        const data = JSON.parse(json);
        // Load this snapshot into the active lesson buffers
        if (!buffers[currentLessonId]) {
          buffers[currentLessonId] = { html: "", css: "", js: "" };
        }
        buffers[currentLessonId].html = data.html || "";
        buffers[currentLessonId].css = data.css || "";
        buffers[currentLessonId].js = data.js || "";

        // Switch to active tab and reload it
        loadTab(activeTab || "html");
        runCode({ trackProgress: false });

        // Enter read-only mode
        enterReadOnlyMode();
      }
    } catch (err) {
      console.error("Failed to decode snapshot:", err);
      showToast("Failed to load snapshot link", "error", "❌");
    }
  }
}

function enterReadOnlyMode() {
  isReadOnlyMode = true;
  const editor = document.getElementById("codeEditor");
  if (editor) {
    editor.readOnly = true;
    editor.classList.add("readonly-editor");
  }

  // Show read-only banner
  let banner = document.getElementById("readOnlyBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "readOnlyBanner";
    banner.className = "readonly-banner";
    banner.innerHTML = `
      <span>👁️ Read-only snapshot — Fork to edit</span>
      <button type="button" class="fork-btn" id="forkBtn" onclick="forkSnapshot()">🍴 Fork / Edit</button>
    `;
    const panel = document.getElementById("editorPanel");
    if (panel) {
      panel.insertBefore(banner, panel.firstChild);
    }
  }
  banner.style.display = "flex";
}

function forkSnapshot() {
  isReadOnlyMode = false;
  const editor = document.getElementById("codeEditor");
  if (editor) {
    editor.readOnly = false;
    editor.classList.remove("readonly-editor");
  }

  // Hide read-only banner
  const banner = document.getElementById("readOnlyBanner");
  if (banner) {
    banner.style.display = "none";
  }

  // Remove snapshot from URL hash
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search
  );

  showToast("Snapshot forked! You can now edit code 🚀", "success", "🍴");
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
  const lesson = getLesson(id);
  if (!lesson) return;

  if (currentLessonId !== id) {
    Analytics.endSession();
  }
  saveCurrentBuffer();
  currentLessonId = id;

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
  const goalsCollapseBtn = document.getElementById("goalsCollapseBtn");
  if (goalsCollapseBtn) {
    goalsCollapseBtn.style.transform = "";
    goalsCollapseBtn.setAttribute("aria-expanded", "true");
  }
  validateGoals();
  Analytics.startSession(id);
}

function saveCurrentBuffer() {
  if (!currentLessonId || !buffers[currentLessonId]) return;
  const editor = document.getElementById("codeEditor");
  buffers[currentLessonId][activeTab] = editor.value;
  scrollPositions[currentLessonId + "_" + activeTab] = editor.scrollTop;
  flushUndoState(currentLessonId + "_" + activeTab);
}

/* ══════════════════════════════════════════════════════════
   🎯 PROGRESSIVE HINTS SYSTEM  (#77 — sanket1035)
   Progressively reveals 1-3 hints per lesson, persisting state.
══════════════════════════════════════════════════════════ */
function renderLessonHints(lesson) {
  const contentEl = document.getElementById("lessonContent");
  if (!contentEl) return;

  // Remove existing hints section if any
  const oldSection = document.getElementById("hintsSection");
  if (oldSection) oldSection.remove();

  if (!lesson.hints || lesson.hints.length === 0) return;

  const revealedCount = revealedHints[lesson.id] || 0;

  const section = document.createElement("div");
  section.className = "hints-section";
  section.id = "hintsSection";

  // Build the list of revealed hint cards
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "hints-cards-container";

  for (let i = 0; i < revealedCount; i++) {
    const card = document.createElement("div");
    card.className = "hint-card";
    card.innerHTML = `
      <div class="hint-card-title">Hint ${i + 1}</div>
      <div class="hint-card-body">${lesson.hints[i]}</div>
    `;
    cardsContainer.appendChild(card);
  }
  section.appendChild(cardsContainer);

  // Build the trigger button
  if (revealedCount < lesson.hints.length) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hints-btn";
    btn.innerHTML = `💡 Show Hint (${revealedCount + 1}/${lesson.hints.length})`;
    btn.onclick = () => revealNextHint(lesson.id);
    section.appendChild(btn);
  }

  contentEl.appendChild(section);
}

function revealNextHint(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson || !lesson.hints) return;

  const currentCount = revealedHints[lessonId] || 0;
  if (currentCount >= lesson.hints.length) return;

  revealedHints[lessonId] = currentCount + 1;
  saveProgress();
  renderLessonHints(lesson);

  // Smooth scroll and focus the new hint card into view for accessibility
  setTimeout(() => {
    const container = document.getElementById("hintsSection");
    if (container) {
      const cards = container.querySelectorAll(".hint-card");
      const lastCard = cards[cards.length - 1];
      if (lastCard) {
        lastCard.tabIndex = -1;
        lastCard.focus({ preventScroll: true });
        lastCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, 50);
}

/* ══════════════════════════════════════════════════════════
   FILE TABS  (index.html / index.css / index.js)
══════════════════════════════════════════════════════════ */
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
   🎯 LESSON GOAL CHECKLIST  (#75 — sanket1035)
   Rules engine: validates each goal against the live buffer
   without touching the iframe — pure string/regex matching.
══════════════════════════════════════════════════════════ */
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkGoalRule(rule, buf) {
  if (!rule || !rule.type) return false;
  const css = buf.css || "";
  const js = buf.js || "";

  switch (rule.type) {
    case "html-tag":
      // Matches <tagname> or <tagname ...>
      return new RegExp(`<${escapeRegExp(rule.value)}[\\s>/]`, "i").test(buf.html || "");

    case "html-attr":
      // Matches attribute=... patterns in HTML
      return (buf.html || "").toLowerCase().includes(rule.attr.toLowerCase());

    case "html-count-min": {
      // Counts how many times a tag opening appears
      const matches = (buf.html || "").match(new RegExp(`<${escapeRegExp(rule.tag)}[\\s>/]`, "gi"));
      return matches !== null && matches.length >= rule.min;
    }

    case "css-property":
      // Checks if a CSS property name is used (before a colon)
      return new RegExp(`${escapeRegExp(rule.value)}\\s*:`, "i").test(css);

    case "css-property-value":
      // Checks if property: value combo appears
      return new RegExp(
        `${escapeRegExp(rule.property)}\\s*:\\s*[^;]*${escapeRegExp(rule.value)}`,
        "i"
      ).test(css);

    case "css-contains":
      // Raw substring match in CSS
      return css.toLowerCase().includes(rule.value.toLowerCase());

    case "css-selector":
      // Checks if selector exists before a {
      return new RegExp(`${escapeRegExp(rule.value)}[\\s,:{]`, "i").test(css);

    case "js-contains":
      // Raw substring match in JS
      return js.includes(rule.value);

    default:
      return false;
  }
}

function checkAllGoalsMet(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson || !lesson.goals || lesson.goals.length === 0) return true;
  const buf = buffers[lessonId] || { html: "", css: "", js: "" };
  return lesson.goals.every(goal => {
    try {
      return checkGoalRule(goal.rule, buf);
    } catch {
      return false;
    }
  });
}

function validateGoals() {
  const lesson = getLesson(currentLessonId);
  const panel = document.getElementById("goalsPanel");
  const list = document.getElementById("goalsList");
  const badge = document.getElementById("goalsBadge");

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

  // Progress bar lives above the list so the list keeps native ul/li semantics.
  let progressBar = panel.querySelector(".goals-progress-bar");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "goals-progress-bar";
    progressBar.setAttribute("aria-hidden", "true");
    const progressFill = document.createElement("div");
    progressFill.className = "goals-progress-fill";
    progressBar.appendChild(progressFill);
    panel.insertBefore(progressBar, list);
  }
  const progressFill = progressBar.querySelector(".goals-progress-fill");

  lesson.goals.forEach(goal => {
    let met = false;
    try {
      met = checkGoalRule(goal.rule, buf);
    } catch (error) {
      console.warn("Goal validation failed for:", goal, error);
    }
    if (met) doneCount++;

    const item = document.createElement("li");
    item.className = "goal-item " + (met ? "done" : "pending");
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
  const badgeText = `${doneCount} / ${total}`;
  if (badge.textContent !== badgeText) {
    badge.textContent = badgeText;
  }
  badge.classList.toggle("all-done", doneCount === total && total > 0);

  // Celebrate when all goals met
  panel.classList.toggle("all-complete", doneCount === total && total > 0);

  if (doneCount === total && total > 0) {
    failedCheckLessons.delete(currentLessonId);
    Analytics.recordCompletion(currentLessonId);
  }

  // Show toast only when all goals newly met (avoid repeated toasts)
  if (doneCount === total && total > 0 && !panel.dataset.celebrated) {
    panel.dataset.celebrated = "1";
    showToast(`🎯 All ${total} goals met! Great work!`, "success", "🎯");
  } else if (doneCount < total) {
    delete panel.dataset.celebrated;
  }
}

function toggleGoalsPanel() {
  goalsPanelOpen = !goalsPanelOpen;
  document.getElementById("goalsPanel").classList.toggle("collapsed", !goalsPanelOpen);
  const btn = document.getElementById("goalsCollapseBtn");
  btn.style.transform = goalsPanelOpen ? "" : "rotate(180deg)";
  btn.setAttribute("aria-expanded", goalsPanelOpen ? "true" : "false");
}
