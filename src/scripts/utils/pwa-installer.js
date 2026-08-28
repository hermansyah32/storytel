let deferredPrompt = null;

export function initPWAInstaller() {
  const installContainer = document.querySelector('#nav-install-item');
  const installMenuButton = document.querySelector('#install-pwa-button');

  const popupBanner = document.querySelector('#pwa-install-banner');
  const popupInstallBtn = document.querySelector('#btn-pwa-install');
  const popupDismissBtn = document.querySelector('#btn-pwa-dismiss');

  const showInstallUI = () => {
    if (installContainer) {
      installContainer.classList.remove('hidden');
    }
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (popupBanner && !isDismissed) {
      popupBanner.classList.remove('hidden');
    }
  };

  const hideInstallUI = () => {
    if (installContainer) {
      installContainer.classList.add('hidden');
    }
    if (popupBanner) {
      popupBanner.classList.add('hidden');
    }
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallUI();
  });

  const handleInstallClick = async (e) => {
    if (e) e.preventDefault();
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);

    deferredPrompt = null;
    hideInstallUI();
  };

  if (installMenuButton) {
    installMenuButton.addEventListener('click', handleInstallClick);
  }

  if (popupInstallBtn) {
    popupInstallBtn.addEventListener('click', handleInstallClick);
  }

  if (popupDismissBtn) {
    popupDismissBtn.addEventListener('click', () => {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
      if (popupBanner) {
        popupBanner.classList.add('hidden');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Storytel App successfully installed!');
    deferredPrompt = null;
    hideInstallUI();
  });
}
