import { Route, Trip, Stop } from '../../server-render/api-types';
import { BASE_URL } from '../../config';

const GORIDE_LINK_URL_REGEX = /\/s\/([^\/]+)(?:\/([^\/]+))?\/?$/;

export interface NavigationState {
    route_id?: string;
    trip_id?: string;
    stop_id?: string;
}

/**
 * Converts from a URL to state.
 *
 * Supported formats:
 * - /
 * - /s/{route_id}/{trip_id}?stop={stop_id}
 * - /s/{route_id}/{trip_id}/?stop={stop_id}
 * - #!route={route_id}&trip={trip_id}&stop={stop_id}
 */
export function urlToState(url: URL | Location): NavigationState {
    if (url.hash.startsWith('#!')) {
        const params = new URLSearchParams(url.hash.slice(2));
        return {
            route_id: params.get('route') || undefined,
            trip_id: params.get('trip') || undefined,
            stop_id: params.get('stop') || undefined,
        };
    } else {
        const params = new URLSearchParams(url.search.slice(1));
        const stop_id = params.get('stop') || undefined;
        const match = url.pathname.match(GORIDE_LINK_URL_REGEX);
        return {
            route_id: match ? match[1] : undefined,
            trip_id: match ? match[2] : undefined,
            stop_id,
        };
    }
}

/**
 * If true, the new navigation state represents new page.
 * As a result, a new history page should be pushed.
 * @example
 * if (shouldPushHistory(oldState, newState)) {
 *   history.pushState()
 * } else {
 *   history.replaceState()
 * }
 */
export function shouldPushHistory(
    oldState: NavigationState,
    newState: NavigationState,
) {
    return (
        oldState.route_id !== newState.route_id ||
        oldState.trip_id !== newState.trip_id
    );
}

export const routeToUrl = (route: Pick<Route, 'route_id'>) =>
    `${BASE_URL}/s/${route.route_id}`;

export const tripToUrl = (trip: Pick<Trip, 'trip_id' | 'route_id'>) =>
    `${BASE_URL}/s/${trip.route_id}/${trip.trip_id}`;

export const stopToUrl = (stop: Pick<Stop, 'stop_id'>) =>
    `?stop=${stop.stop_id}`;
