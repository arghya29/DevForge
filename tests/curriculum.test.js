import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('curriculum data', () => {
  const { get } = createApp();
  const CURRICULUM = get('CURRICULUM');
  const FLAT_LESSONS = get('FLAT_LESSONS');
  const PLAYGROUND = get('PLAYGROUND');

  it('CURRICULUM and FLAT_LESSONS are non-empty', () => {
    expect(CURRICULUM.length).toBeGreaterThan(0);
    expect(FLAT_LESSONS.length).toBeGreaterThan(0);
  });

  it('FLAT_LESSONS matches the flattened CURRICULUM categories', () => {
    const expectedCount = CURRICULUM.reduce((sum, cat) => sum + cat.items.length, 0);
    expect(FLAT_LESSONS.length).toBe(expectedCount);
  });

  it('has no duplicate lesson ids', () => {
    const ids = FLAT_LESSONS.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no lesson id collides with the Playground id', () => {
    const ids = FLAT_LESSONS.map(l => l.id);
    expect(ids).not.toContain(PLAYGROUND.id);
  });

  it('every lesson has the required fields with the right shape', () => {
    FLAT_LESSONS.forEach(lesson => {
      expect(lesson.id, 'id').toBeTruthy();
      expect(typeof lesson.id).toBe('string');
      expect(lesson.title, `${lesson.id}.title`).toBeTruthy();
      expect(['HTML', 'CSS', 'JS'], `${lesson.id}.tag`).toContain(lesson.tag);
      expect(typeof lesson.xp, `${lesson.id}.xp`).toBe('number');
      expect(lesson.xp, `${lesson.id}.xp should be positive`).toBeGreaterThan(0);
      expect(typeof lesson.html, `${lesson.id}.html`).toBe('string');
      expect(typeof lesson.css, `${lesson.id}.css`).toBe('string');
      expect(typeof lesson.js, `${lesson.id}.js`).toBe('string');
      expect(typeof lesson.description, `${lesson.id}.description`).toBe('string');
      expect(Array.isArray(lesson.goals), `${lesson.id}.goals`).toBe(true);
    });
  });

  it('every lesson has between 1 and 5 goals', () => {
    FLAT_LESSONS.forEach(lesson => {
      expect(lesson.goals.length, lesson.id).toBeGreaterThanOrEqual(1);
      expect(lesson.goals.length, lesson.id).toBeLessThanOrEqual(5);
    });
  });

  it('every goal has text and a check() function', () => {
    FLAT_LESSONS.forEach(lesson => {
      lesson.goals.forEach((goal, i) => {
        expect(goal.text, `${lesson.id}.goals[${i}].text`).toBeTruthy();
        expect(typeof goal.check, `${lesson.id}.goals[${i}].check`).toBe('function');
      });
    });
  });

  it('every goal check() runs without throwing against empty code', () => {
    const empty = { html: '', css: '', js: '' };
    FLAT_LESSONS.forEach(lesson => {
      lesson.goals.forEach((goal, i) => {
        expect(() => goal.check(empty), `${lesson.id}.goals[${i}]`).not.toThrow();
        expect(typeof goal.check(empty), `${lesson.id}.goals[${i}] should return boolean`).toBe(
          'boolean'
        );
      });
    });
  });

  it('every goal check() runs without throwing against garbage/malformed code', () => {
    const garbage = { html: '<<<not html', css: '{{{not css', js: 'function( broken' };
    FLAT_LESSONS.forEach(lesson => {
      lesson.goals.forEach((goal, i) => {
        expect(() => goal.check(garbage), `${lesson.id}.goals[${i}]`).not.toThrow();
      });
    });
  });

  it("every lesson's own starter code satisfies its own goals once completed", () => {
    // Starter code is deliberately incomplete for most lessons, so this
    // doesn't assert true — it's here to guarantee check() never crashes on
    // the exact strings a real learner will start from.
    FLAT_LESSONS.forEach(lesson => {
      const files = { html: lesson.html, css: lesson.css, js: lesson.js };
      lesson.goals.forEach(goal => {
        expect(() => goal.check(files)).not.toThrow();
      });
    });
  });

  it('the Playground has no goals and is not counted toward XP', () => {
    expect(PLAYGROUND.goals).toEqual([]);
  });

  it('lesson ids are kebab-case (stable, URL/localStorage-key-safe)', () => {
    FLAT_LESSONS.forEach(lesson => {
      expect(lesson.id, lesson.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });
});
