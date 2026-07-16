/* DevForge — dom-utils.js
   Tiny DOM helpers used across every other file: $ / $$ / el / escapeHtml / toast. */
'use strict';

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
function el(tag, props, children) {
  const e = document.createElement(tag);
  if (props)
    Object.keys(props).forEach(k => {
      if (k === 'class') e.className = props[k];
      else if (k === 'html') e.innerHTML = props[k];
      else if (k.startsWith('on') && typeof props[k] === 'function')
        e.addEventListener(k.slice(2), props[k]);
      else e.setAttribute(k, props[k]);
    });
  (children || []).forEach(c =>
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  );
  return e;
}
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
