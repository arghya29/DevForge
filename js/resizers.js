/* DevForge — resizers.js
   Draggable dividers: editor/preview width, console height. */
'use strict';

function makeResizableV(handle, leftEl, rightEl) {
  let dragging = false;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const total = leftEl.parentElement.getBoundingClientRect().width;
    const leftRect = leftEl.parentElement.getBoundingClientRect();
    let leftWidth = e.clientX - leftRect.left;
    leftWidth = Math.max(220, Math.min(total - 220, leftWidth));
    leftEl.style.flex = '0 0 ' + leftWidth + 'px';
    rightEl.style.flex = '1 1 auto';
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}
makeResizableV($('#dividerV'), $('#editorCol'), $('.preview-col'));

// console panel resizable height via dividerH
(function () {
  const handle = $('#dividerH');
  const consolePanel = $('#consolePanel');
  let dragging = false,
    startY = 0,
    startH = 0;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    startY = e.clientY;
    startH = consolePanel.getBoundingClientRect().height;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    handle.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    let h = startH - (e.clientY - startY);
    h = Math.max(80, Math.min(500, h));
    consolePanel.style.height = h + 'px';
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    handle.classList.remove('dragging');
  });
})();
