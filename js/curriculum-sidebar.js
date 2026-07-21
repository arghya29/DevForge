/* DevForge — curriculum-sidebar.js
   Rendering the curriculum sidebar: the pinned playground entry, collapsible
   categories, the lesson list, and search filtering. */
'use strict';

function activateOnEnterOrSpace(handler) {
  return e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
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
