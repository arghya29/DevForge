/* DevForge — lesson-panel.js
   Rendering the lesson panel: description, tip, progressive hints, and the goal
   list, plus the collapse toggles for the panel and the goals bar. */
'use strict';

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
$('#goalsBar').addEventListener('click', toggleGoals);
$('#lessonPanelHeader').addEventListener('click', toggleLessonPanel);
