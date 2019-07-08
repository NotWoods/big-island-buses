import { IDBPDatabase } from 'idb';
import { TimeData, toDuration } from '../common/Time';
import { fromIsoTime } from '../common/parse-date';
import { BusesSchema } from './schema';

export interface ClosestTripInfo {
    readonly trip_id: string;
    readonly stop_id?: string;
    readonly duration: TimeData;
}

/**
 * Search for a trip currently in effect for a route.
 * @param db Reference to idb database to read from.
 * @param route_id ID of the route to check.
 * @param nowTime The current time, as a `TimeData` object.
 */
export async function closestTrip(
    db: IDBPDatabase<BusesSchema>,
    route_id: string,
    nowTime?: TimeData,
): Promise<ClosestTripInfo> {
    const now = nowTime ? fromIsoTime(nowTime.iso) : undefined;
    let closestTrip: string = '';
    let closestTripTime = Number.MAX_VALUE;
    let closestTripStop: string | undefined;
    let earliestTrip: string = '';
    let earliestTripTime = Number.MAX_VALUE;
    let earliestTripStop: string | undefined;

    const route = await db.get('routes', route_id);
    if (!route) throw new TypeError(`Invalid route_id ${route_id}`);
    for (const trip of Object.values(route.trips)) {
        for (const stop of trip.stop_times) {
            const time = fromIsoTime(stop.time).getTime();
            if (now) {
                const duration = time - now.getTime();
                if (duration < closestTripTime && duration > 0) {
                    closestTripTime = duration;
                    closestTrip = trip.trip_id;
                    closestTripStop = stop.stop_id;
                }
            }
            if (time < earliestTripTime) {
                earliestTripTime = time;
                earliestTrip = trip.trip_id;
                earliestTripStop = stop.stop_id;
            }
        }
    }

    if (!closestTrip) {
        closestTripTime = now ? earliestTripTime - now.getTime() : Infinity;
        closestTrip = earliestTrip;
        closestTripStop = earliestTripStop;
    }

    const minute = Math.floor(closestTripTime / 60000);
    const nextStopDuration = toDuration({ minute });

    return {
        trip_id: closestTrip,
        stop_id: closestTripStop,
        duration: nextStopDuration,
    };
}
