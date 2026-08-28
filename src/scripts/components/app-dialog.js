export default class AppDialog {
  #dialogEl = null;
  #backdropEl = null;
  _options = {};

  constructor(options = {}) {
    this.setOptions(options);
  }

  setOptions(options = {}) {
    this._options = {
      title: '',
      message: '',
      content: null,
      className: '',
      cancelable: true,
      backdropId: 'dialog-backdrop',
      actions: null,
      onOpen: null,
      onClose: null,
      onCancel: null,
      ...this._options,
      ...options,
    };
  }

  static closeAll(backdropId = 'dialog-backdrop') {
    const backdropEl = document.querySelector(`#${backdropId}`);
    if (backdropEl) {
      backdropEl.classList.add('hidden');
      backdropEl.classList.remove('active');
    }

    const existingDialogs = document.querySelectorAll('dialog.app-dialog');
    existingDialogs.forEach((dialogEl) => {
      if (typeof dialogEl.close === 'function') {
        try {
          dialogEl.close();
        } catch (_) { }
      }
      dialogEl.remove();
    });
  }

  static showLoading(title = 'Informasi', message = '', cancelable = true) {
    const dialog = new AppDialog({
      title,
      message,
      cancelable,
      className: 'loading-dialog',
    });
    dialog.open();
    return dialog;
  }

  static showConfirm({ title = 'Konfirmasi', message = '', onConfirm = null, onCancel = null }) {
    const dialog = new AppDialog({
      title,
      message,
      cancelable: true,
      actions: [
        {
          text: 'Batal',
          type: 'danger',
          onClick: (d) => {
            d.close();
            if (typeof onCancel === 'function') onCancel(d);
          },
        },
        {
          text: 'Ya',
          type: 'primary',
          onClick: (d) => {
            d.close();
            if (typeof onConfirm === 'function') onConfirm(d);
          },
        },
      ],
      onCancel,
    });
    dialog.open();
    return dialog;
  }

  open(options = {}) {
    if (options && typeof options === 'object' && Object.keys(options).length > 0) {
      this.setOptions(options);
    }

    AppDialog.closeAll(this._options.backdropId);

    const dialogEl = document.createElement('dialog');
    dialogEl.className = `app-dialog ${this._options.className}`.trim();
    dialogEl.setAttribute('aria-labelledby', 'dialog-title');
    if (this._options.message) {
      dialogEl.setAttribute('aria-describedby', 'dialog-message');
    }
    this.#dialogEl = dialogEl;

    let contentHtml = '';
    if (typeof this._options.content === 'string') {
      contentHtml = this._options.content;
    } else if (!this._options.content) {
      contentHtml = `
        <div class="dialog-content">
          ${this._options.title ? `<h2 id="dialog-title" class="dialog-title">${this._options.title}</h2>` : ''}
          ${this._options.message ? `<p id="dialog-message" class="dialog-message">${this._options.message}</p>` : ''}
          ${this.#renderActionsHtml()}
        </div>
      `;
    }

    if (contentHtml) {
      dialogEl.innerHTML = contentHtml;
    } else if (this._options.content instanceof HTMLElement) {
      dialogEl.appendChild(this._options.content);
    }

    document.body.appendChild(dialogEl);
    this.#setupEventListeners();

    const updateDom = () => {
      this.#showBackdrop();

      if (typeof dialogEl.showModal === 'function') {
        dialogEl.showModal();
      } else {
        dialogEl.setAttribute('open', '');
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }

    if (typeof this._options.onOpen === 'function') {
      this._options.onOpen(this);
    }

    return this;
  }

  close() {
    if (!this.#dialogEl) return;

    if (typeof this._options.onClose === 'function') {
      this._options.onClose(this);
    }

    const dialogEl = this.#dialogEl;
    this.#dialogEl = null;

    const updateDom = () => {
      this.#hideBackdrop();

      if (typeof dialogEl.close === 'function') {
        try {
          dialogEl.close();
        } catch (_) { }
      }
      dialogEl.remove();
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateDom);
    } else {
      updateDom();
    }
  }

  get element() {
    return this.#dialogEl;
  }

  #renderActionsHtml() {
    if (!Array.isArray(this._options.actions) || this._options.actions.length === 0) {
      return '';
    }

    const actionButtons = this._options.actions
      .map((act, index) => `
        <button 
          type="button" 
          class="btn btn-${act.type || 'primary'} dialog-action-btn" 
          data-action-index="${index}"
        >
          ${act.text}
        </button>
      `)
      .join('');

    return `<div class="dialog-actions">${actionButtons}</div>`;
  }

  #setupEventListeners() {
    const dialogEl = this.#dialogEl;
    if (!dialogEl) return;

    // Handle action buttons
    const actionBtns = dialogEl.querySelectorAll('.dialog-action-btn');
    actionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-action-index'), 10);
        if (!isNaN(idx) && this._options.actions[idx]) {
          const action = this._options.actions[idx];
          if (typeof action.onClick === 'function') {
            action.onClick(this);
          } else {
            this.close();
          }
        }
      });
    });

    // Handle cancel event (Esc key)
    dialogEl.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (this._options.cancelable !== false) {
        if (typeof this._options.onCancel === 'function') {
          this._options.onCancel(this, e);
        }
        this.close();
      }
    });

    // Handle backdrop click
    dialogEl.addEventListener('click', (e) => {
      if (this._options.cancelable === false) return;
      if (!this.#dialogEl) return;

      const rect = dialogEl.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );

      if (!isInDialog) {
        if (typeof this._options.onCancel === 'function') {
          this._options.onCancel(this, e);
        }
        this.close();
      }
    });
  }

  #showBackdrop() {
    const backdropEl = document.querySelector(`#${this._options.backdropId}`);
    if (backdropEl) {
      this.#backdropEl = backdropEl;
      backdropEl.classList.remove('hidden');
      backdropEl.classList.add('active');

      backdropEl.onclick = (e) => {
        if (this._options.cancelable === false) return;
        if (typeof this._options.onCancel === 'function') {
          this._options.onCancel(this, e);
        }
        this.close();
      };
    }
  }

  #hideBackdrop() {
    const backdropEl = this.#backdropEl || document.querySelector(`#${this._options.backdropId}`);
    if (backdropEl) {
      backdropEl.classList.add('hidden');
      backdropEl.classList.remove('active');
    }
  }
}
