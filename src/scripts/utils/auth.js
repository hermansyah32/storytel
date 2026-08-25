import { getCookie, removeCookie, setCookie } from './index';

export function isUserAuthenticated() {
  const token = getAuthToken();
  const userData = getuserData();
  return Boolean(token && userData);
}

export function isPublicRoute(url) {
  const publicRoutes = ['/login', '/register'];
  return publicRoutes.includes(url);
}

export function checkRouteAccess(url) {
  const authenticated = isUserAuthenticated();

  if (!authenticated) {
    clearAuthData();
    if (!isPublicRoute(url)) {
      window.location.href = '/#/login';
      return { authorized: false, isAuthenticated: false };
    }
  }

  if (authenticated && isPublicRoute(url)) {
    window.location.href = '/';
    return { authorized: false, isAuthenticated: true };
  }

  return { authorized: true, isAuthenticated: authenticated };
}

export function getAuthToken() {
  return getCookie('token');
}

export function setAuthToken(token, days = 7) {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token provided to setAuthToken');
    return;
  }
  setCookie('token', token, days);
}

export function getuserData() {
  const userData = localStorage.getItem('user');
  if (!userData) {
    return null;
  }

  try {
    const parsedUserData = JSON.parse(userData);
    if (!parsedUserData.userId || !parsedUserData.name) {
      localStorage.removeItem('user');
      return null;
    }
    return parsedUserData;
  } catch (error) {
    console.error(error);
    localStorage.removeItem('user');
    return null;
  }
}

export function saveUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    console.error('Invalid user data provided to saveUserData');
    return;
  }

  try {
    const dataToStore = {
      userId: userData.userId || userData.id || '',
      name: userData.name || '',
      email: userData.email || '',
    };

    localStorage.setItem('user', JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
}

export function clearAuthData() {
  removeCookie('token');
  localStorage.removeItem('user');
}