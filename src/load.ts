/**
 * Contains construstors and helper functions.  Avoids using the DOM for functions.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

import JSZip from 'jszip/dist/jszip.min.js';
import {
    Route,
    Trip,
    Stop,
    Calendar,
    StopTime,
    CsvRoute,
    CsvTrip,
    CsvStop,
    CsvCalendar,
} from './gtfs-types';

export const enum Type {
    ROUTE,
    STOP,
    TRIP,
}
export const enum View {
    LIST,
    TIMETABLE,

    MAP_PRIMARY,
    STREET_PRIMARY,
}

export interface ActiveState {
    Route: {
        ID: string | null;
        TRIP: string | null;
    };
    STOP: string | null;
    View: {
        ROUTE: View;
        STOP: View;
    };
}

export let Active: ActiveState = {
    Route: {
        ID: null,
        TRIP: null,
    },
    STOP: null,
    View: {
        ROUTE: View.LIST,
        STOP: View.MAP_PRIMARY,
    },
};

export const updateEvent = new CustomEvent('pageupdate');

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js');
}

/**
 * @type {Record<Type, Function>}
 */
export const openCallbacks: Record<Type, Function> = {} as any;

export const normal = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 0, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    unimportant = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 96, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    userShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 48, y: 0 },
        anchor: { x: 12, y: 12 },
    } as google.maps.Icon,
    placeShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 72, y: 0 },
        anchor: { x: 12, y: 23 },
    } as google.maps.Icon,
    stopShape = {
        url: 'assets/pins.png',
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 24, y: 0 },
        anchor: { x: 12, y: 20 },
    } as google.maps.Icon;

export function setActiveState(newState: ActiveState) {
    Active = newState;
}

