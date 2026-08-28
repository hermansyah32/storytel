import BasePage from '../base-page';

export default class AboutPage extends BasePage {
  async render() {
    return `
      <section class="container about-page-section">
        <h1 class="page-title about-page-title">About</h1>
        
        <!-- Feedback Banner -->
        <div id="banner-feedback" class="alert alert-success hidden" aria-live="polite"></div>

        <div class="card about-card" role="region" aria-label="Tentang Hermansyah">
          <div class="about-header">
            <div class="about-avatar-wrapper">
              <div class="about-avatar" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div class="about-header-info">
              <h2 class="about-title">Hermansyah</h2>
            </div>
          </div>

          <div class="card-body about-card-body">
            <div class="about-description">
              <p>
                Aplikasi ini merupakan bentuk pemenuhan tugas submission Belajar Pengembangan Web Intermediate Dicoding. 
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupSkipLink('.about-card');
  }
}


