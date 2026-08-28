// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { initNetworkStatus } from './utils/network-status';
import { setupSubscription } from './utils/notification';
import { initPWAInstaller } from './utils/pwa-installer';
import swRegister from './utils/sw-register';

document.addEventListener('DOMContentLoaded', async () => {
  initPWAInstaller();
  initNetworkStatus();
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    backdrop: document.querySelector('#backdrop'),
  });
  await app.renderPage();
  await swRegister();
  await setupSubscription();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
