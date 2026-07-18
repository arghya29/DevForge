/* DevForge — lessons.js
   Lesson panel rendering, goal checking, prev/next navigation, loading a
   lesson into the editor, and rendering the curriculum sidebar. */
'use strict';

function currentLessonDef() {
  if (state.currentLessonId === PLAYGROUND.id) return PLAYGROUND;
  return FLAT_LESSONS.find(l => l.id === state.currentLessonId) || PLAYGROUND;
}

function renderLessonPanel() {
  const lesson = currentLessonDef();
  $('#lessonPanelTitle').textContent = lesson === PLAYGROUND ? 'Playground' : lesson.title;
  $('#lessonBody').innerHTML = lesson.description;
  // tip box
  const existingTip = $('.tip-box', $('#lessonBody'));
  if (existingTip) existingTip.remove();
  if (lesson.tip) {
    const tip = el('div', { class: 'tip-box' });
    tip.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg><span>' +
      lesson.tip +
      '</span>';
    $('#lessonBody').appendChild(tip);
  }
  // goals
  const goalsBar = $('#goalsBar'),
    goalsList = $('#goalsList');
  if (lesson.goals && lesson.goals.length) {
    goalsBar.style.display = '';
    renderGoals();
  } else {
    goalsBar.style.display = 'none';
    goalsList.classList.remove('open');
    goalsList.innerHTML = '';
  }
  renderHints();
  updateCounters();
}

function renderHints() {
  const lesson = currentLessonDef();
  const section = $('#hintsSection');
  const list = $('#hintsList');
  const btn = $('#hintBtn');
  const label = $('#hintBtnLabel');
  list.innerHTML = '';

  if (!lesson.hints || !lesson.hints.length) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  const revealed = state.hintsRevealed[lesson.id] || 0;
  for (let i = 0; i < revealed; i++) {
    list.appendChild(el('li', {}, [lesson.hints[i]]));
  }

  if (revealed >= lesson.hints.length) {
    btn.disabled = true;
    label.textContent = 'No more hints';
  } else {
    btn.disabled = false;
    label.textContent =
      revealed === 0
        ? 'Show a hint'
        : 'Show another hint (' + (revealed + 1) + '/' + lesson.hints.length + ')';
  }
}

$('#hintBtn').addEventListener('click', () => {
  const lesson = currentLessonDef();
  if (!lesson.hints || !lesson.hints.length) return;
  const revealed = state.hintsRevealed[lesson.id] || 0;
  if (revealed < lesson.hints.length) {
    state.hintsRevealed[lesson.id] = revealed + 1;
    renderHints();
  }
});

function checkGoals() {
  const lesson = currentLessonDef();
  if (!lesson.goals || !lesson.goals.length) return;
  renderGoals();
}
function renderGoals() {
  const lesson = currentLessonDef();
  const list = $('#goalsList');
  list.innerHTML = '';
  let doneCount = 0;
  lesson.goals.forEach(g => {
    const done = g.check(state.files);
    if (done) doneCount++;
    const row = el('li', { class: 'goal-row' + (done ? ' done' : '') });
    row.innerHTML =
      '<span class="goal-check">' +
      (done
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : '') +
      '</span><span>' +
      g.text +
      '</span>';
    list.appendChild(row);
  });
  $('#goalsCount').textContent = doneCount + ' / ' + lesson.goals.length;

  if (
    doneCount === lesson.goals.length &&
    lesson.id !== PLAYGROUND.id &&
    !store.completed.includes(lesson.id)
  ) {
    store.completed.push(lesson.id);
    const todayStr = localDateString();
    if (!store.completionDates.includes(todayStr)) store.completionDates.push(todayStr);
    saveStore(store);
    refreshXP();
    renderSidebar();
    toast('✓ Lesson complete — +' + lesson.xp + ' XP');
  }
}
function toggleGoals() {
  state.goalsOpen = !state.goalsOpen;
  $('#goalsList').classList.toggle('open', state.goalsOpen);
  $('#goalsBar').setAttribute('aria-expanded', String(state.goalsOpen));
}
function toggleLessonPanel() {
  state.lessonPanelOpen = !state.lessonPanelOpen;
  $('#lessonPanel').classList.toggle('collapsed', !state.lessonPanelOpen);
  $('#lessonPanelHeader').setAttribute('aria-expanded', String(state.lessonPanelOpen));
}
function activateOnEnterOrSpace(handler) {
  return e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}
