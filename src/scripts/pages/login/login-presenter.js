import AuthModel from '../../models/auth-model';
import Validator from '../../utils/validator';
import * as AuthUtil from '../../utils/auth';

export default class LoginPresenter {
  #view = null;
  #model = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async onLoginSubmit({ email, password }) {
    this.#view.clearErrors();

    let isValid = true;

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
      const response = await this.#model.login({ email, password });
      const auth = response?.data;

      if (!response?.error && auth instanceof AuthModel) {
        AuthUtil.saveUserData(auth.user);
        AuthUtil.setAuthToken(auth.token);

        this.#view.navigateToHome();
      } else {
        throw new Error('Email atau kata sandi tidak sesuai.');
      }
    } catch (error) {
      const errorMessage = error.message === 'Email atau kata sandi tidak sesuai.'
        ? error.message
        : 'Terjadi kesalahan. Harap hubungi administrator.';

      this.#view.hideLoading();
      this.#view.showFormError(errorMessage);
    }
  }
}
