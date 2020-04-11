import { Route } from "../gtfs-types";
import { Type, convertToLinkable } from './load';

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

  let firstLocationChange = true;

  return function onLocationChange(nearbyRoutes: Set<Route['route_id']>) {
    if (firstLocationChange) {
      // Remove all children from nearby list
      while (nearbyList.firstChild) nearbyList.removeChild(nearbyList.firstChild);
    }
    firstLocationChange = false;

    for (const [route_id, listItem] of routeListItems) {
      if (nearbyRoutes.has(route_id)) {
        nearbyList.appendChild(listItem);
      } else {
        otherList.appendChild(listItem);
      }
    }
  }
}
