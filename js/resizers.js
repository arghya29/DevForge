/* DevForge — resizers.js
   Draggable, keyboard-operable dividers: editor/preview width, console
   height. Both dividers share one implementation — they only differ in
   which CSS property they resize and which direction the mouse moves in. */
'use strict';

/**
 * @param {object} opts
 * @param {HTMLElement} opts.handle     the divider element itself
 * @param {'vertical'|'horizontal'} opts.orientation
 *        'vertical'   = a left/right divider, dragged horizontally, resizes a WIDTH
 *        'horizontal' = a top/bottom divider, dragged vertically, resizes a HEIGHT
 * @param {number} opts.min             minimum size in px
 * @param {(dragStartRect: DOMRect) => number} opts.getMax
 *        computed once per drag (and once for keyboard use), so it can
 *        depend on the current window size without re-measuring on every
 *        single mousemove
 * @param {() => number} opts.getSize   current size in px
 * @param {(px: number) => void} opts.setSize
 * @param {number} [opts.step]         px per arrow-key press (default 20)
 */
function makeResizer({ handle, orientation, min, getMax, getSize, setSize, step = 20 }) {
  const isVertical = orientation === 'vertical';

  handle.setAttribute('role', 'separator');
  handle.setAttribute('tabindex', '0');
  handle.setAttribute('aria-orientation', orientation);
  handle.setAttribute('aria-valuemin', String(min));

  function reportValue(max) {
    handle.setAttribute('aria-valuenow', String(Math.round(getSize())));
    if (max !== undefined) handle.setAttribute('aria-valuemax', String(Math.round(max)));
  }
  reportValue(getMax(handle.getBoundingClientRect()));

  let dragging = false;
  let startPos = 0;
  let startSize = 0;
  let max = Infinity;

  function clamp(v) {
    return Math.max(min, Math.min(max, v));
  }

  function beginDrag(e) {
    dragging = true;
    startPos = isVertical ? e.clientX : e.clientY;
    startSize = getSize();
    max = getMax(handle.getBoundingClientRect()); // measured once per drag, not on every mousemove
    handle.classList.add('dragging');
    document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    const pos = isVertical ? e.clientX : e.clientY;
    const delta = pos - startPos;
    // a vertical divider grows its left pane as the mouse moves right;
    // a horizontal one grows its bottom pane as the mouse moves up
    const proposed = isVertical ? startSize + delta : startSize - delta;
    setSize(clamp(proposed));
    reportValue();
  }
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  handle.addEventListener('mousedown', beginDrag);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', endDrag);

  handle.addEventListener('keydown', e => {
    const growKey = isVertical ? 'ArrowRight' : 'ArrowUp';
    const shrinkKey = isVertical ? 'ArrowLeft' : 'ArrowDown';
    const currentMax = getMax(handle.getBoundingClientRect());
    max = currentMax;
    if (e.key === growKey) {
      e.preventDefault();
      setSize(clamp(getSize() + step));
      reportValue(currentMax);
    } else if (e.key === shrinkKey) {
      e.preventDefault();
      setSize(clamp(getSize() - step));
      reportValue(currentMax);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSize(min);
      reportValue(currentMax);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSize(currentMax);
      reportValue(currentMax);
    }
  });
}

const editorCol = $('#editorCol');
const previewCol = $('.preview-col');
makeResizer({
  handle: $('#dividerV'),
  orientation: 'vertical',
  min: 220,
  getMax: () => editorCol.parentElement.getBoundingClientRect().width - 220,
  getSize: () => editorCol.getBoundingClientRect().width,
  setSize: px => {
    editorCol.style.flex = '0 0 ' + px + 'px';
    previewCol.style.flex = '1 1 auto';
  }
});

const consolePanel = $('#consolePanel');
makeResizer({
  handle: $('#dividerH'),
  orientation: 'horizontal',
  min: 80,
  getMax: () => 500,
  getSize: () => consolePanel.getBoundingClientRect().height,
  setSize: px => {
    consolePanel.style.height = px + 'px';
  }
});
