import pathPrefix from 'consts:pathPrefix';

export type Type = 'route' | 'stop' | 'trip';

interface State {
  route: {
    id?: string | null;
    trip?: string | null;
  };
  stop?: string | null;
}

export function getLinkState(state: State) {
  return { route: state.route, stop: state.stop };
}

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param type Type of item to change
 * @param value	ID to change
 * @return URL to use for href, based on active object.
 */
export function createLink(type: Type, value: string, state: State) {
  let url = pathPrefix;
  switch (type) {
    case 'route':
      url += `routes/${value}/`;

      if (state.route.trip != null) {
        url += state.route.trip;
      }

      if (state.stop != null) {
        url += `?stop=${state.stop}`;
      }
      break;
    case 'stop':
      return `?stop=${value}`;
    case 'trip':
      url += `routes/${state.route.id}/${value}`;
      if (state.stop != null) {
        url += `?stop=${state.stop}`;
      }
      break;
    default:
      console.warn('Invalid type provided for link: %i', type);
      break;
  }
  return url;
}

/**
 * Slices off the fragment from the string and returns the result.
 * Null is returned if the fragment does not exist in the string.
 * @param str Full string
 * @param fragment Part to slice off
 */
function sliceOff(str: string, fragment: string) {
  const idx = str.indexOf(fragment);
  if (idx > -1) {
    return str.substring(idx + fragment.length);
  } else {
    return null;
  }
}

/**
 * Group 1: Route name
 * Group 2: Trip name
 */
const LINK_FORMAT = new RegExp(pathPrefix + 'routes/([\\w-]+)/(\\w+)?');

/**
 * Parse a link. Handles the current /route/<name>/<trip> format and
 * the older query parameters in hash syntax.
 * Returns the corresponding state object.
 */
export function parseLink(url: URL): State {
  const query =
    sliceOff(url.hash, '#!') ||
    sliceOff(url.search, '_escaped_fragment_')?.replace(/%26/g, '&');
  if (query) {
    const params = new URLSearchParams(query);
    return {
      route: {
        id: params.get('route'),
        trip: params.get('trip'),
      },
      stop: params.get('stop'),
    };
  }

  const path = url.pathname.match(LINK_FORMAT);
  const stop = url.searchParams.get('stop');
  if (path) {
    const [, route, trip] = path;
    return {
      route: {
        id: route,
        trip,
      },
      stop,
    };
  } else {
    return {
      route: {},
      stop,
    };
  }
}

export function getStateWithLink(state: State, type: Type, value: string) {
  const newState = getLinkState(state);
  switch (type) {
    case 'stop':
      newState.stop = value;
      break;
    case 'route':
      newState.route = { id: value, trip: state.route.trip };
      break;
    case 'trip':
      newState.route = { id: state.route.id, trip: value };
      break;
  }
  return newState;
}
