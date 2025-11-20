/**
 * Password Generator v2
 * Streamlined, modular front-end logic focused on WSN workflow.
 */
(() => {
  'use strict';

  const StorageKeys = {
    entries: 'pass:savedEntries',
    autoSave: 'pass:autoSave',
    lastGenerated: 'pass:lastGenerated'
  };

  const state = {
    initialized: false,
    entries: [],
    autoSave: true,
    lastGenerated: '',
    wordListReady: false
  };

  const elements = {};

  const numberControls = {
    'length-inc': { id: 'length', delta: 1, min: 1, max: 256 },
    'length-dec': { id: 'length', delta: -1, min: 1, max: 256 },
    'sym-inc': { id: 'symNum', delta: 1, min: 1, max: 99 },
    'sym-dec': { id: 'symNum', delta: -1, min: 1, max: 99 },
    'num-inc': { id: 'numNum', delta: 1, min: 1, max: 99 },
    'num-dec': { id: 'numNum', delta: -1, min: 1, max: 99 }
  };

  const SIMPLE_SYMBOLS = '!#$&-_';
  const ALL_SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (state.initialized) return;
    state.initialized = true;

    cacheElements();
    setWordListStatus('loading');
    Storage.load();
    Form.init();
    Settings.init();
    PasswordList.init();
    Toasts.init();
    Dialogs.init();
    Visibility.init();
    bindStaticEvents();
    Settings.sync();
    Form.syncFromState();

    WordListLoader.wait()
      .then(list => {
        state.wordListReady = true;
        setWordListStatus('ready');
        console.info(`Word list ready (${list.length} words)`);
      })
      .catch(() => {
        setWordListStatus('error');
        showFeedback('Dictionary failed to load', 'error', { toast: true });
      });
  }

  function cacheElements() {
    elements.generateWordBtn = document.getElementById('generateWordBtn');
    elements.generateWSNBtn = document.getElementById('generateWSNBtn');
    elements.saveBtn = document.querySelector('.saveBtn');
    elements.clearBtn = document.querySelector('.clearBtn');
    elements.genBtn = document.getElementById('genBtn');
    elements.exportBtn = document.getElementById('exportBtn');
    elements.importBtn = document.getElementById('importBtn');
    elements.clearAllBtn = document.getElementById('clearAllBtn');
    elements.autoSaveToggle = document.getElementById('autoSaveToggle');
    elements.storageStatus = document.getElementById('storageStatus');
    elements.passwordsSection = document.getElementById('passwordsSection');
    elements.passwordsContainer = document.getElementById('passwords');
    elements.passwordTemplate = document.getElementById('passwordEntryTemplate');
    elements.wordListStatus = document.getElementById('wordListStatus');
  }

  function bindStaticEvents() {
    elements.generateWordBtn?.addEventListener('click', handleGenerateWordPassword);
    elements.generateWSNBtn?.addEventListener('click', handleGenerateWSN);
    elements.saveBtn?.addEventListener('click', () => Form.handleSave());
    elements.clearBtn?.addEventListener('click', () => {
      Form.clear();
      showFeedback('Form cleared', 'info');
    });
    elements.genBtn?.addEventListener('click', handleGenerateAndAdd);
    elements.exportBtn?.addEventListener('click', () => PasswordList.exportEntries());
    elements.importBtn?.addEventListener('click', () => PasswordList.importEntries());
    elements.clearAllBtn?.addEventListener('click', () => PasswordList.clearAll());
    elements.autoSaveToggle?.addEventListener('change', event => Settings.handleAutoSave(event));

    initializeSettingPanels();
    document.addEventListener('click', handleGlobalClicks);
  }

  function initializeSettingPanels() {
    const map = { cap: 'capAllNav', sym: 'symNumNav', num: 'numNumNav' };
    Object.entries(map).forEach(([checkboxId, panelId]) => {
      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;
      toggleNavPanel(panelId, checkbox.checked);
      checkbox.addEventListener('change', () => toggleNavPanel(panelId, checkbox.checked));
    });
  }

  function handleGlobalClicks(event) {
    const numberBtn = event.target.closest('button.number-btn[data-action]');
    if (numberBtn) {
      handleNumberButton(numberBtn.getAttribute('data-action'));
      return;
    }

    const settingRow = event.target.closest('.setting-row');
    if (settingRow) {
      if (event.target.closest('.nav-panel')) return;
      if (event.target.closest('.number-input-container')) return;
      if (event.target.closest('.toggle-switch')) return;
      if (event.target.closest('button')) return;
      const headerArea = settingRow.querySelector('.full-click');
      if (headerArea && !event.target.closest('.full-click')) return;
      const checkboxId = settingRow.getAttribute('data-checkbox');
      if (!checkboxId) return;
      const labelFor = event.target.closest('label[for]');
      if (labelFor && labelFor.getAttribute('for') === checkboxId) return;
      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function handleNumberButton(action) {
    const config = numberControls[action];
    if (!config) return;
    const input = document.getElementById(config.id);
    if (!input) return;
    const current = parseInt(input.value, 10);
    const next = clamp(isNaN(current) ? config.min : current + config.delta, config.min, config.max);
    input.value = next;
  }

  function handleGenerateWSN() {
    const password = Generators.wsn();
    handlePasswordCreated(password, { label: 'WSN password' });
  }

  function handleGenerateWordPassword() {
    if (!state.wordListReady) {
      showFeedback('Word list loading, try again shortly', 'info', { toast: true });
      return;
    }
    console.log('Generating word password');
    const settings = {
      length: readNumberValue('length', 4, 1, 256),
      cap: document.getElementById('cap')?.checked || false,
      capAll: document.getElementById('capAll')?.checked || false,
      sym: document.getElementById('sym')?.checked || false,
      symNum: readNumberValue('symNum', 1, 1, 99),
      symSimple: document.getElementById('symSimple')?.checked ?? true,
      num: document.getElementById('num')?.checked || false,
      numNum: readNumberValue('numNum', 2, 1, 99)
    };
    const password = Generators.wordPassword(settings);
    handlePasswordCreated(password, { label: `${settings.length}-word password` });
  }

  function handleGenerateAndAdd() {
    const password = Generators.wsn();
    handlePasswordCreated(password, { label: 'Generated entry' });
    const entry = {
      id: createId(),
      name: FakeWords.generate(6, true),
      username: FakeWords.generate(6, false).toLowerCase(),
      password
    };
    PasswordList.add(entry);
    showFeedback('Generated and saved entry', 'success', { toast: true });
  }

  function handlePasswordCreated(password, meta = {}) {
    if (!password) return;
    Form.setPassword(password);
    state.lastGenerated = password;
    Storage.persistLast(password);
    Clipboard.copy(password)
      .then(() => {
        window.onPasswordGenerated?.(password, { copied: true, type: 'success' });
      })
      .catch(() => {
        window.onPasswordGenerated?.(password, { copied: false, type: 'warning' });
      });
    showFeedback(meta.label || 'Password generated', 'info');
  }

  function readNumberValue(id, fallback, min, max) {
    const el = document.getElementById(id);
    const value = el ? parseInt(el.value, 10) : NaN;
    return clamp(isNaN(value) ? fallback : value, min, max);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  const Storage = {
    load() {
      try {
        state.autoSave = readBoolean(localStorage.getItem(StorageKeys.autoSave), true);
        state.entries = normalizeEntries(readJson(localStorage.getItem(StorageKeys.entries)));
      } catch (err) {
        console.warn('Unable to read saved entries', err);
        state.autoSave = true;
        state.entries = [];
      }
      state.lastGenerated = readSessionValue(StorageKeys.lastGenerated);
    },
    persistEntries(opts = {}) {
      if (!state.autoSave && !opts.force) return;
      try {
        localStorage.setItem(StorageKeys.entries, JSON.stringify(state.entries));
      } catch (err) {
        console.warn('Unable to persist entries', err);
      }
    },
    clearEntries() {
      try {
        localStorage.removeItem(StorageKeys.entries);
      } catch (_) { /* ignore */ }
    },
    persistAutoSave(flag) {
      try {
        localStorage.setItem(StorageKeys.autoSave, flag ? '1' : '0');
      } catch (_) { /* ignore */ }
    },
    persistLast(password) {
      try {
        sessionStorage.setItem(StorageKeys.lastGenerated, password);
      } catch (_) { /* ignore */ }
    }
  };

  const Form = {
    init() {
      this.nameInput = document.getElementById('name');
      this.usernameInput = document.getElementById('username');
      this.passwordInput = document.getElementById('password');
    },
    collect() {
      return {
        id: createId(),
        name: this.nameInput?.value.trim() || 'Unnamed',
        username: this.usernameInput?.value.trim() || 'user',
        password: this.passwordInput?.value.trim() || ''
      };
    },
    handleSave() {
      const entry = this.collect();
      if (!entry.password) {
        showFeedback('Password is required', 'error');
        this.passwordInput?.focus();
        return;
      }
      PasswordList.add(entry);
      this.clear();
      this.setPassword(entry.password);
      showFeedback(`Entry "${entry.name}" saved`, 'success');
    },
    clear() {
      if (this.nameInput) this.nameInput.value = '';
      if (this.usernameInput) this.usernameInput.value = '';
      if (this.passwordInput) this.passwordInput.value = '';
    },
    setPassword(value) {
      if (this.passwordInput) {
        this.passwordInput.value = value;
      }
    },
    syncFromState() {
      if (state.lastGenerated && this.passwordInput) {
        this.passwordInput.value = state.lastGenerated;
      }
    }
  };

  const Settings = {
    init() {
      this.autoSaveToggle = elements.autoSaveToggle;
      this.storageStatus = elements.storageStatus;
    },
    sync() {
      if (this.autoSaveToggle) {
        this.autoSaveToggle.checked = state.autoSave;
      }
      updateStorageStatus();
    },
    handleAutoSave(event) {
      const enabled = !!event.target.checked;
      state.autoSave = enabled;
      Storage.persistAutoSave(enabled);
      if (enabled) {
        Storage.persistEntries({ force: true });
      } else {
        Storage.clearEntries();
      }
      updateStorageStatus();
      showFeedback(enabled ? 'Auto-save enabled' : 'Auto-save disabled', enabled ? 'success' : 'info');
    }
  };

  const PasswordList = {
    init() {
      this.container = elements.passwordsContainer;
      this.section = elements.passwordsSection;
      this.template = elements.passwordTemplate;
      this.importInput = null;
      if (this.container) {
        this.container.addEventListener('click', event => this.handleClick(event));
        this.container.addEventListener('change', event => this.handleChange(event));
      }
      this.render();
    },
    handleClick(event) {
      const form = event.target.closest('form.password-entry');
      if (!form) return;
      if (event.target.closest('.btn-save')) {
        this.saveExisting(form);
      } else if (event.target.closest('.btn-delete')) {
        this.requestDelete(form);
      }
    },
    handleChange(event) {
      if (event.target.classList.contains('entry-visible-toggle')) {
        const form = event.target.closest('form.password-entry');
        const input = form?.querySelector('.entry-password');
        Visibility.set(input, event.target.checked);
      }
    },
    add(entry) {
      state.entries.push(buildEntry(entry));
      this.render();
      Storage.persistEntries();
    },
    saveExisting(form) {
      const payload = this.collectFormData(form);
      const idx = state.entries.findIndex(entry => entry.id === payload.id);
      if (idx === -1) return;
      state.entries[idx] = payload;
      this.render();
      Storage.persistEntries();
      showFeedback(`Entry "${payload.name}" updated`, 'success');
    },
    requestDelete(form) {
      const entryId = form.dataset.entryId;
      const entry = state.entries.find(item => item.id === entryId);
      const label = entry?.name || 'entry';
      const remove = () => {
        state.entries = state.entries.filter(item => item.id !== entryId);
        this.render();
        Storage.persistEntries();
        showFeedback(`Deleted "${label}"`, 'info');
      };
      if (window.customConfirm) {
        customConfirm(`Delete password entry "${label}"?`, {
          okText: 'Delete',
          okType: 'danger'
        }).then(ok => { if (ok) remove(); });
      } else if (window.confirm(`Delete password entry "${label}"?`)) {
        remove();
      }
    },
    clearAll() {
      if (!state.entries.length) {
        showFeedback('No saved passwords to clear', 'info');
        return;
      }
      const wipe = () => {
        state.entries = [];
        this.render();
        Storage.persistEntries({ force: true });
        showFeedback('All saved passwords cleared', 'info');
      };
      if (window.customConfirm) {
        customConfirm('Remove all saved passwords?', {
          title: 'Clear Passwords',
          okText: 'Clear All',
          okType: 'danger'
        }).then(ok => { if (ok) wipe(); });
      } else if (window.confirm('Remove all saved passwords?')) {
        wipe();
      }
    },
    exportEntries() {
      if (!state.entries.length) {
        showFeedback('No passwords to export', 'info');
        return;
      }
      const payload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        entries: state.entries
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `passwords-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      showFeedback('Passwords exported', 'success', { toast: true });
    },
    importEntries() {
      if (!this.importInput) {
        this.importInput = createImportInput(files => this.handleImport(files));
      }
      this.importInput.value = '';
      this.importInput.click();
    },
    handleImport(files) {
      const file = files?.[0];
      if (!file) return;
      file.text().then(text => {
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          throw new Error('Invalid import file');
        }
        const incoming = normalizeEntries(parsed.entries || parsed);
        if (!incoming.length) {
          throw new Error('Import file has no entries');
        }
        state.entries = incoming;
        this.render();
        Storage.persistEntries({ force: true });
        showFeedback(`Imported ${incoming.length} password(s)`, 'success', { toast: true });
      }).catch(err => {
        console.error(err);
        showFeedback(err.message || 'Import failed', 'error', { toast: true });
      });
    },
    render() {
      if (!this.container) return;
      this.container.innerHTML = '';
      if (!state.entries.length) {
        if (this.section) this.section.style.display = 'none';
        return;
      }
      const fragment = document.createDocumentFragment();
      state.entries.forEach(entry => fragment.appendChild(this.createEntryNode(entry)));
      this.container.appendChild(fragment);
      if (this.section) this.section.style.display = 'block';
    },
    createEntryNode(entry) {
      let form;
      if (this.template && this.template.content) {
        const node = this.template.content.cloneNode(true);
        form = node.querySelector('form');
      }
      if (!form) {
        form = document.createElement('form');
        form.className = 'password-entry';
      }
      form.dataset.entryId = entry.id;
      const nameInput = form.querySelector('.entry-name');
      const userInput = form.querySelector('.entry-username');
      const passInput = form.querySelector('.entry-password');
      if (nameInput) nameInput.value = entry.name;
      if (userInput) userInput.value = entry.username;
      if (passInput) passInput.value = entry.password;
      return form;
    },
    collectFormData(form) {
      return {
        id: form.dataset.entryId || createId(),
        name: form.querySelector('.entry-name')?.value.trim() || 'Unnamed',
        username: form.querySelector('.entry-username')?.value.trim() || 'user',
        password: form.querySelector('.entry-password')?.value.trim() || ''
      };
    }
  };

  const Visibility = {
    init() {
      const toggle = document.getElementById('passwordVisible');
      const input = document.getElementById('password');
      if (toggle && input) {
        this.set(input, toggle.checked);
        toggle.addEventListener('change', () => this.set(input, toggle.checked));
      }
    },
    set(input, visible) {
      if (!input) return;
      input.type = visible ? 'text' : 'password';
    }
  };

  const Clipboard = {
    copy(text) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text);
      }
      return new Promise((resolve, reject) => {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('Copy failed'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  };

  const Toasts = {
    init() {
      window.showToast = function (message, type = 'info', duration = 3500, opts = {}) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const { multiline = false, icon } = opts;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const lines = Array.isArray(message)
          ? message.map(line => String(line))
          : (typeof message === 'string' && (multiline || message.includes('\n')))
            ? message.split(/\n+/).filter(Boolean)
            : [String(message)];

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
          lines.forEach((line, idx) => {
            const row = document.createElement('div');
            row.className = 'toast-line';
            row.textContent = line;
            if (idx === 0) row.style.fontWeight = '600';
            wrap.appendChild(row);
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

      window.onPasswordGenerated = function (password, { copied = true, type = 'success' } = {}) {
        const lines = copied ? [password, 'Copied to clipboard'] : [password, 'Copy failed'];
        window.showToast(lines, type, 4500, { multiline: true, icon: copied ? '🔐' : '⚠️' });
      };
    }
  };

  const Dialogs = {
    init() {
      if (!document.getElementById('dialogModal')) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
<div class="modal" id="dialogModal" aria-hidden="true">
  <div class="modal-card dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialogTitle">
    <h3 id="dialogTitle" class="dialog-title">Dialog</h3>
    <div class="dialog-message" id="dialogMessage"></div>
    <div class="dialog-input-wrap" id="dialogInputWrap" style="display:none;">
      <input type="text" id="dialogInput" autocomplete="off" />
    </div>
    <div class="modal-actions dialog-actions">
      <button class="btn" id="dialogCancel">Cancel</button>
      <button class="btn primary" id="dialogOk">OK</button>
    </div>
  </div>
</div>`;
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
        if (showInput) {
          setTimeout(() => inputEl.focus(), 30);
        } else {
          okBtn.focus();
        }
      }

      function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }

      window.customAlert = function (message, title = 'Alert') {
        return new Promise(resolve => {
          openModal({ title, message });
          function cleanup() {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', onKey);
            closeModal();
            resolve();
          }
          function handleOk() { cleanup(); }
          function handleCancel() { cleanup(); }
          function onKey(e) {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleOk();
          }
          okBtn.addEventListener('click', handleOk);
          cancelBtn.addEventListener('click', handleCancel);
          document.addEventListener('keydown', onKey);
        });
      };

      window.customConfirm = function (message, { title = 'Confirm', okText = 'OK', cancelText = 'Cancel', okType } = {}) {
        return new Promise(resolve => {
          openModal({ title, message, okText, cancelText, okType });
          function cleanup(result) {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', onKey);
            closeModal();
            resolve(result);
          }
          function handleOk() { cleanup(true); }
          function handleCancel() { cleanup(false); }
          function onKey(e) {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleOk();
          }
          okBtn.addEventListener('click', handleOk);
          cancelBtn.addEventListener('click', handleCancel);
          document.addEventListener('keydown', onKey);
        });
      };

      window.customPrompt = function (message, { title = 'Prompt', placeholder = '', okText = 'OK', cancelText = 'Cancel' } = {}) {
        return new Promise(resolve => {
          openModal({ title, message, showInput: true, okText, cancelText });
          inputEl.placeholder = placeholder;
          function cleanup(result) {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', onKey);
            closeModal();
            resolve(result);
          }
          function handleOk() { cleanup(inputEl.value); }
          function handleCancel() { cleanup(null); }
          function onKey(e) {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleOk();
          }
          okBtn.addEventListener('click', handleOk);
          cancelBtn.addEventListener('click', handleCancel);
          document.addEventListener('keydown', onKey);
        });
      };

      window.alert = msg => window.customAlert(String(msg));
      window.confirm = msg => { console.warn('confirm() overridden; use customConfirm'); window.customConfirm(String(msg)); return true; };
      window.prompt = (msg, def = '') => { console.warn('prompt() overridden; use customPrompt'); window.customPrompt(String(msg), { placeholder: def }); return def; };
    }
  };

  const WordListLoader = (() => {
    let cache = [];
    let promise;
    const buckets = new Map();

    function wait() {
      if (!promise) {
        promise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Word list timeout')), 15000);
          const poll = () => {
            if (Array.isArray(window.WordList) && window.WordList.length) {
              clearTimeout(timeout);
              cache = window.WordList.slice();
              resolve(cache);
            } else {
              setTimeout(poll, 80);
            }
          };
          poll();
        });
      }
      return promise;
    }

    function pickWord(maxLength = 0) {
      if (!cache.length) return null;
      if (!maxLength || maxLength <= 0) {
        return cache[Math.floor(Math.random() * cache.length)];
      }
      let bucket = buckets.get(maxLength);
      if (!bucket) {
        bucket = cache.filter(word => word.length <= maxLength);
        buckets.set(maxLength, bucket);
      }
      const source = bucket.length ? bucket : cache;
      return source[Math.floor(Math.random() * source.length)];
    }

    return { wait, pickWord };
  })();

  const FakeWords = (() => {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnprstvwxyz';

    function generate(length = 6, capitalizeFirst = false) {
      let word = '';
      let useVowel = false;
      for (let i = 0; i < length; i++) {
        const source = useVowel ? vowels : consonants;
        let letter = source[Math.floor(Math.random() * source.length)];
        if (capitalizeFirst && i === 0) {
          letter = letter.toUpperCase();
        }
        word += letter;
        useVowel = !useVowel;
      }
      return word;
    }

    return { generate };
  })();

  const Generators = {
    wsn() {
      const word = FakeWords.generate(6, true);
      const symbol = randomSymbol(true, 1);
      const digits = randomDigits(2);
      return `${word}${symbol}${digits}`;
    },
    wordPassword(options) {
      const words = [];
      const count = clamp(options.length || 4, 1, 256);
      for (let i = 0; i < count; i++) {
        const word = dictionaryWord();
        if (options.cap && (options.capAll || i === 0)) {
          words.push(capitalize(word));
        } else {
          words.push(word);
        }
      }
      let password = words.join('');
      if (options.sym) {
        password += randomSymbol(options.symSimple !== false, clamp(options.symNum ?? 1, 1, 99));
      }
      if (options.num) {
        password += randomDigits(clamp(options.numNum ?? 2, 1, 99));
      }
      return password;
    }
  };

  function dictionaryWord() {
    const word = WordListLoader.pickWord();
    if (word) return word;
    return FakeWords.generate(6, false).toLowerCase();
  }

  function randomSymbol(simpleOnly, count = 1) {
    const source = simpleOnly ? SIMPLE_SYMBOLS : ALL_SYMBOLS;
    let result = '';
    for (let i = 0; i < count; i++) {
      result += source[Math.floor(Math.random() * source.length)];
    }
    return result;
  }

  function randomDigits(count = 2) {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function showFeedback(message, type = 'info', opts = {}) {
    const { toast = false, duration = 3500 } = opts;
    if (toast && window.showToast) {
      window.showToast(message, type, duration);
      return;
    }
    const headerStatus = document.getElementById('headerStatus');
    const textEl = document.getElementById('headerStatusText');
    const iconEl = document.getElementById('headerStatusIcon');
    if (!headerStatus || !textEl || !iconEl) return;
    const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
    textEl.textContent = message;
    iconEl.textContent = icons[type] || icons.info;
    headerStatus.classList.remove('success', 'error', 'info');
    headerStatus.classList.add(type);
    headerStatus.hidden = false;
    headerStatus.classList.add('show');
    clearTimeout(headerStatus._hideTimer);
    headerStatus._hideTimer = setTimeout(() => {
      headerStatus.classList.remove('show');
      setTimeout(() => {
        if (!headerStatus.classList.contains('show')) headerStatus.hidden = true;
      }, 350);
    }, duration);
  }

  function updateStorageStatus() {
    const badge = elements.storageStatus;
    if (!badge) return;
    badge.classList.remove('pill-success', 'pill-danger');
    if (state.autoSave) {
      badge.textContent = 'Auto-save on';
      badge.classList.add('pill-success');
    } else {
      badge.textContent = 'Manual mode';
      badge.classList.add('pill-danger');
    }
  }

  function setWordListStatus(status) {
    const badge = elements.wordListStatus;
    if (!badge) return;
    badge.classList.remove('pill-success', 'pill-danger');
    switch (status) {
      case 'ready':
        badge.textContent = 'Word list ready';
        badge.classList.add('pill-success');
        break;
      case 'error':
        badge.textContent = 'Word list unavailable';
        badge.classList.add('pill-danger');
        break;
      default:
        badge.textContent = 'Loading word list…';
        break;
    }
  }

  function toggleNavPanel(id, show) {
    const panel = document.getElementById(id);
    if (!panel) return;
    if (show) {
      panel.classList.add('show');
      panel.style.display = 'block';
    } else {
      panel.classList.remove('show');
      panel.style.display = 'none';
    }
  }

  function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `pw-${Math.random().toString(36).slice(2, 10)}`;
  }

  function readBoolean(value, fallback) {
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    return fallback;
  }

  function readJson(serialized) {
    if (!serialized) return [];
    try {
      return JSON.parse(serialized);
    } catch (err) {
      console.warn('Unable to parse stored entries', err);
      return [];
    }
  }

  function readSessionValue(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (_) {
      return '';
    }
  }

  function normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.map(item => {
      if (Array.isArray(item)) {
        return {
          id: createId(),
          name: item[0] || 'Unnamed',
          username: item[1] || 'user',
          password: item[2] || ''
        };
      }
      return {
        id: item.id || createId(),
        name: item.name || 'Unnamed',
        username: item.username || 'user',
        password: item.password || ''
      };
    });
  }

  function buildEntry(entry) {
    if (!entry) return { id: createId(), name: 'Unnamed', username: 'user', password: '' };
    return {
      id: entry.id || createId(),
      name: entry.name || 'Unnamed',
      username: entry.username || 'user',
      password: entry.password || ''
    };
  }

  function createImportInput(onChange) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    input.addEventListener('change', event => {
      onChange?.(event.target.files);
    });
    document.body.appendChild(input);
    return input;
  }
})();
