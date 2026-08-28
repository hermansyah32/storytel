import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { checkRouteAccess, clearAuthData } from '../utils/auth';
import { hideElement, showElement } from '../utils';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #backdrop = null;

  constructor({ navigationDrawer, drawerButton, content, backdrop }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#backdrop = backdrop;

    this.#setupDrawer();
    this.#setupLogout();
  }

  #setupLogout() {
    const logoutBtn = document.querySelector('#logout-button');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.#closeDrawer();
        clearAuthData();
        window.location.hash = '/#/login';
      });
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#toggleDrawer();
    });

    document.body.addEventListener('click', (event) => {
      const isOutsideClick =
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target);

      const isNavLinkClick = Array.from(this.#navigationDrawer.querySelectorAll('a'))
        .some((link) => link.contains(event.target));

      if (isOutsideClick || isNavLinkClick) {
        this.#closeDrawer();
      }
    });
  }

  #toggleDrawer() {
    this.#navigationDrawer.classList.toggle('open');
    if (this.#backdrop) {
      this.#backdrop.classList.toggle('active');
    }
  }

  #closeDrawer() {
    this.#navigationDrawer.classList.remove('open');
    if (this.#backdrop) {
      this.#backdrop.classList.remove('active');
    }
  }

  #updateNavigationUI(isAuthenticated) {
    if (isAuthenticated) {
      showElement(this.#backdrop);
      showElement(this.#drawerButton);
      showElement(this.#navigationDrawer);
    } else {
      hideElement(this.#backdrop);
      hideElement(this.#drawerButton);
      hideElement(this.#navigationDrawer);
    }
  }

  async renderPage() {
    let url = getActiveRoute();
    const { isAuthenticated, redirectTo } = checkRouteAccess(url);

    if (redirectTo) {
      window.location.hash = redirectTo;
      url = redirectTo;
    }

    this.#updateNavigationUI(isAuthenticated);

    const page = routes[url];
    if (page) {
      const updateDom = async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      };

      if (document.startViewTransition) {
        const transition = document.startViewTransition(updateDom);
        await transition.finished;
      } else {
        await updateDom();
      }

      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
      window.scrollTo(0, 0);
    }
  }
}

export default App;
