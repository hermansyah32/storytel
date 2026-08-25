import AuthModel from '../../models/auth-model';
import BasePage from '../base-page';
import LoginPresenter from './login-presenter';

export default class LoginPage extends BasePage {
  #presenter = null;
  #loginForm = null;
  #emailEl = null;
  #passwordEl = null;
  #emailFormGroupEl = null;
  #passwordFormGroupEl = null;

  constructor() {
    super();
    this.#presenter = new LoginPresenter({
      view: this,
      model: AuthModel
    });
  }

  async render() {
    return `
      <section class="login-container container">
        <div class="card login-card">
          <div class="card-header login-card-header">
            <h1 class="card-title login-title">Masuk ke Akun</h1>
            <p class="card-subtitle login-subtitle">Silakan masuk untuk melanjutkan</p>
          </div>
          
          <div class="card-body login-card-body">
            <form id="login-form" class="login-form" novalidate>
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-control" 
                  placeholder="Masukkan email" 
                  required 
                  autocomplete="email"
                />
              </div>

              <div class="form-group">
                <label for="password">Kata Sandi</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-control" 
                  placeholder="Masukkan kata sandi" 
                  required 
                  autocomplete="current-password"
                />
              </div>

              <button type="submit" id="login-button" class="btn btn-primary">
                Masuk
              </button>
            </form>

            <p class="text-link">
              Belum punya akun? <a href="#/register" id="register-link" tabindex="0">Daftar sekarang</a>
            </p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#bindElements();
    this.setupSkipLink('#email');

    if (this.#loginForm) {
      this.#loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = this.#emailEl ? this.#emailEl.value : '';
        const password = this.#passwordEl ? this.#passwordEl.value : '';
        this.#presenter.onLoginSubmit({ email, password });
      });
    }
  }

  #bindElements() {
    this.#loginForm = document.getElementById('login-form');
    this.#emailEl = document.getElementById('email');
    this.#passwordEl = document.getElementById('password');
    if (this.#emailEl) {
      this.#emailFormGroupEl = this.#emailEl.parentElement;
    }
    if (this.#passwordEl) {
      this.#passwordFormGroupEl = this.#passwordEl.parentElement;
    }
  }

  // --- View Methods Called by Presenter ---
  showLoading() {
    this.setFormDisabled(this.#loginForm, true);
    this.showLoadingDialog('Proses Login', 'Silahkan tunggu proses login', false);
  }

  hideLoading() {
    this.setFormDisabled(this.#loginForm, false);
    this.closeDialog();
  }

  clearErrors() {
    this.clearInputError(this.#emailFormGroupEl, this.#emailEl);
    this.clearInputError(this.#passwordFormGroupEl, this.#passwordEl);
    this.clearFormError(this.#loginForm);
  }

  showEmailError(message) {
    this.showInputError(this.#emailFormGroupEl, this.#emailEl, message);
  }

  showPasswordError(message) {
    this.showInputError(this.#passwordFormGroupEl, this.#passwordEl, message);
  }

  showFormError(message) {
    super.showFormError(this.#loginForm, message);
  }

  navigateToHome() {
    window.location.href = '/';
  }
}
