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
    saveStore._warned = false;
    return true;
  } catch {
    // Don't spam a toast on every keystroke if storage stays broken —
    // warn once per failure episode, and reset the flag the next time a
    // save actually succeeds.
    if (!saveStore._warned) {
      saveStore._warned = true;
      toast("Couldn't save your progress — storage may be full or unavailable.");
    }
    return false;
  }
}
let store = loadStore();

/**
 * Validates that a parsed import file at least *roughly* matches the
 * shape saveStore() would have produced, before we trust it enough to
 * replace the live store. Doesn't need to be exhaustive — just enough to
 * stop an obviously wrong or corrupted file from crashing the app later
 * (e.g. `store.completed.includes(...)` if completed weren't an array).
 */
function isValidStoreShape(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  // Every real export always has these two fields. Requiring their
  // presence (not just correct-type-if-present) is what stops an
  // unrelated JSON file from trivially "validating" just because it
  // happens not to contain anything that fails a type check.
  if (!('completed' in data) || !('streak' in data)) return false;
  const isArr = (v, itemCheck) =>
    v === undefined || (Array.isArray(v) && (!itemCheck || v.every(itemCheck)));
  const isObj = (v, valCheck) =>
    v === undefined ||
    (typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      (!valCheck || Object.values(v).every(valCheck)));
  const isNum = v => v === undefined || typeof v === 'number';
  const isStrOrNull = v => v === undefined || v === null || typeof v === 'string';
  const isBool = v => v === undefined || typeof v === 'boolean';
  if (!isObj(data.code, c => typeof c === 'object' && c !== null && !Array.isArray(c)))
    return false;
  if (!isArr(data.completed, x => typeof x === 'string')) return false;
  if (!isArr(data.started, x => typeof x === 'string')) return false;
  if (!isNum(data.streak)) return false;
  if (!isStrOrNull(data.lastActive)) return false;
  if (!isObj(data.lessonTime, x => typeof x === 'number')) return false;
  if (!isObj(data.lessonRetries, x => typeof x === 'number')) return false;
  if (!isArr(data.completionDates, x => typeof x === 'string')) return false;
  if (!isArr(data.snippets, s => typeof s === 'object' && s !== null && !Array.isArray(s)))
    return false;
  if (!isBool(data.hasRun)) return false;
  return true;
}

function updateStreak() {
  const today = localDateString();
  if (store.lastActive === today) {
    /* already counted today */
  } else {
    // A fixed 24-hour subtraction doesn't reliably land on "yesterday"
    // across a DST transition (a day can be 23 or 25 hours long). Using
    // the Date API's own day arithmetic is timezone/DST-safe.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = localDateString(yesterday);
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
