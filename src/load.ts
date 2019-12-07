/**
 * Contains construstors and helper functions.  Avoids using the DOM for functions.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

import { GTFSData, Stop, Trip } from './gtfs-types';
import { toInt } from './page/num';

export const enum Type {
    ROUTE,
    STOP,
    TRIP,
}
export const enum View {
    LIST,

    MAP_PRIMARY,
    STREET_PRIMARY,
}

export interface ActiveState {
    Route: {
        ID: string | null;
        TRIP: string | null;
    };
    STOP: string | null;
    View: {
        ROUTE: View;
        STOP: View;
    };
}

export let Active: ActiveState = {
    Route: {
        ID: null,
        TRIP: null,
    },
    STOP: null,
    View: {
        ROUTE: View.LIST,
        STOP: View.MAP_PRIMARY,
    },
};

export const updateEvent = new CustomEvent('pageupdate');

navigator.serviceWorker?.register('service-worker.js');

/**
 * @type {Record<Type, Function>}
 */
export const openCallbacks: Record<Type, Function> = {} as any;

export const normal = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 0, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    unimportant = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 96, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    userShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 48, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    placeShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 72, y: 0 },
        anchor: { x: 12, y: 23 },
    } as google.maps.Icon,
    stopShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 24, y: 0 },
        anchor: { x: 12, y: 20 },
    } as google.maps.Icon;

export function setActiveState(newState: ActiveState) {
    Active = newState;
}

/**
 * Grabs the API data and parses it into a GTFSData object for the rest of the program.
 */
export function getScheduleData(): Promise<GTFSData> {
    return fetch('api.json')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error(res.statusText);
        })
        .then(json => json as GTFSData);
}

export function createElement<Tag extends keyof HTMLElementTagNameMap>(
    type: Tag,
    props: Partial<HTMLElementTagNameMap[Tag]>
) {
    return Object.assign(document.createElement(type), props);
}

function getCurrentPosition() {
    return new Promise<Position>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

export interface LocationUpdate {
    stop: Stop['stop_id'];
    location: Pick<Coordinates, 'latitude' | 'longitude'>;
    custom: boolean;
}

/**
 * Locates the nearest bus stop to the user or custom location
 * @param {Promise} schedulePromise Schedule promise to wait for
 * @param {Coordinates} customLocation Location to use instead of GPS
 */
let runOnce = false;
export function locateUser(
    busPromise: Promise<GTFSData>,
    customLocation?: Pick<Coordinates, 'latitude' | 'longitude'>,
): Promise<LocationUpdate> {
    let locatePromise: Promise<{
        coords: Pick<Coordinates, 'latitude' | 'longitude'>;
        customLocationFlag?: boolean;
    }>;
    if (customLocation) {
        locatePromise = Promise.resolve({
            coords: customLocation,
            customLocationFlag: true,
        });
    } else {
        locatePromise = getCurrentPosition();
    }

    let closestDistance = Number.MAX_VALUE;
    let closestStop: Stop['stop_id'];

    return Promise.all([locatePromise, busPromise]).then(([e, schedule]) => {
        const userPos = e.coords;
        for (const stop_id of Object.keys(schedule.stops)) {
            const stop = schedule.stops[stop_id];
            const distance = Math.sqrt(
                Math.pow(userPos.latitude - parseFloat(stop.stop_lat), 2) +
                    Math.pow(userPos.longitude - parseFloat(stop.stop_lon), 2),
            );
            if (distance < closestDistance) {
                closestStop = stop_id;
                closestDistance = distance;
            }
        }
        if (closestStop) {
            const results = {
                stop: closestStop,
                location: userPos,
                custom: e.customLocationFlag ? true : false,
            };
            if (runOnce) {
                window.dispatchEvent(
                    new CustomEvent('locationupdate', {
                        detail: results,
                    }),
                );
            }
            return results;
        } else {
            throw Error(JSON.stringify(userPos));
        }
    });
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

    return new Promise(resolve => {
        document.addEventListener('readystatechange', () => {
            if (document.readyState === 'interactive') {
                resolve(document.readyState);
            }
        });
    });
}

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param {Type} type  		Type of item to change
 * @param {string} value 	ID to change
 * @return {string} URL to use for href, based on active object.
 */
function pageLink(type: Type, value: string) {
    const params = new URLSearchParams();
    switch (type) {
        case Type.ROUTE:
            params.set('route', value);

            if (Active.Route.TRIP !== null) {
                params.set('trip', Active.Route.TRIP);
            }

            if (Active.STOP !== null) {
                params.set('stop', Active.STOP);
            }
            break;
        case Type.STOP:
            if (Active.Route.ID !== null) {
                params.set('route', Active.Route.ID);
            }
            params.set('stop', value);
            if (Active.Route.TRIP !== null) {
                params.set('trip', Active.Route.TRIP);
            }
            break;
        case Type.TRIP:
            params.set('route', Active.Route.ID!);
            params.set('trip', value);
            if (Active.STOP !== null) {
                params.set('stop', Active.STOP);
            }
            break;
        default:
            console.warn('Invalid type provided for link: %i', type);
            break;
    }
    return `#!${params}`;
}

export interface Linkable {
    Type: Type;
    Value: string;
}

type DynamicLinkNode = HTMLAnchorElement & Linkable;

/**
 * Creates an A element with custom click events for links.  Can update itself.
 * @param  {Type} type      What value to change in link
 * @param  {string} value   Value to use
 * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
 * @return {Node}           A element with custom properties
 */
export function dynamicLinkNode(type: Type, value: string, update?: boolean) {
    const node = document.createElement('a') as DynamicLinkNode;
    node.Type = type;
    node.Value = value;
    node.href = pageLink(type, value);
    node.addEventListener('click', clickEvent);
    if (update) {
        node.addEventListener('pageupdate', function() {
            node.href = pageLink(type, value);
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
    const state = Active;
    const val = this.Value;
    const newLink = pageLink(this.Type, val);
    const callback = openCallbacks[this.Type];
    switch (this.Type) {
        case Type.ROUTE:
            state.Route.ID = val;
            break;
        case Type.STOP:
            state.STOP = val;
            break;
        case Type.TRIP:
            state.Route.TRIP = val;
            break;
    }
    callback(val);
    history.pushState(state, null as any, newLink);
    ga?.('send', 'pageview', { page: newLink, title: document.title });
    return false;
}

/**
 * Returns an object with URL variables.
 */
export function getQueryVariables(): Partial<Record<string, string>> {
    let query = '';
    let vars: string[];
    if (window.location.hash.indexOf('#!') > -1) {
        query = window.location.hash.substring(
            window.location.hash.indexOf('#!') + 2,
        );
        vars = query.split('&');
    } else if (window.location.search.indexOf('_escaped_fragment_') > -1) {
        query = window.location.search.substring(
            window.location.search.indexOf('_escaped_fragment_') + 19,
        );
        vars = query.split('%26');
    }

    const result: Partial<Record<string, string>> = {};
    if (query !== '') {
        for (const parts of vars!) {
            const [key, value] = parts.split('=');
            result[key] = value;
        }
    }
    return result;
}

/**
 * Sorts stop time keys
 * @param {GTFSData stop_times} stopTimes
 * @return ordered list
 */
export function sequence(stopTimes: Trip['stop_times']): string[] {
    const stopSequence = [];
    for (const key in stopTimes) {
        stopSequence.push(key);
    }
    return stopSequence.sort((a, b) => toInt(a) - toInt(b));
}
