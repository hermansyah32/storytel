import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.API_URL}/register`,
  LOGIN: `${CONFIG.API_URL}/login`,
  ADD_STORY: `${CONFIG.API_URL}/stories`,
  ADD_GUEST_STORY: `${CONFIG.API_URL}/stories/guest`,
  GET_ALL_STORIES: (page, size, location = 0) => {
    const url = new URL(`${CONFIG.API_URL}/stories`);
    if (page !== undefined && page !== null) url.searchParams.append('page', page);
    if (size !== undefined && size !== null) url.searchParams.append('size', size);
    if (location !== undefined && location !== null) url.searchParams.append('location', location);
    return url.toString();
  },
  GET_DETAIL_STORY: (id) => `${CONFIG.API_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.API_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.API_URL}/notifications/subscribe`,
};

export async function register({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function login({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function addStory({ description, photo, lat, lon, token }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lat !== null) formData.append('lat', lat);
    if (lon !== undefined && lon !== null) formData.append('lon', lon);

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function addGuestStory({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lat !== null) formData.append('lat', lat);
    if (lon !== undefined && lon !== null) formData.append('lon', lon);

    const response = await fetch(ENDPOINTS.ADD_GUEST_STORY, {
      method: 'POST',
      body: formData,
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function getAllStories({ token, page, size, location = 0 } = {}) {
  try {
    const url = ENDPOINTS.GET_ALL_STORIES(page, size, location);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function getDetailStory({ id, token }) {
  try {
    const response = await fetch(ENDPOINTS.GET_DETAIL_STORY(id), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function subscribeWebPush({ endpoint, keys, p256dh, auth, token }) {
  try {
    const body = {
      endpoint,
      keys: keys || { p256dh, auth },
      p256dh,
      auth,
    };

    const response = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function unsubscribeWebPush({ endpoint, token }) {
  try {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    const json = await response.json();
    return {
      ...json,
      status: response.status,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
}

const API = {
  register,
  login,
  addStory,
  addGuestStory,
  getAllStories,
  getDetailStory,
  subscribeWebPush,
  unsubscribeWebPush,
};

export default API;