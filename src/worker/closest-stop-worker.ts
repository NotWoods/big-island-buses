import { computeDistanceBetween, LatLngLike } from 'spherical-geometry-js';
import { Stop } from '../gtfs-types';
import { registerPromiseWorker } from './register';

let stops: readonly Stop[] | undefined;

/**
 * Find the closest stop to the user's location or searched place.
 * @param stops List of stops from API.
 * @param state Location of user and/or search place.
 */
function findClosestStop(location: LatLngLike) {
  if (!stops) {
    throw new Error('stops not ready');
  }

  let closestDistance = Number.MAX_VALUE;
  let closestStop: Stop | undefined;

  for (const stop of stops) {
    const distance = computeDistanceBetween(location, {
      lat: stop.stop_lat,
      lng: stop.stop_lon,
    });
    if (distance < closestDistance) {
      closestStop = stop;
      closestDistance = distance;
    }
  }

  return closestStop;
}

registerPromiseWorker((message) => {
  if (message.stops) {
    stops = message.stops;
    return undefined;
  } else {
    return findClosestStop(message);
  }
});
