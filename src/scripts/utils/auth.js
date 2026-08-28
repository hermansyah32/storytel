import { getCookie, removeCookie, setCookie } from './index';
import logger from './logger';

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
      return { authorized: false, isAuthenticated: false, redirectTo: '/login' };
    }
  }

  if (authenticated && isPublicRoute(url)) {
    return { authorized: false, isAuthenticated: true, redirectTo: '/' };
  }

  return { authorized: true, isAuthenticated: authenticated, redirectTo: null };
}

export function getAuthToken() {
  return getCookie('token');
}

export function setAuthToken(token, days = 7) {
  if (!token || typeof token !== 'string') {
    logger.critical('Invalid token provided to setAuthToken');
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
    logger.critical(error);
    localStorage.removeItem('user');
    return null;
  }
}

export function saveUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    logger.critical('Invalid user data provided to saveUserData');
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
    logger.critical('Failed to save user data to localStorage:', error);
  }
}

export function clearAuthData() {
  removeCookie('token');
  localStorage.removeItem('user');
}