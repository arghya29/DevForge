/* ═══════════════════════════════════════════════════════════════
   DevForge — storage.js
   Persistence: save / restore / clear learner progress via
   localStorage.
   Depends on: shared state declared in app.js (xp, streak,
   doneSet, buffers, revealedHints, autorun)
═══════════════════════════════════════════════════════════════ */
/* exported saveProgress, scheduleSave, loadProgress, clearProgress */
"use strict";

const STORAGE_KEY = "devforge:progress:v1";
let saveTimer = null;

// Persist XP, streak, completed-lesson ids, and per-lesson code buffers.
function saveProgress() {
  try {
    const fontSize = getComputedStyle(document.documentElement).getPropertyValue("--fs").trim();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        xp: xp,
        streak: streak,
        done: Array.from(doneSet),
        buffers: buffers,
        hints: revealedHints, // Persist progressive hints count (#77)
        autorun: autorun,
        fontSize: fontSize,
      })
    );
  } catch {
    return; // storage unavailable (private mode) or quota exceeded — ignore
  }
}

// Debounced save so we don't write to storage on every keystroke.
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgress, 500);
}

// Restore saved progress on load, defensively validating every field.
function loadProgress() {
  let data;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    data = JSON.parse(raw);
  } catch {
    return; // storage unavailable or corrupt JSON — start fresh
  }
  if (!data || typeof data !== "object") return;

  if (typeof data.xp === "number" && Number.isFinite(data.xp) && data.xp >= 0) {
    xp = data.xp;
  }
  if (typeof data.streak === "number" && Number.isFinite(data.streak) && data.streak >= 0) {
    streak = data.streak;
  }
  const validIds = new Set(getAllLessons().map(l => l.id));
  if (Array.isArray(data.done)) {
    data.done.forEach(id => {
      if (validIds.has(id)) doneSet.add(id);
    });
  }
  if (data.buffers && typeof data.buffers === "object" && !Array.isArray(data.buffers)) {
    Object.keys(data.buffers).forEach(id => {
      if (!validIds.has(id)) return;
      const b = data.buffers[id];
      if (
        b &&
        typeof b === "object" &&
        typeof b.html === "string" &&
        typeof b.css === "string" &&
        typeof b.js === "string"
      ) {
        buffers[id] = { html: b.html, css: b.css, js: b.js };
      }
    });
  }
  if (data.hints && typeof data.hints === "object" && !Array.isArray(data.hints)) {
    Object.keys(data.hints).forEach(id => {
      if (validIds.has(id) && typeof data.hints[id] === "number") {
        revealedHints[id] = data.hints[id];
      }
    });
  }
  if (typeof data.autorun === "boolean") {
    autorun = data.autorun;
    const toggle = document.getElementById("autorunToggle");
    if (toggle) toggle.classList.toggle("on", autorun);
    const label = document.getElementById("autorunLabel");
    if (label) label.textContent = autorun ? "Auto ✓" : "Auto";
    const wrap = document.querySelector(".autorun-wrap");
    if (wrap) wrap.setAttribute("aria-checked", String(autorun));
  }
  if (typeof data.fontSize === "string" && /^\d+(?:\.\d+)?px$/.test(data.fontSize)) {
    document.documentElement.style.setProperty("--fs", data.fontSize);
    const slider = document.getElementById("fsSlider");
    if (slider) slider.value = parseInt(data.fontSize, 10);
    const label = document.getElementById("fsValLabel");
    if (label) label.textContent = data.fontSize;
  }
}

// Wipe persisted progress (used by the Restart flow).
function clearProgress() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  revealedHints = {}; // Reset progressive hints on restart (#77)
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return; // ignore
  }
}
