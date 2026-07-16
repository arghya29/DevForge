// Shared test harness.
//
// DevForge is a set of classic (non-module) scripts that share one global
// scope, the same way sequential <script src="..."> tags do in a real
// browser. To test it faithfully we load the real index.html + real js/*.js
// files into a fresh jsdom window per test, in the same order the app
// declares in its own <script> tags — no separate build, no mocks of our
// own code.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..');

// Keep this in sync with the <script src="..."> order in index.html.
export const JS_LOAD_ORDER = [
  'dom-utils.js',
  'curriculum.js',
  'state.js',
  'store.js',
  'highlighter.js',
  'editor.js',
  'preview.js',
  'lessons.js',
  'modals.js',
  'commands.js',
  'import-export.js',
  'resizers.js',
  'main.js'
];

/**
 * Boots a fresh instance of the app in jsdom.
 * @param {object} [options]
 * @param {object} [options.seedStore] - pre-populate localStorage's devforge:v1 key
 * @returns {{ window: Window, document: Document, get: (expr: string) => any }}
 */
export function createApp({ seedStore } = {}) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;
  const document = window.document;

  // Minimal, in-memory localStorage — jsdom's file://-backed storage is
  // unreliable in a test/CI environment, and we don't need persistence
  // across process runs here anyway.
  let backing = {};
  if (seedStore) backing['devforge:v1'] = JSON.stringify(seedStore);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: k => (Object.prototype.hasOwnProperty.call(backing, k) ? backing[k] : null),
      setItem: (k, v) => {
        backing[k] = String(v);
      },
      removeItem: k => {
        delete backing[k];
      },
      clear: () => {
        backing = {};
      }
    }
  });
  window.navigator.clipboard = { writeText: () => Promise.resolve() };
  window.confirm = () => true;
  window.scrollTo = () => {};

  // The parsed index.html already declares <script src="js/...">, but
  // jsdom doesn't fetch external subresources by default (no `resources`
  // loader configured) — so nothing has actually run yet at this point.
  // We execute the *real* files ourselves, as genuine <script> elements
  // (not window.eval — jsdom's window.eval does not share top-level
  // let/const bindings across separate calls, but real injected <script>
  // tags do, exactly like a browser loading sequential classic scripts).
  const run = code => {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
  };

  JS_LOAD_ORDER.forEach(f => {
    run(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'));
  });

  return {
    window,
    document,
    // Runs an arbitrary expression/statement in the exact same realm and
    // scope the app itself runs in, via the same script-injection
    // mechanism used to load the app.
    get: expr => {
      const marker = '__testProbe__';
      run(`window.${marker} = (function(){ return (${expr}); })();`);
      const result = window[marker];
      delete window[marker];
      return result;
    }
  };
}
