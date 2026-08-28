import Camera from '../../../utils/camera';
import Validator from '../../../utils/validator';
import AppDialog from '../../../components/app-dialog';

export default class AddStoryDialog extends AppDialog {
  #page = null;
  #activeCameraStream = null;
  #selectedPhotoFile = null;

  constructor(page, options = {}) {
    super({
      className: 'add-story-dialog',
      cancelable: false,
      backdropId: 'dialog-backdrop',
      ...options,
    });
    this.#page = page;
  }

  show(lat = null, lon = null, onSubmit = null) {
    const hasLocation = lat !== null && lon !== null;

    const contentHtml = `
      <div class="dialog-content add-story-content">
        <h2 id="dialog-title" class="dialog-title">Tambah Story Baru</h2>
        
        ${hasLocation ? `
          <div class="badge badge-primary badge-pill location-badge">
            📍 <span>Koordinat: (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})</span>
          </div>
        ` : ''}

        <form id="add-story-form" class="add-story-form" novalidate>
          <div class="form-group">
            <label for="story-description">Deskripsi Story</label>
            <textarea 
              id="story-description" 
              name="description" 
              class="form-control" 
              rows="3" 
              placeholder="Tuliskan story menarik Anda..." 
            ></textarea>
          </div>

          <div class="form-group">
            <label for="photo-file-input">Foto Story</label>
            <div id="photo-preview-container" class="photo-preview-container">
              <span class="preview-placeholder">Belum ada foto dipilih</span>
              <img id="photo-preview-img" class="photo-preview-img hidden" alt="Pratinjau Foto" />
              <video id="camera-video-stream" class="camera-video-stream hidden" autoplay playsinline></video>
            </div>

            <input type="file" id="photo-file-input" accept="image/*" class="hidden" />

            <div class="photo-upload-buttons">
              <label for="camera-select" class="sr-only">Pilih Perangkat Kamera</label>
              <select id="camera-select" class="form-control camera-select hidden" aria-label="Pilih Perangkat Kamera" tabindex="0"></select>
              <button type="button" id="btn-upload-file" class="btn btn-secondary" tabindex="0" aria-label="Upload dari Komputer">
                Upload dari Komputer
              </button>
              <button type="button" id="btn-upload-camera" class="btn btn-secondary" tabindex="0" aria-label="Ambil dari Kamera">
                Ambil dari Kamera
              </button>
              <button type="button" id="btn-capture-photo" class="btn btn-primary hidden" tabindex="0" aria-label="Ambil Foto">
                Ambil Foto
              </button>
              <button type="button" id="btn-cancel-camera" class="btn btn-danger hidden" tabindex="0" aria-label="Batal Kamera">
                Batal Kamera
              </button>
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" id="btn-cancel-story" class="btn btn-danger" tabindex="0">Batal</button>

            <button type="submit" id="btn-submit-story" class="btn btn-primary" tabindex="0">
              Kirim Story
            </button>
          </div>
        </form>
      </div>
    `;

    this.open({
      content: contentHtml,
      onClose: () => {
        this.#stopActiveCamera();
      },
    });

    this.#setupEvents({ lat, lon, onSubmit });

