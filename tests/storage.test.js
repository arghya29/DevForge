import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

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
    const today = new Date().toISOString().slice(0, 10);
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
    const today = new Date().toISOString().slice(0, 10);
    const { get } = createApp({ seedStore: { streak: 5, lastActive: today } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(5);
  });

  it('updateStreak() increments on a consecutive day', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const { get } = createApp({ seedStore: { streak: 5, lastActive: yesterday } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(6);
  });

  it('updateStreak() resets to 1 after a gap of more than one day', () => {
    const longAgo = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    const { get } = createApp({ seedStore: { streak: 12, lastActive: longAgo } });
    get('updateStreak()');
    expect(get('store.streak')).toBe(1);
  });
});
