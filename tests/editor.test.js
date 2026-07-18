import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('dom-utils.js', () => {
  it('escapeHtml() escapes quote characters, not just angle brackets and ampersands', () => {
    const { get } = createApp();
    const out = get(`escapeHtml('<div class="a">it\\'s "quoted" & <b>bold</b></div>')`);
    expect(out).not.toContain('"');
    expect(out).not.toContain("'");
    expect(out).toContain('&quot;');
    expect(out).toContain('&#39;');
    expect(out).toContain('&lt;div');
    expect(out).toContain('&amp;');
  });

  it('el() reflects boolean attributes as real DOM properties, not string-ified attributes', () => {
    const { get } = createApp();
    // disabled:false must NOT render as disabled="false" (which HTML would
    // still treat as disabled — only the attribute's PRESENCE matters)
    const disabledFalse = get(`el('button', { disabled: false }).disabled`);
    expect(disabledFalse).toBe(false);
    const disabledTrue = get(`el('button', { disabled: true }).disabled`);
    expect(disabledTrue).toBe(true);
    const hasAttrWhenFalse = get(`el('button', { disabled: false }).hasAttribute('disabled')`);
    expect(hasAttrWhenFalse).toBe(false);
  });

  it('el() still sets ordinary (non-boolean) attributes via setAttribute as before', () => {
    const { get } = createApp();
    const role = get(`el('div', { role: 'button', 'aria-expanded': 'true' }).getAttribute('role')`);
    expect(role).toBe('button');
  });
});

describe('highlighter.js — syntax highlighting', () => {
  it('wraps JS comments, strings, and keywords in token spans', () => {
    const { get } = createApp();
    const out = get(`highlight('const x = "hi"; // note', 'js')`);
    expect(out).toContain('tok-keyword');
    expect(out).toContain('tok-string');
    expect(out).toContain('tok-comment');
  });

  it('wraps CSS selectors and properties in token spans', () => {
    const { get } = createApp();
    const out = get(`highlight('.box{ color: red; }', 'css')`);
    expect(out).toContain('tok-selector');
    expect(out).toContain('tok-prop');
  });

  it('wraps HTML tags and attributes in token spans', () => {
    const { get } = createApp();
    const out = get(`highlight('<div class="a">hi</div>', 'html')`);
    expect(out).toContain('tok-tag');
    expect(out).toContain('tok-attr');
  });

  it('escapes HTML-significant characters so highlighted output never breaks the page', () => {
    const { get } = createApp();
    const out = get(`highlight('<script>alert(1)</script>', 'html')`);
    expect(out).not.toContain('<script>alert(1)</script>');
  });

  it('never throws on empty or malformed input', () => {
    const { get } = createApp();
    expect(() => get(`highlight('', 'js')`)).not.toThrow();
    expect(() => get(`highlight('{{{ unclosed', 'css')`)).not.toThrow();
    expect(() => get(`highlight('<<< unclosed', 'html')`)).not.toThrow();
  });
});

describe('editor.js — editor behavior', () => {
  it("loads a lesson's HTML into the editor by default", () => {
    const { get, document } = createApp();
    get('loadLesson(FLAT_LESSONS[0].id)');
    const textarea = document.getElementById('codeInput');
    expect(textarea.value).toBe(get('FLAT_LESSONS[0].html'));
  });

  it('switchTab() swaps the editor content and marks the right tab active', () => {
    const { get, document } = createApp();
    get('loadLesson(FLAT_LESSONS[0].id)');
    get("switchTab('css')");
    const textarea = document.getElementById('codeInput');
    expect(textarea.value).toBe(get('FLAT_LESSONS[0].css'));
    expect(get('state.currentLang')).toBe('css');
    const cssTab = document.querySelector('.lang-tab[data-lang="css"]');
    expect(cssTab.classList.contains('active')).toBe(true);
  });

  it('typing in the editor updates in-memory state for the active language', () => {
    const { get, document, window } = createApp();
    get("loadLesson('__playground__')");
    const textarea = document.getElementById('codeInput');
    textarea.value = '<h1>changed</h1>';
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(get('state.files.html')).toBe('<h1>changed</h1>');
  });

  it('Tab key inserts two spaces at the cursor instead of moving focus', () => {
    const { get, document, window } = createApp();
    get("loadLesson('__playground__')");
    const textarea = document.getElementById('codeInput');
    textarea.value = 'ab';
    textarea.selectionStart = textarea.selectionEnd = 1; // cursor between a|b
    const evt = new window.KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true
    });
    textarea.dispatchEvent(evt);
    expect(textarea.value).toBe('a  b');
  });

  it("persistCurrentCode() saves the current lesson's code, but not the Playground's", () => {
    const { get } = createApp();
    const lessonId = get('FLAT_LESSONS[0].id');
    get(`loadLesson('${lessonId}')`);
    get("state.files.html = '<h1>edited</h1>', persistCurrentCode()");
    expect(get('store.code')[lessonId].html).toBe('<h1>edited</h1>');

    get("loadLesson('__playground__')");
    get("state.files.html = '<h1>playground edit</h1>', persistCurrentCode()");
    expect(get('store.code')['__playground__']).toBeUndefined();
  });

  it('switching tabs cancels a pending debounced highlight instead of letting it paint stale content into the new tab', async () => {
    const { get, document, window } = createApp();
    get("loadLesson('__playground__')");
    // force the large-buffer debounce path (>4000 chars) on the JS tab
    get("switchTab('js')");
    const textarea = document.getElementById('codeInput');
    textarea.value = 'x'.repeat(4500);
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    // immediately switch to CSS before the debounced JS highlight has fired
    get("switchTab('css')");
    const cssTextAtSwitch = document.getElementById('codeHighlight').textContent;

    await new Promise(resolve => setTimeout(resolve, 250)); // past the 150ms debounce window

    // the overlay must still reflect the CSS tab, not stale JS content
    expect(document.getElementById('codeHighlight').textContent).toBe(cssTextAtSwitch);
    expect(get('state.currentLang')).toBe('css');
  });
});
