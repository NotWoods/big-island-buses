import { promises as fs } from 'fs';
import { join } from 'path';
import { promise as alasql } from 'alasql';
import { Omit, Route, Trip, StopTime, Stop } from './api-types';
const { writeFile } = fs;

// TODO
const GTFS_FOLDER = './data';
const API_FOLDER = './api';

function csv(file: string) {
    return `CSV(${join(GTFS_FOLDER, `${file}.csv`)}, {separator:","})`;
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
        FROM CSV(${csv('trips')})
        WHERE route_id='${route_id}'`,
    );

    const trips = await Promise.all(
        tripsRes.map(async trip => {
            const stop_times: StopTime[] = await alasql(
                `SELECT arrival_time AS time, stop_id
                FROM CSV(${csv('stop_times')})
                ORDER BY stop_sequence ASC
                WHERE trip_id='${trip.trip_id}'`,
            );
            (trip as Trip).stop_times = stop_times;
            return trip as Trip;
        }),
    );

    const tripMap = toObject(trips, 'trip_id');
    const path = join(API_FOLDER, 'routes', `${route_id}.json`);

    await writeFile(path, JSON.stringify({ ...route, trips: tripMap }), 'utf8');

    return trips.map(trip => trip.trip_id);
}

async function makeRoutesApi() {
    const routesRes: Omit<Route, 'trip_ids'>[] = await alasql(
        `SELECT route_id, route_long_name AS name, route_url AS source_url, route_color AS color, route_text_color AS text_color
        FROM CSV(${csv('routes')})
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
    const path = join(API_FOLDER, 'routes.json');
    await writeFile(path, JSON.stringify(routeMap), 'utf8');
}

async function makeStopsApi() {
    const stopsRes: Omit<Stop, 'trips' | 'route_ids'>[] = await alasql(
        `SELECT stop_id, stop_name AS name, stop_lat AS lat, stop_lon AS lon
        FROM CSV(${csv('stops')})`,
    );

    const stops = await Promise.all(
        stopsRes.map(async stop => {
            const trips: Stop['trips'] = await alasql(
                `SELECT trips.trip_id, trips.route_id, trips.direction_id, stop_times.stop_sequence AS sequence, stop_times.arrival_time AS time
                FROM CSV(${csv('stop_times')}) stop_times
                JOIN CSV(${csv('trips')}) trips
                ON stop_times.trip_id=trips.trip_id
                WHERE stop_times.stop_id='${stop.stop_id}'`,
            );
            (stop as Stop).trips = trips;
            (stop as Stop).route_ids = Array.from(
                new Set(trips.map(t => t.route_id)),
            );
            return stop as Stop;
        }),
    );

    const stopMap = toObject(stops, 'stop_id');
    const path = join(API_FOLDER, 'stops.json');
    await writeFile(path, JSON.stringify(stopMap), 'utf8');
}

async function makeCalendarApi() {}
