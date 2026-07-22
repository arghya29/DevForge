import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from './helpers/loadApp.js';

// Mirrors js/dom-utils.js's localDateString() exactly, so seeded test
// fixtures always agree with what the app itself computes for "today"
function localDay(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

describe('store.js — persistent progress', () => {
  let app;
  let get;
  let document;
  let window;

  beforeEach(() => {
    vi.useFakeTimers();
    app = createApp();
    get = app.get;
    document = app.document;
    window = app.window;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaultStore() has the expected shape', () => {
    const d = get('defaultStore()');
    expect(d).toMatchObject({
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
    });
  });

  it('loadStore() returns defaults when localStorage is empty', () => {
    expect(get('store').completed).toEqual([]);
    expect(get('store').streak).toBe(1);
  });

  it('loadStore() merges saved data over the defaults (forward-compatible with new fields)', () => {
    const today = localDay(0);
    // Re-initialize app with seedStore since it requires constructor options
    const seededApp = createApp({
      seedStore: { completed: ['html-first-element'], streak: 4, lastActive: today }
    });
    const seededGet = seededApp.get;
    expect(seededGet('store').completed).toEqual(['html-first-element']);
    expect(seededGet('store').streak).toBe(4);
    expect(seededGet('store').snippets).toEqual([]);
  });

  it('saveStore() persists to localStorage under the devforge:v1 key', () => {
    get('store.streak = 9, saveStore(store)');
    const raw = JSON.parse(window.localStorage.getItem('devforge:v1'));
    expect(raw.streak).toBe(9);
  });

  it('totalXP() sums xp only for completed lessons', () => {
    const lessons = get('FLAT_LESSONS');
    const first = lessons[0];
    const second = lessons[1];
    get(`store.completed = ['${first.id}', '${second.id}']`);
    expect(get('totalXP()')).toBe(first.xp + second.xp);
  });

  it('totalXP() ignores unknown/stale lesson ids gracefully', () => {
    get("store.completed = ['this-lesson-id-does-not-exist']");
    expect(() => get('totalXP()')).not.toThrow();
    expect(get('totalXP()')).toBe(0);
  });

  it('updateStreak() starts a fresh streak at 1 on first visit', () => {
    get('updateStreak()');
    expect(get('store.streak')).toBe(1);
  });

  it('updateStreak() does not double-count the same day', () => {
    const today = localDay(0);
    const seededApp = createApp({ seedStore: { streak: 5, lastActive: today } });
    seededApp.get('updateStreak()');
    expect(seededApp.get('store.streak')).toBe(5);
  });

  it('updateStreak() increments on a consecutive day', () => {
    const yesterday = localDay(1);
    const seededApp = createApp({ seedStore: { streak: 5, lastActive: yesterday } });
    seededApp.get('updateStreak()');
    expect(seededApp.get('store.streak')).toBe(6);
  });

  it('updateStreak() resets to 1 after a gap of more than one day', () => {
    const longAgo = localDay(5);
    const seededApp = createApp({ seedStore: { streak: 12, lastActive: longAgo } });
    seededApp.get('updateStreak()');
    expect(seededApp.get('store.streak')).toBe(1);
  });

  it('localDateString() uses the local calendar day, not the UTC one', () => {
    const local = get('localDateString(new Date(2026, 0, 15, 23, 0, 0))');
    expect(local).toBe('2026-01-15');
  });
});

describe('store.js — isValidStoreShape() / import validation', () => {
  let app;
  let get;
  let document;
  let window;

  beforeEach(() => {
    vi.useFakeTimers();
    app = createApp();
    get = app.get;
    document = app.document;
    window = app.window;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a well-formed store object', () => {
    expect(get('isValidStoreShape(defaultStore())')).toBe(true);
    expect(
      get(
        "isValidStoreShape({ completed: ['a'], streak: 3, lastActive: '2026-01-01', hasRun: true })"
      )
    ).toBe(true);
  });

  it('rejects non-objects and null', () => {
    expect(get('isValidStoreShape(null)')).toBe(false);
    expect(get('isValidStoreShape(42)')).toBe(false);
    expect(get('isValidStoreShape("not a store")')).toBe(false);
    expect(get('isValidStoreShape([1, 2, 3])')).toBe(false);
  });

  it('rejects wrong-typed fields', () => {
    expect(get("isValidStoreShape({ completed: 'not-an-array', streak: 0 })")).toBe(false);
    expect(get('isValidStoreShape({ completed: [1, 2, 3], streak: 0 })')).toBe(false);
    expect(get("isValidStoreShape({ completed: [], streak: 'five' })")).toBe(false);
    expect(get('isValidStoreShape({ completed: [], streak: 0, hasRun: "yes" })')).toBe(false);
    expect(get('isValidStoreShape({ completed: [], streak: 0, code: [1, 2] })')).toBe(false);
  });

  it('the import handler refuses a malformed file instead of corrupting the live store', async () => {
    const today = localDay(0);
    const seededApp = createApp({ seedStore: { streak: 7, lastActive: today } });
    const sGet = seededApp.get;
    const sDoc = seededApp.document;
    const sWin = seededApp.window;
    sGet('init()');

    const file = new sWin.File(['{"totally": "not a progress file"}'], 'bad.json', {
      type: 'application/json'
    });
    Object.defineProperty(sDoc.getElementById('importFile'), 'files', { value: [file] });
    sDoc.getElementById('importFile').dispatchEvent(new sWin.Event('change', { bubbles: true }));

    await new Promise(resolve => process.nextTick(resolve));
    vi.advanceTimersByTime(50);
    expect(sGet('store.streak')).toBe(7);
  });

  it('does not claim "Progress imported" if the underlying save fails', async () => {
    get('init()');
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    const validExport = JSON.stringify(get('defaultStore()'));
    const file = new window.File([validExport], 'progress.json', { type: 'application/json' });
    Object.defineProperty(document.getElementById('importFile'), 'files', { value: [file] });
    document
      .getElementById('importFile')
      .dispatchEvent(new window.Event('change', { bubbles: true }));

    await new Promise(resolve => process.nextTick(resolve));
    vi.advanceTimersByTime(50);
    const toasts = Array.from(document.querySelectorAll('.toast')).map(t => t.textContent);
    expect(toasts).not.toContain('Progress imported');
  });
});

describe('store.js — saveStore() failure handling', () => {
  let app;
  let get;
  let document;
  let window;

  beforeEach(() => {
    app = createApp();
    get = app.get;
    document = app.document;
    window = app.window;
  });

  it('surfaces a toast when localStorage.setItem throws, instead of failing silently', () => {
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    get('saveStore(store)');
    const toasts = Array.from(document.querySelectorAll('.toast')).map(t => t.textContent);
    expect(toasts.some(t => /save/i.test(t))).toBe(true);
  });

  it('does not spam a toast on every save while storage stays broken', () => {
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    get('saveStore(store)');
    get('saveStore(store)');
    get('saveStore(store)');
    const toastCount = document.querySelectorAll('.toast').length;
    expect(toastCount).toBe(1);
  });
});
