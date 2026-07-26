import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './helpers/loadApp.js';

/**
 * Hints render differently from every other lesson field, and that asymmetry
 * is easy to trip over when writing a new lesson.
 *
 * `description`, `tip` and goal `text` are assigned through `innerHTML`, so
 * HTML entities in those fields are correct — `&lt;h1&gt;` displays as `<h1>`.
 * Hints go through `el('li', {}, [hint])`, which appends a text node
 * (js/dom-utils.js), and text nodes do not decode entities. A hint written the
 * same way as a description therefore shows the learner `&lt;h1&gt;` verbatim.
 *
 * These tests pin both halves of that: hints must contain literal characters,
 * and the fields that render as HTML must keep their escaping.
 */
describe('lesson hints render as text, not HTML', () => {
  let FLAT_LESSONS;

  beforeAll(() => {
    FLAT_LESSONS = createApp().get('FLAT_LESSONS');
  });

  const ENTITY = /&(?:lt|gt|amp|quot|apos|nbsp|#\d+|#x[0-9a-f]+);/i;

  it('no hint contains an escaped HTML entity', () => {
    const offenders = [];
    for (const lesson of FLAT_LESSONS) {
      (lesson.hints || []).forEach((hint, index) => {
        if (ENTITY.test(hint)) {
          offenders.push(`${lesson.id} hint[${index}]: ${hint}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it('hints that discuss tags use the literal characters', () => {
    // A spot check with teeth: these two lessons talk about tags constantly,
    // so if entities ever creep back they will land here first.
    for (const id of ['html-first-element', 'html-tables-captions']) {
      const lesson = FLAT_LESSONS.find(l => l.id === id);
      expect(lesson, id).toBeTruthy();
      const joined = (lesson.hints || []).join('\n');
      expect(joined).toMatch(/</);
      expect(joined).not.toMatch(ENTITY);
    }
  });

  it('every hint is a non-empty string', () => {
    for (const lesson of FLAT_LESSONS) {
      for (const hint of lesson.hints || []) {
        expect(typeof hint, lesson.id).toBe('string');
        expect(hint.trim().length, lesson.id).toBeGreaterThan(0);
      }
    }
  });

  it('goal text keeps its escaping, because goals render as HTML', () => {
    // The mirror image of the rule above. If someone "fixes" goal text the way
    // hints were fixed, the angle brackets would be parsed as markup and
    // silently vanish from the checklist.
    const goalText = FLAT_LESSONS.flatMap(l => (l.goals || []).map(g => g.text));
    const withRawAngle = goalText.filter(t => typeof t === 'string' && /<[a-z]/i.test(t));
    expect(withRawAngle).toEqual([]);
  });
});
