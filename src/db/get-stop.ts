import { IDBPDatabase } from 'idb';
import { Stop } from '../common/api-types';
import { BusesSchema } from './schema';

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
