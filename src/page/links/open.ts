import type { Mutable } from 'type-fest';
import type { Readable } from 'svelte/store';
import { connect, deepEqual, store, State } from '../state/store';
import { createLink, getLinkState, getStateWithLink, Type } from './state';

export interface LinkableMarker extends google.maps.Marker {
  get(key: 'type'): Type;
  set(key: 'type', value: Type): void;
  get(key: 'value'): string;
  set(key: 'value', value: string): void;
}

export interface LinkableElement {
  dataset: {
    type: Type;
    value: string;
  };
}

export type Linkable = (LinkableElement & HTMLElement) | LinkableMarker;

/**
 * Navigate to the described page
 */
function openLinkableValues(type: Type, value: string) {
  store.update((state) => {
    const newLink = createLink(type, value, state);
    const newState: Mutable<Partial<State>> = getStateWithLink(
      state,
      type,
      value,
    );
    if (type === 'stop') {
      newState.focus = 'stop';
    }

    history.pushState(newState, '', newLink);
    ga?.('send', 'pageview', { page: newLink, title: document.title });

    return { ...state, ...newState };
  });
}

export function openLinkable(type: Type, value: string): void;
export function openLinkable(linkable: Linkable): void;
export function openLinkable(linkable: Linkable | Type, value?: string) {
  let type: Type;
  if (value) {
    type = linkable as Type;
  }
  if (linkable instanceof HTMLElement) {
    type = linkable.dataset.type;
    value = linkable.dataset.value;
  } else {
    const marker = linkable as LinkableMarker;
    type = marker.get('type');
    value = marker.get('value');
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
  store: Readable<State>,
) {
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
