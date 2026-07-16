/* DevForge — commands.js
   A VS Code-style command palette (Ctrl/Cmd+K): fuzzy-searchable list of
   every action and every lesson in the app. Extensible via
   registerCommand() so new features can add themselves here instead of
   only living behind a dedicated button. */
'use strict';

const COMMANDS = [];
let paletteActiveIndex = 0;
let paletteLastFocused = null;

/**
 * @param {{id:string, label:string, group?:string, shortcut?:string, action:Function}} cmd
 */
function registerCommand(cmd) {
  if (!cmd || !cmd.id || !cmd.label || typeof cmd.action !== 'function') return;
  COMMANDS.push(cmd);
}

function fuzzyScore(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();
  if (!query) return 1;
  if (text.includes(query)) return 100 - text.indexOf(query); // prefer earlier matches
  // fallback: subsequence match (lets "gtl" match "Go to lesson")
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) qi++;
  }
  return qi === query.length ? 10 : -1;
}

function filteredCommands(query) {
  return COMMANDS.map(cmd => ({
    cmd,
    score: fuzzyScore(query, cmd.label + ' ' + (cmd.group || ''))
  }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.cmd)
    .slice(0, 50);
}

function renderPaletteList(query) {
  const list = $('#paletteList');
  const empty = $('#paletteEmpty');
  const matches = filteredCommands(query);
  paletteActiveIndex = 0;
  list.innerHTML = '';

  if (!matches.length) {
    empty.style.display = '';
    list.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display = '';

  matches.forEach((cmd, i) => {
    const li = el('li', {
      class: 'palette-item' + (i === 0 ? ' active' : ''),
      role: 'option',
      id: 'palette-item-' + i
    });
    li.innerHTML =
      '<span class="palette-item-label">' +
      escapeHtml(cmd.label) +
      (cmd.group ? '<span class="palette-item-group">' + escapeHtml(cmd.group) + '</span>' : '') +
      '</span>' +
      (cmd.shortcut ? '<kbd>' + escapeHtml(cmd.shortcut) + '</kbd>' : '');
    li.addEventListener('mouseenter', () => setPaletteActive(i));
    li.addEventListener('click', () => runPaletteCommand(matches, i));
    list.appendChild(li);
  });
}

function setPaletteActive(index) {
  const items = $$('.palette-item', $('#paletteList'));
  if (!items.length) return;
  paletteActiveIndex = ((index % items.length) + items.length) % items.length;
  items.forEach((it, i) => it.classList.toggle('active', i === paletteActiveIndex));
  if (typeof items[paletteActiveIndex].scrollIntoView === 'function') {
    items[paletteActiveIndex].scrollIntoView({ block: 'nearest' });
  }
}

function runPaletteCommand(matches, index) {
  const cmd = matches[index];
  if (!cmd) return;
  closeCommandPalette();
  cmd.action();
}

function openCommandPalette() {
  paletteLastFocused = document.activeElement;
  $('#commandPalette').classList.add('open');
  $('#paletteInput').value = '';
  renderPaletteList('');
  $('#paletteInput').focus();
}

function closeCommandPalette() {
  $('#commandPalette').classList.remove('open');
  if (paletteLastFocused && typeof paletteLastFocused.focus === 'function') {
    paletteLastFocused.focus();
  }
}

$('#paletteInput').addEventListener('input', e => renderPaletteList(e.target.value));
$('#paletteInput').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setPaletteActive(paletteActiveIndex + 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setPaletteActive(paletteActiveIndex - 1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const matches = filteredCommands($('#paletteInput').value);
    runPaletteCommand(matches, paletteActiveIndex);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeCommandPalette();
  }
});
$('#commandPalette').addEventListener('click', e => {
  if (e.target.id === 'commandPalette') closeCommandPalette();
});

document.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if ($('#commandPalette').classList.contains('open')) closeCommandPalette();
    else openCommandPalette();
  }
});

/* copy all code — HTML + CSS + JS as one labeled bundle */
function copyAllCode() {
  const bundle =
    '/* index.html */\n' +
    state.files.html +
    '\n\n/* style.css */\n' +
    state.files.css +
    '\n\n/* script.js */\n' +
    state.files.js;
  navigator.clipboard
    .writeText(bundle)
    .then(() => toast('Copied all code (HTML + CSS + JS)'))
    .catch(() => toast('Could not access clipboard'));
}
document.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    copyAllCode();
  }
});

