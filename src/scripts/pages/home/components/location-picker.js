import INDONESIA_CITIES from '../../../data/indonesia-cities';

export default class LocationPicker {
  #inputEl = null;
  #suggestionsEl = null;
  #btnAddStory = null;
  #selectedInfoEl = null;
  #selectedNameEl = null;
  #selectedCoordsEl = null;

  #activeSuggestionIndex = -1;
  #selectedCity = null;
  #currentSuggestions = [];
  #onSelectCallback = null;

  init({
    inputEl,
    suggestionsEl,
    btnAddStory,
    selectedInfoEl,
    selectedNameEl,
    selectedCoordsEl,
    onSelect,
    onAddClick,
  }) {
    this.#inputEl = inputEl;
    this.#suggestionsEl = suggestionsEl;
    this.#btnAddStory = btnAddStory;
    this.#selectedInfoEl = selectedInfoEl;
    this.#selectedNameEl = selectedNameEl;
    this.#selectedCoordsEl = selectedCoordsEl;
    this.#onSelectCallback = onSelect;

    if (!this.#inputEl || !this.#suggestionsEl) return;

    if (this.#btnAddStory) {
      this.#btnAddStory.disabled = false;
      if (typeof onAddClick === 'function') {
        this.#btnAddStory.addEventListener('click', () => {
          this.#handleAddButtonClick(onAddClick);
        });
      }
    }

