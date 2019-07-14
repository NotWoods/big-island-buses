import { IDBPDatabase } from 'idb';
import { Stop } from '../common/api-types';
import { BusesSchema } from './schema';

export type StopsRecord = Partial<Record<Stop['stop_id'], Stop>>;

/**
 * Batch load stops from the database.
 * @param db Reference to idb database to read from.
 * @param stopIds IDs of stops to load.
 */
export async function getStops(
    db: IDBPDatabase<BusesSchema>,
    stopIds: readonly Stop['stop_id'][],
): Promise<readonly (Stop | undefined)[]> {
    const stops = db.transaction('stops').store;
    return Promise.all(stopIds.map(stopId => stops.get(stopId)));
}

export async function getStopsRecord(
    db: IDBPDatabase<BusesSchema>,
): Promise<StopsRecord> {
    const record: StopsRecord = {};
    if (db.getAll) {
        const list = await db.getAll('stops');
        for (const stop of list) {
            record[stop.stop_id] = stop;
        }
    } else {
        let cursor = await db.transaction('stops').store.openCursor();
        while (cursor) {
            const stop = cursor.value;
            record[stop.stop_id] = stop;

            cursor = await cursor.continue();
        }
    }
    return record;
}

export async function saveStops(
    db: IDBPDatabase<BusesSchema>,
    stops: readonly Stop[],
) {
    const { store, done } = db.transaction('stops', 'readwrite');
    stops.forEach(stop => store.put(stop, stop.stop_id));
    await done;
}
