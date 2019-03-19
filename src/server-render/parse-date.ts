const DATE_REGEX = /(\d{4,})(\d\d)(\d\d)/;
const TIME_REGEX = /(\d\d?):(\d\d):(\d\d)/;
const DATE_ISO_REGEX = /(\d{4,}-\d\d-\d\d)/;
const TIME_ISO_REGEX = /(\d\d:\d\d:\d\d)/;

export const WEEKDAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/**
 * Parse a GTFS date (YYYYMMDD) into a Javascript Date object.
 * Hour, minute, and second will be set to 0 on the date object.
 */
export function parseGtfsDate(dateStr: string) {
    const match = dateStr.match(DATE_REGEX);
    if (match == null) throw new TypeError();
    const [, year, month, date] = match.map(s => parseInt(s, 10));
    return new Date(year, month - 1, date);
}

/**
 * Parse a GTFS time (HH:MM:SS) into a Javascript Date object.
 * Year, month, and date will be set to epoch time equivalents.
 */
export function parseGtfsTime(timeStr: string) {
    const match = timeStr.match(TIME_REGEX);
    if (match == null) throw new TypeError(timeStr);
    const [, hour, minute, second] = match.map(s => parseInt(s, 10));
    return new Date(1970, 0, 1, hour, minute, second);
}

/**
 * Converts a Javascript Date object into an ISO time string, discarding the date.
 * The time zone is not included.
 */
export function toIsoTime(time: Date) {
    return time.toISOString().match(TIME_ISO_REGEX)![1];
}

/**
 * Converts a Javascript Date object into an ISO date string, discarding the time.
 */
export function toIsoDate(date: Date) {
    return date.toISOString().match(DATE_ISO_REGEX)![1];
}

export function fromIsoTime(time: string) {
    const tzIndex = Math.max(time.indexOf('+'), time.indexOf('-'));
    let timezone = '';
    if (tzIndex > -1) {
        timezone = time.substring(tzIndex);
        time = time.substring(0, tzIndex);
    }

    return new Date(`1970-01-01T${time}.000${timezone}`);
}
