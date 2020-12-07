/**
 * Contains construstors and helper functions.  Avoids using the DOM for functions.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

import pathPrefix from 'consts:pathPrefix';
import type { Store } from 'unistore';
import type { GTFSData } from '../gtfs-types';
import { convertToLinkable, LinkableElement } from './links/open';
import { Type } from './links/state';
import { State } from './state/store';

navigator.serviceWorker?.register(pathPrefix + 'service-worker.js');

const PIN_URL = pathPrefix + 'assets/pins.png';

export const normal = {
    url: PIN_URL,
    size: { height: 26, width: 24 },
    scaledSize: { height: 26, width: 120 },
    origin: { x: 0, y: 0 },
    anchor: { x: 12, y: 12 },
  } as google.maps.Icon,
  unimportant = {
    url: PIN_URL,
    size: { height: 26, width: 24 },
    scaledSize: { height: 26, width: 120 },
    origin: { x: 96, y: 0 },
    anchor: { x: 12, y: 12 },
  } as google.maps.Icon,
  userShape = {
    url: PIN_URL,
    size: { height: 26, width: 24 },
    scaledSize: { height: 26, width: 120 },
    origin: { x: 48, y: 0 },
    anchor: { x: 12, y: 12 },
  } as google.maps.Icon,
  placeShape = {
    url: PIN_URL,
    size: { height: 26, width: 24 },
    scaledSize: { height: 26, width: 120 },
    origin: { x: 72, y: 0 },
    anchor: { x: 12, y: 23 },
  } as google.maps.Icon,
  stopShape = {
    url: PIN_URL,
    size: { height: 26, width: 24 },
    scaledSize: { height: 26, width: 120 },
    origin: { x: 24, y: 0 },
    anchor: { x: 12, y: 20 },
  } as google.maps.Icon;

/**
 * Grabs the API data and parses it into a GTFSData object for the rest of the program.
 */
export function getScheduleData(): Promise<GTFSData> {
  return fetch(pathPrefix + 'api.json')
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error(res.statusText);
    })
    .then((json) => json as GTFSData);
}

export function createElement<Tag extends keyof HTMLElementTagNameMap>(
  type: Tag,
  props: Partial<HTMLElementTagNameMap[Tag]>,
) {
  return Object.assign(document.createElement(type), props);
}

/**
 * Creates a promise version of the document load event
 * @return {Promise<DocumentReadyState>} resolves if document has loaded
 */
export function documentLoad() {
  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    return Promise.resolve(document.readyState);
  }

  return new Promise((resolve) => {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive') {
        resolve(document.readyState);
      }
    });
  });
}

type DynamicLinkNode = HTMLAnchorElement & LinkableElement;

/**
 * Creates an A element with custom click events for links.  Can update itself.
 * @param type What value to change in link
 * @param value Value to use
 * @param store If given, used to update the link when state changes
 * @return A element with custom properties
 */
export function dynamicLinkNode(
  type: Type,
  value: string,
  store: Store<State>,
) {
  const node = document.createElement('a') as DynamicLinkNode;
  return convertToLinkable(node, type, value, store);
}
