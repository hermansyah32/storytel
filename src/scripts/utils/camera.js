import logger from './logger';

export default class Camera {
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  static async getCameraDevices() {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');

      return videoDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Kamera ${index + 1}`,
      }));
    } catch (error) {
      logger.warning('Gagal mendapatkan daftar kamera:', error);
      return [];
    }
  }

  static async requestPermission(constraints = { video: { facingMode: 'user' } }) {
    if (!this.isSupported()) {
      throw new Error('Kamera tidak didukung oleh peramban ini.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Izin akses kamera ditolak. Harap izinkan akses kamera pada peramban Anda.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('Perangkat kamera tidak ditemukan pada perangkat Anda.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Kamera sedang digunakan oleh aplikasi lain.');
      } else {
        throw new Error(`Gagal mengakses kamera: ${error.message}`);
      }
    }
  }

  static async requestCameraByDeviceId(deviceId) {
    const constraints = deviceId
      ? { video: { deviceId: { exact: deviceId } } }
      : { video: { facingMode: 'user' } };
    return await this.requestPermission(constraints);
  }

  static stopStream(stream) {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  static capturePhoto(videoEl, filename = `camera_${Date.now()}.jpg`) {
    if (!videoEl || videoEl.readyState < 2) {
      throw new Error('Aliran video kamera belum siap.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Gagal mengambil gambar dari kamera.'));
          return;
        }
        const file = new File([blob], filename, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  }
}
