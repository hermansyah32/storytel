import BasePage from '../base-page';
import HomePresenter from './home-presenter';
import HomeMap from './components/home-map';
import LocationPicker from './components/location-picker';
import AddStoryDialog from './components/add-story-dialog';
import { debounce, showFormattedDate } from '../../utils';

export default class HomePage extends BasePage {
  #presenter = null;
  #stories = [];
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

              <div id="story-list" class="story-list">
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
        this.#homeMap.panTo(city.lat, city.lon, 10);
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

  showStories(stories) {
    this.#stories = stories || [];
    this.closeAllMapPopups();
    this.#renderStoryList();
    this.#renderMapMarkers();
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
    return this.#stories.filter((story) => {
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
      storyListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-color);">
          <p>Tidak ada story ditemukan.</p>
        </div>
      `;
      return;
    }

    storyListEl.innerHTML = filtered
      .map((story) => {
        const isActive = story.id === this.#activeStoryId ? 'active' : '';
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
            <div class="story-card-content">
              <h3 class="story-card-title">${story.name}</h3>
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

      card.addEventListener('click', handleActivate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          handleActivate();
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
    this.#homeMap.setActiveStory(storyId, this.#stories, flyTo);

    if (flyTo && window.innerWidth < 992) {
      const mapContainer = document.querySelector('.home-map-container') || document.querySelector('.home-map-wrapper');
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
