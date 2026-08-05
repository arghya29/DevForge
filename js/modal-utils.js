/* DevForge — modal-utils.js
   Shared modal utilities, focus trapping, backdrop click handling,
   and global keyboard shortcuts. */
'use strict';

/* modal open/close helpers, with focus trapping for keyboard/screen-reader users */
let modalLastFocused = null;

function getFocusable(container) {
  return $$(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    container
  ).filter(elToCheck => !elToCheck.disabled);
}

function openModal(id) {
  modalLastFocused = document.activeElement;
  const backdrop = $('#' + id);
  backdrop.classList.add('open');
  const focusable = getFocusable(backdrop);
  if (focusable.length) focusable[0].focus();
}

function closeModal(id) {
  $('#' + id).classList.remove('open');
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
}

function closeAllModals() {
  $$('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
  $('#layoutMenu').classList.remove('open');
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
}

/* trap Tab/Shift+Tab inside whichever modal is currently open */
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const openBackdrop = $('.modal-backdrop.open:not(.palette-backdrop)');
  if (!openBackdrop) return;
  const focusable = getFocusable(openBackdrop);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

[
  ['helpModal', 'closeHelp', 'closeHelp2'],
  ['analyticsModal', 'closeAnalytics', 'closeAnalytics2'],
  ['snippetsModal', 'closeSnippets', 'closeSnippets2'],
  ['achievementsModal', 'closeAchievements', 'closeAchievements2']
].forEach(([modalId, xId, btnId]) => {
  const xEl = $('#' + xId);
  if (xEl) xEl.addEventListener('click', () => closeModal(modalId));
  const btnEl = $('#' + btnId);
  if (btnEl) btnEl.addEventListener('click', () => closeModal(modalId));
  const modalEl = $('#' + modalId);
  if (modalEl) {
    modalEl.addEventListener('click', e => {
      if (e.target.id === modalId) closeModal(modalId);
    });
  }
});

/* help modal open */
$('#btnHelp').addEventListener('click', () => openModal('helpModal'));

/* Global keyboard shortcuts */
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const isTyping = tag === 'textarea' || tag === 'input';
  const mod = e.ctrlKey || e.metaKey;

  if (e.key === 'Escape') {
    closeAllModals();
    return;
  }

  if (isTyping) return;

  if (mod && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    $('#sidebar').classList.toggle('collapsed');
    return;
  }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    resetCode();
    return;
  }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    copyCurrentCode();
    return;
  }
  if (mod && e.key === ']') {
    e.preventDefault();
    nextLesson();
    return;
  }
  if (mod && e.key === '[') {
    e.preventDefault();
    prevLesson();
    return;
  }
  if (mod && e.key === '1') {
    e.preventDefault();
    switchTab('html');
    return;
  }
  if (mod && e.key === '2') {
    e.preventDefault();
    switchTab('css');
    return;
  }
  if (mod && e.key === '3') {
    e.preventDefault();
    switchTab('js');
    return;
  }
  if (e.key === '?') {
    e.preventDefault();
    openModal('helpModal');
    return;
  }
});
