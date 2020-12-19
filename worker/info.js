const toInt = (n) => Number.parseInt(n, 10);

/**
 * Returns a special `Date` without an associated year or month.
 *
 * Used throughout the application to represent times with no dates attached.
 * This roughly equates to `Temporal.PlainTime` with space for overflow.
 */
function plainTime(hours, minutes, seconds) {
    let days = 0;
    if (hours >= 24) {
        days = Math.floor(hours / 24);
        hours = hours % 24;
    }
    return new Date(0, 0, days, hours, minutes, seconds, 0);
}
/**
 * Returns a date object based on the string given
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {Date}
 */
function gtfsArrivalToDate(string) {
    const [hour, min, second] = string.split(':').map((s) => toInt(s));
    return plainTime(hour, min, second);
}
/**
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
function nowPlainTime() {
    const now = new Date();
    return plainTime(now.getHours(), now.getMinutes(), now.getSeconds());
}

function registerPromiseWorker(callback) {
    function postOutgoingMessage(messageId, error, result) {
        if (error) {
            console.error('Worker caught an error:', error);
            self.postMessage([messageId, error]);
        }
        else {
            self.postMessage([messageId, null, result]);
        }
    }
    self.addEventListener('message', function onIncomingMessage(e) {
        const payload = e.data;
        if (!Array.isArray(payload) || payload.length !== 2) {
            // message doens't match communication format; ignore
            return;
        }
        const [messageId, message] = payload;
        Promise.resolve(callback(message)).then((result) => postOutgoingMessage(messageId, null, result), (error) => postOutgoingMessage(messageId, error));
    });
}

/** @type {number} Earth's radius (at the Equator) of 6378137 meters. */
const EARTH_RADIUS = 6378137;

function toRadians(angleDegrees) {
    return (angleDegrees * Math.PI) / 180.0;
}

const LAT = 'latitude';
const LNG = 'longitude';

/**
 * Converts an object into a LatLng. Tries a few different methods:
 * 1. If instanceof LatLng, clone and return the object
 * 2. If it has 'lat' and 'lng' properties...
 *    2a. if the properties are functions (like Google LatLngs),
 *        use the lat() and lng() values as lat and lng
 *    2b. otherwise get lat and lng, parse them as floats and try them
 * 3. If it has 'lat' and *'long'* properties,
 *    parse them as floats and return a LatLng
 * 4. If it has 'lat' and *'lon'* properties,
 *    parse them as floats and return a LatLng
 * 5. If it has 'latitude' and 'longitude' properties,
 *    parse them as floats and return a LatLng
 * 6. If it has number values for 0 and 1, use 1 as latitude and 0
 *    as longitude.
 * 7. If it has x and y properties, try using y as latitude and x and
 *    longitude.
 * @param {any} like
 * @returns {LatLng}
 */
function convert(like) {
    if (like instanceof LatLng) {
        return new LatLng(like[LAT], like[LNG]);
    } else if ('lat' in like && 'lng' in like) {
        if (typeof like.lat == 'function' && typeof like.lng == 'function') {
            return new LatLng(like.lat(), like.lng());
        } else {
            return new LatLng(parseFloat(like.lat), parseFloat(like.lng));
        }
    } else if ('lat' in like && 'long' in like) {
        return new LatLng(parseFloat(like.lat), parseFloat(like.long));
    } else if ('lat' in like && 'lon' in like) {
        return new LatLng(parseFloat(like.lat), parseFloat(like.lon));
    } else if ('latitude' in like && 'longitude' in like) {
        return new LatLng(
            parseFloat(like.latitude),
            parseFloat(like.longitude)
        );
    } else if (typeof like[0] === 'number' && typeof like[1] === 'number') {
        return new LatLng(like[1], like[0]);
    } else if ('x' in like && 'y' in like) {
        return new LatLng(parseFloat(like.y), parseFloat(like.x));
    } else {
        throw new TypeError(`Cannot convert ${like} to LatLng`);
    }
}

/**
 * Comparison function
 * @param {LatLng} one
 * @param {LatLng} two
 * @returns {boolean}
 */
function equals(one, two) {
    one = convert(one);
    two = convert(two);
    return (
        Math.abs(one[LAT] - two[LAT]) < Number.EPSILON &&
        Math.abs(one[LNG] - two[LNG]) < Number.EPSILON
    );
}

