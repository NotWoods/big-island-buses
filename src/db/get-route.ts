import { IDBPDatabase } from 'idb';
import { Route, RouteDetails } from '../common/api-types';
import { BusesSchema } from './schema';

export type RouteRecord = Partial<
    Record<Route['route_id'], Route | RouteDetails>
>;

export async function getRouteRecord(
    db: IDBPDatabase<BusesSchema>,
): Promise<RouteRecord> {
    const record: RouteRecord = {};
    if (db.getAll) {
        const list = await db.getAll('routes');
        for (const route of list) {
            record[route.route_id] = route;
        }
    } else {
        let cursor = await db.transaction('routes').store.openCursor();
        while (cursor) {
            const route = cursor.value;
            record[route.route_id] = route;

            cursor = await cursor.continue();
        }
    }
    return record;
}

export async function saveRoutes(
    db: IDBPDatabase<BusesSchema>,
    routes: readonly Route[],
) {
    const { store, done } = db.transaction('routes', 'readwrite');
    routes.forEach(route => store.put(route, route.route_id));
    await done;
}

export async function saveRouteDetails(
    db: IDBPDatabase<BusesSchema>,
    details: RouteDetails,
) {
    await db.put('routes', details, details.route_id);
}
