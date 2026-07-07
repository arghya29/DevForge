/* ═══════════════════════════════════════════════════════════════
   DevForge — app.js
   Application bootstrap: shared state declarations, init(),
   global keyboard / click / visibility event listeners, service
   worker registration, and the window.* export manifest.

   Load order (all plain <script> tags, no ES modules):
     curriculum.js → storage.js → analytics.js → ui.js →
     editor.js → lesson.js → preview.js → commands.js → app.js

   Depends on: curriculum.js (CURRICULUM array must load first)
═══════════════════════════════════════════════════════════════ */

/* exported
  currentLessonId,
  activeTab,
  lessonPaneOpen,
  consolePaneOpen,
  goalsPanelOpen,
  autorun,
  autorunTimer,
  fsPanelVisible,
  sidebarOpen,
  xp,
  streak,
  lastRunLesson,
  errorCount,
  revealedHints,
  consoleScrolledUp,
  consoleLineCount,
  isReadOnlyMode,
  doneSet,
  buffers,
  scrollPositions,
  CONSOLE_MAX_LINES,
  init
*/
"use strict";

/* ══════════════════════════════════════════════════════════
   SHARED STATE
══════════════════════════════════════════════════════════ */
let currentLessonId = CURRICULUM[0].lessons[0].id;
let activeTab = "html";
let lessonPaneOpen = true;
let consolePaneOpen = true;
let goalsPanelOpen = true; // Goals checklist collapse state
let autorun = false;
let autorunTimer = null;
let fsPanelVisible = false;
let sidebarOpen = true;
let xp = 0;
let streak = 0;
let lastRunLesson = null;
let errorCount = 0;
let revealedHints = {}; // { [lessonId]: revealedCount } (#77)
let consoleScrolledUp = false;
const CONSOLE_MAX_LINES = 200;
let consoleLineCount = 0;
let isReadOnlyMode = false;

const doneSet = new Set(); // lesson ids that have been run at least once
const buffers = {}; // { [lessonId]: { html, css, js } }  — user edits
const scrollPositions = {}; // { [lessonId_tab]: scrollTop }

/* ══════════════════════════════════════════════════════════
   BOOTSTRAP / INIT
══════════════════════════════════════════════════════════ */
function init() {
  applySavedTheme();
  loadProgress();
  buildSidebar();
  loadLesson(currentLessonId, { trackProgress: false });
  document.getElementById("xpVal").textContent = xp;
  document.getElementById("streakLabel").textContent = `🔥 ${streak} streak`;
  updateProgress();
  initResizer();
  const commandPaletteInput = document.getElementById("commandPaletteInput");
  if (commandPaletteInput) {
    commandPaletteInput.addEventListener("input", e => {
      CommandPalette.search(e.target.value);
    });
  }
  const goToLineInput = document.getElementById("goToLineInput");
  if (goToLineInput) {
    goToLineInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeGoToLine();
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideGoToLine();
      }
    });
  }
  if (window.innerWidth <= 768) {
    sidebarOpen = false;
    document.querySelector(".sidebar").classList.add("collapsed");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    sidebarToggleBtn.classList.add("active");
    sidebarToggleBtn.setAttribute("aria-expanded", "false");
  }

  // Check for snapshot link on load
  checkSnapshotOnLoad();

  console.info("DevForge initialised — " + getAllLessons().length + " lessons ready.");
}

/* ══════════════════════════════════════════════════════════
   GLOBAL KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════ */