class LatLng {
    /**
     * @param {number} lat
     * @param {number} lng
     * @param {boolean} noWrap
     */
    constructor(lat, lng, noWrap = false) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            throw TypeError('lat or lng are not numbers');
        }

        if (!noWrap) {
            //Constrain lat to -90, 90
            lat = Math.min(Math.max(lat, -90), 90);
            //Wrap lng using modulo
            lng = lng == 180 ? lng : ((((lng + 180) % 360) + 360) % 360) - 180;
        }

        Object.defineProperty(this, LAT, { value: lat });
        Object.defineProperty(this, LNG, { value: lng });
        this.length = 2;

        Object.freeze(this);
    }

    /**
     * Comparison function
     * @param {LatLng} other
     * @returns {boolean}
     */
    equals(other) {
        return equals(this, other);
    }

    /**
     * Returns the latitude in degrees.
     * (I'd rather use getters but this is for consistency)
     * @returns {number}
     */
    lat() {
        return this[LAT];
    }

    /**
     * Returns the longitude in degrees.
     * (I'd rather use getters but this is for consistency)
     * @returns {number}
     */
    lng() {
        return this[LNG];
    }

    /** @type {number} alias for lng */
    get x() {
        return this[LNG];
    }
    /** @type {number} alias for lat */
    get y() {
        return this[LAT];
    }
    /** @type {number} alias for lng */
    get 0() {
        return this[LNG];
    }
    /** @type {number} alias for lat */
    get 1() {
        return this[LAT];
    }
    /** @type {number} alias for lng */
    get long() {
        return this[LNG];
    }
    /** @type {number} alias for lng */
    get lon() {
        return this[LNG];
    }

    /**
     * Converts to JSON representation. This function is intended to be used via
     * JSON.stringify.
     * @returns {LatLngLiteral}
     */
    toJSON() {
        return { lat: this[LAT], lng: this[LNG] };
    }

    /**
     * Converts to string representation.
     * @returns {string}
     */
    toString() {
        return `(${this[LAT]}, ${this[LNG]})`;
    }

    /**
     * Returns a string of the form "lat,lng" for this LatLng. We round the
     * lat/lng values to 6 decimal places by default.
     * @param {number} [precision=6]
     * @returns {string}
     */
    toUrlValue(precision = 6) {
        precision = parseInt(precision);
        return (
            parseFloat(this[LAT].toFixed(precision)) +
            ',' +
            parseFloat(this[LNG].toFixed(precision))
        );
    }

    [Symbol.iterator]() {
        let i = 0;
        return {
            next: () => {
                if (i < this.length) {
                    return { value: this[i++], done: false };
                } else {
                    return { done: true };
                }
            },
            [Symbol.iterator]() {
                return this;
            },
        };
    }
}

function computeDistanceBetweenHelper(from, to) {
    const radFromLat = toRadians(from.lat());
    const radFromLng = toRadians(from.lng());
    const radToLat = toRadians(to.lat());
    const radToLng = toRadians(to.lng());
    return (
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin((radFromLat - radToLat) / 2), 2) +
                    Math.cos(radFromLat) *
                        Math.cos(radToLat) *
                        Math.pow(Math.sin((radFromLng - radToLng) / 2), 2)
            )
        )
    );
}

/**
 * Returns the distance, in meters, between to LatLngs. You can optionally
 * specify a custom radius. The radius defaults to the radius of the Earth.
 * @param {LatLng} from
 * @param {LatLng} to
 * @param {number} [radius]
 * @returns {number} distance
 */
function computeDistanceBetween(
    from,
    to,
    radius = EARTH_RADIUS
) {
    from = convert(from);
    to = convert(to);
    return computeDistanceBetweenHelper(from, to) * radius;
}

/**
 * Find the closest stop to the user's location or searched place.
 * @param stops List of stops from API.
 * @param state Location of user and/or search place.
 */
function findClosestStop(stops, location) {
    let closestDistance = Number.MAX_VALUE;
    let closestStop;
    for (const stop of stops) {
        const distance = computeDistanceBetween(location, stop.position);
        if (distance < closestDistance) {
            closestStop = stop;
            closestDistance = distance;
        }
    }
    return closestStop;
}

/**
 * Find the best trip based on the current time of day,
 * along with other route details.
 * @param trips All trips for a route.
 */
function getRouteDetails(trips, now) {
    let firstStop;
    let lastStop;
    let smallestSequence = Infinity;
    let largestSequence = -1;
    let earliest = plainTime(23, 59, 59);
    let latest = plainTime(0, 0, 0);
    let earliestTrip;
    let earliestTripStop;
    let closestTrip;
    let closestTripTime = Number.MAX_VALUE;
    let closestTripStop;
    const routeStops = new Set();
    for (const trip of trips) {
        for (const stopTime of trip.stop_times) {
            const sequence = stopTime.stop_sequence;
            if (toInt(trip.direction_id) === 0) {
                if (sequence < smallestSequence) {
                    firstStop = stopTime.stop_id;
                    smallestSequence = sequence;
                }
                if (sequence > largestSequence) {
                    lastStop = stopTime.stop_id;
                    largestSequence = sequence;
                }
            }
            routeStops.add(stopTime.stop_id);
            const timeDate = gtfsArrivalToDate(stopTime.arrival_time);
            if (timeDate > latest) {
                latest = timeDate;
            }
            if (timeDate < earliest) {
                earliest = timeDate;
                earliestTrip = trip.trip_id;
                earliestTripStop = stopTime.stop_id;
            }
            if (timeDate.getTime() - now.getTime() < closestTripTime &&
                timeDate.getTime() - now.getTime() > 0) {
                closestTripTime = timeDate.getTime() - now.getTime();
                closestTrip = trip.trip_id;
                closestTripStop = stopTime.stop_id;
            }
        }
        if (!closestTrip) {
            //Too late for all bus routes
            closestTripTime =
                plainTime(earliest.getHours() + 24, earliest.getMinutes(), earliest.getSeconds()).getTime() - now.getTime();
            closestTrip = earliestTrip;
            closestTripStop = earliestTripStop;
        }
    }
    return {
        firstStop: firstStop,
        lastStop: lastStop,
        earliest,
        latest,
        stops: routeStops,
        closestTrip: {
            id: closestTrip,
            minutes: Math.floor(closestTripTime / 60000),
            stop: closestTripStop,
        },
    };
}

let stops;
registerPromiseWorker((message) => {
    switch (message.type) {
        case 'data':
            stops = message.stops;
            return undefined;
        case 'closest_stop':
            if (!stops) {
                throw new Error('stops not ready');
            }
            return findClosestStop(stops, message.location);
        case 'route_details':
            return getRouteDetails(message.trips, nowPlainTime());
        default:
            return undefined;
    }
});
//# sourceMappingURL=info.js.map
