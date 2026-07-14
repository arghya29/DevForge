/* ═══════════════════════════════════════════════════════════════
   DevForge — recovery.js
   Error recovery system: state snapshots, crash recovery,
   offline analytics queue, and state validation/auto-repair.
   Loaded after storage.js, before app.js.
╔═══════════════════════════════════════════════════════════════ */
/* exported RecoveryManager, recoveryState */
"use strict";

const RECOVERY_KEY = "devforge:recovery:v1";
const SNAPSHOT_KEY = "devforge:snapshots:v1";
const OFFLINE_QUEUE_KEY = "devforge:offline:queue:v1";
const MAX_SNAPSHOTS = 3;

let recoveryState = {
  lastKnownLesson: null,
  crashDetected: false,
  recovered: false,
};

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

const RecoveryManager = {
  takeSnapshot() {
    try {
      const snapshot = {
        timestamp: Date.now(),
        xp: typeof xp === "number" ? xp : 0,
        streak: typeof streak === "number" ? streak : 0,
        done: doneSet instanceof Set ? Array.from(doneSet) : [],
        buffers: buffers && typeof buffers === "object" ? buffers : {},
        hints: revealedHints && typeof revealedHints === "object" ? revealedHints : {},
        currentLessonId: currentLessonId || null,
        autorun: !!autorun,
      };
      const snapshots = this.getSnapshots();
      snapshots.push(snapshot);
      while (snapshots.length > MAX_SNAPSHOTS) {
        snapshots.shift();
      }
      try {
        const data = safeStringify(snapshots);
        if (data) {
          window.localStorage.setItem(SNAPSHOT_KEY, data);
        }
      } catch {
        console.warn("[Recovery] Failed to persist snapshots");
      }
    } catch (err) {
      console.warn("[Recovery] takeSnapshot failed:", err);
    }
  },

  getSnapshots() {
    try {
      const raw = window.localStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return [];
      const parsed = safeParse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  restoreLatestSnapshot() {
    try {
      const snapshots = this.getSnapshots();
      if (snapshots.length === 0) return false;
      const snapshot = snapshots[snapshots.length - 1];
      if (!snapshot || typeof snapshot !== "object") return false;
      if (typeof snapshot.xp === "number" && Number.isFinite(snapshot.xp) && snapshot.xp >= 0) {
        xp = snapshot.xp;
      }
      if (
        typeof snapshot.streak === "number" &&
        Number.isFinite(snapshot.streak) &&
        snapshot.streak >= 0
      ) {
        streak = snapshot.streak;
      }
      if (Array.isArray(snapshot.done)) {
        doneSet.clear();
        const validIds = new Set(getAllLessons().map(l => l.id));
        snapshot.done.forEach(id => {
          if (validIds.has(id)) doneSet.add(id);
        });
      }
      if (snapshot.buffers && typeof snapshot.buffers === "object") {
        Object.keys(buffers).forEach(k => delete buffers[k]);
        const validIds = new Set(getAllLessons().map(l => l.id));
        Object.keys(snapshot.buffers).forEach(id => {
          if (!validIds.has(id)) return;
          const b = snapshot.buffers[id];
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
      if (snapshot.hints && typeof snapshot.hints === "object") {
        Object.keys(revealedHints).forEach(k => delete revealedHints[k]);
        const validIds = new Set(getAllLessons().map(l => l.id));
        Object.keys(snapshot.hints).forEach(id => {
          if (validIds.has(id) && typeof snapshot.hints[id] === "number") {
            revealedHints[id] = snapshot.hints[id];
          }
        });
      }
      if (snapshot.currentLessonId) {
        const allLessons = getAllLessons();
        if (allLessons.some(l => l.id === snapshot.currentLessonId)) {
          currentLessonId = snapshot.currentLessonId;
        }
      }
      if (typeof snapshot.autorun === "boolean") {
        autorun = snapshot.autorun;
      }
      saveProgress();
      recoveryState.recovered = true;
      return true;
    } catch (err) {
      console.warn("[Recovery] restoreLatestSnapshot failed:", err);
      return false;
    }
  },

  validateAndRepairState() {
    try {
      let repaired = false;
      const allLessons = getAllLessons();
      const validIds = new Set(allLessons.map(l => l.id));
      if (currentLessonId && !validIds.has(currentLessonId)) {
        currentLessonId = allLessons.length > 0 ? allLessons[0].lessons[0].id : null;
        repaired = true;
      }
      if (typeof xp !== "number" || !Number.isFinite(xp) || xp < 0) {
        xp = 0;
        repaired = true;
      } else {
        xp = Math.floor(xp);
      }
      if (typeof streak !== "number" || !Number.isFinite(streak) || streak < 0) {
        streak = 0;
        repaired = true;
      } else {
        streak = Math.floor(streak);
      }
      if (!doneSet || !(doneSet instanceof Set)) {
        doneSet = new Set();
        repaired = true;
      } else {
        doneSet.forEach(id => {
          if (!validIds.has(id)) {
            doneSet.delete(id);
            repaired = true;
          }
        });
      }
      if (!buffers || typeof buffers !== "object") {
        buffers = {};
        repaired = true;
      } else {
        Object.keys(buffers).forEach(id => {
          if (!validIds.has(id)) {
            delete buffers[id];
            repaired = true;
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
            repaired = true;
          }
        });
      }
      if (!revealedHints || typeof revealedHints !== "object") {
        revealedHints = {};
        repaired = true;
      } else {
        Object.keys(revealedHints).forEach(id => {
          if (!validIds.has(id) || typeof revealedHints[id] !== "number") {
            delete revealedHints[id];
            repaired = true;
          }
        });
      }
      return repaired;
    } catch (err) {
      console.warn("[Recovery] validateAndRepairState failed:", err);
      return false;
    }
  },

  detectCrash() {
    try {
      const raw = window.localStorage.getItem(RECOVERY_KEY);
      const state = raw ? safeParse(raw) : null;
      if (state && state.cleanShutdown === false) {
        recoveryState.crashDetected = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  markCleanShutdown() {
    try {
      window.localStorage.setItem(
        RECOVERY_KEY,
        safeStringify({ cleanShutdown: true, timestamp: Date.now() }) || "{}"
      );
    } catch {
      /* ignore */
    }
  },

  markDirty() {
    try {
      window.localStorage.setItem(
        RECOVERY_KEY,
        safeStringify({ cleanShutdown: false, timestamp: Date.now() }) || "{}"
      );
    } catch {
      /* ignore */
    }
  },

  crashRecovery() {
    try {
      const crashed = this.detectCrash();
      if (!crashed) return false;
      const restored = this.restoreLatestSnapshot();
      if (restored) {
        recoveryState.recovered = true;
        console.info("[Recovery] Crash detected — restored last known good state");
      }
      return restored;
    } catch (err) {
      console.warn("[Recovery] crashRecovery failed:", err);
      return false;
    }
  },

  init() {
    try {
      this.validateAndRepairState();
      this.crashRecovery();
      this.markDirty();
      this.takeSnapshot();
    } catch (err) {
      console.warn("[Recovery] init failed:", err);
    }
  },

  enqueueOfflineEvent(event) {
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = raw ? safeParse(raw) : [];
      if (!Array.isArray(queue)) queue = [];
      queue.push({
        event: event,
        timestamp: Date.now(),
      });
      window.localStorage.setItem(OFFLINE_QUEUE_KEY, safeStringify(queue) || "[]");
    } catch (err) {
      console.warn("[Recovery] enqueueOfflineEvent failed:", err);
    }
  },

  flushOfflineQueue() {
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return;
      const queue = safeParse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;
      queue.forEach(item => {
        if (item.event && typeof Analytics !== "undefined") {
          if (item.event.type === "retry" && item.event.lessonId) {
            Analytics.recordRetry(item.event.lessonId);
          } else if (item.event.type === "completion" && item.event.lessonId) {
            Analytics.recordCompletion(item.event.lessonId);
          }
        }
      });
      window.localStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.info("[Recovery] Flushed " + queue.length + " offline analytics events");
    } catch (err) {
      console.warn("[Recovery] flushOfflineQueue failed:", err);
    }
  },
};

function withErrorBoundary(fn, context) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (err) {
      console.error("[Recovery] Error in " + context + ":", err);
      RecoveryManager.takeSnapshot();
      if (typeof showToast === "function") {
        showToast("An error occurred. Recovery snapshot saved. ⚠️", "error", "⚠️");
      }
    }
  };
}
