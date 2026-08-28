import BasePage from '../base-page';
import HomePresenter from './home-presenter';
import HomeMap from './components/home-map';
import LocationPicker from './components/location-picker';
import AddStoryDialog from './components/add-story-dialog';
import AppDialog from '../../components/app-dialog';
import StoryModel from '../../models/story-model';
import { debounce, showFormattedDate } from '../../utils';
import { getActiveUrlQueryParam } from '../../routes/url-parser';
import { showBanner } from '../../utils/alert';

export default class HomePage extends BasePage {
  #presenter = null;
  #stories = [];
  #bookmarkedStories = [];
  #bookmarkedStoryIds = new Set();
  #activeTab = 'all'; // 'all' | 'bookmarked'
  #activeStoryId = null;
  #searchQuery = '';

  #homeMap = null;
  #locationPicker = null;
  #addStoryDialog = null;

  constructor() {
    super();
    this.#presenter = new HomePresenter({ view: this });
    this.#homeMap = new HomeMap();
    this.#locationPicker = new LocationPicker();
    this.#addStoryDialog = new AddStoryDialog(this);
  }

  async render() {
    return `
      <section class="container home-page-section">
        <h1 class="page-title">Beranda</h1>

        <!-- Feedback Banner -->
        <div id="banner-feedback" class="alert alert-success hidden" aria-live="polite"></div>

        <div class="home-layout">
          <aside class="card home-sidebar" role="region" aria-label="Daftar Story">
            <div class="card-header">
              <div class="card-header-text">
                <h2 class="card-title">Daftar Story</h2>
              </div>
            </div>

            <div class="card-body home-sidebar-body">
              <div class="story-tabs-container">
                <div role="tablist" aria-label="Kategori story" class="tab-list">
                  <button
                    type="button"
                    role="tab"
                    id="tab-all-stories"
                    aria-selected="true"
                    aria-controls="story-list"
                    tabindex="0"
                    class="tab-btn active"
                    data-tab="all"
                  >
                    Semua Story
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-bookmarked-stories"
                    aria-selected="false"
                    aria-controls="story-list"
                    tabindex="0"
                    class="tab-btn"
                    data-tab="bookmarked"
                  >
                    Tersimpan
                  </button>
                </div>
              </div>

              <div class="home-filter-box">
                <label for="search-story" class="sr-only">Cari story</label>
                <input 
                  type="text" 
                  id="search-story" 
                  class="form-control filter-input" 
                  placeholder="Cari story berdasarkan nama / deskripsi..." 
                  aria-label="Cari story"
                />
                <a href="#manual-city-input" id="skip-story-list" class="skip-link-inline" tabindex="0">
                  Lewati Daftar Story ke Tambah Story
                </a>
              </div>

              <div id="story-list" class="story-list" role="region" aria-live="polite">
                <!-- Stories will be rendered here -->
              </div>
            </div>
          </aside>

          <div class="home-map-wrapper">
            <div class="card add-story-panel" role="region" aria-label="Tambah story lokasi manual">
              <div class="card-header">
                <span class="card-icon" aria-hidden="true">📍</span>
                <div class="card-header-text">
                  <h2 class="card-title">Tambah Story</h2>
                </div>
              </div>
              <div class="card-body">
                <p class="manual-input-hint">Untuk membuat story baru, klik titik lokasi pada peta ATAU pilih nama kota di bawah untuk menentukan lokasi story Anda.</p>
                <div class="manual-story-controls">
                  <div class="manual-input-wrapper">
                    <label for="manual-city-input" class="sr-only">Cari lokasi kota untuk story</label>
                    <input 
                      type="text" 
                      id="manual-city-input" 
                      class="form-control manual-city-input" 
                      placeholder="Cari ibu kota / kota (contoh: Bandung, Medan)..."
                      role="combobox"
                      aria-autocomplete="list"
                      aria-controls="city-suggestions-list"
                      aria-expanded="false"
                      autocomplete="off"
                    />
                    <ul id="city-suggestions-list" class="suggestions-list hidden" role="listbox" aria-label="Saran lokasi kota"></ul>
                  </div>
                  <button type="button" id="btn-manual-add-story" class="btn btn-primary" aria-label="Tambah story di lokasi terpilih">
                    Tambah story
                  </button>
                </div>
                <div id="manual-selected-info" class="manual-selected-info hidden" aria-live="polite">
                  <span class="badge badge-primary selected-city-badge">
                    📍 Terpilih: <strong id="selected-city-name">-</strong> 
                    <span class="selected-coords">(<span id="selected-city-coords">0, 0</span>)</span>
                  </span>
                </div>
              </div>
            </div>

            <main class="home-map-container">
              <div id="map"></div>
            </main>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.setupSkipLink('#search-story');
    this.#initMap();
    this.#initLocationPicker();
    this.#bindEvents();
    await this.#presenter.onStoryLoad();
  }

  #initMap() {
    this.#homeMap.init('map', {
      onMapClick: (lat, lng) => {
        this.#locationPicker.setSelectedLocation(lat, lng, 'Titik Peta');
        this.#homeMap.showTemporaryAddMarker(lat, lng, (mLat, mLng) => {
          this.showAddStoryForm(mLat, mLng, (storyData) => {
            this.#presenter.onSubmitStory(storyData);
          });
        });
      },
    });
  }

  #initLocationPicker() {
    this.#locationPicker.init({
      inputEl: document.getElementById('manual-city-input'),
      suggestionsEl: document.getElementById('city-suggestions-list'),
      btnAddStory: document.getElementById('btn-manual-add-story'),
      selectedInfoEl: document.getElementById('manual-selected-info'),
      selectedNameEl: document.getElementById('selected-city-name'),
      selectedCoordsEl: document.getElementById('selected-city-coords'),
      onSelect: (city) => {
        this.#homeMap.showTemporaryAddMarker(city.lat, city.lon, (mLat, mLng) => {
          this.showAddStoryForm(mLat, mLng, (storyData) => {
            this.#presenter.onSubmitStory(storyData);
          });
        });
      },
      onAddClick: (lat, lon) => {
        this.showAddStoryForm(lat, lon, (storyData) => {
          this.#presenter.onSubmitStory(storyData);
        });
      },
    });
  }

  #bindEvents() {
    this.#bindTabEvents();

    const searchInput = document.getElementById('search-story');
    if (searchInput) {
      const handleSearch = debounce((e) => {
        this.#searchQuery = e.target.value.toLowerCase();
        this.#renderStoryList();
        this.#renderMapMarkers();
      }, 300);
      searchInput.addEventListener('input', handleSearch);
    }

    const skipStoryList = document.getElementById('skip-story-list');
    if (skipStoryList) {
      skipStoryList.addEventListener('click', (e) => {
        e.preventDefault();
        const manualCityInput = document.getElementById('manual-city-input');
        if (manualCityInput) {
          manualCityInput.focus();
          manualCityInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  #bindTabEvents() {
    const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
    if (tabButtons.length === 0) return;

    const switchTab = async (targetTabBtn) => {
      tabButtons.forEach((btn) => {
        const isSelected = btn === targetTabBtn;
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        btn.setAttribute('tabindex', '0');
        if (isSelected) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      this.#activeTab = targetTabBtn.getAttribute('data-tab') || 'all';
      await this.#loadBookmarks();
      this.#renderStoryList();
      this.#renderMapMarkers();
    };

    tabButtons.forEach((tabBtn, index) => {
      tabBtn.addEventListener('click', () => switchTab(tabBtn));

      tabBtn.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabButtons.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabButtons.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabButtons[targetIndex].focus();
          switchTab(tabButtons[targetIndex]);
        }
      });
    });
  }

  async showStories(stories) {
    this.#stories = stories || [];
    await this.#loadBookmarks();
    this.closeAllMapPopups();
    this.#renderStoryList();
    this.#renderMapMarkers();
    this.#checkAndSelectStoryFromQuery();
  }

  async #loadBookmarks() {
    try {
      this.#bookmarkedStories = await StoryModel.getBookmarkedStories();
      this.#bookmarkedStoryIds = new Set(this.#bookmarkedStories.map((b) => b.id));
    } catch (err) {
      this.#bookmarkedStories = [];
      this.#bookmarkedStoryIds = new Set();
    }
  }

  #checkAndSelectStoryFromQuery() {
    const storyIdFromQuery = getActiveUrlQueryParam('storyId');
    if (!storyIdFromQuery) return;

    const allAvailable = this.#stories.concat(this.#bookmarkedStories);
    const targetStory = allAvailable.find((s) => s.id === storyIdFromQuery);
    if (targetStory) {
      this.#setActiveStory(storyIdFromQuery, true);
    } else {
      showBanner('Story tidak ditemukan', 'error');
    }
  }

  closeAllMapPopups() {
    if (this.#homeMap) {
      this.#homeMap.closeAllPopups();
    }
  }

  showAddStoryForm(lat = null, lon = null, onSubmit = null) {
    return this.#addStoryDialog.show(lat, lon, onSubmit);
  }

  showLoading() {
    const storyListEl = document.getElementById('story-list');
    if (storyListEl) {
      storyListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-color);">
          <p>⏳ Memuat story...</p>
        </div>
      `;
    }
  }

  hideLoading() {
    // Handled by showStories
  }

  #getFilteredStories() {
    const source = this.#activeTab === 'bookmarked' ? this.#bookmarkedStories : this.#stories;
    return source.filter((story) => {
      const nameMatch = story.name ? story.name.toLowerCase().includes(this.#searchQuery) : false;
      const descMatch = story.description ? story.description.toLowerCase().includes(this.#searchQuery) : false;
      return nameMatch || descMatch;
    });
  }

  #renderStoryList() {
    const storyListEl = document.getElementById('story-list');
    if (!storyListEl) return;

    const filtered = this.#getFilteredStories();

    if (filtered.length === 0) {
      const emptyMsg =
        this.#activeTab === 'bookmarked'
          ? 'Belum ada story yang disimpan ke bookmark.'
          : 'Tidak ada story ditemukan.';

      storyListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-color);">
          <p>${emptyMsg}</p>
        </div>
      `;
      return;
    }

    storyListEl.innerHTML = filtered
      .map((story) => {
        const isActive = story.id === this.#activeStoryId ? 'active' : '';
        const isBookmarked = this.#bookmarkedStoryIds.has(story.id);
        const hasLocation = story.lat !== null && story.lat !== undefined && story.lon !== null && story.lon !== undefined;
        const formattedDate = showFormattedDate(story.createdAt);

        return `
          <div 
            class="story-card ${isActive}" 
            data-id="${story.id}" 
            tabindex="0" 
            role="button" 
            aria-label="Lihat story ${story.name}"
          >
            <img src="${story.photoUrl}" alt="${story.name}" class="story-card-thumb" />
            <div class="story-card-content" style="flex: 1; min-width: 0;">
              <div class="story-card-header-row">
                <h3 class="story-card-title">${story.name}</h3>
                <div class="story-card-actions">
                  <button
                    type="button"
                    class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}"
                    data-bookmark-id="${story.id}"
                    aria-label="${isBookmarked ? 'Story tersimpan ' + story.name : 'Simpan bookmark ' + story.name}"
                    title="${isBookmarked ? 'Story tersimpan' : 'Simpan story'}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                  ${isBookmarked ? `
                    <button
                      type="button"
                      class="btn-delete-bookmark"
                      data-delete-bookmark-id="${story.id}"
                      aria-label="Hapus bookmark ${story.name}"
                      title="Hapus dari tersimpan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2" aria-hidden="true">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    </button>
                  ` : ''}
                </div>
              </div>
              <p class="story-card-desc">${story.description}</p>
              <div class="story-card-meta">
                <span>📅 ${formattedDate}</span>
                ${hasLocation ? `<span>📍 (${story.lat.toFixed(2)}, ${story.lon.toFixed(2)})</span>` : ''}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    storyListEl.querySelectorAll('.story-card').forEach((card) => {
      const handleActivate = () => {
        const storyId = card.getAttribute('data-id');
        this.#setActiveStory(storyId, true);
      };

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-bookmark') || e.target.closest('.btn-delete-bookmark')) return;
        handleActivate();
      });

      card.addEventListener('keydown', (e) => {
        if (e.target.closest('.btn-bookmark') || e.target.closest('.btn-delete-bookmark')) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          handleActivate();
        }
      });
    });

    storyListEl.querySelectorAll('.btn-delete-bookmark').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = btn.getAttribute('data-delete-bookmark-id');
        const allAvailable = this.#stories.concat(this.#bookmarkedStories);
        const targetStory = allAvailable.find((s) => s.id === storyId);

        if (!targetStory) return;

        AppDialog.showConfirm({
          title: 'Hapus Bookmark',
          message: `Apakah Anda yakin ingin menghapus "${targetStory.name}" dari daftar bookmark tersimpan?`,
          onConfirm: async () => {
            await StoryModel.unbookmarkStory(storyId);
            showBanner(`Bookmark "${targetStory.name}" telah dihapus.`, 'info');
            await this.#loadBookmarks();
            this.#renderStoryList();
            this.#renderMapMarkers();
          },
        });
      });
    });

    storyListEl.querySelectorAll('.btn-bookmark').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const storyId = btn.getAttribute('data-bookmark-id');
        const allAvailable = this.#stories.concat(this.#bookmarkedStories);
        const targetStory = allAvailable.find((s) => s.id === storyId);

        if (!targetStory) return;

        if (this.#bookmarkedStoryIds.has(storyId)) {
          AppDialog.showConfirm({
            title: 'Hapus Bookmark',
            message: `Apakah Anda yakin ingin menghapus "${targetStory.name}" dari daftar bookmark tersimpan?`,
            onConfirm: async () => {
              await StoryModel.unbookmarkStory(storyId);
              showBanner(`Bookmark "${targetStory.name}" telah dihapus.`, 'info');
              await this.#loadBookmarks();
              this.#renderStoryList();
              this.#renderMapMarkers();
            },
          });
        } else {
          await StoryModel.bookmarkStory(targetStory);
          showBanner(`Story "${targetStory.name}" berhasil disimpan ke bookmark!`, 'success');
          await this.#loadBookmarks();
          this.#renderStoryList();
          this.#renderMapMarkers();
        }
      });
    });
  }

  #renderMapMarkers() {
    const filteredStories = this.#getFilteredStories();
    const storiesWithLoc = filteredStories.filter(
      (s) => s.lat !== null && s.lat !== undefined && s.lon !== null && s.lon !== undefined
    );

    this.#homeMap.renderMarkers(storiesWithLoc, this.#activeStoryId, (storyId) => {
      this.#setActiveStory(storyId, false);
    });
  }

  #setActiveStory(storyId, flyTo = true) {
    this.#activeStoryId = storyId;
    this.#renderStoryList();
    const allAvailable = this.#stories.concat(this.#bookmarkedStories);
    this.#homeMap.setActiveStory(storyId, allAvailable, flyTo);

    if (storyId) {
      window.history.replaceState(null, '', `/#/?storyId=${encodeURIComponent(storyId)}`);
    }

    const activeCard = document.querySelector(`.story-card[data-id="${CSS.escape(storyId)}"]`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (flyTo && window.innerWidth < 992) {
      const mapContainer = document.querySelector('.home-map-container') || document.querySelector('.home-map-wrapper');
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
