/* DevForge — modals.js
   Workspace layout presets, theme toggle, and the four utility modals:
   keyboard shortcuts, learner analytics, code snippets, achievements —
   plus the sidebar toggle and global keyboard shortcuts. */
'use strict';

/* workspace layout dropdown */
function applyLayout(name) {
  const editorCol = $('#editorCol'),
    previewCol = $('.preview-col'),
    sidebar = $('#sidebar'),
    lessonPanel = $('#lessonPanel');
  editorCol.style.flex = '';
  previewCol.style.flex = '';
  if (name === 'default') {
    editorCol.style.flex = '1 1 50%';
    previewCol.style.flex = '1 1 50%';
    sidebar.classList.remove('collapsed');
    lessonPanel.classList.remove('collapsed');
  } else if (name === 'wide-editor') {
    editorCol.style.flex = '1 1 70%';
    previewCol.style.flex = '1 1 30%';
    sidebar.classList.remove('collapsed');
    lessonPanel.classList.remove('collapsed');
  } else if (name === 'wide-preview') {
    editorCol.style.flex = '1 1 30%';
    previewCol.style.flex = '1 1 70%';
    sidebar.classList.remove('collapsed');
    lessonPanel.classList.remove('collapsed');
  } else if (name === 'minimal') {
    editorCol.style.flex = '1 1 50%';
    previewCol.style.flex = '1 1 50%';
    sidebar.classList.add('collapsed');
    lessonPanel.classList.add('collapsed');
  }
  state.layout = name;
  $$('.layout-option').forEach(o => o.classList.toggle('active', o.dataset.layout === name));
  toast('Layout: ' + name.replace('-', ' '));
}
$('#btnLayout').addEventListener('click', e => {
  e.stopPropagation();
  $('#layoutMenu').classList.toggle('open');
});
$$('.layout-option').forEach(opt => {
  opt.addEventListener('click', () => {
    applyLayout(opt.dataset.layout);
    $('#layoutMenu').classList.remove('open');
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.layout-dropdown-wrap')) $('#layoutMenu').classList.remove('open');
});

/* theme toggle */
$('#btnTheme').addEventListener('click', () => {
  const html = document.documentElement;
  const isLight = html.getAttribute('data-theme') === 'light';
  if (isLight) html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', 'light');
  $('#btnTheme').classList.toggle('active', !isLight);
});

/* modal open/close helpers, with focus trapping for keyboard/screen-reader users */
let modalLastFocused = null;

function getFocusable(container) {
  return $$(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    container
  ).filter(elToCheck => !elToCheck.disabled);
}

function openModal(id) {
  modalLastFocused = document.activeElement;
  const backdrop = $('#' + id);
  backdrop.classList.add('open');
  const focusable = getFocusable(backdrop);
  if (focusable.length) focusable[0].focus();
}

function closeModal(id) {
  $('#' + id).classList.remove('open');
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
}

function closeAllModals() {
  $$('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
  $('#layoutMenu').classList.remove('open');
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
}

/* trap Tab/Shift+Tab inside whichever modal is currently open */
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const openBackdrop = $('.modal-backdrop.open:not(.palette-backdrop)');
  if (!openBackdrop) return;
  const focusable = getFocusable(openBackdrop);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

[
  ['helpModal', 'closeHelp', 'closeHelp2'],
  ['analyticsModal', 'closeAnalytics', 'closeAnalytics2'],
  ['snippetsModal', 'closeSnippets', 'closeSnippets2'],
  ['achievementsModal', 'closeAchievements', 'closeAchievements2']
].forEach(([modalId, xId, btnId]) => {
  $('#' + xId).addEventListener('click', () => closeModal(modalId));
  $('#' + btnId).addEventListener('click', () => closeModal(modalId));
  $('#' + modalId).addEventListener('click', e => {
    if (e.target.id === modalId) closeModal(modalId);
  });
});

/* help modal open */
$('#btnHelp').addEventListener('click', () => openModal('helpModal'));

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
  const todayStr = new Date().toISOString().slice(0, 10);
  let activeDays = 0;
  const completedDates = new Set(store.completionDates || []);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
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
    tr.innerHTML = '<td>' + l.title + '</td><td>' + fmtTime(time) + '</td><td>' + retries + '</td>';
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
  saveStore(store);
  renderAnalytics();
  toast('Analytics reset');
});

/* code snippets */
function renderSnippets() {
  const list = $('#snippetList');
  const snippets = store.snippets || [];
  if (!snippets.length) {
    list.innerHTML = '<div class="snippet-empty">No saved snippets yet</div>';
    return;
  }
  list.innerHTML = '';
  snippets
    .slice()
    .reverse()
    .forEach(sn => {
      const row = el('div', { class: 'snippet-row' });
      const date = new Date(sn.createdAt).toLocaleDateString();
      row.innerHTML =
        '<div><div class="snippet-name">' +
        escapeHtml(sn.name) +
        '</div><div class="snippet-meta">Saved ' +
        date +
        '</div></div>' +
        '<div class="snippet-actions"><button class="load-btn">Load</button><button class="del-btn">Delete</button></div>';
      row.querySelector('.load-btn').addEventListener('click', () => {
        state.files = { html: sn.html, css: sn.css, js: sn.js };
        renderEditor();
        checkGoals();
        runCode();
        closeModal('snippetsModal');
        toast('Snippet "' + sn.name + '" loaded');
      });
      row.querySelector('.del-btn').addEventListener('click', () => {
        store.snippets = store.snippets.filter(s => s.id !== sn.id);
        saveStore(store);
        renderSnippets();
      });
      list.appendChild(row);
    });
}
$('#btnSnippets').addEventListener('click', () => {
  renderSnippets();
  openModal('snippetsModal');
});
$('#snippetSaveBtn').addEventListener('click', () => {
  const name = $('#snippetNameInput').value.trim();
  if (!name) {
    toast('Give your snippet a name first');
    return;
  }
  store.snippets = store.snippets || [];
  store.snippets.push({
    id: 'snip_' + Date.now(),
    name,
    html: state.files.html,
    css: state.files.css,
    js: state.files.js,
    createdAt: Date.now()
  });
  saveStore(store);
  $('#snippetNameInput').value = '';
  renderSnippets();
  toast('Snippet saved');
});

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
      a.title +
      '</div><div class="badge-desc">' +
      a.desc +
      '</div></div>';
    grid.appendChild(card);
  });
  $('#achievementsCount').textContent = 'Unlocked ' + unlocked + ' / ' + ACHIEVEMENTS.length;
}
$('#btnAchievements').addEventListener('click', () => {
  renderAchievements();
  openModal('achievementsModal');
});

/* sidebar toggle */
$('#sidebarToggle').addEventListener('click', () => {
  $('#sidebar').classList.toggle('collapsed');
});
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const isTyping = tag === 'textarea' || tag === 'input';
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    $('#sidebar').classList.toggle('collapsed');
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
  if (e.key === '?' && !isTyping) {
    e.preventDefault();
    openModal('helpModal');
    return;
  }
  if (e.key === 'Escape') {
    closeAllModals();
    return;
  }
});
