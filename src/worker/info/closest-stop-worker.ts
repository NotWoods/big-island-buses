import { computeDistanceBetween, LatLngLike } from 'spherical-geometry-js';
import type { Stop } from '../../gtfs-types';

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
