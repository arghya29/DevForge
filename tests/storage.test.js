import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

// Mirrors js/dom-utils.js's localDateString() exactly, so seeded test
// fixtures always agree with what the app itself computes for "today" —
// using UTC-based date math here (as the old tests did) would only agree
// with the app by coincidence on a UTC machine, and disagree (flakily)
// everywhere else.
function localDay(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

describe('store.js — persistent progress', () => {
  it('defaultStore() has the expected shape', () => {
    const { get } = createApp();
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
    const { get } = createApp();
    expect(get('store').completed).toEqual([]);
    expect(get('store').streak).toBe(1);
  });

  it('loadStore() merges saved data over the defaults (forward-compatible with new fields)', () => {
    const today = localDay(0);
    const { get } = createApp({
      seedStore: { completed: ['html-first-element'], streak: 4, lastActive: today }
    });
    expect(get('store').completed).toEqual(['html-first-element']);
    expect(get('store').streak).toBe(4);
    // fields that didn't exist when this progress was saved still default in
    expect(get('store').snippets).toEqual([]);
  });

  it('saveStore() persists to localStorage under the devforge:v1 key', () => {
    const { get, window } = createApp();
    get('store.streak = 9, saveStore(store)');
    const raw = JSON.parse(window.localStorage.getItem('devforge:v1'));
    expect(raw.streak).toBe(9);
  });

  it('totalXP() sums xp only for completed lessons', () => {
    const { get } = createApp();
    const lessons = get('FLAT_LESSONS');
    const first = lessons[0];
    const second = lessons[1];
    get(`store.completed = ['${first.id}', '${second.id}']`);
    expect(get('totalXP()')).toBe(first.xp + second.xp);
  });

  it('totalXP() ignores unknown/stale lesson ids gracefully', () => {
    const { get } = createApp();
    get("store.completed = ['this-lesson-id-does-not-exist']");
    expect(() => get('totalXP()')).not.toThrow();
    expect(get('totalXP()')).toBe(0);
  });

  it('updateStreak() starts a fresh streak at 1 on first visit', () => {
    const { get } = createApp();
    get('updateStreak()');
    expect(get('store.streak')).toBe(1);
  });

  it('updateStreak() does not double-count the same day', () => {
    const today = localDay(0);
    const { get } = createApp({ seedStore: { streak: 5, lastActive: today } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(5);
  });

  it('updateStreak() increments on a consecutive day', () => {
    const yesterday = localDay(1);
    const { get } = createApp({ seedStore: { streak: 5, lastActive: yesterday } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(6);
  });

  it('updateStreak() resets to 1 after a gap of more than one day', () => {
    const longAgo = localDay(5);
    const { get } = createApp({ seedStore: { streak: 12, lastActive: longAgo } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(1);
  });

  it('localDateString() uses the local calendar day, not the UTC one', () => {
    const { get } = createApp();
    // 11pm local time on Jan 15th is still Jan 16th in UTC for any timezone
    // west of UTC — localDateString must report the LOCAL day (15th), not
    // whatever toISOString() (always UTC) would give.
    const local = get(
      'localDateString(new Date(2026, 0, 15, 23, 0, 0))' // Jan 15, 2026, 11pm, local time
    );
    expect(local).toBe('2026-01-15');
  });
});

describe('store.js — isValidStoreShape() / import validation', () => {
  it('accepts a well-formed store object', () => {
    const { get } = createApp();
    expect(get('isValidStoreShape(defaultStore())')).toBe(true);
    expect(
      get(
        "isValidStoreShape({ completed: ['a'], streak: 3, lastActive: '2026-01-01', hasRun: true })"
      )
    ).toBe(true);
  });

  it('rejects non-objects and null', () => {
    const { get } = createApp();
    expect(get('isValidStoreShape(null)')).toBe(false);
    expect(get('isValidStoreShape(42)')).toBe(false);
    expect(get('isValidStoreShape("not a store")')).toBe(false);
    expect(get('isValidStoreShape([1, 2, 3])')).toBe(false);
  });

  it('rejects wrong-typed fields (with the required baseline fields otherwise present and valid)', () => {
    const { get } = createApp();
    expect(get("isValidStoreShape({ completed: 'not-an-array', streak: 0 })")).toBe(false);
    expect(get('isValidStoreShape({ completed: [1, 2, 3], streak: 0 })')).toBe(false); // ids must be strings
    expect(get("isValidStoreShape({ completed: [], streak: 'five' })")).toBe(false);
    expect(get('isValidStoreShape({ completed: [], streak: 0, hasRun: "yes" })')).toBe(false);
    expect(get('isValidStoreShape({ completed: [], streak: 0, code: [1, 2] })')).toBe(false); // code must be an object, not array
  });

  it('the import handler refuses a malformed file instead of corrupting the live store', async () => {
    const today = localDay(0);
    const { get, document, window } = createApp({ seedStore: { streak: 7, lastActive: today } });
    get('init()');
    const file = new window.File(['{"totally": "not a progress file"}'], 'bad.json', {
      type: 'application/json'
    });
    Object.defineProperty(document.getElementById('importFile'), 'files', { value: [file] });
    document
      .getElementById('importFile')
      .dispatchEvent(new window.Event('change', { bubbles: true }));
    // FileReader.onload fires asynchronously even in jsdom
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(get('store.streak')).toBe(7); // untouched — the bad file was rejected
  });
});

describe('store.js — saveStore() failure handling', () => {
  it('surfaces a toast when localStorage.setItem throws, instead of failing silently', () => {
    const { get, window, document } = createApp();
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    get('saveStore(store)');
    const toasts = Array.from(document.querySelectorAll('.toast')).map(t => t.textContent);
    expect(toasts.some(t => /save/i.test(t))).toBe(true);
  });

  it('does not spam a toast on every save while storage stays broken (warns once per failure episode)', () => {
    const { get, window, document } = createApp();
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
