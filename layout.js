/* ═══════════════════════════════════════════════════════════════
   DevForge — layout.js
   Workspace layout manager: persists sidebar width, editor/preview
   split ratio, panel collapsed states, and named layout presets.
   Depends on: shared state from app.js, localStorage
═══════════════════════════════════════════════════════════════ */
"use strict";

const LAYOUT_KEY = "devforge:layout:v1";
const PRESETS_KEY = "devforge:layout:presets";

const DEFAULT_PRESETS = {
  default: {
    label: "Default",
    sidebarW: 272,
    editorRatio: 0.5,
    lessonPaneOpen: true,
    consolePaneOpen: true,
    goalsPanelOpen: true,
  },
  "wide-editor": {
    label: "Wide Editor",
    sidebarW: 200,
    editorRatio: 0.65,
    lessonPaneOpen: true,
    consolePaneOpen: true,
    goalsPanelOpen: true,
  },
  "wide-preview": {
    label: "Wide Preview",
    sidebarW: 272,
    editorRatio: 0.35,
    lessonPaneOpen: true,
    consolePaneOpen: true,
    goalsPanelOpen: true,
  },
  minimal: {
    label: "Minimal",
    sidebarW: 48,
    editorRatio: 0.5,
    lessonPaneOpen: false,
    consolePaneOpen: false,
    goalsPanelOpen: false,
  },
};

const LayoutManager = {
  _current: null,
  _presets: null,
  _resizeHandler: null,

  getDefaultLayout() {
    return {
      sidebarW: 272,
      editorRatio: 0.5,
      lessonPaneOpen: true,
      consolePaneOpen: true,
      goalsPanelOpen: true,
      activePreset: "default",
    };
  },

  loadLayout() {
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this._current = { ...this.getDefaultLayout(), ...data };
      } else {
        this._current = this.getDefaultLayout();
      }
    } catch {
      this._current = this.getDefaultLayout();
    }
    this.loadPresets();
    return this._current;
  },

  saveLayout() {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(this._current));
    } catch {
      if (typeof showToast === "function") {
        showToast("Unable to save layout settings.", "warn", "⚠️");
      }
    }
  },

  loadPresets() {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) {
        this._presets = JSON.parse(raw);
      } else {
        this._presets = {};
      }
      for (const key of Object.keys(DEFAULT_PRESETS)) {
        if (!this._presets[key]) {
          this._presets[key] = { ...DEFAULT_PRESETS[key] };
        }
      }
    } catch {
      this._presets = {};
      for (const key of Object.keys(DEFAULT_PRESETS)) {
        this._presets[key] = { ...DEFAULT_PRESETS[key] };
      }
    }
    this._savePresets();
  },

  _savePresets() {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(this._presets));
    } catch {
      /* ignore */
    }
  },

  applyLayout(layout) {
    const l = layout || this._current;
    if (!l) return;

    document.documentElement.style.setProperty("--sidebar-w", l.sidebarW + "px");
    const workspace = document.getElementById("workspace");
    if (workspace) {
      workspace.style.gridTemplateColumns = `${l.sidebarW}px ${l.editorRatio}fr 4px ${1 - l.editorRatio}fr`;
    }

    if (typeof sidebarOpen !== "undefined" && l.sidebarW < 100 !== !sidebarOpen) {
      const shouldBeOpen = l.sidebarW >= 100;
      if (shouldBeOpen !== sidebarOpen && typeof toggleSidebar === "function") {
        toggleSidebar();
      }
    }

    if (typeof lessonPaneOpen !== "undefined") {
      if (lessonPaneOpen !== l.lessonPaneOpen && typeof toggleLessonPane === "function") {
        toggleLessonPane();
      }
    }

    if (typeof consolePaneOpen !== "undefined") {
      if (consolePaneOpen !== l.consolePaneOpen && typeof toggleConsole === "function") {
        toggleConsole();
      }
    }

    if (typeof goalsPanelOpen !== "undefined") {
      const goalsPanel = document.getElementById("goalsPanel");
      if (goalsPanel) {
        const isCollapsed = goalsPanel.classList.contains("collapsed");
        const shouldBeCollapsed = !l.goalsPanelOpen;
        if (isCollapsed !== shouldBeCollapsed && typeof toggleGoalsPanel === "function") {
          toggleGoalsPanel();
        }
      }
    }
  },

  saveCurrentLayout() {
    const workspace = document.getElementById("workspace");
    if (!workspace) return;
    const cols = getComputedStyle(workspace).gridTemplateColumns.split(" ");
    const sidebarW = parseFloat(cols[0]);
    const editorRatio = parseFloat(cols[1]) / (parseFloat(cols[1]) + parseFloat(cols[3] || 1));
    this._current = {
      ...this._current,
      sidebarW: sidebarW || this._current.sidebarW,
      editorRatio: editorRatio || this._current.editorRatio,
      lessonPaneOpen:
        typeof lessonPaneOpen !== "undefined" ? lessonPaneOpen : this._current.lessonPaneOpen,
      consolePaneOpen:
        typeof consolePaneOpen !== "undefined" ? consolePaneOpen : this._current.consolePaneOpen,
      goalsPanelOpen:
        typeof goalsPanelOpen !== "undefined" ? goalsPanelOpen : this._current.goalsPanelOpen,
    };
    this.saveLayout();
  },

  applyPreset(name) {
    const preset = this._presets[name];
    if (!preset) return;
    const layout = {
      sidebarW: preset.sidebarW,
      editorRatio: preset.editorRatio,
      lessonPaneOpen: preset.lessonPaneOpen,
      consolePaneOpen: preset.consolePaneOpen,
      goalsPanelOpen: preset.goalsPanelOpen,
      activePreset: name,
    };
    this._current = { ...this._current, ...layout };
    this.applyLayout(layout);
    this.saveLayout();
    if (typeof showToast === "function") {
      showToast(`Layout: ${preset.label}`, "success", "🎨");
    }
  },

  getPresets() {
    if (!this._presets) this.loadPresets();
    const result = [];
    for (const [key, val] of Object.entries(this._presets)) {
      result.push({ id: key, ...val });
    }
    return result;
  },

  getActivePreset() {
    return this._current ? this._current.activePreset || "default" : "default";
  },

  init() {
    this.loadLayout();
    this.applyLayout(this._current);

    this._resizeHandler = () => {
      this.saveCurrentLayout();
    };

    window.addEventListener("resize", this._resizeHandler);
  },

  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
    }
  },
};
