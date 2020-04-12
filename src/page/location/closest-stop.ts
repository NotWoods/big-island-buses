import { computeDistanceBetween, LatLngLike } from 'spherical-geometry-js';
import { GTFSData, Stop } from '../../gtfs-types';

/**
 * Find the closest stop to the user's location or searched place.
 * @param stops List of stops from API.
 * @param state Location of user and/or search place.
 */
export function findClosestStop(
  stops: GTFSData['stops'],
  location?: LatLngLike
) {
  if (!location) return undefined;

  let closestDistance = Number.MAX_VALUE;
  let closestStop: Stop | undefined;

  for (const stop of Object.values(stops)) {
    const distance = computeDistanceBetween(location, { lat: stop.stop_lat, lng: stop.stop_lon });
    if (distance < closestDistance) {
      closestStop = stop;
      closestDistance = distance;
    }
  }

  return closestStop;
}