    this.#bindInputEvents(onAddClick);
  }

  #showSuggestionsForCurrentInput() {
    const query = this.#inputEl ? this.#inputEl.value.trim().toLowerCase() : '';
    this.#activeSuggestionIndex = -1;

    if (!query) {
      this.#currentSuggestions = INDONESIA_CITIES.slice(0, 10);
      this.#renderSuggestions(this.#currentSuggestions, '');
    } else {
      this.#currentSuggestions = INDONESIA_CITIES.filter((city) => {
        const nameMatch = city.name.toLowerCase().includes(query);
        const provMatch = city.province.toLowerCase().includes(query);
        return nameMatch || provMatch;
      }).slice(0, 10);
      this.#renderSuggestions(this.#currentSuggestions, query);
    }
  }

  #handleAddButtonClick(onAddClick) {
    if (this.#selectedCity) {
      if (typeof onAddClick === 'function') {
        onAddClick(this.#selectedCity.lat, this.#selectedCity.lon);
      }
      return;
    }

    const query = this.#inputEl ? this.#inputEl.value.trim().toLowerCase() : '';
    if (query) {
      const matchedCity = INDONESIA_CITIES.find((city) => {
        const nameMatch = city.name.toLowerCase().includes(query);
        const provMatch = city.province.toLowerCase().includes(query);
        return nameMatch || provMatch;
      });

      if (matchedCity) {
        this.#selectCity(matchedCity);
        if (typeof onAddClick === 'function') {
          onAddClick(matchedCity.lat, matchedCity.lon);
        }
        return;
      }
    }

    if (this.#inputEl) {
      this.#inputEl.focus();
      this.#inputEl.classList.add('input-attention-pulse');
      setTimeout(() => {
        if (this.#inputEl) {
          this.#inputEl.classList.remove('input-attention-pulse');
        }
      }, 1200);

      this.#showSuggestionsForCurrentInput();
    }
  }

  #bindInputEvents(onAddClick) {
    this.#inputEl.addEventListener('focus', () => {
      this.#showSuggestionsForCurrentInput();
    });

    this.#inputEl.addEventListener('input', () => {
      this.#showSuggestionsForCurrentInput();
    });

    this.#inputEl.addEventListener('keydown', (e) => {
      const isHidden = this.#suggestionsEl.classList.contains('hidden');

      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isHidden) {
          const items = Array.from(this.#suggestionsEl.querySelectorAll('.suggestion-item:not(.no-match)'));
          const targetIndex = this.#activeSuggestionIndex >= 0 ? this.#activeSuggestionIndex : 0;
          if (items[targetIndex]) {
            items[targetIndex].click();
            return;
          }
        }
        this.#handleAddButtonClick(onAddClick);
        return;
      }

      if (isHidden) return;

      const items = Array.from(this.#suggestionsEl.querySelectorAll('.suggestion-item:not(.no-match)'));
      if (items.length === 0) return;

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        this.#activeSuggestionIndex = 0;
        this.#updateActiveItem(items);
        items[0].focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.#activeSuggestionIndex = this.#activeSuggestionIndex < 0 ? 0 : (this.#activeSuggestionIndex + 1) % items.length;
        this.#updateActiveItem(items);
        items[this.#activeSuggestionIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.#activeSuggestionIndex = this.#activeSuggestionIndex < 0 ? items.length - 1 : (this.#activeSuggestionIndex - 1 + items.length) % items.length;
        this.#updateActiveItem(items);
        items[this.#activeSuggestionIndex].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.#hideSuggestions();
      }
    });

    document.addEventListener('click', (e) => {
      const isInputClick = this.#inputEl && this.#inputEl.contains(e.target);
      const isSuggestionsClick = this.#suggestionsEl && this.#suggestionsEl.contains(e.target);
      const isAddBtnClick = this.#btnAddStory && this.#btnAddStory.contains(e.target);
      const isSkipLinkClick = e.target.closest && (e.target.closest('a[href="#manual-city-input"]') || e.target.closest('#skip-story-list'));

      if (!isInputClick && !isSuggestionsClick && !isAddBtnClick && !isSkipLinkClick) {
        this.#hideSuggestions();
      }
    });
  }

  #renderSuggestions(cities, query) {
    if (cities.length === 0) {
      this.#suggestionsEl.innerHTML = `
        <li class="suggestion-item no-match">Tidak ada kota "${query}" ditemukan</li>
      `;
      this.#suggestionsEl.classList.remove('hidden');
      this.#inputEl.setAttribute('aria-expanded', 'true');
      this.#inputEl.removeAttribute('aria-activedescendant');
      return;
    }

    this.#suggestionsEl.innerHTML = cities
      .map((city, idx) => `
        <li 
          id="city-option-${idx}"
          class="suggestion-item" 
          data-index="${idx}"
          role="option"
          aria-selected="false"
          tabindex="0"
          aria-label="${city.name} - ${city.province}"
        >
          <span class="suggestion-icon" aria-hidden="true">📍</span>
          <div class="suggestion-info" aria-hidden="true">
            <span class="suggestion-city-name">${city.name}</span>
            <span class="badge badge-surface">${city.province}</span>
          </div>
        </li>
      `)
      .join('');

    this.#suggestionsEl.classList.remove('hidden');
    this.#inputEl.setAttribute('aria-expanded', 'true');

    const items = Array.from(this.#suggestionsEl.querySelectorAll('.suggestion-item'));
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        const cityIdx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(cityIdx) && cities[cityIdx]) {
          this.#selectCity(cities[cityIdx]);
        }
      });

      item.addEventListener('focus', () => {
        this.#activeSuggestionIndex = idx;
        this.#updateActiveItem(items);
      });

      item.addEventListener('mouseenter', () => {
        this.#activeSuggestionIndex = idx;
        this.#updateActiveItem(items);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          item.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.#hideSuggestions();
          this.#inputEl.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = (idx + 1) % items.length;
          items[nextIdx].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = idx > 0 ? idx - 1 : items.length - 1;
          items[prevIdx].focus();
        }
      });
    });
  }

  #updateActiveItem(items) {
    items.forEach((item, idx) => {
      if (idx === this.#activeSuggestionIndex) {
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
        this.#inputEl.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      }
    });

    if (this.#activeSuggestionIndex < 0) {
      this.#inputEl.removeAttribute('aria-activedescendant');
    }
  }

  #selectCity(city) {
    this.#selectedCity = city;
    this.#inputEl.value = `${city.name}, ${city.province}`;
    this.#hideSuggestions();

    if (this.#selectedNameEl) this.#selectedNameEl.textContent = `${city.name}, ${city.province}`;
    if (this.#selectedCoordsEl) this.#selectedCoordsEl.textContent = `${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`;
    if (this.#selectedInfoEl) this.#selectedInfoEl.classList.remove('hidden');
    if (this.#btnAddStory) {
      this.#btnAddStory.disabled = false;
      this.#btnAddStory.focus();
    }

    if (typeof this.#onSelectCallback === 'function') {
      this.#onSelectCallback(city);
    }
  }

  #hideSuggestions() {
    this.#suggestionsEl.classList.add('hidden');
    this.#inputEl.setAttribute('aria-expanded', 'false');
    this.#inputEl.removeAttribute('aria-activedescendant');
    this.#activeSuggestionIndex = -1;
  }

  setSelectedLocation(lat, lon, name = 'Titik Peta') {
    this.#selectedCity = { name, province: 'Koordinat Peta', lat, lon };
    if (this.#inputEl) {
      this.#inputEl.value = `${name} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    }
    if (this.#selectedNameEl) this.#selectedNameEl.textContent = name;
    if (this.#selectedCoordsEl) this.#selectedCoordsEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    if (this.#selectedInfoEl) this.#selectedInfoEl.classList.remove('hidden');
    if (this.#btnAddStory) {
      this.#btnAddStory.disabled = false;
    }
  }

  getSelectedCity() {
    return this.#selectedCity;
  }
}
