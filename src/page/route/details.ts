import url from 'consts:routeDetailsWorker';
import pathPrefix from 'consts:pathPrefix';
import { Route } from '../../gtfs-types';
import { PromiseWorker } from '../../worker/promise-worker';
import type { RouteDetails } from '../../worker/route-details-worker';

const worker = new PromiseWorker(new Worker(pathPrefix + url));

/**
 * Find the best trip based on the current time of day,
 * along with other route details.
 */
export function getRouteDetails(route: Route) {
  const trips = Object.values(route.trips);
  return worker.postMessage(trips) as Promise<RouteDetails>;
}
