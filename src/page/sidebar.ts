import { Route } from '../gtfs-types';
import { convertToLinkable } from './load';
import { Type } from './utils/link';

/**
 * Hydrate the pre-rendered sidebar HTML.
 */
export function hydrateAside() {
  const nearbyList = document.getElementById('nearby')!;
  const otherList = document.getElementById('other')!;

  const routeListItems = new Map<string, HTMLLIElement>();
  for (const child of otherList.children) {
    const listItem = child as HTMLLIElement;
    const route_id = listItem.dataset.route!;

    const link = listItem.querySelector<HTMLAnchorElement>('a.routes__link')!;
    convertToLinkable(link, Type.ROUTE, route_id, true);

    routeListItems.set(route_id, listItem);
  }

  return function onLocationChange(nearbyRoutes: Set<Route['route_id']>) {
    for (const [route_id, listItem] of routeListItems) {
      if (nearbyRoutes.has(route_id)) {
        nearbyList.appendChild(listItem);
      } else {
        otherList.appendChild(listItem);
      }
    }
  };
}
