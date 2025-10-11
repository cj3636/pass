/**
 * Modern Password Generator - Main JavaScript
 * Enhanced with glass theme interactions and animations
 */

// Will be populated when words js loads
if (typeof WordList === 'undefined') { window.WordList = []; }

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  initializeEventListeners();
  initializeAnimations();
  setupPasswordVisibilityToggles();
  updatePasswordsDisplay();
  initializeToastSystem();
  initializeModalSystem();
  initializeNotifySystem();
}

if (typeof WorldList == "undefined") { WordList = []; }

// Dynamically load a script once by path
function loadScript(path, { id } = {}) {
  if (!path) return false;
  const scriptId = id || path.split('/').pop().split('.').shift();
  if (document.getElementById(scriptId)) return true; // already loaded
  const script = document.createElement('script');
  script.src = path;
  script.id = scriptId;
  script.async = false;
  script.onload = () => console.debug('Loaded script:', path);
  script.onerror = (e) => console.warn('Failed to load script:', path, e);
  document.head.appendChild(script);
  return true;
}

// Replaced by waitForWordList
/*
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
  });
*/
document.addEventListener('DOMContentLoaded', async function () {
  initializeApp();
});
/**
 * Initialize Application
 */
function initializeApp() {
  initializeEventListeners();
  initializeAnimations();
  setupPasswordVisibilityToggles();
  updatePasswordsDisplay();
  initializeToastSystem();
  initializeModalSystem();
}

/**
 * Toast notification system
 */
function initializeToastSystem() {
  window.showToast = function (message, type = 'info', duration = 3500, opts = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const { multiline = false, icon } = opts;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Support array of lines or string with \n
    let lines = [];
    if (Array.isArray(message)) {
      lines = message.map(l => String(l));
    } else if (typeof message === 'string' && (multiline || message.includes('\n'))) {
      lines = message.split(/\n+/).filter(Boolean);
    } else {
      lines = [String(message)];
    }

    if (lines.length > 1) {
      toast.classList.add('toast-rich');
      if (icon) {
        const iconEl = document.createElement('div');
        iconEl.className = 'toast-icon';
        iconEl.textContent = icon;
        toast.appendChild(iconEl);
      }
      const wrap = document.createElement('div');
      wrap.className = 'toast-lines';
      lines.forEach((ln, idx) => {
        const lineEl = document.createElement('div');
        lineEl.className = 'toast-line';
        lineEl.textContent = ln;
        if (idx === 0) lineEl.style.fontWeight = '600';
        wrap.appendChild(lineEl);
      });
      toast.appendChild(wrap);
    } else {
      toast.textContent = lines[0];
    }

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  };

  // Hook for password generation events (word or WSN)
  window.onPasswordGenerated = function (password, { copied = true, type = 'success' } = {}) {
    // Two-line toast: password on first; copied line second
    const lines = copied ? [password, 'Copied to clipboard'] : [password];
    showToast(lines, type, 4500, { multiline: true, icon: '🔑' });
  };
}

/**
 * Number input controls - Make them global for HTML onclick handlers
 */
window.changeLength = function (delta) {
  const input = document.getElementById('length');
  const current = parseInt(input.value) || 4;
  const newValue = Math.max(1, Math.min(256, current + delta));
  input.value = newValue;
};

window.changeSymNum = function (delta) {
  const input = document.getElementById('symNum');
  const current = parseInt(input.value) || 1;
  const newValue = Math.max(1, Math.min(99, current + delta));
  input.value = newValue;
};

window.changeNumNum = function (delta) {
  const input = document.getElementById('numNum');
  const current = parseInt(input.value) || 1;
  const newValue = Math.max(1, Math.min(99, current + delta));
  input.value = newValue;
};

/** Unified password visibility handling using switches */
function setPasswordVisibility(inputEl, visible) {
  if (!inputEl) return;
  inputEl.type = visible ? 'text' : 'password';
}

function attachPasswordSwitchHandlers() {
  // Main password
  const mainSwitch = document.querySelector('.password-switch input#passwordVisible');
  const mainInput = document.getElementById('password');
  if (mainSwitch && mainInput) {
    mainSwitch.addEventListener('change', () => setPasswordVisibility(mainInput, mainSwitch.checked));
  }

  // Dynamic entries (delegation)
  document.addEventListener('change', (e) => {
    const target = e.target;
    if (target.matches('.dynamic-pass-visible')) {
      let field = null;
      // New structure: inside .password-field-wrap
      const wrap = target.closest('.password-field-wrap');
      if (wrap) field = wrap.querySelector('input.password-input');
      if (!field) {
        const container = target.closest('.password-input-container');
        if (container) field = container.querySelector('input.password-input');
      }
      setPasswordVisibility(field, target.checked);
    }
  });
}

