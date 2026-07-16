/* DevForge — store.js
   Persistent (localStorage) progress: saved code, completed lessons,
   XP, streaks, analytics and time-on-lesson tracking. */
'use strict';

const LS_KEY = 'devforge:v1';
function defaultStore() {
  return {
    code: {},
    completed: [],
    started: [],
    streak: 1,
    lastActive: null,
    lessonTime: {},
    lessonRetries: {},
    completionDates: [],
    snippets: [],
    hasRun: false
  };
}
function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? Object.assign(defaultStore(), JSON.parse(raw)) : defaultStore();
  } catch {
    return defaultStore();
  }
}
function saveStore(store) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {}
}
let store = loadStore();

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (store.lastActive === today) {
    /* already counted today */
  } else {
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (store.lastActive === y) store.streak = (store.streak || 1) + 1;
    else store.streak = 1;
    store.lastActive = today;
    saveStore(store);
  }
  $('#streakCount').textContent = store.streak || 1;
}

function totalXP() {
  return FLAT_LESSONS.filter(l => store.completed.includes(l.id)).reduce((s, l) => s + l.xp, 0);
}
function refreshXP() {
  $('#xpTotal').textContent = totalXP();
}

/* time-on-lesson tracking */
const activeTimer = { lessonId: null, startedAt: null };
function flushTimer() {
  if (activeTimer.lessonId && activeTimer.lessonId !== PLAYGROUND.id && activeTimer.startedAt) {
    const elapsed = Math.floor((Date.now() - activeTimer.startedAt) / 1000);
    if (elapsed > 0) {
      store.lessonTime[activeTimer.lessonId] =
        (store.lessonTime[activeTimer.lessonId] || 0) + elapsed;
      saveStore(store);
    }
  }
  activeTimer.startedAt = Date.now();
}
function startTimer(lessonId) {
  flushTimer();
  activeTimer.lessonId = lessonId;
  activeTimer.startedAt = Date.now();
}
setInterval(flushTimer, 10000);
window.addEventListener('beforeunload', flushTimer);
