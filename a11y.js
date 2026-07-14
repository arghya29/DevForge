/* ═══════════════════════════════════════════════════════════════
   DevForge — a11y.js
   Accessibility Manager: screen reader announcements, keyboard trap
   improvements, and focus management utilities.

   Load order (all plain <script> tags, no ES modules):
     curriculum.js → storage.js → analytics.js → ui.js →
     editor.js → lesson.js → preview.js → commands.js → a11y.js → app.js

   Depends on: shared state in app.js, ui.js (activeModalEl,
   getModalFocusable, announce, openModal, closeModal)
═══════════════════════════════════════════════════════════════ */
/* exported A11y, initA11y */
"use strict";

const A11Y_ANNOUNCE_DELAY = 50;

const A11y = {
  _pendingAnnounce: null,
  _announceTimer: null,
  _initialized: false,

  // Enhanced screen reader announcement with priority support
  announce(msg, priority) {
    if (!msg) return;
    const live = priority === "assertive" ? "assertive" : "polite";
    clearTimeout(this._announceTimer);
    const el = document.getElementById("srAnnouncer");
    if (!el) return;
    el.setAttribute("aria-live", live);
    el.textContent = "";
    this._announceTimer = setTimeout(() => {
      el.textContent = msg;
    }, A11Y_ANNOUNCE_DELAY);
  },

  // Announce editor tab changes
  announceTabChange(tab) {
    const labels = { html: "HTML", css: "CSS", js: "JavaScript" };
    this.announce(`Switched to ${labels[tab] || tab.toUpperCase()} editor tab`);
  },

  // Announce lesson changes
  announceLessonChange(lessonTitle) {
    this.announce(`Loaded lesson: ${lessonTitle}`);
  },

  // Announce code execution status
  announceRunResult(success, msg) {
    if (success) {
      this.announce(`Code ran successfully. ${msg || ""}`);
    } else {
      this.announce(`Code execution completed with errors. ${msg || ""}`, "assertive");
    }
  },

  // Announce undo/redo
  announceUndoRedo(action) {
    this.announce(action === "undo" ? "Undo completed" : "Redo completed");
  },

  // Announce goal validation result
  announceGoalsMet(count, total) {
    if (count === total) {
      this.announce("All goals met! Lesson complete.");
    } else {
      this.announce(`${count} of ${total} goals completed`);
    }
  },

  // Announce reset actions
  announceReset(target) {
    if (target === "tab") {
      this.announce("Current tab code has been cleared");
    } else if (target === "lesson") {
      this.announce("Code has been reset to starter");
    } else if (target === "all") {
      this.announce("All progress has been reset");
    }
  },

  // Focus trap management for modals
  trapFocus(modalEl) {
    if (!modalEl) return;
    const focusable = getModalFocusable(modalEl);
    if (focusable.length > 0) {
      modalEl._a11yFirstFocusable = focusable[0];
      modalEl._a11yLastFocusable = focusable[focusable.length - 1];
    } else {
      modalEl._a11yFirstFocusable = modalEl;
      modalEl._a11yLastFocusable = modalEl;
    }
  },

  releaseFocus(modalEl) {
    if (!modalEl) return;
    delete modalEl._a11yFirstFocusable;
    delete modalEl._a11yLastFocusable;
  },

  getTrapElements(modalEl) {
    if (!modalEl) return { first: null, last: null };
    return {
      first: modalEl._a11yFirstFocusable || null,
      last: modalEl._a11yLastFocusable || null,
    };
  },

  // Enhanced modal open with trap initialization
  openModal(modalEl) {
    openModal(modalEl);
    this.trapFocus(modalEl);
    this.announce(`Dialog opened: ${modalEl.getAttribute("aria-label") || modalEl.id || "Dialog"}`);
  },

  // Enhanced modal close with trap cleanup and focus restoration
  closeModal(modalEl) {
    this.releaseFocus(modalEl);
    closeModal(modalEl);
    this.announce("Dialog closed");
  },

  // Focus management utilities
  focusElement(el) {
    if (el && typeof el.focus === "function") {
      el.focus();
    }
  },

  focusFirst(container) {
    const focusable = getModalFocusable(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  },

  focusLast(container) {
    const focusable = getModalFocusable(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  },

  // Skip-to-content handler
  skipToContent() {
    const workspace = document.getElementById("workspace");
    if (workspace) {
      workspace.setAttribute("tabindex", "-1");
      workspace.focus();
      this.announce("Skipped to main content");
    }
  },

  // Register ARIA live region for dynamic content updates
  registerLiveRegion(id, priority) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("aria-live", priority || "polite");
    el.setAttribute("aria-atomic", "true");
  },

  // Update a live region's content
  updateLiveRegion(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = "";
    setTimeout(() => {
      el.textContent = msg;
    }, A11Y_ANNOUNCE_DELAY);
  },

  // Initialize keyboard traps for all existing modals
  initKeyboardTraps() {
    const modalIds = [
      "shortcutsModal",
      "analyticsModal",
      "commandPaletteModal",
      "resetModal",
      "importConfirmModal",
      "completionBanner",
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        this.trapFocus(el);
      }
    });
  },

  // Register keyboard shortcut for skip-to-content
  _handleKeydown(e) {
    if (e.key === "Escape") {
      const popover = document.getElementById("goToLinePopover");
      if (popover && popover.style.display !== "none") {
        this.announce("Go to line popover closed");
      }
    }
  },

  // Full initialization
  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.initKeyboardTraps();

    const skipLink = document.getElementById("skipToContent");
    if (skipLink) {
      skipLink.addEventListener("click", e => {
        e.preventDefault();
        this.skipToContent();
      });
    }

    document.addEventListener("keydown", e => this._handleKeydown(e));

    this.announce("DevForge loaded. Press ? for keyboard shortcuts.");
  },
};

function initA11y() {
  A11y.init();
}
