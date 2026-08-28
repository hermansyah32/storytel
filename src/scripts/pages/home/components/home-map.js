import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showFormattedDate } from '../../../utils';

export default class HomeMap {
  #map = null;
  #markers = [];
  #addMarkerMarker = null;
  #resizeObserver = null;

  init(containerId = 'map', { center = [-2.548926, 118.0148634], zoom = 5, onMapClick, onMapDoubleClick } = {}) {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }

    const containerEl = document.getElementById(containerId);
    if (!containerEl) return;

    containerEl.setAttribute('tabindex', '-1');
    containerEl.removeAttribute('aria-hidden');

    this.#map = L.map(containerId, {
      keyboard: false,
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    const handleMapClick = onMapClick || onMapDoubleClick;
    if (typeof handleMapClick === 'function') {
      this.#map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handleMapClick(lat, lng);
      });
    }

    this.#map.on('popupopen', () => {
      this.#disableMapKeyboardFocus();
    });

    if (window.ResizeObserver) {
      this.#resizeObserver = new ResizeObserver(() => {
        if (this.#map) {
          this.#map.invalidateSize();
        }
      });
      this.#resizeObserver.observe(containerEl);
    }

    this.#map.whenReady(() => {
      if (this.#map) {
        this.#map.invalidateSize();
        this.#disableMapKeyboardFocus();
      }
    });
  }

  #disableMapKeyboardFocus() {
    if (!this.#map) return;
    const containerEl = this.#map.getContainer();
    if (!containerEl) return;

    containerEl.setAttribute('tabindex', '-1');
    const focusableEls = containerEl.querySelectorAll('a:not(.leaflet-popup *), button:not(.leaflet-popup *)');
    focusableEls.forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });
  }

  renderMarkers(storiesWithLoc = [], activeStoryId = null, onMarkerClick = null) {
    this.#markers.forEach(({ marker }) => marker.remove());
    this.#markers = [];

    if (!this.#map || storiesWithLoc.length === 0) return;

    const bounds = L.latLngBounds();

    storiesWithLoc.forEach((story) => {
      const isActive = story.id === activeStoryId;

      const customIcon = L.divIcon({
        className: 'custom-marker-leaflet',
        html: `
          <div class="custom-marker-wrapper ${isActive ? 'active' : ''}">
            <svg class="marker-svg" viewBox="0 0 24 36" width="28" height="40">
              <path class="marker-path" d="M12 0C5.37 0 0 5.37 0 12c0 9.75 12 24 12 24s12-14.25 12-24C24 5.37 18.63 0 12 0z" />
              <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
            </svg>
          </div>
        `,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -42],
      });

      const formattedDate = showFormattedDate(story.createdAt);
      const popupHtml = `
        <div class="map-popup-card">
          <img src="${story.photoUrl}" alt="${story.name}" class="map-popup-image" />
          <div class="map-popup-content">
            <h4 class="map-popup-title">${story.name}</h4>
            <p class="map-popup-desc">${story.description}</p>
            <span class="map-popup-date">📅 ${formattedDate}</span>
          </div>
        </div>
      `;

      const marker = L.marker([story.lat, story.lon], { icon: customIcon, keyboard: false })
        .bindPopup(popupHtml)
        .addTo(this.#map);

      marker.on('click', () => {
        if (typeof onMarkerClick === 'function') {
          onMarkerClick(story.id);
        }
      });

      this.#markers.push({ id: story.id, marker, lat: story.lat, lon: story.lon });
      bounds.extend([story.lat, story.lon]);
    });

    if (bounds.isValid() && !activeStoryId) {
      this.#map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }

    this.#disableMapKeyboardFocus();
  }

  setActiveStory(storyId, stories = [], flyTo = true) {
    const targetStory = stories.find((s) => s.id === storyId);

    this.#markers.forEach(({ id, marker }) => {
      const isCurrent = id === storyId;
      const iconElement = marker.getElement()?.querySelector('.custom-marker-wrapper');

      if (iconElement) {
        if (isCurrent) {
          iconElement.classList.add('active');
        } else {
          iconElement.classList.remove('active');
        }
      }

      if (isCurrent) {
        marker.openPopup();

        if (flyTo && targetStory && targetStory.lat !== null && targetStory.lat !== undefined && targetStory.lon !== null && targetStory.lon !== undefined && this.#map) {
          const targetZoom = Math.max(this.#map.getZoom(), 10);
          const point = this.#map.project([targetStory.lat, targetStory.lon], targetZoom);
          const targetPoint = L.point(point.x, point.y - 180);
          const targetLatLng = this.#map.unproject(targetPoint, targetZoom);

          this.#map.setView(targetLatLng, targetZoom, { animate: true });
        }
      }
    });
  }

  showTemporaryAddMarker(lat, lng, onAddClick) {
    if (this.#addMarkerMarker) {
      this.#addMarkerMarker.remove();
      this.#addMarkerMarker = null;
    }

    if (!this.#map) return;

    const greenIcon = L.divIcon({
      className: 'custom-marker-leaflet',
      html: `
        <div class="custom-marker-wrapper green">
          <svg class="marker-svg" viewBox="0 0 24 36" width="30" height="42">
            <path class="marker-path" d="M12 0C5.37 0 0 5.37 0 12c0 9.75 12 24 12 24s12-14.25 12-24C24 5.37 18.63 0 12 0z" fill="#16a34a" />
            <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
          </svg>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -48],
    });

    const popupContainer = document.createElement('div');
    popupContainer.className = 'map-popup-add';
    popupContainer.innerHTML = `
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--neutral-color); margin-bottom: 0.25rem;">Tambah Story Baru</h4>
      <p style="font-size: 0.8rem; color: var(--text-color); margin-bottom: 0.5rem;">📍 (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})</p>
      <button type="button" class="btn btn-success btn-block btn-add-story-popup">
        Tambahkan Story
      </button>
    `;

    const btnAdd = popupContainer.querySelector('.btn-add-story-popup');
    if (btnAdd) {
      btnAdd.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (typeof onAddClick === 'function') {
          onAddClick(lat, lng);
        }
      });
    }

    this.#addMarkerMarker = L.marker([lat, lng], { icon: greenIcon })
      .bindPopup(popupContainer)
      .addTo(this.#map);

    const targetZoom = Math.max(this.#map.getZoom(), 10);
    const point = this.#map.project([lat, lng], targetZoom);
    const targetPoint = L.point(point.x, point.y - 120);
    const targetLatLng = this.#map.unproject(targetPoint, targetZoom);

    this.#map.flyTo(targetLatLng, targetZoom, { duration: 0.8 });
    this.#addMarkerMarker.openPopup();
  }

  panTo(lat, lon, zoom = 10, offsetY = 110) {
    if (this.#map) {
      const point = this.#map.project([lat, lon], zoom);
      const targetPoint = L.point(point.x, point.y - offsetY);
      const targetLatLng = this.#map.unproject(targetPoint, zoom);
      this.#map.setView(targetLatLng, zoom, { animate: true });
    }
  }

  closeAllPopups() {
    if (this.#addMarkerMarker) {
      this.#addMarkerMarker.remove();
      this.#addMarkerMarker = null;
    }
    if (this.#map) {
      this.#map.closePopup();
    }
  }

  invalidateSize() {
    if (this.#map) {
      this.#map.invalidateSize();
    }
  }
}
