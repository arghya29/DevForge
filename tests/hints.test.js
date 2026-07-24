import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

/**
 * Behaviour of the hint controls in the lesson panel.
 *
 * `loadFirstLessonWithHints` picks a real lesson out of the curriculum rather than hard-coding an id,
 * so these stay true as lessons are added or reordered.
 */
function loadFirstLessonWithHints() {
  const app = createApp();
  const { get, document, window } = app;
  get('init()');

  const lessons = get('FLAT_LESSONS');
  const index = lessons.findIndex(lesson => lesson.hints && lesson.hints.length > 0);
  expect(index, 'the curriculum should contain at least one lesson with hints').toBeGreaterThan(-1);

  // items[0] is the Playground, so the lesson at FLAT_LESSONS[i] is items[i + 1].
  const items = document.querySelectorAll('.lesson-item');
  items[index + 1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  return { ...app, lesson: lessons[index] };
}

const click = (window, elToClick) =>
  elToClick.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

describe('lesson-panel.js — hint controls', () => {
  it('hides the close button until a hint has actually been revealed', () => {
    const { document } = loadFirstLessonWithHints();
    expect(document.getElementById('hintsList').children.length).toBe(0);
    expect(document.getElementById('closeHintBtn').style.display).toBe('none');
  });

  it('shows the close button beside the hint button once a hint is open', () => {
    const { document, window } = loadFirstLessonWithHints();

    click(window, document.getElementById('hintBtn'));

    expect(document.getElementById('hintsList').children.length).toBe(1);
    expect(document.getElementById('closeHintBtn').style.display).not.toBe('none');
    // Both controls live in the same row, which is what "beside the hint button" means here.
    expect(document.getElementById('closeHintBtn').parentElement).toBe(
      document.getElementById('hintBtn').parentElement
    );
  });

  it('stays visible while further hints are revealed', () => {
    const { document, window, lesson } = loadFirstLessonWithHints();

    for (let i = 0; i < lesson.hints.length; i++) {
      click(window, document.getElementById('hintBtn'));
    }

    expect(document.getElementById('hintsList').children.length).toBe(lesson.hints.length);
    expect(document.getElementById('hintBtnLabel').textContent).toBe('No more hints');
    expect(document.getElementById('closeHintBtn').style.display).not.toBe('none');
  });

  it('closing clears the revealed hints and hides itself again', () => {
    const { document, window } = loadFirstLessonWithHints();

    click(window, document.getElementById('hintBtn'));
    click(window, document.getElementById('closeHintBtn'));

    expect(document.getElementById('hintsList').children.length).toBe(0);
    expect(document.getElementById('closeHintBtn').style.display).toBe('none');
  });

  it('leaves the hint button ready to reveal from the start again after closing', () => {
    const { document, window, lesson } = loadFirstLessonWithHints();

    for (let i = 0; i < lesson.hints.length; i++) {
      click(window, document.getElementById('hintBtn'));
    }
    click(window, document.getElementById('closeHintBtn'));

    // Reading all the hints and closing must not leave the button stuck on "No more hints".
    const hintBtn = document.getElementById('hintBtn');
    expect(hintBtn.disabled).toBe(false);
    expect(document.getElementById('hintBtnLabel').textContent).toBe('Show a hint');

    click(window, hintBtn);
    expect(document.getElementById('hintsList').children.length).toBe(1);
  });

  it('is a real button, so it is keyboard reachable and operable', () => {
    const { document } = loadFirstLessonWithHints();
    const closeBtn = document.getElementById('closeHintBtn');

    expect(closeBtn.tagName).toBe('BUTTON');
    // type=button keeps it from submitting anything, and no positive tabindex means it keeps its
    // natural place in the tab order.
    expect(closeBtn.getAttribute('type')).toBe('button');
    expect(closeBtn.getAttribute('tabindex')).toBe(null);
    expect(closeBtn.getAttribute('aria-controls')).toBe('hintsList');
    expect(closeBtn.textContent.trim()).toBe('Hide hints');
  });

  it('does not show the hints section at all for a lesson without hints', () => {
    const { get, document, window } = createApp();
    get('init()');

    const lessons = get('FLAT_LESSONS');
    const index = lessons.findIndex(lesson => !lesson.hints || lesson.hints.length === 0);
    if (index === -1) return; // every lesson has hints; nothing to assert

    const items = document.querySelectorAll('.lesson-item');
    items[index + 1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('hintsSection').style.display).toBe('none');
  });
});
