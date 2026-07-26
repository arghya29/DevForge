import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createApp } from './helpers/loadApp.js';

describe('accessibility', () => {
  it('opening a modal moves focus inside it', () => {
    const { get, document } = createApp();
    get('init()');
    get("openModal('helpModal')");
    expect(document.getElementById('helpModal')).toContainElement(document.activeElement);
  });

  it('closing a modal returns focus to whatever triggered it', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    const trigger = document.getElementById('btnHelp');
    
    await user.click(trigger);
    await user.click(document.getElementById('closeHelp'));
    
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab wraps from the last focusable element back to the first while a modal is open', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    get("openModal('helpModal')");
    const focusable = get('getFocusable(document.getElementById("helpModal"))');
    const last = focusable[focusable.length - 1];
    
    last.focus();
    await user.tab();
    
    expect(document.activeElement).toBe(focusable[0]);
  });

  it('Escape closes whatever modal is open', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    get("openModal('achievementsModal')");
    expect(document.getElementById('achievementsModal')).toHaveClass('open');
    
    await user.keyboard('{Escape}');
    
    expect(document.getElementById('achievementsModal')).not.toHaveClass('open');
  });

  it('toast() announces its message through the ARIA live region', () => {
    const { get, document } = createApp();
    get("toast('Something happened')");
    expect(document.getElementById('ariaLiveRegion')).toHaveTextContent('Something happened');
  });

  it('every interactive control in the app can actually receive keyboard focus', () => {
    const { get, document } = createApp();
    get('init()');
    const candidates = Array.from(
      document.querySelectorAll(
        'button, a[href], input, select, textarea, [role="button"], [tabindex]'
      )
    ).filter(elToCheck => !elToCheck.disabled && elToCheck.style.display !== 'none');

    expect(candidates.length).toBeGreaterThan(10);

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

  it('sidebar lesson items are keyboard-activatable (Enter loads the lesson)', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    const items = document.querySelectorAll('.lesson-item');
    expect(items[1]).toHaveAttribute('tabindex', '0');
    
    items[1].focus();
    await user.keyboard('{Enter}');
    
    expect(document.getElementById('lessonPanelTitle')).toHaveTextContent(
      get('FLAT_LESSONS[0].title')
    );
  });

  it('category headers are keyboard-collapsible (Space toggles collapsed state)', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    const header = document.querySelector('.category-header');
    expect(header).toHaveAttribute('role', 'button');
    
    header.focus();
    await user.keyboard(' ');
    
    expect(header.parentElement).toHaveClass('collapsed');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('the lesson panel header and goals bar are real <button> elements, not ARIA-only reimplementations', () => {
    const { document } = createApp();
    expect(document.getElementById('lessonPanelHeader')).toHavetagName('BUTTON');
    expect(document.getElementById('goalsBar')).toHavetagName('BUTTON');
  });

  it('clicking the lesson panel header toggles the lesson panel collapsed state', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    const panel = document.getElementById('lessonPanel');
    const header = document.getElementById('lessonPanelHeader');
    
    expect(panel).not.toHaveClass('collapsed');
    
    await user.click(header);
    expect(panel).toHaveClass('collapsed');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(header);
    expect(panel).not.toHaveClass('collapsed');
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking the goals bar toggles the goals list open/closed exactly once per click (no duplicate listeners)', async () => {
    const user = userEvent.setup();
    const { get, document } = createApp();
    get('init()');
    const lesson = get('FLAT_LESSONS[0]');
    get(`loadLesson('${lesson.id}')`);
    const goalsBar = document.getElementById('goalsBar');
    const goalsList = document.getElementById('goalsList');
    
    expect(goalsList).not.toHaveClass('open');
    
    await user.click(goalsBar);
    expect(goalsList).toHaveClass('open');
    expect(goalsBar).toHaveAttribute('aria-expanded', 'true');
    
    await user.click(goalsBar);
    expect(goalsList).not.toHaveClass('open');
    expect(goalsBar).toHaveAttribute('aria-expanded', 'false');
  });
});
