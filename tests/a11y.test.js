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
});
