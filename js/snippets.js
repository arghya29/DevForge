/* DevForge — snippets.js
   Code snippet management: rendering saved snippets, loading, saving,
   and deleting snippet handlers. */
'use strict';

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
        if (!confirm('Load "' + sn.name + '"? This will replace your current code in the editor.'))
          return;
        state.files = { html: sn.html, css: sn.css, js: sn.js };
        renderEditor();
        checkGoals();
        runCode();
        closeModal('snippetsModal');
        toast('Snippet "' + sn.name + '" loaded');
      });
      row.querySelector('.del-btn').addEventListener('click', () => {
        if (!confirm('Delete "' + sn.name + '"? This can\'t be undone.')) return;
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
  const saved = saveStore(store);
  $('#snippetNameInput').value = '';
  renderSnippets();
  if (saved) toast('Snippet saved');
});
