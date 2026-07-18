import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('accessibility', () => {
  it('opening a modal moves focus inside it', () => {
    const { get, document } = createApp();
    get('init()');
    get("openModal('helpModal')");
    expect(document.getElementById('helpModal').contains(document.activeElement)).toBe(true);
  });

  it('closing a modal returns focus to whatever triggered it', () => {
    const { get, document, window } = createApp();
    get('init()');
    const trigger = document.getElementById('btnHelp');
    trigger.focus();
    trigger.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    document
      .getElementById('closeHelp')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab wraps from the last focusable element back to the first while a modal is open', () => {
    const { get, document, window } = createApp();
    get('init()');
    get("openModal('helpModal')");
    const focusable = get('getFocusable(document.getElementById("helpModal"))');
    const last = focusable[focusable.length - 1];
    last.focus();
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    );
    expect(document.activeElement).toBe(focusable[0]);
  });

  it('Escape closes whatever modal is open', () => {
    const { get, document, window } = createApp();
    get('init()');
    get("openModal('achievementsModal')");
    expect(document.getElementById('achievementsModal').className).toContain('open');
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    expect(document.getElementById('achievementsModal').className).not.toContain('open');
  });

  it('toast() announces its message through the ARIA live region', () => {
    const { get, document } = createApp();
    get("toast('Something happened')");
    expect(document.getElementById('ariaLiveRegion').textContent).toBe('Something happened');
  });

  it('every interactive control in the app can actually receive keyboard focus', () => {
    const { get, document } = createApp();
    get('init()');
    // Native interactive elements, plus anything explicitly marked as
    // keyboard-operable via role="button"/tabindex="0" (the pattern used
    // for the custom sidebar items, category headers, goals bar, etc.)
    const candidates = Array.from(
      document.querySelectorAll(
        'button, a[href], input, select, textarea, [role="button"], [tabindex]'
      )
    ).filter(elToCheck => !elToCheck.disabled && elToCheck.style.display !== 'none');

    expect(candidates.length).toBeGreaterThan(10); // sanity check the query found real elements

    const unreachable = candidates.filter(elToCheck => {
      elToCheck.focus();
      const reached = document.activeElement === elToCheck;
      elToCheck.blur();
      return !reached;
    });
    expect(unreachable.map(elToCheck => elToCheck.id || elToCheck.className)).toEqual([]);
  });

  it('no element uses a positive tabindex (which would break natural tab order)', () => {
    const { document } = createApp();
    const positiveTabIndex = Array.from(document.querySelectorAll('[tabindex]')).filter(
      elToCheck => Number(elToCheck.getAttribute('tabindex')) > 0
    );
    expect(positiveTabIndex.length).toBe(0);
  });

  it('sidebar lesson items are keyboard-activatable (Enter loads the lesson)', () => {
    const { get, document, window } = createApp();
    get('init()');
    const items = document.querySelectorAll('.lesson-item');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    items[1].dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    );
    expect(document.getElementById('lessonPanelTitle').textContent).toBe(
      get('FLAT_LESSONS[0].title')
    );
  });

  it('category headers are keyboard-collapsible (Space toggles collapsed state)', () => {
    const { get, document, window } = createApp();
    get('init()');
    const header = document.querySelector('.category-header');
    expect(header.getAttribute('role')).toBe('button');
    header.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    );
    expect(header.parentElement.classList.contains('collapsed')).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('false');
  });

  it('the lesson panel header and goals bar are real <button> elements, not ARIA-only reimplementations', () => {
    // Native <button>s get keyboard (Enter/Space) activation for free, from
    // the browser, guaranteed by the HTML spec — no JS re-implementation
    // needed or to maintain. jsdom doesn't simulate that native
    // keydown->click activation, so the only way to test it end-to-end
    // would be a real browser; what we CAN verify here is the structural
    // guarantee (it really is a <button>) plus that clicking it (which is
    // exactly what Enter/Space produces in any real browser) has the
    // correct effect.
    const { document } = createApp();
    expect(document.getElementById('lessonPanelHeader').tagName).toBe('BUTTON');
    expect(document.getElementById('goalsBar').tagName).toBe('BUTTON');
  });

  it('clicking the lesson panel header toggles the lesson panel collapsed state', () => {
    const { get, document, window } = createApp();
    get('init()');
    const panel = document.getElementById('lessonPanel');
    const header = document.getElementById('lessonPanelHeader');
    expect(panel.classList.contains('collapsed')).toBe(false);
    header.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('collapsed')).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    header.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('collapsed')).toBe(false);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking the goals bar toggles the goals list open/closed exactly once per click (no duplicate listeners)', () => {
    const { get, document, window } = createApp();
    get('init()');
    const lesson = get('FLAT_LESSONS[0]');
    get(`loadLesson('${lesson.id}')`);
    const goalsBar = document.getElementById('goalsBar');
    const goalsList = document.getElementById('goalsList');
    expect(goalsList.classList.contains('open')).toBe(false);
    goalsBar.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(goalsList.classList.contains('open')).toBe(true);
    expect(goalsBar.getAttribute('aria-expanded')).toBe('true');
    // a second click must close it again — if the old keydown handler had
    // been left in place alongside the button's native click behavior,
    // a single real keypress would toggle it twice (net no-op), which
    // this two-click round trip would also have masked; this at least
    // confirms one click == one toggle
    goalsBar.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(goalsList.classList.contains('open')).toBe(false);
    expect(goalsBar.getAttribute('aria-expanded')).toBe('false');
  });
});
