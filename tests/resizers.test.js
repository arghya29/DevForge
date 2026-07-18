import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('resizers.js', () => {
  it('both dividers are exposed as ARIA separators with a value range', () => {
    const { get, document } = createApp();
    get('init()');
    ['dividerV', 'dividerH'].forEach(id => {
      const handle = document.getElementById(id);
      expect(handle.getAttribute('role')).toBe('separator');
      expect(handle.getAttribute('tabindex')).toBe('0');
      expect(handle.hasAttribute('aria-valuemin')).toBe(true);
      expect(handle.hasAttribute('aria-valuenow')).toBe(true);
    });
  });

  // jsdom has no real layout engine — getBoundingClientRect() always
  // reports 0, so testing "grow/shrink from the real current size" via the
  // live console panel isn't meaningful here. Instead we drive
  // makeResizer() directly against an in-memory fake size, which tests the
  // actual keyboard math precisely (and faster/more deterministically than
  // trying to coax real measurements out of jsdom).
  function withFakeResizer(get, document, opts) {
    return get(`(function(){
      const handle = document.createElement('div');
      document.body.appendChild(handle);
      let size = ${opts.start};
      makeResizer({
        handle,
        orientation: '${opts.orientation}',
        min: ${opts.min},
        getMax: () => ${opts.max},
        getSize: () => size,
        setSize: px => { size = px; }
      });
      return handle;
    })()`);
  }

  it('ArrowUp grows a horizontal (height-resizing) divider, ArrowDown shrinks it', () => {
    const { get, document, window } = createApp();
    get('init()');
    const handle = withFakeResizer(get, document, {
      orientation: 'horizontal',
      min: 80,
      max: 500,
      start: 200
    });
    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(220); // 200 + step(20)

    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    );
    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(180); // 220 - 20 - 20
  });

  it('ArrowRight grows a vertical (width-resizing) divider, ArrowLeft shrinks it', () => {
    const { get, document, window } = createApp();
    get('init()');
    const handle = withFakeResizer(get, document, {
      orientation: 'vertical',
      min: 220,
      max: 900,
      start: 400
    });
    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(420);

    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(400);
  });

  it('arrow keys clamp to min/max instead of going out of range', () => {
    const { get, document, window } = createApp();
    get('init()');
    const handle = withFakeResizer(get, document, {
      orientation: 'horizontal',
      min: 80,
      max: 500,
      start: 90
    });
    // three ArrowDown presses of 20 each would go to 30, well under min 80
    for (let i = 0; i < 3; i++) {
      handle.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      );
    }
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(80);
  });

  it('Home and End jump straight to min/max', () => {
    const { get, document, window } = createApp();
    get('init()');
    const handle = withFakeResizer(get, document, {
      orientation: 'horizontal',
      min: 80,
      max: 500,
      start: 300
    });
    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(80);

    handle.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    );
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(500);
  });

  it('never reports aria-valuemax below aria-valuemin, even when the computed max would be smaller (e.g. a very narrow container)', () => {
    const { get, document } = createApp();
    get('init()');
    // a container narrower than min would make a naive `containerWidth - X`
    // calculation return something less than min
    const handle = withFakeResizer(get, document, {
      orientation: 'vertical',
      min: 220,
      max: 180, // deliberately less than min
      start: 200
    });
    expect(Number(handle.getAttribute('aria-valuemax'))).toBeGreaterThanOrEqual(
      Number(handle.getAttribute('aria-valuemin'))
    );
    expect(Number(handle.getAttribute('aria-valuemax'))).toBe(220); // normalized up to min
  });
});
