import { toInt } from './num.js';

/**
 * Returns a special `Date` without an associated year or month.
 *
 * Used throughout the application to represent times with no dates attached.
 * This roughly equates to `Temporal.PlainTime` with space for overflow.
 */
export function plainTime(hours: number, minutes: number, seconds: number) {
  let days = 0;
  if (hours >= 24) {
    days = Math.floor(hours / 24);
    hours = hours % 24;
  }

  return new Date(0, 0, days, hours, minutes, seconds, 0);
}

/**
 * Turns a date into a string with hours, minutes.
 * @param  {Date} 	date Date to convert
 * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
 * @return {string}    	String representation of time
 */
export function stringTime(date: Date | string): string {
  if (typeof date === 'string') {
    if (date.indexOf(':') > -1 && date.lastIndexOf(':') > date.indexOf(':')) {
      const [hour, min, second] = date.split(':').map(toInt);
      date = plainTime(hour, min, second);
    }
  }
  if (typeof date != 'object') {
    throw new TypeError(`date must be Date or string, not ${typeof date}`);
  }

  let m = 'AM';
  let displayHour = '';
  const hr = date.getHours();
  const min = date.getMinutes();

  if (hr === 0) {
    displayHour = '12';
  } else if (hr === 12) {
    displayHour = '12';
    m = 'PM';
  } else if (hr > 12) {
    const mathHr = hr - 12;
    displayHour = mathHr.toString();
    m = 'PM';
  } else {
    displayHour = hr.toString();
  }

  const displayMinute = `:${min.toString().padStart(2, '0')}`;

  return displayHour + displayMinute + m;
}

/**
 * Returns a date object based on the string given
 * @param  {string} string in format 13:00:00, from gtfs data
 * @return {Date}
 */
export function gtfsArrivalToDate(string: string): Date {
  const [hour, min, second] = string.split(':').map((s) => toInt(s));
  return plainTime(hour, min, second);
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
 * Returns the current time, with date stripped out
 * @return {Date} Current time in hour, min, seconds; other params set to 0
 */
export function nowPlainTime(): Date {
  const now = new Date();
  return plainTime(now.getHours(), now.getMinutes(), now.getSeconds());
}
