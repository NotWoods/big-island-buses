import url from 'consts:closestStopWorker';
import pathPrefix from 'consts:pathPrefix';
import { PromiseWorker } from '../../worker/promise-worker';
import type { LatLngLike } from 'spherical-geometry-js';
import type { GTFSData, Stop } from '../../gtfs-types';

const worker = new PromiseWorker(new Worker(pathPrefix + url));

let sentStops = false;

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

  if (!sentStops) {
    worker.postMessage({ stops: Object.values(stops) });
    sentStops = true;
  }

  return worker.postMessage(location) as Promise<Stop | undefined>;
}
