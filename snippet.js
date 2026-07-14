/* exported SnippetManager */
"use strict";

const SnippetManager = {
  _snippets: [],

  init() {
    this._load();
    this._renderSnippetList();
  },

  _load() {
    try {
      const raw = localStorage.getItem("devforge_snippets");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this._snippets = parsed;
      }
    } catch {
      this._snippets = [];
    }
  },

  _save() {
    try {
      localStorage.setItem("devforge_snippets", JSON.stringify(this._snippets));
    } catch {
      showToast("Failed to save snippet", "error", "❌");
    }
  },

  saveCurrentAsSnippet(name) {
    const editor = document.getElementById("codeEditor");
    if (editor && buffers[currentLessonId]) {
      buffers[currentLessonId][activeTab] = editor.value;
    }
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to save as snippet", "warn", "⚠️");
      return;
    }
    const lesson = getLesson(currentLessonId);
    const snippet = {
      id: "snip_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: name || "Untitled Snippet",
      lessonId: currentLessonId,
      lessonTitle: lesson ? lesson.title : "Unknown",
      tab: activeTab,
      code: buf[activeTab] || "",
      html: buf.html || "",
      css: buf.css || "",
      js: buf.js || "",
      created: Date.now(),
      updated: Date.now(),
    };
    this._snippets.unshift(snippet);
    if (this._snippets.length > 50) this._snippets.pop();
    this._save();
    this._renderSnippetList();
    showToast(`Snippet "${snippet.name}" saved!`, "success", "📌");
  },

  deleteSnippet(id) {
    const idx = this._snippets.findIndex(s => s.id === id);
    if (idx === -1) return;
    const name = this._snippets[idx].name;
    this._snippets.splice(idx, 1);
    this._save();
    this._renderSnippetList();
    showToast(`Snippet "${name}" deleted`, "info", "🗑️");
  },

  loadSnippet(id) {
    const snippet = this._snippets.find(s => s.id === id);
    if (!snippet) {
      showToast("Snippet not found", "error", "❌");
      return;
    }
    if (snippet.lessonId && snippet.lessonId !== currentLessonId) {
      loadLesson(snippet.lessonId);
    }
    if (!buffers[currentLessonId]) {
      buffers[currentLessonId] = { html: "", css: "", js: "" };
    }
    buffers[currentLessonId].html = snippet.html;
    buffers[currentLessonId].css = snippet.css;
    buffers[currentLessonId].js = snippet.js;
    loadTab(snippet.tab || "html");
    runCode({ trackProgress: false });
    showToast(`Loaded snippet "${snippet.name}"`, "success", "📋");
  },

  _renderSnippetList() {
    const list = document.getElementById("snippetList");
    if (!list) return;
    list.innerHTML = "";
    if (this._snippets.length === 0) {
      const empty = document.createElement("li");
      empty.className = "snippet-empty";
      empty.textContent = "No saved snippets yet";
      list.appendChild(empty);
      return;
    }
    this._snippets.forEach(s => {
      const item = document.createElement("li");
      item.className = "snippet-item";
      item.innerHTML = `
        <div class="snippet-item-info" tabindex="0" role="button" aria-label="Load snippet ${s.name}">
          <span class="snippet-item-name">${escapeHtml(s.name)}</span>
          <span class="snippet-item-meta">${escapeHtml(s.lessonTitle)} · ${s.tab.toUpperCase()}</span>
        </div>
        <button type="button" class="snippet-delete-btn" title="Delete snippet" aria-label="Delete snippet ${s.name}">✕</button>
      `;
      item
        .querySelector(".snippet-item-info")
        .addEventListener("click", () => this.loadSnippet(s.id));
      item.querySelector(".snippet-delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        this.deleteSnippet(s.id);
      });
      list.appendChild(item);
    });
  },

  getAll() {
    return this._snippets.slice();
  },
};

function openSnippetModal() {
  if (fsPanelVisible) toggleFsPanel();
  if (activeModalEl) closeModal(activeModalEl);
  SnippetManager.init();
  openModal(document.getElementById("snippetModal"));
}

function closeSnippetModal() {
  closeModal(document.getElementById("snippetModal"));
}

function saveSnippetFromModal() {
  const input = document.getElementById("snippetNameInput");
  const name = input.value.trim();
  if (!name) {
    showToast("Please enter a snippet name", "warn", "⚠️");
    input.focus();
    return;
  }
  SnippetManager.saveCurrentAsSnippet(name);
  input.value = "";
  closeSnippetModal();
}
