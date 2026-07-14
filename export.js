/* exported CodeExporter */
"use strict";

const CodeExporter = {
  exportAsStandaloneHtml() {
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to export", "warn", "⚠️");
      return;
    }
    const lesson = getLesson(currentLessonId);
    const title = lesson ? lesson.title : "DevForge Export";
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
${buf.css || ""}
</style>
</head>
<body>
${extractBody(buf.html || "")}
<script>
${buf.js || ""}
<\/script>
</body>
</html>`;
    this._downloadFile(doc, `${title.replace(/\s+/g, "-").toLowerCase()}.html`, "text/html");
    showToast("Exported as standalone HTML", "success", "📄");
  },

  exportAsCodePen() {
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to export", "warn", "⚠️");
      return;
    }
    const lesson = getLesson(currentLessonId);
    const title = lesson ? lesson.title : "DevForge Export";
    const form = document.createElement("form");
    form.action = "https://codepen.io/pen/define";
    form.method = "POST";
    form.target = "_blank";
    const data = {
      title: title,
      description: `Exported from DevForge - ${title}`,
      html: buf.html || "",
      css: buf.css || "",
      js: buf.js || "",
    };
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    showToast("Opened CodePen with your code", "success", "📝");
  },

  exportAsJSFiddle() {
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to export", "warn", "⚠️");
      return;
    }
    const form = document.createElement("form");
    form.action = "https://jsfiddle.net/api/post/library/publish/";
    form.method = "POST";
    form.target = "_blank";
    const fields = {
      html: buf.html || "",
      css: buf.css || "",
      js: buf.js || "",
      resources: "",
      title: "DevForge Export",
      wrap: "d",
    };
    Object.entries(fields).forEach(([k, v]) => {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = v;
      form.appendChild(inp);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    showToast("Opened JSFiddle with your code", "success", "📝");
  },

  exportCurrentTab() {
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to export", "warn", "⚠️");
      return;
    }
    const code = buf[activeTab] || "";
    if (!code) {
      showToast("Current tab is empty", "warn", "⚠️");
      return;
    }
    const ext = activeTab === "html" ? "html" : activeTab === "css" ? "css" : "js";
    this._downloadFile(code, `index.${ext}`, "text/plain");
    showToast(`Exported index.${ext}`, "success", "📄");
  },

  copyAllToClipboard() {
    const buf = buffers[currentLessonId];
    if (!buf) {
      showToast("No code to copy", "warn", "⚠️");
      return;
    }
    const all = `<!-- index.html -->\n${buf.html || ""}\n\n/* index.css */\n${buf.css || ""}\n\n// index.js\n${buf.js || ""}`;
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      showToast("Clipboard not available", "error", "❌");
      return;
    }
    navigator.clipboard
      .writeText(all)
      .then(() => {
        showToast("All code copied to clipboard!", "success", "📋");
      })
      .catch(() => {
        showToast("Copy failed", "error", "❌");
      });
  },

  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

let exportFormatMenuVisible = false;

function toggleExportMenu() {
  const menu = document.getElementById("exportMenu");
  if (!menu) return;
  exportFormatMenuVisible = !exportFormatMenuVisible;
  menu.classList.toggle("show", exportFormatMenuVisible);
}

function closeExportMenu() {
  const menu = document.getElementById("exportMenu");
  if (menu) menu.classList.remove("show");
  exportFormatMenuVisible = false;
}
