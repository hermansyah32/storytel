let bannerTimeoutId = null;

export function showBanner(message, type = 'success', duration = 5000) {
    const feedbackEl = document.getElementById('banner-feedback');
    if (feedbackEl) {
        if (bannerTimeoutId) {
            clearTimeout(bannerTimeoutId);
            bannerTimeoutId = null;
        }

        let alertClass = 'alert-success';
        if (type === 'error' || type === 'danger') {
            alertClass = 'alert-danger';
        } else if (type === 'warning') {
            alertClass = 'alert-warning';
        } else if (type === 'info') {
            alertClass = 'alert-info';
        }

        feedbackEl.className = `alert ${alertClass}`;
        feedbackEl.innerHTML = `<span>${message}</span>`;
        feedbackEl.classList.remove('hidden');

        bannerTimeoutId = setTimeout(() => {
            feedbackEl.classList.add('hidden');
            bannerTimeoutId = null;
        }, duration);
    }
}

export function hideBanner() {
    const feedbackEl = document.getElementById('banner-feedback');
    if (feedbackEl) {
        if (bannerTimeoutId) {
            clearTimeout(bannerTimeoutId);
            bannerTimeoutId = null;
        }
        feedbackEl.classList.add('hidden');
    }
}
