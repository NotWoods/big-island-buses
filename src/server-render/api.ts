import { promises as fs } from 'fs';
import { resolve, relative } from 'path';
import { promise as alasql } from 'alasql';
import { Omit, Route, Trip, StopTime, Stop } from './api-types';
const { writeFile } = fs;

// TODO
const GTFS_FOLDER = resolve(__dirname, '..', '..', 'static', 'google_transit');
const API_FOLDER = resolve(__dirname, '..', '..', 'public', 'api');

function csv(file: string) {
    const path = relative(process.cwd(), resolve(GTFS_FOLDER, `${file}.txt`));
    return `CSV('${path}', {separator:",", headers: true})`;
}

function toObject<T>(iter: Iterable<T>, key: keyof T) {
    const map: Record<string, T> = {};
    for (const el of iter) map[el[key] as any] = el;
    return map;
}

async function makeTripApi(route: Omit<Route, 'trip_ids'>) {
    const { route_id } = route;
    const tripsRes: Omit<Trip, 'stop_times'>[] = await alasql(
        `SELECT route_id, service_id, trip_id, trip_headsign AS headsign, trip_short_name AS name, direction_id
        FROM ${csv('trips')}
        WHERE route_id='${route_id}'`,
    );

    const trips = await Promise.all(
        tripsRes.map(async trip => {
            const stop_times: StopTime[] = await alasql(
                `SELECT arrival_time AS time, stop_id
                FROM ${csv('stop_times')}
                WHERE trip_id='${trip.trip_id}'
                ORDER BY stop_sequence ASC`,
            );
            (trip as Trip).stop_times = stop_times;
            return trip as Trip;
        }),
    );

    const tripMap = toObject(trips, 'trip_id');
    const path = resolve(API_FOLDER, 'routes', `${route_id}.json`);

    await writeFile(
        path,
        JSON.stringify({ ...route, trips: tripMap }, undefined, 2),
        'utf8',
    );

    return trips.map(trip => trip.trip_id);
}

async function makeRoutesApi() {
    const routesRes: Omit<Route, 'trip_ids'>[] = await alasql(
        `SELECT route_id, route_long_name AS name, route_url AS source_url, route_color AS color, route_text_color AS text_color
        FROM ${csv('routes')}
        ORDER BY route_sort_order ASC`,
    );

    const routes = await Promise.all(
        routesRes.map(async route => {
            const trip_ids = await makeTripApi(route);
            (route as Route).trip_ids = trip_ids;
            return route as Route;
        }),
    );

    const routeMap = toObject(routes, 'route_id');
    const path = resolve(API_FOLDER, 'routes.json');
    await writeFile(path, JSON.stringify(routeMap, undefined, 2), 'utf8');
}

async function makeStopsApi() {
    const res = await Promise.all([
        alasql(
            `SELECT stop_id, stop_name AS name, stop_lat AS lat, stop_lon AS lon
            FROM ${csv('stops')}`,
        ) as Promise<Omit<Stop, 'trips' | 'route_ids'>[]>,
        alasql(
            `SELECT trip_id, route_id, direction_id
            FROM ${csv('trips')}`,
        ) as Promise<Pick<Trip, 'trip_id' | 'route_id' | 'direction_id'>[]>,
    ]);
    const stopsRes = res[0];
    const tripMap = toObject(res[1], 'trip_id');

    const stops = await Promise.all(
        stopsRes.map(async stop => {
            const stopTimes: Stop['trips'] = await alasql(
                `SELECT trip_id, stop_sequence AS sequence, arrival_time AS time
                FROM ${csv('stop_times')}
                WHERE stop_id='${stop.stop_id}'`,
            );
            const trips = stopTimes.map(st =>
                Object.assign(st, tripMap[st.trip_id]),
            );
            (stop as Stop).trips = trips;
            (stop as Stop).route_ids = Array.from(
                new Set(trips.map(t => t.route_id)),
            );
            return stop as Stop;
        }),
    );

    const stopMap = toObject(stops, 'stop_id');
    const path = resolve(API_FOLDER, 'stops.json');
    await writeFile(path, JSON.stringify(stopMap, undefined, 2), 'utf8');
}

async function makeCalendarApi() {}

export async function main() {
    await Promise.all([makeRoutesApi(), makeStopsApi(), makeCalendarApi()]);
}

if (require.main === module) {
    main().catch(console.error);
}
