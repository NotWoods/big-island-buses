import pathPrefix from 'consts:pathPrefix';

export const enum Type {
  ROUTE,
  STOP,
  TRIP,
}

interface State {
  Route: {
    ID: string | null;
    TRIP: string | null;
  };
  STOP: string | null;
}

export interface Linkable {
  Type: Type;
  Value: string;
}

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param {Type} type  		Type of item to change
 * @param {string} value 	ID to change
 * @return {string} URL to use for href, based on active object.
 */
export function createLink(type: Type, value: string, state: State) {
  let url = pathPrefix;
  switch (type) {
    case Type.ROUTE:
      url += `routes/${value}/`;

      if (state.Route.TRIP != null) {
        url += state.Route.TRIP;
      }

      if (state.STOP != null) {
        url += `?stop=${state.STOP}`;
      }
      break;
    case Type.STOP:
      return `?stop=${value}`;
    case Type.TRIP:
      url += `routes/${state.Route.ID}/${value}`;
      if (state.STOP != null) {
        url += `?stop=${state.STOP}`;
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
      Route: {
        ID: params.get('route'),
        TRIP: params.get('trip'),
      },
      STOP: params.get('stop'),
    };
  }

  const path = url.pathname.match(LINK_FORMAT);
  const stop = url.searchParams.get('stop');
  if (path) {
    const [, route, trip = null] = path;
    return {
      Route: {
        ID: route,
        TRIP: trip,
      },
      STOP: stop,
    };
  } else {
    return {
      Route: {
        ID: null,
        TRIP: null,
      },
      STOP: stop,
    };
  }
}
