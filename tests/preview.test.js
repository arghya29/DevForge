import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('preview.js — buildDoc()', () => {
  it('injects CSS into <head> and JS before </body> for a full HTML document', () => {
    const { get } = createApp();
    const doc = get(
      `buildDoc('<html><head></head><body><h1>hi</h1></body></html>', 'body{color:red}', 'console.log(1)')`
    );
    expect(doc).toContain('<style>');
    expect(doc).toContain('body{color:red}');
    expect(doc).toContain('console.log(1)');
    expect(doc.indexOf('<style>')).toBeLessThan(doc.indexOf('<h1>'));
    expect(doc.indexOf('console.log(1)')).toBeGreaterThan(doc.indexOf('<h1>'));
  });

  it('still works when the HTML is a bare fragment with no <html>/<head>/<body>', () => {
    const { get } = createApp();
    const doc = get(`buildDoc('<p>just a fragment</p>', 'p{color:blue}', 'console.log(2)')`);
    expect(doc).toContain('<p>just a fragment</p>');
    expect(doc).toContain('p{color:blue}');
    expect(doc).toContain('console.log(2)');
  });

  it('a learner\'s JS containing the literal string "</script>" cannot break out of the injected script tag', () => {
    const { get } = createApp();
    const doc = get(
      `buildDoc('<body></body>', '', 'console.log("</script><script>alert(1)</scr" + "ipt>")')`
    );
    // the dangerous literal sequence must not appear unescaped anywhere in the document
    expect(doc).not.toMatch(/<\/script>\s*<script>alert\(1\)/);
    // the learner's own code should still be present, just neutralized
    expect(doc).toContain('<\\/script>');
  });

  it('a learner\'s CSS containing the literal string "</style>" cannot break out of the injected style tag', () => {
    const { get } = createApp();
    const doc = get(
      `buildDoc('<body></body>', 'body{}\\n/* </style><img src=x onerror=alert(1)> */', '')`
    );
    expect(doc).not.toMatch(/<\/style>\s*<img/);
    expect(doc).toContain('<\\/style>');
  });

  it('a real (non-malicious) console.log call with a normal string still works after escaping', () => {
    const { get } = createApp();
    const doc = get(`buildDoc('<body></body>', '', 'console.log("hello world")')`);
    expect(doc).toContain('console.log("hello world")');
  });
});
