import { LatLngLike } from 'spherical-geometry-js';
import type { Route, Stop } from '../../shared/gtfs-types.js';
import { memoize } from '../../shared/utils/memoize.js';
import {
  ClosestStopsOptions,
  findClosestStops,
} from './closest-stop-worker.js';

const findClosestStopsCached = memoize(findClosestStops, 2);
const findOptions: ClosestStopsOptions = { maxDistance: 100 };

export interface DirectionStep {
  readonly from: Stop['stop_id'];
  readonly to: Stop['stop_id'];
  readonly route: Route['route_id'];
}

export interface DirectionOptions {

}

export function directions(
  api: {
    stops: readonly Stop[];
    routes: { [route_id: string]: Route };
  },
  from: LatLngLike,
  to: LatLngLike,
) {
  const fromStops = findClosestStopsCached(api.stops, from, findOptions);
  const toStops = findClosestStopsCached(api.stops, to, findOptions);

  const fromStopIds = new Set<Stop['stop_id']>();
  const toStopIds = new Set<Stop['stop_id']>();
  const routeToStops = new Map<Route['route_id'], Stop['stop_id'][]>();

  const results: DirectionStep[][] = [];

  for (const fromStop of fromStops) {
    fromStopIds.add(fromStop.stop_id);
    // Initialize route to stop map
    for (const route of fromStop.routes) {
      if (!routeToStops.has(route)) {
        routeToStops.set(route, []);
      }
      routeToStops.get(route)!.push(fromStop.stop_id);
    }
  }
  for (const toStop of toStops) {
    toStopIds.add(toStop.stop_id);
    for (const route of toStop.routes) {
      if (routeToStops.has(route)) {
        // If the route is already preset, it might be set by a fromStop.
        routeToStops
          .get(route)!
          .filter((stopId) => fromStopIds.has(stopId))
          .forEach((fromStopId) => {
            // Both stops are on the same route
            results.push([{ from: fromStopId, to: toStop.stop_id, route }]);
          });
      } else {
        routeToStops.set(route, []);
      }
      routeToStops.get(route)!.push(toStop.stop_id);
    }
  }

  for (const fromStop of fromStops) {
    for (const route of fromStop.routes) {

    }
  }
}
