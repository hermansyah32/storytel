import StoryModel from '../../models/story-model';
import { getAuthToken, clearAuthData } from '../../utils/auth';

export default class HomePresenter {
  #view = null;
  #model = null;

  constructor({ view, model = StoryModel }) {
    this.#view = view;
    this.#model = model;
  }

  async onStoryLoad({ location = 1 } = {}) {
    this.#view.showLoading();

    try {
      const token = getAuthToken();
      const response = await this.#model.getAllStories({ token, location });

      if (!response?.error && Array.isArray(response.data)) {
        this.#view.showStories(response.data);
      } else {
        if (response.status === 401) {
          this.#view.loginAutoRedirect();
        }

        throw new Error(response?.message || 'Gagal memuat story.');
      }
    } catch (error) {
      this.#view.showError(error.message || 'Terjadi kesalahan saat mengambil story.');
    } finally {
      this.#view.hideLoading();
    }
  }

  async onSubmitStory({ description, photo, lat, lon }) {
    if (typeof this.#view.showLoadingDialog === 'function') {
      this.#view.showLoadingDialog('Mengirim Story', 'Harap tunggu, story Anda sedang diunggah...');
    }

    try {
      const token = getAuthToken();

      let response;
      if (token) {
        response = await this.#model.addStory({ description, photo, lat, lon }, token);
      } else {
        response = await this.#model.addGuestStory({ description, photo, lat, lon });
      }

      if (!response?.error) {
        if (typeof this.#view.closeDialog === 'function') {
          this.#view.closeDialog();
        }
        if (typeof this.#view.showAddStorySuccess === 'function') {
          this.#view.showAddStorySuccess('Berhasil menambahkan story!');
        }
        await this.onStoryLoad();
      } else {
        throw new Error(response?.message || 'Gagal menambahkan story baru.');
      }
    } catch (error) {
      if (typeof this.#view.closeDialog === 'function') {
        this.#view.closeDialog();
      }
      if (typeof this.#view.showAddStoryError === 'function') {
        this.#view.showAddStoryError(error.message || 'Terjadi kesalahan saat mengirim story.');
      } else if (typeof this.#view.showError === 'function') {
        this.#view.showError(error.message || 'Terjadi kesalahan saat mengirim story.');
      }
    }
  }
}
