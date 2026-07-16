/* DevForge — editor.js
   The code editor itself: line numbers, the highlighted overlay, input /
   keyboard handling, tab switching, and per-lesson autosave. */
'use strict';

const codeInput = $('#codeInput');
const codeHighlight = $('#codeHighlight code');
const lineNumbersEl = $('#lineNumbers');

// Highlighting re-tokenizes the whole buffer. That's imperceptible at
// lesson-sized file lengths, but re-running it on every single keystroke
// starts to visibly lag once someone pastes a few hundred lines (e.g. in
// the Playground). Below the threshold we stay perfectly in sync with
// typing (no visible delay); above it we debounce so typing doesn't jank.
const HIGHLIGHT_DEBOUNCE_THRESHOLD = 4000; // characters
const HIGHLIGHT_DEBOUNCE_MS = 150;
let highlightTimer = null;

function updateHighlight(text) {
  codeHighlight.innerHTML = highlight(text, state.currentLang) + '\n';
}
function scheduleHighlight(text) {
  if (text.length < HIGHLIGHT_DEBOUNCE_THRESHOLD) {
    clearTimeout(highlightTimer);
    updateHighlight(text);
    return;
  }
  clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => updateHighlight(text), HIGHLIGHT_DEBOUNCE_MS);
}

function updateLineNumbers(text) {
  const n = text.split('\n').length;
  let s = '';
  for (let i = 1; i <= n; i++) s += i + '\n';
  lineNumbersEl.textContent = s;
}
function renderEditor() {
  const text = state.files[state.currentLang];
  codeInput.value = text;
  updateHighlight(text); // full lesson load — always render immediately, not a hot path
  updateLineNumbers(text);
  syncScroll();
}
function syncScroll() {
  $('#codeHighlight').scrollTop = codeInput.scrollTop;
  $('#codeHighlight').scrollLeft = codeInput.scrollLeft;
  lineNumbersEl.scrollTop = codeInput.scrollTop;
}
codeInput.addEventListener('scroll', syncScroll);
codeInput.addEventListener('input', () => {
  const text = codeInput.value;
  state.files[state.currentLang] = text;
  scheduleHighlight(text);
  updateLineNumbers(text);
  syncScroll();
  persistCurrentCode();
  markStarted();
  checkGoals();
  if (state.autoRun) scheduleAutoRun();
});
codeInput.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault();
    const s = codeInput.selectionStart,
      en = codeInput.selectionEnd;
    const v = codeInput.value;
    codeInput.value = v.slice(0, s) + '  ' + v.slice(en);
    codeInput.selectionStart = codeInput.selectionEnd = s + 2;
    codeInput.dispatchEvent(new Event('input'));
    return;
  }
  if (e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    const s = codeInput.selectionStart;
    const v = codeInput.value;
    const lineStart = v.lastIndexOf('\n', s - 1) + 1;
    const removable = v.slice(lineStart, s).match(/^ {1,2}/);
    if (removable) {
      codeInput.value = v.slice(0, lineStart) + v.slice(lineStart + removable[0].length);
      codeInput.selectionStart = codeInput.selectionEnd = s - removable[0].length;
      codeInput.dispatchEvent(new Event('input'));
    }
    return;
  }
  if (mod && e.key === 'Enter') {
    e.preventDefault();
    runCode();
    return;
  }
  if (mod && e.key.toLowerCase() === 's') {
    e.preventDefault();
    persistCurrentCode();
    toast('Saved');
    return;
  }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    resetCode();
    return;
  }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    copyCurrentCode();
    return;
  }
  if (mod && e.key === ']') {
    e.preventDefault();
    nextLesson();
    return;
  }
  if (mod && e.key === '[') {
    e.preventDefault();
    prevLesson();
    return;
  }
  if (mod && e.key === '1') {
    e.preventDefault();
    switchTab('html');
    return;
  }
  if (mod && e.key === '2') {
    e.preventDefault();
    switchTab('css');
    return;
  }
  if (mod && e.key === '3') {
    e.preventDefault();
    switchTab('js');
    return;
  }
});

function persistCurrentCode() {
  if (state.currentLessonId === PLAYGROUND.id) return; // playground not persisted as "code"
  const lesson = currentLessonDef();
  store.code[state.currentLessonId] = {
    html: state.files.html,
    css: state.files.css,
    js: state.files.js,
    version: (lesson && lesson.version) || 1
  };
  saveStore(store);
}
function markStarted() {
  if (state.currentLessonId === PLAYGROUND.id) return;
  if (!store.started.includes(state.currentLessonId)) {
    store.started.push(state.currentLessonId);
    saveStore(store);
    renderSidebar();
  }
}

/* language tabs */
function switchTab(lang) {
  $$('.lang-tab').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  state.currentLang = lang;
  renderEditor();
}
$$('.lang-tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.lang));
});

/* font size slider */
$('#fontSlider').addEventListener('input', e => {
  document.documentElement.style.setProperty('--editor-font-size', e.target.value + 'px');
});
