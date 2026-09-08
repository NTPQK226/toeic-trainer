/**
 * VIP Custom Select Dropdown Component
 * Replaces native OS dropdown popups with fully styled modern UI menus.
 */

(function (window) {
  'use strict';

  const CHEVRON_SVG = '<svg class="cs-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  const CHECK_SVG = '<svg class="cs-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function closeAllCustomSelects() {
    document.querySelectorAll('.custom-select-container.open').forEach(container => {
      container.classList.remove('open');
      const menu = container.querySelector('.custom-select-dropdown');
      if (menu) menu.style.display = 'none';
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-container')) {
      closeAllCustomSelects();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCustomSelects();
    }
  });

  function setupCustomSelect(selectEl) {
    if (!selectEl || selectEl.dataset.customized === 'true') return;

    selectEl.dataset.customized = 'true';
    selectEl.style.display = 'none'; // Hide native select

    // Create container wrapper
    const container = document.createElement('div');
    container.className = 'custom-select-container';
    if (selectEl.id) container.setAttribute('data-for', selectEl.id);
    
    // Copy dimensions
    if (selectEl.style.maxWidth) container.style.maxWidth = selectEl.style.maxWidth;
    if (selectEl.style.minWidth) container.style.minWidth = selectEl.style.minWidth;
    if (selectEl.style.flex) container.style.flex = selectEl.style.flex;
    if (selectEl.style.width) container.style.width = selectEl.style.width;

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'cs-label-text';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'cs-icon-wrapper';
    iconSpan.innerHTML = CHEVRON_SVG;

    trigger.appendChild(labelSpan);
    trigger.appendChild(iconSpan);

    // Dropdown list
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.style.display = 'none';

    container.appendChild(trigger);
    container.appendChild(dropdown);

    // Insert container before select, then place select inside container
    selectEl.parentNode.insertBefore(container, selectEl);
    container.appendChild(selectEl);

    function updateLabel() {
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      labelSpan.textContent = selectedOpt ? selectedOpt.textContent : (selectEl.options[0]?.textContent || 'Chọn...');
      labelSpan.title = labelSpan.textContent;
    }

    function renderDropdownOptions() {
      dropdown.innerHTML = '';
      
      const children = Array.from(selectEl.children);
      if (children.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'cs-empty-item';
        emptyItem.textContent = 'Không có lựa chọn';
        dropdown.appendChild(emptyItem);
        return;
      }

      children.forEach(child => {
        if (child.tagName.toLowerCase() === 'optgroup') {
          const groupHeader = document.createElement('div');
          groupHeader.className = 'cs-optgroup-label';
          groupHeader.textContent = child.label;
          dropdown.appendChild(groupHeader);

          Array.from(child.children).forEach(opt => {
            renderSingleOption(opt, dropdown);
          });
        } else if (child.tagName.toLowerCase() === 'option') {
          renderSingleOption(child, dropdown);
        }
      });
    }

    function renderSingleOption(opt, parentList) {
      const item = document.createElement('div');
      item.className = 'cs-option-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', opt.value);

      if (opt.selected || opt.value === selectEl.value) {
        item.classList.add('selected');
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'cs-option-text';
      textSpan.textContent = opt.textContent;

      const checkSpan = document.createElement('span');
      checkSpan.className = 'cs-option-check';
      checkSpan.innerHTML = CHECK_SVG;

      item.appendChild(textSpan);
      item.appendChild(checkSpan);

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.value = opt.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateLabel();
        closeAllCustomSelects();
      });

      parentList.appendChild(item);
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      closeAllCustomSelects();

      if (!isOpen) {
        renderDropdownOptions();
        updateLabel();
        container.classList.add('open');
        dropdown.style.display = 'block';

        const selectedItem = dropdown.querySelector('.cs-option-item.selected');
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: 'nearest' });
        }
      }
    });

    selectEl.addEventListener('change', () => {
      updateLabel();
    });

    // Intercept .value property assignments to update label instantly
    try {
      const origDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (origDescriptor && origDescriptor.set) {
        Object.defineProperty(selectEl, 'value', {
          get() {
            return origDescriptor.get.call(this);
          },
          set(val) {
            origDescriptor.set.call(this, val);
            updateLabel();
          },
          configurable: true
        });
      }
    } catch (err) {
      // Fallback
    }

    const observer = new MutationObserver(() => {
      updateLabel();
    });
    observer.observe(selectEl, { childList: true, subtree: true, attributes: true });

    updateLabel();
  }

  function initAll() {
    document.querySelectorAll('select.custom-select').forEach(setupCustomSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    setTimeout(initAll, 50);
  }

  window.CustomSelect = {
    init: initAll,
    setup: setupCustomSelect,
    closeAll: closeAllCustomSelects
  };

})(window);
