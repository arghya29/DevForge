/* DevForge — import-export.js
   Export/import full learner progress as a JSON file. */
'use strict';

$('#exportBtn').addEventListener('click', () => {
  const data = JSON.stringify(store, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'devforge-progress.json';
  a.click();
  toast('Progress exported');
});
$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      store = Object.assign(defaultStore(), parsed);
      saveStore(store);
      refreshXP();
      renderSidebar();
      loadLesson(state.currentLessonId);
      toast('Progress imported');
    } catch {
      toast('Invalid file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});
