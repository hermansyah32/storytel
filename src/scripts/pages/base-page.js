import { clearAuthData } from "../utils/auth";
import AppDialog from "../components/app-dialog";

export default class BasePage {
  async render() {
    return '';
  }

  async afterRender() {
    this.setupSkipLink();
  }

  // --- Accessibility Skip Link Helper ---
  setupSkipLink(targetSelector = null) {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) return;

    const newSkipLink = skipLink.cloneNode(true);
    if (skipLink.parentNode) {
      skipLink.parentNode.replaceChild(newSkipLink, skipLink);
    }

    newSkipLink.addEventListener('click', (e) => {
      e.preventDefault();

      let targetEl = null;
      if (targetSelector) {
        targetEl = document.querySelector(targetSelector);
      }

      if (!targetEl) {
        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
          targetEl = mainContent.querySelector('input:not([type="hidden"]), select, textarea, button, a[href]') || mainContent;
        }
      }

      if (targetEl) {
        if (!targetEl.hasAttribute('tabindex') && !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(targetEl.tagName)) {
          targetEl.setAttribute('tabindex', '-1');
        }
        targetEl.focus();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // --- Form & Input Validation Helpers ---
  showInputError(formGroupEl, inputEl, errorMessage) {
    if (!formGroupEl || !inputEl) return;

    const inputId = inputEl.id;
    const targetInput = formGroupEl.querySelector(`#${inputId}`);
    if (targetInput) {
      targetInput.classList.add('error');
    }
    formGroupEl.setAttribute('aria-invalid', 'true');
    formGroupEl.setAttribute('aria-describedby', `${inputId}-error`);

    if (errorMessage) {
      const errorElement = document.createElement('p');
      errorElement.id = `${inputId}-error`;
      errorElement.classList.add('error-message');
      errorElement.textContent = errorMessage;
      formGroupEl.appendChild(errorElement);
    }
  }

  clearInputError(formGroupEl, inputEl) {
    if (!formGroupEl || !inputEl) return;

    const inputId = inputEl.id;
    const targetInput = formGroupEl.querySelector(`#${inputId}`);
    if (targetInput) {
      targetInput.classList.remove('error');
    }
    formGroupEl.removeAttribute('aria-invalid');
    formGroupEl.removeAttribute('aria-describedby');

    const errorElement = formGroupEl.querySelector('.error-message');
    if (errorElement) {
      formGroupEl.removeChild(errorElement);
    }
  }

  showFormError(formEl, errorMessage) {
    if (!formEl) return;

    this.clearFormError(formEl);

    const errorMessageEl = document.createElement('p');
    errorMessageEl.classList.add('error', 'error-message');
    errorMessageEl.setAttribute('role', 'alert');
    errorMessageEl.setAttribute('aria-live', 'assertive');
    errorMessageEl.setAttribute('tabindex', '-1');
    errorMessageEl.textContent = errorMessage;
    formEl.prepend(errorMessageEl);

    errorMessageEl.focus();
  }

  clearFormError(formEl) {
    if (!formEl) return;

    const errorElement = formEl.querySelector('.error.error-message');
    if (errorElement) {
      formEl.removeChild(errorElement);
    }
  }

  setFormDisabled(formEl, isDisabled) {
    if (!formEl) return;

    formEl.querySelectorAll('input, button, select, textarea').forEach((el) => {
      el.disabled = isDisabled;
    });
  }

  // --- Backdrop & Dialog UI Helpers ---
  showBackdrop(backdropId = 'backdrop') {
    const backdropEl = document.querySelector(`#${backdropId}`);
    if (backdropEl) {
      backdropEl.classList.remove('hidden');
      backdropEl.classList.add('active');
    }
  }

  hideBackdrop(backdropId = 'backdrop') {
    const backdropEl = document.querySelector(`#${backdropId}`);
    if (backdropEl) {
      backdropEl.classList.add('hidden');
      backdropEl.classList.remove('active');
    }
  }

  closeDialog() {
    AppDialog.closeAll('dialog-backdrop');
  }

  showLoadingDialog(title = 'Informasi', message = '', options = {}) {
    let cancelable = true;
    if (typeof options === 'boolean') {
      cancelable = options;
    } else if (options && typeof options === 'object') {
      if ('cancelable' in options) cancelable = options.cancelable;
      else if ('closeable' in options) cancelable = options.closeable;
    }

    const appDialog = new AppDialog({
      title,
      message,
      cancelable,
      backdropId: 'dialog-backdrop',
    });
    appDialog.open();

    return appDialog.element;
  }

  loginAutoRedirect() {
    this.closeDialog();
    clearAuthData();
    window.location.href = '/#/login';
  }
}
