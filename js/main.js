/* DevForge — main.js
   Boots the app. Loaded last, after every other module. */
'use strict';

function init() {
  updateStreak();
  refreshXP();
  renderSidebar();
  loadLesson(PLAYGROUND.id);
  $('#autoToggle').checked = false;
}
init();
