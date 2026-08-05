import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('commands.js — command palette', () => {
  it('registers a command for every lesson plus a set of built-in actions', () => {
    const { get } = createApp();
    const commandCount = get('COMMANDS.length');
    const lessonCount = get('FLAT_LESSONS.length');
    expect(commandCount).toBeGreaterThan(lessonCount); // lessons + built-ins
  });

  it('Ctrl+K opens the palette and focuses the search input', () => {
    const { get, document, window } = createApp();
    get('init()');
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    expect(document.getElementById('commandPalette').className).toContain('open');
    expect(document.activeElement).toBe(document.getElementById('paletteInput'));
  });

  it('Ctrl+K again closes the palette', () => {
    const { get, document, window } = createApp();
    get('init()');
    const fire = () =>
      document.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        })
      );
    fire();
    expect(document.getElementById('commandPalette').className).toContain('open');
    fire();
    expect(document.getElementById('commandPalette').className).not.toContain('open');
  });

  it('Escape closes the palette', () => {
    const { get, document, window } = createApp();
    get('openCommandPalette()');
    expect(document.getElementById('commandPalette').className).toContain('open');
    document
      .getElementById('paletteInput')
      .dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
    expect(document.getElementById('commandPalette').className).not.toContain('open');
  });

  it('typing a lesson name filters the list down to matching commands', () => {
    const { get, document, window } = createApp();
    get('openCommandPalette()');
    const input = document.getElementById('paletteInput');
    input.value = 'flexbox';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    const items = Array.from(document.querySelectorAll('.palette-item')).map(li => li.textContent);
    expect(items.some(t => /flexbox/i.test(t))).toBe(true);
    expect(items.length).toBeLessThan(get('COMMANDS.length'));
  });

  it('an unmatched query shows the empty state, not a stale list', () => {
    const { get, document, window } = createApp();
    get('openCommandPalette()');
    const input = document.getElementById('paletteInput');
    input.value = 'zzzzzznomatch';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(document.getElementById('paletteEmpty').style.display).not.toBe('none');
    expect(document.querySelectorAll('.palette-item').length).toBe(0);
  });

  it('Enter executes the active command and closes the palette', () => {
    const { get, document, window } = createApp();
    get('init()');
    get('openCommandPalette()');
    const input = document.getElementById('paletteInput');
    input.value = 'open playground';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    input.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    );
    expect(document.getElementById('commandPalette').className).not.toContain('open');
    expect(get('state.currentLessonId')).toBe('__playground__');
  });

  it('ArrowDown moves the active selection to the next item', () => {
    const { get, document, window } = createApp();
    get('openCommandPalette()');
    const input = document.getElementById('paletteInput');
    input.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    );
    const items = document.querySelectorAll('.palette-item');
    expect(items[1].classList.contains('active')).toBe(true);
    expect(items[0].classList.contains('active')).toBe(false);
  });

  it('registerCommand() makes a new command immediately searchable', () => {
    const { get } = createApp();
    get(
      `registerCommand({ id: 'custom-test-cmd', label: 'My Custom Test Command', group: 'Test', action: () => {} })`
    );
    const matches = get(`filteredCommands('Custom Test')`);
    expect(matches.some(c => c.id === 'custom-test-cmd')).toBe(true);
  });

  it('copyAllCode() writes a labeled bundle of HTML, CSS, and JS to the clipboard', async () => {
    const { get, window } = createApp();
    get('loadLesson(FLAT_LESSONS[0].id)');
    let written = '';
    window.navigator.clipboard.writeText = text => {
      written = text;
      return Promise.resolve();
    };
    get('copyAllCode()');
    await new Promise(r => setTimeout(r, 0));
    expect(written).toContain('/* index.html */');
    expect(written).toContain('/* style.css */');
    expect(written).toContain('/* script.js */');
    expect(written).toContain(get('FLAT_LESSONS[0].html'));
  });

  it('global shortcuts do not fire when typing inside an input field', () => {
    const { get, document, window } = createApp();
    get('init()');
    get('openCommandPalette()');
    const input = document.getElementById('paletteInput');
    expect(document.activeElement).toBe(input);

    input.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: '?',
        bubbles: true,
        cancelable: true
      })
    );
    expect(document.getElementById('helpModal').classList.contains('open')).toBe(false);

    input.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    expect(document.getElementById('sidebar').classList.contains('collapsed')).toBe(false);
  });
});
