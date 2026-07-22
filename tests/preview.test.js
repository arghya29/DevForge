import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('preview.js — buildDoc()', () => {
  let app;
  let get;
  let domParser;

  beforeAll(() => {
    app = createApp();
    get = app.get;
    domParser = new app.window.DOMParser();
  });

  it('injects CSS into <head> and JS before </body> for a full HTML document', () => {
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
    const doc = get(`buildDoc('<p>just a fragment</p>', 'p{color:blue}', 'console.log(2)')`);
    expect(doc).toContain('<p>just a fragment</p>');
    expect(doc).toContain('p{color:blue}');
    expect(doc).toContain('console.log(2)');
  });

  it('a learner\'s JS containing the literal string "</script>" cannot break out of the injected script tag', () => {
    const doc = get(
      `buildDoc('<body></body>', '', 'console.log("</script><script>alert(1)</scr" + "ipt>")')`
    );

    // Parse document natively to assert script safety structure
    const parsedDoc = domParser.parseFromString(doc, 'text/html');
    const scripts = parsedDoc.querySelectorAll('script');

    // Ensure no unauthorized breakout script tags were created
    expect(scripts.length).toBeLessThanOrEqual(1);
    expect(doc).toContain('<\\/script>');
  });

  it('a learner\'s CSS containing the literal string "</style>" cannot break out of the injected style tag', () => {
    const doc = get(
      `buildDoc('<body></body>', 'body{}\\n/* </style><img src=x onerror=alert(1)> */', '')`
    );

    const parsedDoc = domParser.parseFromString(doc, 'text/html');
    expect(parsedDoc.querySelectorAll('img[src="x"]').length).toBe(0);
    expect(doc).toContain('<\\/style>');
  });

  it('a real (non-malicious) console.log call with a normal string still works after escaping', () => {
    const doc = get(`buildDoc('<body></body>', '', 'console.log("hello world")')`);
    expect(doc).toContain('console.log("hello world")');
  });
});
