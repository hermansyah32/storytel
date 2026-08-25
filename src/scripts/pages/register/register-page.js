import AuthModel from '../../models/auth-model';
import BasePage from '../base-page';
import RegisterPresenter from './register-presenter';

export default class RegisterPage extends BasePage {
  #presenter = null;
  #registerForm = null;
  #nameEl = null;
  #emailEl = null;
  #passwordEl = null;
  #nameFormGroupEl = null;
  #emailFormGroupEl = null;
  #passwordFormGroupEl = null;

  constructor() {
    super();
    this.#presenter = new RegisterPresenter({
      view: this,
      model: AuthModel
    });
  }

  async render() {
    return `
      <section class="register-container login-container container">
        <div class="card register-card login-card">
          <div class="card-header login-card-header">
            <h1 class="card-title register-title login-title">Daftar Akun</h1>
            <p class="card-subtitle register-subtitle login-subtitle">Silakan isi formulir di bawah ini untuk mendaftar</p>
          </div>
          
          <div class="card-body login-card-body">
            <form id="register-form" class="register-form login-form" novalidate>
              <div class="form-group">
                <label for="name">Nama</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  class="form-control" 
                  placeholder="Nama Lengkap" 
                  required 
                  autocomplete="name"
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-control" 
                  placeholder="nama@email.com" 
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
                  placeholder="Masukkan kata sandi (min. 8 karakter)" 
                  required 
                  minlength="8"
                  autocomplete="new-password"
                />
              </div>

              <button type="submit" id="register-button" class="btn btn-primary">
                Daftar
              </button>
            </form>

            <p class="text-link">
              Sudah memiliki akun? <a href="#/login" id="login-link" tabindex="0">Masuk di sini</a>
            </p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#bindElements();
    this.setupSkipLink('#name');

    if (this.#registerForm) {
      this.#registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = this.#nameEl ? this.#nameEl.value : '';
        const email = this.#emailEl ? this.#emailEl.value : '';
        const password = this.#passwordEl ? this.#passwordEl.value : '';

        this.#presenter.onRegisterSubmit({ name, email, password });
      });
    }
  }

  #bindElements() {
    this.#registerForm = document.getElementById('register-form');
    this.#nameEl = document.getElementById('name');
    this.#emailEl = document.getElementById('email');
    this.#passwordEl = document.getElementById('password');

    if (this.#nameEl) this.#nameFormGroupEl = this.#nameEl.parentElement;
    if (this.#emailEl) this.#emailFormGroupEl = this.#emailEl.parentElement;
    if (this.#passwordEl) this.#passwordFormGroupEl = this.#passwordEl.parentElement;
  }

  // --- View Methods Called by RegisterPresenter ---
  showLoading() {
    this.setFormDisabled(this.#registerForm, true);
    this.showLoadingDialog('Memproses registrasi akun', 'Silahkan tunggu proses registrasi akun');
  }

  hideLoading() {
    this.setFormDisabled(this.#registerForm, false);
    this.closeDialog();
  }

  clearErrors() {
    this.clearInputError(this.#nameFormGroupEl, this.#nameEl);
    this.clearInputError(this.#emailFormGroupEl, this.#emailEl);
    this.clearInputError(this.#passwordFormGroupEl, this.#passwordEl);
    this.clearFormError(this.#registerForm);
  }

  showNameError(message) {
    this.showInputError(this.#nameFormGroupEl, this.#nameEl, message);
  }

  showEmailError(message) {
    this.showInputError(this.#emailFormGroupEl, this.#emailEl, message);
  }

  showPasswordError(message) {
    this.showInputError(this.#passwordFormGroupEl, this.#passwordEl, message);
  }

  showFormError(message) {
    super.showFormError(this.#registerForm, message);
  }

  navigateToLogin() {
    window.location.href = '/#/login';
  }
}
