import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './helpers/loadApp.js';

/**
 * Goals must not be satisfied by the starter code's own instructions.
 *
 * Starter code teaches by instruction: `html-first-element` ships with
 * `<!-- add an <h1> heading with your name -->`. A goal testing for
 * `/<h1[\s>]/` matched that comment, so the goal ticked itself on load —
 * on the first lesson a learner ever opens, two of four goals were already
 * green before any typing.
 *
 * The fix strips comments before every check. These tests pin both halves:
 * the goals that were self-satisfying now start unticked, and every other
 * goal still behaves exactly as it did.
 */
describe('goal checks ignore comments in starter code', () => {
  let FLAT_LESSONS;
  let stripCodeComments;

  beforeAll(() => {
    // createApp() opens a JSDOM window; close it once the data is extracted.
    const app = createApp();
    try {
      FLAT_LESSONS = app.get('FLAT_LESSONS');
      stripCodeComments = app.get('stripCodeComments');
    } finally {
      app.cleanup();
    }
  });

  /** Runs a lesson's goals the way renderGoals does. */
  const evaluate = lesson => {
    const files = { html: lesson.html || '', css: lesson.css || '', js: lesson.js || '' };
    const stripped = stripCodeComments(files);
    return (lesson.goals || []).map(g => ({
      text: g.text,
      done: !!g.check(g.checksComments ? files : stripped)
    }));
  };

  it('exposes the stripping helper', () => {
    expect(typeof stripCodeComments).toBe('function');
  });

  it('stripping changes the verdict for exactly the goals it should', () => {
    // The fix is only load-bearing if removing comments actually flips these
    // goals. Pinning the exact set also documents the blast radius: three
    // goals across two lessons, and nothing else.
    const flipped = [];
    for (const lesson of FLAT_LESSONS) {
      const files = { html: lesson.html || '', css: lesson.css || '', js: lesson.js || '' };
      const stripped = stripCodeComments(files);
      for (const g of lesson.goals || []) {
        if (g.checksComments) continue;
        const run = input => {
          try {
            return !!g.check(input);
          } catch {
            return false;
          }
        };
        if (run(files) !== run(stripped)) flipped.push(`${lesson.id} :: ${g.text}`);
      }
    }
    expect(flipped.sort()).toEqual(
      [
        'html-first-element :: Contains an &lt;h1&gt; heading',
        'html-first-element :: Contains at least 2 &lt;p&gt; paragraphs',
        'js-fetch-async :: Uses await'
      ].sort()
    );
  });

  it('the two goals on the first lesson now start unticked', () => {
    // This is the lesson a learner opens first, so it is the one that matters
    // most. Before the fix, "Contains an <h1>" and "Contains at least 2 <p>"
    // were both green on load.
    const lesson = FLAT_LESSONS.find(l => l.id === 'html-first-element');
    expect(lesson).toBeTruthy();
    const results = evaluate(lesson);
    const h1 = results.find(r => /h1/i.test(r.text));
    const paragraphs = results.find(r => /2 .*p.* paragraph/i.test(r.text));
    expect(h1?.done, 'h1 goal should not be pre-satisfied').toBe(false);
    expect(paragraphs?.done, 'paragraph goal should not be pre-satisfied').toBe(false);
  });

  it('the await goal on js-fetch-async now starts unticked', () => {
    const lesson = FLAT_LESSONS.find(l => l.id === 'js-fetch-async');
    expect(lesson).toBeTruthy();
    const awaitGoal = evaluate(lesson).find(r => /await/i.test(r.text));
    expect(awaitGoal?.done).toBe(false);
  });

  it('goals still pass once the learner writes real code', () => {
    // The counterpart to the tests above: stripping must not make goals
    // impossible, only make them honest.
    const lesson = FLAT_LESSONS.find(l => l.id === 'html-first-element');
    const solved = {
      html: '<html><head><title>Me</title></head><body><h1>Ada</h1><p>One</p><p>Two</p></body></html>',
      css: '',
      js: ''
    };
    const stripped = stripCodeComments(solved);
    for (const g of lesson.goals) {
      expect(!!g.check(stripped), g.text).toBe(true);
    }
  });

  it('does not reduce the number of goals passing on any lesson', () => {
    // A blunt regression guard: stripping comments must never turn a
    // genuinely-passing goal into a failing one.
    for (const lesson of FLAT_LESSONS) {
      const files = { html: lesson.html || '', css: lesson.css || '', js: lesson.js || '' };
      const stripped = stripCodeComments(files);
      for (const g of lesson.goals || []) {
        if (g.checksComments) continue;
        let before = false;
        try {
          before = !!g.check(files);
        } catch {
          before = false;
        }
        if (!before) continue;
        // Anything passing before must either still pass, or be one of the
        // known comment-satisfied goals this change deliberately fixes.
        const after = !!g.check(stripped);
        const known =
          (lesson.id === 'html-first-element' && /h1|paragraph/i.test(g.text)) ||
          (lesson.id === 'js-fetch-async' && /await/i.test(g.text));
        expect(after || known, `${lesson.id} :: ${g.text}`).toBe(true);
      }
    }
  });
});

describe('stripCodeComments', () => {
  let stripCodeComments;

  beforeAll(() => {
    const app = createApp();
    try {
      stripCodeComments = app.get('stripCodeComments');
    } finally {
      app.cleanup();
    }
  });

  const strip = files => stripCodeComments({ html: '', css: '', js: '', ...files });

  it('removes HTML comments', () => {
    expect(strip({ html: '<p>a</p><!-- add an <h1> here -->' }).html).toBe('<p>a</p>');
  });

  it('removes multi-line HTML comments', () => {
    expect(strip({ html: '<div></div><!--\n  <h1>\n-->' }).html).toBe('<div></div>');
  });

  it('removes CSS block comments', () => {
    expect(strip({ css: 'a{}/* @media screen */' }).css).toBe('a{}');
  });

  it('removes JavaScript line and block comments', () => {
    expect(strip({ js: 'const a=1; // await this\n' }).js).toBe('const a=1; \n');
    expect(strip({ js: '/* await */const b=2;' }).js).toBe('const b=2;');
  });

  it('removes a line comment that contains a URL', () => {
    // The js-fetch-async starter has exactly this shape.
    const out = strip({ js: "  // fetch 'https://example.com/users/1', await it\n" }).js;
    expect(out.trim()).toBe('');
  });

  it('leaves a URL inside a string alone', () => {
    // The "//" in "https://" must not be mistaken for a comment.
    const source = 'const url = "https://example.com/a";';
    expect(strip({ js: source }).js).toBe(source);
  });

  it('leaves real code untouched', () => {
    const source = 'async function f(){ await fetch(url); }';
    expect(strip({ js: source }).js).toBe(source);
  });

  it('tolerates missing fields', () => {
    expect(stripCodeComments({})).toEqual({ html: '', css: '', js: '' });
  });
});
