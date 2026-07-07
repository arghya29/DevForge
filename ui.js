/* ═══════════════════════════════════════════════════════════════
   DevForge — ui.js
   All user-interface helpers: modals, toast, theme, sidebar,
   font-size, resizer, import/export, completion banner, confetti,
   progress bar, autorun, preview size, keyboard shortcuts modal.
   Depends on: shared state in app.js, storage.js, analytics.js
═══════════════════════════════════════════════════════════════ */
/* exported
  activeModalEl,
  modalReturnFocus,
  getModalFocusable,
  openModal,
  closeModal,
  showResetModal,
  hideResetModal,
  showImportModal,
  hideImportModal,
  exportProgress,
  triggerImport,
  importProgress,
  confirmImportProgress,
  confirmReset,
  copyAllCode,
  changeFontSize,
  toggleFsPanel,
  openShortcutsModal,
  closeShortcutsModal,
  toggleShortcuts,
  updateThemeButton,
  applyTheme,
  toggleTheme,
  applySavedTheme,
  showCompletion,
  hideCompletion,
  restartAll,
  spawnConfetti,
  showToast,
  announce,
  initResizer,
  toggleSidebar,
  toggleLessonPane,
  updateProgress,
  toggleAutorun,
  setPreviewSize
*/
"use strict";

let activeModalEl = null;
let modalReturnFocus = null;
let pendingImportData = null; // Holds parsed backup JSON during confirmation (#78)
let darkTheme = true;
let toastTimer = null;

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
  if (isReadOnlyMode) {
    showToast("Cannot modify code in read-only mode. Fork first! ⚠️", "warn", "⚠️");
    return;
  }
  openModal(document.getElementById("resetModal"));
  announce("Reset confirmation dialog opened");
}

function hideResetModal() {
  closeModal(document.getElementById("resetModal"));
}

/* ══════════════════════════════════════════════════════════
   IMPORT / EXPORT BACKUP SYSTEM  (#78 — sanket1035)
   Allows learners to download progress as JSON and restore it.
══════════════════════════════════════════════════════════ */
function showImportModal() {
  openModal(document.getElementById("importConfirmModal"));
}

function hideImportModal() {
  closeModal(document.getElementById("importConfirmModal"));
  pendingImportData = null;
}

function exportProgress() {
  try {
    const backup = {
      version: "devforge:backup:v1",
      timestamp: Date.now(),
      xp: xp,
      streak: streak,
      done: Array.from(doneSet),
      buffers: buffers,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devforge-progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Progress exported successfully!", "success", "📤");
  } catch {
    showToast("Export failed.", "error", "❌");
  }
}

function triggerImport() {
  const fileInput = document.getElementById("importFileInput");
  if (fileInput) fileInput.click();
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== "object") throw new Error("Invalid object");
      if (data.version !== "devforge:backup:v1") throw new Error("Unsupported version");
      if (!Number.isFinite(data.xp) || data.xp < 0) throw new Error("Invalid XP");
      if (!Number.isFinite(data.streak) || data.streak < 0) throw new Error("Invalid Streak");
      if (!Array.isArray(data.done)) throw new Error("Invalid Done list");
      if (!data.buffers || typeof data.buffers !== "object" || Array.isArray(data.buffers)) {
        throw new Error("Invalid Buffers");
      }
      for (const key of Object.keys(data.buffers)) {
        const b = data.buffers[key];
        if (
          !b ||
          typeof b !== "object" ||
          typeof b.html !== "string" ||
          typeof b.css !== "string" ||
          typeof b.js !== "string"
        ) {
          throw new Error("Invalid buffer entry: " + key);
        }
      }

      pendingImportData = data;
      showImportModal();
    } catch {
      showToast("Invalid backup file format.", "error", "❌");
    } finally {
      event.target.value = ""; // Reset input so same file can be re-selected
    }
  };
  reader.readAsText(file);
}

function confirmImportProgress() {
  if (!pendingImportData) return;

  try {
    xp = pendingImportData.xp;
    streak = pendingImportData.streak;
    doneSet.clear();
    pendingImportData.done.forEach(id => doneSet.add(id));

    // Clear old buffers and copy new ones
    Object.keys(buffers).forEach(key => delete buffers[key]);
    Object.keys(pendingImportData.buffers).forEach(id => {
      const b = pendingImportData.buffers[id];
      buffers[id] = { html: b.html, css: b.css, js: b.js };
    });

    saveProgress();
    hideImportModal();

    // Re-render UI
    document.getElementById("xpVal").textContent = xp;
    document.getElementById("streakLabel").textContent = `🔥 ${streak} streak`;
    buildSidebar();
    loadLesson(currentLessonId, { trackProgress: false });
    updateProgress();

    showToast("Progress restored successfully!", "success", "✅");
  } catch {
    showToast("Import failed.", "error", "❌");
  }
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
  saveProgress();
}

function toggleFsPanel() {
  fsPanelVisible = !fsPanelVisible;
  document.getElementById("fsPanel").classList.toggle("show", fsPanelVisible);
  document.getElementById("fsSizeBtn").classList.toggle("active", fsPanelVisible);
  if (document.getElementById("shortcutsModal").classList.contains("show")) closeShortcutsModal();
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS MODAL  (#76 — sanket1035)
   Replaces old floating panel with a proper accessible modal.
   Triggered by: ? key (when not in editor), ⌨ button, ? button.
══════════════════════════════════════════════════════════ */
function openShortcutsModal() {
  if (fsPanelVisible) toggleFsPanel(); // close any open floating panel first
  openModal(document.getElementById("shortcutsModal"));
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) helpBtn.classList.add("active");
}

function closeShortcutsModal() {
  closeModal(document.getElementById("shortcutsModal"));
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) helpBtn.classList.remove("active");
}

/** Back-compat stub — old onclick references in HTML may still call toggleShortcuts() */
function toggleShortcuts() {
  openShortcutsModal();
}

/* ══════════════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════════════ */
function updateThemeButton() {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.textContent = darkTheme ? "🌙" : "☀️";
    btn.setAttribute("aria-pressed", String(!darkTheme));
  }
}

function applyTheme() {
  if (darkTheme) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
  updateThemeButton();
}

function toggleTheme() {
  darkTheme = !darkTheme;
  applyTheme();
  try {
    localStorage.setItem("devforge_theme", darkTheme ? "dark" : "light");
  } catch (error) {
    console.warn("Unable to save DevForge theme", error);
  }
}

function applySavedTheme() {
  try {
    const saved = localStorage.getItem("devforge_theme");
    if (saved === "light") {
      darkTheme = false;
    }
    applyTheme();
  } catch (error) {
    console.warn("Unable to load DevForge theme", error);
  }
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
function showToast(msg, type = "info", icon = "") {
  const toast = document.getElementById("toast");
  document.getElementById("toastIcon").textContent = icon;
  document.getElementById("toastMsg").textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function announce(msg) {
  const el = document.getElementById("srAnnouncer");
  if (el) {
    el.textContent = "";
    requestAnimationFrame(() => {
      el.textContent = msg;
    });
  }
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
   SIDEBAR TOGGLE
══════════════════════════════════════════════════════════ */
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;

  document.querySelector(".sidebar").classList.toggle("collapsed", !sidebarOpen);

  document.getElementById("workspace").classList.toggle("sidebar-collapsed", !sidebarOpen);

  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  sidebarToggleBtn.classList.toggle("active", !sidebarOpen);
  sidebarToggleBtn.setAttribute("aria-expanded", String(sidebarOpen));
}

window.toggleSidebar = toggleSidebar;

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
  saveProgress();
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