document.addEventListener("keydown", e => {
  const ctrl = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();

  // Command Palette keyboard navigation & execution
  if (activeModalEl && activeModalEl.id === "commandPaletteModal") {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        commandPaletteSelectedIdx = (commandPaletteSelectedIdx + 1) % filteredCommands.length;
        CommandPalette.updateSelectionStyles();
        CommandPalette.scrollSelectedIntoView();
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        commandPaletteSelectedIdx =
          (commandPaletteSelectedIdx - 1 + filteredCommands.length) % filteredCommands.length;
        CommandPalette.updateSelectionStyles();
        CommandPalette.scrollSelectedIntoView();
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        CommandPalette.executeCommand(filteredCommands[commandPaletteSelectedIdx]);
      }
      return;
    }
  }

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

  // Ctrl+K / Cmd+K -> Open/Close command palette
  if (ctrl && key === "k") {
    e.preventDefault();
    if (activeModalEl && activeModalEl.id === "commandPaletteModal") {
      CommandPalette.close();
    } else {
      CommandPalette.open();
    }
    return;
  }

  // Ctrl+G / Cmd+G -> Open/Close Go to Line Popover
  if (ctrl && key === "g") {
    e.preventDefault();
    toggleGoToLine();
    return;
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

  // ? key — open shortcuts modal (skip when focus is textarea/input)
  if (
    e.key === "?" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    document.activeElement?.tagName !== "TEXTAREA" &&
    document.activeElement?.tagName !== "INPUT"
  ) {
    e.preventDefault();
    openShortcutsModal();
  }

  if (e.key === "Escape") {
    const popover = document.getElementById("goToLinePopover");
    if (popover && popover.style.display !== "none") {
      hideGoToLine();
      return;
    }
    if (document.getElementById("shortcutsModal").classList.contains("show")) closeShortcutsModal();
    if (document.getElementById("analyticsModal").classList.contains("show")) closeAnalyticsModal();
    if (document.getElementById("commandPaletteModal").classList.contains("show")) {
      CommandPalette.close();
    }
    if (fsPanelVisible) toggleFsPanel();
    hideResetModal();
    hideImportModal();
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
  if (fsPanelVisible && !e.target.closest("#fsPanel") && !e.target.closest("#fsSizeBtn")) {
    toggleFsPanel();
  }
  const popover = document.getElementById("goToLinePopover");
  if (
    popover &&
    popover.style.display !== "none" &&
    !e.target.closest("#goToLinePopover") &&
    !e.target.closest("#goToLineBtn")
  ) {
    hideGoToLine();
  }
  // Shortcuts modal closes via its own overlay click (handled in openModal pattern)
  if (e.target === document.getElementById("shortcutsModal")) closeShortcutsModal();
  if (e.target === document.getElementById("analyticsModal")) closeAnalyticsModal();
  if (e.target === document.getElementById("commandPaletteModal")) CommandPalette.close();
  if (e.target === document.getElementById("resetModal")) hideResetModal();
  if (e.target === document.getElementById("importConfirmModal")) hideImportModal();
  if (e.target === document.getElementById("completionBanner")) hideCompletion();
});

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
init();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveProgress();
    Analytics.endSession();
  } else if (document.visibilityState === "visible") {
    Analytics.startSession(currentLessonId);
  }
});
window.addEventListener("pagehide", () => {
  saveProgress();
  Analytics.endSession();
});

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
window.exportProgress = exportProgress;
window.triggerImport = triggerImport;
window.importProgress = importProgress;
window.confirmImportProgress = confirmImportProgress;
window.toggleTheme = toggleTheme;
window.toggleAutorun = toggleAutorun;
window.toggleFsPanel = toggleFsPanel;
window.toggleShortcuts = toggleShortcuts;
window.openShortcutsModal = openShortcutsModal;
window.closeShortcutsModal = closeShortcutsModal;
window.openAnalyticsModal = openAnalyticsModal;
window.closeAnalyticsModal = closeAnalyticsModal;
window.resetAnalyticsConfirm = resetAnalyticsConfirm;
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

// Backup / Restore progress (#78)
window.exportProgress = exportProgress;
window.triggerImport = triggerImport;
window.importProgress = importProgress;
window.confirmImportProgress = confirmImportProgress;

// Progressive hints (#77)
window.revealNextHint = revealNextHint;
window.renderLessonHints = renderLessonHints;

// Command Palette (#80)
window.CommandPalette = CommandPalette;

// Go to Line (#81)
window.toggleGoToLine = toggleGoToLine;
window.showGoToLine = showGoToLine;
window.hideGoToLine = hideGoToLine;
window.executeGoToLine = executeGoToLine;

// Shareable Snapshot Link (#82)
window.generateSnapshot = generateSnapshot;
window.checkSnapshotOnLoad = checkSnapshotOnLoad;
window.enterReadOnlyMode = enterReadOnlyMode;
window.forkSnapshot = forkSnapshot;