function xhr(url: string, responseType?: XMLHttpRequestResponseType) {
    return new Promise<unknown>((resolve, reject) => {
        const rq = new XMLHttpRequest();
        rq.open('GET', url);
        if (responseType) rq.responseType = responseType;
        rq.onload = function() {
            if (this.status === 200) {
                resolve(this.response);
            } else {
                reject(Error(this.statusText));
            }
        };
        rq.onerror = function() {
            reject(Error('Network Error'));
        };
        rq.send();
    });
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

export interface GTFSData {
    routes: { [route_id: string]: Route };
    stops: { [stop_id: string]: Stop };
    calendar: { [service_id: string]: Calendar };
}

/**
 * Grabs google_transit.zip and parses the data into a
 * GTFSData object for the rest of the program.
 * @param  {string} mode "folder" or "gtfs". Will grab the
 * google_transit folder or zip file depending on input
 * @return {Promise<GTFSData>} Promise returns parsed GTFS data file for the rest of the program
 */
export function getScheduleData(mode: 'gtfs' | 'folder') {
    if (mode != 'gtfs' && mode != 'folder') {
        throw new TypeError(
            `Invalid mode was set: ${mode}. Use 'gtfs' or 'folder'`,
        );
    }

    const variable: GTFSData = {
        routes: {},
        stops: {},
        calendar: {},
    };

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

    interface CsvFile {
        name: string;
        body: string;
    }

    let rqDone: Promise<CsvFile[]>;
    if (mode === 'gtfs') {
        rqDone = xhr('google_transit.zip', 'arraybuffer')
            .then(response => JSZip.loadAsync(response as ArrayBuffer))
            .then(zip =>
                Promise.all(
                    fileList.map(fileName =>
                        zip
                            .file(fileName)
                            .async('text')
                            .then(body => ({
                                name: fileName.substring(
                                    0,
                                    fileName.length - 4,
                                ),
                                body,
                            })),
                    ),
                ),
            );
    } else {
        rqDone = Promise.all(
            fileList.map(function folderRequest(fileName) {
                return xhr(`google_transit/${fileName}`).then(response => ({
                    name: fileName.substring(0, fileName.length - 4),
                    body: response as string,
                }));
            }),
        );
    }

    function csvFilesToObject(csvFiles: CsvFile[]) {
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

    return rqDone
        .then(function(textResult) {
            const json = csvFilesToObject(textResult) as {
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
                    iB(calendar.sunday),
                    iB(calendar.monday),
                    iB(calendar.tuesday),
                    iB(calendar.wednesday),
                    iB(calendar.thursday),
                    iB(calendar.friday),
                    iB(calendar.saturday),
                ];
                calendar.text_name = makeCalendarTextName(calendar.days);
                variable.calendar[calendar.service_id] = calendar;
            }
            for (const stopTime of json.stop_times) {
                const stop = variable.stops[stopTime.stop_id];
                for (const { route_id } of json.routes) {
                    const trip =
                        variable.routes[route_id].trips[stopTime.trip_id];
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
        })
        .then(() => variable);
}

function getCurrentPosition() {
    return new Promise<Position>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

export interface LocationUpdate {
    stop: Stop['stop_id'];
    location: Pick<Coordinates, 'latitude' | 'longitude'>;
    custom: boolean;
}

/**
 * Locates the nearest bus stop to the user or custom location
 * @param {Promise} schedulePromise Schedule promise to wait for
 * @param {Coordinates} customLocation Location to use instead of GPS
 */
let runOnce = false;
export function locateUser(
    busPromise: Promise<GTFSData>,
    customLocation?: Pick<Coordinates, 'latitude' | 'longitude'>,
): Promise<LocationUpdate> {
    let locatePromise: Promise<{
        coords: Pick<Coordinates, 'latitude' | 'longitude'>;
        customLocationFlag?: boolean;
    }>;
    if (customLocation) {
        locatePromise = Promise.resolve({
            coords: customLocation,
            customLocationFlag: true,
        });
    } else {
        locatePromise = getCurrentPosition();
    }

    let closestDistance = Number.MAX_VALUE;
    let closestStop: Stop['stop_id'];

    return Promise.all([locatePromise, busPromise]).then(([e, schedule]) => {
        const userPos = e.coords;
        for (const stop_id of Object.keys(schedule.stops)) {
            const stop = schedule.stops[stop_id];
            const distance = Math.sqrt(
                Math.pow(userPos.latitude - parseFloat(stop.stop_lat), 2) +
                    Math.pow(userPos.longitude - parseFloat(stop.stop_lon), 2),
            );
            if (distance < closestDistance) {
                closestStop = stop_id;
                closestDistance = distance;
            }
        }
        if (closestStop) {
            const results = {
                stop: closestStop,
                location: userPos,
                custom: e.customLocationFlag ? true : false,
            };
            if (runOnce) {
                window.dispatchEvent(
                    new CustomEvent('locationupdate', {
                        detail: results,
                    }),
                );
            }
            return results;
        } else {
            throw Error(JSON.stringify(userPos));
        }
    });
}

/**
 * Creates a promise version of the document load event
 * @return {Promise<DocumentReadyState>} resolves if document has loaded
 */
export function documentLoad() {
    if (
        document.readyState === 'interactive' ||
        document.readyState === 'complete'
    ) {
        return Promise.resolve(document.readyState);
    }

    return new Promise(resolve => {
        document.addEventListener('readystatechange', () => {
            if (document.readyState === 'interactive') {
                resolve(document.readyState);
            }
        });
    });
}

/**
 * Turns a number into a boolean.
 * @param  {int} i   0 returns false, 1 returns true
 * @return {boolean}
 */
function iB(i: number | string): boolean {
    return parseInt(i as string, 10) !== 0 ? true : false;
}

/**
 * Generates a link for href values. Meant to maintain whatever active data is avaliable.
 * @param {Type} type  		Type of item to change
 * @param {string} value 	ID to change
 * @return {string} URL to use for href, based on active object.
 */
function pageLink(type: Type, value: string) {
    let link = '';
    switch (type) {
        case Type.ROUTE:
            link += '#!route=' + value;

            if (Active.Route.TRIP !== null) {
                link += '&trip=' + Active.Route.TRIP;
            }

            if (Active.STOP !== null) {
                link += '&stop=' + Active.STOP;
            }
            break;
        case Type.STOP:
            if (Active.Route.ID !== null) {
                link += '#!route=' + Active.Route.ID;
            } else {
                link += '#!';
            }
            link += '&stop=' + value;
            if (Active.Route.TRIP !== null) {
                link += '&trip=' + Active.Route.TRIP;
            }
            break;
        case Type.TRIP:
            link += '#!route= ' + Active.Route.ID + '&trip=' + value;
            if (Active.STOP !== null) {
                link += '&stop=' + Active.STOP;
            }
            break;
        default:
            console.warn('Invalid type provided for link: %i', type);
            break;
    }
    return link;
}

export interface Linkable {
    Type: Type;
    Value: string;
}

type DynamicLinkNode = HTMLAnchorElement & Linkable;

/**
 * Creates an A element with custom click events for links.  Can update itself.
 * @param  {Type} type      What value to change in link
 * @param  {string} value   Value to use
 * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
 * @return {Node}           A element with custom properties
 */
export function dynamicLinkNode(type: Type, value: string, update?: boolean) {
    const node = document.createElement('a') as DynamicLinkNode;
    node.Type = type;
    node.Value = value;
    node.href = pageLink(type, value);
    node.addEventListener('click', clickEvent);
    if (update) {
        node.addEventListener('pageupdate', function() {
            node.href = pageLink(type, value);
        });
    }

    return node;
}

/**
 * Used for the click event of a dynamicLinkNode
 * @param  {Event} e
 */
export function clickEvent(this: Linkable, e: Event) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    const state = Active;
    const val = this.Value;
    const newLink = pageLink(this.Type, val);
    const callback = openCallbacks[this.Type];
    switch (this.Type) {
        case Type.ROUTE:
            state.Route.ID = val;
            break;
        case Type.STOP:
            state.STOP = val;
            break;
        case Type.TRIP:
            state.Route.TRIP = val;
            break;
    }
    callback(val);
    history.pushState(state, null as any, newLink);
    if (ga) ga('send', 'pageview', { page: newLink, title: document.title });
    return false;
}

/**
 * Turns a date into a string with hours, minutes.
 * @param  {Date} 	date Date to convert
 * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
 * @return {string}    	String representation of time
 */
export function stringTime(date: Date | string): string {
    if (typeof date === 'string') {
        if (
            date.indexOf(':') > -1 &&
            date.lastIndexOf(':') > date.indexOf(':')
        ) {
            const split = date.split(':');
            date = new Date(
                0,
                0,
                0,
                parseInt(split[0], 10),
                parseInt(split[1], 10),
                parseInt(split[2], 10),
                0,
            );
        }
    }
    if (typeof date != 'object') {
        throw new TypeError(`date must be Date or string, not ${typeof date}`);
    }

    let m = 'am';
    let displayHour = '';
    let displayMinute = '';
    const hr = date.getHours();
    const min = date.getMinutes();

    if (hr === 0) {
        displayHour = '12';
    } else if (hr === 12) {
        displayHour = '12';
        m = 'pm';
    } else if (hr > 12) {
        const mathHr = hr - 12;
        displayHour = mathHr.toString();
        m = 'pm';
    } else {
        displayHour = hr.toString();
    }

    if (min === 0) {
        displayMinute = '';
    } else if (min < 10) {
        displayMinute = ':0' + min.toString();
    } else {
        displayMinute = ':' + min.toString();
    }

    return displayHour + displayMinute + m;
}

/**
 * Returns a date object based on the string given
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {Date}
 */
export function gtfsArrivalToDate(string: string): Date {
    const [hour, min, second] = string.split(':').map(s => parseInt(s, 10));
    let extraDays = 0;
    let extraHours = 0;
    if (hour > 23) {
        extraDays = Math.floor(hour / 24);
        extraHours = hour % 24;
    }
    return new Date(0, 0, 0 + extraDays, hour + extraHours, min, second, 0);
}

/**
 * Combines stringTime() and gtfsArrivalToDate()
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {string}        String representation of time
 */
export function gtfsArrivalToString(string: string) {
    return stringTime(gtfsArrivalToDate(string));
}

/**
 * Returns a URL variable, or null if it does not exist
 * @param  {string} variable - The name of the query variable to find
 * @return {string}
 */
export function getQueryVariable(variable: string): string | null {
    let query = '';
    let vars: string[];
    if (window.location.hash.indexOf('#!') > -1) {
        query = window.location.hash.substring(
            window.location.hash.indexOf('#!') + 2,
        );
        vars = query.split('&');
    } else if (window.location.search.indexOf('_escaped_fragment_') > -1) {
        query = window.location.search.substring(
            window.location.search.indexOf('_escaped_fragment_') + 19,
        );
        vars = query.split('%26');
    }

    if (query !== '') {
        for (const parts of vars!) {
            const [key, value] = parts.split('=');
            if (key === variable) return value;
        }
    }
    return null;
}

/**
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
export function nowDateTime(): Date {
    const now = new Date();
    return new Date(
        0,
        0,
        0,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        0,
    );
}

/**
 * Sorts stop time keys
 * @param  {GTFSData stop_times} stopTimes
 * @return {string[]} ordered list
 */
export function sequence(stopTimes: Trip['stop_times']) {
    const stopSequence = [];
    for (const key in stopTimes) {
        stopSequence.push(key);
    }
    return stopSequence.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}
