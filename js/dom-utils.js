/* DevForge — dom-utils.js
   Tiny DOM helpers used across every other file: $ / $$ / el / escapeHtml / toast. */
'use strict';

// Applied here, in the very first script to run, so the saved theme takes
// effect before the page's first paint rather than flashing dark-then-light
// (or vice versa). The rest of the theme toggle UI lives in modals.js.
try {
  if (localStorage.getItem('devforge:theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch {
  /* localStorage unavailable — fall back to the default theme */
}

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

// HTML attributes that are "boolean" — their presence/absence is what
// matters, not their string value. Setting disabled="false" via
// setAttribute would still make an element disabled, since HTML only
// checks whether the attribute exists at all. These must be reflected as
// real boolean DOM properties instead.
const BOOLEAN_ATTRS = new Set([
  'disabled',
  'checked',
  'readonly',
  'required',
  'selected',
  'autofocus',
  'multiple',
  'hidden',
  'open'
]);

function el(tag, props, children) {
  const e = document.createElement(tag);
  if (props)
    Object.keys(props).forEach(k => {
      const v = props[k];
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (BOOLEAN_ATTRS.has(k)) e[k] = !!v;
      else e.setAttribute(k, v);
    });
  (children || []).forEach(c =>
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  );
  return e;
}
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// `Date#toISOString()` is always UTC, so a learner working late at night
// (or anyone west of UTC generally) could have a lesson attributed to the
// wrong calendar day — losing or gaining a streak day relative to what
// they actually experienced. This returns the LOCAL calendar day instead,
// as a YYYY-MM-DD string, and is the single source of truth for "what day
// is it" everywhere the app tracks streaks/consistency.
function localDateString(date) {
  date = date || new Date();
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}
function toast(msg, kind) {
  const t = el('div', { class: 'toast' }, []);
  t.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>' +
    escapeHtml(msg) +
    '</span>';
  $('#toastWrap').appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .25s';
    setTimeout(() => t.remove(), 250);
  }, 2200);
  const live = $('#ariaLiveRegion');
  if (live) live.textContent = msg;
}
