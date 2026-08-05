import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('modals.js — learner analytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays an empty state message when opening analytics with no data', () => {
    const { get, document, window } = createApp();
    get('init()');
    document
      .getElementById('btnAnalytics')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('analyticsEmpty').style.display).not.toBe('none');
    expect(document.getElementById('analyticsBody').style.display).toBe('none');
    expect(document.getElementById('resetAnalyticsBtn').style.display).toBe('none');
  });

  it('renders one row per curriculum lesson in the stats table when analytics data exists', () => {
    const { get, document, window } = createApp({
      seedStore: { lessonTime: { 'html-first-element': 125 } }
    });
    get('init()');
    document
      .getElementById('btnAnalytics')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('analyticsEmpty').style.display).toBe('none');
    expect(document.getElementById('analyticsBody').style.display).not.toBe('none');
    expect(document.getElementById('resetAnalyticsBtn').style.display).not.toBe('none');
    const rows = document.querySelectorAll('#statsBody tr');
    expect(rows.length).toBe(get('FLAT_LESSONS.length'));
    expect(rows[0].textContent).toContain('02:05'); // 125s = 2:05
  });

  it('a lesson error during a run increments its retry count', () => {
    const { get, document, window } = createApp();
    get('init()');
    const lesson = get('FLAT_LESSONS[0]');
    get(`loadLesson('${lesson.id}')`);
    // simulate the sandboxed preview iframe reporting a runtime error
    window.dispatchEvent(
      new window.MessageEvent('message', {
        data: { source: 'devforge-console', type: 'error', args: ['boom'] },
        source: document.getElementById('previewFrame').contentWindow
      })
    );
    expect(get('store.lessonRetries')[lesson.id]).toBe(1);
  });

  it('the consistency caption reflects how many of the last 7 days had a completed lesson', () => {
    const today = new Date().toISOString().slice(0, 10);
    const { get, document, window } = createApp({ seedStore: { completionDates: [today] } });
    get('init()');
    document
      .getElementById('btnAnalytics')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('consistencyCaption').textContent).toContain(
      '1 of the last 7 days'
    );
  });

  it('Reset Analytics clears time/retries/consistency and reverts to empty state', () => {
    const lessonId = 'html-first-element';
    const { get, document, window } = createApp({
      seedStore: {
        completed: [lessonId],
        lessonTime: { [lessonId]: 500 },
        lessonRetries: { [lessonId]: 3 },
        completionDates: ['2026-01-01']
      }
    });
    get('init()');
    window.confirm = () => true;
    document
      .getElementById('resetAnalyticsBtn')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(get('store.lessonTime')).toEqual({});
    expect(get('store.lessonRetries')).toEqual({});
    expect(get('store.completionDates')).toEqual([]);
    expect(get('store.completed')).toEqual([lessonId]);
    expect(document.getElementById('analyticsEmpty').style.display).not.toBe('none');
  });
});
