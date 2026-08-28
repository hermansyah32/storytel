let isOfflineState = typeof navigator !== 'undefined' ? !navigator.onLine : false;

export function isOffline() {
  return isOfflineState || (typeof navigator !== 'undefined' && !navigator.onLine);
}

export function setOfflineMode(offline) {
  isOfflineState = Boolean(offline);
  updateNetworkStatus();
}

export function updateNetworkStatus() {
  const offlineSnackbar = document.getElementById('offline-snackbar');
  const offline = isOffline();

  if (offline) {
    document.body.classList.add('offline-mode');
    document.body.setAttribute('data-offline', 'true');
    if (offlineSnackbar) {
      offlineSnackbar.classList.remove('hidden');
      offlineSnackbar.style.display = 'block';
    }
  } else {
    document.body.classList.remove('offline-mode');
    document.body.removeAttribute('data-offline');
    if (offlineSnackbar) {
      offlineSnackbar.classList.add('hidden');
      offlineSnackbar.style.display = '';
    }
  }
}

export function initNetworkStatus() {
  const handleOnline = () => {
    isOfflineState = false;
    updateNetworkStatus();
  };

  const handleOffline = () => {
    isOfflineState = true;
    updateNetworkStatus();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('hashchange', updateNetworkStatus);
  window.addEventListener('popstate', updateNetworkStatus);

  setInterval(() => {
    if (!navigator.onLine && !isOfflineState) {
      setOfflineMode(true);
    } else if (navigator.onLine && isOfflineState) {
      isOfflineState = false;
      updateNetworkStatus();
    }
  }, 1000);

  updateNetworkStatus();
}
