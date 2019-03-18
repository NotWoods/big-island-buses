import { resolve, relative } from 'path';
import { outputJson, WriteOptions } from 'fs-extra';
import { promise as alasql } from 'alasql';
import { Omit, Route, Trip, StopTime, Stop, Calendar } from './api-types';

const GTFS_FOLDER = resolve(__dirname, '..', 'static', 'google_transit');
const API_FOLDER = resolve(__dirname, '..', 'public', 'api');

const jsonOpts: WriteOptions = { spaces: 2 };

function csv(file: string) {
    const path = relative(process.cwd(), resolve(GTFS_FOLDER, `${file}.txt`));
    return `CSV('${path}', {separator:",", headers: true})`;
}

function toObject<T>(iter: Iterable<T>, key: keyof T) {
    const map: Record<string, T> = {};
    for (const el of iter) map[el[key] as any] = el;
    return map;
}

function toIso({ date }: { date: string }) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
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

    await outputJson(path, { ...route, trips: tripMap }, jsonOpts);

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
    await outputJson(path, routeMap, jsonOpts);
}

async function makeStopsApi() {
    const res = await Promise.all([
        alasql(
            `SELECT stop_id, stop_name AS name, stop_lat AS lat, stop_lon AS lon
            FROM ${csv('stops')}`,
        ) as Promise<Omit<Stop, 'route_ids'>[]>,
        alasql(
            `SELECT trip_id, route_id
            FROM ${csv('trips')}`,
        ) as Promise<Pick<Trip, 'trip_id' | 'route_id'>[]>,
    ]);
    const stopsRes = res[0];
    const tripMap = toObject(res[1], 'trip_id');

    const stops = await Promise.all(
        stopsRes.map(async stop => {
            const tripIds: { trip_id: string }[] = await alasql(
                `SELECT DISTINCT trip_id
                FROM ${csv('stop_times')}
                WHERE stop_id='${stop.stop_id}'`,
            );
            (stop as Stop).route_ids = Array.from(
                new Set(tripIds.map(t => tripMap[t.trip_id].route_id)),
            );
            return stop as Stop;
        }),
    );

    const stopMap = toObject(stops, 'stop_id');
    const path = resolve(API_FOLDER, 'stops.json');
    await outputJson(path, stopMap, jsonOpts);
}

async function makeCalendarApi() {
    interface CalendarData {
        service_id: string;
        sunday: number;
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
    }

    const calendarRes: CalendarData[] = await alasql(
        `SELECT service_id, sunday, monday, tuesday, wednesday, thursday, friday, saturday
        FROM ${csv('calendar')}`,
    );

    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    const dayPropNames = dayNames.map(d => d.toLowerCase()) as (Exclude<
        keyof CalendarData,
        'service_id'
    >)[];

    const calendar: Calendar[] = await Promise.all(
        calendarRes.map(async cal => {
            const days = dayPropNames.map(n =>
                Boolean(cal[n]),
            ) as Calendar['days'];

            let description: string;
            if (days.every(Boolean)) description = 'Daily';
            else if (!days[0] && days.slice(1).every(Boolean))
                description = 'Monday - Saturday';
            else if (!days[0] && !days[6] && days.slice(1, 6).every(Boolean))
                description = 'Monday - Friday';
            else if (days[0] && days[6] && days.slice(1, 6).every(b => !b))
                description = 'Saturday - Sunday';
            else {
                const firstDay = days.indexOf(true);
                const lastDay = days.lastIndexOf(true);
                if (firstDay === lastDay) description = dayNames[firstDay];
                else
                    description = `${dayNames[firstDay]} - ${
                        dayNames[lastDay]
                    }`;
            }

            const exceptionsRes: {
                date: string;
                exception_type: number;
            }[] = await alasql(
                `SELECT date, exception_type
                FROM ${csv('calendar_dates')}
                WHERE service_id='${cal.service_id}'`,
            );

            return {
                service_id: cal.service_id,
                days,
                description,
                exceptions: {
                    added: exceptionsRes
                        .filter(e => e.exception_type === 1)
                        .map(toIso),
                    removed: exceptionsRes
                        .filter(e => e.exception_type === 2)
                        .map(toIso),
                },
            };
        }),
    );

    const calendarMap = toObject(calendar, 'service_id');
    const path = resolve(API_FOLDER, 'calendar.json');
    await outputJson(path, calendarMap, jsonOpts);
}

export async function main() {
    await Promise.all([makeRoutesApi(), makeStopsApi(), makeCalendarApi()]);
}

if (require.main === module) {
    main().catch(console.error);
}
