/* DevForge — state.js
   In-memory UI state for the current session (not persisted). */
'use strict';

const state = {
  currentLessonId: PLAYGROUND.id,
  currentLang: 'html',
  files: { html: PLAYGROUND.html, css: PLAYGROUND.css, js: PLAYGROUND.js },
  autoRun: false,
  autoTimer: null,
  consoleFilterText: '',
  layout: 'default',
  lessonPanelOpen: true,
  goalsOpen: false,
  hintsRevealed: {} // lessonId -> number of hints revealed this session
};