/**
 * Initialize all event listeners for the application
 */
function initializeEventListeners() {
  // Generate Word Password button
  const generateWordBtn = document.getElementById('generateWordBtn');
  if (generateWordBtn) {
    generateWordBtn.addEventListener('click', handleGenerateWordPassword);
  }

  // Generate WSN button
  const generateWSNBtn = document.getElementById('generateWSNBtn');
  if (generateWSNBtn) {
    generateWSNBtn.addEventListener('click', function () {
      genWSN();
    });
  }

  // Checkbox toggles for navigation visibility with enhanced animations
  const capCheckbox = document.getElementById('cap');
  if (capCheckbox) {
    capCheckbox.addEventListener('change', function () {
      toggleNavPanel('capAllNav', this.checked);
    });
  }

  const symCheckbox = document.getElementById('sym');
  if (symCheckbox) {
    symCheckbox.addEventListener('change', function () {
      toggleNavPanel('symNumNav', this.checked);
    });
  }

  const numCheckbox = document.getElementById('num');
  if (numCheckbox) {
    numCheckbox.addEventListener('change', function () {
      toggleNavPanel('numNumNav', this.checked);
    });
  }

  // Full row click for setting rows
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.setting-row');
    if (row) {
      if (e.target.tagName === 'INPUT' || e.target.closest('label.toggle-switch')) return; // let native
      const cbId = row.getAttribute('data-checkbox');
      if (!cbId) return;
      const cb = document.getElementById(cbId);
      if (cb) {
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Number button actions
    const btn = e.target.closest('button.number-btn[data-action]');
    if (btn) {
      const action = btn.getAttribute('data-action');
      switch (action) {
        case 'length-inc': changeLength(1); break;
        case 'length-dec': changeLength(-1); break;
        case 'sym-inc': changeSymNum(1); break;
        case 'sym-dec': changeSymNum(-1); break;
        case 'num-inc': changeNumNum(1); break;
        case 'num-dec': changeNumNum(-1); break;
      }
    }
  });

  // Password visibility switches
  attachPasswordSwitchHandlers();

  // Form buttons with enhanced feedback
  const saveBtn = document.querySelector('.saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveEntry);
  }

  const clearBtn = document.querySelector('.clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearForm);
  }

  // Action buttons
  const genBtn = document.getElementById('genBtn');
  if (genBtn) {
    genBtn.addEventListener('click', function () {
      genFakeUserPass();
    });
  }

  const saveAllBtn = document.getElementById('saveAllBtn');
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', function () {
      saveAll();
    });
  }

  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function () {
      tryClearAll();
    });
  }

  // Dynamic elements (for password entries)
  initializeDynamicEventListeners();
}

/**
 * Enhanced navigation panel toggle with smooth animations
 */
function toggleNavPanel(panelId, show) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  if (show) {
    panel.classList.add('show');
    panel.style.display = 'block';
  } else {
    panel.classList.remove('show');
    // Delay hiding to allow animation to complete
    setTimeout(() => {
      if (!panel.classList.contains('show')) {
        panel.style.display = 'none';
      }
    }, 200);
  }
}

// Legacy compatibility wrapper (if older code references togglePasswordVisibility)
function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const makeVisible = field.type === 'password';
  setPasswordVisibility(field, makeVisible);
  // sync main switch if applicable
  if (field.id === 'password') {
    const mainSwitch = document.getElementById('passwordVisible');
    if (mainSwitch) mainSwitch.checked = makeVisible;
  }
}

/**
 * Enhanced save entry handler with validation and feedback
 */
function handleSaveEntry() {
  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validate required fields
  if (!password) {
    showFeedback('Password is required!', 'error');
    document.getElementById('password').focus();
    return;
  }

  // Set default values if empty
  const finalName = name || 'Unnamed';
  const finalUsername = username || 'user';

  // Update fields with final values
  document.getElementById('name').value = finalName;
  document.getElementById('username').value = finalUsername;

  // Call the original function
  addPasswordEntry();

  // Show success feedback
  showFeedback(`Entry "${finalName}" saved successfully!`, 'success');
}

