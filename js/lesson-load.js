/* DevForge — lesson-load.js
   Resolving the current lesson, prev/next navigation, the lesson counters, and
   loading a lesson's saved or starter code into the editor. */
'use strict';

function currentLessonDef() {
  if (state.currentLessonId === PLAYGROUND.id) return PLAYGROUND;
  return FLAT_LESSONS.find(l => l.id === state.currentLessonId) || PLAYGROUND;
}

function updateCounters() {
  let idx = 0,
    total = FLAT_LESSONS.length;
  if (state.currentLessonId !== PLAYGROUND.id) {
    idx = FLAT_LESSONS.findIndex(l => l.id === state.currentLessonId) + 1;
  }
  const text = state.currentLessonId === PLAYGROUND.id ? '0/0' : idx + '/' + total;
  $('#lessonCounter').textContent = text;
  $('#bottomCounter').textContent = text.replace('/', ' / ');
  $('#prevBtn').disabled = state.currentLessonId === PLAYGROUND.id || idx <= 1;
  $('#nextBtn').disabled = state.currentLessonId === PLAYGROUND.id || idx >= total;
}
function prevLesson() {
  const idx = FLAT_LESSONS.findIndex(l => l.id === state.currentLessonId);
  if (idx > 0) loadLesson(FLAT_LESSONS[idx - 1].id);
}
function nextLesson() {
  const idx = FLAT_LESSONS.findIndex(l => l.id === state.currentLessonId);
  if (idx >= 0 && idx < FLAT_LESSONS.length - 1) loadLesson(FLAT_LESSONS[idx + 1].id);
  else if (state.currentLessonId === PLAYGROUND.id && FLAT_LESSONS.length)
    loadLesson(FLAT_LESSONS[0].id);
}
$('#prevBtn').addEventListener('click', prevLesson);
$('#nextBtn').addEventListener('click', nextLesson);

function copyCurrentCode() {
  const text = state.files[state.currentLang];
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast('Copied ' + state.currentLang.toUpperCase() + ' code');
    })
    .catch(() => toast('Could not access clipboard'));
}
function loadLesson(id) {
  const lesson = id === PLAYGROUND.id ? PLAYGROUND : FLAT_LESSONS.find(l => l.id === id);
  if (!lesson) return;
  startTimer(lesson.id);
  state.currentLessonId = lesson.id;

  if (lesson === PLAYGROUND) {
    state.files = { html: PLAYGROUND.html, css: PLAYGROUND.css, js: PLAYGROUND.js };
  } else {
    const saved = store.code[lesson.id];
    const currentVersion = lesson.version || 1;
    if (saved) {
      state.files = { html: saved.html, css: saved.css, js: saved.js };
      if ((saved.version || 1) !== currentVersion) {
        toast(
          'This lesson was updated since you last worked on it — your saved code may be out of date.'
        );
      }
    } else {
      state.files = { html: lesson.html, css: lesson.css, js: lesson.js };
    }
  }

  switchTab('html');
  renderLessonPanel();
  renderSidebar();
  runCode();
}
