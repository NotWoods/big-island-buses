import jszip from 'jszip';
import type { Mutable } from 'type-fest';
import type {
  Calendar,
  CsvCalendar,
  CsvRoute,
  CsvStop,
  CsvStopTime,
  CsvTrip,
  GTFSDataWithTrips,
  Route,
  Stop,
  StopTime,
  Trip
} from '../shared/gtfs-types';
import { toInt } from '../shared/utils/num.js';

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
  return toInt(i) !== 0;
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

function notNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

/**
 * Creates a JSON object representing the Big Island Buses schedule.
 * The JSON data can be written to a file for the client to load later.
 * @param gtfsZipData Buffer data for the GTFS zip file.
 */
export async function createApiData(
  gtfsZipData: Buffer | ArrayBuffer | Uint8Array,
): Promise<GTFSDataWithTrips> {
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

  const zip = await jszip.loadAsync(gtfsZipData);
  const csvFiles = await Promise.all(
    fileList
      .map((fileName) =>
        zip
          .file(fileName)
          ?.async('text')
          ?.then((body) => ({
            name: fileName.substring(0, fileName.length - 4),
            body,
          })),
      )
      .filter(notNull),
  );

  const variable: GTFSDataWithTrips = {
    routes: {},
    stops: {},
    calendar: {},
    trips: {},
  };
  const json = csvFilesToObject(csvFiles) as {
    routes: CsvRoute[];
    trips: CsvTrip[];
    stops: CsvStop[];
    calendar: CsvCalendar[];
    stop_times: CsvStopTime[];
  };

  for (const csvRoute of json.routes) {
    const route = csvRoute as Mutable<Route>;
    route.trips = {};
    variable.routes[route.route_id] = route;
  }
  for (const csvTrip of json.trips) {
    const trip = csvTrip as Mutable<Trip>;
    trip.stop_times = [];
    variable.routes[trip.route_id].trips[trip.trip_id] = trip;
    variable.trips[trip.trip_id] = trip.route_id;
  }
  for (const csvStop of json.stops) {
    const stop = (csvStop as unknown) as Mutable<Stop>;
    stop.position = {
      lat: parseFloat(csvStop.stop_lat),
      lng: parseFloat(csvStop.stop_lon),
    };
    stop.trips = [];
    stop.routes = [];
    delete (csvStop as any).stop_lat;
    delete (csvStop as any).stop_lon;
    variable.stops[stop.stop_id] = stop;
  }
  for (const csvCalendar of json.calendar) {
    const calendar = csvCalendar as Mutable<Calendar>;
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
  for (const csvStopTime of json.stop_times) {
    const stopTime = csvStopTime as Mutable<StopTime>;
    stopTime.stop_sequence = toInt(stopTime.stop_sequence);

    const stop = variable.stops[stopTime.stop_id];
    const route_id = variable.trips[stopTime.trip_id];
    const route = variable.routes[route_id];
    const trip = route.trips[stopTime.trip_id];

    trip.stop_times.push(stopTime);

    const tripAdded = stop.trips.find(({ trip }) => trip === stopTime.trip_id);
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

  for (const route of Object.values(variable.routes)) {
    for (const trip of Object.values(route.trips)) {
      trip.stop_times.sort((a, b) => a.stop_sequence - b.stop_sequence);
    }
  }

  return variable;
}
