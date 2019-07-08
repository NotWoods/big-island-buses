import { IDBPDatabase } from 'idb';
import { computeDistanceBetween, LatLngLike } from 'spherical-geometry-js';
import { Stop } from '../common/api-types';
import { BusesSchema } from './schema';

/**
 * Search for the closest stop to the user.
 * @param db Reference to idb database to read from.
 * @param userPosition User position. Can pass in `Coordinates` from Geolocation API.
 * @param maxDistance If a stop is beyond this number of meters from the user, return `undefined`.
 */
export async function locateUser(
    db: IDBPDatabase<BusesSchema>,
    userPosition: LatLngLike,
    maxDistance: number,
): Promise<Stop | undefined> {
    let closestDistance = Number.MAX_VALUE;
    let closestStop: Stop | undefined = undefined;

    let cursor = await db.transaction('stops').store.openCursor();
    while (cursor) {
        const stop = cursor.value;
        const distance = computeDistanceBetween(userPosition, stop);

        if (distance < closestDistance) {
            closestStop = stop;
            closestDistance = distance;
        }

        cursor = await cursor.continue();
    }

    return closestDistance < maxDistance ? closestStop : undefined;
}
