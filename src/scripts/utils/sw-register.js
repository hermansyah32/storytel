import logger from './logger';

export default async function swRegister() {
  if (!('serviceWorker' in navigator)) {
    logger.info('Service Worker API unsupported.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
    logger.info('Service worker telah terpasang:', registration);
    return registration;
  } catch (error) {
    logger.critical('Failed to install service worker:', error);
    return null;
  }
}
