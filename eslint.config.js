// ESLint 9 flat config.
//
// The app is a set of classic (non-module) <script> files that intentionally
// share one global scope (see js/main.js for load order and README.md for
// why). That means most "cross-file" references are, from ESLint's point of
// view, undeclared globals — so we declare them explicitly below instead of
// disabling no-undef wholesale, which keeps the check meaningful for actual
// typos.

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  requestAnimationFrame: 'readonly',
  URL: 'readonly',
  Blob: 'readonly',
  FileReader: 'readonly',
  MouseEvent: 'readonly',
  Event: 'readonly',
  confirm: 'readonly'
};

// Symbols defined in one js/*.js file and used in another. Grouped by the
// file that defines them so this list is easy to keep honest as the app
// grows — if you add a new cross-file symbol, add it here in the same PR.
const appGlobals = {
  // dom-utils.js
  $: 'readonly',
  $$: 'readonly',
  el: 'readonly',
  escapeHtml: 'readonly',
  toast: 'readonly',
  localDateString: 'readonly',
  // curriculum.js
  PLAYGROUND: 'readonly',
  CURRICULUM: 'readonly',
  FLAT_LESSONS: 'readonly',
  // state.js
  state: 'writable',
  // store.js
  store: 'writable',
  defaultStore: 'readonly',
  isValidStoreShape: 'readonly',
  loadStore: 'readonly',
  saveStore: 'readonly',
  updateStreak: 'readonly',
  totalXP: 'readonly',
  refreshXP: 'readonly',
  flushTimer: 'readonly',
  startTimer: 'readonly',
  // highlighter.js
  highlight: 'readonly',
  // editor.js
  renderEditor: 'readonly',
  syncScroll: 'readonly',
  persistCurrentCode: 'readonly',
  markStarted: 'readonly',
  switchTab: 'readonly',
  // preview.js
  buildDoc: 'readonly',
  runCode: 'readonly',
  resetCode: 'readonly',
  emptyCode: 'readonly',
  exportCode: 'readonly',
  addConsoleLine: 'readonly',
  scheduleAutoRun: 'readonly',
  // lesson-load.js
  currentLessonDef: 'readonly',
  updateCounters: 'readonly',
  prevLesson: 'readonly',
  nextLesson: 'readonly',
  copyCurrentCode: 'readonly',
  loadLesson: 'readonly',
  // lesson-panel.js
  renderLessonPanel: 'readonly',
  checkGoals: 'readonly',
  // curriculum-sidebar.js
  renderSidebar: 'readonly',
  // modal-utils.js
  openModal: 'readonly',
  closeModal: 'readonly',
  closeAllModals: 'readonly',
  getFocusable: 'readonly',
  // layout-theme.js
  applyLayout: 'readonly',
  // analytics.js
  fmtTime: 'readonly',
  renderAnalytics: 'readonly',
  // snippets.js
  renderSnippets: 'readonly',
  // achievements.js
  ACHIEVEMENTS: 'readonly',
  renderAchievements: 'readonly',
  // commands.js
  registerCommand: 'readonly',
  openCommandPalette: 'readonly',
  closeCommandPalette: 'readonly'
};

export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...browserGlobals, ...appGlobals }
    },
    rules: {
      'no-unused-vars': [\n        'warn',\n        {\n          args: 'none',\n          varsIgnorePattern: '^(?:' + Object.keys(appGlobals).map(k => k === ',
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  }
];
 ? '\\\\,
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  }
];
 : k === '$' ? '\\\\$\\\\,
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  }
];
 : k).join('|') + '),
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  }
];
\n        }\n      ],
      'no-undef': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn'
    }
  }
];