/**
 * Enhanced clear form handler
 */
function handleClearForm() {
  clearInputs();
  showFeedback('Form cleared', 'info');
}

/**
 * Show user feedback with modern styling
 */
function showFeedback(message, type = 'info', opts = {}) {
  const { toast = false, duration = 3500 } = opts;
  if (toast && window.showToast) return window.showToast(message, type, duration);
  const headerStatus = document.getElementById('headerStatus');
  const textEl = document.getElementById('headerStatusText');
  const iconEl = document.getElementById('headerStatusIcon');
  if (headerStatus && textEl) {
    const icons = { success: '✓', error: '⚠', info: 'ℹ' };
    textEl.textContent = message;
    iconEl.textContent = icons[type] || icons.info;
    headerStatus.classList.remove('success', 'error', 'info');
    headerStatus.classList.add('show', type);
    headerStatus.hidden = false;
    clearTimeout(headerStatus._hideTimer);
    headerStatus._hideTimer = setTimeout(() => {
      headerStatus.classList.remove('show');
      setTimeout(() => { if (!headerStatus.classList.contains('show')) headerStatus.hidden = true; }, 400);
    }, duration);
  }
}

/**
 * Enhanced dynamic event listeners with better delegation
 */
function initializeDynamicEventListeners() {
  // Use event delegation for dynamically created elements
  document.addEventListener('click', function (event) {
    const target = event.target;

    // Handle save button clicks on dynamic password entries
    if (target.classList.contains('btn-save') && target.id.includes('save_')) {
      const formId = target.closest('form').id;
      editPasswordEntry(formId);
      showFeedback('Password entry updated', 'success');
    }

    // Handle delete button clicks on dynamic password entries
    if (target.classList.contains('btn-delete') && target.id.includes('delete_')) {
      const formId = target.closest('form').id;
      const entryName = target.closest('form').querySelector('input[placeholder="Name"]').value || 'entry';
      customConfirm(`Delete password entry for "${entryName}"?`, { okText: 'Delete', okType: 'danger' })
        .then(ok => { if (ok) { deletePasswordEntry(formId); showFeedback('Password entry deleted', 'info'); } });
    }
  });
  // Dynamic password visibility handled by attachPasswordSwitchHandlers
}

/**
 * Toggle password visibility for dynamic entries
 */
// Removed old toggleDynamicPasswordVisibility (replaced by setPasswordVisibility)

/**
 * Enhanced password generation handler
 */
function handleGenerateWordPassword() {
  const length = parseInt(document.getElementById('length').value);
  const cap = document.getElementById('cap').checked;
  const capAll = document.getElementById('capAll').checked;
  const sym = document.getElementById('sym').checked;
  const symNum = parseInt(document.getElementById('symNum').value);
  const symSimple = document.getElementById('symSimple').checked;
  const num = document.getElementById('num').checked;
  const numNum = parseInt(document.getElementById('numNum').value);

  // Validate inputs
  if (length < 1 || length > 256) {
    showToast('Length must be between 1 and 256', 'error');
    return;
  }

  // Generate password
  const password = genWordPassword(length, cap, capAll, sym, symNum, symSimple, num, numNum);
  window.showFeedback(`Generated ${length}-word password`, 'success');
  if (window.onPasswordGenerated) window.onPasswordGenerated(password, { copied: true });
}

/**
 * Initialize animations and visual enhancements
 */
function initializeAnimations() {
  // Add smooth transitions to all buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-1px)';
    });

    button.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });

  // Add focus animations to inputs
  const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function () {
      this.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
      this.style.transform = 'scale(1)';
    });
  });
}

/**
 * Setup password visibility toggles
 */
function setupPasswordVisibilityToggles() {
  attachPasswordSwitchHandlers();
}

/**
 * Update the passwords display section visibility
 */
function updatePasswordsDisplay() {
  const passwordsSection = document.getElementById('passwordsSection');
  const passwordsContainer = document.getElementById('passwords');

  if (passwordsSection && passwordsContainer) {
    // Show/hide the passwords section based on whether there are any passwords
    const observer = new MutationObserver(function (mutations) {
      const hasPasswords = passwordsContainer.children.length > 0;
      passwordsSection.style.display = hasPasswords ? 'block' : 'none';
    });

    observer.observe(passwordsContainer, { childList: true });
  }
}

