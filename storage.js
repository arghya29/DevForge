/* ═══════════════════════════════════════════════════════════════
   DevForge — storage.js
   Persistence: save / restore / clear learner progress via
   localStorage. Keeps last 3 snapshots for rollback and
   validates/auto-repairs data on load.
   Depends on: shared state declared in app.js (xp, streak,
   doneSet, buffers, revealedHints, autorun)
╔═══════════════════════════════════════════════════════════════ */
/* exported saveProgress, scheduleSave, loadProgress, clearProgress */
/* global getAchievementData, setAchievementData, clearAchievementData, LayoutManager */
"use strict";

const STORAGE_KEY = "devforge:progress:v2";
const SAVE_DEBOUNCE_MS = 800;
const SNAPSHOT_STORAGE_KEY = "devforge:snapshots:v1";
const RECOVERY_POINT_KEY = "devforge:recovery:point:v1";
const MAX_KEEP_SNAPSHOTS = 3;

let saveTimer = null;
let hasWarnedStorageFailure = false;

function getSnapshots() {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSnapshots(snapshots) {
  try {
    window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    /* non-critical */
  }
}

function storeRecoveryPoint() {
  try {
    window.localStorage.setItem(
      RECOVERY_POINT_KEY,
      JSON.stringify({ timestamp: Date.now(), currentLessonId: currentLessonId })
    );
  } catch {
    /* non-critical */
  }
}

function takeSnapshot() {
  try {
    const snapshots = getSnapshots();
    snapshots.push({
      timestamp: Date.now(),
      xp: xp,
      streak: streak,
      done: Array.from(doneSet),
      buffers: JSON.parse(JSON.stringify(buffers)),
    });
    while (snapshots.length > MAX_KEEP_SNAPSHOTS) snapshots.shift();
    saveSnapshots(snapshots);
    storeRecoveryPoint();
  } catch {
    /* non-critical */
  }
}

// Persist XP, streak, completed-lesson ids, and per-lesson code buffers.
function saveProgress() {
  try {
    const fontSize = getComputedStyle(document.documentElement).getPropertyValue("--fs").trim();
    const achievementsData = typeof getAchievementData === "function" ? getAchievementData() : {};
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
        achievements: achievementsData, // Persist unlocked achievements
        layout:
          typeof LayoutManager !== "undefined" && LayoutManager._current
            ? LayoutManager._current
            : undefined,
      })
    );
    takeSnapshot();
  } catch {
    if (!hasWarnedStorageFailure) {
      hasWarnedStorageFailure = true;
      if (typeof showToast === "function") {
        showToast("Storage unavailable or full. Progress won't be saved! ⚠️", "error", "⚠️");
      }
    }
  }
}

// Debounced save so we don't write to storage on every keystroke.
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgress, SAVE_DEBOUNCE_MS);
}

// Restore saved progress on load, defensively validating every field.
function loadProgress() {
  // Test storage availability on load
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    hasWarnedStorageFailure = true;
    setTimeout(() => {
      if (typeof showToast === "function") {
        showToast(
          "Local storage is disabled/blocked. Progress won't persist across sessions! ⚠️",
          "error",
          "⚠️"
        );
      }
    }, 1000);
  }

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
  if (
    data.achievements &&
    typeof data.achievements === "object" &&
    !Array.isArray(data.achievements)
  ) {
    if (typeof setAchievementData === "function") {
      setAchievementData(data.achievements);
    }
  }

  // Auto-repair: validate state consistency after load
  {
    const allLessons = getAllLessons();
    const valIds = new Set(allLessons.map(l => l.id));
    if (currentLessonId && !valIds.has(currentLessonId)) {
      currentLessonId = allLessons.length > 0 ? allLessons[0].lessons[0].id : null;
    }
    if (typeof xp !== "number" || !Number.isFinite(xp) || xp < 0) xp = 0;
    if (typeof streak !== "number" || !Number.isFinite(streak) || streak < 0) streak = 0;
    doneSet.forEach(id => {
      if (!valIds.has(id)) doneSet.delete(id);
    });
    Object.keys(buffers).forEach(id => {
      if (!valIds.has(id)) {
        delete buffers[id];
        return;
      }
      const b = buffers[id];
      if (
        !b ||
        typeof b !== "object" ||
        typeof b.html !== "string" ||
        typeof b.css !== "string" ||
        typeof b.js !== "string"
      ) {
        delete buffers[id];
      }
    });
  }

  // Restore from recovery flag set by offline error page
  try {
    if (window.localStorage.getItem("devforge:recovery:restore") === "1") {
      window.localStorage.removeItem("devforge:recovery:restore");
      const snapshots = getSnapshots();
      if (snapshots.length > 0) {
        const snap = snapshots[snapshots.length - 1];
        if (typeof snap.xp === "number" && Number.isFinite(snap.xp) && snap.xp >= 0) xp = snap.xp;
        if (typeof snap.streak === "number" && Number.isFinite(snap.streak) && snap.streak >= 0)
          streak = snap.streak;
        if (Array.isArray(snap.done)) {
          doneSet.clear();
          const valIds = new Set(getAllLessons().map(l => l.id));
          snap.done.forEach(id => {
            if (valIds.has(id)) doneSet.add(id);
          });
        }
        if (snap.buffers && typeof snap.buffers === "object") {
          Object.keys(buffers).forEach(k => delete buffers[k]);
          const valIds = new Set(getAllLessons().map(l => l.id));
          Object.keys(snap.buffers).forEach(id => {
            if (!valIds.has(id)) return;
            const b = snap.buffers[id];
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
        console.info("[Recovery] Restored from snapshot via recovery flag");
      }
    }
  } catch {
    /* ignore */
  }
}

// Wipe persisted progress (used by the Restart flow).
function clearProgress() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  revealedHints = {}; // Reset progressive hints on restart (#77)
  if (typeof clearAchievementData === "function") {
    clearAchievementData();
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return; // ignore
  }
}
