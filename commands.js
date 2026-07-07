/* ═══════════════════════════════════════════════════════════════
   DevForge — commands.js
   Command Palette (#80): object definition, keyboard-shortcut
   command registration.
   Depends on: shared state in app.js, ui.js (activeModalEl,
   fsPanelVisible), all action functions resolved at call time.
═══════════════════════════════════════════════════════════════ */
/* exported CommandPalette, commandPaletteSelectedIdx, filteredCommands */
"use strict";

let commandPaletteSelectedIdx = 0;
let filteredCommands = [];

const CommandPalette = {
  commands: [],

  register(command) {
    if (!command || !command.id || !command.label || typeof command.action !== "function") return;
    this.commands.push(command);
  },

  open() {
    if (fsPanelVisible) toggleFsPanel();
    if (activeModalEl) {
      closeModal(activeModalEl);
    }
    const helpBtn = document.getElementById("helpBtn");
    if (helpBtn) helpBtn.classList.remove("active");
    const analyticsBtn = document.getElementById("analyticsBtn");
    if (analyticsBtn) analyticsBtn.classList.remove("active");

    const modalEl = document.getElementById("commandPaletteModal");
    openModal(modalEl);

    const input = document.getElementById("commandPaletteInput");
    if (input) {
      input.value = "";
      input.focus();
    }

    this.search("");
  },

  close() {
    const modalEl = document.getElementById("commandPaletteModal");
    closeModal(modalEl);
  },

  search(query) {
    const q = query.toLowerCase().trim();
    filteredCommands = this.commands.filter(cmd => cmd.label.toLowerCase().includes(q));
    commandPaletteSelectedIdx = 0;
    this.render();
  },

  render() {
    const listEl = document.getElementById("commandPaletteList");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (filteredCommands.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "command-palette-item";
      emptyLi.style.justifyContent = "center";
      emptyLi.style.color = "var(--muted)";
      emptyLi.textContent = "No matching commands found";
      listEl.appendChild(emptyLi);
      const input = document.getElementById("commandPaletteInput");
      if (input) input.removeAttribute("aria-activedescendant");
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const li = document.createElement("li");
      li.className =
        "command-palette-item" + (idx === commandPaletteSelectedIdx ? " selected" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", idx === commandPaletteSelectedIdx ? "true" : "false");
      li.id = `cmd-item-${cmd.id}`;

      const labelSpan = document.createElement("span");
      labelSpan.textContent = cmd.label;
      li.appendChild(labelSpan);

      if (cmd.shortcut) {
        const shortcutDiv = document.createElement("div");
        shortcutDiv.className = "command-palette-shortcut";

        const parts = cmd.shortcut.split("+");
        parts.forEach(part => {
          const kbd = document.createElement("kbd");
          kbd.className = "command-palette-kbd";
          kbd.textContent = part;
          shortcutDiv.appendChild(kbd);
        });

        li.appendChild(shortcutDiv);
      }

      li.addEventListener("click", () => {
        this.executeCommand(cmd);
      });

      li.addEventListener("mouseenter", () => {
        commandPaletteSelectedIdx = idx;
        this.updateSelectionStyles();
      });

      listEl.appendChild(li);
    });

    this.scrollSelectedIntoView();

    // Update aria-activedescendant on render
    if (filteredCommands.length > 0) {
      const selectedItem = listEl.querySelector(".command-palette-item.selected");
      const input = document.getElementById("commandPaletteInput");
      if (selectedItem && input) {
        input.setAttribute("aria-activedescendant", selectedItem.id);
      }
    }
  },

  updateSelectionStyles() {
    const listEl = document.getElementById("commandPaletteList");
    if (!listEl) return;
    const items = listEl.querySelectorAll(".command-palette-item");
    const input = document.getElementById("commandPaletteInput");
    items.forEach((item, idx) => {
      const isSel = idx === commandPaletteSelectedIdx;
      item.classList.toggle("selected", isSel);
      item.setAttribute("aria-selected", isSel ? "true" : "false");
      if (isSel && input) {
        input.setAttribute("aria-activedescendant", item.id);
      }
    });
  },

  scrollSelectedIntoView() {
    const listEl = document.getElementById("commandPaletteList");
    if (!listEl) return;
    const selectedItem = listEl.querySelector(".command-palette-item.selected");
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  },

  executeCommand(cmd) {
    this.close();
    if (cmd && typeof cmd.action === "function") {
      try {
        cmd.action();
      } catch (err) {
        console.error("Failed to execute command:", cmd.id, err);
      }
    }
  },
};

// Register pre-defined commands
CommandPalette.register({
  id: "run-code",
  label: "Run Code",
  shortcut: "Ctrl+Enter",
  action: () => runCode(),
});

CommandPalette.register({
  id: "reset-current-tab",
  label: "Reset Current Tab",
  action: () => {
    if (isReadOnlyMode) {
      showToast("Cannot modify code in read-only mode. Fork first! ⚠️", "warn", "⚠️");
      return;
    }
    applyEditorState("");
    showToast("Current tab cleared ↺", "warn", "⟳");
  },
});

CommandPalette.register({
  id: "full-reset",
  label: "Reset All Tabs (Starter Code)",
  shortcut: "Ctrl+Shift+R",
  action: () => {
    if (isReadOnlyMode) {
      showToast("Cannot modify code in read-only mode. Fork first! ⚠️", "warn", "⚠️");
      return;
    }
    showResetModal();
  },
});

CommandPalette.register({
  id: "toggle-theme",
  label: "Toggle Theme (Dark / Light)",
  action: () => toggleTheme(),
});

CommandPalette.register({
  id: "switch-to-html",
  label: "Switch to HTML Tab",
  shortcut: "Ctrl+1",
  action: () => switchTab("html"),
});

CommandPalette.register({
  id: "switch-to-css",
  label: "Switch to CSS Tab",
  shortcut: "Ctrl+2",
  action: () => switchTab("css"),
});

CommandPalette.register({
  id: "switch-to-js",
  label: "Switch to JS Tab",
  shortcut: "Ctrl+3",
  action: () => switchTab("js"),
});

CommandPalette.register({
  id: "next-lesson",
  label: "Next Lesson",
  shortcut: "Ctrl+]",
  action: () => navLesson(1),
});

CommandPalette.register({
  id: "prev-lesson",
  label: "Previous Lesson",
  shortcut: "Ctrl+[",
  action: () => navLesson(-1),
});

CommandPalette.register({
  id: "open-shortcuts",
  label: "Open Keyboard Shortcuts Help",
  shortcut: "?",
  action: () => openShortcutsModal(),
});