/* -------------------- register built-in commands -------------------- */

registerCommand({
  id: 'run-code',
  label: 'Run code',
  group: 'Code',
  shortcut: 'Ctrl Enter',
  action: () => runCode()
});
registerCommand({
  id: 'reset-code',
  label: 'Reset code',
  group: 'Code',
  shortcut: 'Ctrl ⇧ R',
  action: () => resetCode()
});
registerCommand({
  id: 'empty-code',
  label: 'Empty code',
  group: 'Code',
  action: () => emptyCode()
});
registerCommand({
  id: 'copy-current-tab',
  label: 'Copy current tab code',
  group: 'Code',
  shortcut: 'Ctrl ⇧ C',
  action: () => copyCurrentCode()
});
registerCommand({
  id: 'copy-all-code',
  label: 'Copy all code (HTML + CSS + JS)',
  group: 'Code',
  shortcut: 'Ctrl ⇧ A',
  action: () => copyAllCode()
});
registerCommand({
  id: 'export-code',
  label: 'Export code as files',
  group: 'Code',
  action: () => exportCode()
});

registerCommand({
  id: 'go-html',
  label: 'Switch to HTML tab',
  group: 'Editor',
  shortcut: 'Ctrl 1',
  action: () => switchTab('html')
});
registerCommand({
  id: 'go-css',
  label: 'Switch to CSS tab',
  group: 'Editor',
  shortcut: 'Ctrl 2',
  action: () => switchTab('css')
});
registerCommand({
  id: 'go-js',
  label: 'Switch to JS tab',
  group: 'Editor',
  shortcut: 'Ctrl 3',
  action: () => switchTab('js')
});

registerCommand({
  id: 'open-playground',
  label: 'Open Playground',
  group: 'Navigate',
  action: () => loadLesson(PLAYGROUND.id)
});
registerCommand({
  id: 'next-lesson',
  label: 'Next lesson',
  group: 'Navigate',
  shortcut: 'Ctrl ]',
  action: () => nextLesson()
});
registerCommand({
  id: 'prev-lesson',
  label: 'Previous lesson',
  group: 'Navigate',
  shortcut: 'Ctrl [',
  action: () => prevLesson()
});

FLAT_LESSONS.forEach(lesson => {
  registerCommand({
    id: 'lesson-' + lesson.id,
    label: 'Go to lesson: ' + lesson.title,
    group: lesson.tag,
    action: () => loadLesson(lesson.id)
  });
});

registerCommand({
  id: 'toggle-theme',
  label: 'Toggle light / dark theme',
  group: 'View',
  action: () => $('#btnTheme').click()
});
registerCommand({
  id: 'toggle-sidebar',
  label: 'Toggle curriculum sidebar',
  group: 'View',
  shortcut: 'Ctrl B',
  action: () => $('#sidebarToggle').click()
});
registerCommand({
  id: 'layout-default',
  label: 'Layout: Default',
  group: 'View',
  action: () => applyLayout('default')
});
registerCommand({
  id: 'layout-wide-editor',
  label: 'Layout: Wide Editor',
  group: 'View',
  action: () => applyLayout('wide-editor')
});
registerCommand({
  id: 'layout-wide-preview',
  label: 'Layout: Wide Preview',
  group: 'View',
  action: () => applyLayout('wide-preview')
});
registerCommand({
  id: 'layout-minimal',
  label: 'Layout: Minimal',
  group: 'View',
  action: () => applyLayout('minimal')
});

registerCommand({
  id: 'open-shortcuts',
  label: 'Open keyboard shortcuts',
  group: 'Help',
  shortcut: '?',
  action: () => openModal('helpModal')
});
registerCommand({
  id: 'open-analytics',
  label: 'Open learner analytics',
  group: 'Help',
  action: () => $('#btnAnalytics').click()
});
registerCommand({
  id: 'open-snippets',
  label: 'Open code snippets',
  group: 'Help',
  action: () => $('#btnSnippets').click()
});
registerCommand({
  id: 'open-achievements',
  label: 'Open achievements & badges',
  group: 'Help',
  action: () => $('#btnAchievements').click()
});

registerCommand({
  id: 'export-progress',
  label: 'Export learner progress (JSON)',
  group: 'Data',
  action: () => $('#exportBtn').click()
});
registerCommand({
  id: 'import-progress',
  label: 'Import learner progress (JSON)',
  group: 'Data',
  action: () => $('#importBtn').click()
});
