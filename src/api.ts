import { readFile, writeFile } from 'fs';
import { loadAsync } from 'jszip';
import { resolve } from 'path';
import { promisify } from 'util';
import {
    Calendar,
    CsvCalendar,
    CsvRoute,
    CsvStop,
    CsvTrip,
    GTFSData,
    Route,
    Stop,
    StopTime,
    Trip,
} from './gtfs-types';

interface CsvFile {
    name: string;
    body: string;
}

function csvFilesToObject(csvFiles: readonly CsvFile[]) {
    const json: { [name: string]: unknown[] } = {};

    for (const { name, body } of csvFiles) {
        json[name] = [];
        const rawRows = body.split('\n');
        const csv: string[][] = [];
        for (let i = 0; i < rawRows.length; i++) {
            csv[i] = rawRows[i].replace(/(\r\n|\n|\r)/gm, '').split(',');

            if (i > 0) {
                const headerRow = csv[0];
                const jsonFromCsv: { [header: string]: string } = {};
                for (let j = 0; j < headerRow.length; j++) {
                    jsonFromCsv[headerRow[j]] = csv[i][j];
                }
                json[name].push(jsonFromCsv);
            }
        }
    }

    return json;
}

/**
 * Turns a number into a boolean.
 * @param i 0 returns false, 1 returns true
 */
function toBool(i: number | string): boolean {
    return parseInt(i as string, 10) !== 0;
}

function makeCalendarTextName(days: Calendar['days']) {
    switch (days.join(', ')) {
        case 'true, true, true, true, true, true, true':
            return 'Daily';
        case 'false, true, true, true, true, true, true':
            return 'Monday - Saturday';
        case 'false, true, true, true, true, true, false':
            return 'Monday - Friday';
        case 'true, false, false, false, false, false, true':
            return 'Saturday - Sunday';
        case 'false, false, false, false, false, false, true':
            return 'Saturday';
        default:
            const firstDay = days.indexOf(true);
            const lastDay = days.lastIndexOf(true);

            const reference = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            if (firstDay === lastDay) {
                return reference[firstDay];
            } else {
                return reference[firstDay] + ' - ' + reference[lastDay];
            }
    }
}

/**
 * Creates a JSON object representing the Big Island Buses schedule.
 * The JSON data can be written to a file for the client to load later.
 * @param gtfsZipData Buffer data for the GTFS zip file.
 */
async function createApiData(
    gtfsZipData: Buffer | ArrayBuffer | Uint8Array,
): Promise<GTFSData> {
    const fileList = [
        'agency.txt',
        'calendar.txt',
        'fare_attributes.txt',
        'feed_info.txt',
        'routes.txt',
        'stop_times.txt',
        'stops.txt',
        'trips.txt',
    ];

    const zip = await loadAsync(gtfsZipData);
    const csvFiles = await Promise.all(
        fileList.map(fileName =>
            zip
                .file(fileName)
                .async('text')
                .then(body => ({
                    name: fileName.substring(0, fileName.length - 4),
                    body,
                })),
        ),
    );

    const variable: GTFSData = {
        routes: {},
        stops: {},
        calendar: {},
    };
    const json = csvFilesToObject(csvFiles) as {
        routes: CsvRoute[];
        trips: CsvTrip[];
        stops: CsvStop[];
        calendar: CsvCalendar[];
        stop_times: StopTime[];
    };

    for (const csvRoute of json.routes) {
        const route = csvRoute as Route;
        route.trips = {};
        variable.routes[route.route_id] = route;
    }
    for (const csvTrip of json.trips) {
        const trip = csvTrip as Trip;
        trip.stop_times = {};
        variable.routes[trip.route_id].trips[trip.trip_id] = trip;
    }
    for (const csvStop of json.stops) {
        const stop = csvStop as Stop;
        stop.trips = [];
        stop.routes = [];
        variable.stops[stop.stop_id] = stop;
    }
    for (const csvCalendar of json.calendar) {
        const calendar = csvCalendar as Calendar;
        calendar.days = [
            toBool(calendar.sunday),
            toBool(calendar.monday),
            toBool(calendar.tuesday),
            toBool(calendar.wednesday),
            toBool(calendar.thursday),
            toBool(calendar.friday),
            toBool(calendar.saturday),
        ];
        calendar.text_name = makeCalendarTextName(calendar.days);
        variable.calendar[calendar.service_id] = calendar;
    }
    for (const stopTime of json.stop_times) {
        const stop = variable.stops[stopTime.stop_id];
        for (const { route_id } of json.routes) {
            const trip = variable.routes[route_id].trips[stopTime.trip_id];
            if (trip) {
                trip.stop_times[stopTime.stop_sequence] = stopTime;

                const tripAdded = stop.trips.find(
                    ({ trip }) => trip === stopTime.trip_id,
                );
                if (!tripAdded) {
                    stop.trips.push({
                        trip: stopTime.trip_id,
                        dir: trip.direction_id,
                        route: route_id,
                        sequence: stopTime.stop_sequence,
                        time: stopTime.arrival_time,
                    });
                }
                if (!stop.routes.includes(route_id)) {
                    stop.routes.push(route_id);
                }
            }
        }
    }

    return variable;
}

/**
 * Generate an API file from the given GTFS zip path.
 * @param gtfsZipPath
 */
async function generateApi(
    gtfsZipPath: string,
    apiFilePath: string,
): Promise<void> {
    const readFileAsync = promisify(readFile);
    const writeFileAsync = promisify(writeFile);

    const zipData = await readFileAsync(gtfsZipPath, { encoding: null });
    const api = await createApiData(zipData);
    const json = JSON.stringify(api);
    await writeFileAsync(apiFilePath, json, { encoding: 'utf8' });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        throw new TypeError(`should pass 2 arguments, not ${args.length}.`);
    }

    const gtfsZipPath = resolve(args[0]);
    const apiFilePath = resolve(args[1]);

    generateApi(gtfsZipPath, apiFilePath)
        .then(() => console.log('Wrote API file'))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
