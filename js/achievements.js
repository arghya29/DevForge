/* DevForge — achievements.js
   Achievements definition data, unlock criteria evaluation,
   and achievements modal rendering. */
'use strict';

/* achievements */
const ACHIEVEMENTS = [
  {
    id: 'first-steps',
    title: 'First Steps',
    desc: 'Complete your first lesson',
    check: () => store.completed.length >= 1
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    desc: 'Complete 5 lessons',
    check: () => store.completed.length >= 5
  },
  {
    id: 'halfway-there',
    title: 'Halfway There',
    desc: 'Complete 10 lessons',
    check: () => store.completed.length >= 10
  },
  {
    id: 'devforge-master',
    title: 'DevForge Master',
    desc: 'Complete all lessons in the curriculum',
    check: () => store.completed.length >= FLAT_LESSONS.length
  },
  {
    id: 'first-run',
    title: 'First Run',
    desc: 'Run your code for the first time',
    check: () => !!store.hasRun
  },
  { id: 'xp-hunter', title: 'XP Hunter', desc: 'Earn 100 XP', check: () => totalXP() >= 100 },
  { id: 'xp-master', title: 'XP Master', desc: 'Earn 500 XP', check: () => totalXP() >= 500 },
  {
    id: 'on-fire',
    title: 'On Fire',
    desc: 'Achieve a 3-day streak',
    check: () => (store.streak || 0) >= 3
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    desc: 'Achieve a 7-day streak',
    check: () => (store.streak || 0) >= 7
  },
  {
    id: 'legendary',
    title: 'Legendary',
    desc: 'Achieve a 30-day streak',
    check: () => (store.streak || 0) >= 30
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    desc: 'Complete a lesson with zero retries',
    check: () => store.completed.some(id => !(store.lessonRetries && store.lessonRetries[id]))
  },
  {
    id: 'snippet-saver',
    title: 'Snippet Saver',
    desc: 'Save your first code snippet',
    check: () => (store.snippets || []).length >= 1
  }
];

function renderAchievements() {
  const grid = $('#badgesGrid');
  grid.innerHTML = '';
  let unlocked = 0;
  ACHIEVEMENTS.forEach(a => {
    const isUnlocked = a.check();
    if (isUnlocked) unlocked++;
    const card = el('div', { class: 'badge-card' + (isUnlocked ? ' unlocked' : '') });
    const icon = isUnlocked
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    card.innerHTML =
      '<div class="badge-icon">' +
      icon +
      '</div>' +
      '<div><div class="badge-title">' +
      escapeHtml(a.title) +
      '</div><div class="badge-desc">' +
      escapeHtml(a.desc) +
      '</div></div>';
    grid.appendChild(card);
  });
  $('#achievementsCount').textContent = 'Unlocked ' + unlocked + ' / ' + ACHIEVEMENTS.length;
}

$('#btnAchievements').addEventListener('click', () => {
  renderAchievements();
  openModal('achievementsModal');
});
