import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('app.js — integration behavior', () => {
  it('boots with the Playground active and no lesson selected', () => {
    const { document, get } = createApp();
    get('init()');
    expect(document.getElementById('lessonPanelTitle').textContent).toBe('Playground');
    expect(document.getElementById('lessonCounter').textContent).toBe('0/0');
  });

  it('renders one sidebar entry per curriculum category plus the Playground', () => {
    const { get, document } = createApp();
    get('init()');
    const categories = get('CURRICULUM').length;
    // Playground item + one wrapper per category
    expect(document.getElementById('curriculum').children.length).toBe(categories + 1);
  });

  it('clicking a lesson in the sidebar loads it into the editor', () => {
    const { get, document, window } = createApp();
    get('init()');
    const items = document.querySelectorAll('.lesson-item');
    // items[0] is the Playground; the first real lesson is items[1]
    items[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('lessonPanelTitle').textContent).toBe(
      get('FLAT_LESSONS[0].title')
    );
    expect(document.getElementById('lessonCounter').textContent).toBe(
      `1/${get('FLAT_LESSONS').length}`
    );
  });

  it('completing every goal marks the lesson complete and awards XP exactly once', () => {
    const { get, document, window } = createApp();
    get('init()');
    const lesson = get('FLAT_LESSONS[0]'); // html-first-element
    get(`loadLesson('${lesson.id}')`);

    const textarea = document.getElementById('codeInput');
    textarea.value = '<title>Hi</title><h1>Hello</h1><p>para one</p><p>para two</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(get('store.completed')).toContain(lesson.id);
    expect(document.getElementById('xpTotal').textContent).toBe(String(lesson.xp));

    // editing further after completion must not award XP twice
    textarea.value = '<title>Hi</title><h1>Hello again</h1><p>para one</p><p>para two</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(document.getElementById('xpTotal').textContent).toBe(String(lesson.xp));
  });

  it('achievements modal renders one card per achievement with an accurate unlocked count', () => {
    const { get, document, window } = createApp();
    get('init()');
    document
      .getElementById('btnAchievements')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const total = get('ACHIEVEMENTS').length;
    expect(document.querySelectorAll('.badge-card').length).toBe(total);
    expect(document.getElementById('achievementsCount').textContent).toMatch(
      new RegExp(`Unlocked \\d+ / ${total}`)
    );
  });

  it('reset code restores a lesson to its original starter code, discarding edits', () => {
    const { get, document, window } = createApp();
    get('init()');
    const lesson = get('FLAT_LESSONS[0]');
    get(`loadLesson('${lesson.id}')`);
    const textarea = document.getElementById('codeInput');
    textarea.value = '<p>ruined it</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(get('state.files.html')).toBe('<p>ruined it</p>');

    document
      .getElementById('btnResetPreview')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(get('state.files.html')).toBe(lesson.html);
  });

  it('reset code empties the Playground instead of restoring sample content', () => {
    const { get, document, window } = createApp();
    get('init()');
    get("loadLesson('__playground__')");
    document
      .getElementById('btnResetPreview')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(get('state.files.html')).toBe('');
    expect(get('state.files.css')).toBe('');
    expect(get('state.files.js')).toBe('');
  });

  it('the chosen theme persists across a full reload', () => {
    const first = createApp();
    first.document
      .getElementById('btnTheme')
      .dispatchEvent(new first.window.MouseEvent('click', { bubbles: true }));
    expect(first.document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(first.window.localStorage.getItem('devforge:theme')).toBe('light');

    // A real reload boots an entirely fresh app instance — the only thing
    // that carries over is localStorage. Seeding it here and letting the
    // REAL dom-utils.js startup code run (not a re-implementation of it)
    // is what actually proves persistence works end to end.
    const second = createApp({ localStorageSeed: { 'devforge:theme': 'light' } });
    expect(second.document.documentElement.getAttribute('data-theme')).toBe('light');
    // modals.js syncs the button's active state at load time, before init() ever runs
    expect(second.document.getElementById('btnTheme').classList.contains('active')).toBe(true);
  });
});
