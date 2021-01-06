import url from 'consts:infoWorker';
import pathPrefix from 'consts:pathPrefix';
import type { LatLngLike } from 'spherical-geometry-js';
import type { Route, GTFSData, Stop } from '../shared/gtfs-types';
import type { Message, RouteDetails } from '../worker/info';
import { PromiseWorker } from '../worker/promise-worker';

const worker = new PromiseWorker(new Worker(pathPrefix + url));

let sentData = false;

/**
 * Find the best trip based on the current time of day,
 * along with other route details.
 */
export function getRouteDetails(route: Route) {
  const trips = Object.values(route.trips);
  const message: Message = { type: 'route_details', trips };
  return worker.postMessage(message) as Promise<RouteDetails>;
}

/**
 * Find the closest stop to the user's location or searched place.
 * @param stops List of stops from API.
 * @param state Location of user and/or search place.
 */
export function findClosestStop(
  stops: GTFSData['stops'],
  location?: LatLngLike,
): Promise<Stop | undefined> {
  if (!location) return Promise.resolve(undefined);

  if (!sentData) {
    const message: Message = { type: 'data', stops: Object.values(stops) };
    worker.postMessage(message);
    sentData = true;
  }

  const message: Message = { type: 'closest_stop', location };
  return worker.postMessage(message) as Promise<Stop | undefined>;
}