    setTimeout(() => {
      const dialogEl = this.element;
      if (dialogEl) {
        const firstInput = dialogEl.querySelector('#story-description, input:not([type="hidden"]), button');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 50);

    return this.element;
  }

  #stopActiveCamera() {
    if (this.#activeCameraStream) {
      Camera.stopStream(this.#activeCameraStream);
      this.#activeCameraStream = null;
    }
  }

  #setupEvents({ lat, lon, onSubmit }) {
    const dialogEl = this.element;
    if (!dialogEl) return;

    const fileInput = dialogEl.querySelector('#photo-file-input');
    const cameraSelectEl = dialogEl.querySelector('#camera-select');
    const btnUploadFile = dialogEl.querySelector('#btn-upload-file');
    const btnUploadCamera = dialogEl.querySelector('#btn-upload-camera');
    const btnCapturePhoto = dialogEl.querySelector('#btn-capture-photo');
    const btnCancelCamera = dialogEl.querySelector('#btn-cancel-camera');
    const videoEl = dialogEl.querySelector('#camera-video-stream');
    const btnCancel = dialogEl.querySelector('#btn-cancel-story');
    const previewImg = dialogEl.querySelector('#photo-preview-img');
    const previewPlaceholder = dialogEl.querySelector('.preview-placeholder');
    const form = dialogEl.querySelector('#add-story-form');

    const descInput = dialogEl.querySelector('#story-description');
    const descFormGroup = descInput ? descInput.parentElement : null;
    const photoFormGroup = fileInput ? fileInput.parentElement : null;

    if (descInput) {
      descInput.addEventListener('input', () => {
        this.#page.clearInputError(descFormGroup, descInput);
        this.#page.clearFormError(form);
      });
    }

    const populateCameraOptions = async () => {
      const devices = await Camera.getCameraDevices();
      if (devices.length > 1) {
        cameraSelectEl.innerHTML = devices
          .map((dev) => `<option value="${dev.deviceId}">${dev.label}</option>`)
          .join('');
        cameraSelectEl.classList.remove('hidden');
      } else {
        cameraSelectEl.classList.add('hidden');
      }
    };

    const startCamera = async (deviceId = null) => {
      if (this.#activeCameraStream) {
        Camera.stopStream(this.#activeCameraStream);
        this.#activeCameraStream = null;
      }

      this.#activeCameraStream = await Camera.requestCameraByDeviceId(deviceId);
      videoEl.srcObject = this.#activeCameraStream;
      videoEl.classList.remove('hidden');
      previewImg.classList.add('hidden');
      previewPlaceholder.classList.add('hidden');

      btnUploadFile.classList.add('hidden');
      btnUploadCamera.classList.add('hidden');
      btnCapturePhoto.classList.remove('hidden');
      btnCancelCamera.classList.remove('hidden');

      await populateCameraOptions();
      if (deviceId) {
        cameraSelectEl.value = deviceId;
      }
    };

    const stopCameraSession = () => {
      if (this.#activeCameraStream) {
        Camera.stopStream(this.#activeCameraStream);
        this.#activeCameraStream = null;
      }
      if (videoEl) {
        videoEl.srcObject = null;
        videoEl.classList.add('hidden');
      }
      if (cameraSelectEl) {
        cameraSelectEl.classList.add('hidden');
      }
      btnCapturePhoto.classList.add('hidden');
      btnCancelCamera.classList.add('hidden');
      btnUploadFile.classList.remove('hidden');
      btnUploadCamera.classList.remove('hidden');

      if (this.#selectedPhotoFile) {
        previewImg.classList.remove('hidden');
        previewPlaceholder.classList.add('hidden');
      } else {
        previewImg.classList.add('hidden');
        previewPlaceholder.classList.remove('hidden');
      }
    };

    const handlePhotoSelect = (file) => {
      if (!file) return;
      this.#selectedPhotoFile = file;

      this.#page.clearInputError(photoFormGroup, fileInput);
      this.#page.clearFormError(form);

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.classList.remove('hidden');
        previewPlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    };

    cameraSelectEl.addEventListener('change', async (e) => {
      const selectedDeviceId = e.target.value;
      if (selectedDeviceId) {
        try {
          await startCamera(selectedDeviceId);
        } catch (error) {
          this.#page.showInputError(photoFormGroup, fileInput, error.message);
        }
      }
    });

    [btnUploadFile, btnUploadCamera, btnCapturePhoto, btnCancelCamera].forEach((btn) => {
      if (btn) {
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            e.stopPropagation();
            btn.click();
          }
        });
      }
    });

    if (btnCancel) {
      btnCancel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          btnCancel.click();
        }
      });
    }

    btnUploadFile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    btnUploadCamera.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.#page.clearInputError(photoFormGroup, fileInput);
      this.#page.clearFormError(form);

      try {
        await startCamera();
      } catch (error) {
        this.#page.showInputError(photoFormGroup, fileInput, error.message);
      }
    });

    btnCapturePhoto.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const photoFile = await Camera.capturePhoto(videoEl);
        stopCameraSession();
        handlePhotoSelect(photoFile);
      } catch (error) {
        this.#page.showInputError(photoFormGroup, fileInput, error.message);
      }
    });

    btnCancelCamera.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopCameraSession();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoSelect(e.target.files[0]);
      }
    });

    btnCancel.addEventListener('click', () => {
      stopCameraSession();
      this.close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const description = descInput ? descInput.value.trim() : '';

      this.#page.clearInputError(descFormGroup, descInput);
      this.#page.clearInputError(photoFormGroup, fileInput);
      this.#page.clearFormError(form);

      let isValid = true;

      if (!Validator.isRequired(description)) {
        this.#page.showInputError(descFormGroup, descInput, 'Deskripsi story tidak boleh kosong.');
        isValid = false;
      }

      if (!this.#selectedPhotoFile) {
        this.#page.showInputError(photoFormGroup, fileInput, 'Harap pilih foto story terlebih dahulu.');
        isValid = false;
      }

      if (!isValid) {
        this.#page.showFormError(form, 'Harap lengkapi semua kolom dengan benar');
        return;
      }

      stopCameraSession();
      this.close();
      if (this.#page && typeof this.#page.closeAllMapPopups === 'function') {
        this.#page.closeAllMapPopups();
      }

      if (typeof onSubmit === 'function') {
        onSubmit({
          description,
          photo: this.#selectedPhotoFile,
          lat,
          lon,
        });
      }
    });
  }
}
