function extractPathnameSegments(path) {
  const cleanPath = (path || '/').split('?')[0];
  const splitUrl = cleanPath.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

export function getActivePathname() {
  const rawPath = location.hash.replace('#', '') || '/';
  const pathWithoutQuery = rawPath.split('?')[0] || '/';
  return pathWithoutQuery.replace(/\/+/g, '/') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

export function parseActiveUrlQuery() {
  const rawHash = location.hash || '';
  let queryString = '';

  if (rawHash.includes('?')) {
    queryString = rawHash.substring(rawHash.indexOf('?') + 1);
  } else if (location.search) {
    queryString = location.search.substring(1);
  }

  const searchParams = new URLSearchParams(queryString);
  return Object.fromEntries(searchParams.entries());
}

export function parseUrlQuery(url = '') {
  let queryString = '';

  if (url.includes('?')) {
    queryString = url.substring(url.indexOf('?') + 1);
  }

  const searchParams = new URLSearchParams(queryString);
  return Object.fromEntries(searchParams.entries());
}

export function getActiveUrlQueryParam(key) {
  const query = parseActiveUrlQuery();
  return query[key] !== undefined ? query[key] : null;
}
