/* DevForge — preview.js
   Turns the current HTML/CSS/JS into a live preview document, captures
   console output from inside the sandboxed iframe, and the device-view /
   reset / empty / export / auto-run controls. */
'use strict';

const CONSOLE_CAPTURE_SRC = `
(function(){
  function fmt(a){
    if(a instanceof Error) return a.name + ': ' + a.message;
    if(typeof a === 'object' && a !== null){ try { return JSON.stringify(a); } catch(e){ return String(a); } }
    return String(a);
  }
  function send(type,args){
    try{ parent.postMessage({source:'devforge-console', type:type, args:args.map(fmt)}, '*'); }catch(e){}
  }
  ['log','info','warn','error','debug'].forEach(function(m){
    var orig = console[m];
    console[m] = function(){ send(m, Array.prototype.slice.call(arguments)); if(orig) orig.apply(console, arguments); };
  });
  window.addEventListener('error', function(e){
    send('error', [(e.message||'Script error') + ' (line ' + (e.lineno||'?') + ')']);
  });
  window.addEventListener('unhandledrejection', function(e){
    var r = e.reason;
    send('error', ['Unhandled promise rejection: ' + (r && r.message ? r.message : r)]);
  });
  window.addEventListener('DOMContentLoaded', function(){
    send('system', ['Page loaded successfully!']);
  });
})();
`;

// <script> and <style> are HTML "raw text elements" — the browser's HTML
// parser looks for the literal, case-insensitive text "</script" or
// "</style" to know where they end, with zero understanding of JS/CSS
// syntax (strings, comments, etc. don't protect it). If a learner's code
// contains that literal sequence — e.g. `console.log("</script>")`, which
// is completely reasonable code to write — it would prematurely close our
// injected tag and corrupt the whole preview document. Splitting the
// sequence with a backslash is JS/CSS-semantics-preserving (`\/` inside a
// string or comment is just `/`) while no longer matching what the HTML
// parser is looking for.
function escapeRawTextClose(str) {
  return String(str).replace(/<\/(script|style)/gi, '<\\/$1');
}

function buildDoc(html, css, js) {
  let doc = html || '';
  const styleTag = '<style>\n' + escapeRawTextClose(css) + '\n</style>';
  const scriptTag =
    '<script>\n' + CONSOLE_CAPTURE_SRC + '\n' + escapeRawTextClose(js) + '\n<\/script>';

  if (/<head[^>]*>/i.test(doc)) doc = doc.replace(/<head[^>]*>/i, m => m + styleTag);
  else if (/<html[^>]*>/i.test(doc))
    doc = doc.replace(/<html[^>]*>/i, m => m + '<head>' + styleTag + '</head>');
  else doc = styleTag + doc;

  if (/<\/body>/i.test(doc)) doc = doc.replace(/<\/body>/i, scriptTag + '</body>');
  else if (/<\/html>/i.test(doc)) doc = doc.replace(/<\/html>/i, scriptTag + '</html>');
  else doc = doc + scriptTag;

  return doc;
}

function addConsoleLine(type, text) {
  const out = $('#consoleOutput');
  const row = el('div', { class: 'console-line ' + type });
  const time = new Date().toTimeString().slice(0, 8);
  const icons = { log: '›', info: 'i', warn: '!', error: '✕', system: 'i', run: '▸' };
  row.innerHTML =
    '<span class="c-time">' +
    time +
    '</span>' +
    '<span class="c-icon">' +
    (icons[type] || '›') +
    '</span>' +
    '<span class="c-msg"></span>';
  row.querySelector('.c-msg').textContent = text;
  out.appendChild(row);
  if (!state.consoleFilterText || text.toLowerCase().includes(state.consoleFilterText))
    row.style.display = '';
  else row.style.display = 'none';
  out.scrollTop = out.scrollHeight;
  updateConsoleEmptyState();
}

function updateConsoleEmptyState() {
  const hasOutput = !!$('#consoleOutput').querySelector('.console-line');
  $('#consoleEmpty').style.display = hasOutput ? 'none' : 'block';
  $('#consoleOutput').style.display = hasOutput ? 'block' : 'none';
}

window.addEventListener('message', e => {
  if (e.source !== $('#previewFrame').contentWindow) return;
  const d = e.data;
  if (!d || d.source !== 'devforge-console') return;
  addConsoleLine(d.type, d.args.join(' '));
  if (
    d.type === 'error' &&
    !runErroredThisRun &&
    runContextLessonId &&
    runContextLessonId !== PLAYGROUND.id
  ) {
    runErroredThisRun = true;
    store.lessonRetries[runContextLessonId] = (store.lessonRetries[runContextLessonId] || 0) + 1;
    saveStore(store);
  }
});

let runContextLessonId = null;
let runErroredThisRun = false;
function runCode() {
  addConsoleLine('run', 'Running…');
  runContextLessonId = state.currentLessonId;
  runErroredThisRun = false;
  if (!store.hasRun) {
    store.hasRun = true;
    saveStore(store);
  }
  const doc = buildDoc(state.files.html, state.files.css, state.files.js);
  $('#previewFrame').srcdoc = doc;
}
$('#runBtn').addEventListener('click', runCode);
$('#btnPreviewRefresh').addEventListener('click', runCode);

/* device view toggle */
$$('.device-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.device-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $('#previewWrap').dataset.view = btn.dataset.view;
  });
});

/* reset / empty / export code */
function resetCode() {
  const lesson = currentLessonDef();
  if (lesson === PLAYGROUND) {
    state.files = { html: '', css: '', js: '' };
  } else {
    delete store.code[lesson.id];
    saveStore(store);
    state.files = { html: lesson.html, css: lesson.css, js: lesson.js };
  }
  renderEditor();
  checkGoals();
  toast('Code reset');
}
function emptyCode() {
  state.files = { html: '', css: '', js: '' };
  renderEditor();
  checkGoals();
  toast('Editor cleared');
}
function exportCode() {
  const files = [
    { name: 'index.html', content: state.files.html },
    { name: 'style.css', content: state.files.css },
    { name: 'script.js', content: state.files.js }
  ];
  files.forEach((f, i) => {
    setTimeout(() => {
      const blob = new Blob([f.content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = f.name;
      a.click();
    }, i * 300);
  });
  toast('Exporting code files…');
}
$('#btnResetPreview').addEventListener('click', resetCode);
$('#btnEmptyCode').addEventListener('click', emptyCode);
$('#btnExportCode').addEventListener('click', exportCode);

function scheduleAutoRun() {
  clearTimeout(state.autoTimer);
  state.autoTimer = setTimeout(runCode, 600);
}
$('#autoToggle').addEventListener('change', e => {
  state.autoRun = e.target.checked;
  if (state.autoRun) runCode();
});

/* console filter / clear */
$('#consoleFilter').addEventListener('input', e => {
  state.consoleFilterText = e.target.value.toLowerCase();
  $$('.console-line', $('#consoleOutput')).forEach(row => {
    const txt = row.querySelector('.c-msg').textContent.toLowerCase();
    row.style.display =
      !state.consoleFilterText || txt.includes(state.consoleFilterText) ? '' : 'none';
  });
});
$('#consoleClear').addEventListener('click', () => {
  $('#consoleOutput').innerHTML = '';
  updateConsoleEmptyState();
});