$('#goalsBar').addEventListener('click', toggleGoals);
$('#lessonPanelHeader').addEventListener('click', toggleLessonPanel);

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

function renderSidebar() {
  const root = $('#curriculum');
  root.innerHTML = '';

  const query = $('#lessonSearch').value.trim().toLowerCase();

  // playground pinned item
  if (!query) {
    const pg = el('div', { class: 'playground-item' });
    const item = el('div', {
      class: 'lesson-item' + (state.currentLessonId === PLAYGROUND.id ? ' active' : ''),
      role: 'button',
      tabindex: '0'
    });
    item.innerHTML =
      '<span class="status-dot"></span><div class="lesson-item-text"><div class="lesson-item-title">🧪 Playground</div><div class="lesson-item-meta">Free play · no grading</div></div>';
    item.addEventListener('click', () => loadLesson(PLAYGROUND.id));
    item.addEventListener(
      'keydown',
      activateOnEnterOrSpace(() => loadLesson(PLAYGROUND.id))
    );
    pg.appendChild(item);
    root.appendChild(pg);
  }

  let anyResults = false;
  CURRICULUM.forEach(cat => {
    const filteredItems = cat.items.filter(l => !query || l.title.toLowerCase().includes(query));
    if (query && !filteredItems.length) return;
    anyResults = true;

    const catEl = el('div', { class: 'category' });
    const header = el('div', {
      class: 'category-header',
      role: 'button',
      tabindex: '0',
      'aria-expanded': 'true'
    });
    header.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg><span>' +
      escapeHtml(cat.category) +
      '</span>';
    const toggleCategory = () => {
      const collapsed = catEl.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', String(!collapsed));
    };
    header.addEventListener('click', toggleCategory);
    header.addEventListener('keydown', activateOnEnterOrSpace(toggleCategory));
    catEl.appendChild(header);

    const itemsWrap = el('div', { class: 'category-items' });
    filteredItems.forEach(lesson => {
      const isActive = state.currentLessonId === lesson.id;
      const isDone = store.completed.includes(lesson.id);
      const isStarted = store.started.includes(lesson.id);
      const dotClass = isDone ? 'complete' : isStarted ? 'started' : '';
      const tagClass = 'tag-' + lesson.tag.toLowerCase();
      const item = el('div', {
        class: 'lesson-item' + (isActive ? ' active' : ''),
        role: 'button',
        tabindex: '0'
      });
      item.innerHTML =
        '<span class="status-dot ' +
        dotClass +
        '"></span>' +
        '<div class="lesson-item-text">' +
        '<div class="lesson-item-title">' +
        escapeHtml(lesson.title) +
        '</div>' +
        '<div class="lesson-item-meta"><span class="' +
        tagClass +
        '">' +
        escapeHtml(lesson.tag) +
        '</span> · ' +
        lesson.xp +
        'xp</div>' +
        '</div>';
      item.addEventListener('click', () => loadLesson(lesson.id));
      item.addEventListener(
        'keydown',
        activateOnEnterOrSpace(() => loadLesson(lesson.id))
      );
      itemsWrap.appendChild(item);
    });
    catEl.appendChild(itemsWrap);
    root.appendChild(catEl);
  });

  if (query && !anyResults) {
    root.appendChild(
      el('div', { class: 'no-results', html: 'No lessons match "' + escapeHtml(query) + '"' })
    );
  }
}
$('#lessonSearch').addEventListener('input', renderSidebar);
