import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('modals.js — learner analytics', () => {
  it('renders one row per curriculum lesson in the stats table, defaulting to 00:00 / 0 retries', () => {
    const { get, document, window } = createApp();
    get('init()');
    document
      .getElementById('btnAnalytics')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const rows = document.querySelectorAll('#statsBody tr');
    expect(rows.length).toBe(get('FLAT_LESSONS.length'));
    expect(rows[0].textContent).toContain('00:00');
  });

  it('reflects accumulated lesson time in the stats table', () => {
    const { get, document, window } = createApp({
      seedStore: { lessonTime: { 'html-first-element': 125 } }
    });
    get('init()');
    document
      .getElementById('btnAnalytics')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const firstRow = document.querySelectorAll('#statsBody tr')[0];
    expect(firstRow.textContent).toContain('02:05'); // 125s = 2:05
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

  it('Reset Analytics clears time/retries/consistency but leaves XP and completed lessons intact', () => {
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
  });
});
