import CONFIG from '../config';
import { subscribeWebPush, unsubscribeWebPush } from '../data/api';
import { getAuthToken, isUserAuthenticated } from './auth';
import { showBanner } from './alert';
import logger from './logger';

export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        logger.critical('Notification API unsupported.');
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();

    if (status === 'denied') {
        alert('Izin notifikasi ditolak.');
        return false;
    }

    if (status === 'default') {
        alert('Izin notifikasi ditutup atau diabaikan.');
        return false;
    }

    return true;
}

export async function getPushSubscription() {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribe() {
    if (!isUserAuthenticated()) {
        alert('Anda harus terautentikasi (login) untuk berlangganan push notification.');
        return false;
    }

    if (!(await requestNotificationPermission())) {
        return false;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        alert('Sudah berlangganan push notification.');
        return true;
    }

    logger.info('Mulai berlangganan push notification...');

    try {
        showBanner('Memulai proses berlangganan push notification...', 'info');

        const registration = await navigator.serviceWorker.ready;
        const vapidKey = CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY;
        const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
        });

        const token = getAuthToken();
        const subscriptionJson = subscription.toJSON();

        const response = await subscribeWebPush({
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth,
            token,
        });

        if (response?.error) {
            logger.critical('Gagal mengirim langganan ke server:', response.message);
            await subscription.unsubscribe();
            showBanner('Gagal berlangganan push notification.', 'error');
            return false;
        }

        logger.info('Berhasil berlangganan push notification!');
        showBanner('Berhasil berlangganan push notification!', 'success');
        return true;
    } catch (error) {
        logger.critical('Terjadi kesalahan saat berlangganan push notification:', error);
        showBanner('Gagal berlangganan push notification.', 'error');
        return false;
    }
}

export async function unsubscribe() {
    if (!(await isCurrentPushSubscriptionAvailable())) {
        logger.critical('Belum berlangganan push notification.');
        return false;
    }

    logger.info('Membatalkan langganan push notification...');

    try {
        showBanner('Membatalkan langganan push notification...', 'info');
        const subscription = await getPushSubscription();
        if (!subscription) return false;

        const token = getAuthToken();
        const endpoint = subscription.endpoint;

        const response = await unsubscribeWebPush({ endpoint, token });
        await subscription.unsubscribe();

        if (response?.error) {
            logger.warning('Gagal menghapus langganan di server:', response.message);
        }

        logger.info('Berhasil membatalkan langganan push notification.');
        showBanner('Berhasil membatalkan langganan push notification.', 'success');
        return true;
    } catch (error) {
        logger.critical('Terjadi kesalahan saat membatalkan langganan:', error);
        showBanner('Gagal membatalkan langganan push notification.', 'error');
        return false;
    }
}

export async function sendNotification(title, options = {}) {
    if (!isNotificationAvailable()) {
        logger.critical('Notification API unsupported.');
        return;
    }

    if (!isNotificationGranted()) {
        const granted = await requestNotificationPermission();
        if (!granted) return;
    }

    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
            icon: '/favicon.png',
            badge: '/favicon.png',
            ...options,
        });
    } else {
        new Notification(title, {
            icon: '/favicon.png',
            ...options,
        });
    }
}

export async function updateSubscribeButtonUI(targetElements = '.subscribe-button, .nav-subscribe-item') {
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    const elements = typeof targetElements === 'string'
        ? document.querySelectorAll(targetElements)
        : (targetElements instanceof NodeList || Array.isArray(targetElements) ? targetElements : [targetElements]);

    elements.forEach((element) => {
        if (!element) return;
        const spanEl = element.querySelector('span');

        if (isSubscribed) {
            element.classList.add('active');
            if (spanEl) spanEl.textContent = 'Unsubscribe';
            element.setAttribute('aria-label', 'Batalkan Langganan Notifikasi');
        } else {
            element.classList.remove('active');
            if (spanEl) spanEl.textContent = 'Subscribe';
            element.setAttribute('aria-label', 'Berlangganan Notifikasi');
        }
    });
}

export async function setupSubscription(
    subscribeButtons = '.subscribe-button',
    subscribeItemElement = document.querySelector('.nav-subscribe-item')
) {
    if (!isUserAuthenticated()) {
        if (subscribeItemElement) {
            subscribeItemElement.classList.add('hidden');
        }
        return;
    }

    if (subscribeItemElement) {
        subscribeItemElement.classList.remove('hidden');
    }

    await updateSubscribeButtonUI();

    const buttons = typeof subscribeButtons === 'string'
        ? document.querySelectorAll(subscribeButtons)
        : (subscribeButtons instanceof NodeList || Array.isArray(subscribeButtons) ? subscribeButtons : [subscribeButtons]);

    buttons.forEach((button) => {
        if (button) {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!isUserAuthenticated()) {
                    alert('Anda harus login terlebih dahulu untuk berlangganan notifikasi.');
                    return;
                }

                const isSubscribed = await isCurrentPushSubscriptionAvailable();
                if (isSubscribed) {
                    const success = await unsubscribe();
                    if (success) {
                        await updateSubscribeButtonUI();
                    }
                } else {
                    const success = await subscribe();
                    if (success) {
                        await updateSubscribeButtonUI();
                    }
                }
            });
        }
    });
}