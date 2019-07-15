/**
 * Contains construstors and helper functions.  Avoids using the DOM for functions.
 * @author       Tiger Oakes <tigeroakes@gmail.com>
 * @copyright    2014 Tiger Oakes
 */

import JSZip from 'jszip/dist/jszip.min.js';
import { Route, Trip, Stop, Calendar, StopTime } from './gtfs-types';

export const enum Type {
    ROUTE,
    STOP,
    TRIP,
}
export const View = {
    LIST: 0,
    TIMETABLE: 1,

    MAP_PRIMARY: 2,
    STREET_PRIMARY: 3,
};
export var Active = {
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

export function setActiveState(newState) {
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
        console.error("Invalid mode was set: %s. Use 'gtfs' or 'folder'", mode);
        return;
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
                    var jsonFromCsv = {};
                    for (var j = 0; j < headerRow.length; j++)
                        jsonFromCsv[headerRow[j]] = csv[i][j];
                    json[name].push(jsonFromCsv);
                }
            }
        }

        return json;
    }

    return rqDone
        .then(function(textResult) {
            const json = csvFilesToObject(textResult);

            for (var r = 0; r < json.routes.length; r++) {
                var tr = json.routes[r] as Route,
                    vr = variable.routes;
                vr[tr.route_id] = tr;
                vr[tr.route_id].trips = {};
            }
            for (var t = 0; t < json.trips.length; t++) {
                var tt = json.trips[t] as Trip,
                    vt = variable.routes[tt.route_id].trips;
                vt[tt.trip_id] = tt;
                vt[tt.trip_id].stop_times = {};
            }
            for (var s = 0; s < json.stops.length; s++) {
                var ts = json.stops[s] as Stop,
                    vs = variable.stops;
                vs[ts.stop_id] = ts;
                vs[ts.stop_id].trips = [];
                vs[ts.stop_id].routes = [];
            }
            for (var c = 0; c < json.calendar.length; c++) {
                var tc = json.calendar[c] as Calendar,
                    vc = variable.calendar;
                vc[tc.service_id] = tc;
                vc[tc.service_id].days = [
                    iB(tc.sunday),
                    iB(tc.monday),
                    iB(tc.tuesday),
                    iB(tc.wednesday),
                    iB(tc.thursday),
                    iB(tc.friday),
                    iB(tc.saturday),
                ];
                switch (vc[tc.service_id].days.join(', ')) {
                    case 'true, true, true, true, true, true, true':
                        vc[tc.service_id].text_name = 'Daily';
                        break;
                    case 'false, true, true, true, true, true, true':
                        vc[tc.service_id].text_name = 'Monday - Saturday';
                        break;
                    case 'false, true, true, true, true, true, false':
                        vc[tc.service_id].text_name = 'Monday - Friday';
                        break;
                    case 'true, false, false, false, false, false, true':
                        vc[tc.service_id].text_name = 'Saturday - Sunday';
                        break;
                    case 'false, false, false, false, false, false, true':
                        vc[tc.service_id].text_name = 'Saturday';
                        break;
                    default:
                        var firstDay;
                        var lastDay;
                        for (
                            var sItr = 0;
                            sItr < vc[tc.service_id].days.length;
                            sItr++
                        ) {
                            if (vc[tc.service_id].days[sItr]) {
                                firstDay = sItr;
                                break;
                            }
                        }
                        for (
                            var sItr2 = vc[tc.service_id].days.length - 1;
                            sItr2 >= 0;
                            sItr2--
                        ) {
                            if (vc[tc.service_id].days[sItr2]) {
                                lastDay = sItr2;
                                break;
                            }
                        }
                        var reference = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                        ];
                        if (firstDay == lastDay) {
                            vc[tc.service_id].text_name = reference[firstDay];
                        } else {
                            vc[tc.service_id].text_name =
                                reference[firstDay] +
                                ' - ' +
                                reference[lastDay];
                        }
                        break;
                }
            }
            for (var st = 0; st < json.stop_times.length; st++) {
                for (var sr = 0; sr < json.routes.length; sr++) {
                    var tst = json.stop_times[st] as StopTime,
                        tsr = (json.routes[sr] as Route).route_id,
                        vst = variable.stops[tst.stop_id];
                    if (variable.routes[tsr].trips[tst.trip_id]) {
                        variable.routes[tsr].trips[tst.trip_id].stop_times[
                            tst.stop_sequence
                        ] = tst;
                        if (
                            !vst.trips.find(({ trip }) => trip === tst.trip_id)
                        ) {
                            vst.trips.push({
                                trip: tst.trip_id,
                                dir:
                                    variable.routes[tsr].trips[tst.trip_id]
                                        .direction_id,
                                route: tsr,
                                sequence: tst.stop_sequence,
                                time: tst.arrival_time,
                            });
                        }
                        if (vst.routes.indexOf(tsr) == -1) vst.routes.push(tsr);
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

/**
 * Locates the nearest bus stop to the user or custom location
 * @param {Promise} schedulePromise Schedule promise to wait for
 * @param {Coordinates} customLocation Location to use instead of GPS
 * @return {Promise<{stop:any,location:any,custom:boolean}>}
 */
var runOnce = false;
export function locateUser(
    busPromise: Promise<GTFSData>,
    customLocation?: Pick<Coordinates, 'latitude' | 'longitude'>,
) {
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

    var closestDistance = Number.MAX_VALUE;
    var closestStop: Stop['stop_id'];

    return Promise.all([locatePromise, busPromise]).then(([e, schedule]) => {
        var userPos = e.coords;
        for (var i in schedule.stops) {
            var stop = schedule.stops[i],
                distance = Math.sqrt(
                    Math.pow(userPos.latitude - parseFloat(stop.stop_lat), 2) +
                        Math.pow(
                            userPos.longitude - parseFloat(stop.stop_lon),
                            2,
                        ),
                );
            if (distance < closestDistance) {
                closestStop = i;
                closestDistance = distance;
            }
        }
        if (closestStop) {
            var results = {
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
        document.readyState == 'interactive' ||
        document.readyState == 'complete'
    ) {
        return Promise.resolve(document.readyState);
    }

    return new Promise(resolve => {
        document.addEventListener('readystatechange', () => {
            if (document.readyState == 'interactive') {
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
    var link = '';
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

interface DynamicLinkNode extends HTMLAnchorElement {
    Type: Type;
    Value: string;
}

/**
 * Creates an A element with custom click events for links.  Can update itself.
 * @param  {Type} type      What value to change in link
 * @param  {string} value   Value to use
 * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
 * @return {Node}           A element with custom properties
 */
export function dynamicLinkNode(type: Type, value: string, update?: boolean) {
    var node = document.createElement('a') as DynamicLinkNode;
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

declare global {
    function ga(arg0: string, arg1: string, data: unknown);
}

/**
 * Used for the click event of a dynamicLinkNode
 * @param  {Event} e
 */
export function clickEvent(e: Event) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    var state = Active,
        val = this.Value,
        newLink = pageLink(this.Type, val);
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
    history.pushState(state, null, newLink);
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
    if (typeof date == 'string') {
        if (
            date.indexOf(':') > -1 &&
            date.lastIndexOf(':') > date.indexOf(':')
        ) {
            const split = date.split(':');
            date = new Date(
                0,
                0,
                0,
                parseInt(split[0]),
                parseInt(split[1]),
                parseInt(split[2]),
                0,
            );
        }
    }
    if (typeof date != 'object') {
        //throw typeof date;
        return;
    }

    var m = 'am',
        displayHour = '',
        displayMinute = '';
    var hr = date.getHours(),
        min = date.getMinutes();

    if (hr === 0) {
        displayHour = '12';
    } else if (hr === 12) {
        displayHour = '12';
        m = 'pm';
    } else if (hr > 12) {
        var mathHr = hr - 12;
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
    var timeArr = string.split(':');
    var extraDays = 0,
        extraHours = 0;
    if (parseInt(timeArr[0]) > 23) {
        extraDays = Math.floor(parseInt(timeArr[0]) / 24);
        extraHours = parseInt(timeArr[0]) % 24;
    }
    return new Date(
        0,
        0,
        0 + extraDays,
        parseInt(timeArr[0]) + extraHours,
        parseInt(timeArr[1]),
        parseInt(timeArr[2]),
        0,
    );
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
export function getQueryVariable(variable: string): string {
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
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }
    return null;
}

/**
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
export function nowDateTime(): Date {
    var now = new Date();
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
 * @return {Array} ordered list
 */
export function sequence(stopTimes) {
    var stopSequence = [];
    for (var key in stopTimes) {
        stopSequence.push(key);
    }
    return stopSequence.sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });
}
