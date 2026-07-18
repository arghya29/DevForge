/* DevForge — highlighter.js
   Dependency-free regex-based syntax highlighting for HTML, CSS and JS. */
'use strict';

const JS_KEYWORDS =
  'const|let|var|function|return|if|else|for|while|do|class|new|typeof|true|false|null|undefined|this|import|from|export|default|try|catch|finally|switch|case|break|continue|async|await|of|in|extends|super|static|get|set|yield|throw|void|delete|instanceof';

function highlightGeneric(code, regex, classify) {
  let out = '',
    last = 0,
    m;
  regex.lastIndex = 0;
  while ((m = regex.exec(code))) {
    if (m.index > last) out += escapeHtml(code.slice(last, m.index));
    const cls = classify(m);
    out += cls ? '<span class="tok-' + cls + '">' + escapeHtml(m[0]) + '</span>' : escapeHtml(m[0]);
    last = regex.lastIndex;
    if (m.index === regex.lastIndex) regex.lastIndex++;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

const RE_JS = new RegExp(
  '(\\/\\/[^\\n]*)' + // 1 line comment
    '|(\\/\\*[\\s\\S]*?\\*\\/)' + // 2 block comment
    '|(`(?:\\\\.|[^`\\\\])*`)' + // 3 template string
    '|("(?:\\\\.|[^"\\\\])*")' + // 4 dq string
    "|('(?:\\\\.|[^'\\\\])*')" + // 5 sq string
    '|(\\b\\d+\\.?\\d*\\b)' + // 6 number
    '|(\\bconsole\\b)' + // 7 console
    '|(\\b(?:' +
    JS_KEYWORDS +
    ')\\b)' + // 8 keyword
    '|([a-zA-Z_$][\\w$]*(?=\\())', // 9 function call
  'g'
);
function highlightJS(code) {
  return highlightGeneric(code, RE_JS, m => {
    if (m[1] || m[2]) return 'comment';
    if (m[3] || m[4] || m[5]) return 'string';
    if (m[6]) return 'number';
    if (m[7]) return 'builtin';
    if (m[8]) return 'keyword';
    if (m[9]) return 'func';
    return null;
  });
}

const RE_CSS = new RegExp(
  '(\\/\\*[\\s\\S]*?\\*\\/)' + // 1 comment
    '|("(?:\\\\.|[^"\\\\])*")' + // 2 string
    "|('(?:\\\\.|[^'\\\\])*')" + // 3 string
    '|(#[0-9a-fA-F]{3,8}\\b)' + // 4 hex color -> value
    '|(\\b\\d+\\.?\\d*(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\\b)' + // 5 number -> value
    '|([.#][a-zA-Z_-][\\w-]*)' + // 6 class/id selector
    '|([a-zA-Z-]+(?=\\s*:))' + // 7 property
    '|(:[a-zA-Z-]+)', // 8 pseudo
  'g'
);
function highlightCSS(code) {
  return highlightGeneric(code, RE_CSS, m => {
    if (m[1]) return 'comment';
    if (m[2] || m[3]) return 'string';
    if (m[4] || m[5]) return 'value';
    if (m[6]) return 'selector';
    if (m[7]) return 'prop';
    if (m[8]) return 'selector';
    return null;
  });
}

const RE_HTML = new RegExp(
  '(<!--[\\s\\S]*?-->)' + // 1 comment
    '|(<\\/?[a-zA-Z][\\w-]*)' + // 2 tag open + name
    '|([a-zA-Z-]+(?=\\s*=))' + // 3 attribute name
    '|("(?:\\\\.|[^"\\\\])*")' + // 4 string
    "|('(?:\\\\.|[^'\\\\])*')", // 5 string
  'g'
);
function highlightHTML(code) {
  return highlightGeneric(code, RE_HTML, m => {
    if (m[1]) return 'comment';
    if (m[2]) return 'tag';
    if (m[3]) return 'attr';
    if (m[4] || m[5]) return 'string';
    return null;
  });
}

function highlight(code, lang) {
  if (lang === 'html') return highlightHTML(code);
  if (lang === 'css') return highlightCSS(code);
  return highlightJS(code);
}
