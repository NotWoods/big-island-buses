import parse from 'csv-parse';
import { toArray } from 'ix/asynciterable/index.js';
import { from, zip } from 'ix/iterable/index.js';
import { filter, map } from 'ix/iterable/operators/index.js';
import JSZip, { JSZipObject } from 'jszip';
import type { Mutable } from 'type-fest';
import type {
  Calendar,
  CsvCalendar,
  CsvRoute,
  CsvStop,
  CsvStopTime,
  CsvTrip,
  ServerGTFSData,
  Route,
  Stop,
  StopTime,
  Trip,
  FeedInfo,
} from '../shared/gtfs-types';
import { stringTime } from '../shared/utils/date.js';
import { toInt } from '../shared/utils/num.js';

const STARTS_WITH_TIME = /^\d\d?:\d\d/;

export async function zipFilesToObject(zipFiles: Map<string, JSZipObject>) {
  const arrays = await from(zipFiles.values())
    .pipe(
      map((file) =>
        file
          .nodeStream('nodebuffer')
          .pipe(parse({ cast: false, columns: true })),
      ),
      map((stream) => toArray(stream)),
    )
    .pipe((source) => Promise.all(source));

  return zip(zipFiles.keys(), arrays).pipe((entry) =>
    Object.fromEntries(entry),
  );
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
      return 'Mon - Sat';
    case 'false, true, true, true, true, true, false':
      return 'Monday - Friday';
    case 'true, false, false, false, false, false, true':
      return 'Sat - Sun';
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
export async function createApiData(
  gtfsZipData: Buffer | ArrayBuffer | Uint8Array,
): Promise<ServerGTFSData> {
  const fileList = [
    'agency.txt',
    'calendar.txt',
    'calendar_dates.txt',
    'fare_attributes.txt',
    'feed_info.txt',
    'routes.txt',
    'stop_times.txt',
    'stops.txt',
    'trips.txt',
  ];

  const zip = await JSZip.loadAsync(gtfsZipData);
  const zipFiles = from(fileList)
    .pipe(
      map((fileName) => {
        const name = fileName.substring(0, fileName.length - 4);
        const file = zip.file(fileName);
        return [name, file] as const;
      }),
      filter((entry): entry is [string, JSZipObject] => {
        const [, file] = entry;
        return file != null;
      }),
    )
    .pipe((source) => new Map(source));

  const json = (await zipFilesToObject(zipFiles)) as {
    routes: CsvRoute[];
    trips: CsvTrip[];
    stops: CsvStop[];
    calendar: CsvCalendar[];
    stop_times: CsvStopTime[];
    feed_info: FeedInfo[];
  };
  const variable: ServerGTFSData = {
    routes: {},
    stops: {},
    calendar: {},
    trips: {},
    info: json.feed_info[0],
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
    const stop = (csvStop as Partial<Stop>) as Mutable<Stop>;
    stop.position = {
      lat: parseFloat(csvStop.stop_lat),
      lng: parseFloat(csvStop.stop_lon),
    };
    stop.trips = [];
    stop.routes = [];
    delete (csvStop as Partial<CsvStop>).stop_lat;
    delete (csvStop as Partial<CsvStop>).stop_lon;
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
    for (const t of Object.values(route.trips)) {
      const trip = t as Mutable<Trip>;
      trip.stop_times.sort((a, b) => a.stop_sequence - b.stop_sequence);
      if (!STARTS_WITH_TIME.test(trip.trip_short_name)) {
        const start = trip.stop_times[0].arrival_time;
        trip.trip_short_name = `${stringTime(start)} ${trip.trip_short_name}`;
      }
      for (const st of trip.stop_times) {
        const stopTime = st as Partial<Mutable<StopTime>>
        delete stopTime.trip_id;
      }
    }
  }

  return variable;
}
