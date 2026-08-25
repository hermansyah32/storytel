import Validator from '../../utils/validator';

export default class RegisterPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async onRegisterSubmit({ name, email, password }) {
    this.#view.clearErrors();

    let isValid = true;

    if (!Validator.isRequired(name)) {
      this.#view.showNameError('Nama wajib diisi.');
      isValid = false;
    }

    if (!Validator.isValidEmail(email)) {
      this.#view.showEmailError('Email tidak valid.');
      isValid = false;
    }

    if (!Validator.isValidPassword(password)) {
      this.#view.showPasswordError('Kata sandi minimal 8 karakter.');
      isValid = false;
    }

    if (!isValid) {
      this.#view.showFormError('Harap lengkapi semua kolom dengan benar');
      return;
    }

    this.#view.showLoading();

    try {
      const response = await this.#model.register({ name, email, password });

      if (!response?.error) {
        this.#view.navigateToLogin();
      } else {
        this.#view.hideLoading();
        this.#view.showFormError(response.message || 'Gagal mendaftar akun. Harap coba lagi.');
      }
    } catch (error) {
      this.#view.hideLoading();
      this.#view.showFormError('Terjadi kesalahan. Harap hubungi administrator.');
    }
  }
}
