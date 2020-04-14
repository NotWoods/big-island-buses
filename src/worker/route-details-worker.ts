import { Stop, Trip } from '../gtfs-types';
import { gtfsArrivalToDate, nowDateTime } from '../page/utils/date';
import { toInt } from '../page/utils/num';
import { registerPromiseWorker } from './register';

export interface RouteDetails {
  firstStop: Stop['stop_id'];
  lastStop: Stop['stop_id'];
  earliest: Date;
  latest: Date;
  stops: Set<Stop['stop_id']>;
  closestTrip: {
    id: Trip['trip_id'];
    minutes: number;
    stop: Stop['stop_id'];
  };
}

/**
 * Find the best trip based on the current time of day,
 * along with other route details.
 * @param trips All trips for a route.
 */
function getRouteDetails(trips: readonly Trip[], now: Date): RouteDetails {
  let firstStop: Stop['stop_id'] | undefined;
  let lastStop: Stop['stop_id'] | undefined;
  let smallestSequence = Infinity;
  let largestSequence = -1;

  let earliest = new Date(0, 0, 0, 23, 59, 59, 0);
  let latest = new Date(0, 0, 0, 0, 0, 0, 0);

  let earliestTrip: Trip['trip_id'] | undefined;
  let earliestTripStop: Stop['stop_id'] | undefined;
  let closestTrip: Trip['trip_id'] | undefined;
  let closestTripTime = Number.MAX_VALUE;
  let closestTripStop: Stop['stop_id'] | undefined;

  const routeStops = new Set<Stop['stop_id']>();

  for (const trip of trips) {
    for (const stopTime of Object.values(trip.stop_times)) {
      const sequence = toInt(stopTime.stop_sequence);
      if (toInt(trip.direction_id) === 0) {
        if (sequence < smallestSequence) {
          firstStop = stopTime.stop_id;
          smallestSequence = sequence;
        }
        if (sequence > largestSequence) {
          lastStop = stopTime.stop_id;
          largestSequence = sequence;
        }
      }

      routeStops.add(stopTime.stop_id);

      const timeDate = gtfsArrivalToDate(stopTime.arrival_time);
      if (timeDate > latest) {
        latest = timeDate;
      }
      if (timeDate < earliest) {
        earliest = timeDate;
        earliestTrip = trip.trip_id;
        earliestTripStop = stopTime.stop_id;
      }

      if (
        timeDate.getTime() - now.getTime() < closestTripTime &&
        timeDate.getTime() - now.getTime() > 0
      ) {
        closestTripTime = timeDate.getTime() - now.getTime();
        closestTrip = trip.trip_id;
        closestTripStop = stopTime.stop_id;
      }
    }
    if (!closestTrip) {
      //Too late for all bus routes
      closestTripTime =
        new Date(
          0,
          0,
          1,
          earliest.getHours(),
          earliest.getMinutes(),
          earliest.getSeconds(),
          0,
        ).getTime() - now.getTime();
      closestTrip = earliestTrip;
      closestTripStop = earliestTripStop;
    }
  }

  return {
    firstStop: firstStop!,
    lastStop: lastStop!,
    earliest,
    latest,
    stops: routeStops,
    closestTrip: {
      id: closestTrip!,
      minutes: Math.floor(closestTripTime / 60000),
      stop: closestTripStop!,
    },
  };
}

registerPromiseWorker(trips => {
  return getRouteDetails(trips, nowDateTime());
});
