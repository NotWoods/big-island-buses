import type { Writable } from 'svelte/store';
import type { GTFSData } from '../gtfs-types';
import { convertToLinkable } from './links/open';
import { locateUser } from './location/locate-user';
import { closestToUser } from './state/map';
import {
  connect,
  LocationPermission,
  State,
  store,
  strictEqual,
} from './state/store';

const NEARBY_INFO_TEXT: Record<LocationPermission, string> = {
  [LocationPermission.NOT_ASKED]: 'Find routes near my location >',
  [LocationPermission.GRANTED]: '',
  [LocationPermission.DENIED]: 'Location permission denied.',
  [LocationPermission.UNAVALIABLE]: 'Location search failed.',
  [LocationPermission.TIMEOUT]: 'Location search timed out.',
};

/**
 * Hydrate the pre-rendered sidebar HTML.
 */
export function hydrateAside() {
  const nearbyList = document.getElementById('nearby')!;
  const otherList = document.getElementById('other')!;
  const nearbyInfo = document.getElementById('nearby-info')!;

  const routeListItems = new Map<string, HTMLLIElement>();
  for (const child of otherList.children) {
    const listItem = child as HTMLLIElement;
    const route_id = listItem.dataset.route!;

    const link = listItem.querySelector<HTMLAnchorElement>('a.routes__link')!;
    convertToLinkable(link, 'route', route_id, store);

    routeListItems.set(route_id, listItem);
  }

  return function connectStore(api: GTFSData, store: Writable<State>) {
    // Start searching user location on click
    nearbyInfo.addEventListener('click', () => {
      nearbyInfo.textContent = 'Loading...';
      nearbyInfo.hidden = false;
      locateUser(store);
    });

    connect(
      store,
      (state) => state.locatePermission,
      strictEqual,
      function showHideButton(permission) {
        const text = NEARBY_INFO_TEXT[permission];
        nearbyInfo.textContent = text;
        nearbyInfo.hidden = !text;
      },
    );

    connect(
      store,
      (state) => closestToUser(api.stops, state),
      strictEqual,
      function updateNearbyRoutes(nearest) {
        const nearbyRoutes = new Set(nearest?.routes);
        for (const [route_id, listItem] of routeListItems) {
          if (nearbyRoutes.has(route_id)) {
            nearbyList.appendChild(listItem);
          } else {
            otherList.appendChild(listItem);
          }
        }
      },
    );
  };
}
