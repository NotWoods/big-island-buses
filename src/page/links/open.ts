import { Mutable } from 'type-fest';
import { Store } from 'unistore';
import { connect, deepEqual, State, store } from '../state/store';
import { createLink, getLinkState, getStateWithLink, Type } from './state';

export interface LinkableMarker extends google.maps.Marker {
  get(key: 'type'): Type;
  get(key: 'value'): string;
}

export interface LinkableElement {
  dataset: {
    type: Type;
    value: string;
  };
}

export type Linkable = (LinkableElement & HTMLElement) | LinkableMarker;

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param {Type} type  		Type of item to change
 * @param {string} value 	ID to change
 * @return {string} URL to use for href, based on active object.
 */
function pageLink(type: Type, value: string) {
  return createLink(type, value, store.getState());
}

/**
 * Navigate to the described page
 */
function openLinkableValues(type: Type, value: string) {
  const newLink = pageLink(type, value);
  const newState: Mutable<Partial<State>> = getStateWithLink(
    store.getState(),
    type,
    value,
  );
  if (type === Type.STOP) {
    newState.focus = 'stop';
  }
  store.setState(newState as State);
  history.pushState(newState, '', newLink);
  ga?.('send', 'pageview', { page: newLink, title: document.title });
}

export function openLinkable(linkable: Linkable) {
  let type: Type;
  let value: string;
  if (linkable instanceof HTMLElement) {
    type = linkable.dataset.type;
    value = linkable.dataset.value;
  } else {
    type = linkable.get('type');
    value = linkable.get('value');
  }
  openLinkableValues(type, value);
}

/**
 * Converts an A element into an automatically updating link.
 * @param type What value to change in link
 * @param value Value to use
 * @param store If given, used to update the link when state changes
 * @return A element with custom properties
 */
export function convertToLinkable(
  node: HTMLAnchorElement,
  type: Type,
  value: string,
  store?: Store<State>,
) {
  node.href = pageLink(type, value);
  node.dataset.type = type;
  node.dataset.value = value;
  node.addEventListener('click', clickEvent);
  if (store) {
    connect(store, getLinkState, deepEqual, (state) => {
      node.href = createLink(type, value, state);
    });
  }

  return node;
}

/**
 * Used for the click event of a dynamicLinkNode
 * @param  {Event} e
 */
export function clickEvent(this: Linkable, e: Event) {
  e.preventDefault?.();
  e.stopPropagation?.();
  openLinkable(this);
  return false;
}
