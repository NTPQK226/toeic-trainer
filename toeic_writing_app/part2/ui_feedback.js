/**
 * TOEIC Writing App - Custom UI feedback (toast + confirm)
 * Replaces native alert()/confirm() with styled, theme-aware components.
 * Exposes window.ToeicUi = { toast(msg, type), confirm(msg, {title, okText, cancelText}) }
 */
(function (window) {
  'use strict';

  let toastWrap = null;
  let confirmEl = null;

  // ---------- Toast ----------
  function ensureToastWrap() {
    if (toastWrap) return toastWrap;
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    toastWrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastWrap);
    return toastWrap;
  }

  // type: 'info' | 'success' | 'warning' | 'error'
  function toast(msg, type) {
    const wrap = ensureToastWrap();
    const el = document.createElement('div');
    const icons = {
      success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    const icon = icons[type] || icons.info;
    el.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-msg"></span>';
    el.querySelector('.toast-msg').textContent = msg || '';
    wrap.appendChild(el);
    // Animate in (double rAF guarantees the initial frame is committed first)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('show'));
    });
    // Auto dismiss
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, 4200);
    // Allow click to dismiss
    el.addEventListener('click', () => {
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    });
    return el;
  }

  // ---------- Confirm ----------
  function ensureConfirmEl() {
    if (confirmEl && document.body.contains(confirmEl)) return confirmEl;

    confirmEl = document.createElement('div');
    confirmEl.className = 'ui-confirm-overlay';
    confirmEl.style.display = 'none';
    confirmEl.innerHTML =
      '<div class="ui-confirm-box" role="dialog" aria-modal="true">' +
        '<div class="ui-confirm-title"></div>' +
        '<div class="ui-confirm-msg"></div>' +
        '<div class="ui-confirm-actions">' +
          '<button type="button" class="btn btn-outline ui-confirm-cancel"></button>' +
          '<button type="button" class="btn btn-primary ui-confirm-ok"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(confirmEl);

    // close on overlay click (only when clicking outside the box)
    confirmEl.addEventListener('click', (e) => {
      if (e.target === confirmEl) hideConfirm();
    });
    return confirmEl;
  }

  let _confirmResolve = null;

  function hideConfirm() {
    if (!confirmEl) return;
    confirmEl.style.display = 'none';
    document.body.classList.remove('ui-confirm-open');
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  }

  function confirm(msg, opts) {
    opts = opts || {};
    const el = ensureConfirmEl();
    el.querySelector('.ui-confirm-title').textContent = opts.title || 'Xác nhận';
    el.querySelector('.ui-confirm-msg').textContent = msg || '';
    const okBtn = el.querySelector('.ui-confirm-ok');
    const cancelBtn = el.querySelector('.ui-confirm-cancel');
    okBtn.textContent = opts.okText || 'Đồng ý';
    cancelBtn.textContent = opts.cancelText || 'Huỷ';
    if (opts.danger) okBtn.className = 'btn ui-confirm-ok btn-danger-soft';

    // Unbind previous
    const onOk = () => {
      el.style.display = 'none';
      document.body.classList.remove('ui-confirm-open');
      if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
    };
    const onCancel = () => {
      el.style.display = 'none';
      document.body.classList.remove('ui-confirm-open');
      if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
    };
    okBtn.onclick = onOk;
    cancelBtn.onclick = onCancel;

    el.style.display = 'flex';
    document.body.classList.add('ui-confirm-open');

    return new Promise((resolve) => { _confirmResolve = resolve; });
  }

  window.ToeicUi = { toast, confirm };
})(typeof window !== 'undefined' ? window : this);
