import { computeDistanceBetween, LatLngLike } from 'spherical-geometry-js';
import type { Stop } from '../../shared/gtfs-types';

/**
 * Find the closest stop to the user's location or searched place.
 * @param stops List of stops from API.
 * @param state Location of user and/or search place.
 */
export function findClosestStop(stops: readonly Stop[], location: LatLngLike) {
  let closestDistance = Number.MAX_VALUE;
  let closestStop: Stop | undefined;

  for (const stop of stops) {
    const distance = computeDistanceBetween(location, stop.position);
    if (distance < closestDistance) {
      closestStop = stop;
      closestDistance = distance;
    }
  }

  return closestStop;
}

export interface ClosestStopsOptions {
  readonly maxAmount?: number;
  readonly maxDistance?: number;
}

/**
 * Find the closest stops to a given point.
 * @param stops List of stops from API.
 * @param location Location of point.
 * @param options.maxAmount Maximum number of stops to return.
 * @param options.maxDistance Maximum distance away to return.
 */
export function findClosestStops(
  stops: readonly Stop[],
  location: LatLngLike,
  options: ClosestStopsOptions = {},
) {
  const { maxDistance = Infinity, maxAmount } = options;

  return stops
    .map((stop) => {
      const distance = computeDistanceBetween(location, stop.position);
      return { stop, distance };
    })
    .filter(({ distance }) => distance < maxDistance)
    .slice(0, maxAmount)
    .map(({ stop }) => stop);
}
