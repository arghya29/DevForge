/* DevForge — analytics.js
   Learner analytics calculation, 7-day consistency tracker rendering,
   per-lesson stats table, and analytics reset functionality. */
'use strict';

/* learner analytics */
function fmtTime(sec) {
  sec = sec || 0;
  const m = Math.floor(sec / 60),
    s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function renderAnalytics() {
  const row = $('#consistencyRow');
  row.innerHTML = '';
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayStr = localDateString();
  let activeDays = 0;
  const completedDates = new Set(store.completionDates || []);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = localDateString(d);
    const isToday = dateStr === todayStr;
    const isActive = completedDates.has(dateStr);
    if (isActive) activeDays++;
    const cell = el('div', { class: 'consistency-day' });
    cell.innerHTML =
      '<div class="consistency-circle' +
      (isActive ? ' active' : '') +
      '" style="' +
      (isToday && !isActive ? 'border-color:var(--accent);color:var(--accent-text);' : '') +
      '">' +
      dayLetters[d.getDay()] +
      '</div>' +
      '<div class="consistency-date">' +
      d.getDate() +
      '</div>';
    row.appendChild(cell);
  }
  $('#consistencyCaption').textContent =
    'Completed lessons on ' + activeDays + ' of the last 7 days.';

  const body = $('#statsBody');
  body.innerHTML = '';
  FLAT_LESSONS.forEach(l => {
    const time = (store.lessonTime && store.lessonTime[l.id]) || 0;
    const retries = (store.lessonRetries && store.lessonRetries[l.id]) || 0;
    const tr = el('tr');
    tr.innerHTML =
      '<td>' + escapeHtml(l.title) + '</td><td>' + fmtTime(time) + '</td><td>' + retries + '</td>';
    body.appendChild(tr);
  });
}

$('#btnAnalytics').addEventListener('click', () => {
  flushTimer();
  renderAnalytics();
  openModal('analyticsModal');
});

$('#resetAnalyticsBtn').addEventListener('click', () => {
  if (
    !confirm(
      'Reset all analytics (time spent, retries, consistency history)? Your XP and completed lessons stay intact.'
    )
  )
    return;
  store.lessonTime = {};
  store.lessonRetries = {};
  store.completionDates = [];
  const saved = saveStore(store);
  renderAnalytics();
  if (saved) toast('Analytics reset');
});