/**
 * Dynamically load pass.js script
 */
function loadPasswordScript() {
  loadScript('js/pass.js');
}

/**
 * Enhanced utility functions
 */
function getElementValue(id, defaultValue = '') {
  const element = document.getElementById(id);
  return element ? element.value : defaultValue;
}

function setElementValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
    // Add visual feedback for value changes
    element.style.background = 'rgba(122, 162, 255, 0.1)';
    setTimeout(() => {
      element.style.background = '';
    }, 300);
  }
}

// Override the original toggle function to use enhanced version
window.toggle = function (id) {
  const element = document.getElementById(id);
  if (element) {
    const isHidden = element.hasAttribute('hidden') || element.style.display === 'none';
    toggleNavPanel(id, isHidden);
  }
};

// Override the original togglePass function
window.togglePass = function (fieldId) { togglePasswordVisibility(fieldId || 'password'); };

// Override clipboard and feedback functions
window.addEventListener('load', function () {
  // Override copyToClipBoard function
  if (window.copyToClipBoard) {
    const originalCopyToClipBoard = window.copyToClipBoard;
    window.copyToClipBoard = function (text) {
      navigator.clipboard.writeText(text).then(() => {
        showFeedback('Copied to Clipboard!', 'success');
        showToast(text, 'info');
      }).catch(() => {
        showFeedback('Failed to Copy to Clipboard!', 'error');
        showToast(text, 'error');
      });
    };
  }

  // Override newPasswordEntry to fix field ordering
  if (window.newPasswordEntry) {
    window.newPasswordEntry = function (name, user, pass, id) {
      let clone = document.getElementById('passEntry_').cloneNode(true);
      clone.id = clone.id + id;
      clone.name = clone.name + id;

      // Fix the field assignment by using specific selectors
      const nameField = clone.querySelector('input[placeholder="Name"]');
      const usernameField = clone.querySelector('input[placeholder="Username"]');
      const passwordField = clone.querySelector('input[placeholder="Password"]');

      if (nameField) nameField.value = name;
      if (usernameField) usernameField.value = user;
      if (passwordField) passwordField.value = pass;

      // Update IDs for all elements
      const allElements = clone.querySelectorAll('[id]');
      allElements.forEach(element => {
        if (element.id && !element.id.endsWith(id)) {
          element.id = element.id + id;
        }
      });
      // Ensure embedded structure exists
      const pwdField = clone.querySelector('#password_' + id);
      if (pwdField && !pwdField.closest('.password-field-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'password-field-wrap';
        const slot = document.createElement('div');
        slot.className = 'embedded-switch-slot';
        const label = document.createElement('label');
        label.className = 'toggle-switch password-switch compact';
        label.title = 'Show/Hide';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'dynamic-pass-visible';
        input.setAttribute('data-target', pwdField.id);
        const span = document.createElement('span');
        span.className = 'toggle-slider';
        label.appendChild(input); label.appendChild(span);
        slot.appendChild(label);
        pwdField.classList.add('embedded-switch');
        pwdField.parentNode.insertBefore(wrap, pwdField);
        wrap.appendChild(pwdField);
        wrap.appendChild(slot);
      }

      // ensure password switch works in cloned entry
      return clone;
    };
  }
});

// Enhanced password list update function
const originalUpdatePasswords = window.updatePasswords;
if (originalUpdatePasswords) {
  window.updatePasswords = function () {
    originalUpdatePasswords();
    // Trigger display update
    updatePasswordsDisplay();
  };
}

/** Modal System (alert/confirm/prompt replacements) */
function initializeModalSystem() {
  // Inject modal HTML if not present
  if (!document.getElementById('dialogModal')) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `\n<div class="modal" id="dialogModal" aria-hidden="true">\n  <div class="modal-card dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialogTitle">\n    <h3 id="dialogTitle" class="dialog-title">Dialog</h3>\n    <div class="dialog-message" id="dialogMessage"></div>\n    <div class="dialog-input-wrap" id="dialogInputWrap" style="display:none;">\n      <input type="text" id="dialogInput" autocomplete="off" />\n    </div>\n    <div class="modal-actions dialog-actions">\n      <button class="btn" id="dialogCancel">Cancel</button>\n      <button class="btn primary" id="dialogOk">OK</button>\n    </div>\n  </div>\n</div>`;
    document.body.appendChild(wrapper.firstElementChild);
  }

  const modal = document.getElementById('dialogModal');
  const titleEl = document.getElementById('dialogTitle');
  const messageEl = document.getElementById('dialogMessage');
  const inputWrap = document.getElementById('dialogInputWrap');
  const inputEl = document.getElementById('dialogInput');
  const okBtn = document.getElementById('dialogOk');
  const cancelBtn = document.getElementById('dialogCancel');

  function openModal({ title, message, showInput = false, okText = 'OK', cancelText = 'Cancel', okType }) {
    titleEl.textContent = title;
    messageEl.textContent = message;
    inputWrap.style.display = showInput ? 'block' : 'none';
    inputEl.value = '';
    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;
    okBtn.classList.toggle('danger', okType === 'danger');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (showInput) setTimeout(() => inputEl.focus(), 30); else okBtn.focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function customAlert(message, title = 'Alert') {
    return new Promise(resolve => {
      openModal({ title, message });
      function handleOk() { cleanup(); resolve(); }
      function handleCancel() { cleanup(); resolve(); }
      function onKey(e) { if (e.key === 'Escape') { handleCancel(); } if (e.key === 'Enter') { handleOk(); } }
      function cleanup() { okBtn.removeEventListener('click', handleOk); cancelBtn.removeEventListener('click', handleCancel); document.removeEventListener('keydown', onKey); closeModal(); }
      okBtn.addEventListener('click', handleOk); cancelBtn.addEventListener('click', handleCancel); document.addEventListener('keydown', onKey);
    });
  }
  function customConfirm(message, { title = 'Confirm', okText = 'OK', cancelText = 'Cancel', okType } = {}) {
    return new Promise(resolve => {
      openModal({ title, message, okText, cancelText, okType });
      function handleOk() { cleanup(); resolve(true); }
      function handleCancel() { cleanup(); resolve(false); }
      function onKey(e) { if (e.key === 'Escape') { handleCancel(); } if (e.key === 'Enter') { handleOk(); } }
      function cleanup() { okBtn.removeEventListener('click', handleOk); cancelBtn.removeEventListener('click', handleCancel); document.removeEventListener('keydown', onKey); closeModal(); }
      okBtn.addEventListener('click', handleOk); cancelBtn.addEventListener('click', handleCancel); document.addEventListener('keydown', onKey);
    });
  }
  function customPrompt(message, { title = 'Prompt', placeholder = '', okText = 'OK', cancelText = 'Cancel' } = {}) {
    return new Promise(resolve => {
      openModal({ title, message, showInput: true, okText, cancelText });
      inputEl.placeholder = placeholder;
      function handleOk() { const v = inputEl.value; cleanup(); resolve(v); }
      function handleCancel() { cleanup(); resolve(null); }
      function onKey(e) { if (e.key === 'Escape') { handleCancel(); } if (e.key === 'Enter') { handleOk(); } }
      function cleanup() { okBtn.removeEventListener('click', handleOk); cancelBtn.removeEventListener('click', handleCancel); document.removeEventListener('keydown', onKey); closeModal(); }
      okBtn.addEventListener('click', handleOk); cancelBtn.addEventListener('click', handleCancel); document.addEventListener('keydown', onKey);
    });
  }

  // Expose
  window.customAlert = customAlert;
  window.customConfirm = customConfirm;
  window.customPrompt = customPrompt;

  // Override native (non-blocking semantics compared to real ones)
  window.alert = (msg) => { customAlert(String(msg)); };
  window.confirm = (msg) => { console.warn('confirm() overridden; use customConfirm directly'); customConfirm(String(msg)).then(() => { }); return true; };
  window.prompt = (msg, def = '') => { console.warn('prompt() overridden; use customPrompt directly'); customPrompt(String(msg), { placeholder: def }).then(() => { }); return def; };
}

// wait for WordList variable to be ready
(function waitForWordList() {
  if (WordList && Array.isArray(WordList) && WordList.length > 0) {
    const scriptTag = document.getElementById('wordListScript');
    window.WordList = WordList;
    console.info('WordList loaded!');
    console.log('List:', scriptTag.src.split('/').pop() || 'UNKNOWN');
    console.log('Words:', WordList.length, 'words.');
    initializeApp();
    loadPasswordScript();
  } else {
    console.log('WordList Loading...');
    setTimeout(waitForWordList, 100);
  }
})();
