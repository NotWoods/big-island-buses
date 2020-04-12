import { Store } from 'unistore';
import { GTFSData } from '../gtfs-types';
import { convertToLinkable } from './load';
import { State, connect, LocationPermission } from './state/store';
import { Type } from './utils/link';
import { closestToUser } from './state/map';
import { locateUser } from './location/locate-user';

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
    convertToLinkable(link, Type.ROUTE, route_id, true);

    routeListItems.set(route_id, listItem);
  }

  return function connectStore(schedule: GTFSData, store: Store<State>) {
    // Start searching user location on click
    nearbyInfo.addEventListener('click', () => locateUser(store));

    connect(store, state => ({
      permission: state.locatePermission,
    }), function showHideButton({ permission }) {
      switch (permission) {
        case LocationPermission.NOT_ASKED:
          nearbyInfo.textContent = 'Find routes near my location >';
          nearbyInfo.hidden = false;
          break;
        case LocationPermission.GRANTED:
          nearbyInfo.hidden = true;
          break;
        case LocationPermission.DENIED:
          nearbyInfo.textContent = 'Location permission denied.';
          nearbyInfo.hidden = false;
          break;
        case LocationPermission.UNAVALIABLE:
          nearbyInfo.textContent = 'Location search failed.';
          nearbyInfo.hidden = false;
          break;
        case LocationPermission.TIMEOUT:
          nearbyInfo.textContent = 'Location search timed out.';
          nearbyInfo.hidden = false;
          break;
      }
    });

    connect(store, state => ({
      nearest: closestToUser(schedule.stops, state),
    }), function updateNearbyRoutes({ nearest }) {
      const nearbyRoutes = new Set(nearest?.routes ?? []);
      for (const [route_id, listItem] of routeListItems) {
        if (nearbyRoutes.has(route_id)) {
          nearbyList.appendChild(listItem);
        } else {
          otherList.appendChild(listItem);
        }
      }
    });
  };
}
