import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('app.js — integration behavior with mock curriculum', () => {
  let app;
  let get;
  let document;
  let window;
  let mockLesson;

  beforeEach(() => {
    mockLesson = {
      id: 'mock-lesson-1',
      title: 'Mock Lesson',
      tag: 'HTML',
      xp: 15,
      html: '<p>starter</p>',
      css: '',
      js: '',
      description: 'A stable test lesson',
      goals: [
        {
          text: 'Type test',
          check: files => files.html.includes('test')
        }
      ]
    };

    app = createApp({ mockCurriculum: [mockLesson] });
    get = app.get;
    document = app.document;
    window = app.window;
  });

  it('boots with the Playground active and no lesson selected', () => {
    get('init()');
    expect(document.getElementById('lessonPanelTitle').textContent).toBe('Playground');
    expect(document.getElementById('lessonCounter').textContent).toBe('0/1');
  });

  it('renders one sidebar entry per curriculum category plus the Playground', () => {
    get('init()');
    const categories = get('CURRICULUM').length;
    expect(document.getElementById('curriculum').children.length).toBe(categories + 1);
  });

  it('clicking a lesson in the sidebar loads it into the editor', () => {
    get('init()');
    const items = document.querySelectorAll('.lesson-item');
    items[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('lessonPanelTitle').textContent).toBe('Mock Lesson');
    expect(document.getElementById('lessonCounter').textContent).toBe('1/1');
  });

  it('completing every goal marks the lesson complete and awards XP exactly once', () => {
    get('init()');
    get(`loadLesson('mock-lesson-1')`);

    const textarea = document.getElementById('codeInput');
    textarea.value = '<p>test</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(get('store.completed')).toContain('mock-lesson-1');
    expect(document.getElementById('xpTotal').textContent).toBe('15');

    // editing further after completion must not award XP twice
    textarea.value = '<p>test again</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(document.getElementById('xpTotal').textContent).toBe('15');
  });

  it('achievements modal renders one card per achievement with an accurate unlocked count', () => {
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
    get('init()');
    get(`loadLesson('mock-lesson-1')`);
    const textarea = document.getElementById('codeInput');
    textarea.value = '<p>ruined it</p>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(get('state.files.html')).toBe('<p>ruined it</p>');

    document
      .getElementById('btnResetPreview')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(get('state.files.html')).toBe('<p>starter</p>');
  });

  it('reset code empties the Playground instead of restoring sample content', () => {
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
    const first = createApp({ mockCurriculum: [mockLesson] });
    first.document
      .getElementById('btnTheme')
      .dispatchEvent(new first.window.MouseEvent('click', { bubbles: true }));
    expect(first.document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(first.window.localStorage.getItem('devforge:theme')).toBe('light');

    const second = createApp({ 
      mockCurriculum: [mockLesson], 
      localStorageSeed: { 'devforge:theme': 'light' } 
    });
    expect(second.document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(second.document.getElementById('btnTheme').classList.contains('active')).toBe(true);
  });
});
