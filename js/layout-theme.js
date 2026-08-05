/* DevForge — layout-theme.js
   Workspace layout presets, layout dropdown menu, theme toggle and persistence,
   and sidebar toggle. */
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
function setThemeButtonActive() {
  $('#btnTheme').classList.toggle(
    'active',
    document.documentElement.getAttribute('data-theme') === 'light'
  );
}
setThemeButtonActive(); // reflect the theme dom-utils.js already applied before first paint
$('#btnTheme').addEventListener('click', () => {
  const html = document.documentElement;
  const isLight = html.getAttribute('data-theme') === 'light';
  if (isLight) html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', 'light');
  try {
    localStorage.setItem('devforge:theme', isLight ? 'dark' : 'light');
  } catch {
    /* localStorage unavailable — theme still works for this session */
  }
  setThemeButtonActive();
});

/* sidebar toggle */
$('#sidebarToggle').addEventListener('click', () => {
  $('#sidebar').classList.toggle('collapsed');
});
