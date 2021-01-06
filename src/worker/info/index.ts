import { LatLngLike } from 'spherical-geometry-js';
import { Stop, Trip } from '../../gtfs-types';
import { nowPlainTime } from '../../page/utils/date';
import { registerPromiseWorker } from '../register';
import { findClosestStop } from './closest-stop-worker';
import { getRouteDetails } from './route-details-worker';

export type { RouteDetails } from './route-details-worker';

interface DataMessage {
  type: 'data';
  stops: readonly Stop[];
}

interface ClosestStopMessage {
  type: 'closest_stop';
  location: LatLngLike;
}

interface RouteDetailsMessage {
  type: 'route_details';
  trips: readonly Trip[];
}

export type Message = DataMessage | ClosestStopMessage | RouteDetailsMessage;

let stops: readonly Stop[] | undefined;

registerPromiseWorker((message: Message) => {
  switch (message.type) {
    case 'data':
      stops = message.stops;
      return undefined;
    case 'closest_stop':
      if (!stops) {
        throw new Error('stops not ready');
      }
      return findClosestStop(stops, message.location);
    case 'route_details':
      return getRouteDetails(message.trips, nowPlainTime());
    default:
      return undefined;
  }
});
