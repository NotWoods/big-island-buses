import { openDB } from 'idb';
import { getRouteRecord, RouteRecord } from './get-route';
import { getStopsRecord, StopsRecord } from './get-stop';
import { BusesSchema } from './schema';

export interface Repository {
    loadStops(): Promise<StopsRecord>;
    loadRoutes(): Promise<RouteRecord>;
}

export class RepositoryImpl implements Repository {
    private dbPromise = openDB<BusesSchema>('buses', 1, {
        upgrade(db) {
            db.createObjectStore('stops', { keyPath: 'stop_id' });
            db.createObjectStore('routes', { keyPath: 'route_id' });
            db.createObjectStore('meta');
        },
    });

    async loadStops() {
        return getStopsRecord(await this.dbPromise);
    }

    async loadRoutes() {
        return getRouteRecord(await this.dbPromise);
    }
}
